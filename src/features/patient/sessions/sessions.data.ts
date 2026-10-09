import type { PhienDangNhapResponse } from "@/types/auth.type";

export interface SessionItem extends PhienDangNhapResponse {
  loai?: "desktop" | "mobile";
  ip?: string;
  viTri?: string;
}

export const MOCK_SESSIONS: SessionItem[] = [
  {
    id: "current-1",
    thietBi: "Chrome 128 · Windows 11",
    dangNhapLuc: "2026-10-09T08:15:00Z",
    hoatDongLuc: "2026-10-10T00:10:00Z",
    hetHanLuc: "2026-11-09T08:15:00Z",
    hienTai: true,
    loai: "desktop",
    ip: "118.70.125.44",
    viTri: "TP. Hồ Chí Minh, Việt Nam",
  },
  {
    id: "sess-2",
    thietBi: "Safari · iPhone 15 Pro",
    dangNhapLuc: "2026-10-07T14:30:00Z",
    hoatDongLuc: "2026-10-07T19:45:00Z",
    hetHanLuc: "2026-11-07T14:30:00Z",
    hienTai: false,
    loai: "mobile",
    ip: "14.241.85.12",
    viTri: "Hà Nội, Việt Nam",
  },
  {
    id: "sess-3",
    thietBi: "Firefox 130 · macOS Sonoma",
    dangNhapLuc: "2026-10-05T09:00:00Z",
    hoatDongLuc: "2026-10-05T11:20:00Z",
    hetHanLuc: "2026-11-05T09:00:00Z",
    hienTai: false,
    loai: "desktop",
    ip: "203.162.4.190",
    viTri: "Đà Nẵng, Việt Nam",
  },
  {
    id: "sess-4",
    thietBi: "Chrome · Android 14",
    dangNhapLuc: "2026-10-01T20:00:00Z",
    hoatDongLuc: "2026-10-01T20:30:00Z",
    hetHanLuc: "2026-11-01T20:00:00Z",
    hienTai: false,
    loai: "mobile",
    ip: "27.72.98.66",
    viTri: "Cần Thơ, Việt Nam",
  },
];
