import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { authService } from "@/services/identity/authService";
import { RegisterForm } from "./RegisterForm";
import type { PatientRegistrationData } from "./RegisterForm";
import styles from "../login-patient/LoginPagePatient.module.css";

export function RegisterPagePatient() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        notifyAuth(
          "success",
          lang === "vi"
            ? "Đăng ký tài khoản thành công!"
            : "Registration successful!",
          lang === "vi"
            ? `Tài khoản ${data.hoTen} (${data.email}) đã được khởi tạo. Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản.`
            : `Account ${data.hoTen} created. Please check your email to activate your account.`,
        );
        setTimeout(() => {
          navigate("/login");
        }, 1200);
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

              <RegisterForm
                lang={lang}
                onSubmit={handleRegisterSubmit}
                isLoading={isSubmitting}
              />

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
