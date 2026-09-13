import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import clinicInterior from '@/features/landing/assets/images/clinic-interior.jpg'
import { heroContent } from './hero.data'
import styles from './Hero.module.css'

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className={styles.hero}>
      <img className={styles.background} src={clinicInterior} alt="Phòng khám eClinic" />
      <div className={styles.overlay} />

      <Container className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.kicker}>{t(heroContent.kicker)}</p>
          <h1 className={styles.headline}>
            {t(heroContent.headline).split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>
          <p className={styles.sub}>{t(heroContent.sub)}</p>
          <div className={styles.actions}>
            <ButtonLink href="#book" variant="accent" size="lg">
              {t(heroContent.primaryCta)}
            </ButtonLink>
            <ButtonLink href="#centers" variant="outline" size="lg" className={styles.lightOutline}>
              {t(heroContent.secondaryCta)}
            </ButtonLink>
          </div>
        </div>

        <form className={styles.booking} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.bookingTitle}>
            <span className={styles.bookingBar} />
            <div>
              <span className={styles.bookingEyebrow}>ONLINE APPOINTMENT</span>
              <h2>{t(heroContent.primaryCta)}</h2>
            </div>
          </div>

          <label>
            <span>{t({ vi: 'Chuyên khoa', en: 'Specialty' })}</span>
            <select defaultValue="">
              <option value="" disabled>{t({ vi: 'Chọn chuyên khoa', en: 'Select specialty' })}</option>
              <option>{t({ vi: 'Nội tổng quát', en: 'General medicine' })}</option>
              <option>{t({ vi: 'Tim mạch', en: 'Cardiology' })}</option>
              <option>{t({ vi: 'Nhi khoa', en: 'Pediatrics' })}</option>
              <option>{t({ vi: 'Da liễu', en: 'Dermatology' })}</option>
            </select>
          </label>

          <label>
            <span>{t({ vi: 'Địa điểm', en: 'Location' })}</span>
            <select defaultValue="">
              <option value="" disabled>{t({ vi: 'Chọn cơ sở', en: 'Select center' })}</option>
              <option>Hồ Chí Minh</option>
              <option>Hà Nội</option>
              <option>Đà Nẵng</option>
            </select>
          </label>

          <label>
            <span>{t({ vi: 'Thời gian', en: 'Date & time' })}</span>
            <input type="date" />
          </label>

          <button type="submit" className={styles.bookingSubmit}>
            {t({ vi: 'TÌM LỊCH TRỐNG', en: 'FIND AVAILABLE TIMES' })}
          </button>
        </form>
      </Container>
    </section>
  )
}
