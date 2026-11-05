import type { ReactNode } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { AlertCircle, LogOut } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "logout";
  icon?: ReactNode;
  confirmIcon?: ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  icon,
  confirmIcon,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { lang } = useLanguage();
  const resolvedCancelLabel = cancelLabel ?? (lang === "vi" ? "Hủy" : "Cancel");
  const resolvedConfirmLabel = confirmLabel ?? (lang === "vi" ? "Xác nhận" : "Confirm");

  const resolvedIcon =
    icon ??
    (variant === "logout" ? (
      <LogOut size={22} />
    ) : (
      <AlertCircle size={24} />
    ));

  const resolvedConfirmIcon =
    confirmIcon ??
    (variant === "logout" ? <LogOut size={16} /> : undefined);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title=""
      className={styles.modalCustom}
      closeOnBackdropClick={false}
    >
      <div className={styles.dialogContainer}>
        {/* Phần thân: Icon tròn + Title (căn giữa trục) + Message */}
        <div className={styles.body}>
          <div className={styles.headerRow}>
            <div className={`${styles.iconWrap} ${styles[variant]}`}>
              {resolvedIcon}
            </div>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Nút hành động */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className={styles.btnCancel}
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${styles.btnConfirm} ${styles[`btn_${variant}`]}`}
          >
            {isLoading ? (
              lang === "vi" ? "Đang xử lý..." : "Processing..."
            ) : (
              <>
                {resolvedConfirmIcon}
                <span>{resolvedConfirmLabel}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
