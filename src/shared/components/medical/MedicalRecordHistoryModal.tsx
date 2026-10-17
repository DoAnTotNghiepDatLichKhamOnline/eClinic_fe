import { useQuery } from "@tanstack/react-query";
import { History, X, Clock, User, AlertCircle, Check } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { doctorBookingService, adminBookingService } from "@/services/booking";
import type { LanSuaBenhAn, SinhHieu, DonThuoc } from "@/types/booking.type";

interface MedicalRecordHistoryModalProps {
  idLichHen: number | null;
  role: "doctor" | "admin";
  onClose: () => void;
}

const FIELD_LABELS: Record<string, { vi: string; en: string }> = {
  LY_DO_KHAM: { vi: "Lý do khám", en: "Visit Reason" },
  SINH_HIEU: { vi: "Sinh hiệu", en: "Vital Signs" },
  KHAM_LAM_SANG: { vi: "Khám lâm sàng", en: "Clinical Notes" },
  CHAN_DOAN: { vi: "Chẩn đoán chính & ICD-10", en: "Primary Diagnosis & ICD-10" },
  CHAN_DOAN_KEM_THEO: { vi: "Chẩn đoán kèm theo", en: "Secondary Diagnosis" },
  GHI_CHU: { vi: "Lời dặn / Ghi chú", en: "Doctor's Advice" },
  NGAY_TAI_KHAM: { vi: "Ngày tái khám", en: "Follow-up Date" },
  DON_THUOC: { vi: "Đơn thuốc", en: "Prescription" },
};

export function MedicalRecordHistoryModal({
  idLichHen,
  role,
  onClose,
}: MedicalRecordHistoryModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["medical-record-history", role, idLichHen],
    queryFn: () => {
      if (!idLichHen) return null;
      return role === "doctor"
        ? doctorBookingService.getLichSuSuaBenhAnBacSi(idLichHen)
        : adminBookingService.getLichSuSuaBenhAnQuanTri(idLichHen);
    },
    enabled: Boolean(idLichHen),
  });

  if (!idLichHen) return null;

  const history = response?.duLieu;

  const renderVitals = (v?: SinhHieu | null) => {
    if (!v) return <span className="text-slate-400 italic">{vi ? "Không ghi nhận" : "None recorded"}</span>;
    const parts: string[] = [];
    if (v.mach) parts.push(`${vi ? "Mạch" : "Pulse"}: ${v.mach} bpm`);
    if (v.nhietDo) parts.push(`${vi ? "Nhiệt độ" : "Temp"}: ${v.nhietDo}°C`);
    if (v.huyetApTamThu && v.huyetApTamTruong) {
      parts.push(`${vi ? "Huyết áp" : "BP"}: ${v.huyetApTamThu}/${v.huyetApTamTruong} mmHg`);
    }
    if (v.nhipTho) parts.push(`${vi ? "Nhịp thở" : "Resp"}: ${v.nhipTho}/m`);
    if (v.canNang) parts.push(`${vi ? "Cân nặng" : "Weight"}: ${v.canNang} kg`);
    if (v.chieuCao) parts.push(`${vi ? "Chiều cao" : "Height"}: ${v.chieuCao} cm`);
    return parts.length > 0 ? parts.join(" · ") : <span className="text-slate-400 italic">{vi ? "Không ghi nhận" : "None recorded"}</span>;
  };

  const renderMedicineList = (medicines?: DonThuoc[]) => {
    if (!medicines || medicines.length === 0) {
      return <span className="text-slate-400 italic">{vi ? "Không kê đơn" : "No prescription"}</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1 text-xs">
        {medicines.map((m, idx) => (
          <li key={idx}>
            <span className="font-semibold text-slate-800">{m.tenThuoc}</span>
            {m.hamLuong && <span className="text-slate-500"> ({m.hamLuong})</span>}
            <span className="text-slate-600"> — {m.soLuong} {m.donVi ?? ""} ({m.lieuDung ?? ""}, {m.soNgayDung} {vi ? "ngày" : "days"})</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[150] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={vi ? "Lịch sử sửa bệnh án" : "Medical Record Edit History"}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {vi ? "Lịch sử chỉnh sửa bệnh án" : "Medical Record Edit History"}
              </h2>
              {history && (
                <p className="text-xs text-slate-500">
                  {vi ? "Mã tra cứu" : "Lookup Code"}: <span className="font-semibold text-slate-700">{history.maTraCuu}</span> · {vi ? "Phiên bản hiện tại" : "Current version"}: v{history.phienBanHienTai}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              <p className="text-xs">{vi ? "Đang tải lịch sử sửa..." : "Loading edit history..."}</p>
            </div>
          ) : isError || !history ? (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle size={18} className="shrink-0 text-amber-600" />
              <p>{vi ? "Không thể tải lịch sử chỉnh sửa bệnh án hoặc hồ sơ chưa từng bị sửa." : "Could not load edit history or record has not been modified."}</p>
            </div>
          ) : history.cacLanSua.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
              <Check className="mb-2 h-10 w-10 text-teal-500 bg-teal-50 p-2 rounded-full" />
              <p className="font-medium text-slate-800">{vi ? "Bệnh án nguyên bản" : "Original Record"}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {vi
                  ? "Bệnh án này chưa có lần chỉnh sửa nào kể từ lần lưu đầu tiên."
                  : "This medical record has not undergone any edits since its initial creation."}
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-teal-100 pl-6 ml-3 space-y-6">
              {history.cacLanSua.map((lan: LanSuaBenhAn) => (
                <div key={lan.phienBan} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white ring-4 ring-white text-[9px] font-bold">
                    {lan.phienBan}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition">
                    {/* Header of revision */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
                          v{lan.phienBan}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <User size={12} className="text-slate-400" />
                          <strong className="text-slate-800">{lan.bacSi?.hoTen ?? (vi ? "Bác sĩ" : "Doctor")}</strong>
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {lan.ngaySua ? new Date(lan.ngaySua).toLocaleString(vi ? "vi-VN" : "en-US") : ""}
                      </span>
                    </div>

                    {/* Reason for edit */}
                    <div className="mt-3 rounded-lg bg-amber-50/80 p-2.5 text-xs text-amber-900 border border-amber-200/50">
                      <strong>{vi ? "Lý do sửa:" : "Reason for edit:"}</strong> {lan.lyDo || (vi ? "Không ghi rõ" : "Not specified")}
                    </div>

                    {/* Changed fields tags */}
                    {lan.cacTruongDoi && lan.cacTruongDoi.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">{vi ? "Các trường đã đổi:" : "Changed fields:"}</span>
                        {lan.cacTruongDoi.map((field) => (
                          <span
                            key={field}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {FIELD_LABELS[field]?.[vi ? "vi" : "en"] ?? field}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Before vs After Detailed Diff Table */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                      {/* Before */}
                      <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/70">
                        <div className="mb-2 font-bold text-rose-700 flex items-center gap-1">
                          <span>{vi ? "Trước khi sửa" : "Before Edit"}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-500 block text-[11px]">{vi ? "Chẩn đoán:" : "Diagnosis:"}</span>
                            <span className="font-medium text-slate-800">{lan.truoc?.chanDoan || "—"}</span>
                            {lan.truoc?.maIcdChinh && (
                              <span className="ml-1 text-[11px] text-teal-700 font-mono">[{lan.truoc.maIcdChinh}]</span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">{vi ? "Sinh hiệu:" : "Vitals:"}</span>
                            <div className="text-[11px] text-slate-700">{renderVitals(lan.truoc?.sinhHieu)}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">{vi ? "Đơn thuốc:" : "Prescription:"}</span>
                            {renderMedicineList(lan.truoc?.donThuoc)}
                          </div>
                        </div>
                      </div>

                      {/* After */}
                      <div className="rounded-lg bg-emerald-50/50 p-3 border border-emerald-200/70">
                        <div className="mb-2 font-bold text-emerald-800 flex items-center gap-1">
                          <span>{vi ? "Sau khi sửa" : "After Edit"}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-500 block text-[11px]">{vi ? "Chẩn đoán:" : "Diagnosis:"}</span>
                            <span className="font-medium text-slate-800">{lan.sau?.chanDoan || "—"}</span>
                            {lan.sau?.maIcdChinh && (
                              <span className="ml-1 text-[11px] text-teal-700 font-mono">[{lan.sau.maIcdChinh}]</span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">{vi ? "Sinh hiệu:" : "Vitals:"}</span>
                            <div className="text-[11px] text-slate-700">{renderVitals(lan.sau?.sinhHieu)}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">{vi ? "Đơn thuốc:" : "Prescription:"}</span>
                            {renderMedicineList(lan.sau?.donThuoc)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700 transition"
          >
            {vi ? "Đóng" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
