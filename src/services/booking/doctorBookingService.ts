import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  LichHenCuaToiResponse,
  CaLamViecResponse,
  ChiTietCaLamViecResponse,
  GhiKetQuaKhamRequest,
  KetQuaKhamResponse,
  DanhGiaCuaBacSiResponse,
  DanhGiaTongQuanResponse,
  YeuCauDoiLichResponse,
  GuiYeuCauDoiLichRequest,
  TongQuanBacSiResponse,
  SuaHoSoBenhNhanRequest,
  TrangThaiYeuCau,
  HangDoiResponse,
  Icd10GoiY,
  LichSuSuaBenhAnResponse,
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

  /** Medication auto-complete suggestions (updated with active ingredient, strength, route) */
  getThuocGoiY: async (tuKhoa: string) => {
    const response = await axiosClient.get<
      ApiResponse<
        Array<{
          id: number;
          tenThuoc: string;
          hoatChat?: string | null;
          hamLuong?: string | null;
          dangBaoChe?: string | null;
          duongDung?: string | null;
          donVi: string | null;
        }>
      >
    >("/api/medical/bac-si/toi/thuoc", { params: { tuKhoa } });
    return response.data;
  },

  /** ICD-10 code auto-complete suggestions */
  getIcd10GoiY: async (tuKhoa: string) => {
    const response = await axiosClient.get<ApiResponse<Icd10GoiY[]>>(
      "/api/medical/bac-si/toi/icd10",
      { params: { tuKhoa } },
    );
    return response.data;
  },

  /** Update examination record with reason and version */
  suaBenhAnBacSi: async (idLichHen: number, data: GhiKetQuaKhamRequest) => {
    const response = await axiosClient.put<ApiResponse<KetQuaKhamResponse>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
      data,
    );
    return response.data;
  },

  /** Get medical record edit history */
  getLichSuSuaBenhAn: async (idLichHen: number) => {
    const response = await axiosClient.get<ApiResponse<LichSuSuaBenhAnResponse>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an/lich-su`,
    );
    return response.data;
  },

  /** Get upcoming appointments (replaces deprecated appointment requests route) */
  getLichHenSapToiBacSi: async (params?: {
    tuNgay?: string;
    denNgay?: string;
  }) => {
    const today = new Date();
    const tuNgay =
      params?.tuNgay ||
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 41);
    const denNgay =
      params?.denNgay ||
      `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const response = await axiosClient.get<
      ApiResponse<LichHenCuaToiResponse[]>
    >("/api/booking/bac-si/toi/lich-hen/lich", { params: { tuNgay, denNgay } });
    return response.data;
  },

  /** Get pending appointment requests (legacy compatibility) */
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

  /** Cancel upcoming appointment with mandatory reason (new API) */
  huyLichHenBacSi: async (id: number, data: { lyDo: string }) => {
    const response = await axiosClient.post<ApiResponse<LichHenCuaToiResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${id}/huy`,
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

  /** Get doctor queue for given date (defaults to today) */
  getHangDoi: async (ngay?: string) => {
    const response = await axiosClient.get<ApiResponse<HangDoiResponse>>(
      "/api/booking/bac-si/toi/hang-doi",
      { params: ngay ? { ngay } : undefined },
    );
    return response.data;
  },

  /** Call next waiting patient in shift */
  goiTiepHangDoi: async (idLichLamViec: number) => {
    const response = await axiosClient.post<ApiResponse<HangDoiResponse>>(
      "/api/booking/bac-si/toi/hang-doi/goi-tiep",
      null,
      { params: { idLichLamViec } },
    );
    return response.data;
  },

  /** Call specific appointment into exam room */
  goiKham: async (idLichHen: number) => {
    const response = await axiosClient.post<ApiResponse<HangDoiResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/goi-kham`,
    );
    return response.data;
  },

  /** Mark appointment patient as absent */
  danhDauVangMat: async (idLichHen: number) => {
    const response = await axiosClient.post<ApiResponse<HangDoiResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/vang-mat`,
    );
    return response.data;
  },

  /** Get doctor ratings summary overview */
  getTongQuanDanhGiaBacSi: async () => {
    const response = await axiosClient.get<ApiResponse<DanhGiaTongQuanResponse>>(
      "/api/booking/bac-si/toi/danh-gia/tong-quan",
    );
    return response.data;
  },
};

export default doctorBookingService;
