import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "./DoctorSearchBar.module.css";

interface AppointmentRecord {
  id: string;
  time: string;
  patientName: string;
  age: number;
  reason: string;
  status: "waiting" | "progress" | "done";
}

const doctorAppointmentsData: AppointmentRecord[] = [
  {
    id: "AP-101",
    time: "08:30 - 09:00",
    patientName: "Nguyễn Thị Hoa",
    age: 34,
    reason: "Khám tim mạch định kỳ",
    status: "waiting",
  },
  {
    id: "AP-102",
    time: "09:15 - 09:45",
    patientName: "Trần Văn Minh",
    age: 45,
    reason: "Tái khám huyết áp",
    status: "progress",
  },
  {
    id: "AP-103",
    time: "10:00 - 10:30",
    patientName: "Lê Hoàng Nam",
    age: 28,
    reason: "Đau ngực nhẹ",
    status: "done",
  },
  {
    id: "AP-104",
    time: "10:45 - 11:15",
    patientName: "Phạm Thu Trang",
    age: 52,
    reason: "Tư vấn xét nghiệm máu",
    status: "waiting",
  },
  {
    id: "AP-105",
    time: "14:00 - 14:30",
    patientName: "Vũ Đình Trọng",
    age: 60,
    reason: "Đo điện tâm đồ",
    status: "waiting",
  },
  {
    id: "AP-106",
    time: "15:00 - 15:30",
    patientName: "Đỗ Mai Anh",
    age: 22,
    reason: "Tư vấn dinh dưỡng",
    status: "waiting",
  },
];

export function DoctorSearchBar() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce 300ms
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

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return doctorAppointmentsData.filter(
      (item) =>
        item.patientName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  const handleSelect = (appointment: AppointmentRecord) => {
    setOpen(false);
    navigate(`/doctor/appointment-requests?search=${appointment.id}`);
  };

  const handleClear = () => {
    setInputValue("");
    setDebouncedQuery("");
  };

  const getStatusLabel = (status: AppointmentRecord["status"]) => {
    if (status === "waiting") return lang === "vi" ? "Chờ khám" : "Waiting";
    if (status === "progress") return lang === "vi" ? "Đang khám" : "In progress";
    return lang === "vi" ? "Đã khám" : "Completed";
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
          {results.length > 0 ? (
            <>
              <div className={styles.sectionHeader}>
                {lang === "vi" ? "Bệnh nhân & Lịch khám" : "Patients & Appointments"}
              </div>
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.resultItem}
                  onClick={() => handleSelect(item)}
                >
                  <div className={styles.patientMeta}>
                    <div className={styles.patientTop}>
                      <span className={styles.patientName}>{item.patientName}</span>
                      <span className={styles.patientCode}>{item.id}</span>
                      <span className={styles.patientTime}>{item.age}t • {item.time}</span>
                    </div>
                    <span className={styles.patientSub}>{item.reason}</span>
                  </div>
                  <span
                    className={`${styles.statusTag} ${
                      item.status === "waiting"
                        ? styles.statusWaiting
                        : item.status === "progress"
                        ? styles.statusProgress
                        : styles.statusDone
                    }`}
                  >
                    {getStatusLabel(item.status)}
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
