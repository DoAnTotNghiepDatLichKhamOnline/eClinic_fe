import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { DoctorCard } from "@/features/landing/components/doctors/DoctorCard";
import { doctors } from "@/features/landing/components/doctors/doctors.data";
import styles from "./DoctorPages.module.css";

const PAGE_SIZE = 10;

export function DoctorPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  // State quản lý giá trị hiển thị ngay lập tức trên input (giúp UI gõ mượt không bị giật)
  const [inputValue, setInputValue] = useState("");
  // State quản lý giá trị thực tế dùng để lọc sau khi đã debounce (độ trễ 300ms)
  const [query, setQuery] = useState("");

  const [specialty, setSpecialty] = useState(
    () => searchParams.get("specialty") ?? "all",
  );
  const [location, setLocation] = useState("all");

  // State quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  const specialties = Array.from(
    new Set(doctors.map((doctor) => t(doctor.specialty))),
  );
  const locations = Array.from(
    new Set(doctors.map((doctor) => t(doctor.location))),
  );

  // Xử lý debounce cho ô tìm kiếm (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(inputValue);
      setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Reset về trang 1 khi thay đổi chuyên khoa hoặc địa điểm
  useEffect(() => {
    setCurrentPage(1);
  }, [specialty, location]);

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

  // Tính toán danh sách bác sĩ hiển thị trên trang hiện tại (10 bác sĩ mỗi trang)
  const totalPages = Math.ceil(filteredDoctors.length / PAGE_SIZE);
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDoctors.slice(start, start + PAGE_SIZE);
  }, [filteredDoctors, currentPage]);

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
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
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
          {paginatedDoctors.length ? (
            <>
              <div className={styles.grid}>
                {paginatedDoctors.map((doctor) => (
                  <DoctorCard doctor={doctor} key={doctor.id} />
                ))}
              </div>

              {/* Thanh điều hướng phân trang */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "24px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={styles.secondaryButton}
                  >
                    {t({ en: "Previous", vi: "Trang trước" })}
                  </button>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      fontSize: "14px",
                    }}
                  >
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={styles.secondaryButton}
                  >
                    {t({ en: "Next", vi: "Trang sau" })}
                  </button>
                </div>
              )}
            </>
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
