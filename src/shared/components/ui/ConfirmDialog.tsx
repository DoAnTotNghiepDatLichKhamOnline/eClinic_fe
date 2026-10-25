import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
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
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { lang } = useLanguage();
  const resolvedCancelLabel = cancelLabel ?? (lang === "vi" ? "Hủy" : "Cancel");
  const resolvedConfirmLabel = confirmLabel ?? (lang === "vi" ? "Xác nhận" : "Confirm");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="" // Ẩn header mặc định của Modal để tự custom layout liền mạch
      className={styles.modalCustom}
      closeOnBackdropClick={false}
    >
      <div className={styles.dialogContainer}>
        {/* Phần thân: Icon tròn mềm + Title + Message */}
        <div className={styles.body}>
          <div className={`${styles.iconWrap} ${styles[variant]}`}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.textWrap}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
          </div>
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
            {isLoading
              ? lang === "vi"
                ? "Đang xử lý..."
                : "Processing..."
              : resolvedConfirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
