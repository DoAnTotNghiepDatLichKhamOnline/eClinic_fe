import type { LoaiAnhBacSi } from './common.type';

export interface ChuyenKhoaResponse {
  id: number;
  tenChuyenKhoa: string;
  moTa: string | null;
}

export interface BacSiResponse {
  id: number;
  hoTen: string;
  anhDaiDien: string | null;
  hocVi: string;
  chucVu: string | null;
  soNamKinhNghiem: number | null;
  gioiThieuNgan: string | null;
  idChuyenKhoa: number;
  tenChuyenKhoa: string;
  diemDanhGia: number | null;
  soDanhGia: number;
}

export interface BacSiResponse {
  id: number;
  loai: LoaiAnhBacSi;
  url: string;
  chuThich: string | null;
}

export interface BacSiChiTietResponse extends BacSiResponse {
  tieuSu: string | null;
  quaTrinhDaoTao: string[];
  quaTrinhCongTac: string[];
  linhVucKhamChua: string[];
  anh: BacSiResponse[];
}