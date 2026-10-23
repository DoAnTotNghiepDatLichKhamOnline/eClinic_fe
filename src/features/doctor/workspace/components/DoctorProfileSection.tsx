import { useState, useRef, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Lock,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
  Globe,
  Award,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  Pencil,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { userProfileService } from "@/services/identity/userProfileService";
import { doctorService } from "@/services/catalog/doctorService";
import { notifyAuth } from "@/utils/authNotification";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type {
  HoSoBacSiQuanTriResponse,
  AnhBacSiResponse,
} from "@/types/catalog.type";
import styles from "../../DoctorWorkspace.module.css";

const AVAILABLE_LANGUAGES: { code: string; labelVi: string; labelEn: string }[] = [
  { code: "vi", labelVi: "Tiếng Việt", labelEn: "Vietnamese" },
  { code: "en", labelVi: "Tiếng Anh", labelEn: "English" },
  { code: "fr", labelVi: "Tiếng Pháp", labelEn: "French" },
  { code: "zh", labelVi: "Tiếng Trung", labelEn: "Chinese" },
  { code: "ja", labelVi: "Tiếng Nhật", labelEn: "Japanese" },
  { code: "ko", labelVi: "Tiếng Hàn", labelEn: "Korean" },
  { code: "de", labelVi: "Tiếng Đức", labelEn: "German" },
  { code: "ru", labelVi: "Tiếng Nga", labelEn: "Russian" },
];

function getLanguageLabel(code: string, lang: string) {
  const found = AVAILABLE_LANGUAGES.find(
    (l) => l.code.toLowerCase() === code.toLowerCase(),
  );
  if (found) {
    return lang === "vi" ? found.labelVi : found.labelEn;
  }
  return code;
}

function normalizeLanguageCode(input: string): string {
  const trimmed = input.trim();
  const found = AVAILABLE_LANGUAGES.find(
    (l) =>
      l.code.toLowerCase() === trimmed.toLowerCase() ||
      l.labelVi.toLowerCase() === trimmed.toLowerCase() ||
      l.labelEn.toLowerCase() === trimmed.toLowerCase(),
  );
  if (found) return found.code;
  if (/^[A-Za-z]{2,3}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return "vi";
}

export function DoctorProfileSection() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [gioiThieuNgan, setGioiThieuNgan] = useState("");
  const [tieuSu, setTieuSu] = useState("");
  const [ngonNguInput, setNgonNguInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [awards, setAwards] = useState<string[]>([]);
  const [newAward, setNewAward] = useState("");
  const [researchList, setResearchList] = useState<string[]>([]);
  const [newResearch, setNewResearch] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageCaption, setImageCaption] = useState("");

  // State chỉnh sửa chú thích ảnh
  const [editingPhoto, setEditingPhoto] = useState<AnhBacSiResponse | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editCaptionEn, setEditCaptionEn] = useState("");
  const [savingCaption, setSavingCaption] = useState(false);

  // State xác nhận xóa ảnh
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<number | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const doctorAccountQuery = useQuery({
    queryKey: ["identity", "doctor-profile"],
    queryFn: () => userProfileService.getHoSoCaNhan(),
  });

  const doctorProfileQuery = useQuery<HoSoBacSiQuanTriResponse | null>({
    queryKey: ["catalog", "doctor-self-profile"],
    queryFn: async () => {
      try {
        const res = await doctorService.getHoSoBacSiToi();
        return res.duLieu;
      } catch {
        // Fallback to public catalog if self-profile route has special permissions
        const accountDoctorId = doctorAccountQuery.data?.duLieu?.bacSi?.id;
        if (accountDoctorId) {
          const res = await doctorService.getChiTietBacSi(accountDoctorId);
          return res.duLieu as any;
        }
        return null;
      }
    },
    enabled: true,
  });

  const profile = doctorProfileQuery.data;
  const doctorAccount = doctorAccountQuery.data?.duLieu;

  // Initialize edit form when opening edit mode
  const handleStartEdit = () => {
    if (profile) {
      setGioiThieuNgan(profile.gioiThieuNgan || "");
      setTieuSu(profile.tieuSu || "");
      const currentLangs =
        profile.ngonNguKham && profile.ngonNguKham.length > 0
          ? profile.ngonNguKham.map(normalizeLanguageCode)
          : ["vi"];
      setLanguages(currentLangs);
      setAwards(profile.giaiThuong || []);
      setResearchList(profile.congTrinhNghienCuu || []);
    }
    setIsEditing(true);
  };

  // Mutation to update self-profile
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const phienBan = profile?.phienBanHoSo ?? 1;
      const validLangs = languages.map(normalizeLanguageCode).filter(Boolean);
      return doctorService.capNhatHoSoBacSiToi({
        phienBan,
        gioiThieuNgan: gioiThieuNgan.trim() || null,
        tieuSu: tieuSu.trim() || null,
        ngonNguKham: validLangs.length > 0 ? validLangs : undefined,
        giaiThuong: awards.length > 0 ? awards : undefined,
        congTrinhNghienCuu: researchList.length > 0 ? researchList : undefined,
      });
    },
    onSuccess: (res) => {
      if (res.thanhCong) {
        notifyAuth(
          "success",
          lang === "vi"
            ? "Cập nhật hồ sơ thành công"
            : "Profile updated successfully",
          "",
        );
        setIsEditing(false);
        queryClient.invalidateQueries({
          queryKey: ["catalog", "doctor-self-profile"],
        });
      } else {
        notifyAuth("error", res.thongDiep || "Update failed", "");
      }
    },
    onError: (err: any) => {
      notifyAuth(
        "error",
        err.response?.data?.thongDiep ||
          err.message ||
          (lang === "vi" ? "Lỗi cập nhật hồ sơ" : "Failed to update profile"),
        "",
      );
    },
  });

  // Handle language chips
  const handleAddLanguage = (codeToAdd?: string) => {
    const code = normalizeLanguageCode(codeToAdd || ngonNguInput);
    if (code && !languages.includes(code)) {
      setLanguages([...languages, code]);
      setNgonNguInput("");
    }
  };

  const handleRemoveLanguage = (langItem: string) => {
    setLanguages(languages.filter((l) => l !== langItem));
  };

  // Handle awards
  const handleAddAward = () => {
    const trimmed = newAward.trim();
    if (trimmed) {
      setAwards([...awards, trimmed]);
      setNewAward("");
    }
  };

  const handleRemoveAward = (idx: number) => {
    setAwards(awards.filter((_, i) => i !== idx));
  };

  // Handle research
  const handleAddResearch = () => {
    const trimmed = newResearch.trim();
    if (trimmed) {
      setResearchList([...researchList, trimmed]);
      setNewResearch("");
    }
  };

  const handleRemoveResearch = (idx: number) => {
    setResearchList(researchList.filter((_, i) => i !== idx));
  };

  // Handle uploading work image
  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifyAuth(
        "error",
        lang === "vi"
          ? "Vui lòng chọn file hình ảnh hợp lệ"
          : "Please select a valid image file",
        "",
      );
      return;
    }

    try {
      setUploadingImage(true);
      const res = await doctorService.themAnhCongViecToi(
        file,
        imageCaption.trim() || undefined,
      );
      if (res.thanhCong) {
        notifyAuth(
          "success",
          lang === "vi"
            ? "Tải ảnh công việc thành công"
            : "Work image uploaded successfully",
          "",
        );
        setImageCaption("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        queryClient.invalidateQueries({
          queryKey: ["catalog", "doctor-self-profile"],
        });
      } else {
        notifyAuth("error", res.thongDiep || "Upload failed", "");
      }
    } catch (err: any) {
      notifyAuth(
        "error",
        err.response?.data?.thongDiep ||
          err.message ||
          (lang === "vi" ? "Lỗi tải ảnh" : "Failed to upload image"),
        "",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Execute delete image
  const executeDeleteImage = async () => {
    if (!confirmDeletePhotoId) return;

    try {
      setIsDeletingPhoto(true);
      const res = await doctorService.xoaAnhToi(confirmDeletePhotoId);
      if (res.thanhCong) {
        notifyAuth(
          "success",
          lang === "vi" ? "Đã xóa ảnh" : "Photo deleted successfully",
          "",
        );
        queryClient.invalidateQueries({
          queryKey: ["catalog", "doctor-self-profile"],
        });
      }
    } catch (err: any) {
      notifyAuth(
        "error",
        err.response?.data?.thongDiep ||
          err.message ||
          (lang === "vi" ? "Lỗi xóa ảnh" : "Failed to delete photo"),
        "",
      );
    } finally {
      setIsDeletingPhoto(false);
      setConfirmDeletePhotoId(null);
    }
  };

  // Handle edit image caption
  const handleStartEditPhoto = (photo: AnhBacSiResponse) => {
    setEditingPhoto(photo);
    setEditCaption(photo.chuThich || "");
    setEditCaptionEn(photo.chuThichEn || "");
  };

  const handleSavePhotoCaption = async () => {
    if (!editingPhoto) return;
    try {
      setSavingCaption(true);
      const res = await doctorService.suaChuThichAnhToi(editingPhoto.id, {
        chuThich: editCaption.trim() || undefined,
        chuThichEn: editCaptionEn.trim() || undefined,
      });
      if (res.thanhCong) {
        notifyAuth(
          "success",
          lang === "vi"
            ? "Cập nhật chú thích ảnh thành công"
            : "Photo caption updated successfully",
          "",
        );
        setEditingPhoto(null);
        queryClient.invalidateQueries({
          queryKey: ["catalog", "doctor-self-profile"],
        });
      } else {
        notifyAuth("error", res.thongDiep || "Failed to update caption", "");
      }
    } catch (err: any) {
      notifyAuth(
        "error",
        err.response?.data?.thongDiep ||
          err.message ||
          (lang === "vi" ? "Lỗi cập nhật chú thích" : "Failed to update caption"),
        "",
      );
    } finally {
      setSavingCaption(false);
    }
  };

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>{lang === "vi" ? "Hồ sơ cá nhân" : "Doctor Profile"}</h1>
          <p>
            {lang === "vi"
              ? "Xem thông tin hành nghề và tự quản lý phần giới thiệu, chuyên môn cá nhân."
              : "Review practicing credentials and manage your personal bio and research."}
          </p>
        </div>
        <div>
          (
        <div style={{ display: "grid", gap: "16px", marginTop: "14px" }}>
          <label className={styles.field}>
            <span>
              {lang === "vi"
                ? "Giới thiệu ngắn (tối đa 255 ký tự):"
                : "Short Bio (max 255 chars):"}
            </span>
            <input
              type="text"
              maxLength={255}
              readOnly={!isEditing}
              value={isEditing ? gioiThieuNgan : (profile?.gioiThieuNgan || "")}
              onChange={(e) => setGioiThieuNgan(e.target.value)}
              placeholder={
                isEditing
                  ? (lang === "vi"
                      ? "Ví dụ: Hơn 10 năm kinh nghiệm điều trị tim mạch..."
                      : "e.g. Over 10 years of experience...")
                  : (lang === "vi"
                      ? "Chưa có lời tự giới thiệu ngắn"
                      : "No short bio provided")
              }
              style={{
                background: isEditing ? "#fff" : "#f8faf9",
                borderColor: isEditing ? "var(--teal)" : "#e2e8f0",
                cursor: isEditing ? "text" : "default",
                color: isEditing ? "var(--navy)" : "#33443d",
                transition: "all 0.2s ease",
              }}
            />
          </label>

          <label className={styles.field}>
            <span>
              {lang === "vi" ? "Tiểu sử chi tiết & Quá trình công tác:" : "Full Biography:"}
            </span>
            <textarea
              rows={4}
              readOnly={!isEditing}
              value={isEditing ? tieuSu : (profile?.tieuSu || "")}
              onChange={(e) => setTieuSu(e.target.value)}
              placeholder={
                isEditing
                  ? (lang === "vi"
                      ? "Tóm tắt kinh nghiệm, triết lý chăm sóc bệnh nhân..."
                      : "Summary of clinical philosophy and experience...")
                  : (lang === "vi"
                      ? "Chưa có thông tin tiểu sử chi tiết"
                      : "No biography provided")
              }
              style={{
                background: isEditing ? "#fff" : "#f8faf9",
                borderColor: isEditing ? "var(--teal)" : "#e2e8f0",
                cursor: isEditing ? "text" : "default",
                color: isEditing ? "var(--navy)" : "#33443d",
                lineHeight: 1.6,
                transition: "all 0.2s ease",
              }}
            />
          </label>

          {/* Ngôn ngữ tư vấn */}
          <div>
            <span
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--navy)",
                marginBottom: "6px",
              }}
            >
              {lang === "vi" ? "Ngôn ngữ tư vấn:" : "Consultation Languages:"}
            </span>
            {isEditing && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleAddLanguage(e.target.value);
                  }}
                  style={{
                    maxWidth: "220px",
                    padding: "6px 10px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    border: "1px solid var(--line)",
                  }}
                >
                  <option value="" disabled>
                    {lang === "vi" ? "+ Chọn ngôn ngữ" : "+ Select language"}
                  </option>
                  {AVAILABLE_LANGUAGES.filter((al) => !languages.includes(al.code)).map((al) => (
                    <option key={al.code} value={al.code}>
                      {lang === "vi" ? al.labelVi : al.labelEn}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ngonNguInput}
                  onChange={(e) => setNgonNguInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                  placeholder={
                    lang === "vi"
                      ? "Hoặc nhập mã ISO / tên khác..."
                      : "Or type code/name..."
                  }
                  style={{
                    maxWidth: "200px",
                    padding: "6px 10px",
                    fontSize: "13px",
                  }}
                />
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => handleAddLanguage()}
                >
                  <Plus size={14} aria-hidden="true" />
                  {lang === "vi" ? "Thêm" : "Add"}
                </button>
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {(isEditing ? languages : (profile?.ngonNguKham && profile.ngonNguKham.length > 0 ? profile.ngonNguKham : ["vi"])).map((l, i) => {
                const norm = normalizeLanguageCode(l);
                const label = getLanguageLabel(norm, lang);
                return (
                  <span
                    key={i}
                    style={{
                      background: "#e4f3ee",
                      color: "#12634d",
                      padding: "4px 10px",
                      borderRadius: "14px",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {label}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(l)}
                        style={{
                          background: "transparent",
                          border: 0,
                          color: "#9e2e25",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                        }}
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Giải thưởng & Danh hiệu */}
          <div>
            <span
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--navy)",
                marginBottom: "6px",
              }}
            >
              {lang === "vi"
                ? "Giải thưởng & Danh hiệu:"
                : "Awards & Honors:"}
            </span>
            {isEditing && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="text"
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAward();
                    }
                  }}
                  placeholder={
                    lang === "vi"
                      ? "Nhập giải thưởng, danh hiệu..."
                      : "Type award title..."
                  }
                  style={{ flex: 1, padding: "6px 10px", fontSize: "13px" }}
                />
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleAddAward}
                >
                  <Plus size={14} aria-hidden="true" />
                  {lang === "vi" ? "Thêm" : "Add"}
                </button>
              </div>
            )}
            {((isEditing ? awards : profile?.giaiThuong) || []).length > 0 ? (
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: "6px",
                }}
              >
                {((isEditing ? awards : profile?.giaiThuong) || []).map((a, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "#f9fafb",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span>{a}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAward(i)}
                        style={{
                          background: "transparent",
                          border: 0,
                          color: "#9e2e25",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ink-soft)" }}>
                <em>{lang === "vi" ? "Chưa có mục giải thưởng" : "No awards listed"}</em>
              </p>
            )}
          </div>

          {/* Công trình nghiên cứu */}
          <div>
            <span
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--navy)",
                marginBottom: "6px",
              }}
            >
              {lang === "vi"
                ? "Công trình nghiên cứu & Xuất bản:"
                : "Research & Publications:"}
            </span>
            {isEditing && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="text"
                  value={newResearch}
                  onChange={(e) => setNewResearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddResearch();
                    }
                  }}
                  placeholder={
                    lang === "vi"
                      ? "Nhập tên bài báo, đề tài..."
                      : "Type research paper or article..."
                  }
                  style={{ flex: 1, padding: "6px 10px", fontSize: "13px" }}
                />
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleAddResearch}
                >
                  <Plus size={14} aria-hidden="true" />
                  {lang === "vi" ? "Thêm" : "Add"}
                </button>
              </div>
            )}
            {((isEditing ? researchList : profile?.congTrinhNghienCuu) || []).length > 0 ? (
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: "6px",
                }}
              >
                {((isEditing ? researchList : profile?.congTrinhNghienCuu) || []).map((r, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "#f9fafb",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span>{r}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveResearch(i)}
                        style={{
                          background: "transparent",
                          border: 0,
                          color: "#9e2e25",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ink-soft)" }}>
                <em>{lang === "vi" ? "Chưa có công trình nghiên cứu" : "No research listed"}</em>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Card 3: Work & Activity Photos */}
      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>
              {lang === "vi"
                ? "Hình ảnh hoạt động & Phòng khám"
                : "Work & Clinic Photos"}
            </h2>
            <p>
              {lang === "vi"
                ? "Thêm hình ảnh hoạt động chuyên môn, phòng làm việc để bệnh nhân tin cậy hơn."
                : "Upload photos of clinical work and practice to build patient trust."}
            </p>
          </div>
        </div>

        {/* Upload box */}
        <div
          style={{
            margin: "14px 0",
            padding: "14px",
            border: "1px dashed var(--line)",
            borderRadius: "8px",
            background: "#fbfcfc",
            display: "grid",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder={
                lang === "vi"
                  ? "Nhập chú thích ảnh (ví dụ: Bàn làm việc, Buổi hội chẩn...)"
                  : "Photo caption (e.g., Examination room, Consultation...)"
              }
              style={{
                flex: 1,
                minWidth: "220px",
                padding: "8px 12px",
                fontSize: "13px",
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleUploadImage}
              disabled={uploadingImage}
            />
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              <UploadCloud size={15} aria-hidden="true" />
              {uploadingImage
                ? lang === "vi"
                  ? "Đang tải lên..."
                  : "Uploading..."
                : lang === "vi"
                  ? "Chọn và tải ảnh"
                  : "Choose & Upload"}
            </button>
          </div>
        </div>

        {/* Photos grid */}
        {profile?.anh && profile.anh.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "14px",
              marginTop: "12px",
            }}
          >
            {profile.anh.map((photo: AnhBacSiResponse) => (
              <div
                key={photo.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "130px",
                    background: "#edf0ef",
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.chuThich || "Doctor photo"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      background:
                        photo.loai === "CHUNG_CHI" ? "#0369a1" : "#12634d",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle2 size={10} aria-hidden="true" />
                    {photo.loai === "CHUNG_CHI"
                      ? lang === "vi"
                        ? "Chứng chỉ"
                        : "Certificate"
                      : lang === "vi"
                        ? "Hoạt động"
                        : "Practice"}
                  </span>
                </div>
                <div
                  style={{
                    padding: "8px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "6px",
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#33443d",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {photo.chuThich ||
                      (lang === "vi" ? "Ảnh hoạt động" : "Work photo")}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleStartEditPhoto(photo)}
                      title={lang === "vi" ? "Sửa chú thích" : "Edit caption"}
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "#0369a1",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePhotoId(photo.id)}
                      title={lang === "vi" ? "Xóa ảnh" : "Delete photo"}
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "#9e2e25",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--ink-soft)",
              fontSize: "13px",
            }}
          >
            <ImageIcon
              size={32}
              style={{
                margin: "0 auto 8px",
                color: "#ccd3d0",
                display: "block",
              }}
              aria-hidden="true"
            />
            {lang === "vi"
              ? "Chưa có hình ảnh hoạt động nào được tải lên."
              : "No work or clinic photos uploaded yet."}
          </div>
        )}
      </section>

      {/* Modal sửa chú thích ảnh */}
      {editingPhoto && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !savingCaption) setEditingPhoto(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Pencil size={16} className="text-blue-600" />
                {lang === "vi" ? "Sửa chú thích ảnh" : "Edit Photo Caption"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                disabled={savingCaption}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={editingPhoto.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Chú thích (Tiếng Việt)" : "Caption (Vietnamese)"}
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder={lang === "vi" ? "Ví dụ: Phòng khám chuyên khoa..." : "E.g. Examination room..."}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  disabled={savingCaption}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Chú thích (Tiếng Anh - Tùy chọn)" : "Caption (English - Optional)"}
                </label>
                <input
                  type="text"
                  value={editCaptionEn}
                  onChange={(e) => setEditCaptionEn(e.target.value)}
                  placeholder="E.g. Clinical consultation room..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  disabled={savingCaption}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  disabled={savingCaption}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  {lang === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotoCaption}
                  disabled={savingCaption}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {savingCaption && <Loader2 size={13} className="animate-spin" />}
                  {lang === "vi" ? "Lưu thay đổi" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Dialog for Photo Deletion */}
      <ConfirmDialog
        isOpen={confirmDeletePhotoId !== null}
        title={lang === "vi" ? "Xác nhận xóa ảnh" : "Confirm Delete Photo"}
        message={
          lang === "vi"
            ? "Bạn có chắc chắn muốn xóa ảnh hoạt động này khỏi hồ sơ làm việc? Thao tác này không thể hoàn tác."
            : "Are you sure you want to delete this photo from your professional profile? This action cannot be undone."
        }
        confirmLabel={lang === "vi" ? "Xóa ảnh" : "Delete Photo"}
        cancelLabel={lang === "vi" ? "Hủy" : "Cancel"}
        variant="danger"
        isLoading={isDeletingPhoto}
        onConfirm={() => void executeDeleteImage()}
        onCancel={() => setConfirmDeletePhotoId(null)}
      />
    </section>
  );
}
