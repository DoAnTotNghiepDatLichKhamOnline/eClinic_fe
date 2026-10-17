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
import { useTrangCaNhan } from "@/hooks/useBooking";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const vi = lang === "vi";

  const { dashboard, isLoading } = useTrangCaNhan();

  const displayName = user?.name ?? dashboard?.hoSo?.hoTen ?? "Người bệnh";
  const initials = displayName.trim().split(/\s+/).slice(-2).map((p) => p[0]).join("").toUpperCase();

  const statCards = [
    {
      label: vi ? "Tổng lịch hẹn" : "Total appointments",
      value: dashboard?.soLich?.lichSu ?? 0,
      color: "#8b5cf6",
      bg: "#f5f3ff",
      icon: <CalendarDays size={18} />,
    },
    {
      label: vi ? "Sắp tới" : "Upcoming",
      value: dashboard?.soLich?.sapToiCuaToi ?? 0,
      color: "#d97706",
      bg: "#fef3c7",
      icon: <Clock size={18} />,
    },
    {
      label: vi ? "Đã khám" : "Completed",
      value: dashboard?.soLich?.daKham ?? 0,
      color: "#1a9c6e",
      bg: "#e8f5ef",
      icon: <CheckCircle size={18} />,
    },
    {
      label: vi ? "Người thân" : "Family members",
      value: dashboard?.nguoiThan?.length ?? 0,
      color: "#3b82f6",
      bg: "#eff6ff",
      icon: <Users size={18} />,
    },
  ];

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
          {statCards.map((s) => (
            <div className={styles.statCard} key={s.label}>
              <div className={styles.statCardIcon} style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className={styles.statCardNumber} style={{ color: s.color }}>
                {isLoading ? "..." : s.value}
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
                {(user?.email || dashboard?.emailTaiKhoan) && (
                  <span className={styles.profileMetaItem}>
                    <Mail size={12} /> {user?.email || dashboard?.emailTaiKhoan}
                  </span>
                )}
                {(user?.phone || dashboard?.hoSo?.soDienThoai) && (
                  <span className={styles.profileMetaItem}>
                    <Phone size={12} /> {user?.phone || dashboard?.hoSo?.soDienThoai}
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
          {isLoading ? (
            <p className={styles.emptyMini}>{vi ? "Đang tải dữ liệu..." : "Loading..."}</p>
          ) : !dashboard?.lichSapToi?.cuaToi || dashboard.lichSapToi.cuaToi.length === 0 ? (
            <p className={styles.emptyMini}>{vi ? "Không có lịch hẹn sắp tới." : "No upcoming appointments."}</p>
          ) : (
            <div className={styles.upcomingList}>
              {dashboard.lichSapToi.cuaToi.map((a) => {
                const d = new Date(a.ngay);
                return (
                  <div className={styles.upcomingItem} key={a.maPhieuKham}>
                    <div className={styles.upcomingDate}>
                      <span className={styles.upcomingDay}>
                        {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit" })}
                      </span>
                      <span className={styles.upcomingMonth}>
                        {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { month: "short" })}
                      </span>
                    </div>
                    <div className={styles.upcomingInfo}>
                      <div className={styles.upcomingDoctor}>{a.bacSi.hoTen}</div>
                      <div className={styles.upcomingSpecialty}>{a.tenChuyenKhoa}</div>
                    </div>
                    <div className={styles.upcomingTime}>{a.gioKhamDuKien}</div>
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
          {isLoading ? (
            <p className={styles.emptyMini}>{vi ? "Đang tải..." : "Loading..."}</p>
          ) : !dashboard?.lanKhamGanDay || dashboard.lanKhamGanDay.length === 0 ? (
            <p className={styles.emptyMini}>{vi ? "Chưa có lượt khám nào." : "No recent visits."}</p>
          ) : (
            <div className={styles.upcomingList}>
              {dashboard.lanKhamGanDay.map((v) => (
                <Link
                  to="/patient/my-appointments"
                  className={styles.recentItem}
                  key={v.lichHen.maPhieuKham}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className={styles.recentDot} />
                  <div className={styles.recentInfo}>
                    <div className={styles.recentDoctor}>{v.lichHen.bacSi.hoTen}</div>
                    <div className={styles.recentDate}>
                      {new Date(v.lichHen.ngay).toLocaleDateString(vi ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                      {" · "}{v.lichHen.tenChuyenKhoa}
                    </div>
                    {v.ketQua?.chanDoan && (
                      <div style={{ fontSize: "11px", color: "#0f766e", marginTop: "2px", fontWeight: 500 }}>
                        {vi ? "Chẩn đoán: " : "Diagnosis: "}{v.ketQua.chanDoan}
                      </div>
                    )}
                  </div>
                  <span className={styles.recentBadge}>{vi ? "Đã khám" : "Done"}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ─── Family Members ─── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Users size={16} />
              {vi ? "Người thân đã lưu" : "Saved Family Members"}
            </h2>
          </div>
          {isLoading ? (
            <p className={styles.emptyMini}>{vi ? "Đang tải..." : "Loading..."}</p>
          ) : !dashboard?.nguoiThan || dashboard.nguoiThan.length === 0 ? (
            <p className={styles.emptyMini}>{vi ? "Chưa có thông tin người thân." : "No saved family members."}</p>
          ) : (
            <div className={styles.familyList}>
              {dashboard.nguoiThan.map((f) => {
                const fi = f.hoTen.trim().split(/\s+/).slice(-2).map((p) => p[0]).join("").toUpperCase();
                return (
                  <div className={styles.familyPill} key={f.id}>
                    <div className={styles.familyAvatar}>{fi}</div>
                    <div>
                      <div>{f.hoTen}</div>
                      <div className={styles.familyRelation}>
                        {f.nguoiGiamHo ? (vi ? "Con" : "Child") : f.gioiTinh === "NU" ? (vi ? "Mẹ / Vợ" : "Mother / Wife") : (vi ? "Người thân" : "Family")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PatientPortal>
  );
}
