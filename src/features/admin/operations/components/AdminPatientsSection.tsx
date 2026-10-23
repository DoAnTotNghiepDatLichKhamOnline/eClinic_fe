import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { adminBookingService as bookingService } from "@/services/booking";
import { useLanguage } from "@/shared/context/LanguageContext";
import { PatientDetailModal } from "./PatientDetailModal";
import { Pagination } from "@/shared/components/ui/Pagination";
import { notifyAuth } from "@/utils/authNotification";
import type { PendingVerificationItem } from "../operations.types";
import type { LichHenCuaToiResponse } from "@/types/booking.type";
import styles from "../../AdminDashboardPage.module.css";

export function AdminPatientsSection() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [patientSearch, setPatientSearch] = useState("");
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Appointment lookup by code (maTraCuu / maPhieuKham)
  const [appointmentLookupCode, setAppointmentLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState<LichHenCuaToiResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // Debounce search 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPatientSearch(patientSearch.trim());
      setPatientPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const patientsQuery = useQuery({
    queryKey: ["booking", "admin-patients", debouncedPatientSearch, patientPage],
    queryFn: () =>
      bookingService.getHoSoBenhNhanQuanTri({
        tuKhoa: debouncedPatientSearch || undefined,
        trang: patientPage,
        kichThuoc: 20,
      }),
  });

  type PatientSortField = "id" | "hoTen" | "ngaySinh" | "soDienThoai";
  const [sortField, setSortField] = useState<PatientSortField>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: PatientSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIndicator = (field: PatientSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={13} className="text-teal-700" />
    ) : (
      <ArrowDown size={13} className="text-teal-700" />
    );
  };

  const sortedPatients = useMemo(() => {
    const list = [...(patientsQuery.data?.duLieu?.noiDung ?? [])];
    list.sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal), vi ? "vi" : "en", { sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return list;
  }, [patientsQuery.data?.duLieu?.noiDung, sortField, sortDirection, vi]);

  const verificationQuery = useQuery({
    queryKey: ["booking", "admin-patient-verification"],
    queryFn: () =>
      bookingService.getHoSoChoXacMinhQuanTri({ trang: 0, kichThuoc: 100 }),
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

  const [rejectingLinkId, setRejectingLinkId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handlePatientLink = async (id: number, approve: boolean, reason?: string) => {
    try {
      const response = approve
        ? await bookingService.xacMinhLienKetHoSo(id)
        : await bookingService.tuChoiLienKetHoSo(id, {
            lyDo: reason?.trim() || "",
          });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, [
        "booking|admin-patient-verification",
        "booking|admin-patients",
      ]);
      setRejectingLinkId(null);
      setRejectReason("");
    } catch (cause) {
      showFailure(cause);
    }
  };

  const handleLookupAppointment = async (e: FormEvent) => {
    e.preventDefault();
    if (!appointmentLookupCode.trim()) return;
    setIsLookingUp(true);
    setLookupError("");
    setLookupResult(null);
    try {
      const res = await bookingService.traCuuLichHenQuanTri(appointmentLookupCode.trim());
      if (res.thanhCong && res.duLieu) {
        setLookupResult(res.duLieu);
      } else {
        setLookupError(res.thongDiep || (vi ? "Không tìm thấy lịch hẹn" : "Appointment not found"));
      }
    } catch (err: any) {
      setLookupError(err?.response?.data?.thongDiep || (vi ? "Không tìm thấy lịch hẹn" : "Appointment not found"));
    } finally {
      setIsLookingUp(false);
    }
  };

  const patients = patientsQuery.data?.duLieu;
  const pending = verificationQuery.data?.duLieu as
    | {
        noiDung?: PendingVerificationItem[];
      }
    | undefined;

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {vi ? "Hồ sơ bệnh nhân" : "Patient profiles"}
        </h2>
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

      {/* Tra cứu nhanh lịch hẹn theo mã */}
      <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
        <h3 className="text-xs font-bold text-teal-900 mb-2">
          {vi ? "Tra cứu nhanh lịch hẹn (theo Mã tra cứu hoặc Mã phiếu khám)" : "Quick Appointment Lookup"}
        </h3>
        <form onSubmit={handleLookupAppointment} className="flex gap-2">
          <input
            className={styles.searchInput}
            value={appointmentLookupCode}
            onChange={(e) => setAppointmentLookupCode(e.target.value)}
            placeholder="ECL-20261017-0001 / token..."
          />
          <button
            type="submit"
            disabled={isLookingUp}
            className={styles.actionBtn}
          >
            {isLookingUp ? (vi ? "Đang tìm..." : "Searching...") : (vi ? "Tra cứu" : "Lookup")}
          </button>
        </form>

        {lookupError && (
          <p className="mt-2 text-xs text-rose-600">{lookupError}</p>
        )}

        {lookupResult && (
          <div className="mt-3 rounded-xl bg-white p-3 border border-teal-200 shadow-sm text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="font-bold text-slate-800 text-sm">{lookupResult.hoTenBenhNhan}</span>
                <span className="ml-2 text-slate-500">({lookupResult.maTraCuu})</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                {lookupResult.trangThai}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-slate-600">
              <p><strong>{vi ? "Bác sĩ:" : "Doctor:"}</strong> {lookupResult.bacSi?.hoTen}</p>
              <p><strong>{vi ? "Thời gian:" : "Time:"}</strong> {lookupResult.ngay} · {lookupResult.gioKhamDuKien}</p>
              <p><strong>{vi ? "Phòng khám:" : "Room:"}</strong> {lookupResult.phongKham?.tenPhong}</p>
              <p><strong>{vi ? "Lý do khám:" : "Reason:"}</strong> {lookupResult.lyDoKham}</p>
            </div>
            {lookupResult.doiChieu?.canDoiChieu && (
              <div className="mt-2 flex items-center justify-between bg-amber-50 p-2 rounded text-amber-900 border border-amber-200">
                <span className="text-[11px] font-medium">
                  {vi ? "Thông tin đặt lịch khác hồ sơ bệnh nhân, cần đối chiếu giấy tờ!" : "Verification needed!"}
                </span>
                {lookupResult.id && (
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={async () => {
                      if (!lookupResult.id) return;
                      try {
                        const res = await bookingService.danhDauDaDoiChieuQuanTri(lookupResult.id);
                        if (res.thanhCong) {
                          setLookupResult({
                            ...lookupResult,
                            doiChieu: { ...lookupResult.doiChieu, canDoiChieu: false }
                          });
                          const successMsg = res.thongDiep || (vi ? "Đã đối chiếu giấy tờ thành công" : "Verified successfully");
                          setMessage(successMsg);
                          notifyAuth("success", vi ? "Thành công" : "Success", successMsg);
                        }
                      } catch (err: any) {
                        setError(err?.message || "Error");
                      }
                    }}
                  >
                    {vi ? "Đã đối chiếu" : "Mark Verified"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <h3 className="mb-2 font-semibold">
        {vi ? "Liên kết chờ xác minh" : "Pending profile links"}
      </h3>
      {(pending?.noiDung ?? []).map((item) => (
        <article
          className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3"
          key={item.id ?? item.hoSo?.id}
        >
          <div>
            <strong>{item.hoSo?.hoTen ?? item.taiKhoan?.hoTen}</strong>
            <p className="text-xs text-slate-600">
              {item.taiKhoan?.email} · {vi ? "Khớp tên" : "Name match"}:{" "}
              {item.khopHoTen ? "✓" : "—"} ·{" "}
              {vi ? "Khớp điện thoại" : "Phone match"}:{" "}
              {item.khopSoDienThoai ? "✓" : "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className={styles.actionBtn}
              type="button"
              onClick={() =>
                void handlePatientLink(item.hoSo?.id ?? item.id ?? 0, true)
              }
            >
              {vi ? "Duyệt" : "Approve"}
            </button>
            <button
              className={styles.actionBtnDanger}
              type="button"
              onClick={() => {
                setRejectingLinkId(item.hoSo?.id ?? item.id ?? 0);
                setRejectReason("");
              }}
            >
              {vi ? "Từ chối" : "Reject"}
            </button>
          </div>
        </article>
      ))}
      <div className="my-5 flex gap-2">
        <input
          className={styles.searchInput}
          value={patientSearch}
          onChange={(event) => {
            setPatientSearch(event.target.value);
            setPatientPage(0);
          }}
          placeholder={
            vi
              ? "Tìm tên, điện thoại, CCCD đủ 12 số..."
              : "Search name, phone, full 12-digit ID..."
          }
        />
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  onClick={() => handleSort("id")}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-teal-800 transition-colors"
                >
                  <span>ID</span>
                  {renderSortIndicator("id")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => handleSort("hoTen")}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-teal-800 transition-colors"
                >
                  <span>{vi ? "Bệnh nhân" : "Patient"}</span>
                  {renderSortIndicator("hoTen")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => handleSort("ngaySinh")}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-teal-800 transition-colors"
                >
                  <span>{vi ? "Ngày sinh" : "Birth date"}</span>
                  {renderSortIndicator("ngaySinh")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => handleSort("soDienThoai")}
                  className="group inline-flex items-center gap-1.5 font-bold hover:text-teal-800 transition-colors"
                >
                  <span>{vi ? "Điện thoại" : "Phone"}</span>
                  {renderSortIndicator("soDienThoai")}
                </button>
              </th>
              <th>{vi ? "CCCD" : "National ID"}</th>
              <th>{vi ? "Lịch hẹn" : "Appointments"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-xs text-slate-500">
                  {patientsQuery.isLoading
                    ? (vi ? "Đang tải hồ sơ bệnh nhân..." : "Loading patients...")
                    : (vi ? "Không tìm thấy hồ sơ nào." : "No patient records found.")}
                </td>
              </tr>
            ) : (
              sortedPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td className="font-medium text-slate-800">{patient.hoTen}</td>
                  <td>{patient.ngaySinh ?? "—"}</td>
                  <td>{patient.soDienThoai ?? "—"}</td>
                  <td>{patient.cccdChe ?? "—"}</td>
                  <td>{patient.soLichHen ?? "—"}</td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      type="button"
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      {vi ? "Chi tiết" : "Details"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={patientPage}
        totalPages={patients?.tongSoTrang ?? 1}
        totalElements={patients?.tongSoPhanTu}
        pageSize={20}
        onPageChange={setPatientPage}
      />
      {selectedPatientId !== null && (
        <PatientDetailModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onSaved={(msg) => setMessage(msg)}
          onError={showFailure}
        />
      )}

      {/* REJECTION MODAL */}
      {rejectingLinkId !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-rose-700 mb-2">
              {vi ? "Từ chối liên kết hồ sơ bệnh nhân" : "Reject Profile Linkage"}
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              {vi
                ? "Vui lòng nhập lý do từ chối để thông báo cho người dùng."
                : "Please enter a reason for rejection to notify the user."}
            </p>
            <textarea
              rows={3}
              required
              className="w-full p-2 border rounded text-xs mb-4"
              placeholder={
                vi
                  ? "Ví dụ: Thông tin CCCD không trùng khớp với hồ sơ lưu trữ..."
                  : "e.g. Identity documents do not match archive..."
              }
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setRejectingLinkId(null)}
              >
                {vi ? "Hủy" : "Cancel"}
              </button>
              <button
                type="button"
                className={styles.actionBtnDanger}
                disabled={!rejectReason.trim()}
                onClick={() => void handlePatientLink(rejectingLinkId, false, rejectReason)}
              >
                {vi ? "Xác nhận từ chối" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
