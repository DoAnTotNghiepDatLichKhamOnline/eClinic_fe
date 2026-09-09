import type { Bilingual } from '@/types/i18n'

export const footerContent = {
  bookTitle: { en: 'Book an Appointment', vi: 'Đặt lịch khám' } satisfies Bilingual,
  bookBody: {
    en: 'Same-day slots available at all three centers.',
    vi: 'Có lịch khám trong ngày tại cả ba cơ sở.',
  } satisfies Bilingual,
  bookOnline: { en: 'Book online', vi: 'Đặt lịch trực tuyến' } satisfies Bilingual,
  callOr: { en: 'Or call', vi: 'Hoặc gọi' } satisfies Bilingual,

  portalTitle: { en: 'Patient Portal', vi: 'Cổng bệnh nhân' } satisfies Bilingual,
  portalLinks: [
    { en: 'Sign in', vi: 'Đăng nhập' },
    { en: 'View lab results', vi: 'Xem kết quả xét nghiệm' },
    { en: 'Manage appointments', vi: 'Quản lý lịch hẹn' },
    { en: 'Insurance & direct billing', vi: 'Bảo hiểm & bảo lãnh viện phí' },
  ] satisfies Bilingual[],

  centersTitle: { en: 'Our Centers', vi: 'Cơ sở y tế' } satisfies Bilingual,

  legalTitle: { en: 'Regulatory & Legal', vi: 'Pháp lý & giấy phép' } satisfies Bilingual,
  license: { en: 'Operating License No. 0312-YT/BYT', vi: 'GPHĐ số 0312-YT/BYT' } satisfies Bilingual,
  privacy: { en: 'Privacy policy', vi: 'Chính sách bảo mật' } satisfies Bilingual,
  terms: { en: 'Terms of service', vi: 'Điều khoản sử dụng' } satisfies Bilingual,

  rights: { en: 'All rights reserved.', vi: 'Đã đăng ký bản quyền.' } satisfies Bilingual,
}
