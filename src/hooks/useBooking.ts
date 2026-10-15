import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientBookingService } from "@/services/booking/patientBooking.service";
import type {
  HoSoCuaToiRequest,
  GetLichHenParams,
  HuyLichRequest,
  DoiLichRequest,
  DanhGiaRequest,
  DatLichRequest,
  GetNgayConChoParams,
} from "@/types/booking.type";

/**
 * Hook lấy hồ sơ bệnh nhân của người dùng
 */
export function useHoSoBenhNhan() {
  const query = useQuery({
    queryKey: ["booking", "ho-so-benh-nhan"],
    queryFn: () => bookingService.getHoSoCuaToi(),
  });

  return {
    ...query,
    hoSo: query.data?.duLieu ?? null,
  };
}

/**
 * Hook lấy dữ liệu trang cá nhân (dashboard tổng hợp)
 */
export function useTrangCaNhan() {
  const query = useQuery({
    queryKey: ["booking", "trang-ca-nhan"],
    queryFn: () => bookingService.getTrangCaNhan(),
  });

  return {
    ...query,
    dashboard: query.data?.duLieu ?? null,
  };
}

/**
 * Hook lấy danh sách lịch hẹn của tôi
 */
export function useDanhSachLichHen(params?: GetLichHenParams) {
  const query = useQuery({
    queryKey: ["booking", "lich-hen", params],
    queryFn: () => bookingService.getDanhSachLichHen(params),
  });

  return {
    ...query,
    danhSach: query.data?.duLieu?.noiDung ?? [],
    tongSoPhanTu: query.data?.duLieu?.tongSoPhanTu ?? 0,
    tongSoTrang: query.data?.duLieu?.tongSoTrang ?? 0,
    trangHienTai: query.data?.duLieu?.trang ?? 0,
  };
}

/**
 * Hook lấy chi tiết một lịch hẹn
 */
export function useChiTietLichHen(maPhieuKham?: string) {
  const query = useQuery({
    queryKey: ["booking", "lich-hen-detail", maPhieuKham],
    queryFn: () => bookingService.getChiTietLichHen(maPhieuKham!),
    enabled: Boolean(maPhieuKham),
  });

  return {
    ...query,
    chiTiet: query.data?.duLieu ?? null,
  };
}

/**
 * Hook lấy thông tin gợi ý khi đặt lịch
 */
export function useThongTinDatLich(enabled = true) {
  const query = useQuery({
    queryKey: ["booking", "thong-tin-dat-lich"],
    queryFn: () => bookingService.getThongTinDatLich(),
    enabled,
  });

  return {
    ...query,
    thongTin: query.data?.duLieu ?? null,
  };
}

/**
 * Hook lấy ngày còn chỗ theo chuyên khoa / bác sĩ
 */
export function useNgayConCho(params?: GetNgayConChoParams) {
  const query = useQuery({
    queryKey: ["booking", "ngay-con-cho", params],
    queryFn: () => bookingService.getNgayConCho(params!),
    enabled: Boolean(params?.tuNgay && params?.denNgay),
  });

  return {
    ...query,
    danhSachNgay: query.data?.duLieu ?? [],
  };
}

/**
 * Hook lấy ca khám và khung giờ theo ngày
 */
export function useCaKhamTheoNgay(params?: {
  ngay: string;
  idBacSi?: number;
  idChuyenKhoa?: number;
}) {
  const query = useQuery({
    queryKey: ["booking", "ca-kham", params],
    queryFn: () => bookingService.getCaKhamTheoNgay(params!),
    enabled: Boolean(params?.ngay),
  });

  return {
    ...query,
    danhSachCaKham: query.data?.duLieu ?? [],
  };
}

/**
 * Hook lấy khung giờ gộp theo chuyên khoa trong ngày
 */
export function useKhungGioGop(params?: {
  idChuyenKhoa: number;
  ngay: string;
}) {
  const query = useQuery({
    queryKey: ["booking", "khung-gio-gop", params],
    queryFn: () => bookingService.getKhungGioGop(params!),
    enabled: Boolean(params?.idChuyenKhoa && params?.ngay),
  });

  return {
    ...query,
    danhSachKhungGio: query.data?.duLieu ?? [],
  };
}

/**
 * Hook các thao tác đặt lịch, hủy, đổi lịch, đánh giá
 */
export function useBookingActions() {
  const queryClient = useQueryClient();

  const datLichMutation = useMutation({
    mutationFn: (data: DatLichRequest) => bookingService.datLich(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "lich-hen"] });
      queryClient.invalidateQueries({ queryKey: ["booking", "trang-ca-nhan"] });
    },
  });

  const capNhatHoSoMutation = useMutation({
    mutationFn: (data: HoSoCuaToiRequest) =>
      bookingService.capNhatHoSoCuaToi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["booking", "ho-so-benh-nhan"],
      });
      queryClient.invalidateQueries({ queryKey: ["booking", "trang-ca-nhan"] });
    },
  });

  const huyLichMutation = useMutation({
    mutationFn: ({
      maPhieuKham,
      data,
    }: {
      maPhieuKham: string;
      data: HuyLichRequest;
    }) => bookingService.huyLichHen(maPhieuKham, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "lich-hen"] });
      queryClient.invalidateQueries({ queryKey: ["booking", "trang-ca-nhan"] });
    },
  });

  const doiLichMutation = useMutation({
    mutationFn: ({
      maPhieuKham,
      data,
    }: {
      maPhieuKham: string;
      data: DoiLichRequest;
    }) => bookingService.doiLichHen(maPhieuKham, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "lich-hen"] });
      queryClient.invalidateQueries({ queryKey: ["booking", "trang-ca-nhan"] });
    },
  });

  const danhGiaMutation = useMutation({
    mutationFn: ({
      maPhieuKham,
      data,
    }: {
      maPhieuKham: string;
      data: DanhGiaRequest;
    }) => bookingService.taoDanhGia(maPhieuKham, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "lich-hen"] });
    },
  });

  const suaDanhGiaMutation = useMutation({
    mutationFn: ({
      maPhieuKham,
      data,
    }: {
      maPhieuKham: string;
      data: DanhGiaRequest;
    }) => bookingService.suaDanhGia(maPhieuKham, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["booking", "lich-hen"] });
      queryClient.invalidateQueries({
        queryKey: ["booking", "lich-hen-detail", variables.maPhieuKham],
      });
    },
  });

  return {
    datLich: datLichMutation.mutateAsync,
    isBooking: datLichMutation.isPending,
    capNhatHoSo: capNhatHoSoMutation.mutateAsync,
    isUpdatingHoSo: capNhatHoSoMutation.isPending,
    huyLich: huyLichMutation.mutateAsync,
    isCancelling: huyLichMutation.isPending,
    doiLich: doiLichMutation.mutateAsync,
    isRescheduling: doiLichMutation.isPending,
    danhGia: danhGiaMutation.mutateAsync,
    isSubmittingReview: danhGiaMutation.isPending,
    suaDanhGia: suaDanhGiaMutation.mutateAsync,
    isUpdatingReview: suaDanhGiaMutation.isPending,
  };
}
