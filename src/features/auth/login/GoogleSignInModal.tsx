import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import {
    AlertCircle,
    ShieldAlert,
} from "lucide-react";
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
                            text?:
                            | "signin_with"
                            | "signup_with"
                            | "continue_with"
                            | "signin";
                            shape?: "rectangular" | "pill" | "circle" | "square";
                            width?: string | number;
                        },
                    ) => void;
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
}: GoogleSignInModalProps) {
    const { lang } = useLanguage();

    const [gisLoaded, setGisLoaded] = useState(false);
    const [gisError, setGisError] = useState<string | null>(null);
    const [popupBlocked, setPopupBlocked] = useState(false);

    const googleBtnContainerRef = useRef<HTMLDivElement>(null);

    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    });

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
                    ? "Không thể tải Google Identity Services."
                    : "Failed to load Google Identity Services.",
            );
        };

        document.head.appendChild(script);
    }, [isOpen, googleClientId, lang]);

    const initGis = useCallback(() => {
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
            setPopupBlocked(false);
            setGisError(null);

            window.google.accounts.id.initialize({
                client_id: googleClientId,
                cancel_on_tap_outside: true,
                callback: async (response) => {
                    if (response?.credential) {
                        await onSuccessRef.current(response.credential);
                    }
                },
            });

            googleBtnContainerRef.current.innerHTML = "";

            window.google.accounts.id.renderButton(
                googleBtnContainerRef.current,
                {
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    shape: "rectangular",
                    width: 320,
                },
            );
        } catch (err: any) {
            const msg =
                err?.message || "Failed to initialize Google Sign-In";

            const isPopupIssue =
                msg.toLowerCase().includes("popup") ||
                msg.toLowerCase().includes("blocked");

            if (isPopupIssue) {
                setPopupBlocked(true);
            }

            setGisError(msg);
        }
    }, [isOpen, gisLoaded, googleClientId]);

    useEffect(() => {
        initGis();
    }, [initGis]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={lang === "vi"
                ? "Đăng nhập với Google"
                : "Sign in with Google"}
            maxWidth="lg"
        >
            <div className="space-y-4 py-1 text-sm text-slate-700">

                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />

                    <div className="text-xs leading-relaxed">
                        <span className="font-semibold">
                            {lang === "vi"
                                ? "Quy định hệ thống: "
                                : "System Note: "}
                        </span>

                        {lang === "vi"
                            ? "Đăng nhập Google chỉ áp dụng cho tài khoản Bệnh nhân."
                            : "Google sign-in is only available for Patient accounts."}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <div
                        ref={googleBtnContainerRef}
                        className="min-h-[44px] flex items-center justify-center"
                    />

                    {gisError && (
                        <div className="flex items-start gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 w-full">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500 mt-0.5" />

                            <p className="text-xs text-rose-700">
                                {popupBlocked
                                    ? lang === "vi"
                                        ? "Trình duyệt đang chặn popup Google."
                                        : "Google popup is blocked by your browser."
                                    : gisError}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                    >
                        {lang === "vi" ? "Đóng" : "Close"}
                    </Button>
                </div>

            </div>
        </Modal>
    );
}