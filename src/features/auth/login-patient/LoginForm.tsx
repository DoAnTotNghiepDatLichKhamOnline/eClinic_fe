import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { Lang } from "@/types/i18n";
import styles from "./LoginPagePatient.module.css";

type LoginFormProps = {
  lang: Lang;
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, password: string) => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
};

export function LoginForm({
  lang,
  email,
  onEmailChange,
  onSubmit,
  onForgotPassword,
  isLoading = false,
}: LoginFormProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e, password);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label htmlFor="login-email" className={styles.label}>
          {lang === "vi" ? "Địa chỉ Email" : "Email Address"}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          className={styles.input}
          placeholder={
            lang === "vi"
              ? "Nhập địa chỉ email của bạn"
              : "Enter your email address"
          }
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="login-password" className={styles.label}>
          {lang === "vi" ? "Mật khẩu" : "Password"}
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className={styles.input}
          placeholder={lang === "vi" ? "Nhập mật khẩu" : "Enter password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={isLoading}
        />
        <div className={styles.forgotWrapper}>
          <button
            type="button"
            className={styles.forgotBtn}
            onClick={onForgotPassword}
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
            <span>{lang === "vi" ? "Đang đăng nhập..." : "Logging in..."}</span>
          </span>
        ) : lang === "vi" ? (
          "Đăng nhập"
        ) : (
          "Log In"
        )}
      </Button>
    </form>
  );
}
