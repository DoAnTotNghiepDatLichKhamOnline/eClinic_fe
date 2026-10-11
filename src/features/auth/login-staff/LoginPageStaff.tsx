import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { notifyAuth } from "@/utils/authNotification";
import { identityService } from "@/services/identityService";
import { setAccessToken } from "@/utils/axiosClient";
import styles from "./LoginPageStaff.module.css";

export function LoginPageStaff({ role }: { role: "doctor" | "admin" }) {
  const { lang } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states - email & password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    try {
      const response = await identityService.dangNhap({
        email: email.trim(),
        matKhau: password,
      });

      if (!response.thanhCong || !response.duLieu) {
        throw new Error(response.thongDiep || "Đăng nhập không thành công");
      }

      const { accessToken, taiKhoan } = response.duLieu;

      // Kiểm tra đúng vai trò
      if (role === "doctor" && taiKhoan.vaiTro !== "BAC_SI") {
        throw new Error(
          lang === "vi"
            ? "Tài khoản này không có quyền truy cập cổng Bác sĩ."
            : "This account does not have Doctor access.",
        );
      }
      if (role === "admin" && taiKhoan.vaiTro !== "QUAN_TRI_VIEN") {
        throw new Error(
          lang === "vi"
            ? "Tài khoản này không có quyền truy cập cổng Quản trị viên."
            : "This account does not have Admin access.",
        );
      }

      setAccessToken(accessToken);

      login({
        id: String(taiKhoan.id),
        name: taiKhoan.hoTen,
        email: taiKhoan.email,
        phone: taiKhoan.soDienThoai || undefined,
        role: role,
      });

      notifyAuth(
        "success",
        lang === "vi"
          ? `Đăng nhập ${role === "doctor" ? "Bác sĩ" : "Admin"} thành công`
          : `${role === "doctor" ? "Doctor" : "Admin"} login successful`,
        lang === "vi" ? "Đang chuyển hướng..." : "Redirecting...",
      );

      setTimeout(() => {
        navigate(role === "doctor" ? "/doctor" : "/admin");
      }, 400);
    } catch (err: any) {
      const msg =
        err?.response?.data?.thongDiep ||
        err?.message ||
        (lang === "vi"
          ? "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
          : "Login failed. Please check your credentials.");
      notifyAuth(
        "error",
        lang === "vi" ? "Đăng nhập thất bại" : "Login Failed",
        msg,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      notifyAuth(
        "error",
        lang === "vi" ? "Chưa nhập email" : "Email Required",
        lang === "vi"
          ? "Vui lòng nhập địa chỉ email nhân viên trước khi yêu cầu khôi phục."
          : "Please enter your staff email before requesting recovery.",
      );
      return;
    }

    try {
      await identityService.quenMatKhau({ email: email.trim() });
      notifyAuth(
        "info",
        lang === "vi"
          ? "Đã gửi hướng dẫn khôi phục"
          : "Recovery instructions sent",
        lang === "vi"
          ? "Kiểm tra hộp thư email nội bộ của bạn để nhận liên kết đặt lại mật khẩu."
          : "Check your staff email inbox for the reset link.",
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.thongDiep ||
        (lang === "vi"
          ? "Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau."
          : "Could not send reset request. Please try again.");
      notifyAuth("error", "Lỗi", msg);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Link
        to="/entry"
        className={styles.backEntryBtn}
        aria-label={lang === "vi" ? "Quay lại trang chọn vai trò" : "Back to role selection"}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span>{lang === "vi" ? "Chọn vai trò" : "Role selection"}</span>
      </Link>

      <main className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {/* Left section: Staff Branding & Highlights */}
          <div className={styles.leftSection}>
            <div className={styles.brandTag}>
              <span className={styles.brandDot} />
              {lang === "vi"
                ? "Cổng Quản lý & Y tế eClinic"
                : "eClinic Management & Medical Portal"}
            </div>

            <h1 className={styles.heroTitle}>
              {lang === "vi" ? (
                <>
                  Cổng đăng nhập{" "}
                  <span className={styles.heroTitleHighlight}>
                    {role === "doctor" ? "Bác sĩ" : "Admin"}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.heroTitleHighlight}>
                    {role === "doctor" ? "Doctor" : "Admin"}
                  </span>{" "}
                  Portal
                </>
              )}
            </h1>

            <p className={styles.heroSubtitle}>
              {lang === "vi"
                ? role === "doctor"
                  ? "Dành cho Bác sĩ theo dõi lịch làm việc, tiếp nhận ca khám và ghi nhận kết quả điều trị bệnh nhân."
                  : "Dành cho Quản trị viên phân ca trực, quản lý danh mục y tế và giám sát toàn hệ thống."
                : role === "doctor"
                  ? "Access clinical workflows, patient bookings, and consultations."
                  : "Access staff administration, scheduling, and system operations."}
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <Check aria-hidden="true" size={14} />
                </span>
                <span>
                  {role === "doctor"
                    ? lang === "vi"
                      ? "Xem lịch trực và danh sách bệnh nhân khám theo ca"
                      : "View shifts and scheduled patient queues"
                    : lang === "vi"
                      ? "Quản trị danh mục chuyên khoa, phòng khám và bác sĩ"
                      : "Manage specialties, rooms, and doctor staff"}
                </span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <Check aria-hidden="true" size={14} />
                </span>
                <span>
                  {role === "doctor"
                    ? lang === "vi"
                      ? "Ghi chẩn đoán, toa thuốc và kết luận khám bệnh"
                      : "Record diagnosis, prescription, and findings"
                    : lang === "vi"
                      ? "Xếp lịch làm việc và phê duyệt yêu cầu đổi ca"
                      : "Configure shifts and approve schedule changes"}
                </span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <Check aria-hidden="true" size={14} />
                </span>
                <span>
                  {lang === "vi"
                    ? "Bảo mật tài khoản đa lớp, phân quyền chặt chẽ"
                    : "High-security multi-role access control"}
                </span>
              </div>
            </div>
          </div>

          {/* Right section: Staff login form */}
          <div className={styles.rightSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  {role === "doctor"
                    ? lang === "vi"
                      ? "Đăng nhập Bác sĩ"
                      : "Doctor Sign In"
                    : lang === "vi"
                      ? "Đăng nhập Quản trị viên"
                      : "Admin Sign In"}
                </h2>
                <p className={styles.cardSubtitle}>
                  {lang === "vi"
                    ? "Sử dụng email nội bộ của bạn"
                    : "Use your staff email address"}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="staff-email" className={styles.label}>
                    {lang === "vi" ? "Email nhân viên" : "Staff Email"}
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    autoComplete="email"
                    className={styles.input}
                    placeholder={
                      role === "doctor"
                        ? "bacsi@eclinic.vn"
                        : "admin@eclinic.vn"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="staff-password" className={styles.label}>
                    {lang === "vi" ? "Mật khẩu" : "Password"}
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    autoComplete="current-password"
                    className={styles.input}
                    placeholder={
                      lang === "vi" ? "Nhập mật khẩu" : "Enter password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <div className={styles.forgotWrapper}>
                    <button
                      type="button"
                      className={styles.forgotBtn}
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                    >
                      {lang === "vi" ? "Quên mật khẩu?" : "Forgot password?"}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === "vi" ? "Đang xác thực..." : "Authenticating..."}</span>
                    </span>
                  ) : lang === "vi" ? (
                    `Đăng nhập ${role === "doctor" ? "Bác sĩ" : "Admin"}`
                  ) : (
                    `Sign In as ${role === "doctor" ? "Doctor" : "Admin"}`
                  )}
                </Button>
              </form>

              <div className={styles.patientLinkWrapper}>
                <Link
                  to={role === "doctor" ? "/admin/login" : "/doctor/login"}
                  className={styles.patientLink}
                >
                  {role === "doctor"
                    ? lang === "vi"
                      ? "Đăng nhập Admin"
                      : "Admin Login"
                    : lang === "vi"
                      ? "Đăng nhập Bác sĩ"
                      : "Doctor Login"}
                </Link>
              </div>

              <div className={styles.patientLinkWrapper}>
                <Link to="/login" className={styles.patientLink}>
                  <ArrowLeft aria-hidden="true" size={16} />
                  {lang === "vi"
                    ? "Bạn là bệnh nhân? Đăng nhập tại đây"
                    : "Are you a patient? Log in here"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
