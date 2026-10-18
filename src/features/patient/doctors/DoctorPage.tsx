import { useEffect, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Container } from "@/shared/components/layout/Container";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Header } from "@/features/landing/components/header/Header";
import { Footer } from "@/features/landing/components/footer/Footer";
import { DoctorCard } from "@/features/landing/components/doctors/DoctorCard";
import { useDanhSachBacSi, useDanhSachChuyenKhoa } from "@/hooks/useCatalog";
import styles from "./DoctorPages.module.css";

const PAGE_SIZE = 8;

export function DoctorPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query params
  const paramChuyenKhoa =
    searchParams.get("chuyenKhoa") ||
    searchParams.get("idChuyenKhoa") ||
    searchParams.get("specialty");
  const paramQuery = searchParams.get("query") || searchParams.get("tuKhoa") || "";

  // Search input state with debounce
  const [inputValue, setInputValue] = useState(paramQuery);
  const [tuKhoa, setTuKhoa] = useState(paramQuery);

  // Current page (1-based for UI display)
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch specialties for filter dropdown
  const { danhSach: danhSachChuyenKhoa } = useDanhSachChuyenKhoa({ kichThuoc: 100 });

  // Determine selected specialty ID
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | undefined>(() => {
    if (!paramChuyenKhoa) return undefined;
    const asNum = Number(paramChuyenKhoa);
    return Number.isInteger(asNum) && asNum > 0 ? asNum : undefined;
  });

  // Sync with searchParams if specialtyParam is name instead of id
  useEffect(() => {
    if (paramChuyenKhoa && danhSachChuyenKhoa.length > 0) {
      const asNum = Number(paramChuyenKhoa);
      if (Number.isInteger(asNum) && asNum > 0) {
        setSelectedSpecialtyId(asNum);
      } else {
        const found = danhSachChuyenKhoa.find(
          (ck) => ck.tenChuyenKhoa.toLowerCase() === paramChuyenKhoa.toLowerCase()
        );
        if (found) {
          setSelectedSpecialtyId(found.id);
        }
      }
    }
  }, [paramChuyenKhoa, danhSachChuyenKhoa]);

  // Sync search input if query param changes externally
  useEffect(() => {
    const currentQuery = searchParams.get("query") || searchParams.get("tuKhoa") || "";
    if (currentQuery !== tuKhoa && currentQuery !== inputValue) {
      setInputValue(currentQuery);
      setTuKhoa(currentQuery);
    }
  }, [searchParams, tuKhoa, inputValue]);

  // Debounce search input (400ms) and sync with URL searchParams
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputValue.trim();
      setTuKhoa(trimmed);
      setCurrentPage(1);

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) {
            next.set("query", trimmed);
          } else {
            next.delete("query");
            next.delete("tuKhoa");
          }
          return next;
        },
        { replace: true },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, setSearchParams]);

  // Handle specialty change
  const handleSpecialtyChange = (value: string) => {
    const newId = value === "all" ? undefined : Number(value);
    setSelectedSpecialtyId(newId);
    setCurrentPage(1);

    const newParams = new URLSearchParams(searchParams);
    if (newId) {
      newParams.set("chuyenKhoa", String(newId));
    } else {
      newParams.delete("chuyenKhoa");
      newParams.delete("idChuyenKhoa");
      newParams.delete("specialty");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Fetch doctors from catalog API
  const {
    danhSach: doctors,
    tongSoPhanTu,
    tongSoTrang,
    isLoading,
    isError,
    refetch,
  } = useDanhSachBacSi({
    idChuyenKhoa: selectedSpecialtyId,
    tuKhoa: tuKhoa || undefined,
    trang: currentPage - 1,
    kichThuoc: PAGE_SIZE,
  });

  const totalPages = Math.max(tongSoTrang, 1);

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
              {t({ en: "Find a doctor", vi: "Tìm kiếm bác sĩ" })}
            </h1>
            <p className={styles.description}>
              {t({
                en: "Explore highly qualified specialists, view professional background and book your appointment directly.",
                vi: "Tìm kiếm bác sĩ chuyên khoa giàu kinh nghiệm, xem hồ sơ chuyên môn và đặt lịch khám nhanh chóng.",
              })}
            </p>
          </div>

          <div className={styles.filters}>
            <label className={styles.field}>
              <Search aria-hidden="true" />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t({
                  en: "Search doctor name, title or keyword...",
                  vi: "Tìm theo tên bác sĩ, học vị hoặc từ khóa...",
                })}
                aria-label={t({ en: "Search doctors", vi: "Tìm bác sĩ" })}
              />
            </label>

            <label className={styles.field}>
              <select
                value={selectedSpecialtyId ?? "all"}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                aria-label={t({ en: "Filter by specialty", vi: "Lọc theo chuyên khoa" })}
              >
                <option value="all">
                  {t({ en: "All specialties", vi: "Tất cả chuyên khoa" })}
                </option>
                {danhSachChuyenKhoa.map((ck) => (
                  <option key={ck.id} value={ck.id}>
                    {ck.tenChuyenKhoa}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className={styles.count} aria-live="polite">
            {isLoading
              ? t({ en: "Loading doctors...", vi: "Đang tải danh sách bác sĩ..." })
              : `${tongSoPhanTu} ${t({ en: "doctors found", vi: "bác sĩ được tìm thấy" })}`}
          </p>

          {isLoading ? (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.skeletonCard} />
              ))}
            </div>
          ) : isError ? (
            <div className={styles.errorBox}>
              <p>
                {t({
                  en: "Failed to load doctors list. Please check connection and try again.",
                  vi: "Không thể tải danh sách bác sĩ từ hệ thống. Vui lòng thử lại.",
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
          ) : doctors.length > 0 ? (
            <>
              <div className={styles.grid}>
                {doctors.map((doctor) => (
                  <DoctorCard doctor={doctor} key={doctor.id} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={styles.secondaryButton}
                  >
                    {t({ en: "Previous", vi: "Trang trước" })}
                  </button>
                  <span className={styles.pageInfo}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                en: "No doctors found matching your criteria.",
                vi: "Không tìm thấy bác sĩ nào phù hợp với điều kiện tìm kiếm.",
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
