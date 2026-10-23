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
  LichSuSuaBenhAnResponse,
  CauHinhDatLichResponse,
  CapNhatCauHinhDatLichRequest,
  LichSuCauHinhDatLichResponse,
  NgayNghiResponse,
  KhaiBaoNgayNghiRequest,
  XemTruocNgayNghiResponse,
  LichSuCaLamViecResponse,
  ThongKeGioLamBacSiResponse,
  SaoChepLichRequest,
  XemTruocSaoChepLichResponse,
  XemTruocNhapExcelResponse,
  GuiLichLamViecRequest,
  DatLichThayRequest,
  DoiLichThayRequest,
  HuyLichThayRequest,
  LichHenChiTietCuaToiResponse,
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

  /** Get appointments booked in a specific shift */
  getLichHenTheoCa: async (idCa: number) => {
    const response = await axiosClient.get<
      ApiResponse<LichHenCuaToiResponse[]>
    >(`/api/booking/quan-tri/lich-lam-viec/${idCa}/lich-hen`);
    return response.data;
  },

  /** Get patient reviews for moderation */
  getDanhGiaQuanTri: async (params?: GetDanhGiaQuanTriParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<DanhGiaQuanTriResponse>>
    >("/api/booking/quan-tri/danh-gia", { params });
    return response.data;
  },

  /** Get admin dashboard analytics */
  getTongQuanQuanTri: async () => {
    const response = await axiosClient.get<
      ApiResponse<TongQuanQuanTriResponse>
    >("/api/booking/quan-tri/tong-quan");
    return response.data;
  },

  /** Get medical record edit history for admin */
  getLichSuSuaBenhAnQuanTri: async (idLichHen: number) => {
    const response = await axiosClient.get<ApiResponse<LichSuSuaBenhAnResponse>>(
      `/api/medical/quan-tri/lich-hen/${idLichHen}/benh-an/lich-su`,
    );
    return response.data;
  },

  /** Lookup appointment by code for admin */
  traCuuLichHenQuanTri: async (ma: string) => {
    const response = await axiosClient.get<ApiResponse<LichHenCuaToiResponse>>(
      "/api/booking/quan-tri/lich-hen/tra-cuu",
      { params: { ma } },
    );
    return response.data;
  },

  /** Mark documents verified by admin */
  danhDauDaDoiChieuQuanTri: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/quan-tri/lich-hen/${id}/da-doi-chieu`,
    );
    return response.data;
  },

  // ==========================================
  // BỔ SUNG ĐẦY ĐỦ CÁC API QUẢN TRỊ VIÊN
  // ==========================================

  /** Lấy các quy tắc đặt lịch và xếp ca đang áp dụng */
  getCauHinhDatLich: async () => {
    const response = await axiosClient.get<ApiResponse<CauHinhDatLichResponse>>(
      "/api/booking/quan-tri/cau-hinh",
    );
    return response.data;
  },

  /** Cập nhật quy tắc đặt lịch / xếp ca toàn hệ thống */
  capNhatCauHinhDatLich: async (data: CapNhatCauHinhDatLichRequest) => {
    const response = await axiosClient.put<ApiResponse<CauHinhDatLichResponse>>(
      "/api/booking/quan-tri/cau-hinh",
      data,
    );
    return response.data;
  },

  /** Xem lịch sử thay đổi cấu hình quy tắc */
  getLichSuCauHinhDatLich: async () => {
    const response = await axiosClient.get<ApiResponse<LichSuCauHinhDatLichResponse[]>>(
      "/api/booking/quan-tri/cau-hinh/lich-su",
    );
    return response.data;
  },

  /** Xem danh sách ngày bệnh viện nghỉ */
  getDanhSachNgayNghi: async () => {
    const response = await axiosClient.get<ApiResponse<NgayNghiResponse[]>>(
      "/api/booking/quan-tri/ngay-nghi",
    );
    return response.data;
  },

  /** Xem trước tác động khi khai báo ngày nghỉ */
  xemTruocNgayNghi: async (data: KhaiBaoNgayNghiRequest) => {
    const response = await axiosClient.post<ApiResponse<XemTruocNgayNghiResponse>>(
      "/api/booking/quan-tri/ngay-nghi/xem-truoc",
      data,
    );
    return response.data;
  },

  /** Khai báo ngày nghỉ (tự động hủy các ca làm việc và chuyển lịch hẹn) */
  khaiBaoNgayNghi: async (data: KhaiBaoNgayNghiRequest) => {
    const response = await axiosClient.post<ApiResponse<NgayNghiResponse>>(
      "/api/booking/quan-tri/ngay-nghi",
      data,
    );
    return response.data;
  },

  /** Xóa một ngày nghỉ đã khai báo */
  xoaNgayNghi: async (ngay: string) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/booking/quan-tri/ngay-nghi/${ngay}`,
    );
    return response.data;
  },

  /** Xem nhật ký thao tác xếp / sửa / hủy ca */
  getLichSuCaLamViec: async (idCa: number) => {
    const response = await axiosClient.get<ApiResponse<LichSuCaLamViecResponse[]>>(
      `/api/booking/quan-tri/lich-lam-viec/${idCa}/lich-su`,
    );
    return response.data;
  },

  /** Thống kê giờ làm việc mỗi tuần của từng bác sĩ */
  getThongKeGioLamTheoTuan: async (params?: { tuNgay?: string; denNgay?: string; idChuyenKhoa?: number }) => {
    const response = await axiosClient.get<ApiResponse<ThongKeGioLamBacSiResponse[]>>(
      "/api/booking/quan-tri/lich-lam-viec/gio-lam-theo-tuan",
      { params },
    );
    return response.data;
  },

  /** Xem trước kết quả sao chép lịch làm việc */
  xemTruocSaoChepLich: async (data: SaoChepLichRequest) => {
    const response = await axiosClient.post<ApiResponse<XemTruocSaoChepLichResponse>>(
      "/api/booking/quan-tri/lich-lam-viec/sao-chep/xem-truoc",
      data,
    );
    return response.data;
  },

  /** Thực hiện sao chép lịch làm việc */
  saoChepLichLamViec: async (data: SaoChepLichRequest) => {
    const response = await axiosClient.post<ApiResponse<{ soCaTao: number }>>(
      "/api/booking/quan-tri/lich-lam-viec/sao-chep",
      data,
    );
    return response.data;
  },

  /** Tải tệp Excel danh sách ca làm việc */
  xuatExcelLichLamViec: async (params: { tuNgay: string; denNgay: string; idChuyenKhoa?: number; idBacSi?: number }) => {
    const response = await axiosClient.get(
      "/api/booking/quan-tri/lich-lam-viec/xuat-excel",
      { params, responseType: "blob" },
    );
    return response.data as Blob;
  },

  /** Tải tệp Excel mẫu để nhập ca làm việc */
  taiMauNhapExcel: async () => {
    const response = await axiosClient.get(
      "/api/booking/quan-tri/lich-lam-viec/nhap-excel/mau",
      { responseType: "blob" },
    );
    return response.data as Blob;
  },

  /** Kiểm tra và xem trước dữ liệu tệp Excel nhập vào */
  xemTruocNhapExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post<ApiResponse<XemTruocNhapExcelResponse>>(
      "/api/booking/quan-tri/lich-lam-viec/nhap-excel/xem-truoc",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  /** Nhập danh sách ca làm việc từ tệp Excel */
  nhapExcelLichLamViec: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post<ApiResponse<{ soCaTao: number }>>(
      "/api/booking/quan-tri/lich-lam-viec/nhap-excel",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  /** Tải tệp PDF lịch làm việc của một bác sĩ */
  taiPdfLichBacSi: async (idBacSi: number, params?: { tuNgay?: string; denNgay?: string }) => {
    const response = await axiosClient.get(
      `/api/booking/quan-tri/lich-lam-viec/pdf/bac-si/${idBacSi}`,
      { params, responseType: "blob" },
    );
    return response.data as Blob;
  },

  /** Tải tệp PDF lưới làm việc tuần toàn viện */
  taiPdfLichToanVien: async (params?: { tuNgay?: string; denNgay?: string }) => {
    const response = await axiosClient.get(
      "/api/booking/quan-tri/lich-lam-viec/pdf/toan-vien",
      { params, responseType: "blob" },
    );
    return response.data as Blob;
  },

  /** Gửi lịch làm việc qua email và thông báo cho bác sĩ */
  guiLichLamViecEmail: async (data: GuiLichLamViecRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      "/api/booking/quan-tri/lich-lam-viec/gui-lich",
      data,
    );
    return response.data;
  },

  /** Duyệt toàn bộ nhóm yêu cầu xin nghỉ nhiều ca */
  duyetNhomYeuCauDoiLich: async (maNhom: string, ghiChu?: string) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiLichResponse[]>>(
      `/api/booking/quan-tri/yeu-cau-doi-lich/nhom/${maNhom}/duyet`,
      { ghiChu },
    );
    return response.data;
  },

  /** Từ chối toàn bộ nhóm yêu cầu xin nghỉ */
  tuChoiNhomYeuCauDoiLich: async (maNhom: string, ghiChu: string) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiLichResponse[]>>(
      `/api/booking/quan-tri/yeu-cau-doi-lich/nhom/${maNhom}/tu-choi`,
      { ghiChu },
    );
    return response.data;
  },

  /** Xem chi tiết chuỗi đổi lịch và nhật ký sự kiện của một lịch hẹn */
  getChiTietLichHenQuanTri: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<LichHenChiTietCuaToiResponse>>(
      `/api/booking/quan-tri/lich-hen/${id}`,
    );
    return response.data;
  },

  /** Đặt lịch khám thay người bệnh gọi đến tổng đài hoặc tại quầy */
  datLichThayQuanTri: async (data: DatLichThayRequest) => {
    const response = await axiosClient.post<ApiResponse<LichHenCuaToiResponse>>(
      "/api/booking/quan-tri/lich-hen",
      data,
    );
    return response.data;
  },

  /** Hủy lịch hẹn thay cho người bệnh */
  huyLichHenThayQuanTri: async (id: number, data: HuyLichThayRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/quan-tri/lich-hen/${id}/huy`,
      data,
    );
    return response.data;
  },

  /** Đổi lịch hẹn sang khung giờ khác thay cho người bệnh */
  doiLichHenThayQuanTri: async (id: number, data: DoiLichThayRequest) => {
    const response = await axiosClient.post<ApiResponse<LichHenCuaToiResponse>>(
      `/api/booking/quan-tri/lich-hen/${id}/doi-lich`,
      data,
    );
    return response.data;
  },

  /** Cấp lại link phiếu khám/sổ khám qua email hoặc màn hình */
  capLaiLienKetPhieuKham: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<{ url: string; maPhieuKham: string }>>(
      `/api/booking/quan-tri/lich-hen/${id}/cap-lai-lien-ket`,
    );
    return response.data;
  },
};

export default adminBookingService;

