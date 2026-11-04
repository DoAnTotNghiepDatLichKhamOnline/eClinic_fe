import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  HoSoCuaToiResponse,
  HoSoCuaToiRequest,
  ThongTinDatLichResponse,
  NguoiThanDaLuuRequest,
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
  NgayNghiCongKhaiResponse,
  QuyTacDatLichResponse,
  CapLaiLienKetRequest,
  SoKhamTomTatResponse,
  XacMinhSoKhamRequest,
  SoKhamChiTietResponse,
  GetKhungGioNhieuNgayParams,
  GetNgayNghiParams,
  GetLichSuKhamParams,
  GetLichHenCalendarParams,
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
  capNhatNguoiThan: async (id: number, data: NguoiThanDaLuuRequest | unknown) => {
    const response = await axiosClient.put<ApiResponse<unknown>>(
      `/api/booking/thong-tin-dat-lich/cua-toi/nguoi-than/${id}`,
      data,
    );
    return response.data;
  },

  /** GET /api/booking/khung-gio/nhieu-ngay - Get doctor shifts up to 7 consecutive days */
  getKhungGioNhieuNgay: async (params: GetKhungGioNhieuNgayParams) => {
    const response = await axiosClient.get<ApiResponse<CaKhamResponse[]>>(
      "/api/booking/khung-gio/nhieu-ngay",
      { params },
    );
    return response.data;
  },

  /** Backward-compatible helper for booking form */
  getCaKhamTheoNgay: async (params: {
    ngay: string;
    idBacSi?: number;
    idChuyenKhoa?: number;
  }) => {
    const response = await axiosClient.get<ApiResponse<CaKhamResponse[]>>(
      "/api/booking/khung-gio",
      {
        params: {
          ngay: params.ngay,
          idBacSi: params.idBacSi,
          idChuyenKhoa: params.idChuyenKhoa,
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

  /** GET /api/booking/ngay-nghi - Get clinic holidays list */
  getNgayNghi: async (params?: GetNgayNghiParams) => {
    const response = await axiosClient.get<ApiResponse<NgayNghiCongKhaiResponse[]>>(
      "/api/booking/ngay-nghi",
      { params },
    );
    return response.data;
  },

  /** GET /api/booking/quy-tac-dat-lich - Get booking limits and policies */
  getQuyTacDatLich: async () => {
    const response = await axiosClient.get<ApiResponse<QuyTacDatLichResponse>>(
      "/api/booking/quy-tac-dat-lich",
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
  getQrPhieuKham: async (
    maPhieuKham: string,
    taiVe = false,
    kichThuoc?: number,
  ) => {
    const response = await axiosClient.get<Blob>(
      `/api/booking/phieu-kham/${maPhieuKham}/qr`,
      {
        params: {
          ...(kichThuoc !== undefined ? { kichThuoc } : {}),
          ...(taiVe ? { taiVe: true } : {}),
        },
        responseType: "blob",
      },
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
  getLichSuKham: async (params?: GetLichSuKhamParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LanKhamCuaToiResponse>>
    >("/api/booking/lich-su-kham/cua-toi", { params });
    return response.data;
  },

  /** Get unpaginated calendar appointments within max 42 days */
  getLichHenCalendar: async (params: GetLichHenCalendarParams) => {
    const response = await axiosClient.get<
      ApiResponse<LichHenCuaToiResponse[]>
    >("/api/booking/lich-hen/cua-toi/lich", { params });
    return response.data;
  },

  /** Get patient dashboard summary */
  getTrangCaNhan: async () => {
    const response = await axiosClient.get<ApiResponse<TrangCaNhanResponse>>(
      "/api/booking/trang-ca-nhan/cua-toi",
    );
    return response.data;
  },

  /** GET /api/booking/phieu-kham/{maPhieuKham}/lich.ics - Download iCalendar file */
  taiFileLichIcs: async (maPhieuKham: string) => {
    const response = await axiosClient.get<Blob>(
      `/api/booking/phieu-kham/${maPhieuKham}/lich.ics`,
      { responseType: "blob" },
    );
    return response.data;
  },

  /** POST /api/booking/cap-lai-lien-ket - Resend appointment link via email */
  capLaiLienKet: async (data: CapLaiLienKetRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      "/api/booking/cap-lai-lien-ket",
      data,
    );
    return response.data;
  },

  /** GET /api/booking/so-kham/{maSoKham} - Get public masked medical record summary */
  getSoKhamTomTat: async (maSoKham: string) => {
    const response = await axiosClient.get<ApiResponse<SoKhamTomTatResponse>>(
      `/api/booking/so-kham/${maSoKham}`,
    );
    return response.data;
  },

  /** POST /api/booking/so-kham/{maSoKham}/xem - Verify last 4 phone digits to reveal full medical record */
  xemSoKhamChiTiet: async (maSoKham: string, data: XacMinhSoKhamRequest) => {
    const response = await axiosClient.post<ApiResponse<SoKhamChiTietResponse>>(
      `/api/booking/so-kham/${maSoKham}/xem`,
      data,
    );
    return response.data;
  },

  /** GET /api/booking/so-kham/{maSoKham}/qr - Get QR image for medical record */
  getQrSoKham: async (
    maSoKham: string,
    taiVe = false,
    kichThuoc?: number,
  ) => {
    const response = await axiosClient.get<Blob>(
      `/api/booking/so-kham/${maSoKham}/qr`,
      {
        params: {
          ...(kichThuoc !== undefined ? { kichThuoc } : {}),
          ...(taiVe ? { taiVe: true } : {}),
        },
        responseType: "blob",
      },
    );
    return response.data;
  },
};

export default patientBookingService;
