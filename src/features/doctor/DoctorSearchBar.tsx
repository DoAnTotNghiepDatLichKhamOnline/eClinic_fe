import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/shared/context/LanguageContext";
import { doctorBookingService } from "@/services/booking";
import type { LichHenCuaToiResponse, TrangThaiLichHen } from "@/types/booking.type";
import styles from "./DoctorSearchBar.module.css";

export function DoctorSearchBar() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Click outside & Escape
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

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["doctor-search-appointments", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await doctorBookingService.getLichHenBacSiTheoNgay({
        tuKhoa: debouncedQuery,
      });
      const data = res?.duLieu;
      if (!data) return [];
      if ("noiDung" in data && Array.isArray(data.noiDung)) {
        return data.noiDung;
      }
      if (Array.isArray(data)) {
        return data as LichHenCuaToiResponse[];
      }
      return [];
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 30,
  });

  const handleSelect = (appointment: LichHenCuaToiResponse) => {
    setOpen(false);
    if (appointment.id) {
      navigate(`/doctor/consultation/${appointment.id}`);
      return;
    }
    const code = appointment.maTraCuu || appointment.maPhieuKham;
    navigate(`/doctor/consultation?search=${encodeURIComponent(code)}`);
  };

  const handleClear = () => {
    setInputValue("");
    setDebouncedQuery("");
  };

  const getStatusLabel = (status: TrangThaiLichHen) => {
    switch (status) {
      case "CHO_XAC_NHAN":
        return lang === "vi" ? "Chờ xác nhận" : "Pending";
      case "DA_XAC_NHAN":
        return lang === "vi" ? "Đã xác nhận" : "Confirmed";
      case "DA_HOAN_THANH":
        return lang === "vi" ? "Đã khám" : "Completed";
      case "KHONG_DEN":
        return lang === "vi" ? "Vắng mặt" : "Absent";
      case "BI_TU_CHOI":
      case "DA_HUY":
      case "DA_HUY_DO_DOI_LICH":
        return lang === "vi" ? "Đã hủy" : "Cancelled";
      default:
        return status;
    }
  };

  const getStatusClass = (status: TrangThaiLichHen) => {
    if (status === "DA_HOAN_THANH") return styles.statusDone;
    if (status === "DA_XAC_NHAN" || status === "CHO_XAC_NHAN") return styles.statusWaiting;
    return styles.statusProgress;
  };

  const isTyping = inputValue.trim().length > 0;

  return (
    <div ref={containerRef} className={styles.searchWrapper}>
      <form
        className={styles.searchForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) handleSelect(results[0]);
        }}
        role="search"
      >
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
            lang === "vi"
              ? "Tìm bệnh nhân, mã hẹn, lý do..."
              : "Search patient, ID, reason..."
          }
          aria-label={
            lang === "vi" ? "Tìm kiếm lịch hẹn bác sĩ" : "Search doctor appointments"
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
          {isLoading ? (
            <div className={styles.emptyState}>
              <Loader2 className="inline-block animate-spin mr-2" size={14} />
              {lang === "vi" ? "Đang tìm kiếm..." : "Searching..."}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className={styles.sectionHeader}>
                {lang === "vi" ? "Bệnh nhân & Lịch khám" : "Patients & Appointments"}
              </div>
              {results.map((item) => (
                <button
                  key={item.id ?? item.maPhieuKham}
                  type="button"
                  className={styles.resultItem}
                  onClick={() => handleSelect(item)}
                >
                  <div className={styles.patientMeta}>
                    <div className={styles.patientTop}>
                      <span className={styles.patientName}>{item.hoTenBenhNhan}</span>
                      <span className={styles.patientCode}>{item.maTraCuu || item.maPhieuKham}</span>
                      <span className={styles.patientTime}>
                        {item.gioKhamDuKien || `${item.gioBatDauKhung} - ${item.gioKetThucKhung}`}
                      </span>
                    </div>
                    {item.lyDoKham && (
                      <span className={styles.patientSub}>{item.lyDoKham}</span>
                    )}
                  </div>
                  <span
                    className={`${styles.statusTag} ${getStatusClass(item.trangThai)}`}
                  >
                    {getStatusLabel(item.trangThai)}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className={styles.emptyState}>
              {lang === "vi"
                ? `Không tìm thấy bệnh nhân hoặc lịch hẹn khớp với "${inputValue}"`
                : `No patients or appointments found matching "${inputValue}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
