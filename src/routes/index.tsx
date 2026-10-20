import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SymptomChatWidget } from "@/features/landing/components/chat/SymptomChatWidget";
import { useAuth } from "@/shared/context/AuthContext";
import { PublicRoutes } from "./PublicRoutes";

const DoctorRoutes = lazy(() =>
  import("./DoctorRoutes").then((m) => ({ default: m.DoctorRoutes }))
);
const AdminRoutes = lazy(() =>
  import("./AdminRoutes").then((m) => ({ default: m.AdminRoutes }))
);
const PatientRoutes = lazy(() =>
  import("./PatientRoutes").then((m) => ({ default: m.PatientRoutes }))
);

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );
}

function GlobalChatWidget() {
  const location = useLocation();
  const { user } = useAuth();

  const isExcludedPath =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/doctor");
  const isExcludedRole =
    user?.role === "admin" ||
    user?.role === "doctor";

  if (isExcludedPath || isExcludedRole) {
    return null;
  }

  return <SymptomChatWidget />;
}

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/doctor/*"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <DoctorRoutes />
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <AdminRoutes />
            </Suspense>
          }
        />
        <Route
          path="/patient/*"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <PatientRoutes />
            </Suspense>
          }
        />
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
      <GlobalChatWidget />
    </BrowserRouter>
  );
};
