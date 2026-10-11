import { Link, useNavigate } from "react-router-dom";
import { Star, Award, Calendar, ChevronRight } from "lucide-react";
import type { BacSiResponse } from "@/types/catalog.type";
import { useLanguage } from "@/shared/context/LanguageContext";
import defaultDoctorAvatar from "@/features/landing/assets/images/doctors/doctor-rafi-kot.jpg";
import styles from "./DoctorCard.module.css";

interface DoctorCardProps {
  doctor: BacSiResponse;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/appointment', {
      state: {
        doctorId: doctor.id,
        doctorName: doctor.hoTen,
        specialtyId: doctor.idChuyenKhoa,
        specialtyName: doctor.tenChuyenKhoa,
      },
    });
  };

  const displayName = doctor.hocVi
    ? `${doctor.hocVi} ${doctor.hoTen}`
    : doctor.hoTen;

  return (
    <Link to={`/doctors/${doctor.id}`} className={styles.card}>
      <div className={styles.photoWrap}>
        <img
          className={styles.photo}
          src={doctor.anhDaiDien || defaultDoctorAvatar}
          alt={displayName}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultDoctorAvatar;
          }}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.nameRow}>
          <div>
            <h3 className={styles.name}>{displayName}</h3>
            {doctor.chucVu && <p className={styles.role}>{doctor.chucVu}</p>}
          </div>
          <span className={styles.badge}>{doctor.tenChuyenKhoa}</span>
        </div>

        <div className={styles.metaRow}>
          {typeof doctor.soNamKinhNghiem === 'number' && doctor.soNamKinhNghiem > 0 && (
            <span className={styles.metaItem}>
              <Award size={14} className={styles.metaIcon} />
              {doctor.soNamKinhNghiem} {t({ en: "yrs experience", vi: "năm kinh nghiệm" })}
            </span>
          )}

          {typeof doctor.diemDanhGia === 'number' && (
            <span className={styles.ratingBadge}>
              <Star size={13} className={styles.starIcon} fill="currentColor" />
              <strong>{doctor.diemDanhGia.toFixed(1)}</strong>
              <span className={styles.reviewCount}>({doctor.soDanhGia} {t({ en: "reviews", vi: "đánh giá" })})</span>
            </span>
          )}
        </div>

        {doctor.gioiThieuNgan && (
          <p className={styles.shortIntro} title={doctor.gioiThieuNgan}>
            {doctor.gioiThieuNgan}
          </p>
        )}

        <div className={styles.cardFooter}>
          <span className={styles.profileButton}>
            {t({ en: "View profile", vi: "Xem hồ sơ" })}
            <ChevronRight size={14} />
          </span>
          <button
            type="button"
            className={styles.bookButton}
            onClick={handleBook}
            title={t({ en: "Book appointment", vi: "Đặt lịch khám" })}
          >
            <Calendar size={13} />
            {t({ en: "Book", vi: "Đặt lịch" })}
          </button>
        </div>
      </div>
    </Link>
  );
}

