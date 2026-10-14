import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { identityService } from "@/services/identityService";
import { cx } from "@/utils/cx";
import styles from "./LanguageToggle.module.css";

export function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const changeLanguage = () => {
    const nextLanguage = lang === "en" ? "vi" : "en";
    toggleLanguage();
    void queryClient.invalidateQueries();
    if (user) {
      void identityService.capNhatNgonNgu(nextLanguage === "vi" ? "VI" : "EN");
    }
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={changeLanguage}
      aria-pressed={lang === "vi"}
      aria-label="Switch language"
    >
      <span className={cx(styles.opt, lang === "en" && styles.isActive)}>
        EN
      </span>
      <span className={styles.divider}>/</span>
      <span className={cx(styles.opt, lang === "vi" && styles.isActive)}>
        VI
      </span>
    </button>
  );
}
