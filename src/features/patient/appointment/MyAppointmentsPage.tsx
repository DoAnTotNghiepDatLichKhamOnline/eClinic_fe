import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Loader2,
  Mail,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { patientBookingService } from "@/services/booking";
import styles from "./MyAppointmentsPage.module.css";

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ thongDiep?: string }>(error)) {
    return error.response?.data?.thongDiep || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function MyAppointmentsPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const vi = lang === "vi";

  const [maPhieuKham, setMaPhieuKham] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [maTraCuu, setMaTraCuu] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [resendValidationErrors, setResendValidationErrors] = useState<{
    maTraCuu?: string;
    soDienThoai?: string;
  }>({});
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = maPhieuKham.trim();
    if (!/^[a-zA-Z0-9_-]{43}$/.test(code)) {
      setLookupError(
        t({
          en: "Enter the 43-character appointment link code.",
          vi: "Vui lòng nhập mã liên kết phiếu khám gồm 43 ký tự.",
        }),
      );
      return;
    }

    setIsLookingUp(true);
    setLookupError("");
    try {
      const response = await patientBookingService.traCuuPhieuKham(code);
      if (!response.thanhCong || !response.duLieu) {
        throw new Error(
          response.thongDiep ||
            t({
              en: "Appointment ticket not found.",
              vi: "Không tìm thấy phiếu khám.",
            }),
        );
      }
      navigate(`/phieu-kham/${encodeURIComponent(code)}`);
    } catch (error: unknown) {
      setLookupError(
        getErrorMessage(
          error,
          t({
            en: "Could not find this appointment. Check the code and try again.",
            vi: "Không tìm thấy lịch khám. Vui lòng kiểm tra mã và thử lại.",
          }),
        ),
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = {
      ...(!maTraCuu.trim()
        ? {
            maTraCuu: t({
              en: "Enter the appointment lookup code.",
              vi: "Vui lòng nhập mã tra cứu.",
            }),
          }
        : {}),
      ...(!soDienThoai.trim()
        ? {
            soDienThoai: t({
              en: "Enter the phone number used when booking.",
              vi: "Vui lòng nhập số điện thoại đã dùng khi đặt lịch.",
            }),
          }
        : {}),
    };
    setResendValidationErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsResending(true);
    setResendError("");
    setResendSuccess("");
    try {
      const response = await patientBookingService.capLaiLienKet({
        maTraCuu: maTraCuu.trim(),
        soDienThoai: soDienThoai.trim(),
      });
      if (!response.thanhCong) {
        throw new Error(
          response.thongDiep ||
            t({
              en: "Could not request the appointment link.",
              vi: "Không thể gửi yêu cầu cấp lại liên kết.",
            }),
        );
      }
      setResendSuccess(
        t({
          en: "If the information matches, the appointment link will be sent to the email used when booking.",
          vi: "Nếu thông tin khớp, liên kết phiếu khám sẽ được gửi đến email đã dùng khi đặt lịch.",
        }),
      );
    } catch (error: unknown) {
      setResendError(
        getErrorMessage(
          error,
          t({
            en: "Could not request the appointment link. Check the lookup code and phone number.",
            vi: "Không thể yêu cầu gửi liên kết. Vui lòng kiểm tra mã tra cứu và số điện thoại.",
          }),
        ),
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <Container>
          <div className={styles.content}>
            <section className={styles.intro}>
              <span className={styles.icon} aria-hidden="true">
                <CalendarCheck2 size={26} />
              </span>
              <h1 className={styles.title}>
                {t({ en: "My appointments", vi: "Lịch khám của tôi" })}
              </h1>
              <p className={styles.description}>
                {t({
                  en: "Open your appointment ticket to review, cancel, or reschedule your visit. No account is needed.",
                  vi: "Mở phiếu khám để xem, hủy hoặc đổi lịch. Bạn không cần tạo tài khoản.",
                })}
              </p>
            </section>

            <div className={styles.cards}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <Search size={19} aria-hidden="true" />
                  {t({ en: "Open appointment ticket", vi: "Mở phiếu khám" })}
                </h2>
                <p className={styles.cardDescription}>
                  {t({
                    en: "Enter the secure appointment link code from your confirmation email or booking page.",
                    vi: "Nhập mã liên kết bảo mật trong email xác nhận hoặc trang đặt lịch.",
                  })}
                </p>
                <form className={styles.form} onSubmit={handleLookup} noValidate>
                  <label className={styles.field} htmlFor="appointment-ticket-code">
                    {t({ en: "Appointment link code", vi: "Mã liên kết phiếu khám" })}
                    <input
                      id="appointment-ticket-code"
                      className={styles.input}
                      value={maPhieuKham}
                      onChange={(event) => {
                        setMaPhieuKham(event.target.value);
                        setLookupError("");
                      }}
                      maxLength={43}
                      minLength={43}
                      pattern="[a-zA-Z0-9_-]{43}"
                      autoComplete="off"
                      aria-invalid={Boolean(lookupError)}
                      aria-describedby={
                        lookupError ? "appointment-lookup-error" : "appointment-code-hint"
                      }
                      placeholder={vi ? "Mã gồm 43 ký tự" : "43-character code"}
                    />
                    <span id="appointment-code-hint" className={styles.hint}>
                      {t({
                        en: "The code is 43 characters long.",
                        vi: "Mã phiếu khám có 43 ký tự.",
                      })}
                    </span>
                  </label>
                  {lookupError && (
                    <p
                      id="appointment-lookup-error"
                      className={`${styles.message} ${styles.error}`}
                      role="alert"
                    >
                      {lookupError}
                    </p>
                  )}
                  <button className={styles.submit} type="submit" disabled={isLookingUp}>
                    {isLookingUp ? (
                      <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <ArrowRight size={17} aria-hidden="true" />
                    )}
                    {isLookingUp
                      ? t({ en: "Checking...", vi: "Đang kiểm tra..." })
                      : t({ en: "Check appointment", vi: "Kiểm tra lịch khám" })}
                  </button>
                </form>
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <Mail size={19} aria-hidden="true" />
                  {t({ en: "Lost your appointment link?", vi: "Mất liên kết phiếu khám?" })}
                </h2>
                <p className={styles.cardDescription}>
                  {t({
                    en: "Enter the lookup code and phone number used when booking. If they match, we will email the ticket link.",
                    vi: "Nhập mã tra cứu và số điện thoại đã dùng khi đặt lịch. Nếu khớp, hệ thống sẽ gửi liên kết phiếu khám qua email.",
                  })}
                </p>
                <form
                  className={styles.form}
                  onSubmit={(event) => void handleResend(event)}
                  noValidate
                >
                  <label className={styles.field} htmlFor="appointment-lookup-code">
                    {t({ en: "Lookup code", vi: "Mã tra cứu" })}
                    <input
                      id="appointment-lookup-code"
                      className={styles.input}
                      value={maTraCuu}
                      onChange={(event) => {
                        setMaTraCuu(event.target.value);
                        setResendValidationErrors((current) => ({
                          ...current,
                          maTraCuu: undefined,
                        }));
                        setResendError("");
                        setResendSuccess("");
                      }}
                      autoComplete="off"
                      aria-invalid={Boolean(resendValidationErrors.maTraCuu)}
                      aria-describedby={
                        resendValidationErrors.maTraCuu
                          ? "appointment-lookup-code-error"
                          : undefined
                      }
                    />
                    {resendValidationErrors.maTraCuu && (
                      <span
                        id="appointment-lookup-code-error"
                        className={`${styles.message} ${styles.error}`}
                        role="alert"
                      >
                        {resendValidationErrors.maTraCuu}
                      </span>
                    )}
                  </label>
                  <label className={styles.field} htmlFor="appointment-phone">
                    {t({ en: "Phone number used when booking", vi: "Số điện thoại đã dùng khi đặt lịch" })}
                    <input
                      id="appointment-phone"
                      className={styles.input}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={soDienThoai}
                      onChange={(event) => {
                        setSoDienThoai(event.target.value);
                        setResendValidationErrors((current) => ({
                          ...current,
                          soDienThoai: undefined,
                        }));
                        setResendError("");
                        setResendSuccess("");
                      }}
                      aria-invalid={Boolean(resendValidationErrors.soDienThoai)}
                      aria-describedby={
                        resendValidationErrors.soDienThoai
                          ? "appointment-phone-error"
                          : undefined
                      }
                    />
                    {resendValidationErrors.soDienThoai && (
                      <span
                        id="appointment-phone-error"
                        className={`${styles.message} ${styles.error}`}
                        role="alert"
                      >
                        {resendValidationErrors.soDienThoai}
                      </span>
                    )}
                  </label>
                  {resendError && (
                    <p className={`${styles.message} ${styles.error}`} role="alert">
                      {resendError}
                    </p>
                  )}
                  {resendSuccess && (
                    <p className={`${styles.message} ${styles.success}`} role="status">
                      {resendSuccess}
                    </p>
                  )}
                  <button className={styles.submit} type="submit" disabled={isResending}>
                    {isResending ? (
                      <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Mail size={17} aria-hidden="true" />
                    )}
                    {isResending
                      ? t({ en: "Sending request...", vi: "Đang gửi yêu cầu..." })
                      : t({ en: "Resend appointment link", vi: "Gửi lại liên kết phiếu khám" })}
                  </button>
                </form>
              </section>
            </div>

            <Link to="/appointment" className={styles.backLink}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t({ en: "Book an appointment", vi: "Đặt lịch khám" })}
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
