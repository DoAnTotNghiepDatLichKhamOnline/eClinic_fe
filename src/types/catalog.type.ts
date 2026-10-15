import type {
  LoaiAnhBacSi,
  TrangThaiBacSi,
  TrangThaiTaiKhoan,
  TrangThaiPhongKham,
} from "./common.type";

// Re-export common types for convenience
export type {
  LoaiAnhBacSi,
  TrangThaiBacSi,
  TrangThaiTaiKhoan,
  TrangThaiPhongKham,
};

// ==========================================
// 1. CHUYÊN KHOA (SPECIALTY)
// ==========================================

export interface ChuyenKhoaResponse {
  id: number;
  tenChuyenKhoa: string;
  moTa: string | null;
  tenChuyenKhoaEn?: string | null;
  moTaEn?: string | null;
  trieuChung?: string | null;
  trieuChungEn?: string | null;
}

export interface ChuyenKhoaRequest {
  tenChuyenKhoa: string;
  moTa?: string | null;
  tenChuyenKhoaEn?: string | null;
  moTaEn?: string | null;
  trieuChung?: string | null;
  trieuChungEn?: string | null;
}

export interface GetChuyenKhoaParams {
  tuKhoa?: string;
  trang?: number;
  kichThuoc?: number;
}

// ==========================================
// 2. BÁC SĨ - CÔNG KHAI (DOCTOR - PUBLIC)
// ==========================================

export interface BacSiResponse {
  id: number;
  hoTen: string;
  anhDaiDien: string | null;
  hocVi: string | null;
  chucVu: string | null;
  soNamKinhNghiem: number | null;
  gioiThieuNgan: string | null;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  diemDanhGia: number | null;
  soDanhGia: number;
  chucVuEn?: string | null;
  gioiThieuNganEn?: string | null;
}

export interface AnhBacSiResponse {
  id: number;
  loai: LoaiAnhBacSi;
  url: string;
  chuThich: string | null;
  chuThichEn?: string | null;
}

export interface BacSiChiTietResponse extends BacSiResponse {
  tieuSu: string | null;
  quaTrinhDaoTao: string[];
  quaTrinhCongTac: string[];
  linhVucKhamChua: string[];
  anh: AnhBacSiResponse[];
}

export interface GetBacSiParams {
  idChuyenKhoa?: number;
  tuKhoa?: string;
  trang?: number;
  kichThuoc?: number;
}

// ==========================================
// 3. PHÒNG KHÁM (CLINIC)
// ==========================================

export interface PhongKhamResponse {
  id: number;
  tenPhong: string;
  tang: string | null;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  tenPhongEn?: string | null;
  tangEn?: string | null;
}

export interface PhongKhamRequest {
  tenPhong: string;
  tang?: string | null;
  idChuyenKhoa: number;
  tenPhongEn?: string | null;
  tangEn?: string | null;
}

export interface GetPhongKhamParams {
  idChuyenKhoa?: number;
}

// ==========================================
// 4. QUẢN TRỊ BÁC SĨ (DOCTOR - ADMIN)
// ==========================================

export interface BacSiQuanTriResponse {
  id: number;
  maBacSi: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  anhDaiDien: string | null;
  hocVi: string | null;
  soGiayPhep: string | null;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  soLuotDaKham: number;
  trangThai: TrangThaiBacSi;
  trangThaiTaiKhoan: TrangThaiTaiKhoan;
  phaiDoiMatKhau: boolean;
}

export interface HoSoBacSiQuanTriResponse {
  id: number;
  maBacSi: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  anhDaiDien: string | null;
  soGiayPhep: string | null;
  trangThai: TrangThaiBacSi;
  trangThaiTaiKhoan: TrangThaiTaiKhoan;
  phaiDoiMatKhau: boolean;
  hocVi: string | null;
  chucVu: string | null;
  soNamKinhNghiem: number | null;
  gioiThieuNgan: string | null;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  tieuSu: string | null;
  quaTrinhDaoTao: string[];
  quaTrinhCongTac: string[];
  linhVucKhamChua: string[];
  anh: AnhBacSiResponse[];
  chucVuEn?: string | null;
  gioiThieuNganEn?: string | null;
  tieuSuEn?: string | null;
  quaTrinhDaoTaoEn?: string[];
  quaTrinhCongTacEn?: string[];
  linhVucKhamChuaEn?: string[];
}

export interface ThemBacSiRequest {
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  idChuyenKhoa: number;
  soGiayPhep?: string | null;
  hocVi?: string | null;
  chucVu?: string | null;
  soNamKinhNghiem?: number | null;
}

export interface SuaBacSiRequest {
  hoTen: string;
  soDienThoai?: string | null;
  idChuyenKhoa: number;
  soGiayPhep?: string | null;
}

export interface CapNhatHoSoBacSiRequest {
  hocVi?: string | null;
  chucVu?: string | null;
  soNamKinhNghiem?: number | null;
  gioiThieuNgan?: string | null;
  tieuSu?: string | null;
  quaTrinhDaoTao?: string[];
  quaTrinhCongTac?: string[];
  linhVucKhamChua?: string[];
  chucVuEn?: string | null;
  gioiThieuNganEn?: string | null;
  tieuSuEn?: string | null;
  quaTrinhDaoTaoEn?: string[];
  quaTrinhCongTacEn?: string[];
  linhVucKhamChuaEn?: string[];
}

export interface CapNhatAnhBacSiRequest {
  loai: LoaiAnhBacSi;
  chuThich?: string | null;
  chuThichEn?: string | null;
}

export interface SapXepAnhBacSiRequest {
  idAnh: number[];
}

export interface NgungCongTacRequest {
  lyDo: string;
}

export interface AnhHuongNgungCongTacResponse {
  soCaSapToi: number;
  soLichHenBiAnhHuong: number;
}

export interface KetQuaNgungCongTacResponse {
  bacSi: HoSoBacSiQuanTriResponse;
  soCaDaHuy: number;
  soLichHenCanDoi: number;
}

export interface GetBacSiQuanTriParams {
  tuKhoa?: string;
  idChuyenKhoa?: number;
  trangThai?: TrangThaiBacSi;
  trang?: number;
  kichThuoc?: number;
}

// ==========================================
// 5. QUẢN TRỊ PHÒNG KHÁM (CLINIC - ADMIN)
// ==========================================

export interface PhongKhamQuanTriResponse {
  id: number;
  tenPhong: string;
  tang: string | null;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  trangThai: TrangThaiPhongKham;
  soCaSapToi: number;
  tenPhongEn?: string | null;
  tangEn?: string | null;
}

export interface GetPhongKhamQuanTriParams {
  tuKhoa?: string;
  idChuyenKhoa?: number;
  trangThai?: TrangThaiPhongKham;
  trang?: number;
  kichThuoc?: number;
}

export interface ThuocResponse {
  id: number;
  tenThuoc: string;
  donVi: string | null;
  moTa: string | null;
  daXacMinh: boolean;
  trangThai: "DANG_DUNG" | "NGUNG_DUNG";
  tenBacSiTao?: string | null;
  soLanKe: number;
  donViEn?: string | null;
  moTaEn?: string | null;
}

export interface ThuocRequest {
  tenThuoc: string;
  donVi?: string | null;
  moTa?: string | null;
  donViEn?: string | null;
  moTaEn?: string | null;
}

export interface GetThuocParams {
  tuKhoa?: string;
  daXacMinh?: boolean;
  trangThai?: "DANG_DUNG" | "NGUNG_DUNG";
  trang?: number;
  kichThuoc?: number;
}
