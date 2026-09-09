import type { Bilingual } from '@/types/i18n'

export interface TrustMetric {
  value: string
  label: Bilingual
}

export const trustMetrics: TrustMetric[] = [
  { value: '1994', label: { en: 'Established in Vietnam', vi: 'Thành lập tại Việt Nam' } },
  { value: '100%', label: { en: 'International treatment standards', vi: 'Tiêu chuẩn điều trị quốc tế' } },
  { value: '28+', label: { en: 'Multilingual doctors', vi: 'Bác sĩ đa ngôn ngữ' } },
  { value: '24/7', label: { en: 'In-house labs & pharmacy', vi: 'Xét nghiệm & dược tại chỗ' } },
]
