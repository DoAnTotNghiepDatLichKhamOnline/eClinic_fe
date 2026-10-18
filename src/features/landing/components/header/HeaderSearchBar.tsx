import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, Stethoscope, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useDanhSachBacSi, useDanhSachChuyenKhoa } from "@/hooks/useCatalog";
import defaultDoctorAvatar from "@/features/landing/assets/images/doctors/doctor-rafi-kot.jpg";
import styles from "./HeaderSearchBar.module.css";

export function HeaderSearchBar() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Handle outside click & escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fetch search results from catalog API
  const { danhSach: matchedDoctors } = useDanhSachBacSi({
    tuKhoa: debouncedQuery || undefined,
    kichThuoc: 4,
  });

  const { danhSach: matchedSpecialties } = useDanhSachChuyenKhoa({
    tuKhoa: debouncedQuery || undefined,
    kichThuoc: 3,
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    setOpen(false);
    navigate(`/doctors?query=${encodeURIComponent(inputValue.trim())}`);
  };

  const handleSelectDoctor = (doctorId: number) => {
    setOpen(false);
    navigate(`/doctors/${doctorId}`);
  };

  const handleSelectSpecialty = (chuyenKhoaId: number) => {
    setOpen(false);
    navigate(`/doctors?chuyenKhoa=${chuyenKhoaId}`);
  };

  const handleClear = () => {
    setInputValue("");
    setDebouncedQuery("");
  };

  const hasResults =
    debouncedQuery.length > 0 &&
    (matchedDoctors.length > 0 || matchedSpecialties.length > 0);
  const isTyping = inputValue.trim().length > 0;

  return (
    <div ref={containerRef} className={styles.searchContainer}>
      <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
        <Search className={styles.searchIcon} size={16} aria-hidden="true" />
        <input
          type="text"
          className={styles.searchInput}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (inputValue.trim()) setOpen(true);
          }}
          placeholder={
            lang === "vi" ? "Tìm bác sĩ, chuyên khoa..." : "Search doctors, specialties..."
          }
          aria-label={
            lang === "vi" ? "Tìm kiếm bác sĩ hoặc chuyên khoa" : "Search doctors or specialties"
          }
        />
        {inputValue && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label={lang === "vi" ? "Xóa tìm kiếm" : "Clear search"}
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </form>

      {open && isTyping && (
        <div className={styles.resultsDropdown}>
          {hasResults ? (
            <>
              {matchedDoctors.length > 0 && (
                <div>
                  <div className={styles.sectionHeader}>
                    {lang === "vi" ? "Bác sĩ" : "Doctors"}
                  </div>
                  {matchedDoctors.map((doc) => {
                    const docName = doc.hocVi ? `${doc.hocVi} ${doc.hoTen}` : doc.hoTen;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        className={styles.resultItem}
                        onClick={() => handleSelectDoctor(doc.id)}
                      >
                        <img
                          src={doc.anhDaiDien || defaultDoctorAvatar}
                          alt=""
                          className={styles.doctorAvatar}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultDoctorAvatar;
                          }}
                        />
                        <div className={styles.resultText}>
                          <span className={styles.resultTitle}>{docName}</span>
                          <span className={styles.resultSub}>
                            {doc.tenChuyenKhoa}
                            {doc.chucVu ? ` • ${doc.chucVu}` : ""}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchedSpecialties.length > 0 && (
                <div>
                  <div className={styles.sectionHeader}>
                    {lang === "vi" ? "Chuyên khoa" : "Specialties"}
                  </div>
                  {matchedSpecialties.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      className={styles.resultItem}
                      onClick={() => handleSelectSpecialty(spec.id)}
                    >
                      <div className={styles.specialtyBadge}>
                        <Stethoscope size={16} aria-hidden="true" />
                      </div>
                      <div className={styles.resultText}>
                        <span className={styles.resultTitle}>{spec.tenChuyenKhoa}</span>
                        <span className={styles.resultSub}>
                          {lang === "vi" ? "Xem bác sĩ chuyên khoa" : "View specialist doctors"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                className={styles.viewAllFooter}
                onClick={() => handleSubmit()}
              >
                <span>
                  {lang === "vi"
                    ? `Xem tất cả kết quả cho "${debouncedQuery || inputValue}"`
                    : `View all results for "${debouncedQuery || inputValue}"`}
                </span>
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className={styles.emptyState}>
              {lang === "vi"
                ? `Không tìm thấy bác sĩ hay chuyên khoa khớp với "${inputValue}"`
                : `No doctors or specialties found matching "${inputValue}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
