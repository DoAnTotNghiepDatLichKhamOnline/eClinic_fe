import type { Bilingual } from '@/types/i18n'
import rafiKotImage from '@/features/landing/assets/images/doctors/doctor-rafi-kot.jpg'
import mattiasLarssonImage from '@/features/landing/assets/images/doctors/doctor-mattias-larsson.jpg'

export interface Doctor {
  id: string
  name: Bilingual
  role: Bilingual
  specialty: Bilingual
  location: Bilingual
  nationality: Bilingual
  languages: Bilingual
  image: string
}

export const doctors: Doctor[] = [
  {
    id: 'rafi-kot',
    name: { en: 'Dr. Rafi Kot', vi: 'Bác sĩ Rafi Kot' },
    role: {
      en: 'Executive Director, Founder Thao Dien',
      vi: 'Giám đốc điều hành, Người sáng lập Thảo Điền',
    },
    specialty: { en: 'Family Medicine', vi: 'Y học gia đình' },
    location: { en: 'Ho Chi Minh City', vi: 'Hồ Chí Minh' },
    nationality: { en: 'Israeli', vi: 'Israel' },
    languages: { en: 'English, Polish, German, Hebrew, Vietnamese, Russian', vi: 'Tiếng Anh, Tiếng Ba Lan, Tiếng Đức, Tiếng Do Thái, Tiếng Việt, Tiếng Nga' },
    image: rafiKotImage,
  },
  {
    id: 'mattias-larsson',
    name: { en: 'Dr. Mattias Larsson', vi: 'Bác sĩ Mattias Larsson' },
    role: { en: 'Medical Director', vi: 'Giám đốc Y khoa' },
    specialty: { en: 'Pediatrics', vi: 'Nhi khoa' },
    location: { en: 'Hanoi', vi: 'Hà Nội' },
    nationality: { en: 'Swedish', vi: 'Thụy Điển' },
    languages: { en: 'Swedish, English, German, Vietnamese', vi: 'Tiếng Thụy Điển, Tiếng Anh, Tiếng Đức, Tiếng Việt' },
    image: mattiasLarssonImage,
  },
]

export const doctorsContent = {
  title: { en: 'FMP DOCTORS', vi: 'BÁC SĨ FMP' },
  description: {
    en: 'Meet experienced doctors and find the right specialist for your next visit.',
    vi: 'Tìm hiểu đội ngũ bác sĩ giàu kinh nghiệm và lựa chọn chuyên gia phù hợp cho lần khám tiếp theo.',
  },
  searchPlaceholder: {
    en: 'Condition, treatment, doctor or area of interest',
    vi: 'Tình trạng, điều trị, bác sĩ hoặc lĩnh vực quan tâm',
  },
  search: { en: 'SEARCH', vi: 'TÌM KIẾM' },
  allSpecialties: { en: 'Specialty', vi: 'Chuyên khoa' },
  allLocations: { en: 'Location', vi: 'Địa điểm' },
  nationality: { en: 'Nationality', vi: 'Quốc tịch' },
  languages: { en: 'Languages', vi: 'Ngôn ngữ' },
  viewProfile: { en: 'View profile', vi: 'Xem hồ sơ' },
}
