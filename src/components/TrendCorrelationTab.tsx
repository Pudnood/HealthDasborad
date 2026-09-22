import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  CartesianGrid
} from 'recharts';
import { HealthRecord } from '../types';
import { TrendingUp, GitCommit, AlertTriangle } from 'lucide-react';

interface TrendCorrelationTabProps {
  records: HealthRecord[];
}

export function TrendCorrelationTab({ records }: TrendCorrelationTabProps) {
  const total = records.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
        ไม่มีข้อมูลสำหรับการวิเคราะห์แนวโน้มและความสัมพันธ์
      </div>
    );
  }

  // Health Trend Fields 1 & 2: FBS & SBP Trend across Age Cohorts
  const ageCohorts = ['< 35 ปี', '35 - 49 ปี', '50 - 59 ปี', '60 ปีขึ้นไป'];
  const ageTrendData = ageCohorts.map((ac) => {
    const subset = records.filter((r) => r.ageGroup === ac);
    const subTotal = subset.length;
    if (subTotal === 0) {
      return { ageGroup: ac, avgFbs: 0, avgSbp: 0, avgBmi: 0, count: 0 };
    }
    const avgFbs = Number((subset.reduce((a, b) => a + b.fbs, 0) / subTotal).toFixed(1));
    const avgSbp = Math.round(subset.reduce((a, b) => a + b.sbp, 0) / subTotal);
    const avgBmi = Number((subset.reduce((a, b) => a + b.bmi, 0) / subTotal).toFixed(1));
    return {
      ageGroup: ac,
      avgFbs,
      avgSbp,
      avgBmi,
      count: subTotal
    };
  });

  // Scatter 1: BMI vs. FBS (น้ำตาล)
  const bmiFbsData = records.map((r) => ({
    hn: r.hn,
    name: r.fullName,
    bmi: r.bmi,
    fbs: r.fbs,
    risk: r.riskLevel,
    age: r.age,
    color:
      r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง'
        ? '#ef4444'
        : r.riskLevel === 'กลุ่มเสี่ยง'
        ? '#f59e0b'
        : '#10b981'
  }));

  // Scatter 2: BMI vs. SBP (ความดันบน)
  const bmiSbpData = records.map((r) => ({
    hn: r.hn,
    name: r.fullName,
    bmi: r.bmi,
    sbp: r.sbp,
    dbp: r.dbp,
    risk: r.riskLevel,
    age: r.age,
    color:
      r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง'
        ? '#ef4444'
        : r.riskLevel === 'กลุ่มเสี่ยง'
        ? '#f59e0b'
        : '#10b981'
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Intro Box */}
      <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 text-xs text-sky-900">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-sky-700 shrink-0" />
          <div>
            <strong className="font-semibold">การวิเคราะห์แนวโน้มและความสัมพันธ์เชิงลึก:</strong>
            <span className="text-slate-600 ml-1">
              แนวโน้มค่าน้ำตาลและความดันตามช่วงวัย พร้อมแผนภาพการกระจาย
              แสดงความสัมพันธ์ระหว่างดัชนีมวลกายกับระดับน้ำตาล และดัชนีมวลกายกับความดันโลหิต
            </span>
          </div>
        </div>
      </div>

      {/* Health Trend Chart: Age Cohort Trends for FBS and SBP */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 gap-2">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              แนวโน้มสุขภาพ 2 ปัจจัย
            </span>
            <h3 className="text-sm font-bold text-slate-800 mt-1">
              แนวโน้มระดับน้ำตาลเฉลี่ยและความดันโลหิตเฉลี่ย จำแนกตามกลุ่มอายุ
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-sky-700">
              <span className="w-3 h-1 bg-sky-600 rounded"></span> SBP ความดันเฉลี่ย (mmHg)
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-3 h-1 bg-amber-500 rounded"></span> FBS น้ำตาลเฉลี่ย (mg/dL)
            </span>
          </div>
        </div>

        <div className="h-60 sm:h-72 mt-3 sm:mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ageTrendData} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="ageGroup" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#0284c7' }} domain={[90, 160]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#d97706' }} domain={[70, 150]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val, name) => [
                  `${val} ${name === 'avgSbp' ? 'mmHg' : 'mg/dL'}`,
                  name === 'avgSbp' ? 'ความดัน SBP เฉลี่ย' : 'น้ำตาล FBS เฉลี่ย'
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgSbp"
                name="avgSbp"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0284c7' }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgFbs"
                name="avgFbs"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 text-[11px] sm:text-xs">
          {ageTrendData.map((ag) => (
            <div key={ag.ageGroup} className="bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-800 truncate">{ag.ageGroup}</div>
              <div className="text-sky-700 mt-0.5 sm:mt-1">SBP: <strong>{ag.avgSbp} mmHg</strong></div>
              <div className="text-amber-700">FBS: <strong>{ag.avgFbs} mg/dL</strong></div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Scatter Plots - BMI vs. FBS & BMI vs. SBP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Scatter 1: BMI vs. FBS */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                ความสัมพันธ์ 1: ดัชนีมวลกาย vs น้ำตาล
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                ความสัมพันธ์ระหว่างดัชนีมวลกายกับระดับน้ำตาลในเลือด
              </h3>
            </div>
            <GitCommit className="w-5 h-5 text-cyan-600 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis
                  type="number"
                  dataKey="bmi"
                  name="BMI"
                  domain={[15, 36]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'ดัชนีมวลกาย BMI (kg/m²)', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="fbs"
                  name="FBS"
                  domain={[60, 240]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'FBS (mg/dL)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fill: '#64748b' }}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-md text-xs">
                          <div className="font-semibold text-slate-800">{data.name} ({data.hn})</div>
                          <div className="text-slate-600">อายุ: {data.age} ปี</div>
                          <div className="text-sky-700">BMI: <strong>{data.bmi}</strong></div>
                          <div className="text-rose-600">FBS: <strong>{data.fbs} mg/dL</strong></div>
                          <div className="text-slate-500 font-medium">ระดับ: {data.risk}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Reference threshold lines */}
                <ReferenceLine x={23} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'BMI 23 เกินเกณฑ์', fill: '#f59e0b', fontSize: 9, position: 'top' }} />
                <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'FBS ≥ 126', fill: '#ef4444', fontSize: 9, position: 'right' }} />
                <Scatter name="ผู้รับการตรวจ" data={bmiFbsData} fill="#0ea5e9" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] sm:text-xs text-slate-600">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              กลุ่มที่มี BMI &gt; 25 มักพบระดับน้ำตาลสะสมและ FBS ในช่วงเสี่ยง IFG และสงสัยเบาหวานสูงกว่ากลุ่มน้ำหนักปกติอย่างชัดเจน
            </span>
          </div>
        </div>

        {/* Scatter 2: BMI vs. SBP */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                ความสัมพันธ์ 2: ดัชนีมวลกาย vs ความดัน
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                ความสัมพันธ์ระหว่างดัชนีมวลกายกับความดันโลหิต
              </h3>
            </div>
            <GitCommit className="w-5 h-5 text-rose-600 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis
                  type="number"
                  dataKey="bmi"
                  name="BMI"
                  domain={[15, 36]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'ดัชนีมวลกาย BMI (kg/m²)', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="sbp"
                  name="SBP"
                  domain={[90, 190]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'SBP (mmHg)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fill: '#64748b' }}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-md text-xs">
                          <div className="font-semibold text-slate-800">{data.name} ({data.hn})</div>
                          <div className="text-slate-600">อายุ: {data.age} ปี</div>
                          <div className="text-sky-700">BMI: <strong>{data.bmi}</strong></div>
                          <div className="text-rose-600">ความดัน: <strong>{data.sbp}/{data.dbp} mmHg</strong></div>
                          <div className="text-slate-500 font-medium">ระดับ: {data.risk}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Reference threshold lines */}
                <ReferenceLine x={25} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'BMI 25 อ้วน', fill: '#f97316', fontSize: 9, position: 'top' }} />
                <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SBP ≥ 140', fill: '#ef4444', fontSize: 9, position: 'right' }} />
                <Scatter name="ผู้รับการตรวจ" data={bmiSbpData} fill="#ec4899" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] sm:text-xs text-slate-600">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>
              มีแนวโน้มความสัมพันธ์เชิงบวก (Positive Correlation) อย่างเด่นชัดระหว่าง BMI ที่สูงขึ้นกับระดับความดันโลหิต Systolic
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
