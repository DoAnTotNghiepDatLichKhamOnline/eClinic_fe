import { Clock3, Mail, MapPin, Phone, PhoneCall, Siren } from 'lucide-react'
import { ButtonLink } from '@/shared/components/ui/Button'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { Hub } from './centers.data'
import { centersContent } from './centers.data'
import styles from './HubPanel.module.css'

export function HubPanel({ hub }: { hub: Hub }) {
  const { t } = useLanguage()
  const primary = hub.locations[0]

  return (
    <article className={styles.panel} id={`hub-panel-${hub.id}`}>
      <h3>{hub.cityName}</h3>

      {hub.id === 'hcmc' && (
        <div className={styles.locationTabs} aria-label="Các cơ sở tại Hồ Chí Minh">
          {hub.locations.map((location, index) => (
            <span key={location.name} className={index === 0 ? styles.locationTabActive : styles.locationTab}>
              {location.name}
            </span>
          ))}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.fact}>
          <MapPin aria-hidden="true" />
          <div>
            <strong>Địa chỉ</strong>
            <p>{primary.address}</p>
          </div>
        </div>

        <div className={styles.fact}>
          <Clock3 aria-hidden="true" />
          <div>
            <strong>Giờ khám bệnh</strong>
            <p>{primary.hours}</p>
          </div>
        </div>

        <div className={styles.fact}>
          <Phone aria-hidden="true" />
          <div>
            <strong>Điện thoại</strong>
            <p>{primary.phone}</p>
            <div className={styles.contactChips}>
              <a href={`tel:${primary.phone}`} aria-label="Gọi điện"><PhoneCall aria-hidden="true" size={16} /></a>
              <span>Zalo</span>
            </div>
          </div>
        </div>

        <div className={styles.fact}>
          <Mail className={styles.mailIcon} aria-hidden="true" />
          <div>
            <strong>Email:</strong>
            <p>{primary.email}</p>
          </div>
        </div>

        <div className={styles.emergencyBox}>
          <div className={styles.emergencyHeading}>
            <strong><Siren aria-hidden="true" size={16} /> {t(centersContent.emergencyBadge)}</strong>
            <span>24 GIỜ, 7 NGÀY MỘT TUẦN</span>
          </div>
          <div className={styles.emergencyNumbers}>
            <a href={`tel:${primary.emergency}`} className={styles.shortEmergency}>{primary.emergency}</a>
            <a href={`tel:${primary.emergency}`}>{primary.emergency}</a>
          </div>
          <p>{t(centersContent.emergencyNote)}</p>
        </div>

        <ButtonLink href="#book" variant="outline">
          {t(centersContent.bookAtCenter)}
        </ButtonLink>
      </div>
    </article>
  )
}
