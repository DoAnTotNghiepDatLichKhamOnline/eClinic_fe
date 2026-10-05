import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { RegisterForm } from "./RegisterForm";
import type { PatientRegistrationData } from "./RegisterForm";
import styles from "../login-patient/LoginPagePatient.module.css";

export function RegisterPagePatient() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const handleRegisterSubmit = (data: PatientRegistrationData) => {
    notifyAuth(
      "success",
      lang === "vi"
        ? "Đăng ký tài khoản thành công!"
        : "Registration successful!",
      lang === "vi"
        ? `Tài khoản ${data.hoTen} (${data.email}) đã được khởi tạo. Đang chuyển đến trang đăng nhập...`
        : `Account ${data.hoTen} (${data.email}) created. Redirecting to login...`,
    );
    setTimeout(() => {
      navigate("/login");
    }, 1200);
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
                ? "Tạo tài khoản để quản lý thông tin cá nhân và kết nối thuận tiện hơn với dịch vụ y tế."
                : "Create an account to manage your details and connect with care more easily."}
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

              <RegisterForm lang={lang} onSubmit={handleRegisterSubmit} />

              <div className={styles.registerLinkWrapper}>
                <span>
                  {lang === "vi"
                    ? "Đã có tài khoản?"
                    : "Already have an account?"}
                </span>
                <Link to="/login" className={styles.staffLink}>
                  {lang === "vi" ? "Đăng nhập" : "Log in"}
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
