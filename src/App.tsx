import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HealthRecord, 
  DashboardFilters, 
  SheetSourceStatus 
} from './types';
import { 
  fetchHealthRecordsFromGoogleSheet, 
  TARGET_SHEET_ID 
} from './services/googleSheetService';
import { initialHealthRecords } from './data/mockHealthData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KpiSection } from './components/KpiSection';
import { RiskAnalysisTab } from './components/RiskAnalysisTab';
import { BehaviorAnalysisTab } from './components/BehaviorAnalysisTab';
import { TrendCorrelationTab } from './components/TrendCorrelationTab';
import { DetailTableTab } from './components/DetailTableTab';
import { SheetSyncModal } from './components/SheetSyncModal';
import { 
  Activity, 
  ShieldAlert, 
  HeartPulse, 
  TrendingUp, 
  FileSpreadsheet, 
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [allRecords, setAllRecords] = useState<HealthRecord[]>(initialHealthRecords);
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'behavior' | 'trends' | 'table'>('overview');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [sheetStatus, setSheetStatus] = useState<SheetSourceStatus>({
    sheetId: TARGET_SHEET_ID,
    status: 'loading',
    lastUpdated: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    totalFetched: initialHealthRecords.length,
    sourceType: 'standard_medical_dataset'
  });

  const [filters, setFilters] = useState<DashboardFilters>({
    searchQuery: '',
    gender: '',
    ageGroup: '',
    area: '',
    riskLevel: '',
    smoking: '',
    alcohol: '',
    exercise: '',
    bmiCategory: ''
  });

  // Load records on mount & setup real-time background sync interval (every 30 seconds)
  useEffect(() => {
    loadData();

    // Real-time background sync with Google Sheet
    const syncInterval = setInterval(() => {
      loadData(true); // background silent refresh
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  const loadData = async (isBackground = false) => {
    if (!isBackground) {
      setSheetStatus((prev) => ({ ...prev, status: 'loading' }));
    }
    try {
      const result = await fetchHealthRecordsFromGoogleSheet(TARGET_SHEET_ID);
      setAllRecords(result.records);
      setSheetStatus(result.status);
    } catch (e) {
      setSheetStatus((prev) => ({
        ...prev,
        status: 'fallback_used',
        errorMessage: 'ไม่สามารถโหลดจาก Google Sheet โดยตรงได้ จึงแสดงข้อมูลจำลองมาตรฐาน'
      }));
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      gender: '',
      ageGroup: '',
      area: '',
      riskLevel: '',
      smoking: '',
      alcohol: '',
      exercise: '',
      bmiCategory: ''
    });
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.gender) count++;
    if (filters.ageGroup) count++;
    if (filters.area) count++;
    if (filters.riskLevel) count++;
    if (filters.smoking) count++;
    if (filters.alcohol) count++;
    if (filters.exercise) count++;
    if (filters.bmiCategory) count++;
    return count;
  }, [filters]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      // Search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchHn = record.hn.toLowerCase().includes(query);
        const matchName = record.fullName.toLowerCase().includes(query);
        if (!matchHn && !matchName) return false;
      }

      // Gender
      if (filters.gender && record.gender !== filters.gender) return false;

      // Age Group
      if (filters.ageGroup && record.ageGroup !== filters.ageGroup) return false;

      // Area
      if (filters.area && !record.area.includes(filters.area)) return false;

      // Risk Level
      if (filters.riskLevel && record.riskLevel !== filters.riskLevel) return false;

      // Smoking
      if (filters.smoking && record.smoking !== filters.smoking) return false;

      // Alcohol
      if (filters.alcohol && record.alcohol !== filters.alcohol) return false;

      // Exercise
      if (filters.exercise && record.exercise !== filters.exercise) return false;

      // BMI Category
      if (filters.bmiCategory && record.bmiCategory !== filters.bmiCategory) return false;

      return true;
    });
  }, [allRecords, filters]);

  const handleImportRecords = (records: HealthRecord[], sourceLabel: string) => {
    setAllRecords(records);
    setSheetStatus({
      sheetId: TARGET_SHEET_ID,
      status: 'connected',
      lastUpdated: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      totalFetched: records.length,
      sourceType: 'custom_csv',
      errorMessage: `นำเข้าข้อมูลสำเร็จจาก ${sourceLabel}`
    });
  };

  // Quick stats for tab badges
  const highRiskCount = useMemo(() => {
    return filteredRecords.filter((r) => r.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง').length;
  }, [filteredRecords]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Header */}
      <Header
        sheetStatus={sheetStatus}
        onRefresh={loadData}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        filteredCount={filteredRecords.length}
        totalCount={allRecords.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Filter Controls (Item 1 & 5 in prompt) */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          records={allRecords}
          activeFilterCount={activeFilterCount}
          onReset={handleResetFilters}
        />

        {/* Navigation Tabs (Item 5 in prompt) */}
        <nav className="mb-6 bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {/* Tab 1: Overview & KPIs */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>ภาพรวม &amp; ตัวชี้วัดหลัก</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'overview'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {filteredRecords.length.toLocaleString('th-TH')} คน
              </span>
            </motion.button>

            {/* Tab 2: Health Risk */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('risk')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'risk'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>วิเคราะห์ความเสี่ยงสุขภาพ</span>
            </motion.button>

            {/* Tab 3: Health Behavior */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('behavior')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'behavior'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>พฤติกรรมสุขภาพ</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'behavior'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                4 ปัจจัย
              </span>
            </motion.button>

            {/* Tab 4: Health Trend */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>แนวโน้มและความสัมพันธ์</span>
            </motion.button>

            {/* Tab 5: Detail Table */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ข้อมูลเชิงลึก: ทะเบียนติดตามกลุ่มเสี่ยง</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'table'
                    ? 'bg-white/20 text-white'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {filteredRecords.length}
              </span>
            </motion.button>
          </div>
        </nav>

        {/* Tab Views with Smooth Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Tab 1: Overview & KPIs */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPI Cards (Item 2 in prompt - 6 summary types: จำนวน, ค่าเฉลี่ย, ค่าต่ำสุด, ค่าสูงสุด, สัดส่วน, ร้อยละ) */}
                <KpiSection records={filteredRecords} />
              </div>
            )}

            {/* Tab 2: Health Risk Analysis */}
            {activeTab === 'risk' && <RiskAnalysisTab records={filteredRecords} />}

            {/* Tab 3: Health Behavior Analysis */}
            {activeTab === 'behavior' && <BehaviorAnalysisTab records={filteredRecords} />}

            {/* Tab 4: Health Trend & Correlation */}
            {activeTab === 'trends' && <TrendCorrelationTab records={filteredRecords} />}

            {/* Tab 5: Detailed Data Table */}
            {activeTab === 'table' && <DetailTableTab records={filteredRecords} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sheet Synchronization Modal */}
      <SheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        status={sheetStatus}
        onRefresh={loadData}
        onImportRecords={handleImportRecords}
      />
    </div>
  );
}
