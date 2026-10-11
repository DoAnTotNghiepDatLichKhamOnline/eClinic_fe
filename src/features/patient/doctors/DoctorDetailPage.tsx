import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Star,
  GraduationCap,
  Building2,
  Stethoscope,
  Award,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  PhoneCall,
  X,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useChiTietBacSi } from "@/hooks/useCatalog";
import type { AnhBacSiResponse } from "@/types/catalog.type";
import defaultDoctorAvatar from "@/features/landing/assets/images/doctors/doctor-rafi-kot.jpg";
import styles from "./DoctorPages.module.css";

export function DoctorDetailPage() {
  const { doctorId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Modal xem ảnh chứng chỉ / công tác phóng to
  const [selectedImage, setSelectedImage] = useState<AnhBacSiResponse | null>(null);

  const idNumber = Number(doctorId);
  const { bacSi: doctor, isLoading, isError, refetch } = useChiTietBacSi(
    Number.isNaN(idNumber) ? undefined : idNumber
  );

  const handleBook = () => {
    if (!doctor) return;
    navigate("/appointment", {
      state: {
        doctorId: doctor.id,
        doctorName: doctor.hoTen,
        specialtyId: doctor.idChuyenKhoa,
        specialtyName: doctor.tenChuyenKhoa,
      },
    });
  };

  const displayName = doctor
    ? doctor.hocVi
      ? `${doctor.hocVi} ${doctor.hoTen}`
      : doctor.hoTen
    : "";

  const maBacSiDisplay = doctor
    ? `BS${String(doctor.id).padStart(4, "0")}`
    : "";

  return (
    <>
      <Header />
      <main className={styles.page}>
        <Container>
          <Link to="/doctors" className={styles.backLink}>
            <ArrowLeft size={15} aria-hidden="true" />
            {t({ en: "All doctors", vi: "Danh sách bác sĩ" })}
          </Link>

          {isLoading ? (
            <div style={{ display: "grid", gap: "24px", padding: "20px 0" }}>
              <div className={styles.skeletonCard} style={{ height: "320px" }} />
              <div className={styles.skeletonCard} style={{ height: "200px" }} />
            </div>
          ) : isError ? (
            <div className={styles.errorBox}>
              <p>
                {t({
                  en: "Failed to load doctor profile. Please try again.",
                  vi: "Không thể tải thông tin chi tiết của bác sĩ. Vui lòng thử lại.",
                })}
              </p>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => refetch()}
              >
                <RotateCcw size={14} style={{ display: "inline", marginRight: "6px" }} />
                {t({ en: "Retry", vi: "Thử lại" })}
              </button>
            </div>
          ) : doctor ? (
            <div className={styles.profile}>
              {/* SIDEBAR BÊN TRÁI: ẢNH VÀ THẺ TÓM TẮT & NÚT ĐẶT LỊCH */}
              <div className={styles.profileSidebar}>
                <div style={{ position: "relative" }}>
                  <img
                    className={styles.profilePhoto}
                    src={doctor.anhDaiDien || defaultDoctorAvatar}
                    alt={displayName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultDoctorAvatar;
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      background: "rgba(26, 122, 103, 0.9)",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {doctor.tenChuyenKhoa}
                  </span>
                </div>

                {/* Thẻ thao tác đặt khám nhanh */}
                <div className={styles.sidebarCard}>
                  <button
                    type="button"
                    className={styles.bookButton}
                    onClick={handleBook}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      fontSize: "14px",
                      padding: "12px",
                    }}
                  >
                    <CalendarDays size={18} aria-hidden="true" />
                    {t({ en: "Book appointment", vi: "Đặt lịch khám" })}
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "14px",
                      fontSize: "12px",
                      color: "#5b6d64",
                    }}
                  >
                    <PhoneCall size={14} color="#1a7a67" />
                    <span>
                      {t({ en: "Consultation hotline: ", vi: "Hỗ trợ đặt hẹn: " })}
                      <strong style={{ color: "#1a7a67" }}>1900 1234</strong>
                    </span>
                  </div>
                </div>

                {/* Thẻ thông số tóm tắt */}
                <div className={styles.sidebarCard}>
                  <h3 className={styles.sidebarCardTitle}>
                    {t({ en: "Profile Summary", vi: "Tóm tắt hồ sơ" })}
                  </h3>
                  <div className={styles.sidebarTable}>
                    <div className={styles.sidebarTableRow}>
                      <span className={styles.sidebarTableLabel}>
                        {t({ en: "Doctor Code", vi: "Mã bác sĩ" })}
                      </span>
                      <span className={styles.sidebarTableValue}>{maBacSiDisplay}</span>
                    </div>

                    <div className={styles.sidebarTableRow}>
                      <span className={styles.sidebarTableLabel}>
                        {t({ en: "Specialty", vi: "Chuyên khoa" })}
                      </span>
                      <Link
                        to={`/doctors?chuyenKhoa=${doctor.idChuyenKhoa}`}
                        className={styles.sidebarTableValue}
                        style={{ color: "#1a7a67", textDecoration: "none" }}
                      >
                        {doctor.tenChuyenKhoa}
                      </Link>
                    </div>

                    <div className={styles.sidebarTableRow}>
                      <span className={styles.sidebarTableLabel}>
                        {t({ en: "Qualification", vi: "Học vị" })}
                      </span>
                      <span className={styles.sidebarTableValue}>
                        {doctor.hocVi || t({ en: "Doctor", vi: "Bác sĩ" })}
                      </span>
                    </div>

                    <div className={styles.sidebarTableRow}>
                      <span className={styles.sidebarTableLabel}>
                        {t({ en: "Position", vi: "Chức vụ" })}
                      </span>
                      <span className={styles.sidebarTableValue}>
                        {doctor.chucVu || t({ en: "Physician", vi: "Bác sĩ điều trị" })}
                      </span>
                    </div>

                    <div className={styles.sidebarTableRow}>
                      <span className={styles.sidebarTableLabel}>
                        {t({ en: "Experience", vi: "Kinh nghiệm" })}
                      </span>
                      <span className={styles.sidebarTableValue}>
                        {typeof doctor.soNamKinhNghiem === "number" && doctor.soNamKinhNghiem > 0
                          ? `${doctor.soNamKinhNghiem} ${t({ en: "years", vi: "năm" })}`
                          : t({ en: "Updating", vi: "Đang cập nhật" })}
                      </span>
                    </div>

                    <div className={styles.sidebarTableRow}>
                      <span className={styles.sidebarTableLabel}>
                        {t({ en: "Patient Rating", vi: "Đánh giá" })}
                      </span>
                      <span className={styles.sidebarTableValue}>
                        {typeof doctor.diemDanhGia === "number" ? (
                          <span style={{ color: "#b45309", fontWeight: 700 }}>
                            ★ {doctor.diemDanhGia.toFixed(1)} / 5.0 ({doctor.soDanhGia})
                          </span>
                        ) : (
                          t({ en: "No reviews yet", vi: "Chưa có đánh giá" })
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NỘI DUNG CHI TIẾT CHÍNH BÊN PHẢI */}
              <div className={styles.profileInfo}>
                {/* 1. THẺ THÔNG TIN CHUNG */}
                <div className={styles.contentCard} style={{ marginTop: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <p className={styles.eyebrow} style={{ margin: 0 }}>
                        {t({ en: "Specialist Physician", vi: "Bác sĩ chuyên khoa" })} · {maBacSiDisplay}
                      </p>
                      <h1 className={styles.profileName} style={{ marginTop: "4px" }}>
                        {displayName}
                      </h1>
                      {doctor.chucVu && (
                        <p className={styles.profileRole}>{doctor.chucVu}</p>
                      )}
                    </div>

                    {typeof doctor.diemDanhGia === "number" && (
                      <div className={styles.ratingRow} style={{ margin: 0 }}>
                        <span className={styles.ratingStarBadge}>
                          <Star size={14} fill="currentColor" />
                          {doctor.diemDanhGia.toFixed(1)} / 5.0
                        </span>
                        <span className={styles.ratingCount}>
                          ({doctor.soDanhGia} {t({ en: "patient reviews", vi: "đánh giá" })})
                        </span>
                      </div>
                    )}
                  </div>

                  {doctor.gioiThieuNgan && (
                    <div
                      style={{
                        fontStyle: "italic",
                        color: "#354e43",
                        background: "#f6faf8",
                        margin: "18px 0 0",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "13.5px",
                        lineHeight: "1.65",
                        borderLeft: "4px solid var(--teal, #1a7a67)",
                      }}
                    >
                      "{doctor.gioiThieuNgan}"
                    </div>
                  )}

                  {/* Lưới 4 chỉ số nổi bật */}
                  <div className={styles.details} style={{ marginBottom: 0 }}>
                    <div className={styles.detail}>
                      <span>{t({ en: "Qualification", vi: "Học vị" })}</span>
                      <strong>{doctor.hocVi || t({ en: "Doctor", vi: "Bác sĩ" })}</strong>
                    </div>
                    <div className={styles.detail}>
                      <span>{t({ en: "Specialty", vi: "Chuyên khoa" })}</span>
                      <strong>{doctor.tenChuyenKhoa}</strong>
                    </div>
                    <div className={styles.detail}>
                      <span>{t({ en: "Experience", vi: "Kinh nghiệm" })}</span>
                      <strong>
                        {typeof doctor.soNamKinhNghiem === "number" && doctor.soNamKinhNghiem > 0
                          ? `${doctor.soNamKinhNghiem} ${t({ en: "years", vi: "năm công tác" })}`
                          : t({ en: "Updating", vi: "Đang cập nhật" })}
                      </strong>
                    </div>
                    <div className={styles.detail}>
                      <span>{t({ en: "Position", vi: "Chức vụ hiện tại" })}</span>
                      <strong>{doctor.chucVu || t({ en: "Physician", vi: "Bác sĩ điều trị" })}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. LĨNH VỰC KHÁM & ĐIỀU TRỊ CHUYÊN SÂU */}
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionHeading} style={{ marginTop: 0 }}>
                    <Stethoscope size={19} color="#1a7a67" />
                    {t({ en: "Areas of expertise & Clinical care", vi: "Lĩnh vực khám & Điều trị chuyên sâu" })}
                  </h2>
                  {Array.isArray(doctor.linhVucKhamChua) && doctor.linhVucKhamChua.length > 0 ? (
                    <div className={styles.tagGrid}>
                      {doctor.linhVucKhamChua.map((item, idx) => (
                        <span key={idx} className={styles.tagItem}>
                          <ShieldCheck size={14} style={{ marginRight: "4px" }} />
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptyNote}>
                      {t({
                        en: `General diagnosis and treatment for all conditions under ${doctor.tenChuyenKhoa}.`,
                        vi: `Chẩn đoán và điều trị toàn diện các bệnh lý thuộc chuyên khoa ${doctor.tenChuyenKhoa}.`,
                      })}
                    </p>
                  )}
                </div>

                {/* 3. TIỂU SỬ CHUYÊN MÔN */}
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionHeading} style={{ marginTop: 0 }}>
                    <Award size={19} color="#1a7a67" />
                    {t({ en: "Biography & Professional Profile", vi: "Tiểu sử & Quá trình công tác chuyên môn" })}
                  </h2>
                  {doctor.tieuSu ? (
                    <p className={styles.bio} style={{ whiteSpace: "pre-line", maxWidth: "100%", margin: "8px 0 0" }}>
                      {doctor.tieuSu}
                    </p>
                  ) : (
                    <p className={styles.emptyNote}>
                      {t({
                        en: "Professional biography information is currently being updated by clinic administration.",
                        vi: "Thông tin tiểu sử chuyên môn đang được cập nhật bởi ban quản lý phòng khám.",
                      })}
                    </p>
                  )}
                </div>

                {/* 4. QUÁ TRÌNH ĐÀO TẠO */}
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionHeading} style={{ marginTop: 0 }}>
                    <GraduationCap size={19} color="#1a7a67" />
                    {t({ en: "Education & Qualifications", vi: "Quá trình đào tạo & Bằng cấp" })}
                  </h2>
                  {Array.isArray(doctor.quaTrinhDaoTao) && doctor.quaTrinhDaoTao.length > 0 ? (
                    <div className={styles.timeline}>
                      {doctor.quaTrinhDaoTao.map((item, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <GraduationCap size={16} className={styles.timelineIcon} />
                          <span className={styles.timelineText}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptyNote}>
                      {t({
                        en: "Education and training history is being updated.",
                        vi: "Thông tin quá trình đào tạo và bằng cấp đang được cập nhật.",
                      })}
                    </p>
                  )}
                </div>

                {/* 5. QUÁ TRÌNH CÔNG TÁC */}
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionHeading} style={{ marginTop: 0 }}>
                    <Building2 size={19} color="#1a7a67" />
                    {t({ en: "Work Experience & Appointments", vi: "Quá trình công tác & Kinh nghiệm làm việc" })}
                  </h2>
                  {Array.isArray(doctor.quaTrinhCongTac) && doctor.quaTrinhCongTac.length > 0 ? (
                    <div className={styles.timeline}>
                      {doctor.quaTrinhCongTac.map((item, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <Building2 size={16} className={styles.timelineIcon} />
                          <span className={styles.timelineText}>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptyNote}>
                      {t({
                        en: "Currently working and practicing at eClinic medical network.",
                        vi: "Hiện đang trực tiếp khám và điều trị tại hệ thống phòng khám eClinic.",
                      })}
                    </p>
                  )}
                </div>

                {/* 6. CHỨNG CHỈ Y KHOA & HÌNH ẢNH HOẠT ĐỘNG */}
                <div className={styles.contentCard}>
                  <h2 className={styles.sectionHeading} style={{ marginTop: 0 }}>
                    <ImageIcon size={19} color="#1a7a67" />
                    {t({ en: "Certificates & Work photos", vi: "Chứng chỉ y khoa & Hình ảnh hoạt động" })}
                  </h2>
                  {Array.isArray(doctor.anh) && doctor.anh.length > 0 ? (
                    <div className={styles.galleryGrid}>
                      {doctor.anh.map((item) => (
                        <div
                          key={item.id}
                          className={styles.galleryCard}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedImage(item)}
                          title={t({ en: "Click to enlarge", vi: "Nhấp để xem ảnh lớn" })}
                        >
                          <div style={{ position: "relative" }}>
                            <img
                              src={item.url}
                              alt={item.chuThich || "Hình ảnh bác sĩ"}
                              className={styles.galleryImg}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultDoctorAvatar;
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                bottom: "6px",
                                right: "6px",
                                background: "rgba(0, 0, 0, 0.6)",
                                color: "#fff",
                                borderRadius: "4px",
                                padding: "2px 6px",
                                fontSize: "10px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <ExternalLink size={10} />
                              {t({ en: "View", vi: "Xem" })}
                            </span>
                          </div>
                          <div className={styles.galleryCaption}>
                            <span className={styles.galleryTypeBadge}>
                              {item.loai === "CHUNG_CHI"
                                ? t({ en: "Medical Certificate", vi: "Chứng chỉ y khoa" })
                                : t({ en: "Work Activity", vi: "Hình ảnh công tác" })}
                            </span>
                            {item.chuThich && (
                              <p style={{ margin: "2px 0 0", color: "#33473c" }}>
                                {item.chuThich}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptyNote}>
                      {t({
                        en: "Certificates and work activity photos are being updated.",
                        vi: "Hình ảnh chứng chỉ và hoạt động đang được ban quản lý cập nhật.",
                      })}
                    </p>
                  )}
                </div>

                {/* THẺ CUỐI: ĐẶT LỊCH KHÁM NGAY */}
                <div
                  className={styles.contentCard}
                  style={{
                    background: "linear-gradient(135deg, #f0f7f4 0%, #e8f4ef 100%)",
                    borderColor: "#b6d8cb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, color: "var(--navy)", fontSize: "16px", fontWeight: 700 }}>
                      {t({ en: "Ready to schedule a consultation?", vi: "Bạn muốn đặt lịch khám với bác sĩ?" })}
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#4f655b", fontSize: "13px" }}>
                      {t({
                        en: "Select a convenient time slot and book quickly online.",
                        vi: "Chủ động chọn thời gian khám phù hợp, không cần chờ đợi tại quầy tiếp đón.",
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.bookButton}
                    onClick={handleBook}
                    style={{ fontSize: "14px", padding: "12px 24px" }}
                  >
                    <CalendarDays size={18} aria-hidden="true" />
                    {t({ en: "Book now", vi: "Đặt lịch ngay" })}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.empty} role="status">
              {t({
                en: "Doctor profile not found.",
                vi: "Không tìm thấy thông tin hồ sơ bác sĩ.",
              })}
            </div>
          )}
        </Container>
      </main>

      {/* LIGHTBOX MODAL PHÓNG TO ẢNH CHỨNG CHỈ / HOẠT ĐỘNG */}
      {selectedImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setSelectedImage(null)}
              aria-label={t({ en: "Close", vi: "Đóng" })}
            >
              <X size={18} />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.chuThich || "Ảnh chứng chỉ"}
              className={styles.lightboxImg}
            />
            <div className={styles.lightboxFooter}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#1a7a67",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {selectedImage.loai === "CHUNG_CHI"
                  ? t({ en: "Medical Certificate", vi: "Chứng chỉ y khoa" })
                  : t({ en: "Work Activity", vi: "Ảnh công tác" })}
              </span>
              {selectedImage.chuThich && (
                <p style={{ margin: 0, fontWeight: 500 }}>{selectedImage.chuThich}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
