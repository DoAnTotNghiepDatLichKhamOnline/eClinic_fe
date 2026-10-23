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
        {(() => {
          const rawData = patientDetailQuery.data?.duLieu as any;
          const patient = (rawData?.hoSo ?? rawData) || {};

          return (
            <>
              <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {patient.hoTen ?? (vi ? "Hồ sơ bệnh nhân" : "Patient profile")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {vi ? "Mã hồ sơ bệnh nhân:" : "Patient record ID:"} #{patientId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <p role="alert" className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
                  {modalError}
                </p>
              )}
              {modalMessage && (
                <p role="status" className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
                  {modalMessage}
                </p>
              )}

              {patientDetailQuery.isLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  {vi ? "Đang tải thông tin hồ sơ..." : "Loading patient record..."}
                </div>
              ) : patientDetailQuery.data?.duLieu ? (
                <form
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                  onSubmit={(event) => void savePatient(event)}
                >
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                    <span>{vi ? "Họ và tên bệnh nhân" : "Full Name"} <span className="text-rose-500">*</span></span>
                    <input
                      name="hoTen"
                      type="text"
                      required
                      defaultValue={patient.hoTen ?? ""}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                    <span>{vi ? "Ngày sinh" : "Date of Birth"}</span>
                    <input
                      name="ngaySinh"
                      type="date"
                      defaultValue={patient.ngaySinh ?? ""}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                    <span>{vi ? "Giới tính" : "Gender"}</span>
                    <select
                      name="gioiTinh"
                      defaultValue={patient.gioiTinh ?? "NAM"}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="NAM">{vi ? "Nam" : "Male"}</option>
                      <option value="NU">{vi ? "Nữ" : "Female"}</option>
                      <option value="KHAC">{vi ? "Khác" : "Other"}</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                    <span>{vi ? "Số điện thoại liên hệ" : "Phone Number"}</span>
                    <input
                      name="soDienThoai"
                      type="tel"
                      defaultValue={patient.soDienThoai ?? ""}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                    <span>{vi ? "Số CCCD / Định danh cá nhân" : "National ID / Citizen ID"}</span>
                    <input
                      name="cccd"
                      type="text"
                      defaultValue={patient.cccd ?? patient.soCccdGoc ?? ""}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                    <span>{vi ? "Số thẻ Bảo hiểm y tế (BHYT)" : "Health Insurance Card"}</span>
                    <input
                      name="soBaoHiemYTe"
                      type="text"
                      defaultValue={patient.soBaoHiemYTe ?? ""}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700 sm:col-span-2">
                    <span>{vi ? "Địa chỉ thường trú" : "Residential Address"}</span>
                    <input
                      name="diaChi"
                      type="text"
                      defaultValue={patient.diaChi ?? ""}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </label>

                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {vi ? "Đóng" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      {vi ? "Lưu thay đổi hồ sơ" : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : null}
            </>
          );
        })()}

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
