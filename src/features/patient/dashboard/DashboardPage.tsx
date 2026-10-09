import {
  CalendarDays,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { PatientPortal } from "@/features/patient/PatientPortal";
import styles from "./DashboardPage.module.css";

/* ─── Mock Data ─── */
const MOCK = {
  upcomingAppointments: [
    { id: 1, date: "2026-10-18", time: "09:30", doctorName: "BS. Trần Thị Lan", specialty: "Nội tổng quát" },
    { id: 2, date: "2026-10-22", time: "14:00", doctorName: "BS.CK2 Lê Hoàng Nam", specialty: "Tim mạch" },
  ],
  recentVisits: [
    { id: 3, date: "2026-09-10", doctorName: "BS. Phạm Anh Tuấn", specialty: "Da liễu" },
    { id: 4, date: "2026-08-25", doctorName: "BS. Đỗ Minh Châu", specialty: "Nhi khoa" },
    { id: 5, date: "2026-08-01", doctorName: "BS. Ngô Thành Đạt", specialty: "Tai - Mũi - Họng" },
  ],
  family: [
    { id: 1, name: "Nguyễn Thị Bình", relation: { vi: "Mẹ", en: "Mother" } },
    { id: 2, name: "Nguyễn Bảo Long", relation: { vi: "Con trai", en: "Son" } },
    { id: 3, name: "Nguyễn Thị Mai", relation: { vi: "Vợ", en: "Wife" } },
  ],
  stats: {
    totalAppointments: 12,
    upcoming: 2,
    completed: 9,
    familyCount: 3,
  },
};

const STAT_CARDS = (vi: boolean) => [
  { label: vi ? "Tổng lịch hẹn" : "Total appointments", value: MOCK.stats.totalAppointments, color: "#8b5cf6", bg: "#f5f3ff", icon: <CalendarDays size={18} /> },
  { label: vi ? "Sắp tới" : "Upcoming", value: MOCK.stats.upcoming, color: "#d97706", bg: "#fef3c7", icon: <Clock size={18} /> },
  { label: vi ? "Đã khám" : "Completed", value: MOCK.stats.completed, color: "#1a9c6e", bg: "#e8f5ef", icon: <CheckCircle size={18} /> },
  { label: vi ? "Người thân" : "Family members", value: MOCK.stats.familyCount, color: "#3b82f6", bg: "#eff6ff", icon: <Users size={18} /> },
];

export function DashboardPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const vi = lang === "vi";

  const displayName = user?.name ?? "Nguyễn Văn An";
  const initials = displayName.trim().split(/\s+/).slice(-2).map((p) => p[0]).join("").toUpperCase();

  return (
    <PatientPortal>
      <div className={styles.page}>
      {/* ─── Page Header ─── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderIcon}>
          <LayoutDashboard size={22} />
        </div>
        <div>
          <h1 className={styles.pageTitle}>
            {vi ? "Trang cá nhân" : "Personal Dashboard"}
          </h1>
          <p className={styles.pageSubtitle}>
            {vi ? "Tổng quan nhanh về hồ sơ và lịch hẹn" : "A quick overview of your profile and appointments"}
          </p>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className={styles.statsRow}>
        {STAT_CARDS(vi).map((s) => (
          <div className={styles.statCard} key={s.label}>
            <div className={styles.statCardIcon} style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className={styles.statCardNumber} style={{ color: s.color }}>
              {s.value}
            </div>
            <div className={styles.statCardLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Profile snapshot ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <ClipboardList size={16} />
            {vi ? "Hồ sơ của tôi" : "My Profile"}
          </h2>
          <Link to="/patient/account-info" className={styles.cardLinkBtn}>
            {vi ? "Chỉnh sửa" : "Edit"} <ChevronRight size={13} />
          </Link>
        </div>
        <div className={styles.profileSection}>
          <div className={styles.avatarMd}>{initials}</div>
          <div>
            <div className={styles.profileName}>{displayName}</div>
            <div className={styles.profileRole}>{vi ? "Bệnh nhân" : "Patient"}</div>
            <div className={styles.profileMeta}>
              {user?.email && (
                <span className={styles.profileMetaItem}>
                  <Mail size={12} /> {user.email}
                </span>
              )}
              {user?.phone && (
                <span className={styles.profileMetaItem}>
                  <Phone size={12} /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Upcoming Appointments ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <CalendarDays size={16} />
            {vi ? "Lịch hẹn sắp tới" : "Upcoming Appointments"}
          </h2>
          <Link to="/patient/my-appointments" className={styles.cardLinkBtn}>
            {vi ? "Xem tất cả" : "View all"} <ChevronRight size={13} />
          </Link>
        </div>
        {MOCK.upcomingAppointments.length === 0 ? (
          <p className={styles.emptyMini}>{vi ? "Không có lịch hẹn sắp tới." : "No upcoming appointments."}</p>
        ) : (
          <div className={styles.upcomingList}>
            {MOCK.upcomingAppointments.map((a) => {
              const d = new Date(a.date);
              return (
                <div className={styles.upcomingItem} key={a.id}>
                  <div className={styles.upcomingDate}>
                    <span className={styles.upcomingDay}>
                      {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit" })}
                    </span>
                    <span className={styles.upcomingMonth}>
                      {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { month: "short" })}
                    </span>
                  </div>
                  <div className={styles.upcomingInfo}>
                    <div className={styles.upcomingDoctor}>{a.doctorName}</div>
                    <div className={styles.upcomingSpecialty}>{a.specialty}</div>
                  </div>
                  <div className={styles.upcomingTime}>{a.time}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Recent Visits ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <CheckCircle size={16} />
            {vi ? "Lượt khám gần đây" : "Recent Visits"}
          </h2>
          <Link to="/patient/my-appointments" className={styles.cardLinkBtn}>
            {vi ? "Xem tất cả" : "View all"} <ChevronRight size={13} />
          </Link>
        </div>
        <div className={styles.upcomingList}>
          {MOCK.recentVisits.map((v) => (
            <div className={styles.recentItem} key={v.id}>
              <div className={styles.recentDot} />
              <div className={styles.recentInfo}>
                <div className={styles.recentDoctor}>{v.doctorName}</div>
                <div className={styles.recentDate}>
                  {new Date(v.date).toLocaleDateString(vi ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                  {" · "}{v.specialty}
                </div>
              </div>
              <span className={styles.recentBadge}>{vi ? "Đã khám" : "Done"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Family Members ─── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Users size={16} />
            {vi ? "Người thân đã lưu" : "Saved Family Members"}
          </h2>
        </div>
        <div className={styles.familyList}>
          {MOCK.family.map((f) => {
            const fi = f.name.trim().split(/\s+/).slice(-2).map((p) => p[0]).join("").toUpperCase();
            return (
              <div className={styles.familyPill} key={f.id}>
                <div className={styles.familyAvatar}>{fi}</div>
                <div>
                  <div>{f.name}</div>
                  <div className={styles.familyRelation}>{f.relation[lang]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </PatientPortal>
  );
}
