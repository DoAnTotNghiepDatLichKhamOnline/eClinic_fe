import { Route, Routes, Navigate } from "react-router-dom";
import { LandingPage } from "@/features/landing";
import { LoginPagePatient } from "@/features/auth/login-patient/LoginPagePatient";
import { RegisterPagePatient } from "@/features/auth/register-patient/RegisterPagePatient";
import { ForgotPasswordPatient } from "@/features/auth/forgot-password/ForgotPasswordPatient";
import { ResetPasswordPatient } from "@/features/auth/reset-password/ResetPasswordPatient";
import { AppointmentBookingPage } from "@/features/patient/appointment/AppointmentBookingPage";
import { DoctorPage } from "@/features/patient/doctors/DoctorPage";
import { DoctorDetailPage } from "@/features/patient/doctors/DoctorDetailPage";
import { SpecialtyDirectoryPage } from "@/features/patient/doctors/SpecialtyDirectoryPage";

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/appointment" element={<AppointmentBookingPage />} />
      <Route path="/doctors" element={<DoctorPage />} />
      <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />
      <Route path="/specialties" element={<SpecialtyDirectoryPage />} />
      <Route path="/book" element={<Navigate to="/appointment" replace />} />
      <Route path="/login" element={<LoginPagePatient />} />
      <Route path="/register" element={<RegisterPagePatient />} />
      <Route path="/forgot-password" element={<ForgotPasswordPatient />} />
      <Route path="/reset-password" element={<ResetPasswordPatient />} />
    </Routes>
  );
};
