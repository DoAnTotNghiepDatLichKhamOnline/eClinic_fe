import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  Baby,
  Phone,
  Home,
  Plus,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import type { Lang } from "@/shared/types/i18n";
import type { AppointmentFormValues } from "../appointment.types";
import {
  APPOINTMENT_SPECIALTIES,
  APPOINTMENT_DOCTORS,
  calculateAge,
} from "../appointment.data";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAnother: () => void;
  onGoHome: () => void;
  bookingCode: string;
  formValues: AppointmentFormValues;
  lang: Lang;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  onBookAnother,
  onGoHome,
  bookingCode,
  formValues,
  lang,
}: BookingSuccessModalProps) {
  const selectedSpecialty = APPOINTMENT_SPECIALTIES.find(
    (s) => s.id === formValues.specialtyId,
  );
  const selectedDoctor = APPOINTMENT_DOCTORS.find(
    (d) => d.id === formValues.doctorId,
  );
  const isPediatric = formValues.specialtyId === "pediatrics";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBookAnother}
            className="flex items-center gap-1.5"
          >
            <Plus size={16} />
            {lang === "vi" ? "Đặt thêm lịch hẹn khác" : "Book Another"}
          </Button>
          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={onGoHome}
            className="flex items-center gap-1.5"
          >
            <Home size={16} />
            {lang === "vi" ? "Về Trang chủ" : "Return to Home"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Success Title Banner inside Body */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0f4d3a] font-display">
              {lang === "vi"
                ? "Đặt lịch khám thành công!"
                : "Appointment Confirmed!"}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "vi"
                ? "Hệ thống eClinic đã tiếp nhận và xác nhận thông tin lịch khám của quý khách."
                : "Your appointment has been registered in the eClinic system."}
            </p>
          </div>
        </div>

        {/* Ticket Header & QR */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
              {lang === "vi" ? "Mã số phiếu khám" : "Booking Reference"}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#0f4d3a] tracking-tight font-display">
              {bookingCode}
            </p>
            <p className="text-xs text-emerald-800/80">
              {lang === "vi"
                ? "Lưu mã này hoặc xuất trình mã QR tại quầy tiếp đón khi đến khám"
                : "Save this code or show QR code at reception counter"}
            </p>
          </div>

          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100 shrink-0">
            <QRCodeSVG value={bookingCode} size={92} level="M" />
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Chuyên khoa */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 uppercase text-[10px]">
              <Stethoscope size={13} className="text-[#0f4d3a]" />
              <span>{lang === "vi" ? "Chuyên khoa" : "Specialty"}</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {selectedSpecialty ? selectedSpecialty.name[lang] : "---"}
            </p>
          </div>

          {/* Bác sĩ */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 uppercase text-[10px]">
              <User size={13} className="text-emerald-700" />
              <span>{lang === "vi" ? "Bác sĩ phụ trách" : "Doctor"}</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {selectedDoctor
                ? selectedDoctor.name[lang]
                : lang === "vi"
                  ? "Bác sĩ theo ca (Hệ thống điều phối)"
                  : "Assigned on-duty doctor"}
            </p>
          </div>

          {/* Ngày khám & Khung giờ */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white sm:col-span-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 uppercase text-[10px]">
              <Calendar size={13} className="text-[#0f4d3a]" />
              <span>
                {lang === "vi" ? "Thời gian khám" : "Appointment Time"}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>{formValues.date}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#0f4d3a] flex items-center gap-1">
                <Clock size={14} />
                {formValues.slotTime}
              </span>
            </p>
          </div>

          {/* Bệnh nhân / Bệnh nhi */}
          {isPediatric ? (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between text-slate-400 font-semibold mb-1 uppercase text-[10px]">
                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                  <Baby size={13} className="text-emerald-700" />
                  {lang === "vi" ? "Bệnh nhi" : "Child Patient"}
                </span>
                {formValues.childGender && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                    {formValues.childGender === "male"
                      ? lang === "vi"
                        ? "Bé trai"
                        : "Boy"
                      : lang === "vi"
                        ? "Bé gái"
                        : "Girl"}
                  </span>
                )}
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {formValues.patientName}
              </p>
              {formValues.childDob && (
                <p className="text-slate-600 mt-1 flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  <span>{formValues.childDob}</span>
                  {calculateAge(formValues.childDob, lang) && (
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      ({calculateAge(formValues.childDob, lang)})
                    </span>
                  )}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 uppercase text-[10px]">
                <ShieldCheck size={13} className="text-emerald-700" />
                <span>{lang === "vi" ? "Người đến khám" : "Patient Name"}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {formValues.patientName}
              </p>
              <p className="text-slate-500 mt-1 flex items-center gap-1">
                <Phone size={12} /> {formValues.patientPhone}
              </p>
              <p className="text-slate-500">
                <span className="font-semibold">CCCD:</span>{" "}
                {formValues.patientCccd}
              </p>
            </div>
          )}

          {/* Người giám hộ (nếu Khoa Nhi) hoặc Lý do khám */}
          {isPediatric ? (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between text-amber-800 font-semibold mb-1 uppercase text-[10px]">
                <span className="flex items-center gap-1 font-bold">
                  <ShieldCheck size={13} className="text-amber-700" />
                  {lang === "vi" ? "Người giám hộ" : "Guardian"}
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 rounded font-medium">
                  {formValues.guardianRelationship || "Cha/Mẹ"}
                </span>
              </div>
              <p className="font-bold text-amber-950 text-sm">
                {formValues.guardianName}
              </p>
              <p className="text-amber-900 mt-1 flex items-center gap-1">
                <Phone size={12} /> {formValues.guardianPhone}
              </p>
              <p className="text-amber-900">
                <span className="font-semibold">CCCD:</span>{" "}
                {formValues.guardianCccd}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 uppercase text-[10px]">
                <span>{lang === "vi" ? "Lý do khám" : "Reason for Visit"}</span>
              </div>
              <p className="text-slate-700 line-clamp-3 italic">
                "{formValues.reason}"
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">
            {lang === "vi"
              ? "📌 Lưu ý quan trọng khi đi khám:"
              : "📌 Important instructions:"}
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
            <li>
              {lang === "vi"
                ? "Vui lòng có mặt trước giờ khám 15 phút để làm thủ tục tiếp đón."
                : "Please arrive 15 minutes before your slot to check in."}
            </li>
            <li>
              {lang === "vi"
                ? "Mang theo CCCD/VNeID bản gốc để đối soát hồ sơ bệnh án."
                : "Bring your physical Citizen ID / VNeID for identity verification."}
            </li>
            {isPediatric && (
              <li className="text-amber-800 font-medium">
                {lang === "vi"
                  ? "Bệnh nhi cần đi cùng người giám hộ và mang theo CCCD của người giám hộ."
                  : "Children must be accompanied by the guardian with their valid ID."}
              </li>
            )}
            <li>
              {lang === "vi"
                ? "Để đổi hoặc hủy lịch, vui lòng gọi Hotline eClinic: 1900-1234."
                : "To reschedule or cancel, please call eClinic Hotline: 1900-1234."}
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
