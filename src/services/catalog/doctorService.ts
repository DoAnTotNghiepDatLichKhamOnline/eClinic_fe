import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  BacSiResponse,
  BacSiChiTietResponse,
  GetBacSiParams,
  BacSiQuanTriResponse,
  HoSoBacSiQuanTriResponse,
  ThemBacSiRequest,
  SuaBacSiRequest,
  CapNhatHoSoBacSiRequest,
  CapNhatHoSoBacSiToiRequest,
  CapNhatAnhBacSiRequest,
  SapXepAnhBacSiRequest,
  NgungCongTacRequest,
  AnhHuongNgungCongTacResponse,
  KetQuaNgungCongTacResponse,
  GetBacSiQuanTriParams,
  LoaiAnhBacSi,
  AnhBacSiResponse,
} from "@/types/catalog.type";

export const doctorService = {
  // ================= Public =================
  getDanhSachBacSi: async (params?: GetBacSiParams) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<BacSiResponse>>>(
      "/api/catalog/bac-si",
      { params },
    );
    return res.data;
  },

  getChiTietBacSi: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<BacSiChiTietResponse>>(
      `/api/catalog/bac-si/${id}`,
    );
    return res.data;
  },

  // ================= Quản trị danh bạ & trạng thái công tác =================
  getDanhSachBacSiQuanTri: async (params?: GetBacSiQuanTriParams) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<BacSiQuanTriResponse>>>(
      "/api/catalog/quan-tri/bac-si",
      { params },
    );
    return res.data;
  },

  themBacSi: async (data: ThemBacSiRequest) => {
    const res = await axiosClient.post<ApiResponse<HoSoBacSiQuanTriResponse>>(
      "/api/catalog/quan-tri/bac-si",
      data,
    );
    return res.data;
  },

  suaBacSi: async (id: number, data: SuaBacSiRequest) => {
    const res = await axiosClient.put<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}`,
      data,
    );
    return res.data;
  },

  getAnhHuongNgungCongTac: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<AnhHuongNgungCongTacResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh-huong-ngung-cong-tac`,
    );
    return res.data;
  },

  ngungCongTacBacSi: async (id: number, data: NgungCongTacRequest) => {
    const res = await axiosClient.post<ApiResponse<KetQuaNgungCongTacResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/ngung-cong-tac`,
      data,
    );
    return res.data;
  },

  congTacLaiBacSi: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/cong-tac-lai`,
    );
    return res.data;
  },

  // ================= Quản trị hồ sơ giới thiệu & Media =================
  getHoSoBacSiQuanTri: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}`,
    );
    return res.data;
  },

  capNhatHoSoBacSi: async (id: number, data: CapNhatHoSoBacSiRequest) => {
    const res = await axiosClient.put<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/ho-so`,
      data,
    );
    return res.data;
  },

  themAnhBacSi: async (
    id: number,
    file: File | Blob,
    loai: LoaiAnhBacSi,
    chuThich?: string,
    chuThichEn?: string,
  ) => {
    const formData = new FormData();
    formData.append("anh", file);
    const res = await axiosClient.post<ApiResponse<AnhBacSiResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh`,
      formData,
      {
        params: {
          loai,
          ...(chuThich ? { chuThich } : {}),
          ...(chuThichEn ? { chuThichEn } : {}),
        },
      },
    );
    return res.data;
  },

  capNhatAnhBacSi: async (
    id: number,
    idAnh: number,
    data: CapNhatAnhBacSiRequest,
  ) => {
    const res = await axiosClient.put<ApiResponse<AnhBacSiResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh/${idAnh}`,
      data,
    );
    return res.data;
  },

  sapXepAnhBacSi: async (id: number, data: SapXepAnhBacSiRequest) => {
    const res = await axiosClient.put<ApiResponse<AnhBacSiResponse[]>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh/thu-tu`,
      data,
    );
    return res.data;
  },

  xoaAnhBacSi: async (id: number, idAnh: number) => {
    const res = await axiosClient.delete<ApiResponse<void>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh/${idAnh}`,
    );
    return res.data;
  },

  // ================= Bác sĩ tự xem & sửa hồ sơ của mình =================
  getHoSoBacSiToi: async () => {
    const res = await axiosClient.get<ApiResponse<HoSoBacSiQuanTriResponse>>(
      "/api/catalog/bac-si/toi/ho-so",
    );
    return res.data;
  },

  capNhatHoSoBacSiToi: async (data: CapNhatHoSoBacSiToiRequest) => {
    const res = await axiosClient.put<ApiResponse<HoSoBacSiQuanTriResponse>>(
      "/api/catalog/bac-si/toi/ho-so",
      data,
    );
    return res.data;
  },

  themAnhCongViecToi: async (
    file: File | Blob,
    chuThich?: string,
    chuThichEn?: string,
  ) => {
    const formData = new FormData();
    formData.append("anh", file);
    const res = await axiosClient.post<ApiResponse<AnhBacSiResponse>>(
      "/api/catalog/bac-si/toi/anh",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          ...(chuThich ? { chuThich } : {}),
          ...(chuThichEn ? { chuThichEn } : {}),
        },
      },
    );
    return res.data;
  },

  suaChuThichAnhToi: async (
    idAnh: number,
    data: { chuThich?: string; chuThichEn?: string },
  ) => {
    const res = await axiosClient.put<ApiResponse<AnhBacSiResponse>>(
      `/api/catalog/bac-si/toi/anh/${idAnh}`,
      data,
    );
    return res.data;
  },

  xoaAnhToi: async (idAnh: number) => {
    const res = await axiosClient.delete<ApiResponse<void>>(
      `/api/catalog/bac-si/toi/anh/${idAnh}`,
    );
    return res.data;
  },
};

export default doctorService;