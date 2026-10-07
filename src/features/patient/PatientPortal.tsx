import type { ReactNode } from "react";
import { CalendarDays, House } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import { useLanguage } from "@/shared/context/LanguageContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import styles from "./PatientPortal.module.css";

export function PatientPortal({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span>eClinic</span>
          <small>{lang === "vi" ? "Cổng bệnh nhân" : "Patient portal"}</small>
        </Link>
        <div className={styles.headerActions}>
          <Link
            to="/"
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
            <NavLink
              to="/patient/appointments"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <CalendarDays size={18} aria-hidden="true" />
              {lang === "vi" ? "Lịch khám" : "Appointments"}
            </NavLink>
          </nav>
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
