import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { useLanguage } from "@/shared/context/LanguageContext";

interface AuthGuardProps {
  allowedRoles: Array<"patient" | "doctor" | "admin">;
  loginPath?: string;
  children?: React.ReactNode;
}

export function AuthGuard({
  allowedRoles,
  loginPath,
  children,
}: AuthGuardProps) {
  const { user, isLoadingSession } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();

  // 1. Khi đang nạp session ban đầu, hiển thị spinner nhẹ để tránh redirect giật màn hình
  if (isLoadingSession) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-8 h-8 rounded-full border-3 border-teal-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">
          {lang === "vi"
            ? "Đang xác thực phiên đăng nhập..."
            : "Verifying session..."}
        </p>
      </div>
    );
  }

  // 2. Chưa đăng nhập -> Chuyển về đúng trang đăng nhập theo vai trò
  if (!user) {
    const targetLogin =
      loginPath ||
      (allowedRoles.includes("doctor")
        ? "/doctor/login"
        : allowedRoles.includes("admin")
          ? "/admin/login"
          : "/login");

    return (
      <Navigate
        to={targetLogin}
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  // 3. Đã đăng nhập nhưng không đúng Role -> Tự động chuyển hướng về đúng Portal của họ
  if (!allowedRoles.includes(user.role)) {
    const rolePortalMap: Record<"patient" | "doctor" | "admin", string> = {
      doctor: "/doctor/dashboard",
      admin: "/admin/dashboard",
      patient: "/patient/dashboard",
    };

    const targetPortal = rolePortalMap[user.role] || "/home";
    return <Navigate to={targetPortal} replace />;
  }

  // 4. Hợp lệ -> Render route con
  return children ? <>{children}</> : <Outlet />;
}
