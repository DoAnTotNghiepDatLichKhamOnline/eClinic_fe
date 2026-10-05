import { CalendarDays } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { Bilingual } from "@/types/i18n";
import styles from "./EmergencyFab.module.css";

const label: Bilingual = { en: "Book now", vi: "Đặt lịch ngay" };

export function EmergencyFab() {
  const { t } = useLanguage();

  return (
    <a href="#book" className={styles.fab} aria-label="Book an appointment">
      <span className={styles.pulse} aria-hidden="true" />
      <CalendarDays aria-hidden="true" />
      <span className={styles.label}>{t(label)}</span>
    </a>
  );
}
