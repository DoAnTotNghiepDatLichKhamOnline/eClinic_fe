import { useMemo, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { SectionHead } from '@/components/ui/SectionHead'
import { useLanguage } from '@/context/LanguageContext'
import { doctors, doctorsContent } from './doctors.data'
import { DoctorCard } from './DoctorCard'
import styles from './DoctorsSection.module.css'

export function DoctorsSection() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [location, setLocation] = useState('all')

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase()
    return doctors.filter((doctor) => {
      const matchesQuery = !q || [t(doctor.name), t(doctor.role), t(doctor.specialty), t(doctor.location)]
        .some((value) => value.toLowerCase().includes(q))
      const matchesSpecialty = specialty === 'all' || t(doctor.specialty) === specialty
      const matchesLocation = location === 'all' || t(doctor.location) === location
      return matchesQuery && matchesSpecialty && matchesLocation
    })
  }, [location, query, specialty, t])

  const specialties = Array.from(new Set(doctors.map((doctor) => t(doctor.specialty))))
  const locations = Array.from(new Set(doctors.map((doctor) => t(doctor.location))))

  return (
    <section className={styles.section} id="doctors">
      <Container>
        <SectionHead title={t(doctorsContent.title)} description={t(doctorsContent.description)} />

        <div className={styles.filters}>
          <label className={styles.searchBox}>
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(doctorsContent.searchPlaceholder)}
              aria-label={t(doctorsContent.searchPlaceholder)}
            />
          </label>
          <button className={styles.searchButton} type="button">{t(doctorsContent.search)}</button>
          <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} aria-label={t(doctorsContent.allSpecialties)}>
            <option value="all">{t(doctorsContent.allSpecialties)}</option>
            {specialties.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <select value={location} onChange={(event) => setLocation(event.target.value)} aria-label={t(doctorsContent.allLocations)}>
            <option value="all">{t(doctorsContent.allLocations)}</option>
            {locations.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>

        <div className={styles.grid}>
          {filteredDoctors.map((doctor) => <DoctorCard doctor={doctor} key={doctor.id} />)}
        </div>
      </Container>
    </section>
  )
}
