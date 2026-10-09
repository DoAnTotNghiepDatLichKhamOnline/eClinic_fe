import axiosClient from '@/utils/axiosClient'; // Đường dẫn tới file cấu hình Axios của bạn
import type { ApiResponse, PageResponse } from '@/types/common.type';
import type { 
  ChuyenKhoaResponse, 
  BacSiResponse, 
  BacSiChiTietResponse 
} from '@/types/catalog.type';

export const catalogService = {
  /**
   * 11.1 Lấy danh sách chuyên khoa (Hỗ trợ phân trang và tìm kiếm theo từ khóa)
   * GET /api/catalog/chuyen-khoa[cite: 2]
   */
  getDanhSachChuyenKhoa: async (params?: { 
    tuKhoa?: string; 
    trang?: number; 
    kichThuoc?: number 
  }) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<ChuyenKhoaResponse>>>('/api/catalog/chuyen-khoa', { params });
    return response.data;
  },

  /**
   * 11.2 Xem chi tiết thông tin một chuyên khoa theo ID
   * GET /api/catalog/chuyen-khoa/{id}[cite: 2]
   */
  getChiTietChuyenKhoa: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<ChuyenKhoaResponse>>(`/api/catalog/chuyen-khoa/${id}`);
    return response.data;
  },

  /**
   * 11.3 Tìm kiếm danh sách bác sĩ (Lọc theo chuyên khoa, tên, phân trang)
   * GET /api/catalog/bac-si[cite: 2]
   */
  getDanhSachBacSi: async (params?: { 
    idChuyenKhoa?: number; 
    tuKhoa?: string; 
    trang?: number; 
    kichThuoc?: number 
  }) => {
    const response = await axiosClient.get<ApiResponse<PageResponse<BacSiResponse>>>('/api/catalog/bac-si', { params });
    return response.data;
  },

  /**
   * 11.4 Xem hồ sơ chi tiết của một bác sĩ (Tiểu sử, đào tạo, công tác, ảnh, đánh giá)
   * GET /api/catalog/bac-si/{id}[cite: 2]
   */
  getChiTietBacSi: async (id: number) => {
    const response = await axiosClient.get<ApiResponse<BacSiChiTietResponse>>(`/api/catalog/bac-si/${id}`);
    return response.data;
  }
};