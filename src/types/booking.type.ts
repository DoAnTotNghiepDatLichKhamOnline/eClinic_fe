import type { TrangThaiLienKet, GioiTinh, TrangThaiLichHen, NguoiDatLich, QuanHeGiamHo } from './common.type';

export interface BacSiTomTatResponse {
  id: number;
  hoTen: string;
  hocVi: string;
  anhDaiDien: string | null;
}

export interface PhongKhamTomTatResponse {
  id: number;
  tenPhong: string;
  tang: string | null;
}

export interface KhungGioResponse {
  gioBatDau: string;
  gioKetThuc: string;
  tongSoCho: number;
  soChoConLai: number;
  hetCho: boolean;
}

export interface CaKhamResponse {
  idLichLamViec: number;
  ngay: string;
  gioBatDau: string;
  gioKetThuc: string;
  soLuotToiDaMoiGio: number;
  thoiLuongLuotPhut: number;
  bacSi: BacSiTomTatResponse;
  phongKham: PhongKhamTomTatResponse;
  khungGio: KhungGioResponse[];
}

export interface KhungGioGopResponse {
  gioBatDau: string;
  gioKetThuc: string;
  tongSoCho: number;
  soChoConLai: number;
  hetCho: boolean;
  soBacSi: number;
}

export interface NgayConChoResponse {
  ngay: string;
  soChoConLai: number;
}

export interface NgaySomNhatResponse {
  idBacSi: number;
  ngay: string;
  soChoConLai: number;
}

export interface DatLichResponse {
  maPhieuKham: string;
  maTraCuu: string;
  linkPhieuKham: string;
  soThuTu: number;
  ngay: string;
  gioKhamDuKien: string;
  gioBatDauKhung: string;
  gioKetThucKhung: string;
  trangThai: TrangThaiLichHen;
  bacSi: BacSiTomTatResponse;
  phongKham: PhongKhamTomTatResponse;
  hoTenBenhNhan: string;
  hoTenNguoiGiamHo: string | null;
  luuVaoTaiKhoan: boolean;
  bacSiDoPhongKhamXep: boolean;
}

export interface BenhNhanPhieuKhamResponse {
  hoTen: string;
  namSinh: number;
  gioiTinh: GioiTinh;
  cccd: string | null;
  soDienThoai: string | null;
}

export interface NguoiGiamHoPhieuKhamResponse {
  hoTen: string;
  quanHe: QuanHeGiamHo;
  soDienThoai: string;
}

export interface PhieuKhamResponse {
  maPhieuKham: string;
  maTraCuu: string;
  linkPhieuKham: string;
  trangThai: TrangThaiLichHen;
  soThuTu: number;
  ngay: string;
  gioKhamDuKien: string;
  gioBatDauKhung: string;
  gioKetThucKhung: string;
  bacSi: BacSiTomTatResponse;
  tenChuyenKhoa: string;
  phongKham: PhongKhamTomTatResponse;
  lyDoKham: string;
  ngayDat: string;
  benhNhan: BenhNhanPhieuKhamResponse;
  nguoiGiamHo: NguoiGiamHoPhieuKhamResponse | null;
  canNguoiGiamHoDiCung: boolean;
  lyDoHuy: string | null;
  duocHuyDoi: boolean;
  hanHuyDoi: string;
  canDoiLich: boolean;
}

export interface LichHenCuaToiResponse {
  maPhieuKham: string;
  maTraCuu: string;
  linkPhieuKham: string;
  trangThai: TrangThaiLichHen;
  soThuTu: number;
  ngay: string;
  gioKhamDuKien: string;
  gioBatDauKhung: string;
  gioKetThucKhung: string;
  bacSi: BacSiTomTatResponse;
  tenChuyenKhoa: string;
  phongKham: PhongKhamTomTatResponse;
  hoTenBenhNhan: string;
  laBanThan: boolean;
  hoTenNguoiGiamHo: string | null;
  lyDoKham: string;
  ngayDat: string;
  nguoiDat: NguoiDatLich;
  thongTinKhacHoSo: boolean;
  lyDoHuy: string | null;
  duocHuyDoi: boolean;
  hanHuyDoi: string;
  canDoiLich: boolean;
}

export interface DonThuoc {
  tenThuoc: string;
  donVi: string;
  lieuDung: string;
  soLanMoiNgay: number | null;
  soNgayDung: number | null;
  ghiChuSuDung: string | null;
}

export interface KetQuaKhamResponse {
  chanDoan: string;
  ghiChu: string | null;
  ngayTaiKhamDeXuat: string | null;
  donThuoc: DonThuoc[];
}

export interface DanhGiaCuaToiResponse {
  soSao: number;
  nhanXet: string | null;
  ngayTao: string;
  duocSuaDen: string;
}

export interface LichHenChiTietCuaToiResponse {
  lichHen: LichHenCuaToiResponse;
  ngaySinhBenhNhan: string;
  gioiTinhBenhNhan: GioiTinh;
  soDienThoaiLienHe: string | null;
  emailLienHe: string | null;
  ketQua: KetQuaKhamResponse | null;
  duocDanhGia: boolean;
  danhGia: DanhGiaCuaToiResponse | null;
}

export interface LanKhamCuaToiResponse {
  lichHen: LichHenCuaToiResponse;
  ketQua: KetQuaKhamResponse;
}

export interface HoSoCuaToiResponse {
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

export interface NguoiGiamHo {
  hoTen: string;
  quanHe: QuanHeGiamHo;
  soDienThoai: string;
  cccd: string;
  ngaySinh: string | null;
}

export interface NguoiThanDaLuuResponse {
  id: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinh;
  cccd: string | null;
  soDienThoai: string;
  email: string | null;
  diaChi: string | null;
  soBaoHiemYTe: string | null;
  nguoiGiamHo: NguoiGiamHo | null;
  lanDungCuoi: string;
}

export interface LanDatGanNhat {
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  idBacSi: number;
  hoTenBacSi: string;
}

export interface ThongTinDatLichResponse {
  banThan: HoSoCuaToiResponse | null;
  emailTaiKhoan: string;
  nguoiThan: NguoiThanDaLuuResponse[];
  lanDatGanNhat: LanDatGanNhat | null;
}

export interface LichSapToi {
  cuaToi: LichHenCuaToiResponse[];
  cuaNguoiKhac: LichHenCuaToiResponse[];
}

export interface SoLich {
  sapToiCuaToi: number;
  sapToiCuaNguoiKhac: number;
  lichSu: number;
  daKham: number;
}

export interface TrangCaNhanResponse {
  hoSo: HoSoCuaToiResponse | null;
  emailTaiKhoan: string;
  nguoiThan: NguoiThanDaLuuResponse[];
  lichSapToi: LichSapToi;
  lanKhamGanDay: LanKhamCuaToiResponse[];
  soLich: SoLich;
}