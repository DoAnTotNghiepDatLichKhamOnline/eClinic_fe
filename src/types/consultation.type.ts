import type { GioiTinh, TrangThaiLichHen } from "./common.type";

export interface SinhHieu {
  mach?: number;
  nhietDo?: number;
  huyetApTamThu?: number;
  huyetApTamTruong?: number;
  nhipTho?: number;
  canNang?: number;
  chieuCao?: number;
}

export interface Icd10Item {
  ma: string;
  ten: string;
  manTinh: boolean;
}

export interface ThuocGoiYItem {
  id: number;
  tenThuoc: string;
  hoatChat?: string | null;
  hamLuong?: string | null;
  dangBaoChe?: string | null;
  duongDung?: string | null;
  donVi: string | null;
}

export interface DongThuocRequest {
  idThuoc: number;
  lieuDung?: string;
  soLanMoiNgay?: number;
  soNgayDung: number;
  soLuong: number;
  ghiChuSuDung?: string | null;
}

export interface DongThuocChiTiet extends DongThuocRequest {
  tenThuoc: string;
  hoatChat?: string | null;
  hamLuong?: string | null;
  dangBaoChe?: string | null;
  duongDung?: string | null;
  donVi?: string | null;
}

export interface GhiKetQuaKhamRequest {
  lyDoKham?: string;
  sinhHieu?: SinhHieu;
  khamLamSang?: string;
  chanDoan: string;
  maIcdChinh?: string;
  chanDoanKemTheo?: string;
  ghiChu?: string | null;
  ngayTaiKhamDeXuat?: string | null;
  donThuoc?: DongThuocRequest[];
  lyDoSua?: string;
  phienBan?: number;
}

export interface KetQuaKhamChiTiet {
  id?: number;
  lyDoKham?: string | null;
  sinhHieu?: SinhHieu | null;
  khamLamSang?: string | null;
  chanDoan: string;
  maIcdChinh?: string | null;
  icdChinh?: Icd10Item | null;
  chanDoanKemTheo?: string | null;
  ghiChu?: string | null;
  ngayTaiKhamDeXuat?: string | null;
  donThuoc?: DongThuocChiTiet[];
  phienBan?: number;
  hanSua?: string;
  ngaySuaCuoi?: string | null;
  lyDoSua?: string | null;
}

export interface DoiChieuThongTin {
  canDoiChieu: boolean;
  hoTenDaNhap?: string | null;
  ngaySinhDaNhap?: string | null;
  gioiTinhDaNhap?: GioiTinh | null;
  hoTenGiamHoDaNhap?: string | null;
}

export interface HoSoBenhNhanEMR {
  id: number;
  cccd?: string | null;
  hoTen: string;
  ngaySinh?: string | null;
  tuoi?: number;
  gioiTinh?: GioiTinh;
  soDienThoai: string;
  diaChi?: string | null;
  soBaoHiemYTe?: string | null;
  tienSuBenhLy?: string | null;
  daLienKetTaiKhoan?: boolean;
}

export interface LichHenEMR {
  id: number;
  maTraCuu: string;
  maPhieuKham: string;
  soThuTu: number;
  gioKhamDuKien: string;
  trangThai: TrangThaiLichHen;
  lyDoHuy?: string | null;
  phongKham?: {
    id: number;
    tenPhong: string;
  } | null;
  lyDoKham: string;
  doiChieu: DoiChieuThongTin;
  benhNhan: {
    hoTen: string;
    soDienThoai: string;
  };
  nguoiGiamHo?: {
    hoTen: string;
    soDienThoai: string;
  } | null;
}

export interface LanKhamTruocItem {
  idLichHen: number;
  maTraCuu: string;
  ngay?: string;
  gioKhamDuKien: string;
  bacSi: {
    id: number;
    hoTen: string;
  };
  tenChuyenKhoa: string;
  trangThai: TrangThaiLichHen;
  lyDoKham?: string | null;
  ketQua?: KetQuaKhamChiTiet | null;
}

export interface HoSoKhamResponse {
  lichHen: LichHenEMR;
  hoSoBenhNhan: HoSoBenhNhanEMR;
  lanKhamTruoc: LanKhamTruocItem[];
  ketQua?: KetQuaKhamChiTiet | null;
}

export interface SuaHoSoBenhNhanEMRRequest {
  hoTen: string;
  ngaySinh: string;
  gioiTinh?: GioiTinh;
  soDienThoai: string;
  cccd?: string;
  soBaoHiemYTe?: string;
  diaChi?: string;
}

export interface LichHenTrongNgayParams {
  ngay?: string;
  idLichLamViec?: number;
  soThuTu?: number;
  tuKhoa?: string;
}

export interface LichHenTrongNgayItem {
  id: number;
  idHoSoBenhNhan?: number;
  soThuTu: number;
  gioKhamDuKien: string;
  maTraCuu: string;
  trangThai: TrangThaiLichHen;
  lyDoKham: string;
  benhNhan: {
    id?: number;
    hoTen: string;
    ngaySinh?: string | null;
    tuoi?: number;
    gioiTinh?: GioiTinh;
    soDienThoai: string;
  };
  doiChieu: DoiChieuThongTin;
}

export interface LichSuSuaItem {
  phienBan: number;
  ngaySua: string;
  bacSi: {
    id: number;
    hoTen: string;
  };
  lyDo: string;
  cacTruongDoi: string[];
  truoc?: KetQuaKhamChiTiet | Record<string, unknown>;
  sau?: KetQuaKhamChiTiet | Record<string, unknown>;
}

export interface LichSuSuaBenhAnResponse {
  idLichHen: number;
  maTraCuu: string;
  phienBanHienTai: number;
  ngayGhiNhan: string;
  cacLanSua: LichSuSuaItem[];
}
