import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Stethoscope,
  HeartPulse,
  Droplet,
  Eye,
  Bone,
  Brain,
  Sparkles,
  Activity,
} from "lucide-react";

/**
 * Phán đoán chuyên khoa có phải là Nhi khoa hay không
 */
export function isSpecialtyPediatric(name?: string | null): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return lower.includes("nhi") || lower.includes("pediatric");
}

/**
 * Icon đại diện cho chuyên khoa dựa theo tên
 */
export function getSpecialtyIcon(name?: string | null): LucideIcon {
  if (!name) return Stethoscope;
  const lower = name.toLowerCase();
  if (lower.includes("nhi") || lower.includes("pediatric")) return Baby;
  if (lower.includes("tim") || lower.includes("cardio")) return HeartPulse;
  if (lower.includes("da") || lower.includes("derma")) return Droplet;
  if (lower.includes("mắt") || lower.includes("ophthal")) return Eye;
  if (lower.includes("khớp") || lower.includes("xương") || lower.includes("ortho")) return Bone;
  if (lower.includes("thần kinh") || lower.includes("neuro")) return Brain;
  if (lower.includes("tai mũi họng") || lower.includes("ent")) return Sparkles;
  if (lower.includes("nội") || lower.includes("general")) return Stethoscope;
  return Activity;
}

/**
 * Tạo danh sách ngày sắp tới để chọn nhanh (mặc định 7 ngày tới)
 */
export function getUpcomingBookingDays(numDays = 7) {
  const days: {
    dateStr: string;
    dayNameVi: string;
    dayNameEn: string;
    displayDate: string;
    isToday: boolean;
  }[] = [];
  const today = new Date();

  const viDays = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const enDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < numDays; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const dayIdx = d.getDay();
    const dayNameVi = i === 0 ? "Hôm nay" : viDays[dayIdx];
    const dayNameEn = i === 0 ? "Today" : enDays[dayIdx];
    const displayDate = `${dd}/${mm}`;

    days.push({
      dateStr,
      dayNameVi,
      dayNameEn,
      displayDate,
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Tính số tuổi tính đến thời điểm khám (năm)
 */
export function calculateAgeInYears(dobString?: string, atDateString?: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;

  const compareDate = atDateString ? new Date(atDateString) : new Date();
  let years = compareDate.getFullYear() - dob.getFullYear();
  const m = compareDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && compareDate.getDate() < dob.getDate())) {
    years--;
  }
  return Math.max(0, years);
}

/**
 * Tính tuổi dạng chuỗi hiển thị thân thiện người dùng
 */
export function calculateAge(dobString?: string, lang: "vi" | "en" = "vi"): string {
  if (!dobString) return "";
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "";
  const today = new Date();

  dob.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (dob > today) {
    return lang === "vi"
      ? "Ngày sinh không thể ở tương lai"
      : "Birth date cannot be in the future";
  }

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    if (months === 0) {
      const diffTime = Math.abs(today.getTime() - dob.getTime());
      const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      return lang === "vi" ? `${diffDays} ngày tuổi` : `${diffDays} days old`;
    }
    return lang === "vi" ? `${months} tháng tuổi` : `${months} months old`;
  }

  if (years < 3 && months > 0) {
    return lang === "vi"
      ? `${years} tuổi ${months} tháng`
      : `${years} yrs ${months} mos`;
  }

  return lang === "vi" ? `${years} tuổi` : `${years} years old`;
}

/**
 * Định dạng thời gian từ ISO string (YYYY-MM-DDTHH:mm:ss) sang HH:mm - HH:mm
 */
export function formatSlotRange(startIso: string, endIso?: string): string {
  try {
    const startTime = startIso.includes("T")
      ? startIso.split("T")[1].slice(0, 5)
      : startIso.slice(0, 5);

    if (!endIso) {
      return startTime;
    }

    const endTime = endIso.includes("T")
      ? endIso.split("T")[1].slice(0, 5)
      : endIso.slice(0, 5);

    return `${startTime} - ${endTime}`;
  } catch {
    return startIso;
  }
}

/**
 * Định dạng số điện thoại tách khoảng trắng dễ đọc (0912 345 678)
 */
export function formatPhoneNumber(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

/**
 * Định dạng số CCCD tách khoảng trắng dễ đọc (0792 0100 1234)
 */
export function formatCccdNumber(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
}

/**
 * Tự động chèn dấu gạch chéo khi gõ ngày sinh (15081995 -> 15/08/1995)
 */
export function formatDobInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Chuyển đổi chuỗi DD/MM/YYYY hợp lệ sang ISO YYYY-MM-DD, nếu chưa đủ/không hợp lệ trả về null
 */
export function parseDobToIso(dobDisplay: string): string | null {
  const parts = dobDisplay.trim().split("/");
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);

  if (!day || !month || !year || parts[2].length !== 4) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const yyyy = String(year);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Chuyển đổi ISO YYYY-MM-DD sang DD/MM/YYYY hiển thị
 */
export function formatIsoToDob(isoDate?: string | null): string {
  if (!isoDate || !isoDate.includes("-")) return isoDate || "";
  const parts = isoDate.split("-");
  if (parts.length < 3) return isoDate;
  return `${parts[2].slice(0, 2)}/${parts[1]}/${parts[0]}`;
}

