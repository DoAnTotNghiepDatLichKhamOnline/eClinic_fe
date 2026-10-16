import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  LichHenCuaToiResponse,
  CaLamViecResponse,
  YeuCauDoiLichResponse,
  GetLichHenQuanTriParams,
  TaoCaRequest,
  SuaCaRequest,
  HuyCaRequest,
  XuLyYeuCauRequest,
  HoSoBenhNhanQuanTriResponse,
  ChiTietHoSoBenhNhanResponse,
  SuaHoSoBenhNhanRequest,
  TuChoiLienKetRequest,
  GetDanhGiaQuanTriParams,
  DanhGiaQuanTriResponse,
  TongQuanQuanTriResponse,
  TrangThaiYeuCau,
} from "@/types/booking.type";

export const adminBookingService = {
  /** Get all appointments with filters */
  getLichHenQuanTri: async (params?: GetLichHenQuanTriParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/quan-tri/lich-hen", { params });
    return response.data;
  },

  /** Get doctor duty schedule roster */
  getLichLamViecQuanTri: async (params: {
    tuNgay: string;
    denNgay: string;
    idChuyenKhoa?: number;
    idBacSi?: number;
    idPhongKham?: number;
  }) => {
    const response = await axiosClient.get<ApiResponse<CaLamViecResponse[]>>(
      "/api/booking/quan-tri/lich-lam-viec",
      { params },
    );
    return response.data;
  },

  /** Create work shift */
  taoCaLamViec: async (data: TaoCaRequest) => {
    const response = await axiosClient.post<ApiResponse<CaLamViecResponse>>(
      "/api/booking/quan-tri/lich-lam-viec",
      data,
    );
    return response.data;
  },

  /** Update work shift */
  suaCaLamViec: async (id: number, data: SuaCaRequest) => {
    const response = await axiosClient.put<ApiResponse<CaLamViecResponse>>(
      `/api/booking/quan-tri/lich-lam-viec/${id}`,
      data,
    );
    return response.data;
  },

  /** Cancel work shift */
  huyCaLamViec: async (id: number, data: HuyCaRequest) => {
    const response = await axiosClient.post<ApiResponse<unknown>>(
      `/api/booking/quan-tri/lich-lam-viec/${id}/huy`,
      data,
    );
    return response.data;
  },

  /** Get affected appointments requiring rescheduling */
  getLichHenCanDoiLich: async (params?: {
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/quan-tri/lich-lam-viec/can-doi-lich", { params });
    return response.data;
  },

  /** Get appointments belonging to a specific patient profile */
  getLichHenTrongHoSoQuanTri: async (
    id: number,
    params?: { trang?: number; kichThuoc?: number },
  ) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >(`/api/booking/quan-tri/ho-so-benh-nhan/${id}/lich-hen`, { params });
    return response.data;
  },

  /** Get shift change requests pending review */
  getYeuCauDoiLichQuanTri: async (params?: {
    trangThai?: TrangThaiYeuCau;
    tatCa?: boolean;
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<YeuCauDoiLichResponse>>
    >("/api/booking/quan-tri/yeu-cau-doi-lich", { params });
    return response.data;
  },

  /** Approve or reject shift change request */
  xuLyYeuCauDoiLich: async (
    id: number,
    data: XuLyYeuCauRequest,
    approve = true,
  ) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiLichResponse>>(
      `/api/booking/quan-tri/yeu-cau-doi-lich/${id}/${approve ? "duyet" : "tu-choi"}`,
      data,
    );
    return response.data;
  },

  /** Get patient profiles list */
  getHoSoBenhNhanQuanTri: async (params?: {
    tuKhoa?: string;
    trangThaiLienKet?: string;
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<HoSoBenhNhanQuanTriResponse>>
    >("/api/booking/quan-tri/ho-so-benh-nhan", { params });
    return response.data;
  },

  /** Get profiles pending verification */
  getHoSoChoXacMinhQuanTri: async (params?: {
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<unknown>>>(
      "/api/booking/quan-tri/ho-so-benh-nhan/cho-xac-minh",
      { params },
    );
    return response.data;
  },

  /** Get patient profile details with exam history */
  getChiTietHoSoBenhNhanQuanTri: async (id: number) => {
    const response = await axiosClient.get<
      ApiResponse<ChiTietHoSoBenhNhanResponse>
    >(`/api/booking/quan-tri/ho-so-benh-nhan/${id}`);
    return response.data;
  },

  /** Update patient profile details */
  suaHoSoBenhNhanQuanTri: async (id: number, data: SuaHoSoBenhNhanRequest) => {
    const response = await axiosClient.put<
      ApiResponse<ChiTietHoSoBenhNhanResponse>
    >(`/api/booking/quan-tri/ho-so-benh-nhan/${id}`, data);
    return response.data;
  },

  /** Approve account-patient profile linkage */
  xacMinhLienKetHoSo: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/quan-tri/ho-so-benh-nhan/${id}/duyet`,
    );
    return response.data;
  },

  /** Reject account-patient profile linkage */
  tuChoiLienKetHoSo: async (id: number, data: TuChoiLienKetRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/quan-tri/ho-so-benh-nhan/${id}/tu-choi`,
      data,
    );
    return response.data;
  },

  /** Get patient reviews for moderation */
  getDanhGiaQuanTri: async (params?: GetDanhGiaQuanTriParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<DanhGiaQuanTriResponse>>
    >("/api/booking/quan-tri/danh-gia", { params });
    return response.data;
  },

  /** Toggle review visibility */
  anHienDanhGia: async (id: number, an: boolean) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/api/booking/quan-tri/danh-gia/${id}/an`,
      { an },
    );
    return response.data;
  },

  /** Get admin dashboard analytics */
  getTongQuanQuanTri: async () => {
    const response = await axiosClient.get<
      ApiResponse<TongQuanQuanTriResponse>
    >("/api/booking/quan-tri/tong-quan");
    return response.data;
  },
};

export default adminBookingService;
