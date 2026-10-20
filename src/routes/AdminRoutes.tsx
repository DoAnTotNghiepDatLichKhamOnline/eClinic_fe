import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPageAdmin } from "@/features/auth/login/LoginPageAdmin";
import { AdminDashboardPage } from "@/features/admin/AdminDashboardPage";
import type { AdminSection } from "@/features/admin/AdminSidebar";
import { AuthGuard } from "@/shared/components/auth/AuthGuard";
import { useAuth } from "@/shared/context/AuthContext";

const sections: { path: string; section: AdminSection }[] = [
  { path: "dashboard", section: "dashboard" },
  { path: "schedule-management", section: "schedule" },
  { path: "medical-catalog", section: "catalog" },
  { path: "doctors", section: "doctors" },
  { path: "patients", section: "patients" },
  { path: "accounts", section: "accounts" },
];

function AdminLoginRoute() {
  const { user, isAuthenticated, isLoadingSession } = useAuth();
  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }
  if (isAuthenticated && user?.vaiTro === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <LoginPageAdmin />;
}

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginRoute />} />
      <Route
        index
        element={
          <AuthGuard allowedRoles={["admin"]} loginPath="/admin/login">
            <Navigate to="dashboard" replace />
          </AuthGuard>
        }
      />
      {sections.map(({ path, section }) => (
        <Route
          key={path}
          path={path}
          element={
            <AuthGuard allowedRoles={["admin"]} loginPath="/admin/login">
              <AdminDashboardPage activeSection={section} />
            </AuthGuard>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
