import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPageDoctor } from "@/features/auth/login/LoginPageDoctor";
import { DoctorDashboardPage } from "@/features/doctor/DoctorDashboardPage";
import type { DoctorSection } from "@/features/doctor/DoctorSidebar";
import { AuthGuard } from "@/shared/components/auth/AuthGuard";
import { useAuth } from "@/shared/context/AuthContext";

const DoctorWorkspace = lazy(() =>
  import("@/features/doctor/DoctorWorkspace").then((module) => ({
    default: module.DoctorWorkspace,
  })),
);

const sections: { path: string; section: DoctorSection | null }[] = [
  { path: "dashboard", section: null },
  { path: "work-schedule", section: "schedule" },
  { path: "consultation", section: "consultation" },
  { path: "profile", section: "profile" },
];

function DoctorLoginRoute() {
  const { user, isAuthenticated, isLoadingSession } = useAuth();
  if (isLoadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }
  if (isAuthenticated && user?.vaiTro === "doctor") {
    return <Navigate to="/doctor/dashboard" replace />;
  }
  return <LoginPageDoctor />;
}

export function DoctorRoutes() {
  return (
    <Routes>
      <Route path="login" element={<DoctorLoginRoute />} />
      <Route
        index
        element={
          <AuthGuard allowedRoles={["doctor"]} loginPath="/doctor/login">
            <Navigate to="dashboard" replace />
          </AuthGuard>
        }
      />
      <Route
        path="upcoming-appointments"
        element={<Navigate to="../work-schedule" replace />}
      />
      <Route
        path="appointment-requests"
        element={<Navigate to="../work-schedule" replace />}
      />
      {sections.map(({ path, section }) => (
        <Route
          key={path}
          path={path}
          element={
            <AuthGuard allowedRoles={["doctor"]} loginPath="/doctor/login">
              <DoctorDashboardPage activeSection={section}>
                {section && (
                  <Suspense fallback={<p role="status">Loading workspace...</p>}>
                    <DoctorWorkspace activeSection={section} />
                  </Suspense>
                )}
              </DoctorDashboardPage>
            </AuthGuard>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
