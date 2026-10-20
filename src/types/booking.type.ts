import type {
  TrangThaiLienKet,
  GioiTinh,
  TrangThaiLichHen,
  TrangThaiLichLamViec,
  TrangThaiYeuCau,
  LoaiYeuCauDoiLich,
  LocLichHen,
  PhamViLichHen,
  NguoiDatLich,
  QuanHeGiamHo,
} from "./common.type";

// Re-export common types
export type {
  TrangThaiLienKet,
  GioiTinh,
  TrangThaiLichHen,
  TrangThaiLichLamViec,
  TrangThaiYeuCau,
  LoaiYeuCauDoiLich,
  LocLichHen,
  PhamViLichHen,
  NguoiDatLich,
  QuanHeGiamHo,
};

// ==========================================
// 1. TÓM TẮT & KHUNG GIỜ (SLOTS & SUMMARIES)
// ==========================================

export interface BacSiTomTatResponse {
  id: number;
  hoTen: string;
  hocVi: string | null;
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

// ==========================================
// 2. PHIẾU KHÁM & ĐẶT LỊCH (BOOKING & APPOINTMENT)
// ==========================================

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
  id?: number;
  ngaySinhBenhNhan?: string | null;
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
  doiChieu?: {
    canDoiChieu: boolean;
    hoTenDaNhap?: string;
    ngaySinhDaNhap?: string;
  };
}

export interface SinhHieu {
  mach?: number;
  nhietDo?: number;
  huyetApTamThu?: number;
  huyetApTamTruong?: number;
  nhipTho?: number;
  canNang?: number;
  chieuCao?: number;
}

export interface Icd10GoiY {
  ma: string;
  ten: string;
  manTinh: boolean;
}

export interface DonThuoc {
  idThuoc?: number;
  tenThuoc: string;
  hoatChat?: string | null;
  hamLuong?: string | null;
  duongDung?: string | null;
  donVi: string;
  lieuDung: string;
  soLanMoiNgay: number | null;
  soNgayDung: number | null;
  soLuong?: number | null;
  ghiChuSuDung: string | null;
}

export interface DongThuocRequest {
  idThuoc: number;
  lieuDung?: string;
  soLanMoiNgay?: number;
  soNgayDung: number;
  soLuong: number;
  ghiChuSuDung?: string | null;
}

export interface KetQuaKhamResponse {
  lyDoKham?: string | null;
  sinhHieu?: SinhHieu | null;
  khamLamSang?: string | null;
  chanDoan: string;
  maIcdChinh?: string | null;
  icdChinh?: Icd10GoiY | null;
  chanDoanKemTheo?: string | null;
  ghiChu: string | null;
  ngayTaiKhamDeXuat: string | null;
  donThuoc: DonThuoc[];
  phienBan?: number;
  ngaySuaCuoi?: string | null;
  hanSua?: string;
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

// ==========================================
// 3. HỒ SƠ BỆNH NHÂN & NGƯỜI THÂN (PATIENT RECORDS)
// ==========================================

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
  cccd?: string | null;
  ngaySinh?: string | null;
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

// ==========================================
// 4. BÁC SĨ & LỊCH LÀM VIỆC (DOCTOR SHIFTS & REQUESTS)
// ==========================================

export interface CaLamViecResponse {
  id: number;
  ngay: string;
  gioBatDau: string;
  gioKetThuc: string;
  soLuotToiDaMoiGio: number;
  thoiLuongLuotPhut: number;
  idBacSi: number;
  hoTenBacSi: string;
  idPhongKham: number;
  tenPhongKham: string;
  trangThai: TrangThaiLichLamViec;
  tongSoCho: number;
  soChoDaDat: number;
  soChoConLai: number;
  soLuotDaDat?: number;
  tongSoLuot?: number;
  soLuotConTrong?: number;
  bacSi?: BacSiTomTatResponse;
  phongKham?: PhongKhamTomTatResponse;
  idChuyenKhoa?: number;
  tenChuyenKhoa?: string;
}

export interface LichHenTrongCaResponse {
  id: number;
  maPhieuKham: string;
  soThuTu: number;
  gioKhamDuKien: string;
  gioBatDauKhung: string;
  gioKetThucKhung: string;
  trangThai: TrangThaiLichHen;
  hoTenBenhNhan: string;
  namSinhBenhNhan: number;
  gioiTinhBenhNhan: GioiTinh;
  soDienThoaiBenhNhan: string | null;
  lyDoKham: string;
  ketQuaKham: KetQuaKhamResponse | null;
}

export interface ChiTietCaLamViecResponse {
  caLamViec: CaLamViecResponse;
  danhSachLichHen: LichHenTrongCaResponse[];
}

export interface DanhGiaCuaBacSiResponse {
  id: number;
  soSao: number;
  nhanXet: string | null;
  ngayTao: string;
  hoTenBenhNhan: string;
  maPhieuKham: string;
}

export interface YeuCauDoiLichResponse {
  id: number;
  idLichLamViec?: number;
  loaiYeuCau?: LoaiYeuCauDoiLich;
  ca?: CaLamViecResponse;
  idCaLamViec: number;
  ngay: string;
  gioBatDau: string;
  gioKetThuc: string;
  tenPhongHienTai: string;
  tenPhongMongMuon: string;
  lyDo: string;
  trangThai: TrangThaiYeuCau;
  ngayTao: string;
  nguoiDuyet?: string | null;
  phanHoi?: string | null;
  ngayMongMuon?: string | null;
  gioBatDauMongMuon?: string | null;
  gioKetThucMongMuon?: string | null;
  phongKhamMongMuon?: PhongKhamTomTatResponse | null;
  ghiChuXuLy?: string | null;
  ngayGui?: string;
  ngayXuLy?: string | null;
}

export type TrangThaiHangDoi = "CHO_KHAM" | "DANG_KHAM" | "VANG_MAT" | "DA_KHAM";

export interface HangDoiLuot {
  trangThaiHangDoi: TrangThaiHangDoi;
  goiLuc: string | null;
  lichHen: LichHenCuaToiResponse;
}

export interface HangDoiCa {
  idLichLamViec: number;
  buoi: "SANG" | "CHIEU" | "TOI";
  gioBatDau: string;
  gioKetThuc: string;
  phongKham: string | PhongKhamTomTatResponse | { id: number; tenPhong: string; tang?: string | null };
  soLuong: {
    tong: number;
    choKham: number;
    dangKham: number;
    vangMat: number;
    daKham: number;
  };
  idDangKham: number | null;
  idTiepTheo: number | null;
  cacLuot: HangDoiLuot[];
}

export interface HangDoiResponse {
  ngay: string;
  idCaHienTai: number | null;
  tinhLuc: string;
  cacCa: HangDoiCa[];
}

export interface DanhGiaTongQuanResponse {
  diemTrungBinh: number | null;
  soDanhGia: number;
  phanBo: Record<string, number>;
}

export interface LanSuaBenhAn {
  phienBan: number;
  ngaySua: string;
  bacSi: { id: number; hoTen: string };
  lyDo: string;
  cacTruongDoi: string[];
  truoc: KetQuaKhamResponse;
  sau: KetQuaKhamResponse;
}

export interface LichSuSuaBenhAnResponse {
  idLichHen: number;
  maTraCuu: string;
  phienBanHienTai: number;
  ngayGhiNhan: string;
  cacLanSua: LanSuaBenhAn[];
}

export interface TongQuanBacSiResponse {
  dangCho?: number;
  daKham?: number;
  diemDanhGia?: number | null;
  soDanhGia?: number;
  lichHenSapToi?: number;
  yeuCauChoXacNhan?: number;
  tinhLuc?: string;
  caHomNay: number;
  lichHenHomNay: number;
  soCaTuanNay: number;
  danhGiaTrungBinh: number | null;
  tongSoDanhGia: number;
}

// ==========================================
// 5. QUẢN TRỊ VIÊN (ADMIN RESPONSES)
// ==========================================

export interface TongQuanQuanTriResponse {
  bacSiDangCongTac?: number;
  benhNhanDaDangKy?: number;
  luotDatTrongThang?: number;
  tinhLuc?: string;
  tongLichHenHomNay: number;
  tongCaLamViecHomNay: number;
  yeuCauDoiLichChoDuyet: number;
  hoSoChoXacMinh: number;
}

export interface HoSoBenhNhanQuanTriResponse {
  id: number;
  hoTen: string | null;
  ngaySinh: string | null;
  gioiTinh: GioiTinh | null;
  cccd: string | null;
  cccdChe?: string | null;
  soDienThoai: string | null;
  diaChi: string | null;
  soBaoHiemYTe: string | null;
  trangThaiLienKet: TrangThaiLienKet;
  ngayTao: string;
  soLichHen?: number;
  coTaiKhoan?: boolean;
}

export interface ChiTietHoSoBenhNhanResponse {
  hoSo: HoSoBenhNhanQuanTriResponse;
  lichSuKham: LanKhamCuaToiResponse[];
}

export interface DanhGiaQuanTriResponse {
  id: number;
  soSao: number;
  nhanXet: string | null;
  anHien: boolean;
  ngayTao: string;
  hoTenBacSi: string;
  tenChuyenKhoa: string;
  hoTenBenhNhan: string;
  maPhieuKham: string;
  tenBacSi?: string;
  tenBenhNhan?: string;
  ngayKham?: string;
}

// ==========================================
// 6. REQUEST DTOs (CÁC DTO YÊU CẦU)
// ==========================================

export interface BenhNhanRequest {
  hoTen: string;
  ngaySinh: string; // ISO date 'YYYY-MM-DD'
  gioiTinh: GioiTinh;
  soDienThoai: string;
  cccd?: string | null;
  email?: string | null;
  soBaoHiemYTe?: string | null;
  diaChi?: string | null;
  namSinh?: number;
  tienSuBenhLy?: string | null;
}

export interface NguoiGiamHoRequest {
  hoTen: string;
  quanHe: QuanHeGiamHo;
  soDienThoai: string;
  cccd: string;
  ngaySinh?: string | null;
  namSinh?: number | null;
}

export interface DatLichRequest {
  idLichLamViec?: number | null;
  idChuyenKhoa?: number | null;
  gioBatDauKhung: string; // ISO LocalDateTime 'YYYY-MM-DDTHH:mm:ss'
  lyDoKham: string;
  benhNhan: BenhNhanRequest;
  nguoiGiamHo?: NguoiGiamHoRequest | null;
  datChoBanThan?: boolean | null;
  luuNguoiThan?: boolean | null;
  // Các trường tương thích cũ (nếu có)
  idCaKham?: number | null;
  nguoiDat?: NguoiDatLich | null;
  luuVaoTaiKhoan?: boolean | null;
}

export interface DoiLichRequest {
  idLichLamViec?: number;
  idChuyenKhoa?: number;
  gioBatDauKhung: string;
  soDienThoai?: string;
  lyDo?: string | null;
  idCaKhamMoi?: number;
  gioBatDauKhungMoi?: string;
  lyDoDoi?: string | null;
}

export interface HuyLichRequest {
  lyDo?: string;
  soDienThoai?: string;
  lyDoHuy?: string;
}

export interface DanhGiaRequest {
  soSao: number;
  nhanXet?: string | null;
}

export interface HoSoCuaToiRequest {
  cccd?: string | null;
  hoTen?: string | null;
  ngaySinh?: string | null;
  gioiTinh?: GioiTinh | null;
  soDienThoai?: string | null;
  diaChi?: string | null;
  soBaoHiemYTe?: string | null;
  tienSuBenhLy?: string | null;
}

export interface TaoCaRequest {
  ngay: string;
  idBacSi: number;
  idPhongKham: number;
  gioBatDau: string;
  gioKetThuc: string;
  soLuotToiDaMoiGio: number;
  thoiLuongLuotPhut: number;
  lapLai?: { cacThu: number[]; denNgay: string };
}

export interface SuaCaRequest {
  idPhongKham: number;
  gioBatDau: string;
  gioKetThuc: string;
  soLuotToiDaMoiGio: number;
  thoiLuongLuotPhut: number;
}

export interface HuyCaRequest {
  lyDo: string;
}

export interface GuiYeuCauDoiLichRequest {
  idLichLamViec: number;
  loaiYeuCau: "XIN_NGHI" | "DOI_CA";
  lyDo: string;
  ngayMongMuon?: string;
  gioBatDauMongMuon?: string;
  gioKetThucMongMuon?: string;
  idPhongKhamMongMuon?: number;
  idCaHienTai?: number;
}

export interface XuLyYeuCauRequest {
  ghiChu?: string;
  chapNhan?: boolean;
  lyDoTuChoi?: string | null;
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
  donThuoc?: DongThuocRequest[] | DonThuoc[];
  lyDoSua?: string;
  phienBan?: number;
}

export interface SuaHoSoBenhNhanRequest {
  cccd?: string | null;
  hoTen?: string | null;
  ngaySinh?: string | null;
  gioiTinh?: GioiTinh | null;
  soDienThoai?: string | null;
  diaChi?: string | null;
  soBaoHiemYTe?: string | null;
  tienSuBenhLy?: string | null;
}

export interface TuChoiLienKetRequest {
  lyDo: string;
}

// ==========================================
// 7. PARAMS DTOs (QUERY PARAMS)
// ==========================================

export interface GetNgayConChoParams {
  idChuyenKhoa?: number;
  idBacSi?: number;
  tuNgay: string;
  denNgay: string;
}

export interface GetLichHenParams {
  loc?: LocLichHen;
  cuaAi?: PhamViLichHen;
  phamVi?: PhamViLichHen;
  tuKhoa?: string;
  trang?: number;
  kichThuoc?: number;
}

export interface GetLichHenQuanTriParams {
  tuKhoa?: string;
  idBacSi?: number;
  ngay?: string;
  trangThai?: TrangThaiLichHen;
  trang?: number;
  kichThuoc?: number;
}

export interface GetDanhGiaQuanTriParams {
  tuKhoa?: string;
  idBacSi?: number;
  soSao?: number;
  soSaoToiDa?: number;
  anHien?: boolean;
  trang?: number;
  kichThuoc?: number;
}
