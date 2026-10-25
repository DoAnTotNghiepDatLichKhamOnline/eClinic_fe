import { useState, type FormEvent } from "react";
import { Users, Filter, RotateCcw, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type {
  LichHenTrongNgayItem,
  LichHenTrongNgayParams,
} from "@/types/consultation.type";
import type { TrangThaiLichHen } from "@/types/common.type";

interface TodayPatientsTableProps {
  patients: LichHenTrongNgayItem[];
  isLoading: boolean;
  filters: LichHenTrongNgayParams;
  onFilterChange: (filters: LichHenTrongNgayParams) => void;
  onSelectPatient: (id: number) => void;
  selectedAppointmentId?: number;
}

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
}: TodayPatientsTableProps) {
  const { lang } = useLanguage();
  const [formFilters, setFormFilters] =
    useState<LichHenTrongNgayParams>(filters);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onFilterChange(formFilters);
  };

  const handleReset = () => {
    const defaultFilters: LichHenTrongNgayParams = {
      ngay: new Date().toISOString().split("T")[0],
      idLichLamViec: undefined,
      soThuTu: undefined,
      tuKhoa: "",
    };
    setFormFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 mb-6">
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
              ? "Lọc theo ca làm việc, số thứ tự khám hoặc họ tên bệnh nhân. Bấm vào dòng để mở hồ sơ."
              : "Filter by shift, queue number, or name. Click any row to open the consultation."}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full w-fit">
          {lang === "vi" ? "Tổng số: " : "Total: "}
          {patients.length} {lang === "vi" ? "ca" : "visits"}
        </span>
      </div>

      {/* Filter Form */}
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5 p-3.5 bg-slate-50 rounded-lg border border-slate-100"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {lang === "vi" ? "Ngày khám" : "Date"}
          </label>
          <input
            type="date"
            value={formFilters.ngay || ""}
            onChange={(e) =>
              setFormFilters({ ...formFilters, ngay: e.target.value })
            }
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {lang === "vi" ? "Mã ca làm việc (ID)" : "Shift ID"}
          </label>
          <input
            type="number"
            min="1"
            placeholder={lang === "vi" ? "Bỏ trống = cả ngày" : "Empty = all day"}
            value={formFilters.idLichLamViec || ""}
            onChange={(e) =>
              setFormFilters({
                ...formFilters,
                idLichLamViec: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-teal-500 outline-none"
          />
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

        <div className="flex items-end gap-1.5">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            {lang === "vi" ? "Lọc" : "Filter"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            title={lang === "vi" ? "Đặt lại bộ lọc" : "Reset filter"}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

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
            ) : patients.length === 0 ? (
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
              patients.map((p) => {
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
