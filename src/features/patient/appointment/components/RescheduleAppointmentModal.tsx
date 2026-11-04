import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import {
  useCaKhamTheoNgay,
  useNgayConCho,
  useQuyTacDatLich,
} from "@/hooks/useBooking";
import { patientBookingService } from "@/services/booking";
import type {
  DatLichResponse,
  DoiLichRequest,
  PhieuKhamResponse,
} from "@/types/booking.type";
import {
  formatDateTimeWithWeekday,
  formatFullDateWithWeekday,
} from "@/utils/dateFormatting";
import { formatSlotRange } from "../appointment.utils";

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  ticket: PhieuKhamResponse;
  isPatientAccount: boolean;
  lang: "vi" | "en";
  onClose: () => void;
  onRescheduled: (result: DatLichResponse) => void | Promise<void>;
}

interface SelectedSlot {
  idLichLamViec: number;
  gioBatDauKhung: string;
  gioKetThucKhung: string;
  soChoConLai: number;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getErrorMessage(cause: unknown, lang: "vi" | "en"): string {
  if (isAxiosError<{ thongDiep?: string }>(cause)) {
    return (
      cause.response?.data?.thongDiep ??
      (lang === "vi" ? "Không thể đổi lịch khám." : "Could not reschedule.")
    );
  }
  return cause instanceof Error
    ? cause.message
    : lang === "vi"
      ? "Không thể đổi lịch khám."
      : "Could not reschedule.";
}

export function RescheduleAppointmentModal({
  isOpen,
  ticket,
  isPatientAccount,
  lang,
  onClose,
  onRescheduled,
}: RescheduleAppointmentModalProps) {
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [phone, setPhone] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthStart = new Date(
    displayMonth.getFullYear(),
    displayMonth.getMonth(),
    1,
  );
  const monthEnd = new Date(
    displayMonth.getFullYear(),
    displayMonth.getMonth() + 1,
    0,
  );
  const {
    quyTac,
    isError: policyError,
    refetch: refetchPolicy,
  } = useQuyTacDatLich();
  const {
    danhSachNgay,
    isLoading: isLoadingDates,
    isError: datesError,
    refetch,
  } = useNgayConCho({
    idBacSi: ticket.bacSi.id,
    tuNgay: dateKey(monthStart),
    denNgay: dateKey(monthEnd),
  });
  const {
    danhSachCaKham,
    isLoading: isLoadingSlots,
    isError: slotsError,
    refetch: refetchSlots,
  } = useCaKhamTheoNgay(
    selectedDate ? { idBacSi: ticket.bacSi.id, ngay: selectedDate } : undefined,
  );

  const availableDates = useMemo(
    () => new Map(danhSachNgay.map((date) => [date.ngay, date.soChoConLai])),
    [danhSachNgay],
  );
  const slots = useMemo(
    () =>
      danhSachCaKham.flatMap((shift) =>
        shift.khungGio.map((slot) => ({
          idLichLamViec: shift.idLichLamViec,
          gioBatDauKhung: slot.gioBatDau,
          gioKetThucKhung: slot.gioKetThuc,
          soChoConLai: slot.soChoConLai,
          hetCho: slot.hetCho || slot.soChoConLai <= 0,
        })),
      ),
    [danhSachCaKham],
  );

  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const calendarCells = Array.from(
    { length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - firstWeekday + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    },
  );
  const todayKey = dateKey(new Date());
  const selectedDateLabel = selectedDate
    ? formatFullDateWithWeekday(selectedDate, lang)
    : "";
  const maxBookingDate = new Date();
  maxBookingDate.setDate(
    maxBookingDate.getDate() + (quyTac?.soNgayDatTruocToiDa ?? 365),
  );
  const maxBookingMonth = new Date(
    maxBookingDate.getFullYear(),
    maxBookingDate.getMonth(),
    1,
  );
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
    const monday = new Date(2024, 0, 1 + index);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(monday);
  });

  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    setDisplayMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate("");
    setSelectedSlot(null);
    setSubmitError("");
    setPhone("");
  }, [isOpen, ticket.maPhieuKham]);

  const changeMonth = (amount: number) => {
    setDisplayMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
    setSelectedDate("");
    setSelectedSlot(null);
  };

  const handleReschedule = async () => {
    setSubmitError("");
    if (!selectedSlot) {
      setSubmitError(
        lang === "vi"
          ? "Vui lòng chọn một khung giờ còn chỗ."
          : "Choose an available appointment time.",
      );
      return;
    }
    if (!isPatientAccount && !phone.trim()) {
      setSubmitError(
        lang === "vi"
          ? "Vui lòng nhập số điện thoại liên hệ đã dùng khi đặt lịch."
          : "Enter the contact phone number used when booking.",
      );
      return;
    }

    const request: DoiLichRequest = {
      idLichLamViec: selectedSlot.idLichLamViec,
      gioBatDauKhung: selectedSlot.gioBatDauKhung,
      ...(!isPatientAccount ? { soDienThoai: phone.trim() } : {}),
    };

    setIsSubmitting(true);
    try {
      const response = isPatientAccount
        ? await patientBookingService.doiLichHen(ticket.maPhieuKham, request)
        : await patientBookingService.doiPhieuKhamKhach(
            ticket.maPhieuKham,
            request,
          );
      if (!response.thanhCong || !response.duLieu) {
        throw new Error(
          response.thongDiep ||
            (lang === "vi"
              ? "Không thể đổi lịch khám."
              : "Could not reschedule."),
        );
      }
      await onRescheduled(response.duLieu);
    } catch (cause) {
      setSubmitError(getErrorMessage(cause, lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoToPreviousMonth =
    displayMonth.getFullYear() > new Date().getFullYear() ||
    displayMonth.getMonth() > new Date().getMonth();
  const canGoToNextMonth =
    displayMonth.getFullYear() < maxBookingMonth.getFullYear() ||
    (displayMonth.getFullYear() === maxBookingMonth.getFullYear() &&
      displayMonth.getMonth() < maxBookingMonth.getMonth());
  const hasAvailableDay = [...availableDates.values()].some(
    (count) => count > 0,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title={lang === "vi" ? "Đổi lịch khám" : "Reschedule appointment"}
      description={
        lang === "vi"
          ? "Chọn ngày và khung giờ mới cho cùng bác sĩ."
          : "Choose a new date and time with the same doctor."
      }
      maxWidth="xl"
      closeOnBackdropClick={!isSubmitting}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            {lang === "vi" ? "Hủy bỏ" : "Cancel"}
          </Button>
          <Button
            type="button"
            variant="accent"
            disabled={isSubmitting || !selectedSlot}
            onClick={() => void handleReschedule()}
            className="inline-flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {lang === "vi" ? "Xác nhận đổi lịch" : "Confirm reschedule"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {lang === "vi" ? "Bác sĩ hiện tại" : "Current doctor"}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {ticket.bacSi.hocVi ? `${ticket.bacSi.hocVi} ` : ""}
              {ticket.bacSi.hoTen}
            </p>
            <p className="text-xs text-slate-600">{ticket.tenChuyenKhoa}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {lang === "vi" ? "Lịch hẹn hiện tại" : "Current appointment"}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatDateTimeWithWeekday(ticket.gioKhamDuKien, lang)}
            </p>
            <p className="text-xs text-slate-600">
              {lang === "vi" ? "Số thứ tự" : "Queue number"}: {ticket.soThuTu}
            </p>
          </div>
        </section>

        {!isPatientAccount && (
          <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
            {lang === "vi"
              ? "Số điện thoại liên hệ đã dùng khi đặt lịch"
              : "Contact phone used when booking"}
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, ""))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </label>
        )}

        <section
          aria-labelledby="reschedule-calendar-title"
          className="space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h3
              id="reschedule-calendar-title"
              className="flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              <CalendarDays size={17} className="text-emerald-800" />
              {lang === "vi" ? "Chọn ngày khám mới" : "Choose a new date"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={lang === "vi" ? "Tháng trước" : "Previous month"}
                disabled={!canGoToPreviousMonth || isSubmitting}
                onClick={() => changeMonth(-1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-32 text-center text-sm font-semibold text-slate-800">
                {new Intl.DateTimeFormat(locale, {
                  month: "long",
                  year: "numeric",
                }).format(displayMonth)}
              </span>
              <button
                type="button"
                aria-label={lang === "vi" ? "Tháng sau" : "Next month"}
                disabled={!canGoToNextMonth || isSubmitting}
                onClick={() => changeMonth(1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {weekdayLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="py-1 text-[11px] font-semibold text-slate-500"
              >
                {label}
              </span>
            ))}
            {calendarCells.map((day, index) => {
              if (!day) return <span key={`blank-${index}`} />;
              const date = new Date(
                displayMonth.getFullYear(),
                displayMonth.getMonth(),
                day,
              );
              const key = dateKey(date);
              const hasAvailability = (availableDates.get(key) ?? 0) > 0;
              const isSelected = selectedDate === key;
              const isDisabled =
                key < todayKey ||
                key > dateKey(maxBookingDate) ||
                !hasAvailability ||
                isSubmitting;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isDisabled}
                  aria-label={formatFullDateWithWeekday(key, lang)}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedDate(key);
                    setSelectedSlot(null);
                    setSubmitError("");
                  }}
                  className={`relative grid min-h-10 place-items-center rounded-lg border text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                    isSelected
                      ? "border-emerald-800 bg-emerald-800 text-white"
                      : isDisabled
                        ? "cursor-not-allowed border-transparent bg-slate-50 text-slate-300"
                        : "border-slate-200 bg-white text-slate-800 hover:border-emerald-500 hover:bg-emerald-50"
                  }`}
                >
                  {day}
                  {hasAvailability && !isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-600"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {isLoadingDates && (
            <p className="flex items-center justify-center gap-2 py-3 text-xs text-slate-500">
              <Loader2 size={15} className="animate-spin text-emerald-800" />
              {lang === "vi"
                ? "Đang tải ngày còn chỗ..."
                : "Loading available dates..."}
            </p>
          )}
          {datesError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              <span>
                {lang === "vi"
                  ? "Không thể tải lịch trống."
                  : "Could not load available dates."}
              </span>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-semibold underline"
              >
                {lang === "vi" ? "Thử lại" : "Retry"}
              </button>
            </div>
          )}
          {policyError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              <span>
                {lang === "vi"
                  ? "Không thể tải quy định thời hạn đặt lịch."
                  : "Could not load booking date limits."}
              </span>
              <button
                type="button"
                onClick={() => void refetchPolicy()}
                className="font-semibold underline"
              >
                {lang === "vi" ? "Thử lại" : "Retry"}
              </button>
            </div>
          )}
          {!isLoadingDates && !datesError && !hasAvailableDay && (
            <p className="text-center text-xs text-slate-500">
              {lang === "vi"
                ? "Bác sĩ chưa có ngày khám còn chỗ trong tháng này."
                : "This doctor has no available dates this month."}
            </p>
          )}
        </section>

        <section aria-labelledby="reschedule-slots-title" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              id="reschedule-slots-title"
              className="flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              <Clock3 size={17} className="text-emerald-800" />
              {lang === "vi" ? "Chọn khung giờ mới" : "Choose a new time"}
            </h3>
            {selectedDate && (
              <span className="text-xs font-medium text-slate-600">
                {selectedDateLabel}
              </span>
            )}
          </div>

          {!selectedDate ? (
            <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
              {lang === "vi"
                ? "Chọn ngày còn chỗ để xem khung giờ."
                : "Select an available date to view time slots."}
            </p>
          ) : isLoadingSlots ? (
            <p className="flex items-center justify-center gap-2 py-5 text-xs text-slate-500">
              <Loader2 size={15} className="animate-spin text-emerald-800" />
              {lang === "vi"
                ? "Đang tải khung giờ..."
                : "Loading time slots..."}
            </p>
          ) : slotsError ? (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              <span>
                {lang === "vi"
                  ? "Không thể tải khung giờ."
                  : "Could not load time slots."}
              </span>
              <button
                type="button"
                onClick={() => void refetchSlots()}
                className="font-semibold underline"
              >
                {lang === "vi" ? "Thử lại" : "Retry"}
              </button>
            </div>
          ) : slots.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
              {lang === "vi"
                ? "Không còn khung giờ phù hợp trong ngày này."
                : "No available time slots on this date."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => {
                const isSelected =
                  selectedSlot?.idLichLamViec === slot.idLichLamViec &&
                  selectedSlot.gioBatDauKhung === slot.gioBatDauKhung;
                const isCurrentAppointment =
                  slot.gioBatDauKhung === ticket.gioKhamDuKien;
                const disabled =
                  slot.hetCho || isCurrentAppointment || isSubmitting;

                return (
                  <button
                    key={`${slot.idLichLamViec}-${slot.gioBatDauKhung}`}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setSubmitError("");
                    }}
                    className={`rounded-lg border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      isSelected
                        ? "border-emerald-800 bg-emerald-800 text-white"
                        : disabled
                          ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-white text-slate-800 hover:border-emerald-500 hover:bg-emerald-50"
                    }`}
                  >
                    <span className="block text-xs font-bold">
                      {formatSlotRange(
                        slot.gioBatDauKhung,
                        slot.gioKetThucKhung,
                      )}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-[10px]">
                      <MapPin size={11} />
                      {lang === "vi"
                        ? `${slot.soChoConLai} chỗ còn lại`
                        : `${slot.soChoConLai} spots left`}
                      {slot.hetCho &&
                        (lang === "vi" ? " · Hết chỗ" : " · Full")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selectedSlot && (
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            {lang === "vi"
              ? "Lịch khám hiện tại sẽ được thay thế ngay sau khi xác nhận đặt lại."
              : "Your existing appointment will be replaced upon confirmation."}
          </p>
        )}

        {submitError && (
          <p role="alert" className="text-xs font-semibold text-rose-700">
            {submitError}
          </p>
        )}
      </div>
    </Modal>
  );
}
