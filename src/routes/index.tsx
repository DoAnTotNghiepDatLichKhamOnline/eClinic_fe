import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SymptomChatWidget } from "@/features/landing/components/chat/SymptomChatWidget";
import { useAuth } from "@/shared/context/AuthContext";
import { PublicRoutes } from "./PublicRoutes";
import { DoctorRoutes } from "./DoctorRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { PatientRoutes } from "./PatientRoutes";

function GlobalChatWidget() {
  const location = useLocation();
  const { user } = useAuth();

  const isExcludedPath =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/doctor");
  const isExcludedRole =
    user?.role === "admin" ||
    user?.role === "doctor" ||
    user?.role === "QUAN_TRI_VIEN" ||
    user?.role === "BAC_SI";

  if (isExcludedPath || isExcludedRole) {
    return null;
  }

  return <SymptomChatWidget />;
}

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/doctor/*" element={<DoctorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/patient/*" element={<PatientRoutes />} />
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
      <GlobalChatWidget />
    </BrowserRouter>
  );
};
