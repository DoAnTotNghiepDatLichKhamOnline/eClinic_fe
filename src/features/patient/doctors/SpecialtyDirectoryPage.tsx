import { useState, useMemo } from "react";
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
  Search,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { useDanhSachChuyenKhoa } from "@/hooks/useCatalog";
import styles from "./DoctorPages.module.css";

// Helper chọn icon và màu nền theo tên chuyên khoa
function getSpecialtyVisual(tenChuyenKhoa: string) {
  const lower = tenChuyenKhoa.toLowerCase();
  if (lower.includes("tim")) {
    return { icon: Heart, tint: "#FBEAEC", color: "#e11d48" };
  }
  if (lower.includes("nhi")) {
    return { icon: Baby, tint: "#FFF6E0", color: "#d97706" };
  }
  if (lower.includes("mắt") || lower.includes("nhãn")) {
    return { icon: Eye, tint: "#E6F7F5", color: "#0d9488" };
  }
  if (lower.includes("xương") || lower.includes("khớp") || lower.includes("chỉnh hình")) {
    return { icon: Bone, tint: "#EAF1FB", color: "#2563eb" };
  }
  if (lower.includes("não") || lower.includes("thần kinh")) {
    return { icon: Brain, tint: "#F3EEE6", color: "#7c3aed" };
  }
  if (lower.includes("da") || lower.includes("liễu")) {
    return { icon: Droplet, tint: "#E9F7EF", color: "#059669" };
  }
  if (lower.includes("nội") || lower.includes("tổng quát") || lower.includes("đa khoa")) {
    return { icon: Stethoscope, tint: "#F1EEE9", color: "#475569" };
  }
  return { icon: Activity, tint: "#e8f3ef", color: "#1a7a67" };
}

export function SpecialtyDirectoryPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const { danhSach: specialties, isLoading, isError, refetch } = useDanhSachChuyenKhoa({
    kichThuoc: 100,
  });

  const filteredSpecialties = useMemo(() => {
    if (!searchTerm.trim()) return specialties;
    const q = searchTerm.trim().toLowerCase();
    return specialties.filter((item) =>
      item.tenChuyenKhoa.toLowerCase().includes(q) ||
      (item.moTa && item.moTa.toLowerCase().includes(q))
    );
  }, [specialties, searchTerm]);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <Container>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              {t({ en: "Explore care", vi: "Khám phá dịch vụ" })}
            </p>
            <h1 className={styles.title}>
              {t({ en: "Medical specialties", vi: "Danh mục chuyên khoa y tế" })}
            </h1>
            <p className={styles.description}>
              {t({
                en: "Browse all clinical specialties and discover our dedicated team of experienced doctors.",
                vi: "Tìm hiểu toàn bộ các chuyên khoa điều trị và đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm.",
              })}
            </p>
          </div>

          <div style={{ maxWidth: "420px", margin: "20px 0 28px" }}>
            <label className={styles.field}>
              <Search aria-hidden="true" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t({
                  en: "Search specialty...",
                  vi: "Tìm nhanh chuyên khoa...",
                })}
                aria-label={t({ en: "Search specialty", vi: "Tìm chuyên khoa" })}
              />
            </label>
          </div>

          {isLoading ? (
            <div className={styles.specialtyGrid}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={styles.skeletonCard}
                  style={{ height: "160px" }}
                />
              ))}
            </div>
          ) : isError ? (
            <div className={styles.errorBox}>
              <p>
                {t({
                  en: "Failed to load specialties catalog. Please try again.",
                  vi: "Không thể tải danh mục chuyên khoa. Vui lòng thử lại.",
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
          ) : filteredSpecialties.length > 0 ? (
            <div className={styles.specialtyGrid}>
              {filteredSpecialties.map((specialty) => {
                const visual = getSpecialtyVisual(specialty.tenChuyenKhoa);
                const Icon = visual.icon;
                return (
                  <Link
                    className={styles.specialtyLink}
                    to={`/doctors?chuyenKhoa=${specialty.id}`}
                    key={specialty.id}
                  >
                    <span
                      className={styles.specialtyIcon}
                      style={{ backgroundColor: visual.tint, color: visual.color }}
                    >
                      <Icon aria-hidden="true" />
                    </span>
                    <strong>{specialty.tenChuyenKhoa}</strong>
                    <span>
                      {specialty.moTa ||
                        t({
                          en: "Comprehensive diagnosis and advanced treatment.",
                          vi: "Chẩn đoán và điều trị chuyên sâu, an toàn và hiệu quả.",
                        })}
                    </span>
                    <span
                      style={{
                        marginTop: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--teal, #1a7a67)",
                      }}
                    >
                      {t({ en: "View doctors", vi: "Xem danh sách bác sĩ" })}
                      <ArrowRight size={13} />
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty} role="status">
              {t({
                en: "No specialties found matching your keyword.",
                vi: "Không tìm thấy chuyên khoa nào khớp với từ khóa.",
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
