import { Link } from "react-router-dom";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { specialties } from "@/features/landing/components/specialties/specialties.data";
import styles from "./DoctorPages.module.css";

export function SpecialtyDirectoryPage() {
  const { t } = useLanguage();
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
              {t({ en: "Medical specialties", vi: "Danh mục chuyên khoa" })}
            </h1>
            <p className={styles.description}>
              {t({
                en: "Browse available specialties and find doctors for your care needs.",
                vi: "Tìm hiểu các chuyên khoa và bác sĩ phù hợp với nhu cầu chăm sóc sức khỏe.",
              })}
            </p>
          </div>
          <div className={styles.specialtyGrid}>
            {specialties.map((specialty) => {
              const Icon = specialty.icon;
              return (
                <Link
                  className={styles.specialtyLink}
                  to={`/doctors?specialty=${encodeURIComponent(t(specialty.name))}`}
                  key={specialty.id}
                >
                  <span
                    className={styles.specialtyIcon}
                    style={{ backgroundColor: specialty.tint }}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                  <strong>{t(specialty.name)}</strong>
                  <span>{t(specialty.description ?? specialty.items[0])}</span>
                </Link>
              );
            })}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
