import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Check,
  X,
  FileText,
  RotateCcw,
  Info,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import styles from "../../../AdminDashboardPage.module.css";
import type {
  YeuCauDoiLichResponse,
  TrangThaiYeuCau,
} from "@/types/booking.type";
import type { BacSiQuanTriResponse } from "@/types/catalog.type";

interface AdminShiftRequestsTabProps {
  requests: YeuCauDoiLichResponse[];
  isLoading: boolean;
  doctors: BacSiQuanTriResponse[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
  highlightId?: number | null;
  statusFilter: TrangThaiYeuCau | "ALL";
  onStatusFilterChange: (status: TrangThaiYeuCau | "ALL") => void;
  doctorFilter: number | undefined;
  onDoctorFilterChange: (id: number | undefined) => void;
  typeFilter: "ALL" | "XIN_NGHI" | "DOI_CA";
  onTypeFilterChange: (type: "ALL" | "XIN_NGHI" | "DOI_CA") => void;
}

export function AdminShiftRequestsTab({
  requests,
  isLoading,
  doctors,
  onApprove,
  onReject,
  highlightId,
  statusFilter,
  onStatusFilterChange,
  doctorFilter,
  onDoctorFilterChange,
  typeFilter,
  onTypeFilterChange,
}: AdminShiftRequestsTabProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [selectedRequestForDetail, setSelectedRequestForDetail] =
    useState<YeuCauDoiLichResponse | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);

  // Auto-scroll to highlighted request row if highlightId exists
  useEffect(() => {
    if (highlightId && highlightRowRef.current) {
      highlightRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightId, requests]);

  // Client-side filter by doctor & type
  const filteredRequests = requests.filter((r) => {
    if (doctorFilter && r.ca?.idBacSi !== doctorFilter) {
      return false;
    }
    if (typeFilter !== "ALL") {
      const rType = r.loaiYeuCau ?? "DOI_CA";
      if (rType !== typeFilter) return false;
    }
    return true;
  });

  const handleOpenRejectModal = (id: number) => {
    setRejectingRequestId(id);
    setRejectReason("");
  };

  const handleConfirmReject = async (e: FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(rejectingRequestId, rejectReason.trim());
      setRejectingRequestId(null);
      setRejectReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    onStatusFilterChange("ALL");
    onDoctorFilterChange(undefined);
    onTypeFilterChange("ALL");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {vi ? "Trạng thái:" : "Status:"}
            </span>
            {(
              [
                { id: "ALL", vi: "Tất cả", en: "All" },
                { id: "CHO_DUYET", vi: "Chờ duyệt", en: "Pending" },
                { id: "DA_DUYET", vi: "Đã duyệt", en: "Approved" },
                { id: "TU_CHOI", vi: "Từ chối", en: "Rejected" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onStatusFilterChange(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  statusFilter === s.id
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {vi ? s.vi : s.en}
              </button>
            ))}
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Lọc theo Bác sĩ */}
            <select
              value={doctorFilter ?? ""}
              onChange={(e) =>
                onDoctorFilterChange(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
            >
              <option value="">{vi ? "Tất cả bác sĩ" : "All Doctors"}</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.hocVi ? `${doc.hocVi} ` : ""}
                  {doc.hoTen} ({doc.tenChuyenKhoa || "Bác sĩ"})
                </option>
              ))}
            </select>

            {/* Lọc theo Loại đơn */}
            <select
              value={typeFilter}
              onChange={(e) =>
                onTypeFilterChange(
                  e.target.value as "ALL" | "XIN_NGHI" | "DOI_CA",
                )
              }
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
            >
              <option value="ALL">
                {vi ? "Tất cả loại đơn" : "All Request Types"}
              </option>
              <option value="XIN_NGHI">
                {vi ? "Chỉ Xin nghỉ" : "Leave only"}
              </option>
              <option value="DOI_CA">
                {vi ? "Chỉ Đổi ca" : "Shift change only"}
              </option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              title={vi ? "Đặt lại bộ lọc" : "Reset filters"}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 w-12 text-center">ID</th>
                <th className="py-3 px-3.5 min-w-[180px]">
                  {vi ? "Bác sĩ yêu cầu" : "Doctor"}
                </th>
                <th className="py-3 px-3.5 w-28">{vi ? "Loại đơn" : "Type"}</th>
                <th className="py-3 px-3.5 min-w-[180px]">
                  {vi ? "Ca làm việc liên quan" : "Shift"}
                </th>
                <th className="py-3 px-3.5 min-w-[160px]">
                  {vi ? "Ca mong muốn / Thay thế" : "Target Shift"}
                </th>
                <th className="py-3 px-3.5 max-w-[200px]">
                  {vi ? "Lý do" : "Reason"}
                </th>
                <th className="py-3 px-3.5 w-44">
                  {vi ? "Bệnh nhân ảnh hưởng" : "Affected Patients"}
                </th>
                <th className="py-3 px-3.5 w-36 text-center">
                  {vi ? "Hành động" : "Action"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent mb-2" />
                    <p>
                      {vi
                        ? "Đang tải danh sách yêu cầu..."
                        : "Loading requests..."}
                    </p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">
                      {vi
                        ? "Không có yêu cầu đổi ca / xin nghỉ nào phù hợp với bộ lọc."
                        : "No requests found matching the current filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const isHighlighted = highlightId === r.id;
                  const isLeave = r.loaiYeuCau === "XIN_NGHI";
                  const affectedPatients =
                    r.ca?.soChoDaDat ?? r.ca?.soLuotDaDat ?? 0;
                  const docInfo = r.ca?.bacSi;
                  const docName =
                    docInfo?.hoTen ?? r.ca?.hoTenBacSi ?? "Bác sĩ eClinic";
                  const specialty = r.ca?.tenChuyenKhoa ?? "Chuyên khoa";

                  return (
                    <tr
                      key={r.id}
                      ref={isHighlighted ? highlightRowRef : undefined}
                      className={`transition ${
                        isHighlighted
                          ? "bg-teal-50/90 font-medium ring-2 ring-teal-500 ring-inset"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="py-3 px-3.5 text-center font-bold text-slate-500">
                        #{r.id}
                      </td>

                      {/* Bác sĩ yêu cầu */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          {docInfo?.anhDaiDien ? (
                            <img
                              src={docInfo.anhDaiDien}
                              alt={docName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {docName.split(" ").slice(-1)[0]?.charAt(0) ||
                                "BS"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">
                              {docInfo?.hocVi ? `${docInfo.hocVi} ` : ""}
                              {docName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {specialty}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Loại yêu cầu */}
                      <td className="py-3 px-3.5">
                        {isLeave ? (
                          <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            {vi ? "Xin nghỉ" : "Leave"}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                            {vi ? "Đổi ca" : "Shift swap"}
                          </span>
                        )}
                      </td>

                      {/* Ca làm việc liên quan */}
                      <td className="py-3 px-3.5 text-slate-700">
                        <div className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {r.ca?.ngay ?? r.ngay}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {r.ca?.gioBatDau?.slice(0, 5) ??
                            r.gioBatDau?.slice(0, 5)}
                          {" - "}
                          {r.ca?.gioKetThuc?.slice(0, 5) ??
                            r.gioKetThuc?.slice(0, 5)}
                          {" · "}
                          {r.ca?.tenPhongKham ??
                            r.tenPhongHienTai ??
                            "Phòng khám"}
                        </div>
                      </td>

                      {/* Ca mong muốn (nếu là Đổi ca) */}
                      <td className="py-3 px-3.5 text-slate-700">
                        {!isLeave && r.ngayMongMuon ? (
                          <div>
                            <div className="font-semibold text-purple-900">
                              {r.ngayMongMuon}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {r.gioBatDauMongMuon?.slice(0, 5)} -{" "}
                              {r.gioKetThucMongMuon?.slice(0, 5)}
                              {r.tenPhongMongMuon ||
                              r.phongKhamMongMuon?.tenPhong
                                ? ` · ${r.tenPhongMongMuon || r.phongKhamMongMuon?.tenPhong}`
                                : ""}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            {vi ? "— (Nghỉ phép)" : "— (Leave)"}
                          </span>
                        )}
                      </td>

                      {/* Lý do */}
                      <td className="py-3 px-3.5">
                        <div className="max-w-[180px] truncate text-slate-700 font-medium" title={r.lyDo}>
                          {r.lyDo}
                        </div>
                      </td>

                      {/* Bệnh nhân bị ảnh hưởng */}
                      <td className="py-3 px-3.5">
                        {affectedPatients > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            {vi
                              ? `${affectedPatients} bệnh nhân cần đổi`
                              : `${affectedPatients} pts need move`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {vi ? "0 bệnh nhân (an toàn)" : "0 patients (safe)"}
                          </span>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedRequestForDetail(r)}
                            className={styles.actionBtnOutline}
                            title={vi ? "Xem chi tiết yêu cầu" : "View detail"}
                          >
                            <Eye size={13} />
                            {vi ? "Chi tiết" : "Detail"}
                          </button>
                          {r.trangThai === "CHO_DUYET" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void onApprove(r.id)}
                                className={styles.actionBtnSuccess}
                                title={vi ? "Phê duyệt yêu cầu" : "Approve"}
                              >
                                <Check size={13} />
                                {vi ? "Duyệt" : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(r.id)}
                                className={styles.actionBtnDanger}
                                title={vi ? "Từ chối yêu cầu" : "Reject"}
                              >
                                <X size={13} />
                                {vi ? "Từ chối" : "Reject"}
                              </button>
                            </>
                          ) : r.trangThai === "DA_DUYET" ? (
                            <span className="inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {vi ? "Đã duyệt" : "Approved"}
                            </span>
                          ) : (
                            <span
                              className="inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                              title={r.ghiChuXuLy || r.phanHoi || undefined}
                            >
                              {vi ? "Đã từ chối" : "Rejected"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Modal Xem Chi Tiết Yêu Cầu */}
      {selectedRequestForDetail && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedRequestForDetail(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-600" />
                {vi ? "Chi tiết đơn yêu cầu" : "Request Details"} #
                {selectedRequestForDetail.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequestForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">
                  {vi ? "Bác sĩ gửi đơn:" : "Requesting Doctor:"}
                </span>
                <p className="font-bold text-sm text-slate-800 mt-0.5">
                  {selectedRequestForDetail.ca?.bacSi?.hoTen ??
                    selectedRequestForDetail.ca?.hoTenBacSi ??
                    "Bác sĩ eClinic"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-500 font-medium">
                    {vi ? "Loại đơn:" : "Request Type:"}
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedRequestForDetail.loaiYeuCau === "XIN_NGHI"
                      ? vi
                        ? "Xin nghỉ phép"
                        : "Leave"
                      : vi
                        ? "Đổi ca trực"
                        : "Shift Swap"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">
                    {vi ? "Trạng thái:" : "Status:"}
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedRequestForDetail.trangThai}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-medium">
                  {vi ? "Ca làm việc liên quan:" : "Target Shift:"}
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedRequestForDetail.ca?.ngay ??
                    selectedRequestForDetail.ngay}{" "}
                  (
                  {selectedRequestForDetail.ca?.gioBatDau?.slice(0, 5) ??
                    selectedRequestForDetail.gioBatDau?.slice(0, 5)}{" "}
                  -{" "}
                  {selectedRequestForDetail.ca?.gioKetThuc?.slice(0, 5) ??
                    selectedRequestForDetail.gioKetThuc?.slice(0, 5)}
                  ) ·{" "}
                  {selectedRequestForDetail.ca?.tenPhongKham ??
                    selectedRequestForDetail.tenPhongHienTai}
                </p>
              </div>

              {selectedRequestForDetail.loaiYeuCau === "DOI_CA" && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/70 text-purple-900">
                  <span className="font-bold">
                    {vi
                      ? "Thông tin ca mong muốn đổi:"
                      : "Desired Shift Details:"}
                  </span>
                  <p className="mt-1">
                    Ngày: {selectedRequestForDetail.ngayMongMuon || "—"} · Giờ:{" "}
                    {selectedRequestForDetail.gioBatDauMongMuon?.slice(0, 5)} -{" "}
                    {selectedRequestForDetail.gioKetThucMongMuon?.slice(0, 5)} ·
                    Phòng:{" "}
                    {selectedRequestForDetail.tenPhongMongMuon ||
                      selectedRequestForDetail.phongKhamMongMuon?.tenPhong ||
                      "—"}
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-500 font-medium">
                  {vi ? "Lý do của bác sĩ:" : "Doctor's Reason:"}
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-800 font-medium mt-1 leading-relaxed">
                  {selectedRequestForDetail.lyDo}
                </p>
              </div>

              {selectedRequestForDetail.ghiChuXuLy && (
                <div>
                  <span className="text-slate-500 font-medium">
                    {vi ? "Ghi chú từ quản trị viên:" : "Admin Note:"}
                  </span>
                  <p className="p-3 bg-rose-50 rounded-xl border border-rose-200/70 text-rose-800 font-medium mt-1">
                    {selectedRequestForDetail.ghiChuXuLy}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRequestForDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                {vi ? "Đóng" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Từ Chối Yêu Cầu */}
      {rejectingRequestId !== null && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <form onSubmit={handleConfirmReject}>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-rose-50/50">
                <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  {vi
                    ? "Từ chối yêu cầu đổi ca / xin nghỉ"
                    : "Reject Shift Request"}
                </h3>
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 text-xs space-y-3">
                <p className="text-slate-600">
                  {vi
                    ? `Bạn đang chuẩn bị từ chối đơn yêu cầu #${rejectingRequestId}. Vui lòng nhập lý do cụ thể để gửi thông báo lại cho bác sĩ:`
                    : `You are about to reject request #${rejectingRequestId}. Please enter a reason to notify the doctor:`}
                </p>
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={
                    vi
                      ? "VD: Ca trực đã có 5 bệnh nhân đã thanh toán, không tìm được bác sĩ thay thế..."
                      : "e.g. Existing bookings cannot be rescheduled..."
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shadow-xs"
                >
                  {isSubmitting
                    ? vi
                      ? "Đang xử lý..."
                      : "Processing..."
                    : vi
                      ? "Xác nhận từ chối"
                      : "Confirm Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
