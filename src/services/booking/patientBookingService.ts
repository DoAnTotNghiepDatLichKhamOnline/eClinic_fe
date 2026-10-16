import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  HoSoCuaToiResponse,
  HoSoCuaToiRequest,
  ThongTinDatLichResponse,
  GetNgayConChoParams,
  NgayConChoResponse,
  NgaySomNhatResponse,
  CaKhamResponse,
  KhungGioGopResponse,
  DatLichRequest,
  DatLichResponse,
  PhieuKhamResponse,
  GetLichHenParams,
  LichHenCuaToiResponse,
  LichHenChiTietCuaToiResponse,
  HuyLichRequest,
  DoiLichRequest,
  DanhGiaRequest,
  DanhGiaCuaToiResponse,
  LanKhamCuaToiResponse,
  TrangCaNhanResponse,
} from "@/types/booking.type";

export const patientBookingService = {
  /** Get patient profile linked to current account */
  getHoSoCuaToi: async () => {
    const response = await axiosClient.get<ApiResponse<HoSoCuaToiResponse>>(
      "/api/booking/ho-so-benh-nhan/cua-toi",
    );
    return response.data;
  },

  /** Update patient profile */
  capNhatHoSoCuaToi: async (data: HoSoCuaToiRequest) => {
    const response = await axiosClient.put<ApiResponse<HoSoCuaToiResponse>>(
      "/api/booking/ho-so-benh-nhan/cua-toi",
      data,
    );
    return response.data;
  },

  /** Get booking suggestions (profile, saved relatives, recent booking) */
  getThongTinDatLich: async () => {
    const response = await axiosClient.get<
      ApiResponse<ThongTinDatLichResponse>
    >("/api/booking/thong-tin-dat-lich/cua-toi");
    return response.data;
  },

  /** Remove a saved relative */
  xoaNguoiThan: async (id: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/booking/thong-tin-dat-lich/cua-toi/nguoi-than/${id}`,
    );
    return response.data;
  },

  /** Update a saved relative */
  capNhatNguoiThan: async (id: number, data: unknown) => {
    const response = await axiosClient.put<ApiResponse<unknown>>(
      `/api/booking/thong-tin-dat-lich/cua-toi/nguoi-than/${id}`,
      data,
    );
    return response.data;
  },

  /** Get shifts and time slots by date, doctor or specialty */
  getCaKhamTheoNgay: async (params: {
    ngay: string;
    idBacSi?: number;
    idChuyenKhoa?: number;
  }) => {
    const response = await axiosClient.get<ApiResponse<CaKhamResponse[]>>(
      "/api/booking/khung-gio/nhieu-ngay",
      {
        params: {
          tuNgay: params.ngay,
          denNgay: params.ngay,
          idBacSi: params.idBacSi,
        },
      },
    );
    return response.data;
  },

  /** Get available dates in range by doctor or specialty */
  getNgayConCho: async (params: GetNgayConChoParams) => {
    const response = await axiosClient.get<ApiResponse<NgayConChoResponse[]>>(
      "/api/booking/khung-gio/ngay-con-cho",
      { params },
    );
    return response.data;
  },

  /** Get earliest available appointment dates by specialty */
  getNgaySomNhat: async (idChuyenKhoa: number) => {
    const response = await axiosClient.get<ApiResponse<NgaySomNhatResponse[]>>(
      "/api/booking/khung-gio/ngay-som-nhat",
      { params: { idChuyenKhoa } },
    );
    return response.data;
  },

  /** Get merged time slots by specialty for automatic doctor assignment */
  getKhungGioGop: async (params: { idChuyenKhoa: number; ngay: string }) => {
    const response = await axiosClient.get<ApiResponse<KhungGioGopResponse[]>>(
      "/api/booking/khung-gio/gop",
      { params },
    );
    return response.data;
  },

  /** Book an appointment (authenticated or guest) */
  datLich: async (data: DatLichRequest) => {
    const response = await axiosClient.post<ApiResponse<DatLichResponse>>(
      "/api/booking/lich-hen",
      data,
    );
    return response.data;
  },

  /** Public appointment lookup by ticket code */
  traCuuPhieuKham: async (maPhieuKham: string) => {
    const response = await axiosClient.get<ApiResponse<PhieuKhamResponse>>(
      `/api/booking/phieu-kham/${maPhieuKham}`,
    );
    return response.data;
  },

  /** Get QR code blob for appointment ticket */
  getQrPhieuKham: async (maPhieuKham: string, taiVe = false) => {
    const response = await axiosClient.get<Blob>(
      `/api/booking/phieu-kham/${maPhieuKham}/qr`,
      { params: taiVe ? { taiVe: true } : undefined, responseType: "blob" },
    );
    return response.data;
  },

  /** Cancel appointment by ticket code (guest) */
  huyPhieuKhamKhach: async (maPhieuKham: string, data: HuyLichRequest) => {
    const response = await axiosClient.post<ApiResponse<PhieuKhamResponse>>(
      `/api/booking/phieu-kham/${maPhieuKham}/huy`,
      data,
    );
    return response.data;
  },

  /** Reschedule appointment by ticket code (guest) */
  doiPhieuKhamKhach: async (maPhieuKham: string, data: DoiLichRequest) => {
    const response = await axiosClient.post<ApiResponse<DatLichResponse>>(
      `/api/booking/phieu-kham/${maPhieuKham}/doi-lich`,
      data,
    );
    return response.data;
  },

  /** Get paginated appointment list of current user */
  getDanhSachLichHen: async (params?: GetLichHenParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/lich-hen/cua-toi", { params });
    return response.data;
  },

  /** Get appointment details including medical records and reviews */
  getChiTietLichHen: async (maPhieuKham: string) => {
    const response = await axiosClient.get<
      ApiResponse<LichHenChiTietCuaToiResponse>
    >(`/api/booking/lich-hen/cua-toi/${maPhieuKham}`);
    return response.data;
  },

  /** Cancel an appointment */
  huyLichHen: async (maPhieuKham: string, data?: HuyLichRequest) => {
    const response = await axiosClient.post<ApiResponse<PhieuKhamResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/huy`,
      data,
    );
    return response.data;
  },

  /** Reschedule an appointment */
  doiLichHen: async (maPhieuKham: string, data: DoiLichRequest) => {
    const response = await axiosClient.post<ApiResponse<DatLichResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/doi-lich`,
      data,
    );
    return response.data;
  },

  /** Submit doctor review after completed appointment */
  taoDanhGia: async (maPhieuKham: string, data: DanhGiaRequest) => {
    const response = await axiosClient.post<ApiResponse<DanhGiaCuaToiResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/danh-gia`,
      data,
    );
    return response.data;
  },

  /** Update doctor review */
  suaDanhGia: async (maPhieuKham: string, data: DanhGiaRequest) => {
    const response = await axiosClient.put<ApiResponse<DanhGiaCuaToiResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/danh-gia`,
      data,
    );
    return response.data;
  },

  /** Get medical examination history */
  getLichSuKham: async (params?: {
    tuKhoa?: string;
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LanKhamCuaToiResponse>>
    >("/api/booking/lich-su-kham/cua-toi", { params });
    return response.data;
  },

  /** Get patient dashboard summary */
  getTrangCaNhan: async () => {
    const response = await axiosClient.get<ApiResponse<TrangCaNhanResponse>>(
      "/api/booking/trang-ca-nhan/cua-toi",
    );
    return response.data;
  },
};

export default patientBookingService;
