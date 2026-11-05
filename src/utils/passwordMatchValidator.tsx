import { AlertCircle } from "lucide-react";
import type { Lang } from "./formValidators";

/**
 * Validates that two passwords match.
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
  lang: Lang = "vi",
): string | null {
  if (!confirmPassword) {
    return lang === "vi"
      ? "Vui lòng xác nhận lại mật khẩu."
      : "Please confirm your password.";
  }
  if (password !== confirmPassword) {
    return lang === "vi"
      ? "Mật khẩu xác nhận không khớp."
      : "Passwords do not match.";
  }
  return null;
}

export interface FieldErrorProps {
  error?: string | null;
  id?: string;
  className?: string;
}

/**
 * Accessible inline field error message displayed directly below input text.
 */
export function FieldError({ error, id, className = "" }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      role="alert"
      className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-in fade-in duration-150 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}
