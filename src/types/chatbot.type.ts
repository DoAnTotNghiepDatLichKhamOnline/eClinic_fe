export interface LichHenCuaToi {
  maPhieuKham: string;
  maTraCuu: string;
  linkPhieuKham: string;
  trangThai: string;
  ngay: string;
  gioBatDauKhung: string;
  gioKetThucKhung: string;
  hoTenBacSi: string;
  tenChuyenKhoa: string;
  tenPhong: string;
  tang: string | null;
  hoTenBenhNhan: string;
  laBanThan: boolean;
  canDoiLich: boolean;
}

export interface LanKham {
  maPhieuKham: string;
  maTraCuu: string;
  ngay: string;
  hoTenBacSi: string;
  tenChuyenKhoa: string;
  hoTenBenhNhan: string;
  laBanThan: boolean;
  ngayTaiKhamDeXuat: string | null;
}

export interface ChatSuggestion {
  chuyenKhoa?: { id: number; ten: string } | null;
  bacSi?: Array<{
    id: number;
    hoTen: string;
    hocVi: string | null;
    chucVu: string | null;
    anhDaiDien: string | null;
    ngaySomNhat: string | null;
    soChoConLai: number;
  }>;
  lichKham?: Array<{
    idBacSi: number;
    hoTenBacSi: string;
    idLichLamViec: number;
    ngay: string;
    tenPhong: string;
    tang: string | null;
    khungGio: Array<{
      gioBatDau: string;
      gioKetThuc: string;
      soChoConLai: number;
    }>;
  }>;
  lichHenCuaToi?: LichHenCuaToi[] | null;
  lanKham?: LanKham[] | null;
}

export interface ChatMessage {
  id: number;
  nguoiGui: "NGUOI_DUNG" | "CHATBOT";
  loai:
    | "CAU_HOI"
    | "LOI_CHAO"
    | "TRA_LOI"
    | "NGOAI_PHAM_VI"
    | "KHAN_CAP"
    | "CAN_DONG_Y";
  noiDung: string;
  ngayTao: string;
  goiY: ChatSuggestion | null;
}

export interface ChatSession {
  idPhien: number;
  maKhach?: string;
  thoiGianBatDau: string;
  daDongYDuLieu?: boolean;
  tinNhan?: ChatMessage[];
}
