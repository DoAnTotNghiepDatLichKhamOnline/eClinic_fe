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
} from "lucide-react";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useChiTietBacSi } from "@/hooks/useCatalog";
import defaultDoctorAvatar from "@/features/landing/assets/images/doctors/doctor-rafi-kot.jpg";
import styles from "./DoctorPages.module.css";

export function DoctorDetailPage() {
  const { doctorId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
              <div className={styles.skeletonCard} style={{ height: "180px" }} />
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
              <div>
                <img
                  className={styles.profilePhoto}
                  src={doctor.anhDaiDien || defaultDoctorAvatar}
                  alt={displayName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultDoctorAvatar;
                  }}
                />
              </div>

              <div className={styles.profileInfo}>
                <p className={styles.eyebrow}>
                  {t({ en: "Doctor profile", vi: "Hồ sơ bác sĩ chuyên khoa" })}
                </p>
                <h1 className={styles.profileName}>{displayName}</h1>

                {doctor.chucVu && (
                  <p className={styles.profileRole}>{doctor.chucVu}</p>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginTop: "12px" }}>
                  <span className={styles.badge}>{doctor.tenChuyenKhoa}</span>

                  {typeof doctor.diemDanhGia === "number" && (
                    <div className={styles.ratingRow} style={{ margin: 0 }}>
                      <span className={styles.ratingStarBadge}>
                        <Star size={14} fill="currentColor" />
                        {doctor.diemDanhGia.toFixed(1)} / 5.0
                      </span>
                      <span className={styles.ratingCount}>
                        ({doctor.soDanhGia} {t({ en: "patient reviews", vi: "đánh giá từ người bệnh" })})
                      </span>
                    </div>
                  )}
                </div>

                {doctor.gioiThieuNgan && (
                  <p
                    style={{
                      fontStyle: "italic",
                      color: "#4f655b",
                      margin: "14px 0 0",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      borderLeft: "3px solid var(--teal, #1a7a67)",
                      paddingLeft: "12px",
                    }}
                  >
                    "{doctor.gioiThieuNgan}"
                  </p>
                )}

                {/* Thông tin nhanh */}
                <div className={styles.details}>
                  <div className={styles.detail}>
                    <span>{t({ en: "Qualification", vi: "Học vị" })}</span>
                    <strong>{doctor.hocVi || t({ en: "Doctor", vi: "Bác sĩ" })}</strong>
                  </div>
                  <div className={styles.detail}>
                    <span>{t({ en: "Experience", vi: "Kinh nghiệm" })}</span>
                    <strong>
                      {typeof doctor.soNamKinhNghiem === "number" && doctor.soNamKinhNghiem > 0
                        ? `${doctor.soNamKinhNghiem} ${t({ en: "years", vi: "năm kinh nghiệm" })}`
                        : t({ en: "To be updated", vi: "Đang cập nhật" })}
                    </strong>
                  </div>
                  <div className={styles.detail}>
                    <span>{t({ en: "Position", vi: "Chức vụ" })}</span>
                    <strong>{doctor.chucVu || t({ en: "Physician", vi: "Bác sĩ điều trị" })}</strong>
                  </div>
                  <div className={styles.detail}>
                    <span>{t({ en: "Specialty", vi: "Chuyên khoa" })}</span>
                    <strong>{doctor.tenChuyenKhoa}</strong>
                  </div>
                </div>

                {/* Nút đặt lịch khám */}
                <div style={{ margin: "20px 0 28px" }}>
                  <button
                    type="button"
                    className={styles.bookButton}
                    onClick={handleBook}
                    style={{ fontSize: "14px", padding: "12px 24px" }}
                  >
                    <CalendarDays size={18} aria-hidden="true" />
                    {t({ en: "Book appointment with this doctor", vi: "Đặt lịch khám với bác sĩ" })}
                  </button>
                </div>

                {/* Lĩnh vực khám chữa */}
                {Array.isArray(doctor.linhVucKhamChua) && doctor.linhVucKhamChua.length > 0 && (
                  <div>
                    <h2 className={styles.sectionHeading}>
                      <Stethoscope size={18} />
                      {t({ en: "Areas of expertise", vi: "Lĩnh vực khám & điều trị" })}
                    </h2>
                    <div className={styles.tagGrid}>
                      {doctor.linhVucKhamChua.map((item, idx) => (
                        <span key={idx} className={styles.tagItem}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tiểu sử */}
                {doctor.tieuSu && (
                  <div>
                    <h2 className={styles.sectionHeading}>
                      <Award size={18} />
                      {t({ en: "Biography", vi: "Tiểu sử chuyên môn" })}
                    </h2>
                    <p className={styles.bio} style={{ whiteSpace: "pre-line" }}>
                      {doctor.tieuSu}
                    </p>
                  </div>
                )}

                {/* Quá trình đào tạo */}
                {Array.isArray(doctor.quaTrinhDaoTao) && doctor.quaTrinhDaoTao.length > 0 && (
                  <div>
                    <h2 className={styles.sectionHeading}>
                      <GraduationCap size={18} />
                      {t({ en: "Education & Training", vi: "Quá trình đào tạo" })}
                    </h2>
                    <div className={styles.timeline}>
                      {doctor.quaTrinhDaoTao.map((item, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <GraduationCap size={16} className={styles.timelineIcon} />
                          <span className={styles.timelineText}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quá trình công tác */}
                {Array.isArray(doctor.quaTrinhCongTac) && doctor.quaTrinhCongTac.length > 0 && (
                  <div>
                    <h2 className={styles.sectionHeading}>
                      <Building2 size={18} />
                      {t({ en: "Career & Experience", vi: "Quá trình công tác" })}
                    </h2>
                    <div className={styles.timeline}>
                      {doctor.quaTrinhCongTac.map((item, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <Building2 size={16} className={styles.timelineIcon} />
                          <span className={styles.timelineText}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hình ảnh công tác & Chứng chỉ */}
                {Array.isArray(doctor.anh) && doctor.anh.length > 0 && (
                  <div>
                    <h2 className={styles.sectionHeading}>
                      <ImageIcon size={18} />
                      {t({ en: "Certificates & Work photos", vi: "Chứng chỉ & Hình ảnh hoạt động" })}
                    </h2>
                    <div className={styles.galleryGrid}>
                      {doctor.anh.map((item) => (
                        <div key={item.id} className={styles.galleryCard}>
                          <img
                            src={item.url}
                            alt={item.chuThich || "Hình ảnh bác sĩ"}
                            className={styles.galleryImg}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultDoctorAvatar;
                            }}
                          />
                          <div className={styles.galleryCaption}>
                            <span className={styles.galleryTypeBadge}>
                              {item.loai === "CHUNG_CHI"
                                ? t({ en: "Certificate", vi: "Chứng chỉ y khoa" })
                                : t({ en: "Work photo", vi: "Ảnh công việc" })}
                            </span>
                            {item.chuThich && <p style={{ margin: "2px 0 0" }}>{item.chuThich}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      <Footer />
    </>
  );
}
