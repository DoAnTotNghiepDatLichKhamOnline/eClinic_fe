import { useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Lock, X, Loader2 } from "lucide-react";
import type { TaiKhoanQuanTriResponse } from "@/types/auth.type";

interface DisableAccountModalProps {
  user: TaiKhoanQuanTriResponse;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function DisableAccountModal({
  user,
  onClose,
  onConfirm,
  isLoading = false,
}: DisableAccountModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(vi ? "Vui lòng nhập lý do vô hiệu hóa." : "Please enter a disable reason.");
      return;
    }
    if (reason.length > 500) {
      setError(vi ? "Lý do không được vượt quá 500 ký tự." : "Reason cannot exceed 500 characters.");
      return;
    }
    setError("");
    await onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={vi ? "Vô hiệu hóa tài khoản" : "Disable account"}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600">
              <Lock size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {vi ? "Vô hiệu hóa tài khoản" : "Disable Account"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
            <p>
              {vi ? "Tài khoản ảnh hưởng:" : "Target account:"}{" "}
              <strong className="text-slate-800">{user.hoTen}</strong> ({user.email})
            </p>
            <p className="mt-1 text-slate-500">
              {vi
                ? "Người dùng này sẽ không thể đăng nhập vào hệ thống sau khi bị khóa."
                : "This user will not be able to log into the system once disabled."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {vi ? "Lý do vô hiệu hóa (tối đa 500 ký tự)" : "Disable reason (up to 500 characters)"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              maxLength={500}
              placeholder={
                vi
                  ? "Ví dụ: Vi phạm quy định sử dụng, tài khoản trùng lặp..."
                  : "E.g.: Violation of terms, duplicate account..."
              }
              className="w-full p-3 text-xs placeholder:text-slate-400"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
              <span>{error && <span className="text-rose-600">{error}</span>}</span>
              <span>{reason.length}/500</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {vi ? "Hủy" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {isLoading && <Loader2 size={13} className="animate-spin" />}
              {vi ? "Xác nhận khóa" : "Confirm Disable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
