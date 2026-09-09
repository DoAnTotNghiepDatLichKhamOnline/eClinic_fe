import type { Bilingual } from '@/types/i18n'

export interface NavLink {
  href: string
  label: Bilingual
}

export const navLinks: NavLink[] = [
  { href: '#specialties', label: { en: 'Specialties', vi: 'Chuyên khoa' } },
  { href: '#centers', label: { en: 'Our Centers', vi: 'Cơ sở y tế' } },
  { href: '#doctors', label: { en: 'Doctors', vi: 'Bác sĩ' } },
  { href: '#portal', label: { en: 'Patient Portal', vi: 'Cổng bệnh nhân' } },
]

export const headerContent = {
  bookAppointment: { en: 'Book Appointment', vi: 'Đặt lịch khám' } satisfies Bilingual,
}
