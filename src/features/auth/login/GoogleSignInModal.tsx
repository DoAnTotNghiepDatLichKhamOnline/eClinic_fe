import { useState, useEffect, useRef } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Loader2, KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: string | number;
            },
          ) => void;
          prompt: (notification?: (notification: any) => void) => void;
        };
      };
    };
  }
}

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (idToken: string) => Promise<void>;
  isLoading: boolean;
}

export function GoogleSignInModal({
  isOpen,
  onClose,
  onSuccess,
  isLoading,
}: GoogleSignInModalProps) {
  const { lang } = useLanguage();
  const [tokenInput, setTokenInput] = useState("");
  const [gisLoaded, setGisLoaded] = useState(false);
  const [gisError, setGisError] = useState<string | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Load Google Identity Services script if googleClientId is present
  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    if (window.google?.accounts?.id) {
      setGisLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGisLoaded(true);
    };
    script.onerror = () => {
      setGisError(
        lang === "vi"
          ? "Không thể tải Google Identity Services. Vui lòng kiểm tra kết nối mạng."
          : "Failed to load Google Identity Services. Check your connection.",
      );
    };

    document.head.appendChild(script);

    return () => {
      // Keep script cached in head
    };
  }, [isOpen, googleClientId, lang]);

  // Initialize and render Google button once script is ready
  useEffect(() => {
    if (
      !isOpen ||
      !gisLoaded ||
      !googleClientId ||
      !window.google?.accounts?.id ||
      !googleBtnContainerRef.current
    ) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (response?.credential) {
            await onSuccess(response.credential);
          }
        },
      });

      googleBtnContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 320,
      });
    } catch (err: any) {
      setGisError(err?.message || "Error initializing Google Identity");
    }
  }, [isOpen, gisLoaded, googleClientId, onSuccess]);

  const handleSubmitManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim() || isLoading) return;
    await onSuccess(tokenInput.trim());
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setTokenInput(text.trim());
    } catch {
      // Clipboard permission denied or unsupported
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === "vi" ? "Đăng nhập với Google" : "Sign in with Google"}
      maxWidth="lg"
    >
      <div className="space-y-4 py-1 text-sm text-slate-700">
        {/* Role Notice based on BE business rule */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold">
              {lang === "vi" ? "Quy định hệ thống: " : "System Note: "}
            </span>
            {lang === "vi"
              ? "Tính năng đăng nhập bằng Google chỉ áp dụng cho tài khoản Bệnh nhân. Bác sĩ và Quản trị viên vui lòng sử dụng email và mật khẩu."
              : "Google sign-in is exclusively available for Patient accounts. Doctors and Administrators must log in using email and password."}
          </div>
        </div>

        {/* GIS Button if Client ID configured */}
        {googleClientId && (
          <div className="flex flex-col items-center justify-center gap-3 py-3 border-b border-slate-100">
            <div ref={googleBtnContainerRef} className="min-h-[44px] flex items-center justify-center" />
            {gisError && (
              <p className="text-xs text-rose-600 text-center">{gisError}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400 w-full">
              <div className="flex-1 h-px bg-slate-200" />
              <span>{lang === "vi" ? "hoặc nhập Token thủ công" : "or enter token manually"}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>
        )}

        {/* Manual ID Token for Development / Fallback */}
        <form onSubmit={handleSubmitManualToken} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="google-id-token"
                className="text-xs font-semibold text-slate-800 flex items-center gap-1.5"
              >
                <KeyRound size={14} className="text-teal-600" />
                <span>Google ID Token (JWT)</span>
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
              >
                {lang === "vi" ? "Dán từ clipboard" : "Paste token"}
              </button>
            </div>
            <textarea
              id="google-id-token"
              rows={3}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6..."
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
              disabled={isLoading}
              required
            />
            {!googleClientId && (
              <p className="mt-1 text-[11px] text-slate-500 leading-normal">
                {lang === "vi"
                  ? "Chưa cấu hình VITE_GOOGLE_CLIENT_ID. Bạn có thể dán ID Token lấy từ OAuth Playground hoặc ứng dụng thử nghiệm."
                  : "VITE_GOOGLE_CLIENT_ID is not set. You can paste an ID token from OAuth Playground or testing app."}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              {lang === "vi" ? "Đóng" : "Close"}
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              disabled={!tokenInput.trim() || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{lang === "vi" ? "Đang xác thực..." : "Verifying..."}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>{lang === "vi" ? "Xác nhận đăng nhập" : "Submit Token"}</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
