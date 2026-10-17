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
import type {
  HoSoBacSiQuanTriResponse,
  AnhBacSiResponse,
} from "@/types/catalog.type";
import styles from "../../DoctorWorkspace.module.css";

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
      setLanguages(profile.ngonNguKham || ["Tiếng Việt"]);
      setAwards(profile.giaiThuong || []);
      setResearchList(profile.congTrinhNghienCuu || []);
    }
    setIsEditing(true);
  };

  // Mutation to update self-profile
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const phienBan = profile?.phienBanHoSo ?? 1;
      return doctorService.capNhatHoSoBacSiToi({
        phienBan,
        gioiThieuNgan: gioiThieuNgan.trim() || null,
        tieuSu: tieuSu.trim() || null,
        ngonNguKham: languages.length > 0 ? languages : undefined,
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
  const handleAddLanguage = () => {
    const trimmed = ngonNguInput.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
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

  // Handle delete image
  const handleDeleteImage = async (idAnh: number) => {
    if (
      !window.confirm(
        lang === "vi"
          ? "Bạn có chắc chắn muốn xóa ảnh này?"
          : "Are you sure you want to delete this photo?",
      )
    ) {
      return;
    }

    try {
      const res = await doctorService.xoaAnhToi(idAnh);
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
          {!isEditing ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleStartEdit}
            >
              <Edit3 size={15} aria-hidden="true" />
              {lang === "vi" ? "Chỉnh sửa tự giới thiệu" : "Edit Bio & Intro"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsEditing(false)}
                disabled={updateProfileMutation.isPending}
              >
                <X size={15} aria-hidden="true" />
                {lang === "vi" ? "Hủy" : "Cancel"}
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => updateProfileMutation.mutate()}
                disabled={updateProfileMutation.isPending}
              >
                <Save size={15} aria-hidden="true" />
                {updateProfileMutation.isPending
                  ? lang === "vi"
                    ? "Đang lưu..."
                    : "Saving..."
                  : lang === "vi"
                    ? "Lưu thay đổi"
                    : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card 1: Admin Managed Credentials (Read-only) */}
      <section className={styles.panel}>
        <div className={styles.profileHeading}>
          <span className={styles.profileAvatar}>
            {(profile?.hoTen || doctorAccount?.hoTen || user?.name || "BS")
              .split(/\s+/)
              .slice(0, 2)
              .map((part: string) => part[0])
              .join("")
              .toUpperCase()}
          </span>
          <div>
            <h2>
              {profile?.hoTen ||
                doctorAccount?.hoTen ||
                user?.name ||
                (lang === "vi" ? "Bác sĩ eClinic" : "eClinic Doctor")}
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className={styles.statusBadge}>
                {profile?.trangThai === "DANG_CONG_TAC" || !profile?.trangThai
                  ? lang === "vi"
                    ? "Đang công tác"
                    : "Active"
                  : lang === "vi"
                    ? "Ngưng công tác"
                    : "Inactive"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--ink-soft)" }}>
                Mã BS: {profile?.maBacSi || "—"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ margin: "14px 0 6px" }}>
          <h3
            style={{
              fontSize: "13px",
              color: "var(--ink-soft)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <Lock size={13} aria-hidden="true" />
            {lang === "vi"
              ? "Thông tin thẩm định bởi Quản trị viên (Chỉ xem)"
              : "Admin-Verified Credentials (Read-Only)"}
          </h3>
        </div>

        <dl className={styles.profileGrid}>
          <div>
            <dt>{lang === "vi" ? "Email tài khoản" : "Account Email"}</dt>
            <dd>
              {profile?.email || doctorAccount?.email || user?.email || "—"}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Số điện thoại" : "Phone"}</dt>
            <dd>
              {profile?.soDienThoai ||
                doctorAccount?.soDienThoai ||
                user?.phone ||
                "—"}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Chuyên khoa" : "Specialty"}</dt>
            <dd>
              {profile?.tenChuyenKhoa ||
                doctorAccount?.bacSi?.tenChuyenKhoa ||
                user?.specialty ||
                (lang === "vi" ? "Chưa cập nhật" : "Not specified")}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Học vị / Chức vụ" : "Degree / Title"}</dt>
            <dd>
              {[profile?.hocVi, profile?.chucVu].filter(Boolean).join(" · ") ||
                doctorAccount?.bacSi?.hocVi ||
                user?.degree ||
                (lang === "vi" ? "Chưa cập nhật" : "Not specified")}
            </dd>
          </div>
          <div>
            <dt>
              {lang === "vi" ? "Chứng chỉ hành nghề" : "Practicing License"}
            </dt>
            <dd>{profile?.soGiayPhep || "—"}</dd>
          </div>
          <div>
            <dt>
              {lang === "vi" ? "Năm bắt đầu hành nghề" : "Practicing Since"}
            </dt>
            <dd>
              {profile?.namBatDauHanhNghe
                ? `${profile.namBatDauHanhNghe} (${new Date().getFullYear() - profile.namBatDauHanhNghe} ${lang === "vi" ? "năm kinh nghiệm" : "yrs experience"})`
                : profile?.soNamKinhNghiem
                  ? `${profile.soNamKinhNghiem} ${lang === "vi" ? "năm" : "years"}`
                  : "—"}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Nơi cấp giấy phép" : "License Issuer"}</dt>
            <dd>{profile?.noiCapGiayPhep || "—"}</dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Phạm vi hành nghề" : "Practicing Scope"}</dt>
            <dd>{profile?.phamViHanhNghe || "—"}</dd>
          </div>
        </dl>
      </section>

      {/* Card 2: Self-Editable Section */}
      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <h2>
              {lang === "vi"
                ? "Giới thiệu & Chuyên môn cá nhân"
                : "Biography & Expertise"}
            </h2>
            <p>
              {lang === "vi"
                ? "Thông tin này sẽ được hiển thị công khai tới bệnh nhân khi đặt lịch."
                : "This information will be displayed to patients during appointment booking."}
            </p>
          </div>
        </div>

        {!isEditing ? (
          <div style={{ display: "grid", gap: "16px", marginTop: "14px" }}>
            <div>
              <strong style={{ fontSize: "13px", color: "var(--navy)" }}>
                {lang === "vi" ? "Giới thiệu ngắn:" : "Short Bio:"}
              </strong>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "13px",
                  color: "#33443d",
                  lineHeight: 1.6,
                }}
              >
                {profile?.gioiThieuNgan || (
                  <em style={{ color: "var(--ink-soft)" }}>
                    {lang === "vi"
                      ? "Chưa có lời tự giới thiệu ngắn"
                      : "No short bio provided"}
                  </em>
                )}
              </p>
            </div>

            <div>
              <strong style={{ fontSize: "13px", color: "var(--navy)" }}>
                {lang === "vi" ? "Tiểu sử & Quá trình:" : "Full Biography:"}
              </strong>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "13px",
                  color: "#33443d",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {profile?.tieuSu || (
                  <em style={{ color: "var(--ink-soft)" }}>
                    {lang === "vi"
                      ? "Chưa có thông tin tiểu sử chi tiết"
                      : "No biography provided"}
                  </em>
                )}
              </p>
            </div>

            <div>
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--navy)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <Globe size={14} aria-hidden="true" />
                {lang === "vi" ? "Ngôn ngữ tư vấn:" : "Consultation Languages:"}
              </strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(profile?.ngonNguKham && profile.ngonNguKham.length > 0
                  ? profile.ngonNguKham
                  : ["Tiếng Việt"]
                ).map((l: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      background: "#e4f3ee",
                      color: "#12634d",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--navy)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <Award size={14} aria-hidden="true" />
                {lang === "vi"
                  ? "Giải thưởng & Danh hiệu:"
                  : "Awards & Honors:"}
              </strong>
              {profile?.giaiThuong && profile.giaiThuong.length > 0 ? (
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "18px",
                    display: "grid",
                    gap: "4px",
                    fontSize: "13px",
                    color: "#33443d",
                  }}
                >
                  {profile.giaiThuong.map((award: string, i: number) => (
                    <li key={i}>{award}</li>
                  ))}
                </ul>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "var(--ink-soft)",
                  }}
                >
                  <em>
                    {lang === "vi"
                      ? "Chưa có mục giải thưởng"
                      : "No awards listed"}
                  </em>
                </p>
              )}
            </div>

            <div>
              <strong
                style={{
                  fontSize: "13px",
                  color: "var(--navy)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <BookOpen size={14} aria-hidden="true" />
                {lang === "vi"
                  ? "Công trình nghiên cứu:"
                  : "Research & Publications:"}
              </strong>
              {profile?.congTrinhNghienCuu &&
              profile.congTrinhNghienCuu.length > 0 ? (
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "18px",
                    display: "grid",
                    gap: "4px",
                    fontSize: "13px",
                    color: "#33443d",
                  }}
                >
                  {profile.congTrinhNghienCuu.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "var(--ink-soft)",
                  }}
                >
                  <em>
                    {lang === "vi"
                      ? "Chưa có công trình nghiên cứu"
                      : "No research listed"}
                  </em>
                </p>
              )}
            </div>
          </div>
        ) : (
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
                value={gioiThieuNgan}
                onChange={(e) => setGioiThieuNgan(e.target.value)}
                placeholder={
                  lang === "vi"
                    ? "Ví dụ: Hơn 10 năm kinh nghiệm điều trị tim mạch và huyết áp..."
                    : "e.g. Over 10 years of experience in cardiology..."
                }
              />
            </label>

            <label className={styles.field}>
              <span>
                {lang === "vi" ? "Tiểu sử chi tiết:" : "Full Biography:"}
              </span>
              <textarea
                rows={4}
                value={tieuSu}
                onChange={(e) => setTieuSu(e.target.value)}
                placeholder={
                  lang === "vi"
                    ? "Tóm tắt kinh nghiệm, triết lý chăm sóc bệnh nhân..."
                    : "Summary of clinical philosophy and experience..."
                }
              />
            </label>

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
                      ? "Nhập tên ngôn ngữ (VD: Tiếng Anh) rồi bấm Thêm"
                      : "Type language and press Add"
                  }
                  style={{
                    maxWidth: "300px",
                    padding: "6px 10px",
                    fontSize: "13px",
                  }}
                />
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleAddLanguage}
                >
                  <Plus size={14} aria-hidden="true" />
                  {lang === "vi" ? "Thêm" : "Add"}
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {languages.map((l, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#e4f3ee",
                      color: "#12634d",
                      padding: "4px 10px",
                      borderRadius: "14px",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {l}
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
                  </span>
                ))}
              </div>
            </div>

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
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: "6px",
                }}
              >
                {awards.map((a, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "#f9fafb",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span>{a}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAward(i)}
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "#9e2e25",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

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
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: "6px",
                }}
              >
                {researchList.map((r, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "#f9fafb",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveResearch(i)}
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "#9e2e25",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
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
                      onClick={() => handleDeleteImage(photo.id)}
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
    </section>
  );
}
