import { useQuery } from '@tanstack/react-query';
import {
  specialtyService,
  doctorService,
  clinicService,
} from '@/services/catalog';

import type {
  GetChuyenKhoaParams,
  GetBacSiParams,
  GetPhongKhamParams,
} from '@/types/catalog.type';

export type { GetChuyenKhoaParams, GetBacSiParams, GetPhongKhamParams };

/**
 * Hook lấy danh sách chuyên khoa (hỗ trợ tìm kiếm, phân trang)
 */
export function useDanhSachChuyenKhoa(params?: GetChuyenKhoaParams) {
  const query = useQuery({
    queryKey: ['catalog', 'chuyen-khoa', params],
    queryFn: () => specialtyService.getDanhSachChuyenKhoa(params),
  });

  return {
    ...query,
    danhSach: query.data?.duLieu?.noiDung ?? [],
    tongSoPhanTu: query.data?.duLieu?.tongSoPhanTu ?? 0,
    tongSoTrang: query.data?.duLieu?.tongSoTrang ?? 0,
    trangHienTai: query.data?.duLieu?.trang ?? 0,
    kichThuoc: query.data?.duLieu?.kichThuoc ?? (params?.kichThuoc ?? 10),
  };
}

/**
 * Hook lấy chi tiết một chuyên khoa theo ID
 */
export function useChiTietChuyenKhoa(id?: number) {
  const query = useQuery({
    queryKey: ['catalog', 'chuyen-khoa-detail', id],
    queryFn: () => specialtyService.getChiTietChuyenKhoa(id!),
    enabled: typeof id === 'number' && !Number.isNaN(id),
  });

  return {
    ...query,
    chuyenKhoa: query.data?.duLieu ?? null,
  };
}

/**
 * Hook lấy danh sách bác sĩ (lọc theo chuyên khoa, từ khóa, phân trang)
 */
export function useDanhSachBacSi(params?: GetBacSiParams) {
  const query = useQuery({
    queryKey: ['catalog', 'bac-si', params],
    queryFn: () => doctorService.getDanhSachBacSi(params),
  });

  return {
    ...query,
    danhSach: query.data?.duLieu?.noiDung ?? [],
    tongSoPhanTu: query.data?.duLieu?.tongSoPhanTu ?? 0,
    tongSoTrang: query.data?.duLieu?.tongSoTrang ?? 0,
    trangHienTai: query.data?.duLieu?.trang ?? 0,
    kichThuoc: query.data?.duLieu?.kichThuoc ?? (params?.kichThuoc ?? 10),
  };
}

/**
 * Hook lấy chi tiết hồ sơ một bác sĩ theo ID
 */
export function useChiTietBacSi(id?: number) {
  const query = useQuery({
    queryKey: ['catalog', 'bac-si-detail', id],
    queryFn: () => doctorService.getChiTietBacSi(id!),
    enabled: typeof id === 'number' && !Number.isNaN(id),
  });

  return {
    ...query,
    bacSi: query.data?.duLieu ?? null,
  };
}

/**
 * Hook lấy danh sách phòng khám đang hoạt động
 */
export function useDanhSachPhongKham(params?: GetPhongKhamParams) {
  const query = useQuery({
    queryKey: ['catalog', 'phong-kham', params],
    queryFn: () => clinicService.getDanhSachPhongKham(params),
  });

  return {
    ...query,
    danhSach: query.data?.duLieu ?? [],
  };
}
