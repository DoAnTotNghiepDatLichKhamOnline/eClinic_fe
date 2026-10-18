import { useState, useRef, useEffect, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Search,
  Trash2,
  History,
  Activity,
  FileCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { doctorBookingService } from "@/services/booking";
import { useQrScanner } from "../hooks/useQrScanner";
import { MedicalRecordHistoryModal } from "@/shared/components/medical/MedicalRecordHistoryModal";
import type {
  Appointment,
  ConsultationLookup,
  CompletedRecord,
} from "../doctor-workspace.types";
import type {
  Icd10GoiY,
  GhiKetQuaKhamRequest,
  DongThuocRequest,
} from "@/types/booking.type";
import styles from "../../DoctorWorkspace.module.css";

export interface DoctorConsultationSectionProps {
  patientCode: string;
  setPatientCode: (code: string) => void;
  patientLookup: Appointment | null;
  setPatientLookup: (lookup: Appointment | null) => void;
  lookupDetails: ConsultationLookup | null;
  setLookupDetails: (details: ConsultationLookup | null) => void;
  diagnosis: string;
  setDiagnosis: (d: string) => void;
  prescription: string;
  setPrescription: (p: string) => void;
  completedRecord: CompletedRecord | null;
  setCompletedRecord: (record: CompletedRecord | null) => void;
}

interface MedicineRow extends DongThuocRequest {
  tenThuoc: string;
  donVi: string;
}

export function DoctorConsultationSection({
  patientCode,
  setPatientCode,
  patientLookup,
  setPatientLookup,
  lookupDetails,
  setLookupDetails,
  diagnosis,
  setDiagnosis,
  prescription,
  setPrescription,
  completedRecord,
  setCompletedRecord,
}: DoctorConsultationSectionProps) {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();

  const [consultationError, setConsultationError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 15/10 Extended Consultation Fields
  const [visitReason, setVisitReason] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [editReason, setEditReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Vitals
  const [vitals, setVitals] = useState({
    mach: "",
    nhietDo: "",
    huyetApTamThu: "",
    huyetApTamTruong: "",
    nhipTho: "",
    canNang: "",
    chieuCao: "",
  });

  // ICD-10
  const [icdKeyword, setIcdKeyword] = useState("");
  const [selectedIcd, setSelectedIcd] = useState<Icd10GoiY | null>(null);

  // Medicine prescription list
  const [medicineKeyword, setMedicineKeyword] = useState("");
  const [prescriptionRows, setPrescriptionRows] = useState<MedicineRow[]>([]);

  useQrScanner({
    isOpen: scannerOpen,
    videoRef,
    onScan: (code) => {
      setPatientCode(code);
    },
    onClose: () => setScannerOpen(false),
  });

  const icdQuery = useQuery({
    queryKey: ["medical", "doctor-icd10", icdKeyword],
    queryFn: () => doctorBookingService.getIcd10GoiY(icdKeyword),
    enabled: icdKeyword.trim().length >= 1,
  });

  const medicineQuery = useQuery({
    queryKey: ["medical", "doctor-medications", medicineKeyword],
    queryFn: () => doctorBookingService.getThuocGoiY(medicineKeyword),
    enabled: medicineKeyword.trim().length >= 2,
  });

  const historyQuery = useQuery({
    queryKey: ["medical", "doctor-emr-history", lookupDetails?.lichHen?.id],
    queryFn: () =>
      doctorBookingService.getLichSuSuaBenhAn(lookupDetails!.lichHen.id),
    enabled: showHistory && Boolean(lookupDetails?.lichHen?.id),
  });

  const [searchParams] = useSearchParams();

  const lookupPatient = async (
    event?: FormEvent<HTMLFormElement>,
    overrideCode?: string,
  ) => {
    if (event) event.preventDefault();
    const targetCode = overrideCode || patientCode;
    const normalizedCode = targetCode.trim().toUpperCase();
    if (!normalizedCode) return;
    setConsultationError("");
    try {
      const response =
        await doctorBookingService.traCuuHoSoKhamBacSi(normalizedCode);
      if (!response.thanhCong || !response.duLieu)
        throw new Error(response.thongDiep || "Visit not found");
      const details = response.duLieu as ConsultationLookup;
      setLookupDetails(details);
      setPatientLookup({
        id: String(details.lichHen.id),
        patientName: details.hoSoBenhNhan.hoTen,
        age: details.hoSoBenhNhan.tuoi,
        phone: details.hoSoBenhNhan.soDienThoai,
        time: details.lichHen.gioKhamDuKien,
        reason: details.lichHen.lyDoKham,
        status:
          details.lichHen.trangThai === "DA_HOAN_THANH"
            ? "completed"
            : "accepted",
      });
      setCompletedRecord(null);

      // Pre-fill fields
      setVisitReason(details.lichHen.lyDoKham || "");
      if (details.ketQua) {
        setDiagnosis(details.ketQua.chanDoan ?? "");
        setPrescription(details.ketQua.ghiChu ?? "");
        setFollowupDate(details.ketQua.ngayTaiKhamDeXuat ?? "");
      } else {
        setDiagnosis("");
        setPrescription("");
        setFollowupDate("");
      }
    } catch (error) {
      setPatientLookup(null);
      setLookupDetails(null);
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error ? error.message : "Visit not found"),
      );
      notifyAuth(
        "error",
        lang === "vi" ? "Không tìm thấy phiếu khám" : "Visit not found",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (lang === "vi"
            ? "Kiểm tra mã tra cứu hoặc nội dung QR."
            : "Check the visit code or QR content."),
      );
    }
  };

  useEffect(() => {
    const searchParam = searchParams.get("search") || searchParams.get("ma");
    if (searchParam) {
      setPatientCode(searchParam);
      lookupPatient(undefined, searchParam);
    }
  }, [searchParams]);

  const handleAddMedicine = (selectedMed: {
    id: number;
    tenThuoc: string;
    donVi: string | null;
  }) => {
    if (prescriptionRows.some((r) => r.idThuoc === selectedMed.id)) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thuốc đã có" : "Duplicate medicine",
        lang === "vi"
          ? "Mỗi loại thuốc chỉ được kê 1 dòng."
          : "Each medicine can only have one row.",
      );
      return;
    }
    const defaultDays = 5;
    const defaultDosePerDay = 2;
    setPrescriptionRows((prev) => [
      ...prev,
      {
        idThuoc: selectedMed.id,
        tenThuoc: selectedMed.tenThuoc,
        donVi: selectedMed.donVi || "Viên",
        lieuDung: "Uống sau ăn",
        soLanMoiNgay: defaultDosePerDay,
        soNgayDung: defaultDays,
        soLuong: defaultDays * defaultDosePerDay,
        ghiChuSuDung: "",
      },
    ]);
    setMedicineKeyword("");
  };

  const handleRemoveMedicine = (idThuoc: number) => {
    setPrescriptionRows((prev) => prev.filter((r) => r.idThuoc !== idThuoc));
  };

  const savePatientIdentity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lookupDetails) return;
    const values = new FormData(event.currentTarget);
    try {
      const response = await doctorBookingService.capNhatBenhNhanKhamBacSi(
        lookupDetails.lichHen.id,
        {
          hoTen: String(values.get("hoTen") || "").trim(),
          ngaySinh: String(values.get("ngaySinh") || ""),
          soDienThoai: String(values.get("soDienThoai") || "").trim(),
          gioiTinh: String(values.get("gioiTinh") || "NAM") as
            "NAM" | "NU" | "KHAC",
          diaChi: String(values.get("diaChi") || "").trim() || undefined,
          cccd: String(values.get("cccd") || "").trim() || undefined,
        },
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await doctorBookingService
        .traCuuHoSoKhamBacSi(lookupDetails.lichHen.maTraCuu)
        .then((result) => {
          if (result.duLieu)
            setLookupDetails(result.duLieu as ConsultationLookup);
        });
      notifyAuth(
        "success",
        lang === "vi" ? "Đã cập nhật hồ sơ" : "Patient details updated",
        response.thongDiep,
      );
    } catch (error) {
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : "Could not update patient details"),
      );
    }
  };

  const markIdentityChecked = async () => {
    if (!lookupDetails) return;
    try {
      const response = await doctorBookingService.danhDauDaDoiChieuBacSi(
        lookupDetails.lichHen.id,
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      setLookupDetails({
        ...lookupDetails,
        lichHen: {
          ...lookupDetails.lichHen,
          doiChieu: { ...lookupDetails.lichHen.doiChieu, canDoiChieu: false },
        },
      });
    } catch (error) {
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : "Could not mark identity as checked"),
      );
    }
  };

  const completeConsultation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientLookup || !lookupDetails || !diagnosis.trim()) return;
    setConsultationError("");

    const isEdit = Boolean(lookupDetails.ketQua);

    // Rule: if child under 72 months (6 years) and prescribing medicine, weight is mandatory
    const isChildUnder6 = (lookupDetails.hoSoBenhNhan.tuoi ?? 0) < 6;
    if (isChildUnder6 && prescriptionRows.length > 0 && !vitals.canNang) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu cân nặng" : "Weight required",
        lang === "vi"
          ? "Trẻ dưới 72 tháng tuổi có kê đơn thuốc bắt buộc phải nhập cân nặng."
          : "Weight is mandatory for children under 6 years when prescribing.",
      );
      return;
    }

    // Rule: max days check (30 days normally, 90 days if chronic disease)
    const maxDaysAllowed = selectedIcd?.manTinh ? 90 : 30;
    const overDaysRow = prescriptionRows.find(
      (r) => r.soNgayDung > maxDaysAllowed,
    );
    if (overDaysRow) {
      notifyAuth(
        "error",
        lang === "vi" ? "Vượt ngày kê đơn" : "Days limit exceeded",
        lang === "vi"
          ? `Thuốc ${overDaysRow.tenThuoc} kê quá ${maxDaysAllowed} ngày (cho phép tối đa ${maxDaysAllowed} ngày).`
          : `Medicine ${overDaysRow.tenThuoc} exceeds ${maxDaysAllowed} days limit.`,
      );
      return;
    }

    if (isEdit && !editReason.trim()) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu lý do sửa" : "Edit reason required",
        lang === "vi"
          ? "Bắt buộc nhập lý do chỉnh sửa bệnh án."
          : "Please specify the reason for editing the record.",
      );
      return;
    }

    const payload: GhiKetQuaKhamRequest = {
      lyDoKham: visitReason || undefined,
      sinhHieu:
        vitals.mach ||
        vitals.nhietDo ||
        vitals.huyetApTamThu ||
        vitals.canNang ||
        vitals.chieuCao ||
        vitals.nhipTho
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
      khamLamSang: clinicalNotes || undefined,
      chanDoan: diagnosis.trim(),
      maIcdChinh: selectedIcd?.ma || undefined,
      chanDoanKemTheo: secondaryDiagnosis || undefined,
      ghiChu: prescription.trim() || undefined,
      ngayTaiKhamDeXuat: followupDate || undefined,
      donThuoc: prescriptionRows.map((r) => ({
        idThuoc: r.idThuoc,
        lieuDung: r.lieuDung,
        soLanMoiNgay: r.soLanMoiNgay,
        soNgayDung: r.soNgayDung,
        soLuong: r.soLuong,
        ghiChuSuDung: r.ghiChuSuDung || null,
      })),
      lyDoSua: isEdit ? editReason : undefined,
      phienBan: isEdit ? (lookupDetails.ketQua?.phienBan ?? 1) : undefined,
    };

    try {
      const response = await doctorBookingService.ghiBenhAnBacSi(
        lookupDetails.lichHen.id,
        payload,
        isEdit,
      );
      if (!response.thanhCong || !response.duLieu)
        throw new Error(
          response.thongDiep || "Could not save the medical record",
        );

      setCompletedRecord({
        recordCode: lookupDetails.lichHen.maTraCuu,
        appointmentCode: lookupDetails.lichHen.maTraCuu,
        patientName: patientLookup.patientName,
        diagnosis: response.duLieu.chanDoan,
        prescription:
          prescriptionRows
            .map(
              (r) => `${r.tenThuoc}: ${r.lieuDung} (${r.soLuong} ${r.donVi})`,
            )
            .join("; ") ||
          response.duLieu.ghiChu ||
          "",
        createdAt: new Intl.DateTimeFormat(lang, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      });

      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-hang-doi"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-summary"],
      });

      notifyAuth(
        "success",
        lang === "vi" ? "Đã lưu bệnh án" : "Medical record saved",
        response.thongDiep,
      );
    } catch (error) {
      setConsultationError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : "Could not save the medical record"),
      );
    }
  };

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>
            {lang === "vi" ? "Tiếp nhận & khám bệnh" : "Consultation / EMR"}
          </h1>
          <p>
            {lang === "vi"
              ? "Tra cứu phiếu khám, xem sinh hiệu, chẩn đoán ICD-10 và kê đơn thuốc chuẩn."
              : "Find visit, check vitals, ICD-10 diagnosis, and prescribe medications."}
          </p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>
              {lang === "vi" ? "Tiếp nhận bệnh nhân" : "Check in a patient"}
            </h2>
            <p>
              {lang === "vi"
                ? "Quét mã QR trên phiếu khám hoặc nhập mã tra cứu (ECL-xxx)."
                : "Scan the visit QR code or enter ticket reference."}
            </p>
          </div>
        </div>
        <form className={styles.lookupForm} onSubmit={lookupPatient}>
          <label htmlFor="patient-visit-code">
            {lang === "vi" ? "Mã phiếu khám điện tử" : "Electronic visit code"}
          </label>
          <div className={styles.lookupControls}>
            <input
              id="patient-visit-code"
              value={patientCode}
              onChange={(event) => setPatientCode(event.target.value)}
              placeholder="AP-101 hoặc ECL-20261015-0001"
              required
            />
            <button type="submit" className={styles.primaryButton}>
              <Search size={16} aria-hidden="true" />
              {lang === "vi" ? "Tra cứu" : "Find visit"}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setScannerOpen((value) => !value)}
            >
              <Camera size={16} aria-hidden="true" />
              {scannerOpen
                ? lang === "vi"
                  ? "Đóng camera"
                  : "Close camera"
                : lang === "vi"
                  ? "Quét QR"
                  : "Scan QR"}
            </button>
          </div>
        </form>
        {scannerOpen && (
          <div className={styles.scanner}>
            <video
              ref={videoRef}
              aria-label={
                lang === "vi" ? "Camera quét mã QR" : "QR scanner camera"
              }
            />
            <p>
              {lang === "vi"
                ? "Đưa mã QR vào khung hình. Camera chỉ hoạt động khi được cấp quyền."
                : "Align the QR code in view. Camera access is required."}
            </p>
          </div>
        )}
      </section>

      {patientLookup && (
        <>
          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <div>
                <h2>{patientLookup.patientName}</h2>
                <p>
                  {patientLookup.id} · {patientLookup.age}{" "}
                  {lang === "vi" ? "tuổi" : "years"} · {patientLookup.phone}
                </p>
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {lookupDetails?.ketQua?.ngaySuaCuoi && (
                  <span className={styles.eyebrow} style={{ color: "#d97706" }}>
                    {lang === "vi" ? "Đã sửa lúc:" : "Edited at:"}{" "}
                    {lookupDetails.ketQua.ngaySuaCuoi.slice(0, 16)}
                  </span>
                )}
                {lookupDetails?.ketQua && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    <History size={14} aria-hidden="true" />
                    {lang === "vi" ? "Lịch sử sửa" : "Edit History"}
                  </button>
                )}
              </div>
            </div>

            {lookupDetails?.lichHen.doiChieu?.canDoiChieu && (
              <div className={styles.historyBox}>
                <strong>
                  {lang === "vi"
                    ? "Cần đối chiếu giấy tờ"
                    : "Identity verification required"}
                </strong>
                <p>
                  {lang === "vi"
                    ? "Thông tin đặt lịch khác hồ sơ bệnh nhân. Hãy đối chiếu giấy tờ trước khi xác nhận."
                    : "Booking details differ from the patient record. Verify the patient's documents."}
                </p>
                <form
                  className={styles.formGrid}
                  onSubmit={(event) => void savePatientIdentity(event)}
                >
                  <label>
                    {lang === "vi" ? "Họ tên" : "Full name"}
                    <input
                      name="hoTen"
                      required
                      defaultValue={lookupDetails.hoSoBenhNhan.hoTen}
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "Ngày sinh" : "Date of birth"}
                    <input
                      name="ngaySinh"
                      type="date"
                      required
                      defaultValue={lookupDetails.hoSoBenhNhan.ngaySinh}
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "Điện thoại" : "Phone"}
                    <input
                      name="soDienThoai"
                      required
                      defaultValue={lookupDetails.hoSoBenhNhan.soDienThoai}
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "Giới tính" : "Gender"}
                    <select
                      name="gioiTinh"
                      defaultValue={lookupDetails.hoSoBenhNhan.gioiTinh}
                    >
                      <option value="NAM">
                        {lang === "vi" ? "Nam" : "Male"}
                      </option>
                      <option value="NU">
                        {lang === "vi" ? "Nữ" : "Female"}
                      </option>
                      <option value="KHAC">
                        {lang === "vi" ? "Khác" : "Other"}
                      </option>
                    </select>
                  </label>
                  <label>
                    {lang === "vi" ? "Địa chỉ" : "Address"}
                    <input
                      name="diaChi"
                      defaultValue={lookupDetails.hoSoBenhNhan.diaChi ?? ""}
                    />
                  </label>
                  {!lookupDetails.hoSoBenhNhan.soBaoHiemYTe && (
                    <label>
                      {lang === "vi"
                        ? "CCCD (nếu hồ sơ chưa có)"
                        : "National ID (if not on record)"}
                      <input name="cccd" inputMode="numeric" maxLength={12} />
                    </label>
                  )}
                  <div className={styles.fullWidth}>
                    <button type="submit" className={styles.primaryButton}>
                      {lang === "vi"
                        ? "Cập nhật hồ sơ"
                        : "Update patient record"}
                    </button>{" "}
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => void markIdentityChecked()}
                    >
                      {lang === "vi"
                        ? "Đã đối chiếu giấy tờ"
                        : "Mark documents verified"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {consultationError && (
              <p className={styles.refusal} role="alert">
                {consultationError}
              </p>
            )}

            {/* Lịch sử sửa bệnh án (nếu mở) */}
            {showHistory && (
              <div className={styles.historyBox}>
                <strong>
                  {lang === "vi"
                    ? "Lịch sử chỉnh sửa bệnh án"
                    : "EMR Audit Log"}
                </strong>
                {historyQuery.isLoading ? (
                  <p>
                    {lang === "vi"
                      ? "Đang tải lịch sử..."
                      : "Loading history..."}
                  </p>
                ) : (historyQuery.data?.duLieu?.cacLanSua ?? []).length ===
                  0 ? (
                  <p>
                    {lang === "vi"
                      ? "Chưa có lần chỉnh sửa nào."
                      : "No edit history."}
                  </p>
                ) : (
                  (historyQuery.data?.duLieu?.cacLanSua ?? []).map(
                    (lan, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginTop: "10px",
                          paddingBottom: "10px",
                          borderBottom: "1px dashed var(--line)",
                        }}
                      >
                        <span>
                          <strong>Phiên bản {lan.phienBan}</strong> ·{" "}
                          {lan.ngaySua} · BS: {lan.bacSi.hoTen}
                        </span>
                        <p style={{ margin: "4px 0" }}>
                          <em>{lang === "vi" ? "Lý do sửa:" : "Reason:"}</em>{" "}
                          {lan.lyDo}
                        </p>
                        <span className={styles.eyebrow}>
                          {lang === "vi"
                            ? "Trường thay đổi:"
                            : "Fields changed:"}{" "}
                          {lan.cacTruongDoi.join(", ")}
                        </span>
                      </div>
                    ),
                  )
                )}
              </div>
            )}

            {/* TIỀN SỬ BỆNH */}
            <div className={styles.historyBox}>
              <strong>
                {lang === "vi"
                  ? "Hồ sơ và tiền sử khám"
                  : "Patient record and visit history"}
              </strong>
              <p>
                {lookupDetails?.hoSoBenhNhan.tienSuBenhLy ||
                  (lang === "vi"
                    ? "Chưa ghi nhận tiền sử bệnh lý."
                    : "No medical history recorded.")}
              </p>
              <span>
                {lang === "vi" ? "Lý do ban đầu khi đặt:" : "Initial reason:"}{" "}
                {patientLookup.reason}
              </span>
              {lookupDetails?.lanKhamTruoc.map((visit, index) => (
                <p key={`${visit.ngay}-${index}`}>
                  {visit.ngay} · {visit.tenChuyenKhoa} · {visit.hoTenBacSi}
                  {visit.ketQua?.chanDoan ? ` · ${visit.ketQua.chanDoan}` : ""}
                </p>
              ))}
            </div>

            {/* FORM KHÁM BỆNH VÀ KÊ ĐƠN */}
            <form className={styles.formGrid} onSubmit={completeConsultation}>
              <label className={styles.fullWidth}>
                {lang === "vi"
                  ? "Lý do khám (bác sĩ ghi nhận)"
                  : "Reason for visit"}
                <textarea
                  rows={2}
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder={
                    lang === "vi" ? "Nhập lý do khám..." : "Enter reason..."
                  }
                />
              </label>

              {/* SINH HIỆU */}
              <div
                className={styles.fullWidth}
                style={{
                  borderTop: "1px solid var(--line)",
                  paddingTop: "14px",
                }}
              >
                <strong
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "10px",
                  }}
                >
                  <Activity size={16} color="var(--teal)" />
                  {lang === "vi"
                    ? "Chỉ số sinh hiệu (không bắt buộc, trừ cân nặng trẻ em)"
                    : "Vital Signs"}
                </strong>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <label>
                    {lang === "vi" ? "Mạch (l/ph)" : "Pulse (bpm)"}
                    <input
                      type="number"
                      placeholder="75"
                      value={vitals.mach}
                      onChange={(e) =>
                        setVitals({ ...vitals, mach: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "Nhiệt độ (°C)" : "Temp (°C)"}
                    <input
                      type="number"
                      step="0.1"
                      placeholder="37.0"
                      value={vitals.nhietDo}
                      onChange={(e) =>
                        setVitals({ ...vitals, nhietDo: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "HA Tâm thu" : "BP Systolic"}
                    <input
                      type="number"
                      placeholder="120"
                      value={vitals.huyetApTamThu}
                      onChange={(e) =>
                        setVitals({ ...vitals, huyetApTamThu: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "HA Tâm trương" : "BP Diastolic"}
                    <input
                      type="number"
                      placeholder="80"
                      value={vitals.huyetApTamTruong}
                      onChange={(e) =>
                        setVitals({
                          ...vitals,
                          huyetApTamTruong: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "Cân nặng (kg)" : "Weight (kg)"}
                    <input
                      type="number"
                      step="0.1"
                      placeholder="60"
                      value={vitals.canNang}
                      onChange={(e) =>
                        setVitals({ ...vitals, canNang: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    {lang === "vi" ? "Chiều cao (cm)" : "Height (cm)"}
                    <input
                      type="number"
                      placeholder="170"
                      value={vitals.chieuCao}
                      onChange={(e) =>
                        setVitals({ ...vitals, chieuCao: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>

              {/* KHÁM LÂM SÀNG */}
              <label className={styles.fullWidth}>
                {lang === "vi" ? "Khám lâm sàng" : "Clinical Examination"}
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder={
                    lang === "vi"
                      ? "Mô tả triệu chứng lâm sàng..."
                      : "Describe clinical signs..."
                  }
                />
              </label>

              {/* CHẨN ĐOÁN & MÃ ICD-10 */}
              <label>
                {lang === "vi" ? "Chẩn đoán chính *" : "Primary Diagnosis *"}
                <textarea
                  rows={2}
                  required
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                  placeholder={
                    lang === "vi" ? "Nhập chẩn đoán..." : "Enter diagnosis..."
                  }
                />
              </label>

              <label>
                {lang === "vi" ? "Mã ICD-10 chính" : "Primary ICD-10 Code"}
                <div style={{ position: "relative" }}>
                  <input
                    value={icdKeyword}
                    onChange={(e) => {
                      setIcdKeyword(e.target.value);
                      setSelectedIcd(null);
                    }}
                    placeholder={
                      lang === "vi"
                        ? "Tìm mã hoặc tên bệnh (vd J06)..."
                        : "Search code/name..."
                    }
                  />
                  {selectedIcd && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--teal)",
                        fontWeight: 700,
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      ✓ {selectedIcd.ma}: {selectedIcd.ten}{" "}
                      {selectedIcd.manTinh &&
                        "(Bệnh mạn tính - kê tối đa 90 ngày)"}
                    </span>
                  )}
                  {icdKeyword &&
                    !selectedIcd &&
                    (icdQuery.data?.duLieu ?? []).length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid var(--line)",
                          borderRadius: "6px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          maxHeight: "180px",
                          overflowY: "auto",
                          zIndex: 10,
                        }}
                      >
                        {(icdQuery.data?.duLieu ?? []).map((item) => (
                          <div
                            key={item.ma}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                            onClick={() => {
                              setSelectedIcd(item);
                              setIcdKeyword(item.ma);
                            }}
                          >
                            <strong>{item.ma}</strong> - {item.ten}{" "}
                            {item.manTinh && (
                              <span style={{ color: "#d97706" }}>
                                (Mạn tính)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </label>

              <label className={styles.fullWidth}>
                {lang === "vi" ? "Chẩn đoán kèm theo" : "Secondary Diagnosis"}
                <input
                  value={secondaryDiagnosis}
                  onChange={(e) => setSecondaryDiagnosis(e.target.value)}
                  placeholder={
                    lang === "vi"
                      ? "Bệnh kèm theo (nếu có)..."
                      : "Secondary diseases..."
                  }
                />
              </label>

              {/* KÊ ĐƠN THUỐC */}
              <div
                className={styles.fullWidth}
                style={{
                  borderTop: "1px solid var(--line)",
                  paddingTop: "14px",
                }}
              >
                <strong
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "10px",
                  }}
                >
                  <FileCheck size={16} color="var(--teal)" />
                  {lang === "vi"
                    ? "Đơn thuốc (chọn từ danh mục chuẩn)"
                    : "Prescription"}
                </strong>

                {/* Tìm kiếm thuốc để thêm */}
                <div style={{ position: "relative", marginBottom: "12px" }}>
                  <input
                    value={medicineKeyword}
                    onChange={(e) => setMedicineKeyword(e.target.value)}
                    placeholder={
                      lang === "vi"
                        ? "Gõ tên hoặc hoạt chất thuốc để thêm vào đơn..."
                        : "Search medicine name or active ingredient..."
                    }
                  />
                  {medicineKeyword.trim().length >= 2 &&
                    (medicineQuery.data?.duLieu ?? []).length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid var(--line)",
                          borderRadius: "6px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          maxHeight: "180px",
                          overflowY: "auto",
                          zIndex: 10,
                        }}
                      >
                        {(medicineQuery.data?.duLieu ?? []).map((med) => (
                          <div
                            key={med.id}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f1f5f9",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                            onClick={() => handleAddMedicine(med)}
                          >
                            <div>
                              <strong>{med.tenThuoc}</strong>{" "}
                              {med.hamLuong && `(${med.hamLuong})`} ·{" "}
                              {med.hoatChat || "—"}
                            </div>
                            <span
                              style={{ color: "var(--teal)", fontWeight: 700 }}
                            >
                              + {lang === "vi" ? "Thêm" : "Add"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Bảng đơn thuốc */}
                {prescriptionRows.length > 0 && (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                      marginBottom: "12px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f8faf9",
                          borderBottom: "1px solid var(--line)",
                          textAlign: "left",
                        }}
                      >
                        <th style={{ padding: "8px" }}>Tên thuốc</th>
                        <th style={{ padding: "8px" }}>Liều dùng</th>
                        <th style={{ padding: "8px" }}>Lần/ngày</th>
                        <th style={{ padding: "8px" }}>Số ngày</th>
                        <th style={{ padding: "8px" }}>Tổng SL</th>
                        <th style={{ padding: "8px" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionRows.map((row, idx) => (
                        <tr
                          key={row.idThuoc}
                          style={{ borderBottom: "1px solid var(--line)" }}
                        >
                          <td style={{ padding: "8px" }}>
                            <strong>{row.tenThuoc}</strong>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              value={row.lieuDung}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPrescriptionRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx ? { ...r, lieuDung: val } : r,
                                  ),
                                );
                              }}
                              style={{ width: "100%", padding: "4px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              min={1}
                              value={row.soLanMoiNgay}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPrescriptionRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? {
                                          ...r,
                                          soLanMoiNgay: val,
                                          soLuong: val * r.soNgayDung,
                                        }
                                      : r,
                                  ),
                                );
                              }}
                              style={{ width: "60px", padding: "4px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              min={1}
                              max={selectedIcd?.manTinh ? 90 : 30}
                              value={row.soNgayDung}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPrescriptionRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx
                                      ? {
                                          ...r,
                                          soNgayDung: val,
                                          soLuong: val * (r.soLanMoiNgay || 1),
                                        }
                                      : r,
                                  ),
                                );
                              }}
                              style={{ width: "60px", padding: "4px" }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              min={1}
                              value={row.soLuong}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPrescriptionRows((prev) =>
                                  prev.map((r, i) =>
                                    i === idx ? { ...r, soLuong: val } : r,
                                  ),
                                );
                              }}
                              style={{ width: "60px", padding: "4px" }}
                            />{" "}
                            {row.donVi}
                          </td>
                          <td style={{ padding: "8px" }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(row.idThuoc)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "#dc2626",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* LỜI DẶN & TÁI KHÁM */}
              <label className={styles.fullWidth}>
                {lang === "vi"
                  ? "Lời dặn / hướng điều trị"
                  : "Care instructions"}
                <textarea
                  rows={2}
                  value={prescription}
                  onChange={(event) => setPrescription(event.target.value)}
                  placeholder={
                    lang === "vi" ? "Lời dặn của bác sĩ..." : "Instructions..."
                  }
                />
              </label>

              <label>
                {lang === "vi"
                  ? "Ngày hẹn tái khám (nếu có)"
                  : "Follow-up Date"}
                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                />
              </label>

              {/* LÝ DO SỬA (KHI CẬP NHẬT) */}
              {lookupDetails?.ketQua && (
                <label
                  className={styles.fullWidth}
                  style={{
                    background: "#fffbeb",
                    padding: "12px",
                    borderRadius: "8px",
                  }}
                >
                  <strong style={{ color: "#b45309" }}>
                    {lang === "vi"
                      ? "Lý do chỉnh sửa bệnh án (bắt buộc):"
                      : "Reason for editing (mandatory):"}
                  </strong>
                  <textarea
                    rows={2}
                    required
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder={
                      lang === "vi"
                        ? "Nhập lý do thay đổi thông tin bệnh án đã lưu..."
                        : "Enter reason for modification..."
                    }
                  />
                </label>
              )}

              <button type="submit" className={styles.primaryButton}>
                {lookupDetails?.ketQua
                  ? lang === "vi"
                    ? "Cập nhật bệnh án"
                    : "Update medical record"
                  : lang === "vi"
                    ? "Hoàn tất và lưu bệnh án"
                    : "Complete consultation"}
              </button>
            </form>
          </section>

          {/* SỔ KHÁM BỆNH ĐIỆN TỬ EMR IN ĐƯỢC */}
          {completedRecord && (
            <section className={`${styles.panel} ${styles.printableRecord}`}>
              <div className={styles.recordHeading}>
                <div>
                  <span className={styles.eyebrow}>
                    {lang === "vi"
                      ? "SỔ KHÁM BỆNH ĐIỆN TỬ"
                      : "ELECTRONIC MEDICAL RECORD"}
                  </span>
                  <h2>{completedRecord.patientName}</h2>
                  <p>
                    {completedRecord.recordCode} · {completedRecord.createdAt}
                  </p>
                </div>
                <QRCodeSVG
                  value={JSON.stringify(completedRecord)}
                  size={132}
                  level="M"
                  aria-label={
                    lang === "vi"
                      ? "Mã QR hồ sơ khám"
                      : "Medical record QR code"
                  }
                />
              </div>
              <div className={styles.recordField}>
                <strong>{lang === "vi" ? "Chẩn đoán" : "Diagnosis"}</strong>
                <p>{completedRecord.diagnosis}</p>
              </div>
              <div className={styles.recordField}>
                <strong>
                  {lang === "vi"
                    ? "Đơn thuốc / hướng điều trị"
                    : "Prescription / treatment"}
                </strong>
                <p>{completedRecord.prescription}</p>
              </div>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => window.print()}
              >
                {lang === "vi" ? "In / lưu sổ khám" : "Print / save record"}
              </button>
            </section>
          )}

          {showHistory && lookupDetails?.lichHen?.id && (
            <MedicalRecordHistoryModal
              idLichHen={lookupDetails.lichHen.id}
              role="doctor"
              onClose={() => setShowHistory(false)}
            />
          )}
        </>
      )}
    </section>
  );
}
