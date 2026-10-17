import { type FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBookingService as bookingService } from "@/services/booking";
import { useLanguage } from "@/shared/context/LanguageContext";
import { MedicalRecordHistoryModal } from "@/shared/components/medical/MedicalRecordHistoryModal";
import styles from "../../AdminDashboardPage.module.css";

interface PatientDetailModalProps {
  patientId: number;
  onClose: () => void;
  onSaved?: (message: string) => void;
  onError?: (cause: unknown) => void;
}

export function PatientDetailModal({
  patientId,
  onClose,
  onSaved,
  onError,
}: PatientDetailModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const [viewHistoryAppointmentId, setViewHistoryAppointmentId] = useState<number | null>(null);

  const patientDetailQuery = useQuery({
    queryKey: ["booking", "admin-patient-detail", patientId],
    queryFn: () => bookingService.getChiTietHoSoBenhNhanQuanTri(patientId),
  });

  const patientAppointmentsQuery = useQuery({
    queryKey: ["booking", "admin-patient-appointments", patientId],
    queryFn: () =>
      bookingService.getLichHenTrongHoSoQuanTri(patientId, {
        trang: 0,
        kichThuoc: 50,
      }),
  });

  const savePatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    try {
      const result = await bookingService.suaHoSoBenhNhanQuanTri(patientId, {
        hoTen: String(values.get("hoTen") || "").trim(),
        ngaySinh: String(values.get("ngaySinh") || "") || null,
        gioiTinh: String(values.get("gioiTinh") || "NAM") as
          | "NAM"
          | "NU"
          | "KHAC",
        soDienThoai: String(values.get("soDienThoai") || "") || null,
        diaChi: String(values.get("diaChi") || "") || null,
        soBaoHiemYTe: String(values.get("soBaoHiemYTe") || "") || null,
        cccd: String(values.get("cccd") || "") || null,
      });
      if (!result.thanhCong) throw new Error(result.thongDiep);
      setModalMessage(result.thongDiep);
      setModalError("");
      onSaved?.(result.thongDiep);
      await client.invalidateQueries({
        queryKey: ["booking", "admin-patient-detail", patientId],
      });
      await client.invalidateQueries({
        queryKey: ["booking", "admin-patients"],
      });
    } catch (cause) {
      const errMsg =
        (cause as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ??
        (cause instanceof Error
          ? cause.message
          : vi
            ? "Thao tác thất bại."
            : "The operation failed.");
      setModalError(errMsg);
      setModalMessage("");
      onError?.(cause);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={vi ? "Chi tiết hồ sơ bệnh nhân" : "Patient profile detail"}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6"
      >
        <div className="mb-5 flex justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold">
            {patientDetailQuery.data?.duLieu?.hoSo.hoTen ??
              (vi ? "Hồ sơ bệnh nhân" : "Patient profile")}
          </h2>
          <button type="button" onClick={onClose}>
            {vi ? "Đóng" : "Close"}
          </button>
        </div>

        {modalError && (
          <p role="alert" className="mb-3 text-sm text-rose-700">
            {modalError}
          </p>
        )}
        {modalMessage && (
          <p role="status" className="mb-3 text-sm text-emerald-800">
            {modalMessage}
          </p>
        )}

        {patientDetailQuery.data?.duLieu && (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => void savePatient(event)}
          >
            {(
              [
                "hoTen",
                "ngaySinh",
                "soDienThoai",
                "cccd",
                "diaChi",
                "soBaoHiemYTe",
              ] as const
            ).map((field) => (
              <label className="grid gap-1 text-xs" key={field}>
                {field}
                <input
                  name={field}
                  type={field === "ngaySinh" ? "date" : "text"}
                  defaultValue={
                    patientDetailQuery.data!.duLieu!.hoSo[field] ?? ""
                  }
                />
              </label>
            ))}
            <label className="grid gap-1 text-xs">
              {vi ? "Giới tính" : "Gender"}
              <select
                name="gioiTinh"
                defaultValue={
                  patientDetailQuery.data.duLieu.hoSo.gioiTinh ?? "NAM"
                }
              >
                <option value="NAM">NAM</option>
                <option value="NU">NU</option>
                <option value="KHAC">KHAC</option>
              </select>
            </label>
            <button className={styles.actionBtn} type="submit">
              {vi ? "Lưu hồ sơ" : "Save profile"}
            </button>
          </form>
        )}

        {patientAppointmentsQuery.data?.duLieu?.noiDung && (
          <div className="mt-6">
            <h3 className="mb-2 font-semibold">
              {vi ? "Lịch sử lịch hẹn" : "Appointment history"}
            </h3>
            <div className="grid gap-2">
              {patientAppointmentsQuery.data.duLieu.noiDung.map((appointment) => (
                <div
                  className="border-b border-slate-100 py-3 flex flex-wrap items-center justify-between gap-2 text-sm"
                  key={appointment.maPhieuKham}
                >
                  <div>
                    <strong>
                      {appointment.ngay} · {appointment.gioKhamDuKien}
                    </strong>
                    <p className="text-xs text-slate-600 m-0">
                      {appointment.bacSi.hoTen} · Mã: {appointment.maPhieuKham} · {appointment.trangThai}
                    </p>
                    {appointment.doiChieu?.canDoiChieu && (
                      <span className="inline-block mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {vi
                          ? "Cần đối chiếu giấy tờ (Họ tên / Ngày sinh)"
                          : "Document verification needed"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.id && appointment.trangThai === "DA_HOAN_THANH" && (
                      <button
                        type="button"
                        className={`${styles.actionBtn} text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200`}
                        onClick={() => setViewHistoryAppointmentId(appointment.id ?? null)}
                      >
                        {vi ? "Lịch sử sửa bệnh án" : "Record History"}
                      </button>
                    )}
                    {appointment.doiChieu?.canDoiChieu && appointment.id && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={async () => {
                          if (!appointment.id) return;
                          try {
                            const res = await bookingService.danhDauDaDoiChieuQuanTri(
                              appointment.id,
                            );
                            if (!res.thanhCong) throw new Error(res.thongDiep);
                            setModalMessage(
                              res.thongDiep ||
                                (vi
                                  ? "Đã xác nhận đối chiếu giấy tờ thành công"
                                  : "Document verified"),
                            );
                            await client.invalidateQueries({
                              queryKey: [
                                "booking",
                                "admin-patient-appointments",
                                patientId,
                              ],
                            });
                          } catch (err: any) {
                            setModalError(
                              err.response?.data?.thongDiep ||
                                err.message ||
                                "Error",
                            );
                          }
                        }}
                      >
                        {vi ? "Đã đối chiếu" : "Mark Verified"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewHistoryAppointmentId && (
          <MedicalRecordHistoryModal
            idLichHen={viewHistoryAppointmentId}
            role="admin"
            onClose={() => setViewHistoryAppointmentId(null)}
          />
        )}
      </section>
    </div>
  );
}
