import {
  Baby,
  Stethoscope,
  HeartPulse,
  Droplet,
  Eye,
  Bone,
  Brain,
  Sparkles,
} from 'lucide-react'
import type { SpecialtyItem, DoctorItem, TimeSlotItem } from './appointment.types'
import rafiKotImage from '@/features/landing/assets/images/doctors/doctor-rafi-kot.jpg'
import mattiasLarssonImage from '@/features/landing/assets/images/doctors/doctor-mattias-larsson.jpg'

export const APPOINTMENT_SPECIALTIES: SpecialtyItem[] = [
  {
    id: 'pediatrics',
    name: { vi: 'Nhi khoa', en: 'Pediatrics' },
    description: {
      vi: 'Chăm sóc sức khỏe toàn diện trẻ sơ sinh đến thanh thiếu niên',
      en: 'Care for newborns, infants, children, and adolescents',
    },
    icon: Baby,
    isPediatric: true,
  },
  {
    id: 'general-medicine',
    name: { vi: 'Nội tổng quát', en: 'General Medicine' },
    description: {
      vi: 'Khám tầm soát tổng quát, theo dõi bệnh mạn tính',
      en: 'Primary healthcare screening and chronic disease care',
    },
    icon: Stethoscope,
  },
  {
    id: 'cardiology',
    name: { vi: 'Tim mạch', en: 'Cardiology' },
    description: {
      vi: 'Khám và can thiệp chuyên sâu các bệnh lý mạch máu & tim',
      en: 'Diagnostic and preventive cardiovascular care',
    },
    icon: HeartPulse,
  },
  {
    id: 'dermatology',
    name: { vi: 'Da liễu', en: 'Dermatology' },
    description: {
      vi: 'Khám điều trị bệnh ngoài da và thẩm mỹ da liễu',
      en: 'Medical dermatology, skin allergies, and aesthetics',
    },
    icon: Droplet,
  },
  {
    id: 'ophthalmology',
    name: { vi: 'Mắt', en: 'Ophthalmology' },
    description: {
      vi: 'Khám khúc xạ, điều trị và phẫu thuật nhãn khoa',
      en: 'Comprehensive eye exams and optical care',
    },
    icon: Eye,
  },
  {
    id: 'orthopedics',
    name: { vi: 'Cơ xương khớp', en: 'Orthopedics' },
    description: {
      vi: 'Điều trị thoái hóa khớp, cột sống, chấn thương thể thao',
      en: 'Joints, bones, spine care, and sports injuries',
    },
    icon: Bone,
  },
  {
    id: 'neurology',
    name: { vi: 'Thần kinh', en: 'Neurology' },
    description: {
      vi: 'Chẩn đoán và điều trị đau đầu, mất ngủ, tiền đình, đột quỵ',
      en: 'Headaches, sleep disorders, vertigo, and neurological care',
    },
    icon: Brain,
  },
  {
    id: 'ent',
    name: { vi: 'Tai Mũi Họng', en: 'ENT (Otolaryngology)' },
    description: {
      vi: 'Nội soi tầm soát và điều trị bệnh lý tai mũi họng người lớn & trẻ em',
      en: 'Ear, nose, and throat diagnostics and procedures',
    },
    icon: Sparkles,
  },
]

export const APPOINTMENT_DOCTORS: DoctorItem[] = [
  {
    id: 'doc-mattias',
    name: { vi: 'Bác sĩ Mattias Larsson', en: 'Dr. Mattias Larsson' },
    title: { vi: 'Giám đốc Y khoa - Chuyên gia Nhi khoa', en: 'Medical Director - Pediatrician' },
    specialtyId: 'pediatrics',
    specialtyName: { vi: 'Nhi khoa', en: 'Pediatrics' },
    experience: { vi: '25 năm kinh nghiệm', en: '25 years experience' },
    hospital: { vi: 'eClinic Trung tâm Hà Nội', en: 'eClinic Hanoi Center' },
    image: mattiasLarssonImage,
  },
  {
    id: 'doc-nguyen-thi-mai',
    name: { vi: 'ThS.BS Nguyễn Thị Mai', en: 'Dr. Nguyen Thi Mai, MSc' },
    title: { vi: 'Bác sĩ CKI Nhi khoa & Dinh dưỡng', en: 'Senior Pediatrician' },
    specialtyId: 'pediatrics',
    specialtyName: { vi: 'Nhi khoa', en: 'Pediatrics' },
    experience: { vi: '15 năm kinh nghiệm', en: '15 years experience' },
    hospital: { vi: 'eClinic Thảo Điền TP.HCM', en: 'eClinic Thao Dien HCMC' },
  },
  {
    id: 'doc-rafi-kot',
    name: { vi: 'Bác sĩ Rafi Kot', en: 'Dr. Rafi Kot' },
    title: { vi: 'Giám đốc Y khoa - Bác sĩ Gia đình & Nội khoa', en: 'Senior Family Physician' },
    specialtyId: 'general-medicine',
    specialtyName: { vi: 'Nội tổng quát', en: 'General Medicine' },
    experience: { vi: '30 năm kinh nghiệm', en: '30 years experience' },
    hospital: { vi: 'eClinic Thảo Điền TP.HCM', en: 'eClinic Thao Dien HCMC' },
    image: rafiKotImage,
  },
  {
    id: 'doc-tran-van-nam',
    name: { vi: 'BS.CKII Trần Văn Nam', en: 'Dr. Tran Van Nam' },
    title: { vi: 'Chuyên gia Nội tổng quát & Lão khoa', en: 'Internal Medicine Specialist' },
    specialtyId: 'general-medicine',
    specialtyName: { vi: 'Nội tổng quát', en: 'General Medicine' },
    experience: { vi: '20 năm kinh nghiệm', en: '20 years experience' },
    hospital: { vi: 'eClinic Ba Đình Hà Nội', en: 'eClinic Ba Dinh Hanoi' },
  },
  {
    id: 'doc-le-hoang-quan',
    name: { vi: 'TS.BS Lê Hoàng Quân', en: 'Dr. Le Hoang Quan, PhD' },
    title: { vi: 'Chuyên gia Tim mạch can thiệp', en: 'Cardiologist' },
    specialtyId: 'cardiology',
    specialtyName: { vi: 'Tim mạch', en: 'Cardiology' },
    experience: { vi: '18 năm kinh nghiệm', en: '18 years experience' },
    hospital: { vi: 'eClinic Quận 1 TP.HCM', en: 'eClinic Dist 1 HCMC' },
  },
  {
    id: 'doc-pham-thu-ha',
    name: { vi: 'ThS.BS Phạm Thu Hà', en: 'Dr. Pham Thu Ha, MSc' },
    title: { vi: 'Bác sĩ Da liễu & Laser thẩm mỹ', en: 'Dermatologist' },
    specialtyId: 'dermatology',
    specialtyName: { vi: 'Da liễu', en: 'Dermatology' },
    experience: { vi: '12 năm kinh nghiệm', en: '12 years experience' },
    hospital: { vi: 'eClinic Thảo Điền TP.HCM', en: 'eClinic Thao Dien HCMC' },
  },
  {
    id: 'doc-vo-van-khoa',
    name: { vi: 'BS.CKI Võ Văn Khoa', en: 'Dr. Vo Van Khoa' },
    title: { vi: 'Chuyên gia Chấn thương chỉnh hình', en: 'Orthopedic Specialist' },
    specialtyId: 'orthopedics',
    specialtyName: { vi: 'Cơ xương khớp', en: 'Orthopedics' },
    experience: { vi: '16 năm kinh nghiệm', en: '16 years experience' },
    hospital: { vi: 'eClinic Hải Châu Đà Nẵng', en: 'eClinic Da Nang' },
  },
]

export const TIME_SLOTS: TimeSlotItem[] = [
  // Ca sáng
  { id: 'slot-0800', time: '08:00 - 08:30', period: 'morning', available: true },
  { id: 'slot-0830', time: '08:30 - 09:00', period: 'morning', available: true },
  { id: 'slot-0900', time: '09:00 - 09:30', period: 'morning', available: false }, // Đã kín
  { id: 'slot-0930', time: '09:30 - 10:00', period: 'morning', available: true },
  { id: 'slot-1000', time: '10:00 - 10:30', period: 'morning', available: true },
  { id: 'slot-1030', time: '10:30 - 11:00', period: 'morning', available: true },
  { id: 'slot-1100', time: '11:00 - 11:30', period: 'morning', available: false }, // Đã kín

  // Ca chiều
  { id: 'slot-1330', time: '13:30 - 14:00', period: 'afternoon', available: true },
  { id: 'slot-1400', time: '14:00 - 14:30', period: 'afternoon', available: true },
  { id: 'slot-1430', time: '14:30 - 15:00', period: 'afternoon', available: true },
  { id: 'slot-1500', time: '15:00 - 15:30', period: 'afternoon', available: false }, // Đã kín
  { id: 'slot-1530', time: '15:30 - 16:00', period: 'afternoon', available: true },
  { id: 'slot-1600', time: '16:00 - 16:30', period: 'afternoon', available: true },
]

/**
 * Generate 7 upcoming days for convenient quick-date selection
 */
export function getUpcomingBookingDays(numDays = 7) {
  const days: { dateStr: string; dayNameVi: string; dayNameEn: string; displayDate: string; isToday: boolean }[] = []
  const today = new Date()

  const viDays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = 0; i < numDays; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)

    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    const dayIdx = d.getDay()
    const dayNameVi = i === 0 ? 'Hôm nay' : viDays[dayIdx]
    const dayNameEn = i === 0 ? 'Today' : enDays[dayIdx]
    const displayDate = `${dd}/${mm}`

    days.push({
      dateStr,
      dayNameVi,
      dayNameEn,
      displayDate,
      isToday: i === 0,
    })
  }

  return days
}

/**
 * Calculate human-readable age from a date of birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString?: string, lang: 'vi' | 'en' = 'vi'): string {
  if (!dobString) return ''
  const dob = new Date(dobString)
  if (isNaN(dob.getTime())) return ''
  const today = new Date()

  // Clear time components for comparison
  dob.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  if (dob > today) {
    return lang === 'vi' ? 'Ngày sinh không thể ở tương lai' : 'Birth date cannot be in the future'
  }

  let years = today.getFullYear() - dob.getFullYear()
  let months = today.getMonth() - dob.getMonth()
  let days = today.getDate() - dob.getDate()

  if (days < 0) {
    months--
  }
  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0) {
    if (months === 0) {
      const diffTime = Math.abs(today.getTime() - dob.getTime())
      const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
      return lang === 'vi' ? `${diffDays} ngày tuổi` : `${diffDays} days old`
    }
    return lang === 'vi' ? `${months} tháng tuổi` : `${months} months old`
  }

  if (years < 3 && months > 0) {
    return lang === 'vi' ? `${years} tuổi ${months} tháng` : `${years} yrs ${months} mos`
  }

  return lang === 'vi' ? `${years} tuổi` : `${years} years old`
}
