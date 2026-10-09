import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { PatientAppointmentsPage } from "@/features/patient/appointments/PatientAppointmentsPage";
import { AccountInfoPage } from "@/features/patient/account/AccountInfoPage";
import { PatientProfilePage } from "@/features/patient/patient-profile/PatientProfilePage";
import { MyAppointmentsPage } from "@/features/patient/my-appointments/MyAppointmentsPage";
import { DashboardPage } from "@/features/patient/dashboard/DashboardPage";
import { SessionsPage } from "@/features/patient/sessions/SessionsPage";

function RequirePatient() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  if (user.role !== "patient") {
    return (
      <Navigate
        to={user.role === "doctor" ? "/doctor/dashboard" : "/admin/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

export function PatientRoutes() {
  return (
    <Routes>
      <Route element={<RequirePatient />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="account-info" element={<AccountInfoPage />} />
        <Route path="patient-profile" element={<PatientProfilePage />} />
        <Route path="my-appointments" element={<MyAppointmentsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
