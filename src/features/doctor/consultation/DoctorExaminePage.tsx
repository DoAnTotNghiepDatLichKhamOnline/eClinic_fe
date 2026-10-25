import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Printer,
  Bookmark,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { useConsultation } from "@/hooks/useConsultation";
import { PatientIdentityCard } from "./components/PatientIdentityCard";
import { ClinicalExamForm } from "./components/ClinicalExamForm";
import { PreviousVisitsSection } from "./components/PreviousVisitsSection";
import { MedicalRecordHistoryModal } from "./components/MedicalRecordHistoryModal";

interface DoctorExaminePageProps {
  appointmentId?: number;
}

export function DoctorExaminePage({
  appointmentId: propAppointmentId,
}: DoctorExaminePageProps) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const params = useParams<{ appointmentId?: string }>();
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const rawId =
    propAppointmentId ??
    (params.appointmentId ? Number(params.appointmentId) : undefined);
  const isValidId =
    typeof rawId === "number" && !Number.isNaN(rawId) && rawId > 0;

  const {
    hoSoKham,
    isLoadingHoSo,
    hoSoError,
    moHoSoTheoId,
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
  } = useConsultation();

  // Load record by ID on mount or when rawId changes
  useEffect(() => {
    if (isValidId) {
      moHoSoTheoId(rawId);
    }
  }, [isValidId, rawId, moHoSoTheoId]);

  // Check if draft exists in localStorage
  useEffect(() => {
    if (rawId) {
      const draftKey = `eclinic_draft_exam_${rawId}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed._savedAt) {
            setDraftSavedAt(parsed._savedAt);
          }
        } catch {
          // ignore error
        }
      }
    }
  }, [rawId]);

  const handleBackToList = () => {
    navigate("/doctor/consultation");
  };

  const handleExamSuccess = () => {
    // Clear draft if any
    if (rawId) {
      localStorage.removeItem(`eclinic_draft_exam_${rawId}`);
    }
    notifyAuth(
      "success",
      lang === "vi" ? "Hoàn thành ca khám" : "Consultation completed",
      lang === "vi"
        ? "Đã lưu kết quả khám bệnh thành công. Đang quay lại danh sách bệnh nhân."
        : "Consultation result saved. Returning to patient queue.",
    );
    navigate("/doctor/consultation");
  };

  const handleSaveDraft = () => {
    if (!rawId) return;
    const formElement = document.getElementById(
      "clinical-exam-form",
    ) as HTMLFormElement | null;
    if (!formElement) return;

    // Collect inputs into draft
    const formData = new FormData(formElement);
    const draftData: Record<string, unknown> = {
      _savedAt: new Date().toLocaleTimeString(
        lang === "vi" ? "vi-VN" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        },
      ),
    };
    formData.forEach((val, key) => {
      draftData[key] = val;
    });

    const draftKey = `eclinic_draft_exam_${rawId}`;
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setDraftSavedAt(String(draftData._savedAt));
    notifyAuth(
      "info",
      lang === "vi" ? "Lưu tạm thành công" : "Draft saved",
      lang === "vi"
        ? `Đã lưu tạm dữ liệu ca khám vào máy lúc ${draftData._savedAt}.`
        : `Consultation draft saved locally at ${draftData._savedAt}.`,
    );
  };

  // Invalid ID state
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-slate-50/70 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-6 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800 mb-1">
            {lang === "vi"
              ? "Mã lượt khám không hợp lệ"
              : "Invalid Appointment ID"}
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            {lang === "vi"
              ? "Không tìm thấy thông tin lượt khám tương ứng với đường dẫn này."
              : "No valid appointment found for the provided route."}
          </p>
          <button
            type="button"
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "vi"
              ? "Quay lại danh sách bệnh nhân"
              : "Back to patient list"}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingHoSo && !hoSoKham) {
    return (
      <div className="min-h-screen bg-slate-50/70 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">
            {lang === "vi"
              ? "Đang mở hồ sơ bệnh án EMR..."
              : "Loading patient EMR record..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (hoSoError && !hoSoKham) {
    return (
      <div className="min-h-screen bg-slate-50/70 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-6 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800 mb-1">
            {lang === "vi"
              ? "Không thể tải hồ sơ khám"
              : "Could not load record"}
          </h2>
          <p className="text-xs text-rose-700 font-medium mb-5">{hoSoError}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === "vi" ? "Quay lại" : "Back"}
            </button>
            <button
              type="button"
              onClick={() => moHoSoTheoId(rawId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition shadow-xs"
            >
              {lang === "vi" ? "Thử lại" : "Retry"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hoSoKham) return null;

  const { lichHen, hoSoBenhNhan, ketQua } = hoSoKham;
  const isEdit = Boolean(ketQua);
  const isLocked =
    isEdit && ketQua?.hanSua ? new Date(ketQua.hanSua) < new Date() : false;
  const canRecord = isEdit || lichHen.trangThai === "DA_XAC_NHAN";

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      {/* 1. Sticky Breadcrumb Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-lg transition border border-slate-200"
              title={lang === "vi" ? "Quay lại danh sách chờ" : "Back to queue"}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {lang === "vi" ? "← Quay lại danh sách" : "← Back to Queue"}
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                type="button"
                onClick={handleBackToList}
                className="hover:text-teal-600 transition"
              >
                {lang === "vi" ? "Tiếp nhận & khám bệnh" : "Consultation"}
              </button>
              <span>/</span>
              <span className="font-bold text-slate-800">
                #{lichHen.soThuTu} · {hoSoBenhNhan.hoTen}
              </span>
            </nav>
          </div>

          {/* Quick patient status info badge */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-mono font-bold">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              {lichHen.maTraCuu}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {lichHen.gioKhamDuKien?.slice(11, 16) || lichHen.gioKhamDuKien}
            </span>
            {lichHen.doiChieu?.canDoiChieu ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                {lang === "vi" ? "Cần đối chiếu" : "Verify ID"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {lang === "vi" ? "Hồ sơ khớp" : "Profile Matched"}
              </span>
            )}
            {draftSavedAt && (
              <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {lang === "vi"
                  ? `Bản nháp: ${draftSavedAt}`
                  : `Draft: ${draftSavedAt}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Patient Banner Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              #{lichHen.soThuTu}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-800">
                  {hoSoBenhNhan.hoTen}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {hoSoBenhNhan.gioiTinh === "NAM"
                    ? lang === "vi"
                      ? "Nam"
                      : "Male"
                    : hoSoBenhNhan.gioiTinh === "NU"
                      ? lang === "vi"
                        ? "Nữ"
                        : "Female"
                      : lang === "vi"
                        ? "Khác"
                        : "Other"}
                  {hoSoBenhNhan.tuoi ? ` · ${hoSoBenhNhan.tuoi} tuổi` : ""}
                </span>
                {isEdit && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {lang === "vi" ? "Đã có bệnh án EMR" : "EMR Available"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  CCCD:{" "}
                  <strong className="text-slate-700">
                    {hoSoBenhNhan.cccd || "—"}
                  </strong>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  SĐT:{" "}
                  <strong className="text-slate-700">
                    {hoSoBenhNhan.soDienThoai || "—"}
                  </strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Ngày sinh:{" "}
                  <strong className="text-slate-700">
                    {hoSoBenhNhan.ngaySinh || "—"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEdit && (
              <button
                type="button"
                onClick={() => setSelectedHistoryId(lichHen.id)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                {lang === "vi" ? "Xem lịch sử sửa EMR" : "Audit Log"}
              </button>
            )}
          </div>
        </div>

        {/* 3. Main Examination Blocks */}
        <div className="space-y-6">
          {/* Block A: Đối chiếu giấy tờ tùy thân & cập nhật hành chính */}
          <PatientIdentityCard
            hoSoKham={hoSoKham}
            onUpdatePatient={updatePatient}
            onMarkVerified={markVerified}
            isUpdating={isUpdatingPatient}
            isMarkingVerified={isMarkingVerified}
          />

          {/* Block B: Form khám lâm sàng, sinh hiệu, ICD-10 và kê đơn thuốc */}
          <ClinicalExamForm
            hoSoKham={hoSoKham}
            onSaveExamResult={saveExamResult}
            onOpenHistory={(id) => setSelectedHistoryId(id)}
            isSaving={isSavingExamResult}
            onSaveSuccess={handleExamSuccess}
          />

          {/* Block C: Lịch sử các lần khám trước của bệnh nhân */}
          <PreviousVisitsSection
            previousVisits={hoSoKham.lanKhamTruoc}
            onOpenHistory={(id) => setSelectedHistoryId(id)}
          />
        </div>
      </div>

      {/* 4. Fixed / Sticky Action Bar at the Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 sm:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden md:inline">
              {lang === "vi"
                ? `Đang khám: #${lichHen.soThuTu} - ${hoSoBenhNhan.hoTen}`
                : `Active patient: #${lichHen.soThuTu} - ${hoSoBenhNhan.hoTen}`}
            </span>
            {draftSavedAt && (
              <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {lang === "vi"
                  ? `Bản nháp: ${draftSavedAt}`
                  : `Draft: ${draftSavedAt}`}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            {/* In đơn thuốc */}
            {isEdit && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition shadow-xs"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                {lang === "vi" ? "In đơn thuốc" : "Print Rx"}
              </button>
            )}

            {/* Lưu tạm */}
            {!isLocked && canRecord && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition shadow-xs"
              >
                <Bookmark className="w-4 h-4 text-amber-600" />
                {lang === "vi" ? "Lưu tạm" : "Save Draft"}
              </button>
            )}

            {/* Hoàn thành khám */}
            {!isLocked && canRecord && (
              <button
                type="submit"
                form="clinical-exam-form"
                disabled={isSavingExamResult}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition shadow-md"
              >
                {isSavingExamResult ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isSavingExamResult
                  ? lang === "vi"
                    ? "Đang lưu..."
                    : "Saving..."
                  : isEdit
                    ? lang === "vi"
                      ? "Cập nhật bệnh án & Hoàn thành"
                      : "Update & Complete"
                    : lang === "vi"
                      ? "Hoàn thành khám"
                      : "Complete Visit"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Modal xem audit log lịch sử sửa bệnh án */}
      <MedicalRecordHistoryModal
        isOpen={Boolean(selectedHistoryId)}
        onClose={() => setSelectedHistoryId(null)}
        data={lichSuSua}
        isLoading={isLoadingLichSuSua}
      />
    </div>
  );
}
