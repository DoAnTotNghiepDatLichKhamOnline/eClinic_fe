import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { identityService } from '@/services/identityService';
import type {
  DangKyRequest,
  DangNhapRequest,
  DangNhapGoogleRequest,
  DatMatKhauLanDauRequest,
  XacThucEmailRequest,
  GuiLaiXacThucRequest,
  QuenMatKhauRequest,
  DatLaiMatKhauRequest,
  CapNhatHoSoRequest,
  DoiMatKhauRequest,
  DoiEmailRequest,
  CapNhatTrangThaiTaiKhoanRequest,
  GetTaiKhoanQuanTriParams,
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
 * Hook lấy danh sách tài khoản cho Quản trị viên (/api/users)
 */
export function useDanhSachTaiKhoanQuanTri(params?: GetTaiKhoanQuanTriParams) {
  const query = useQuery({
    queryKey: ['identity', 'admin-users', params],
    queryFn: () => identityService.getDanhSachTaiKhoanQuanTri(params),
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
 * Hook xem chi tiết tài khoản theo ID (Quản trị viên)
 */
export function useChiTietTaiKhoan(id?: number) {
  const query = useQuery({
    queryKey: ['identity', 'admin-user-detail', id],
    queryFn: () => identityService.getChiTietTaiKhoan(id!),
    enabled: typeof id === 'number' && !isNaN(id),
  });

  return {
    ...query,
    chiTiet: query.data?.duLieu ?? null,
  };
}

/**
 * Hook các thao tác xác thực và quản lý tài khoản
 */
export function useIdentityActions() {
  const queryClient = useQueryClient();

  const dangNhapMutation = useMutation({
    mutationFn: (data: DangNhapRequest) => identityService.dangNhap(data),
  });

  const dangKyMutation = useMutation({
    mutationFn: (data: DangKyRequest) => identityService.dangKy(data),
  });

  const quenMatKhauMutation = useMutation({
    mutationFn: (data: QuenMatKhauRequest) => identityService.quenMatKhau(data),
  });

  const datLaiMatKhauMutation = useMutation({
    mutationFn: (data: DatLaiMatKhauRequest) => identityService.datLaiMatKhau(data),
  });

  const xacThucEmailMutation = useMutation({
    mutationFn: (data: XacThucEmailRequest) => identityService.xacThucEmail(data),
  });

  const guiLaiXacThucMutation = useMutation({
    mutationFn: (data: GuiLaiXacThucRequest) => identityService.guiLaiXacThuc(data),
  });

  const datMatKhauLanDauMutation = useMutation({
    mutationFn: (data: DatMatKhauLanDauRequest) => identityService.datMatKhauLanDau(data),
  });

  const dangNhapGoogleMutation = useMutation({
    mutationFn: (data: DangNhapGoogleRequest) => identityService.dangNhapGoogle(data),
  });

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

  const capNhatTrangThaiTaiKhoanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CapNhatTrangThaiTaiKhoanRequest }) =>
      identityService.capNhatTrangThaiTaiKhoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', 'admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['identity', 'admin-user-detail'] });
    },
  });

  const xoaTaiKhoanMutation = useMutation({
    mutationFn: (id: number) => identityService.xoaTaiKhoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', 'admin-users'] });
    },
  });

  return {
    // Xác thực
    dangNhap: dangNhapMutation.mutateAsync,
    isLoggingIn: dangNhapMutation.isPending,
    dangKy: dangKyMutation.mutateAsync,
    isRegistering: dangKyMutation.isPending,
    quenMatKhau: quenMatKhauMutation.mutateAsync,
    isRequestingReset: quenMatKhauMutation.isPending,
    datLaiMatKhau: datLaiMatKhauMutation.mutateAsync,
    isResettingPassword: datLaiMatKhauMutation.isPending,
    xacThucEmail: xacThucEmailMutation.mutateAsync,
    guiLaiXacThuc: guiLaiXacThucMutation.mutateAsync,
    datMatKhauLanDau: datMatKhauLanDauMutation.mutateAsync,
    dangNhapGoogle: dangNhapGoogleMutation.mutateAsync,

    // Hồ sơ & phiên
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

    // Quản trị viên
    capNhatTrangThaiTaiKhoan: capNhatTrangThaiTaiKhoanMutation.mutateAsync,
    xoaTaiKhoan: xoaTaiKhoanMutation.mutateAsync,
  };
}
