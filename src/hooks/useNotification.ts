import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import type { GetThongBaoParams } from '@/types/notification.type';

/**
 * Hook lấy danh sách thông báo
 */
export function useDanhSachThongBao(params?: GetThongBaoParams) {
  const query = useQuery({
    queryKey: ['notification', 'danh-sach', params],
    queryFn: () => notificationService.getDanhSachThongBao(params),
    refetchInterval: 30000, // Tự động làm mới mỗi 30s
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
 * Hook lấy số lượng thông báo chưa đọc
 */
export function useSoThongBaoChuaDoc() {
  const query = useQuery({
    queryKey: ['notification', 'so-chua-doc'],
    queryFn: () => notificationService.getSoChuaDoc(),
    refetchInterval: 30000,
  });

  return {
    ...query,
    soChuaDoc: query.data?.duLieu?.soChuaDoc ?? 0,
  };
}

/**
 * Hook các thao tác thông báo (đánh dấu đã đọc, đọc tất cả, xóa)
 */
export function useNotificationActions() {
  const queryClient = useQueryClient();

  const danhDauDaDocMutation = useMutation({
    mutationFn: (id: number) => notificationService.danhDauDaDoc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });

  const danhDauTatCaDaDocMutation = useMutation({
    mutationFn: () => notificationService.danhDauTatCaDaDoc(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });

  return {
    danhDauDaDoc: danhDauDaDocMutation.mutateAsync,
    isMarkingRead: danhDauDaDocMutation.isPending,
    danhDauTatCaDaDoc: danhDauTatCaDaDocMutation.mutateAsync,
    isMarkingAllRead: danhDauTatCaDaDocMutation.isPending,
  };
}
