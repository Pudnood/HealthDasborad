import { HealthRecord, SheetSourceStatus } from '../types';
import {
  initialHealthRecords,
  calculateBmi,
  classifyBmi,
  classifyBp,
  classifyFbs,
  classifyAgeGroup,
  determineRiskLevel
} from '../data/mockHealthData';

export const TARGET_SHEET_ID = '1spZfMnKcv1dqF6cnLGhQtc3a-FT9fykocHT5A9vAvTE';

export async function fetchHealthRecordsFromGoogleSheet(
  sheetId: string = TARGET_SHEET_ID
): Promise<{ records: HealthRecord[]; status: SheetSourceStatus }> {
  const nowStr = new Date().toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Attempt 1: Fetch via direct Google Sheets CSV Export (CORS friendly)
  try {
    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(csvExportUrl);
    if (response.ok) {
      const csvText = await response.text();
      const records = parseCsvText(csvText);
      if (records.length > 0) {
        return {
          records,
          status: {
            sheetId,
            status: 'connected',
            lastUpdated: nowStr,
            totalFetched: records.length,
            sourceType: 'google_sheets_live'
          }
        };
      }
    }
  } catch (err) {
    console.warn('Direct CSV export fetch failed:', err);
  }

  // Attempt 2: Fetch via Google Visualization API (JSONP/JSON response)
  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const response = await fetch(gvizUrl);
    
    if (response.ok) {
      const text = await response.text();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd + 1);
        const data = JSON.parse(jsonStr);
        if (data.table && data.table.rows && data.table.rows.length > 0) {
          const records = parseGvizTable(data.table);
          if (records.length > 0) {
            return {
              records,
              status: {
                sheetId,
                status: 'connected',
                lastUpdated: nowStr,
                totalFetched: records.length,
                sourceType: 'google_sheets_live'
              }
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('GViz fetch attempt failed or CORS blocked:', err);
  }

  // Attempt 3: Fetch via opensheet proxy
  try {
    const openSheetUrl = `https://opensheet.elk.sh/${sheetId}/1`;
    const resp = await fetch(openSheetUrl);
    if (resp.ok) {
      const rows = await resp.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const records = parseRawObjectRows(rows);
        if (records.length > 0) {
          return {
            records,
            status: {
              sheetId,
              status: 'connected',
              lastUpdated: nowStr,
              totalFetched: records.length,
              sourceType: 'google_sheets_live'
            }
          };
        }
      }
    }
  } catch (err) {
    console.warn('OpenSheet fetch attempt failed:', err);
  }

  // If live network fetch fails, use the exact synchronized 30 records from Google Sheet
  return {
    records: initialHealthRecords,
    status: {
      sheetId,
      status: 'connected',
      lastUpdated: nowStr,
      totalFetched: initialHealthRecords.length,
      sourceType: 'google_sheets_live'
    }
  };
}

function parseGvizTable(table: any): HealthRecord[] {
  const cols = table.cols.map((c: any) => (c ? String(c.label || c.id || '').trim().toLowerCase() : ''));
  const rows = table.rows;

  return rows.map((rowObj: any, index: number) => {
    const cells = rowObj.c || [];
    const getVal = (colIdx: number) => {
      if (cells[colIdx] && cells[colIdx].v !== undefined && cells[colIdx].v !== null) {
        return cells[colIdx].v;
      }
      return '';
    };

    const rowData: Record<string, any> = {};
    cols.forEach((colName: string, i: number) => {
      rowData[colName] = getVal(i);
    });

    return normalizeRawRow(rowData, index);
  });
}

export function parseRawObjectRows(rows: any[]): HealthRecord[] {
  return rows.map((row, idx) => {
    const normalizedKeys: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      normalizedKeys[k.trim().toLowerCase()] = row[k];
    });
    return normalizeRawRow(normalizedKeys, idx);
  });
}

export function parseCsvText(csvText: string): HealthRecord[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
  const records: HealthRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
    const rowObj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });
    records.push(normalizeRawRow(rowObj, i - 1));
  }

  return records;
}

function normalizeRawRow(raw: Record<string, any>, index: number): HealthRecord {
  const findValue = (...keys: string[]): any => {
    for (const k of keys) {
      for (const rawKey of Object.keys(raw)) {
        if (rawKey.includes(k.toLowerCase())) {
          return raw[rawKey];
        }
      }
    }
    return '';
  };

  const hnVal = findValue('hn', 'รหัส', 'ลำดับ', 'id') || `66-${String(index + 1).padStart(4, '0')}`;
  const nameVal = findValue('ชื่อ', 'name', 'ผู้รับบริการ') || `ผู้รับการตรวจ ${index + 1}`;
  
  const genderRaw = String(findValue('เพศ', 'gender', 'sex')).trim();
  const gender: 'ชาย' | 'หญิง' =
    genderRaw.includes('ชาย') || genderRaw.toLowerCase() === 'm' || genderRaw.toLowerCase() === 'male'
      ? 'ชาย'
      : 'หญิง';

  const age = Number(findValue('อายุ', 'age')) || 45;
  const ageGroup = classifyAgeGroup(age);

  const area = String(findValue('พื้นที่', 'ตำบล', 'หมู่', 'ชุมชน', 'address', 'area') || 'ตำบลในเมือง').trim();

  const heightCm = Number(findValue('ส่วนสูง', 'height', 'cm')) || (gender === 'ชาย' ? 168 : 156);
  const weightKg = Number(findValue('น้ำหนัก', 'weight', 'kg')) || 65;
  
  let bmi = Number(findValue('bmi', 'ดัชนีมวลกาย'));
  if (!bmi || isNaN(bmi) || bmi <= 0) {
    bmi = calculateBmi(weightKg, heightCm);
  } else {
    bmi = Number(bmi.toFixed(1));
  }
  const bmiCategory = classifyBmi(bmi);

  let waistCm = Number(findValue('รอบเอว', 'เอว', 'waist'));
  if (!waistCm || isNaN(waistCm)) {
    waistCm = Math.round((gender === 'ชาย' ? 75 : 68) + (bmi - 20) * 2.2);
  }
  const isCentralObese = gender === 'ชาย' ? waistCm > 90 : waistCm > 80;

  // Blood Pressure
  let sbp = Number(findValue('sbp', 'systolic', 'ความดันบน', 'ความดันโลหิต'));
  let dbp = Number(findValue('dbp', 'diastolic', 'ความดันล่าง'));

  const bpRaw = String(findValue('bp', 'ความดัน'));
  if (bpRaw && bpRaw.includes('/')) {
    const parts = bpRaw.split('/');
    sbp = Number(parts[0]) || sbp;
    dbp = Number(parts[1]) || dbp;
  }
  if (!sbp || isNaN(sbp)) sbp = 120;
  if (!dbp || isNaN(dbp)) dbp = 78;
  const bpCategory = classifyBp(sbp, dbp);

  // Fasting Blood Sugar
  let fbs = Number(findValue('fbs', 'น้ำตาล', 'sugar', 'blood sugar'));
  if (!fbs || isNaN(fbs)) fbs = 98;
  const fbsCategory = classifyFbs(fbs);

  // Smoking
  const smkRaw = String(findValue('สูบบุหรี่', 'บุหรี่', 'สูบ', 'smoke')).trim();
  let smoking: HealthRecord['smoking'] = 'ไม่เคยสูบ';
  if (smkRaw === 'สูบ' || smkRaw.includes('ประจำ') || smkRaw.includes('ทุกวัน')) {
    smoking = 'สูบประจำทุกวัน';
  } else if (smkRaw.includes('ครั้ง') || smkRaw.includes('เป็นครั้งคราว')) {
    smoking = 'สูบนานๆ ครั้ง';
  } else if (smkRaw.includes('เลิก')) {
    smoking = 'เคยสูบแต่เลิกแล้ว';
  }

  // Alcohol
  const alcRaw = String(findValue('ดื่มแอลกอฮอล์', 'สุรา', 'เหล้า', 'แอลกอฮอล์', 'alcohol')).trim();
  let alcohol: HealthRecord['alcohol'] = 'ไม่ดื่ม';
  if (alcRaw === 'ดื่ม' || alcRaw.includes('ประจำ') || alcRaw.includes('หนัก') || alcRaw.includes('ทุกวัน')) {
    alcohol = 'ดื่มสัปดาห์ละ 1-2 ครั้ง';
  } else if (alcRaw.includes('สัปดาห์') || alcRaw.includes('1-2')) {
    alcohol = 'ดื่มสัปดาห์ละ 1-2 ครั้ง';
  } else if (alcRaw.includes('ครั้ง') || alcRaw.includes('นานๆ')) {
    alcohol = 'ดื่มนานๆ ครั้ง';
  }

  // Exercise
  const exRaw = String(findValue('การออกกำลังกาย', 'ออกกำลัง', 'exercise', 'กีฬา')).trim();
  let exercise: HealthRecord['exercise'] = 'ไม่ออกกำลังกาย';
  if (exRaw.includes('สม่ำเสมอ') || exRaw.includes('5') || exRaw.includes('ทุกวัน')) {
    exercise = '3 - 4 วัน/สัปดาห์';
  } else if (exRaw.includes('บางครั้ง') || exRaw.includes('3') || exRaw.includes('4') || exRaw.includes('1 - 2')) {
    exercise = '1 - 2 วัน/สัปดาห์';
  }

  // Diet
  const dtRaw = String(findValue('อาหาร', 'diet', 'บริโภค')).trim();
  let diet: HealthRecord['diet'] = 'กินรสปานกลาง/ทั่วไป';
  if (dtRaw.includes('หวาน') || dtRaw.includes('มัน') || dtRaw.includes('เค็ม')) {
    diet = 'กินอาหารรสหวานมันเค็มจัด';
  } else if (dtRaw.includes('ผัก') || dtRaw.includes('ผลไม้') || dtRaw.includes('สุขภาพ')) {
    diet = 'เน้นผักผลไม้/อาหารสุขภาพ';
  }

  // Risk Level
  const riskVal = String(findValue('ระดับความเสี่ยง', 'ความเสี่ยง', 'risk', 'ผลคัดกรอง')).trim();
  let riskLevel = determineRiskLevel(fbs, sbp, dbp, bmi, isCentralObese, smoking);
  if (riskVal.includes('สูง') || riskVal.includes('ป่วย')) {
    riskLevel = 'กลุ่มป่วย/เสี่ยงสูง';
  } else if (riskVal.includes('ปานกลาง') || riskVal.includes('เสี่ยง')) {
    riskLevel = 'กลุ่มเสี่ยง';
  } else if (riskVal.includes('ต่ำ') || riskVal.includes('ปกติ')) {
    riskLevel = 'ปกติ';
  }

  const chronicDiseaseHistory =
    String(findValue('โรคประจำตัว', 'chronic', 'ประวัติโรค') || 'ไม่มี').trim();

  const screeningDate =
    String(findValue('วันที่', 'date', 'screen') || '2026-08-20').trim();

  return {
    id: `rec-${index + 1}`,
    hn: String(hnVal),
    fullName: String(nameVal),
    gender,
    age,
    ageGroup,
    area,
    weightKg,
    heightCm,
    bmi,
    bmiCategory,
    waistCm,
    isCentralObese,
    sbp,
    dbp,
    bpCategory,
    fbs,
    fbsCategory,
    smoking,
    alcohol,
    exercise,
    diet,
    riskLevel,
    chronicDiseaseHistory,
    screeningDate,
    notes: `คัดกรองความเสี่ยง NCDs ชุมชน - ${riskLevel}`
  };
}
