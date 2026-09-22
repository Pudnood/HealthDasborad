import { motion } from 'motion/react';
import { HealthRecord } from '../types';
import { 
  X, 
  User, 
  Heart, 
  Droplet, 
  Scale, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Cigarette, 
  Wine, 
  Dumbbell, 
  Utensils 
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: HealthRecord | null;
  onClose: () => void;
}

export function PatientDetailModal({ patient, onClose }: PatientDetailModalProps) {
  if (!patient) return null;

  const isHighRisk = patient.riskLevel === 'กลุ่มป่วย/เสี่ยงสูง';
  const isAtRisk = patient.riskLevel === 'กลุ่มเสี่ยง';

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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{patient.fullName}</h3>
                <span className="text-[10px] sm:text-xs font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                  HN: {patient.hn}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <span>เพศ: <strong>{patient.gender}</strong></span>
                <span>•</span>
                <span>อายุ: <strong>{patient.age} ปี</strong> ({patient.ageGroup})</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {patient.area}
                </span>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs text-slate-700">
          {/* Risk Level Alert Banner */}
          <div
            className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              isHighRisk
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : isAtRisk
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start sm:items-center gap-2.5">
              {isHighRisk ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : isAtRisk ? (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <div>
                <div className="font-bold text-sm">ระดับการคัดกรอง: {patient.riskLevel}</div>
                <div className="text-[11px] opacity-90 mt-0.5">{patient.notes}</div>
              </div>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded bg-white/80 border self-start sm:self-auto">
              วันที่คัดกรอง: {patient.screeningDate}
            </span>
          </div>

          {/* Clinical Vital Signs Grid */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2.5 tracking-wider text-slate-400">
              ผลตรวจสุขภาพและตัวชี้วัดทางคลินิก
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Blood Sugar */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Droplet className="w-3.5 h-3.5 text-sky-500" />
                  <span>น้ำตาลในเลือด</span>
                </div>
                <div className={`text-lg font-black ${
                  patient.fbs >= 126 ? 'text-rose-600' : patient.fbs >= 100 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {patient.fbs} <span className="text-xs font-normal text-slate-500">mg/dL</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{patient.fbsCategory}</div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>ความดันโลหิต</span>
                </div>
                <div className={`text-lg font-black ${
                  patient.sbp >= 140 ? 'text-rose-600' : patient.sbp >= 120 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {patient.sbp}/{patient.dbp} <span className="text-xs font-normal text-slate-500">mmHg</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{patient.bpCategory}</div>
              </div>

              {/* BMI */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Scale className="w-3.5 h-3.5 text-indigo-500" />
                  <span>ดัชนีมวลกาย</span>
                </div>
                <div className={`text-lg font-black ${
                  patient.bmi >= 25 ? 'text-rose-600' : patient.bmi >= 23 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {patient.bmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{patient.bmiCategory}</div>
              </div>

              {/* Waist */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Scale className="w-3.5 h-3.5 text-teal-500" />
                  <span>เส้นรอบเอว</span>
                </div>
                <div className={`text-lg font-black ${patient.isCentralObese ? 'text-rose-600' : 'text-slate-800'}`}>
                  {patient.waistCm} <span className="text-xs font-normal text-slate-500">ซม.</span>
                </div>
                <div className="text-[10px] mt-1">
                  {patient.isCentralObese ? (
                    <span className="text-rose-600 font-medium">อ้วนลงพุง</span>
                  ) : (
                    <span className="text-emerald-600">รอบเอวปกติ</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lifestyle Behaviors Grid */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2.5 tracking-wider text-slate-400">
              พฤติกรรมสุขภาพและวิถีชีวิต
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Cigarette className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-[10px] text-slate-400">บุหรี่</div>
                  <div className="font-medium text-slate-800">{patient.smoking}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Wine className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-[10px] text-slate-400">สุรา</div>
                  <div className="font-medium text-slate-800">{patient.alcohol}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-[10px] text-slate-400">ออกกำลังกาย</div>
                  <div className="font-medium text-slate-800">{patient.exercise}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-[10px] text-slate-400">อาหาร</div>
                  <div className="font-medium text-slate-800 truncate max-w-[120px]" title={patient.diet}>
                    {patient.diet}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Record Care Plan */}
          <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-3.5">
            <div className="font-semibold text-sky-900 mb-1">
              แนวทางการดูแลและบันทึกเวชระเบียน (Medical Record Intervention Plan):
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>ประวัติโรคประจำตัวเดิม: {patient.chronicDiseaseHistory}</li>
              {isHighRisk && (
                <>
                  <li className="text-rose-700 font-medium">
                    ส่งต่อพบแพทย์เฉพาะทางคลินิก NCDs / โรงพยาบาลชุมชน เพื่อวินิจฉัยและรับยารักษา
                  </li>
                  <li className="text-rose-700">
                    นัดตรวจซ้ำค่าน้ำตาลสะสม HbA1c, ค่าการทำงานของไต eGFR และตรวจภาวะแทรกซ้อนทางตา/เท้า
                  </li>
                </>
              )}
              {isAtRisk && (
                <li>
                  เข้าร่วมคลินิกปรับเปลี่ยนพฤติกรรมสุขภาพ ลดหวานมันเค็ม เพิ่มการเดินเร็ว 150 นาที/สัปดาห์
                </li>
              )}
              <li>บันทึกลงในฐานข้อมูลสารสนเทศสุขภาพ รพ.สต. เพื่อการติดตามอย่างต่อเนื่อง</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
