
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
  lichHenCuaToi?: unknown[] | null;
  lanKham?: unknown[] | null;
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
  idPhien: string;
  maKhach?: string;
  thoiGianBatDau: string;
  daDongYDuLieu?: boolean;
  tinNhan?: ChatMessage[];
}