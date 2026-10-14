import {
  CheckCircle2,
  Calendar,
  CalendarDays,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  Baby,
  Phone,
  Home,
  Plus,
  MapPin,
  Hash,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import type { Lang } from "@/types/i18n";
import type { AppointmentFormValues } from "../appointment.types";
import type { DatLichResponse } from "@/types/booking.type";
import { calculateAge, calculateAgeInYears } from "../appointment.utils";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAnother: () => void;
  onFinish: () => void;
  isPatientBooking: boolean;
  bookingCode: string;
  bookingResult?: DatLichResponse | null;
  specialtyName?: string;
  doctorName?: string;
  formValues: AppointmentFormValues;
  lang: Lang;
  isPediatric?: boolean;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  onBookAnother,
  onFinish,
  isPatientBooking,
  bookingCode,
  bookingResult,
  specialtyName,
  doctorName,
  formValues,
  lang,
  isPediatric = false,
}: BookingSuccessModalProps) {
  const effectiveDob = isPediatric ? formValues.childDob : formValues.patientDob;
  const ageYears = calculateAgeInYears(effectiveDob, formValues.date);
  const isMinor = isPediatric || (effectiveDob ? ageYears < 18 : false);

  const qrValue =
    bookingResult?.linkPhieuKham ||
    bookingResult?.maPhieuKham ||
    bookingCode ||
    "ECLINIC";

  const displayCode =
    bookingResult?.maTraCuu || bookingResult?.maPhieuKham || bookingCode;

  const doctorDisplay =
    bookingResult?.bacSi?.hoTen
      ? `${bookingResult.bacSi.hocVi ? bookingResult.bacSi.hocVi + " " : ""}${bookingResult.bacSi.hoTen}`
      : doctorName ||
        (lang === "vi"
          ? "Bác sĩ theo ca trực (Phòng khám xếp)"
          : "On-duty assigned doctor");

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
            onClick={onFinish}
            className="flex items-center gap-1.5"
          >
            {isPatientBooking ? <CalendarDays size={16} /> : <Home size={16} />}
            {isPatientBooking
              ? lang === "vi"
                ? "Xem lịch khám của tôi"
                : "View My Appointments"
              : lang === "vi"
                ? "Về Trang chủ"
                : "Return to Home"}
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
                ? "Hệ thống eClinic đã ghi nhận và tiếp nhận phiếu đăng ký khám bệnh của bạn."
                : "Your appointment has been registered in the eClinic system."}
            </p>
          </div>
        </div>

        {/* Ticket Header & QR */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                {lang === "vi" ? "Mã tra cứu / Phiếu khám" : "Booking Reference"}
              </span>
              {bookingResult?.soThuTu ? (
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-white bg-[#0f4d3a] px-2 py-0.5 rounded flex items-center gap-1">
                  <Hash size={11} />
                  <span>
                    {lang === "vi" ? "STT:" : "No:"} {bookingResult.soThuTu}
                  </span>
                </span>
              ) : null}
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#0f4d3a] tracking-tight font-display">
              {displayCode}
            </p>
            <p className="text-xs text-emerald-800/80">
              {lang === "vi"
                ? "Xuất trình mã này hoặc quét mã QR tại quầy tiếp đón khi đến khám"
                : "Show this code or present the QR code at the reception counter"}
            </p>
            {bookingResult?.maPhieuKham && (
              <Link
                className="mt-2 inline-block text-xs font-bold text-emerald-900 underline"
                to={`/phieu-kham/${bookingResult.maPhieuKham}`}
              >
                {lang === "vi" ? "Mở phiếu khám" : "Open appointment ticket"}
              </Link>
            )}
          </div>

          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-emerald-100 shrink-0">
            <QRCodeSVG value={qrValue} size={92} level="M" />
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
              {specialtyName || "---"}
            </p>
          </div>

          {/* Bác sĩ */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 uppercase text-[10px]">
              <User size={13} className="text-emerald-700" />
              <span>{lang === "vi" ? "Bác sĩ phụ trách" : "Doctor"}</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {doctorDisplay}
            </p>
          </div>

          {/* Ngày khám & Khung giờ */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white sm:col-span-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1 uppercase text-[10px]">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#0f4d3a]" />
                <span>
                  {lang === "vi" ? "Thời gian khám" : "Appointment Time"}
                </span>
              </div>
              {bookingResult?.phongKham && (
                <div className="flex items-center gap-1 text-emerald-800 font-bold">
                  <MapPin size={12} />
                  <span>
                    {bookingResult.phongKham.tenPhong}
                    {bookingResult.phongKham.tang ? ` - Tầng ${bookingResult.phongKham.tang}` : ""}
                  </span>
                </div>
              )}
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

          {/* Bệnh nhân */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1 uppercase text-[10px]">
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                {isMinor ? <Baby size={13} className="text-emerald-700" /> : <ShieldCheck size={13} className="text-emerald-700" />}
                {isMinor
                  ? lang === "vi"
                    ? "Bệnh nhi / Người khám"
                    : "Patient (Minor)"
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
              {formValues.patientName}
            </p>
            {effectiveDob && (
              <p className="text-slate-600 mt-1 flex items-center gap-1.5">
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
              <p className="text-slate-500 mt-1 flex items-center gap-1">
                <Phone size={12} /> {formValues.patientPhone}
              </p>
            )}
          </div>

          {/* Người giám hộ hoặc Lý do khám */}
          {isMinor ? (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between text-amber-800 font-semibold mb-1 uppercase text-[10px]">
                <span className="flex items-center gap-1 font-bold">
                  <ShieldCheck size={13} className="text-amber-700" />
                  {lang === "vi" ? "Người giám hộ" : "Guardian"}
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 rounded font-medium">
                  {formValues.guardianRelationship === "CHA"
                    ? "Cha"
                    : formValues.guardianRelationship === "ME"
                      ? "Mẹ"
                      : formValues.guardianRelationship || "Giám hộ"}
                </span>
              </div>
              <p className="font-bold text-amber-950 text-sm">
                {formValues.guardianName}
              </p>
              {formValues.guardianPhone && (
                <p className="text-amber-900 mt-1 flex items-center gap-1">
                  <Phone size={12} /> {formValues.guardianPhone}
                </p>
              )}
              {formValues.guardianCccd && (
                <p className="text-amber-900">
                  <span className="font-semibold">CCCD:</span>{" "}
                  {formValues.guardianCccd}
                </p>
              )}
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
                ? "Vui lòng có mặt trước giờ khám 15 phút để làm thủ tục tiếp đón tại quầy."
                : "Please arrive 15 minutes before your slot to check in."}
            </li>
            <li>
              {lang === "vi"
                ? "Mang theo CCCD/VNeID bản gốc để đối soát hồ sơ bệnh án."
                : "Bring your physical Citizen ID / VNeID for verification."}
            </li>
            {isMinor && (
              <li className="text-amber-800 font-medium">
                {lang === "vi"
                  ? "Bệnh nhi cần đi cùng người giám hộ và mang theo CCCD của người giám hộ."
                  : "Children must be accompanied by the guardian with their valid ID."}
              </li>
            )}
            <li>
              {lang === "vi"
                ? "Khách vãng lai có thể dùng mã phiếu khám để tra cứu hoặc liên hệ Hotline eClinic: 1900-1234."
                : "Guest patients can use the reference code to look up appointment or call 1900-1234."}
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
