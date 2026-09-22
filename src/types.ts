export type Gender = 'ชาย' | 'หญิง';

export type RiskLevel = 'ปกติ' | 'กลุ่มเสี่ยง' | 'กลุ่มป่วย/เสี่ยงสูง';

export type AgeGroup = '< 35 ปี' | '35 - 49 ปี' | '50 - 59 ปี' | '60 ปีขึ้นไป';

export type BmiCategory = 'น้ำหนักน้อย' | 'ปกติ' | 'น้ำหนักเกิน' | 'อ้วนระดับ 1' | 'อ้วนระดับ 2 (อันตราย)';

export type BpCategory = 'ปกติ (<120/80)' | 'พรีความดันสูง (120-139/80-89)' | 'ความดันสูงขั้น 1 (140-159/90-99)' | 'ความดันสูงขั้น 2 (≥160/≥100)';

export type FbsCategory = 'ปกติ (<100 mg/dL)' | 'เสี่ยงเบาหวาน IFG (100-125 mg/dL)' | 'สงสัยเป็นเบาหวาน (≥126 mg/dL)';

export type SmokingStatus = 'ไม่เคยสูบ' | 'เคยสูบแต่เลิกแล้ว' | 'สูบนานๆ ครั้ง' | 'สูบประจำทุกวัน';

export type AlcoholStatus = 'ไม่ดื่ม' | 'ดื่มนานๆ ครั้ง' | 'ดื่มสัปดาห์ละ 1-2 ครั้ง' | 'ดื่มประจำ/หนัก';

export type ExerciseFrequency = 'ไม่ออกกำลังกาย' | '1 - 2 วัน/สัปดาห์' | '3 - 4 วัน/สัปดาห์' | '5 วันขึ้นไป/สัปดาห์';

export type DietHabit = 'กินอาหารรสหวานมันเค็มจัด' | 'กินรสปานกลาง/ทั่วไป' | 'เน้นผักผลไม้/อาหารสุขภาพ';

export interface HealthRecord {
  id: string;
  hn: string;
  fullName: string;
  gender: Gender;
  age: number;
  ageGroup: AgeGroup;
  area: string; // ชุมชน / ตำบล
  weightKg: number;
  heightCm: number;
  bmi: number;
  bmiCategory: BmiCategory;
  waistCm: number;
  isCentralObese: boolean; // อ้วนลงพุง (ชาย > 90, หญิง > 80 cm)
  sbp: number; // Systolic BP
  dbp: number; // Diastolic BP
  bpCategory: BpCategory;
  fbs: number; // Fasting Blood Sugar
  fbsCategory: FbsCategory;
  smoking: SmokingStatus;
  alcohol: AlcoholStatus;
  exercise: ExerciseFrequency;
  diet: DietHabit;
  riskLevel: RiskLevel;
  chronicDiseaseHistory: string; // ประวัติโรคประจำตัว
  screeningDate: string; // วันที่ตรวจคัดกรอง
  notes?: string;
}

export interface DashboardFilters {
  searchQuery: string;
  gender: string;
  ageGroup: string;
  area: string;
  riskLevel: string;
  smoking: string;
  alcohol: string;
  exercise: string;
  bmiCategory: string;
}

export interface SheetSourceStatus {
  sheetId: string;
  status: 'loading' | 'connected' | 'fallback_used' | 'error';
  lastUpdated: string;
  totalFetched: number;
  sourceType: 'google_sheets_live' | 'standard_medical_dataset' | 'custom_csv';
  errorMessage?: string;
}
