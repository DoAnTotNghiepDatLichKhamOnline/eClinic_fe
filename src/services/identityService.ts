import axiosClient from '@/utils/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/common.type';
import type {
  DangKyRequest,
  XacThucEmailRequest,
  GuiLaiXacThucRequest,
  DangNhapRequest,
  DangNhapGoogleRequest,
  DatMatKhauLanDauRequest,
  PhienDangNhapRequest,
  QuenMatKhauRequest,
  DatLaiMatKhauRequest,
  CapNhatHoSoRequest,
  DoiMatKhauRequest,
  DoiEmailRequest,
  CapNhatTrangThaiTaiKhoanRequest,
  GetTaiKhoanQuanTriParams,
  TaiKhoanResponse,
  DangNhapResponse,
  HoSoCaNhanResponse,
  PhienDangNhapResponse,
  YeuCauDoiEmailResponse,
  TaiKhoanQuanTriResponse,
  ChiTietTaiKhoanResponse,
} from '@/types/auth.type';

export const identityService = {
  // =========================================================================
  // 1. XÁC THỰC & TÀI KHOẢN (AUTH-01, 02, 03: /api/auth)
  // =========================================================================

  /**
   * Đăng ký tài khoản bệnh nhân, gửi liên kết kích hoạt qua email
   * POST /api/auth/register
   */
  dangKy: async (data: DangKyRequest) => {
    const response = await axiosClient.post<ApiResponse<TaiKhoanResponse>>(
      '/api/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Kích hoạt tài khoản bằng token trong liên kết email
   * POST /api/auth/verify-email
   */
  xacThucEmail: async (data: XacThucEmailRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/api/auth/verify-email',
      data
    );
    return response.data;
  },

  /**
   * Gửi lại liên kết kích hoạt tài khoản
   * POST /api/auth/resend-verification
   */
  guiLaiXacThuc: async (data: GuiLaiXacThucRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/api/auth/resend-verification',
      data
    );
    return response.data;
  },

  /**
   * Đăng nhập bằng email và mật khẩu (access token trong body, refresh token trong cookie)
   * POST /api/auth/login
   */
  dangNhap: async (data: DangNhapRequest) => {
    const response = await axiosClient.post<ApiResponse<DangNhapResponse>>(
      '/api/auth/login',
      data
    );
    return response.data;
  },

  /**
   * Lần đăng nhập đầu của tài khoản bác sĩ: đặt mật khẩu riêng
   * POST /api/auth/first-password
   */
  datMatKhauLanDau: async (data: DatMatKhauLanDauRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/api/auth/first-password',
      data
    );
    return response.data;
  },

  /**
   * Làm mới access token từ refresh token
   * POST /api/auth/refresh-token
   */
  lamMoiToken: async (data?: PhienDangNhapRequest) => {
    const response = await axiosClient.post<ApiResponse<DangNhapResponse>>(
      '/api/auth/refresh-token',
      data
    );
    return response.data;
  },

  /**
   * Đăng xuất phiên làm việc hiện tại và thu hồi cookie
   * POST /api/auth/logout
   */
  dangXuat: async (data?: PhienDangNhapRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/api/auth/logout',
      data
    );
    return response.data;
  },

  /**
   * Gửi liên kết đặt lại mật khẩu qua email
   * POST /api/auth/forgot-password
   */
  quenMatKhau: async (data: QuenMatKhauRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/api/auth/forgot-password',
      data
    );
    return response.data;
  },

  /**
   * Đặt mật khẩu mới bằng token trong email
   * POST /api/auth/reset-password
   */
  datLaiMatKhau: async (data: DatLaiMatKhauRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/api/auth/reset-password',
      data
    );
    return response.data;
  },

  /**
   * Xác nhận đổi email bằng token gửi tới email mới
   * POST /api/auth/confirm-email-change
   */
  xacNhanDoiEmail: async (data: XacThucEmailRequest) => {
    const response = await axiosClient.post<ApiResponse<void>>(
      '/api/auth/confirm-email-change',
      data
    );
    return response.data;
  },

  /**
   * Đăng nhập bằng Google ID Token
   * POST /api/auth/google
   */
  dangNhapGoogle: async (data: DangNhapGoogleRequest) => {
    const response = await axiosClient.post<ApiResponse<DangNhapResponse>>(
      '/api/auth/google',
      data
    );
    return response.data;
  },

  // =========================================================================
  // 2. HỒ SƠ CÁ NHÂN (/api/users/me)
  // =========================================================================

  /**
   * Lấy thông tin hồ sơ tài khoản đang đăng nhập
   * GET /api/users/me
   */
  getHoSoCaNhan: async () => {
    const response = await axiosClient.get<ApiResponse<HoSoCaNhanResponse>>(
      '/api/users/me'
    );
    return response.data;
  },

  /**
   * Cập nhật họ tên, số điện thoại
   * PUT /api/users/me
   */
  capNhatHoSo: async (data: CapNhatHoSoRequest) => {
    const response = await axiosClient.put<ApiResponse<HoSoCaNhanResponse>>(
      '/api/users/me',
      data
    );
    return response.data;
  },

  capNhatNgonNgu: async (ngonNgu: 'VI' | 'EN') => {
    const response = await axiosClient.put<ApiResponse<HoSoCaNhanResponse>>(
      '/api/users/me/language',
      { ngonNgu }
    );
    return response.data;
  },

  /**
   * Đổi mật khẩu
   * PUT /api/users/me/change-password
   */
  doiMatKhau: async (data: DoiMatKhauRequest) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      '/api/users/me/change-password',
      data
    );
    return response.data;
  },

  // =========================================================================
  // 3. ẢNH ĐẠI DIỆN (/api/users/me/avatar)
  // =========================================================================

  /**
   * Tải lên ảnh đại diện (multipart/form-data)
   * POST /api/users/me/avatar
   */
  taiLenAnhDaiDien: async (file: File | Blob) => {
    const formData = new FormData();
    formData.append('anh', file);
    const response = await axiosClient.post<ApiResponse<HoSoCaNhanResponse>>(
      '/api/users/me/avatar',
      formData
    );
    return response.data;
  },

  /**
   * Xoá ảnh đại diện
   * DELETE /api/users/me/avatar
   */
  xoaAnhDaiDien: async () => {
    const response = await axiosClient.delete<ApiResponse<HoSoCaNhanResponse>>(
      '/api/users/me/avatar'
    );
    return response.data;
  },

  // =========================================================================
  // 4. PHIÊN ĐĂNG NHẬP (/api/users/me/sessions)
  // =========================================================================

  /**
   * Lấy danh sách các phiên đăng nhập của tài khoản
   * GET /api/users/me/sessions
   */
  getDanhSachPhienDangNhap: async () => {
    const response = await axiosClient.get<ApiResponse<PhienDangNhapResponse[]>>(
      '/api/users/me/sessions'
    );
    return response.data;
  },

  /**
   * Thu hồi một phiên đăng nhập khác theo ID
   * DELETE /api/users/me/sessions/{id}
   */
  xoaPhienDangNhap: async (id: string) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/users/me/sessions/${id}`
    );
    return response.data;
  },

  /**
   * Đăng xuất tất cả các thiết bị khác, giữ lại thiết bị hiện tại
   * DELETE /api/users/me/sessions
   */
  xoaTatCaPhienKhac: async () => {
    const response = await axiosClient.delete<ApiResponse<number>>(
      '/api/users/me/sessions'
    );
    return response.data;
  },

  // =========================================================================
  // 5. ĐỔI EMAIL (/api/users/me/change-email)
  // =========================================================================

  /**
   * Yêu cầu đổi email đăng nhập (gửi mã xác nhận tới email mới)
   * POST /api/users/me/change-email
   */
  yeuCauDoiEmail: async (data: DoiEmailRequest) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiEmailResponse>>(
      '/api/users/me/change-email',
      data
    );
    return response.data;
  },

  /**
   * Lấy yêu cầu đổi email đang chờ xác nhận
   * GET /api/users/me/change-email
   */
  layYeuCauDoiEmailDangCho: async () => {
    const response = await axiosClient.get<ApiResponse<YeuCauDoiEmailResponse>>(
      '/api/users/me/change-email'
    );
    return response.data;
  },

  /**
   * Huỷ yêu cầu đổi email đang chờ
   * DELETE /api/users/me/change-email
   */
  huyYeuCauDoiEmail: async () => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      '/api/users/me/change-email'
    );
    return response.data;
  },

  // =========================================================================
  // 6. QUẢN LÝ TÀI KHOẢN - QUẢN TRỊ VIÊN (/api/users)
  // =========================================================================

  /**
   * Lấy danh sách tài khoản (phân trang, lọc theo từ khóa, vai trò, trạng thái)
   * GET /api/users
   */
  getDanhSachTaiKhoanQuanTri: async (params?: GetTaiKhoanQuanTriParams) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<TaiKhoanQuanTriResponse>>>(
      '/api/users',
      { params }
    );
    return response.data;
  },

  /**
   * Xem thông tin chi tiết một tài khoản
   * GET /api/users/{id}
   */
  getChiTietTaiKhoan: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<ChiTietTaiKhoanResponse>>(
      `/api/users/${id}`
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái tài khoản (Kích hoạt / Vô hiệu hóa)
   * PUT /api/users/{id}/status
   */
  capNhatTrangThaiTaiKhoan: async (id: number, data: CapNhatTrangThaiTaiKhoanRequest) => {
    const response = await axiosClient.put<ApiResponse<ChiTietTaiKhoanResponse>>(
      `/api/users/${id}/status`,
      data
    );
    return response.data;
  },

  /**
   * Xoá tài khoản (chỉ khi chưa có dữ liệu tham chiếu)
   * DELETE /api/users/{id}
   */
  xoaTaiKhoan: async (id: number) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/users/${id}`
    );
    return response.data;
  },
};

export const authService = identityService;
export default identityService;
