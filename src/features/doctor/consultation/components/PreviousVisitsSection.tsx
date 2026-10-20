import { Clock, History, Stethoscope } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { LanKhamTruocItem } from "@/types/consultation.type";

interface PreviousVisitsSectionProps {
  previousVisits: LanKhamTruocItem[];
  onOpenHistory: (idLichHen: number) => void;
}

export function PreviousVisitsSection({
  previousVisits,
  onOpenHistory,
}: PreviousVisitsSectionProps) {
  const { lang } = useLanguage();

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            {lang === "vi" ? "Các lần khám trước" : "Previous Visits History"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "vi"
              ? "Lịch sử khám bệnh và điều trị trước đây của bệnh nhân tại phòng khám"
              : "Patient's medical history from prior consultations at the clinic"}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          {previousVisits.length} {lang === "vi" ? "lượt khám" : "visits"}
        </span>
      </div>

      {previousVisits.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <Stethoscope className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-medium text-slate-600">
            {lang === "vi"
              ? "Bệnh nhân chưa có lần khám nào trước lượt này."
              : "Patient has no recorded visits prior to this one."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {previousVisits.map((visit) => {
            const kq = visit.ketQua;
            return (
              <div
                key={visit.idLichHen}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">
                      {visit.gioKhamDuKien?.slice(0, 16) || visit.gioKhamDuKien}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-600">
                      {lang === "vi" ? "BS. " : "Dr. "}
                      <strong>{visit.bacSi.hoTen}</strong> ({visit.tenChuyenKhoa})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      {visit.maTraCuu}
                    </span>
                    {kq && kq.ngaySuaCuoi && (
                      <button
                        type="button"
                        onClick={() => onOpenHistory(visit.idLichHen)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition"
                      >
                        <History className="w-3 h-3" />
                        {lang === "vi" ? "Đã sửa (xem lịch sử)" : "Edited history"}
                      </button>
                    )}
                  </div>
                </div>

                {visit.lyDoKham && (
                  <p className="text-xs text-slate-600 mb-2">
                    <strong>{lang === "vi" ? "Lý do khám: " : "Reason: "}</strong>
                    {visit.lyDoKham}
                  </p>
                )}

                {kq ? (
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">
                        {lang === "vi" ? "Chẩn đoán: " : "Diagnosis: "}
                      </span>
                      <span className="font-semibold text-teal-800">
                        {kq.chanDoan}
                      </span>
                      {kq.icdChinh && (
                        <span className="ml-1.5 font-mono text-[11px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {kq.icdChinh.ma}
                        </span>
                      )}
                    </div>

                    {kq.khamLamSang && (
                      <div>
                        <span className="font-bold text-slate-700">
                          {lang === "vi" ? "Khám lâm sàng: " : "Clinical: "}
                        </span>
                        <span className="text-slate-600">{kq.khamLamSang}</span>
                      </div>
                    )}

                    {kq.donThuoc && kq.donThuoc.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">
                          {lang === "vi" ? "Đơn thuốc: " : "Prescription: "}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {kq.donThuoc.map((med, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 font-medium"
                            >
                              <strong>{med.tenThuoc}</strong>
                              {med.lieuDung && ` - ${med.lieuDung}`}
                              {med.soLuong && ` (${med.soLuong} ${med.donVi || "Viên"})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {kq.ghiChu && (
                      <div>
                        <span className="font-bold text-slate-700">
                          {lang === "vi" ? "Lời dặn: " : "Instructions: "}
                        </span>
                        <span className="text-slate-600">{kq.ghiChu}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {lang === "vi"
                      ? "Chưa có kết quả khám ghi nhận cho lượt này."
                      : "No consultation result recorded."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
