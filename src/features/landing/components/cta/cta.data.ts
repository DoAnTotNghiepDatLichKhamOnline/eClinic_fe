import type { Bilingual } from '@/types/i18n'

export const ctaContent = {
  title: {
    en: 'Your first appointment takes two minutes to book.',
    vi: 'Đặt lịch khám đầu tiên chỉ mất hai phút.',
  } satisfies Bilingual,
  description: {
    en: 'Choose a center, pick a specialty, and confirm a time — a coordinator will call to verify your booking.',
    vi: 'Chọn cơ sở, chọn chuyên khoa và xác nhận giờ khám — nhân viên sẽ gọi lại để xác nhận lịch hẹn.',
  } satisfies Bilingual,
  primaryCta: { en: 'Start booking', vi: 'Bắt đầu đặt lịch' } satisfies Bilingual,
  secondaryCta: { en: 'Call *9999 for emergencies', vi: 'Gọi *9999 khi cấp cứu' } satisfies Bilingual,
}
