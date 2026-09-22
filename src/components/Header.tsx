import { Activity, RefreshCw, UserCheck, Calendar } from 'lucide-react';
import { SheetSourceStatus } from '../types';

interface HeaderProps {
  sheetStatus: SheetSourceStatus;
  onRefresh: () => void;
  onOpenSyncModal: () => void;
  filteredCount: number;
  totalCount: number;
}

export function Header({
  sheetStatus,
  onRefresh,
  onOpenSyncModal,
  filteredCount,
  totalCount
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      {/* Top Notification / Attribution Bar */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 text-white px-3 sm:px-6 py-1.5 sm:py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-end">
          {/* Creator Badge - Specified by user */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md border border-white/15 text-[11px] sm:text-xs">
            <UserCheck className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="text-slate-100 font-normal leading-tight">
              ผู้จัดทำ:{' '}
              <strong className="text-white font-semibold">
                น.ส คุณานันต์ พูลสวัสดิ์ วท.บ.เวชระเบียน 66208306010
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          {/* Dashboard Title & Description */}
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0 mt-0.5">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Dashboardรายงานการคัดกรองสุขภาพ
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 max-w-3xl leading-relaxed">
                การวิเคราะห์เชิงลึกระดับความเสี่ยงสุขภาพ ดัชนีมวลกาย ความดันโลหิต น้ำตาลในเลือด และพฤติกรรมเสี่ยง 
                เพื่อการวางแผนส่งเสริมสุขภาพและการดูแลรายบุคคลตามมาตรฐานเวชระเบียน
              </p>
            </div>
          </div>

          {/* Right Meta Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            {/* Last Updated Timestamp */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                อัปเดต:{' '}
                <span className="font-semibold text-slate-800">{sheetStatus.lastUpdated}</span>
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={sheetStatus.status === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[32px]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${sheetStatus.status === 'loading' ? 'animate-spin' : ''}`}
              />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
