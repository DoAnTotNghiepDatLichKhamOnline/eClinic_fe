import { Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/features/landing';
import { LoginPagePatient } from '@/features/auth/login-patient/LoginPagePatient';
import { RegisterPagePatient } from '@/features/auth/register-patient/RegisterPagePatient';
import { LoginPageDoctor } from '@/features/auth/login-doctor/LoginPageDoctor';
import { LoginPageAdmin } from '@/features/auth/login-admin/LoginPageAdmin';
import { DoctorDashboardPage } from '@/features/doctor/DoctorDashboardPage';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPagePatient />} />
      <Route path="/register" element={<RegisterPagePatient />} />
      <Route path="/doctor/login" element={<LoginPageDoctor />} />
      <Route path="/admin/login" element={<LoginPageAdmin />} />
      <Route path="/doctor" element={<DoctorDashboardPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
    </Routes>
  );
};