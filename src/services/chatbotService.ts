import axiosClient from "@/utils/axiosClient";
import type { ApiResponse } from "@/types/common.type";
import type { ChatMessage, ChatSession } from "@/types/chatbot.type";
export type { ChatMessage, ChatSession };


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
