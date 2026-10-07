import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";
import { DoctorRoutes } from "./DoctorRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { PatientRoutes } from "./PatientRoutes";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/doctor/*" element={<DoctorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/patient/*" element={<PatientRoutes />} />
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};
