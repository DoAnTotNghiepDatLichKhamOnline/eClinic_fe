import { useEffect, type RefObject } from "react";
import type QrScanner from "qr-scanner";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";

interface UseQrScannerOptions {
  isOpen: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onScan: (code: string) => void;
  onClose: () => void;
}

export function useQrScanner({
  isOpen,
  videoRef,
  onScan,
  onClose,
}: UseQrScannerOptions) {
  const { lang } = useLanguage();

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    let scanner: QrScanner | undefined;
    let disposed = false;

    void import("qr-scanner")
      .then(({ default: QrScannerClass }) => {
        if (disposed || !videoRef.current) return;
        scanner = new QrScannerClass(
          videoRef.current,
          (result) => {
            const qrText = result.data;
            try {
              const decoded = JSON.parse(qrText) as {
                appointmentCode?: string;
              };
              onScan(decoded.appointmentCode || qrText);
            } catch {
              onScan(qrText);
            }
            scanner?.stop();
            onClose();
          },
          { preferredCamera: "environment" },
        );
        return scanner.start();
      })
      .catch(() => {
        if (!disposed) {
          onClose();
          notifyAuth(
            "error",
            lang === "vi" ? "Không thể mở camera" : "Camera unavailable",
            lang === "vi"
              ? "Kiểm tra quyền truy cập camera hoặc nhập mã phiếu thủ công."
              : "Check camera permission or enter the visit code manually.",
          );
        }
      });

    return () => {
      disposed = true;
      scanner?.stop();
      scanner?.destroy();
    };
  }, [isOpen, lang, videoRef, onScan, onClose]);
}
