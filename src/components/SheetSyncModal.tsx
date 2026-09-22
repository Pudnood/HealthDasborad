import { useState } from 'react';
import { motion } from 'motion/react';
import { SheetSourceStatus, HealthRecord } from '../types';
import { 
  X, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileText, 
  Key, 
  ExternalLink 
} from 'lucide-react';
import { parseCsvText } from '../services/googleSheetService';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SheetSourceStatus;
  onRefresh: () => void;
  onImportRecords: (records: HealthRecord[], sourceLabel: string) => void;
}

export function SheetSyncModal({
  isOpen,
  onClose,
  status,
  onRefresh,
  onImportRecords
}: SheetSyncModalProps) {
  const [customCsv, setCustomCsv] = useState<string>('');
  const [csvError, setCsvError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCsvText(text);
        if (parsed.length > 0) {
          onImportRecords(parsed, `ไฟล์ CSV: ${file.name}`);
          setCsvError('');
          onClose();
        } else {
          setCsvError('ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV');
        }
      } catch (err) {
        setCsvError('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCsvText = () => {
    if (!customCsv.trim()) return;
    try {
      const parsed = parseCsvText(customCsv);
      if (parsed.length > 0) {
        onImportRecords(parsed, 'ข้อมูล CSV ที่วางด้วยตนเอง');
        setCsvError('');
        onClose();
      } else {
        setCsvError('ไม่สามารถแปลงข้อมูล CSV ได้ กรุณาตรวจสอบหัวตาราง');
      }
    } catch (err) {
      setCsvError('รูปแบบข้อมูลไม่ถูกต้อง');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">
                การเชื่อมต่อ Google Sheets & แหล่งข้อมูล
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Google Sheet ID: {status.sheetId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs text-slate-700">
          {/* Active Status Banner */}
          <div
            className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-2.5 sm:gap-3 ${
              status.status === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}
          >
            {status.status === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {status.status === 'connected'
                  ? 'ดึงข้อมูลสดจาก Google Sheet สำเร็จ'
                  : 'กำลังใช้งานชุดข้อมูลมาตรฐานเวชระเบียน (Standard Dataset)'}
              </div>
              <div className="text-[11px] opacity-90 mt-1 leading-relaxed">
                {status.errorMessage ||
                  'ชุดข้อมูลถูกแมปโครงสร้างและฟิลด์ตรงตามมาตรฐานเวชระเบียนคัดกรอง NCDs 100%'}
              </div>
            </div>
          </div>

          {/* Target Sheet Details */}
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs">
              <span className="text-slate-500">Target Google Sheet ID:</span>
              <span className="font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] truncate max-w-full sm:max-w-[320px]">
                {status.sheetId}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">จำนวนระเบียนข้อมูล:</span>
              <strong className="text-slate-800">{status.totalFetched} รายการ</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">เวลาซิงค์ล่าสุด:</span>
              <span className="text-slate-700">{status.lastUpdated}</span>
            </div>
          </div>

          {/* Quick Guide to enable direct live sync in Google Drive */}
          <div className="border border-sky-100 bg-sky-50/50 p-3.5 rounded-xl space-y-2">
            <div className="font-bold text-sky-900 flex items-center gap-1.5">
              <span>💡 วิธีเปิดสิทธิ์การอ่านสดจาก Google Sheet (หากต้องการ):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>เปิดเอกสาร Google Sheet ของคุณ</li>
              <li>คลิกปุ่ม <strong>"แชร์" (Share)</strong> มุมขวาบน</li>
              <li>ในส่วนการเข้าถึงทั่วไป ให้เปลี่ยนเป็น <strong>"ทุกคนที่มีลิงก์มีสิทธิ์ดู" (Anyone with link can view)</strong></li>
              <li>คลิกปุ่ม <strong>"ตรวจสอบการเชื่อมต่อใหม่"</strong> ด้านล่างนี้</li>
            </ol>
            <div className="pt-2">
              <button
                onClick={onRefresh}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ตรวจสอบและดึงข้อมูลจาก Google Sheet ใหม่</span>
              </button>
            </div>
          </div>

          {/* Optional: Upload CSV from Sheet */}
          <div className="pt-2 border-t border-slate-200 space-y-2.5">
            <div className="font-bold text-slate-800 text-xs">
              ทางเลือกเสริม: นำเข้าไฟล์ CSV จาก Google Sheet โดยตรง
            </div>
            <p className="text-[11px] text-slate-500">
              ดาวน์โหลดจาก Google Sheet (ไฟล์ &gt; ดาวน์โหลด &gt; ค่าที่คั่นด้วยจุลภาค .csv) แล้วอัปโหลดที่นี่
            </p>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/40 p-4 rounded-xl cursor-pointer transition-colors text-center">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs text-slate-600 font-medium">
                คลิกเพื่อเลือกไฟล์ CSV หรือลากไฟล์มาวาง
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {csvError && (
              <div className="text-rose-600 text-[11px] font-medium">{csvError}</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
