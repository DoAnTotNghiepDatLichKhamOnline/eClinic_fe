export type Lang = "vi" | "en";

/**
 * Validates full name: required, max 150 chars.
 */
export function validateFullName(name: string, lang: Lang): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return lang === "vi"
      ? "Họ và tên không được để trống."
      : "Full name is required.";
  }
  if (trimmed.length > 150) {
    return lang === "vi"
      ? "Họ và tên tối đa 150 ký tự."
      : "Full name must not exceed 150 characters.";
  }
  return null;
}

/**
 * Validates email address: required, standard regex, max 255 chars.
 */
export function validateEmail(email: string, lang: Lang): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return lang === "vi"
      ? "Địa chỉ email không được để trống."
      : "Email address is required.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed) || trimmed.length > 255) {
    return lang === "vi"
      ? "Địa chỉ email không đúng định dạng (VD: example@email.com)."
      : "Invalid email format (e.g. example@email.com).";
  }
  return null;
}

/**
 * Validates password: required, 6 to 72 chars.
 */
export function validatePassword(password: string, lang: Lang): string | null {
  if (!password) {
    return lang === "vi"
      ? "Mật khẩu không được để trống."
      : "Password is required.";
  }
  if (password.length < 6) {
    return lang === "vi"
      ? "Mật khẩu phải có ít nhất 6 ký tự."
      : "Password must be at least 6 characters.";
  }
  if (password.length > 72) {
    return lang === "vi"
      ? "Mật khẩu tối đa 72 ký tự."
      : "Password must not exceed 72 characters.";
  }
  return null;
}

/**
 * Validates Vietnamese phone number: 10 digits starting with 0.
 */
export function validatePhoneNumber(phone: string, lang: Lang): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return lang === "vi"
      ? "Số điện thoại không được để trống."
      : "Phone number is required.";
  }
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(trimmed)) {
    return lang === "vi"
      ? "Số điện thoại phải đúng 10 chữ số và bắt đầu bằng số 0 (VD: 0912345678)."
      : "Phone number must be exactly 10 digits starting with 0.";
  }
  return null;
}

/**
 * Validates CCCD / Citizen ID: 12 digits.
 */
export function validateCCCD(
  cccd: string,
  lang: Lang,
  optional = false,
): string | null {
  const trimmed = cccd.trim();
  if (!trimmed) {
    if (optional) return null;
    return lang === "vi"
      ? "Số CCCD không được để trống."
      : "Citizen ID is required.";
  }
  const cccdRegex = /^\d{12}$/;
  if (!cccdRegex.test(trimmed)) {
    return lang === "vi"
      ? "Số CCCD phải gồm đúng 12 chữ số."
      : "Citizen ID must be exactly 12 digits.";
  }
  return null;
}

/**
 * Validates appointment lookup code / ticket code.
 */
export function validateAppointmentCode(code: string, lang: Lang): string | null {
  const trimmed = code.trim();
  if (!trimmed) {
    return lang === "vi"
      ? "Vui lòng nhập mã phiếu khám hoặc mã tra cứu."
      : "Please enter an appointment code or lookup code.";
  }
  if (trimmed.length < 4) {
    return lang === "vi"
      ? "Mã tra cứu không hợp lệ (tối thiểu 4 ký tự)."
      : "Lookup code is too short (min 4 characters).";
  }
  return null;
}

/**
 * Validates medical book code (e.g. SK-1001 or hash).
 */
export function validateMedicalBookCode(code: string, lang: Lang): string | null {
  const trimmed = code.trim();
  if (!trimmed) {
    return lang === "vi"
      ? "Vui lòng nhập mã sổ khám bệnh."
      : "Please enter a medical book code.";
  }
  if (trimmed.length < 3) {
    return lang === "vi"
      ? "Mã sổ khám không hợp lệ (tối thiểu 3 ký tự)."
      : "Invalid medical record code (min 3 characters).";
  }
  return null;
}

/**
 * Validates last 4 digits of phone number for verification unlock.
 */
export function validatePhoneLast4(digits: string, lang: Lang): string | null {
  const trimmed = digits.trim();
  if (!trimmed) {
    return lang === "vi"
      ? "Vui lòng nhập 4 số cuối số điện thoại."
      : "Please enter the last 4 digits of your phone number.";
  }
  if (!/^\d{4}$/.test(trimmed)) {
    return lang === "vi"
      ? "Vui lòng nhập chính xác 4 chữ số."
      : "Must be exactly 4 digits.";
  }
  return null;
}
