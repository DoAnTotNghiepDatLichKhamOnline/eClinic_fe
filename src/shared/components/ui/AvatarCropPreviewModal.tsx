import { useState, useEffect, useRef } from "react";
import { X, Camera, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";

export interface AvatarCropPreviewModalProps {
  imageFile: File | null;
  isOpen: boolean;
  isUploading: boolean;
  onClose: () => void;
  onConfirm: (croppedBlob: Blob) => Promise<void>;
}

/**
 * Utility function that takes a File, computes the center-cropped square
 * (1:1 ratio) and returns a lightweight, high-quality JPEG Blob (512x512).
 */
export function cropSquareImage(file: File, targetSize = 512): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      // High-quality image rendering on canvas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const minSide = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - minSide) / 2;
      const sy = (img.naturalHeight - minSide) / 2;

      ctx.drawImage(
        img,
        sx,
        sy,
        minSide,
        minSide,
        0,
        0,
        targetSize,
        targetSize,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas export to Blob failed"));
          }
        },
        "image/jpeg",
        0.92,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load source image file"));
    };

    img.src = objectUrl;
  });
}

export function AvatarCropPreviewModal({
  imageFile,
  isOpen,
  isUploading,
  onClose,
  onConfirm,
}: AvatarCropPreviewModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      setErrorMessage(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    setErrorMessage(null);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUploading && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUploading, isProcessing, onClose]);

  if (!isOpen || !imageFile) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const croppedBlob = await cropSquareImage(imageFile, 512);
      await onConfirm(croppedBlob);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : vi
            ? "Không thể xử lý hình ảnh."
            : "Failed to process image.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isUploading || isProcessing;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={vi ? "Cắt và xem trước ảnh đại diện" : "Crop and preview profile photo"}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {vi ? "Xem trước ảnh đại diện" : "Preview Profile Photo"}
              </h2>
              <p className="text-xs text-slate-500">
                {vi ? "Cố định khung tròn chuẩn tỷ lệ 1:1" : "Fixed circular 1:1 avatar frame"}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
            aria-label={vi ? "Đóng" : "Close"}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body / Circular Preview Frame */}
        <div className="p-6 flex flex-col items-center">
          {errorMessage && (
            <div className="w-full mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Fixed Circular Frame Container */}
          <div className="relative flex items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200/80 w-full mb-4">
            {/* The circular preview window */}
            <div className="relative h-44 w-44 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 ring-2 ring-teal-500/30">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={vi ? "Xem trước" : "Preview"}
                  className="h-full w-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-slate-400">
                  <Camera size={36} />
                </div>
              )}

              {/* Uploading / Processing Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs grid place-items-center text-white">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={28} className="animate-spin text-teal-400" />
                    <span className="text-[11px] font-semibold text-slate-100">
                      {vi ? "Đang xử lý..." : "Processing..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guide hint */}
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-teal-50/60 border border-teal-100 rounded-xl p-3 w-full">
            <Sparkles size={16} className="text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {vi
                ? "Ảnh sẽ được tự động căn giữa và cắt theo khung tròn chuẩn eClinic (512×512px). Ảnh đại diện của bạn sẽ hiển thị sắc nét và vừa vặn trên toàn hệ thống."
                : "Your photo will be automatically centered and cropped to fit eClinic's circular frame (512×512px) with crisp quality across all pages."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50/70 px-6 py-3.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            {vi ? "Hủy" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void handleConfirm()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{vi ? "Đang tải lên..." : "Uploading..."}</span>
              </>
            ) : (
              <span>{vi ? "Xác nhận & Tải lên" : "Confirm & Upload"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
