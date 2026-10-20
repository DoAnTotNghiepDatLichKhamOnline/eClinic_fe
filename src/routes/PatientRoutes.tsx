import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthGuard } from "@/shared/components/auth/AuthGuard";
import { PatientAppointmentsPage } from "@/features/patient/appointments/PatientAppointmentsPage";
import { AccountInfoPage } from "@/features/patient/account/AccountInfoPage";
import { PatientProfilePage } from "@/features/patient/patient-profile/PatientProfilePage";
import { MyAppointmentsPage } from "@/features/patient/my-appointments/MyAppointmentsPage";
import { DashboardPage } from "@/features/patient/dashboard/DashboardPage";
import { SessionsPage } from "@/features/patient/sessions/SessionsPage";

export function PatientRoutes() {
  return (
    <Routes>
      <Route
        element={
          <AuthGuard allowedRoles={["patient"]} loginPath="/login">
            <Outlet />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="account-info" element={<AccountInfoPage />} />
        <Route path="patient-profile" element={<PatientProfilePage />} />
        <Route path="profile" element={<PatientProfilePage />} />
        <Route path="my-appointments" element={<MyAppointmentsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
