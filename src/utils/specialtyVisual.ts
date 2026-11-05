import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Baby,
  Eye,
  Bone,
  Brain,
  Droplet,
  Stethoscope,
  Activity,
  Ear,
  Flower2,
  Smile,
} from "lucide-react";

export interface SpecialtyVisual {
  icon: LucideIcon;
  tint: string;
  color: string;
}

/**
 * Returns the standardized icon, background tint, and brand color
 * for all medical specialties in eClinic.
 */
export function getSpecialtyVisual(tenChuyenKhoa: string): SpecialtyVisual {
  const lower = (tenChuyenKhoa || "").toLowerCase();

  // 1. Tim mạch
  if (lower.includes("tim")) {
    return { icon: Heart, tint: "#FBEAEC", color: "#e11d48" };
  }

  // 2. Nhi khoa
  if (lower.includes("nhi")) {
    return { icon: Baby, tint: "#FFF6E0", color: "#d97706" };
  }

  // 3. Mắt / Nhãn khoa
  if (lower.includes("mắt") || lower.includes("nhãn")) {
    return { icon: Eye, tint: "#E6F7F5", color: "#0d9488" };
  }

  // 4. Tai Mũi Họng
  if (
    lower.includes("tai") ||
    lower.includes("mũi") ||
    lower.includes("họng") ||
    lower.includes("ent")
  ) {
    return { icon: Ear, tint: "#E6F4F8", color: "#0891b2" };
  }

  // 5. Sản phụ khoa
  if (
    lower.includes("sản") ||
    lower.includes("phụ") ||
    lower.includes("thai") ||
    lower.includes("sinh sản")
  ) {
    return { icon: Flower2, tint: "#FDF2F8", color: "#db2777" };
  }

  // 6. Răng Hàm Mặt / Nha khoa
  if (
    lower.includes("răng") ||
    lower.includes("hàm") ||
    lower.includes("mặt") ||
    lower.includes("nha")
  ) {
    return { icon: Smile, tint: "#F3E8FF", color: "#7c3aed" };
  }

  // 7. Da liễu
  if (lower.includes("da") || lower.includes("liễu")) {
    return { icon: Droplet, tint: "#E9F7EF", color: "#059669" };
  }

  // 8. Xương khớp / Chỉnh hình
  if (
    lower.includes("xương") ||
    lower.includes("khớp") ||
    lower.includes("chỉnh hình")
  ) {
    return { icon: Bone, tint: "#EAF1FB", color: "#2563eb" };
  }

  // 9. Thần kinh
  if (lower.includes("não") || lower.includes("thần kinh")) {
    return { icon: Brain, tint: "#F5F3FF", color: "#9333ea" };
  }

  // 10. Nội khoa / Tổng quát / Đa khoa
  if (
    lower.includes("nội") ||
    lower.includes("tổng quát") ||
    lower.includes("đa khoa")
  ) {
    return { icon: Stethoscope, tint: "#F1EEE9", color: "#475569" };
  }

  // Default fallback
  return { icon: Activity, tint: "#e8f3ef", color: "#1a7a67" };
}
