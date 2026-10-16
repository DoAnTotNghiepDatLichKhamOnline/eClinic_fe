import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { Button } from "@/shared/components/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";
import { authService } from "@/services/identity/authService";
import { notifyAuth } from "@/utils/authNotification";
import styles from "@/features/auth/login/LoginPagePatient.module.css";
import pageStyles from "./ResetPasswordPatient.module.css";

export function ResetPasswordPatient() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) return;

    const token = searchParams.get("token") ?? "";
    if (!token) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu mã xác thực" : "Invalid Token",
        lang === "vi"
          ? "Liên kết không hợp lệ hoặc thiếu mã token xác thực."
          : "Invalid reset token.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.datLaiMatKhau({
        token,
        matKhauMoi: newPassword,
      });

      if (response.thanhCong) {
        setSubmitted(true);
        notifyAuth(
          "success",
          lang === "vi"
            ? "Đổi mật khẩu thành công"
            : "Password Reset Successfully",
          lang === "vi"
            ? "Mật khẩu của bạn đã được cập nhật. Đang chuyển tới trang đăng nhập..."
            : "Your password has been updated. Redirecting to login...",
        );
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        throw new Error(response.thongDiep || "Đặt lại mật khẩu thất bại");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.thongDiep ||
        err?.message ||
        (lang === "vi"
          ? "Không thể đặt lại mật khẩu. Token có thể đã hết hạn hoặc không hợp lệ."
          : "Could not reset password. Token may have expired or is invalid.");
      notifyAuth(
        "error",
        lang === "vi" ? "Đặt lại mật khẩu thất bại" : "Reset Failed",
        msg,
      );
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
                  Tạo mật khẩu{" "}
                  <span className={styles.heroTitleHighlight}>mới</span>
                </>
              ) : (
                <>
                  Create a{" "}
                  <span className={styles.heroTitleHighlight}>
                    new password
                  </span>
                </>
              )}
            </h1>
            <p className={styles.heroSubtitle}>
              {lang === "vi"
                ? "Chọn mật khẩu mới an toàn để tiếp tục sử dụng tài khoản eClinic."
                : "Choose a secure new password to continue using your eClinic account."}
            </p>
          </section>

          <section className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={pageStyles.icon} aria-hidden="true">
                  <KeyRound size={22} />
                </div>
                <h2 className={styles.cardTitle}>
                  {lang === "vi" ? "Đặt lại mật khẩu" : "Reset password"}
                </h2>
                <p className={styles.cardSubtitle}>
                  {lang === "vi"
                    ? "Nhập mật khẩu mới và xác nhận lại để hoàn tất."
                    : "Enter your new password and confirm it to continue."}
                </p>
              </div>

              {submitted ? (
                <div className={pageStyles.successMessage} role="status">
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <p>
                    {lang === "vi"
                      ? "Mật khẩu của bạn đã được cập nhật thành công!"
                      : "Your new password has been successfully updated!"}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="new-password" className={styles.label}>
                      {lang === "vi" ? "Mật khẩu mới" : "New password"}
                    </label>
                    <input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      maxLength={72}
                      className={styles.input}
                      placeholder={
                        lang === "vi"
                          ? "Nhập mật khẩu mới"
                          : "Enter a new password"
                      }
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <p className={pageStyles.hint}>
                      {lang === "vi"
                        ? "Mật khẩu từ 6 đến 72 ký tự."
                        : "Use 6 to 72 characters."}
                    </p>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="confirm-password" className={styles.label}>
                      {lang === "vi" ? "Xác nhận mật khẩu" : "Confirm password"}
                    </label>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      maxLength={72}
                      className={styles.input}
                      placeholder={
                        lang === "vi"
                          ? "Nhập lại mật khẩu mới"
                          : "Enter the new password again"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      aria-invalid={passwordsMismatch}
                      aria-describedby={
                        passwordsMismatch ? "password-mismatch" : undefined
                      }
                      required
                      disabled={isSubmitting}
                    />
                    {passwordsMismatch && (
                      <p
                        id="password-mismatch"
                        className={pageStyles.error}
                        role="alert"
                      >
                        {lang === "vi"
                          ? "Mật khẩu xác nhận không khớp."
                          : "The passwords do not match."}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className={styles.submitBtn}
                    disabled={isSubmitting || passwordsMismatch}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {lang === "vi" ? "Đang cập nhật..." : "Updating..."}
                        </span>
                      </span>
                    ) : lang === "vi" ? (
                      "Xác nhận đổi mật khẩu"
                    ) : (
                      "Confirm Reset"
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
