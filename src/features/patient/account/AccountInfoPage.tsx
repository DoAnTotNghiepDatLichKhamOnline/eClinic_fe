import { useState, useEffect, useRef } from "react";
import {
  User,
  Phone,
  Mail,
  Lock,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { PatientPortal } from "@/features/patient/PatientPortal";
import { useHoSoCaNhan, useIdentityActions } from "@/hooks/useIdentity";
import styles from "./AccountInfoPage.module.css";

export function AccountInfoPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { hoSo, isLoading: isLoadingHoSo } = useHoSoCaNhan();
  const {
    capNhatHoSo,
    isUpdatingHoSo,
    doiMatKhau,
    isChangingPassword,
    yeuCauDoiEmail,
    isRequestingEmailChange,
    taiLenAnh,
    isUploadingAvatar,
  } = useIdentityActions();

  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showEmailRequest, setShowEmailRequest] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPw, setEmailPw] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const currentName = hoSo?.hoTen || user?.name || "";
    const currentPhone = hoSo?.soDienThoai || user?.phone || "";
    setName(currentName);
    setTempName(currentName);
    setPhone(currentPhone);
    setTempPhone(currentPhone);
  }, [hoSo, user]);

  const initials = (name || "U")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const handleSaveName = async () => {
    try {
      await capNhatHoSo({ hoTen: tempName, soDienThoai: phone || undefined });
      setName(tempName);
      setEditingName(false);
    } catch (err: any) {
      alert(err?.response?.data?.thongDiep || "Có lỗi xảy ra khi lưu họ tên.");
    }
  };

  const handleSavePhone = async () => {
    try {
      await capNhatHoSo({ hoTen: name || tempName, soDienThoai: tempPhone || undefined });
      setPhone(tempPhone);
      setEditingPhone(false);
    } catch (err: any) {
      alert(err?.response?.data?.thongDiep || "Có lỗi xảy ra khi lưu số điện thoại.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await taiLenAnh(file);
    } catch (err: any) {
      alert(err?.response?.data?.thongDiep || "Không thể tải lên ảnh đại diện.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPw !== confirmPw) {
      setPwError(lang === "vi" ? "Mật khẩu xác nhận không khớp" : "Passwords do not match");
      return;
    }
    try {
      await doiMatKhau({ matKhauHienTai: oldPw, matKhauMoi: newPw });
      setPwSuccess(true);
      setTimeout(() => {
        setPwSuccess(false);
        setShowPasswordSection(false);
        setOldPw("");
        setNewPw("");
        setConfirmPw("");
      }, 2000);
    } catch (err: any) {
      setPwError(err?.response?.data?.thongDiep || (lang === "vi" ? "Đổi mật khẩu thất bại" : "Failed to change password"));
    }
  };

  const handleEmailRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    try {
      await yeuCauDoiEmail({ emailMoi: newEmail, matKhauHienTai: emailPw });
      setEmailSuccess(true);
      setTimeout(() => {
        setEmailSuccess(false);
        setShowEmailRequest(false);
        setNewEmail("");
        setEmailPw("");
      }, 2500);
    } catch (err: any) {
      setEmailError(err?.response?.data?.thongDiep || (lang === "vi" ? "Gửi yêu cầu thất bại" : "Failed to request email change"));
    }
  };

  const vi = lang === "vi";

  return (
    <PatientPortal>
      <div className={styles.page}>
        {/* ─── Page Header ─── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderIcon}>
            <User size={22} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>
              {vi ? "Hồ sơ cá nhân" : "Account Information"}
            </h1>
            <p className={styles.pageSubtitle}>
              {vi
                ? "Quản lý thông tin tài khoản và bảo mật"
                : "Manage your account details and security"}
            </p>
          </div>
        </div>

      {/* ─── Avatar Card ─── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          {vi ? "Ảnh đại diện" : "Profile Photo"}
        </h2>
        <div className={styles.avatarSection}>
          <div className={styles.avatarLarge}>
            {hoSo?.anhDaiDien ? (
              <img src={hoSo.anhDaiDien} alt="" />
            ) : (
              <span>{initials || <User size={32} />}</span>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/png,image/jpeg,image/gif"
              onChange={handleFileChange}
            />
            <button
              className={styles.avatarEditBtn}
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              aria-label={vi ? "Đổi ảnh" : "Change photo"}
            >
              {isUploadingAvatar ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
          </div>
          <div className={styles.avatarInfo}>
            <p className={styles.avatarHint}>
              {vi
                ? "Ảnh JPG, PNG hoặc GIF. Kích thước tối đa 5MB."
                : "JPG, PNG or GIF. Max size 5MB."}
            </p>
            <button
              className={styles.btnOutline}
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingAvatar ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              {vi ? (isUploadingAvatar ? "Đang tải..." : "Tải ảnh mới") : (isUploadingAvatar ? "Uploading..." : "Upload photo")}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Basic Info Card ─── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          {vi ? "Thông tin cơ bản" : "Basic Information"}
        </h2>

        {/* Name */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            <User size={14} />
            {vi ? "Họ và tên" : "Full name"}
          </label>
          {editingName ? (
            <div className={styles.fieldEditRow}>
              <input
                id="input-name"
                className={styles.input}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
              />
              <button className={styles.btnIconSuccess} type="button" onClick={handleSaveName} disabled={isUpdatingHoSo} aria-label={vi ? "Lưu" : "Save"}>
                {isUpdatingHoSo ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              </button>
              <button className={styles.btnIconCancel} type="button" onClick={() => { setEditingName(false); setTempName(name); }} aria-label={vi ? "Hủy" : "Cancel"}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className={styles.fieldValueRow}>
              <span className={styles.fieldValue}>{name || (isLoadingHoSo ? "..." : (vi ? "Chưa cập nhật" : "Not provided"))}</span>
              <button className={styles.btnIconEdit} type="button" onClick={() => { setEditingName(true); setTempName(name); }} aria-label={vi ? "Sửa tên" : "Edit name"}>
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            <Phone size={14} />
            {vi ? "Số điện thoại" : "Phone number"}
          </label>
          {editingPhone ? (
            <div className={styles.fieldEditRow}>
              <input
                id="input-phone"
                className={styles.input}
                value={tempPhone ?? ""}
                onChange={(e) => setTempPhone(e.target.value)}
                autoFocus
              />
              <button className={styles.btnIconSuccess} type="button" onClick={handleSavePhone} disabled={isUpdatingHoSo} aria-label={vi ? "Lưu" : "Save"}>
                {isUpdatingHoSo ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              </button>
              <button className={styles.btnIconCancel} type="button" onClick={() => { setEditingPhone(false); setTempPhone(phone); }} aria-label={vi ? "Hủy" : "Cancel"}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className={styles.fieldValueRow}>
              <span className={styles.fieldValue}>{phone || (isLoadingHoSo ? "..." : (vi ? "Chưa cập nhật" : "Not provided"))}</span>
              <button className={styles.btnIconEdit} type="button" onClick={() => { setEditingPhone(true); setTempPhone(phone); }} aria-label={vi ? "Sửa điện thoại" : "Edit phone"}>
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Email (read-only + request change) */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            <Mail size={14} />
            {vi ? "Email" : "Email"}
          </label>
          <div className={styles.fieldValueRow}>
            <span className={styles.fieldValue}>{hoSo?.email || user?.email || (isLoadingHoSo ? "..." : "")}</span>
            <button className={styles.btnTextLink} type="button" onClick={() => setShowEmailRequest((v) => !v)}>
              {vi ? "Yêu cầu đổi" : "Request change"}
            </button>
          </div>
        </div>

        {showEmailRequest && (
          <form className={styles.subCard} onSubmit={handleEmailRequest}>
            <div className={styles.subCardTitle}>
              <AlertCircle size={14} />
              {vi ? "Yêu cầu đổi địa chỉ email" : "Request email change"}
            </div>
            <p className={styles.subCardDesc}>
              {vi
                ? "Email mới sẽ cần xác minh trước khi có hiệu lực."
                : "The new email must be verified before taking effect."}
            </p>
            {emailError && (
              <p style={{ color: "#e11d48", fontSize: "13px", marginBottom: "8px" }}>
                {emailError}
              </p>
            )}
            <div className={styles.formRow}>
              <input
                id="input-new-email"
                className={styles.input}
                type="email"
                placeholder={vi ? "Email mới..." : "New email address..."}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <input
                id="input-email-pw"
                className={styles.input}
                type="password"
                placeholder={vi ? "Mật khẩu hiện tại..." : "Current password..."}
                value={emailPw}
                onChange={(e) => setEmailPw(e.target.value)}
                required
              />
              <button className={styles.btnPrimary} type="submit" disabled={isRequestingEmailChange}>
                {emailSuccess ? <><Check size={14} /> {vi ? "Đã gửi!" : "Sent!"}</> : (isRequestingEmailChange ? <><Loader2 size={14} className="animate-spin" /> {vi ? "Đang gửi..." : "Sending..."}</> : (vi ? "Gửi yêu cầu" : "Send request"))}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Security Card ─── */}
      <div className={styles.card}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>{vi ? "Bảo mật" : "Security"}</h2>
          <button className={styles.btnOutline} type="button" onClick={() => setShowPasswordSection((v) => !v)}>
            <Lock size={14} />
            {vi ? "Đổi mật khẩu" : "Change password"}
          </button>
        </div>

        <div className={styles.securityBadges}>
          <div className={styles.securityBadge}>
            <Lock size={15} />
            <span>{vi ? "Mật khẩu" : "Password"}</span>
            <span className={hoSo?.coMatKhau ? styles.badgeActive : styles.badgeInactive}>
              {hoSo?.coMatKhau ? (vi ? "Đã thiết lập" : "Set") : (vi ? "Chưa thiết lập" : "Not set")}
            </span>
          </div>
          <div className={styles.securityBadge}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
            <span className={hoSo?.lienKetGoogle ? styles.badgeActive : styles.badgeInactive}>
              {hoSo?.lienKetGoogle ? (vi ? "Đã liên kết" : "Connected") : (vi ? "Chưa liên kết" : "Not linked")}
            </span>
          </div>
        </div>

        {showPasswordSection && (
          <form className={styles.subCard} onSubmit={handlePasswordSubmit}>
            <div className={styles.subCardTitle}>
              <Lock size={14} />
              {vi ? "Đổi mật khẩu" : "Change password"}
            </div>
            {pwError && (
              <p style={{ color: "#e11d48", fontSize: "13px", marginBottom: "8px" }}>
                {pwError}
              </p>
            )}
            {[
              { id: "input-old-pw", label: vi ? "Mật khẩu hiện tại" : "Current password", value: oldPw, setter: setOldPw, show: showOld, toggle: () => setShowOld((v) => !v) },
              { id: "input-new-pw", label: vi ? "Mật khẩu mới" : "New password", value: newPw, setter: setNewPw, show: showNew, toggle: () => setShowNew((v) => !v) },
              { id: "input-confirm-pw", label: vi ? "Xác nhận mật khẩu mới" : "Confirm new password", value: confirmPw, setter: setConfirmPw, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
            ].map((f) => (
              <div className={styles.passwordField} key={f.id}>
                <label htmlFor={f.id} className={styles.fieldLabelSmall}>{f.label}</label>
                <div className={styles.passwordInputWrap}>
                  <input id={f.id} className={styles.input} type={f.show ? "text" : "password"} value={f.value} onChange={(e) => f.setter(e.target.value)} required autoComplete="off" />
                  <button type="button" className={styles.eyeBtn} onClick={f.toggle} aria-label={f.show ? (vi ? "Ẩn" : "Hide") : (vi ? "Hiện" : "Show")}>
                    {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <div className={styles.formActions}>
              <button className={styles.btnOutline} type="button" onClick={() => setShowPasswordSection(false)}>{vi ? "Hủy" : "Cancel"}</button>
              <button className={styles.btnPrimary} type="submit" disabled={isChangingPassword}>
                {pwSuccess ? <><Check size={14} /> {vi ? "Đã cập nhật!" : "Updated!"}</> : (isChangingPassword ? <><Loader2 size={14} className="animate-spin" /> {vi ? "Đang xử lý..." : "Processing..."}</> : (vi ? "Cập nhật mật khẩu" : "Update password"))}
              </button>
            </div>
          </form>
        )}

        {hoSo?.ngayTao && (
          <div className={styles.accountMeta}>
            <span>{vi ? "Ngày tạo tài khoản:" : "Account created:"}</span>
            <strong>
              {new Date(hoSo.ngayTao).toLocaleDateString(vi ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </strong>
          </div>
        )}
      </div>
      </div>
      
    </PatientPortal>
  );
}
