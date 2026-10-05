import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { Button } from "@/shared/components/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { ResetPasswordRequest } from "@/types/auth";
import styles from "../login-patient/LoginPagePatient.module.css";
import pageStyles from "./ResetPasswordPatient.module.css";

export function ResetPasswordPatient() {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) return;

    const request: ResetPasswordRequest = {
      token: searchParams.get("token") ?? "",
      newPassword,
    };
    if (!request.newPassword) return;

    setSubmitted(true);
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
                      ? "Thông tin mật khẩu mới đã được xác nhận."
                      : "Your new password details have been confirmed."}
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
                      minLength={8}
                      maxLength={128}
                      className={styles.input}
                      placeholder={
                        lang === "vi"
                          ? "Nhập mật khẩu mới"
                          : "Enter a new password"
                      }
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                    />
                    <p className={pageStyles.hint}>
                      {lang === "vi"
                        ? "Mật khẩu cần có ít nhất 8 ký tự."
                        : "Use at least 8 characters."}
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
                      minLength={8}
                      maxLength={128}
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
                  >
                    {lang === "vi" ? "Xác nhận" : "Confirm"}
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
