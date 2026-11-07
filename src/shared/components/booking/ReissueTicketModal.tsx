import { useState } from "react";
import {
  Printer,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Monitor,
  AlertCircle,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { useLanguage } from "@/shared/context/LanguageContext";
import { validateCCCD } from "@/utils/formValidators";
import { FieldError } from "@/utils/passwordMatchValidator";

export interface ReissuedData {
  idLichHen: number;
  maTraCuu: string;
  cachGui: "EMAIL" | "MAN_HINH";
  emailDaGui?: string;
  maPhieuKham?: string;
  lienKetPhieuKham?: string;
  maSoKham?: string;
  lienKetSoKham?: string;
}

export interface ReissueTicketModalProps {
  isOpen: boolean;
  appointmentId: number | string;
  appointmentCode?: string;
  patientName?: string;
  onClose: () => void;
  onReissue: (
    id: number,
    data: { cccd: string; cachGui: "EMAIL" | "MAN_HINH" },
  ) => Promise<ReissuedData>;
}

export function ReissueTicketModal({
  isOpen,
  appointmentId,
  appointmentCode,
  patientName,
  onClose,
  onReissue,
}: ReissueTicketModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [cccd, setCccd] = useState("");
  const [cccdError, setCccdError] = useState<string | null>(null);
  const [cachGui, setCachGui] = useState<"MAN_HINH" | "EMAIL">("MAN_HINH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<ReissuedData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const resetForm = () => {
    setCccd("");
    setCccdError(null);
    setCachGui("MAN_HINH");
    setIsSubmitting(false);
    setApiError(null);
    setResult(null);
    setCopiedKey(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCCCD(cccd, lang);
    setCccdError(err);
    if (err) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      const res = await onReissue(Number(appointmentId), {
        cccd: cccd.trim(),
        cachGui,
      });
      setResult(res);
    } catch (err: any) {
      const msg =
        err?.response?.data?.thongDiep ||
        (err instanceof Error
          ? err.message
          : vi
            ? "Không thể cấp lại liên kết. Vui lòng kiểm tra lại số CCCD."
            : "Could not reissue ticket. Please verify National ID (CCCD).");
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const qrImageUrl = result?.maSoKham
    ? `/api/booking/so-kham/${result.maSoKham}/qr`
    : result?.maPhieuKham
      ? `/api/booking/phieu-kham/${result.maPhieuKham}/qr`
      : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <FileCheck2 className="w-5 h-5 text-teal-600" />
          <span>
            {vi
              ? "Cấp lại Phiếu khám / Sổ khám tại quầy"
              : "Reissue Ticket / Medical Book at Counter"}
          </span>
        </div>
      }
      description={
        patientName || appointmentCode ? (
          <span className="text-xs text-slate-500">
            {vi ? "Lịch hẹn" : "Appointment"}: <strong>{appointmentCode || `#${appointmentId}`}</strong>
            {patientName && ` · ${patientName}`}
          </span>
        ) : undefined
      }
    >
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              {vi
                ? "Số CCCD người khám / người giám hộ (12 số) *"
                : "National ID (CCCD) of patient / guardian (12 digits) *"}
            </label>
            <input
              type="text"
              maxLength={12}
              value={cccd}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCccd(val);
                if (cccdError) setCccdError(null);
                if (apiError) setApiError(null);
              }}
              onBlur={() => {
                if (cccd) setCccdError(validateCCCD(cccd, lang));
              }}
              placeholder={vi ? "Nhập chính xác 12 số CCCD trên giấy tờ xuất trình..." : "Enter 12 digits..."}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none font-mono ${
                cccdError
                  ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-200"
                  : "border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              }`}
            />
            <FieldError error={cccdError} id="reissue-cccd-error" />
            <p className="text-[11px] text-slate-500 mt-0.5">
              {vi
                ? "Hệ thống sẽ đối chiếu với số CCCD đã đăng ký khi đặt lịch để đảm bảo bảo mật."
                : "System will verify CCCD matching the original booking for privacy."}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 block">
              {vi ? "Phương thức cấp lại *" : "Delivery Method *"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  cachGui === "MAN_HINH"
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-100"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="cachGui"
                  value="MAN_HINH"
                  checked={cachGui === "MAN_HINH"}
                  onChange={() => setCachGui("MAN_HINH")}
                  className="mt-0.5 text-teal-600"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-teal-600" />
                    <span>{vi ? "Tại màn hình quầy (Mặc định)" : "Counter Screen (Default)"}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {vi
                      ? "Hiển thị mã phiếu/sổ khám và mã QR trực tiếp để in hoặc quét ngay tại quầy."
                      : "Display ticket/medical record codes and QR code to print or scan."}
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  cachGui === "EMAIL"
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-100"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="cachGui"
                  value="EMAIL"
                  checked={cachGui === "EMAIL"}
                  onChange={() => setCachGui("EMAIL")}
                  className="mt-0.5 text-teal-600"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>{vi ? "Gửi qua Email" : "Send via Email"}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {vi
                      ? "Gửi lại link về email đã đăng ký (Yêu cầu lịch hẹn có nhập email)."
                      : "Send link to registered email (requires email in booking)."}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {vi ? "Hủy" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || cccd.length !== 12}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg shadow-sm transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{vi ? "Đang xử lý..." : "Processing..."}</span>
                </>
              ) : (
                <span>{vi ? "Xác nhận cấp lại" : "Reissue"}</span>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Result view */
        <div className="space-y-4 pt-1">
          {result.cachGui === "EMAIL" ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center">
              <Mail className="w-8 h-8 mx-auto text-emerald-600" />
              <h4 className="text-sm font-bold text-emerald-900">
                {vi ? "Đã gửi lại liên kết thành công!" : "Link sent successfully!"}
              </h4>
              <p className="text-xs text-emerald-700">
                {vi ? "Hệ thống đã gửi liên kết tới địa chỉ email: " : "Link sent to email: "}
                <strong>{result.emailDaGui || "—"}</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>
                  {vi
                    ? "Cấp lại liên kết thành công! Thông tin chi tiết hiển thị bên dưới:"
                    : "Reissued successfully! Details shown below:"}
                </span>
              </div>

              {/* Codes display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {vi ? "Mã tra cứu ngắn" : "Lookup Code"}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {result.maTraCuu}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.maTraCuu, "maTraCuu")}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition"
                      title={vi ? "Sao chép mã" : "Copy"}
                    >
                      {copiedKey === "maTraCuu" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {result.maPhieuKham && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {vi ? "Mã phiếu khám" : "Ticket Code"}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm truncate max-w-[160px]">
                        {result.maPhieuKham}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.maPhieuKham!, "maPhieuKham")}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition"
                        title={vi ? "Sao chép mã" : "Copy"}
                      >
                        {copiedKey === "maPhieuKham" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {result.maSoKham && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      {vi ? "Mã Sổ khám bệnh (Đã hoàn thành khám)" : "Medical Book Code (Completed)"}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-emerald-950 text-sm truncate">
                        {result.maSoKham}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(result.maSoKham!, "maSoKham")}
                          className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 transition"
                          title={vi ? "Sao chép mã sổ khám" : "Copy"}
                        >
                          {copiedKey === "maSoKham" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {result.lienKetSoKham && (
                          <a
                            href={result.lienKetSoKham}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 transition"
                            title={vi ? "Mở sổ khám" : "Open link"}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Preview & Print */}
              {qrImageUrl && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      className="w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-teal-600" />
                        {result.maSoKham
                          ? vi ? "Mã QR Sổ khám bệnh" : "Medical Book QR"
                          : vi ? "Mã QR Phiếu khám" : "Ticket QR"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {vi
                          ? "Cho bệnh nhân quét bằng điện thoại hoặc in trực tiếp ra giấy."
                          : "Patient can scan with phone or print directly to paper."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{vi ? "In thông tin quầy" : "Print QR"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm transition"
            >
              {vi ? "Hoàn tất" : "Done"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
