import type { LoaiThongBao } from './common.type';

export interface ThongBaoResponse {
  id: number;
  loai: LoaiThongBao;
  noiDung: string;
  daDoc: boolean;
  ngayTao: string;
  idLichHen: number | null;
  maPhieuKham: string | null;
  idYeuCau: number | null;
}

export interface SoChuaDocResponse {
  soChuaDoc: number;
}

export interface DanhDauDaDocResponse {
  soDaDanhDau: number;
}