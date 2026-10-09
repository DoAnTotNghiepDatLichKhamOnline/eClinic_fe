import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import { SymptomChatWidget } from "@/features/landing/components/chat/SymptomChatWidget";
import { PublicRoutes } from "./PublicRoutes";
import { DoctorRoutes } from "./DoctorRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { PatientRoutes } from "./PatientRoutes";

function GlobalChatWidget() {
  const { user } = useAuth();

  // Cố định chatbot cho role patient và user không có tài khoản (khách)
  if (user && user.role !== "patient") {
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
