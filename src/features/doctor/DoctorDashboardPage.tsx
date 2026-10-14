import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CircleCheck,
  Clock3,
  FolderOpen,
  House,
  Star,
  Stethoscope,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import styles from "./DoctorDashboardPage.module.css";
import { DoctorNotificationCenter } from "./DoctorNotificationCenter";
import { DoctorSidebar, type DoctorSection } from "./DoctorSidebar";
import { DoctorSearchBar } from "./DoctorSearchBar";
import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/services/bookingService";

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const sectionPaths: Record<DoctorSection, string> = {
  dashboard: "dashboard",
  schedule: "work-schedule",
  appointments: "appointment-requests",
  consultation: "consultation",
  profile: "profile",
};

interface DoctorDashboardPageProps {
  activeSection: DoctorSection | null;
  children?: React.ReactNode;
}

export function DoctorDashboardPage({
  activeSection,
  children,
}: DoctorDashboardPageProps) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const today = localDateKey(new Date());
  const { data: summaryResponse, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["booking", "doctor-summary"],
    queryFn: () => bookingService.getTongQuanBacSi(),
  });
  const { data: appointmentsResponse, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["booking", "doctor-today", today],
    queryFn: () => bookingService.getLichHenBacSiTheoNgay({ ngay: today }),
  });
  const summary = summaryResponse?.duLieu;
  const appointments = appointmentsResponse?.duLieu?.noiDung ?? [];
  const navigateToSection = (section: DoctorSection) =>
    navigate(`/doctor/${sectionPaths[section]}`);

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.topBar}>
        <div className={styles.topBarRow}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>eClinic Doctor Portal</span>
            <span className={styles.brandTag}>
              {lang === "vi" ? "Bác sĩ chuyên khoa" : "Specialist Doctor"}
            </span>
          </div>

          <DoctorSearchBar />

          <div className={styles.userInfo}>
            <DoctorNotificationCenter onNavigate={navigateToSection} />
            <LanguageToggle />
            <button
              type="button"
              className={styles.backHomeBtn}
              onClick={() => {
                navigate("/home");
              }}
            >
              <House aria-hidden="true" size={15} />
            </button>
            <UserProfile />
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <DoctorSidebar
          activeSection={activeSection ?? "dashboard"}
          onSelect={navigateToSection}
        />
        <div className={styles.dashboardContent}>
          {activeSection ? (
            children
          ) : (
            <>
              <div className={styles.welcomeHeader}>
                <h1 className={styles.welcomeTitle}>
                  {lang === "vi"
                    ? "Chào bác sĩ, chúc một ngày làm việc hiệu quả!"
                    : "Welcome Doctor, have a great day!"}
                </h1>
                <p className={styles.welcomeSub}>
                  {lang === "vi"
                    ? "Tổng quan lịch khám bệnh và danh sách bệnh nhân chờ trong ngày."
                    : "Overview of your appointment schedule and patient waiting list for today."}
                </p>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CalendarDays aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{isLoadingSummary ? "..." : summary?.lichHenHomNay ?? summary?.caHomNay ?? 0}</span>
                    <span className={styles.statLabel}>
                      {lang === "vi"
                        ? "Lịch khám hôm nay"
                        : "Today's Appointments"}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Clock3 aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{isLoadingSummary ? "..." : summary?.dangCho ?? 0}</span>
                    <span className={styles.statLabel}>
                      {lang === "vi"
                        ? "Bệnh nhân chờ khám"
                        : "Patients Waiting"}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CircleCheck aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{isLoadingSummary ? "..." : summary?.daKham ?? 0}</span>
                    <span className={styles.statLabel}>
                      {lang === "vi" ? "Đã hoàn thành" : "Completed Exams"}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Star aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{isLoadingSummary ? "..." : summary?.diemDanhGia ?? summary?.danhGiaTrungBinh ?? "—"}</span>
                    <span className={styles.statLabel}>
                      {lang === "vi" ? "Đánh giá trung bình" : "Average Rating"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    {lang === "vi"
                      ? "Danh sách Bệnh nhân Khám Hôm nay"
                      : "Today's Patient Schedule"}
                  </h2>
                </div>

                <table className={styles.patientTable}>
                  <thead>
                    <tr>
                      <th>Mã HS</th>
                      <th>Giờ khám</th>
                      <th>Tên bệnh nhân</th>
                      <th>Tuổi</th>
                      <th>Lý do khám</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingAppointments ? <tr><td colSpan={7}>{lang === "vi" ? "Đang tải lịch hẹn..." : "Loading appointments..."}</td></tr> : appointments.map((apt) => (
                      <tr key={apt.maPhieuKham}>
                        <td>
                          <strong>{apt.maTraCuu}</strong>
                        </td>
                        <td>{apt.gioKhamDuKien}</td>
                        <td>
                          <strong>{apt.hoTenBenhNhan}</strong>
                        </td>
                        <td>{apt.ngaySinhBenhNhan ? new Date().getFullYear() - Number(apt.ngaySinhBenhNhan.slice(0, 4)) : "—"}</td>
                        <td>{apt.lyDoKham}</td>
                        <td>
                          {apt.trangThai === "CHO_XAC_NHAN" && (
                            <span
                              className={`${styles.badge} ${styles.badgeWaiting}`}
                            >
                              <Clock3 aria-hidden="true" size={14} /> Chờ khám
                            </span>
                          )}
                          {apt.trangThai === "DA_XAC_NHAN" && (
                            <span
                              className={`${styles.badge} ${styles.badgeProgress}`}
                            >
                              <Stethoscope aria-hidden="true" size={14} /> Đang
                              khám
                            </span>
                          )}
                          {apt.trangThai === "DA_HOAN_THANH" && (
                            <span
                              className={`${styles.badge} ${styles.badgeDone}`}
                            >
                              <CircleCheck aria-hidden="true" size={14} /> Hoàn
                              thành
                            </span>
                          )}
                        </td>
                        <td>
                          <button type="button" className={styles.actionBtn} onClick={() => navigate(`/doctor/consultation?ma=${encodeURIComponent(apt.maTraCuu)}`)}>
                            {apt.trangThai === "DA_HOAN_THANH" && (
                              <FolderOpen aria-hidden="true" size={14} />
                            )}
                            {apt.trangThai === "DA_HOAN_THANH" ? "Xem hồ sơ" : "Khám bệnh"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!isLoadingAppointments && appointments.length === 0 && <tr><td colSpan={7}>{lang === "vi" ? "Hôm nay chưa có lịch hẹn." : "No appointments today."}</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
