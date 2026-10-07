import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { createAppointment } from "@/services/appointmentService";
import { notifyAuth } from "@/utils/authNotification";
import type { AppointmentFormValues } from "./appointment.types";
import { getUpcomingBookingDays } from "./appointment.data";
import { ServiceTimeStep } from "./components/ServiceTimeStep";
import { PatientInfoStep } from "./components/PatientInfoStep";
import { BookingSummaryCard } from "./components/BookingSummaryCard";
import { BookingSuccessModal } from "./components/BookingSuccessModal";

export function AppointmentBookingPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Default initial date to tomorrow or today
  const defaultDates = getUpcomingBookingDays(2);
  const defaultDate =
    defaultDates[1]?.dateStr || defaultDates[0]?.dateStr || "";

  // Router navigation state (if patient came from Hero or landing cards)
  const routerState = location.state as
    | {
        specialtyId?: string;
        doctorId?: string;
        date?: string;
        location?: string;
      }
    | undefined;

  const [formValues, setFormValues] = useState<AppointmentFormValues>({
    specialtyId: routerState?.specialtyId || "general-medicine",
    doctorId: routerState?.doctorId || "",
    date: routerState?.date || defaultDate,
    slotId: "",
    slotTime: "",
    patientName: "",
    patientPhone: "",
    patientCccd: "",
    reason: "",
    childDob: "",
    childGender: "",
    guardianName: "",
    guardianCccd: "",
    guardianPhone: "",
    guardianRelationship: "Cha/Mẹ",
  });

  useEffect(() => {
    if (user?.role !== "patient") return;
    setFormValues((previous) => {
      const isPediatric = previous.specialtyId === "pediatrics";
      return {
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
      };
    });
  }, [user, formValues.specialtyId]);

  // Synchronize state if routerState changes
  useEffect(() => {
    if (routerState?.specialtyId) {
      setFormValues((prev) => ({
        ...prev,
        specialtyId: routerState.specialtyId || prev.specialtyId,
        date: routerState.date || prev.date,
        doctorId: routerState.doctorId || prev.doctorId,
      }));
    }
  }, [routerState]);

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AppointmentFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const handleFieldChange = (
    field: keyof AppointmentFormValues,
    value: string,
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field
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
    const isPediatric = formValues.specialtyId === "pediatrics";
    const phoneRegex = /^0\d{9}$/;

    // Group 1 Validation (Dịch vụ & Thời gian khám)
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

    if (!formValues.slotId) {
      errors.slotId =
        lang === "vi"
          ? "Vui lòng chọn khung giờ khám còn trống."
          : "Please select an available time slot.";
    }

    // Common: Tên bệnh nhân / bệnh nhi & Lý do khám
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

    if (!formValues.reason.trim()) {
      errors.reason =
        lang === "vi"
          ? "Vui lòng mô tả sơ bộ lý do khám hoặc triệu chứng bệnh lý."
          : "Please describe symptoms or reason for visit.";
    }

    // Group 2 & 3: Xử lý riêng giữa Khoa Nhi và Người lớn
    if (isPediatric) {
      // Bệnh nhi: Bắt buộc Ngày sinh & Giới tính (Xóa Phone & CCCD của trẻ)
      if (!formValues.childDob) {
        errors.childDob =
          lang === "vi"
            ? "Vui lòng chọn ngày sinh của bé."
            : "Please select child date of birth.";
      } else {
        const dob = new Date(formValues.childDob);
        const today = new Date();
        dob.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (dob > today) {
          errors.childDob =
            lang === "vi"
              ? "Ngày sinh của bé không thể ở tương lai."
              : "Birth date cannot be in the future.";
        }
      }

      if (!formValues.childGender) {
        errors.childGender =
          lang === "vi"
            ? "Vui lòng chọn giới tính của bé."
            : "Please select child gender.";
      }

      // Thông tin Người giám hộ (Bắt buộc cho Khoa Nhi)
      if (!formValues.guardianName?.trim()) {
        errors.guardianName =
          lang === "vi"
            ? "Khám Khoa Nhi bắt buộc điền họ tên người giám hộ."
            : "Guardian name is required for pediatric appointments.";
      }

      if (!formValues.guardianCccd?.trim()) {
        errors.guardianCccd =
          lang === "vi"
            ? "Vui lòng nhập số CCCD của người giám hộ."
            : "Guardian Citizen ID is required.";
      } else if (!/^\d{9,12}$/.test(formValues.guardianCccd.trim())) {
        errors.guardianCccd =
          lang === "vi"
            ? "Số CCCD người giám hộ phải gồm 9 đến 12 chữ số."
            : "Guardian ID must be 9-12 digits.";
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
      // Người lớn: Bắt buộc Số điện thoại & CCCD
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
            ? "Số CCCD là khóa định danh bắt buộc để liên kết hồ sơ bệnh nhân."
            : "Citizen ID (CCCD) is required to link medical records.";
      } else if (!/^\d{9,12}$/.test(formValues.patientCccd.trim())) {
        errors.patientCccd =
          lang === "vi"
            ? "Số CCCD phải gồm 9 đến 12 chữ số hợp lệ."
            : "Citizen ID must be 9-12 digits.";
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thông tin chưa đầy đủ" : "Incomplete Information",
        lang === "vi"
          ? "Vui lòng điền đủ các mục bắt buộc được đánh dấu đỏ."
          : "Please complete all required fields.",
      );
      window.scrollTo({ top: 120, behavior: "smooth" });
      return false;
    }

    return true;
  };

  const handleBookingSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const isPediatric = formValues.specialtyId === "pediatrics";
      const appointment = createAppointment({
        patientId: user?.role === "patient" ? user.id : undefined,
        patientName: formValues.patientName,
        patientPhone: isPediatric
          ? formValues.guardianPhone || ""
          : formValues.patientPhone,
        specialtyId: formValues.specialtyId,
        doctorId: formValues.doctorId,
        date: formValues.date,
        slotTime: formValues.slotTime,
        reason: formValues.reason,
      });

      setBookingCode(appointment.bookingCode);
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);

      notifyAuth(
        "success",
        lang === "vi" ? "Đặt lịch thành công!" : "Appointment Booked!",
        lang === "vi"
          ? `Mã lịch hẹn: ${appointment.bookingCode}. eClinic đã ghi nhận lịch khám của bạn.`
          : `Booking reference: ${appointment.bookingCode}.`,
      );
    }, 600);
  };

  const handleBookAnother = () => {
    setIsSuccessModalOpen(false);
    setFormValues((prev) => ({
      ...prev,
      slotId: "",
      slotTime: "",
      reason: "",
      patientName: "",
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
    navigate(user?.role === "patient" ? "/patient/appointments" : "/");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] flex flex-col font-body">
      {!isSuccessModalOpen && <Header />}

      <main className="flex-1 py-8 sm:py-12">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-[#0f4d3a] transition-colors">
              {lang === "vi" ? "Trang chủ" : "Home"}
            </Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="font-semibold text-slate-800">
              {lang === "vi" ? "Đặt lịch khám" : "Book Appointment"}
            </span>
          </nav>

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

              {/* Step 2: Nhóm Thông tin Cá nhân Bệnh nhân (+ Người giám hộ nếu Nhi khoa) */}
              <PatientInfoStep
                lang={lang}
                formValues={formValues}
                onChange={handleFieldChange}
                errors={formErrors}
              />
            </div>

            {/* Right Column: Sticky Summary & Confirmation */}
            <div className="lg:col-span-4">
              <BookingSummaryCard
                lang={lang}
                formValues={formValues}
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
        formValues={formValues}
        lang={lang}
      />
    </div>
  );
}
