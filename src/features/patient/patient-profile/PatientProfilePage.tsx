import { useState, useEffect } from "react";
import {
  ClipboardList,
  Edit3,
  Save,
  X,
  ShieldCheck,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { PatientPortal } from "@/features/patient/PatientPortal";
import { useQueryClient } from "@tanstack/react-query";
import { patientBookingService } from "@/services/booking";
import type { HoSoCuaToiResponse } from "@/types/booking.type";
import type { GioiTinh } from "@/types/common.type";
import {
  useHoSoBenhNhan,
  useBookingActions,
  useThongTinDatLich,
} from "@/hooks/useBooking";
import styles from "./PatientProfilePage.module.css";

const initialForm: HoSoCuaToiResponse = {
  trangThaiLienKet: "CHUA_LIEN_KET",
  cccd: null,
  hoTen: null,
  ngaySinh: null,
  gioiTinh: "NAM",
  soDienThoai: null,
  diaChi: null,
  soBaoHiemYTe: null,
  tienSuBenhLy: null,
};

export function PatientProfilePage() {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const { hoSo, isLoading } = useHoSoBenhNhan();
  const { thongTin } = useThongTinDatLich();
  const queryClient = useQueryClient();
  const { capNhatHoSo, isUpdatingHoSo } = useBookingActions();

  const [editing, setEditing] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [draftInsurance, setDraftInsurance] = useState("");
  const [editingMedicalHistory, setEditingMedicalHistory] = useState(false);
  const [draftMedicalHistory, setDraftMedicalHistory] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingRelative, setEditingRelative] = useState<number | null>(null);
  const [familyError, setFamilyError] = useState("");

  const [form, setForm] = useState<HoSoCuaToiResponse>(initialForm);
  const [draft, setDraft] = useState<HoSoCuaToiResponse>(initialForm);

  useEffect(() => {
    if (hoSo) {
      setForm(hoSo);
      setDraft(hoSo);
    }
  }, [hoSo]);

  const handleEdit = () => {
    setDraft({ ...form });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft({ ...form });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    try {
      const updated = await capNhatHoSo({
        cccd: draft.cccd,
        hoTen: draft.hoTen,
        ngaySinh: draft.ngaySinh,
        gioiTinh: draft.gioiTinh,
        soDienThoai: draft.soDienThoai,
        diaChi: draft.diaChi,
        soBaoHiemYTe: form.soBaoHiemYTe,
        tienSuBenhLy: form.tienSuBenhLy,
      });
      if (!updated?.thanhCong || !updated.duLieu)
        throw new Error(updated?.thongDiep || "Profile update failed");
      setForm(updated.duLieu);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaveError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : vi
              ? "Không thể lưu hồ sơ."
              : "Could not save profile."),
      );
    }
  };

  const handleEditInsurance = () => {
    setDraftInsurance(form.soBaoHiemYTe || "");
    setEditingInsurance(true);
  };

  const handleCancelInsurance = () => {
    setEditingInsurance(false);
    setDraftInsurance(form.soBaoHiemYTe || "");
  };

  const handleSaveInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    try {
      const updated = await capNhatHoSo({
        cccd: form.cccd,
        hoTen: form.hoTen,
        ngaySinh: form.ngaySinh,
        gioiTinh: form.gioiTinh,
        soDienThoai: form.soDienThoai,
        diaChi: form.diaChi,
        soBaoHiemYTe: draftInsurance.trim() || null,
        tienSuBenhLy: form.tienSuBenhLy,
      });
      if (!updated?.thanhCong || !updated.duLieu)
        throw new Error(updated?.thongDiep || "Profile update failed");
      setForm(updated.duLieu);
      setEditingInsurance(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaveError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : vi
              ? "Không thể lưu số bảo hiểm y tế."
              : "Could not save health insurance."),
      );
    }
  };

  const handleEditMedicalHistory = () => {
    setDraftMedicalHistory(form.tienSuBenhLy || "");
    setEditingMedicalHistory(true);
  };

  const handleCancelMedicalHistory = () => {
    setEditingMedicalHistory(false);
    setDraftMedicalHistory(form.tienSuBenhLy || "");
  };

  const handleSaveMedicalHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    try {
      const updated = await capNhatHoSo({
        cccd: form.cccd,
        hoTen: form.hoTen,
        ngaySinh: form.ngaySinh,
        gioiTinh: form.gioiTinh,
        soDienThoai: form.soDienThoai,
        diaChi: form.diaChi,
        soBaoHiemYTe: form.soBaoHiemYTe,
        tienSuBenhLy: draftMedicalHistory.trim() || null,
      });
      if (!updated?.thanhCong || !updated.duLieu)
        throw new Error(updated?.thongDiep || "Profile update failed");
      setForm(updated.duLieu);
      setEditingMedicalHistory(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaveError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : vi
              ? "Không thể lưu tiền sử bệnh lý."
              : "Could not save medical history."),
      );
    }
  };

  const saveRelative = async (
    event: React.FormEvent<HTMLFormElement>,
    id: number,
  ) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const relative = thongTin?.nguoiThan.find((item) => item.id === id);
    try {
      const response = await patientBookingService.capNhatNguoiThan(id, {
        hoTen: String(values.get("hoTen") || "").trim(),
        ngaySinh: String(values.get("ngaySinh") || ""),
        gioiTinh: String(values.get("gioiTinh") || "NAM"),
        soDienThoai: String(values.get("soDienThoai") || "").trim(),
        email: String(values.get("email") || "") || null,
        diaChi: String(values.get("diaChi") || "") || null,
        soBaoHiemYTe: String(values.get("soBaoHiemYTe") || "") || null,
        nguoiGiamHo: relative?.nguoiGiamHo ?? null,
      });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      setFamilyError("");
      setEditingRelative(null);
      await queryClient.invalidateQueries({
        queryKey: ["booking", "thong-tin-dat-lich"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "trang-ca-nhan"],
      });
    } catch (error) {
      setFamilyError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : vi
              ? "Không thể cập nhật người thân."
              : "Could not update family member."),
      );
    }
  };

  const removeRelative = async (id: number) => {
    if (
      !window.confirm(
        vi
          ? "Xóa người thân khỏi danh sách đã lưu?"
          : "Remove this family member from saved details?",
      )
    )
      return;
    try {
      const response = await patientBookingService.xoaNguoiThan(id);
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await queryClient.invalidateQueries({
        queryKey: ["booking", "thong-tin-dat-lich"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "trang-ca-nhan"],
      });
    } catch (error) {
      setFamilyError(
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
          (error instanceof Error
            ? error.message
            : vi
              ? "Không thể xóa người thân."
              : "Could not remove family member."),
      );
    }
  };

  const setDraftField = (key: keyof HoSoCuaToiResponse, value: any) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const completionFields = [
    form.cccd,
    form.ngaySinh,
    form.soBaoHiemYTe,
    form.tienSuBenhLy,
  ];
  const completedCount = completionFields.filter(Boolean).length;
  const isComplete = completedCount === completionFields.length;

  return (
    <PatientPortal>
      <div className={styles.page}>
        {/* ─── Page Header ─── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderIcon}>
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className={styles.pageTitle}>
              {vi ? "Hồ sơ bệnh nhân" : "Patient Profile"}
            </h1>
            <p className={styles.pageSubtitle}>
              {vi
                ? "Thông tin y tế và nhân thân của bạn"
                : "Your medical and personal identity information"}
            </p>
          </div>
        </div>

        {/* ─── Completion banner ─── */}
        <div
          className={`${styles.statusBanner} ${isComplete ? styles.statusBannerComplete : ""}`}
        >
          <span className={styles.statusIcon}>
            {isComplete ? (
              <ShieldCheck size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
          </span>
          <span>
            {isLoading
              ? vi
                ? "Đang tải dữ liệu hồ sơ..."
                : "Loading profile data..."
              : isComplete
                ? vi
                  ? "Hồ sơ của bạn đã đầy đủ thông tin."
                  : "Your profile is complete."
                : vi
                  ? `Hồ sơ hoàn thành ${completedCount}/${completionFields.length} mục. Vui lòng bổ sung để đặt lịch thuận tiện hơn.`
                  : `Profile ${completedCount}/${completionFields.length} complete. Please fill in the missing fields.`}
          </span>
        </div>

        {saved && (
          <div
            className={`${styles.statusBanner} ${styles.statusBannerComplete}`}
          >
            <Check size={16} />
            {vi
              ? "Đã lưu hồ sơ bệnh nhân thành công!"
              : "Patient profile saved successfully!"}
          </div>
        )}
        {saveError && (
          <div
            className={`${styles.statusBanner} ${styles.statusBannerError}`}
            role="alert"
          >
            {saveError}
          </div>
        )}

        {/* ─── Personal Identity Card ─── */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>
              {vi ? "Thông tin nhân thân" : "Personal Identity"}
            </h2>
            {!editing && (
              <button
                className={styles.btnOutline}
                type="button"
                onClick={handleEdit}
              >
                <Edit3 size={14} />
                {vi ? "Chỉnh sửa" : "Edit"}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave}>
              <div className={styles.fieldsGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="pp-hoten">
                    {vi ? "Họ và tên" : "Full name"}
                  </label>
                  <input
                    id="pp-hoten"
                    className={styles.input}
                    value={draft.hoTen || ""}
                    onChange={(e) => setDraftField("hoTen", e.target.value)}
                    placeholder="Nguyễn Văn An"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="pp-cccd">
                    {vi ? "Số CCCD / CMND" : "National ID"}
                  </label>
                  <input
                    id="pp-cccd"
                    className={styles.input}
                    value={draft.cccd || ""}
                    onChange={(e) => setDraftField("cccd", e.target.value)}
                    placeholder="012345678912"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="pp-dob">
                    {vi ? "Ngày sinh" : "Date of birth"}
                  </label>
                  <input
                    id="pp-dob"
                    className={styles.input}
                    type="date"
                    value={draft.ngaySinh || ""}
                    onChange={(e) => setDraftField("ngaySinh", e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="pp-gender">
                    {vi ? "Giới tính" : "Gender"}
                  </label>
                  <select
                    id="pp-gender"
                    className={styles.select}
                    value={draft.gioiTinh || "NAM"}
                    onChange={(e) =>
                      setDraftField("gioiTinh", e.target.value as GioiTinh)
                    }
                  >
                    <option value="NAM">{vi ? "Nam" : "Male"}</option>
                    <option value="NU">{vi ? "Nữ" : "Female"}</option>
                    <option value="KHAC">{vi ? "Khác" : "Other"}</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="pp-phone">
                    {vi ? "Số điện thoại" : "Phone number"}
                  </label>
                  <input
                    id="pp-phone"
                    className={styles.input}
                    value={draft.soDienThoai || ""}
                    onChange={(e) =>
                      setDraftField("soDienThoai", e.target.value)
                    }
                  />
                </div>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.fieldLabel} htmlFor="pp-address">
                    {vi ? "Địa chỉ" : "Address"}
                  </label>
                  <input
                    id="pp-address"
                    className={styles.input}
                    value={draft.diaChi || ""}
                    onChange={(e) => setDraftField("diaChi", e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.actionBar}>
                <button
                  className={styles.btnOutline}
                  type="button"
                  onClick={handleCancel}
                >
                  <X size={14} />
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button
                  className={styles.btnPrimary}
                  type="submit"
                  disabled={isUpdatingHoSo}
                >
                  <Save size={14} />
                  {isUpdatingHoSo
                    ? vi
                      ? "Đang lưu..."
                      : "Saving..."
                    : vi
                      ? "Lưu thay đổi"
                      : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.viewGrid}>
              {[
                { label: vi ? "Họ và tên" : "Full name", value: form.hoTen },
                {
                  label: vi ? "Số CCCD / CMND" : "National ID",
                  value: form.cccd,
                },
                {
                  label: vi ? "Ngày sinh" : "Date of birth",
                  value: form.ngaySinh
                    ? new Date(form.ngaySinh).toLocaleDateString(
                        vi ? "vi-VN" : "en-US",
                      )
                    : "",
                },
                {
                  label: vi ? "Giới tính" : "Gender",
                  value:
                    form.gioiTinh === "NAM"
                      ? vi
                        ? "Nam"
                        : "Male"
                      : form.gioiTinh === "NU"
                        ? vi
                          ? "Nữ"
                          : "Female"
                        : form.gioiTinh === "KHAC"
                          ? vi
                            ? "Khác"
                            : "Other"
                          : "",
                },
                {
                  label: vi ? "Số điện thoại" : "Phone",
                  value: form.soDienThoai,
                },
              ].map((item) => (
                <div className={styles.viewItem} key={item.label}>
                  <span className={styles.viewItemLabel}>{item.label}</span>
                  {item.value ? (
                    <span className={styles.viewItemValue}>{item.value}</span>
                  ) : (
                    <span className={styles.viewItemEmpty}>
                      {vi ? "Chưa cập nhật" : "Not provided"}
                    </span>
                  )}
                </div>
              ))}
              <div className={`${styles.viewItem} ${styles.fullWidth}`}>
                <span className={styles.viewItemLabel}>
                  {vi ? "Địa chỉ" : "Address"}
                </span>
                {form.diaChi ? (
                  <span className={styles.viewItemValue}>{form.diaChi}</span>
                ) : (
                  <span className={styles.viewItemEmpty}>
                    {vi ? "Chưa cập nhật" : "Not provided"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Insurance Card ─── */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>
              {vi ? "Bảo hiểm y tế" : "Health Insurance"}
            </h2>
            {!editingInsurance && (
              <button
                className={styles.btnOutline}
                type="button"
                onClick={handleEditInsurance}
              >
                <Edit3 size={14} />
                {vi ? "Cập nhật" : "Update"}
              </button>
            )}
          </div>
          {editingInsurance ? (
            <form onSubmit={handleSaveInsurance}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel} htmlFor="pp-insurance-input">
                  {vi ? "Mã số thẻ Bảo hiểm Y tế" : "Health Insurance Number"}
                </label>
                <input
                  id="pp-insurance-input"
                  className={styles.input}
                  maxLength={50}
                  value={draftInsurance}
                  onChange={(e) => setDraftInsurance(e.target.value)}
                  placeholder="DN4797912345601"
                />
                <span style={{ fontSize: "11px", color: "var(--ink-soft)" }}>
                  {vi
                    ? "Tối đa 50 ký tự. Để trống nếu bạn không có hoặc muốn gỡ thẻ BHYT."
                    : "Up to 50 characters. Leave blank if you don't have health insurance."}
                </span>
              </div>
              <div className={styles.actionBar}>
                <button
                  className={styles.btnOutline}
                  type="button"
                  onClick={handleCancelInsurance}
                >
                  <X size={14} />
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button
                  className={styles.btnPrimary}
                  type="submit"
                  disabled={isUpdatingHoSo}
                >
                  <Save size={14} />
                  {isUpdatingHoSo
                    ? vi
                      ? "Đang lưu..."
                      : "Saving..."
                    : vi
                      ? "Lưu BHYT"
                      : "Save Insurance"}
                </button>
              </div>
            </form>
          ) : form.soBaoHiemYTe ? (
            <div className={styles.insuranceCard}>
              <div className={styles.insuranceLogo}>
                <ShieldCheck size={20} />
              </div>
              <div className={styles.insuranceInfo}>
                <div className={styles.insuranceName}>
                  {vi ? "Bảo hiểm Y tế Quốc gia" : "National Health Insurance"}
                </div>
                <div className={styles.insuranceNumber}>
                  {form.soBaoHiemYTe}
                </div>
                <div className={styles.insuranceExpiry}>
                  {vi ? "Thẻ còn hiệu lực" : "Card is active"}
                </div>
              </div>
            </div>
          ) : (
            <span className={styles.viewItemEmpty}>
              {vi
                ? "Chưa cập nhật số bảo hiểm y tế. Nhấn 'Cập nhật' để điền số thẻ."
                : "No health insurance number provided. Click 'Update' to enter."}
            </span>
          )}
        </div>

        {/* ─── Medical History Card ─── */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>
              {vi ? "Tiền sử bệnh lý" : "Medical History"}
            </h2>
            {!editingMedicalHistory && (
              <button
                className={styles.btnOutline}
                type="button"
                onClick={handleEditMedicalHistory}
              >
                <Edit3 size={14} />
                {vi ? "Cập nhật" : "Update"}
              </button>
            )}
          </div>
          {editingMedicalHistory ? (
            <form onSubmit={handleSaveMedicalHistory}>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel} htmlFor="pp-history">
                  {vi
                    ? "Tiền sử bệnh lý, dị ứng & bệnh mạn tính"
                    : "Medical history, allergies & chronic conditions"}
                </label>
                <textarea
                  id="pp-history"
                  className={styles.textarea}
                  rows={4}
                  maxLength={5000}
                  value={draftMedicalHistory}
                  onChange={(e) => setDraftMedicalHistory(e.target.value)}
                  placeholder={
                    vi
                      ? "Mô tả các bệnh lý nền, tiền sử phẫu thuật, dị ứng thuốc (penicillin, aspirin...)..."
                      : "Describe chronic conditions, past surgeries, drug allergies..."
                  }
                />
                <span style={{ fontSize: "11px", color: "var(--ink-soft)" }}>
                  {vi
                    ? "Tối đa 5.000 ký tự. Giúp bác sĩ đưa ra phác đồ điều trị chính xác hơn."
                    : "Up to 5,000 characters. Helps doctors provide accurate care plans."}
                </span>
              </div>
              <div className={styles.actionBar}>
                <button
                  className={styles.btnOutline}
                  type="button"
                  onClick={handleCancelMedicalHistory}
                >
                  <X size={14} />
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button
                  className={styles.btnPrimary}
                  type="submit"
                  disabled={isUpdatingHoSo}
                >
                  <Save size={14} />
                  {isUpdatingHoSo
                    ? vi
                      ? "Đang lưu..."
                      : "Saving..."
                    : vi
                      ? "Lưu bệnh sử"
                      : "Save History"}
                </button>
              </div>
            </form>
          ) : form.tienSuBenhLy ? (
            <p
              className={styles.viewItemValue}
              style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
            >
              {form.tienSuBenhLy}
            </p>
          ) : (
            <span className={styles.viewItemEmpty}>
              {vi
                ? "Chưa cập nhật tiền sử bệnh lý. Nhấn 'Cập nhật' để bổ sung thông tin."
                : "No medical history provided. Click 'Update' to add details."}
            </span>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>
              {vi ? "Người thân đã lưu" : "Saved family members"}
            </h2>
          </div>
          {familyError && (
            <p role="alert" className="mb-3 text-sm text-rose-700">
              {familyError}
            </p>
          )}
          {!thongTin?.nguoiThan.length ? (
            <p className={styles.viewItemEmpty}>
              {vi
                ? "Chưa có người thân đã lưu. Có thể lưu người thân khi đặt lịch."
                : "No saved family members. Save a family member during booking."}
            </p>
          ) : (
            <div className="grid gap-4">
              {thongTin.nguoiThan.map((relative) => (
                <article
                  className="border-b border-slate-200 pb-4"
                  key={relative.id}
                >
                  {editingRelative === relative.id ? (
                    <form
                      className={styles.fieldsGrid}
                      onSubmit={(event) =>
                        void saveRelative(event, relative.id)
                      }
                    >
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {vi ? "Họ tên người thân" : "Full name"}
                        </label>
                        <input
                          name="hoTen"
                          required
                          maxLength={150}
                          className={styles.input}
                          defaultValue={relative.hoTen}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {vi ? "Ngày sinh" : "Date of birth"}
                        </label>
                        <input
                          name="ngaySinh"
                          type="date"
                          required
                          className={styles.input}
                          defaultValue={relative.ngaySinh}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {vi ? "Giới tính" : "Gender"}
                        </label>
                        <select
                          name="gioiTinh"
                          className={styles.select}
                          defaultValue={relative.gioiTinh}
                        >
                          <option value="NAM">{vi ? "Nam" : "Male"}</option>
                          <option value="NU">{vi ? "Nữ" : "Female"}</option>
                          <option value="KHAC">{vi ? "Khác" : "Other"}</option>
                        </select>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {vi ? "Số điện thoại" : "Phone number"}
                        </label>
                        <input
                          name="soDienThoai"
                          required
                          pattern="^0\d{9}$"
                          className={styles.input}
                          defaultValue={relative.soDienThoai}
                          placeholder="0912345678"
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          className={styles.input}
                          defaultValue={relative.email ?? ""}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          {vi ? "Số thẻ BHYT" : "Health insurance"}
                        </label>
                        <input
                          name="soBaoHiemYTe"
                          maxLength={50}
                          className={styles.input}
                          defaultValue={relative.soBaoHiemYTe ?? ""}
                          placeholder="DN4797912345601"
                        />
                      </div>
                      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                        <label className={styles.fieldLabel}>
                          {vi ? "Địa chỉ" : "Address"}
                        </label>
                        <input
                          name="diaChi"
                          maxLength={500}
                          className={styles.input}
                          defaultValue={relative.diaChi ?? ""}
                        />
                      </div>
                      <div className={`${styles.actionBar} ${styles.fullWidth}`} style={{ marginTop: "8px" }}>
                        <button
                          className={styles.btnOutline}
                          type="button"
                          onClick={() => setEditingRelative(null)}
                        >
                          <X size={14} />
                          {vi ? "Hủy" : "Cancel"}
                        </button>
                        <button className={styles.btnPrimary} type="submit">
                          <Save size={14} />
                          {vi ? "Lưu người thân" : "Save Relative"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong>{relative.hoTen}</strong>
                        <p className="text-xs text-slate-500">
                          {relative.ngaySinh} · {relative.soDienThoai}
                          {relative.nguoiGiamHo
                            ? ` · ${vi ? "Người giám hộ" : "Guardian"}: ${relative.nguoiGiamHo.hoTen}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={styles.btnOutline}
                          type="button"
                          onClick={() => setEditingRelative(relative.id)}
                        >
                          {vi ? "Sửa" : "Edit"}
                        </button>
                        <button
                          className={styles.btnOutline}
                          type="button"
                          onClick={() => void removeRelative(relative.id)}
                        >
                          {vi ? "Xóa" : "Remove"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientPortal>
  );
}
