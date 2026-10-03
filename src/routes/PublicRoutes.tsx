import { Route, Routes } from "react-router-dom";
import { LandingPage } from "@/features/landing";
import { LoginPagePatient } from "@/features/auth/login-patient/LoginPagePatient";
import { RegisterPagePatient } from "@/features/auth/register-patient/RegisterPagePatient";

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPagePatient />} />
      <Route path="/register" element={<RegisterPagePatient />} />
    </Routes>
  );
};
