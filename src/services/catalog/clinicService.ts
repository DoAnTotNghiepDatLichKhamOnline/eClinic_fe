import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  PhongKhamResponse,
  PhongKhamRequest,
  GetPhongKhamParams,
  PhongKhamQuanTriResponse,
  GetPhongKhamQuanTriParams,
} from "@/types/catalog.type";

export const clinicService = {
  // Public (Xếp ca / hiển thị)
  getDanhSachPhongKham: async (params?: GetPhongKhamParams) => {
    const res = await axiosClient.get<ApiResponse<PhongKhamResponse[]>>(
      "/api/catalog/phong-kham",
      { params },
    );
    return res.data;
  },

  // Quản trị viên
  getDanhSachPhongKhamQuanTri: async (params?: GetPhongKhamQuanTriParams) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<PhongKhamQuanTriResponse>>>(
      "/api/catalog/quan-tri/phong-kham",
      { params },
    );
    return res.data;
  },

  themPhongKham: async (data: PhongKhamRequest) => {
    const res = await axiosClient.post<ApiResponse<PhongKhamQuanTriResponse>>(
      "/api/catalog/quan-tri/phong-kham",
      data,
    );
    return res.data;
  },

  suaPhongKham: async (id: number, data: PhongKhamRequest) => {
    const res = await axiosClient.put<ApiResponse<PhongKhamQuanTriResponse>>(
      `/api/catalog/quan-tri/phong-kham/${id}`,
      data,
    );
    return res.data;
  },

  ngungHoatDongPhongKham: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<PhongKhamQuanTriResponse>>(
      `/api/catalog/quan-tri/phong-kham/${id}/ngung-hoat-dong`,
    );
    return res.data;
  },

  hoatDongLaiPhongKham: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<PhongKhamQuanTriResponse>>(
      `/api/catalog/quan-tri/phong-kham/${id}/hoat-dong-lai`,
    );
    return res.data;
  },
};

export default clinicService;