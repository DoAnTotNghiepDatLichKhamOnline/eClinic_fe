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
