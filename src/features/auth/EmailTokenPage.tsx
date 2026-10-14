import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { identityService } from "@/services/identityService";

export function EmailTokenPage({ kind }: { kind: "verify" | "change" }) {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const { logout } = useAuth();
  const [state, setState] = useState<"ready" | "busy" | "done" | "error">("ready");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [expired, setExpired] = useState(false);
  const token = params.get("token") ?? "";
  const isVerify = kind === "verify";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setState("error");
      setMessage(t({ en: "This link is missing its token.", vi: "Liên kết thiếu mã xác thực." }));
      return;
    }
    setState("busy");
    try {
      const response = isVerify
        ? await identityService.xacThucEmail({ token })
        : await identityService.xacNhanDoiEmail({ token });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      if (!isVerify) await logout();
      setState("done");
      setMessage(isVerify
        ? t({ en: "Your email is verified. You can now sign in.", vi: "Email đã được xác thực. Bạn có thể đăng nhập." })
        : t({ en: "Your email was changed. Sign in again with the new address.", vi: "Email đã được đổi. Hãy đăng nhập lại bằng email mới." }));
      window.history.replaceState({}, "", window.location.pathname);
    } catch (cause) {
      setState("error");
      setExpired((cause as { response?: { status?: number } }).response?.status === 410);
      setMessage((cause as { response?: { data?: { thongDiep?: string } } }).response?.data?.thongDiep ?? (cause instanceof Error ? cause.message : t({ en: "This link is invalid or expired.", vi: "Liên kết không hợp lệ hoặc đã hết hạn." })));
    }
  };

  const resendVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("busy");
    try {
      const response = await identityService.guiLaiXacThuc({ email: email.trim() });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      setState("done");
      setMessage(t({ en: "A new verification link has been sent if the account can receive one.", vi: "Nếu tài khoản có thể nhận email, hệ thống đã gửi liên kết xác thực mới." }));
    } catch (cause) {
      setState("error");
      setMessage((cause as { response?: { data?: { thongDiep?: string } } }).response?.data?.thongDiep ?? (cause instanceof Error ? cause.message : "Could not resend verification link"));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-xl px-5 py-20">
        <div className="border-y border-slate-200 py-10">
          <div className="mb-5 text-emerald-900">{state === "done" ? <CheckCircle2 size={28} /> : <MailCheck size={28} />}</div>
          <h1 className="text-2xl font-bold text-slate-900">{isVerify ? t({ en: "Verify your email", vi: "Xác thực email" }) : t({ en: "Confirm email change", vi: "Xác nhận đổi email" })}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{message || t({ en: "Confirm this action to complete the secure email link.", vi: "Xác nhận thao tác để hoàn tất liên kết email bảo mật." })}</p>
            {state !== "done" && <form className="mt-6 flex flex-wrap gap-3" onSubmit={(event) => void submit(event)}>
            <button className="inline-flex items-center gap-2 bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={state === "busy" || !token}>
              {state === "busy" ? <Loader2 size={16} className="animate-spin" /> : null}
              {isVerify ? t({ en: "Verify email", vi: "Xác thực email" }) : t({ en: "Confirm change", vi: "Xác nhận đổi email" })}
            </button>
          </form>}
          {state === "error" && isVerify && expired && <form className="mt-5 flex flex-wrap gap-3" onSubmit={(event) => void resendVerification(event)}><label className="grid min-w-60 flex-1 gap-1 text-xs">{t({ en: "Account email", vi: "Email tài khoản" })}<input className="border border-slate-300 px-3 py-2 text-sm" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="self-end bg-emerald-900 px-4 py-2 text-sm font-semibold text-white">{t({ en: "Send a new link", vi: "Gửi liên kết mới" })}</button></form>}
          {state === "done" && <Link className="mt-6 inline-block font-semibold text-emerald-900" to="/login">{t({ en: "Go to sign in", vi: "Đến trang đăng nhập" })}</Link>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
