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

// ==========================================
// 8. ĐẶT LỊCH & SỔ KHÁM BỔ SUNG (PATIENT & GUEST)
// ==========================================

export interface NguoiGiamHoRequest {
  hoTen: string;
  quanHe: QuanHeGiamHo;
  soDienThoai: string;
  cccd: string;
  ngaySinh?: string | null;
}

export interface NguoiThanDaLuuRequest {
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinh;
  soDienThoai: string;
  email?: string | null;
  soBaoHiemYTe?: string | null;
  diaChi?: string | null;
  nguoiGiamHo?: NguoiGiamHoRequest | null;
}

export interface NgayNghiResponse {
  ngay: string;
  lyDo?: string | null;
}

export interface QuyTacDatLichResponse {
  gioiHanDatTruocNgay: number;
  thoiGianHuyToiThieuGio: number;
  thoiGianDoiLichToiThieuGio: number;
  soLanDoiLichToiDa: number;
}

export interface CapLaiLienKetRequest {
  email: string;
  soDienThoai: string;
}

export interface SoKhamTomTatResponse {
  maSoKham: string;
  maPhieuKham: string;
  hoTenChe: string;
  soDienThoaiChe: string;
  ngayKham: string;
  gioKham: string;
  bacSi: BacSiTomTatResponse;
  chuyenKhoa: string;
  phongKham?: PhongKhamTomTatResponse | null;
  trangThai: TrangThaiLichHen;
  coKetQua: boolean;
}

export interface XacMinhSoKhamRequest {
  soDienThoai4SoCuoi: string;
}

export interface SoKhamChiTietResponse {
  maSoKham: string;
  maPhieuKham: string;
  maTraCuu: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinh;
  soDienThoai: string;
  cccdChe?: string | null;
  diaChi?: string | null;
  ngayKham: string;
  gioKham: string;
  bacSi: BacSiTomTatResponse;
  chuyenKhoa: string;
  phongKham?: PhongKhamTomTatResponse | null;
  trangThai: TrangThaiLichHen;
  lyDoKham?: string | null;
  sinhHieu?: SinhHieu | null;
  khamLamSang?: string | null;
  chanDoan: string;
  maIcdChinh?: string | null;
  chanDoanKemTheo?: string | null;
  loiDanBacSi?: string | null;
  ngayTaiKham?: string | null;
  donThuoc?: DonThuoc[] | null;
  ngayHoanThanh?: string | null;
}

export interface GetKhungGioTheoNgayParams {
  ngay: string;
  idBacSi?: number;
  idChuyenKhoa?: number;
}

export interface GetKhungGioNhieuNgayParams {
  idBacSi: number;
  tuNgay?: string;
  denNgay?: string;
}

export interface XinNghiNhieuCaRequest {
  danhSachCaId: number[];
  lyDo: string;
}

export interface YeuCauNhuongCaResponse {
  id: number;
  maYeuCau?: string;
  bacSiNhuong: BacSiTomTatResponse;
  ca: CaLamViecResponse;
  lyDo: string;
  trangThai: TrangThaiYeuCau;
  ngayTao: string;
  ghiChu?: string | null;
}

// ==========================================
// CÁC TYPES BỔ SUNG CHO QUẢN TRỊ VIÊN (QUAN_TRI_VIEN)
// ==========================================

export interface CauHinhDatLichResponse {
  soNgayDatTruocToiDa: number;
  gioDongDatLichTruocCa: number;
  choPhepDoiLichTruocGio: number;
  soLuotKhamToiDaMoiGio: number;
  thoiLuongKhamMacDinhPhut: number;
  tuDongHuyLichTrePhut?: number;
  apDungTu?: string;
}

export interface CapNhatCauHinhDatLichRequest {
  soNgayDatTruocToiDa?: number;
  gioDongDatLichTruocCa?: number;
  choPhepDoiLichTruocGio?: number;
  soLuotKhamToiDaMoiGio?: number;
  thoiLuongKhamMacDinhPhut?: number;
  tuDongHuyLichTrePhut?: number;
  ghiChu?: string;
}

export interface LichSuCauHinhDatLichResponse {
  id: number;
  nguoiThayDoi: string;
  thoiGian: string;
  ghiChu?: string | null;
  noiDungThayDoi: Record<string, { cu: unknown; moi: unknown }>;
}

export interface NgayNghiResponse {
  ngay: string;
  lyDo: string;
  nguoiTao?: string;
  ngayTao?: string;
  soCaBiHuy?: number;
}

export interface KhaiBaoNgayNghiRequest {
  ngay: string;
  lyDo: string;
}

export interface XemTruocNgayNghiResponse {
  ngay: string;
  soCaBiHuy: number;
  soLichHenBiAnhHuong: number;
  danhSachCa: CaLamViecResponse[];
}

export interface LichSuCaLamViecResponse {
  id: number;
  idCa: number;
  hanhDong: "TAO" | "SUA" | "HUY";
  thoiGian: string;
  nguoiThucHien: string;
  chiTiet?: string | null;
}

export interface ThongKeGioLamBacSiResponse {
  idBacSi: number;
  maBacSi: string;
  hoTen: string;
  chuyenKhoa: string;
  tongSoGio: number;
  soCaLam: number;
  tuan: string;
}

export interface SaoChepLichRequest {
  tuNgayNguon: string;
  denNgayNguon: string;
  ngayBatDauDich: string;
  ghiDe?: boolean;
}

export interface XemTruocSaoChepLichResponse {
  soCaSeTao: number;
  soCaBiTrung: number;
  chiTietTrung?: string[];
}

export interface XemTruocNhapExcelResponse {
  tongSoDong: number;
  soDongHopLe: number;
  soDongLoi: number;
  danhSachLoi?: { dong: number; loi: string }[];
}

export interface GuiLichLamViecRequest {
  tuNgay: string;
  denNgay: string;
  idBacSi?: number;
  guiEmail?: boolean;
  guiThongBao?: boolean;
}

export interface DatLichThayRequest {
  idCa: number;
  idHoSoBenhNhan?: number;
  hoTen: string;
  soDienThoai: string;
  soCccd?: string;
  ngaySinh: string;
  gioiTinh: "NAM" | "NU";
  diaChi?: string;
  lyDoKham?: string;
  ghiChu?: string;
}

export interface DoiLichThayRequest {
  idCaMoi: number;
  lyDo?: string;
}

export interface HuyLichThayRequest {
  lyDo: string;
}

export interface ThongKeBaoCaoResponse {
  tongLuotDat: number;
  tongLuotKham: number;
  tongLuotHuy: number;
  tyLeLapDayTrungBinh: number;
  doanhThuUocTinh?: number;
  theoChuyenKhoa: { idChuyenKhoa: number; tenChuyenKhoa: string; soLuot: number; tyLe: number }[];
  theoBacSi: { idBacSi: number; hoTen: string; soLuot: number; tyLeLapDay: number }[];
  theoThoiGian: { mocThoiGian: string; soLuotDat: number; soLuotKham: number }[];
}

export interface GetThongKeBaoCaoParams {
  tuNgay?: string;
  denNgay?: string;
  idChuyenKhoa?: number;
  idBacSi?: number;
  ky?: "NGAY" | "TUAN" | "THANG" | "NAM";
}



