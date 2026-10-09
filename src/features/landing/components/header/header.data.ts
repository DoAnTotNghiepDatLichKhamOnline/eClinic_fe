import type { Bilingual } from "@/types/i18n";

export interface NavLink {
  href: string;
  label: Bilingual;
}

export const navLinks: NavLink[] = [
  { href: "/specialties", label: { en: "Specialties", vi: "Chuyên khoa" } },
  { href: "/doctors", label: { en: "Doctors", vi: "Bác sĩ" } },
  { href: "/appointment", label: { en: "Appointment Booking", vi: "Đặt lịch khám" } },
];

export const headerContent = {
  bookAppointment: {
    en: "Book Appointment",
    vi: "Đặt lịch khám",
  } satisfies Bilingual,
};
