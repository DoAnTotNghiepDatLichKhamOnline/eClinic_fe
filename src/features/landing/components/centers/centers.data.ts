import type { Bilingual } from '@/types/i18n'
import type { HubId } from '@/context/ActiveHubContext'

export interface CenterLocation {
  name: string
  address: string
  hours: string
  phone: string
  email: string
  emergency: string
}

export interface Hub {
  id: HubId
  cityLabel: Bilingual
  cityName: string
  address: string
  hours: Bilingual
  phone: string
  email: string
  locations: CenterLocation[]
}

export const hubs: Hub[] = [
  {
    id: 'hcmc',
    cityLabel: { en: 'Ho Chi Minh City', vi: 'Hồ Chí Minh' },
    cityName: 'HỒ CHÍ MINH',
    address: 'Tòa nhà Diamond Plaza, 34 Lê Duẩn, Phường Sài Gòn, TP.HCM',
    hours: { en: '24 hours, 7 days a week', vi: '24 giờ, 7 ngày một tuần' },
    phone: '+84 28 3822 7848',
    email: 'hcmc@vietnammedicalpractice.com',
    locations: [
      {
        name: 'DIAMOND PLAZA',
        address: 'Tòa nhà Diamond Plaza, 34 Lê Duẩn, Phường Sài Gòn, TP.HCM',
        hours: '24 giờ, 7 ngày một tuần',
        phone: '+84 28 3822 7848',
        email: 'hcmc@vietnammedicalpractice.com',
        emergency: '*1212',
      },
      {
        name: 'THẢO ĐIỀN',
        address: '95 Xuân Thủy, Thảo Điền, TP. Thủ Đức, TP.HCM',
        hours: '24 giờ, 7 ngày một tuần',
        phone: '+84 28 3744 2000',
        email: 'hcmc@vietnammedicalpractice.com',
        emergency: '*1212',
      },
      {
        name: 'CARE1',
        address: 'Tầng 1, 24 Nguyễn Thị Nghĩa, Quận 1, TP.HCM',
        hours: 'T2–T7: 08:00–17:00',
        phone: '+84 28 3822 7848',
        email: 'hcmc@vietnammedicalpractice.com',
        emergency: '*1212',
      },
      {
        name: 'PHÚ MỸ HƯNG',
        address: '95 Nguyễn Lương Bằng, Quận 7, TP.HCM',
        hours: 'T2–T7: 08:00–17:00',
        phone: '+84 28 3822 7848',
        email: 'hcmc@vietnammedicalpractice.com',
        emergency: '*1212',
      },
    ],
  },
  {
    id: 'hanoi',
    cityLabel: { en: 'Hanoi', vi: 'Hà Nội' },
    cityName: 'HÀ NỘI',
    address: '298i Kim Mã, Ngọc Hà, Hà Nội',
    hours: { en: '24 hours, 7 days a week', vi: '24 giờ, 7 ngày một tuần' },
    phone: '+84 24 3843 0748',
    email: 'hanoi@vietnammedicalpractice.com',
    locations: [
      {
        name: 'HÀ NỘI',
        address: '298i Kim Mã, Ngọc Hà, Hà Nội',
        hours: '24 giờ, 7 ngày một tuần',
        phone: '+84 24 3843 0748',
        email: 'hanoi@vietnammedicalpractice.com',
        emergency: '+84 944 431 919',
      },
    ],
  },
  {
    id: 'danang',
    cityLabel: { en: 'Danang', vi: 'Đà Nẵng' },
    cityName: 'ĐÀ NẴNG',
    address: '96–98 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    hours: { en: 'Mon–Sat: 08:00–17:00; Sun: 08:00–12:00', vi: 'T2–T7: 08:00–17:00; CN: 08:00–12:00' },
    phone: '+84 23 6358 2699',
    email: 'danang@vietnammedicalpractice.com',
    locations: [
      {
        name: 'ĐÀ NẴNG',
        address: '96–98 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
        hours: 'T2–T7: 08:00–17:00; CN: 08:00–12:00',
        phone: '+84 23 6358 2699',
        email: 'danang@vietnammedicalpractice.com',
        emergency: '+84 913 917 303',
      },
    ],
  },
]

export const centersContent = {
  title: { en: 'FMP CLINIC LOCATIONS', vi: 'ĐỊA ĐIỂM PHÒNG KHÁM FMP' } satisfies Bilingual,
  description: {
    en: 'Find the nearest clinic and view opening hours, contact details and emergency numbers.',
    vi: 'Chọn cơ sở gần bạn để xem địa chỉ, giờ khám, thông tin liên hệ và số cấp cứu.',
  } satisfies Bilingual,
  bookAtCenter: { en: 'Book at this center', vi: 'Đặt lịch tại cơ sở này' } satisfies Bilingual,
  emergencyBadge: { en: 'Emergency', vi: 'Cấp cứu' } satisfies Bilingual,
  emergencyNote: {
    en: 'Use only for urgent 24/7 calls',
    vi: 'Chỉ sử dụng cho cuộc gọi khẩn cấp 24/7',
  } satisfies Bilingual,
}
