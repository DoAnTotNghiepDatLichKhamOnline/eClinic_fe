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
  CaLamViecResponse,
  ChiTietCaLamViecResponse,
  GhiKetQuaKhamRequest,
  KetQuaKhamResponse,
  DanhGiaCuaBacSiResponse,
  YeuCauDoiLichResponse,
  GuiYeuCauDoiLichRequest,
  TongQuanBacSiResponse,
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

export const bookingService = {
  // =========================================================================
  // 1. HỒ SƠ BỆNH NHÂN CỦA TÔI (/api/booking/ho-so-benh-nhan/cua-toi)
  // =========================================================================

  /**
   * Xem hồ sơ bệnh nhân liên kết với tài khoản
   * GET /api/booking/ho-so-benh-nhan/cua-toi
   */
  getHoSoCuaToi: async () => {
    const response = await axiosClient.get<ApiResponse<HoSoCuaToiResponse>>(
      "/api/booking/ho-so-benh-nhan/cua-toi",
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin hồ sơ bệnh nhân
   * PUT /api/booking/ho-so-benh-nhan/cua-toi
   */
  capNhatHoSoCuaToi: async (data: HoSoCuaToiRequest) => {
    const response = await axiosClient.put<ApiResponse<HoSoCuaToiResponse>>(
      "/api/booking/ho-so-benh-nhan/cua-toi",
      data,
    );
    return response.data;
  },

  // =========================================================================
  // 2. THÔNG TIN ĐẶT LỊCH (/api/booking/thong-tin-dat-lich)
  // =========================================================================

  /**
   * Lấy thông tin gợi ý khi đặt lịch (bản thân, người thân đã lưu, lần đặt gần nhất)
   * GET /api/booking/thong-tin-dat-lich/cua-toi
   */
  getThongTinDatLich: async () => {
    const response = await axiosClient.get<
      ApiResponse<ThongTinDatLichResponse>
    >("/api/booking/thong-tin-dat-lich/cua-toi");
    return response.data;
  },

  /**
   * Xoá một người thân khỏi danh sách đã lưu
   * DELETE /api/booking/thong-tin-dat-lich/cua-toi/nguoi-than/{id}
   */
  xoaNguoiThan: async (id: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/booking/thong-tin-dat-lich/cua-toi/nguoi-than/${id}`,
    );
    return response.data;
  },

  capNhatNguoiThan: async (id: number, data: unknown) => {
    const response = await axiosClient.put<ApiResponse<unknown>>(
      `/api/booking/thong-tin-dat-lich/cua-toi/nguoi-than/${id}`,
      data,
    );
    return response.data;
  },

  // =========================================================================
  // 3. KHUNG GIỜ VÀ CA KHÁM (/api/booking/khung-gio)
  // =========================================================================

  /**
   * Các ca và khung giờ trong ngày theo bác sĩ hoặc chuyên khoa
   * GET /api/booking/khung-gio/nhieu-ngay
   */
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

  /**
   * Các ngày còn chỗ trong khoảng thời gian theo chuyên khoa hoặc bác sĩ
   * GET /api/booking/khung-gio/ngay-con-cho
   */
  getNgayConCho: async (params: GetNgayConChoParams) => {
    const response = await axiosClient.get<ApiResponse<NgayConChoResponse[]>>(
      "/api/booking/khung-gio/ngay-con-cho",
      { params },
    );
    return response.data;
  },

  /**
   * Ngày còn chỗ sớm nhất của các bác sĩ theo chuyên khoa
   * GET /api/booking/khung-gio/ngay-som-nhat
   */
  getNgaySomNhat: async (idChuyenKhoa: number) => {
    const response = await axiosClient.get<ApiResponse<NgaySomNhatResponse[]>>(
      "/api/booking/khung-gio/ngay-som-nhat",
      { params: { idChuyenKhoa } },
    );
    return response.data;
  },

  /**
   * Khung giờ gộp theo chuyên khoa trong ngày (cho bác sĩ bất kỳ / tự xếp)
   * GET /api/booking/khung-gio/gop
   */
  getKhungGioGop: async (params: { idChuyenKhoa: number; ngay: string }) => {
    const response = await axiosClient.get<ApiResponse<KhungGioGopResponse[]>>(
      "/api/booking/khung-gio/gop",
      { params },
    );
    return response.data;
  },

  // =========================================================================
  // 4. ĐẶT LỊCH KHÁM BỆNH & TRA CỨU PHIẾU KHÁM
  // =========================================================================

  /**
   * Đặt lịch khám bệnh (đăng nhập hoặc khách vãng lai)
   * POST /api/booking/lich-hen
   */
  datLich: async (data: DatLichRequest) => {
    const response = await axiosClient.post<ApiResponse<DatLichResponse>>(
      "/api/booking/lich-hen",
      data,
    );
    return response.data;
  },

  /**
   * Tra cứu phiếu khám công khai bằng mã phiếu khám
   * GET /api/booking/phieu-kham/{maPhieuKham}
   */
  traCuuPhieuKham: async (maPhieuKham: string) => {
    const response = await axiosClient.get<ApiResponse<PhieuKhamResponse>>(
      `/api/booking/phieu-kham/${maPhieuKham}`,
    );
    return response.data;
  },

  getQrPhieuKham: async (maPhieuKham: string, taiVe = false) => {
    const response = await axiosClient.get<Blob>(
      `/api/booking/phieu-kham/${maPhieuKham}/qr`,
      { params: taiVe ? { taiVe: true } : undefined, responseType: "blob" },
    );
    return response.data;
  },

  /**
   * Hủy phiếu khám công khai (dành cho khách không đăng nhập)
   * POST /api/booking/phieu-kham/{maPhieuKham}/huy
   */
  huyPhieuKhamKhach: async (maPhieuKham: string, data: HuyLichRequest) => {
    const response = await axiosClient.post<ApiResponse<PhieuKhamResponse>>(
      `/api/booking/phieu-kham/${maPhieuKham}/huy`,
      data,
    );
    return response.data;
  },

  /**
   * Đổi lịch khám công khai (dành cho khách không đăng nhập)
   * POST /api/booking/phieu-kham/{maPhieuKham}/doi-lich
   */
  doiPhieuKhamKhach: async (maPhieuKham: string, data: DoiLichRequest) => {
    const response = await axiosClient.post<ApiResponse<DatLichResponse>>(
      `/api/booking/phieu-kham/${maPhieuKham}/doi-lich`,
      data,
    );
    return response.data;
  },

  // =========================================================================
  // 5. LỊCH HẸN CỦA TÔI (/api/booking/lich-hen/cua-toi)
  // =========================================================================

  /**
   * Danh sách lịch hẹn đã lưu trong tài khoản (phân trang, lọc theo thời gian, phạm vi)
   * GET /api/booking/lich-hen/cua-toi
   */
  getDanhSachLichHen: async (params?: GetLichHenParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/lich-hen/cua-toi", { params });
    return response.data;
  },

  /**
   * Xem chi tiết một lịch hẹn kèm kết quả khám và đánh giá
   * GET /api/booking/lich-hen/cua-toi/{maPhieuKham}
   */
  getChiTietLichHen: async (maPhieuKham: string) => {
    const response = await axiosClient.get<
      ApiResponse<LichHenChiTietCuaToiResponse>
    >(`/api/booking/lich-hen/cua-toi/${maPhieuKham}`);
    return response.data;
  },

  /**
   * Hủy lịch hẹn của tôi
   * POST /api/booking/lich-hen/cua-toi/{maPhieuKham}/huy
   */
  huyLichHen: async (maPhieuKham: string, data?: HuyLichRequest) => {
    const response = await axiosClient.post<ApiResponse<PhieuKhamResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/huy`,
      data,
    );
    return response.data;
  },

  /**
   * Đổi sang ca khám hoặc khung giờ khác
   * POST /api/booking/lich-hen/cua-toi/{maPhieuKham}/doi-lich
   */
  doiLichHen: async (maPhieuKham: string, data: DoiLichRequest) => {
    const response = await axiosClient.post<ApiResponse<DatLichResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/doi-lich`,
      data,
    );
    return response.data;
  },

  // =========================================================================
  // 6. ĐÁNH GIÁ CỦA TÔI (/api/booking/danh-gia)
  // =========================================================================

  /**
   * Đánh giá bác sĩ sau khi khám xong
   * POST /api/booking/danh-gia
   */
  taoDanhGia: async (maPhieuKham: string, data: DanhGiaRequest) => {
    const response = await axiosClient.post<ApiResponse<DanhGiaCuaToiResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/danh-gia`,
      data,
    );
    return response.data;
  },

  /**
   * Chỉnh sửa đánh giá (trong vòng 7 ngày)
   * PUT /api/booking/lich-hen/cua-toi/{maPhieuKham}/danh-gia
   */
  suaDanhGia: async (maPhieuKham: string, data: DanhGiaRequest) => {
    const response = await axiosClient.put<ApiResponse<DanhGiaCuaToiResponse>>(
      `/api/booking/lich-hen/cua-toi/${maPhieuKham}/danh-gia`,
      data,
    );
    return response.data;
  },

  // =========================================================================
  // 7. LỊCH SỬ KHÁM & TRANG CÁ NHÂN
  // =========================================================================

  /**
   * Lịch sử các lần khám bệnh đã có kết quả
   * GET /api/booking/lich-su-kham/cua-toi
   */
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

  /**
   * Dữ liệu trang cá nhân bệnh nhân (lịch sắp tới, lần khám gần đây, số lượng)
   * GET /api/booking/trang-ca-nhan/cua-toi
   */
  getTrangCaNhan: async () => {
    const response = await axiosClient.get<ApiResponse<TrangCaNhanResponse>>(
      "/api/booking/trang-ca-nhan/cua-toi",
    );
    return response.data;
  },

  // =========================================================================
  // 8. DÀNH CHO BÁC SĨ (/api/booking/bac-si/...)
  // =========================================================================

  /**
   * Lịch làm việc trong tuần của bác sĩ
   * GET /api/booking/bac-si/toi/lich-lam-viec
   */
  getLichTuanBacSi: async (params: { tuNgay: string; denNgay: string }) => {
    const response = await axiosClient.get<ApiResponse<CaLamViecResponse[]>>(
      "/api/booking/bac-si/toi/lich-lam-viec",
      { params },
    );
    return response.data;
  },

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

  getLichHenLichBacSi: async (params: { tuNgay: string; denNgay: string }) => {
    const response = await axiosClient.get<
      ApiResponse<LichHenCuaToiResponse[]>
    >("/api/booking/bac-si/toi/lich-hen/lich", { params });
    return response.data;
  },

  getHoSoKhamBacSi: async (idLichHen: number) => {
    const response = await axiosClient.get<ApiResponse<unknown>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/ho-so-kham`
    );
    return response.data;
  },

  traCuuHoSoKhamBacSi: async (ma: string) => {
    const response = await axiosClient.get<ApiResponse<unknown>>(
      '/api/booking/bac-si/toi/lich-hen/tra-cuu/ho-so-kham',
      { params: { ma } }
    );
    return response.data;
  },

  capNhatBenhNhanKhamBacSi: async (idLichHen: number, data: SuaHoSoBenhNhanRequest) => {
    const response = await axiosClient.put<ApiResponse<unknown>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/benh-nhan`,
      data
    );
    return response.data;
  },

  danhDauDaDoiChieuBacSi: async (idLichHen: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/bac-si/toi/lich-hen/${idLichHen}/da-doi-chieu`
    );
    return response.data;
  },

  ghiBenhAnBacSi: async (idLichHen: number, data: GhiKetQuaKhamRequest, update = false) => {
    const response = update
      ? await axiosClient.put<ApiResponse<KetQuaKhamResponse>>(
          `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
          data
        )
      : await axiosClient.post<ApiResponse<KetQuaKhamResponse>>(
          `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
          data
        );
    return response.data;
  },

  getBenhAnBacSi: async (idLichHen: number) => {
    const response = await axiosClient.get<ApiResponse<KetQuaKhamResponse>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`
    );
    return response.data;
  },

  getThuocGoiY: async (tuKhoa: string) => {
    const response = await axiosClient.get<ApiResponse<Array<{ id: number; tenThuoc: string; donVi: string | null; daXacMinh: boolean }>>>(
      '/api/medical/bac-si/toi/thuoc',
      { params: { tuKhoa } }
    );
    return response.data;
  },

  getDanhSachYeuCauBacSi: async (params?: {
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/bac-si/toi/lich-hen/yeu-cau", { params });
    return response.data;
  },

  rutYeuCauDoiLichBacSi: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/bac-si/toi/yeu-cau-doi-lich/${id}/rut`
    );
    return response.data;
  },

  xacNhanLichHenBacSi: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<LichHenCuaToiResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${id}/xac-nhan`,
    );
    return response.data;
  },

  tuChoiLichHenBacSi: async (id: number, data: { lyDo: string }) => {
    const response = await axiosClient.post<ApiResponse<LichHenCuaToiResponse>>(
      `/api/booking/bac-si/toi/lich-hen/${id}/tu-choi`,
      data,
    );
    return response.data;
  },

  traCuuLichHenBacSi: async (ma: string) => {
    const response = await axiosClient.get<ApiResponse<unknown>>(
      "/api/booking/bac-si/toi/lich-hen/tra-cuu",
      { params: { ma } },
    );
    return response.data;
  },

  /**
   * Chi tiết ca khám và danh sách bệnh nhân đặt hẹn trong ca
   * GET /api/booking/bac-si/lich/ca/{id}
   */
  getChiTietCaLamViec: async (id: number) => {
    const response = await axiosClient.get<
      ApiResponse<ChiTietCaLamViecResponse>
    >(`/api/booking/bac-si/lich/ca/${id}`);
    return response.data;
  },

  /**
   * Ghi kết quả khám bệnh và kê đơn thuốc cho lịch hẹn
   * POST /api/medical/bac-si/toi/lich-hen/{id}/benh-an
   */
  ghiKetQuaKham: async (idLichHen: number, data: GhiKetQuaKhamRequest) => {
    const response = await axiosClient.post<ApiResponse<KetQuaKhamResponse>>(
      `/api/medical/bac-si/toi/lich-hen/${idLichHen}/benh-an`,
      data,
    );
    return response.data;
  },

  /**
   * Danh sách đánh giá bác sĩ nhận được từ bệnh nhân
   * GET /api/booking/bac-si/toi/danh-gia
   */
  getDanhSachDanhGiaBacSi: async (params?: {
    trang?: number;
    kichThuoc?: number;
  }) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<DanhGiaCuaBacSiResponse>>
    >("/api/booking/bac-si/toi/danh-gia", { params });
    return response.data;
  },

  /**
   * Danh sách yêu cầu đổi ca làm việc của bác sĩ
   * GET /api/booking/bac-si/toi/yeu-cau-doi-lich
   */
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

  /**
   * Bác sĩ gửi yêu cầu đổi phòng / đổi ca
   * POST /api/booking/bac-si/toi/yeu-cau-doi-lich
   */
  guiYeuCauDoiLich: async (data: GuiYeuCauDoiLichRequest) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiLichResponse>>(
      "/api/booking/bac-si/toi/yeu-cau-doi-lich",
      data,
    );
    return response.data;
  },

  /**
   * Thống kê tổng quan công việc của bác sĩ
   * GET /api/booking/bac-si/toi/tong-quan
   */
  getTongQuanBacSi: async () => {
    const response = await axiosClient.get<ApiResponse<TongQuanBacSiResponse>>(
      "/api/booking/bac-si/toi/tong-quan",
    );
    return response.data;
  },

  // =========================================================================
  // 9. QUẢN TRỊ VIÊN (/api/booking/quan-tri/...)
  // =========================================================================

  /**
   * Danh sách toàn bộ lịch hẹn (quản trị viên)
   * GET /api/booking/quan-tri/lich-hen
   */
  getLichHenQuanTri: async (params?: GetLichHenQuanTriParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<LichHenCuaToiResponse>>
    >("/api/booking/quan-tri/lich-hen", { params });
    return response.data;
  },

  /**
   * Danh sách ca làm việc xếp cho các bác sĩ
   * GET /api/booking/quan-tri/lich-lam-viec
   */
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

  /**
   * Tạo ca làm việc mới
   * POST /api/booking/quan-tri/lich-lam-viec
   */
  taoCaLamViec: async (data: TaoCaRequest) => {
    const response = await axiosClient.post<ApiResponse<CaLamViecResponse>>(
      "/api/booking/quan-tri/lich-lam-viec",
      data,
    );
    return response.data;
  },

  /**
   * Sửa ca làm việc
   * PUT /api/booking/quan-tri/lich-lam-viec/{id}
   */
  suaCaLamViec: async (id: number, data: SuaCaRequest) => {
    const response = await axiosClient.put<ApiResponse<CaLamViecResponse>>(
      `/api/booking/quan-tri/lich-lam-viec/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Hủy ca làm việc
  * POST /api/booking/quan-tri/lich-lam-viec/{id}/huy
   */
  huyCaLamViec: async (id: number, data: HuyCaRequest) => {
    const response = await axiosClient.post<ApiResponse<unknown>>(
      `/api/booking/quan-tri/lich-lam-viec/${id}/huy`,
      data,
    );
    return response.data;
  },

  getLichHenCanDoiLich: async (params?: { trang?: number; kichThuoc?: number }) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<LichHenCuaToiResponse>>>(
      '/api/booking/quan-tri/lich-lam-viec/can-doi-lich',
      { params }
    );
    return response.data;
  },

  getLichHenTrongHoSoQuanTri: async (id: number, params?: { trang?: number; kichThuoc?: number }) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<LichHenCuaToiResponse>>>(
      `/api/booking/quan-tri/ho-so-benh-nhan/${id}/lich-hen`,
      { params }
    );
    return response.data;
  },

  /**
   * Danh sách yêu cầu đổi lịch cần xử lý
   * GET /api/booking/quan-tri/yeu-cau-doi-lich
   */
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

  /**
   * Phê duyệt hoặc từ chối yêu cầu đổi lịch
   * POST /api/booking/quan-tri/yeu-cau-doi-lich/{id}/duyet|tu-choi
   */
  xuLyYeuCauDoiLich: async (id: number, data: XuLyYeuCauRequest, approve = true) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiLichResponse>>(
      `/api/booking/quan-tri/yeu-cau-doi-lich/${id}/${approve ? 'duyet' : 'tu-choi'}`,
      data,
    );
    return response.data;
  },

  /**
   * Danh sách hồ sơ bệnh nhân (quản trị viên)
   * GET /api/booking/quan-tri/ho-so-benh-nhan
   */
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

  getHoSoChoXacMinhQuanTri: async (params?: { trang?: number; kichThuoc?: number }) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<unknown>>>(
      '/api/booking/quan-tri/ho-so-benh-nhan/cho-xac-minh',
      { params }
    );
    return response.data;
  },

  /**
   * Xem chi tiết hồ sơ bệnh nhân kèm lịch sử khám
   * GET /api/booking/quan-tri/ho-so-benh-nhan/{id}
   */
  getChiTietHoSoBenhNhanQuanTri: async (id: number) => {
    const response = await axiosClient.get<
      ApiResponse<ChiTietHoSoBenhNhanResponse>
    >(`/api/booking/quan-tri/ho-so-benh-nhan/${id}`);
    return response.data;
  },

  /**
   * Sửa thông tin hồ sơ bệnh nhân
   * PUT /api/booking/quan-tri/ho-so-benh-nhan/{id}
   */
  suaHoSoBenhNhanQuanTri: async (id: number, data: SuaHoSoBenhNhanRequest) => {
    const response = await axiosClient.put<
      ApiResponse<ChiTietHoSoBenhNhanResponse>
    >(`/api/booking/quan-tri/ho-so-benh-nhan/${id}`, data);
    return response.data;
  },

  /**
   * Xác nhận liên kết hồ sơ bệnh nhân
  * POST /api/booking/quan-tri/ho-so-benh-nhan/{id}/duyet
   */
  xacMinhLienKetHoSo: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/quan-tri/ho-so-benh-nhan/${id}/duyet`,
    );
    return response.data;
  },

  /**
   * Từ chối liên kết hồ sơ bệnh nhân
  * POST /api/booking/quan-tri/ho-so-benh-nhan/{id}/tu-choi
   */
  tuChoiLienKetHoSo: async (id: number, data: TuChoiLienKetRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      `/api/booking/quan-tri/ho-so-benh-nhan/${id}/tu-choi`,
      data,
    );
    return response.data;
  },

  /**
   * Quản lý danh sách đánh giá của bệnh nhân
   * GET /api/booking/quan-tri/danh-gia
   */
  getDanhGiaQuanTri: async (params?: GetDanhGiaQuanTriParams) => {
    const response = await axiosClient.get<
      ApiResponse<PageResponse<DanhGiaQuanTriResponse>>
    >("/api/booking/quan-tri/danh-gia", { params });
    return response.data;
  },

  /**
   * Ẩn hoặc hiện một đánh giá
   * PUT /api/booking/quan-tri/danh-gia/{id}/an
   */
  anHienDanhGia: async (id: number, an: boolean) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      `/api/booking/quan-tri/danh-gia/${id}/an`,
      { an },
    );
    return response.data;
  },

  /**
   * Dữ liệu thống kê tổng quan của quản trị viên
   * GET /api/booking/quan-tri/tong-quan
   */
  getTongQuanQuanTri: async () => {
    const response = await axiosClient.get<
      ApiResponse<TongQuanQuanTriResponse>
    >("/api/booking/quan-tri/tong-quan");
    return response.data;
  },
};

export default bookingService;
