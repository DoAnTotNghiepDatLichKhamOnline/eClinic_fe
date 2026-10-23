import type { PhieuKhamResponse } from "@/types/booking.type";

function formatIcsDateTime(dateStr: string, timeStr: string): string {
  // dateStr: YYYY-MM-DD, timeStr: HH:mm or HH:mm:ss
  const cleanDate = dateStr.replace(/-/g, "");
  const timeParts = timeStr.split(":");
  const hours = timeParts[0]?.padStart(2, "0") || "08";
  const minutes = timeParts[1]?.padStart(2, "0") || "00";
  return `${cleanDate}T${hours}${minutes}00`;
}

function calculateEndDateTime(dateStr: string, timeStr: string, durationMinutes = 45): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const timeParts = timeStr.split(":").map(Number);
  const hours = timeParts[0] || 8;
  const minutes = timeParts[1] || 0;

  const date = new Date(year, (month || 1) - 1, day || 1, hours, minutes);
  date.setMinutes(date.getMinutes() + durationMinutes);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${y}${m}${d}T${h}${min}00`;
}

export function taoNoiDungIcs(phieu: PhieuKhamResponse): string {
  const start = formatIcsDateTime(phieu.ngayKham, phieu.gioKhamDuKien);
  const end = calculateEndDateTime(phieu.ngayKham, phieu.gioKhamDuKien, 45);
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const summary = `Lịch khám bệnh eClinic - ${phieu.tenChuyenKhoa || "Khám bệnh"}`;
  const location = phieu.phongKham
    ? `${phieu.phongKham.tenPhong}${phieu.phongKham.tang ? " (" + phieu.phongKham.tang + ")" : ""}, Phòng khám eClinic`
    : "Phòng khám eClinic";

  const description = [
    `Mã phiếu khám: ${phieu.maPhieuKham}`,
    `Mã tra cứu: ${phieu.maTraCuu || phieu.maPhieuKham}`,
    `Số thứ tự: ${phieu.soThuTu}`,
    `Bác sĩ phụ trách: ${phieu.bacSi?.hocVi ? phieu.bacSi.hocVi + " " : ""}${phieu.bacSi?.hoTen || "Bác sĩ phòng khám"}`,
    `Chuyên khoa: ${phieu.tenChuyenKhoa}`,
    phieu.lyDoKham ? `Lý do khám: ${phieu.lyDoKham}` : "",
    "Vui lòng đến trước giờ khám 15 phút để hoàn tất thủ tục.",
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//eClinic//Booking System//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:eclinic-${phieu.maPhieuKham}@eclinic.vn`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Nhắc lịch khám tại eClinic",
    "TRIGGER:-PT2H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function taiTepLichIcs(phieu: PhieuKhamResponse) {
  const content = taoNoiDungIcs(phieu);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `lich-kham-${phieu.maPhieuKham}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
