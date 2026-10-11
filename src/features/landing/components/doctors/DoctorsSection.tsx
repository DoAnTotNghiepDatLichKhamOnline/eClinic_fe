import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/layout/Container";
import { SectionHead } from "@/shared/components/ui/SectionHead";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useDanhSachBacSi, useDanhSachChuyenKhoa } from "@/hooks/useCatalog";
import { doctorsContent } from "./doctors.data";
import { DoctorCard } from "./DoctorCard";
import styles from "./DoctorsSection.module.css";

export function DoctorsSection({ featured = false }: { featured?: boolean }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [specialtyId, setSpecialtyId] = useState<number | undefined>(undefined);

  // Lấy danh mục chuyên khoa cho bộ lọc
  const { danhSach: specialties } = useDanhSachChuyenKhoa({ kichThuoc: 100 });

  // Lấy danh sách bác sĩ từ API
  const { danhSach: doctors, isLoading } = useDanhSachBacSi({
    idChuyenKhoa: specialtyId,
    tuKhoa: query.trim() || undefined,
    kichThuoc: featured ? 4 : 8,
  });

  return (
    <section className={styles.section} id="doctors">
      <Container>
        <SectionHead
          title={t(doctorsContent.title)}
          description={t(doctorsContent.description)}
        />

        {!featured && (
          <div className={styles.filters}>
            <label className={styles.searchBox}>
              <Search className={styles.searchIcon} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t(doctorsContent.searchPlaceholder)}
                aria-label={t(doctorsContent.searchPlaceholder)}
              />
            </label>
            <select
              value={specialtyId ?? "all"}
              onChange={(event) => {
                const val = event.target.value;
                setSpecialtyId(val === "all" ? undefined : Number(val));
              }}
              aria-label={t(doctorsContent.allSpecialties)}
            >
              <option value="all">{t(doctorsContent.allSpecialties)}</option>
              {specialties.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.tenChuyenKhoa}
                </option>
              ))}
            </select>
          </div>
        )}

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: featured ? 4 : 6 }).map((_, index) => (
              <div
                key={index}
                style={{
                  height: "260px",
                  borderRadius: "12px",
                  background: "linear-gradient(90deg, #eef2ef 25%, #f5f8f5 50%, #eef2ef 75%)",
                  backgroundSize: "200% 100%",
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {doctors.map((doctor) => (
              <DoctorCard doctor={doctor} key={doctor.id} />
            ))}
          </div>
        )}

        {featured && (
          <Link className={styles.viewAll} to="/doctors">
            {t({ en: "View all doctors", vi: "Xem tất cả bác sĩ" })}
          </Link>
        )}
      </Container>
    </section>
  );
}
