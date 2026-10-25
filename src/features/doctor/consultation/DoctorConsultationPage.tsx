import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Stethoscope, X } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { consultationService } from "@/services/consultationService";
import { useConsultation } from "@/hooks/useConsultation";
import { ConsultationLookupCard } from "./components/ConsultationLookupCard";
import { TodayPatientsTable } from "./components/TodayPatientsTable";

export function DoctorConsultationPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Parse URL search params
  const paramId = searchParams.get("id");
  const paramMa = searchParams.get("ma") || searchParams.get("search");
  const paramNgay = searchParams.get("ngay");
  const paramIdLichLamViec = searchParams.get("idLichLamViec");

  const {
    filters,
    setFilters,
    dailyPatients,
    isLoadingDailyPatients,
  } = useConsultation();

  // Search by code or QR and redirect to dedicated examine page
  const handleSearchCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await consultationService.traCuuHoSoKham(code.trim());
      if (res?.thanhCong && res?.duLieu?.lichHen?.id) {
        navigate(`/doctor/consultation/${res.duLieu.lichHen.id}`);
        return true;
      }
      throw new Error(res?.thongDiep || "Không tìm thấy hồ sơ khám");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { thongDiep?: string } } }).response?.data
          ?.thongDiep ||
        (err instanceof Error ? err.message : "Không tìm thấy hồ sơ khám");
      setSearchError(msg);
      notifyAuth("error", lang === "vi" ? "Lỗi tra cứu" : "Lookup error", msg);
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  // Redirect if URL search params contain specific ID or lookup code
  useEffect(() => {
    if (paramId && /^\d+$/.test(paramId)) {
      navigate(`/doctor/consultation/${paramId}`, { replace: true });
    } else if (paramMa) {
      void handleSearchCode(paramMa);
    }
  }, [paramId, paramMa]);

  // Apply URL filters if provided
  useEffect(() => {
    if (paramNgay || paramIdLichLamViec) {
      setFilters((prev) => ({
        ...prev,
        ngay: paramNgay || prev.ngay,
        idLichLamViec: paramIdLichLamViec
          ? Number(paramIdLichLamViec)
          : prev.idLichLamViec,
      }));
    }
  }, [paramNgay, paramIdLichLamViec, setFilters]);

  const handleSelectPatient = (id: number) => {
    navigate(`/doctor/consultation/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-5 mb-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <Stethoscope className="w-6 h-6 text-teal-600" />
              {lang === "vi"
                ? "Tiếp nhận & khám bệnh"
                : "Reception & Consultation"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "vi"
                ? "Tiếp nhận bệnh nhân bằng mã hoặc quét QR, theo dõi danh sách bệnh nhân chờ khám trong ngày."
                : "Check in patients by code or QR, monitor today's patient consultation queue."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Error banner if search fails */}
        {searchError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between shadow-xs">
            <span>{searchError}</span>
            <button
              type="button"
              onClick={() => setSearchError(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. Mở hồ sơ khám bằng mã hoặc QR */}
        <ConsultationLookupCard
          onSearch={handleSearchCode}
          isLoading={isSearching}
        />

        {/* 2. Danh sách bệnh nhân trong ngày (Queue Table) */}
        <TodayPatientsTable
          patients={dailyPatients}
          isLoading={isLoadingDailyPatients}
          filters={filters}
          onFilterChange={setFilters}
          onSelectPatient={handleSelectPatient}
        />
      </div>
    </div>
  );
}

