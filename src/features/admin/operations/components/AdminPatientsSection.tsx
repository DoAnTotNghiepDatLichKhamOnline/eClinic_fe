import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBookingService as bookingService } from "@/services/booking";
import { useLanguage } from "@/shared/context/LanguageContext";
import { PatientDetailModal } from "./PatientDetailModal";
import type { PendingVerificationItem } from "../operations.types";
import styles from "../../AdminDashboardPage.module.css";

export function AdminPatientsSection() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const patientsQuery = useQuery({
    queryKey: ["booking", "admin-patients", patientSearch, patientPage],
    queryFn: () =>
      bookingService.getHoSoBenhNhanQuanTri({
        tuKhoa: patientSearch.trim() || undefined,
        trang: patientPage,
        kichThuoc: 20,
      }),
  });

  const verificationQuery = useQuery({
    queryKey: ["booking", "admin-patient-verification"],
    queryFn: () =>
      bookingService.getHoSoChoXacMinhQuanTri({ trang: 0, kichThuoc: 100 }),
  });

  const showFailure = (cause: unknown) => {
    setError(
      (cause as { response?: { data?: { thongDiep?: string } } }).response?.data
        ?.thongDiep ??
        (cause instanceof Error
          ? cause.message
          : vi
            ? "Thao tác thất bại."
            : "The operation failed."),
    );
    setMessage("");
  };

  const finish = async (text: string, keys: string[]) => {
    setError("");
    setMessage(text);
    await Promise.all(
      keys.map((key) => client.invalidateQueries({ queryKey: key.split("|") })),
    );
  };

  const handlePatientLink = async (id: number, approve: boolean) => {
    try {
      const response = approve
        ? await bookingService.xacMinhLienKetHoSo(id)
        : await bookingService.tuChoiLienKetHoSo(id, {
            lyDo:
              window
                .prompt(vi ? "Lý do từ chối:" : "Rejection reason:")
                ?.trim() || "",
          });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, [
        "booking|admin-patient-verification",
        "booking|admin-patients",
      ]);
    } catch (cause) {
      showFailure(cause);
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
              onClick={() =>
                void handlePatientLink(item.hoSo?.id ?? item.id ?? 0, false)
              }
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
              <th>ID</th>
              <th>{vi ? "Bệnh nhân" : "Patient"}</th>
              <th>{vi ? "Ngày sinh" : "Birth date"}</th>
              <th>{vi ? "Điện thoại" : "Phone"}</th>
              <th>{vi ? "CCCD" : "National ID"}</th>
              <th>{vi ? "Lịch hẹn" : "Appointments"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(patients?.noiDung ?? []).map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.hoTen}</td>
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
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.paginationBar}>
        <span>
          {vi
            ? `Trang ${patientPage + 1} / ${patients?.tongSoTrang ?? 1}`
            : `Page ${patientPage + 1} / ${patients?.tongSoTrang ?? 1}`}
        </span>
        <div className={styles.paginationActions}>
          <button
            className={styles.pageBtn}
            disabled={!patientPage}
            onClick={() => setPatientPage((page) => page - 1)}
          >
            {vi ? "Trước" : "Previous"}
          </button>
          <button
            className={styles.pageBtn}
            disabled={patientPage + 1 >= (patients?.tongSoTrang ?? 1)}
            onClick={() => setPatientPage((page) => page + 1)}
          >
            {vi ? "Sau" : "Next"}
          </button>
        </div>
      </div>
      {selectedPatientId !== null && (
        <PatientDetailModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onSaved={(msg) => setMessage(msg)}
          onError={showFailure}
        />
      )}
    </section>
  );
}
