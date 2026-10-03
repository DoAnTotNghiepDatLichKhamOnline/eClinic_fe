import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPageAdmin } from "@/features/auth/login-admin/LoginPageAdmin";
import { AdminDashboardPage } from "@/features/admin/AdminDashboardPage";
import type { AdminSection } from "@/features/admin/AdminSidebar";

const sections: { path: string; section: AdminSection }[] = [
  { path: "dashboard", section: "dashboard" },
  { path: "schedule-management", section: "schedule" },
  { path: "medical-catalog", section: "catalog" },
  { path: "doctors", section: "doctors" },
  { path: "patients", section: "patients" },
];

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPageAdmin />} />
      <Route index element={<Navigate to="dashboard" replace />} />
      {sections.map(({ path, section }) => (
        <Route
          key={path}
          path={path}
          element={<AdminDashboardPage activeSection={section} />}
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
