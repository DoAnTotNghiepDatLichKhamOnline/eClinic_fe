import { Link } from "react-router-dom";
import { Container } from "@/shared/components/layout/Container";
import { SectionHead } from "@/shared/components/ui/SectionHead";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useDanhSachChuyenKhoa } from "@/hooks/useCatalog";
import { specialtiesContent } from "./specialties.data";
import { SpecialtyCard } from "./SpecialtyCard";
import styles from "./SpecialtiesSection.module.css";

export function SpecialtiesSection({
  featured = false,
}: {
  featured?: boolean;
}) {
  const { t } = useLanguage();
  const { danhSach: specialties, isLoading } = useDanhSachChuyenKhoa({
    kichThuoc: featured ? 4 : 8,
  });

  return (
    <section className={styles.section} id="specialties">
      <Container>
        <SectionHead
          title={t(specialtiesContent.title)}
          description={t(specialtiesContent.description)}
        />

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: featured ? 4 : 8 }).map((_, index) => (
              <div
                key={index}
                style={{
                  height: "220px",
                  borderRadius: "12px",
                  background: "linear-gradient(90deg, #eef2ef 25%, #f5f8f5 50%, #eef2ef 75%)",
                  backgroundSize: "200% 100%",
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {specialties.map((specialty) => (
              <SpecialtyCard
                specialty={specialty}
                featured={featured}
                key={specialty.id}
              />
            ))}
          </div>
        )}

        {featured && (
          <Link className={styles.viewAll} to="/specialties">
            {t({ en: "View all specialties", vi: "Xem tất cả chuyên khoa" })}
          </Link>
        )}
      </Container>
    </section>
  );
}
