import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Search, Camera, Upload, X, QrCode } from "lucide-react";
import QrScanner from "qr-scanner";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { useQrScanner } from "@/features/doctor/workspace/hooks/useQrScanner";
import { validateAppointmentCode } from "@/utils/formValidators";
import { FieldError } from "@/utils/passwordMatchValidator";

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
  const [codeError, setCodeError] = useState<string | null>(null);
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
    const err = validateAppointmentCode(code, lang);
    setCodeError(err);
    if (err) return;
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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs px-4 py-3 mb-5 transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 shrink-0 text-slate-700">
          <QrCode className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="text-xs font-bold whitespace-nowrap">
            {lang === "vi" ? "Mở hồ sơ khám:" : "Quick Lookup:"}
          </span>
        </div>

        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (codeError) setCodeError(null);
            }}
            onBlur={() => {
              if (code.trim()) setCodeError(validateAppointmentCode(code, lang));
            }}
            placeholder={
              lang === "vi"
                ? "Nhập mã tra cứu (ECL-…), mã phiếu hoặc dán link phiếu khám..."
                : "Enter code (ECL-…), ticket code, or paste ticket link..."
            }
            className={`w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border ${
              codeError
                ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200"
                : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-100"
            } outline-none transition`}
            disabled={isLoading}
          />
          {code && (
            <button
              type="button"
              onClick={() => {
                setCode("");
                setCodeError(null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {codeError && (
            <div className="absolute left-0 -bottom-4 z-10">
              <FieldError error={codeError} id="appointment-code-error" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <Search className="w-3.5 h-3.5" />
            {isLoading
              ? lang === "vi"
                ? "Đang tìm..."
                : "Finding..."
              : lang === "vi"
                ? "Mở hồ sơ"
                : "Open Record"}
          </button>

          <button
            type="button"
            onClick={() => setIsCameraOpen((prev) => !prev)}
            title={lang === "vi" ? "Quét mã QR bằng Camera" : "Scan QR via Camera"}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition ${
              isCameraOpen
                ? "bg-teal-50 border-teal-300 text-teal-700 font-bold"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">
              {isCameraOpen
                ? lang === "vi"
                  ? "Tắt Cam"
                  : "Close Cam"
                : lang === "vi"
                  ? "Quét QR"
                  : "Scan QR"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDecodingImage}
            title={lang === "vi" ? "Tải ảnh chứa mã QR" : "Upload QR image"}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">
              {isDecodingImage
                ? lang === "vi"
                  ? "Đang đọc..."
                  : "Reading..."
                : lang === "vi"
                  ? "Tải ảnh QR"
                  : "Upload"}
            </span>
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
        <div className="mt-3 p-3 border border-teal-200 bg-teal-50/50 rounded-lg flex flex-col items-center">
          <div className="relative w-full max-w-xs rounded-lg overflow-hidden border-2 border-teal-500 shadow-sm bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 border-2 border-dashed border-teal-300 pointer-events-none rounded-lg m-4 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 text-center">
            {lang === "vi"
              ? "Hướng camera vào mã QR trên phiếu khám của bệnh nhân"
              : "Point camera at patient's ticket QR code"}
          </p>
        </div>
      )}
    </div>
  );
}
