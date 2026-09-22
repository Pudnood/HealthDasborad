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
import { ShieldAlert, Heart, Droplets, UserMinus, MapPin } from 'lucide-react';

interface RiskAnalysisTabProps {
  records: HealthRecord[];
}

export function RiskAnalysisTab({ records }: RiskAnalysisTabProps) {
  const total = records.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200">
        ไม่มีข้อมูลสำหรับการวิเคราะห์ความเสี่ยง
      </div>
    );
  }

  // Field 1: ระดับความดันโลหิต (Blood Pressure)
  const bpCounts: Record<string, number> = {
    'ปกติ (<120/80)': 0,
    'พรีความดันสูง (120-139/80-89)': 0,
    'ความดันสูงขั้น 1 (140-159/90-99)': 0,
    'ความดันสูงขั้น 2 (≥160/≥100)': 0
  };
  records.forEach((r) => {
    if (bpCounts[r.bpCategory] !== undefined) {
      bpCounts[r.bpCategory]++;
    }
  });
  const bpData = Object.keys(bpCounts).map((k) => ({
    name: k.split(' (')[0],
    detail: k,
    count: bpCounts[k],
    pct: ((bpCounts[k] / total) * 100).toFixed(1)
  }));
  const bpColors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

  // Field 2: ระดับน้ำตาลในเลือด (Fasting Blood Sugar)
  const fbsCounts: Record<string, number> = {
    'ปกติ (<100 mg/dL)': 0,
    'เสี่ยงเบาหวาน IFG (100-125 mg/dL)': 0,
    'สงสัยเป็นเบาหวาน (≥126 mg/dL)': 0
  };
  records.forEach((r) => {
    if (fbsCounts[r.fbsCategory] !== undefined) {
      fbsCounts[r.fbsCategory]++;
    }
  });
  const fbsData = Object.keys(fbsCounts).map((k) => ({
    name: k.split(' (')[0],
    detail: k,
    count: fbsCounts[k],
    pct: ((fbsCounts[k] / total) * 100).toFixed(1)
  }));
  const fbsColors = ['#10b981', '#f59e0b', '#dc2626'];

  // Field 3: ดัชนีมวลกาย BMI (Asia-Pacific Criteria)
  const bmiCounts: Record<string, number> = {
    'น้ำหนักน้อย': 0,
    'ปกติ': 0,
    'น้ำหนักเกิน': 0,
    'อ้วนระดับ 1': 0,
    'อ้วนระดับ 2 (อันตราย)': 0
  };
  records.forEach((r) => {
    if (bmiCounts[r.bmiCategory] !== undefined) {
      bmiCounts[r.bmiCategory]++;
    }
  });
  const bmiData = Object.keys(bmiCounts).map((k) => ({
    category: k,
    count: bmiCounts[k],
    pct: ((bmiCounts[k] / total) * 100).toFixed(1)
  }));
  const bmiColors = ['#38bdf8', '#10b981', '#fbbf24', '#f97316', '#ef4444'];

  // Field 4: ภาวะอ้วนลงพุง (Central Obesity) และภาพรวมความเสี่ยงรวม (Overall Risk)
  const centralObeseCount = records.filter((r) => r.isCentralObese).length;
  const normalWaistCount = total - centralObeseCount;
  const waistData = [
    { name: 'รอบเอวปกติ', count: normalWaistCount, pct: ((normalWaistCount / total) * 100).toFixed(1) },
    { name: 'อ้วนลงพุง (เสี่ยง Metabolic)', count: centralObeseCount, pct: ((centralObeseCount / total) * 100).toFixed(1) }
  ];

  // นอกเหนือจากที่กำหนด 1: กลุ่มอายุที่มีความเสี่ยงสูง
  const ageGroups = ['< 35 ปี', '35 - 49 ปี', '50 - 59 ปี', '60 ปีขึ้นไป'];
  const ageRiskData = ageGroups.map((ag) => {
    const inGroup = records.filter((r) => r.ageGroup === ag);
    const gTotal = inGroup.length;
    const highRisk = inGroup.filter((r) => r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง').length;
    const atRisk = inGroup.filter((r) => r.riskLevel === 'กลุ่มเสี่ยง').length;
    const normal = inGroup.filter((r) => r.riskLevel === 'ปกติ').length;
    return {
      ageGroup: ag,
      'กลุ่มป่วย/เสี่ยงสูง': highRisk,
      'กลุ่มเสี่ยง': atRisk,
      'ปกติ': normal,
      highRiskPct: gTotal > 0 ? ((highRisk / gTotal) * 100).toFixed(1) : 0,
      total: gTotal
    };
  });

  // นอกเหนือจากที่กำหนด 2: พื้นที่ที่มีผู้เสี่ยงสูง (Area Risk Ranking)
  const areaMap: Record<string, { total: number; highRisk: number; atRisk: number }> = {};
  records.forEach((r) => {
    const cleanArea = r.area.split(' (')[0];
    if (!areaMap[cleanArea]) {
      areaMap[cleanArea] = { total: 0, highRisk: 0, atRisk: 0 };
    }
    areaMap[cleanArea].total++;
    if (r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง') areaMap[cleanArea].highRisk++;
    if (r.riskLevel === 'กลุ่มเสี่ยง') areaMap[cleanArea].atRisk++;
  });

  const areaRiskData = Object.keys(areaMap)
    .map((area) => {
      const item = areaMap[area];
      const riskRate = item.total > 0 ? (item.highRisk / item.total) * 100 : 0;
      return {
        area,
        total: item.total,
        highRisk: item.highRisk,
        atRisk: item.atRisk,
        highRiskRate: Number(riskRate.toFixed(1))
      };
    })
    .sort((a, b) => b.highRiskRate - a.highRiskRate);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: 4 Core Health Risk Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Field 1: Blood Pressure */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                การกระจายระดับความดันโลหิต
              </h3>
            </div>
            <Heart className="w-5 h-5 text-rose-500 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bpData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  labelFormatter={(label) => `ระดับ: ${label}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bpData.map((_, index) => (
                    <Cell key={`bp-cell-${index}`} fill={bpColors[index % bpColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2.5 sm:pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs text-slate-600">
            <div>
              ปกติ: <strong className="text-emerald-600">{bpCounts['ปกติ (<120/80)']} คน</strong>
            </div>
            <div>
              ความดันสูง (ขั้น 1+2):{' '}
              <strong className="text-rose-600">
                {bpCounts['ความดันสูงขั้น 1 (140-159/90-99)'] + bpCounts['ความดันสูงขั้น 2 (≥160/≥100)']} คน
              </strong>
            </div>
          </div>
        </div>

        {/* Field 2: Fasting Blood Sugar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                การคัดกรองเบาหวาน
              </h3>
            </div>
            <Droplets className="w-5 h-5 text-sky-500 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fbsData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {fbsData.map((_, index) => (
                    <Cell key={`fbs-cell-${index}`} fill={fbsColors[index % fbsColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2.5 sm:pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs text-slate-600">
            <div>
              เสี่ยง IFG (100-125):{' '}
              <strong className="text-amber-600">
                {fbsCounts['เสี่ยงเบาหวาน IFG (100-125 mg/dL)']} คน
              </strong>
            </div>
            <div>
              สงสัยเบาหวาน (≥126):{' '}
              <strong className="text-rose-600">
                {fbsCounts['สงสัยเป็นเบาหวาน (≥126 mg/dL)']} คน
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Field 3 BMI & Field 4 Central Obesity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Field 3: BMI Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                การกระจายตามเกณฑ์ดัชนีมวลกาย
              </h3>
            </div>
            <UserMinus className="w-5 h-5 text-amber-500 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmiData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="category" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bmiData.map((_, index) => (
                    <Cell key={`bmi-cell-${index}`} fill={bmiColors[index % bmiColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-1 text-xs text-slate-600">
            <span>น้ำหนักเกินและอ้วน (BMI ≥ 23):</span>
            <strong className="text-rose-600">
              {bmiCounts['น้ำหนักเกิน'] + bmiCounts['อ้วนระดับ 1'] + bmiCounts['อ้วนระดับ 2 (อันตราย)']} คน (
              {(
                ((bmiCounts['น้ำหนักเกิน'] + bmiCounts['อ้วนระดับ 1'] + bmiCounts['อ้วนระดับ 2 (อันตราย)']) /
                  total) *
                100
              ).toFixed(1)}
              %)
            </strong>
          </div>
        </div>

        {/* Field 4: Central Obesity (Waist Circumference) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                สัดส่วนภาวะอ้วนลงพุง (ช &gt; 90 ซม. / ญ &gt; 80 ซม.)
              </h3>
            </div>
            <Heart className="w-5 h-5 text-rose-500 shrink-0" />
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={waistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  formatter={(val, _name, item) => [`${val} คน (${item.payload.pct}%)`, 'จำนวน']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-1 text-xs text-slate-600">
            <span>ผู้มีภาวะอ้วนลงพุง:</span>
            <strong className="text-rose-600">
              {centralObeseCount} คน ({((centralObeseCount / total) * 100).toFixed(1)}%)
            </strong>
          </div>
        </div>
      </div>

      {/* Row 3: ประเด็นเสริมที่กำหนด - กลุ่มอายุเสี่ยงสูง & พื้นที่เสี่ยงสูง */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* กลุ่มอายุที่มีความเสี่ยงสูง */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                ระดับความเสี่ยงจำแนกตามกลุ่มอายุ
              </h3>
            </div>
          </div>

          <div className="h-56 sm:h-64 mt-3 sm:mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="ageGroup" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="ปกติ" stackId="a" fill="#10b981" />
                <Bar dataKey="กลุ่มเสี่ยง" stackId="a" fill="#f59e0b" />
                <Bar dataKey="กลุ่มป่วย/เสี่ยงสูง" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-2">
            * พบความเสี่ยงสูงเพิ่มขึ้นชัดเจนในกลุ่มอายุ 50-59 ปี และ 60 ปีขึ้นไป (ผู้สูงอายุ)
          </p>
        </div>

        {/* พื้นที่ที่มีผู้เสี่ยงสูง (Area Risk Ranking) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                การจัดอันดับพื้นที่ที่มีอัตราผู้เสี่ยงสูง
              </h3>
            </div>
            <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
          </div>

          <div className="mt-3 sm:mt-4 space-y-3">
            {areaRiskData.map((item, idx) => (
              <div key={item.area} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{item.area}</span>
                    <span className="text-slate-400">({item.total} ราย)</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <span className="text-slate-500 text-[11px] sm:text-xs">เสี่ยงสูง {item.highRisk} ราย</span>
                    <strong className="text-rose-600 font-bold w-12 text-right">
                      {item.highRiskRate}%
                    </strong>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.highRiskRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
