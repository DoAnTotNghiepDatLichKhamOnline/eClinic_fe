import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Globe,
  LogOut,
  Monitor,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { PatientPortal } from "@/features/patient/PatientPortal";
import { MOCK_SESSIONS, type SessionItem } from "./sessions.data";
import styles from "./SessionsPage.module.css";

function formatRelative(isoStr: string, vi: boolean): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 5) return vi ? "Vừa xong" : "Just now";
  if (mins < 60) return vi ? `${mins} phút trước` : `${mins}m ago`;
  if (hours < 24) return vi ? `${hours} giờ trước` : `${hours}h ago`;
  return vi ? `${days} ngày trước` : `${days}d ago`;
}

export function SessionsPage() {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [sessions, setSessions] = useState<SessionItem[]>(MOCK_SESSIONS);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokedAll, setRevokedAll] = useState(false);

  const currentSession = sessions.find((s) => s.hienTai);
  const otherSessions = sessions.filter((s) => !s.hienTai);

  const handleRevoke = (id: string) => {
    setRevoking(id);
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setRevoking(null);
    }, 900);
  };

  const handleRevokeAll = () => {
    setRevokedAll(true);
    setTimeout(() => {
      setSessions((prev) => prev.filter((s) => s.hienTai));
      setRevokedAll(false);
    }, 1200);
  };

  return (
    <PatientPortal>
      <div className={styles.page}>
      {/* ─── Page Header ─── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderIcon}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 className={styles.pageTitle}>
            {vi ? "Quản lý thiết bị đăng nhập" : "Login Device Management"}
          </h1>
          <p className={styles.pageSubtitle}>
            {vi
              ? "Xem và kiểm soát các phiên đăng nhập đang hoạt động"
              : "View and control your active login sessions"}
          </p>
        </div>
      </div>

      {/* ─── Security notice ─── */}
      <div className={styles.securityNotice}>
        <AlertTriangle size={16} />
        <span>
          {vi
            ? "Nếu bạn phát hiện thiết bị lạ, hãy đăng xuất ngay và đổi mật khẩu để bảo vệ tài khoản."
            : "If you notice an unrecognized device, sign it out immediately and change your password to protect your account."}
        </span>
      </div>

      {/* ─── Current Session ─── */}
      {currentSession && (
        <div className={styles.currentCard}>
          <div className={styles.deviceIcon}>
            {currentSession.loai === "mobile" ? <Smartphone size={20} /> : <Monitor size={20} />}
          </div>
          <div className={styles.sessionInfo}>
            <div className={styles.sessionDevice}>
              {currentSession.thietBi}
              <span className={styles.currentBadge}>
                {vi ? "Thiết bị này" : "This device"}
              </span>
              <span className={styles.onlineDot} title={vi ? "Đang trực tuyến" : "Online"} />
            </div>
            <div className={styles.sessionMeta}>
              <span className={styles.sessionMetaItem}>
                <Globe size={12} />
                {currentSession.ip} · {currentSession.viTri}
              </span>
              <span className={styles.sessionMetaItem}>
                <Clock size={12} />
                {vi ? "Hoạt động" : "Active"} {formatRelative(currentSession.hoatDongLuc, vi)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Other Sessions ─── */}
      {otherSessions.length > 0 && (
        <>
          <div className={styles.sectionTitle}>
            {vi
              ? `Thiết bị khác (${otherSessions.length})`
              : `Other devices (${otherSessions.length})`}
          </div>

          {revokedAll && (
            <div className={styles.successBanner}>
              <Check size={15} />
              {vi ? "Đã đăng xuất tất cả thiết bị khác!" : "All other devices signed out!"}
            </div>
          )}

          <div className={styles.sessionList}>
            {otherSessions.map((s) => (
              <div
                key={s.id}
                className={`${styles.sessionCard} ${revoking === s.id ? styles.sessionCardRevoking : ""}`}
              >
                <div className={`${styles.deviceIcon} ${styles.deviceIconOther}`}>
                  {s.loai === "mobile" ? <Smartphone size={18} /> : <Monitor size={18} />}
                </div>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionDevice}>
                    <span className={styles.offlineDot} />
                    {s.thietBi}
                  </div>
                  <div className={styles.sessionMeta}>
                    <span className={styles.sessionMetaItem}>
                      <Globe size={12} />
                      {s.ip} · {s.viTri}
                    </span>
                    <span className={styles.sessionMetaItem}>
                      <Clock size={12} />
                      {vi ? "Lần cuối hoạt động" : "Last active"} {formatRelative(s.hoatDongLuc, vi)}
                    </span>
                  </div>
                </div>
                <div className={styles.sessionActions}>
                  <button
                    className={styles.btnDangerOutline}
                    type="button"
                    onClick={() => handleRevoke(s.id)}
                    disabled={revoking === s.id}
                    aria-label={vi ? `Đăng xuất ${s.thietBi}` : `Sign out ${s.thietBi}`}
                  >
                    {revoking === s.id ? (
                      <>{vi ? "Đang xử lý..." : "Revoking..."}</>
                    ) : (
                      <><LogOut size={13} /> {vi ? "Đăng xuất" : "Sign out"}</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {otherSessions.length === 0 && !revokedAll && (
        <div style={{ fontSize: 13, color: "#8a948f", textAlign: "center", padding: "16px 0" }}>
          {vi ? "Không có thiết bị nào khác đang đăng nhập." : "No other devices are currently signed in."}
        </div>
      )}

      {/* ─── Danger Zone ─── */}
      <div className={styles.dangerZone}>
        <div className={styles.dangerZoneHeader}>
          <LogOut size={16} />
          {vi ? "Vùng nguy hiểm" : "Danger zone"}
        </div>
        <div className={styles.dangerZoneBody}>
          <p className={styles.dangerZoneDesc}>
            {vi
              ? "Đăng xuất khỏi tất cả các thiết bị khác (ngoại trừ thiết bị hiện tại). Thao tác này không thể hoàn tác."
              : "Sign out from all other devices (except this one). This action cannot be undone."}
          </p>
          <button
            className={styles.btnDanger}
            type="button"
            onClick={handleRevokeAll}
            disabled={otherSessions.length === 0}
          >
            <LogOut size={15} />
            {vi ? "Đăng xuất tất cả thiết bị khác" : "Sign out all other devices"}
          </button>
        </div>
      </div>
      </div>
    </PatientPortal>
  );
}
