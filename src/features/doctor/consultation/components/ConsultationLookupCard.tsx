import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Search, Camera, Upload, X, QrCode } from "lucide-react";
import QrScanner from "qr-scanner";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { useQrScanner } from "@/features/doctor/workspace/hooks/useQrScanner";

interface ConsultationLookupCardProps {
  onSearch: (code: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function ConsultationLookupCard({
  onSearch,
  isLoading = false,
}: ConsultationLookupCardProps) {
  const { lang } = useLanguage();
  const [code, setCode] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDecodingImage, setIsDecodingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useQrScanner({
    isOpen: isCameraOpen,
    videoRef,
    onScan: (scannedCode) => {
      setCode(scannedCode);
      setIsCameraOpen(false);
      onSearch(scannedCode);
    },
    onClose: () => setIsCameraOpen(false),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await onSearch(code.trim());
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingImage(true);
    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      const decodedText = result.data;
      setCode(decodedText);
      notifyAuth(
        "success",
        lang === "vi" ? "Đọc mã QR thành công" : "QR Decoded",
        decodedText,
      );
      await onSearch(decodedText);
    } catch (err: unknown) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không đọc được mã QR" : "QR Scan Failed",
        lang === "vi"
          ? "Ảnh không chứa mã QR hợp lệ hoặc quá mờ. Hãy thử ảnh khác."
          : "Image does not contain a clear QR code. Please try another.",
      );
    } finally {
      setIsDecodingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-600" />
            {lang === "vi"
              ? "Tiếp nhận & Mở hồ sơ khám"
              : "Check-in & Medical Record"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "vi"
              ? "Nhập mã tra cứu (ECL-…), mã phiếu khám, hoặc quét mã QR từ camera / file ảnh"
              : "Enter lookup code (ECL-…), ticket code, or scan QR code via camera / image"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={
              lang === "vi"
                ? "VD: ECL-20261015-0001 hoặc dán link phiếu khám..."
                : "e.g. ECL-20261015-0001 or appointment link..."
            }
            className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
            disabled={isLoading}
          />
          {code && (
            <button
              type="button"
              onClick={() => setCode("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Search className="w-4 h-4" />
            {isLoading
              ? lang === "vi"
                ? "Đang tìm..."
                : "Finding..."
              : lang === "vi"
                ? "Mở hồ sơ"
                : "Find Record"}
          </button>

          <button
            type="button"
            onClick={() => setIsCameraOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
          >
            <Camera className="w-4 h-4 text-teal-600" />
            {isCameraOpen
              ? lang === "vi"
                ? "Tắt camera"
                : "Close Cam"
              : lang === "vi"
                ? "Quét QR Camera"
                : "Scan Camera"}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDecodingImage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            {isDecodingImage
              ? lang === "vi"
                ? "Đang đọc ảnh..."
                : "Reading..."
              : lang === "vi"
                ? "Tải ảnh QR"
                : "Upload QR"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </form>

      {/* Camera Live Stream Preview Modal */}
      {isCameraOpen && (
        <div className="mt-4 p-4 border border-teal-200 bg-teal-50/40 rounded-xl flex flex-col items-center">
          <div className="relative w-full max-w-sm rounded-lg overflow-hidden border-2 border-teal-500 shadow-md bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 border-2 border-dashed border-teal-300 pointer-events-none rounded-lg m-6 animate-pulse" />
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            {lang === "vi"
              ? "Hướng camera vào mã QR trên phiếu khám của bệnh nhân"
              : "Point the camera at the patient appointment ticket QR code"}
          </p>
        </div>
      )}
    </div>
  );
}
