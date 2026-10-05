import { Route, Routes, Navigate } from "react-router-dom";
import { LandingPage } from "@/features/landing";
import { LoginPagePatient } from "@/features/auth/login-patient/LoginPagePatient";
import { RegisterPagePatient } from "@/features/auth/register-patient/RegisterPagePatient";
import { ForgotPasswordPatient } from "@/features/auth/forgot-password/ForgotPasswordPatient";
import { AppointmentBookingPage } from "@/features/patient/appointment/AppointmentBookingPage";

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/appointment" element={<AppointmentBookingPage />} />
      <Route path="/book" element={<Navigate to="/appointment" replace />} />
      <Route path="/login" element={<LoginPagePatient />} />
      <Route path="/register" element={<RegisterPagePatient />} />
      <Route path="/forgot-password" element={<ForgotPasswordPatient />} />
    </Routes>
  );
};
