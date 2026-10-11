import { Link } from "react-router-dom";
import {
  Heart,
  Baby,
  Eye,
  Bone,
  Brain,
  Droplet,
  Stethoscope,
  Activity,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { ChuyenKhoaResponse } from "@/types/catalog.type";
import styles from "./SpecialtyCard.module.css";

function getSpecialtyIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("tim")) return Heart;
  if (lower.includes("nhi")) return Baby;
  if (lower.includes("mắt") || lower.includes("nhãn")) return Eye;
  if (lower.includes("xương") || lower.includes("khớp") || lower.includes("chỉnh hình")) return Bone;
  if (lower.includes("não") || lower.includes("thần kinh")) return Brain;
  if (lower.includes("da") || lower.includes("liễu")) return Droplet;
  if (lower.includes("nội") || lower.includes("tổng quát") || lower.includes("đa khoa")) return Stethoscope;
  return Activity;
}

export function SpecialtyCard({
  specialty,
  featured: _featured = false,
}: {
  specialty: ChuyenKhoaResponse;
  featured?: boolean;
}) {
  const { t } = useLanguage();
  const Icon = getSpecialtyIcon(specialty.tenChuyenKhoa);

  return (
    <article className={styles.card}>
      <Icon className={styles.icon} />
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
