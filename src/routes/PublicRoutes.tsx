import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { LandingPage } from "@/features/landing";

const AppointmentBookingPage = lazy(() =>
  import("@/features/patient/appointment/AppointmentBookingPage").then((m) => ({
    default: m.AppointmentBookingPage,
  }))
);
const AppointmentTicketPage = lazy(() =>
  import("@/features/patient/appointment/AppointmentTicketPage").then((m) => ({
    default: m.AppointmentTicketPage,
  }))
);
const DoctorPage = lazy(() =>
  import("@/features/patient/doctors/DoctorPage").then((m) => ({
    default: m.DoctorPage,
  }))
);
const DoctorDetailPage = lazy(() =>
  import("@/features/patient/doctors/DoctorDetailPage").then((m) => ({
    default: m.DoctorDetailPage,
  }))
);
const SpecialtyDirectoryPage = lazy(() =>
  import("@/features/patient/doctors/SpecialtyDirectoryPage").then((m) => ({
    default: m.SpecialtyDirectoryPage,
  }))
);
const RoleSelectionPage = lazy(() =>
  import("@/features/entry/RoleSelectionPage").then((m) => ({
    default: m.RoleSelectionPage,
  }))
);
const LoginPagePatient = lazy(() =>
  import("@/features/auth/login/LoginPagePatient").then((m) => ({
    default: m.LoginPagePatient,
  }))
);
const RegisterPagePatient = lazy(() =>
  import("@/features/auth/register-patient/RegisterPagePatient").then((m) => ({
    default: m.RegisterPagePatient,
  }))
);
const ForgotPasswordPatient = lazy(() =>
  import("@/features/auth/recovery/ForgotPasswordPatient").then((m) => ({
    default: m.ForgotPasswordPatient,
  }))
);
const ResetPasswordPatient = lazy(() =>
  import("@/features/auth/recovery/ResetPasswordPatient").then((m) => ({
    default: m.ResetPasswordPatient,
  }))
);
const EmailTokenPage = lazy(() =>
  import("@/features/auth/verification/EmailTokenPage").then((m) => ({
    default: m.EmailTokenPage,
  }))
);
const AccountInfoPage = lazy(() =>
  import("@/features/patient/account/AccountInfoPage").then((m) => ({
    default: m.AccountInfoPage,
  }))
);
const SessionsPage = lazy(() =>
  import("@/features/patient/sessions/SessionsPage").then((m) => ({
    default: m.SessionsPage,
  }))
);

function PageLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );
}

function ProtectedAccountPage({ sessions = false }: { sessions?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return sessions ? <SessionsPage /> : <AccountInfoPage />;
}

export const PublicRoutes = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
    </Suspense>
  );
};
