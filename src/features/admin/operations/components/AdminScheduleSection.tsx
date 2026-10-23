import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, RotateCcw, AlertTriangle } from "lucide-react";
import { adminBookingService as bookingService } from "@/services/booking";
import { doctorService, clinicService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { CaLamViecResponse } from "@/types/booking.type";
import { CreateShiftModal } from "./CreateShiftModal";
import { notifyAuth } from "@/utils/authNotification";
import styles from "../../AdminDashboardPage.module.css";

function currentDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AdminScheduleSection() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false);

  const defaultFrom = currentDateKey(new Date());
  const throughDate = new Date();
  throughDate.setDate(throughDate.getDate() + 41);
  const defaultThrough = currentDateKey(throughDate);

  const [filterFromDate, setFilterFromDate] = useState(defaultFrom);
  const [filterThroughDate, setFilterThroughDate] = useState(defaultThrough);
  const [filterDoctorId, setFilterDoctorId] = useState<number | undefined>(
    undefined,
  );
  const [filterClinicId, setFilterClinicId] = useState<number | undefined>(
    undefined,
  );

  const [selectedShiftForPatients, setSelectedShiftForPatients] =
    useState<CaLamViecResponse | null>(null);
  const [editingShift, setEditingShift] = useState<CaLamViecResponse | null>(
    null,
  );
  const [cancellingShift, setCancellingShift] =
    useState<CaLamViecResponse | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const shiftQuery = useQuery({
    queryKey: [
      "booking",
      "admin-shifts",
      filterFromDate,
      filterThroughDate,
      filterDoctorId,
      filterClinicId,
    ],
    queryFn: () =>
      bookingService.getLichLamViecQuanTri({
        tuNgay: filterFromDate,
        denNgay: filterThroughDate,
        idBacSi: filterDoctorId,
        idPhongKham: filterClinicId,
      }),
  });

  const shiftPatientsQuery = useQuery({
    queryKey: ["booking", "admin-shift-patients", selectedShiftForPatients?.id],
    queryFn: () => {
      if (!selectedShiftForPatients) return null;
      return bookingService.getLichHenTheoCa(selectedShiftForPatients.id);
    },
    enabled: Boolean(selectedShiftForPatients),
  });

  const doctorsQuery = useQuery({
    queryKey: ["catalog", "admin-doctors"],
    queryFn: () =>
      doctorService.getDanhSachBacSiQuanTri({ trang: 0, kichThuoc: 100 }),
  });

  const clinicsQuery = useQuery({
    queryKey: ["catalog", "admin-clinics", "all"],
    queryFn: () =>
      clinicService.getDanhSachPhongKhamQuanTri({ trang: 0, kichThuoc: 100 }),
  });

  const requestsQuery = useQuery({
    queryKey: ["booking", "admin-shift-requests"],
    queryFn: () =>
      bookingService.getYeuCauDoiLichQuanTri({
        trangThai: "CHO_DUYET",
        trang: 0,
        kichThuoc: 100,
      }),
  });

  const waitingAppointmentsQuery = useQuery({
    queryKey: ["booking", "admin-reschedule-needed"],
    queryFn: () =>
      bookingService.getLichHenCanDoiLich({ trang: 0, kichThuoc: 100 }),
  });

  const showFailure = (cause: unknown) => {
    const errorMsg =
      (cause as { response?: { data?: { thongDiep?: string } } }).response?.data
        ?.thongDiep ??
        (cause instanceof Error
          ? cause.message
          : vi
            ? "Thao tác thất bại."
            : "The operation failed.");
    setError(errorMsg);
    setMessage("");
    notifyAuth("error", vi ? "Thao tác thất bại" : "Operation failed", errorMsg);
  };

  const finish = async (text: string, keys: string[]) => {
    setError("");
    setMessage(text);
    notifyAuth("success", vi ? "Thành công" : "Success", text);
    await Promise.all(
      keys.map((key) => client.invalidateQueries({ queryKey: key.split("|") })),
    );
  };

  const handleCancelShiftSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cancellingShift) return;
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      setError(
        vi
          ? "Vui lòng nhập lý do hủy ca."
          : "Please provide a reason for cancellation.",
      );
      return;
    }
    if (trimmedReason.length > 500) {
      setError(
        vi
          ? "Lý do hủy ca không được vượt quá 500 ký tự."
          : "Reason must not exceed 500 characters.",
      );
      return;
    }

    setIsCancelling(true);
    try {
      const result = await bookingService.huyCaLamViec(cancellingShift.id, {
        lyDo: trimmedReason,
      });
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(
        result.thongDiep ||
          (vi ? "Hủy ca làm việc thành công" : "Shift cancelled successfully"),
        ["booking|admin-shifts", "booking|admin-reschedule-needed"],
      );
      setCancellingShift(null);
      setCancelReason("");
    } catch (cause) {
      showFailure(cause);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveEditShift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingShift) return;
    const values = new FormData(event.currentTarget);
    try {
      const response = await bookingService.suaCaLamViec(editingShift.id, {
        idPhongKham: Number(values.get("idPhongKham")),
        gioBatDau: String(values.get("gioBatDau")),
        gioKetThuc: String(values.get("gioKetThuc")),
        soLuotToiDaMoiGio: Number(values.get("soLuotToiDaMoiGio")),
        thoiLuongLuotPhut: Number(values.get("thoiLuongLuotPhut")),
      });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, ["booking|admin-shifts"]);
      setEditingShift(null);
    } catch (cause) {
      showFailure(cause);
    }
  };

  const decideRequest = async (id: number, approve: boolean) => {
    if (!approve) {
      setRejectingRequestId(id);
      setRejectNote("");
      return;
    }
    try {
      const result = await bookingService.xuLyYeuCauDoiLich(
        id,
        { ghiChu: "" },
        true,
      );
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, [
        "booking|admin-shift-requests",
        "booking|admin-shifts",
      ]);
    } catch (cause) {
      showFailure(cause);
    }
  };

  const handleConfirmRejectRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (rejectingRequestId === null) return;
    const note = rejectNote.trim();
    if (!note) {
      setError(vi ? "Vui lòng nhập lý do từ chối." : "Please enter rejection reason.");
      return;
    }
    try {
      setIsRejecting(true);
      const result = await bookingService.xuLyYeuCauDoiLich(
        rejectingRequestId,
        { ghiChu: note },
        false,
      );
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, [
        "booking|admin-shift-requests",
        "booking|admin-shifts",
      ]);
      setRejectingRequestId(null);
      setRejectNote("");
    } catch (cause) {
      showFailure(cause);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleResetFilters = () => {
    setFilterFromDate(defaultFrom);
    setFilterThroughDate(defaultThrough);
    setFilterDoctorId(undefined);
    setFilterClinicId(undefined);
  };

  const isFiltered =
    filterFromDate !== defaultFrom ||
    filterThroughDate !== defaultThrough ||
    filterDoctorId !== undefined ||
    filterClinicId !== undefined;

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <span className="text-xs text-slate-500">
            {filterFromDate} — {filterThroughDate}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateShiftOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition-colors"
        >
          <CalendarPlus size={16} />
          <span>{vi ? "Xếp ca làm" : "Schedule Shift"}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="mb-4 grid grid-cols-1 gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
        <label className="flex flex-col gap-1 text-slate-700 font-medium">
          <span>{vi ? "Từ ngày" : "From date"}</span>
          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-teal-600 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-slate-700 font-medium">
          <span>{vi ? "Đến ngày" : "To date"}</span>
          <input
            type="date"
            value={filterThroughDate}
            onChange={(e) => setFilterThroughDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-teal-600 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-slate-700 font-medium">
          <span>{vi ? "Bác sĩ" : "Doctor"}</span>
          <select
            value={filterDoctorId ?? ""}
            onChange={(e) =>
              setFilterDoctorId(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-teal-600 focus:outline-none"
          >
            <option value="">{vi ? "Tất cả bác sĩ" : "All doctors"}</option>
            {(doctorsQuery.data?.duLieu?.noiDung ?? []).map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.hoTen} ({doc.tenChuyenKhoa ?? doc.hocVi ?? "Bác sĩ"})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-slate-700 font-medium">
          <span>{vi ? "Phòng khám" : "Clinic"}</span>
          <select
            value={filterClinicId ?? ""}
            onChange={(e) =>
              setFilterClinicId(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-teal-600 focus:outline-none"
          >
            <option value="">{vi ? "Tất cả phòng khám" : "All clinics"}</option>
            {(clinicsQuery.data?.duLieu?.noiDung ?? []).map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.tenPhong} ({clinic.tenChuyenKhoa})
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw size={13} />
              <span>{vi ? "Đặt lại" : "Reset"}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <CreateShiftModal
        isOpen={isCreateShiftOpen}
        onClose={() => setIsCreateShiftOpen(false)}
        onSuccess={() =>
          finish(vi ? "Xếp ca thành công" : "Shift created successfully", [
            "booking|admin-shifts",
          ])
        }
        doctors={doctorsQuery.data?.duLieu?.noiDung ?? []}
        clinics={clinicsQuery.data?.duLieu?.noiDung ?? []}
        minDate={defaultFrom}
        maxDate={defaultThrough}
      />

      <div className={styles.tableScroll}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>{vi ? "Ngày" : "Date"}</th>
              <th>{vi ? "Bác sĩ" : "Doctor"}</th>
              <th>{vi ? "Ca" : "Shift"}</th>
              <th>{vi ? "Phòng" : "Clinic"}</th>
              <th>{vi ? "Đã đặt" : "Booked"}</th>
              <th>{vi ? "Trạng thái" : "Status"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(shiftQuery.data?.duLieu ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-xs text-slate-500"
                >
                  {shiftQuery.isLoading
                    ? vi
                      ? "Đang tải dữ liệu ca làm..."
                      : "Loading shifts..."
                    : vi
                      ? "Không có ca làm việc nào phù hợp với bộ lọc."
                      : "No work shifts matching current filter."}
                </td>
              </tr>
            ) : (
              (shiftQuery.data?.duLieu ?? []).map((shift) => (
                <tr key={shift.id}>
                  <td>{shift.ngay}</td>
                  <td className="font-medium text-slate-800">
                    {shift.hoTenBacSi}
                  </td>
                  <td>
                    {shift.gioBatDau} - {shift.gioKetThuc}
                  </td>
                  <td>{shift.tenPhongKham}</td>
                  <td>
                    {shift.soLuotDaDat ?? shift.soChoDaDat ?? 0}/
                    {shift.tongSoLuot ?? shift.tongSoCho ?? 0}
                  </td>
                  <td>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        shift.trangThai === "HOAT_DONG"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : shift.trangThai === "DA_HUY"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {shift.trangThai}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`${styles.actionBtn} mr-1 text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200`}
                      type="button"
                      onClick={() => setSelectedShiftForPatients(shift)}
                    >
                      {vi ? "Bệnh nhân" : "Patients"}
                    </button>
                    {shift.trangThai === "HOAT_DONG" && (
                      <>
                        <button
                          className={styles.actionBtn}
                          type="button"
                          onClick={() => setEditingShift(shift)}
                        >
                          {vi ? "Sửa" : "Edit"}
                        </button>{" "}
                        <button
                          className={styles.actionBtnDanger}
                          type="button"
                          onClick={() => {
                            setCancellingShift(shift);
                            setCancelReason("");
                          }}
                        >
                          {vi ? "Hủy ca" : "Cancel shift"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className="mb-3 mt-8 font-semibold">
        {vi ? "Yêu cầu đổi ca / xin nghỉ" : "Shift change and leave requests"}
      </h3>
      {(requestsQuery.data?.duLieu?.noiDung ?? []).map((request) => (
        <article
          className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3"
          key={request.id}
        >
          <div>
            <strong>
              {request.loaiYeuCau ?? request.idCaLamViec} · {request.trangThai}
            </strong>
            <p className="text-xs text-slate-600">
              {request.ca?.hoTenBacSi ?? ""} ·{" "}
              {request.ngayMongMuon ?? request.ngay} · {request.lyDo}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={styles.actionBtn}
              type="button"
              onClick={() => void decideRequest(request.id, true)}
            >
              {vi ? "Duyệt" : "Approve"}
            </button>
            <button
              className={styles.actionBtnDanger}
              type="button"
              onClick={() => void decideRequest(request.id, false)}
            >
              {vi ? "Từ chối" : "Reject"}
            </button>
          </div>
        </article>
      ))}

      <h3 className="mb-3 mt-8 font-semibold">
        {vi ? "Lịch hẹn cần đổi lịch" : "Appointments awaiting reschedule"}
      </h3>
      {(waitingAppointmentsQuery.data?.duLieu?.noiDung ?? []).length === 0 ? (
        <p className="text-xs text-slate-500 py-2">
          {vi
            ? "Không có lịch hẹn nào cần đổi lịch."
            : "No appointments awaiting reschedule."}
        </p>
      ) : (
        (waitingAppointmentsQuery.data?.duLieu?.noiDung ?? []).map(
          (appointment) => (
            <p
              className="border-b border-slate-100 py-2 text-sm"
              key={appointment.maPhieuKham}
            >
              {appointment.ngay} · {appointment.gioKhamDuKien} ·{" "}
              {appointment.hoTenBenhNhan} · {appointment.maTraCuu}
            </p>
          ),
        )
      )}

      {/* Modal Danh sách bệnh nhân của 1 ca khám */}
      {selectedShiftForPatients && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedShiftForPatients(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {vi ? "Bệnh nhân trong ca khám" : "Patients in Shift"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedShiftForPatients.hoTenBacSi} ·{" "}
                  {selectedShiftForPatients.ngay} (
                  {selectedShiftForPatients.gioBatDau} -{" "}
                  {selectedShiftForPatients.gioKetThuc}) ·{" "}
                  {selectedShiftForPatients.tenPhongKham}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShiftForPatients(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {shiftPatientsQuery.isLoading ? (
                <p className="text-center text-xs text-slate-400 py-8">
                  {vi ? "Đang tải danh sách..." : "Loading..."}
                </p>
              ) : (shiftPatientsQuery.data?.duLieu ?? []).length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">
                  {vi
                    ? "Chưa có bệnh nhân nào đặt lịch trong ca này."
                    : "No patients booked for this shift."}
                </p>
              ) : (
                <div className="space-y-3">
                  {(shiftPatientsQuery.data?.duLieu ?? []).map((appt: any) => {
                    const patientName =
                      appt.benhNhan?.hoTen ||
                      appt.hoTenBenhNhan ||
                      (vi ? "Bệnh nhân" : "Patient");
                    const lookupCode = appt.maTraCuu || appt.maPhieuKham || "—";
                    const birthYear = appt.benhNhan?.tuoi
                      ? `${appt.benhNhan.tuoi} ${vi ? "tuổi" : "yo"}`
                      : appt.namSinhBenhNhan || appt.benhNhan?.ngaySinh || "";
                    const gender =
                      appt.benhNhan?.gioiTinh === "NAM" ||
                      appt.gioiTinhBenhNhan === "NAM"
                        ? vi
                          ? "Nam"
                          : "Male"
                        : appt.benhNhan?.gioiTinh === "NU" ||
                            appt.gioiTinhBenhNhan === "NU"
                          ? vi
                            ? "Nữ"
                            : "Female"
                          : "";
                    const phone =
                      appt.benhNhan?.soDienThoai ||
                      appt.soDienThoaiBenhNhan ||
                      appt.nguoiGiamHo?.soDienThoai ||
                      "";
                    const timeStr = appt.gioKhamDuKien
                      ? typeof appt.gioKhamDuKien === "string" &&
                        appt.gioKhamDuKien.includes("T")
                        ? appt.gioKhamDuKien.split("T")[1].slice(0, 5)
                        : appt.gioKhamDuKien
                      : appt.gioBatDauKhung
                        ? `${typeof appt.gioBatDauKhung === "string" && appt.gioBatDauKhung.includes("T") ? appt.gioBatDauKhung.split("T")[1].slice(0, 5) : appt.gioBatDauKhung} - ${typeof appt.gioKetThucKhung === "string" && appt.gioKetThucKhung.includes("T") ? appt.gioKetThucKhung.split("T")[1].slice(0, 5) : appt.gioKetThucKhung}`
                        : "";

                    return (
                      <div
                        key={appt.id ?? lookupCode}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 text-xs hover:border-slate-300 transition-colors bg-white shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                              STT #{appt.soThuTu}
                            </span>
                            <span className="font-semibold text-slate-800 text-sm">
                              {patientName}
                            </span>
                            {(birthYear || gender) && (
                              <span className="text-[11px] text-slate-500">
                                (
                                {[gender, birthYear]
                                  .filter(Boolean)
                                  .join(" · ")}
                                )
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                            {timeStr && (
                              <span className="font-medium text-slate-700">
                                {timeStr}
                              </span>
                            )}
                            <span>·</span>
                            <span>
                              {vi ? "Mã" : "Code"}:{" "}
                              <strong className="font-mono text-slate-700">
                                {lookupCode}
                              </strong>
                            </span>
                            {phone && (
                              <>
                                <span>·</span>
                                <span>
                                  {vi ? "SĐT" : "Phone"}: {phone}
                                </span>
                              </>
                            )}
                          </div>
                          {appt.lyDoKham && (
                            <p className="text-slate-600 italic mt-1 bg-slate-50 rounded px-2 py-1">
                              {vi ? "Lý do khám" : "Reason"}: {appt.lyDoKham}
                            </p>
                          )}
                          {appt.doiChieu?.canDoiChieu && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              ⚠️{" "}
                              {vi
                                ? "Thông tin khác hồ sơ, cần đối chiếu"
                                : "Verification needed"}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                            {appt.trangThai}
                          </span>
                          {appt.canDoiLich && (
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                              {vi ? "Chờ đổi lịch" : "Reschedule needed"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedShiftForPatients(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700"
              >
                {vi ? "Đóng" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa ca khám */}
      {editingShift && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditingShift(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {vi ? "Chỉnh sửa ca làm việc" : "Edit Work Shift"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {editingShift.hoTenBacSi} · {editingShift.ngay}
            </p>
            <form
              onSubmit={handleSaveEditShift}
              className="grid gap-3 text-xs sm:grid-cols-2"
            >
              <label className="grid gap-1 sm:col-span-2">
                {vi ? "Phòng khám" : "Clinic Room"}
                <select
                  name="idPhongKham"
                  defaultValue={editingShift.idPhongKham}
                  required
                >
                  {(clinicsQuery.data?.duLieu?.noiDung ?? [])
                    .filter((clinic) => clinic.trangThai === "HOAT_DONG")
                    .map((clinic) => (
                      <option value={clinic.id} key={clinic.id}>
                        {clinic.tenPhong} ({clinic.tenChuyenKhoa})
                      </option>
                    ))}
                </select>
              </label>
              <label className="grid gap-1">
                {vi ? "Giờ bắt đầu (HH:mm)" : "Start time"}
                <input
                  name="gioBatDau"
                  defaultValue={editingShift.gioBatDau}
                  required
                />
              </label>
              <label className="grid gap-1">
                {vi ? "Giờ kết thúc (HH:mm)" : "End time"}
                <input
                  name="gioKetThuc"
                  defaultValue={editingShift.gioKetThuc}
                  required
                />
              </label>
              <label className="grid gap-1">
                {vi ? "Lượt tối đa mỗi giờ" : "Capacity per hour"}
                <input
                  name="soLuotToiDaMoiGio"
                  type="number"
                  min={1}
                  max={30}
                  defaultValue={editingShift.soLuotToiDaMoiGio}
                  required
                />
              </label>
              <label className="grid gap-1">
                {vi ? "Thời lượng mỗi lượt (phút)" : "Slot duration (minutes)"}
                <input
                  name="thoiLuongLuotPhut"
                  type="number"
                  min={5}
                  max={60}
                  defaultValue={editingShift.thoiLuongLuotPhut}
                  required
                />
              </label>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingShift(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className={styles.actionBtn}>
                  {vi ? "Lưu thay đổi" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hủy ca làm việc */}
      {cancellingShift && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isCancelling)
              setCancellingShift(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-600" />
                <span>{vi ? "Hủy ca làm việc" : "Cancel Work Shift"}</span>
              </h3>
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingShift(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 mb-3 text-xs space-y-1">
              <p className="font-semibold text-slate-800">
                {cancellingShift.hoTenBacSi} · {cancellingShift.tenPhongKham}
              </p>
              <p className="text-slate-600">
                {vi ? "Ngày khám" : "Date"}:{" "}
                <strong>{cancellingShift.ngay}</strong> (
                {cancellingShift.gioBatDau} - {cancellingShift.gioKetThuc})
              </p>
              <p className="text-slate-600">
                {vi ? "Số lượt đã đặt" : "Booked slots"}:{" "}
                <strong>
                  {cancellingShift.soLuotDaDat ??
                    cancellingShift.soChoDaDat ??
                    0}
                </strong>
                /{cancellingShift.tongSoLuot ?? cancellingShift.tongSoCho ?? 0}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4 text-xs text-amber-800">
              {vi
                ? "Lưu ý: Hủy ca làm việc sẽ chuyển các lịch hẹn hợp lệ trong ca sang trạng thái cần đổi lịch, đồng thời thông báo cho bệnh nhân và bác sĩ."
                : "Note: Cancelling this shift will mark all active appointments as needing rescheduling and notify the patient and doctor."}
            </div>

            <form onSubmit={handleCancelShiftSubmit}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {vi ? "Lý do hủy ca" : "Cancellation reason"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={
                  vi
                    ? "Nhập lý do hủy ca (tối đa 500 ký tự)..."
                    : "Enter reason for cancellation (max 500 chars)..."
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 mb-4">
                <span>
                  {vi
                    ? "Bắt buộc điền lý do theo quy định"
                    : "Reason is required by clinic policy"}
                </span>
                <span
                  className={
                    cancelReason.length > 500 ? "text-rose-600 font-bold" : ""
                  }
                >
                  {cancelReason.length}/500
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancellingShift(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  {vi ? "Đóng" : "Close"}
                </button>
                <button
                  type="submit"
                  disabled={
                    !cancelReason.trim() ||
                    isCancelling ||
                    cancelReason.length > 500
                  }
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                >
                  {isCancelling
                    ? vi
                      ? "Đang xử lý..."
                      : "Processing..."
                    : vi
                      ? "Xác nhận hủy ca"
                      : "Confirm Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal từ chối yêu cầu đổi lịch / xin nghỉ */}
      {rejectingRequestId !== null && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isRejecting)
              setRejectingRequestId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-600" />
                <span>{vi ? "Từ chối yêu cầu đổi lịch" : "Reject Shift Request"}</span>
              </h3>
              <button
                type="button"
                disabled={isRejecting}
                onClick={() => setRejectingRequestId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRejectRequest}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {vi ? "Ghi chú từ chối (bắt buộc)" : "Rejection note (required)"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder={
                  vi
                    ? "Nhập lý do từ chối yêu cầu của bác sĩ..."
                    : "Enter reason for rejecting doctor's request..."
                }
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  disabled={isRejecting}
                  onClick={() => setRejectingRequestId(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-50"
                >
                  {isRejecting
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
    </section>
  );
}
