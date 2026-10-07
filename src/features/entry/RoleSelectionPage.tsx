import { ArrowUpRight, Settings2, Stethoscope, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "./RoleSelectionPage.module.css";

const roles = [
  {
    key: "patient",
    path: "/login",
    number: "01",
    Icon: UserRound,
    tone: "patient",
    vi: {
      title: "Bệnh nhân",
      description: "Tìm bác sĩ, chọn chuyên khoa và đặt lịch khám trực tuyến.",
      action: "Vào trang bệnh nhân",
    },
    en: {
      title: "Patient",
      description:
        "Find a doctor, explore specialties, and book a visit online.",
      action: "Go to patient home",
    },
  },
  {
    key: "doctor",
    path: "/doctor/login",
    number: "02",
    Icon: Stethoscope,
    tone: "doctor",
    vi: {
      title: "Bác sĩ",
      description: "Theo dõi lịch làm việc, yêu cầu đặt khám và hồ sơ tư vấn.",
      action: "Đăng nhập bác sĩ",
    },
    en: {
      title: "Doctor",
      description: "Manage work schedules, appointment requests, and visits.",
      action: "Doctor sign in",
    },
  },
  {
    key: "admin",
    path: "/admin/login",
    number: "03",
    Icon: Settings2,
    tone: "admin",
    vi: {
      title: "Quản trị viên",
      description: "Quản lý danh mục y tế, lịch khám và vận hành hệ thống.",
      action: "Đăng nhập quản trị",
    },
    en: {
      title: "Administrator",
      description:
        "Manage the medical catalog, schedules, and system operations.",
      action: "Administrator sign in",
    },
  },
] as const;

export function RoleSelectionPage() {
  const { lang } = useLanguage();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>
            {lang === "vi"
              ? "MỘT HỆ THỐNG, BA KHÔNG GIAN"
              : "ONE SYSTEM, THREE SPACES"}
          </span>
          <h1>
            {lang === "vi" ? (
              <>
                Bạn đang dùng eClinic
                <br />
                <em>với vai trò nào?</em>
              </>
            ) : (
              <>
                Choose your
                <br />
                <em>eClinic workspace.</em>
              </>
            )}
          </h1>
          <p>
            {lang === "vi"
              ? "Chọn không gian phù hợp để tiếp tục."
              : "Select the workspace that fits your role."}
          </p>
        </div>

        <div className={styles.roleList}>
          {roles.map(({ key, path, number, Icon, tone, vi, en }) => {
            const copy = lang === "vi" ? vi : en;
            return (
              <Link
                key={key}
                to={path}
                className={`${styles.role} ${styles[tone]}`}
              >
                <span className={styles.roleNumber}>{number}</span>
                <span className={styles.roleIcon}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className={styles.roleCopy}>
                  <strong>{copy.title}</strong>
                  <span>{copy.description}</span>
                  <span className={styles.roleAction}>
                    {copy.action}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <span>eClinic</span>
          <span>
            {lang === "vi"
              ? "Chăm sóc sức khỏe kết nối"
              : "Connected healthcare"}
          </span>
        </footer>
      </main>
    </div>
  );
}
