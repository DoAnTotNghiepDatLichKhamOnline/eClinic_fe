export type SpecialtyTab = "POPULAR" | "ALL" | "NOI" | "NGOAI" | "ME_BE";

export interface SpecialtyTabMeta {
  key: SpecialtyTab;
  labelVi: string;
  labelEn: string;
}

export const SPECIALTY_TABS: SpecialtyTabMeta[] = [
  { key: "POPULAR", labelVi: "Phổ biến", labelEn: "Popular" },
  { key: "ALL", labelVi: "Tất cả", labelEn: "All" },
  { key: "NOI", labelVi: "Chuyên khoa Nội", labelEn: "Internal Medicine" },
  { key: "NGOAI", labelVi: "Chuyên khoa Ngoại", labelEn: "Surgery & Orthopedics" },
  { key: "ME_BE", labelVi: "Mẹ & Bé", labelEn: "Mother & Baby" },
];

/** Bỏ dấu tiếng Việt và chuẩn hóa để so khớp từ khóa linh hoạt */
function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

const POPULAR_KEYWORDS = [
  "noi tong quat",
  "nhi",
  "tai mui hong",
  "da lieu",
  "san",
  "rang ham mat",
  "mat",
  "tim mach",
];

const GROUP_KEYWORDS: Record<Exclude<SpecialtyTab, "POPULAR" | "ALL">, string[]> = {
  NOI: [
    "noi",
    "tim mach",
    "tieu hoa",
    "than kinh",
    "ho hap",
    "than",
    "noi tiet",
    "co xuong khop",
    "da lieu",
    "truyen nhiem",
    "tam than",
    "lao",
  ],
  NGOAI: [
    "ngoai",
    "chan thuong",
    "chinh hinh",
    "phau thuat",
    "tiet nieu",
    "rang ham mat",
    "tai mui hong",
    "mat",
    "ung buou",
    "long nguc",
    "gay me",
  ],
  ME_BE: ["san", "phu khoa", "nhi", "so sinh", "hiem muon", "dinh duong nhi"],
};

export function matchesTab(name?: string | null, tab: SpecialtyTab = "ALL"): boolean {
  if (!name) return false;
  if (tab === "ALL") return true;

  const normalized = removeDiacritics(name);

  if (tab === "POPULAR") {
    return POPULAR_KEYWORDS.some((kw) => normalized.includes(kw));
  }

  const keywords = GROUP_KEYWORDS[tab];
  return keywords ? keywords.some((kw) => normalized.includes(kw)) : true;
}

export function getPopularSpecialties<T extends { tenChuyenKhoa: string }>(
  list: T[],
  limit = 8,
): T[] {
  if (!list || list.length <= limit) return list || [];

  const matched: T[] = [];
  const usedIds = new Set<string>();

  // 1. Thêm theo đúng thứ tự ưu tiên của 8 chuyên khoa phổ biến
  for (const kw of POPULAR_KEYWORDS) {
    const found = list.find((item) => {
      const norm = removeDiacritics(item.tenChuyenKhoa);
      return norm.includes(kw) && !usedIds.has(item.tenChuyenKhoa);
    });
    if (found) {
      matched.push(found);
      usedIds.add(found.tenChuyenKhoa);
      if (matched.length >= limit) break;
    }
  }

  // 2. Nếu chưa đủ 8, bù thêm các khoa đầu danh sách
  if (matched.length < limit) {
    for (const item of list) {
      if (!usedIds.has(item.tenChuyenKhoa)) {
        matched.push(item);
        usedIds.add(item.tenChuyenKhoa);
        if (matched.length >= limit) break;
      }
    }
  }

  return matched;
}

export function findGeneralInternal<T extends { tenChuyenKhoa: string }>(
  list: T[],
): T | undefined {
  if (!list || list.length === 0) return undefined;

  // Ưu tiên "Nội tổng quát", sau đó tới "Nội"
  const general = list.find((item) =>
    removeDiacritics(item.tenChuyenKhoa).includes("noi tong quat"),
  );
  if (general) return general;

  return list.find((item) =>
    removeDiacritics(item.tenChuyenKhoa).includes("noi"),
  );
}
