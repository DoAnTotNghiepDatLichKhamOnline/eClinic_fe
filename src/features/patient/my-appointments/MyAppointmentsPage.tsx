import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  User,
  X,
  CheckCircle,
  Clock3,
  Ban,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { PatientPortal } from "@/features/patient/PatientPortal";
import type { LichHenCuaToiResponse } from "@/types/booking.type";
import type { TrangThaiLichHen } from "@/types/common.type";
import { MOCK_APPOINTMENTS } from "./myAppointments.data";
import styles from "./MyAppointmentsPage.module.css";

type TabStatus = "upcoming" | "done" | "cancelled";

const getApptCategory = (status: TrangThaiLichHen): TabStatus => {
  if (status === "DA_HOAN_THANH") return "done";
  if (status === "DA_HUY" || status === "BI_TU_CHOI" || status === "DA_HUY_DO_DOI_LICH") return "cancelled";
  return "upcoming";
};

const STATUS_CONFIG = {
  upcoming: { label: { vi: "Sắp tới", en: "Upcoming" }, cls: styles.badgeUpcoming, cardCls: styles.appointmentCardUpcoming, icon: <Clock3 size={11} /> },
  done: { label: { vi: "Đã khám", en: "Completed" }, cls: styles.badgeDone, cardCls: styles.appointmentCardDone, icon: <CheckCircle size={11} /> },
  cancelled: { label: { vi: "Đã hủy", en: "Cancelled" }, cls: styles.badgeCancelled, cardCls: styles.appointmentCardCancelled, icon: <Ban size={11} /> },
};

export function MyAppointmentsPage() {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [activeTab, setActiveTab] = useState<TabStatus | "all">("upcoming");
  const [search, setSearch] = useState("");

  const filtered: LichHenCuaToiResponse[] = MOCK_APPOINTMENTS.filter((a) => {
    const category = getApptCategory(a.trangThai);
    const matchTab = activeTab === "all" || category === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.bacSi.hoTen.toLowerCase().includes(q) ||
      a.tenChuyenKhoa.toLowerCase().includes(q) ||
      a.hoTenBenhNhan.toLowerCase().includes(q) ||
      a.phongKham.tenPhong.toLowerCase().includes(q) ||
      a.maPhieuKham.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {
    all: MOCK_APPOINTMENTS.length,
    upcoming: MOCK_APPOINTMENTS.filter((a) => getApptCategory(a.trangThai) === "upcoming").length,
    done: MOCK_APPOINTMENTS.filter((a) => getApptCategory(a.trangThai) === "done").length,
    cancelled: MOCK_APPOINTMENTS.filter((a) => getApptCategory(a.trangThai) === "cancelled").length,
  };

  const tabs: { key: TabStatus | "all"; label: { vi: string; en: string } }[] = [
    { key: "upcoming", label: { vi: "Sắp tới", en: "Upcoming" } },
    { key: "done", label: { vi: "Đã khám", en: "Completed" } },
    { key: "cancelled", label: { vi: "Đã hủy", en: "Cancelled" } },
    { key: "all", label: { vi: "Tất cả", en: "All" } },
  ];

  return (
    <PatientPortal>
      <div className={styles.page}>
      {/* ─── Page Header ─── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderIcon}>
          <CalendarDays size={22} />
        </div>
        <div>
          <h1 className={styles.pageTitle}>
            {vi ? "Lịch hẹn của tôi" : "My Appointments"}
          </h1>
          <p className={styles.pageSubtitle}>
            {vi
              ? "Xem và quản lý lịch hẹn của bạn và người thân"
              : "View and manage your appointments and family members'"}
          </p>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className={styles.tabBar} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label[lang]}
            <span className={styles.tabCount}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* ─── Filter bar ─── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            id="appointment-search"
            className={styles.searchInput}
            placeholder={vi ? "Tìm bác sĩ, chuyên khoa, bệnh nhân..." : "Search doctor, specialty, patient..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── List ─── */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarDays size={48} />
          <p className={styles.emptyStateTitle}>
            {vi ? "Không có lịch hẹn nào" : "No appointments found"}
          </p>
          <p className={styles.emptyStateDesc}>
            {vi ? "Thử thay đổi bộ lọc hoặc đặt lịch mới." : "Try adjusting your filters or book a new appointment."}
          </p>
        </div>
      ) : (
        <div className={styles.appointmentList} role="list">
          {filtered.map((appt) => {
            const d = new Date(appt.ngay);
            const category = getApptCategory(appt.trangThai);
            const cfg = STATUS_CONFIG[category];
            return (
              <div
                key={appt.maPhieuKham}
                role="listitem"
                className={`${styles.appointmentCard} ${cfg.cardCls}`}
              >
                {/* Date block */}
                <div className={`${styles.dateBlock} ${category === "done" ? styles.dateBlockDone : category === "cancelled" ? styles.dateBlockCancelled : ""}`}>
                  <span className={styles.dateDay}>
                    {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "2-digit" })}
                  </span>
                  <span className={styles.dateMonth}>
                    {d.toLocaleDateString(vi ? "vi-VN" : "en-US", { month: "short" })}
                  </span>
                </div>

                {/* Info */}
                <div className={styles.appointmentInfo}>
                  <div className={styles.appointmentDoctor}>{appt.bacSi.hoTen}</div>
                  <div className={styles.appointmentMeta}>
                    <span className={styles.appointmentMetaItem}>
                      <Stethoscope size={12} />
                      {appt.tenChuyenKhoa}
                    </span>
                    <span className={styles.appointmentMetaItem}>
                      <Clock size={12} />
                      {appt.gioKhamDuKien}
                    </span>
                    <span className={styles.appointmentMetaItem}>
                      <MapPin size={12} />
                      {appt.phongKham.tenPhong}
                    </span>
                  </div>
                  <div className={styles.patientTag}>
                    <User size={10} />
                    {appt.hoTenBenhNhan}
                    {appt.laBanThan ? (vi ? " (Bản thân)" : " (Self)") : ""}
                  </div>
                  {appt.lyDoKham && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#667068", fontStyle: "italic" }}>
                      {appt.lyDoKham}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.appointmentActions}>
                  <span className={`${styles.badge} ${cfg.cls}`}>
                    {cfg.icon}
                    {cfg.label[lang]}
                  </span>
                  {category === "upcoming" && (
                    <>
                      <button className={`${styles.btnSmall} ${styles.btnSmallOutline}`}>
                        {vi ? "Chi tiết" : "Details"}
                      </button>
                      <button className={`${styles.btnSmall} ${styles.btnSmallDanger}`}>
                        <X size={11} />
                        {vi ? "Hủy lịch" : "Cancel"}
                      </button>
                    </>
                  )}
                  {category === "done" && (
                    <button className={`${styles.btnSmall} ${styles.btnSmallPrimary}`}>
                      {vi ? "Xem kết quả" : "View result"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </PatientPortal>
  );
}
