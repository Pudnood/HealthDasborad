import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  PieChart, 
  Percent,
  HeartPulse,
  Scale,
  Droplet,
  Users
} from 'lucide-react';
import { HealthRecord } from '../types';

interface KpiSectionProps {
  records: HealthRecord[];
}

export function KpiSection({ records }: KpiSectionProps) {
  const total = records.length;

  if (total === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 mb-6">
        ไม่พบข้อมูลตามเงื่อนไขตัวกรอง กรุณาปรับเปลี่ยนหรือรีเซ็ตตัวกรอง
      </div>
    );
  }

  // 1. จำนวน (Count)
  const highRiskCount = records.filter((r) => r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง').length;
  const atRiskCount = records.filter((r) => r.riskLevel === 'กลุ่มเสี่ยง').length;
  const normalCount = records.filter((r) => r.riskLevel === 'ปกติ').length;

  // 2. ค่าเฉลี่ย (Mean / Average)
  const avgFbs = (records.reduce((acc, r) => acc + r.fbs, 0) / total).toFixed(1);
  const avgBmi = (records.reduce((acc, r) => acc + r.bmi, 0) / total).toFixed(1);
  const avgSbp = Math.round(records.reduce((acc, r) => acc + r.sbp, 0) / total);
  const avgDbp = Math.round(records.reduce((acc, r) => acc + r.dbp, 0) / total);

  // 3. ค่าต่ำสุด (Minimum)
  const minFbs = Math.min(...records.map((r) => r.fbs));
  const minBmi = Math.min(...records.map((r) => r.bmi));
  const minSbp = Math.min(...records.map((r) => r.sbp));

  // 4. ค่าสูงสุด (Maximum)
  const maxFbs = Math.max(...records.map((r) => r.fbs));
  const maxBmi = Math.max(...records.map((r) => r.bmi));
  const maxSbp = Math.max(...records.map((r) => r.sbp));

  // 5. สัดส่วน (Ratio)
  const maleCount = records.filter((r) => r.gender === 'ชาย').length;
  const femaleCount = records.filter((r) => r.gender === 'หญิง').length;
  const genderRatio = maleCount > 0 ? (femaleCount / maleCount).toFixed(2) : '-';
  const unhealthyCount = highRiskCount + atRiskCount;
  const healthRatio = normalCount > 0 ? (unhealthyCount / normalCount).toFixed(2) : '-';

  // 6. ร้อยละ (Percentage)
  const highRiskPct = ((highRiskCount / total) * 100).toFixed(1);
  const overweightPct = (
    (records.filter((r) => r.bmi >= 23).length / total) *
    100
  ).toFixed(1);
  const sedentaryPct = (
    (records.filter((r) => r.exercise === 'ไม่ออกกำลังกาย').length / total) *
    100
  ).toFixed(1);
  const smokerPct = (
    (records.filter((r) => r.smoking.includes('สูบ')).length / total) *
    100
  ).toFixed(1);

  return (
    <section className="mb-6">
      {/* Grid of 6 Specified Statistical Types */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* KPI 1: จำนวน (Count / Total Screened) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.02 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-sky-100 rounded-xl p-3 sm:p-3.5 shadow-xs hover:border-sky-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-sky-100 text-sky-800 truncate">
              1. สรุปเป็น: จำนวน
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-sky-700 tracking-tight">
              {total.toLocaleString('th-TH')} <span className="text-xs font-normal text-slate-500">คน</span>
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5 truncate">
              จำนวนผู้รับการคัดกรอง
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap justify-between gap-0.5">
            <span>ปกติ: <strong className="text-emerald-600">{normalCount}</strong></span>
            <span>เสี่ยง: <strong className="text-amber-600">{atRiskCount}</strong></span>
            <span>ป่วย: <strong className="text-rose-600">{highRiskCount}</strong></span>
          </div>
        </motion.div>

        {/* KPI 2: ค่าเฉลี่ย (Average) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.05 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-cyan-100 rounded-xl p-3 sm:p-3.5 shadow-xs hover:border-cyan-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-cyan-100 text-cyan-800 truncate">
              2. สรุปเป็น: ค่าเฉลี่ย
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {avgFbs} <span className="text-[10px] sm:text-xs font-normal text-slate-500">mg/dL</span>
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5 truncate">
              น้ำตาลในเลือดเฉลี่ย (FBS)
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap justify-between gap-0.5">
            <span>BMI: <strong className="text-slate-700">{avgBmi}</strong></span>
            <span>BP: <strong className="text-slate-700">{avgSbp}/{avgDbp}</strong></span>
          </div>
        </motion.div>

        {/* KPI 3: ค่าต่ำสุด (Minimum) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-emerald-100 rounded-xl p-3 sm:p-3.5 shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 truncate">
              3. สรุปเป็น: ค่าต่ำสุด
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowDownCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {minFbs} <span className="text-[10px] sm:text-xs font-normal text-slate-500">mg/dL</span>
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5 truncate">
              น้ำตาลต่ำสุดที่ตรวจพบ
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap justify-between gap-0.5">
            <span>BMI: <strong className="text-slate-700">{minBmi}</strong></span>
            <span>SBP: <strong className="text-slate-700">{minSbp}</strong></span>
          </div>
        </motion.div>

        {/* KPI 4: ค่าสูงสุด (Maximum) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.11 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-rose-100 rounded-xl p-3 sm:p-3.5 shadow-xs hover:border-rose-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-rose-100 text-rose-800 truncate">
              4. สรุปเป็น: ค่าสูงสุด
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              {maxFbs} <span className="text-[10px] sm:text-xs font-normal text-slate-500">mg/dL</span>
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5 truncate">
              น้ำตาลสูงสุด (ระดับวิกฤต)
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap justify-between gap-0.5">
            <span>BP สูงสุด: <strong className="text-rose-600">{maxSbp}</strong></span>
            <span>BMI: <strong className="text-slate-700">{maxBmi}</strong></span>
          </div>
        </motion.div>

        {/* KPI 5: สัดส่วน (Ratio) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.14 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-indigo-100 rounded-xl p-3 sm:p-3.5 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-indigo-100 text-indigo-800 truncate">
              5. สรุปเป็น: สัดส่วน
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-indigo-900 tracking-tight">
              1 : {genderRatio}
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5 truncate">
              สัดส่วนเพศ (ชาย : หญิง)
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap justify-between gap-0.5">
            <span>ช:{maleCount} ญ:{femaleCount}</span>
            <span className="text-indigo-600 font-medium">1:{healthRatio}</span>
          </div>
        </motion.div>

        {/* KPI 6: ร้อยละ (Percentage) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.17 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="bg-white border border-amber-100 rounded-xl p-3 sm:p-3.5 shadow-xs hover:border-amber-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-800 truncate">
              6. สรุปเป็น: ร้อยละ
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
              {highRiskPct}%
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5 truncate">
              ร้อยละผู้มีความเสี่ยงสูง
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap justify-between gap-0.5">
            <span>น้ำหนักเกิน: <strong className="text-slate-700">{overweightPct}%</strong></span>
            <span>ไม่ออกกำลัง: <strong className="text-slate-700">{sedentaryPct}%</strong></span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
