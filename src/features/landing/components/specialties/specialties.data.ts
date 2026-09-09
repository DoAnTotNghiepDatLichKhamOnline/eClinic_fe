import type { ComponentType, SVGProps } from 'react'
import {
  IconBaby,
  IconBone,
  IconBrain,
  IconDrop,
  IconEye,
  IconHeart,
  IconStethoscope,
  IconVideo,
} from '@/components/icons'
import type { Bilingual } from '@/types/i18n'

export interface Specialty {
  id: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  name: Bilingual
  tint: string
  description?: Bilingual
  items: Bilingual[]
  featured?: boolean
}

export const specialties: Specialty[] = [
  {
    id: 'cardiology',
    icon: IconHeart,
    name: { en: 'Cardiology', vi: 'Tim mạch' },
    tint: '#FBEAEC',
    description: {
      en: 'Preventive and interventional heart care, from routine screening to complex diagnostics.',
      vi: 'Tầm soát và can thiệp tim mạch, từ khám định kỳ đến chẩn đoán chuyên sâu.',
    },
    items: [
      { en: 'ECG & echocardiogram on-site', vi: 'Điện tim & siêu âm tim tại chỗ' },
      { en: '24-hour Holter monitoring', vi: 'Theo dõi Holter 24 giờ' },
      { en: 'Cardiac risk assessment', vi: 'Đánh giá nguy cơ tim mạch' },
    ],
    featured: true,
  },
  {
    id: 'pediatrics',
    icon: IconBaby,
    name: { en: 'Pediatrics', vi: 'Nhi khoa' },
    tint: '#FFF6E0',
    items: [
      { en: 'Newborn to adolescent care', vi: 'Sơ sinh đến thanh thiếu niên' },
      { en: 'Vaccination programs', vi: 'Chương trình tiêm chủng' },
    ],
  },
  {
    id: 'dermatology',
    icon: IconDrop,
    name: { en: 'Dermatology', vi: 'Da liễu' },
    tint: '#E9F7EF',
    items: [
      { en: 'Medical & cosmetic skin care', vi: 'Da liễu điều trị & thẩm mỹ' },
      { en: 'Skin cancer screening', vi: 'Tầm soát ung thư da' },
    ],
  },
  {
    id: 'orthopedics',
    icon: IconBone,
    name: { en: 'Orthopedics', vi: 'Cơ xương khớp' },
    tint: '#EAF1FB',
    items: [
      { en: 'Sports injury & rehab', vi: 'Chấn thương thể thao & phục hồi' },
      { en: 'Joint & spine care', vi: 'Điều trị khớp & cột sống' },
    ],
  },
  {
    id: 'ophthalmology',
    icon: IconEye,
    name: { en: 'Ophthalmology', vi: 'Mắt' },
    tint: '#E6F7F5',
    description: {
      en: 'Comprehensive eye exams and surgical care using internationally certified equipment.',
      vi: 'Khám mắt toàn diện và điều trị ngoại khoa với thiết bị đạt chứng nhận quốc tế.',
    },
    items: [
      { en: 'LASIK & cataract surgery', vi: 'Phẫu thuật LASIK & đục thủy tinh thể' },
      { en: 'Pediatric vision screening', vi: 'Tầm soát thị lực trẻ em' },
      { en: 'Retina & glaucoma clinic', vi: 'Phòng khám võng mạc & tăng nhãn áp' },
    ],
    featured: true,
  },
  {
    id: 'neurology',
    icon: IconBrain,
    name: { en: 'Neurology', vi: 'Thần kinh' },
    tint: '#F3EEE6',
    items: [
      { en: 'Headache & migraine clinic', vi: 'Điều trị đau đầu & migraine' },
      { en: 'Stroke risk management', vi: 'Quản lý nguy cơ đột quỵ' },
    ],
  },
  {
    id: 'general-medicine',
    icon: IconStethoscope,
    name: { en: 'General Medicine', vi: 'Nội tổng quát' },
    tint: '#F1EEE9',
    items: [
      { en: 'Annual health checks', vi: 'Khám sức khỏe định kỳ' },
      { en: 'Chronic disease management', vi: 'Quản lý bệnh mạn tính' },
    ],
  },
  {
    id: 'telemedicine',
    icon: IconVideo,
    name: { en: 'Telemedicine', vi: 'Khám từ xa' },
    tint: '#FBEFEA',
    items: [
      { en: 'Video consultations', vi: 'Tư vấn qua video' },
      { en: 'E-prescriptions', vi: 'Đơn thuốc điện tử' },
    ],
  },
]

export const specialtiesContent = {
  title: { en: 'Care organized around you', vi: 'Chăm sóc toàn diện, đúng chuyên môn' } satisfies Bilingual,
  description: {
    en: 'Eight core specialties, each staffed by both Vietnamese and international physicians working from one shared patient record.',
    vi: 'Tám chuyên khoa chính với đội ngũ bác sĩ Việt Nam và quốc tế, cùng làm việc trên một hồ sơ bệnh án duy nhất.',
  } satisfies Bilingual,
  bookLink: { en: 'Book a specialist', vi: 'Đặt lịch bác sĩ chuyên khoa' } satisfies Bilingual,
}
