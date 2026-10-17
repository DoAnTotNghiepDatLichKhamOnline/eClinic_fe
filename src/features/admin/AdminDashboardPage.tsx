import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CircleCheck,
  House,
  Lock,
  Stethoscope,
  Unlock,
  UsersRound,
  Loader2,
  AlertCircle,
  User,
  Trash2,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { UserProfile } from "@/shared/components/ui/UserProfile";
import { LanguageToggle } from "@/features/landing/components/header/LanguageToggle";
import { AdminSidebar } from "./AdminSidebar";
import type { AdminSection } from "./AdminSidebar";
import { AdminNotificationCenter } from "./AdminNotificationCenter";
import { AccountDetailModal } from "./components/AccountDetailModal";
import { DisableAccountModal } from "./components/DisableAccountModal";
import {
  useDanhSachTaiKhoanQuanTri,
  useIdentityActions,
} from "@/hooks/useIdentity";
import type {
  TrangThaiTaiKhoan,
  VaiTro,
  TaiKhoanQuanTriResponse,
} from "@/types/auth.type";
import styles from "./AdminDashboardPage.module.css";
import { adminBookingService } from "@/services/booking/adminBookingService";
import { AdminOperationsPanel } from "./AdminOperationsPanel";
import { AdminDoctorPanel } from "./AdminDoctorPanel";

const sectionLabels: Record<AdminSection, { en: string; vi: string }> = {
  dashboard: { en: "Dashboard", vi: "Bảng điều khiển" },
  schedule: { en: "Schedule Management", vi: "Quản lý lịch khám" },
  catalog: { en: "Medical Catalog", vi: "Danh mục y tế" },
  doctors: { en: "Doctor Management", vi: "Quản lý bác sĩ" },
  patients: { en: "Patient Management", vi: "Quản lý người dùng & bệnh nhân" },
  accounts: { en: "Account Management", vi: "Quản lý tài khoản" },
};

const sectionPaths: Record<AdminSection, string> = {
  dashboard: "dashboard",
  schedule: "schedule-management",
  catalog: "medical-catalog",
  doctors: "doctors",
  patients: "patients",
  accounts: "accounts",
};

export function AdminDashboardPage({
  activeSection,
}: {
  activeSection: AdminSection;
}) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const vi = lang === "vi";

  // State tìm kiếm & lọc tài khoản người dùng
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [viewingAccountUserId, setViewingAccountUserId] = useState<number | null>(null);
  const [disablingUser, setDisablingUser] = useState<TaiKhoanQuanTriResponse | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);

  // Lấy danh sách người dùng cho Quản trị viên
  const {
    danhSach: danhSachTaiKhoan,
    tongSoPhanTu,
    tongSoTrang,
    isLoading: isLoadingUsers,
  } = useDanhSachTaiKhoanQuanTri({
    tuKhoa: userSearch.trim() || undefined,
    vaiTro: roleFilter !== "ALL" ? (roleFilter as VaiTro) : undefined,
    trangThai:
      statusFilter !== "ALL" ? (statusFilter as TrangThaiTaiKhoan) : undefined,
    trang: currentPage,
    kichThuoc: 10,
  });

  const { capNhatTrangThaiTaiKhoan, xoaTaiKhoan } = useIdentityActions();
  const { data: summaryResponse, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["booking", "admin-summary"],
    queryFn: () => adminBookingService.getTongQuanQuanTri(),
    enabled: activeSection === "dashboard",
  });
  const summary = summaryResponse?.duLieu;

  const navigateToSection = (section: AdminSection) =>
    navigate(`/admin/${sectionPaths[section]}`);

  // Chuyển đổi trạng thái tài khoản (Kích hoạt lại hoặc Vô hiệu hóa)
  const handleToggleStatus = async (user: TaiKhoanQuanTriResponse) => {
    if (user.vaiTro === "QUAN_TRI_VIEN" || user.trangThai === "CHO_XAC_NHAN")
      return;
    const isCurrentlyActive = user.trangThai === "DA_KICH_HOAT";

    if (isCurrentlyActive) {
      // Mở modal nhập lý do vô hiệu hóa (tối đa 500 ký tự)
      setDisablingUser(user);
      return;
    }

    const confirmMsg = vi
      ? `Bạn có chắc chắn muốn kích hoạt lại tài khoản "${user.hoTen}" (${user.email})?`
      : `Are you sure you want to activate account "${user.hoTen}" (${user.email})?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setUpdatingUserId(user.id);
      await capNhatTrangThaiTaiKhoan({
        id: user.id,
        data: {
          trangThai: "DA_KICH_HOAT",
        },
      });
    } catch (err: any) {
      alert(
        err?.response?.data?.thongDiep ||
          (vi
            ? "Không thể cập nhật trạng thái tài khoản."
            : "Failed to update account status."),
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleConfirmDisable = async (reason: string) => {
    if (!disablingUser) return;
    try {
      setIsDisabling(true);
      await capNhatTrangThaiTaiKhoan({
        id: disablingUser.id,
        data: {
          trangThai: "VO_HIEU_HOA",
          lyDoVoHieuHoa: reason,
        },
      });
      setDisablingUser(null);
    } catch (err: any) {
      alert(
        err?.response?.data?.thongDiep ||
          (vi
            ? "Không thể vô hiệu hóa tài khoản."
            : "Failed to disable account."),
      );
    } finally {
      setIsDisabling(false);
    }
  };

  const handleDeletePendingAccount = async (user: TaiKhoanQuanTriResponse) => {
    if (
      user.trangThai !== "CHO_XAC_NHAN" ||
      !window.confirm(
        vi
          ? `Xóa tài khoản đang chờ của ${user.email}?`
          : `Delete pending account ${user.email}?`,
      )
    )
      return;
    try {
      await xoaTaiKhoan(user.id);
    } catch (error: any) {
      alert(
        error?.response?.data?.thongDiep ||
          (vi ? "Không thể xóa tài khoản." : "Could not delete account."),
      );
    }
  };

  const renderStatusBadge = (status: TrangThaiTaiKhoan) => {
    switch (status) {
      case "DA_KICH_HOAT":
        return (
          <span className={`${styles.badge} ${styles.badgeActive}`}>
            <CircleCheck aria-hidden="true" size={14} />
            {vi ? "Đã kích hoạt" : "Active"}
          </span>
        );
      case "CHO_XAC_NHAN":
        return (
          <span className={`${styles.badge} ${styles.badgeWarning}`}>
            <AlertCircle aria-hidden="true" size={14} />
            {vi ? "Chờ xác nhận" : "Pending"}
          </span>
        );
      case "VO_HIEU_HOA":
        return (
          <span className={`${styles.badge} ${styles.badgeMuted}`}>
            <Lock aria-hidden="true" size={14} />
            {vi ? "Vô hiệu hóa" : "Disabled"}
          </span>
        );
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  const renderRoleLabel = (role: VaiTro) => {
    switch (role) {
      case "BENH_NHAN":
        return vi ? "Bệnh nhân" : "Patient";
      case "BAC_SI":
        return vi ? "Bác sĩ" : "Doctor";
      case "QUAN_TRI_VIEN":
        return vi ? "Quản trị viên" : "Admin";
      default:
        return role;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.topBar}>
        <div className={styles.topBarRow}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>
              eClinic Admin Control Panel
            </span>
            <span className={styles.brandTag}>
              {vi ? "Quản trị hệ thống" : "System Admin"}
            </span>
          </div>

          <div className={styles.userInfo}>
            <AdminNotificationCenter onNavigate={navigateToSection} />
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
        <AdminSidebar
          activeSection={activeSection}
          onSelect={navigateToSection}
        />
        <div className={styles.content}>
          <div className={styles.welcomeHeader}>
            <h1 className={styles.welcomeTitle}>
              {vi
                ? sectionLabels[activeSection].vi
                : sectionLabels[activeSection].en}
            </h1>
            <p className={styles.welcomeSub}>
              {activeSection === "dashboard"
                ? vi
                  ? "Quản lý tài khoản, lịch khám và cấu hình hệ thống toàn diện."
                  : "Manage user accounts, appointments, and system configurations."
                : vi
                  ? `Không gian ${sectionLabels[activeSection].vi.toLowerCase()} của eClinic.`
                  : `eClinic ${sectionLabels[activeSection].en.toLowerCase()} workspace.`}
            </p>
          </div>

          {activeSection === "dashboard" && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Stethoscope aria-hidden="true" />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingSummary
                      ? "..."
                      : (summary?.bacSiDangCongTac ?? 0)}
                  </span>
                  <span className={styles.statLabel}>
                    {vi ? "Bác sĩ hoạt động" : "Active Doctors"}
                  </span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <UsersRound aria-hidden="true" />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingSummary
                      ? "..."
                      : (summary?.benhNhanDaDangKy ?? 0).toLocaleString()}
                  </span>
                  <span className={styles.statLabel}>
                    {vi ? "Tài khoản hệ thống" : "Registered Accounts"}
                  </span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CalendarDays aria-hidden="true" />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {isLoadingSummary
                      ? "..."
                      : (summary?.luotDatTrongThang ?? 0)}
                  </span>
                  <span className={styles.statLabel}>
                    {vi ? "Lượt khám tháng này" : "Monthly Bookings"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "accounts" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {vi
                    ? "Quản lý tài khoản người dùng"
                    : "User Account Directory"}
                </h2>
                <span className={styles.statLabel}>
                  {vi
                    ? `Tổng số: ${tongSoPhanTu} tài khoản`
                    : `Total: ${tongSoPhanTu} accounts`}
                </span>
              </div>

              {/* Thanh lọc và tìm kiếm */}
              <div className={styles.filterBar}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={
                    vi
                      ? "Tìm theo họ tên, email, số điện thoại..."
                      : "Search by name, email, phone..."
                  }
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setCurrentPage(0);
                  }}
                />

                <select
                  className={styles.filterSelect}
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                >
                  <option value="ALL">
                    {vi ? "Tất cả vai trò" : "All Roles"}
                  </option>
                  <option value="BENH_NHAN">
                    {vi ? "Bệnh nhân" : "Patient"}
                  </option>
                  <option value="BAC_SI">{vi ? "Bác sĩ" : "Doctor"}</option>
                  <option value="QUAN_TRI_VIEN">
                    {vi ? "Quản trị viên" : "Admin"}
                  </option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                >
                  <option value="ALL">
                    {vi ? "Tất cả trạng thái" : "All Statuses"}
                  </option>
                  <option value="DA_KICH_HOAT">
                    {vi ? "Đã kích hoạt" : "Active"}
                  </option>
                  <option value="CHO_XAC_NHAN">
                    {vi ? "Chờ xác nhận" : "Pending"}
                  </option>
                  <option value="VO_HIEU_HOA">
                    {vi ? "Vô hiệu hóa" : "Disabled"}
                  </option>
                </select>
              </div>

              {/* Danh sách bảng */}
              <div className={styles.tableScroll}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{vi ? "Người dùng" : "User"}</th>
                      <th>Email</th>
                      <th>{vi ? "Số điện thoại" : "Phone"}</th>
                      <th>{vi ? "Vai trò" : "Role"}</th>
                      <th>{vi ? "Trạng thái" : "Status"}</th>
                      <th>{vi ? "Thao tác" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingUsers ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{ textAlign: "center", padding: "36px" }}
                        >
                          <Loader2
                            size={24}
                            className="animate-spin"
                            style={{ margin: "0 auto 8px" }}
                          />
                          <div>
                            {vi ? "Đang tải dữ liệu..." : "Loading users..."}
                          </div>
                        </td>
                      </tr>
                    ) : danhSachTaiKhoan.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{ textAlign: "center", padding: "36px" }}
                        >
                          {vi
                            ? "Không tìm thấy tài khoản nào."
                            : "No accounts found."}
                        </td>
                      </tr>
                    ) : (
                      danhSachTaiKhoan.map((u) => {
                        const isUpdating = updatingUserId === u.id;
                        const isHoatDong = u.trangThai === "DA_KICH_HOAT";
                        return (
                          <tr key={u.id}>
                            <td>
                              <strong>#{u.id}</strong>
                            </td>
                            <td>
                              <div className={styles.userCell}>
                                <div className={styles.userAvatar}>
                                  {u.anhDaiDien ? (
                                    <img src={u.anhDaiDien} alt="" />
                                  ) : (
                                    (u.hoTen || "U")
                                      .trim()
                                      .split(/\s+/)
                                      .slice(-1)[0]?.[0]
                                      ?.toUpperCase() || <User size={16} />
                                  )}
                                </div>
                                <div>
                                  <strong>{u.hoTen}</strong>
                                </div>
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>{u.soDienThoai || "—"}</td>
                            <td>
                              <span style={{ fontWeight: 600 }}>
                                {renderRoleLabel(u.vaiTro)}
                              </span>
                            </td>
                            <td>{renderStatusBadge(u.trangThai)}</td>
                            <td>
                              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  className={styles.actionBtnOutline}
                                  onClick={() => setViewingAccountUserId(u.id)}
                                  title={vi ? "Xem chi tiết tài khoản" : "View account details"}
                                >
                                  <Eye size={13} />
                                  {vi ? "Chi tiết" : "Detail"}
                                </button>
                                {u.trangThai === "CHO_XAC_NHAN" ? (
                                  <button
                                    type="button"
                                    className={styles.actionBtnDanger}
                                    disabled={isUpdating}
                                    onClick={() =>
                                      void handleDeletePendingAccount(u)
                                    }
                                  >
                                    <Trash2 size={13} />
                                    {vi ? "Xóa" : "Delete"}
                                  </button>
                                ) : (
                                  u.vaiTro !== "QUAN_TRI_VIEN" && (
                                    <button
                                      type="button"
                                      className={
                                        isHoatDong
                                          ? styles.actionBtnDanger
                                          : styles.actionBtnOutline
                                      }
                                      disabled={isUpdating}
                                      onClick={() => handleToggleStatus(u)}
                                    >
                                      {isUpdating ? (
                                        <Loader2
                                          size={13}
                                          className="animate-spin"
                                        />
                                      ) : isHoatDong ? (
                                        <Lock size={13} />
                                      ) : (
                                        <Unlock size={13} />
                                      )}
                                      {isHoatDong
                                        ? vi
                                          ? "Khóa"
                                          : "Disable"
                                        : vi
                                          ? "Kích hoạt"
                                          : "Activate"}
                                    </button>
                                  )
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

              {/* Phân trang */}
              {tongSoTrang > 1 && (
                <div className={styles.paginationBar}>
                  <span>
                    {vi
                      ? `Trang ${currentPage + 1} / ${tongSoTrang}`
                      : `Page ${currentPage + 1} of ${tongSoTrang}`}
                  </span>
                  <div className={styles.paginationActions}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    >
                      {vi ? "Trang trước" : "Previous"}
                    </button>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentPage >= tongSoTrang - 1}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      {vi ? "Trang sau" : "Next"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "doctors" && <AdminDoctorPanel />}

          {activeSection !== "dashboard" &&
            activeSection !== "doctors" &&
            activeSection !== "accounts" && (
              <AdminOperationsPanel activeSection={activeSection} />
            )}
        </div>
      </main>

      {/* Modal chi tiết tài khoản */}
      {viewingAccountUserId !== null && (
        <AccountDetailModal
          userId={viewingAccountUserId}
          onClose={() => setViewingAccountUserId(null)}
        />
      )}

      {/* Modal vô hiệu hóa tài khoản */}
      {disablingUser !== null && (
        <DisableAccountModal
          user={disablingUser}
          isLoading={isDisabling}
          onClose={() => setDisablingUser(null)}
          onConfirm={handleConfirmDisable}
        />
      )}
    </div>
  );
}
