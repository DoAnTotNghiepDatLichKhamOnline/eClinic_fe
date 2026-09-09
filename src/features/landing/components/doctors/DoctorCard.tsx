import type { Doctor } from './doctors.data'
import { useLanguage } from '@/context/LanguageContext'
import styles from './DoctorCard.module.css'

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { t } = useLanguage()

  return (
    <article className={styles.card}>
      <div className={styles.photoWrap}>
        <img className={styles.photo} src={doctor.image} alt={t(doctor.name)} />
      </div>
      <div className={styles.content}>
        <div className={styles.nameRow}>
          <h3>{t(doctor.name)}</h3>
          <span className={styles.badge}>{t(doctor.specialty)}</span>
        </div>
        <p className={styles.role}>{t(doctor.role)}</p>
        <div className={styles.meta}>
          <p><strong>{t({ en: 'Location', vi: 'Địa điểm' })}:</strong> {t(doctor.location)}</p>
          <p><strong>{t({ en: 'Nationality', vi: 'Quốc tịch' })}:</strong> {t(doctor.nationality)}</p>
          <p><strong>{t({ en: 'Languages', vi: 'Ngôn ngữ' })}:</strong> {t(doctor.languages)}</p>
        </div>
        <button className={styles.profileButton} type="button">{t({ en: 'View profile', vi: 'Xem hồ sơ' })}</button>
      </div>
    </article>
  )
}
