import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  LichHenCuaToiResponse,
  CaLamViecResponse,
  ChiTietCaLamViecResponse,
  GhiKetQuaKhamRequest,
  KetQuaKhamResponse,
  DanhGiaCuaBacSiResponse,
  YeuCauDoiLichResponse,
  GuiYeuCauDoiLichRequest,
  TongQuanBacSiResponse,
  SuaHoSoBenhNhanRequest,
  TrangThaiYeuCau,
} from "@/types/booking.type";

export const doctorBookingService = {
  /** Get doctor weekly work schedule */
  getLichTuanBacSi: async (params: { tuNgay: string; denNgay: string }) => {
    const response = await axiosClient.get<ApiResponse<CaLamViecResponse[]>>(
      "/api/booking/bac-si/toi/lich-lam-viec",
      { params },
    );
    return response.data;
  },

  /** Get appointments by date/shift */
  getLichHenBacSiTheoNgay: async (params: {
    ngay: string;
    idLichLamViec?: number;
    soThuTu?: number;
    tuKhoa?: string;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/bac-si/toi/lich-hen", { params });
    return response.data;
  },

  /** Get appointments in range for calendar view */
  getLichHenLichBacSi: async (params: { tuNgay: string; denNgay: string }) => {
    const response = await axiosClient.get<
      ApiResponse<LichHenCuaToiResponse[]>
    >("/api/booking/bac-si/toi/lich-hen/lich", { params });
    return response.data;
  },

  /** Get medical exam record for appointment */
  getHoSoKhamBacSi: async (idLichHen: number) => {
    const response = await axiosClient.get<ApiResponse<unknown>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/ho-so-kham`,
    );
    return response.data;
  },

  /** Search medical exam record by code */
  traCuuHoSoKhamBacSi: async (ma: string) => {
    const response = await axiosClient.get<ApiResponse<unknown>>(
      "/api/booking/bac-si/toi/lich-hen/tra-cuu/ho-so-kham",
      { params: { ma } },
    );
    return response.data;
  },

  /** Update patient info during examination */
  capNhatBenhNhanKhamBacSi: async (
    idLichHen: number,
    data: SuaHoSoBenhNhanRequest,
  ) => {
    const response = await axiosClient.put<ApiResponse<unknown>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/benh-nhan`,
      data,
    );
    return response.data;
  },

  /** Mark patient check-in as verified */
  danhDauDaDoiChieuBacSi: async (idLichHen: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/da-doi-chieu`,
    );
    return response.data;
  },

  /** Create or update examination result and prescription */
  ghiBenhAnBacSi: async (
    idLichHen: number,
    data: GhiKetQuaKhamRequest,
    update = false,
  ) => {
    const response = update
      ? await axiosClient.put<ApiResponse<KetQuaKhamResponse>>(
          `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
          data,
        )
      : await axiosClient.post<ApiResponse<KetQuaKhamResponse>>(
          `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
          data,
        );
    return response.data;
  },

  /** Get examination record */
  getBenhAnBacSi: async (idLichHen: number) => {
    const response = await axiosClient.get<ApiResponse<KetQuaKhamResponse>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
    );
    return response.data;
  },

  /** Medication auto-complete suggestions */
  getThuocGoiY: async (tuKhoa: string) => {
    const response = await axiosClient.get<
      ApiResponse<
        Array<{
          id: number;
          tenThuoc: string;
          donVi: string | null;
          daXacMinh: boolean;
        }>
      >
    >("/api/medical/bac-si/toi/thuoc", { params: { tuKhoa } });
    return response.data;
  },

  /** Get pending appointment requests */
  getDanhSachYeuCauBacSi: async (params?: {
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/bac-si/toi/lich-hen/yeu-cau", { params });
    return response.data;
  },

  /** Cancel pending shift change request */
  rutYeuCauDoiLichBacSi: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/bac-si/toi/yeu-cau-doi-lich/${id}/rut`,
    );
    return response.data;
  },

  /** Accept appointment request */
  xacNhanLichHenBacSi: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<LichHenCuaToiResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${id}/xac-nhan`,
    );
    return response.data;
  },

  /** Reject appointment request */
  tuChoiLichHenBacSi: async (id: number, data: { lyDo: string }) => {
    const response = await axiosClient.post<ApiResponse<LichHenCuaToiResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${id}/tu-choi`,
      data,
    );
    return response.data;
  },

  /** Search appointment */
  traCuuLichHenBacSi: async (ma: string) => {
    const response = await axiosClient.get<ApiResponse<unknown>>(
      "/api/booking/bac-si/toi/lich-hen/tra-cuu",
      { params: { ma } },
    );
    return response.data;
  },

  /** Get shift details and assigned patients */
  getChiTietCaLamViec: async (id: number) => {
    const response = await axiosClient.get<
      ApiResponse<ChiTietCaLamViecResponse>
    >(`/api/booking/bac-si/lich/ca/${id}`);
    return response.data;
  },

  /** Submit consultation result */
  ghiKetQuaKham: async (idLichHen: number, data: GhiKetQuaKhamRequest) => {
    const response = await axiosClient.post<ApiResponse<KetQuaKhamResponse>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
      data,
    );
    return response.data;
  },

  /** Get reviews received from patients */
  getDanhSachDanhGiaBacSi: async (params?: {
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<DanhGiaCuaBacSiResponse>>
    >("/api/booking/bac-si/toi/danh-gia", { params });
    return response.data;
  },

  /** Get doctor shift change requests */
  getYeuCauDoiLichBacSi: async (params?: {
    trangThai?: TrangThaiYeuCau;
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<YeuCauDoiLichResponse>>
    >("/api/booking/bac-si/toi/yeu-cau-doi-lich", { params });
    return response.data;
  },

  /** Submit shift/room change request */
  guiYeuCauDoiLich: async (data: GuiYeuCauDoiLichRequest) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiLichResponse>>(
      "/api/booking/bac-si/toi/yeu-cau-doi-lich",
      data,
    );
    return response.data;
  },

  /** Get doctor dashboard statistics */
  getTongQuanBacSi: async () => {
    const response = await axiosClient.get<ApiResponse<TongQuanBacSiResponse>>(
      "/api/booking/bac-si/toi/tong-quan",
    );
    return response.data;
  },
};

export default doctorBookingService;
