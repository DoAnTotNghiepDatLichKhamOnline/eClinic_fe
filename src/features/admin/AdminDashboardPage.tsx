import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  CircleCheck,
  FolderOpen,
  House,
  Pencil,
  Plus,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import { AdminSidebar } from "./AdminSidebar";
import type { AdminSection } from "./AdminSidebar";
import styles from "./AdminDashboardPage.module.css";

const sectionLabels: Record<AdminSection, { en: string; vi: string }> = {
  dashboard: { en: "Dashboard", vi: "Bảng điều khiển" },
  schedule: { en: "Schedule Management", vi: "Quản lý lịch khám" },
  catalog: { en: "Medical Catalog", vi: "Danh mục y tế" },
  doctors: { en: "Doctor Management", vi: "Quản lý bác sĩ" },
  patients: { en: "Patient Management", vi: "Quản lý bệnh nhân" },
};

const sectionPaths: Record<AdminSection, string> = {
  dashboard: "dashboard",
  schedule: "schedule-management",
  catalog: "medical-catalog",
  doctors: "doctors",
  patients: "patients",
};

export function AdminDashboardPage({
  activeSection,
}: {
  activeSection: AdminSection;
}) {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const doctors = [
    {
      id: "DOC-01",
      name: "BS. Mattias Larsson",
      specialty: "Tim mạch",
      status: "Hoạt động",
      totalBookings: 142,
    },
    {
      id: "DOC-02",
      name: "BS. Rafi Kot",
      specialty: "Nhi khoa",
      status: "Hoạt động",
      totalBookings: 98,
    },
    {
      id: "DOC-03",
      name: "BS. Nguyễn Văn A",
      specialty: "Nội khoa",
      status: "Hoạt động",
      totalBookings: 215,
    },
    {
      id: "DOC-04",
      name: "BS. Trần Thị Bình",
      specialty: "Sản phụ khoa",
      status: "Hoạt động",
      totalBookings: 87,
    },
  ];
  const navigateToSection = (section: AdminSection) =>
    navigate(`/admin/${sectionPaths[section]}`);

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.topBar}>
        <div className={styles.topBarRow}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>
              eClinic Admin Control Panel
            </span>
            <span className={styles.brandTag}>
              {lang === "vi" ? "Quản trị hệ thống" : "System Admin"}
            </span>
          </div>

          <div className={styles.userInfo}>
            <LanguageToggle />
            <button
              type="button"
              className={styles.backHomeBtn}
              onClick={() => {
                navigate("/");
              }}
            >
              <House aria-hidden="true" size={15} />
            </button>
            <UserProfile />
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <AdminSidebar
          activeSection={activeSection}
          onSelect={navigateToSection}
        />
        <div className={styles.content}>
          <div className={styles.welcomeHeader}>
            <h1 className={styles.welcomeTitle}>
              {lang === "vi"
                ? sectionLabels[activeSection].vi
                : sectionLabels[activeSection].en}
            </h1>
            <p className={styles.welcomeSub}>
              {activeSection === "dashboard"
                ? lang === "vi"
                  ? "Quản lý tài khoản bác sĩ, lịch đặt khám và cấu hình hệ thống."
                  : "Manage doctors, appointment bookings, and system configurations."
                : lang === "vi"
                  ? `Không gian ${sectionLabels[activeSection].vi.toLowerCase()} của eClinic.`
                  : `eClinic ${sectionLabels[activeSection].en.toLowerCase()} workspace.`}
            </p>
          </div>

          {activeSection === "dashboard" && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Stethoscope aria-hidden="true" />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>24</span>
                  <span className={styles.statLabel}>
                    {lang === "vi" ? "Bác sĩ hoạt động" : "Active Doctors"}
                  </span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <UsersRound aria-hidden="true" />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>1,420</span>
                  <span className={styles.statLabel}>
                    {lang === "vi"
                      ? "Bệnh nhân đăng ký"
                      : "Registered Patients"}
                  </span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CalendarDays aria-hidden="true" />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>312</span>
                  <span className={styles.statLabel}>
                    {lang === "vi" ? "Lượt khám tháng này" : "Monthly Bookings"}
                  </span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Activity aria-hidden="true" />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>99.8%</span>
                  <span className={styles.statLabel}>
                    {lang === "vi" ? "Uptime hệ thống" : "System Uptime"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "doctors" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {lang === "vi" ? "Danh sách bác sĩ" : "Doctor Directory"}
                </h2>
                <button type="button" className={styles.actionBtn}>
                  <Plus aria-hidden="true" size={16} />
                  {lang === "vi" ? "Thêm bác sĩ mới" : "Add New Doctor"}
                </button>
              </div>
              <div className={styles.tableScroll}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Mã BS</th>
                      <th>Họ và Tên</th>
                      <th>Chuyên khoa</th>
                      <th>Lượt khám đã thực hiện</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <strong>{doc.id}</strong>
                        </td>
                        <td>
                          <strong>{doc.name}</strong>
                        </td>
                        <td>{doc.specialty}</td>
                        <td>{doc.totalBookings} ca</td>
                        <td>
                          <span
                            className={`${styles.badge} ${styles.badgeActive}`}
                          >
                            <CircleCheck aria-hidden="true" size={14} />{" "}
                            {doc.status}
                          </span>
                        </td>
                        <td>
                          <button type="button" className={styles.actionBtn}>
                            <Pencil aria-hidden="true" size={14} />
                            {lang === "vi" ? "Chỉnh sửa" : "Edit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection !== "dashboard" && activeSection !== "doctors" && (
            <section className={styles.sectionCard}>
              <div className={styles.emptyState}>
                <FolderOpen aria-hidden="true" size={32} />
                <h2>{lang === "vi" ? "Chưa có dữ liệu" : "No data yet"}</h2>
                <p>
                  {lang === "vi"
                    ? "Nội dung sẽ xuất hiện tại đây khi được cấu hình."
                    : "Content will appear here once it has been configured."}
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
