import type { DoctorSection } from "../DoctorSidebar";

export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "completed";

export interface Appointment {
  id: string;
  patientName: string;
  age: number;
  phone: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  refusalReason?: string;
}

export interface CompletedRecord {
  recordCode: string;
  appointmentCode: string;
  patientName: string;
  diagnosis: string;
  prescription: string;
  createdAt: string;
}

export interface ConsultationLookup {
  lichHen: {
    id: number;
    maTraCuu: string;
    maPhieuKham: string;
    hoTenBenhNhan: string;
    ngay: string;
    gioKhamDuKien: string;
    trangThai: string;
    lyDoKham: string;
    doiChieu?: {
      canDoiChieu: boolean;
      hoTenDaNhap?: string;
      ngaySinhDaNhap?: string;
    };
  };
  hoSoBenhNhan: {
    id: number;
    hoTen: string;
    ngaySinh: string;
    tuoi: number;
    gioiTinh: string;
    soDienThoai: string;
    diaChi?: string | null;
    tienSuBenhLy?: string | null;
    soBaoHiemYTe?: string | null;
  };
  lanKhamTruoc: Array<{
    ngay: string;
    tenChuyenKhoa: string;
    hoTenBacSi: string;
    ketQua?: { chanDoan: string } | null;
  }>;
  ketQua?: {
    chanDoan: string;
    ghiChu?: string | null;
    ngayTaiKhamDeXuat?: string | null;
    phienBan?: number;
    ngaySuaCuoi?: string | null;
    lyDoSua?: string | null;
  } | null;
}

export interface DoctorWorkspaceProps {
  activeSection: DoctorSection;
}
