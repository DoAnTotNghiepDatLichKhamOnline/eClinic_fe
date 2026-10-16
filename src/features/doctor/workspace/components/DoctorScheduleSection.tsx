import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { doctorBookingService } from "@/services/booking/doctorBookingService";
import { notifyAuth } from "@/utils/authNotification";
import styles from "../DoctorWorkspace.module.css";

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function DoctorScheduleSection() {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [scheduleView, setScheduleView] = useState<"day" | "week">("week");
  const [scheduleDate, setScheduleDate] = useState(() => new Date());

  const scheduleFrom = formatDateKey(
    new Date(scheduleDate.getTime() - 7 * 86_400_000),
  );
  const scheduleTo = formatDateKey(
    new Date(scheduleDate.getTime() + 14 * 86_400_000),
  );

  const { data: shiftsResponse, isLoading: isLoadingShifts } = useQuery({
    queryKey: ["booking", "doctor-shifts", scheduleFrom, scheduleTo],
    queryFn: () =>
      doctorBookingService.getLichTuanBacSi({
        tuNgay: scheduleFrom,
        denNgay: scheduleTo,
      }),
  });

  const { data: calendarAppointmentsResponse } = useQuery({
    queryKey: [
      "booking",
      "doctor-calendar-appointments",
      scheduleFrom,
      scheduleTo,
    ],
    queryFn: () =>
      doctorBookingService.getLichHenLichBacSi({
        tuNgay: scheduleFrom,
        denNgay: scheduleTo,
      }),
  });

  const { data: ownShiftRequestsResponse } = useQuery({
    queryKey: ["booking", "doctor-shift-requests"],
    queryFn: () =>
      doctorBookingService.getYeuCauDoiLichBacSi({ trang: 0, kichThuoc: 100 }),
  });

  const shifts = shiftsResponse?.duLieu ?? [];
  const calendarAppointments = calendarAppointmentsResponse?.duLieu ?? [];
  const ownShiftRequests = ownShiftRequestsResponse?.duLieu?.noiDung ?? [];

  const withdrawShiftRequest = async (id: number) => {
    try {
      await doctorBookingService.rutYeuCauDoiLichBacSi(id);
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-shift-requests"],
      });
      notifyAuth(
        "info",
        lang === "vi" ? "Đã rút yêu cầu" : "Request withdrawn",
        lang === "vi"
          ? "Yêu cầu đổi lịch đã được rút lại."
          : "Shift change request withdrawn.",
      );
    } catch (error) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể rút yêu cầu" : "Could not withdraw request",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ?? "Request failed",
      );
    }
  };

  const weekStart = new Date(scheduleDate);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const calendarDays = Array.from(
    { length: scheduleView === "day" ? 1 : 7 },
    (_, index) => {
      const date = new Date(
        scheduleView === "day" ? scheduleDate : weekStart,
      );
      if (scheduleView === "week") date.setDate(date.getDate() + index);
      return date;
    },
  );

  const calendarTitle = new Intl.DateTimeFormat(lang, {
    ...(scheduleView === "day"
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : { month: "long", year: "numeric" }),
  }).format(scheduleDate);

  const moveCalendar = (direction: number) => {
    setScheduleDate((current) => {
      const next = new Date(current);
      next.setDate(
        next.getDate() + direction * (scheduleView === "day" ? 1 : 7),
      );
      return next;
    });
  };

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  const minimumNotice = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const minimumRequestTime = new Date(
    minimumNotice.getTime() - minimumNotice.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 16);

  const submitShiftRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const shiftId = Number(formData.get("idLichLamViec"));
    const requestType = String(formData.get("loaiYeuCau")) as
      | "XIN_NGHI"
      | "DOI_CA";
    const reason = String(formData.get("reason") || "").trim();
    const currentShift = shifts.find((shift) => shift.id === shiftId);
    const shiftStart = currentShift
      ? new Date(`${currentShift.ngay}T${currentShift.gioBatDau}`)
      : null;

    if (!currentShift || !reason) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu thông tin" : "Missing information",
        lang === "vi"
          ? "Vui lòng chọn ca và nhập lý do."
          : "Choose a shift and enter a reason.",
      );
      return;
    }
    if (
      shiftStart &&
      shiftStart.getTime() < Date.now() + 24 * 60 * 60 * 1000
    ) {
      notifyAuth(
        "error",
        lang === "vi" ? "Quá hạn gửi yêu cầu" : "Request deadline passed",
        lang === "vi"
          ? "Yêu cầu phải được gửi trước ca ít nhất 24 giờ."
          : "Requests must be submitted at least 24 hours before the shift.",
      );
      return;
    }

    const requestedStart = String(formData.get("requestedStart") || "");
    const requestedEnd = String(formData.get("requestedEnd") || "");
    if (requestType === "DOI_CA" && (!requestedStart || !requestedEnd)) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu thời gian đổi ca" : "New shift time required",
        lang === "vi"
          ? "Hãy nhập giờ bắt đầu và kết thúc mong muốn."
          : "Enter the requested start and end times.",
      );
      return;
    }

    void doctorBookingService
      .guiYeuCauDoiLich({
        idLichLamViec: shiftId,
        loaiYeuCau: requestType,
        lyDo: reason,
        ...(requestType === "DOI_CA"
          ? {
              ngayMongMuon: requestedStart.slice(0, 10),
              gioBatDauMongMuon: requestedStart.slice(11, 16),
              gioKetThucMongMuon: requestedEnd.slice(11, 16),
              idPhongKhamMongMuon:
                Number(formData.get("idPhongKhamMongMuon")) || undefined,
            }
          : {}),
      })
      .then(async (response) => {
        form.reset();
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-shift-requests"],
        });
        notifyAuth(
          "success",
          lang === "vi" ? "Đã gửi yêu cầu" : "Request submitted",
          response.thongDiep,
        );
      })
      .catch((error) => {
        notifyAuth(
          "error",
          lang === "vi" ? "Không thể gửi yêu cầu" : "Could not submit request",
          (error as { response?: { data?: { thongDiep?: string } } })
            .response?.data?.thongDiep ?? "Request failed",
        );
      });
  };

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>
            {lang === "vi" ? "Lịch làm việc cá nhân" : "Personal Work Schedule"}
          </h1>
          <p>
            {lang === "vi"
              ? "Xem ca trực được phân công và số lượng bệnh nhân đã đặt."
              : "Review your assigned duty shifts and confirmed patient bookings."}
          </p>
        </div>
        <div
          className={styles.segmented}
          role="group"
          aria-label={lang === "vi" ? "Chế độ xem lịch" : "Schedule view"}
        >
          <button
            type="button"
            className={scheduleView === "day" ? styles.selected : ""}
            aria-pressed={scheduleView === "day"}
            onClick={() => setScheduleView("day")}
          >
            {lang === "vi" ? "Ngày" : "Day"}
          </button>
          <button
            type="button"
            className={scheduleView === "week" ? styles.selected : ""}
            aria-pressed={scheduleView === "week"}
            onClick={() => setScheduleView("week")}
          >
            {lang === "vi" ? "Tuần" : "Week"}
          </button>
        </div>
      </div>
      <section
        className={styles.calendar}
        aria-label={lang === "vi" ? "Lịch làm việc" : "Work calendar"}
      >
        <div className={styles.calendarToolbar}>
          <div className={styles.calendarNavigation}>
            <button
              type="button"
              onClick={() => moveCalendar(-1)}
              aria-label={
                lang === "vi" ? "Khoảng thời gian trước" : "Previous period"
              }
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setScheduleDate(new Date())}>
              {lang === "vi" ? "Hôm nay" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => moveCalendar(1)}
              aria-label={
                lang === "vi" ? "Khoảng thời gian tiếp theo" : "Next period"
              }
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
          <h2>{calendarTitle}</h2>
        </div>
        <div
          className={`${styles.calendarGrid} ${scheduleView === "day" ? styles.calendarDay : ""}`}
        >
          {calendarDays.map((date) => {
            const shiftDateKey = formatDateKey(date);
            const dayShifts = shifts.filter(
              (shift) => shift.ngay === shiftDateKey,
            );
            const dayAppointments = calendarAppointments.filter(
              (appointment) => appointment.ngay === shiftDateKey,
            );
            const dayLabel = new Intl.DateTimeFormat(lang, {
              weekday: "short",
            }).format(date);
            const dateLabel = new Intl.DateTimeFormat(lang, {
              day: "numeric",
              month: "short",
            }).format(date);
            return (
              <button
                type="button"
                className={`${styles.calendarDayCell} ${isToday(date) ? styles.calendarToday : ""}`}
                key={date.toISOString()}
                onClick={() => {
                  setScheduleDate(date);
                  setScheduleView("day");
                }}
                aria-label={`${dayLabel} ${dateLabel}`}
              >
                <span className={styles.calendarDayName}>{dayLabel}</span>
                <strong className={styles.calendarDate}>
                  {date.getDate()}
                </strong>
                {isLoadingShifts ? (
                  <span className={styles.calendarOff}>
                    {lang === "vi" ? "Đang tải..." : "Loading..."}
                  </span>
                ) : dayShifts.length ? (
                  <span className={styles.calendarShift}>
                    {dayShifts.map((shift) => (
                      <span key={shift.id}>
                        <Clock3 size={13} aria-hidden="true" />
                        {shift.gioBatDau} - {shift.gioKetThuc}
                        <small>
                          {shift.tenPhongKham} ·{" "}
                          {shift.soLuotDaDat ?? shift.soChoDaDat}/
                          {shift.tongSoLuot ?? shift.tongSoCho}
                        </small>
                      </span>
                    ))}
                    {dayAppointments.map((appointment) => (
                      <small key={appointment.maPhieuKham}>
                        {appointment.gioKhamDuKien} ·{" "}
                        {appointment.hoTenBenhNhan}
                      </small>
                    ))}
                  </span>
                ) : (
                  <span className={styles.calendarOff}>
                    {lang === "vi" ? "Không có ca" : "No shift"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>{lang === "vi" ? "Đơn đã gửi" : "Submitted requests"}</h2>
        <div className={styles.requestList}>
          {ownShiftRequests.length ? (
            ownShiftRequests.map((request) => (
              <article className={styles.requestItem} key={request.id}>
                <div>
                  <strong>
                    {request.loaiYeuCau === "DOI_CA"
                      ? lang === "vi"
                        ? "Đổi ca"
                        : "Shift change"
                      : lang === "vi"
                        ? "Xin nghỉ"
                        : "Leave"}{" "}
                    · {request.ngayMongMuon ?? request.ngay}
                  </strong>
                  <p>{request.lyDo}</p>
                </div>
                <div className={styles.requestActions}>
                  <span
                    className={`${styles.status} ${styles[`status_${request.trangThai.toLowerCase()}`]}`}
                  >
                    {request.trangThai === "CHO_DUYET"
                      ? lang === "vi"
                        ? "Chờ duyệt"
                        : "Pending"
                      : request.trangThai === "DA_DUYET"
                        ? lang === "vi"
                          ? "Đã duyệt"
                          : "Approved"
                        : request.trangThai === "TU_CHOI"
                          ? lang === "vi"
                            ? "Từ chối"
                            : "Declined"
                          : request.trangThai}
                  </span>
                  {request.trangThai === "CHO_DUYET" && (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => void withdrawShiftRequest(request.id)}
                    >
                      {lang === "vi" ? "Rút yêu cầu" : "Withdraw"}
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <p className={styles.emptyNotice}>
              {lang === "vi"
                ? "Chưa có yêu cầu đổi lịch nào."
                : "No shift requests submitted."}
            </p>
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>
          {lang === "vi"
            ? "Đăng ký đổi ca / Xin nghỉ"
            : "Request shift change / Leave"}
        </h2>
        <p className={styles.readOnlyNote}>
          {lang === "vi"
            ? "Yêu cầu phải được gửi trước ca trực ít nhất 24 giờ để Quản trị viên kịp phê duyệt."
            : "Requests must be submitted at least 24 hours in advance for admin approval."}
        </p>
        <form className={styles.formGrid} onSubmit={submitShiftRequest}>
          <div className={styles.formRowThree}>
            <label>
              {lang === "vi" ? "Chọn ca cần đổi/nghỉ" : "Choose shift"}
              <select name="idLichLamViec" required defaultValue="">
                <option value="" disabled>
                  {lang === "vi" ? "Chọn ca" : "Select shift"}
                </option>
                {shifts
                  .filter((shift) => shift.trangThai === "HOAT_DONG")
                  .map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.ngay} · {shift.gioBatDau}-{shift.gioKetThuc} ·{" "}
                      {shift.tenPhongKham}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              {lang === "vi" ? "Loại yêu cầu" : "Request type"}
              <select name="loaiYeuCau" defaultValue="XIN_NGHI">
                <option value="XIN_NGHI">
                  {lang === "vi" ? "Xin nghỉ" : "Leave"}
                </option>
                <option value="DOI_CA">
                  {lang === "vi" ? "Đổi ca" : "Change shift"}
                </option>
              </select>
            </label>
            <label>
              {lang === "vi"
                ? "Giờ bắt đầu mong muốn (khi đổi ca)"
                : "Requested start (shift change)"}
              <input
                name="requestedStart"
                type="datetime-local"
                min={minimumRequestTime}
              />
            </label>
            <label>
              {lang === "vi" ? "Giờ kết thúc mong muốn" : "Requested end"}
              <input
                name="requestedEnd"
                type="datetime-local"
                min={minimumRequestTime}
              />
            </label>
            <label>
              {lang === "vi"
                ? "Mã phòng mong muốn (không bắt buộc)"
                : "Requested clinic ID (optional)"}
              <input name="idPhongKhamMongMuon" inputMode="numeric" />
            </label>
            <label className={styles.fullWidth}>
              {lang === "vi" ? "Lý do" : "Reason"}
              <textarea name="reason" rows={3} required />
            </label>
            <button type="submit" className={styles.primaryButton}>
              {lang === "vi" ? "Gửi yêu cầu" : "Submit request"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
