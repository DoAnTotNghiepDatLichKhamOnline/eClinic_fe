import type {
  VaiTro,
  TrangThaiTaiKhoan,
  TrangThaiLienKet,
  TrangThaiBacSi,
  GioiTinh,
} from "./common.type";

// Re-export common types for convenience
export type {
  VaiTro,
  TrangThaiTaiKhoan,
  TrangThaiLienKet,
  TrangThaiBacSi,
  GioiTinh,
};

// ==========================================
// 1. DTO PHẢN HỒI (RESPONSES)
// ==========================================

export interface TaiKhoanResponse {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  vaiTro: VaiTro;
  trangThai: TrangThaiTaiKhoan;
  ngonNgu?: "VI" | "EN";
}

export interface DangNhapResponse {
  accessToken: string;
  loaiToken: string;
  thoiHanAccessToken: number;
  taiKhoan: TaiKhoanResponse;
  refreshToken?: string;
}

export interface HoSoBacSiResponse {
  id: number;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  hocVi: string | null;
  soGiayPhep: string | null;
  soNamKinhNghiem: number | null;
  tieuSu: string | null;
  trangThai: TrangThaiBacSi;
}

export interface HoSoBenhNhanResponse {
  id: number;
  trangThaiLienKet: TrangThaiLienKet;
  cccd: string | null;
  hoTen: string | null;
  ngaySinh: string | null;
  gioiTinh: GioiTinh | null;
  soDienThoai: string | null;
  diaChi: string | null;
  soBaoHiemYTe: string | null;
  tienSuBenhLy: string | null;
}

export interface HoSoCaNhanResponse {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  anhDaiDien: string | null;
  vaiTro: VaiTro;
  trangThai: TrangThaiTaiKhoan;
  ngonNgu?: "VI" | "EN";
  coMatKhau: boolean;
  lienKetGoogle: boolean;
  ngayTao: string;
  bacSi: HoSoBacSiResponse | null;
  hoSoBenhNhan: HoSoBenhNhanResponse | null;
}

export interface PhienDangNhapResponse {
  id: string;
  thietBi: string | null;
  dangNhapLuc: string;
  hoatDongLuc: string;
  hetHanLuc: string;
  hienTai: boolean;
}

export interface YeuCauDoiEmailResponse {
  emailMoi: string;
}

export interface TaiKhoanQuanTriResponse {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  anhDaiDien: string | null;
  vaiTro: VaiTro;
  trangThai: TrangThaiTaiKhoan;
  lyDoVoHieuHoa?: string | null;
  ngaySinh?: string | null;
  ngayTao: string;
}

export interface ChiTietTaiKhoanResponse {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  anhDaiDien: string | null;
  vaiTro: VaiTro;
  trangThai: TrangThaiTaiKhoan;
  lyDoVoHieuHoa?: string | null;
  ngaySinh?: string | null;
  ngayTao: string;
  ngayCapNhat: string;
  coMatKhau: boolean;
  lienKetGoogle: boolean;
  trangThaiLienKetHoSo: TrangThaiLienKet | null;
  bacSi?: HoSoBacSiResponse | null;
}

// ==========================================
// 2. DTO YÊU CẦU (REQUESTS)
// ==========================================

export interface DangKyRequest {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai?: string | null;
  cccd?: string | null;
}

export interface XacThucEmailRequest {
  token: string;
}

export interface GuiLaiXacThucRequest {
  email: string;
}

export interface DangNhapRequest {
  email: string;
  matKhau: string;
}

export interface DangNhapGoogleRequest {
  idToken: string;
}

export interface DatMatKhauLanDauRequest {
  email: string;
  matKhauHienTai: string;
  matKhauMoi: string;
}

export interface PhienDangNhapRequest {
  refreshToken?: string;
}

export interface QuenMatKhauRequest {
  email: string;
}

export type ForgotPasswordRequest = QuenMatKhauRequest;

export interface DatLaiMatKhauRequest {
  token: string;
  matKhauMoi: string;
  newPassword?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  matKhauMoi?: string;
}

export interface CapNhatHoSoRequest {
  hoTen: string;
  soDienThoai?: string | null;
}

export interface DoiMatKhauRequest {
  matKhauHienTai: string;
  matKhauMoi: string;
}

export interface DoiEmailRequest {
  emailMoi: string;
  matKhauHienTai: string;
}

export interface SuaThongTinTaiKhoanRequest {
  hoTen: string;
  soDienThoai?: string | null;
  vaiTro: VaiTro;
}

export interface CapNhatTrangThaiTaiKhoanRequest {
  trangThai: TrangThaiTaiKhoan;
  lyDoVoHieuHoa?: string | null;
}

export interface TaoTaiKhoanBacSiRequest {
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  matKhauMacDinh: string;
}

export interface GetTaiKhoanQuanTriParams {
  tuKhoa?: string;
  vaiTro?: VaiTro;
  trangThai?: TrangThaiTaiKhoan;
  trang?: number;
  kichThuoc?: number;
}
