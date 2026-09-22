import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, RotateCcw, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardFilters, HealthRecord } from '../types';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (newFilters: DashboardFilters) => void;
  records: HealthRecord[];
  activeFilterCount: number;
  onReset: () => void;
}

export function FilterBar({
  filters,
  onFilterChange,
  records,
  activeFilterCount,
  onReset
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Extract unique areas from records
  const uniqueAreas = Array.from(
    new Set(records.map((r) => r.area.split(' (')[0]))
  ).sort();

  const handleFieldChange = (key: keyof DashboardFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div id="dashboard-filter-bar" className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 mb-6 transition-all duration-200">
      {/* Top row: Title & Quick Search & Controls */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-3 ${isOpen ? 'pb-3 border-b border-slate-100' : ''}`}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer select-none group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          title={isOpen ? 'คลิกเพื่อซ่อนตัวกรอง' : 'คลิกเพื่อเปิดตัวกรอง'}
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 group-hover:text-sky-700 transition-colors">
              ตัวกรองข้อมูลและการค้นหา
              {activeFilterCount > 0 && (
                <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  ใช้งาน {activeFilterCount} ตัวกรอง
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isOpen ? 'คลิกเพื่อย่อ/ปิดตัวกรอง' : 'ตัวกรองถูกซ่อนอยู่ คลิกเพื่อเปิดขยาย'}
            </p>
          </div>
        </div>

        {/* Search Input, Reset & Toggle Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
          <div className="relative flex-1 min-w-[140px] sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้รับตรวจ หรือข้อมูล..."
              value={filters.searchQuery}
              onChange={(e) => handleFieldChange('searchQuery', e.target.value)}
              className="w-full pl-9 pr-8 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {filters.searchQuery && (
              <button
                onClick={() => handleFieldChange('searchQuery', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="ล้างข้อความค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer shrink-0"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ต</span>
            </button>
          )}

          {/* Toggle Button (ปิด-เปิด) */}
          <button
            id="toggle-filter-bar-button"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
              isOpen 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                : 'bg-sky-600 hover:bg-sky-700 border-sky-600 text-white shadow-xs'
            }`}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>ซ่อนตัวกรอง</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>เปิดตัวกรอง</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Selects Grid - Collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 pt-3">
          {/* Filter 1: Gender */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              เพศ
            </label>
            <select
              value={filters.gender}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
              className="w-full text-xs py-2 sm:py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>

          {/* Filter 2: Age Group */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              กลุ่มอายุ
            </label>
            <select
              value={filters.ageGroup}
              onChange={(e) => handleFieldChange('ageGroup', e.target.value)}
              className="w-full text-xs py-2 sm:py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="">ทั้งหมดทุกช่วงวัย</option>
              <option value="< 35 ปี">&lt; 35 ปี (วัยหนุ่มสาว)</option>
              <option value="35 - 49 ปี">35 - 49 ปี (วัยทำงาน)</option>
              <option value="50 - 59 ปี">50 - 59 ปี (วัยกลางคน)</option>
              <option value="60 ปีขึ้นไป">60 ปีขึ้นไป (ผู้สูงอายุ)</option>
            </select>
          </div>

          {/* Filter 3: Area */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              พื้นที่/ตำบล
            </label>
            <select
              value={filters.area}
              onChange={(e) => handleFieldChange('area', e.target.value)}
              className="w-full text-xs py-2 sm:py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="">ทุกตำบล/ชุมชน</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Risk Level */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              ระดับความเสี่ยง
            </label>
            <select
              value={filters.riskLevel}
              onChange={(e) => handleFieldChange('riskLevel', e.target.value)}
              className="w-full text-xs py-2 sm:py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="">ทุกระดับความเสี่ยง</option>
              <option value="ปกติ">กลุ่มปกติ (เขียว)</option>
              <option value="กลุ่มเสี่ยง">กลุ่มเสี่ยง (เหลือง)</option>
              <option value="กลุ่มป่วย/เสี่ยงสูง">กลุ่มป่วย/เสี่ยงสูง (แดง)</option>
            </select>
          </div>

          {/* Filter 5: Smoking */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              การสูบบุหรี่
            </label>
            <select
              value={filters.smoking}
              onChange={(e) => handleFieldChange('smoking', e.target.value)}
              className="w-full text-xs py-2 sm:py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="ไม่เคยสูบ">ไม่เคยสูบ</option>
              <option value="เคยสูบแต่เลิกแล้ว">เลิกแล้ว</option>
              <option value="สูบนานๆ ครั้ง">สูบเป็นครั้งคราว</option>
              <option value="สูบประจำทุกวัน">สูบประจำทุกวัน</option>
            </select>
          </div>

          {/* Filter 6: Alcohol */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              ดื่มแอลกอฮอล์
            </label>
            <select
              value={filters.alcohol}
              onChange={(e) => handleFieldChange('alcohol', e.target.value)}
              className="w-full text-xs py-2 sm:py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="ไม่ดื่ม">ไม่ดื่ม</option>
              <option value="ดื่มนานๆ ครั้ง">ดื่มนานๆ ครั้ง</option>
              <option value="ดื่มสัปดาห์ละ 1-2 ครั้ง">1 - 2 ครั้ง/สัปดาห์</option>
              <option value="ดื่มประจำ/หนัก">ดื่มประจำ/หนัก</option>
            </select>
          </div>

          {/* Filter 7: Exercise */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              การออกกำลังกาย
            </label>
            <select
              value={filters.exercise}
              onChange={(e) => handleFieldChange('exercise', e.target.value)}
              className="w-full text-xs py-2 sm:py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="ไม่ออกกำลังกาย">ไม่ออกกำลังกาย</option>
              <option value="1 - 2 วัน/สัปดาห์">1 - 2 วัน/สัปดาห์</option>
              <option value="3 - 4 วัน/สัปดาห์">3 - 4 วัน/สัปดาห์</option>
              <option value="5 วันขึ้นไป/สัปดาห์">≥ 5 วัน/สัปดาห์</option>
            </select>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

      {/* Quick active filter indicator pills when collapsed */}
      <AnimatePresence>
        {!isOpen && activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-wrap items-center gap-1.5 pt-2.5 mt-2.5 border-t border-slate-100 text-xs"
          >
            <span className="text-[11px] text-slate-400 font-medium">ตัวกรองที่เลือก:</span>
            {filters.gender && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                เพศ: {filters.gender}
                <button onClick={() => handleFieldChange('gender', '')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.ageGroup && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                อายุ: {filters.ageGroup}
                <button onClick={() => handleFieldChange('ageGroup', '')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.area && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                พื้นที่: {filters.area}
                <button onClick={() => handleFieldChange('area', '')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.riskLevel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                ความเสี่ยง: {filters.riskLevel}
                <button onClick={() => handleFieldChange('riskLevel', '')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.smoking && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                สูบบุหรี่: {filters.smoking}
                <button onClick={() => handleFieldChange('smoking', '')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.alcohol && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                ดื่มแอลกอฮอล์: {filters.alcohol}
                <button onClick={() => handleFieldChange('alcohol', '')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.exercise && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                ออกกำลังกาย: {filters.exercise}
                <button onClick={() => handleFieldChange('exercise', '')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => setIsOpen(true)}
              className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
            >
              แก้ไขตัวกรอง
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
