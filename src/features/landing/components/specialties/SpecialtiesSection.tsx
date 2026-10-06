import { Container } from "@/shared/components/layout/Container";
import { SectionHead } from "@/shared/components/ui/SectionHead";
import { useLanguage } from "@/shared/context/LanguageContext";
import { specialties, specialtiesContent } from "./specialties.data";
import { SpecialtyCard } from "./SpecialtyCard";
import styles from "./SpecialtiesSection.module.css";
import { Link } from "react-router-dom";

export function SpecialtiesSection({
  featured = false,
}: {
  featured?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <section className={styles.section} id="specialties">
      <Container>
        <SectionHead
          title={t(specialtiesContent.title)}
          description={t(specialtiesContent.description)}
        />

        <div className={styles.grid}>
          {(featured ? specialties.slice(0, 4) : specialties).map(
            (specialty) => (
              <SpecialtyCard specialty={specialty} key={specialty.id} />
            ),
          )}
        </div>
        {featured && (
          <Link className={styles.viewAll} to="/specialties">
            {t({ en: "View all specialties", vi: "Xem tất cả chuyên khoa" })}
          </Link>
        )}
      </Container>
    </section>
  );
}
