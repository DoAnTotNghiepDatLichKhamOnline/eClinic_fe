import { useState, type FormEvent, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  AlertCircle,
  FileDown,
  ArrowRightLeft,
  Check,
  X,
  Calendar,
  Building,
  ExternalLink,
  Users,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { doctorBookingService } from "@/services/booking/doctorBookingService";
import { doctorService } from "@/services/catalog/doctorService";
import { notifyAuth } from "@/utils/authNotification";
import { formatFullDateWithWeekday } from "@/utils/dateFormatting";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { CaLamViecResponse } from "@/types/booking.type";
import styles from "../../DoctorWorkspace.module.css";

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface DoctorScheduleSectionProps {
  viewMode?: "schedule" | "shift-requests";
}

const REQUEST_STATUS_CONFIG: Record<
  string,
  { labelVi: string; labelEn: string; className: string }
> = {
  CHO_DUYET: {
    labelVi: "Chờ phê duyệt",
    labelEn: "Pending Approval",
    className: styles.status_cho_duyet,
  },
  DA_DUYET: {
    labelVi: "Đã duyệt",
    labelEn: "Approved",
    className: styles.status_da_duyet,
  },
  TU_CHOI: {
    labelVi: "Quản lý từ chối",
    labelEn: "Declined",
    className: styles.status_tu_choi,
  },
  DA_RUT: {
    labelVi: "Đã rút đơn",
    labelEn: "Withdrawn",
    className: styles.status_da_rut,
  },
  DONG_NGHIEP_TU_CHOI: {
    labelVi: "Đồng nghiệp từ chối",
    labelEn: "Colleague Declined",
    className: styles.status_dong_nghiep_tu_choi,
  },
  CHO_DONG_Y: {
    labelVi: "Chờ đồng nghiệp duyệt",
    labelEn: "Pending Colleague",
    className: styles.status_cho_dong_y,
  },
  CHO_DONG_NGHIEP_DUYET: {
    labelVi: "Chờ đồng nghiệp duyệt",
    labelEn: "Pending Colleague",
    className: styles.status_cho_dong_y,
  },
};

export function DoctorScheduleSection({
  viewMode,
}: DoctorScheduleSectionProps = {}) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [scheduleView, setScheduleView] = useState<"day" | "week">("week");
  const [scheduleDate, setScheduleDate] = useState(() => new Date());
  const [selectedShiftForDrawer, setSelectedShiftForDrawer] =
    useState<CaLamViecResponse | null>(null);

  const [requestMode, setRequestMode] = useState<"SINGLE" | "MULTI">("SINGLE");
  const [requestType, setRequestType] = useState<
    "XIN_NGHI" | "DOI_CA" | "NHUONG_CA"
  >("XIN_NGHI");
  const [selectedShiftId, setSelectedShiftId] = useState<number | "">(() => {
    const param = searchParams.get("shiftId");
    return param ? Number(param) : "";
  });
  const [selectedColleagueId, setSelectedColleagueId] = useState<number | "">("");
  const [selectedMultiShifts, setSelectedMultiShifts] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [confirmWithdrawId, setConfirmWithdrawId] = useState<number | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [confirmTransferAction, setConfirmTransferAction] = useState<{
    id: number | string;
    type: "ACCEPT" | "DECLINE";
  } | null>(null);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  useEffect(() => {
    const shiftIdParam = searchParams.get("shiftId");
    if (shiftIdParam) {
      setSelectedShiftId(Number(shiftIdParam));
    }
  }, [searchParams]);

  const scheduleFrom = formatDateKey(
    new Date(scheduleDate.getTime() - 7 * 86_400_000),
  );
  const scheduleTo = formatDateKey(
    new Date(scheduleDate.getTime() + 14 * 86_400_000),
  );

  const { data: shiftsResponse, isLoading: isLoadingShifts } = useQuery({
    queryKey: ["booking", "doctor-shifts", scheduleFrom, scheduleTo],
    queryFn: () =>
      doctorBookingService.getLichTuanBacSi({
        tuNgay: scheduleFrom,
        denNgay: scheduleTo,
      }),
  });

  const { data: calendarAppointmentsResponse } = useQuery({
    queryKey: [
      "booking",
      "doctor-calendar-appointments",
      scheduleFrom,
      scheduleTo,
    ],
    queryFn: () =>
      doctorBookingService.getLichHenLichBacSi({
        tuNgay: scheduleFrom,
        denNgay: scheduleTo,
      }),
    enabled: viewMode !== "shift-requests",
  });

  const { data: ownShiftRequestsResponse } = useQuery({
    queryKey: ["booking", "doctor-shift-requests"],
    queryFn: () =>
      doctorBookingService.getYeuCauDoiLichBacSi({ trang: 0, kichThuoc: 100 }),
    enabled: viewMode !== "schedule",
  });

  const { data: transferredShiftsResponse } = useQuery({
    queryKey: ["booking", "doctor-transferred-shifts"],
    queryFn: () =>
      doctorBookingService.getYeuCauNhuongCaBacSi().catch(() => ({
        duLieu: { noiDung: [] },
      })),
    enabled: viewMode !== "schedule",
  });

  const { data: doctorsResponse } = useQuery({
    queryKey: ["catalog", "doctors-selection"],
    queryFn: () => doctorService.getDanhSachBacSi({ kichThuoc: 100 }),
    enabled: viewMode !== "schedule",
  });

  const shifts = shiftsResponse?.duLieu ?? [];
  const calendarAppointments = calendarAppointmentsResponse?.duLieu ?? [];
  const ownShiftRequests = ownShiftRequestsResponse?.duLieu?.noiDung ?? [];
  const transferredShifts =
    (transferredShiftsResponse?.duLieu as any)?.noiDung ?? [];
  const doctors = doctorsResponse?.duLieu?.noiDung ?? [];

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const data = await doctorBookingService.xuatPdfLichLamViecBacSi({
        tuNgay: scheduleFrom,
        denNgay: scheduleTo,
      });
      if (data instanceof Blob) {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lich-lam-viec-${scheduleFrom}-${scheduleTo}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        window.print();
      }
      notifyAuth(
        "success",
        lang === "vi" ? "Xuất lịch thành công" : "Export successful",
        lang === "vi"
          ? "Tệp PDF lịch làm việc đã sẵn sàng để tải hoặc in."
          : "Work schedule PDF is ready.",
      );
    } catch {
      window.print();
      notifyAuth(
        "info",
        lang === "vi" ? "In lịch làm việc" : "Print schedule",
        lang === "vi"
          ? "Mở hộp thoại in lịch làm việc trực tiếp trên trình duyệt."
          : "Opened browser print dialog.",
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  const executeWithdraw = async () => {
    if (!confirmWithdrawId) return;
    try {
      setIsWithdrawing(true);
      await doctorBookingService.rutYeuCauDoiLichBacSi(confirmWithdrawId);
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-shift-requests"],
      });
      notifyAuth(
        "info",
        lang === "vi" ? "Đã rút yêu cầu" : "Request withdrawn",
        lang === "vi"
          ? "Yêu cầu đổi lịch đã được rút lại thành công."
          : "Shift change request withdrawn.",
      );
    } catch (error: any) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể rút yêu cầu" : "Could not withdraw request",
        error?.response?.data?.thongDiep ?? "Request failed",
      );
    } finally {
      setIsWithdrawing(false);
      setConfirmWithdrawId(null);
    }
  };

  const handleProcessTransfer = async () => {
    if (!confirmTransferAction) return;
    try {
      setIsProcessingTransfer(true);
      if (confirmTransferAction.type === "ACCEPT") {
        await doctorBookingService.dongYNhuongCaBacSi(confirmTransferAction.id);
        notifyAuth(
          "success",
          lang === "vi" ? "Đã nhận ca" : "Shift accepted",
          lang === "vi"
            ? "Bạn đã đồng ý nhận ca trực từ đồng nghiệp."
            : "Transferred shift accepted.",
        );
      } else {
        await doctorBookingService.tuChoiNhuongCaBacSi(
          confirmTransferAction.id,
        );
        notifyAuth(
          "info",
          lang === "vi" ? "Đã từ chối" : "Shift declined",
          lang === "vi"
            ? "Đã từ chối nhận ca trực nhường."
            : "Transferred shift declined.",
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-transferred-shifts"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-shifts"],
      });
    } catch (err: any) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thao tác thất bại" : "Action failed",
        err?.response?.data?.thongDiep ?? "Failed to process transferred shift",
      );
    } finally {
      setIsProcessingTransfer(false);
      setConfirmTransferAction(null);
    }
  };

  const weekStart = new Date(scheduleDate);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const calendarDays = Array.from(
    { length: scheduleView === "day" ? 1 : 7 },
    (_, index) => {
      const date = new Date(scheduleView === "day" ? scheduleDate : weekStart);
      if (scheduleView === "week") date.setDate(date.getDate() + index);
      return date;
    },
  );

  const calendarTitle =
    scheduleView === "day"
      ? formatFullDateWithWeekday(scheduleDate, lang)
      : new Intl.DateTimeFormat(lang, {
          month: "long",
          year: "numeric",
        }).format(scheduleDate);

  // Calculate week stats
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
  const shiftsInWeek = shifts.filter((s) => {
    const d = new Date(s.ngay);
    return d >= weekStart && d < weekEnd;
  });
  const totalHoursInWeek = shiftsInWeek.reduce((sum, s) => {
    const [sh, sm] = (s.gioBatDau || "08:00").split(":").map(Number);
    const [eh, em] = (s.gioKetThuc || "11:30").split(":").map(Number);
    const diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
    return sum + Math.max(0, diff / 60);
  }, 0);

  const moveCalendar = (direction: number) => {
    setScheduleDate((current) => {
      const next = new Date(current);
      next.setDate(
        next.getDate() + direction * (scheduleView === "day" ? 1 : 7),
      );
      return next;
    });
  };

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const minDateStr = formatDateKey(tomorrow);
  const maxDateLimit = new Date();
  maxDateLimit.setDate(maxDateLimit.getDate() + 42);
  const maxDateStr = formatDateKey(maxDateLimit);

  const submitShiftRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    const form = event.currentTarget;
    const formData = new FormData(form);
    const reason = String(formData.get("reason") || "").trim();

    const newErrors: Record<string, string> = {};

    if (!reason) {
      newErrors.reason =
        lang === "vi" ? "Vui lòng nhập lý do." : "Please enter a reason.";
    } else if (reason.length > 1000) {
      newErrors.reason =
        lang === "vi"
          ? "Lý do không được vượt quá 1000 ký tự."
          : "Reason must not exceed 1000 characters.";
    }

    if (requestMode === "MULTI") {
      if (selectedMultiShifts.length === 0) {
        newErrors.multiShifts =
          lang === "vi"
            ? "Vui lòng chọn ít nhất 1 ca để xin nghỉ."
            : "Please select at least one shift.";
      }

      if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        return;
      }

      try {
        setIsSubmittingRequest(true);
        const results = await Promise.allSettled(
          selectedMultiShifts.map((sId) =>
            doctorBookingService.guiYeuCauDoiLich({
              idLichLamViec: sId,
              loaiYeuCau: "XIN_NGHI",
              lyDo: reason,
            }),
          ),
        );

        const succeeded = results.filter(
          (r) => r.status === "fulfilled",
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        form.reset();
        setSelectedMultiShifts([]);
        setFormErrors({});
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-shift-requests"],
        });

        if (succeeded > 0) {
          notifyAuth(
            "success",
            lang === "vi" ? "Đã gửi yêu cầu nghỉ" : "Leave request submitted",
            lang === "vi"
              ? `Đã gửi thành công yêu cầu xin nghỉ cho ${succeeded} ca.${failed > 0 ? ` (${failed} ca thất bại)` : ""}`
              : `Successfully submitted leave request for ${succeeded} shifts.${failed > 0 ? ` (${failed} failed)` : ""}`,
          );
        } else {
          notifyAuth(
            "error",
            lang === "vi"
              ? "Gửi yêu cầu thất bại"
              : "Request submission failed",
            lang === "vi"
              ? "Không thể gửi yêu cầu xin nghỉ cho các ca đã chọn."
              : "Failed to submit leave request for selected shifts.",
          );
        }
      } catch (error: any) {
        const msg =
          error?.response?.data?.thongDiep ||
          (error instanceof Error ? error.message : "Request failed");
        notifyAuth(
          "error",
          lang === "vi" ? "Gửi yêu cầu thất bại" : "Request submission failed",
          msg,
        );
      } finally {
        setIsSubmittingRequest(false);
      }
      return;
    }

    const shiftId = Number(formData.get("idLichLamViec") || selectedShiftId);
    const currentShift = shifts.find(
      (shift) => Number((shift as any).idLichLamViec ?? shift.id) === shiftId,
    );

    if (!shiftId || !currentShift) {
      newErrors.idLichLamViec =
        lang === "vi" ? "Vui lòng chọn ca làm việc." : "Please choose a shift.";
    } else {
      if (currentShift.trangThai !== "HOAT_DONG") {
        newErrors.idLichLamViec =
          lang === "vi"
            ? "Ca làm việc này không thể chỉnh sửa."
            : "This shift cannot be modified.";
      }
      const shiftStart = new Date(
        `${currentShift.ngay}T${currentShift.gioBatDau}`,
      );
      const now = Date.now();
      if (shiftStart.getTime() < now + 24 * 60 * 60 * 1000) {
        newErrors.idLichLamViec =
          lang === "vi"
            ? "Ca làm việc này bắt đầu trong vòng 24 giờ tới, đã quá hạn gửi yêu cầu (theo quy định bệnh viện)."
            : "This shift starts within 24 hours. Request submission deadline has passed.";
      }
      const hasPending = ownShiftRequests.some(
        (req: any) =>
          ((req.lichLamViec &&
            (req.lichLamViec.idLichLamViec === shiftId ||
              req.lichLamViec.id === shiftId)) ||
            (req.ca &&
              (req.ca.idLichLamViec === shiftId || req.ca.id === shiftId)) ||
            req.idLichLamViec === shiftId) &&
          (req.trangThai === "CHO_DUYET" || req.trangThai === "CHO_DONG_Y"),
      );
      if (hasPending) {
        newErrors.idLichLamViec =
          lang === "vi"
            ? "Ca làm việc này đã có yêu cầu đổi lịch đang chờ duyệt."
            : "This shift already has a pending request.";
      }
    }

    let ngayMongMuon: string | undefined;
    let gioBatDauMongMuon: string | undefined;
    let gioKetThucMongMuon: string | undefined;
    let idPhongKhamMongMuon: number | undefined;
    let idBacSiNhan: number | undefined;

    if (requestType === "DOI_CA") {
      ngayMongMuon = String(formData.get("ngayMongMuon") || "");
      const rawStart = String(formData.get("gioBatDauMongMuon") || "");
      const rawEnd = String(formData.get("gioKetThucMongMuon") || "");
      gioBatDauMongMuon = rawStart
        ? rawStart.length === 5
          ? `${rawStart}:00`
          : rawStart
        : undefined;
      gioKetThucMongMuon = rawEnd
        ? rawEnd.length === 5
          ? `${rawEnd}:00`
          : rawEnd
        : undefined;
      const phongVal = formData.get("idPhongKhamMongMuon");
      idPhongKhamMongMuon = phongVal ? Number(phongVal) : undefined;
      const docVal = formData.get("idBacSiNhan");
      idBacSiNhan = docVal ? Number(docVal) : undefined;

      if (!ngayMongMuon) {
        newErrors.ngayMongMuon =
          lang === "vi"
            ? "Vui lòng chọn ngày mong muốn."
            : "Please choose requested date.";
      }

      if (!gioBatDauMongMuon) {
        newErrors.gioBatDauMongMuon =
          lang === "vi"
            ? "Vui lòng chọn giờ bắt đầu."
            : "Please choose start time.";
      }

      if (!gioKetThucMongMuon) {
        newErrors.gioKetThucMongMuon =
          lang === "vi"
            ? "Vui lòng chọn giờ kết thúc."
            : "Please choose end time.";
      } else if (gioBatDauMongMuon && gioKetThucMongMuon <= gioBatDauMongMuon) {
        newErrors.gioKetThucMongMuon =
          lang === "vi"
            ? "Giờ kết thúc mong muốn phải sau giờ bắt đầu mong muốn."
            : "Requested end time must be after start time.";
      }

      if (ngayMongMuon && gioBatDauMongMuon) {
        const targetStart = new Date(`${ngayMongMuon}T${gioBatDauMongMuon}`);
        const now = Date.now();
        if (targetStart.getTime() < now + 24 * 60 * 60 * 1000) {
          newErrors.ngayMongMuon =
            lang === "vi"
              ? "Ca mong muốn phải cách hiện tại ít nhất 24 giờ."
              : "Requested shift must be at least 24 hours in the future.";
        }
      }

      if (
        currentShift &&
        ngayMongMuon &&
        gioBatDauMongMuon &&
        gioKetThucMongMuon
      ) {
        const sameDate = ngayMongMuon === currentShift.ngay;
        const sameStart =
          gioBatDauMongMuon.slice(0, 5) === currentShift.gioBatDau.slice(0, 5);
        const sameEnd =
          gioKetThucMongMuon.slice(0, 5) ===
          currentShift.gioKetThuc.slice(0, 5);
        const currentRoomId =
          (currentShift.phongKham as any)?.id ??
          (currentShift.phongKham as any)?.idPhongKham ??
          (currentShift as any).idPhongKham;
        const sameRoom =
          !idPhongKhamMongMuon || idPhongKhamMongMuon === currentRoomId;

        if (sameDate && sameStart && sameEnd && sameRoom) {
          newErrors.ngayMongMuon =
            lang === "vi"
              ? "Ca mong muốn trùng hoàn toàn với ca hiện tại."
              : "Requested shift matches the current shift.";
        }
      }
    } else if (requestType === "NHUONG_CA") {
      const docVal = formData.get("idBacSiNhan");
      idBacSiNhan = docVal ? Number(docVal) : undefined;
      if (!idBacSiNhan) {
        newErrors.idBacSiNhan =
          lang === "vi"
            ? "Vui lòng chọn bác sĩ đồng nghiệp để nhường ca."
            : "Please select a colleague to transfer the shift.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setIsSubmittingRequest(true);
      const response = await doctorBookingService.guiYeuCauDoiLich({
        idLichLamViec: shiftId,
        loaiYeuCau: requestType,
        lyDo: reason,
        ...(requestType === "DOI_CA"
          ? {
              ngayMongMuon,
              gioBatDauMongMuon,
              gioKetThucMongMuon,
              idPhongKhamMongMuon,
              idBacSiNhan,
            }
          : {}),
        ...(requestType === "NHUONG_CA" ? { idBacSiNhan } : {}),
      });

      form.reset();
      setFormErrors({});
      setSelectedShiftId("");
      setSelectedColleagueId("");
      setRequestType("XIN_NGHI");
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-shift-requests"],
      });
      notifyAuth(
        "success",
        lang === "vi" ? "Đã gửi yêu cầu" : "Request submitted",
        response.thongDiep ||
          (lang === "vi"
            ? "Yêu cầu đã được gửi đến ban quản trị."
            : "Request has been submitted for review."),
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.thongDiep ||
        (error instanceof Error ? error.message : "Request failed");
      notifyAuth(
        "error",
        lang === "vi" ? "Gửi yêu cầu thất bại" : "Request submission failed",
        msg,
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const filteredRequests = ownShiftRequests.filter((req: any) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "CHO_DONG_Y") {
      return (
        req.trangThai === "CHO_DONG_Y" ||
        req.trangThai === "CHO_DONG_NGHIEP_DUYET"
      );
    }
    return req.trangThai === statusFilter;
  });

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>
            {viewMode === "shift-requests"
              ? lang === "vi"
                ? "Yêu cầu đổi / nghỉ ca"
                : "Shift Requests"
              : lang === "vi"
                ? "Lịch làm việc cá nhân"
                : "Personal Work Schedule"}
          </h1>
          <p>
            {viewMode === "shift-requests"
              ? lang === "vi"
                ? "Gửi đơn xin nghỉ, đổi ca hoặc nhường ca cho đồng nghiệp và theo dõi phê duyệt."
                : "Submit leave, shift change or transfer requests, and track approvals."
              : lang === "vi"
                ? "Xem ca trực được phân công và số lượng bệnh nhân đã đặt."
                : "Review your assigned duty shifts and confirmed patient bookings."}
          </p>
        </div>
        {viewMode !== "shift-requests" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isExportingPdf ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <FileDown size={15} />
              )}
              <span>{lang === "vi" ? "Xuất PDF" : "Export PDF"}</span>
            </button>
            <div
              className={styles.segmented}
              role="group"
              aria-label={lang === "vi" ? "Chế độ xem lịch" : "Schedule view"}
            >
              <button
                type="button"
                className={scheduleView === "day" ? styles.selected : ""}
                aria-pressed={scheduleView === "day"}
                onClick={() => setScheduleView("day")}
              >
                {lang === "vi" ? "Ngày" : "Day"}
              </button>
              <button
                type="button"
                className={scheduleView === "week" ? styles.selected : ""}
                aria-pressed={scheduleView === "week"}
                onClick={() => setScheduleView("week")}
              >
                {lang === "vi" ? "Tuần" : "Week"}
              </button>
            </div>
          </div>
        )}
      </div>

      {viewMode !== "shift-requests" && (
        <section
          className={styles.calendar}
          aria-label={lang === "vi" ? "Lịch làm việc" : "Work calendar"}
        >
          <div className={styles.calendarToolbar}>
            <div className={styles.calendarNavigation}>
              <button
                type="button"
                onClick={() => moveCalendar(-1)}
                aria-label={
                  lang === "vi" ? "Khoảng thời gian trước" : "Previous period"
                }
              >
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setScheduleDate(new Date())}>
                {lang === "vi" ? "Hôm nay" : "Today"}
              </button>
              <button
                type="button"
                onClick={() => moveCalendar(1)}
                aria-label={
                  lang === "vi" ? "Khoảng thời gian tiếp theo" : "Next period"
                }
              >
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0 }}>{calendarTitle}</h2>
              {scheduleView === "week" && (
                <span className={styles.weekSummaryBadge}>
                  {shiftsInWeek.length}{" "}
                  {lang === "vi" ? "ca trực" : "shifts"} ·{" "}
                  {totalHoursInWeek % 1 === 0
                    ? totalHoursInWeek
                    : totalHoursInWeek.toFixed(1)}{" "}
                  {lang === "vi" ? "giờ trực" : "hours"}
                </span>
              )}
            </div>
          </div>

          <div
            className={`${styles.calendarGrid} ${scheduleView === "day" ? styles.calendarDay : ""}`}
          >
            {calendarDays.map((date) => {
              const shiftDateKey = formatDateKey(date);
              const dayShifts = shifts.filter(
                (shift) => shift.ngay === shiftDateKey,
              );
              const dayAppointments = calendarAppointments.filter(
                (appointment) => appointment.ngay === shiftDateKey,
              );
              const dayLabel = new Intl.DateTimeFormat(lang, {
                weekday: "short",
              }).format(date);
              const dateLabel = new Intl.DateTimeFormat(lang, {
                day: "numeric",
                month: "short",
              }).format(date);

              return (
                <div
                  className={`${styles.calendarDayCell} ${isToday(date) ? styles.calendarToday : ""}`}
                  key={date.toISOString()}
                  onClick={() => {
                    setScheduleDate(date);
                    setScheduleView("day");
                  }}
                  role="region"
                  aria-label={`${dayLabel} ${dateLabel}`}
                  style={{ cursor: "pointer" }}
                >
                  <span className={styles.calendarDayName}>{dayLabel}</span>
                  <strong className={styles.calendarDate}>
                    {date.getDate()}
                  </strong>
                  {isLoadingShifts ? (
                    <span className={styles.calendarOff}>
                      {lang === "vi" ? "Đang tải..." : "Loading..."}
                    </span>
                  ) : dayShifts.length ? (
                    <div className={styles.calendarShiftsWrapper}>
                      {dayShifts.map((shift) => {
                        const sid = Number(
                          (shift as any).idLichLamViec ?? shift.id,
                        );
                        const isMorning =
                          shift.buoi === "SANG" ||
                          parseInt(shift.gioBatDau.slice(0, 2), 10) < 12;
                        const shiftCardClass = isMorning
                          ? styles.calendarShiftMorning
                          : styles.calendarShiftAfternoon;
                        const roomName =
                          shift.phongKham?.tenPhong ||
                          (shift as any).tenPhongKham ||
                          shift.tenChuyenKhoa ||
                          (lang === "vi" ? "Phòng khám" : "Clinic");
                        const booked =
                          shift.soChoDaDat ?? shift.soLuotDaDat ?? 0;
                        const total =
                          shift.tongSoCho ?? shift.tongSoLuot ?? 0;
                        const percent =
                          total > 0
                            ? Math.min(100, Math.round((booked / total) * 100))
                            : 0;

                        return (
                          <div
                            key={sid}
                            className={`${styles.calendarShiftCard} ${shiftCardClass}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShiftForDrawer(shift);
                            }}
                            title={
                              lang === "vi"
                                ? "Nhấp để xem chi tiết ca trực"
                                : "Click to view shift details"
                            }
                          >
                            <span className={styles.calendarShiftTime}>
                              <Clock3 size={11} aria-hidden="true" />
                              {shift.gioBatDau.slice(0, 5)} -{" "}
                              {shift.gioKetThuc.slice(0, 5)}
                            </span>
                            <span className={styles.calendarShiftRoom}>
                              {roomName}
                            </span>
                            <div className={styles.shiftProgressBar}>
                              <div
                                className={styles.shiftProgressFill}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <small
                              style={{
                                fontSize: "9px",
                                marginTop: "1px",
                                opacity: 0.85,
                              }}
                            >
                              {booked}/{total} {lang === "vi" ? "ca" : "slots"}
                            </small>
                          </div>
                        );
                      })}
                      {dayAppointments.length > 0 && (
                        <div style={{ marginTop: "4px" }}>
                          {dayAppointments.map((appointment) => (
                            <small
                              key={appointment.maPhieuKham}
                              style={{
                                display: "block",
                                fontSize: "9px",
                                color: "#475569",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {appointment.gioKhamDuKien} ·{" "}
                              {appointment.hoTenBenhNhan}
                            </small>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className={styles.calendarOff}>
                      {lang === "vi" ? "Không có ca" : "No shift"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2-Column Layout for Shift Requests */}
      {viewMode !== "schedule" && (
        <div className={styles.shiftRequests2Col}>
          {/* Left Column (60%): Transferred Shifts + Submitted Requests History */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Transferred shifts section */}
            {transferredShifts.length > 0 && (
              <section
                className={styles.panel}
                style={{
                  borderLeft: "4px solid #10b981",
                  background: "#f0fdf4",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <ArrowRightLeft size={18} className="text-emerald-600" />
                  <h2 style={{ margin: 0, color: "#065f46" }}>
                    {lang === "vi"
                      ? "Ca trực được nhường từ đồng nghiệp"
                      : "Shifts Transferred From Colleagues"}
                  </h2>
                </div>
                <div className={styles.requestList}>
                  {transferredShifts.map((req: any) => (
                    <article className={styles.requestItem} key={req.id}>
                      <div>
                        <strong>
                          {req.ca?.ngay} · {req.ca?.gioBatDau?.slice(0, 5)} -{" "}
                          {req.ca?.gioKetThuc?.slice(0, 5)}
                          {req.bacSiNhuong?.hoTen
                            ? ` (${lang === "vi" ? "Từ BS" : "From Dr"}. ${req.bacSiNhuong.hoTen})`
                            : ""}
                        </strong>
                        <p>
                          {req.lyDo ||
                            (lang === "vi"
                              ? "Không có ghi chú thêm"
                              : "No additional note")}
                        </p>
                      </div>
                      <div className={styles.requestActions}>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          onClick={() =>
                            setConfirmTransferAction({
                              id: req.id,
                              type: "ACCEPT",
                            })
                          }
                        >
                          <Check size={14} />
                          <span>{lang === "vi" ? "Nhận ca" : "Accept"}</span>
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          onClick={() =>
                            setConfirmTransferAction({
                              id: req.id,
                              type: "DECLINE",
                            })
                          }
                        >
                          <X size={14} />
                          <span>{lang === "vi" ? "Từ chối" : "Decline"}</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Submitted requests panel */}
            <section className={styles.panel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h2 style={{ margin: 0 }}>
                  {lang === "vi" ? "Lịch sử đơn đã gửi" : "Submitted requests"}
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {filteredRequests.length}{" "}
                  {lang === "vi" ? "yêu cầu" : "requests"}
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className={styles.requestFilterTabs}>
                {[
                  { key: "ALL", labelVi: "Tất cả", labelEn: "All" },
                  {
                    key: "CHO_DUYET",
                    labelVi: "Chờ phê duyệt",
                    labelEn: "Pending Approval",
                  },
                  {
                    key: "CHO_DONG_Y",
                    labelVi: "Chờ đồng nghiệp",
                    labelEn: "Pending Colleague",
                  },
                  {
                    key: "DA_DUYET",
                    labelVi: "Đã duyệt",
                    labelEn: "Approved",
                  },
                  {
                    key: "TU_CHOI",
                    labelVi: "Từ chối",
                    labelEn: "Declined",
                  },
                  {
                    key: "DA_RUT",
                    labelVi: "Đã rút",
                    labelEn: "Withdrawn",
                  },
                  {
                    key: "DONG_NGHIEP_TU_CHOI",
                    labelVi: "Đồng nghiệp từ chối",
                    labelEn: "Colleague Declined",
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${styles.requestFilterTab} ${statusFilter === tab.key ? styles.requestFilterTabActive : ""}`}
                    onClick={() => setStatusFilter(tab.key)}
                  >
                    {lang === "vi" ? tab.labelVi : tab.labelEn}
                  </button>
                ))}
              </div>

              <div className={styles.requestList}>
                {filteredRequests.length ? (
                  filteredRequests.map((request: any) => {
                    const statusConfig =
                      REQUEST_STATUS_CONFIG[request.trangThai] || {
                        labelVi: request.trangThai,
                        labelEn: request.trangThai,
                        className: styles.status,
                      };

                    const canWithdraw =
                      request.trangThai === "CHO_DUYET" ||
                      request.trangThai === "CHO_DONG_Y" ||
                      request.trangThai === "CHO_DONG_NGHIEP_DUYET";

                    return (
                      <article className={styles.requestItem} key={request.id}>
                        <div>
                          <strong>
                            {request.loaiYeuCau === "DOI_CA"
                              ? lang === "vi"
                                ? "Đổi ca"
                                : "Shift change"
                              : request.loaiYeuCau === "NHUONG_CA"
                                ? lang === "vi"
                                  ? "Nhường ca"
                                  : "Transfer shift"
                                : lang === "vi"
                                  ? "Xin nghỉ"
                                  : "Leave"}{" "}
                            · {request.ngayMongMuon ?? request.ngay}
                            {request.bacSiNhan && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#0369a1",
                                  marginLeft: "6px",
                                }}
                              >
                                (
                                {lang === "vi"
                                  ? `Đến BS. ${request.bacSiNhan.hoTen}`
                                  : `To Dr. ${request.bacSiNhan.hoTen}`}
                                )
                              </span>
                            )}
                          </strong>
                          <p>{request.lyDo}</p>
                        </div>
                        <div className={styles.requestActions}>
                          <span
                            className={`${styles.status} ${statusConfig.className}`}
                          >
                            {lang === "vi"
                              ? statusConfig.labelVi
                              : statusConfig.labelEn}
                          </span>
                          {canWithdraw && (
                            <button
                              type="button"
                              className={styles.secondaryButton}
                              onClick={() => setConfirmWithdrawId(request.id)}
                            >
                              {lang === "vi" ? "Rút yêu cầu" : "Withdraw"}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className={styles.emptyNotice}>
                    {lang === "vi"
                      ? "Không có yêu cầu nào phù hợp bộ lọc."
                      : "No shift requests match the selected filter."}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column (40% - Sticky Form): Đăng ký đổi ca / Xin nghỉ */}
          <div className={styles.stickyFormWrapper}>
            <section className={styles.panel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <h2 style={{ margin: 0 }}>
                  {lang === "vi"
                    ? "Đăng ký đổi ca / Xin nghỉ"
                    : "Request shift change / Leave"}
                </h2>
                <div className={styles.segmented}>
                  <button
                    type="button"
                    className={requestMode === "SINGLE" ? styles.selected : ""}
                    onClick={() => setRequestMode("SINGLE")}
                  >
                    {lang === "vi" ? "Đơn lẻ" : "Single shift"}
                  </button>
                  <button
                    type="button"
                    className={requestMode === "MULTI" ? styles.selected : ""}
                    onClick={() => setRequestMode("MULTI")}
                  >
                    {lang === "vi" ? "Nhiều ca" : "Multi"}
                  </button>
                </div>
              </div>

              <p className={styles.readOnlyNote}>
                {lang === "vi"
                  ? "Yêu cầu phải được gửi trước ca trực ít nhất 24 giờ để Quản trị viên kịp phê duyệt."
                  : "Requests must be submitted at least 24 hours in advance for admin approval."}
              </p>

              <form
                className={styles.formGrid}
                onSubmit={(e) => void submitShiftRequest(e)}
              >
                {requestMode === "SINGLE" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <label>
                      {lang === "vi" ? "Chọn ca cần đổi/nghỉ" : "Choose shift"}
                      <select
                        name="idLichLamViec"
                        required
                        value={selectedShiftId}
                        aria-invalid={Boolean(formErrors.idLichLamViec)}
                        onChange={(e) => {
                          setSelectedShiftId(
                            e.target.value ? Number(e.target.value) : "",
                          );
                          if (formErrors.idLichLamViec) {
                            setFormErrors((prev) => ({
                              ...prev,
                              idLichLamViec: "",
                            }));
                          }
                        }}
                      >
                        <option value="" disabled>
                          {lang === "vi" ? "-- Chọn ca trực --" : "-- Select shift --"}
                        </option>
                        {shifts
                          .filter((shift) => shift.trangThai === "HOAT_DONG")
                          .map((shift) => {
                            const sid = Number(
                              (shift as any).idLichLamViec ?? shift.id,
                            );
                            const roomName =
                              shift.phongKham?.tenPhong ||
                              (shift as any).tenPhongKham ||
                              shift.tenChuyenKhoa ||
                              (lang === "vi" ? "Phòng khám" : "Clinic");
                            return (
                              <option key={sid} value={sid}>
                                {shift.ngay} · {shift.gioBatDau.slice(0, 5)}-
                                {shift.gioKetThuc.slice(0, 5)} · {roomName}
                              </option>
                            );
                          })}
                      </select>
                      {formErrors.idLichLamViec && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{formErrors.idLichLamViec}</span>
                        </p>
                      )}
                    </label>

                    <label>
                      {lang === "vi" ? "Loại yêu cầu" : "Request type"}
                      <select
                        name="loaiYeuCau"
                        value={requestType}
                        onChange={(e) =>
                          setRequestType(
                            e.target.value as
                              | "XIN_NGHI"
                              | "DOI_CA"
                              | "NHUONG_CA",
                          )
                        }
                      >
                        <option value="XIN_NGHI">
                          {lang === "vi" ? "Xin nghỉ ca" : "Leave shift"}
                        </option>
                        <option value="DOI_CA">
                          {lang === "vi"
                            ? "Đổi ca làm việc"
                            : "Change shift"}
                        </option>
                        <option value="NHUONG_CA">
                          {lang === "vi"
                            ? "Nhường ca cho đồng nghiệp"
                            : "Transfer shift to colleague"}
                        </option>
                      </select>
                    </label>

                    {requestType === "DOI_CA" && (
                      <>
                        <label>
                          {lang === "vi" ? "Ngày mong muốn" : "Requested date"}
                          <input
                            name="ngayMongMuon"
                            type="date"
                            required
                            min={minDateStr}
                            max={maxDateStr}
                            defaultValue={minDateStr}
                            aria-invalid={Boolean(formErrors.ngayMongMuon)}
                            onChange={() => {
                              if (formErrors.ngayMongMuon) {
                                setFormErrors((prev) => ({
                                  ...prev,
                                  ngayMongMuon: "",
                                }));
                              }
                            }}
                          />
                          {formErrors.ngayMongMuon && (
                            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                              <AlertCircle size={13} className="shrink-0" />
                              <span>{formErrors.ngayMongMuon}</span>
                            </p>
                          )}
                        </label>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                          }}
                        >
                          <label>
                            {lang === "vi"
                              ? "Giờ bắt đầu"
                              : "Start time"}
                            <input
                              name="gioBatDauMongMuon"
                              type="time"
                              required
                              defaultValue="08:00"
                              aria-invalid={Boolean(formErrors.gioBatDauMongMuon)}
                              onChange={() => {
                                if (formErrors.gioBatDauMongMuon) {
                                  setFormErrors((prev) => ({
                                    ...prev,
                                    gioBatDauMongMuon: "",
                                  }));
                                }
                              }}
                            />
                            {formErrors.gioBatDauMongMuon && (
                              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle size={13} className="shrink-0" />
                                <span>{formErrors.gioBatDauMongMuon}</span>
                              </p>
                            )}
                          </label>
                          <label>
                            {lang === "vi"
                              ? "Giờ kết thúc"
                              : "End time"}
                            <input
                              name="gioKetThucMongMuon"
                              type="time"
                              required
                              defaultValue="11:30"
                              aria-invalid={Boolean(
                                formErrors.gioKetThucMongMuon,
                              )}
                              onChange={() => {
                                if (formErrors.gioKetThucMongMuon) {
                                  setFormErrors((prev) => ({
                                    ...prev,
                                    gioKetThucMongMuon: "",
                                  }));
                                }
                              }}
                            />
                            {formErrors.gioKetThucMongMuon && (
                              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle size={13} className="shrink-0" />
                                <span>{formErrors.gioKetThucMongMuon}</span>
                              </p>
                            )}
                          </label>
                        </div>

                        <label>
                          {lang === "vi"
                            ? "Bác sĩ đồng nghiệp nhận đổi ca (tùy chọn)"
                            : "Colleague to exchange with (optional)"}
                          <select
                            name="idBacSiNhan"
                            value={selectedColleagueId}
                            onChange={(e) =>
                              setSelectedColleagueId(
                                e.target.value ? Number(e.target.value) : "",
                              )
                            }
                          >
                            <option value="">
                              {lang === "vi"
                                ? "-- Chọn đồng nghiệp (tùy chọn) --"
                                : "-- Choose colleague (optional) --"}
                            </option>
                            {doctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.hoTen} · {doc.tenChuyenKhoa || "Bác sĩ"}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          {lang === "vi"
                            ? "Mã phòng mong muốn (tùy chọn)"
                            : "Requested clinic ID (optional)"}
                          <input
                            name="idPhongKhamMongMuon"
                            type="number"
                            min={1}
                            placeholder={
                              lang === "vi"
                                ? "Giữ phòng hiện tại"
                                : "Keep current room"
                            }
                          />
                        </label>
                      </>
                    )}

                    {requestType === "NHUONG_CA" && (
                      <label>
                        {lang === "vi"
                          ? "Bác sĩ nhận nhường ca (bắt buộc)"
                          : "Recipient colleague (required)"}
                        <select
                          name="idBacSiNhan"
                          required
                          value={selectedColleagueId}
                          aria-invalid={Boolean(formErrors.idBacSiNhan)}
                          onChange={(e) => {
                            setSelectedColleagueId(
                              e.target.value ? Number(e.target.value) : "",
                            );
                            if (formErrors.idBacSiNhan) {
                              setFormErrors((prev) => ({
                                ...prev,
                                idBacSiNhan: "",
                              }));
                            }
                          }}
                        >
                          <option value="" disabled>
                            {lang === "vi"
                              ? "-- Chọn bác sĩ nhận ca --"
                              : "-- Select recipient doctor --"}
                          </option>
                          {doctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.hoTen} · {doc.tenChuyenKhoa || "Bác sĩ"}
                            </option>
                          ))}
                        </select>
                        {formErrors.idBacSiNhan && (
                          <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                            <AlertCircle size={13} className="shrink-0" />
                            <span>{formErrors.idBacSiNhan}</span>
                          </p>
                        )}
                      </label>
                    )}

                    <label>
                      {lang === "vi" ? "Lý do (bắt buộc)" : "Reason (required)"}
                      <textarea
                        name="reason"
                        rows={3}
                        required
                        maxLength={1000}
                        aria-invalid={Boolean(formErrors.reason)}
                        placeholder={
                          lang === "vi"
                            ? "Nhập lý do chi tiết..."
                            : "Enter reason..."
                        }
                        onChange={() => {
                          if (formErrors.reason) {
                            setFormErrors((prev) => ({ ...prev, reason: "" }));
                          }
                        }}
                      />
                      {formErrors.reason && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{formErrors.reason}</span>
                        </p>
                      )}
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className={styles.primaryButton}
                    >
                      {isSubmittingRequest ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin inline mr-1"
                          />
                          <span>
                            {lang === "vi" ? "Đang gửi..." : "Sending..."}
                          </span>
                        </>
                      ) : (
                        <span>
                          {lang === "vi" ? "Gửi yêu cầu" : "Submit request"}
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    <div>
                      <label
                        style={{
                          fontWeight: 600,
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        {lang === "vi"
                          ? "Chọn danh sách các ca xin nghỉ:"
                          : "Select shifts to request leave:"}
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: "8px",
                          maxHeight: "240px",
                          overflowY: "auto",
                          paddingRight: "4px",
                        }}
                      >
                        {shifts
                          .filter((shift) => shift.trangThai === "HOAT_DONG")
                          .map((shift) => {
                            const sid = Number(
                              (shift as any).idLichLamViec ?? shift.id,
                            );
                            const isChecked = selectedMultiShifts.includes(sid);
                            const roomName =
                              shift.phongKham?.tenPhong ||
                              (shift as any).tenPhongKham ||
                              shift.tenChuyenKhoa ||
                              (lang === "vi" ? "Phòng khám" : "Clinic");
                            return (
                              <label
                                key={sid}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "8px 12px",
                                  border: `1px solid ${isChecked ? "#10b981" : "#e2e8f0"}`,
                                  borderRadius: "8px",
                                  background: isChecked ? "#f0fdf4" : "#fff",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMultiShifts((prev) => [
                                        ...prev,
                                        sid,
                                      ]);
                                    } else {
                                      setSelectedMultiShifts((prev) =>
                                        prev.filter((id) => id !== sid),
                                      );
                                    }
                                    if (formErrors.multiShifts) {
                                      setFormErrors((prev) => ({
                                        ...prev,
                                        multiShifts: "",
                                      }));
                                    }
                                  }}
                                />
                                <div>
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "12px",
                                    }}
                                  >
                                    {shift.ngay} · {shift.gioBatDau.slice(0, 5)}{" "}
                                    - {shift.gioKetThuc.slice(0, 5)}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#64748b",
                                    }}
                                  >
                                    {roomName}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                      </div>
                      {formErrors.multiShifts && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-2 font-medium">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{formErrors.multiShifts}</span>
                        </p>
                      )}
                    </div>

                    <label>
                      <span
                        style={{
                          fontWeight: 600,
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        {lang === "vi"
                          ? "Lý do xin nghỉ nhiều ca (bắt buộc):"
                          : "Reason for multi-shift leave (required):"}
                      </span>
                      <textarea
                        name="reason"
                        rows={3}
                        required
                        maxLength={1000}
                        aria-invalid={Boolean(formErrors.reason)}
                        placeholder={
                          lang === "vi"
                            ? "Nhập lý do xin nghỉ chuỗi ca làm việc..."
                            : "Enter reason for taking leave across multiple shifts..."
                        }
                        onChange={() => {
                          if (formErrors.reason) {
                            setFormErrors((prev) => ({ ...prev, reason: "" }));
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                        }}
                      />
                      {formErrors.reason && (
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{formErrors.reason}</span>
                        </p>
                      )}
                    </label>

                    <button
                      type="submit"
                      disabled={
                        isSubmittingRequest || selectedMultiShifts.length === 0
                      }
                      className={styles.primaryButton}
                      style={{ width: "fit-content" }}
                    >
                      {isSubmittingRequest ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin inline mr-1"
                          />
                          <span>
                            {lang === "vi" ? "Đang gửi..." : "Sending..."}
                          </span>
                        </>
                      ) : (
                        <span>
                          {lang === "vi"
                            ? `Gửi yêu cầu nghỉ (${selectedMultiShifts.length} ca)`
                            : `Submit leave request (${selectedMultiShifts.length} shifts)`}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </section>
          </div>
        </div>
      )}

      {/* Drawer: Chi tiết ca trực & danh sách bệnh nhân */}
      {selectedShiftForDrawer && (
        <div
          className={styles.drawerBackdrop}
          onClick={() => setSelectedShiftForDrawer(null)}
        >
          <div
            className={styles.drawerContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Chi tiết ca trực"
          >
            <div className={styles.drawerHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} className="text-teal-600" />
                <h3 className={styles.drawerTitle}>
                  {lang === "vi" ? "Chi tiết ca trực" : "Shift Details"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={() => setSelectedShiftForDrawer(null)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Shift info summary */}
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background:
                    selectedShiftForDrawer.buoi === "SANG" ||
                    parseInt(selectedShiftForDrawer.gioBatDau.slice(0, 2), 10) < 12
                      ? "#f0fdfa"
                      : "#fffbeb",
                  border: `1px solid ${
                    selectedShiftForDrawer.buoi === "SANG" ||
                    parseInt(selectedShiftForDrawer.gioBatDau.slice(0, 2), 10) < 12
                      ? "#ccfbf1"
                      : "#fef3c7"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "15px",
                      color: "#0f172a",
                    }}
                  >
                    {selectedShiftForDrawer.ngay}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background:
                        selectedShiftForDrawer.buoi === "SANG" ||
                        parseInt(
                          selectedShiftForDrawer.gioBatDau.slice(0, 2),
                          10,
                        ) < 12
                          ? "#0d9488"
                          : "#f59e0b",
                      color: "#ffffff",
                    }}
                  >
                    {selectedShiftForDrawer.buoi === "SANG" ||
                    parseInt(selectedShiftForDrawer.gioBatDau.slice(0, 2), 10) < 12
                      ? lang === "vi"
                        ? "Ca sáng"
                        : "Morning"
                      : lang === "vi"
                        ? "Ca chiều"
                        : "Afternoon"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#334155",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Clock3 size={14} className="text-slate-500" />
                    <span>
                      {selectedShiftForDrawer.gioBatDau.slice(0, 5)} -{" "}
                      {selectedShiftForDrawer.gioKetThuc.slice(0, 5)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Building size={14} className="text-slate-500" />
                    <span>
                      {selectedShiftForDrawer.phongKham?.tenPhong ||
                        (selectedShiftForDrawer as any).tenPhongKham ||
                        selectedShiftForDrawer.tenChuyenKhoa ||
                        (lang === "vi" ? "Phòng khám" : "Clinic")}
                    </span>
                  </div>
                </div>

                {/* Booking progress */}
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    <span>
                      {lang === "vi" ? "Tỷ lệ đặt lịch:" : "Booking progress:"}
                    </span>
                    <span>
                      {selectedShiftForDrawer.soChoDaDat ??
                        selectedShiftForDrawer.soLuotDaDat ??
                        0}{" "}
                      /{" "}
                      {selectedShiftForDrawer.tongSoCho ??
                        selectedShiftForDrawer.tongSoLuot ??
                        0}{" "}
                      {lang === "vi" ? "bệnh nhân" : "patients"}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "rgba(0,0,0,0.08)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "#0d9488",
                        width: `${
                          (selectedShiftForDrawer.tongSoCho ??
                            selectedShiftForDrawer.tongSoLuot ??
                            0) > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  ((selectedShiftForDrawer.soChoDaDat ??
                                    selectedShiftForDrawer.soLuotDaDat ??
                                    0) /
                                    (selectedShiftForDrawer.tongSoCho ??
                                      selectedShiftForDrawer.tongSoLuot ??
                                      1)) *
                                    100,
                                ),
                              )
                            : 0
                        }%`,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Booked Patients list */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "10px",
                  }}
                >
                  <Users size={16} className="text-slate-600" />
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: 0,
                      color: "#1e293b",
                    }}
                  >
                    {lang === "vi"
                      ? "Danh sách bệnh nhân đã đặt"
                      : "Booked Patients"}
                  </h4>
                </div>

                {calendarAppointments.filter(
                  (a) => a.ngay === selectedShiftForDrawer.ngay,
                ).length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {calendarAppointments
                      .filter((a) => a.ngay === selectedShiftForDrawer.ngay)
                      .map((appointment) => (
                        <div
                          key={appointment.maPhieuKham}
                          style={{
                            padding: "10px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            background: "#ffffff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "13px",
                                color: "#0f172a",
                              }}
                            >
                              {appointment.hoTenBenhNhan}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginTop: "2px",
                              }}
                            >
                              {lang === "vi" ? "Giờ khám:" : "Time:"}{" "}
                              {appointment.gioKhamDuKien} ·{" "}
                              {appointment.maPhieuKham}
                            </div>
                          </div>
                          {appointment.soThuTu && (
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                background: "#f1f5f9",
                                color: "#334155",
                                padding: "3px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              STT {appointment.soThuTu}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: "24px 0",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    {lang === "vi"
                      ? "Chưa có bệnh nhân nào đặt trước trong ca này."
                      : "No patients have booked this shift yet."}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                style={{ flex: 1 }}
                onClick={() => {
                  const sid = Number(
                    (selectedShiftForDrawer as any).idLichLamViec ??
                      selectedShiftForDrawer.id,
                  );
                  setSelectedShiftForDrawer(null);
                  if (viewMode === "shift-requests") {
                    setSelectedShiftId(sid);
                  } else {
                    navigate(`/doctor/shift-requests?shiftId=${sid}`);
                  }
                }}
              >
                {lang === "vi" ? "Yêu cầu đổi/nghỉ ca" : "Request shift change"}
              </button>

              {isToday(new Date(selectedShiftForDrawer.ngay)) && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onClick={() => {
                    setSelectedShiftForDrawer(null);
                    navigate("/doctor/consultation");
                  }}
                >
                  <ExternalLink size={14} />
                  <span>
                    {lang === "vi" ? "Đến phòng khám" : "Go to Clinic"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog for Withdrawing Request */}
      <ConfirmDialog
        isOpen={confirmWithdrawId !== null}
        title={
          lang === "vi"
            ? "Xác nhận rút yêu cầu đổi lịch"
            : "Confirm withdraw request"
        }
        message={
          lang === "vi"
            ? "Bạn có chắc chắn muốn rút lại yêu cầu đổi ca / xin nghỉ này? Hành động này sẽ hủy yêu cầu đang chờ phê duyệt."
            : "Are you sure you want to withdraw this request? This action will cancel your pending submission."
        }
        confirmLabel={lang === "vi" ? "Rút yêu cầu" : "Withdraw"}
        cancelLabel={lang === "vi" ? "Hủy" : "Cancel"}
        variant="danger"
        isLoading={isWithdrawing}
        onConfirm={() => void executeWithdraw()}
        onCancel={() => setConfirmWithdrawId(null)}
      />

      {/* Confirm Dialog for Transferred Shift (Accept / Decline) */}
      <ConfirmDialog
        isOpen={confirmTransferAction !== null}
        title={
          confirmTransferAction?.type === "ACCEPT"
            ? lang === "vi"
              ? "Xác nhận nhận ca nhường"
              : "Confirm accept shift"
            : lang === "vi"
              ? "Xác nhận từ chối ca nhường"
              : "Confirm decline shift"
        }
        message={
          confirmTransferAction?.type === "ACCEPT"
            ? lang === "vi"
              ? "Bạn có chắc chắn muốn nhận ca trực này từ đồng nghiệp và được xếp lịch trực thay thế?"
              : "Are you sure you want to accept this shift transferred from your colleague?"
            : lang === "vi"
              ? "Bạn có chắc chắn muốn từ chối nhận ca trực này?"
              : "Are you sure you want to decline this transferred shift?"
        }
        confirmLabel={
          confirmTransferAction?.type === "ACCEPT"
            ? lang === "vi"
              ? "Đồng ý nhận"
              : "Accept"
            : lang === "vi"
              ? "Từ chối"
              : "Decline"
        }
        cancelLabel={lang === "vi" ? "Hủy" : "Cancel"}
        variant={
          confirmTransferAction?.type === "ACCEPT" ? "primary" : "danger"
        }
        isLoading={isProcessingTransfer}
        onConfirm={() => void handleProcessTransfer()}
        onCancel={() => setConfirmTransferAction(null)}
      />
    </section>
  );
}
