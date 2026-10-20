import { useState, useEffect, type FormEvent } from "react";
import {
  Stethoscope,
  Activity,
  FileCheck2,
  Trash2,
  Save,
  Lock,
  History,
  AlertCircle,
  Printer,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { consultationService } from "@/services/consultationService";
import type {
  HoSoKhamResponse,
  GhiKetQuaKhamRequest,
  DongThuocChiTiet,
  Icd10Item,
  ThuocGoiYItem,
} from "@/types/consultation.type";

interface ClinicalExamFormProps {
  hoSoKham: HoSoKhamResponse;
  onSaveExamResult: (
    data: GhiKetQuaKhamRequest,
    isEdit: boolean,
  ) => Promise<unknown>;
  onOpenHistory: (idLichHen: number) => void;
  isSaving?: boolean;
}

export function ClinicalExamForm({
  hoSoKham,
  onSaveExamResult,
  onOpenHistory,
  isSaving = false,
}: ClinicalExamFormProps) {
  const { lang } = useLanguage();
  const { lichHen, hoSoBenhNhan, ketQua } = hoSoKham;

  const isEdit = Boolean(ketQua);
  // Kiểm tra hạn sửa EMR (7 ngày kể từ lần lưu đầu)
  const isLocked =
    isEdit && ketQua?.hanSua ? new Date(ketQua.hanSua) < new Date() : false;
  // Chỉ ca DA_XAC_NHAN mới được ghi kết quả lần đầu
  const canRecord = isEdit || lichHen.trangThai === "DA_XAC_NHAN";

  // Form states
  const [lyDoKham, setLyDoKham] = useState(
    ketQua?.lyDoKham || lichHen.lyDoKham || "",
  );
  const [khamLamSang, setKhamLamSang] = useState(ketQua?.khamLamSang || "");
  const [chanDoan, setChanDoan] = useState(ketQua?.chanDoan || "");
  const [chanDoanKemTheo, setChanDoanKemTheo] = useState(
    ketQua?.chanDoanKemTheo || "",
  );
  const [ghiChu, setGhiChu] = useState(ketQua?.ghiChu || "");
  const [ngayTaiKhamDeXuat, setNgayTaiKhamDeXuat] = useState(
    ketQua?.ngayTaiKhamDeXuat || "",
  );
  const [lyDoSua, setLyDoSua] = useState("");

  // Sinh hiệu
  const [vitals, setVitals] = useState({
    mach: ketQua?.sinhHieu?.mach ? String(ketQua.sinhHieu.mach) : "",
    nhietDo: ketQua?.sinhHieu?.nhietDo ? String(ketQua.sinhHieu.nhietDo) : "",
    huyetApTamThu: ketQua?.sinhHieu?.huyetApTamThu
      ? String(ketQua.sinhHieu.huyetApTamThu)
      : "",
    huyetApTamTruong: ketQua?.sinhHieu?.huyetApTamTruong
      ? String(ketQua.sinhHieu.huyetApTamTruong)
      : "",
    nhipTho: ketQua?.sinhHieu?.nhipTho ? String(ketQua.sinhHieu.nhipTho) : "",
    canNang: ketQua?.sinhHieu?.canNang ? String(ketQua.sinhHieu.canNang) : "",
    chieuCao: ketQua?.sinhHieu?.chieuCao ? String(ketQua.sinhHieu.chieuCao) : "",
  });

  // ICD-10 Search
  const [icdKeyword, setIcdKeyword] = useState(
    ketQua?.icdChinh?.ma || ketQua?.maIcdChinh || "",
  );
  const [selectedIcd, setSelectedIcd] = useState<Icd10Item | null>(
    ketQua?.icdChinh || null,
  );
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);

  // Đơn thuốc
  const [prescriptionRows, setPrescriptionRows] = useState<DongThuocChiTiet[]>(
    ketQua?.donThuoc || [],
  );
  const [medicineKeyword, setMedicineKeyword] = useState("");
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);

  // Sync when hoSoKham changes
  useEffect(() => {
    setLyDoKham(ketQua?.lyDoKham || lichHen.lyDoKham || "");
    setKhamLamSang(ketQua?.khamLamSang || "");
    setChanDoan(ketQua?.chanDoan || "");
    setChanDoanKemTheo(ketQua?.chanDoanKemTheo || "");
    setGhiChu(ketQua?.ghiChu || "");
    setNgayTaiKhamDeXuat(ketQua?.ngayTaiKhamDeXuat || "");
    setLyDoSua("");
    setVitals({
      mach: ketQua?.sinhHieu?.mach ? String(ketQua.sinhHieu.mach) : "",
      nhietDo: ketQua?.sinhHieu?.nhietDo ? String(ketQua.sinhHieu.nhietDo) : "",
      huyetApTamThu: ketQua?.sinhHieu?.huyetApTamThu
        ? String(ketQua.sinhHieu.huyetApTamThu)
        : "",
      huyetApTamTruong: ketQua?.sinhHieu?.huyetApTamTruong
        ? String(ketQua.sinhHieu.huyetApTamTruong)
        : "",
      nhipTho: ketQua?.sinhHieu?.nhipTho ? String(ketQua.sinhHieu.nhipTho) : "",
      canNang: ketQua?.sinhHieu?.canNang ? String(ketQua.sinhHieu.canNang) : "",
      chieuCao: ketQua?.sinhHieu?.chieuCao
        ? String(ketQua.sinhHieu.chieuCao)
        : "",
    });
    setIcdKeyword(ketQua?.icdChinh?.ma || ketQua?.maIcdChinh || "");
    setSelectedIcd(ketQua?.icdChinh || null);
    setPrescriptionRows(ketQua?.donThuoc || []);
  }, [ketQua, lichHen]);

  // Queries for autocomplete
  const icdQuery = useQuery({
    queryKey: ["consultation", "icd10", icdKeyword],
    queryFn: () => consultationService.getIcd10GoiY(icdKeyword),
    enabled: icdKeyword.trim().length >= 1 && showIcdDropdown,
  });

  const medicineQuery = useQuery({
    queryKey: ["consultation", "medicines", medicineKeyword],
    queryFn: () => consultationService.getThuocGoiY(medicineKeyword),
    enabled: medicineKeyword.trim().length >= 2 && showMedicineDropdown,
  });

  const maxAllowedDays = selectedIcd?.manTinh ? 90 : 30;

  // Thêm thuốc từ danh mục
  const handleSelectMedicine = (med: ThuocGoiYItem) => {
    if (prescriptionRows.some((r) => r.idThuoc === med.id)) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thuốc đã có trong đơn" : "Medicine already added",
        lang === "vi"
          ? `Thuốc "${med.tenThuoc}" đã được thêm.`
          : `Medicine "${med.tenThuoc}" is already in the list.`,
      );
      return;
    }
    const defaultDays = 5;
    const defaultDosePerDay = 2;
    const newRow: DongThuocChiTiet = {
      idThuoc: med.id,
      tenThuoc: med.tenThuoc,
      hoatChat: med.hoatChat,
      hamLuong: med.hamLuong,
      dangBaoChe: med.dangBaoChe,
      duongDung: med.duongDung,
      donVi: med.donVi || "Viên",
      lieuDung: "Uống sau ăn",
      soLanMoiNgay: defaultDosePerDay,
      soNgayDung: defaultDays,
      soLuong: defaultDays * defaultDosePerDay,
      ghiChuSuDung: "",
    };
    setPrescriptionRows((prev) => [...prev, newRow]);
    setMedicineKeyword("");
    setShowMedicineDropdown(false);
  };

  const handleRemoveMedicine = (idThuoc: number) => {
    setPrescriptionRows((prev) => prev.filter((r) => r.idThuoc !== idThuoc));
  };

  // Submit Handler with full validation
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!canRecord) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể ghi kết quả" : "Cannot record",
        lang === "vi"
          ? "Lịch hẹn đã bị hủy hoặc chưa được xác nhận."
          : "Appointment is cancelled or not confirmed.",
      );
      return;
    }

    if (isLocked) {
      notifyAuth(
        "error",
        lang === "vi" ? "Hồ sơ đã khóa" : "Record locked",
        lang === "vi"
          ? "Hồ sơ bệnh án đã quá hạn chỉnh sửa 7 ngày."
          : "Record edit period of 7 days has expired.",
      );
      return;
    }

    if (!chanDoan.trim()) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu chẩn đoán chính" : "Diagnosis required",
        lang === "vi"
          ? "Vui lòng nhập chẩn đoán chính của bệnh nhân."
          : "Please specify the primary diagnosis.",
      );
      return;
    }

    // Rule: Trẻ em < 72 tháng tuổi (tuổi < 6) có kê thuốc -> bắt buộc cân nặng
    const isChildUnder6 = (hoSoBenhNhan.tuoi ?? 0) < 6;
    if (isChildUnder6 && prescriptionRows.length > 0 && !vitals.canNang) {
      notifyAuth(
        "error",
        lang === "vi" ? "Bắt buộc nhập cân nặng" : "Weight required",
        lang === "vi"
          ? "Trẻ em dưới 72 tháng tuổi có kê đơn thuốc bắt buộc phải nhập chỉ số cân nặng."
          : "Child under 6 years with prescription requires body weight.",
      );
      return;
    }

    // Rule: Kiểm tra huyết áp (nếu nhập thì phải nhập cả 2 số và tâm trương < tâm thu)
    if (vitals.huyetApTamThu || vitals.huyetApTamTruong) {
      if (!vitals.huyetApTamThu || !vitals.huyetApTamTruong) {
        notifyAuth(
          "error",
          lang === "vi" ? "Huyết áp không hợp lệ" : "Invalid Blood Pressure",
          lang === "vi"
            ? "Vui lòng nhập đủ cả huyết áp tâm thu và tâm trương."
            : "Please enter both systolic and diastolic blood pressure.",
        );
        return;
      }
      if (Number(vitals.huyetApTamTruong) >= Number(vitals.huyetApTamThu)) {
        notifyAuth(
          "error",
          lang === "vi" ? "Huyết áp không hợp lệ" : "Invalid Blood Pressure",
          lang === "vi"
            ? "Huyết áp tâm trương phải nhỏ hơn huyết áp tâm thu."
            : "Diastolic BP must be lower than systolic BP.",
        );
        return;
      }
    }

    // Rule: Kiểm tra số ngày dùng tối đa (30 ngày hoặc 90 ngày nếu mạn tính)
    for (const r of prescriptionRows) {
      if (r.soNgayDung > maxAllowedDays) {
        notifyAuth(
          "error",
          lang === "vi" ? "Vượt số ngày kê đơn" : "Days exceeded",
          lang === "vi"
            ? `Thuốc "${r.tenThuoc}" kê ${r.soNgayDung} ngày vượt quá giới hạn ${maxAllowedDays} ngày.`
            : `Medicine "${r.tenThuoc}" exceeds maximum of ${maxAllowedDays} days.`,
        );
        return;
      }
      if (!r.soLuong || r.soLuong <= 0) {
        notifyAuth(
          "error",
          lang === "vi" ? "Số lượng thuốc không hợp lệ" : "Invalid quantity",
          lang === "vi"
            ? `Vui lòng nhập tổng số lượng cho thuốc "${r.tenThuoc}".`
            : `Please enter quantity for "${r.tenThuoc}".`,
        );
        return;
      }
    }

    // Rule: Sửa bệnh án bắt buộc nhập lý do sửa
    if (isEdit && !lyDoSua.trim()) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu lý do sửa" : "Edit reason required",
        lang === "vi"
          ? "Bắt buộc nhập lý do chỉnh sửa bệnh án để lưu vào lịch sử."
          : "Please specify the reason for modifying this record.",
      );
      return;
    }

    const payload: GhiKetQuaKhamRequest = {
      lyDoKham: lyDoKham.trim() || undefined,
      sinhHieu:
        vitals.mach ||
        vitals.nhietDo ||
        vitals.huyetApTamThu ||
        vitals.nhipTho ||
        vitals.canNang ||
        vitals.chieuCao
          ? {
              mach: vitals.mach ? Number(vitals.mach) : undefined,
              nhietDo: vitals.nhietDo ? Number(vitals.nhietDo) : undefined,
              huyetApTamThu: vitals.huyetApTamThu
                ? Number(vitals.huyetApTamThu)
                : undefined,
              huyetApTamTruong: vitals.huyetApTamTruong
                ? Number(vitals.huyetApTamTruong)
                : undefined,
              nhipTho: vitals.nhipTho ? Number(vitals.nhipTho) : undefined,
              canNang: vitals.canNang ? Number(vitals.canNang) : undefined,
              chieuCao: vitals.chieuCao ? Number(vitals.chieuCao) : undefined,
            }
          : undefined,
      khamLamSang: khamLamSang.trim() || undefined,
      chanDoan: chanDoan.trim(),
      maIcdChinh: selectedIcd?.ma || (icdKeyword.trim() ? icdKeyword.trim().toUpperCase() : undefined),
      chanDoanKemTheo: chanDoanKemTheo.trim() || undefined,
      ghiChu: ghiChu.trim() || undefined,
      ngayTaiKhamDeXuat: ngayTaiKhamDeXuat || undefined,
      donThuoc: prescriptionRows.map((r) => ({
        idThuoc: r.idThuoc,
        lieuDung: r.lieuDung,
        soLanMoiNgay: r.soLanMoiNgay,
        soNgayDung: r.soNgayDung,
        soLuong: r.soLuong,
        ghiChuSuDung: r.ghiChuSuDung || null,
      })),
      lyDoSua: isEdit ? lyDoSua.trim() : undefined,
      phienBan: isEdit ? (ketQua?.phienBan ?? 1) : undefined,
    };

    await onSaveExamResult(payload, isEdit);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            {isEdit
              ? isLocked
                ? lang === "vi"
                  ? "Kết quả khám bệnh (Đã khóa, chỉ xem)"
                  : "Consultation Result (Locked, Read-only)"
                : lang === "vi"
                  ? "Cập nhật kết quả khám bệnh"
                  : "Edit Consultation Result"
              : lang === "vi"
                ? "Ghi nhận kết quả khám bệnh & Kê đơn thuốc"
                : "Record Consultation & Prescription"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLocked
              ? lang === "vi"
                ? `Hồ sơ đã khóa chỉnh sửa từ ${ketQua?.hanSua?.slice(0, 16) || ""}`
                : `Locked since ${ketQua?.hanSua?.slice(0, 16) || ""}`
              : isEdit
                ? lang === "vi"
                  ? `Có thể sửa đến ${ketQua?.hanSua?.slice(0, 16) || ""}. Mỗi lần sửa lưu vào lịch sử audit log.`
                  : "Editable within 7 days. Changes are audited."
                : lang === "vi"
                  ? "Lưu kết quả khám sẽ chuyển trạng thái lịch hẹn sang Đã hoàn thành."
                  : "Saving result marks appointment as Completed."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEdit && (
            <button
              type="button"
              onClick={() => onOpenHistory(lichHen.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              {lang === "vi" ? "Lịch sử sửa" : "Edit History"}
            </button>
          )}

          {isEdit && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              {lang === "vi" ? "In sổ khám EMR" : "Print Record"}
            </button>
          )}
        </div>
      </div>

      {!canRecord && (
        <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            {lang === "vi"
              ? "Lịch hẹn này đã bị hủy (bởi bệnh nhân hoặc bác sĩ): Không thể ghi kết quả khám."
              : "This appointment was cancelled: Cannot record consultation result."}
          </span>
        </div>
      )}

      {isLocked && (
        <div className="mb-5 p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            {lang === "vi"
              ? `Hồ sơ bệnh án đã khóa từ ${ketQua?.hanSua?.slice(0, 16) || ""}. Dữ liệu hiện ở chế độ chỉ đọc.`
              : "This medical record is locked and read-only."}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Lý do khám & Triệu chứng */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {lang === "vi" ? "Lý do khám, triệu chứng chính" : "Reason for visit"}
          </label>
          <textarea
            rows={2}
            disabled={isLocked || !canRecord}
            maxLength={2000}
            value={lyDoKham}
            onChange={(e) => setLyDoKham(e.target.value)}
            placeholder={
              lang === "vi"
                ? "VD: Đau họng 3 ngày, sốt nhẹ về chiều..."
                : "e.g. Sore throat for 3 days, mild fever..."
            }
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        {/* 2. Chỉ số sinh hiệu (Vital Signs) */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              {lang === "vi" ? "Chỉ số sinh hiệu (Vitals)" : "Vital Signs"}
            </h3>
            {(hoSoBenhNhan.tuoi ?? 0) < 6 && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                {lang === "vi"
                  ? "Trẻ < 72 tháng: Bắt buộc cân nặng nếu kê đơn thuốc"
                  : "Child < 6yo: Body weight required for Rx"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                {lang === "vi" ? "Mạch (l/ph)" : "Pulse (bpm)"}
              </label>
              <input
                type="number"
                min="20"
                max="250"
                disabled={isLocked || !canRecord}
                placeholder="75"
                value={vitals.mach}
                onChange={(e) => setVitals({ ...vitals, mach: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                {lang === "vi" ? "Nhiệt độ (°C)" : "Temp (°C)"}
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="45"
                disabled={isLocked || !canRecord}
                placeholder="37.0"
                value={vitals.nhietDo}
                onChange={(e) =>
                  setVitals({ ...vitals, nhietDo: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                {lang === "vi" ? "HA Tâm thu" : "BP Systolic"}
              </label>
              <input
                type="number"
                min="50"
                max="300"
                disabled={isLocked || !canRecord}
                placeholder="120"
                value={vitals.huyetApTamThu}
                onChange={(e) =>
                  setVitals({ ...vitals, huyetApTamThu: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                {lang === "vi" ? "HA Tâm trương" : "BP Diastolic"}
              </label>
              <input
                type="number"
                min="20"
                max="200"
                disabled={isLocked || !canRecord}
                placeholder="80"
                value={vitals.huyetApTamTruong}
                onChange={(e) =>
                  setVitals({ ...vitals, huyetApTamTruong: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                {lang === "vi" ? "Nhịp thở (l/ph)" : "Breathing (/min)"}
              </label>
              <input
                type="number"
                min="5"
                max="80"
                disabled={isLocked || !canRecord}
                placeholder="18"
                value={vitals.nhipTho}
                onChange={(e) =>
                  setVitals({ ...vitals, nhipTho: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                {lang === "vi" ? "Cân nặng (kg)" : "Weight (kg)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.3"
                max="400"
                disabled={isLocked || !canRecord}
                placeholder="60"
                value={vitals.canNang}
                onChange={(e) =>
                  setVitals({ ...vitals, canNang: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                {lang === "vi" ? "Chiều cao (cm)" : "Height (cm)"}
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="250"
                disabled={isLocked || !canRecord}
                placeholder="165"
                value={vitals.chieuCao}
                onChange={(e) =>
                  setVitals({ ...vitals, chieuCao: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* 3. Khám lâm sàng */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {lang === "vi" ? "Khám lâm sàng" : "Clinical Examination Findings"}
          </label>
          <textarea
            rows={2}
            disabled={isLocked || !canRecord}
            maxLength={5000}
            value={khamLamSang}
            onChange={(e) => setKhamLamSang(e.target.value)}
            placeholder={
              lang === "vi"
                ? "Mô tả kết quả khám lâm sàng, nghe tim phổi, bụng..."
                : "Examination details, auscultation, palpation..."
            }
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none disabled:bg-slate-100"
          />
        </div>

        {/* 4. Chẩn đoán chính & Mã ICD-10 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === "vi" ? "Chẩn đoán chính *" : "Primary Diagnosis *"}
            </label>
            <textarea
              rows={2}
              required
              disabled={isLocked || !canRecord}
              maxLength={5000}
              value={chanDoan}
              onChange={(e) => setChanDoan(e.target.value)}
              placeholder={
                lang === "vi"
                  ? "VD: Viêm họng cấp / Tăng huyết áp vô căn..."
                  : "e.g. Acute pharyngitis / Essential hypertension..."
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none disabled:bg-slate-100 font-semibold text-slate-800"
            />
          </div>

          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === "vi"
                ? "Mã ICD-10 chính (Gợi ý tự động)"
                : "Primary ICD-10 Code"}
            </label>
            <input
              type="text"
              disabled={isLocked || !canRecord}
              placeholder={
                lang === "vi" ? "Gõ mã (J06, I10) hoặc tên bệnh..." : "Code or disease name..."
              }
              value={icdKeyword}
              onFocus={() => setShowIcdDropdown(true)}
              onChange={(e) => {
                setIcdKeyword(e.target.value);
                setShowIcdDropdown(true);
                if (selectedIcd && e.target.value !== selectedIcd.ma) {
                  setSelectedIcd(null);
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none uppercase font-mono font-bold"
            />

            {/* Selected ICD info badge */}
            {selectedIcd && (
              <div className="mt-1.5 p-1.5 bg-teal-50 rounded border border-teal-200 text-[11px] text-teal-800 flex items-center justify-between">
                <span>
                  <strong>{selectedIcd.ma}</strong>: {selectedIcd.ten}
                </span>
                {selectedIcd.manTinh && (
                  <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                    {lang === "vi" ? "Mạn tính (Kê 90 ngày)" : "Chronic (90d max)"}
                  </span>
                )}
              </div>
            )}

            {/* ICD-10 Autocomplete Dropdown */}
            {showIcdDropdown &&
              icdKeyword.trim().length >= 1 &&
              (icdQuery.data?.duLieu ?? []).length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20 divide-y divide-slate-100">
                  {(icdQuery.data?.duLieu ?? []).map((item) => (
                    <button
                      key={item.ma}
                      type="button"
                      onClick={() => {
                        setSelectedIcd(item);
                        setIcdKeyword(item.ma);
                        setShowIcdDropdown(false);
                      }}
                      className="w-full p-2.5 text-left text-xs hover:bg-teal-50 flex items-center justify-between transition"
                    >
                      <div>
                        <span className="font-mono font-bold text-teal-700 mr-2">
                          {item.ma}
                        </span>
                        <span className="text-slate-700">{item.ten}</span>
                      </div>
                      {item.manTinh && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                          Mạn tính
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* 5. Chẩn đoán kèm theo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {lang === "vi" ? "Chẩn đoán kèm theo (nếu có)" : "Secondary Diagnosis"}
          </label>
          <input
            type="text"
            disabled={isLocked || !canRecord}
            maxLength={2000}
            value={chanDoanKemTheo}
            onChange={(e) => setChanDoanKemTheo(e.target.value)}
            placeholder={
              lang === "vi"
                ? "VD: Rối loạn lipid máu, trào ngược dạ dày..."
                : "e.g. Dyslipidemia, GERD..."
            }
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none disabled:bg-slate-100"
          />
        </div>

        {/* 6. Đơn thuốc chuẩn (Prescription) */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-600" />
              {lang === "vi"
                ? "Đơn thuốc (chọn từ danh mục chuẩn Bộ Y tế)"
                : "Prescription"}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {lang === "vi"
                ? `Thời hạn tối đa: ${maxAllowedDays} ngày / thuốc`
                : `Max duration: ${maxAllowedDays} days / drug`}
            </span>
          </div>

          {/* Autocomplete tìm thuốc */}
          {!isLocked && canRecord && (
            <div className="relative mb-3">
              <input
                type="text"
                placeholder={
                  lang === "vi"
                    ? "Gõ tên thuốc hoặc hoạt chất để tìm (VD: Paracetamol, Amoxicillin)..."
                    : "Type medicine name or active ingredient..."
                }
                value={medicineKeyword}
                onFocus={() => setShowMedicineDropdown(true)}
                onChange={(e) => {
                  setMedicineKeyword(e.target.value);
                  setShowMedicineDropdown(true);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
              />

              {showMedicineDropdown &&
                medicineKeyword.trim().length >= 2 &&
                (medicineQuery.data?.duLieu ?? []).length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto z-20 divide-y divide-slate-100">
                    {(medicineQuery.data?.duLieu ?? []).map((med) => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleSelectMedicine(med)}
                        className="w-full p-2.5 text-left text-xs hover:bg-teal-50 flex items-center justify-between transition"
                      >
                        <div>
                          <strong className="text-slate-800">
                            {med.tenThuoc}
                          </strong>{" "}
                          {med.hamLuong && (
                            <span className="text-slate-500">
                              ({med.hamLuong})
                            </span>
                          )}{" "}
                          ·{" "}
                          <span className="text-slate-600 font-medium">
                            {med.hoatChat || "—"}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-teal-600 shrink-0 ml-2">
                          + Thêm
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Bảng danh sách dòng thuốc */}
          {prescriptionRows.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white">
              {lang === "vi"
                ? "Chưa có thuốc nào trong đơn. Hãy tìm và chọn từ thanh tìm kiếm phía trên."
                : "No medications added yet."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Tên thuốc & Hoạt chất</th>
                    <th className="py-2 px-3">Liều dùng</th>
                    <th className="py-2 px-3 w-20">Lần/ngày</th>
                    <th className="py-2 px-3 w-24">Số ngày</th>
                    <th className="py-2 px-3 w-28">Tổng SL</th>
                    <th className="py-2 px-3">Ghi chú</th>
                    {!isLocked && canRecord && (
                      <th className="py-2 px-3 w-12 text-center">Xóa</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptionRows.map((row, index) => (
                    <tr key={row.idThuoc} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">
                          {row.tenThuoc}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {row.hoatChat || "—"}{" "}
                          {row.hamLuong && `(${row.hamLuong})`}
                        </div>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          disabled={isLocked || !canRecord}
                          value={row.lieuDung || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPrescriptionRows((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, lieuDung: val } : r,
                              ),
                            );
                          }}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          disabled={isLocked || !canRecord}
                          value={row.soLanMoiNgay || 1}
                          onChange={(e) => {
                            const times = Math.max(1, Number(e.target.value));
                            setPrescriptionRows((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? {
                                      ...r,
                                      soLanMoiNgay: times,
                                      soLuong: times * (r.soNgayDung || 1),
                                    }
                                  : r,
                              ),
                            );
                          }}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          max={maxAllowedDays}
                          disabled={isLocked || !canRecord}
                          value={row.soNgayDung}
                          onChange={(e) => {
                            const days = Math.max(1, Number(e.target.value));
                            setPrescriptionRows((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? {
                                      ...r,
                                      soNgayDung: days,
                                      soLuong: days * (r.soLanMoiNgay || 1),
                                    }
                                  : r,
                              ),
                            );
                          }}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            disabled={isLocked || !canRecord}
                            value={row.soLuong}
                            onChange={(e) => {
                              const qty = Math.max(1, Number(e.target.value));
                              setPrescriptionRows((prev) =>
                                prev.map((r, i) =>
                                  i === index ? { ...r, soLuong: qty } : r,
                                ),
                              );
                            }}
                            className="w-16 px-2 py-1 text-xs rounded border border-slate-200 outline-none"
                          />
                          <span className="text-[11px] text-slate-500">
                            {row.donVi || "Viên"}
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          disabled={isLocked || !canRecord}
                          placeholder={
                            lang === "vi" ? "Cách dùng..." : "Instructions..."
                          }
                          value={row.ghiChuSuDung || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPrescriptionRows((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, ghiChuSuDung: val } : r,
                              ),
                            );
                          }}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 outline-none"
                        />
                      </td>

                      {!isLocked && canRecord && (
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(row.idThuoc)}
                            className="p-1 text-rose-500 hover:text-rose-700 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 7. Lời dặn & Ngày hẹn tái khám */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === "vi" ? "Lời dặn của bác sĩ" : "Doctor's Advice"}
            </label>
            <textarea
              rows={2}
              disabled={isLocked || !canRecord}
              maxLength={5000}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder={
                lang === "vi"
                  ? "Uống nhiều nước, hạn chế đồ cay nóng, tái khám nếu sốt cao..."
                  : "Drink plenty of water, follow-up if symptoms persist..."
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === "vi" ? "Ngày hẹn tái khám" : "Follow-up Date"}
            </label>
            <input
              type="date"
              disabled={isLocked || !canRecord}
              value={ngayTaiKhamDeXuat}
              onChange={(e) => setNgayTaiKhamDeXuat(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* 8. Khối lý do sửa (bắt buộc khi đang chỉnh sửa bệnh án cũ) */}
        {isEdit && !isLocked && (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
            <label className="block text-xs font-bold text-amber-900 mb-1">
              {lang === "vi"
                ? "Lý do chỉnh sửa bệnh án (Bắt buộc, lưu vào lịch sử audit log) *"
                : "Reason for edit (Mandatory, logged in audit history) *"}
            </label>
            <textarea
              rows={2}
              required
              maxLength={500}
              value={lyDoSua}
              onChange={(e) => setLyDoSua(e.target.value)}
              placeholder={
                lang === "vi"
                  ? "Nhập lý do thay đổi đơn thuốc hoặc chẩn đoán..."
                  : "Specify reason for modifying diagnosis or prescription..."
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none bg-white"
            />
          </div>
        )}

        {/* Nút hành động */}
        {!isLocked && canRecord && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-md transition"
            >
              <Save className="w-4 h-4" />
              {isSaving
                ? lang === "vi"
                  ? "Đang lưu bệnh án..."
                  : "Saving..."
                : isEdit
                  ? lang === "vi"
                    ? "Lưu thay đổi bệnh án"
                    : "Save EMR Changes"
                  : lang === "vi"
                    ? "Lưu kết quả khám (Chuyển sang đã khám)"
                    : "Save Visit Result"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
