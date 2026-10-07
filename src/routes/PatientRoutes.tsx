import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { PatientAppointmentsPage } from "@/features/patient/appointments/PatientAppointmentsPage";

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
        <Route index element={<Navigate to="appointments" replace />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="*" element={<Navigate to="appointments" replace />} />
      </Route>
    </Routes>
  );
}
