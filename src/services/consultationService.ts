import axiosClient from "@/utils/axiosClient";
import type { ApiResponse } from "@/types/common.type";
import type {
  HoSoKhamResponse,
  GhiKetQuaKhamRequest,
  KetQuaKhamChiTiet,
  SuaHoSoBenhNhanEMRRequest,
  LichHenTrongNgayItem,
  LichHenTrongNgayParams,
  ThuocGoiYItem,
  Icd10Item,
  LichSuSuaBenhAnResponse,
} from "@/types/consultation.type";

export const consultationService = {
  /**
   * Lấy danh sách bệnh nhân trong ngày theo bộ lọc (ngày, ca, STT, từ khóa họ tên)
   */
  getDanhSachLichHenTrongNgay: async (params?: LichHenTrongNgayParams) => {
    const response = await axiosClient.get<ApiResponse<LichHenTrongNgayItem[]>>(
      "/api/booking/bac-si/toi/lich-hen",
      { params },
    );
    return response.data;
  },

  /**
   * Tra cứu mở hồ sơ khám theo mã tra cứu (ECL-...), mã phiếu khám hoặc link QR
   */
  traCuuHoSoKham: async (ma: string) => {
    const response = await axiosClient.get<ApiResponse<HoSoKhamResponse>>(
      "/api/booking/bac-si/toi/lich-hen/tra-cuu/ho-so-kham",
      { params: { ma: ma.trim() } },
    );
    return response.data;
  },

  /**
   * Mở hồ sơ khám theo ID lịch hẹn
   */
  getHoSoKhamById: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<HoSoKhamResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${id}/ho-so-kham`,
    );
    return response.data;
  },

  /**
   * Sửa hồ sơ bệnh nhân sau khi đối chiếu giấy tờ tùy thân
   */
  capNhatBenhNhan: async (idLichHen: number, data: SuaHoSoBenhNhanEMRRequest) => {
    const response = await axiosClient.put<ApiResponse<HoSoKhamResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/benh-nhan`,
      data,
    );
    return response.data;
  },

  /**
   * Đánh dấu đã đối chiếu giấy tờ
   */
  danhDauDaDoiChieu: async (idLichHen: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/da-doi-chieu`,
    );
    return response.data;
  },

  /**
   * Ghi kết quả khám lần đầu (lịch hẹn chuyển sang DA_HOAN_THANH)
   */
  ghiKetQuaKham: async (idLichHen: number, data: GhiKetQuaKhamRequest) => {
    const response = await axiosClient.post<ApiResponse<KetQuaKhamChiTiet>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
      data,
    );
    return response.data;
  },

  /**
   * Chỉnh sửa kết quả khám đã lưu (kèm lý do sửa và số phiên bản đang xem)
   */
  suaKetQuaKham: async (idLichHen: number, data: GhiKetQuaKhamRequest) => {
    const response = await axiosClient.put<ApiResponse<KetQuaKhamChiTiet>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
      data,
    );
    return response.data;
  },

  /**
   * Lấy lịch sử các phiên bản sửa đổi bệnh án điện tử
   */
  getLichSuSua: async (idLichHen: number) => {
    const response = await axiosClient.get<ApiResponse<LichSuSuaBenhAnResponse>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an/lich-su`,
    );
    return response.data;
  },

  /**
   * Gợi ý danh mục thuốc đang dùng theo tên hoặc hoạt chất
   */
  getThuocGoiY: async (tuKhoa: string) => {
    const response = await axiosClient.get<ApiResponse<ThuocGoiYItem[]>>(
      "/api/medical/bac-si/toi/thuoc",
      { params: { tuKhoa: tuKhoa.trim() } },
    );
    return response.data;
  },

  /**
   * Gợi ý mã ICD-10 theo đầu mã hoặc tên bệnh (hỗ trợ cờ manTinh)
   */
  getIcd10GoiY: async (tuKhoa: string) => {
    const response = await axiosClient.get<ApiResponse<Icd10Item[]>>(
      "/api/medical/bac-si/toi/icd10",
      { params: { tuKhoa: tuKhoa.trim() } },
    );
    return response.data;
  },
};
