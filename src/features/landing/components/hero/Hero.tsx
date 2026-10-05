import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/shared/components/layout/Container'
import { Button } from '@/shared/components/ui/Button'
import { useLanguage } from '@/shared/context/LanguageContext'
import clinicInterior from '@/features/landing/assets/images/clinic-interior.jpg'
import { heroContent } from './hero.data'
import styles from './Hero.module.css'

export function Hero() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [specialtyId, setSpecialtyId] = useState('')
  const [location, setLocation] = useState('')
  const [bookingDate, setBookingDate] = useState('')

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/appointment', {
      state: {
        specialtyId: specialtyId || undefined,
        location: location || undefined,
        date: bookingDate || undefined,
      },
    })
  }

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
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate('/appointment')}
            >
              {t(heroContent.primaryCta)}
            </Button>
            <a href="#centers" className={`btn btn-outline ${styles.lightOutline}`}>
              <Button variant="outline" size="lg" className={styles.lightOutline}>
                {t(heroContent.secondaryCta)}
              </Button>
            </a>
          </div>
        </div>

        <form className={styles.booking} onSubmit={handleBookingSubmit}>
          <div className={styles.bookingTitle}>
            <span className={styles.bookingBar} />
            <div>
              <span className={styles.bookingEyebrow}>ONLINE APPOINTMENT</span>
              <h2>{t(heroContent.primaryCta)}</h2>
            </div>
          </div>

          <label>
            <span>{t({ vi: 'Chuyên khoa', en: 'Specialty' })}</span>
            <select
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
            >
              <option value="">{t({ vi: 'Chọn chuyên khoa', en: 'Select specialty' })}</option>
              <option value="pediatrics">{t({ vi: 'Nhi khoa', en: 'Pediatrics' })}</option>
              <option value="general-medicine">{t({ vi: 'Nội tổng quát', en: 'General medicine' })}</option>
              <option value="cardiology">{t({ vi: 'Tim mạch', en: 'Cardiology' })}</option>
              <option value="dermatology">{t({ vi: 'Da liễu', en: 'Dermatology' })}</option>
              <option value="ophthalmology">{t({ vi: 'Mắt', en: 'Ophthalmology' })}</option>
              <option value="orthopedics">{t({ vi: 'Cơ xương khớp', en: 'Orthopedics' })}</option>
              <option value="neurology">{t({ vi: 'Thần kinh', en: 'Neurology' })}</option>
            </select>
          </label>

          <label>
            <span>{t({ vi: 'Địa điểm', en: 'Location' })}</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">{t({ vi: 'Chọn cơ sở', en: 'Select center' })}</option>
              <option value="hcm">Hồ Chí Minh</option>
              <option value="hn">Hà Nội</option>
              <option value="dn">Đà Nẵng</option>
            </select>
          </label>

          <label>
            <span>{t({ vi: 'Thời gian', en: 'Date & time' })}</span>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </label>

          <button type="submit" className={styles.bookingSubmit}>
            {t({ vi: 'TÌM LỊCH TRỐNG', en: 'FIND AVAILABLE TIMES' })}
          </button>
        </form>
      </Container>
    </section>
  )
}
