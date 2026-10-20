import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { consultationService } from "@/services/consultationService";
import type {
  HoSoKhamResponse,
  GhiKetQuaKhamRequest,
  SuaHoSoBenhNhanEMRRequest,
  LichHenTrongNgayParams,
  LichSuSuaBenhAnResponse,
} from "@/types/consultation.type";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useConsultation(initialParams?: { id?: number; ma?: string }) {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();

  // 1. Quản lý bộ lọc danh sách bệnh nhân trong ngày
  const [filters, setFilters] = useState<LichHenTrongNgayParams>({
    ngay: getTodayString(),
    idLichLamViec: undefined,
    soThuTu: undefined,
    tuKhoa: "",
  });

  const dailyPatientsQuery = useQuery({
    queryKey: ["consultation", "daily-patients", filters],
    queryFn: () => consultationService.getDanhSachLichHenTrongNgay(filters),
    staleTime: 10000,
  });

  // 2. Quản lý hồ sơ khám đang mở
  const [hoSoKham, setHoSoKham] = useState<HoSoKhamResponse | null>(null);
  const [isLoadingHoSo, setIsLoadingHoSo] = useState(false);
  const [hoSoError, setHoSoError] = useState<string | null>(null);

  // 3. Quản lý modal lịch sử sửa EMR
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const historyQuery = useQuery({
    queryKey: ["consultation", "history", selectedHistoryId],
    queryFn: () =>
      selectedHistoryId
        ? consultationService.getLichSuSua(selectedHistoryId)
        : Promise.resolve({ thanhCong: true, thongDiep: "", duLieu: undefined }),
    enabled: Boolean(selectedHistoryId),
  });

  // Mở hồ sơ theo mã tra cứu / mã phiếu khám / link QR
  const moHoSoTheoMa = useCallback(
    async (ma: string) => {
      if (!ma.trim()) return false;
      setIsLoadingHoSo(true);
      setHoSoError(null);
      try {
        const res = await consultationService.traCuuHoSoKham(ma.trim());
        if (!res.thanhCong || !res.duLieu) {
          throw new Error(res.thongDiep || "Không tìm thấy hồ sơ khám");
        }
        setHoSoKham(res.duLieu);
        return true;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { thongDiep?: string } } }).response
            ?.data?.thongDiep ||
          (err instanceof Error ? err.message : "Không mở được hồ sơ khám");
        setHoSoError(msg);
        notifyAuth("error", lang === "vi" ? "Lỗi tra cứu" : "Lookup error", msg);
        return false;
      } finally {
        setIsLoadingHoSo(false);
      }
    },
    [lang],
  );

  // Mở hồ sơ theo ID lịch hẹn
  const moHoSoTheoId = useCallback(
    async (id: number) => {
      setIsLoadingHoSo(true);
      setHoSoError(null);
      try {
        const res = await consultationService.getHoSoKhamById(id);
        if (!res.thanhCong || !res.duLieu) {
          throw new Error(res.thongDiep || "Không tìm thấy hồ sơ khám");
        }
        setHoSoKham(res.duLieu);
        return true;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { thongDiep?: string } } }).response
            ?.data?.thongDiep ||
          (err instanceof Error ? err.message : "Không mở được hồ sơ khám");
        setHoSoError(msg);
        notifyAuth("error", lang === "vi" ? "Lỗi mở hồ sơ" : "Error opening record", msg);
        return false;
      } finally {
        setIsLoadingHoSo(false);
      }
    },
    [lang],
  );

  const dongHoSo = useCallback(() => {
    setHoSoKham(null);
    setHoSoError(null);
  }, []);

  // Mutation cập nhật hồ sơ bệnh nhân
  const updatePatientMutation = useMutation({
    mutationFn: async (data: SuaHoSoBenhNhanEMRRequest) => {
      if (!hoSoKham) throw new Error("Chưa chọn lượt khám");
      return consultationService.capNhatBenhNhan(hoSoKham.lichHen.id, data);
    },
    onSuccess: (res) => {
      if (res.duLieu) {
        setHoSoKham(res.duLieu);
      }
      queryClient.invalidateQueries({ queryKey: ["consultation", "daily-patients"] });
      notifyAuth(
        "success",
        lang === "vi" ? "Cập nhật hồ sơ bệnh nhân" : "Patient profile updated",
        res.thongDiep || (lang === "vi" ? "Đã lưu thành công" : "Saved successfully"),
      );
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { thongDiep?: string } } }).response?.data
          ?.thongDiep ||
        (err instanceof Error ? err.message : "Không thể cập nhật hồ sơ bệnh nhân");
      notifyAuth("error", lang === "vi" ? "Lỗi cập nhật" : "Update error", msg);
    },
  });

  // Mutation đánh dấu đã đối chiếu giấy tờ
  const markVerifiedMutation = useMutation({
    mutationFn: async () => {
      if (!hoSoKham) throw new Error("Chưa chọn lượt khám");
      return consultationService.danhDauDaDoiChieu(hoSoKham.lichHen.id);
    },
    onSuccess: async () => {
      if (hoSoKham) {
        await moHoSoTheoId(hoSoKham.lichHen.id);
      }
      queryClient.invalidateQueries({ queryKey: ["consultation", "daily-patients"] });
      notifyAuth(
        "success",
        lang === "vi" ? "Đối chiếu giấy tờ" : "Identity verification",
        lang === "vi"
          ? "Đã xác nhận đối chiếu giấy tờ thành công"
          : "Identity verification confirmed",
      );
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { thongDiep?: string } } }).response?.data
          ?.thongDiep ||
        (err instanceof Error ? err.message : "Không thể đánh dấu đối chiếu");
      notifyAuth("error", lang === "vi" ? "Lỗi" : "Error", msg);
    },
  });

  // Mutation lưu kết quả khám (ghi mới hoặc cập nhật)
  const saveExamResultMutation = useMutation({
    mutationFn: async ({
      data,
      isEdit,
    }: {
      data: GhiKetQuaKhamRequest;
      isEdit: boolean;
    }) => {
      if (!hoSoKham) throw new Error("Chưa chọn lượt khám");
      const id = hoSoKham.lichHen.id;
      return isEdit
        ? consultationService.suaKetQuaKham(id, data)
        : consultationService.ghiKetQuaKham(id, data);
    },
    onSuccess: async (res) => {
      if (hoSoKham) {
        await moHoSoTheoId(hoSoKham.lichHen.id);
      }
      queryClient.invalidateQueries({ queryKey: ["consultation", "daily-patients"] });
      queryClient.invalidateQueries({ queryKey: ["booking", "doctor-hang-doi"] });
      queryClient.invalidateQueries({ queryKey: ["booking", "doctor-summary"] });
      notifyAuth(
        "success",
        lang === "vi" ? "Kết quả khám bệnh" : "Consultation result",
        res.thongDiep ||
          (lang === "vi" ? "Đã lưu kết quả khám bệnh" : "Consultation result saved"),
      );
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { thongDiep?: string } } }).response?.data
          ?.thongDiep ||
        (err instanceof Error ? err.message : "Không thể lưu kết quả khám");
      notifyAuth("error", lang === "vi" ? "Lỗi lưu bệnh án" : "EMR error", msg);
    },
  });

  // Tự động tải ban đầu nếu có id hoặc ma
  useEffect(() => {
    if (initialParams?.id) {
      moHoSoTheoId(initialParams.id);
    } else if (initialParams?.ma) {
      moHoSoTheoMa(initialParams.ma);
    }
  }, [initialParams?.id, initialParams?.ma, moHoSoTheoId, moHoSoTheoMa]);

  return {
    filters,
    setFilters,
    dailyPatients: dailyPatientsQuery.data?.duLieu ?? [],
    isLoadingDailyPatients: dailyPatientsQuery.isLoading,
    refetchDailyPatients: dailyPatientsQuery.refetch,

    hoSoKham,
    isLoadingHoSo,
    hoSoError,
    moHoSoTheoMa,
    moHoSoTheoId,
    dongHoSo,

    updatePatient: updatePatientMutation.mutateAsync,
    isUpdatingPatient: updatePatientMutation.isPending,

    markVerified: markVerifiedMutation.mutateAsync,
    isMarkingVerified: markVerifiedMutation.isPending,

    saveExamResult: (data: GhiKetQuaKhamRequest, isEdit: boolean) =>
      saveExamResultMutation.mutateAsync({ data, isEdit }),
    isSavingExamResult: saveExamResultMutation.isPending,

    selectedHistoryId,
    setSelectedHistoryId,
    lichSuSua: historyQuery.data?.duLieu as LichSuSuaBenhAnResponse | undefined,
    isLoadingLichSuSua: historyQuery.isLoading,
  };
}
