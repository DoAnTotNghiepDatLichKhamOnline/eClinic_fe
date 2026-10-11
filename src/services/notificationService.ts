import axiosClient from '@/utils/axiosClient';
import type { ApiResponse, PageResponse } from '@/types/common.type';
import type {
  ThongBaoResponse,
  SoChuaDocResponse,
  DanhDauDaDocResponse,
  GetThongBaoParams,
} from '@/types/notification.type';

export const notificationService = {
  /**
   * Lấy danh sách thông báo của tài khoản (phân trang, lọc theo trạng thái đã đọc)
   * GET /api/notification/thong-bao
   */
  getDanhSachThongBao: async (params?: GetThongBaoParams) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<ThongBaoResponse>>>(
      '/api/notification/thong-bao',
      { params }
    );
    return response.data;
  },

  /**
   * Đếm số lượng thông báo chưa đọc
   * GET /api/notification/thong-bao/so-chua-doc
   */
  getSoChuaDoc: async () => {
    const response = await axiosClient.get<ApiResponse<SoChuaDocResponse>>(
      '/api/notification/thong-bao/so-chua-doc'
    );
    return response.data;
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   * POST /api/notification/thong-bao/{id}/da-doc
   */
  danhDauDaDoc: async (id: number) => {
    const response = await axiosClient.post<ApiResponse<ThongBaoResponse>>(
      `/api/notification/thong-bao/${id}/da-doc`
    );
    return response.data;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * POST /api/notification/thong-bao/da-doc-tat-ca
   */
  danhDauTatCaDaDoc: async () => {
    const response = await axiosClient.post<ApiResponse<DanhDauDaDocResponse>>(
      '/api/notification/thong-bao/da-doc-tat-ca'
    );
    return response.data;
  },
};

export default notificationService;
