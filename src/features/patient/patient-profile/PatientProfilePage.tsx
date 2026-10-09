import { useState } from "react";
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
import type { HoSoCuaToiResponse } from "@/types/booking.type";
import type { GioiTinh } from "@/types/common.type";
import { MOCK_PROFILE } from "./patientProfile.data";
import styles from "./PatientProfilePage.module.css";

export function PatientProfilePage() {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<HoSoCuaToiResponse>({ ...MOCK_PROFILE });
  const [draft, setDraft] = useState<HoSoCuaToiResponse>({ ...MOCK_PROFILE });

  const handleEdit = () => { setDraft({ ...form }); setEditing(true); };
  const handleCancel = () => { setEditing(false); setDraft({ ...form }); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ ...draft });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setDraftField = (key: keyof HoSoCuaToiResponse, value: any) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const completionFields = [form.cccd, form.ngaySinh, form.soBaoHiemYTe, form.tienSuBenhLy];
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
      <div className={`${styles.statusBanner} ${isComplete ? styles.statusBannerComplete : ""}`}>
        <span className={styles.statusIcon}>
          {isComplete ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
        </span>
        <span>
          {isComplete
            ? (vi ? "Hồ sơ của bạn đã đầy đủ thông tin." : "Your profile is complete.")
            : (vi
                ? `Hồ sơ hoàn thành ${completedCount}/${completionFields.length} mục. Vui lòng bổ sung để đặt lịch thuận tiện hơn.`
                : `Profile ${completedCount}/${completionFields.length} complete. Please fill in the missing fields.`)}
        </span>
      </div>

      {saved && (
        <div className={`${styles.statusBanner} ${styles.statusBannerComplete}`}>
          <Check size={16} />
          {vi ? "Đã lưu hồ sơ bệnh nhân thành công!" : "Patient profile saved successfully!"}
        </div>
      )}

      {/* ─── Personal Identity Card ─── */}
      <div className={styles.card}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>
            {vi ? "Thông tin nhân thân" : "Personal Identity"}
          </h2>
          {!editing && (
            <button className={styles.btnOutline} type="button" onClick={handleEdit}>
              <Edit3 size={14} />
              {vi ? "Chỉnh sửa" : "Edit"}
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave}>
            <div className={styles.fieldsGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="pp-cccd">
                  {vi ? "Số CCCD / CMND" : "National ID"}
                </label>
                <input id="pp-cccd" className={styles.input} value={draft.cccd || ""} onChange={(e) => setDraftField("cccd", e.target.value)} placeholder="012345678912" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="pp-dob">
                  {vi ? "Ngày sinh" : "Date of birth"}
                </label>
                <input id="pp-dob" className={styles.input} type="date" value={draft.ngaySinh || ""} onChange={(e) => setDraftField("ngaySinh", e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="pp-gender">
                  {vi ? "Giới tính" : "Gender"}
                </label>
                <select id="pp-gender" className={styles.select} value={draft.gioiTinh || "NAM"} onChange={(e) => setDraftField("gioiTinh", e.target.value as GioiTinh)}>
                  <option value="NAM">{vi ? "Nam" : "Male"}</option>
                  <option value="NU">{vi ? "Nữ" : "Female"}</option>
                  <option value="KHAC">{vi ? "Khác" : "Other"}</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="pp-phone">
                  {vi ? "Số điện thoại" : "Phone number"}
                </label>
                <input id="pp-phone" className={styles.input} value={draft.soDienThoai || ""} onChange={(e) => setDraftField("soDienThoai", e.target.value)} />
              </div>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel} htmlFor="pp-address">
                  {vi ? "Địa chỉ" : "Address"}
                </label>
                <input id="pp-address" className={styles.input} value={draft.diaChi || ""} onChange={(e) => setDraftField("diaChi", e.target.value)} />
              </div>
            </div>
            <div className={styles.actionBar}>
              <button className={styles.btnOutline} type="button" onClick={handleCancel}>
                <X size={14} />
                {vi ? "Hủy" : "Cancel"}
              </button>
              <button className={styles.btnPrimary} type="submit">
                <Save size={14} />
                {vi ? "Lưu thay đổi" : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.viewGrid}>
            {[
              { label: vi ? "Số CCCD / CMND" : "National ID", value: form.cccd },
              { label: vi ? "Ngày sinh" : "Date of birth", value: form.ngaySinh ? new Date(form.ngaySinh).toLocaleDateString(vi ? "vi-VN" : "en-US") : "" },
              { label: vi ? "Giới tính" : "Gender", value: form.gioiTinh === "NAM" ? (vi ? "Nam" : "Male") : form.gioiTinh === "NU" ? (vi ? "Nữ" : "Female") : form.gioiTinh === "KHAC" ? (vi ? "Khác" : "Other") : "" },
              { label: vi ? "Số điện thoại" : "Phone", value: form.soDienThoai },
            ].map((item) => (
              <div className={styles.viewItem} key={item.label}>
                <span className={styles.viewItemLabel}>{item.label}</span>
                {item.value
                  ? <span className={styles.viewItemValue}>{item.value}</span>
                  : <span className={styles.viewItemEmpty}>{vi ? "Chưa cập nhật" : "Not provided"}</span>}
              </div>
            ))}
            <div className={`${styles.viewItem} ${styles.fullWidth}`}>
              <span className={styles.viewItemLabel}>{vi ? "Địa chỉ" : "Address"}</span>
              {form.diaChi
                ? <span className={styles.viewItemValue}>{form.diaChi}</span>
                : <span className={styles.viewItemEmpty}>{vi ? "Chưa cập nhật" : "Not provided"}</span>}
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
          {!editing && (
            <button className={styles.btnOutline} type="button" onClick={handleEdit}>
              <Edit3 size={14} />
              {vi ? "Cập nhật" : "Update"}
            </button>
          )}
        </div>
        {form.soBaoHiemYTe ? (
          <div className={styles.insuranceCard}>
            <div className={styles.insuranceLogo}>
              <ShieldCheck size={20} />
            </div>
            <div className={styles.insuranceInfo}>
              <div className={styles.insuranceName}>
                {vi ? "Bảo hiểm Y tế Quốc gia" : "National Health Insurance"}
              </div>
              <div className={styles.insuranceNumber}>{form.soBaoHiemYTe}</div>
              <div className={styles.insuranceExpiry}>
                {vi ? "Hạn sử dụng: 31/12/2025" : "Valid until: Dec 31, 2025"}
              </div>
            </div>
          </div>
        ) : (
          <span className={styles.viewItemEmpty}>{vi ? "Chưa cập nhật số bảo hiểm y tế" : "No health insurance number provided"}</span>
        )}
      </div>

      {/* ─── Medical History Card ─── */}
      <div className={styles.card}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>
            {vi ? "Tiền sử bệnh lý" : "Medical History"}
          </h2>
          {!editing && (
            <button className={styles.btnOutline} type="button" onClick={handleEdit}>
              <Edit3 size={14} />
              {vi ? "Cập nhật" : "Update"}
            </button>
          )}
        </div>
        {editing ? (
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label className={styles.fieldLabel} htmlFor="pp-history">
              {vi ? "Tiền sử bệnh lý & Dị ứng" : "Medical history & Allergies"}
            </label>
            <textarea
              id="pp-history"
              className={styles.textarea}
              value={draft.tienSuBenhLy || ""}
              onChange={(e) => setDraftField("tienSuBenhLy", e.target.value)}
              placeholder={vi ? "Mô tả các bệnh lý nền, dị ứng thuốc..." : "Describe chronic conditions, drug allergies..."}
            />
          </div>
        ) : (
          form.tienSuBenhLy
            ? <p className={styles.viewItemValue} style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{form.tienSuBenhLy}</p>
            : <span className={styles.viewItemEmpty}>{vi ? "Chưa cập nhật tiền sử bệnh lý" : "No medical history provided"}</span>
        )}
      </div>
      </div>
    </PatientPortal>
  );
}
