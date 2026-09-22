import { useState } from 'react';
import { HealthRecord } from '../types';
import { 
  FileSpreadsheet, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Wine,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Heart,
  Droplet,
  Scale,
  Cigarette,
  Dumbbell
} from 'lucide-react';
import { PatientDetailModal } from './PatientDetailModal';

interface DetailTableTabProps {
  records: HealthRecord[];
}

type SortField = 'hn' | 'fullName' | 'age' | 'area' | 'bmi' | 'sbp' | 'fbs' | 'alcohol' | 'riskLevel';

export function DetailTableTab({ records }: DetailTableTabProps) {
  const [selectedPatient, setSelectedPatient] = useState<HealthRecord | null>(null);
  const [sortField, setSortField] = useState<SortField>('riskLevel');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Sorting
  const sortedList = [...records].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'age' || sortField === 'bmi' || sortField === 'sbp' || sortField === 'fbs') {
      comparison = a[sortField] - b[sortField];
    } else if (sortField === 'riskLevel') {
      const rank: Record<string, number> = {
        'กลุ่มป่วย/เสี่ยงสูง': 3,
        'กลุ่มเสี่ยง': 2,
        'ปกติ': 1
      };
      comparison = (rank[a.riskLevel] || 0) - (rank[b.riskLevel] || 0);
    } else if (sortField === 'alcohol') {
      const alcoholRank: Record<string, number> = {
        'ดื่มประจำ/หนัก': 4,
        'ดื่มสัปดาห์ละ 1-2 ครั้ง': 3,
        'ดื่มนานๆ ครั้ง': 2,
        'ไม่ดื่ม': 1
      };
      comparison = (alcoholRank[a.alcohol] || 0) - (alcoholRank[b.alcohol] || 0);
    } else {
      comparison = String(a[sortField]).localeCompare(String(b[sortField]));
    }
    return sortAsc ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedList.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedList = sortedList.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Toolbar: View switcher & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">
            ฐานข้อมูลเวชระเบียนรายบุคคล:
          </span>
          <span className="text-xs text-slate-500 font-medium">
            ทั้งหมด <strong className="text-slate-800">{records.length}</strong> รายการ
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">รูปแบบการแสดง:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-sky-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ด</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium text-xs transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-sky-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>ตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card View (Responsive Grid for Mobile/Tablet/Desktop) */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {paginatedList.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-200 text-xs">
              ไม่พบข้อมูลผู้รับการตรวจตามเงื่อนไขที่เลือก
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginatedList.map((patient, idx) => {
                const isHighRisk = patient.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง';
                const isAtRisk = patient.riskLevel === 'กลุ่มเสี่ยง';
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-xs hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">#{startIndex + idx + 1}</span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">{patient.fullName}</h4>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{patient.gender}</span>
                            <span>•</span>
                            <span>{patient.age} ปี</span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">HN:{patient.hn}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : isAtRisk
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isHighRisk ? (
                            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                          ) : isAtRisk ? (
                            <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          )}
                          {patient.riskLevel}
                        </span>
                      </div>

                      {/* Vital Signs Bento */}
                      <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                            <Scale className="w-3 h-3 text-indigo-500" />
                            <span>BMI</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-800 text-xs">{patient.bmi}</span>
                            <span className={`text-[10px] font-medium ${
                              patient.bmi >= 25 ? 'text-rose-600' : patient.bmi >= 23 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {patient.bmiCategory}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span>ความดัน BP</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-800 text-xs">{patient.sbp}/{patient.dbp}</span>
                            <span className={`text-[10px] font-medium ${
                              patient.sbp >= 140 || patient.dbp >= 90 ? 'text-rose-600' : patient.sbp >= 120 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              mmHg
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                            <Droplet className="w-3 h-3 text-sky-500" />
                            <span>น้ำตาล FBS</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-800 text-xs">{patient.fbs}</span>
                            <span className={`text-[10px] font-medium ${
                              patient.fbs >= 126 ? 'text-rose-600' : patient.fbs >= 100 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              mg/dL
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                            <Scale className="w-3 h-3 text-teal-500" />
                            <span>รอบเอว</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-800 text-xs">{patient.waistCm} ซม.</span>
                            <span className={`text-[10px] font-medium ${
                              patient.isCentralObese ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                              {patient.isCentralObese ? 'อ้วนลงพุง' : 'ปกติ'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lifestyle Mini Row */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600 mb-2">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          <Wine className="w-3 h-3 text-amber-500" />
                          {patient.alcohol}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          <Cigarette className="w-3 h-3 text-rose-500" />
                          {patient.smoking}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          <Dumbbell className="w-3 h-3 text-sky-500" />
                          {patient.exercise}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs mt-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[170px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{patient.area}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 rounded-md font-medium transition-colors shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>ดูประวัติ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      {viewMode === 'table' && (
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-2 sm:hidden bg-sky-50/70 border-b border-sky-100 text-[11px] text-sky-800 flex items-center justify-between">
          <span>👉 เลื่อนตารางแนวนอนเพื่อดูข้อมูลทุกคอลัมน์</span>
          <span className="text-[10px] text-sky-600 font-medium">(หรือสลับไปโหมดการ์ด)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] select-none">
              <tr>
                <th
                  className="py-3 px-3.5 text-center w-16 text-slate-600 font-bold uppercase text-[11px]"
                >
                  <span>ลำดับ</span>
                </th>
                <th
                  onClick={() => handleSort('fullName')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ชื่อ - สกุล</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('age')}
                  className="py-3 px-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>อายุ</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('area')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>พื้นที่ / ตำบล</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bmi')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>BMI</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-2.5">
                  <span>รอบเอว</span>
                </th>
                <th
                  onClick={() => handleSort('sbp')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ความดัน BP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fbs')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>น้ำตาล FBS</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('alcohol')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  title="คลิกเพื่อเรียงลำดับตามการดื่มแอลกอฮอล์"
                >
                  <div className="flex items-center gap-1">
                    <span>พฤติกรรมเสี่ยง</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('riskLevel')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ระดับความเสี่ยง</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <span>การปฏิบัติการ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    ไม่พบข้อมูลผู้รับการตรวจตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                paginatedList.map((patient, index) => {
                  const isHighRisk = patient.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง';
                  const isAtRisk = patient.riskLevel === 'กลุ่มเสี่ยง';

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`hover:bg-sky-50/50 transition-colors cursor-pointer ${
                        isHighRisk ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* ลำดับ */}
                      <td className="py-2.5 px-3.5 font-medium text-slate-500 whitespace-nowrap text-center">
                        {startIndex + index + 1}
                      </td>

                      {/* Name & Gender */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{patient.fullName}</div>
                        <div className="text-[10px] text-slate-400">เพศ{patient.gender}</div>
                      </td>

                      {/* Age */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-700">
                        {patient.age} ปี
                      </td>

                      {/* Area */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 max-w-[140px] truncate" title={patient.area}>
                        {patient.area}
                      </td>

                      {/* BMI with Conditional Formatting */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                            patient.bmi >= 30
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : patient.bmi >= 25
                              ? 'bg-amber-100 text-amber-800'
                              : patient.bmi >= 23
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'text-slate-700'
                          }`}
                        >
                          {patient.bmi}
                        </span>
                      </td>

                      {/* Waist with Conditional Formatting */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <span
                          className={`text-[11px] ${
                            patient.isCentralObese
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {patient.waistCm} ซม.
                          {patient.isCentralObese && ' (พุง)'}
                        </span>
                      </td>

                      {/* BP with Conditional Formatting */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] inline-block ${
                            patient.sbp >= 140 || patient.dbp >= 90
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 font-bold'
                              : patient.sbp >= 120 || patient.dbp >= 80
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {patient.sbp}/{patient.dbp}
                        </span>
                      </td>

                      {/* FBS with Conditional Formatting */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] inline-block ${
                            patient.fbs >= 126
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 font-bold'
                              : patient.fbs >= 100
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {patient.fbs} mg/dL
                        </span>
                      </td>

                      {/* Behaviors with Alcohol status */}
                      <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {/* Alcohol: ดื่ม หรือ ไม่ดื่ม */}
                          <div>
                            {patient.alcohol === 'ไม่ดื่ม' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/70 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                ไม่ดื่มแอลกอฮอล์
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                                  patient.alcohol.includes('ประจำ')
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <Wine className="w-3 h-3 shrink-0" />
                                <span>ดื่มแอลกอฮอล์</span>
                                <span className="text-[9px] font-normal opacity-90">
                                  ({patient.alcohol === 'ดื่มประจำ/หนัก' ? 'ประจำ' : patient.alcohol === 'ดื่มนานๆ ครั้ง' ? 'นานๆ ครั้ง' : '1-2 ครั้ง/สัปดาห์'})
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Secondary Behaviors: บุหรี่ & ออกกำลังกาย */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            {patient.smoking.includes('สูบ') && (
                              <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200 text-[9px]">
                                {patient.smoking === 'สูบประจำทุกวัน' ? 'สูบบุหรี่' : 'สูบเป็นครั้งคราว'}
                              </span>
                            )}
                            {patient.exercise === 'ไม่ออกกำลังกาย' && (
                              <span className="bg-rose-50 text-rose-600 px-1 py-0.2 rounded border border-rose-100 text-[9px]">
                                ไม่ออกกำลัง
                              </span>
                            )}
                            {!patient.smoking.includes('สูบ') && patient.exercise !== 'ไม่ออกกำลังกาย' && (
                              <span className="text-[9px] text-slate-400">
                                บุหรี่/ออกกำลัง: ปกติ
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : isAtRisk
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isHighRisk ? (
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                          ) : isAtRisk ? (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {patient.riskLevel}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 rounded-md font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูประวัติ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Unified Responsive Pagination Footer */}
      <div className="p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
          <div>
            แสดง {sortedList.length === 0 ? 0 : startIndex + 1} ถึง {Math.min(startIndex + pageSize, sortedList.length)} จากทั้งหมด{' '}
            <strong className="text-slate-900">{sortedList.length}</strong> รายการ
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>(หน้าละ:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-1.5 border border-slate-200 rounded bg-white text-slate-700 text-xs cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <span>รายการ)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={validPage === 1}
            className="flex items-center gap-1 min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs">ก่อนหน้า</span>
          </button>
          <span className="px-2 font-semibold text-slate-800 text-xs">
            {validPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={validPage === totalPages}
            className="flex items-center gap-1 min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-slate-700 cursor-pointer"
          >
            <span className="text-xs">ถัดไป</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
}
