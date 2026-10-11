import type { LucideIcon } from "lucide-react";
import type { Bilingual } from "@/types/i18n";
import type { GioiTinh, QuanHeGiamHo } from "@/types/common.type";

export interface SpecialtyItem {
  id: string;
  name: Bilingual;
  description: Bilingual;
  icon: LucideIcon;
  isPediatric?: boolean;
}

export interface DoctorItem {
  id: string;
  name: Bilingual;
  title: Bilingual;
  specialtyId: string;
  specialtyName: Bilingual;
  experience: Bilingual;
  image?: string;
  hospital: Bilingual;
}

export interface TimeSlotItem {
  id: string;
  time: string;
  period: "morning" | "afternoon";
  available: boolean;
}

export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "completed";

export interface AppointmentRecord {
  bookingCode: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  specialtyId: string;
  doctorId: string;
  date: string;
  slotTime: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface AppointmentFormValues {
  // 1. Nhóm thông tin Đăng ký Dịch vụ & Thời gian khám
  specialtyId: string; // ID chuyên khoa (bắt buộc)
  doctorId: string; // ID bác sĩ (tùy chọn, để trống là bác sĩ bất kỳ)
  date: string; // Ngày khám (YYYY-MM-DD, bắt buộc)
  slotId: string; // Mã nhận diện slot (idLichLamViec hoặc key slot)
  slotTime: string; // Chuỗi hiển thị (e.g. "08:00 - 09:00")
  gioBatDauKhung: string; // ISO datetime e.g. "2026-10-15T08:00:00"
  idLichLamViec?: number; // Có khi chọn bác sĩ cụ thể

  // 2. Nhóm thông tin Cá nhân Bệnh nhân (Người đến khám)
  patientName: string; // Bắt buộc
  patientDob: string; // Bắt buộc (YYYY-MM-DD)
  patientGender: GioiTinh; // Bắt buộc ('NAM' | 'NU' | 'KHAC')
  patientPhone: string; // Bắt buộc đối với người lớn
  patientCccd: string; // Bắt buộc đối với người lớn (12 số)
  patientEmail?: string;
  patientAddress?: string;
  reason: string; // Bắt buộc

  // Tương thích / Khoa Nhi
  childDob?: string; // Ngày sinh của trẻ
  childGender?: string;

  // 3. Thông tin người giám hộ (Bắt buộc khi < 18 tuổi hoặc Khoa Nhi)
  guardianName?: string;
  guardianCccd?: string;
  guardianPhone?: string;
  guardianRelationship?: QuanHeGiamHo | string;
}
