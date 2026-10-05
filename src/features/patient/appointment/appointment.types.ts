import type { LucideIcon } from 'lucide-react'
import type { Bilingual } from '@/shared/types/i18n'

export interface SpecialtyItem {
  id: string
  name: Bilingual
  description: Bilingual
  icon: LucideIcon
  isPediatric?: boolean
}

export interface DoctorItem {
  id: string
  name: Bilingual
  title: Bilingual
  specialtyId: string
  specialtyName: Bilingual
  experience: Bilingual
  image?: string
  hospital: Bilingual
}

export interface TimeSlotItem {
  id: string
  time: string
  period: 'morning' | 'afternoon'
  available: boolean
}

export interface AppointmentFormValues {
  // 1. Nhóm thông tin Đăng ký Dịch vụ & Thời gian khám
  specialtyId: string // Bắt buộc
  doctorId: string // Tùy chọn (chọn hoặc để trống "Hệ thống tự chỉ định")
  date: string // Bắt buộc (YYYY-MM-DD)
  slotId: string // Bắt buộc (Khung giờ khám còn trống)
  slotTime: string

  // 2. Nhóm thông tin Cá nhân Bệnh nhân (Người đến khám)
  patientName: string // Bắt buộc
  patientPhone: string // Bắt buộc đối với người lớn
  patientCccd: string // Bắt buộc đối với người lớn
  reason: string // Bắt buộc

  // Dành riêng cho Khoa Nhi (Bệnh nhi)
  childDob?: string // Ngày sinh của trẻ
  childGender?: 'male' | 'female' | '' // Giới tính của trẻ

  // 3. Thông tin người giám hộ (Bắt buộc nếu là Khoa Nhi)
  guardianName?: string
  guardianCccd?: string
  guardianPhone?: string
  guardianRelationship?: string
}
