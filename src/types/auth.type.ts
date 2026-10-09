import type { VaiTro, TrangThaiTaiKhoan, TrangThaiLienKet,  TrangThaiBacSi, GioiTinh} from './common.type';

export interface TaiKhoanResponse {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  vaiTro: VaiTro;
  trangThai: TrangThaiTaiKhoan;
}

export interface DangNhapResponse {
  accessToken: string;
  loaiToken: string;
  thoiHanAccessToken: number;
  taiKhoan: TaiKhoanResponse;
}

export interface HoSoCaNhanResponse {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  anhDaiDien: string | null;
  vaiTro: VaiTro;
  trangThai: TrangThaiTaiKhoan;
  coMatKhau: boolean;
  lienKetGoogle: boolean;
  ngayTao: string;
  bacSi: HoSoBacSiResponse | null;
  hoSoBenhNhan: HoSoBenhNhanResponse | null;
}

export interface HoSoBacSiResponse {
  id: number;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  hocVi: string;
  soGiayPhep: string;
  soNamKinhNghiem: number;
  tieuSu: string;
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
  lyDoVoHieuHoa?: string;
  ngaySinh?: string;
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
  lyDoVoHieuHoa?: string;
  ngaySinh?: string;
  ngayTao: string;
  ngayCapNhat: string;
  coMatKhau: boolean;
  lienKetGoogle: boolean;
  trangThaiLienKetHoSo: TrangThaiLienKet | null;
  bacSi?: HoSoBacSiResponse;
}