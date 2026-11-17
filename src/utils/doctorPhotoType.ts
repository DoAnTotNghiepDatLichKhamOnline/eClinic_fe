import type { LoaiAnhBacSi } from "@/types/common.type";

export const LOAI_ANH_OPTIONS: LoaiAnhBacSi[] = [
  "ANH_CONG_VIEC",
  "CHUNG_CHI",
  "GIAI_THUONG",
];

export function getLoaiAnhLabel(loai: LoaiAnhBacSi | string, vi: boolean): string {
  switch (loai) {
    case "CHUNG_CHI":
      return vi ? "Chứng chỉ y khoa" : "Medical Certificate";
    case "GIAI_THUONG":
      return vi ? "Giải thưởng & Danh hiệu" : "Award & Honor";
    case "ANH_CONG_VIEC":
    default:
      return vi ? "Ảnh hoạt động công tác" : "Work Activity";
  }
}

export function getLoaiAnhColor(loai: LoaiAnhBacSi | string) {
  switch (loai) {
    case "CHUNG_CHI":
      return {
        hex: "#0369a1",
        bg: "bg-sky-50",
        text: "text-sky-800",
        border: "border-sky-200",
      };
    case "GIAI_THUONG":
      return {
        hex: "#b45309",
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
      };
    case "ANH_CONG_VIEC":
    default:
      return {
        hex: "#12634d",
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
      };
  }
}
