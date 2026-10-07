import { useNavigate } from "react-router-dom";
import { Container } from "@/shared/components/layout/Container";
import { Button } from "@/shared/components/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";
import clinicInterior from "@/features/landing/assets/images/clinic-interior.jpg";
import { heroContent } from "./hero.data";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <img
        className={styles.background}
        src={clinicInterior}
        alt="Phòng khám eClinic"
      />
      <div className={styles.overlay} />

      <Container className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.kicker}>{t(heroContent.kicker)}</p>
          <h1 className={styles.headline}>
            {t(heroContent.headline)
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
          </h1>
          <p className={styles.sub}>{t(heroContent.sub)}</p>
          <div className={styles.actions}>
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate("/appointment")}
            >
              {t(heroContent.primaryCta)}
            </Button>
            <a
              href="#centers"
              className={`btn btn-outline ${styles.lightOutline}`}
            >
              <Button
                variant="outline"
                size="lg"
                className={styles.lightOutline}
              >
                {t(heroContent.secondaryCta)}
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
