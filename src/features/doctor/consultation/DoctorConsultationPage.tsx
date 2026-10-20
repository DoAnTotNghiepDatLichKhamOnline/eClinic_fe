import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Stethoscope, X } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useConsultation } from "@/hooks/useConsultation";
import { ConsultationLookupCard } from "./components/ConsultationLookupCard";
import { TodayPatientsTable } from "./components/TodayPatientsTable";
import { PatientIdentityCard } from "./components/PatientIdentityCard";
import { ClinicalExamForm } from "./components/ClinicalExamForm";
import { PreviousVisitsSection } from "./components/PreviousVisitsSection";
import { MedicalRecordHistoryModal } from "./components/MedicalRecordHistoryModal";

export function DoctorConsultationPage() {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const recordSectionRef = useRef<HTMLDivElement>(null);

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
    hoSoKham,
    isLoadingHoSo,
    hoSoError,
    moHoSoTheoMa,
    moHoSoTheoId,
    dongHoSo,
    updatePatient,
    isUpdatingPatient,
    markVerified,
    isMarkingVerified,
    saveExamResult,
    isSavingExamResult,
    selectedHistoryId,
    setSelectedHistoryId,
    lichSuSua,
    isLoadingLichSuSua,
  } = useConsultation({
    id: paramId && /^\d+$/.test(paramId) ? Number(paramId) : undefined,
    ma: paramMa || undefined,
  });

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

  // Smooth scroll to record section when hoSoKham is loaded
  useEffect(() => {
    if (hoSoKham && recordSectionRef.current) {
      recordSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [hoSoKham]);

  const handleSelectPatient = async (id: number) => {
    await moHoSoTheoId(id);
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
                ? "Khám bệnh & Kê đơn thuốc (EMR)"
                : "Consultation & Medical Records"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "vi"
                ? "Tiếp nhận bệnh nhân bằng mã hoặc QR, đối chiếu giấy tờ tùy thân, ghi nhận chẩn đoán ICD-10 và kê đơn thuốc."
                : "Check in patients by code or QR, verify identity, record ICD-10 diagnosis, and issue prescriptions."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Error banner if any */}
        {hoSoError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between shadow-xs">
            <span>{hoSoError}</span>
            <button
              type="button"
              onClick={dongHoSo}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. Mở hồ sơ khám bằng mã hoặc QR */}
        <ConsultationLookupCard
          onSearch={moHoSoTheoMa}
          isLoading={isLoadingHoSo}
        />

        {/* 2. Danh sách bệnh nhân trong ngày (Queue Table) */}
        <TodayPatientsTable
          patients={dailyPatients}
          isLoading={isLoadingDailyPatients}
          filters={filters}
          onFilterChange={setFilters}
          onSelectPatient={handleSelectPatient}
          selectedAppointmentId={hoSoKham?.lichHen.id}
        />

        {/* 3. Chi tiết hồ sơ khám khi đã mở */}
        {hoSoKham && (
          <div ref={recordSectionRef} className="space-y-6 animate-in fade-in duration-200">
            {/* Header thanh đóng hồ sơ */}
            <div className="flex items-center justify-between bg-teal-50 border border-teal-200 px-5 py-3 rounded-xl shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                <span className="text-sm font-bold text-teal-900">
                  {lang === "vi"
                    ? `Đang mở hồ sơ: ${hoSoKham.hoSoBenhNhan.hoTen} (${hoSoKham.lichHen.maTraCuu})`
                    : `Active record: ${hoSoKham.hoSoBenhNhan.hoTen} (${hoSoKham.lichHen.maTraCuu})`}
                </span>
              </div>
              <button
                type="button"
                onClick={dongHoSo}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-white text-slate-600 hover:text-rose-600 rounded-lg border border-teal-200 hover:border-rose-300 transition shadow-xs"
              >
                <X className="w-3.5 h-3.5" />
                {lang === "vi" ? "Đóng hồ sơ" : "Close Record"}
              </button>
            </div>

            {/* Thông tin đối chiếu giấy tờ & cập nhật hồ sơ bệnh nhân */}
            <PatientIdentityCard
              hoSoKham={hoSoKham}
              onUpdatePatient={updatePatient}
              onMarkVerified={markVerified}
              isUpdating={isUpdatingPatient}
              isMarkingVerified={isMarkingVerified}
            />

            {/* Form khám lâm sàng, chẩn đoán ICD-10 và kê đơn thuốc */}
            <ClinicalExamForm
              hoSoKham={hoSoKham}
              onSaveExamResult={saveExamResult}
              onOpenHistory={(id) => setSelectedHistoryId(id)}
              isSaving={isSavingExamResult}
            />

            {/* Lịch sử các lần khám trước của bệnh nhân */}
            <PreviousVisitsSection
              previousVisits={hoSoKham.lanKhamTruoc}
              onOpenHistory={(id) => setSelectedHistoryId(id)}
            />
          </div>
        )}
      </div>

      {/* Modal xem lịch sử chỉnh sửa bệnh án (Audit Log) */}
      <MedicalRecordHistoryModal
        isOpen={Boolean(selectedHistoryId)}
        onClose={() => setSelectedHistoryId(null)}
        data={lichSuSua}
        isLoading={isLoadingLichSuSua}
      />
    </div>
  );
}
