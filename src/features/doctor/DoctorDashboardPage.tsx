import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CircleCheck,
  Clock3,
  FolderOpen,
  House,
  PhoneCall,
  Star,
  Stethoscope,
  UserCheck,
  UserX,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import styles from "./DoctorDashboardPage.module.css";
import { DoctorNotificationCenter } from "./DoctorNotificationCenter";
import { DoctorSidebar, type DoctorSection } from "./DoctorSidebar";
import { DoctorSearchBar } from "./DoctorSearchBar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doctorBookingService } from "@/services/booking";
import { notifyAuth } from "@/utils/authNotification";
import type { HangDoiLuot } from "@/types/booking.type";

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const sectionPaths: Record<DoctorSection, string> = {
  dashboard: "dashboard",
  schedule: "work-schedule",
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
  const queryClient = useQueryClient();
  const today = localDateKey(new Date());

  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  const { data: summaryResponse, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["booking", "doctor-summary"],
    queryFn: () => doctorBookingService.getTongQuanBacSi(),
  });

  const { data: hangDoiResponse, isLoading: isLoadingHangDoi } = useQuery({
    queryKey: ["booking", "doctor-hang-doi", today],
    queryFn: () => doctorBookingService.getHangDoi(today),
    refetchInterval: 15000,
    enabled: !activeSection,
  });

  const { data: reviewsResponse } = useQuery({
    queryKey: ["booking", "doctor-reviews-list"],
    queryFn: () =>
      doctorBookingService.getDanhSachDanhGiaBacSi({ trang: 0, kichThuoc: 5 }),
    enabled: !activeSection,
  });

  const summary = summaryResponse?.duLieu;
  const hangDoi = hangDoiResponse?.duLieu;
  const cacCa = hangDoi?.cacCa ?? [];
  const activeShiftId = selectedShiftId ?? hangDoi?.idCaHienTai ?? cacCa[0]?.idLichLamViec;
  const currentShift = cacCa.find((c) => c.idLichLamViec === activeShiftId) ?? cacCa[0];

  const navigateToSection = (section: DoctorSection) =>
    navigate(`/doctor/${sectionPaths[section]}`);

  const handleCallNext = async (idLichLamViec: number) => {
    try {
      const res = await doctorBookingService.goiTiepHangDoi(idLichLamViec);
      if (res.thanhCong) {
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-hang-doi"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-summary"],
        });
        notifyAuth(
          "success",
          lang === "vi" ? "Đã gọi bệnh nhân tiếp theo" : "Called next patient",
          res.thongDiep,
        );
      }
    } catch (err) {
      notifyAuth(
        "error",
        lang === "vi" ? "Lỗi gọi khám" : "Call error",
        (err as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep || "Could not call next patient",
      );
    }
  };

  const handleCallPatient = async (idLichHen: number) => {
    try {
      const res = await doctorBookingService.goiKham(idLichHen);
      if (res.thanhCong) {
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-hang-doi"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-summary"],
        });
        notifyAuth(
          "success",
          lang === "vi" ? "Đã gọi bệnh nhân vào khám" : "Patient called",
          res.thongDiep,
        );
      }
    } catch (err) {
      notifyAuth(
        "error",
        lang === "vi" ? "Lỗi gọi khám" : "Call error",
        (err as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep || "Could not call patient",
      );
    }
  };

  const handleMarkAbsent = async (idLichHen: number) => {
    try {
      const res = await doctorBookingService.danhDauVangMat(idLichHen);
      if (res.thanhCong) {
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-hang-doi"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-summary"],
        });
        notifyAuth(
          "info",
          lang === "vi" ? "Đã đánh dấu vắng mặt" : "Marked absent",
          res.thongDiep,
        );
      }
    } catch (err) {
      notifyAuth(
        "error",
        lang === "vi" ? "Lỗi thao tác" : "Error",
        (err as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep || "Failed to mark absent",
      );
    }
  };

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

      <main className={styles.container}>
        <DoctorSidebar
          activeSection={activeSection ?? "dashboard"}
          onSelect={navigateToSection}
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

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CalendarDays aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>
                      {isLoadingSummary
                        ? "..."
                        : (summary?.lichHenHomNay ?? summary?.caHomNay ?? 0)}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi"
                        ? "Lịch khám hôm nay"
                        : "Today's Appointments"}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Clock3 aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>
                      {isLoadingSummary ? "..." : (summary?.dangCho ?? 0)}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi"
                        ? "Bệnh nhân chờ khám"
                        : "Patients Waiting"}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CircleCheck aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>
                      {isLoadingSummary ? "..." : (summary?.daKham ?? 0)}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi" ? "Đã hoàn thành" : "Completed Exams"}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Star aria-hidden="true" />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>
                      {isLoadingSummary
                        ? "..."
                        : summary?.diemDanhGia
                          ? `${summary.diemDanhGia} ★ (${summary.soDanhGia ?? 0})`
                          : "—"}
                    </span>
                    <span className={styles.statLabel}>
                      {lang === "vi" ? "Đánh giá trung bình" : "Average Rating"}
                    </span>
                  </div>
                </div>
              </div>

              {/* HÀNG ĐỢI KHÁM THEO CA (QUEUE) */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>
                      {lang === "vi"
                        ? "Hàng đợi khám hôm nay"
                        : "Today's Consultation Queue"}
                    </h2>
                    <span className={styles.welcomeSub}>
                      {lang === "vi"
                        ? "Tự động làm mới mỗi 15 giây. Trực tiếp điều phối và gọi bệnh nhân vào khám."
                        : "Auto-refreshes every 15s. Coordinate and call patients."}
                    </span>
                  </div>
                  {currentShift && (
                    <button
                      type="button"
                      className={styles.callNextBtn}
                      onClick={() => handleCallNext(currentShift.idLichLamViec)}
                      disabled={currentShift.soLuong.choKham === 0}
                    >
                      <PhoneCall size={16} aria-hidden="true" />
                      {lang === "vi" ? "Gọi tiếp bệnh nhân" : "Call next patient"}
                    </button>
                  )}
                </div>

                {cacCa.length > 0 && (
                  <div className={styles.shiftTabs}>
                    {cacCa.map((ca) => (
                      <button
                        key={ca.idLichLamViec}
                        type="button"
                        className={`${styles.shiftTab} ${ca.idLichLamViec === currentShift?.idLichLamViec ? styles.shiftTabActive : ""}`}
                        onClick={() => setSelectedShiftId(ca.idLichLamViec)}
                      >
                        <span className={styles.shiftTime}>
                          {ca.buoi === "SANG"
                            ? lang === "vi"
                              ? "Buổi Sáng"
                              : "Morning"
                            : ca.buoi === "CHIEU"
                              ? lang === "vi"
                                ? "Buổi Chiều"
                                : "Afternoon"
                              : lang === "vi"
                                ? "Buổi Tối"
                                : "Evening"}{" "}
                          ({ca.gioBatDau.slice(0, 5)} - {ca.gioKetThuc.slice(0, 5)})
                        </span>
                        <span className={styles.shiftStats}>
                          {typeof ca.phongKham === "object" && ca.phongKham !== null
                            ? (ca.phongKham as any).tenPhong
                            : ca.phongKham} · {ca.soLuong.choKham} {lang === "vi" ? "chờ" : "waiting"} ·{" "}
                          {ca.soLuong.dangKham} {lang === "vi" ? "đang khám" : "in room"} ·{" "}
                          {ca.soLuong.daKham} {lang === "vi" ? "xong" : "done"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <table className={styles.patientTable}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>{lang === "vi" ? "Giờ khám" : "Time"}</th>
                      <th>{lang === "vi" ? "Mã tra cứu" : "Code"}</th>
                      <th>{lang === "vi" ? "Tên bệnh nhân" : "Patient"}</th>
                      <th>{lang === "vi" ? "Lý do khám" : "Reason"}</th>
                      <th>{lang === "vi" ? "Trạng thái" : "Status"}</th>
                      <th>{lang === "vi" ? "Thao tác" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingHangDoi ? (
                      <tr>
                        <td colSpan={7}>
                          {lang === "vi"
                            ? "Đang tải hàng đợi..."
                            : "Loading queue..."}
                        </td>
                      </tr>
                    ) : !currentShift || currentShift.cacLuot.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          {lang === "vi"
                            ? "Ca trực này chưa có bệnh nhân nào trong hàng đợi."
                            : "No patients in queue for this shift."}
                        </td>
                      </tr>
                    ) : (
                      currentShift.cacLuot.map((luot: HangDoiLuot) => {
                        const apt = luot.lichHen;
                        return (
                          <tr key={apt.maPhieuKham}>
                            <td>
                              <strong>#{apt.soThuTu}</strong>
                            </td>
                            <td>{apt.gioKhamDuKien}</td>
                            <td>
                              <strong>{apt.maTraCuu}</strong>
                            </td>
                            <td>
                              <strong>{apt.hoTenBenhNhan}</strong>
                            </td>
                            <td>{apt.lyDoKham}</td>
                            <td>
                              {luot.trangThaiHangDoi === "CHO_KHAM" && (
                                <span
                                  className={`${styles.badge} ${styles.badgeWaiting}`}
                                >
                                  <Clock3 aria-hidden="true" size={14} />{" "}
                                  {lang === "vi" ? "Chờ khám" : "Waiting"}
                                </span>
                              )}
                              {luot.trangThaiHangDoi === "DANG_KHAM" && (
                                <span
                                  className={`${styles.badge} ${styles.badgeProgress}`}
                                >
                                  <Stethoscope aria-hidden="true" size={14} />{" "}
                                  {lang === "vi" ? "Đang khám" : "In Progress"}
                                </span>
                              )}
                              {luot.trangThaiHangDoi === "VANG_MAT" && (
                                <span
                                  className={`${styles.badge} ${styles.badgeAbsent}`}
                                >
                                  <UserX aria-hidden="true" size={14} />{" "}
                                  {lang === "vi" ? "Vắng mặt" : "Absent"}
                                </span>
                              )}
                              {luot.trangThaiHangDoi === "DA_KHAM" && (
                                <span
                                  className={`${styles.badge} ${styles.badgeDone}`}
                                >
                                  <CircleCheck aria-hidden="true" size={14} />{" "}
                                  {lang === "vi" ? "Đã khám" : "Completed"}
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {(luot.trangThaiHangDoi === "CHO_KHAM" ||
                                  luot.trangThaiHangDoi === "VANG_MAT") && (
                                  <button
                                    type="button"
                                    className={styles.actionBtn}
                                    onClick={() =>
                                      handleCallPatient(Number(apt.id))
                                    }
                                  >
                                    <UserCheck size={14} aria-hidden="true" />
                                    {lang === "vi" ? "Gọi khám" : "Call In"}
                                  </button>
                                )}

                                {luot.trangThaiHangDoi === "DANG_KHAM" && (
                                  <>
                                    <button
                                      type="button"
                                      className={styles.dangerBtn}
                                      onClick={() =>
                                        handleMarkAbsent(Number(apt.id))
                                      }
                                    >
                                      <UserX size={14} aria-hidden="true" />
                                      {lang === "vi" ? "Vắng mặt" : "Absent"}
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.actionBtn}
                                      onClick={() =>
                                        navigate(
                                          `/doctor/consultation?ma=${encodeURIComponent(apt.maTraCuu)}`,
                                        )
                                      }
                                    >
                                      <Stethoscope
                                        size={14}
                                        aria-hidden="true"
                                      />
                                      {lang === "vi" ? "Khám bệnh" : "Consult"}
                                    </button>
                                  </>
                                )}

                                {luot.trangThaiHangDoi === "DA_KHAM" && (
                                  <button
                                    type="button"
                                    className={styles.secondaryBtn}
                                    onClick={() =>
                                      navigate(
                                        `/doctor/consultation?ma=${encodeURIComponent(apt.maTraCuu)}`,
                                      )
                                    }
                                  >
                                    <FolderOpen size={14} aria-hidden="true" />
                                    {lang === "vi" ? "Xem bệnh án" : "Record"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ĐÁNH GIÁ ẨN DANH CỦA BỆNH NHÂN */}
              {reviewsResponse?.duLieu?.noiDung &&
                reviewsResponse.duLieu.noiDung.length > 0 && (
                  <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>
                        {lang === "vi"
                          ? "Đánh giá gần đây từ bệnh nhân (Ẩn danh)"
                          : "Recent Patient Reviews (Anonymous)"}
                      </h2>
                    </div>
                    <div>
                      {reviewsResponse.duLieu.noiDung.map((rev) => (
                        <div className={styles.reviewItem} key={rev.id}>
                          <div className={styles.reviewStars}>
                            {"★".repeat(rev.soSao)}
                            {"☆".repeat(5 - rev.soSao)}
                          </div>
                          {rev.nhanXet && (
                            <p className={styles.reviewComment}>"{rev.nhanXet}"</p>
                          )}
                          <div className={styles.reviewMeta}>
                            {lang === "vi" ? "Ngày đánh giá:" : "Reviewed:"}{" "}
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
