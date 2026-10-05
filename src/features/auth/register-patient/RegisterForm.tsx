import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import type { Lang } from "@/types/i18n";
import styles from "../login-patient/LoginPagePatient.module.css";

export interface PatientRegistrationData {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  soCCCD?: string;
}

type RegisterFormProps = {
  lang: Lang;
  onSubmit: (data: PatientRegistrationData) => void;
};

export function RegisterForm({ lang, onSubmit }: RegisterFormProps) {
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [soCCCD, setSoCCCD] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const trimmedName = hoTen.trim();
    if (!trimmedName) {
      setValidationError(
        lang === "vi"
          ? "Họ và tên không được để trống."
          : "Full name cannot be empty.",
      );
      return;
    }

    if (trimmedName.length > 150) {
      setValidationError(
        lang === "vi"
          ? "Họ và tên tối đa 150 ký tự."
          : "Full name cannot exceed 150 characters.",
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
      setValidationError(
        lang === "vi"
          ? "Email không hợp lệ (tối đa 255 ký tự)."
          : "Invalid email address (max 255 chars).",
      );
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(soDienThoai.trim())) {
      setValidationError(
        lang === "vi"
          ? "Số điện thoại phải đúng 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0912345678)."
          : "Phone number must be exactly 10 digits starting with 0.",
      );
      return;
    }

    if (matKhau.length < 6 || matKhau.length > 72) {
      setValidationError(
        lang === "vi"
          ? "Mật khẩu phải từ 6 đến 72 ký tự."
          : "Password must be between 6 and 72 characters.",
      );
      return;
    }

    if (matKhau !== confirmPassword) {
      setValidationError(
        lang === "vi"
          ? "Mật khẩu xác nhận không khớp."
          : "Passwords do not match.",
      );
      return;
    }

    const trimmedCCCD = soCCCD.trim();
    if (trimmedCCCD && !/^\d{9,12}$/.test(trimmedCCCD)) {
      setValidationError(
        lang === "vi"
          ? "Số CCCD/CMND không hợp lệ (phải gồm 9-12 chữ số)."
          : "Invalid ID/CCCD number (9-12 digits).",
      );
      return;
    }

    onSubmit({
      hoTen: trimmedName,
      email: normalizedEmail,
      matKhau,
      soDienThoai: soDienThoai.trim(),
      soCCCD: trimmedCCCD || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {validationError && (
        <div className="p-3 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {validationError}
        </div>
      )}

      {/* Họ và tên */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-fullname" className={styles.label}>
          {lang === "vi" ? "Họ và tên" : "Full Name"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          id="reg-fullname"
          type="text"
          autoComplete="name"
          maxLength={150}
          className={styles.input}
          placeholder={
            lang === "vi" ? "Nhập họ và tên đầy đủ" : "Enter your full name"
          }
          value={hoTen}
          onChange={(event) => {
            setValidationError(null);
            setHoTen(event.target.value);
          }}
          required
        />
        <span className="text-xs text-slate-400 text-right">
          {hoTen.length}/150
        </span>
      </div>

      {/* Email */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-email" className={styles.label}>
          {lang === "vi" ? "Email" : "Email Address"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          className={styles.input}
          placeholder={lang === "vi" ? "ten@domain.com" : "name@example.com"}
          value={email}
          onChange={(event) => {
            setValidationError(null);
            setEmail(event.target.value);
          }}
          required
        />
      </div>

      {/* Số điện thoại */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-phone" className={styles.label}>
          {lang === "vi" ? "Số điện thoại" : "Phone Number"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          id="reg-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          pattern="^0\d{9}$"
          maxLength={10}
          className={styles.input}
          placeholder={
            lang === "vi"
              ? "Đúng 10 chữ số, bắt đầu bằng số 0 (VD: 0912345678)"
              : "10 digits starting with 0"
          }
          value={soDienThoai}
          onChange={(event) => {
            setValidationError(null);
            setSoDienThoai(event.target.value.replace(/\D/g, ""));
          }}
          required
        />
      </div>

      {/* Mật khẩu */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-password" className={styles.label}>
          {lang === "vi" ? "Mật khẩu" : "Password"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          maxLength={72}
          className={styles.input}
          placeholder={
            lang === "vi"
              ? "Tối thiểu 6 ký tự, tối đa 72 ký tự"
              : "Min 6 characters, max 72 characters"
          }
          value={matKhau}
          onChange={(event) => {
            setValidationError(null);
            setMatKhau(event.target.value);
          }}
          required
        />
      </div>

      {/* Xác nhận mật khẩu */}
      <div className={styles.fieldGroup}>
        <label htmlFor="reg-confirm-password" className={styles.label}>
          {lang === "vi" ? "Xác nhận mật khẩu" : "Confirm Password"}{" "}
          <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          id="reg-confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          maxLength={72}
          className={styles.input}
          placeholder={
            lang === "vi" ? "Nhập lại mật khẩu đã nhập" : "Re-enter password"
          }
          value={confirmPassword}
          onChange={(event) => {
            setValidationError(null);
            setConfirmPassword(event.target.value);
          }}
          required
        />
      </div>

      {/* Số CCCD (Tùy chọn) */}
      <div className={styles.fieldGroup}>
        <div className="flex items-center justify-between">
          <label htmlFor="reg-cccd" className={styles.label}>
            {lang === "vi"
              ? "Số Căn cước công dân (CCCD)"
              : "Citizen ID (CCCD)"}
          </label>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {lang === "vi" ? "Tùy chọn" : "Optional"}
          </span>
        </div>
        <input
          id="reg-cccd"
          type="text"
          inputMode="numeric"
          maxLength={12}
          className={styles.input}
          placeholder={
            lang === "vi"
              ? "Nhập số CCCD (12 chữ số)"
              : "Enter 12-digit Citizen ID"
          }
          value={soCCCD}
          onChange={(event) => {
            setValidationError(null);
            setSoCCCD(event.target.value.replace(/\D/g, ""));
          }}
        />
        <p className="text-xs text-slate-500 leading-normal mt-0.5">
          {lang === "vi"
            ? "Dùng để hệ thống tra cứu và đối soát tự động liên kết các lịch hẹn/hồ sơ khám cũ đã đặt trước đó vào tài khoản mới."
            : "Used by the system to automatically look up and link previous appointments/medical records to your new account."}
        </p>
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className={styles.submitBtn}
      >
        {lang === "vi" ? "Đăng ký tài khoản" : "Create Account"}
      </Button>
    </form>
  );
}
