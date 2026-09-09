import { Container } from '@/components/layout/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { useLanguage } from '@/context/LanguageContext'
import { centersContent, hubs } from './centers.data'
import { HubPanel } from './HubPanel'
import styles from './CentersSection.module.css'

export function CentersSection() {
  const { t } = useLanguage()

  return (
    <section className={styles.section} id="centers">
      <Container>
        <SectionHead
          tight
          title={t(centersContent.title)}
          description={t(centersContent.description)}
        />
        <div className={styles.grid}>
          {hubs.map((hub) => (
            <HubPanel key={hub.id} hub={hub} />
          ))}
        </div>
      </Container>
    </section>
  )
}
