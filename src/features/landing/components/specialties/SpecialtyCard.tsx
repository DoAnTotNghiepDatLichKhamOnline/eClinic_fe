import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { cx } from "@/utils/cx";
import type { Specialty } from "./specialties.data";
import { specialtiesContent } from "./specialties.data";
import styles from "./SpecialtyCard.module.css";

export function SpecialtyCard({ specialty }: { specialty: Specialty }) {
  const { t } = useLanguage();
  const Icon = specialty.icon;

  return (
    <article className={cx(styles.card, specialty.featured && styles.featured)}>
      <Icon className={styles.icon} />
      <h3>{t(specialty.name)}</h3>

      {specialty.description && (
        <p className={styles.desc}>{t(specialty.description)}</p>
      )}

      <ul className={styles.list}>
        {specialty.items.map((item) => (
          <li key={t(item)}>{t(item)}</li>
        ))}
      </ul>

      {specialty.featured && (
        <Link
          className={styles.link}
          to="/appointment"
          state={{ specialtyId: specialty.id }}
        >
          {t(specialtiesContent.bookLink)}
        </Link>
      )}
    </article>
  );
}
