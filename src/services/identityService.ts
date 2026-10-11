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
  SuaThongTinTaiKhoanRequest,
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
  // 2. HỒ SƠ CÁ NHÂN (/api/identity/ho-so-ca-nhan)
  // =========================================================================

  /**
   * Lấy thông tin hồ sơ tài khoản đang đăng nhập
   * GET /api/identity/ho-so-ca-nhan
   */
  getHoSoCaNhan: async () => {
    const response = await axiosClient.get<ApiResponse<HoSoCaNhanResponse>>(
      '/api/identity/ho-so-ca-nhan'
    );
    return response.data;
  },

  /**
   * Cập nhật họ tên, số điện thoại
   * PUT /api/identity/ho-so-ca-nhan
   */
  capNhatHoSo: async (data: CapNhatHoSoRequest) => {
    const response = await axiosClient.put<ApiResponse<HoSoCaNhanResponse>>(
      '/api/identity/ho-so-ca-nhan',
      data
    );
    return response.data;
  },

  /**
   * Đổi mật khẩu
   * PUT /api/identity/ho-so-ca-nhan/mat-khau
   */
  doiMatKhau: async (data: DoiMatKhauRequest) => {
    const response = await axiosClient.put<ApiResponse<void>>(
      '/api/identity/ho-so-ca-nhan/mat-khau',
      data
    );
    return response.data;
  },

  // =========================================================================
  // 3. ẢNH ĐẠI DIỆN (/api/identity/anh-dai-dien)
  // =========================================================================

  /**
   * Tải lên ảnh đại diện (multipart/form-data)
   * POST /api/identity/anh-dai-dien
   */
  taiLenAnhDaiDien: async (file: File | Blob) => {
    const formData = new FormData();
    formData.append('anh', file);
    const response = await axiosClient.post<ApiResponse<HoSoCaNhanResponse>>(
      '/api/identity/anh-dai-dien',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Xoá ảnh đại diện
   * DELETE /api/identity/anh-dai-dien
   */
  xoaAnhDaiDien: async () => {
    const response = await axiosClient.delete<ApiResponse<HoSoCaNhanResponse>>(
      '/api/identity/anh-dai-dien'
    );
    return response.data;
  },

  // =========================================================================
  // 4. PHIÊN ĐĂNG NHẬP (/api/identity/phien-dang-nhap)
  // =========================================================================

  /**
   * Lấy danh sách các phiên đăng nhập của tài khoản
   * GET /api/identity/phien-dang-nhap
   */
  getDanhSachPhienDangNhap: async () => {
    const response = await axiosClient.get<ApiResponse<PhienDangNhapResponse[]>>(
      '/api/identity/phien-dang-nhap'
    );
    return response.data;
  },

  /**
   * Thu hồi một phiên đăng nhập khác theo ID
   * DELETE /api/identity/phien-dang-nhap/{id}
   */
  xoaPhienDangNhap: async (id: string) => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/identity/phien-dang-nhap/${id}`
    );
    return response.data;
  },

  // =========================================================================
  // 5. ĐỔI EMAIL (/api/identity/doi-email)
  // =========================================================================

  /**
   * Yêu cầu đổi email đăng nhập (gửi mã xác nhận tới email mới)
   * POST /api/identity/doi-email
   */
  yeuCauDoiEmail: async (data: DoiEmailRequest) => {
    const response = await axiosClient.post<ApiResponse<YeuCauDoiEmailResponse>>(
      '/api/identity/doi-email',
      data
    );
    return response.data;
  },

  // =========================================================================
  // 6. QUẢN LÝ TÀI KHOẢN - QUẢN TRỊ VIÊN (/api/identity/quan-ly/tai-khoan)
  // =========================================================================

  /**
   * Lấy danh sách tài khoản (phân trang, lọc theo từ khóa, vai trò, trạng thái)
   * GET /api/identity/quan-ly/tai-khoan
   */
  getDanhSachTaiKhoanQuanTri: async (params?: GetTaiKhoanQuanTriParams) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<TaiKhoanQuanTriResponse>>>(
      '/api/identity/quan-ly/tai-khoan',
      { params }
    );
    return response.data;
  },

  /**
   * Xem thông tin chi tiết một tài khoản
   * GET /api/identity/quan-ly/tai-khoan/{id}
   */
  getChiTietTaiKhoan: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<ChiTietTaiKhoanResponse>>(
      `/api/identity/quan-ly/tai-khoan/${id}`
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin tài khoản (họ tên, SĐT, vai trò)
   * PUT /api/identity/quan-ly/tai-khoan/{id}
   */
  suaThongTinTaiKhoan: async (id: number, data: SuaThongTinTaiKhoanRequest) => {
    const response = await axiosClient.put<ApiResponse<ChiTietTaiKhoanResponse>>(
      `/api/identity/quan-ly/tai-khoan/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Cập nhật trạng thái tài khoản (Kích hoạt / Vô hiệu hóa)
   * PUT /api/identity/quan-ly/tai-khoan/{id}/trang-thai
   */
  capNhatTrangThaiTaiKhoan: async (id: number, data: CapNhatTrangThaiTaiKhoanRequest) => {
    const response = await axiosClient.put<ApiResponse<ChiTietTaiKhoanResponse>>(
      `/api/identity/quan-ly/tai-khoan/${id}/trang-thai`,
      data
    );
    return response.data;
  },
};

export const authService = identityService;
export default identityService;
