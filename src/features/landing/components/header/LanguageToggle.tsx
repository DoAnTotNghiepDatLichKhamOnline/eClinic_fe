import { useState } from "react";
import { isAxiosError } from "axios";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { userProfileService } from "@/services/identity/userProfileService";
import { notifyAuth } from "@/utils/authNotification";
import { cx } from "@/utils/cx";
import styles from "./LanguageToggle.module.css";

export function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const changeLanguage = async () => {
    if (isSaving) return;
    const nextLanguage = lang === "en" ? "vi" : "en";
    localStorage.setItem("eclinic_language_manual", "true");
    toggleLanguage();
    void queryClient.invalidateQueries();
    if (user) {
      setIsSaving(true);
      try {
        const response = await userProfileService.capNhatNgonNgu(
          nextLanguage === "vi" ? "VI" : "EN",
        );
        if (!response.thanhCong) {
          throw new Error(response.thongDiep || "Could not save language preference");
        }
      } catch (error: unknown) {
        const message =
          (isAxiosError<{ thongDiep?: string }>(error)
            ? error.response?.data?.thongDiep
            : undefined) ??
          (error instanceof Error
            ? error.message
            : "Could not save language preference");
        notifyAuth(
          "error",
          lang === "vi" ? "Không thể lưu ngôn ngữ" : "Could not save language",
          lang === "vi"
            ? `${message} Ngôn ngữ hiện tại chỉ được lưu trên thiết bị này.`
            : `${message} The current language is saved only on this device.`,
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => void changeLanguage()}
      disabled={isSaving}
      aria-pressed={lang === "vi"}
      aria-label="Switch language"
    >
      <span className={cx(styles.opt, lang === "en" && styles.isActive)}>
        EN
      </span>
      <span className={styles.divider}>/</span>
      <span className={cx(styles.opt, lang === "vi" && styles.isActive)}>
        VI
      </span>
    </button>
  );
}
