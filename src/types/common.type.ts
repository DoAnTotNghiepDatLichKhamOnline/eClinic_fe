export interface ApiResponse<T = any> {
  thanhCong: boolean;
  thongDiep: string;
  maLoi?: string;
  duLieu?: T;
  chiTiet?: Array<{
    truong: string;
    thongDiep: string;
  }>;
}

export interface PageResponse<T> {
  noiDung: T[];
  trang: number;
  kichThuoc: number;
  tongSoPhanTu: number;
  tongSoTrang: number;
}

export type VaiTro = 'BENH_NHAN' | 'BAC_SI' | 'QUAN_TRI_VIEN';
export type TrangThaiTaiKhoan = 'CHO_XAC_NHAN' | 'DA_KICH_HOAT' | 'VO_HIEU_HOA';
export type TrangThaiLienKet = 'CHUA_LIEN_KET' | 'CHO_XAC_MINH' | 'DA_LIEN_KET';
export type GioiTinh = 'NAM' | 'NU' | 'KHAC';
export type TrangThaiBacSi = 'DANG_CONG_TAC' | 'NGUNG_CONG_TAC';
export type TrangThaiLichHen = 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'BI_TU_CHOI' | 'DA_HOAN_THANH' | 'DA_HUY' | 'DA_HUY_DO_DOI_LICH';
export type LocLichHen = 'TAT_CA' | 'SAP_TOI' | 'LICH_SU';
export type PhamViLichHen = 'TAT_CA' | 'BAN_THAN' | 'NGUOI_KHAC';
export type NguoiDatLich = 'TOI' | 'KHACH' | 'TAI_KHOAN_KHAC';
export type QuanHeGiamHo = 'CHA' | 'ME' | 'NGUOI_GIAM_HO_HOP_PHAP' | 'KHAC';
export type LoaiAnhBacSi = 'ANH_CONG_VIEC' | 'CHUNG_CHI';
export type LoaiThongBao = 
  | 'LICH_HEN_DA_XAC_NHAN' | 'LICH_HEN_BI_TU_CHOI' | 'LICH_HEN_CAN_DOI' | 'LICH_HEN_DOI_PHONG'
  | 'LICH_HEN_MOI' | 'LICH_HEN_DA_DOI' | 'LICH_HEN_DA_HUY' | 'KET_QUA_DUYET_DOI_LICH'
  | 'CA_LAM_VIEC_THAY_DOI' | 'YEU_CAU_DOI_LICH_MOI' | 'NHAC_LICH_KHAM' | 'HE_THONG';