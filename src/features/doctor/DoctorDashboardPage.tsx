import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  House,
  Star,
  Stethoscope,
  Users,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import styles from "./DoctorDashboardPage.module.css";
import { DoctorNotificationCenter } from "./DoctorNotificationCenter";
import { DoctorSidebar, type DoctorSection } from "./DoctorSidebar";
import { DoctorSearchBar } from "./DoctorSearchBar";
import { useQuery } from "@tanstack/react-query";
import { doctorBookingService } from "@/services/booking";
import { useCollapsibleSidebar } from "@/hooks/useCollapsibleSidebar";

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const sectionPaths: Record<DoctorSection, string> = {
  dashboard: "dashboard",
  schedule: "personal-schedule",
  "shift-requests": "shift-requests",
  consultation: "consultation",
  profile: "profile",
};

interface DoctorDashboardPageProps {
  activeSection: DoctorSection | null;
  children?: React.ReactNode;
}

export function DoctorDashboardPage({
  activeSection,
  children,
}: DoctorDashboardPageProps) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const today = localDateKey(new Date());

  const { isCollapsed: isSidebarCollapsed, toggle: handleToggleSidebarCollapse } =
    useCollapsibleSidebar("doctor_sidebar", "(max-width: 1200px)");

  const { data: summaryResponse, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["booking", "doctor-summary"],
    queryFn: () => doctorBookingService.getTongQuanBacSi(),
  });

  const { data: hangDoiResponse } = useQuery({
    queryKey: ["booking", "doctor-hang-doi", today],
    queryFn: () => doctorBookingService.getHangDoi(today),
    refetchInterval: 15000,
    enabled: true,
  });

  const { data: reviewsResponse } = useQuery({
    queryKey: ["booking", "doctor-reviews-list"],
    queryFn: () =>
      doctorBookingService.getDanhSachDanhGiaBacSi({ trang: 0, kichThuoc: 5 }),
    enabled: !activeSection,
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfMonthStr = localDateKey(startOfMonth);
  const endOfMonthStr = localDateKey(endOfMonth);

  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfWeekStr = localDateKey(startOfWeek);
  const endOfWeekStr = localDateKey(endOfWeek);

  const queryStartDate =
    startOfWeek < startOfMonth ? startOfWeekStr : startOfMonthStr;
  const queryEndDate = endOfWeek > endOfMonth ? endOfWeekStr : endOfMonthStr;

  const { data: monthShiftsResponse, isLoading: isLoadingMonthShifts } = useQuery({
    queryKey: ["booking", "doctor-month-shifts", queryStartDate, queryEndDate],
    queryFn: () =>
      doctorBookingService.getLichTuanBacSi({
        tuNgay: queryStartDate,
        denNgay: queryEndDate,
      }),
    enabled: !activeSection,
  });

  const { data: monthAppointmentsResponse, isLoading: isLoadingMonthAppointments } = useQuery({
    queryKey: ["booking", "doctor-month-appointments", queryStartDate, queryEndDate],
    queryFn: () =>
      doctorBookingService.getLichHenLichBacSi({
        tuNgay: queryStartDate,
        denNgay: queryEndDate,
      }),
    enabled: !activeSection,
  });

  const monthShifts = monthShiftsResponse?.duLieu ?? [];
  const monthAppointments = monthAppointmentsResponse?.duLieu ?? [];

  const parseShiftHours = (gioBatDau: string, gioKetThuc: string) => {
    if (!gioBatDau || !gioKetThuc) return 0;
    const [h1, m1] = gioBatDau.split(":").map(Number);
    const [h2, m2] = gioKetThuc.split(":").map(Number);
    const diff = (h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0));
    return Math.max(0, diff / 60);
  };

  const monthlyHours = monthShifts
    .filter(
      (ca) =>
        ca.trangThai === "HOAT_DONG" &&
        ca.ngay >= startOfMonthStr &&
        ca.ngay <= endOfMonthStr,
    )
    .reduce((sum, ca) => sum + parseShiftHours(ca.gioBatDau, ca.gioKetThuc), 0);

  const weeklyHours = monthShifts
    .filter((ca) => {
      if (ca.trangThai !== "HOAT_DONG") return false;
      return ca.ngay >= startOfWeekStr && ca.ngay <= endOfWeekStr;
    })
    .reduce((sum, ca) => sum + parseShiftHours(ca.gioBatDau, ca.gioKetThuc), 0);

  const completedInMonth = monthAppointments.filter(
    (lh) =>
      lh.trangThai === "DA_KHAM" &&
      lh.ngay >= startOfMonthStr &&
      lh.ngay <= endOfMonthStr,
  ).length;
  const totalBookedInMonth = monthShifts
    .filter(
      (ca) => ca.ngay >= startOfMonthStr && ca.ngay <= endOfMonthStr,
    )
    .reduce((sum, ca) => sum + (Number(ca.soLuotDaDat) || 0), 0);
  const monthlyPatients =
    completedInMonth > 0 ? completedInMonth : totalBookedInMonth;

  const summary = summaryResponse?.duLieu;
  const hangDoi = hangDoiResponse?.duLieu;
  const cacCa = hangDoi?.cacCa ?? [];
  const activeShiftId = hangDoi?.idCaHienTai ?? cacCa[0]?.idLichLamViec;
  const currentShift = cacCa.find((c) => c.idLichLamViec === activeShiftId) ?? cacCa[0];
  const totalWaitingCount =
    currentShift?.soLuong?.choKham ??
    cacCa.reduce((sum, ca) => sum + (ca.soLuong?.choKham || 0), 0);

  const navigateToSection = (section: DoctorSection) =>
    navigate(`/doctor/${sectionPaths[section]}`);

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.topBar}>
        <div className={styles.topBarRow}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>eClinic Doctor Portal</span>
            <span className={styles.brandTag}>
              {lang === "vi" ? "Bác sĩ chuyên khoa" : "Specialist Doctor"}
            </span>
          </div>

          <DoctorSearchBar />

          <div className={styles.userInfo}>
            <DoctorNotificationCenter onNavigate={navigateToSection} />
            <LanguageToggle />
            <button
              type="button"
              className={styles.backHomeBtn}
              onClick={() => {
                navigate("/home");
              }}
            >
              <House aria-hidden="true" size={15} />
            </button>
            <UserProfile />
          </div>
        </div>
      </header>

      <main
        className={`${styles.container} ${isSidebarCollapsed ? styles.containerCollapsed : ""}`}
      >
        <DoctorSidebar
          activeSection={activeSection ?? "dashboard"}
          onSelect={navigateToSection}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
          waitingCount={totalWaitingCount}
        />
        <div className={styles.dashboardContent}>
          {activeSection ? (
            children
          ) : (
            <>
              <div className={styles.welcomeHeader}>
                <h1 className={styles.welcomeTitle}>
                  {lang === "vi"
                    ? "Chào bác sĩ, chúc một ngày làm việc hiệu quả!"
                    : "Welcome Doctor, have a great day!"}
                </h1>
                <p className={styles.welcomeSub}>
                  {lang === "vi"
                    ? "Hàng đợi khám hôm nay và tổng quan số liệu phòng khám."
                    : "Today's consultation queue and practice overview."}
                </p>
              </div>

              {/* 4 CORE KPI CARDS (25% EACH) */}
              <div className={styles.statsGrid}>
                {/* 1. Lịch khám hôm nay */}
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CalendarDays aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo} style={{ width: "100%" }}>
                    <span className={styles.statValue}>
                      {isLoadingSummary
                        ? "..."
                        : `${summary?.daKham ?? 0} / ${summary?.lichHenHomNay ?? summary?.caHomNay ?? 0}`}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi"
                        ? "Lịch khám hôm nay (Đã khám / Tổng)"
                        : "Today's Progress (Done / Total)"}
                    </span>
                    <div className={styles.statProgressWrapper}>
                      <div className={styles.statProgressTrack}>
                        <div
                          className={styles.statProgressBar}
                          style={{
                            width: `${
                              (summary?.lichHenHomNay ?? summary?.caHomNay ?? 0) > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      ((summary?.daKham ?? 0) /
                                        (summary?.lichHenHomNay ?? summary?.caHomNay ?? 1)) *
                                        100,
                                    ),
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className={styles.statSubtext}>
                        {(summary?.lichHenHomNay ?? summary?.caHomNay ?? 0) > 0
                          ? `${Math.min(
                              100,
                              Math.round(
                                ((summary?.daKham ?? 0) /
                                  (summary?.lichHenHomNay ?? summary?.caHomNay ?? 1)) *
                                  100,
                              ),
                            )}% ${lang === "vi" ? "hoàn thành" : "completed"}`
                          : lang === "vi"
                            ? "Chưa có ca hôm nay"
                            : "No shifts today"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Bệnh nhân trong tháng */}
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Users aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>
                      {isLoadingMonthAppointments || isLoadingMonthShifts
                        ? "..."
                        : monthlyPatients}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi"
                        ? "Bệnh nhân trong tháng"
                        : "Monthly Patients"}
                    </span>
                    <span className={styles.statSubtext}>
                      {lang === "vi"
                        ? "Tổng ca tiếp nhận tháng này"
                        : "Total visits this month"}
                    </span>
                  </div>
                </div>

                {/* 3. Tổng giờ làm tháng này */}
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Clock3 aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>
                      {isLoadingMonthShifts
                        ? "..."
                        : `${Math.round(monthlyHours * 10) / 10}h`}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi"
                        ? "Tổng giờ làm tháng này"
                        : "Monthly Work Hours"}
                    </span>
                    <span className={styles.statSubtext}>
                      {lang === "vi"
                        ? `Tuần này: ${Math.round(weeklyHours * 10) / 10}h`
                        : `This week: ${Math.round(weeklyHours * 10) / 10}h`}
                    </span>
                  </div>
                </div>

                {/* 4. Đánh giá trung bình */}
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Star aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>
                      {isLoadingSummary
                        ? "..."
                        : (summary?.diemDanhGia ?? summary?.danhGiaTrungBinh)
                          ? `${summary?.diemDanhGia ?? summary?.danhGiaTrungBinh} ★`
                          : "—"}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi" ? "Đánh giá trung bình" : "Average Rating"}
                    </span>
                    <span className={styles.statSubtext}>
                      {summary?.soDanhGia ?? summary?.tongSoDanhGia ?? 0}{" "}
                      {lang === "vi" ? "lượt đánh giá" : "reviews"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CA TRỰC HÔM NAY / SẮP TỚI & LỐI TẮT KHÁM BỆNH */}
              <div className={styles.shiftOverviewCard}>
                <div className={styles.shiftOverviewInfo}>
                  <div className={styles.shiftOverviewTitle}>
                    <Clock3 className="text-teal-600 shrink-0" size={22} />
                    <span>
                      {currentShift
                        ? `${lang === "vi" ? "Ca trực hiện tại" : "Current Shift"}: ${
                            currentShift.buoi === "SANG"
                              ? lang === "vi"
                                ? "Buổi Sáng"
                                : "Morning"
                              : currentShift.buoi === "CHIEU"
                                ? lang === "vi"
                                  ? "Buổi Chiều"
                                  : "Afternoon"
                                : lang === "vi"
                                  ? "Buổi Tối"
                                  : "Evening"
                          } (${currentShift.gioBatDau.slice(0, 5)} - ${currentShift.gioKetThuc.slice(0, 5)})`
                        : lang === "vi"
                          ? "Hôm nay không có ca trực phân công"
                          : "No assigned shift today"}
                    </span>
                    {currentShift && (
                      <span className={styles.shiftOverviewBadge}>
                        {typeof currentShift.phongKham === "object" &&
                        currentShift.phongKham !== null
                          ? (currentShift.phongKham as any).tenPhong
                          : currentShift.phongKham || (lang === "vi" ? "Phòng khám" : "Clinic")}
                      </span>
                    )}
                  </div>
                  <div className={styles.shiftOverviewMeta}>
                    {currentShift ? (
                      <>
                        <span>
                          <strong>{currentShift.soLuong?.choKham ?? 0}</strong>{" "}
                          {lang === "vi" ? "bệnh nhân đang chờ" : "waiting"}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>{currentShift.soLuong?.dangKham ?? 0}</strong>{" "}
                          {lang === "vi" ? "đang trong phòng khám" : "in examination"}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>{currentShift.soLuong?.daKham ?? 0}</strong>{" "}
                          {lang === "vi" ? "đã hoàn tất" : "completed"}
                        </span>
                      </>
                    ) : (
                      <span>
                        {lang === "vi"
                          ? "Kiểm tra lịch trực các ngày tới hoặc tạo đơn yêu cầu nhận/đổi ca trực."
                          : "Check your upcoming schedule or request shift assignments."}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.goToConsultationBtn}
                  onClick={() => navigate("/doctor/consultation")}
                >
                  <Stethoscope size={18} />
                  <span>
                    {lang === "vi"
                      ? "Đến phòng Khám bệnh & Hàng đợi"
                      : "Go to Consultation Queue"}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* ĐÁNH GIÁ GẦN ĐÂY TỪ BỆNH NHÂN (LƯỚI 2 CỘT) */}
              {reviewsResponse?.duLieu?.noiDung &&
                reviewsResponse.duLieu.noiDung.length > 0 && (
                  <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <h2 className={styles.sectionTitle}>
                          {lang === "vi"
                            ? "Đánh giá gần đây từ bệnh nhân (Ẩn danh)"
                            : "Recent Patient Reviews (Anonymous)"}
                        </h2>
                        <span className={styles.welcomeSub}>
                          {lang === "vi"
                            ? "Phản hồi thực tế từ các lượt khám đã hoàn tất."
                            : "Verified feedback from completed consultations."}
                        </span>
                      </div>
                    </div>
                    <div className={styles.reviewsGrid2Col}>
                      {reviewsResponse.duLieu.noiDung.map((rev) => (
                        <div className={styles.reviewCard2Col} key={rev.id}>
                          <div className={styles.reviewCardHeader}>
                            <div className={styles.reviewStars}>
                              {"★".repeat(rev.soSao)}
                              {"☆".repeat(5 - rev.soSao)}
                            </div>
                            <span className={styles.reviewTag}>
                              {lang === "vi" ? "Khám chuyên khoa" : "Specialist Care"}
                            </span>
                          </div>
                          <p className={styles.reviewComment}>
                            {rev.nhanXet
                              ? `"${rev.nhanXet}"`
                              : lang === "vi"
                                ? "(Bệnh nhân không để lại nhận xét bằng lời)"
                                : "(No written comment left)"}
                          </p>
                          <div className={styles.reviewDate}>
                            {lang === "vi" ? "Ngày:" : "Date:"}{" "}
                            {rev.ngayTao?.slice(0, 10)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
