import type { ReactNode } from "react";
import { CalendarDays, ClipboardList, House, LayoutDashboard, ShieldAlert, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import { useLanguage } from "@/shared/context/LanguageContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import styles from "./PatientPortal.module.css";

export function PatientPortal({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();

  const navItems = [
    {
      to: "/patient/dashboard",
      icon: <LayoutDashboard size={18} aria-hidden="true" />,
      label: lang === "vi" ? "Trang cá nhân" : "Dashboard",
    },
    {
      to: "/patient/account-info",
      icon: <UserRound size={18} aria-hidden="true" />,
      label: lang === "vi" ? "Thông tin tài khoản" : "Account Info",
    },
    {
      to: "/patient/patient-profile",
      icon: <ClipboardList size={18} aria-hidden="true" />,
      label: lang === "vi" ? "Hồ sơ bệnh nhân" : "Patient Profile",
    },
    {
      to: "/patient/my-appointments",
      icon: <CalendarDays size={18} aria-hidden="true" />,
      label: lang === "vi" ? "Lịch hẹn của tôi" : "My Appointments",
    },
    {
      to: "/patient/sessions",
      icon: <ShieldAlert size={18} aria-hidden="true" />,
      label: lang === "vi" ? "Thiết bị đăng nhập" : "Login Devices",
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/home" className={styles.brand}>
          <span>eClinic</span>
          <small>{lang === "vi" ? "Cổng bệnh nhân" : "Patient portal"}</small>
        </Link>
        <div className={styles.headerActions}>
          <Link
            to="/home"
            className={styles.homeLink}
            aria-label={lang === "vi" ? "Trang chủ" : "Home"}
          >
            <House size={17} aria-hidden="true" />
          </Link>
          <LanguageToggle />
          <UserProfile />
        </div>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <span className={styles.sidebarLabel}>
            {lang === "vi" ? "Không gian bệnh nhân" : "Patient workspace"}
          </span>
          <nav aria-label={lang === "vi" ? "Menu bệnh nhân" : "Patient menu"}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

