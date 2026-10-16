import { useState, useRef, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Search } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { doctorBookingService } from "@/services/booking";
import { useQrScanner } from "../hooks/useQrScanner";
import type {
  Appointment,
  ConsultationLookup,
  CompletedRecord,
} from "../doctor-workspace.types";
import styles from "../DoctorWorkspace.module.css";

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
  const [medicationName, setMedicationName] = useState("");
  const [consultationError, setConsultationError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useQrScanner({
    isOpen: scannerOpen,
    videoRef,
    onScan: (code) => {
      setPatientCode(code);
    },
    onClose: () => setScannerOpen(false),
  });

  const medicationQuery = useQuery({
    queryKey: ["medical", "doctor-medications", medicationName],
    queryFn: () => doctorBookingService.getThuocGoiY(medicationName),
    enabled: medicationName.trim().length >= 2,
  });

  const lookupPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = patientCode.trim().toUpperCase();
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
            : details.lichHen.trangThai === "DA_XAC_NHAN"
              ? "accepted"
              : "pending",
      });
      setCompletedRecord(null);
      setDiagnosis(details.ketQua?.chanDoan ?? "");
      setPrescription(details.ketQua?.ghiChu ?? "");
      setMedicationName("");
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
            | "NAM"
            | "NU"
            | "KHAC",
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
    const selectedMedicine = (medicationQuery.data?.duLieu ?? []).find(
      (medicine) => medicine.tenThuoc === medicationName.trim(),
    );
    try {
      const response = await doctorBookingService.ghiBenhAnBacSi(
        lookupDetails.lichHen.id,
        {
          chanDoan: diagnosis.trim(),
          ghiChu: prescription.trim() || undefined,
          donThuoc: selectedMedicine
            ? [
                {
                  tenThuoc: selectedMedicine.tenThuoc,
                  donVi: selectedMedicine.donVi ?? "",
                  lieuDung: prescription.trim() || "Theo chỉ định",
                  soLanMoiNgay: 1,
                  soNgayDung: 1,
                  ghiChuSuDung: null,
                },
              ]
            : [],
        },
        Boolean(lookupDetails.ketQua),
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
          response.duLieu.donThuoc
            .map((medicine) => `${medicine.tenThuoc}: ${medicine.lieuDung}`)
            .join("; ") ||
          response.duLieu.ghiChu ||
          "",
        createdAt: new Intl.DateTimeFormat(lang, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-today"],
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
              ? "Tra cứu phiếu khám, xem tiền sử và hoàn tất hồ sơ điện tử."
              : "Find a visit, review history, and complete the electronic record."}
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
                ? "Quét mã QR trên phiếu khám hoặc nhập mã phiếu."
                : "Scan the visit QR code or enter its code."}
            </p>
          </div>
        </div>
        <form className={styles.lookupForm} onSubmit={lookupPatient}>
          <label htmlFor="patient-visit-code">
            {lang === "vi"
              ? "Mã phiếu khám điện tử"
              : "Electronic visit code"}
          </label>
          <div className={styles.lookupControls}>
            <input
              id="patient-visit-code"
              value={patientCode}
              onChange={(event) => setPatientCode(event.target.value)}
              placeholder="AP-101"
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
              <span className={styles.status}>
                {lang === "vi" ? "Hồ sơ bệnh nhân" : "Patient record"}
              </span>
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
                {lang === "vi" ? "Lý do lần này:" : "Current reason:"}{" "}
                {patientLookup.reason}
              </span>
              {lookupDetails?.lanKhamTruoc.map((visit, index) => (
                <p key={`${visit.ngay}-${index}`}>
                  {visit.ngay} · {visit.tenChuyenKhoa} · {visit.hoTenBacSi}
                  {visit.ketQua?.chanDoan
                    ? ` · ${visit.ketQua.chanDoan}`
                    : ""}
                </p>
              ))}
            </div>
            <form className={styles.formGrid} onSubmit={completeConsultation}>
              <label className={styles.fullWidth}>
                {lang === "vi" ? "Chẩn đoán" : "Diagnosis"}
                <textarea
                  rows={3}
                  required
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                />
              </label>
              <label>
                {lang === "vi" ? "Tên thuốc" : "Medication"}
                <input
                  list="doctor-medication-suggestions"
                  value={medicationName}
                  onChange={(event) => setMedicationName(event.target.value)}
                />
                <datalist id="doctor-medication-suggestions">
                  {(medicationQuery.data?.duLieu ?? []).map((medicine) => (
                    <option key={medicine.id} value={medicine.tenThuoc}>
                      {medicine.donVi ?? ""}
                    </option>
                  ))}
                </datalist>
              </label>
              <label className={styles.fullWidth}>
                {lang === "vi"
                  ? "Lời dặn / hướng điều trị"
                  : "Care instructions"}
                <textarea
                  rows={3}
                  value={prescription}
                  onChange={(event) => setPrescription(event.target.value)}
                />
              </label>
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
        </>
      )}
    </section>
  );
}
