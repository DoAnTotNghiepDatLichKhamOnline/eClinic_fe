import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  User,
  X,
  CheckCircle,
  Clock3,
  Ban,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { PatientPortal } from "@/features/patient/PatientPortal";
import styles from "./MyAppointmentsPage.module.css";

/* ─── Mock Data ─── */
type Status = "upcoming" | "done" | "cancelled";

interface Appointment {
  id: number;
  date: string; // ISO
  time: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  patientName: string;
  isSelf: boolean;
  status: Status;
  note?: string;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1, date: "2026-10-18", time: "09:30", doctorName: "BS. Trần Thị Lan",
    specialty: "Nội tổng quát", clinic: "Phòng khám Đa khoa Gia Định",
    patientName: "Nguyễn Văn An", isSelf: true, status: "upcoming",
  },
  {
    id: 2, date: "2026-10-22", time: "14:00", doctorName: "BS.CK2 Lê Hoàng Nam",
    specialty: "Tim mạch", clinic: "Bệnh viện Chợ Rẫy",
    patientName: "Nguyễn Thị Bình (Mẹ)", isSelf: false, status: "upcoming",
  },
  {
    id: 3, date: "2026-09-10", time: "10:00", doctorName: "BS. Phạm Anh Tuấn",
    specialty: "Da liễu", clinic: "Phòng khám Thẩm mỹ Thu Cúc",
    patientName: "Nguyễn Văn An", isSelf: true, status: "done",
    note: "Đã khám, kê đơn thuốc. Tái khám sau 4 tuần.",
  },
  {
    id: 4, date: "2026-08-25", time: "08:00", doctorName: "BS. Đỗ Minh Châu",
    specialty: "Nhi khoa", clinic: "Bệnh viện Nhi Đồng 1",
    patientName: "Nguyễn Bảo Long (Con)", isSelf: false, status: "done",
  },
  {
    id: 5, date: "2026-09-05", time: "15:30", doctorName: "BS. Vũ Quang Huy",
    specialty: "Xương khớp", clinic: "Phòng khám CTCH",
    patientName: "Nguyễn Văn An", isSelf: true, status: "cancelled",
  },
];

const STATUS_CONFIG = {
  upcoming: { label: { vi: "Sắp tới", en: "Upcoming" }, cls: styles.badgeUpcoming, cardCls: styles.appointmentCardUpcoming, icon: <Clock3 size={11} /> },
  done: { label: { vi: "Đã khám", en: "Completed" }, cls: styles.badgeDone, cardCls: styles.appointmentCardDone, icon: <CheckCircle size={11} /> },
  cancelled: { label: { vi: "Đã hủy", en: "Cancelled" }, cls: styles.badgeCancelled, cardCls: styles.appointmentCardCancelled, icon: <Ban size={11} /> },
};

export function MyAppointmentsPage() {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [activeTab, setActiveTab] = useState<Status | "all">("upcoming");
  const [search, setSearch] = useState("");

  const filtered = MOCK_APPOINTMENTS.filter((a) => {
    const matchTab = activeTab === "all" || a.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.doctorName.toLowerCase().includes(q) ||
      a.specialty.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      a.clinic.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {
    all: MOCK_APPOINTMENTS.length,
    upcoming: MOCK_APPOINTMENTS.filter((a) => a.status === "upcoming").length,
    done: MOCK_APPOINTMENTS.filter((a) => a.status === "done").length,
    cancelled: MOCK_APPOINTMENTS.filter((a) => a.status === "cancelled").length,
  };

  const tabs: { key: Status | "all"; label: { vi: string; en: string } }[] = [
    { key: "upcoming", label: { vi: "Sắp tới", en: "Upcoming" } },
    { key: "done", label: { vi: "Đã khám", en: "Completed" } },
    { key: "cancelled", label: { vi: "Đã hủy", en: "Cancelled" } },
    { key: "all", label: { vi: "Tất cả", en: "All" } },
  ];

  return (
    <PatientPortal>
      <div className={styles.page}>
      {/* ─── Page Header ─── */}
      <div className={styles.pageHeader}>
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
            placeholder={vi ? "Tìm bác sĩ, chuyên khoa, bệnh nhân..." : "Search doctor, specialty, patient..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── List ─── */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarDays size={48} />
          <p className={styles.emptyStateTitle}>
            {vi ? "Không có lịch hẹn nào" : "No appointments found"}
          </p>
          <p className={styles.emptyStateDesc}>
            {vi ? "Thử thay đổi bộ lọc hoặc đặt lịch mới." : "Try adjusting your filters or book a new appointment."}
          </p>
        </div>
      ) : (
        <div className={styles.appointmentList} role="list">
          {filtered.map((appt) => {
            const d = new Date(appt.date);
            const cfg = STATUS_CONFIG[appt.status];
            return (
              <div
                key={appt.id}
                role="listitem"
                className={`${styles.appointmentCard} ${cfg.cardCls}`}
              >
                {/* Date block */}
                <div className={`${styles.dateBlock} ${appt.status === "done" ? styles.dateBlockDone : appt.status === "cancelled" ? styles.dateBlockCancelled : ""}`}>
                  <span className={styles.dateDay}>
                    {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit" })}
                  </span>
                  <span className={styles.dateMonth}>
                    {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { month: "short" })}
                  </span>
                </div>

                {/* Info */}
                <div className={styles.appointmentInfo}>
                  <div className={styles.appointmentDoctor}>{appt.doctorName}</div>
                  <div className={styles.appointmentMeta}>
                    <span className={styles.appointmentMetaItem}>
                      <Stethoscope size={12} />
                      {appt.specialty}
                    </span>
                    <span className={styles.appointmentMetaItem}>
                      <Clock size={12} />
                      {appt.time}
                    </span>
                    <span className={styles.appointmentMetaItem}>
                      <MapPin size={12} />
                      {appt.clinic}
                    </span>
                  </div>
                  <div className={styles.patientTag}>
                    <User size={10} />
                    {appt.patientName}
                    {appt.isSelf ? (vi ? " (Bản thân)" : " (Self)") : ""}
                  </div>
                  {appt.note && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#667068", fontStyle: "italic" }}>
                      {appt.note}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.appointmentActions}>
                  <span className={`${styles.badge} ${cfg.cls}`}>
                    {cfg.icon}
                    {cfg.label[lang]}
                  </span>
                  {appt.status === "upcoming" && (
                    <>
                      <button className={`${styles.btnSmall} ${styles.btnSmallOutline}`}>
                        {vi ? "Chi tiết" : "Details"}
                      </button>
                      <button className={`${styles.btnSmall} ${styles.btnSmallDanger}`}>
                        <X size={11} />
                        {vi ? "Hủy lịch" : "Cancel"}
                      </button>
                    </>
                  )}
                  {appt.status === "done" && (
                    <button className={`${styles.btnSmall} ${styles.btnSmallPrimary}`}>
                      {vi ? "Xem kết quả" : "View result"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </PatientPortal>
  );
}
