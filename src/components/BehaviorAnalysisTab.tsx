import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { HealthRecord } from '../types';
import { Cigarette, Wine, Dumbbell, Utensils, Sparkles } from 'lucide-react';

interface BehaviorAnalysisTabProps {
  records: HealthRecord[];
}

export function BehaviorAnalysisTab({ records }: BehaviorAnalysisTabProps) {
  const total = records.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
        ไม่มีข้อมูลสำหรับการวิเคราะห์พฤติกรรมสุขภาพ
      </div>
    );
  }

  // Field 1: Smoking
  const smokingCounts: Record<string, number> = {
    'ไม่เคยสูบ': 0,
    'เคยสูบแต่เลิกแล้ว': 0,
    'สูบนานๆ ครั้ง': 0,
    'สูบประจำทุกวัน': 0
  };
  records.forEach((r) => {
    if (smokingCounts[r.smoking] !== undefined) smokingCounts[r.smoking]++;
  });
  const smokingData = Object.keys(smokingCounts).map((k) => ({
    name: k,
    count: smokingCounts[k],
    pct: ((smokingCounts[k] / total) * 100).toFixed(1)
  }));
  const smokingColors = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];

  // Field 2: Alcohol
  const alcoholCounts: Record<string, number> = {
    'ไม่ดื่ม': 0,
    'ดื่มนานๆ ครั้ง': 0,
    'ดื่มสัปดาห์ละ 1-2 ครั้ง': 0,
    'ดื่มประจำ/หนัก': 0
  };
  records.forEach((r) => {
    if (alcoholCounts[r.alcohol] !== undefined) alcoholCounts[r.alcohol]++;
  });
  const alcoholData = Object.keys(alcoholCounts).map((k) => ({
    name: k,
    count: alcoholCounts[k],
    pct: ((alcoholCounts[k] / total) * 100).toFixed(1)
  }));
  const alcoholColors = ['#10b981', '#38bdf8', '#f59e0b', '#dc2626'];

  // Field 3: Exercise Frequency
  const exerciseCounts: Record<string, number> = {
    'ไม่ออกกำลังกาย': 0,
    '1 - 2 วัน/สัปดาห์': 0,
    '3 - 4 วัน/สัปดาห์': 0,
    '5 วันขึ้นไป/สัปดาห์': 0
  };
  records.forEach((r) => {
    if (exerciseCounts[r.exercise] !== undefined) exerciseCounts[r.exercise]++;
  });
  const exerciseData = Object.keys(exerciseCounts).map((k) => ({
    name: k,
    count: exerciseCounts[k],
    pct: ((exerciseCounts[k] / total) * 100).toFixed(1)
  }));
  const exerciseColors = ['#ef4444', '#f59e0b', '#38bdf8', '#10b981'];

  // Field 4: Diet Habits
  const dietCounts: Record<string, number> = {
    'กินอาหารรสหวานมันเค็มจัด': 0,
    'กินรสปานกลาง/ทั่วไป': 0,
    'เน้นผักผลไม้/อาหารสุขภาพ': 0
  };
  records.forEach((r) => {
    if (dietCounts[r.diet] !== undefined) dietCounts[r.diet]++;
  });
  const dietData = Object.keys(dietCounts).map((k) => ({
    name: k.replace('กินอาหารรส', '').replace('เน้น', ''),
    fullName: k,
    count: dietCounts[k],
    pct: ((dietCounts[k] / total) * 100).toFixed(1)
  }));
  const dietColors = ['#ef4444', '#0ea5e9', '#10b981'];

  // Cross Analysis: พฤติกรรมการออกกำลังกาย กับ ระดับความเสี่ยง
  const exerciseRiskMap = Object.keys(exerciseCounts).map((exKey) => {
    const list = records.filter((r) => r.exercise === exKey);
    const grpTotal = list.length;
    const highRisk = list.filter((r) => r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง').length;
    const atRisk = list.filter((r) => r.riskLevel === 'กลุ่มเสี่ยง').length;
    const normal = list.filter((r) => r.riskLevel === 'ปกติ').length;
    return {
      name: exKey,
      'กลุ่มป่วย/เสี่ยงสูง': highRisk,
      'กลุ่มเสี่ยง': atRisk,
      'ปกติ': normal,
      highRiskRate: grpTotal > 0 ? ((highRisk / grpTotal) * 100).toFixed(1) : 0
    };
  });

  // Cross Analysis: พฤติกรรมการสูบบุหรี่ กับ ระดับความเสี่ยง
  const smokingRiskMap = Object.keys(smokingCounts).map((smkKey) => {
    const list = records.filter((r) => r.smoking === smkKey);
    const grpTotal = list.length;
    const highRisk = list.filter((r) => r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง').length;
    const atRisk = list.filter((r) => r.riskLevel === 'กลุ่มเสี่ยง').length;
    const normal = list.filter((r) => r.riskLevel === 'ปกติ').length;
    return {
      name: smkKey,
      'กลุ่มป่วย/เสี่ยงสูง': highRisk,
      'กลุ่มเสี่ยง': atRisk,
      'ปกติ': normal,
      highRiskRate: grpTotal > 0 ? ((highRisk / grpTotal) * 100).toFixed(1) : 0
    };
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Intro Box */}
      <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 text-xs text-sky-900">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-sky-700 shrink-0" />
          <div>
            <strong className="font-semibold">การวิเคราะห์ 4 พฤติกรรมสุขภาพหลัก (Health Behaviors):</strong>
            <span className="text-slate-600 ml-1">
              (1) สูบบุหรี่ (2) ดื่มสุรา (3) กิจกรรมทางกาย/ออกกำลังกาย (4) บริโภคอาหารหวานมันเค็ม
              พร้อมศึกษาความสัมพันธ์กับระดับความเสี่ยง NCDs
            </span>
          </div>
        </div>
        <div className="font-medium bg-white px-3 py-1 rounded-lg border border-sky-200 text-sky-800 shrink-0 shadow-2xs self-start md:self-auto">
          กลุ่มไม่ออกกำลังกาย:{' '}
          <strong className="text-rose-600">
            {exerciseCounts['ไม่ออกกำลังกาย']} คน ({((exerciseCounts['ไม่ออกกำลังกาย'] / total) * 100).toFixed(1)}%)
          </strong>
        </div>
      </div>

      {/* Row 1: 4 Behavior Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Field 1: Smoking */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-500">
              การสูบบุหรี่
            </span>
            <Cigarette className="w-4 h-4 text-rose-500" />
          </div>
          <div className="h-40 sm:h-44 mt-2 sm:mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={smokingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  dataKey="count"
                >
                  {smokingData.map((_, i) => (
                    <Cell key={`smk-${i}`} fill={smokingColors[i % smokingColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1 text-[11px] text-slate-600">
            {smokingData.map((s, idx) => (
              <div key={s.name} className="flex justify-between items-center gap-1">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: smokingColors[idx] }}></span>
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="font-semibold text-slate-800 shrink-0">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Field 2: Alcohol */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-500">
              การดื่มสุรา
            </span>
            <Wine className="w-4 h-4 text-amber-500" />
          </div>
          <div className="h-40 sm:h-44 mt-2 sm:mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alcoholData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  dataKey="count"
                >
                  {alcoholData.map((_, i) => (
                    <Cell key={`alc-${i}`} fill={alcoholColors[i % alcoholColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1 text-[11px] text-slate-600">
            {alcoholData.map((s, idx) => (
              <div key={s.name} className="flex justify-between items-center gap-1">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: alcoholColors[idx] }}></span>
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="font-semibold text-slate-800 shrink-0">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Field 3: Exercise */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-500">
              การออกกำลังกาย
            </span>
            <Dumbbell className="w-4 h-4 text-sky-500" />
          </div>
          <div className="h-40 sm:h-44 mt-2 sm:mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exerciseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  dataKey="count"
                >
                  {exerciseData.map((_, i) => (
                    <Cell key={`ex-${i}`} fill={exerciseColors[i % exerciseColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1 text-[11px] text-slate-600">
            {exerciseData.map((s, idx) => (
              <div key={s.name} className="flex justify-between items-center gap-1">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: exerciseColors[idx] }}></span>
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="font-semibold text-slate-800 shrink-0">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Field 4: Diet */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-500">
              พฤติกรรมบริโภคอาหาร
            </span>
            <Utensils className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="h-40 sm:h-44 mt-2 sm:mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dietData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  dataKey="count"
                >
                  {dietData.map((_, i) => (
                    <Cell key={`dt-${i}`} fill={dietColors[i % dietColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1 text-[11px] text-slate-600">
            {dietData.map((s, idx) => (
              <div key={s.name} className="flex justify-between items-center gap-1">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dietColors[idx] }}></span>
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="font-semibold text-slate-800 shrink-0">{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: พฤติกรรมกับระดับความเสี่ยง (Cross-analysis) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* การออกกำลังกาย กับ ระดับความเสี่ยง */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded">
                ความสัมพันธ์: พฤติกรรมกับระดับความเสี่ยง
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                ความถี่ในการออกกำลังกาย vs ระดับความเสี่ยง NCDs
              </h3>
            </div>
            <Dumbbell className="w-5 h-5 text-sky-600 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseRiskMap} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="ปกติ" stackId="ex" fill="#10b981" />
                <Bar dataKey="กลุ่มเสี่ยง" stackId="ex" fill="#f59e0b" />
                <Bar dataKey="กลุ่มป่วย/เสี่ยงสูง" stackId="ex" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-2">
            * กลุ่มที่ไม่ออกกำลังกายมีสัดส่วนกลุ่มป่วย/เสี่ยงสูงมากที่สุดถึง{' '}
            <strong className="text-rose-600">
              {exerciseRiskMap.find((e) => e.name === 'ไม่ออกกำลังกาย')?.highRiskRate}%
            </strong>
          </p>
        </div>

        {/* การสูบบุหรี่ กับ ระดับความเสี่ยง */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                ความสัมพันธ์: สารเสพติดกับระดับความเสี่ยง
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                พฤติกรรมการสูบบุหรี่ vs ระดับความเสี่ยง NCDs
              </h3>
            </div>
            <Cigarette className="w-5 h-5 text-rose-600 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={smokingRiskMap} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="ปกติ" stackId="smk" fill="#10b981" />
                <Bar dataKey="กลุ่มเสี่ยง" stackId="smk" fill="#f59e0b" />
                <Bar dataKey="กลุ่มป่วย/เสี่ยงสูง" stackId="smk" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-2">
            * ผู้สูบบุหรี่ประจำทุกวันมีโอกาสพบความดันโลหิตสูงและเบาหวานร่วมอย่างมีนัยสำคัญทางเวชระเบียน
          </p>
        </div>
      </div>
    </div>
  );
}
