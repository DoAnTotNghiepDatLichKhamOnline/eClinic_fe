import axiosClient from "@/utils/axiosClient";
import type { ApiResponse } from "@/types/common.type";
import type {
  ThongKeBaoCaoResponse,
  GetThongKeBaoCaoParams,
} from "@/types/booking.type";

export const reportAdminService = {
  /**
   * Báo cáo thống kê tổng quan toàn viện
   * (lượt đặt, tỷ lệ lấp đầy, theo chuyên khoa/bác sĩ/kỳ thời gian)
   */
  getThongKeBaoCao: async (params?: GetThongKeBaoCaoParams) => {
    const response = await axiosClient.get<ApiResponse<ThongKeBaoCaoResponse>>(
      "/api/report/quan-tri/thong-ke",
      { params },
    );
    return response.data;
  },

  /**
   * Xuất báo cáo thống kê ra tệp Excel
   */
  xuatExcelBaoCao: async (params?: GetThongKeBaoCaoParams) => {
    const response = await axiosClient.get(
      "/api/report/quan-tri/thong-ke/xuat-excel",
      {
        params,
        responseType: "blob",
      },
    );
    return response.data as Blob;
  },
};

export default reportAdminService;
