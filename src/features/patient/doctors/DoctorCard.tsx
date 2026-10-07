import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { Doctor } from "./doctors.data";
import styles from "./DoctorCard.module.css";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const { t } = useLanguage();

  return (
    <Link to={`/doctors/${doctor.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={doctor.image} alt={t(doctor.name)} className={styles.image} />
      </div>
      <div className={styles.content}>
        <span className={styles.specialty}>{t(doctor.specialty)}</span>
        <h3 className={styles.name}>{t(doctor.name)}</h3>
        <p className={styles.role}>{t(doctor.role)}</p>

        <div className={styles.meta}>
          <span>
            <strong>{t({ en: "Location:", vi: "Địa điểm:" })}</strong>{" "}
            {t(doctor.location)}
          </span>
          <span>
            <strong>{t({ en: "Languages:", vi: "Ngôn ngữ:" })}</strong>{" "}
            {t(doctor.languages)}
          </span>
        </div>
      </div>
    </Link>
  );
}
