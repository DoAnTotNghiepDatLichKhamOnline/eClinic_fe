import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBookingService as bookingService } from "@/services/booking";
import { doctorService, clinicService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { TaoCaRequest, CaLamViecResponse } from "@/types/booking.type";
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

  const from = currentDateKey(new Date());
  const throughDate = new Date();
  throughDate.setDate(throughDate.getDate() + 41);
  const through = currentDateKey(throughDate);

  const [selectedShiftForPatients, setSelectedShiftForPatients] = useState<CaLamViecResponse | null>(null);
  const [editingShift, setEditingShift] = useState<CaLamViecResponse | null>(null);

  const shiftQuery = useQuery({
    queryKey: ["booking", "admin-shifts", from, through],
    queryFn: () =>
      bookingService.getLichLamViecQuanTri({ tuNgay: from, denNgay: through }),
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

  const createShift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const weekDays = values.getAll("repeatDay").map(Number);
    const request: TaoCaRequest = {
      idBacSi: Number(values.get("idBacSi")),
      idPhongKham: Number(values.get("idPhongKham")),
      ngay: String(values.get("ngay")),
      gioBatDau: String(values.get("gioBatDau")),
      gioKetThuc: String(values.get("gioKetThuc")),
      soLuotToiDaMoiGio: Number(values.get("soLuotToiDaMoiGio")),
      thoiLuongLuotPhut: Number(values.get("thoiLuongLuotPhut")),
      ...(weekDays.length
        ? {
            lapLai: {
              cacThu: weekDays,
              denNgay: String(values.get("denNgay")),
            },
          }
        : {}),
    };
    try {
      const result = await bookingService.taoCaLamViec(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["booking|admin-shifts"]);
      form.reset();
    } catch (cause) {
      showFailure(cause);
    }
  };

  const cancelShift = async (id: number) => {
    const lyDo = window
      .prompt(
        vi ? "Lý do hủy ca (bắt buộc):" : "Cancellation reason (required):",
      )
      ?.trim();
    if (!lyDo) return;
    try {
      const result = await bookingService.huyCaLamViec(id, { lyDo });
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, [
        "booking|admin-shifts",
        "booking|admin-reschedule-needed",
      ]);
    } catch (cause) {
      showFailure(cause);
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
    const ghiChu = approve
      ? ""
      : window
          .prompt(vi ? "Ghi chú từ chối:" : "Reason for rejection:")
          ?.trim();
    if (!approve && !ghiChu) return;
    try {
      const result = await bookingService.xuLyYeuCauDoiLich(
        id,
        { ghiChu },
        approve,
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

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {vi ? "Ca làm việc sắp tới" : "Upcoming shifts"}
        </h2>
        <span>
          {from} — {through}
        </span>
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
      <form
        className="mb-6 grid gap-3 border-b border-slate-200 pb-6 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => void createShift(event)}
      >
        <label className="grid gap-1 text-xs">
          {vi ? "Bác sĩ" : "Doctor"}
          <select name="idBacSi" required defaultValue="">
            <option value="" disabled>
              {vi ? "Chọn bác sĩ" : "Select doctor"}
            </option>
            {(doctorsQuery.data?.duLieu?.noiDung ?? [])
              .filter((doctor) => doctor.trangThai === "DANG_CONG_TAC")
              .map((doctor) => (
                <option value={doctor.id} key={doctor.id}>
                  {doctor.hoTen} · {doctor.tenChuyenKhoa}
                </option>
              ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          {vi ? "Phòng khám" : "Clinic"}
          <select name="idPhongKham" required defaultValue="">
            <option value="" disabled>
              {vi ? "Chọn phòng" : "Select clinic"}
            </option>
            {(clinicsQuery.data?.duLieu?.noiDung ?? [])
              .filter((clinic) => clinic.trangThai === "HOAT_DONG")
              .map((clinic) => (
                <option value={clinic.id} key={clinic.id}>
                  {clinic.tenPhong}
                </option>
              ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          {vi ? "Ngày" : "Date"}
          <input name="ngay" type="date" required min={from} max={through} />
        </label>
        <label className="grid gap-1 text-xs">
          {vi ? "Bắt đầu" : "Start"}
          <input name="gioBatDau" type="time" required />
        </label>
        <label className="grid gap-1 text-xs">
          {vi ? "Kết thúc" : "End"}
          <input name="gioKetThuc" type="time" required />
        </label>
        <label className="grid gap-1 text-xs">
          {vi ? "Lượt/giờ" : "Visits/hour"}
          <input
            name="soLuotToiDaMoiGio"
            type="number"
            min={1}
            max={60}
            required
            defaultValue={1}
          />
        </label>
        <label className="grid gap-1 text-xs">
          {vi ? "Thời lượng lượt (phút)" : "Visit duration (min)"}
          <input
            name="thoiLuongLuotPhut"
            type="number"
            min={1}
            max={60}
            required
            defaultValue={30}
          />
        </label>
        <label className="grid gap-1 text-xs">
          {vi ? "Lặp đến ngày" : "Repeat through"}
          <input name="denNgay" type="date" min={from} max={through} />
        </label>
        <fieldset className="flex flex-wrap gap-2 text-xs sm:col-span-2 lg:col-span-4">
          <legend>
            {vi
              ? "Ngày lặp (để trống nếu không lặp)"
              : "Repeat days (leave blank for one shift)"}
          </legend>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <label className="inline-flex items-center gap-1" key={day}>
              <input type="checkbox" name="repeatDay" value={day} />
              {vi
                ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][day - 1]
                : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day - 1]}
            </label>
          ))}
        </fieldset>
        <button className={styles.actionBtn} type="submit">
          {vi ? "Xếp ca" : "Create shifts"}
        </button>
      </form>
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
            {(shiftQuery.data?.duLieu ?? []).map((shift) => (
              <tr key={shift.id}>
                <td>{shift.ngay}</td>
                <td>{shift.hoTenBacSi}</td>
                <td>
                  {shift.gioBatDau} - {shift.gioKetThuc}
                </td>
                <td>{shift.tenPhongKham}</td>
                <td>
                  {shift.soLuotDaDat ?? shift.soChoDaDat}/
                  {shift.tongSoLuot ?? shift.tongSoCho}
                </td>
                <td>{shift.trangThai}</td>
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
                        onClick={() => void cancelShift(shift.id)}
                      >
                        {vi ? "Hủy ca" : "Cancel shift"}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
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
      {(waitingAppointmentsQuery.data?.duLieu?.noiDung ?? []).map(
        (appointment) => (
          <p
            className="border-b border-slate-100 py-2 text-sm"
            key={appointment.maPhieuKham}
          >
            {appointment.ngay} · {appointment.gioKhamDuKien} ·{" "}
            {appointment.hoTenBenhNhan} · {appointment.maTraCuu}
          </p>
        ),
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
                  {selectedShiftForPatients.hoTenBacSi} · {selectedShiftForPatients.ngay} ({selectedShiftForPatients.gioBatDau} - {selectedShiftForPatients.gioKetThuc}) · {selectedShiftForPatients.tenPhongKham}
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
                <p className="text-center text-xs text-slate-400 py-8">{vi ? "Đang tải danh sách..." : "Loading..."}</p>
              ) : (shiftPatientsQuery.data?.duLieu ?? []).length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">{vi ? "Chưa có bệnh nhân nào đặt lịch trong ca này." : "No patients booked for this shift."}</p>
              ) : (
                <div className="space-y-3">
                  {(shiftPatientsQuery.data?.duLieu ?? []).map((appt) => (
                    <div
                      key={appt.maPhieuKham}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            STT #{appt.soThuTu}
                          </span>
                          <span className="font-semibold text-slate-800 text-sm">{appt.hoTenBenhNhan}</span>
                        </div>
                        <p className="text-slate-500 mt-1">
                          {appt.gioKhamDuKien ? `${appt.gioKhamDuKien} - ` : ""}{appt.gioKetThucKhung} · {vi ? "Mã" : "Code"}: {appt.maTraCuu}
                        </p>
                        {appt.lyDoKham && (
                          <p className="text-slate-600 italic mt-0.5">{appt.lyDoKham}</p>
                        )}
                        {appt.doiChieu?.canDoiChieu && (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            {vi ? "Thông tin khác hồ sơ, cần đối chiếu" : "Verification needed"}
                          </span>
                        )}
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {appt.trangThai}
                      </span>
                    </div>
                  ))}
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
            <form onSubmit={handleSaveEditShift} className="grid gap-3 text-xs sm:grid-cols-2">
              <label className="grid gap-1 sm:col-span-2">
                {vi ? "Phòng khám" : "Clinic Room"}
                <select name="idPhongKham" defaultValue={editingShift.idPhongKham} required>
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
                <input name="gioBatDau" defaultValue={editingShift.gioBatDau} required />
              </label>
              <label className="grid gap-1">
                {vi ? "Giờ kết thúc (HH:mm)" : "End time"}
                <input name="gioKetThuc" defaultValue={editingShift.gioKetThuc} required />
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
                <button
                  type="submit"
                  className={styles.actionBtn}
                >
                  {vi ? "Lưu thay đổi" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
