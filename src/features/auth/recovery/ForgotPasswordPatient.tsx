import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { Button } from "@/shared/components/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";
import { authService } from "@/services/identity/authService";
import styles from "@/features/auth/login/LoginPagePatient.module.css";
import pageStyles from "./ForgotPasswordPatient.module.css";

const genericSuccessMessage =
  "Nếu email đã đăng ký trong hệ thống eClinic, liên kết đặt lại mật khẩu đã được gửi đến hộp thư của bạn.";

export function ForgotPasswordPatient() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await authService.quenMatKhau({ email: email.trim() });
      setSubmitted(true);
    } catch {
      // Theo nguyên tắc bảo mật, hiển thị thông báo chung ngay cả khi email không tồn tại
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
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
                ? "Bảo mật tài khoản eClinic"
                : "eClinic Account Security"}
            </div>
            <h1 className={styles.heroTitle}>
              {lang === "vi" ? (
                <>
                  Khôi phục quyền truy cập{" "}
                  <span className={styles.heroTitleHighlight}>an toàn</span>
                </>
              ) : (
                <>
                  Restore access{" "}
                  <span className={styles.heroTitleHighlight}>securely</span>
                </>
              )}
            </h1>
            <p className={styles.heroSubtitle}>
              {lang === "vi"
                ? "Nhập email đã đăng ký. Hệ thống sẽ gửi cho bạn liên kết an toàn để đặt lại mật khẩu."
                : "Enter your registered email. If the account is eligible, you will receive a password reset link."}
            </p>
          </section>

          <section className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={pageStyles.icon} aria-hidden="true">
                  <Mail size={22} />
                </div>
                <h2 className={styles.cardTitle}>
                  {lang === "vi" ? "Quên mật khẩu" : "Forgot password"}
                </h2>
                <p className={styles.cardSubtitle}>
                  {lang === "vi"
                    ? "Chúng tôi sẽ gửi hướng dẫn khôi phục đến email của bạn."
                    : "We will send recovery instructions to your email."}
                </p>
              </div>

              {submitted ? (
                <div className={pageStyles.successMessage} role="status">
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <p>
                    {lang === "vi"
                      ? genericSuccessMessage
                      : "If an account exists for this email, a password reset link has been sent to your inbox."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label
                      htmlFor="forgot-password-email"
                      className={styles.label}
                    >
                      {lang === "vi" ? "Địa chỉ email" : "Email address"}
                    </label>
                    <input
                      id="forgot-password-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={255}
                      className={styles.input}
                      placeholder={
                        lang === "vi"
                          ? "Nhập email đã đăng ký"
                          : "Enter your registered email"
                      }
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className={pageStyles.securityNote}>
                    {lang === "vi"
                      ? "Liên kết đặt lại mật khẩu có hiệu lực trong 15 phút và chỉ sử dụng một lần."
                      : "The password reset link is valid for 15 minutes and can only be used once."}
                  </p>
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {lang === "vi" ? "Đang gửi..." : "Sending..."}
                        </span>
                      </span>
                    ) : lang === "vi" ? (
                      "Gửi liên kết khôi phục"
                    ) : (
                      "Send Recovery Link"
                    )}
                  </Button>
                </form>
              )}

              <div className={styles.registerLinkWrapper}>
                <Link to="/login" className={pageStyles.backLink}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  {lang === "vi" ? "Quay lại đăng nhập" : "Back to login"}
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
