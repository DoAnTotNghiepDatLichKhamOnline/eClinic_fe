import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  User,
  X,
  CheckCircle,
  Clock3,
  Ban,
  Loader2,
  Activity,
  Pill,
  FileText,
  CalendarClock,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { PatientPortal } from "@/features/patient/PatientPortal";
import type { LichHenCuaToiResponse } from "@/types/booking.type";
import type { TrangThaiLichHen } from "@/types/common.type";
import {
  useBookingActions,
  useChiTietLichHen,
  useDanhSachLichHen,
} from "@/hooks/useBooking";
import styles from "./MyAppointmentsPage.module.css";

type TabStatus = "upcoming" | "done" | "cancelled";

const getApptCategory = (status: TrangThaiLichHen): TabStatus => {
  if (status === "DA_HOAN_THANH") return "done";
  if (
    status === "DA_HUY" ||
    status === "BI_TU_CHOI" ||
    status === "DA_HUY_DO_DOI_LICH"
  )
    return "cancelled";
  return "upcoming";
};

const STATUS_CONFIG = {
  upcoming: {
    label: { vi: "Sắp tới", en: "Upcoming" },
    cls: styles.badgeUpcoming,
    cardCls: styles.appointmentCardUpcoming,
    icon: <Clock3 size={11} />,
  },
  done: {
    label: { vi: "Đã khám", en: "Completed" },
    cls: styles.badgeDone,
    cardCls: styles.appointmentCardDone,
    icon: <CheckCircle size={11} />,
  },
  cancelled: {
    label: { vi: "Đã hủy", en: "Cancelled" },
    cls: styles.badgeCancelled,
    cardCls: styles.appointmentCardCancelled,
    icon: <Ban size={11} />,
  },
};

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function MyAppointmentsPage() {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [scheduleView, setScheduleView] = useState<"day" | "week">("week");
  const [scheduleDate, setScheduleDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    toDateKey(new Date()),
  );
  const [activeTab, setActiveTab] = useState<TabStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"TAT_CA" | "BAN_THAN" | "NGUOI_KHAC">(
    "TAT_CA",
  );
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [newShiftId, setNewShiftId] = useState("");
  const [newSpecialtyId, setNewSpecialtyId] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { danhSach: appointments } = useDanhSachLichHen({
    loc: "TAT_CA",
    cuaAi: scope,
  });
  const { chiTiet, isLoading: loadingDetail } = useChiTietLichHen(
    selectedTicket ?? undefined,
  );
  const {
    huyLich,
    isCancelling,
    doiLich,
    isRescheduling,
    danhGia,
    isSubmittingReview,
    suaDanhGia,
    isUpdatingReview,
  } = useBookingActions();

  useEffect(() => {
    if (chiTiet?.danhGia) {
      setReviewStars(chiTiet.danhGia.soSao);
      setReviewText(chiTiet.danhGia.nhanXet ?? "");
    } else {
      setReviewStars(5);
      setReviewText("");
    }
  }, [chiTiet]);

  const handleCancel = async (maPhieuKham: string) => {
    if (
      !window.confirm(
        vi ? "Bạn có chắc muốn hủy lịch hẹn này?" : "Cancel this appointment?",
      )
    )
      return;
    setActionError("");
    try {
      await huyLich({ maPhieuKham, data: {} });
    } catch (error) {
      setActionError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (vi
            ? "Không thể hủy lịch hẹn."
            : "Could not cancel the appointment."),
      );
    }
  };

  const handleReschedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket || !newSlot) return;
    setActionError("");
    try {
      await doiLich({
        maPhieuKham: selectedTicket,
        data: {
          ...(newShiftId
            ? { idLichLamViec: Number(newShiftId) }
            : { idChuyenKhoa: Number(newSpecialtyId) }),
          gioBatDauKhung: newSlot,
        },
      });
      setSelectedTicket(null);
    } catch (error) {
      setActionError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (vi ? "Không thể đổi lịch." : "Could not reschedule."),
      );
    }
  };

  const handleReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket) return;
    setActionError("");
    const data = {
      soSao: reviewStars,
      nhanXet: reviewText.trim() || undefined,
    };
    try {
      if (chiTiet?.danhGia)
        await suaDanhGia({ maPhieuKham: selectedTicket, data });
      else await danhGia({ maPhieuKham: selectedTicket, data });
    } catch (error) {
      setActionError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (vi ? "Không thể lưu đánh giá." : "Could not save the review."),
      );
    }
  };

  const filtered: LichHenCuaToiResponse[] = appointments.filter((a) => {
    const category = getApptCategory(a.trangThai);
    const matchTab = activeTab === "all" || category === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.bacSi.hoTen.toLowerCase().includes(q) ||
      a.tenChuyenKhoa.toLowerCase().includes(q) ||
      a.hoTenBenhNhan.toLowerCase().includes(q) ||
      a.phongKham.tenPhong.toLowerCase().includes(q) ||
      a.maPhieuKham.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {
    all: appointments.length,
    upcoming: appointments.filter(
      (a) => getApptCategory(a.trangThai) === "upcoming",
    ).length,
    done: appointments.filter((a) => getApptCategory(a.trangThai) === "done")
      .length,
    cancelled: appointments.filter(
      (a) => getApptCategory(a.trangThai) === "cancelled",
    ).length,
  };

  const tabs: { key: TabStatus | "all"; label: { vi: string; en: string } }[] =
    [
      { key: "all", label: { vi: "Tất cả", en: "All" } },
      { key: "upcoming", label: { vi: "Sắp tới", en: "Upcoming" } },
      { key: "done", label: { vi: "Đã khám", en: "Completed" } },
      { key: "cancelled", label: { vi: "Đã hủy", en: "Cancelled" } },
    ];

  // Calendar calculations (exact logic like Doctor workspace)
  const weekStart = new Date(scheduleDate);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  const calendarDays = Array.from(
    { length: scheduleView === "day" ? 1 : 7 },
    (_, index) => {
      const date = new Date(scheduleView === "day" ? scheduleDate : weekStart);
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

  const selectedDayAppointments = filtered.filter(
    (a) => a.ngay === selectedDate,
  );

  const renderAppointmentCard = (appt: LichHenCuaToiResponse) => {
    const d = new Date(appt.ngay);
    const category = getApptCategory(appt.trangThai);
    const cfg = STATUS_CONFIG[category];
    return (
      <div
        key={appt.maPhieuKham}
        role="listitem"
        className={`${styles.appointmentCard} ${cfg.cardCls}`}
      >
        {/* Date block */}
        <div
          className={`${styles.dateBlock} ${category === "done" ? styles.dateBlockDone : category === "cancelled" ? styles.dateBlockCancelled : ""}`}
        >
          <span className={styles.dateDay}>
            {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit" })}
          </span>
          <span className={styles.dateMonth}>
            {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { month: "short" })}
          </span>
        </div>

        {/* Info */}
        <div className={styles.appointmentInfo}>
          <div className={styles.appointmentDoctor}>{appt.bacSi.hoTen}</div>
          <div className={styles.appointmentMeta}>
            <span className={styles.appointmentMetaItem}>
              <Stethoscope size={12} />
              {appt.tenChuyenKhoa}
            </span>
            <span className={styles.appointmentMetaItem}>
              <Clock size={12} />
              {appt.gioKhamDuKien}
            </span>
            <span className={styles.appointmentMetaItem}>
              <MapPin size={12} />
              {appt.phongKham.tenPhong}
            </span>
          </div>
          <div className={styles.patientTag}>
            <User size={10} />
            {appt.hoTenBenhNhan}
            {appt.laBanThan ? (vi ? " (Bản thân)" : " (Self)") : ""}
          </div>
          {appt.lyDoKham && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "#667068",
                fontStyle: "italic",
              }}
            >
              {appt.lyDoKham}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className={styles.appointmentActions}>
          <span className={`${styles.badge} ${cfg.cls}`}>
            {cfg.icon}
            {cfg.label[lang]}
          </span>
          {category === "upcoming" && (
            <>
              <button
                type="button"
                className={`${styles.btnSmall} ${styles.btnSmallOutline}`}
                onClick={() => setSelectedTicket(appt.maPhieuKham)}
              >
                {vi ? "Chi tiết" : "Details"}
              </button>
              {appt.duocHuyDoi && (
                <button
                  type="button"
                  className={`${styles.btnSmall} ${styles.btnSmallOutline}`}
                  onClick={() => setSelectedTicket(appt.maPhieuKham)}
                >
                  {vi ? "Đổi lịch" : "Reschedule"}
                </button>
              )}
              {appt.duocHuyDoi && (
                <button
                  type="button"
                  className={`${styles.btnSmall} ${styles.btnSmallDanger}`}
                  disabled={isCancelling}
                  onClick={() => void handleCancel(appt.maPhieuKham)}
                >
                  <X size={11} />
                  {vi ? "Hủy lịch" : "Cancel"}
                </button>
              )}
            </>
          )}
          {category === "done" && (
            <button
              type="button"
              className={`${styles.btnSmall} ${styles.btnSmallPrimary}`}
              onClick={() => setSelectedTicket(appt.maPhieuKham)}
            >
              {vi ? "Xem kết quả" : "View result"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <PatientPortal>
      <div className={styles.page}>
        {/* ─── Page Header ─── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageHeaderIcon}>
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>
                {vi ? "Lịch hẹn của tôi" : "My Appointments"}
              </h1>
              <p className={styles.pageSubtitle}>
                {vi
                  ? "Xem và quản lý lịch hẹn của bạn và người thân"
                  : "View and manage your appointments and family members'"}
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Calendar vs List */}
          <div
            className={styles.segmented}
            role="group"
            aria-label={vi ? "Chế độ xem" : "View mode"}
          >
            <button
              type="button"
              className={viewMode === "calendar" ? styles.selected : ""}
              aria-pressed={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar size={13} aria-hidden="true" />
              {vi ? "Lịch khám" : "Calendar"}
            </button>
            <button
              type="button"
              className={viewMode === "list" ? styles.selected : ""}
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              <List size={13} aria-hidden="true" />
              {vi ? "Danh sách" : "List"}
            </button>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className={styles.tabBar} role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label[lang]}
              <span className={styles.tabCount}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* ─── Filter bar ─── */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              id="appointment-search"
              className={styles.searchInput}
              placeholder={
                vi
                  ? "Tìm bác sĩ, chuyên khoa, bệnh nhân..."
                  : "Search doctor, specialty, patient..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            aria-label={
              vi ? "Lọc lịch theo người khám" : "Filter appointments by patient"
            }
            className={styles.searchInput}
            value={scope}
            onChange={(event) => setScope(event.target.value as typeof scope)}
          >
            <option value="TAT_CA">
              {vi ? "Tất cả lịch" : "All appointments"}
            </option>
            <option value="BAN_THAN">
              {vi ? "Lịch của tôi" : "My appointments"}
            </option>
            <option value="NGUOI_KHAC">
              {vi ? "Lịch người thân" : "Family appointments"}
            </option>
          </select>
        </div>

        {/* ─── Main Content ─── */}
        {viewMode === "calendar" ? (
          <>
            {/* Calendar Widget (like Doctor Workspace) */}
            <section
              className={styles.calendar}
              aria-label={vi ? "Lịch hẹn khám" : "Appointment calendar"}
            >
              <div className={styles.calendarToolbar}>
                <div className={styles.calendarNavigation}>
                  <button
                    type="button"
                    onClick={() => moveCalendar(-1)}
                    aria-label={
                      vi ? "Khoảng thời gian trước" : "Previous period"
                    }
                  >
                    <ChevronLeft size={17} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setScheduleDate(today);
                      setSelectedDate(toDateKey(today));
                    }}
                  >
                    {vi ? "Hôm nay" : "Today"}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCalendar(1)}
                    aria-label={
                      vi ? "Khoảng thời gian tiếp theo" : "Next period"
                    }
                  >
                    <ChevronRight size={17} aria-hidden="true" />
                  </button>
                </div>

                <h2>{calendarTitle}</h2>

                {/* Day / Week segmented switch */}
                <div
                  className={styles.segmented}
                  role="group"
                  aria-label={vi ? "Chế độ xem lịch" : "Schedule view"}
                >
                  <button
                    type="button"
                    className={scheduleView === "day" ? styles.selected : ""}
                    aria-pressed={scheduleView === "day"}
                    onClick={() => setScheduleView("day")}
                  >
                    {vi ? "Ngày" : "Day"}
                  </button>
                  <button
                    type="button"
                    className={scheduleView === "week" ? styles.selected : ""}
                    aria-pressed={scheduleView === "week"}
                    onClick={() => setScheduleView("week")}
                  >
                    {vi ? "Tuần" : "Week"}
                  </button>
                </div>
              </div>

              <div
                className={`${styles.calendarGrid} ${scheduleView === "day" ? styles.calendarDay : ""}`}
              >
                {calendarDays.map((date) => {
                  const dateKey = toDateKey(date);
                  const isSelected = selectedDate === dateKey;
                  const dayAppts = filtered.filter((a) => a.ngay === dateKey);
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
                      key={date.toISOString()}
                      className={`${styles.calendarDayCell} ${isToday(date) ? styles.calendarToday : ""} ${isSelected ? styles.calendarDayCellSelected : ""}`}
                      onClick={() => {
                        setSelectedDate(dateKey);
                        setScheduleDate(date);
                        if (scheduleView === "day") {
                          // Already in day view
                        }
                      }}
                      aria-label={`${dayLabel} ${dateLabel}`}
                    >
                      <span className={styles.calendarDayName}>{dayLabel}</span>
                      <strong className={styles.calendarDate}>
                        {date.getDate()}
                      </strong>

                      {dayAppts.length > 0 ? (
                        <div className={styles.calendarApptList}>
                          {dayAppts.map((appt) => {
                            const category = getApptCategory(appt.trangThai);
                            const apptClass =
                              category === "done"
                                ? styles.calendarApptDone
                                : category === "cancelled"
                                  ? styles.calendarApptCancelled
                                  : styles.calendarApptUpcoming;

                            return (
                              <div
                                key={appt.maPhieuKham}
                                className={`${styles.calendarApptItem} ${apptClass}`}
                              >
                                <span className={styles.calendarApptTime}>
                                  <Clock3 size={11} aria-hidden="true" />
                                  {appt.gioKhamDuKien}
                                </span>
                                <span className={styles.calendarApptDoctor}>
                                  {appt.bacSi.hoTen}
                                </span>
                                <span className={styles.calendarApptSpecialty}>
                                  {appt.tenChuyenKhoa}
                                </span>
                                <span className={styles.calendarApptPatient}>
                                  {appt.hoTenBenhNhan}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className={styles.calendarOff}>
                          {vi ? "Không có lịch" : "No appointments"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Selected Date Appointments Section */}
            <section className={styles.selectedDaySection}>
              <div className={styles.selectedDayHeader}>
                <h3 className={styles.selectedDayTitle}>
                  <CalendarDays size={18} />
                  {vi
                    ? `Lịch hẹn ngày ${new Date(selectedDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}`
                    : `Appointments on ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}`}
                  <span
                    style={{ fontSize: 12, fontWeight: 500, color: "#5d7367" }}
                  >
                    ({selectedDayAppointments.length}{" "}
                    {vi ? "lịch hẹn" : "appointments"})
                  </span>
                </h3>
                {scheduleView === "week" && (
                  <button
                    type="button"
                    className={`${styles.btnSmall} ${styles.btnSmallOutline}`}
                    onClick={() => {
                      setScheduleDate(new Date(selectedDate + "T00:00:00"));
                      setScheduleView("day");
                    }}
                  >
                    {vi ? "Xem chi tiết ngày" : "View day details"}
                  </button>
                )}
              </div>

              {selectedDayAppointments.length === 0 ? (
                <div
                  style={{
                    padding: "18px 0",
                    color: "#66786e",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {vi
                    ? "Không có lịch hẹn nào trong ngày này. Bạn có thể chọn ngày khác trên lịch để xem."
                    : "No appointments scheduled for this day. Select another date on the calendar."}
                </div>
              ) : (
                <div className={styles.appointmentList} role="list">
                  {selectedDayAppointments.map((appt) =>
                    renderAppointmentCard(appt),
                  )}
                </div>
              )}
            </section>
          </>
        ) : /* List Mode */
        filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <CalendarDays size={48} />
            <p className={styles.emptyStateTitle}>
              {vi ? "Không có lịch hẹn nào" : "No appointments found"}
            </p>
            <p className={styles.emptyStateDesc}>
              {vi
                ? "Thử thay đổi bộ lọc hoặc đặt lịch mới."
                : "Try adjusting your filters or book a new appointment."}
            </p>
          </div>
        ) : (
          <div className={styles.appointmentList} role="list">
            {filtered.map((appt) => renderAppointmentCard(appt))}
          </div>
        )}
      </div>
      {actionError && (
        <p
          role="alert"
          className="mx-auto max-w-5xl px-5 pb-4 text-sm text-rose-700"
        >
          {actionError}
        </p>
      )}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTicket(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={vi ? "Chi tiết lịch hẹn" : "Appointment details"}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-bold uppercase text-emerald-800">
                  {vi ? "Phiếu khám" : "Appointment ticket"}
                </p>
                <h2 className="mt-1 text-xl font-bold">{selectedTicket}</h2>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-slate-600"
                onClick={() => setSelectedTicket(null)}
              >
                {vi ? "Đóng" : "Close"}
              </button>
            </div>
            {loadingDetail ? (
              <p className="py-8 text-sm text-slate-500">
                {vi ? "Đang tải..." : "Loading..."}
              </p>
            ) : (
              chiTiet && (
                <div className="space-y-6 py-5">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p>
                      <b>{vi ? "Bác sĩ" : "Doctor"}:</b>{" "}
                      {chiTiet.lichHen.bacSi.hoTen}
                    </p>
                    <p>
                      <b>{vi ? "Bệnh nhân" : "Patient"}:</b>{" "}
                      {chiTiet.lichHen.hoTenBenhNhan}
                    </p>
                    <p>
                      <b>{vi ? "Ngày giờ" : "Date/time"}:</b>{" "}
                      {chiTiet.lichHen.ngay} · {chiTiet.lichHen.gioKhamDuKien}
                    </p>
                    <p>
                      <b>{vi ? "Trạng thái" : "Status"}:</b>{" "}
                      {chiTiet.lichHen.trangThai}
                    </p>
                  </div>
                  {chiTiet.ketQua && (
                    <section className="border-t border-slate-200 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <FileText size={18} className="text-emerald-700" />
                          {vi ? "Hồ sơ kết quả khám & Bệnh án" : "Medical Examination Record"}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {vi ? "Đã có kết luận" : "Completed Record"}
                        </span>
                      </div>

                      {/* Lý do & Khám lâm sàng */}
                      {(chiTiet.ketQua.lyDoKham || chiTiet.ketQua.khamLamSang) && (
                        <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1.5 border border-slate-200/70">
                          {chiTiet.ketQua.lyDoKham && (
                            <p>
                              <b className="text-slate-900">{vi ? "Lý do khám:" : "Chief complaint:"} </b>
                              {chiTiet.ketQua.lyDoKham}
                            </p>
                          )}
                          {chiTiet.ketQua.khamLamSang && (
                            <p>
                              <b className="text-slate-900">{vi ? "Khám lâm sàng:" : "Clinical notes:"} </b>
                              {chiTiet.ketQua.khamLamSang}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Chẩn đoán & ICD-10 */}
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
                        <div className="flex items-start gap-2 text-xs">
                          <span className="font-bold text-emerald-900 shrink-0 mt-0.5">
                            {vi ? "Chẩn đoán xác định:" : "Primary diagnosis:"}
                          </span>
                          <span className="font-semibold text-slate-900 text-sm">
                            {chiTiet.ketQua.chanDoan}
                          </span>
                        </div>
                        {(chiTiet.ketQua.icdChinh || chiTiet.ketQua.maIcdChinh) && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-emerald-900 shrink-0">
                              {vi ? "Mã bệnh (ICD-10):" : "ICD-10 Code:"}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-mono font-bold text-xs">
                              {chiTiet.ketQua.icdChinh ? `${chiTiet.ketQua.icdChinh.ma} - ${chiTiet.ketQua.icdChinh.ten}` : chiTiet.ketQua.maIcdChinh}
                            </span>
                          </div>
                        )}
                        {chiTiet.ketQua.chanDoanKemTheo && (
                          <div className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="font-medium shrink-0">{vi ? "Chẩn đoán kèm theo:" : "Secondary diagnosis:"}</span>
                            <span>{chiTiet.ketQua.chanDoanKemTheo}</span>
                          </div>
                        )}
                      </div>

                      {/* Chỉ số sinh hiệu */}
                      {chiTiet.ketQua.sinhHieu && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <Activity size={14} className="text-rose-500" />
                            {vi ? "Chỉ số sinh hiệu đo được" : "Vital Signs"}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {(chiTiet.ketQua.sinhHieu.huyetApTamThu || chiTiet.ketQua.sinhHieu.huyetApTamTruong) && (
                              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">{vi ? "Huyết áp" : "Blood pressure"}</span>
                                <strong className="text-slate-800 text-sm">
                                  {chiTiet.ketQua.sinhHieu.huyetApTamThu ?? "—"} / {chiTiet.ketQua.sinhHieu.huyetApTamTruong ?? "—"}{" "}
                                  <span className="text-[11px] font-normal text-slate-500">mmHg</span>
                                </strong>
                              </div>
                            )}
                            {chiTiet.ketQua.sinhHieu.mach !== undefined && (
                              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">{vi ? "Mạch" : "Pulse"}</span>
                                <strong className="text-slate-800 text-sm">
                                  {chiTiet.ketQua.sinhHieu.mach}{" "}
                                  <span className="text-[11px] font-normal text-slate-500">{vi ? "nhịp/phút" : "bpm"}</span>
                                </strong>
                              </div>
                            )}
                            {chiTiet.ketQua.sinhHieu.nhietDo !== undefined && (
                              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">{vi ? "Thân nhiệt" : "Temp"}</span>
                                <strong className="text-slate-800 text-sm">
                                  {chiTiet.ketQua.sinhHieu.nhietDo}{" "}
                                  <span className="text-[11px] font-normal text-slate-500">°C</span>
                                </strong>
                              </div>
                            )}
                            {chiTiet.ketQua.sinhHieu.nhipTho !== undefined && (
                              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">{vi ? "Nhịp thở" : "Respiration"}</span>
                                <strong className="text-slate-800 text-sm">
                                  {chiTiet.ketQua.sinhHieu.nhipTho}{" "}
                                  <span className="text-[11px] font-normal text-slate-500">{vi ? "lần/phút" : "bpm"}</span>
                                </strong>
                              </div>
                            )}
                            {chiTiet.ketQua.sinhHieu.canNang !== undefined && (
                              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">{vi ? "Cân nặng" : "Weight"}</span>
                                <strong className="text-slate-800 text-sm">
                                  {chiTiet.ketQua.sinhHieu.canNang}{" "}
                                  <span className="text-[11px] font-normal text-slate-500">kg</span>
                                </strong>
                              </div>
                            )}
                            {chiTiet.ketQua.sinhHieu.chieuCao !== undefined && (
                              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">{vi ? "Chiều cao" : "Height"}</span>
                                <strong className="text-slate-800 text-sm">
                                  {chiTiet.ketQua.sinhHieu.chieuCao}{" "}
                                  <span className="text-[11px] font-normal text-slate-500">cm</span>
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Đơn thuốc */}
                      {chiTiet.ketQua.donThuoc && chiTiet.ketQua.donThuoc.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <Pill size={14} className="text-blue-500" />
                            {vi ? "Đơn thuốc được kê" : "Prescription"}
                          </h4>
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                                <tr>
                                  <th className="p-2.5">#</th>
                                  <th className="p-2.5">{vi ? "Tên thuốc / Hoạt chất" : "Medication"}</th>
                                  <th className="p-2.5">{vi ? "Liều dùng & Cách dùng" : "Dosage & Usage"}</th>
                                  <th className="p-2.5">{vi ? "Số ngày" : "Days"}</th>
                                  <th className="p-2.5">{vi ? "Số lượng" : "Qty"}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {chiTiet.ketQua.donThuoc.map((medicine, index) => (
                                  <tr key={`${medicine.tenThuoc}-${index}`} className="hover:bg-slate-50/50">
                                    <td className="p-2.5 font-medium text-slate-400">{index + 1}</td>
                                    <td className="p-2.5">
                                      <strong className="text-slate-800 block">{medicine.tenThuoc}</strong>
                                      {medicine.hamLuong && (
                                        <span className="text-[11px] text-slate-500">{medicine.hamLuong}</span>
                                      )}
                                      {medicine.hoatChat && (
                                        <span className="text-[11px] text-slate-400 block italic">({medicine.hoatChat})</span>
                                      )}
                                    </td>
                                    <td className="p-2.5">
                                      <span className="font-medium text-slate-700">{medicine.lieuDung}</span>
                                      {medicine.soLanMoiNgay && (
                                        <span className="text-[11px] text-slate-500 block">
                                          {medicine.soLanMoiNgay} {vi ? "lần/ngày" : "times/day"}
                                        </span>
                                      )}
                                      {medicine.ghiChuSuDung && (
                                        <span className="text-[11px] text-blue-600 block mt-0.5">
                                          {medicine.ghiChuSuDung}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2.5 font-medium text-slate-700">
                                      {medicine.soNgayDung ? `${medicine.soNgayDung} ${vi ? "ngày" : "days"}` : "—"}
                                    </td>
                                    <td className="p-2.5 font-bold text-slate-800">
                                      {medicine.soLuong ?? "—"} {medicine.donVi || ""}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Lời dặn & Tái khám */}
                      {(chiTiet.ketQua.ghiChu || chiTiet.ketQua.ngayTaiKhamDeXuat) && (
                        <div className="rounded-xl bg-amber-50/60 border border-amber-200/80 p-3.5 text-xs text-amber-900 space-y-1.5">
                          {chiTiet.ketQua.ghiChu && (
                            <p>
                              <b className="text-amber-950">{vi ? "Lời dặn của bác sĩ:" : "Doctor's instructions:"} </b>
                              {chiTiet.ketQua.ghiChu}
                            </p>
                          )}
                          {chiTiet.ketQua.ngayTaiKhamDeXuat && (
                            <p className="flex items-center gap-1.5 font-semibold text-amber-950">
                              <CalendarClock size={14} className="text-amber-700" />
                              {vi ? "Hẹn tái khám đề xuất:" : "Suggested follow-up:"}{" "}
                              {new Date(chiTiet.ketQua.ngayTaiKhamDeXuat).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </div>
                      )}
                    </section>
                  )}
                  {chiTiet.lichHen.duocHuyDoi && (
                    <form
                      className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"
                      onSubmit={(event) => void handleReschedule(event)}
                    >
                      <h3 className="font-semibold sm:col-span-2">
                        {vi ? "Đổi sang khung giờ khác" : "Reschedule"}
                      </h3>
                      <label className="grid gap-1 text-xs">
                        {vi
                          ? "Mã ca (hoặc dùng chuyên khoa)"
                          : "Shift ID (or use specialty)"}
                        <input
                          className="border border-slate-300 px-3 py-2 text-sm"
                          value={newShiftId}
                          onChange={(event) =>
                            setNewShiftId(event.target.value)
                          }
                        />
                      </label>
                      {!newShiftId && (
                        <label className="grid gap-1 text-xs">
                          {vi ? "Mã chuyên khoa" : "Specialty ID"}
                          <input
                            required
                            className="border border-slate-300 px-3 py-2 text-sm"
                            value={newSpecialtyId}
                            onChange={(event) =>
                              setNewSpecialtyId(event.target.value)
                            }
                          />
                        </label>
                      )}
                      <label className="grid gap-1 text-xs">
                        {vi ? "Khung giờ bắt đầu" : "Slot start"}
                        <input
                          required
                          type="datetime-local"
                          className="border border-slate-300 px-3 py-2 text-sm"
                          value={newSlot}
                          onChange={(event) => setNewSlot(event.target.value)}
                        />
                      </label>
                      <button
                        className="self-end bg-emerald-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        disabled={isRescheduling}
                      >
                        {isRescheduling ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : vi ? (
                          "Xác nhận đổi lịch"
                        ) : (
                          "Confirm reschedule"
                        )}
                      </button>
                    </form>
                  )}
                  {chiTiet.duocDanhGia && (
                    <form
                      className="grid gap-3 border-t border-slate-200 pt-4"
                      onSubmit={(event) => void handleReview(event)}
                    >
                      <h3 className="font-semibold">
                        {chiTiet.danhGia
                          ? vi
                            ? "Cập nhật đánh giá"
                            : "Update review"
                          : vi
                            ? "Đánh giá lượt khám"
                            : "Rate this visit"}
                      </h3>
                      <label className="grid max-w-xs gap-1 text-xs">
                        {vi ? "Số sao" : "Rating"}
                        <select
                          className="border border-slate-300 px-3 py-2 text-sm"
                          value={reviewStars}
                          onChange={(event) =>
                            setReviewStars(Number(event.target.value))
                          }
                        >
                          {[5, 4, 3, 2, 1].map((stars) => (
                            <option value={stars} key={stars}>
                              {stars} / 5
                            </option>
                          ))}
                        </select>
                      </label>
                      <textarea
                        className="min-h-24 border border-slate-300 px-3 py-2 text-sm"
                        maxLength={1000}
                        placeholder={
                          vi
                            ? "Nhận xét (không bắt buộc)"
                            : "Comment (optional)"
                        }
                        value={reviewText}
                        onChange={(event) => setReviewText(event.target.value)}
                      />
                      <button
                        className="w-fit bg-emerald-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        disabled={isSubmittingReview || isUpdatingReview}
                      >
                        {isSubmittingReview || isUpdatingReview ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : vi ? (
                          "Lưu đánh giá"
                        ) : (
                          "Save review"
                        )}
                      </button>
                    </form>
                  )}
                  {actionError && (
                    <p role="alert" className="text-sm text-rose-700">
                      {actionError}
                    </p>
                  )}
                </div>
              )
            )}
          </section>
        </div>
      )}
    </PatientPortal>
  );
}
