import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPageDoctor } from "@/features/auth/login-doctor/LoginPageDoctor";
import { DoctorDashboardPage } from "@/features/doctor/DoctorDashboardPage";
import type { DoctorSection } from "@/features/doctor/DoctorSidebar";

const DoctorWorkspace = lazy(() =>
  import("@/features/doctor/DoctorWorkspace").then((module) => ({
    default: module.DoctorWorkspace,
  })),
);

const sections: { path: string; section: DoctorSection | null }[] = [
  { path: "dashboard", section: null },
  { path: "work-schedule", section: "schedule" },
  { path: "appointment-requests", section: "appointments" },
  { path: "consultation", section: "consultation" },
  { path: "profile", section: "profile" },
];

export function DoctorRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPageDoctor />} />
      <Route index element={<Navigate to="dashboard" replace />} />
      {sections.map(({ path, section }) => (
        <Route
          key={path}
          path={path}
          element={
            <DoctorDashboardPage activeSection={section}>
              {section && (
                <Suspense fallback={<p role="status">Loading workspace...</p>}>
                  <DoctorWorkspace activeSection={section} />
                </Suspense>
              )}
            </DoctorDashboardPage>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
