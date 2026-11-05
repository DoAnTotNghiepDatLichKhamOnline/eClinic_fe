import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { ChuyenKhoaResponse } from "@/types/catalog.type";
import { getSpecialtyVisual } from "@/utils/specialtyVisual";
import styles from "./SpecialtyCard.module.css";

export function SpecialtyCard({
  specialty,
  featured: _featured = false,
}: {
  specialty: ChuyenKhoaResponse;
  featured?: boolean;
}) {
  const { t } = useLanguage();
  const { icon: Icon, tint, color } = getSpecialtyVisual(specialty.tenChuyenKhoa);

  return (
    <article className={styles.card}>
      <div style={{ backgroundColor: tint, color: color, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Icon size={24} />
      </div>
      <h3>{specialty.tenChuyenKhoa}</h3>

      <p className={styles.desc}>
        {specialty.moTa ||
          t({
            en: "Comprehensive diagnosis and advanced specialized treatment.",
            vi: "Chẩn đoán và điều trị chuyên sâu, an toàn và hiệu quả cao.",
          })}
      </p>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingTop: "12px" }}>
        <Link
          className={styles.link}
          to={`/doctors?chuyenKhoa=${specialty.id}`}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            {t({ en: "View doctors", vi: "Xem danh sách bác sĩ" })}
            <ArrowRight size={13} />
          </span>
        </Link>
        <Link
          style={{
            fontSize: "12px",
            color: "var(--navy)",
            fontWeight: 600,
            textDecoration: "underline",
          }}
          to="/appointment"
          state={{ specialtyId: specialty.id, specialtyName: specialty.tenChuyenKhoa }}
        >
          {t({ en: "Book appointment", vi: "Đặt lịch khám" })}
        </Link>
      </div>
    </article>
  );
}
