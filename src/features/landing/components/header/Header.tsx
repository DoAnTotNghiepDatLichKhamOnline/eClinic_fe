import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { Container } from "@/shared/components/layout/Container";
import { IconLogo } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import { cx } from "@/utils/cx";
import { navLinks } from "./header.data";
import { LanguageToggle } from "./LanguageToggle";
import styles from "./Header.module.css";

export function Header() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cx(styles.header, scrolled && styles.scrolled)}>
      <Container className={styles.row}>
        <Link to="/home" className={styles.brand} aria-label="eClinic">
          <IconLogo className={styles.brandMark} />
          <span className={styles.brandName}>
            e<em>Clinic</em>
          </span>
        </Link>

        <nav
          id="primary-nav"
          className={cx(styles.nav, menuOpen && styles.navOpen)}
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.searchBtn}
            aria-label="Search"
          >
            <Search aria-hidden="true" size={18} />
          </button>
          <LanguageToggle />

          {user ? (
            <UserProfile className={styles.profile} />
          ) : (
            <Button
              variant="ghostDark"
              size="sm"
              className={styles.loginBtn}
              onClick={() => navigate("/entry")}
            >
              {lang === "vi" ? "Đăng nhập" : "Login"}
            </Button>
          )}

          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </Container>
    </header>
  );
}
