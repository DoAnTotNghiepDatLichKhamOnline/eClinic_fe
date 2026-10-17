import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { notifyAuth } from "@/utils/authNotification";
import { LoginForm } from "./LoginForm";
import styles from "./LoginPagePatient.module.css";

export function LoginPagePatient() {
  const { lang } = useLanguage();
  const { loginWithCredentials, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = (location.state as { from?: unknown } | null)?.from;
  const redirectTo =
    typeof requestedPath === "string" &&
    (requestedPath === "/patient" || requestedPath.startsWith("/patient/"))
      ? requestedPath
      : "/home";

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent, password: string) => {
    e.preventDefault();
    if (!loginEmail.trim() || !password) return;

    setIsLoading(true);
    try {
      await loginWithCredentials({
        email: loginEmail.trim(),
        matKhau: password,
      });

      notifyAuth(
        "success",
        lang === "vi" ? "Đăng nhập thành công" : "Login successful",
        lang === "vi" ? "Chào mừng bạn quay trở lại eClinic." : "Welcome back to eClinic.",
      );

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 400);
    } catch (err: any) {
      const msg =
        err?.response?.data?.thongDiep ||
        err?.message ||
        (lang === "vi"
          ? "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu."
          : "Login failed. Please check your credentials.");
      notifyAuth(
        "error",
        lang === "vi" ? "Đăng nhập không thành công" : "Login Failed",
        msg,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleGoogleLogin = async () => {
    const token = window.prompt(
      lang === "vi"
        ? "Nhập Google ID Token để đăng nhập:"
        : "Enter Google ID Token to sign in:",
    );
    if (!token?.trim()) return;

    setIsLoading(true);
    try {
      await loginWithGoogle(token.trim());
      notifyAuth(
        "success",
        lang === "vi" ? "Đăng nhập Google thành công" : "Google sign-in successful",
        lang === "vi" ? "Chào mừng bạn đến với eClinic." : "Welcome to eClinic.",
      );
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 400);
    } catch (err: any) {
      const msg =
        err?.response?.data?.thongDiep ||
        err?.message ||
        (lang === "vi" ? "Đăng nhập Google thất bại." : "Google login failed.");
      notifyAuth("error", "Google Sign-in", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {/* Left section: Branding & Highlights */}
          <div className={styles.leftSection}>
            <div className={styles.brandTag}>
              <span className={styles.brandDot} />
              {lang === "vi"
                ? "Hệ thống y tế điện tử eClinic"
                : "eClinic Healthcare System"}
            </div>

            <h1 className={styles.heroTitle}>
              {lang === "vi" ? (
                <>
                  Chăm sóc sức khỏe{" "}
                  <span className={styles.heroTitleHighlight}>toàn diện</span>{" "}
                  cùng eClinic
                </>
              ) : (
                <>
                  Comprehensive{" "}
                  <span className={styles.heroTitleHighlight}>Healthcare</span>{" "}
                  with eClinic
                </>
              )}
            </h1>

            <p className={styles.heroSubtitle}>
              {lang === "vi"
                ? "Đăng nhập để đặt lịch khám, theo dõi hồ sơ sức khỏe và kết nối với đội ngũ y tế eClinic."
                : "Log in to book appointments, follow your health records, and connect with eClinic care teams."}
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <Check aria-hidden="true" size={14} />
                </span>
                <span>
                  {lang === "vi"
                    ? "Đặt lịch khám nhanh chóng với bác sĩ hàng đầu"
                    : "Quick appointment booking with top doctors"}
                </span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <Check aria-hidden="true" size={14} />
                </span>
                <span>
                  {lang === "vi"
                    ? "Quản lý hồ sơ y tế bảo mật, liên kết tự động qua CCCD"
                    : "Secure medical records linked via Citizen ID"}
                </span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <Check aria-hidden="true" size={14} />
                </span>
                <span>
                  {lang === "vi"
                    ? "Tra cứu phiếu khám và kết quả xét nghiệm 24/7"
                    : "Look up exam vouchers and medical results 24/7"}
                </span>
              </div>
            </div>
          </div>

          {/* Right section: Patient login */}
          <div className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  {lang === "vi" ? "Đăng nhập bệnh nhân" : "Patient Login"}
                </h2>
                <p className={styles.cardSubtitle}>
                  {lang === "vi"
                    ? "Chào mừng bạn quay lại eClinic"
                    : "Welcome back to eClinic"}
                </p>
              </div>

              <LoginForm
                lang={lang}
                email={loginEmail}
                onEmailChange={setLoginEmail}
                onSubmit={handleLoginSubmit}
                onForgotPassword={handleForgotPassword}
                onGoogleLogin={handleGoogleLogin}
                isLoading={isLoading}
              />

              <div className={styles.registerLinkWrapper}>
                <span>
                  {lang === "vi"
                    ? "Chưa có tài khoản?"
                    : "Don't have an account?"}
                </span>
                <Link to="/register" className={styles.staffLink}>
                  {lang === "vi" ? "Đăng ký ngay" : "Create an account"}
                </Link>
              </div>

              <div className={styles.staffLinkWrapper}>
                <Link to="/doctor/login" className={styles.staffLink}>
                  {lang === "vi"
                    ? "Đăng nhập dành cho Admin & Bác sĩ"
                    : "Admin & Doctor Login"}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
