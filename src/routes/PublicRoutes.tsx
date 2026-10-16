import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { AccountInfoPage } from "@/features/patient/account/AccountInfoPage";
import { SessionsPage } from "@/features/patient/sessions/SessionsPage";
import { LandingPage } from "@/features/landing";
import { LoginPagePatient } from "@/features/auth/login/LoginPagePatient";
import { RegisterPagePatient } from "@/features/auth/register-patient/RegisterPagePatient";
import { ForgotPasswordPatient } from "@/features/auth/recovery/ForgotPasswordPatient";
import { ResetPasswordPatient } from "@/features/auth/recovery/ResetPasswordPatient";
import { AppointmentBookingPage } from "@/features/patient/appointment/AppointmentBookingPage";
import { DoctorPage } from "@/features/patient/doctors/DoctorPage";
import { DoctorDetailPage } from "@/features/patient/doctors/DoctorDetailPage";
import { SpecialtyDirectoryPage } from "@/features/patient/doctors/SpecialtyDirectoryPage";
import { RoleSelectionPage } from "@/features/entry/RoleSelectionPage";
import { AppointmentTicketPage } from "@/features/patient/appointment/AppointmentTicketPage";
import { EmailTokenPage } from "@/features/auth/verification/EmailTokenPage";

function ProtectedAccountPage({ sessions = false }: { sessions?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return sessions ? <SessionsPage /> : <AccountInfoPage />;
}

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/entry" element={<RoleSelectionPage />} />
      <Route path="/appointment" element={<AppointmentBookingPage />} />
      <Route
        path="/phieu-kham/:maPhieuKham"
        element={<AppointmentTicketPage />}
      />
      <Route path="/doctors" element={<DoctorPage />} />
      <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />
      <Route path="/specialties" element={<SpecialtyDirectoryPage />} />
      <Route path="/book" element={<Navigate to="/appointment" replace />} />
      <Route path="/login" element={<LoginPagePatient />} />
      <Route path="/register" element={<RegisterPagePatient />} />
      <Route path="/forgot-password" element={<ForgotPasswordPatient />} />
      <Route path="/reset-password" element={<ResetPasswordPatient />} />
      <Route path="/verify-email" element={<EmailTokenPage kind="verify" />} />
      <Route
        path="/confirm-email-change"
        element={<EmailTokenPage kind="change" />}
      />
      <Route path="/account" element={<ProtectedAccountPage />} />
      <Route
        path="/account/sessions"
        element={<ProtectedAccountPage sessions />}
      />
    </Routes>
  );
};
