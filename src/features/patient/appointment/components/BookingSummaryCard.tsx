import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  Baby,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { Lang } from "@/types/i18n";
import type { AppointmentFormValues } from "../appointment.types";
import { calculateAge, calculateAgeInYears } from "../appointment.utils";

interface BookingSummaryCardProps {
  lang: Lang;
  formValues: AppointmentFormValues;
  specialtyName?: string;
  doctorName?: string;
  isPediatric?: boolean;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function BookingSummaryCard({
  lang,
  formValues,
  specialtyName,
  doctorName,
  isPediatric = false,
  onConfirm,
  isSubmitting = false,
}: BookingSummaryCardProps) {
  const effectiveDob = isPediatric ? formValues.childDob : formValues.patientDob;
  const ageYears = calculateAgeInYears(effectiveDob, formValues.date);
  const isMinor = isPediatric || (effectiveDob ? ageYears < 18 : false);

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-24 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-2">
          <Sparkles size={13} />
          <span>
            {lang === "vi" ? "Tóm tắt lịch hẹn" : "Appointment Summary"}
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-display">
          {lang === "vi" ? "Thông tin đặt khám" : "Booking Details"}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === "vi"
            ? "Vui lòng rà soát lại thông tin trước khi hoàn tất"
            : "Please review your selections before confirming"}
        </p>
      </div>

      <div className="space-y-4 text-sm">
        {/* Dịch vụ & Chuyên khoa */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#0f4d3a] text-white flex items-center justify-center flex-shrink-0">
            <Stethoscope size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              {lang === "vi" ? "Chuyên khoa" : "Specialty"}
            </p>
            <p className="font-bold text-slate-800">
              {specialtyName || "---"}
            </p>
          </div>
        </div>

        {/* Bác sĩ */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              {lang === "vi" ? "Bác sĩ thăm khám" : "Doctor"}
            </p>
            <p className="font-bold text-slate-800 truncate">
              {doctorName
                ? doctorName
                : lang === "vi"
                  ? "Bác sĩ bất kỳ (Phòng khám sắp xếp)"
                  : "Any available doctor"}
            </p>
          </div>
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Calendar size={13} />
              <span className="text-[11px] font-semibold uppercase">
                {lang === "vi" ? "Ngày khám" : "Date"}
              </span>
            </div>
            <p className="font-bold text-slate-800 text-xs">
              {formValues.date || "---"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Clock size={13} />
              <span className="text-[11px] font-semibold uppercase">
                {lang === "vi" ? "Khung giờ" : "Slot"}
              </span>
            </div>
            <p className="font-bold text-slate-800 text-xs">
              {formValues.slotTime || "---"}
            </p>
          </div>
        </div>

        {/* Bệnh nhân / Bệnh nhi */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[11px]">
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              {isMinor ? <Baby size={13} className="text-emerald-700" /> : <User size={13} className="text-emerald-700" />}
              {isMinor
                ? lang === "vi"
                  ? "Bệnh nhi / Người khám"
                  : "Child / Minor Patient"
                : lang === "vi"
                  ? "Người đến khám"
                  : "Patient"}
            </span>
            {formValues.patientGender && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                {formValues.patientGender === "NAM"
                  ? lang === "vi"
                    ? "Nam"
                    : "Male"
                  : formValues.patientGender === "NU"
                    ? lang === "vi"
                      ? "Nữ"
                      : "Female"
                    : lang === "vi"
                      ? "Khác"
                      : "Other"}
              </span>
            )}
          </div>
          <p className="font-bold text-slate-900 text-sm">
            {formValues.patientName || (
              <span className="text-slate-400 font-normal italic">
                {lang === "vi" ? "Chưa điền họ tên" : "Name not provided"}
              </span>
            )}
          </p>
          {effectiveDob && (
            <p className="text-slate-600 flex items-center gap-1.5 pt-0.5">
              <Calendar size={12} className="text-slate-400" />
              <span>{effectiveDob}</span>
              {calculateAge(effectiveDob, lang) && (
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  ({calculateAge(effectiveDob, lang)})
                </span>
              )}
            </p>
          )}
          {formValues.patientPhone && (
            <p className="text-slate-600 flex items-center gap-1">
              <Phone size={12} />
              {formValues.patientPhone}
            </p>
          )}
          {formValues.patientCccd && (
            <p className="text-slate-600 flex items-center gap-1">
              <span className="font-semibold">CCCD:</span>{" "}
              {formValues.patientCccd}
            </p>
          )}
        </div>

        {/* Người giám hộ nếu là Khoa Nhi hoặc < 18 tuổi */}
        {isMinor && (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-amber-800 font-semibold uppercase text-[11px]">
              <span className="flex items-center gap-1 font-bold">
                <ShieldCheck size={13} className="text-amber-700" />
                {lang === "vi" ? "Người giám hộ" : "Guardian"}
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 rounded font-medium">
                {formValues.guardianRelationship === "CHA"
                  ? lang === "vi"
                    ? "Cha"
                    : "Father"
                  : formValues.guardianRelationship === "ME"
                    ? lang === "vi"
                      ? "Mẹ"
                      : "Mother"
                    : formValues.guardianRelationship === "NGUOI_GIAM_HO_HOP_PHAP"
                      ? lang === "vi"
                        ? "Giám hộ hợp pháp"
                        : "Legal Guardian"
                      : lang === "vi"
                        ? "Khác"
                        : "Other"}
              </span>
            </div>
            <p className="font-bold text-amber-950 text-sm">
              {formValues.guardianName || (
                <span className="text-amber-600/70 font-normal italic">
                  {lang === "vi"
                    ? "Chưa điền họ tên người giám hộ"
                    : "Guardian not provided"}
                </span>
              )}
            </p>
            {formValues.guardianPhone && (
              <p className="text-amber-900 flex items-center gap-1">
                <Phone size={12} />
                {formValues.guardianPhone}
              </p>
            )}
            {formValues.guardianCccd && (
              <p className="text-amber-900 flex items-center gap-1">
                <span className="font-semibold">CCCD:</span>{" "}
                {formValues.guardianCccd}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="accent"
          size="lg"
          className="w-full flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          <span>
            {isSubmitting
              ? lang === "vi"
                ? "Đang xử lý..."
                : "Processing..."
              : lang === "vi"
                ? "Xác nhận đặt lịch khám"
                : "Confirm Booking"}
          </span>
          {!isSubmitting && <ArrowRight size={18} />}
        </Button>

        <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-normal">
          {lang === "vi"
            ? "Bằng việc xác nhận, bạn đồng ý với Quy chế hoạt động & Chính sách bảo mật y tế eClinic."
            : "By confirming, you agree to eClinic terms and healthcare privacy policy."}
        </p>
      </div>
    </aside>
  );
}
