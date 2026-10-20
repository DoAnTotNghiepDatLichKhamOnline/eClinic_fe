import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  Loader2,
  QrCode,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { patientBookingService } from "@/services/booking";
import type { DatLichResponse, PhieuKhamResponse } from "@/types/booking.type";

export function AppointmentTicketPage() {
  const { maPhieuKham = "" } = useParams();
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const vi = lang === "vi";
  const [ticket, setTicket] = useState<PhieuKhamResponse | null>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [idLichLamViec, setIdLichLamViec] = useState("");
  const [idChuyenKhoa, setIdChuyenKhoa] = useState("");
  const [gioBatDauKhung, setGioBatDauKhung] = useState("");
  const [mode, setMode] = useState<"cancel" | "reschedule" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    void patientBookingService
      .getQrPhieuKham(maPhieuKham)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setQrUrl(url);
      })
      .catch(() => setQrUrl(""));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [maPhieuKham]);

  const submitAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mode) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "cancel") {
        const response =
          user?.role === "patient"
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
      } else {
        const body = {
          ...(!user?.role || user.role !== "patient"
            ? { soDienThoai: phone }
            : {}),
          ...(idLichLamViec
            ? { idLichLamViec: Number(idLichLamViec) }
            : { idChuyenKhoa: Number(idChuyenKhoa) }),
          gioBatDauKhung,
        };
        const response =
          user?.role === "patient"
            ? await patientBookingService.doiLichHen(maPhieuKham, body)
            : await patientBookingService.doiPhieuKhamKhach(maPhieuKham, body);
        if (!response.thanhCong || !response.duLieu)
          throw new Error(response.thongDiep);
        navigate(
          `/phieu-kham/${(response.duLieu as DatLichResponse).maPhieuKham}`,
          { replace: true },
        );
      }
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

  const formatDateVN = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
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
      <Link
        to="/home"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition"
      >
        <ArrowLeft size={16} />
        {t({ en: "Home", vi: "Trang chủ" })}
      </Link>

      {/* ─── E-Ticket Card Layout ─── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        {/* Header section */}
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

            {/* QR Code */}
            <div className="flex flex-col items-center flex-shrink-0">
              {qrUrl ? (
                <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                  <img
                    src={qrUrl}
                    alt={t({
                      en: "Appointment QR code",
                      vi: "Mã QR phiếu khám",
                    })}
                    className="h-24 w-24 object-contain"
                  />
                </div>
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-[10px] text-slate-400">
                  <QrCode size={24} className="mb-1 text-slate-300" />
                  No QR
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200" />

        {/* Middle Info Rows */}
        <div className="divide-y divide-slate-100 bg-slate-50/50 px-6 py-2 text-sm">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">
              {vi ? "Bệnh nhân" : "Patient"}
            </span>
            <span className="font-bold text-slate-900 text-right">
              {ticket.benhNhan.hoTen}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">{vi ? "Bác sĩ" : "Doctor"}</span>
            <span className="font-semibold text-slate-800 text-right">
              {ticket.bacSi.hocVi ? `${ticket.bacSi.hocVi} ` : ""}
              {ticket.bacSi.hoTen}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">
              {vi ? "Chuyên khoa" : "Specialty"}
            </span>
            <span className="font-semibold text-slate-800 text-right">
              {ticket.tenChuyenKhoa}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">{vi ? "Ngày khám" : "Date"}</span>
            <span className="font-bold text-slate-900 text-right">
              {formatDateVN(ticket.ngay)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">{vi ? "Giờ khám" : "Time"}</span>
            <span className="font-bold text-slate-900 text-right">
              {ticket.gioKhamDuKien}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">
              {vi ? "Phòng khám" : "Clinic"}
            </span>
            <span className="font-semibold text-slate-800 text-right">
              {ticket.phongKham.tenPhong}
              {ticket.phongKham.tang ? ` - ${ticket.phongKham.tang}` : ""}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">{vi ? "STT" : "Queue #"}</span>
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 font-mono text-base font-black text-emerald-800">
              {ticket.soThuTu}
            </span>
          </div>

          {ticket.lyDoKham && (
            <div className="flex items-start justify-between py-2.5">
              <span className="text-slate-500">
                {vi ? "Lý do khám" : "Reason"}
              </span>
              <span className="max-w-[60%] text-right text-xs text-slate-700 italic">
                {ticket.lyDoKham}
              </span>
            </div>
          )}
        </div>

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
              {/* Primary action: Đổi lịch khám */}
              {ticket.duocHuyDoi && ticket.trangThai === "DA_XAC_NHAN" && (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800! py-3 text-sm font-bold text-white! shadow-sm hover:bg-emerald-900! transition"
                  onClick={() => setMode("reschedule")}
                >
                  <CalendarClock size={17} />
                  {vi ? "Đổi lịch khám" : "Reschedule Appointment"}
                </button>
              )}

              {/* Secondary action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {ticket.duocHuyDoi && ticket.trangThai === "DA_XAC_NHAN" ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                    onClick={() => setMode("cancel")}
                  >
                    <XCircle size={15} />
                    {vi ? "Hủy lịch khám" : "Cancel"}
                  </button>
                ) : (
                  <span />
                )}

                {qrUrl && (
                  <a
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    href={qrUrl}
                    download={`${ticket.maTraCuu}.png`}
                  >
                    <Download size={15} />
                    {t({ en: "Download QR", vi: "Tải mã QR" })}
                  </a>
                )}
              </div>

              {ticket.hanHuyDoi && ticket.duocHuyDoi && (
                <p className="text-center text-[11px] text-slate-400">
                  {vi
                    ? `Có thể đổi hoặc hủy trước: ${ticket.hanHuyDoi}`
                    : `Can reschedule or cancel until: ${ticket.hanHuyDoi}`}
                </p>
              )}
            </div>
          ) : (
            /* Mode Form (Cancel / Reschedule) */
            <form
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4"
              onSubmit={(event) => void submitAction(event)}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {mode === "cancel"
                    ? t({ en: "Cancel appointment", vi: "Hủy lịch khám" })
                    : t({
                        en: "Choose a new appointment slot",
                        vi: "Chọn khung giờ mới để đổi lịch",
                      })}
                </h2>
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-800"
                  onClick={() => setMode(null)}
                >
                  ✕
                </button>
              </div>

              {!user && (
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
                  />
                </label>
              )}

              {mode === "cancel" ? (
                <label className="grid gap-1 text-xs font-semibold text-slate-700">
                  {t({
                    en: "Reason (optional)",
                    vi: "Lý do hủy (không bắt buộc)",
                  })}
                  <textarea
                    rows={3}
                    className="rounded-lg border  bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    placeholder={
                      vi ? "Nhập lý do nếu có..." : "Enter reason..."
                    }
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </label>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-semibold text-slate-700">
                    {t({
                      en: "Shift ID (optional)",
                      vi: "Mã ca làm việc (nếu có)",
                    })}
                    <input
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      inputMode="numeric"
                      placeholder="Mã ca mới"
                      value={idLichLamViec}
                      onChange={(event) => setIdLichLamViec(event.target.value)}
                    />
                  </label>

                  {!idLichLamViec && (
                    <label className="grid gap-1 text-xs font-semibold text-slate-700">
                      {t({ en: "Specialty ID *", vi: "Mã chuyên khoa *" })}
                      <input
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        inputMode="numeric"
                        required
                        placeholder="Mã chuyên khoa"
                        value={idChuyenKhoa}
                        onChange={(event) =>
                          setIdChuyenKhoa(event.target.value)
                        }
                      />
                    </label>
                  )}

                  <label className="grid gap-1 text-xs font-semibold text-slate-700 sm:col-span-2">
                    {t({ en: "Slot start time *", vi: "Giờ bắt đầu khung *" })}
                    <input
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      required
                      type="datetime-local"
                      value={gioBatDauKhung}
                      onChange={(event) =>
                        setGioBatDauKhung(event.target.value)
                      }
                    />
                  </label>
                </div>
              )}

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
                  {mode === "cancel"
                    ? vi
                      ? "Xác nhận hủy"
                      : "Confirm Cancel"
                    : vi
                      ? "Xác nhận đổi lịch"
                      : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
