import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  APPOINTMENT_DOCTORS,
  APPOINTMENT_SPECIALTIES,
} from "@/features/patient/appointment/appointment.data";
import type {
  AppointmentRecord,
  AppointmentStatus,
} from "@/features/patient/appointment/appointment.types";
import { PatientPortal } from "@/features/patient/PatientPortal";
import { getAppointmentsForPatient } from "@/services/appointmentService";
import { useAuth } from "@/shared/context/AuthContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "./PatientAppointmentsPage.module.css";

type CalendarView = "day" | "week";
type AppointmentRange = "upcoming" | "past";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function appointmentDateTime(appointment: AppointmentRecord) {
  const startTime = appointment.slotTime.slice(0, 5);
  return new Date(`${appointment.date}T${startTime}:00`);
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  return weekStart;
}

function statusLabel(status: AppointmentStatus, lang: "vi" | "en") {
  const labels: Record<AppointmentStatus, { vi: string; en: string }> = {
    pending: { vi: "Chờ xác nhận", en: "Pending" },
    accepted: { vi: "Đã tiếp nhận", en: "Accepted" },
    declined: { vi: "Đã từ chối", en: "Declined" },
    completed: { vi: "Hoàn thành", en: "Completed" },
  };
  return labels[status][lang];
}

export function PatientAppointmentsPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [appointments] = useState(() =>
    user ? getAppointmentsForPatient(user.id) : [],
  );
  const [calendarView, setCalendarView] = useState<CalendarView>("week");
  const [range, setRange] = useState<AppointmentRange>("upcoming");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const today = new Date();
  const todayKey = dateKey(today);

  const rangeAppointments = appointments.filter((appointment) =>
    range === "past"
      ? appointmentDateTime(appointment).getTime() < Date.now()
      : appointmentDateTime(appointment).getTime() >= Date.now(),
  );
  const orderedAppointments = [...rangeAppointments].sort((first, second) =>
    `${first.date}T${first.slotTime}`.localeCompare(
      `${second.date}T${second.slotTime}`,
    ),
  );
  const weekStart = getWeekStart(selectedDate);
  const calendarDays = Array.from(
    { length: calendarView === "day" ? 1 : 7 },
    (_, index) => {
      const date =
        calendarView === "day" ? new Date(selectedDate) : new Date(weekStart);
      if (calendarView === "week") date.setDate(date.getDate() + index);
      return date;
    },
  );
  const selectedDayAppointments = orderedAppointments.filter(
    (appointment) => appointment.date === dateKey(selectedDate),
  );
  const periodTitle = new Intl.DateTimeFormat(lang, {
    ...(calendarView === "day"
      ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : { month: "long", year: "numeric" }),
  }).format(selectedDate);

  const changeRange = (nextRange: AppointmentRange) => {
    setRange(nextRange);
    const matching = appointments.filter((appointment) =>
      nextRange === "past"
        ? appointmentDateTime(appointment).getTime() < Date.now()
        : appointmentDateTime(appointment).getTime() >= Date.now(),
    );
    setSelectedDate(
      nextRange === "past" && matching.length > 0
        ? parseDate(matching[matching.length - 1].date)
        : new Date(),
    );
  };

  const moveCalendar = (direction: number) => {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(
        next.getDate() + direction * (calendarView === "day" ? 1 : 7),
      );
      return next;
    });
  };

  const setView = (view: CalendarView) => {
    setCalendarView(view);
  };

  return (
    <PatientPortal>
      <section className={styles.page}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              {lang === "vi" ? "SỨC KHỎE CỦA BẠN" : "YOUR HEALTH"}
            </span>
            <h1>{lang === "vi" ? "Lịch khám" : "Appointments"}</h1>
            <p>
              {lang === "vi"
                ? "Theo dõi lịch hẹn và trạng thái tiếp nhận của bạn."
                : "Review your visits and appointment status."}
            </p>
          </div>
          <Link className={styles.bookButton} to="/appointment">
            <Plus size={17} aria-hidden="true" />
            {lang === "vi" ? "Đặt lịch khám" : "Book appointment"}
          </Link>
        </div>

        <div className={styles.toolbar}>
          <div
            className={styles.rangeTabs}
            role="group"
            aria-label={lang === "vi" ? "Lọc lịch khám" : "Appointment range"}
          >
            {(["upcoming", "past"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={range === item ? styles.selectedTab : ""}
                aria-pressed={range === item}
                onClick={() => changeRange(item)}
              >
                {item === "upcoming"
                  ? lang === "vi"
                    ? "Sắp tới"
                    : "Upcoming"
                  : lang === "vi"
                    ? "Đã qua"
                    : "Past"}
              </button>
            ))}
          </div>
          <div
            className={styles.viewToggle}
            role="group"
            aria-label={lang === "vi" ? "Chế độ xem lịch" : "Calendar view"}
          >
            {(["day", "week"] as const).map((view) => (
              <button
                key={view}
                type="button"
                className={calendarView === view ? styles.selectedView : ""}
                aria-pressed={calendarView === view}
                onClick={() => setView(view)}
              >
                {view === "day"
                  ? lang === "vi"
                    ? "Ngày"
                    : "Day"
                  : lang === "vi"
                    ? "Tuần"
                    : "Week"}
              </button>
            ))}
          </div>
        </div>

        <section
          className={styles.calendar}
          aria-label={lang === "vi" ? "Lịch hẹn" : "Appointment calendar"}
        >
          <div className={styles.calendarToolbar}>
            <div className={styles.navigation}>
              <button
                type="button"
                onClick={() => moveCalendar(-1)}
                aria-label={
                  lang === "vi" ? "Khoảng thời gian trước" : "Previous period"
                }
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.todayButton}
                onClick={() => setSelectedDate(new Date())}
              >
                {lang === "vi" ? "Hôm nay" : "Today"}
              </button>
              <button
                type="button"
                onClick={() => moveCalendar(1)}
                aria-label={
                  lang === "vi" ? "Khoảng thời gian tiếp theo" : "Next period"
                }
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
            <h2>{periodTitle}</h2>
          </div>
          <div
            className={`${styles.calendarGrid} ${calendarView === "day" ? styles.dayGrid : ""}`}
          >
            {calendarDays.map((date) => {
              const key = dateKey(date);
              const dayAppointments = orderedAppointments.filter(
                (appointment) => appointment.date === key,
              );
              const isToday = key === todayKey;
              const isSelected = key === dateKey(selectedDate);
              const dayName = new Intl.DateTimeFormat(lang, {
                weekday: "short",
              }).format(date);
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.dayCell} ${isToday ? styles.today : ""} ${isSelected ? styles.selectedDay : ""}`}
                  onClick={() => {
                    setSelectedDate(date);
                    setCalendarView("day");
                  }}
                  aria-label={`${dayName} ${date.getDate()}, ${dayAppointments.length} ${lang === "vi" ? "lịch khám" : "appointments"}`}
                  aria-pressed={isSelected}
                >
                  <span className={styles.dayName}>{dayName}</span>
                  <strong>{date.getDate()}</strong>
                  <span className={styles.eventCount}>
                    {dayAppointments.length > 0
                      ? `${dayAppointments.length} ${lang === "vi" ? "lịch" : "visits"}`
                      : lang === "vi"
                        ? "Trống"
                        : "No visits"}
                  </span>
                  {dayAppointments.slice(0, 2).map((appointment) => (
                    <span
                      className={styles.eventTime}
                      key={appointment.bookingCode}
                    >
                      {appointment.slotTime.slice(0, 5)}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.appointments} aria-live="polite">
          <div className={styles.listHeading}>
            <div>
              <h2>
                {lang === "vi" ? "Chi tiết lịch khám" : "Appointment details"}
              </h2>
              <p>
                {new Intl.DateTimeFormat(lang, { dateStyle: "full" }).format(
                  selectedDate,
                )}
              </p>
            </div>
            <span className={styles.count}>
              {selectedDayAppointments.length}
            </span>
          </div>

          {selectedDayAppointments.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>
                <CalendarDays size={22} aria-hidden="true" />
              </span>
              <h3>
                {lang === "vi"
                  ? "Không có lịch khám trong ngày này"
                  : "No appointments on this day"}
              </h3>
              <p>
                {lang === "vi"
                  ? "Chọn ngày khác hoặc đặt lịch khám mới."
                  : "Choose another day or book a new appointment."}
              </p>
              {range === "upcoming" && (
                <Link to="/appointment">
                  {lang === "vi" ? "Đặt lịch khám" : "Book an appointment"}
                </Link>
              )}
            </div>
          ) : (
            <div className={styles.appointmentList}>
              {selectedDayAppointments.map((appointment) => {
                const specialty = APPOINTMENT_SPECIALTIES.find(
                  (item) => item.id === appointment.specialtyId,
                );
                const doctor = APPOINTMENT_DOCTORS.find(
                  (item) => item.id === appointment.doctorId,
                );
                return (
                  <article
                    className={styles.appointmentItem}
                    key={appointment.bookingCode}
                  >
                    <div className={styles.timeColumn}>
                      <Clock3 size={16} aria-hidden="true" />
                      <strong>{appointment.slotTime}</strong>
                    </div>
                    <div className={styles.appointmentInfo}>
                      <div className={styles.appointmentTitleRow}>
                        <h3>
                          {specialty?.name[lang] ??
                            (lang === "vi" ? "Lịch khám" : "Appointment")}
                        </h3>
                        <span
                          className={`${styles.status} ${styles[`status_${appointment.status}`]}`}
                        >
                          {statusLabel(appointment.status, lang)}
                        </span>
                      </div>
                      <p>
                        <Stethoscope size={14} aria-hidden="true" />
                        {doctor?.name[lang] ??
                          (lang === "vi"
                            ? "Bác sĩ theo ca"
                            : "Assigned doctor")}
                      </p>
                      <p>
                        <MapPin size={14} aria-hidden="true" />
                        {doctor?.hospital[lang] ?? "eClinic"}
                      </p>
                      <p className={styles.reason}>{appointment.reason}</p>
                      <span className={styles.bookingCode}>
                        {lang === "vi" ? "Mã lịch hẹn" : "Reference"}:{" "}
                        {appointment.bookingCode}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </PatientPortal>
  );
}
