import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { authService } from "@/services/identity/authService";
import { RegisterForm } from "./RegisterForm";
import type { PatientRegistrationData } from "./RegisterForm";
import styles from "@/features/auth/login/LoginPagePatient.module.css";

export function RegisterPagePatient() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResendingVerification, setIsResendingVerification] =
    useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  const handleRegisterSubmit = async (data: PatientRegistrationData) => {
    setIsSubmitting(true);
    try {
      const response = await authService.dangKy({
        hoTen: data.hoTen,
        email: data.email,
        matKhau: data.matKhau,
        soDienThoai: data.soDienThoai,
        cccd: data.soCCCD || undefined,
      });

      if (response.thanhCong) {
        setRegisteredEmail(data.email);
      } else {
        throw new Error(response.thongDiep || "Đăng ký không thành công");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.thongDiep ||
        err?.message ||
        (lang === "vi"
          ? "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."
          : "Registration failed. Please check your details.");
      notifyAuth(
        "error",
        lang === "vi" ? "Đăng ký không thành công" : "Registration Failed",
        msg,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail || isResendingVerification) return;
    setIsResendingVerification(true);
    setResendMessage("");
    setResendError("");
    try {
      const response = await authService.guiLaiXacThuc({
        email: registeredEmail,
      });
      if (!response.thanhCong) {
        throw new Error(response.thongDiep || "Resend verification failed");
      }
      setResendMessage(
        lang === "vi"
          ? "Nếu tài khoản có thể nhận email, hệ thống đã gửi liên kết xác thực mới."
          : "A new verification link has been sent if the account can receive one.",
      );
    } catch (err: unknown) {
      setResendError(
        (err as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (err instanceof Error
            ? err.message
            : lang === "vi"
              ? "Không thể gửi lại liên kết xác thực."
              : "Could not resend the verification link."),
      );
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          <section className={styles.leftSection}>
            <div className={styles.brandTag}>
              <span className={styles.brandDot} />
              {lang === "vi"
                ? "Tài khoản bệnh nhân eClinic"
                : "eClinic Patient Account"}
            </div>
            <h1 className={styles.heroTitle}>
              {lang === "vi" ? (
                <>
                  Bắt đầu hành trình chăm sóc sức khỏe{" "}
                  <span className={styles.heroTitleHighlight}>chủ động</span>
                </>
              ) : (
                <>
                  Start your{" "}
                  <span className={styles.heroTitleHighlight}>proactive</span>{" "}
                  care journey
                </>
              )}
            </h1>
            <p className={styles.heroSubtitle}>
              {lang === "vi"
                ? "Tạo tài khoản để quản lý thông tin cá nhân, hồ sơ sức khỏe và kết nối thuận tiện hơn với dịch vụ y tế eClinic."
                : "Create an account to manage your details, medical records, and connect with eClinic care teams."}
            </p>
          </section>

          <section className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  {lang === "vi"
                    ? "Tạo tài khoản bệnh nhân"
                    : "Create Patient Account"}
                </h2>
                <p className={styles.cardSubtitle}>
                  {lang === "vi"
                    ? "Điền thông tin của bạn để đăng ký"
                    : "Enter your details to register"}
                </p>
              </div>

              {registeredEmail ? (
                <div className="space-y-4" role="status">
                  <p className="text-sm leading-6 text-slate-700">
                    {lang === "vi"
                      ? `Tài khoản ${registeredEmail} đã được tạo. Hãy kiểm tra hộp thư để kích hoạt tài khoản.`
                      : `Your account ${registeredEmail} has been created. Check your inbox to activate it.`}
                  </p>
                  {resendMessage && (
                    <p className="text-sm text-emerald-800" aria-live="polite">
                      {resendMessage}
                    </p>
                  )}
                  {resendError && (
                    <p className="text-sm text-rose-700" role="alert">
                      {resendError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => void handleResendVerification()}
                      disabled={isResendingVerification}
                    >
                      {isResendingVerification
                        ? lang === "vi"
                          ? "Đang gửi..."
                          : "Sending..."
                        : lang === "vi"
                          ? "Gửi lại liên kết xác thực"
                          : "Resend verification link"}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => navigate("/login")}
                    >
                      {lang === "vi" ? "Đến trang đăng nhập" : "Go to sign in"}
                    </button>
                  </div>
                </div>
              ) : (
                <RegisterForm
                  lang={lang}
                  onSubmit={handleRegisterSubmit}
                  isLoading={isSubmitting}
                />
              )}

              <div className={styles.registerLinkWrapper}>
                <span>
                  {lang === "vi"
                    ? "Đã có tài khoản?"
                    : "Already have an account?"}
                </span>
                <Link to="/login" className={styles.staffLink}>
                  {lang === "vi" ? "Đăng nhập ngay" : "Log in"}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
