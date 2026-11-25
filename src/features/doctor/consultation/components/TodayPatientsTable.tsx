import { useState, useEffect, useMemo } from "react";
import { Users, RotateCcw, AlertTriangle, Clock, PhoneCall } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type {
  LichHenTrongNgayItem,
  LichHenTrongNgayParams,
} from "@/types/consultation.type";
import type { TrangThaiLichHen } from "@/types/common.type";

export interface ShiftOption {
  idLichLamViec: number;
  buoi: string;
  gioBatDau: string;
  gioKetThuc: string;
  phongKham?: any;
}

interface TodayPatientsTableProps {
  patients: LichHenTrongNgayItem[];
  isLoading: boolean;
  filters: LichHenTrongNgayParams;
  onFilterChange: (filters: LichHenTrongNgayParams) => void;
  onSelectPatient: (id: number) => void;
  selectedAppointmentId?: number;
  shifts?: ShiftOption[];
  onCallNext?: () => void;
  isCallingNext?: boolean;
}

type StatusTabKey = "ALL" | "WAITING" | "IN_PROGRESS" | "DONE";

const TRANG_THAI_LABELS: Record<
  TrangThaiLichHen,
  { vi: string; en: string; color: string }
> = {
  CHO_XAC_NHAN: {
    vi: "Chờ xác nhận",
    en: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DA_XAC_NHAN: {
    vi: "Đã xác nhận",
    en: "Confirmed",
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  DA_HOAN_THANH: {
    vi: "Đã hoàn thành",
    en: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  BI_TU_CHOI: {
    vi: "Bác sĩ đã hủy",
    en: "Cancelled by Doctor",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  DA_HUY: {
    vi: "Bệnh nhân đã hủy",
    en: "Cancelled by Patient",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  DA_HUY_DO_DOI_LICH: {
    vi: "Đã đổi ca khác",
    en: "Rescheduled",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
  KHONG_DEN: {
    vi: "Không đến",
    en: "No Show",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  DA_KHAM: {
    vi: "Đã khám",
    en: "Examined",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function TodayPatientsTable({
  patients,
  isLoading,
  filters,
  onFilterChange,
  onSelectPatient,
  selectedAppointmentId,
  shifts = [],
  onCallNext,
  isCallingNext = false,
}: TodayPatientsTableProps) {
  const { lang } = useLanguage();
  const [formFilters, setFormFilters] =
    useState<LichHenTrongNgayParams>(filters);
  const [selectedTab, setSelectedTab] = useState<StatusTabKey>("ALL");

  // Keep local state in sync if parent changes filters
  useEffect(() => {
    setFormFilters(filters);
  }, [filters]);

  // Debounced search for keyword and STT
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        formFilters.tuKhoa !== filters.tuKhoa ||
        formFilters.soThuTu !== filters.soThuTu
      ) {
        onFilterChange(formFilters);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [formFilters.tuKhoa, formFilters.soThuTu]);

  const handleDateChange = (newDate: string) => {
    const updated = { ...formFilters, ngay: newDate };
    setFormFilters(updated);
    onFilterChange(updated);
  };

  const handleShiftChange = (shiftIdStr: string) => {
    const updated = {
      ...formFilters,
      idLichLamViec: shiftIdStr ? Number(shiftIdStr) : undefined,
    };
    setFormFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const defaultFilters: LichHenTrongNgayParams = {
      ngay: new Date().toISOString().split("T")[0],
      idLichLamViec: undefined,
      soThuTu: undefined,
      tuKhoa: "",
    };
    setFormFilters(defaultFilters);
    setSelectedTab("ALL");
    onFilterChange(defaultFilters);
  };

  // Status Counts
  const counts = useMemo(() => {
    const total = patients.length;
    let waiting = 0;
    let inProgress = 0;
    let done = 0;

    for (const p of patients) {
      if (p.trangThai === "DA_HOAN_THANH" || p.trangThai === "DA_KHAM") {
        done++;
      } else if (
        (p as any).trangThaiHangDoi === "DANG_KHAM" ||
        (p as any).trangThaiHangDoi === "CHO_KET_QUA_CLS"
      ) {
        inProgress++;
      } else {
        waiting++;
      }
    }
    return { total, waiting, inProgress, done };
  }, [patients]);

  // Filtered list by status tab
  const filteredPatients = useMemo(() => {
    if (selectedTab === "ALL") return patients;
    if (selectedTab === "WAITING") {
      return patients.filter(
        (p) =>
          p.trangThai !== "DA_HOAN_THANH" &&
          p.trangThai !== "DA_KHAM" &&
          (p as any).trangThaiHangDoi !== "DANG_KHAM" &&
          (p as any).trangThaiHangDoi !== "CHO_KET_QUA_CLS",
      );
    }
    if (selectedTab === "IN_PROGRESS") {
      return patients.filter(
        (p) =>
          (p as any).trangThaiHangDoi === "DANG_KHAM" ||
          (p as any).trangThaiHangDoi === "CHO_KET_QUA_CLS",
      );
    }
    if (selectedTab === "DONE") {
      return patients.filter(
        (p) => p.trangThai === "DA_HOAN_THANH" || p.trangThai === "DA_KHAM",
      );
    }
    return patients;
  }, [patients, selectedTab]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 mb-6">
      {/* Header with Title and CTA Call Next Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            {lang === "vi"
              ? "Danh sách bệnh nhân trong ngày"
              : "Today's Patient Queue"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "vi"
              ? "Lọc tự động theo ca, STT hoặc tên. Chọn bệnh nhân để mở hồ sơ khám."
              : "Live filtering by shift, queue no. or name. Click patient to examine."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onCallNext && (
            <button
              type="button"
              onClick={onCallNext}
              disabled={isCallingNext || counts.waiting === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>
                {isCallingNext
                  ? lang === "vi"
                    ? "Đang gọi..."
                    : "Calling..."
                  : lang === "vi"
                    ? "Gọi bệnh nhân tiếp theo"
                    : "Call Next Patient"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            title={lang === "vi" ? "Làm mới & đặt lại bộ lọc" : "Reset filters"}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
        <button
          type="button"
          onClick={() => setSelectedTab("ALL")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedTab === "ALL"
              ? "bg-teal-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>{lang === "vi" ? "Tất cả" : "All"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">
            {counts.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab("WAITING")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedTab === "WAITING"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>{lang === "vi" ? "Chờ khám" : "Waiting"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">
            {counts.waiting}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab("IN_PROGRESS")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedTab === "IN_PROGRESS"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>{lang === "vi" ? "Đang khám / Chờ CLS" : "In Progress / Labs"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">
            {counts.inProgress}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab("DONE")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedTab === "DONE"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>{lang === "vi" ? "Đã khám xong" : "Done"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25">
            {counts.done}
          </span>
        </button>
      </div>

      {/* Live Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-3.5 bg-slate-50/80 rounded-lg border border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {lang === "vi" ? "Ngày khám" : "Date"}
          </label>
          <input
            type="date"
            value={formFilters.ngay || ""}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {lang === "vi" ? "Ca làm việc" : "Shift"}
          </label>
          <select
            value={formFilters.idLichLamViec ?? ""}
            onChange={(e) => handleShiftChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none font-medium"
          >
            <option value="">
              {lang === "vi" ? "Tất cả các ca trong ngày" : "All shifts today"}
            </option>
            {shifts.map((s) => {
              const buoiLabel =
                s.buoi === "SANG"
                  ? lang === "vi"
                    ? "Ca sáng"
                    : "Morning"
                  : s.buoi === "CHIEU"
                    ? lang === "vi"
                      ? "Ca chiều"
                      : "Afternoon"
                    : lang === "vi"
                      ? "Ca tối"
                      : "Evening";
              const timeLabel = `${s.gioBatDau.slice(0, 5)} - ${s.gioKetThuc.slice(0, 5)}`;
              const room =
                typeof s.phongKham === "object" && s.phongKham !== null
                  ? (s.phongKham as any).tenPhong
                  : s.phongKham || "";
              return (
                <option key={s.idLichLamViec} value={s.idLichLamViec}>
                  {buoiLabel} ({timeLabel}) {room ? `• ${room}` : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {lang === "vi" ? "Số thứ tự (STT)" : "Queue No."}
          </label>
          <input
            type="number"
            min="1"
            placeholder={lang === "vi" ? "VD: 1, 2..." : "e.g. 1, 2..."}
            value={formFilters.soThuTu || ""}
            onChange={(e) =>
              setFormFilters({
                ...formFilters,
                soThuTu: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {lang === "vi" ? "Họ tên bệnh nhân" : "Patient Name"}
          </label>
          <input
            type="text"
            placeholder={
              lang === "vi" ? "Tìm theo họ tên..." : "Search patient name..."
            }
            value={formFilters.tuKhoa || ""}
            onChange={(e) =>
              setFormFilters({ ...formFilters, tuKhoa: e.target.value })
            }
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 w-14 text-center">STT</th>
              <th className="py-2.5 px-3 w-28">
                {lang === "vi" ? "Giờ khám" : "Time"}
              </th>
              <th className="py-2.5 px-3">
                {lang === "vi" ? "Bệnh nhân" : "Patient"}
              </th>
              <th className="py-2.5 px-3 w-16">
                {lang === "vi" ? "Tuổi" : "Age"}
              </th>
              <th className="py-2.5 px-3">
                {lang === "vi" ? "Lý do khám" : "Reason"}
              </th>
              <th className="py-2.5 px-3 w-32">
                {lang === "vi" ? "Trạng thái" : "Status"}
              </th>
              <th className="py-2.5 px-3 w-36">
                {lang === "vi" ? "Mã tra cứu" : "Lookup Code"}
              </th>
              <th className="py-2.5 px-3 w-28 text-center">
                {lang === "vi" ? "Thao tác" : "Action"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-teal-500 border-t-transparent mb-2" />
                  <p>
                    {lang === "vi"
                      ? "Đang tải danh sách bệnh nhân..."
                      : "Loading patient queue..."}
                  </p>
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="font-medium text-slate-600">
                    {lang === "vi"
                      ? "Không có lịch hẹn nào khớp với bộ lọc."
                      : "No appointments match the filter."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = selectedAppointmentId === p.id;
                const statusMeta =
                  TRANG_THAI_LABELS[p.trangThai] || {
                    vi: p.trangThai,
                    en: p.trangThai,
                    color: "bg-slate-100 text-slate-600 border-slate-200",
                  };
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    className={`cursor-pointer transition hover:bg-teal-50/60 ${
                      isSelected ? "bg-teal-50/90 font-medium" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      #{p.soThuTu}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">
                      {p.gioKhamDuKien?.slice(11, 16) || p.gioKhamDuKien}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">
                          {p.benhNhan.hoTen}
                        </span>
                        {p.doiChieu?.canDoiChieu && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300"
                            title={
                              lang === "vi"
                                ? "Thông tin đặt khác hồ sơ gốc, cần đối chiếu"
                                : "Booking info differs from original profile"
                            }
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {lang === "vi" ? "Cần đối chiếu" : "Verify ID"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.benhNhan.tuoi ?? "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {p.lyDoKham || "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full border ${statusMeta.color}`}
                      >
                        {lang === "vi" ? statusMeta.vi : statusMeta.en}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {p.maTraCuu}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(p.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                          p.trangThai === "DA_KHAM" || p.trangThai === "DA_HOAN_THANH"
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                        }`}
                      >
                        {p.trangThai === "DA_KHAM" || p.trangThai === "DA_HOAN_THANH"
                          ? lang === "vi" ? "Xem bệnh án" : "View Record"
                          : lang === "vi" ? "Khám bệnh" : "Examine"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
