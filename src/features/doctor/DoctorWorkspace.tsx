import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import type QrScanner from "qr-scanner";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileHeart,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/bookingService";
import { catalogService } from "@/services/catalogService";
import { identityService } from "@/services/identityService";
import { notifyAuth } from "@/utils/authNotification";
import type { DoctorSection } from "./DoctorSidebar";
import styles from "./DoctorWorkspace.module.css";

type AppointmentStatus = "pending" | "accepted" | "declined" | "completed";

interface Appointment {
  id: string;
  patientName: string;
  age: number;
  phone: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  refusalReason?: string;
}

interface CompletedRecord {
  recordCode: string;
  appointmentCode: string;
  patientName: string;
  diagnosis: string;
  prescription: string;
  createdAt: string;
}

interface ConsultationLookup {
  lichHen: {
    id: number;
    maTraCuu: string;
    maPhieuKham: string;
    hoTenBenhNhan: string;
    ngay: string;
    gioKhamDuKien: string;
    trangThai: string;
    lyDoKham: string;
    doiChieu?: {
      canDoiChieu: boolean;
      hoTenDaNhap?: string;
      ngaySinhDaNhap?: string;
    };
  };
  hoSoBenhNhan: {
    id: number;
    hoTen: string;
    ngaySinh: string;
    tuoi: number;
    gioiTinh: string;
    soDienThoai: string;
    diaChi?: string | null;
    tienSuBenhLy?: string | null;
    soBaoHiemYTe?: string | null;
  };
  lanKhamTruoc: Array<{
    ngay: string;
    tenChuyenKhoa: string;
    hoTenBacSi: string;
    ketQua?: { chanDoan: string } | null;
  }>;
  ketQua?: {
    chanDoan: string;
    ghiChu?: string | null;
    ngayTaiKhamDeXuat?: string | null;
  } | null;
}

interface DoctorWorkspaceProps {
  activeSection: DoctorSection;
}

export function DoctorWorkspace({ activeSection }: DoctorWorkspaceProps) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [patientCode, setPatientCode] = useState("");
  const [patientLookup, setPatientLookup] = useState<Appointment | null>(null);
  const [lookupDetails, setLookupDetails] = useState<ConsultationLookup | null>(
    null,
  );
  const [medicationName, setMedicationName] = useState("");
  const [consultationError, setConsultationError] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [completedRecord, setCompletedRecord] =
    useState<CompletedRecord | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scheduleView, setScheduleView] = useState<"day" | "week">("week");
  const [scheduleDate, setScheduleDate] = useState(() => new Date());
  const videoRef = useRef<HTMLVideoElement>(null);

  const today = new Date();
  const formatDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const queryStart = new Date(scheduleDate);
  if (scheduleView === "week")
    queryStart.setDate(queryStart.getDate() - ((queryStart.getDay() + 6) % 7));
  const queryEnd = new Date(queryStart);
  if (scheduleView === "week") queryEnd.setDate(queryEnd.getDate() + 6);
  const scheduleFrom = formatDateKey(queryStart);
  const scheduleTo = formatDateKey(queryEnd);
  const { data: shiftsResponse, isLoading: isLoadingShifts } = useQuery({
    queryKey: ["booking", "doctor-shifts", scheduleFrom, scheduleTo],
    queryFn: () =>
      bookingService.getLichTuanBacSi({
        tuNgay: scheduleFrom,
        denNgay: scheduleTo,
      }),
    enabled: activeSection === "schedule",
  });
  const { data: calendarAppointmentsResponse } = useQuery({
    queryKey: [
      "booking",
      "doctor-calendar-appointments",
      scheduleFrom,
      scheduleTo,
    ],
    queryFn: () =>
      bookingService.getLichHenLichBacSi({
        tuNgay: scheduleFrom,
        denNgay: scheduleTo,
      }),
    enabled: activeSection === "schedule",
  });
  const { data: ownShiftRequestsResponse } = useQuery({
    queryKey: ["booking", "doctor-shift-requests"],
    queryFn: () =>
      bookingService.getYeuCauDoiLichBacSi({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "schedule",
  });
  const shifts = shiftsResponse?.duLieu ?? [];
  const calendarAppointments = calendarAppointmentsResponse?.duLieu ?? [];
  const ownShiftRequests = ownShiftRequestsResponse?.duLieu?.noiDung ?? [];
  const medicationQuery = useQuery({
    queryKey: ["medical", "doctor-medications", medicationName],
    queryFn: () => bookingService.getThuocGoiY(medicationName),
    enabled:
      activeSection === "consultation" && medicationName.trim().length >= 2,
  });
  const doctorAccountQuery = useQuery({
    queryKey: ["identity", "doctor-profile"],
    queryFn: () => identityService.getHoSoCaNhan(),
    enabled: activeSection === "profile",
  });
  const doctorId = doctorAccountQuery.data?.duLieu?.bacSi?.id;
  const doctorProfileQuery = useQuery({
    queryKey: ["catalog", "doctor-profile", doctorId],
    queryFn: () => catalogService.getChiTietBacSi(doctorId!),
    enabled: activeSection === "profile" && Boolean(doctorId),
  });
  const doctorProfile = doctorProfileQuery.data?.duLieu;
  const doctorAccount = doctorAccountQuery.data?.duLieu;
  const { data: requestResponse } = useQuery({
    queryKey: ["booking", "doctor-appointment-requests"],
    queryFn: () =>
      bookingService.getDanhSachYeuCauBacSi({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "appointments",
  });
  const appointments: Appointment[] = (
    requestResponse?.duLieu?.noiDung ?? []
  ).map((visit) => ({
    id: String(visit.id ?? visit.maTraCuu),
    time: `${visit.gioKhamDuKien} - ${visit.gioKetThucKhung}`,
    patientName: visit.hoTenBenhNhan,
    age: visit.ngaySinhBenhNhan
      ? today.getFullYear() - Number(visit.ngaySinhBenhNhan.slice(0, 4))
      : 0,
    phone: "",
    reason: visit.lyDoKham,
    status:
      visit.trangThai === "DA_XAC_NHAN"
        ? "accepted"
        : visit.trangThai === "DA_HOAN_THANH"
          ? "completed"
          : visit.trangThai === "BI_TU_CHOI"
            ? "declined"
            : "pending",
  }));

  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return;

    let scanner: QrScanner | undefined;
    let disposed = false;

    void import("qr-scanner")
      .then(({ default: QrScanner }) => {
        if (disposed || !videoRef.current) return;
        scanner = new QrScanner(
          videoRef.current,
          (result) => {
            const qrText = result.data;
            try {
              const decoded = JSON.parse(qrText) as {
                appointmentCode?: string;
              };
              setPatientCode(decoded.appointmentCode || qrText);
            } catch {
              setPatientCode(qrText);
            }
            scanner?.stop();
            setScannerOpen(false);
          },
          { preferredCamera: "environment" },
        );
        return scanner.start();
      })
      .catch(() => {
        if (!disposed) {
          setScannerOpen(false);
          notifyAuth(
            "error",
            lang === "vi" ? "Không thể mở camera" : "Camera unavailable",
            lang === "vi"
              ? "Kiểm tra quyền truy cập camera hoặc nhập mã phiếu thủ công."
              : "Check camera permission or enter the visit code manually.",
          );
        }
      });

    return () => {
      disposed = true;
      scanner?.stop();
      scanner?.destroy();
    };
  }, [scannerOpen, lang]);

  const acceptAppointment = async (appointmentId: string) => {
    try {
      await bookingService.xacNhanLichHenBacSi(Number(appointmentId));
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-appointment-requests"],
      });
    } catch (error) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể xác nhận" : "Could not accept",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ?? "Request failed",
      );
      return;
    }
    notifyAuth(
      "success",
      lang === "vi" ? "Đã xác nhận tiếp nhận" : "Appointment accepted",
      lang === "vi"
        ? `Lịch hẹn ${appointmentId} đã được xác nhận.`
        : `Appointment ${appointmentId} has been accepted.`,
    );
  };

  const rejectAppointment = async (
    event: FormEvent<HTMLFormElement>,
    appointmentId: string,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("rejectionReason") || "").trim();
    if (!reason) return;
    try {
      await bookingService.tuChoiLichHenBacSi(Number(appointmentId), {
        lyDo: reason,
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-appointment-requests"],
      });
    } catch (error) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể từ chối" : "Could not decline",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ?? "Request failed",
      );
      return;
    }
    setRejectingId(null);
    notifyAuth(
      "info",
      lang === "vi" ? "Đã từ chối lịch hẹn" : "Appointment declined",
      lang === "vi"
        ? `Lý do từ chối đã được lưu cho ${appointmentId}.`
        : `The reason was saved for ${appointmentId}.`,
    );
  };

  const lookupPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = patientCode.trim().toUpperCase();
    setConsultationError("");
    try {
      const response = await bookingService.traCuuHoSoKhamBacSi(normalizedCode);
      if (!response.thanhCong || !response.duLieu)
        throw new Error(response.thongDiep || "Visit not found");
      const details = response.duLieu as ConsultationLookup;
      setLookupDetails(details);
      setPatientLookup({
        id: String(details.lichHen.id),
        patientName: details.hoSoBenhNhan.hoTen,
        age: details.hoSoBenhNhan.tuoi,
        phone: details.hoSoBenhNhan.soDienThoai,
        time: details.lichHen.gioKhamDuKien,
        reason: details.lichHen.lyDoKham,
        status:
          details.lichHen.trangThai === "DA_HOAN_THANH"
            ? "completed"
            : details.lichHen.trangThai === "DA_XAC_NHAN"
              ? "accepted"
              : "pending",
      });
      setCompletedRecord(null);
      setDiagnosis(details.ketQua?.chanDoan ?? "");
      setPrescription(details.ketQua?.ghiChu ?? "");
      setMedicationName("");
    } catch (error) {
      setPatientLookup(null);
      setLookupDetails(null);
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error ? error.message : "Visit not found"),
      );
      notifyAuth(
        "error",
        lang === "vi" ? "Không tìm thấy phiếu khám" : "Visit not found",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (lang === "vi"
            ? "Kiểm tra mã tra cứu hoặc nội dung QR."
            : "Check the visit code or QR content."),
      );
    }
  };

  const savePatientIdentity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lookupDetails) return;
    const values = new FormData(event.currentTarget);
    try {
      const response = await bookingService.capNhatBenhNhanKhamBacSi(
        lookupDetails.lichHen.id,
        {
          hoTen: String(values.get("hoTen") || "").trim(),
          ngaySinh: String(values.get("ngaySinh") || ""),
          soDienThoai: String(values.get("soDienThoai") || "").trim(),
          gioiTinh: String(values.get("gioiTinh") || "NAM") as
            | "NAM"
            | "NU"
            | "KHAC",
          diaChi: String(values.get("diaChi") || "").trim() || undefined,
          cccd: String(values.get("cccd") || "").trim() || undefined,
        },
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await bookingService
        .traCuuHoSoKhamBacSi(lookupDetails.lichHen.maTraCuu)
        .then((result) => {
          if (result.duLieu)
            setLookupDetails(result.duLieu as ConsultationLookup);
        });
      notifyAuth(
        "success",
        lang === "vi" ? "Đã cập nhật hồ sơ" : "Patient details updated",
        response.thongDiep,
      );
    } catch (error) {
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : "Could not update patient details"),
      );
    }
  };

  const markIdentityChecked = async () => {
    if (!lookupDetails) return;
    try {
      const response = await bookingService.danhDauDaDoiChieuBacSi(
        lookupDetails.lichHen.id,
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      setLookupDetails({
        ...lookupDetails,
        lichHen: {
          ...lookupDetails.lichHen,
          doiChieu: { ...lookupDetails.lichHen.doiChieu, canDoiChieu: false },
        },
      });
    } catch (error) {
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : "Could not mark identity as checked"),
      );
    }
  };

  const completeConsultation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientLookup || !lookupDetails || !diagnosis.trim()) return;
    setConsultationError("");
    const selectedMedicine = (medicationQuery.data?.duLieu ?? []).find(
      (medicine) => medicine.tenThuoc === medicationName.trim(),
    );
    try {
      const response = await bookingService.ghiBenhAnBacSi(
        lookupDetails.lichHen.id,
        {
          chanDoan: diagnosis.trim(),
          ghiChu: prescription.trim() || undefined,
          donThuoc: selectedMedicine
            ? [
                {
                  tenThuoc: selectedMedicine.tenThuoc,
                  donVi: selectedMedicine.donVi ?? "",
                  lieuDung: prescription.trim() || "Theo chỉ định",
                  soLanMoiNgay: 1,
                  soNgayDung: 1,
                  ghiChuSuDung: null,
                },
              ]
            : [],
        },
        Boolean(lookupDetails.ketQua),
      );
      if (!response.thanhCong || !response.duLieu)
        throw new Error(
          response.thongDiep || "Could not save the medical record",
        );
      setCompletedRecord({
        recordCode: lookupDetails.lichHen.maTraCuu,
        appointmentCode: lookupDetails.lichHen.maTraCuu,
        patientName: patientLookup.patientName,
        diagnosis: response.duLieu.chanDoan,
        prescription:
          response.duLieu.donThuoc
            .map((medicine) => `${medicine.tenThuoc}: ${medicine.lieuDung}`)
            .join("; ") ||
          response.duLieu.ghiChu ||
          "",
        createdAt: new Intl.DateTimeFormat(lang, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-today"],
      });
      notifyAuth(
        "success",
        lang === "vi" ? "Đã lưu bệnh án" : "Medical record saved",
        response.thongDiep,
      );
    } catch (error) {
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : "Could not save the medical record"),
      );
    }
  };

  const statusLabel = (status: AppointmentStatus) => {
    if (status === "pending") return lang === "vi" ? "Chờ xác nhận" : "Pending";
    if (status === "accepted")
      return lang === "vi" ? "Đã tiếp nhận" : "Accepted";
    if (status === "declined") return lang === "vi" ? "Đã từ chối" : "Declined";
    return lang === "vi" ? "Hoàn thành" : "Completed";
  };

  const withdrawShiftRequest = async (id: number) => {
    try {
      await bookingService.rutYeuCauDoiLichBacSi(id);
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-shift-requests"],
      });
    } catch (error) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể rút yêu cầu" : "Could not withdraw request",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ?? "Request failed",
      );
    }
  };

  if (activeSection === "schedule") {
    const weekStart = new Date(scheduleDate);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const calendarDays = Array.from(
      { length: scheduleView === "day" ? 1 : 7 },
      (_, index) => {
        const date = new Date(
          scheduleView === "day" ? scheduleDate : weekStart,
        );
        if (scheduleView === "week") date.setDate(date.getDate() + index);
        return date;
      },
    );
    const calendarTitle = new Intl.DateTimeFormat(lang, {
      ...(scheduleView === "day"
        ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
        : { month: "long", year: "numeric" }),
    }).format(scheduleDate);
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
    const minimumNotice = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const minimumRequestTime = new Date(
      minimumNotice.getTime() - minimumNotice.getTimezoneOffset() * 60_000,
    )
      .toISOString()
      .slice(0, 16);

    const submitShiftRequest = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const shiftId = Number(formData.get("idLichLamViec"));
      const requestType = String(formData.get("loaiYeuCau")) as
        | "XIN_NGHI"
        | "DOI_CA";
      const reason = String(formData.get("reason") || "").trim();
      const currentShift = shifts.find((shift) => shift.id === shiftId);
      const shiftStart = currentShift
        ? new Date(`${currentShift.ngay}T${currentShift.gioBatDau}`)
        : null;
      if (!currentShift || !reason) {
        notifyAuth(
          "error",
          lang === "vi" ? "Thiếu thông tin" : "Missing information",
          lang === "vi"
            ? "Vui lòng chọn ca và nhập lý do."
            : "Choose a shift and enter a reason.",
        );
        return;
      }
      if (
        shiftStart &&
        shiftStart.getTime() < Date.now() + 24 * 60 * 60 * 1000
      ) {
        notifyAuth(
          "error",
          lang === "vi" ? "Quá hạn gửi yêu cầu" : "Request deadline passed",
          lang === "vi"
            ? "Yêu cầu phải được gửi trước ca ít nhất 24 giờ."
            : "Requests must be submitted at least 24 hours before the shift.",
        );
        return;
      }
      const requestedStart = String(formData.get("requestedStart") || "");
      const requestedEnd = String(formData.get("requestedEnd") || "");
      if (requestType === "DOI_CA" && (!requestedStart || !requestedEnd)) {
        notifyAuth(
          "error",
          lang === "vi" ? "Thiếu thời gian đổi ca" : "New shift time required",
          lang === "vi"
            ? "Hãy nhập giờ bắt đầu và kết thúc mong muốn."
            : "Enter the requested start and end times.",
        );
        return;
      }
      void bookingService
        .guiYeuCauDoiLich({
          idLichLamViec: shiftId,
          loaiYeuCau: requestType,
          lyDo: reason,
          ...(requestType === "DOI_CA"
            ? {
                ngayMongMuon: requestedStart.slice(0, 10),
                gioBatDauMongMuon: `${requestedStart.slice(11, 16)}:00`,
                gioKetThucMongMuon: `${requestedEnd.slice(11, 16)}:00`,
              }
            : {}),
          idPhongKhamMongMuon:
            Number(formData.get("idPhongKhamMongMuon")) || undefined,
        })
        .then(async (response) => {
          if (!response.thanhCong) throw new Error(response.thongDiep);
          await queryClient.invalidateQueries({
            queryKey: ["booking", "doctor-shift-requests"],
          });
          notifyAuth(
            "success",
            lang === "vi" ? "Đã gửi yêu cầu" : "Request sent",
            response.thongDiep,
          );
          form.reset();
        })
        .catch((error) => {
          notifyAuth(
            "error",
            lang === "vi"
              ? "Không thể gửi yêu cầu"
              : "Could not submit request",
            (error as { response?: { data?: { thongDiep?: string } } }).response
              ?.data?.thongDiep ??
              (error instanceof Error ? error.message : "Request failed"),
          );
        });
    };

    return (
      <section className={styles.workspace}>
        <div className={styles.pageHeading}>
          <div>
            <h1>{lang === "vi" ? "Lịch làm việc cá nhân" : "Work Schedule"}</h1>
            <p>
              {lang === "vi"
                ? "Lịch trực do Quản trị viên phân công."
                : "Shifts assigned by your administrator."}
            </p>
          </div>
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
            <h2>{calendarTitle}</h2>
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
                <button
                  type="button"
                  className={`${styles.calendarDayCell} ${isToday(date) ? styles.calendarToday : ""}`}
                  key={date.toISOString()}
                  onClick={() => {
                    setScheduleDate(date);
                    setScheduleView("day");
                  }}
                  aria-label={`${dayLabel} ${dateLabel}`}
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
                    <span className={styles.calendarShift}>
                      {dayShifts.map((shift) => (
                        <span key={shift.id}>
                          <Clock3 size={13} aria-hidden="true" />
                          {shift.gioBatDau} - {shift.gioKetThuc}
                          <small>
                            {shift.tenPhongKham} ·{" "}
                            {shift.soLuotDaDat ?? shift.soChoDaDat}/
                            {shift.tongSoLuot ?? shift.tongSoCho}
                          </small>
                        </span>
                      ))}
                      {dayAppointments.map((appointment) => (
                        <small key={appointment.maPhieuKham}>
                          {appointment.gioKhamDuKien} ·{" "}
                          {appointment.hoTenBenhNhan}
                        </small>
                      ))}
                    </span>
                  ) : (
                    <span className={styles.calendarOff}>
                      {lang === "vi" ? "Không có ca" : "No shift"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <h2>
                {lang === "vi" ? "Yêu cầu đã gửi" : "My submitted requests"}
              </h2>
            </div>
          </div>
          {ownShiftRequests.length === 0 ? (
            <p className={styles.emptyState}>
              {lang === "vi"
                ? "Chưa có yêu cầu nào."
                : "No shift requests yet."}
            </p>
          ) : (
            <div className={styles.shiftList}>
              {ownShiftRequests.map((request) => (
                <article className={styles.shiftCard} key={request.id}>
                  <div className={styles.shiftDate}>
                    <strong>{request.ca?.ngay ?? request.ngay}</strong>
                    <span>
                      {request.ca?.gioBatDau ?? request.gioBatDau} -{" "}
                      {request.ca?.gioKetThuc ?? request.gioKetThuc}
                    </span>
                  </div>
                  <div className={styles.shiftDetails}>
                    <strong>
                      {request.loaiYeuCau ?? ""} · {request.trangThai}
                    </strong>
                    <span>{request.lyDo}</span>
                    <small>{request.ghiChuXuLy ?? request.phanHoi ?? ""}</small>
                  </div>
                  {request.trangThai === "CHO_DUYET" && (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => void withdrawShiftRequest(request.id)}
                    >
                      {lang === "vi" ? "Rút yêu cầu" : "Withdraw"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        <form className={styles.panel} onSubmit={submitShiftRequest}>
          <div className={styles.panelHeading}>
            <div>
              <h2>
                {lang === "vi"
                  ? "Yêu cầu đổi lịch / xin nghỉ ca"
                  : "Request a shift change / leave"}
              </h2>
              <p>
                {lang === "vi"
                  ? "Gửi yêu cầu trước ca ít nhất 24 giờ."
                  : "Submit at least 24 hours before the shift."}
              </p>
            </div>
          </div>
          <div className={styles.formGrid}>
            <label>
              {lang === "vi" ? "Ca làm việc" : "Assigned shift"}
              <select name="idLichLamViec" required defaultValue="">
                <option value="" disabled>
                  {lang === "vi" ? "Chọn ca" : "Choose a shift"}
                </option>
                {shifts
                  .filter((shift) => shift.trangThai === "HOAT_DONG")
                  .map((shift) => (
                    <option value={shift.id} key={shift.id}>
                      {shift.ngay} · {shift.gioBatDau}-{shift.gioKetThuc} ·{" "}
                      {shift.tenPhongKham}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              {lang === "vi" ? "Loại yêu cầu" : "Request type"}
              <select name="loaiYeuCau" defaultValue="XIN_NGHI">
                <option value="XIN_NGHI">
                  {lang === "vi" ? "Xin nghỉ" : "Leave"}
                </option>
                <option value="DOI_CA">
                  {lang === "vi" ? "Đổi ca" : "Change shift"}
                </option>
              </select>
            </label>
            <label>
              {lang === "vi"
                ? "Giờ bắt đầu mong muốn (khi đổi ca)"
                : "Requested start (shift change)"}
              <input
                name="requestedStart"
                type="datetime-local"
                min={minimumRequestTime}
              />
            </label>
            <label>
              {lang === "vi" ? "Giờ kết thúc mong muốn" : "Requested end"}
              <input
                name="requestedEnd"
                type="datetime-local"
                min={minimumRequestTime}
              />
            </label>
            <label>
              {lang === "vi"
                ? "Mã phòng mong muốn (không bắt buộc)"
                : "Requested clinic ID (optional)"}
              <input name="idPhongKhamMongMuon" inputMode="numeric" />
            </label>
            <label className={styles.fullWidth}>
              {lang === "vi" ? "Lý do" : "Reason"}
              <textarea name="reason" rows={3} required />
            </label>
            <button type="submit" className={styles.primaryButton}>
              {lang === "vi" ? "Gửi yêu cầu" : "Submit request"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  if (activeSection === "appointments") {
    const pendingCount = appointments.filter(
      (appointment) => appointment.status === "pending",
    ).length;
    return (
      <section className={styles.workspace}>
        <div className={styles.pageHeading}>
          <div>
            <h1>
              {lang === "vi" ? "Yêu cầu đặt lịch" : "Appointment Requests"}
            </h1>
            <p>
              {lang === "vi"
                ? "Xem lý do khám và xác nhận các lịch đang chờ."
                : "Review symptoms and respond to pending appointment requests."}
            </p>
          </div>
          <span className={styles.pendingCount}>
            {pendingCount} {lang === "vi" ? "chờ xác nhận" : "pending"}
          </span>
        </div>
        <div className={styles.appointmentList}>
          {appointments.map((appointment) => (
            <article className={styles.appointmentCard} key={appointment.id}>
              <div className={styles.appointmentTop}>
                <div>
                  <span className={styles.appointmentCode}>
                    {appointment.id}
                  </span>
                  <h2>{appointment.patientName}</h2>
                </div>
                <span
                  className={`${styles.status} ${styles[`status_${appointment.status}`]}`}
                >
                  {statusLabel(appointment.status)}
                </span>
              </div>
              <div className={styles.patientFacts}>
                <span>
                  {appointment.age} {lang === "vi" ? "tuổi" : "years"}
                </span>
                <span>{appointment.phone}</span>
                <span>{appointment.time}</span>
              </div>
              <p className={styles.reason}>
                <strong>{lang === "vi" ? "Lý do khám:" : "Reason:"}</strong>{" "}
                {appointment.reason}
              </p>
              {appointment.status === "declined" &&
                appointment.refusalReason && (
                  <p className={styles.refusal}>
                    <strong>
                      {lang === "vi" ? "Lý do từ chối:" : "Decline reason:"}
                    </strong>{" "}
                    {appointment.refusalReason}
                  </p>
                )}
              {appointment.status === "pending" && (
                <div className={styles.appointmentActions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => acceptAppointment(appointment.id)}
                  >
                    <Check size={16} aria-hidden="true" />
                    {lang === "vi"
                      ? "Xác nhận tiếp nhận"
                      : "Accept appointment"}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() =>
                      setRejectingId(
                        rejectingId === appointment.id ? null : appointment.id,
                      )
                    }
                  >
                    <X size={16} aria-hidden="true" />
                    {lang === "vi" ? "Từ chối" : "Decline"}
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => {
                      setPatientCode(appointment.id);
                      setPatientLookup(appointment);
                      setCompletedRecord(null);
                      setDiagnosis("");
                      setPrescription("");
                    }}
                  >
                    <FileHeart size={16} aria-hidden="true" />
                    {lang === "vi" ? "Mở hồ sơ" : "Open record"}
                  </button>
                </div>
              )}
              {rejectingId === appointment.id && (
                <form
                  className={styles.rejectForm}
                  onSubmit={(event) => rejectAppointment(event, appointment.id)}
                >
                  <label>
                    {lang === "vi"
                      ? "Lý do từ chối (bắt buộc)"
                      : "Reason for declining (required)"}
                    <textarea
                      name="rejectionReason"
                      required
                      rows={2}
                      autoFocus
                    />
                  </label>
                  <button type="submit" className={styles.dangerButton}>
                    {lang === "vi" ? "Gửi từ chối" : "Confirm decline"}
                  </button>
                </form>
              )}
              {appointment.status === "accepted" && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setPatientCode(appointment.id);
                    setPatientLookup(appointment);
                    setCompletedRecord(null);
                    setDiagnosis("");
                    setPrescription("");
                  }}
                >
                  <FileHeart size={16} aria-hidden="true" />
                  {lang === "vi" ? "Bắt đầu khám" : "Start consultation"}
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (activeSection === "consultation") {
    return (
      <section className={styles.workspace}>
        <div className={styles.pageHeading}>
          <div>
            <h1>
              {lang === "vi" ? "Tiếp nhận & khám bệnh" : "Consultation / EMR"}
            </h1>
            <p>
              {lang === "vi"
                ? "Tra cứu phiếu khám, xem tiền sử và hoàn tất hồ sơ điện tử."
                : "Find a visit, review history, and complete the electronic record."}
            </p>
          </div>
        </div>
        <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <h2>
                {lang === "vi" ? "Tiếp nhận bệnh nhân" : "Check in a patient"}
              </h2>
              <p>
                {lang === "vi"
                  ? "Quét mã QR trên phiếu khám hoặc nhập mã phiếu."
                  : "Scan the visit QR code or enter its code."}
              </p>
            </div>
          </div>
          <form className={styles.lookupForm} onSubmit={lookupPatient}>
            <label htmlFor="patient-visit-code">
              {lang === "vi"
                ? "Mã phiếu khám điện tử"
                : "Electronic visit code"}
            </label>
            <div className={styles.lookupControls}>
              <input
                id="patient-visit-code"
                value={patientCode}
                onChange={(event) => setPatientCode(event.target.value)}
                placeholder="AP-101"
                required
              />
              <button type="submit" className={styles.primaryButton}>
                <Search size={16} aria-hidden="true" />
                {lang === "vi" ? "Tra cứu" : "Find visit"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setScannerOpen((value) => !value)}
              >
                <Camera size={16} aria-hidden="true" />
                {scannerOpen
                  ? lang === "vi"
                    ? "Đóng camera"
                    : "Close camera"
                  : lang === "vi"
                    ? "Quét QR"
                    : "Scan QR"}
              </button>
            </div>
          </form>
          {scannerOpen && (
            <div className={styles.scanner}>
              <video
                ref={videoRef}
                aria-label={
                  lang === "vi" ? "Camera quét mã QR" : "QR scanner camera"
                }
              />
              <p>
                {lang === "vi"
                  ? "Đưa mã QR vào khung hình. Camera chỉ hoạt động khi được cấp quyền."
                  : "Align the QR code in view. Camera access is required."}
              </p>
            </div>
          )}
        </section>

        {patientLookup && (
          <>
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>{patientLookup.patientName}</h2>
                  <p>
                    {patientLookup.id} · {patientLookup.age}{" "}
                    {lang === "vi" ? "tuổi" : "years"} · {patientLookup.phone}
                  </p>
                </div>
                <span className={styles.status}>
                  {lang === "vi" ? "Hồ sơ bệnh nhân" : "Patient record"}
                </span>
              </div>
              {lookupDetails?.lichHen.doiChieu?.canDoiChieu && (
                <div className={styles.historyBox}>
                  <strong>
                    {lang === "vi"
                      ? "Cần đối chiếu giấy tờ"
                      : "Identity verification required"}
                  </strong>
                  <p>
                    {lang === "vi"
                      ? "Thông tin đặt lịch khác hồ sơ bệnh nhân. Hãy đối chiếu giấy tờ trước khi xác nhận."
                      : "Booking details differ from the patient record. Verify the patient's documents."}
                  </p>
                  <form
                    className={styles.formGrid}
                    onSubmit={(event) => void savePatientIdentity(event)}
                  >
                    <label>
                      {lang === "vi" ? "Họ tên" : "Full name"}
                      <input
                        name="hoTen"
                        required
                        defaultValue={lookupDetails.hoSoBenhNhan.hoTen}
                      />
                    </label>
                    <label>
                      {lang === "vi" ? "Ngày sinh" : "Date of birth"}
                      <input
                        name="ngaySinh"
                        type="date"
                        required
                        defaultValue={lookupDetails.hoSoBenhNhan.ngaySinh}
                      />
                    </label>
                    <label>
                      {lang === "vi" ? "Điện thoại" : "Phone"}
                      <input
                        name="soDienThoai"
                        required
                        defaultValue={lookupDetails.hoSoBenhNhan.soDienThoai}
                      />
                    </label>
                    <label>
                      {lang === "vi" ? "Giới tính" : "Gender"}
                      <select
                        name="gioiTinh"
                        defaultValue={lookupDetails.hoSoBenhNhan.gioiTinh}
                      >
                        <option value="NAM">
                          {lang === "vi" ? "Nam" : "Male"}
                        </option>
                        <option value="NU">
                          {lang === "vi" ? "Nữ" : "Female"}
                        </option>
                        <option value="KHAC">
                          {lang === "vi" ? "Khác" : "Other"}
                        </option>
                      </select>
                    </label>
                    <label>
                      {lang === "vi" ? "Địa chỉ" : "Address"}
                      <input
                        name="diaChi"
                        defaultValue={lookupDetails.hoSoBenhNhan.diaChi ?? ""}
                      />
                    </label>
                    {!lookupDetails.hoSoBenhNhan.soBaoHiemYTe && (
                      <label>
                        {lang === "vi"
                          ? "CCCD (nếu hồ sơ chưa có)"
                          : "National ID (if not on record)"}
                        <input name="cccd" inputMode="numeric" maxLength={12} />
                      </label>
                    )}
                    <div className={styles.fullWidth}>
                      <button type="submit" className={styles.primaryButton}>
                        {lang === "vi"
                          ? "Cập nhật hồ sơ"
                          : "Update patient record"}
                      </button>{" "}
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => void markIdentityChecked()}
                      >
                        {lang === "vi"
                          ? "Đã đối chiếu giấy tờ"
                          : "Mark documents verified"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {consultationError && (
                <p className={styles.refusal} role="alert">
                  {consultationError}
                </p>
              )}
              <div className={styles.historyBox}>
                <strong>
                  {lang === "vi"
                    ? "Hồ sơ và tiền sử khám"
                    : "Patient record and visit history"}
                </strong>
                <p>
                  {lookupDetails?.hoSoBenhNhan.tienSuBenhLy ||
                    (lang === "vi"
                      ? "Chưa ghi nhận tiền sử bệnh lý."
                      : "No medical history recorded.")}
                </p>
                <span>
                  {lang === "vi" ? "Lý do lần này:" : "Current reason:"}{" "}
                  {patientLookup.reason}
                </span>
                {lookupDetails?.lanKhamTruoc.map((visit, index) => (
                  <p key={`${visit.ngay}-${index}`}>
                    {visit.ngay} · {visit.tenChuyenKhoa} · {visit.hoTenBacSi}
                    {visit.ketQua?.chanDoan
                      ? ` · ${visit.ketQua.chanDoan}`
                      : ""}
                  </p>
                ))}
              </div>
              <form className={styles.formGrid} onSubmit={completeConsultation}>
                <label className={styles.fullWidth}>
                  {lang === "vi" ? "Chẩn đoán" : "Diagnosis"}
                  <textarea
                    rows={3}
                    required
                    value={diagnosis}
                    onChange={(event) => setDiagnosis(event.target.value)}
                  />
                </label>
                <label>
                  {lang === "vi" ? "Tên thuốc" : "Medication"}
                  <input
                    list="doctor-medication-suggestions"
                    value={medicationName}
                    onChange={(event) => setMedicationName(event.target.value)}
                  />
                  <datalist id="doctor-medication-suggestions">
                    {(medicationQuery.data?.duLieu ?? []).map((medicine) => (
                      <option key={medicine.id} value={medicine.tenThuoc}>
                        {medicine.donVi ?? ""}
                      </option>
                    ))}
                  </datalist>
                </label>
                <label className={styles.fullWidth}>
                  {lang === "vi"
                    ? "Lời dặn / hướng điều trị"
                    : "Care instructions"}
                  <textarea
                    rows={3}
                    value={prescription}
                    onChange={(event) => setPrescription(event.target.value)}
                  />
                </label>
                <button type="submit" className={styles.primaryButton}>
                  {lookupDetails?.ketQua
                    ? lang === "vi"
                      ? "Cập nhật bệnh án"
                      : "Update medical record"
                    : lang === "vi"
                      ? "Hoàn tất và lưu bệnh án"
                      : "Complete consultation"}
                </button>
              </form>
            </section>
            {completedRecord && (
              <section className={`${styles.panel} ${styles.printableRecord}`}>
                <div className={styles.recordHeading}>
                  <div>
                    <span className={styles.eyebrow}>
                      {lang === "vi"
                        ? "SỔ KHÁM BỆNH ĐIỆN TỬ"
                        : "ELECTRONIC MEDICAL RECORD"}
                    </span>
                    <h2>{completedRecord.patientName}</h2>
                    <p>
                      {completedRecord.recordCode} · {completedRecord.createdAt}
                    </p>
                  </div>
                  <QRCodeSVG
                    value={JSON.stringify(completedRecord)}
                    size={132}
                    level="M"
                    aria-label={
                      lang === "vi"
                        ? "Mã QR hồ sơ khám"
                        : "Medical record QR code"
                    }
                  />
                </div>
                <div className={styles.recordField}>
                  <strong>{lang === "vi" ? "Chẩn đoán" : "Diagnosis"}</strong>
                  <p>{completedRecord.diagnosis}</p>
                </div>
                <div className={styles.recordField}>
                  <strong>
                    {lang === "vi"
                      ? "Đơn thuốc / hướng điều trị"
                      : "Prescription / treatment"}
                  </strong>
                  <p>{completedRecord.prescription}</p>
                </div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => window.print()}
                >
                  {lang === "vi" ? "In / lưu sổ khám" : "Print / save record"}
                </button>
              </section>
            )}
          </>
        )}
      </section>
    );
  }

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>{lang === "vi" ? "Hồ sơ cá nhân" : "Doctor Profile"}</h1>
          <p>
            {lang === "vi"
              ? "Thông tin do Quản trị viên quản lý. Chế độ chỉ xem."
              : "Managed by your administrator. Read-only profile."}
          </p>
        </div>
      </div>
      <section className={styles.panel}>
        <div className={styles.profileHeading}>
          <span className={styles.profileAvatar}>
            {(user?.name || "BS")
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </span>
          <div>
            <h2>
              {doctorAccount?.hoTen ||
                user?.name ||
                (lang === "vi" ? "Bác sĩ eClinic" : "eClinic Doctor")}
            </h2>
            <span>{lang === "vi" ? "Hồ sơ bác sĩ" : "Doctor profile"}</span>
          </div>
        </div>
        <dl className={styles.profileGrid}>
          <div>
            <dt>{lang === "vi" ? "Email" : "Email"}</dt>
            <dd>{doctorAccount?.email || user?.email || "—"}</dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Điện thoại" : "Phone"}</dt>
            <dd>{doctorAccount?.soDienThoai || user?.phone || "—"}</dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Chuyên khoa" : "Specialty"}</dt>
            <dd>
              {doctorProfile?.tenChuyenKhoa ||
                doctorAccount?.bacSi?.tenChuyenKhoa ||
                user?.specialty ||
                (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Trình độ / Học vị" : "Qualification"}</dt>
            <dd>
              {doctorProfile?.hocVi ||
                doctorAccount?.bacSi?.hocVi ||
                user?.degree ||
                (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Phòng khám công tác" : "Clinic"}</dt>
            <dd>
              {user?.clinic ||
                (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
            </dd>
          </div>
        </dl>
        {doctorProfile?.gioiThieuNgan && (
          <p className={styles.readOnlyNote}>{doctorProfile.gioiThieuNgan}</p>
        )}
        {doctorProfile?.tieuSu && (
          <p className={styles.readOnlyNote}>{doctorProfile.tieuSu}</p>
        )}
        <p className={styles.readOnlyNote}>
          {lang === "vi"
            ? "Muốn cập nhật thông tin? Vui lòng liên hệ Quản trị viên."
            : "Contact your administrator to update this information."}
        </p>
      </section>
    </section>
  );
}
