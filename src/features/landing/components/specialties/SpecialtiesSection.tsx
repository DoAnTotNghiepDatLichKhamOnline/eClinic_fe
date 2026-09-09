import { Container } from '@/components/layout/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { useLanguage } from '@/context/LanguageContext'
import { specialties, specialtiesContent } from './specialties.data'
import { SpecialtyCard } from './SpecialtyCard'
import styles from './SpecialtiesSection.module.css'

export function SpecialtiesSection() {
  const { t } = useLanguage()

  return (
    <section className={styles.section} id="specialties">
      <Container>
        <SectionHead
          title={t(specialtiesContent.title)}
          description={t(specialtiesContent.description)}
        />

        <div className={styles.grid}>
          {specialties.map((specialty) => (
            <SpecialtyCard specialty={specialty} key={specialty.id} />
          ))}
        </div>
      </Container>
    </section>
  )
}
