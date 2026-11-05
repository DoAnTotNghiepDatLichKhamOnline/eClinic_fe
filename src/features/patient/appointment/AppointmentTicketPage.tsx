import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  QrCode,
  X,
  LogIn,
  Star,
  UserPlus,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { patientBookingService } from "@/services/booking";
import type { DatLichResponse, PhieuKhamResponse } from "@/types/booking.type";
import {
  formatDateTimeWithWeekday,
  formatTimeAndDate,
} from "@/utils/dateFormatting";
import { RescheduleAppointmentModal } from "./components/RescheduleAppointmentModal";

export function AppointmentTicketPage() {
  const { maPhieuKham = "" } = useParams();
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const vi = lang === "vi";
  const [ticket, setTicket] = useState<PhieuKhamResponse | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"cancel" | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [calendarError, setCalendarError] = useState("");

  // Gửi lại link phiếu khám qua email
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendMaTraCuu, setResendMaTraCuu] = useState("");
  const [resendPhone, setResendPhone] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  const isPatientAccount = user?.role === "patient";

  const loadTicket = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await patientBookingService.traCuuPhieuKham(maPhieuKham);
      if (!response.thanhCong || !response.duLieu)
        throw new Error(response.thongDiep);
      setTicket(response.duLieu);
    } catch (cause) {
      setError(
        (cause as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (cause instanceof Error ? cause.message : "Ticket not found"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTicket();
  }, [maPhieuKham]);

  useEffect(() => {
    let url = "";
    let cancelled = false;
    setQrUrl("");
    setQrError("");
    void patientBookingService
      .getQrPhieuKham(maPhieuKham)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setQrUrl(url);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        const message = isAxiosError<{ thongDiep?: string }>(cause)
          ? cause.response?.data?.thongDiep
          : undefined;
        setQrError(
          message ||
            (cause instanceof Error
              ? cause.message
              : t({
                  en: "Could not load the appointment QR code.",
                  vi: "Không thể tải mã QR phiếu khám.",
                })),
        );
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [maPhieuKham, t]);

  const submitAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode !== "cancel") return;
    setBusy(true);
    setError("");
    try {
      const response =
        isPatientAccount
          ? await patientBookingService.huyLichHen(maPhieuKham, {
              lyDo: reason || undefined,
            })
          : await patientBookingService.huyPhieuKhamKhach(maPhieuKham, {
              soDienThoai: phone,
              lyDo: reason || undefined,
            });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await loadTicket();
      setMode(null);
    } catch (cause) {
      setError(
        (cause as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (cause instanceof Error ? cause.message : "Request failed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadIcs = async () => {
    if (!ticket) return;
    setCalendarError("");
    try {
      const blob = await patientBookingService.taiFileLichIcs(ticket.maPhieuKham);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lich-kham-${ticket.maPhieuKham}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (cause) {
      setCalendarError(
        (cause as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (cause instanceof Error
            ? cause.message
            : vi
              ? "Không thể tải tệp lịch."
              : "Could not download the calendar file."),
      );
    }
  };

  const handleResendLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resendMaTraCuu || !resendPhone) return;
    setResendBusy(true);
    setResendError("");
    setResendSuccess("");
    try {
      const res = await patientBookingService.capLaiLienKet({
        maTraCuu: resendMaTraCuu.trim(),
        soDienThoai: resendPhone,
      });
      if (!res.thanhCong) throw new Error(res.thongDiep);
      setResendSuccess(
        vi
          ? "Nếu thông tin khớp, liên kết phiếu khám sẽ được gửi đến email đã dùng khi đặt lịch."
          : "If the information matches, the appointment link will be sent to the email used when booking.",
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ||
        (err instanceof Error
          ? err.message
          : vi
            ? "Không thể gửi lại liên kết. Vui lòng kiểm tra mã tra cứu và số điện thoại."
            : "Failed to resend link. Please check the lookup code and phone number.");
      setResendError(msg);
    } finally {
      setResendBusy(false);
    }
  };

  const handleRescheduled = (result: DatLichResponse) => {
    setIsRescheduleOpen(false);
    setTicket(null);
    setLoading(true);
    navigate(`/phieu-kham/${encodeURIComponent(result.maPhieuKham)}`, {
      replace: true,
    });
    message.success(
      t({
        en: "Appointment rescheduled successfully.",
        vi: "Đổi lịch khám thành công!",
      }),
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DA_XAC_NHAN":
        return {
          dot: "🟢",
          text: vi ? "Đã xác nhận" : "Confirmed",
          cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      case "DA_HOAN_THANH":
        return {
          dot: "🔵",
          text: vi ? "Đã hoàn thành" : "Completed",
          cls: "text-blue-700 bg-blue-50 border-blue-200",
        };
      case "BI_TU_CHOI":
        return {
          dot: "🔴",
          text: vi ? "Bác sĩ đã hủy" : "Cancelled by doctor",
          cls: "text-rose-700 bg-rose-50 border-rose-200",
        };
      case "DA_HUY":
      case "DA_HUY_DO_DOI_LICH":
        return {
          dot: "🔴",
          text: vi ? "Đã hủy" : "Cancelled",
          cls: "text-rose-700 bg-rose-50 border-rose-200",
        };
      case "KHONG_DEN":
        return {
          dot: "⚪",
          text: vi ? "Không đến" : "No-show",
          cls: "text-amber-700 bg-amber-50 border-amber-200",
        };
      default:
        return {
          dot: "🟡",
          text: status.replaceAll("_", " "),
          cls: "text-slate-700 bg-slate-50 border-slate-200",
        };
    }
  };

  if (loading)
    return (
      <main className="mx-auto max-w-lg px-5 py-20 text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-800" />
        <p className="text-sm font-medium text-slate-600">
          {t({ en: "Loading ticket...", vi: "Đang tải phiếu khám..." })}
        </p>
      </main>
    );

  if (!ticket)
    return (
      <main className="mx-auto max-w-lg px-5 py-20 text-center">
        <p role="alert" className="mb-4 font-semibold text-rose-700">
          {error || (vi ? "Không tìm thấy phiếu khám." : "Ticket not found.")}
        </p>
        <Link
          to="/my-appointments"
          className="mb-3 inline-flex rounded-xl border border-emerald-800 px-5 py-2.5 text-sm font-bold text-emerald-900 hover:bg-emerald-50"
        >
          {t({ en: "Look up another appointment", vi: "Tra cứu lịch khám khác" })}
        </Link>
        <br />
        <Link
          to="/appointment"
          className="inline-flex rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-900"
        >
          {t({ en: "Book an appointment", vi: "Đặt lịch khám" })}
        </Link>
      </main>
    );

  const statusBadge = getStatusBadge(ticket.trangThai);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 text-slate-800">
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          to="/my-appointments"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
        >
          <ArrowLeft size={16} />
          {t({ en: "My appointments", vi: "Lịch khám của tôi" })}
        </Link>
        <Link
          to="/home"
          className="text-sm font-semibold text-slate-500 transition hover:text-emerald-900"
        >
          {t({ en: "Home", vi: "Trang chủ" })}
        </Link>
      </div>

      {/* ─── E-Ticket Card Layout ─── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="p-6 pb-5">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            {t({
              en: "Electronic Appointment Ticket",
              vi: "PHIẾU KHÁM ĐIỆN TỬ",
            })}
          </p>

          <div className="mt-2.5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-tight">
                {ticket.maTraCuu}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                <span className="text-slate-500">
                  {vi ? "Trạng thái:" : "Status:"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${statusBadge.cls}`}
                >
                  <span aria-hidden="true">{statusBadge.dot}</span>
                  {statusBadge.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 p-6 pt-5 md:grid-cols-[1.4fr_0.6fr]">
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-900">
              {vi ? "Thời gian & địa điểm" : "Time & location"}
            </h2>
            <div className="mt-4 space-y-3">
              <p className="flex items-start gap-3 text-sm font-bold text-slate-900">
                <Clock3 size={18} className="mt-0.5 shrink-0 text-emerald-800" />
                <span>{formatDateTimeWithWeekday(ticket.gioKhamDuKien, lang)}</span>
              </p>
              <p className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                <MapPin size={18} className="mt-0.5 shrink-0 text-emerald-800" />
                <span>
                  {ticket.phongKham.tenPhong}
                  {ticket.phongKham.tang ? ` - ${ticket.phongKham.tang}` : ""}
                </span>
              </p>
              <p className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                <Hash size={18} className="shrink-0 text-emerald-800" />
                <span>{vi ? "Số thứ tự khám" : "Queue number"}</span>
                <span className="rounded-lg bg-emerald-800 px-3 py-1 font-mono text-lg font-black text-white">
                  {ticket.soThuTu}
                </span>
              </p>
            </div>
          </section>

          <section className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
            {qrUrl ? (
              <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <img
                  src={qrUrl}
                  alt={t({
                    en: "Appointment QR code",
                    vi: "Mã QR phiếu khám",
                  })}
                  className="h-28 w-28 object-contain"
                />
              </div>
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-[10px] text-slate-500">
                <QrCode size={24} className="mb-1 text-slate-400" />
                {t({
                  en: "QR unavailable",
                  vi: "Chưa có mã QR",
                })}
              </div>
            )}
            <p className="mt-2 text-center text-xs font-medium text-slate-600">
              {vi ? "Quét mã tại quầy tiếp đón" : "Scan at the reception desk"}
            </p>
            {qrError && (
              <p role="alert" className="mt-2 max-w-48 text-center text-[10px] text-rose-700">
                {qrError}
              </p>
            )}
          </section>
        </div>

        <section className="border-t border-slate-200 px-6 py-5">
          <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
            {vi ? "Chi tiết lịch hẹn" : "Appointment details"}
          </h2>
          <dl className="grid gap-x-8 gap-y-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">{vi ? "Bệnh nhân" : "Patient"}</dt>
              <dd className="mt-1 font-bold text-slate-900">{ticket.benhNhan.hoTen}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{vi ? "Bác sĩ" : "Doctor"}</dt>
              <dd className="mt-1 font-semibold text-slate-800">
                {ticket.bacSi.hocVi ? `${ticket.bacSi.hocVi} ` : ""}
                {ticket.bacSi.hoTen}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{vi ? "Chuyên khoa" : "Specialty"}</dt>
              <dd className="mt-1 font-semibold text-slate-800">{ticket.tenChuyenKhoa}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{vi ? "Lý do khám" : "Reason"}</dt>
              <dd className="mt-1 text-slate-700">{ticket.lyDoKham || (vi ? "Chưa cung cấp" : "Not provided")}</dd>
            </div>
          </dl>
        </section>

        {calendarError && (
          <p role="alert" className="px-6 pb-2 text-xs font-semibold text-rose-700">
            {calendarError}
          </p>
        )}

        {ticket.lyDoHuy && (
          <div className="border-t border-rose-200 bg-rose-50/80 px-6 py-3 text-xs text-rose-800">
            <strong>
              {ticket.trangThai === "BI_TU_CHOI"
                ? vi
                  ? "Lý do bác sĩ hủy lịch: "
                  : "Doctor cancellation reason: "
                : vi
                  ? "Lý do hủy: "
                  : "Cancellation reason: "}
            </strong>
            {ticket.lyDoHuy}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-slate-200" />

        {/* Bottom Actions section */}
        <div className="p-6 pt-5 bg-white space-y-4">
          {!mode ? (
            <div className="space-y-3">
              {/* Thẻ Sổ khám bệnh điện tử khi đã hoàn thành khám */}
              {(ticket.trangThai === "DA_HOAN_THANH" || ticket.trangThai === "DA_KHAM") && (
                <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50/50 p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-teal-600 p-2 text-white shadow-sm flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-teal-950">
                        {vi ? "Kết quả khám bệnh & Sổ khám điện tử" : "Medical Record & Prescription"}
                      </h3>
                      <p className="mt-0.5 text-xs text-teal-800">
                        {vi
                          ? "Bác sĩ đã hoàn tất khám bệnh và lưu hồ sơ bệnh án điện tử."
                          : "Doctor has completed consultation and recorded the electronic medical record."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <Link
                      to="/so-kham"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-800 transition"
                    >
                      <FileText size={14} />
                      {vi ? "Mở tra cứu sổ khám" : "Open medical record lookup"}
                    </Link>

                    {isPatientAccount && (
                      <Link
                        to={`/patient/my-appointments?ticket=${encodeURIComponent(ticket.maPhieuKham)}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition"
                      >
                        <Star size={14} className="fill-amber-400 text-amber-500" />
                        {vi ? "Đánh giá lượt khám" : "Rate consultation"}
                      </Link>
                    )}
                  </div>

                  <div className="rounded-lg border border-teal-200/80 bg-white/80 p-3 text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-slate-700">
                      🔒 {vi ? "Bảo mật thông tin y tế:" : "Medical Data Security:"}
                    </p>
                    <p>
                      {vi
                        ? "Mã hoặc liên kết sổ khám được gửi riêng qua email hoặc mã QR sau khi khám; phiếu khám không chứa mã sổ khám. Khi tra cứu, nhập 4 số cuối điện thoại liên hệ để xem kết quả đầy đủ."
                        : "The medical record code or link is sent separately by email or QR after the visit; it is not included in this appointment ticket. Enter the last 4 digits of the contact phone to view the full record."}
                    </p>
                    {!user && (
                      <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50/70 p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <Star size={15} className="text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-800">
                              {vi ? "Đánh giá Bác sĩ & Đồng bộ Lịch sử khám:" : "Doctor Review & History Sync:"}
                            </p>
                            <p className="mt-0.5 text-slate-600">
                              {vi
                                ? "Khách vãng lai không thể gửi đánh giá trực tiếp. Đăng ký hoặc Đăng nhập tài khoản với đúng số CCCD đã dùng để hệ thống tự động liên kết hồ sơ (DA_LIEN_KET), lưu vĩnh viễn kết quả khám và gửi đánh giá cho Bác sĩ."
                                : "Guests cannot review directly. Sign in or register with your National ID (CCCD) to auto-link your records and rate the doctor."}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Link
                            to="/login"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                          >
                            <LogIn size={13} />
                            {vi ? "Đăng nhập" : "Sign In"}
                          </Link>
                          <Link
                            to="/register"
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-800 transition"
                          >
                            <UserPlus size={13} />
                            {vi ? "Đăng ký tài khoản mới" : "Register Account"}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Primary action: Đổi lịch khám */}
              {ticket.duocHuyDoi && ticket.trangThai === "DA_XAC_NHAN" && (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900"
                  onClick={() => setIsRescheduleOpen(true)}
                >
                  <CalendarClock size={17} />
                  {vi ? "Đổi lịch khám" : "Reschedule Appointment"}
                </button>
              )}

              {ticket.duocHuyDoi && ticket.trangThai === "DA_XAC_NHAN" && (
                <button
                  type="button"
                  className="w-full text-center text-xs font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 transition hover:text-rose-900"
                  onClick={() => setMode("cancel")}
                >
                  {vi ? "Hủy lịch khám" : "Cancel appointment"}
                </button>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-slate-50 p-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => void handleDownloadIcs()}
                    title={vi ? "Thêm vào lịch Google/Apple Calendar (.ics)" : "Add to calendar (.ics)"}
                  >
                    <Calendar size={14} className="text-emerald-700" />
                    {vi ? "Thêm vào lịch" : "Add to Calendar"}
                  </button>

                  {qrUrl && (
                    <a
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      href={qrUrl}
                      download={`${ticket.maTraCuu}.png`}
                    >
                      <Download size={14} />
                      {t({ en: "QR", vi: "Tải QR" })}
                    </a>
                  )}

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => {
                      setResendSuccess("");
                      setResendError("");
                      setResendMaTraCuu(ticket.maTraCuu);
                      setShowResendModal(true);
                    }}
                    title={vi ? "Nhận lại link phiếu khám qua email" : "Resend ticket link to email"}
                  >
                    <Mail size={14} className="text-sky-700" />
                    {vi ? "Gửi lại link" : "Email link"}
                  </button>
              </div>

              {ticket.hanHuyDoi && ticket.duocHuyDoi && (
                <p className="text-center text-[11px] text-slate-400">
                  {vi
                    ? `Có thể đổi hoặc hủy trước: ${formatTimeAndDate(ticket.hanHuyDoi, lang)}`
                    : `Can reschedule or cancel until: ${formatTimeAndDate(ticket.hanHuyDoi, lang)}`}
                </p>
              )}
            </div>
          ) : (
            /* Cancel form */
            <form
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4"
              onSubmit={(event) => void submitAction(event)}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {t({ en: "Cancel appointment", vi: "Hủy lịch khám" })}
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-800"
                  onClick={() => setMode(null)}
                >
                  ✕
                </button>
              </div>

              {!isPatientAccount && (
                <label className="grid gap-1 text-xs font-semibold text-slate-700">
                  {t({ en: "Contact phone *", vi: "Số điện thoại liên hệ *" })}
                  <input
                    className="rounded-lg border bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="VD: 0912345678"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\D/g, ""))
                    }
                    aria-label={t({
                      en: "Contact phone",
                      vi: "Số điện thoại liên hệ",
                    })}
                  />
                </label>
              )}

              <label className="grid gap-1 text-xs font-semibold text-slate-700">
                {t({
                  en: "Reason (optional)",
                  vi: "Lý do hủy (không bắt buộc)",
                })}
                <textarea
                  rows={3}
                  className="rounded-lg border bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  placeholder={vi ? "Nhập lý do nếu có..." : "Enter reason..."}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>

              {error && (
                <p role="alert" className="text-xs font-semibold text-rose-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  onClick={() => setMode(null)}
                >
                  {t({ en: "Cancel", vi: "Đóng" })}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800! px-4 py-2 text-xs font-bold text-white! shadow-sm hover:bg-emerald-900! disabled:opacity-60"
                >
                  {busy && <Loader2 size={13} className="animate-spin" />}
                  {vi ? "Xác nhận hủy" : "Confirm Cancel"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {ticket && (
        <RescheduleAppointmentModal
          isOpen={isRescheduleOpen}
          ticket={ticket}
          isPatientAccount={Boolean(isPatientAccount)}
          lang={lang}
          onClose={() => setIsRescheduleOpen(false)}
          onRescheduled={handleRescheduled}
        />
      )}

      {/* ─── Modal Cấp lại liên kết qua Email ─── */}
      {showResendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
                  <Mail size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {vi ? "Gửi lại liên kết phiếu khám" : "Resend ticket link"}
                </h3>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setShowResendModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {vi
                ? "Nhập mã tra cứu và số điện thoại đã dùng khi đặt lịch. Nếu thông tin khớp, liên kết sẽ được gửi đến email của lịch hẹn."
                : "Enter the lookup code and phone number used when booking. If they match, the link will be sent to the appointment email."}
            </p>

            {resendSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>{resendSuccess}</p>
              </div>
            ) : (
              <form onSubmit={(e) => void handleResendLink(e)} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {vi ? "Số điện thoại đặt lịch" : "Booking Phone Number"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={resendPhone}
                    onChange={(e) => setResendPhone(e.target.value)}
                    placeholder="0912345678"
                    pattern="^0\d{9}$"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {vi ? "Mã tra cứu" : "Lookup Code"}
                  </label>
                  <input
                    type="text"
                    required
                    value={resendMaTraCuu}
                    onChange={(e) => setResendMaTraCuu(e.target.value.toUpperCase())}
                    placeholder="ECL-20261025-4198"
                    pattern="^ECL-\d{8}-\d{4}$"
                    maxLength={17}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                {resendError && (
                  <p role="alert" className="text-xs font-semibold text-rose-700">
                    {resendError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => setShowResendModal(false)}
                  >
                    {vi ? "Hủy bỏ" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={resendBusy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-800 disabled:opacity-60 transition"
                  >
                    {resendBusy && <Loader2 size={13} className="animate-spin" />}
                    {vi ? "Gửi liên kết" : "Send link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
