import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
// import { DoctorRoutes } from './DoctorRoutes';
// import { AdminRoutes } from './AdminRoutes';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Render mọi route public (Bắt đầu bằng dấu /* để thư mục con bắt được) */}
        <Route path="/*" element={<PublicRoutes />} />
        
        {/* <Route path="/doctor/*" element={<DoctorRoutes />} /> */}
        {/* <Route path="/admin/*" element={<AdminRoutes />} /> */}
      </Routes>
    </BrowserRouter>
  );
};