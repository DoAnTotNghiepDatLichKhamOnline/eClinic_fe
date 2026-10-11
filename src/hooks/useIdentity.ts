import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { identityService } from '@/services/identityService';
import type {
  CapNhatHoSoRequest,
  DoiMatKhauRequest,
  DoiEmailRequest,
} from '@/types/auth.type';

/**
 * Hook lấy thông tin hồ sơ tài khoản cá nhân
 */
export function useHoSoCaNhan() {
  const query = useQuery({
    queryKey: ['identity', 'ho-so-ca-nhan'],
    queryFn: () => identityService.getHoSoCaNhan(),
  });

  return {
    ...query,
    hoSo: query.data?.duLieu ?? null,
  };
}

/**
 * Hook lấy danh sách các phiên đăng nhập
 */
export function useDanhSachPhienDangNhap() {
  const query = useQuery({
    queryKey: ['identity', 'phien-dang-nhap'],
    queryFn: () => identityService.getDanhSachPhienDangNhap(),
  });

  return {
    ...query,
    danhSach: query.data?.duLieu ?? [],
  };
}

/**
 * Hook các thao tác cập nhật tài khoản (hồ sơ, mật khẩu, phiên, email, avatar)
 */
export function useIdentityActions() {
  const queryClient = useQueryClient();

  const capNhatHoSoMutation = useMutation({
    mutationFn: (data: CapNhatHoSoRequest) => identityService.capNhatHoSo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', 'ho-so-ca-nhan'] });
    },
  });

  const doiMatKhauMutation = useMutation({
    mutationFn: (data: DoiMatKhauRequest) => identityService.doiMatKhau(data),
  });

  const doiEmailMutation = useMutation({
    mutationFn: (data: DoiEmailRequest) => identityService.yeuCauDoiEmail(data),
  });

  const xoaPhienMutation = useMutation({
    mutationFn: (id: string) => identityService.xoaPhienDangNhap(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', 'phien-dang-nhap'] });
    },
  });

  const xoaTatCaPhienKhacMutation = useMutation({
    mutationFn: () => identityService.xoaTatCaPhienKhac(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', 'phien-dang-nhap'] });
    },
  });

  const taiLenAnhMutation = useMutation({
    mutationFn: (file: File | Blob) => identityService.taiLenAnhDaiDien(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', 'ho-so-ca-nhan'] });
    },
  });

  const xoaAnhMutation = useMutation({
    mutationFn: () => identityService.xoaAnhDaiDien(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', 'ho-so-ca-nhan'] });
    },
  });

  return {
    capNhatHoSo: capNhatHoSoMutation.mutateAsync,
    isUpdatingHoSo: capNhatHoSoMutation.isPending,
    doiMatKhau: doiMatKhauMutation.mutateAsync,
    isChangingPassword: doiMatKhauMutation.isPending,
    yeuCauDoiEmail: doiEmailMutation.mutateAsync,
    isRequestingEmailChange: doiEmailMutation.isPending,
    xoaPhien: xoaPhienMutation.mutateAsync,
    isRevokingSession: xoaPhienMutation.isPending,
    xoaTatCaPhienKhac: xoaTatCaPhienKhacMutation.mutateAsync,
    isRevokingAllSessions: xoaTatCaPhienKhacMutation.isPending,
    taiLenAnh: taiLenAnhMutation.mutateAsync,
    isUploadingAvatar: taiLenAnhMutation.isPending,
    xoaAnh: xoaAnhMutation.mutateAsync,
    isRemovingAvatar: xoaAnhMutation.isPending,
  };
}
