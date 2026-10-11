import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { notifyAuth } from "@/utils/authNotification";
import type { AppointmentFormValues } from "./appointment.types";
import type { DatLichRequest, DatLichResponse } from "@/types/booking.type";
import {
  getUpcomingBookingDays,
  calculateAgeInYears,
  isSpecialtyPediatric,
} from "./appointment.utils";
import { ServiceTimeStep } from "./components/ServiceTimeStep";
import { PatientInfoStep } from "./components/PatientInfoStep";
import { BookingSummaryCard } from "./components/BookingSummaryCard";
import { BookingSuccessModal } from "./components/BookingSuccessModal";
import { useDanhSachChuyenKhoa, useDanhSachBacSi } from "@/hooks/useCatalog";

export function AppointmentBookingPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mặc định chọn ngày mai hoặc hôm nay
  const defaultDates = getUpcomingBookingDays(2);
  const defaultDate =
    defaultDates[1]?.dateStr || defaultDates[0]?.dateStr || "";

  // Router navigation state (khi bệnh nhân bấm "Đặt khám" từ trang Bác sĩ hoặc Chuyên khoa)
  const routerState = location.state as
    | {
        specialtyId?: string | number;
        doctorId?: string | number;
        date?: string;
        location?: string;
      }
    | undefined;

  const [formValues, setFormValues] = useState<AppointmentFormValues>({
    specialtyId: routerState?.specialtyId ? String(routerState.specialtyId) : "",
    doctorId: routerState?.doctorId ? String(routerState.doctorId) : "",
    date: routerState?.date || defaultDate,
    slotId: "",
    slotTime: "",
    gioBatDauKhung: "",
    idLichLamViec: undefined,
    patientName: "",
    patientDob: "",
    patientGender: "NAM",
    patientPhone: "",
    patientCccd: "",
    reason: "",
    childDob: "",
    childGender: "",
    guardianName: "",
    guardianCccd: "",
    guardianPhone: "",
    guardianRelationship: "CHA",
  });

  // Fetch danh sách chuyên khoa để resolve tên & kiểm tra chuyên khoa Nhi
  const { danhSach: danhSachChuyenKhoa } = useDanhSachChuyenKhoa({ kichThuoc: 50 });

  // Tự động chọn chuyên khoa đầu tiên nếu chưa có
  useEffect(() => {
    if (!formValues.specialtyId && danhSachChuyenKhoa.length > 0) {
      setFormValues((prev) => ({
        ...prev,
        specialtyId: String(danhSachChuyenKhoa[0].id),
      }));
    }
  }, [danhSachChuyenKhoa, formValues.specialtyId]);

  // Fetch danh sách bác sĩ của chuyên khoa
  const idChuyenKhoaNum = formValues.specialtyId
    ? Number(formValues.specialtyId)
    : undefined;
  const { danhSach: danhSachBacSi } = useDanhSachBacSi(
    idChuyenKhoaNum && !isNaN(idChuyenKhoaNum)
      ? { idChuyenKhoa: idChuyenKhoaNum, kichThuoc: 50 }
      : { kichThuoc: 50 },
  );

  const selectedSpecialty = useMemo(
    () => danhSachChuyenKhoa.find((s) => String(s.id) === formValues.specialtyId),
    [danhSachChuyenKhoa, formValues.specialtyId],
  );

  const selectedDoctor = useMemo(
    () => danhSachBacSi.find((d) => String(d.id) === formValues.doctorId),
    [danhSachBacSi, formValues.doctorId],
  );

  const isPediatric = isSpecialtyPediatric(selectedSpecialty?.tenChuyenKhoa);

  // Điền sẵn thông tin khi bệnh nhân đã đăng nhập
  useEffect(() => {
    if (user?.role !== "patient") return;
    setFormValues((previous) => ({
      ...previous,
      patientName: isPediatric
        ? previous.patientName
        : previous.patientName || user.name,
      patientPhone: isPediatric
        ? previous.patientPhone
        : previous.patientPhone || user.phone || "",
      guardianName: isPediatric
        ? previous.guardianName || user.name
        : previous.guardianName,
      guardianPhone: isPediatric
        ? previous.guardianPhone || user.phone || ""
        : previous.guardianPhone,
    }));
  }, [user, isPediatric]);

  // Đồng bộ routerState khi chuyển trang
  useEffect(() => {
    if (routerState?.specialtyId) {
      setFormValues((prev) => ({
        ...prev,
        specialtyId: String(routerState.specialtyId),
        date: routerState.date || prev.date,
        doctorId: routerState.doctorId ? String(routerState.doctorId) : prev.doctorId,
      }));
    }
  }, [routerState]);

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AppointmentFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [bookingResult, setBookingResult] = useState<DatLichResponse | null>(null);

  const handleFieldChange = (
    field: keyof AppointmentFormValues,
    value: any,
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AppointmentFormValues, string>> = {};
    const phoneRegex = /^0\d{9}$/;

    // 1. Chuyên khoa, Ngày, Khung giờ
    if (!formValues.specialtyId) {
      errors.specialtyId =
        lang === "vi"
          ? "Vui lòng chọn chuyên khoa cần khám."
          : "Please select a specialty.";
    }

    if (!formValues.date) {
      errors.date =
        lang === "vi"
          ? "Vui lòng chọn ngày khám."
          : "Please select an appointment date.";
    }

    if (!formValues.slotId || !formValues.gioBatDauKhung) {
      errors.slotId =
        lang === "vi"
          ? "Vui lòng chọn khung giờ khám còn chỗ."
          : "Please select an available time slot.";
    }

    // 2. Họ tên bệnh nhân
    if (!formValues.patientName.trim()) {
      errors.patientName = isPediatric
        ? lang === "vi"
          ? "Họ và tên bệnh nhi không được để trống."
          : "Child full name cannot be empty."
        : lang === "vi"
          ? "Họ và tên người khám không được để trống."
          : "Patient full name cannot be empty.";
    } else if (formValues.patientName.trim().length > 150) {
      errors.patientName =
        lang === "vi"
          ? "Họ và tên tối đa 150 ký tự."
          : "Full name cannot exceed 150 characters.";
    }

    // 3. Ngày sinh bệnh nhân
    const effectiveDob = isPediatric ? formValues.childDob : formValues.patientDob;
    if (!effectiveDob) {
      const errDob =
        lang === "vi"
          ? "Vui lòng chọn ngày sinh để xác định hồ sơ và độ tuổi."
          : "Date of birth is required.";
      if (isPediatric) errors.childDob = errDob;
      else errors.patientDob = errDob;
    } else {
      const dob = new Date(effectiveDob);
      const today = new Date();
      dob.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (dob > today) {
        const errFuture =
          lang === "vi"
            ? "Ngày sinh không thể ở tương lai."
            : "Birth date cannot be in the future.";
        if (isPediatric) errors.childDob = errFuture;
        else errors.patientDob = errFuture;
      }
    }

    // 4. Giới tính
    if (!formValues.patientGender) {
      errors.patientGender =
        lang === "vi" ? "Vui lòng chọn giới tính." : "Please select gender.";
    }

    // 5. Lý do khám
    if (!formValues.reason.trim()) {
      errors.reason =
        lang === "vi"
          ? "Vui lòng mô tả sơ bộ lý do khám hoặc triệu chứng."
          : "Please describe symptoms or reason for visit.";
    } else if (formValues.reason.trim().length > 500) {
      errors.reason =
        lang === "vi"
          ? "Lý do khám tối đa 500 ký tự."
          : "Reason for visit cannot exceed 500 characters.";
    }

    // 6. Quy tắc tuổi: dưới 18 tuổi hoặc chuyên khoa Nhi bắt buộc có Người giám hộ
    const ageYears = calculateAgeInYears(effectiveDob, formValues.date);
    const isMinor = isPediatric || (effectiveDob ? ageYears < 18 : false);

    if (isMinor) {
      // Người giám hộ bắt buộc
      if (!formValues.guardianName?.trim()) {
        errors.guardianName =
          lang === "vi"
            ? "Người khám dưới 18 tuổi bắt buộc điền họ tên người giám hộ."
            : "Guardian name is required for minors.";
      }

      if (!formValues.guardianCccd?.trim()) {
        errors.guardianCccd =
          lang === "vi"
            ? "Vui lòng nhập số CCCD của người giám hộ (12 chữ số)."
            : "Guardian Citizen ID (12 digits) is required.";
      } else if (!/^\d{12}$/.test(formValues.guardianCccd.trim())) {
        errors.guardianCccd =
          lang === "vi"
            ? "Số CCCD người giám hộ phải gồm đúng 12 chữ số."
            : "Guardian ID must be exactly 12 digits.";
      }

      if (!formValues.guardianPhone?.trim()) {
        errors.guardianPhone =
          lang === "vi"
            ? "Vui lòng nhập số điện thoại người giám hộ."
            : "Guardian phone is required.";
      } else if (!phoneRegex.test(formValues.guardianPhone.trim())) {
        errors.guardianPhone =
          lang === "vi"
            ? "Số điện thoại người giám hộ phải đúng 10 chữ số, bắt đầu bằng số 0."
            : "Guardian phone must be 10 digits starting with 0.";
      }
    } else {
      // Người lớn (>= 18 tuổi): Bắt buộc Số điện thoại & CCCD 12 số
      if (!formValues.patientPhone.trim()) {
        errors.patientPhone =
          lang === "vi"
            ? "Số điện thoại bắt buộc để nhận thông tin lịch hẹn."
            : "Phone number is required.";
      } else if (!phoneRegex.test(formValues.patientPhone.trim())) {
        errors.patientPhone =
          lang === "vi"
            ? "Số điện thoại phải đúng 10 chữ số, bắt đầu bằng số 0 (VD: 0912345678)."
            : "Phone number must be exactly 10 digits starting with 0.";
      }

      if (!formValues.patientCccd.trim()) {
        errors.patientCccd =
          lang === "vi"
            ? "Số CCCD là định danh bắt buộc đối với người khám từ đủ 18 tuổi."
            : "Citizen ID (CCCD) is required for adult patients.";
      } else if (!/^\d{12}$/.test(formValues.patientCccd.trim())) {
        errors.patientCccd =
          lang === "vi"
            ? "Số CCCD phải gồm đúng 12 chữ số hợp lệ."
            : "Citizen ID must be exactly 12 digits.";
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thông tin chưa hợp lệ" : "Incomplete Information",
        lang === "vi"
          ? "Vui lòng kiểm tra và điền đầy đủ các mục được đánh dấu đỏ."
          : "Please complete all required fields highlighted in red.",
      );
      window.scrollTo({ top: 120, behavior: "smooth" });
      return false;
    }

    return true;
  };

  const handleBookingSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const effectiveDob = isPediatric ? formValues.childDob : formValues.patientDob;
      const ageYears = calculateAgeInYears(effectiveDob, formValues.date);
      const isMinor = isPediatric || (effectiveDob ? ageYears < 18 : false);

      // Quy tắc backend DatLichRequest:
      // Gửi idLichLamViec (chọn bác sĩ) hoặc idChuyenKhoa (bác sĩ bất kỳ), KHÔNG gửi cả hai
      const idLichLamViecNum =
        formValues.doctorId && formValues.idLichLamViec
          ? Number(formValues.idLichLamViec)
          : undefined;
      const idChuyenKhoaNum = !formValues.doctorId && formValues.specialtyId
        ? Number(formValues.specialtyId)
        : undefined;

      // Chuẩn hóa giờ bắt đầu khung sang ISO LocalDateTime: "YYYY-MM-DDTHH:mm:ss"
      let gioBatDauKhung = formValues.gioBatDauKhung;
      if (!gioBatDauKhung.includes("T")) {
        const timePart = formValues.slotTime.slice(0, 5) || "08:00";
        gioBatDauKhung = `${formValues.date}T${timePart}:00`;
      }

      const requestPayload: DatLichRequest = {
        idLichLamViec: idLichLamViecNum,
        idChuyenKhoa: idChuyenKhoaNum,
        gioBatDauKhung,
        lyDoKham: formValues.reason.trim(),
        datChoBanThan: Boolean(user && user.role === "patient"),
        luuNguoiThan: Boolean(user && user.role === "patient"),
        benhNhan: {
          hoTen: formValues.patientName.trim(),
          ngaySinh: effectiveDob!,
          gioiTinh: formValues.patientGender,
          soDienThoai:
            formValues.patientPhone.trim() ||
            (formValues.guardianPhone?.trim() ?? ""),
          cccd: formValues.patientCccd?.trim() || undefined,
          email: user?.email || undefined,
        },
        nguoiGiamHo: isMinor
          ? {
              hoTen: formValues.guardianName!.trim(),
              quanHe: (formValues.guardianRelationship as any) || "CHA",
              soDienThoai: formValues.guardianPhone!.trim(),
              cccd: formValues.guardianCccd!.trim(),
            }
          : undefined,
      };

      const response = await bookingService.datLich(requestPayload);

      if (response.thanhCong && response.duLieu) {
        const result = response.duLieu;
        setBookingResult(result);
        const code = result.maTraCuu || result.maPhieuKham;
        setBookingCode(code);
        setIsSuccessModalOpen(true);
        notifyAuth(
          "success",
          lang === "vi" ? "Đặt lịch thành công!" : "Appointment Booked!",
          lang === "vi"
            ? `Mã phiếu khám: ${code}. eClinic đã ghi nhận lịch hẹn của bạn.`
            : `Booking code: ${code}. eClinic has confirmed your booking.`,
        );
      } else {
        throw new Error(response.thongDiep || "Đặt lịch không thành công");
      }
    } catch (err: any) {
      // TUYỆT ĐỐI KHÔNG FALLBACK VÀO LOCAL STORAGE
      const errorMessage =
        err?.response?.data?.thongDiep ||
        err?.response?.data?.maLoi ||
        err?.message ||
        (lang === "vi"
          ? "Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại sau."
          : "An error occurred while communicating with the server.");
      notifyAuth(
        "error",
        lang === "vi" ? "Đặt lịch thất bại" : "Booking Failed",
        errorMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setIsSuccessModalOpen(false);
    setBookingResult(null);
    setFormValues((prev) => ({
      ...prev,
      slotId: "",
      slotTime: "",
      gioBatDauKhung: "",
      idLichLamViec: undefined,
      reason: "",
      patientName: "",
      patientDob: "",
      patientGender: "NAM",
      patientPhone: "",
      patientCccd: "",
      childDob: "",
      childGender: "",
      guardianName: "",
      guardianCccd: "",
      guardianPhone: "",
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoHome = () => {
    setIsSuccessModalOpen(false);
    navigate(user?.role === "patient" ? "/patient/appointments" : "/home");
  };

  const specialtyDisplayName = selectedSpecialty
    ? selectedSpecialty.tenChuyenKhoa
    : undefined;

  const doctorDisplayName = selectedDoctor
    ? `${selectedDoctor.hocVi ? selectedDoctor.hocVi + " " : ""}${selectedDoctor.hoTen}`
    : undefined;

  return (
    <div className="min-h-screen bg-[#f4f7f4] flex flex-col font-body">
      {!isSuccessModalOpen && <Header />}

      <main className="flex-1 py-8 sm:py-12">
        <Container>
          {/* Page Banner Header */}
          <div className="bg-linear-to-r from-[#0f4d3a] to-[#173127] rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
                <Sparkles size={14} className="text-[#e8792b]" />
                <span>
                  {lang === "vi"
                    ? "Hệ thống đặt lịch khám trực tuyến 24/7"
                    : "Online 24/7 Appointment Booking"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display uppercase tracking-tight text-white mb-2">
                {lang === "vi"
                  ? "Đăng ký khám bệnh trực tuyến"
                  : "Book an Appointment"}
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                {lang === "vi"
                  ? "Chủ động lựa chọn chuyên khoa, bác sĩ, ngày và khung giờ khám mong muốn. Hồ sơ sức khỏe được liên kết tự động qua số CCCD."
                  : "Choose your preferred specialty, doctor, date, and time slot. Your health records are securely linked via Citizen ID."}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-white/15 text-xs text-emerald-100">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#e8792b]" />
                  <span>
                    {lang === "vi"
                      ? "Xác nhận tức thì"
                      : "Instant Confirmation"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#e8792b]" />
                  <span>
                    {lang === "vi"
                      ? "Bảo mật hồ sơ y tế"
                      : "Secure Medical Records"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#e8792b]" />
                  <span>
                    {lang === "vi"
                      ? "Miễn phí đổi lịch hẹn"
                      : "Free Rescheduling"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form and Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-8 space-y-8">
              {/* Step 1: Nhóm Dịch vụ & Thời gian khám */}
              <ServiceTimeStep
                lang={lang}
                formValues={formValues}
                onChange={handleFieldChange}
                errors={formErrors}
              />

              {/* Step 2: Nhóm Thông tin Cá nhân Bệnh nhân (+ Người giám hộ nếu < 18 tuổi) */}
              <PatientInfoStep
                lang={lang}
                formValues={formValues}
                onChange={handleFieldChange}
                errors={formErrors}
                isPediatric={isPediatric}
              />
            </div>

            {/* Right Column: Sticky Summary & Confirmation */}
            <div className="lg:col-span-4">
              <BookingSummaryCard
                lang={lang}
                formValues={formValues}
                specialtyName={specialtyDisplayName}
                doctorName={doctorDisplayName}
                isPediatric={isPediatric}
                onConfirm={handleBookingSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </Container>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      <BookingSuccessModal
        onFinish={handleGoHome}
        isPatientBooking={user?.role === "patient"}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onBookAnother={handleBookAnother}
        bookingCode={bookingCode}
        bookingResult={bookingResult}
        specialtyName={specialtyDisplayName}
        doctorName={doctorDisplayName}
        formValues={formValues}
        lang={lang}
        isPediatric={isPediatric}
      />
    </div>
  );
}
