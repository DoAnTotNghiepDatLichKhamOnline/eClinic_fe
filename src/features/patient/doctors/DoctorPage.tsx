import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { DoctorCard } from "@/features/landing/components/doctors/DoctorCard";
import { doctors } from "@/features/landing/components/doctors/doctors.data";
import styles from "./DoctorPages.module.css";

export function DoctorPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState(
    () => searchParams.get("specialty") ?? "all",
  );
  const [location, setLocation] = useState("all");
  const specialties = Array.from(
    new Set(doctors.map((doctor) => t(doctor.specialty))),
  );
  const locations = Array.from(
    new Set(doctors.map((doctor) => t(doctor.location))),
  );

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return doctors.filter((doctor) => {
      const matchesQuery =
        !normalizedQuery ||
        [doctor.name, doctor.role, doctor.specialty, doctor.location].some(
          (value) => t(value).toLocaleLowerCase().includes(normalizedQuery),
        );
      const matchesSpecialty =
        specialty === "all" || t(doctor.specialty) === specialty;
      const matchesLocation =
        location === "all" || t(doctor.location) === location;
      return matchesQuery && matchesSpecialty && matchesLocation;
    });
  }, [location, query, specialty, t]);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <Container>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              {t({ en: "Care team", vi: "Đội ngũ y tế" })}
            </p>
            <h1 className={styles.title}>
              {t({ en: "Find a doctor", vi: "Tìm bác sĩ" })}
            </h1>
            <p className={styles.description}>
              {t({
                en: "Search by name, specialty, or location to find the right care team.",
                vi: "Tìm theo tên, chuyên khoa hoặc địa điểm để chọn bác sĩ phù hợp.",
              })}
            </p>
          </div>
          <div className={styles.filters}>
            <label className={styles.field}>
              <Search aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t({
                  en: "Doctor name or keyword",
                  vi: "Tên bác sĩ hoặc từ khóa",
                })}
                aria-label={t({ en: "Search doctors", vi: "Tìm bác sĩ" })}
              />
            </label>
            <label className={styles.field}>
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                aria-label={t({ en: "Specialty", vi: "Chuyên khoa" })}
              >
                <option value="all">
                  {t({ en: "All specialties", vi: "Tất cả chuyên khoa" })}
                </option>
                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                aria-label={t({ en: "Location", vi: "Địa điểm" })}
              >
                <option value="all">
                  {t({ en: "All locations", vi: "Tất cả địa điểm" })}
                </option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className={styles.count} aria-live="polite">
            {filteredDoctors.length} {t({ en: "doctors", vi: "bác sĩ" })}
          </p>
          {filteredDoctors.length ? (
            <div className={styles.grid}>
              {filteredDoctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor.id} />
              ))}
            </div>
          ) : (
            <div className={styles.empty} role="status">
              {t({
                en: "No related information found.",
                vi: "Không tìm thấy thông tin liên quan.",
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
