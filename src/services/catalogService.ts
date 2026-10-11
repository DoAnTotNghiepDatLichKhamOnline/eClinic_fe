import axiosClient from '@/utils/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/common.type';
import type {
  ChuyenKhoaResponse,
  ChuyenKhoaRequest,
  GetChuyenKhoaParams,
  BacSiResponse,
  BacSiChiTietResponse,
  GetBacSiParams,
  PhongKhamResponse,
  PhongKhamRequest,
  GetPhongKhamParams,
  BacSiQuanTriResponse,
  HoSoBacSiQuanTriResponse,
  ThemBacSiRequest,
  SuaBacSiRequest,
  CapNhatHoSoBacSiRequest,
  CapNhatAnhBacSiRequest,
  SapXepAnhBacSiRequest,
  NgungCongTacRequest,
  AnhHuongNgungCongTacResponse,
  KetQuaNgungCongTacResponse,
  GetBacSiQuanTriParams,
  PhongKhamQuanTriResponse,
  GetPhongKhamQuanTriParams,
  LoaiAnhBacSi,
  AnhBacSiResponse,
} from '@/types/catalog.type';

export const catalogService = {
  // =========================================================================
  // 1. CHUYÊN KHOA (ADM-01 & Public)
  // =========================================================================

  /**
   * Lấy danh sách chuyên khoa (Hỗ trợ phân trang và tìm kiếm theo từ khóa)
   * GET /api/catalog/chuyen-khoa
   */
  getDanhSachChuyenKhoa: async (params?: GetChuyenKhoaParams) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<ChuyenKhoaResponse>>>(
      '/api/catalog/chuyen-khoa',
      { params }
    );
    return response.data;
  },

  /**
   * Xem chi tiết thông tin một chuyên khoa theo ID
   * GET /api/catalog/chuyen-khoa/{id}
   */
  getChiTietChuyenKhoa: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<ChuyenKhoaResponse>>(
      `/api/catalog/chuyen-khoa/${id}`
    );
    return response.data;
  },

  /**
   * Thêm chuyên khoa mới (Quản trị viên)
   * POST /api/catalog/chuyen-khoa
   */
  taoChuyenKhoa: async (data: ChuyenKhoaRequest) => {
    const response = await axiosClient.post<ApiResponse<ChuyenKhoaResponse>>(
      '/api/catalog/chuyen-khoa',
      data
    );
    return response.data;
  },

  /**
   * Sửa chuyên khoa (Quản trị viên)
   * PUT /api/catalog/chuyen-khoa/{id}
   */
  capNhatChuyenKhoa: async (id: number, data: ChuyenKhoaRequest) => {
    const response = await axiosClient.put<ApiResponse<ChuyenKhoaResponse>>(
      `/api/catalog/chuyen-khoa/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Xoá chuyên khoa (Quản trị viên) — chỉ khi không còn phòng khám / bác sĩ
   * DELETE /api/catalog/chuyen-khoa/{id}
   */
  xoaChuyenKhoa: async (id: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/catalog/chuyen-khoa/${id}`
    );
    return response.data;
  },

  // =========================================================================
  // 2. BÁC SĨ (DOC-03: Tìm bác sĩ khi đặt lịch - Công khai)
  // =========================================================================

  /**
   * Tìm kiếm danh sách bác sĩ công khai (Lọc theo chuyên khoa, tên, phân trang)
   * GET /api/catalog/bac-si
   */
  getDanhSachBacSi: async (params?: GetBacSiParams) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<BacSiResponse>>>(
      '/api/catalog/bac-si',
      { params }
    );
    return response.data;
  },

  /**
   * Xem hồ sơ chi tiết của một bác sĩ công khai (Tiểu sử, đào tạo, công tác, ảnh, đánh giá)
   * GET /api/catalog/bac-si/{id}
   */
  getChiTietBacSi: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<BacSiChiTietResponse>>(
      `/api/catalog/bac-si/${id}`
    );
    return response.data;
  },

  // =========================================================================
  // 3. PHÒNG KHÁM (Công khai / Đang hoạt động - chọn khi xếp ca)
  // =========================================================================

  /**
   * Danh sách các phòng khám đang hoạt động theo tên phòng
   * GET /api/catalog/phong-kham
   */
  getDanhSachPhongKham: async (params?: GetPhongKhamParams) => {
    const response = await axiosClient.get<ApiResponse<PhongKhamResponse[]>>(
      '/api/catalog/phong-kham',
      { params }
    );
    return response.data;
  },

  // =========================================================================
  // 4. QUẢN TRỊ BÁC SĨ (DOC-01: Quản trị viên)
  // =========================================================================

  /**
   * Danh bạ bác sĩ cho quản trị viên (kể cả bác sĩ ngừng công tác, phân trang, lọc)
   * GET /api/catalog/quan-tri/bac-si
   */
  getDanhSachBacSiQuanTri: async (params?: GetBacSiQuanTriParams) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<BacSiQuanTriResponse>>>(
      '/api/catalog/quan-tri/bac-si',
      { params }
    );
    return response.data;
  },

  /**
   * Thêm bác sĩ: tạo tài khoản đăng nhập và hồ sơ bác sĩ trong 1 bước
   * POST /api/catalog/quan-tri/bac-si
   */
  themBacSi: async (data: ThemBacSiRequest) => {
    const response = await axiosClient.post<ApiResponse<HoSoBacSiQuanTriResponse>>(
      '/api/catalog/quan-tri/bac-si',
      data
    );
    return response.data;
  },

  /**
   * Sửa thông tin cơ bản: họ tên, số điện thoại, chuyên khoa, số giấy phép
   * PUT /api/catalog/quan-tri/bac-si/{id}
   */
  suaBacSi: async (id: number, data: SuaBacSiRequest) => {
    const response = await axiosClient.put<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Xem trước khi cho ngừng công tác: số ca bị hủy và số lịch hẹn phải đổi lịch
   * GET /api/catalog/quan-tri/bac-si/{id}/anh-huong-ngung-cong-tac
   */
  getAnhHuongNgungCongTac: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<AnhHuongNgungCongTacResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh-huong-ngung-cong-tac`
    );
    return response.data;
  },

  /**
   * Cho bác sĩ ngừng công tác
   * POST /api/catalog/quan-tri/bac-si/{id}/ngung-cong-tac
   */
  ngungCongTacBacSi: async (id: number, data: NgungCongTacRequest) => {
    const response = await axiosClient.post<ApiResponse<KetQuaNgungCongTacResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/ngung-cong-tac`,
      data
    );
    return response.data;
  },

  /**
   * Cho bác sĩ công tác lại
   * POST /api/catalog/quan-tri/bac-si/{id}/cong-tac-lai
   */
  congTacLaiBacSi: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/cong-tac-lai`
    );
    return response.data;
  },

  /**
   * Xem hồ sơ giới thiệu của bác sĩ (quản trị viên, xem cả bác sĩ ẩn)
   * GET /api/catalog/quan-tri/bac-si/{id}
   */
  getHoSoBacSiQuanTri: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}`
    );
    return response.data;
  },

  /**
   * Sửa hồ sơ giới thiệu của bác sĩ (ghi đè mọi trường)
   * PUT /api/catalog/quan-tri/bac-si/{id}/ho-so
   */
  capNhatHoSoBacSi: async (id: number, data: CapNhatHoSoBacSiRequest) => {
    const response = await axiosClient.put<ApiResponse<HoSoBacSiQuanTriResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/ho-so`,
      data
    );
    return response.data;
  },

  /**
   * Thêm ảnh giới thiệu (multipart/form-data: tệp 'anh', 'loai', 'chuThich')
   * POST /api/catalog/quan-tri/bac-si/{id}/anh
   */
  themAnhBacSi: async (id: number, file: File | Blob, loai: LoaiAnhBacSi, chuThich?: string) => {
    const formData = new FormData();
    formData.append('anh', file);
    const response = await axiosClient.post<ApiResponse<AnhBacSiResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh`,
      formData,
      {
        params: { loai, ...(chuThich ? { chuThich } : {}) },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Sửa loại và chú thích của ảnh giới thiệu
   * PUT /api/catalog/quan-tri/bac-si/{id}/anh/{idAnh}
   */
  capNhatAnhBacSi: async (id: number, idAnh: number, data: CapNhatAnhBacSiRequest) => {
    const response = await axiosClient.put<ApiResponse<AnhBacSiResponse>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh/${idAnh}`,
      data
    );
    return response.data;
  },

  /**
   * Sắp xếp lại ảnh giới thiệu
   * PUT /api/catalog/quan-tri/bac-si/{id}/anh/thu-tu
   */
  sapXepAnhBacSi: async (id: number, data: SapXepAnhBacSiRequest) => {
    const response = await axiosClient.put<ApiResponse<AnhBacSiResponse[]>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh/thu-tu`,
      data
    );
    return response.data;
  },

  /**
   * Xoá ảnh giới thiệu
   * DELETE /api/catalog/quan-tri/bac-si/{id}/anh/{idAnh}
   */
  xoaAnhBacSi: async (id: number, idAnh: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/catalog/quan-tri/bac-si/${id}/anh/${idAnh}`
    );
    return response.data;
  },

  // =========================================================================
  // 5. QUẢN TRỊ PHÒNG KHÁM (Quản trị viên)
  // =========================================================================

  /**
   * Danh mục mọi phòng khám (phân trang, kèm số ca sắp tới, lọc)
   * GET /api/catalog/quan-tri/phong-kham
   */
  getDanhSachPhongKhamQuanTri: async (params?: GetPhongKhamQuanTriParams) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<PhongKhamQuanTriResponse>>>(
      '/api/catalog/quan-tri/phong-kham',
      { params }
    );
    return response.data;
  },

  /**
   * Thêm phòng khám
   * POST /api/catalog/quan-tri/phong-kham
   */
  themPhongKham: async (data: PhongKhamRequest) => {
    const response = await axiosClient.post<ApiResponse<PhongKhamQuanTriResponse>>(
      '/api/catalog/quan-tri/phong-kham',
      data
    );
    return response.data;
  },

  /**
   * Sửa thông tin phòng khám
   * PUT /api/catalog/quan-tri/phong-kham/{id}
   */
  suaPhongKham: async (id: number, data: PhongKhamRequest) => {
    const response = await axiosClient.put<ApiResponse<PhongKhamQuanTriResponse>>(
      `/api/catalog/quan-tri/phong-kham/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Cho phòng khám ngừng hoạt động
   * POST /api/catalog/quan-tri/phong-kham/{id}/ngung-hoat-dong
   */
  ngungHoatDongPhongKham: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<PhongKhamQuanTriResponse>>(
      `/api/catalog/quan-tri/phong-kham/${id}/ngung-hoat-dong`
    );
    return response.data;
  },

  /**
   * Cho phòng khám hoạt động lại
   * POST /api/catalog/quan-tri/phong-kham/{id}/hoat-dong-lai
   */
  hoatDongLaiPhongKham: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<PhongKhamQuanTriResponse>>(
      `/api/catalog/quan-tri/phong-kham/${id}/hoat-dong-lai`
    );
    return response.data;
  },
};
export default catalogService;