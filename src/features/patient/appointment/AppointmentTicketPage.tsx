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

  if (loading)
    return (
      <main className="mx-auto max-w-4xl px-5 py-16 text-center">
        {t({ en: "Loading ticket...", vi: "Đang tải phiếu khám..." })}
      </main>
    );
  if (!ticket)
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <p role="alert">{error}</p>
        <Link to="/appointment">
          {t({ en: "Book an appointment", vi: "Đặt lịch khám" })}
        </Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 text-slate-800">
      <Link
        to="/home"
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-900"
      >
        <ArrowLeft size={16} />
        {t({ en: "Home", vi: "Trang chủ" })}
      </Link>
      <section className="grid gap-8 border-y border-slate-200 py-8 md:grid-cols-[1fr_220px]">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-800">
            {t({ en: "Appointment ticket", vi: "Phiếu khám" })}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{ticket.maTraCuu}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {ticket.trangThai.replaceAll("_", " ")}
          </p>
          <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">
                {t({ en: "Patient", vi: "Bệnh nhân" })}
              </dt>
              <dd className="mt-1 font-semibold">{ticket.benhNhan.hoTen}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">
                {t({ en: "Date and time", vi: "Ngày giờ khám" })}
              </dt>
              <dd className="mt-1 font-semibold">
                {ticket.ngay} · {ticket.gioKhamDuKien}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">
                {t({ en: "Doctor", vi: "Bác sĩ" })}
              </dt>
              <dd className="mt-1 font-semibold">
                {ticket.bacSi.hocVi ? `${ticket.bacSi.hocVi} ` : ""}
                {ticket.bacSi.hoTen}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">
                {t({ en: "Clinic", vi: "Phòng khám" })}
              </dt>
              <dd className="mt-1 font-semibold">
                {ticket.phongKham.tenPhong}
                {ticket.phongKham.tang ? ` · ${ticket.phongKham.tang}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">
                {t({ en: "Queue number", vi: "Số thứ tự" })}
              </dt>
              <dd className="mt-1 font-semibold">{ticket.soThuTu}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">
                {t({ en: "Reason", vi: "Lý do khám" })}
              </dt>
              <dd className="mt-1 font-semibold">{ticket.lyDoKham}</dd>
            </div>
          </dl>
          {ticket.lyDoHuy && (
            <p className="mt-5 text-sm text-rose-700">
              {t({
                en: "Reason for cancellation/decline:",
                vi: "Lý do hủy/từ chối:",
              })}{" "}
              {ticket.lyDoHuy}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-3">
          <QrCode size={18} />
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={t({ en: "Appointment QR code", vi: "Mã QR phiếu khám" })}
              className="h-44 w-44 border border-slate-200 p-2"
            />
          ) : (
            <div className="grid h-44 w-44 place-items-center border border-slate-200 text-xs text-slate-500">
              QR unavailable
            </div>
          )}
          {qrUrl && (
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900"
              href={qrUrl}
              download={`${ticket.maTraCuu}.png`}
            >
              <Download size={15} />
              {t({ en: "Download QR", vi: "Tải mã QR" })}
            </a>
          )}
          <p className="text-center text-xs text-slate-500">
            {ticket.maPhieuKham}
          </p>
        </div>
      </section>
      {ticket.duocHuyDoi && (
        <section className="mt-8 border-b border-slate-200 pb-8">
          {!mode ? (
            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800"
                onClick={() => setMode("cancel")}
              >
                <XCircle size={16} />
                {t({ en: "Cancel appointment", vi: "Hủy lịch" })}
              </button>
              <button
                className="inline-flex items-center gap-2 border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900"
                onClick={() => setMode("reschedule")}
              >
                <CalendarClock size={16} />
                {t({ en: "Reschedule", vi: "Đổi lịch" })}
              </button>
            </div>
          ) : (
            <form
              className="grid max-w-2xl gap-4 sm:grid-cols-2"
              onSubmit={(event) => void submitAction(event)}
            >
              <h2 className="text-lg font-semibold sm:col-span-2">
                {mode === "cancel"
                  ? t({ en: "Cancel appointment", vi: "Hủy lịch khám" })
                  : t({
                      en: "Choose a new appointment slot",
                      vi: "Chọn khung giờ mới",
                    })}
              </h2>
              {!user && (
                <label className="grid gap-1 text-sm">
                  {t({ en: "Contact phone", vi: "Số điện thoại liên hệ" })}
                  <input
                    className="border border-slate-300 px-3 py-2"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\D/g, ""))
                    }
                  />
                </label>
              )}
              {mode === "cancel" ? (
                <label className="grid gap-1 text-sm sm:col-span-2">
                  {t({ en: "Reason (optional)", vi: "Lý do (không bắt buộc)" })}
                  <textarea
                    className="border border-slate-300 px-3 py-2"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </label>
              ) : (
                <>
                  <label className="grid gap-1 text-sm">
                    {t({
                      en: "Shift ID (or use specialty)",
                      vi: "Mã ca (hoặc chọn chuyên khoa)",
                    })}
                    <input
                      className="border border-slate-300 px-3 py-2"
                      inputMode="numeric"
                      value={idLichLamViec}
                      onChange={(event) => setIdLichLamViec(event.target.value)}
                    />
                  </label>
                  {!idLichLamViec && (
                    <label className="grid gap-1 text-sm">
                      {t({ en: "Specialty ID", vi: "Mã chuyên khoa" })}
                      <input
                        className="border border-slate-300 px-3 py-2"
                        inputMode="numeric"
                        required
                        value={idChuyenKhoa}
                        onChange={(event) =>
                          setIdChuyenKhoa(event.target.value)
                        }
                      />
                    </label>
                  )}
                  <label className="grid gap-1 text-sm">
                    {t({ en: "Slot start", vi: "Giờ bắt đầu khung" })}
                    <input
                      className="border border-slate-300 px-3 py-2"
                      required
                      type="datetime-local"
                      value={gioBatDauKhung}
                      onChange={(event) =>
                        setGioBatDauKhung(event.target.value)
                      }
                    />
                  </label>
                </>
              )}
              {error && (
                <p role="alert" className="text-sm text-rose-700 sm:col-span-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3 sm:col-span-2">
                <button
                  className="bg-emerald-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    t({ en: "Confirm", vi: "Xác nhận" })
                  )}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm"
                  onClick={() => setMode(null)}
                >
                  {t({ en: "Back", vi: "Quay lại" })}
                </button>
              </div>
            </form>
          )}
          {error && !mode && (
            <p role="alert" className="mt-3 text-sm text-rose-700">
              {error}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-500">
            {vi
              ? `Có thể hủy/đổi đến ${ticket.hanHuyDoi}.`
              : `Cancellation/rescheduling deadline: ${ticket.hanHuyDoi}.`}
          </p>
        </section>
      )}
    </main>
  );
}
