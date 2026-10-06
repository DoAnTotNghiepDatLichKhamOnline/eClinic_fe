import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { doctors } from "@/features/landing/components/doctors/doctors.data";
import styles from "./DoctorPages.module.css";

export function DoctorDetailPage() {
  const { doctorId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const doctor = doctors.find((item) => item.id === doctorId);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <Container>
          <Link to="/doctors" className={styles.backLink}>
            <ArrowLeft size={15} aria-hidden="true" />
            {t({ en: "All doctors", vi: "Danh sách bác sĩ" })}
          </Link>
          {doctor ? (
            <div className={styles.profile}>
              <img
                className={styles.profilePhoto}
                src={doctor.image}
                alt={t(doctor.name)}
              />
              <div className={styles.profileInfo}>
                <p className={styles.eyebrow}>
                  {t({ en: "Doctor profile", vi: "Hồ sơ bác sĩ" })}
                </p>
                <h1 className={styles.profileName}>{t(doctor.name)}</h1>
                <p className={styles.profileRole}>{t(doctor.role)}</p>
                <span className={styles.badge}>{t(doctor.specialty)}</span>
                <div className={styles.details}>
                  <div className={styles.detail}>
                    <span>{t({ en: "Qualification", vi: "Học vị" })}</span>
                    <strong>
                      {t({ en: "To be updated", vi: "Đang cập nhật" })}
                    </strong>
                  </div>
                  <div className={styles.detail}>
                    <span>{t({ en: "Experience", vi: "Kinh nghiệm" })}</span>
                    <strong>
                      {t({ en: "To be updated", vi: "Đang cập nhật" })}
                    </strong>
                  </div>
                  <div className={styles.detail}>
                    <span>{t({ en: "Clinic", vi: "Phòng khám" })}</span>
                    <strong>{t(doctor.location)}</strong>
                  </div>
                  <div className={styles.detail}>
                    <span>{t({ en: "Languages", vi: "Ngôn ngữ" })}</span>
                    <strong>{t(doctor.languages)}</strong>
                  </div>
                </div>
                <h2 className={styles.bioTitle}>
                  {t({ en: "Biography", vi: "Tiểu sử" })}
                </h2>
                <p className={styles.bio}>
                  {t(doctor.role)}.{" "}
                  {t({
                    en: "Detailed professional biography will be updated by the clinic.",
                    vi: "Thông tin tiểu sử chuyên môn chi tiết sẽ được phòng khám cập nhật.",
                  })}
                </p>
                <h2 className={styles.bioTitle}>
                  {t({ en: "Working hours", vi: "Thời gian làm việc" })}
                </h2>
                <div className={styles.schedule}>
                  <div className={styles.scheduleRow}>
                    <span>
                      {t({ en: "Available schedule", vi: "Lịch khám" })}
                    </span>
                    <span>
                      {t({ en: "To be updated", vi: "Đang cập nhật" })}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.bookButton}
                  onClick={() =>
                    navigate("/appointment", { state: { doctorId: doctor.id } })
                  }
                >
                  <CalendarDays size={16} aria-hidden="true" />
                  {t({ en: "Book an appointment", vi: "Đặt lịch khám" })}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.empty} role="status">
              {t({
                en: "Doctor profile not found.",
                vi: "Không tìm thấy hồ sơ bác sĩ.",
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
