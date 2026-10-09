import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { notifyAuth } from "@/utils/authNotification";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { cx } from "@/utils/cx";
import styles from "./UserProfile.module.css";

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const { lang } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  if (!user) return null;

  const roleLabel =
    user.role === "doctor"
      ? lang === "vi"
        ? "Bác sĩ"
        : "Doctor"
      : user.role === "admin"
        ? lang === "vi"
          ? "Quản trị viên"
          : "Administrator"
        : lang === "vi"
          ? "Bệnh nhân"
          : "Patient";
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
    setOpen(false);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    notifyAuth(
      "info",
      lang === "vi" ? "Đã đăng xuất" : "Signed out",
      lang === "vi"
        ? "Bạn đã đăng xuất khỏi eClinic."
        : "You have signed out of eClinic.",
    );
    navigate("/home");
  };

  return (
    <div ref={wrapperRef} className={cx(styles.wrapper, className)}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          lang === "vi" ? `Tài khoản ${user.name}` : `${user.name} account`
        }
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.avatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            initials || <UserRound size={18} />
          )}
        </span>
        <span className={styles.triggerName}>{user.name}</span>
        <ChevronDown
          className={cx(styles.caret, open && styles.caretOpen)}
          aria-hidden="true"
          size={15}
        />
      </button>

      {open && (
        <section
          className={styles.menu}
          aria-label={lang === "vi" ? "Menu tài khoản" : "Account menu"}
        >
          <div className={styles.identity}>
            <span className={styles.identityName}>{user.name}</span>
            <span className={styles.roleBadge}>{roleLabel}</span>
            {user.email && (
              <span className={styles.identityContact}>
                <Mail size={14} aria-hidden="true" />
                {user.email}
              </span>
            )}
          </div>

          {user.role === "patient" ? (
            <nav
              className={styles.links}
              aria-label={
                lang === "vi" ? "Liên kết bệnh nhân" : "Patient links"
              }
            >
               <Link to="/patient/my-appointments" className={styles.item} onClick={closeMenu}>
                <CalendarDays aria-hidden="true" />
                <span className={styles.itemTextBlock}>
                  <span className={styles.itemTitle}>{lang === "vi" ? "Lịch hẹn của tôi" : "My Appointments"}</span>
                  <span className={styles.itemDesc}>{lang === "vi" ? "Lịch sắp tới & lịch sử đã khám" : "Upcoming & past appointments"}</span>
                </span>
              </Link>
              <Link to="/patient/patient-profile" className={styles.item} onClick={closeMenu}>
                <ClipboardList aria-hidden="true" />
                <span className={styles.itemTextBlock}>
                  <span className={styles.itemTitle}>{lang === "vi" ? "Hồ sơ bệnh nhân" : "Patient Profile"}</span>
                  <span className={styles.itemDesc}>{lang === "vi" ? "CCCD, bảo hiểm y tế, tiền sử bệnh lý" : "ID, health insurance, medical history"}</span>
                </span>
              </Link>
              <Link to="/patient/dashboard" className={styles.item} onClick={closeMenu}>
                <LayoutDashboard aria-hidden="true" />
                <span className={styles.itemTextBlock}>
                  <span className={styles.itemTitle}>{lang === "vi" ? "Trang cá nhân" : "Dashboard"}</span>
                  <span className={styles.itemDesc}>{lang === "vi" ? "Tổng quan hồ sơ & lịch sắp tới" : "Profile overview & upcoming schedule"}</span>
                </span>
              </Link>
              <div className={styles.divider} />
              <Link to="/patient/account-info" className={styles.item} onClick={closeMenu}>
                <UserRound aria-hidden="true" />
                <span className={styles.itemTextBlock}>
                  <span className={styles.itemTitle}>{lang === "vi" ? "Thông tin tài khoản" : "Account Information"}</span>
                  <span className={styles.itemDesc}>{lang === "vi" ? "Họ tên, điện thoại, mật khẩu, ảnh đại diện" : "Name, phone, password, avatar"}</span>
                </span>
              </Link>
              <Link to="/patient/sessions" className={styles.item} onClick={closeMenu}>
                <ShieldAlert aria-hidden="true" />
                <span className={styles.itemTextBlock}>
                  <span className={styles.itemTitle}>{lang === "vi" ? "Thiết bị đăng nhập" : "Login Devices"}</span>
                  <span className={styles.itemDesc}>{lang === "vi" ? "Xem & đăng xuất các phiên khác" : "View & sign out other sessions"}</span>
                </span>
              </Link>
            </nav>
          ) : (
            <div className={styles.profileDetails}>
              <div>
                <span>{lang === "vi" ? "Vai trò" : "Role"}</span>
                <strong>{roleLabel}</strong>
              </div>
              {user.phone && (
                <div>
                  <span>{lang === "vi" ? "Điện thoại" : "Phone"}</span>
                  <strong>
                    <Phone size={13} aria-hidden="true" />
                    {user.phone}
                  </strong>
                </div>
              )}
              {user.role === "doctor" && (
                <>
                  <div>
                    <span>{lang === "vi" ? "Chuyên khoa" : "Specialty"}</span>
                    <strong>
                      {user.specialty ||
                        (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
                    </strong>
                  </div>
                  <div>
                    <span>
                      {lang === "vi" ? "Trình độ / Học vị" : "Qualification"}
                    </span>
                    <strong>
                      {user.degree ||
                        (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
                    </strong>
                  </div>
                  <div>
                    <span>{lang === "vi" ? "Phòng khám" : "Clinic"}</span>
                    <strong>
                      {user.clinic ||
                        (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
                    </strong>
                  </div>
                </>
              )}
              {user.role === "admin" && (
                <div>
                  <span>{lang === "vi" ? "Phạm vi" : "Access"}</span>
                  <strong>
                    {lang === "vi"
                      ? "Quản trị hệ thống"
                      : "System administration"}
                  </strong>
                </div>
              )}
              {user.role === "doctor" && (
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => {
                    closeMenu();
                    notifyAuth(
                      "info",
                      lang === "vi" ? "Đổi mật khẩu" : "Change password",
                      lang === "vi"
                        ? "Vui lòng liên hệ quản trị viên để cập nhật mật khẩu."
                        : "Contact your administrator to update your password.",
                    );
                  }}
                >
                  <KeyRound aria-hidden="true" />
                  {lang === "vi" ? "Đổi mật khẩu" : "Change password"}
                </button>
              )}
            </div>
          )}

          {user.role !== "patient" && (
            <Link
              to={user.role === "doctor" ? "/doctor" : "/admin"}
              className={styles.item}
              onClick={closeMenu}
            >
              {user.role === "doctor" ? (
                <Stethoscope aria-hidden="true" />
              ) : (
                <ShieldCheck aria-hidden="true" />
              )}
              {lang === "vi" ? "Mở trang làm việc" : "Open workspace"}
            </Link>
          )}

          <div className={styles.divider} />
          <button
            type="button"
            className={cx(styles.item, styles.logout)}
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" />
            {lang === "vi" ? "Đăng xuất" : "Log out"}
          </button>
        </section>
      )}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        title={lang === "vi" ? "Xác nhận đăng xuất" : "Confirm sign out"}
        message={
          lang === "vi"
            ? "Bạn có chắc chắn muốn đăng xuất khỏi eClinic không?"
            : "Are you sure you want to sign out of eClinic?"
        }
        confirmLabel={lang === "vi" ? "Đăng xuất" : "Sign out"}
        cancelLabel={lang === "vi" ? "Ở lại" : "Stay signed in"}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
