import { useEffect } from "react";
import { X, History, FileText } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { LichSuSuaBenhAnResponse } from "@/types/consultation.type";

interface MedicalRecordHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: LichSuSuaBenhAnResponse;
  isLoading: boolean;
}

const TRUONG_THAY_DOI_LABELS: Record<string, { vi: string; en: string }> = {
  LY_DO_KHAM: { vi: "Lý do khám", en: "Reason for visit" },
  SINH_HIEU: { vi: "Chỉ số sinh hiệu", en: "Vital signs" },
  KHAM_LAM_SANG: { vi: "Khám lâm sàng", en: "Clinical exam" },
  CHAN_DOAN: { vi: "Chẩn đoán chính / ICD-10", en: "Diagnosis / ICD-10" },
  CHAN_DOAN_KEM_THEO: { vi: "Chẩn đoán kèm theo", en: "Secondary diagnosis" },
  GHI_CHU: { vi: "Lời dặn bác sĩ", en: "Doctor's advice" },
  NGAY_TAI_KHAM: { vi: "Ngày hẹn tái khám", en: "Follow-up date" },
  DON_THUOC: { vi: "Đơn thuốc", en: "Prescription" },
};

export function MedicalRecordHistoryModal({
  isOpen,
  onClose,
  data,
  isLoading,
}: MedicalRecordHistoryModalProps) {
  const { lang } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {lang === "vi"
                  ? "Lịch sử chỉnh sửa bệnh án (Audit Log)"
                  : "Medical Record Audit Trail"}
              </h2>
              {data && (
                <p className="text-xs text-slate-500 font-mono">
                  {data.maTraCuu} · {lang === "vi" ? "Phiên bản hiện tại: " : "Current version: "}
                  <strong>v{data.phienBanHienTai}</strong>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent mb-2" />
              <p className="text-xs">
                {lang === "vi"
                  ? "Đang tải lịch sử chỉnh sửa..."
                  : "Loading audit history..."}
              </p>
            </div>
          ) : !data || data.cacLanSua.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-600">
                {lang === "vi"
                  ? "Hồ sơ bệnh án này chưa có lần chỉnh sửa nào."
                  : "No edits recorded for this medical record."}
              </p>
            </div>
          ) : (
            data.cacLanSua.map((lan) => (
              <div
                key={lan.phienBan}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800">
                      Phiên bản v{lan.phienBan}
                    </span>
                    <span className="text-xs text-slate-600">
                      {lan.ngaySua} · BS: <strong>{lan.bacSi.hoTen}</strong>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">
                      {lang === "vi" ? "Lý do sửa: " : "Reason: "}
                    </span>
                    <span className="text-slate-800 italic">"{lan.lyDo}"</span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-1">
                      {lang === "vi" ? "Các trường thay đổi: " : "Fields changed: "}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {lan.cacTruongDoi.map((t) => {
                        const meta = TRUONG_THAY_DOI_LABELS[t] || {
                          vi: t,
                          en: t,
                        };
                        return (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            {lang === "vi" ? meta.vi : meta.en}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            {lang === "vi" ? "Đóng" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
