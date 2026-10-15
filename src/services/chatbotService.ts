import axiosClient from "@/utils/axiosClient";
import type { ApiResponse } from "@/types/common.type";

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

export const chatbotService = {
  taoPhien: async (maKhach?: string) => {
    const response = await axiosClient.post<ApiResponse<ChatSession>>(
      "/api/chatbot/phien",
      {},
      { headers: maKhach ? { "X-Chat-Khach": maKhach } : undefined },
    );
    return response.data;
  },

  guiTinNhan: async (idPhien: string, noiDung: string, maKhach?: string) => {
    const response = await axiosClient.post<
      ApiResponse<{ tinNhan: ChatMessage; traLoi: ChatMessage }>
    >(
      `/api/chatbot/phien/${idPhien}/tin-nhan`,
      { noiDung },
      { headers: maKhach ? { "X-Chat-Khach": maKhach } : undefined },
    );
    return response.data;
  },

  getTinNhan: async (idPhien: string, maKhach?: string) => {
    const response = await axiosClient.get<ApiResponse<ChatMessage[]>>(
      `/api/chatbot/phien/${idPhien}/tin-nhan`,
      { headers: maKhach ? { "X-Chat-Khach": maKhach } : undefined },
    );
    return response.data;
  },

  getPhienCuaToi: async () => {
    const response =
      await axiosClient.get<ApiResponse<ChatSession[]>>("/api/chatbot/phien");
    return response.data;
  },

  dongYDuLieu: async (idPhien: string) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/chatbot/phien/${idPhien}/dong-y`,
    );
    return response.data;
  },

  rutDongYDuLieu: async (idPhien: string) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/chatbot/phien/${idPhien}/dong-y`,
    );
    return response.data;
  },
};
