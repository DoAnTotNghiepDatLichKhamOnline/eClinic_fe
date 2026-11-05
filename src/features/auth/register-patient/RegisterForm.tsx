import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateCCCD,
} from "@/utils/formValidators";
import { validatePasswordMatch, FieldError } from "@/utils/passwordMatchValidator";
import type { Lang } from "@/types/i18n";
import styles from "@/features/auth/login/LoginPagePatient.module.css";

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
  isLoading?: boolean;
};

export function RegisterForm({
  lang,
  onSubmit,
  isLoading = false,
}: RegisterFormProps) {
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [soCCCD, setSoCCCD] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errName = validateFullName(hoTen, lang);
    const errEmail = validateEmail(email, lang);
    const errPhone = validatePhoneNumber(soDienThoai, lang);
    const errPw = validatePassword(matKhau, lang);
    const errConfirm = validatePasswordMatch(matKhau, confirmPassword, lang);
    const errCCCD = validateCCCD(soCCCD, lang, true);

    const newErrors = {
      hoTen: errName,
      email: errEmail,
      soDienThoai: errPhone,
      matKhau: errPw,
      confirmPassword: errConfirm,
      soCCCD: errCCCD,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    onSubmit({
      hoTen: hoTen.trim(),
      email: email.trim().toLowerCase(),
      matKhau,
      soDienThoai: soDienThoai.trim(),
      soCCCD: soCCCD.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
          className={`${styles.input} ${errors.hoTen ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={
            lang === "vi" ? "Nhập họ và tên đầy đủ" : "Enter your full name"
          }
          value={hoTen}
          onChange={(event) => {
            clearFieldError("hoTen");
            setHoTen(event.target.value);
          }}
          onBlur={() => {
            if (hoTen.trim()) {
              setErrors((prev) => ({ ...prev, hoTen: validateFullName(hoTen, lang) }));
            }
          }}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mt-1">
          <FieldError error={errors.hoTen} id="reg-fullname-error" />
          <span className="text-xs text-slate-400 ml-auto">
            {hoTen.length}/150
          </span>
        </div>
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
          className={`${styles.input} ${errors.email ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={lang === "vi" ? "ten@domain.com" : "name@example.com"}
          value={email}
          onChange={(event) => {
            clearFieldError("email");
            setEmail(event.target.value);
          }}
          onBlur={() => {
            if (email.trim()) {
              setErrors((prev) => ({ ...prev, email: validateEmail(email, lang) }));
            }
          }}
          disabled={isLoading}
        />
        <FieldError error={errors.email} id="reg-email-error" />
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
          maxLength={10}
          className={`${styles.input} ${errors.soDienThoai ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={
            lang === "vi"
              ? "Đúng 10 chữ số, bắt đầu bằng số 0 (VD: 0912345678)"
              : "10 digits starting with 0"
          }
          value={soDienThoai}
          onChange={(event) => {
            clearFieldError("soDienThoai");
            setSoDienThoai(event.target.value.replace(/\D/g, ""));
          }}
          onBlur={() => {
            if (soDienThoai.trim()) {
              setErrors((prev) => ({ ...prev, soDienThoai: validatePhoneNumber(soDienThoai, lang) }));
            }
          }}
          disabled={isLoading}
        />
        <FieldError error={errors.soDienThoai} id="reg-phone-error" />
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
          className={`${styles.input} ${errors.matKhau ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={
            lang === "vi"
              ? "Tối thiểu 6 ký tự, tối đa 72 ký tự"
              : "Min 6 characters, max 72 characters"
          }
          value={matKhau}
          onChange={(event) => {
            clearFieldError("matKhau");
            setMatKhau(event.target.value);
          }}
          onBlur={() => {
            if (matKhau) {
              setErrors((prev) => ({ ...prev, matKhau: validatePassword(matKhau, lang) }));
            }
          }}
          disabled={isLoading}
        />
        <FieldError error={errors.matKhau} id="reg-password-error" />
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
          className={`${styles.input} ${errors.confirmPassword ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={
            lang === "vi" ? "Nhập lại mật khẩu đã nhập" : "Re-enter password"
          }
          value={confirmPassword}
          onChange={(event) => {
            clearFieldError("confirmPassword");
            setConfirmPassword(event.target.value);
          }}
          onBlur={() => {
            if (confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: validatePasswordMatch(matKhau, confirmPassword, lang) }));
            }
          }}
          disabled={isLoading}
        />
        <FieldError error={errors.confirmPassword} id="reg-confirm-error" />
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
          className={`${styles.input} ${errors.soCCCD ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200" : ""}`}
          placeholder={
            lang === "vi"
              ? "Nhập số CCCD (12 chữ số)"
              : "Enter 12-digit Citizen ID"
          }
          value={soCCCD}
          onChange={(event) => {
            clearFieldError("soCCCD");
            setSoCCCD(event.target.value.replace(/\D/g, ""));
          }}
          onBlur={() => {
            if (soCCCD.trim()) {
              setErrors((prev) => ({ ...prev, soCCCD: validateCCCD(soCCCD, lang, true) }));
            }
          }}
          disabled={isLoading}
        />
        <FieldError error={errors.soCCCD} id="reg-cccd-error" />
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {lang === "vi"
            ? "Cung cấp CCCD giúp hệ thống tự động liên kết các hồ sơ và lịch hẹn đã khám trước đây của bạn."
            : "Providing your CCCD links previous appointments automatically."}
        </p>
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
            <span>{lang === "vi" ? "Đang xử lý..." : "Processing..."}</span>
          </span>
        ) : lang === "vi" ? (
          "Đăng ký tài khoản"
        ) : (
          "Register Account"
        )}
      </Button>
    </form>
  );
}
