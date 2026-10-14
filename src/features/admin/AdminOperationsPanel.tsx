import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/bookingService";
import { catalogService } from "@/services/catalogService";
import { useLanguage } from "@/shared/context/LanguageContext";
import type { AdminSection } from "./AdminSidebar";
import type { ChuyenKhoaRequest, PhongKhamRequest, ThuocRequest } from "@/types/catalog.type";
import type { TaoCaRequest } from "@/types/booking.type";
import styles from "./AdminDashboardPage.module.css";

type OperationsSection = Extract<AdminSection, "schedule" | "catalog" | "patients">;
type CatalogTab = "specialties" | "clinics" | "medicines";

function currentDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AdminOperationsPanel({ activeSection }: { activeSection: OperationsSection }) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<CatalogTab>("specialties");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(0);
  const from = currentDateKey(new Date());
  const throughDate = new Date();
  throughDate.setDate(throughDate.getDate() + 41);
  const through = currentDateKey(throughDate);

  const shiftQuery = useQuery({
    queryKey: ["booking", "admin-shifts", from, through],
    queryFn: () => bookingService.getLichLamViecQuanTri({ tuNgay: from, denNgay: through }),
    enabled: activeSection === "schedule",
  });
  const doctorsQuery = useQuery({
    queryKey: ["catalog", "admin-doctors"],
    queryFn: () => catalogService.getDanhSachBacSiQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "schedule",
  });
  const clinicsQuery = useQuery({
    queryKey: ["catalog", "admin-clinics", tab],
    queryFn: () => catalogService.getDanhSachPhongKhamQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "schedule" || (activeSection === "catalog" && tab === "clinics"),
  });
  const requestsQuery = useQuery({
    queryKey: ["booking", "admin-shift-requests"],
    queryFn: () => bookingService.getYeuCauDoiLichQuanTri({ trangThai: "CHO_DUYET", trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "schedule",
  });
  const waitingAppointmentsQuery = useQuery({
    queryKey: ["booking", "admin-reschedule-needed"],
    queryFn: () => bookingService.getLichHenCanDoiLich({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "schedule",
  });
  const specialtiesQuery = useQuery({
    queryKey: ["catalog", "admin-specialties"],
    queryFn: () => catalogService.getDanhSachChuyenKhoaQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "catalog" && tab === "specialties",
  });
  const medicinesQuery = useQuery({
    queryKey: ["catalog", "admin-medicines"],
    queryFn: () => catalogService.getDanhSachThuocQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "catalog" && tab === "medicines",
  });
  const patientsQuery = useQuery({
    queryKey: ["booking", "admin-patients", patientSearch, patientPage],
    queryFn: () => bookingService.getHoSoBenhNhanQuanTri({ tuKhoa: patientSearch.trim() || undefined, trang: patientPage, kichThuoc: 20 }),
    enabled: activeSection === "patients",
  });
  const verificationQuery = useQuery({
    queryKey: ["booking", "admin-patient-verification"],
    queryFn: () => bookingService.getHoSoChoXacMinhQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: activeSection === "patients",
  });

  const showFailure = (cause: unknown) => {
    setError((cause as { response?: { data?: { thongDiep?: string } } }).response?.data?.thongDiep ?? (cause instanceof Error ? cause.message : (vi ? "Thao tác thất bại." : "The operation failed.")));
    setMessage("");
  };
  const finish = async (text: string, keys: string[]) => {
    setError("");
    setMessage(text);
    await Promise.all(keys.map((key) => client.invalidateQueries({ queryKey: key.split("|") })));
  };

  const createShift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const weekDays = values.getAll("repeatDay").map(Number);
    const request: TaoCaRequest = {
      idBacSi: Number(values.get("idBacSi")),
      idPhongKham: Number(values.get("idPhongKham")),
      ngay: String(values.get("ngay")),
      gioBatDau: String(values.get("gioBatDau")),
      gioKetThuc: String(values.get("gioKetThuc")),
      soLuotToiDaMoiGio: Number(values.get("soLuotToiDaMoiGio")),
      thoiLuongLuotPhut: Number(values.get("thoiLuongLuotPhut")),
      ...(weekDays.length ? { lapLai: { cacThu: weekDays, denNgay: String(values.get("denNgay")) } } : {}),
    };
    try {
      const result = await bookingService.taoCaLamViec(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["booking|admin-shifts"]);
      event.currentTarget.reset();
    } catch (cause) { showFailure(cause); }
  };

  const cancelShift = async (id: number) => {
    const lyDo = window.prompt(vi ? "Lý do hủy ca (bắt buộc):" : "Cancellation reason (required):")?.trim();
    if (!lyDo) return;
    try {
      const result = await bookingService.huyCaLamViec(id, { lyDo });
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["booking|admin-shifts", "booking|admin-reschedule-needed"]);
    } catch (cause) { showFailure(cause); }
  };

  const decideRequest = async (id: number, approve: boolean) => {
    const ghiChu = approve ? "" : window.prompt(vi ? "Ghi chú từ chối:" : "Reason for rejection:")?.trim();
    if (!approve && !ghiChu) return;
    try {
      const result = await bookingService.xuLyYeuCauDoiLich(id, { ghiChu }, approve);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["booking|admin-shift-requests", "booking|admin-shifts"]);
    } catch (cause) { showFailure(cause); }
  };

  const saveSpecialty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const request: ChuyenKhoaRequest = {
      tenChuyenKhoa: String(values.get("tenChuyenKhoa")),
      moTa: String(values.get("moTa") || "") || null,
      tenChuyenKhoaEn: String(values.get("tenChuyenKhoaEn") || "") || null,
      moTaEn: String(values.get("moTaEn") || "") || null,
      trieuChung: String(values.get("trieuChung") || "") || null,
      trieuChungEn: String(values.get("trieuChungEn") || "") || null,
    };
    try {
      const result = await catalogService.taoChuyenKhoa(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["catalog|admin-specialties", "catalog|chuyen-khoa"]);
      event.currentTarget.reset();
    } catch (cause) { showFailure(cause); }
  };

  const saveClinic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const request: PhongKhamRequest = {
      tenPhong: String(values.get("tenPhong")),
      tang: String(values.get("tang") || "") || null,
      idChuyenKhoa: Number(values.get("idChuyenKhoa")),
      tenPhongEn: String(values.get("tenPhongEn") || "") || null,
      tangEn: String(values.get("tangEn") || "") || null,
    };
    try {
      const result = await catalogService.themPhongKham(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["catalog|admin-clinics", "catalog|phong-kham"]);
      event.currentTarget.reset();
    } catch (cause) { showFailure(cause); }
  };

  const saveMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const request: ThuocRequest = {
      tenThuoc: String(values.get("tenThuoc")),
      donVi: String(values.get("donVi") || "") || null,
      moTa: String(values.get("moTa") || "") || null,
      donViEn: String(values.get("donViEn") || "") || null,
      moTaEn: String(values.get("moTaEn") || "") || null,
    };
    try {
      const result = await catalogService.taoThuoc(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["catalog|admin-medicines"]);
      event.currentTarget.reset();
    } catch (cause) { showFailure(cause); }
  };

  const handlePatientLink = async (id: number, approve: boolean) => {
    try {
      const response = approve ? await bookingService.xacMinhLienKetHoSo(id) : await bookingService.tuChoiLienKetHoSo(id, { lyDo: window.prompt(vi ? "Lý do từ chối:" : "Rejection reason:")?.trim() || "" });
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, ["booking|admin-patient-verification", "booking|admin-patients"]);
    } catch (cause) { showFailure(cause); }
  };

  if (activeSection === "schedule") return <section className={styles.sectionCard}>
    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>{vi ? "Ca làm việc sắp tới" : "Upcoming shifts"}</h2><span>{from} — {through}</span></div>
    {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}{message && <p role="status" className="mb-3 text-sm text-emerald-800">{message}</p>}
    <form className="mb-6 grid gap-3 border-b border-slate-200 pb-6 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => void createShift(event)}>
      <label className="grid gap-1 text-xs">{vi ? "Bác sĩ" : "Doctor"}<select name="idBacSi" required defaultValue=""><option value="" disabled>{vi ? "Chọn bác sĩ" : "Select doctor"}</option>{(doctorsQuery.data?.duLieu?.noiDung ?? []).filter((doctor) => doctor.trangThai === "DANG_CONG_TAC").map((doctor) => <option value={doctor.id} key={doctor.id}>{doctor.hoTen} · {doctor.tenChuyenKhoa}</option>)}</select></label>
      <label className="grid gap-1 text-xs">{vi ? "Phòng khám" : "Clinic"}<select name="idPhongKham" required defaultValue=""><option value="" disabled>{vi ? "Chọn phòng" : "Select clinic"}</option>{(clinicsQuery.data?.duLieu?.noiDung ?? []).filter((clinic) => clinic.trangThai === "HOAT_DONG").map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.tenPhong}</option>)}</select></label>
      <label className="grid gap-1 text-xs">{vi ? "Ngày" : "Date"}<input name="ngay" type="date" required min={from} max={through} /></label>
      <label className="grid gap-1 text-xs">{vi ? "Bắt đầu" : "Start"}<input name="gioBatDau" type="time" required /></label>
      <label className="grid gap-1 text-xs">{vi ? "Kết thúc" : "End"}<input name="gioKetThuc" type="time" required /></label>
      <label className="grid gap-1 text-xs">{vi ? "Lượt/giờ" : "Visits/hour"}<input name="soLuotToiDaMoiGio" type="number" min={1} max={60} required defaultValue={1} /></label>
      <label className="grid gap-1 text-xs">{vi ? "Thời lượng lượt (phút)" : "Visit duration (min)"}<input name="thoiLuongLuotPhut" type="number" min={1} max={60} required defaultValue={30} /></label>
      <label className="grid gap-1 text-xs">{vi ? "Lặp đến ngày" : "Repeat through"}<input name="denNgay" type="date" min={from} max={through} /></label>
      <fieldset className="flex flex-wrap gap-2 text-xs sm:col-span-2 lg:col-span-4"><legend>{vi ? "Ngày lặp (để trống nếu không lặp)" : "Repeat days (leave blank for one shift)"}</legend>{[1,2,3,4,5,6,7].map((day) => <label className="inline-flex items-center gap-1" key={day}><input type="checkbox" name="repeatDay" value={day} />{vi ? ["T2","T3","T4","T5","T6","T7","CN"][day-1] : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][day-1]}</label>)}</fieldset>
      <button className={styles.actionBtn} type="submit">{vi ? "Xếp ca" : "Create shifts"}</button>
    </form>
    <div className={styles.tableScroll}><table className={styles.adminTable}><thead><tr><th>{vi ? "Ngày" : "Date"}</th><th>{vi ? "Bác sĩ" : "Doctor"}</th><th>{vi ? "Ca" : "Shift"}</th><th>{vi ? "Phòng" : "Clinic"}</th><th>{vi ? "Đã đặt" : "Booked"}</th><th>{vi ? "Trạng thái" : "Status"}</th><th /></tr></thead><tbody>{(shiftQuery.data?.duLieu ?? []).map((shift) => <tr key={shift.id}><td>{shift.ngay}</td><td>{shift.hoTenBacSi}</td><td>{shift.gioBatDau} - {shift.gioKetThuc}</td><td>{shift.tenPhongKham}</td><td>{shift.soLuotDaDat ?? shift.soChoDaDat}/{shift.tongSoLuot ?? shift.tongSoCho}</td><td>{shift.trangThai}</td><td>{shift.trangThai === "HOAT_DONG" && <button className={styles.actionBtnDanger} type="button" onClick={() => void cancelShift(shift.id)}>{vi ? "Hủy ca" : "Cancel shift"}</button>}</td></tr>)}</tbody></table></div>
    <h3 className="mb-3 mt-8 font-semibold">{vi ? "Yêu cầu đổi ca / xin nghỉ" : "Shift change and leave requests"}</h3>
    {(requestsQuery.data?.duLieu?.noiDung ?? []).map((request) => <article className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3" key={request.id}><div><strong>{request.loaiYeuCau ?? request.idCaLamViec} · {request.trangThai}</strong><p className="text-xs text-slate-600">{request.ca?.hoTenBacSi ?? ""} · {request.ngayMongMuon ?? request.ngay} · {request.lyDo}</p></div><div className="flex gap-2"><button className={styles.actionBtn} type="button" onClick={() => void decideRequest(request.id, true)}>{vi ? "Duyệt" : "Approve"}</button><button className={styles.actionBtnDanger} type="button" onClick={() => void decideRequest(request.id, false)}>{vi ? "Từ chối" : "Reject"}</button></div></article>)}
    <h3 className="mb-3 mt-8 font-semibold">{vi ? "Lịch hẹn cần đổi lịch" : "Appointments awaiting reschedule"}</h3>
    {(waitingAppointmentsQuery.data?.duLieu?.noiDung ?? []).map((appointment) => <p className="border-b border-slate-100 py-2 text-sm" key={appointment.maPhieuKham}>{appointment.ngay} · {appointment.gioKhamDuKien} · {appointment.hoTenBenhNhan} · {appointment.maTraCuu}</p>)}
  </section>;

  if (activeSection === "catalog") return <section className={styles.sectionCard}>
    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>{vi ? "Danh mục y tế" : "Medical catalog"}</h2></div>
    {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}{message && <p role="status" className="mb-3 text-sm text-emerald-800">{message}</p>}
    <div className="mb-5 flex gap-2 border-b border-slate-200">{(["specialties","clinics","medicines"] as const).map((value) => <button type="button" key={value} aria-pressed={tab === value} className={`border-b-2 px-3 py-2 text-sm font-semibold ${tab === value ? "border-emerald-800 text-emerald-900" : "border-transparent text-slate-500"}`} onClick={() => setTab(value)}>{value === "specialties" ? (vi ? "Chuyên khoa" : "Specialties") : value === "clinics" ? (vi ? "Phòng khám" : "Clinics") : (vi ? "Thuốc" : "Medicines")}</button>)}</div>
    {tab === "specialties" && <><form className="mb-5 grid gap-3 sm:grid-cols-2" onSubmit={(event) => void saveSpecialty(event)}>{(["tenChuyenKhoa","tenChuyenKhoaEn","moTa","moTaEn","trieuChung","trieuChungEn"] as const).map((name) => <label className="grid gap-1 text-xs" key={name}>{name}<input name={name} required={name === "tenChuyenKhoa"} maxLength={name.startsWith("trieuChung") ? 2000 : 255} /></label>)}<button className={styles.actionBtn} type="submit">{vi ? "Thêm chuyên khoa" : "Add specialty"}</button></form><div className={styles.tableScroll}><table className={styles.adminTable}><thead><tr><th>ID</th><th>{vi ? "Chuyên khoa" : "Specialty"}</th><th>{vi ? "Mô tả" : "Description"}</th></tr></thead><tbody>{(specialtiesQuery.data?.duLieu?.noiDung ?? []).map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.tenChuyenKhoa} {item.tenChuyenKhoaEn && <small> / {item.tenChuyenKhoaEn}</small>}</td><td>{item.moTa}</td></tr>)}</tbody></table></div></>}
    {tab === "clinics" && <><form className="mb-5 grid gap-3 sm:grid-cols-2" onSubmit={(event) => void saveClinic(event)}>{(["tenPhong","tenPhongEn","tang","tangEn","idChuyenKhoa"] as const).map((name) => <label className="grid gap-1 text-xs" key={name}>{name}<input name={name} required={name === "tenPhong" || name === "idChuyenKhoa"} /></label>)}<button className={styles.actionBtn} type="submit">{vi ? "Thêm phòng khám" : "Add clinic"}</button></form><div className={styles.tableScroll}><table className={styles.adminTable}><thead><tr><th>{vi ? "Phòng" : "Clinic"}</th><th>{vi ? "Chuyên khoa" : "Specialty"}</th><th>{vi ? "Ca sắp tới" : "Upcoming shifts"}</th><th>{vi ? "Trạng thái" : "Status"}</th><th /></tr></thead><tbody>{(clinicsQuery.data?.duLieu?.noiDung ?? []).map((clinic) => <tr key={clinic.id}><td>{clinic.tenPhong} {clinic.tenPhongEn && <small>/ {clinic.tenPhongEn}</small>}</td><td>{clinic.tenChuyenKhoa}</td><td>{clinic.soCaSapToi}</td><td>{clinic.trangThai}</td><td>{clinic.trangThai === "HOAT_DONG" ? <button className={styles.actionBtnDanger} type="button" onClick={() => void catalogService.ngungHoatDongPhongKham(clinic.id).then(() => client.invalidateQueries({ queryKey: ["catalog", "admin-clinics"] })).catch(showFailure)}>{vi ? "Ngừng hoạt động" : "Deactivate"}</button> : <button className={styles.actionBtn} type="button" onClick={() => void catalogService.hoatDongLaiPhongKham(clinic.id).then(() => client.invalidateQueries({ queryKey: ["catalog", "admin-clinics"] })).catch(showFailure)}>{vi ? "Kích hoạt" : "Activate"}</button>}</td></tr>)}</tbody></table></div></>}
    {tab === "medicines" && <><form className="mb-5 grid gap-3 sm:grid-cols-2" onSubmit={(event) => void saveMedicine(event)}>{(["tenThuoc","donVi","donViEn","moTa","moTaEn"] as const).map((name) => <label className="grid gap-1 text-xs" key={name}>{name}<input name={name} required={name === "tenThuoc"} /></label>)}<button className={styles.actionBtn} type="submit">{vi ? "Thêm thuốc" : "Add medicine"}</button></form><div className={styles.tableScroll}><table className={styles.adminTable}><thead><tr><th>{vi ? "Thuốc" : "Medicine"}</th><th>{vi ? "Đơn vị" : "Unit"}</th><th>{vi ? "Đã xác minh" : "Verified"}</th><th>{vi ? "Trạng thái" : "Status"}</th><th /></tr></thead><tbody>{(medicinesQuery.data?.duLieu?.noiDung ?? []).map((medicine) => <tr key={medicine.id}><td>{medicine.tenThuoc}</td><td>{medicine.donVi} {medicine.donViEn && <small>/ {medicine.donViEn}</small>}</td><td>{medicine.daXacMinh ? "✓" : "—"}</td><td>{medicine.trangThai}</td><td className="flex gap-2">{!medicine.daXacMinh && <button className={styles.actionBtn} type="button" onClick={() => void catalogService.xacMinhThuoc(medicine.id).then(() => client.invalidateQueries({ queryKey: ["catalog", "admin-medicines"] })).catch(showFailure)}>{vi ? "Xác minh" : "Verify"}</button>}{medicine.trangThai === "DANG_DUNG" ? <button className={styles.actionBtnDanger} type="button" onClick={() => void catalogService.ngungDungThuoc(medicine.id).then(() => client.invalidateQueries({ queryKey: ["catalog", "admin-medicines"] })).catch(showFailure)}>{vi ? "Ngừng dùng" : "Disable"}</button> : <button className={styles.actionBtn} type="button" onClick={() => void catalogService.dungLaiThuoc(medicine.id).then(() => client.invalidateQueries({ queryKey: ["catalog", "admin-medicines"] })).catch(showFailure)}>{vi ? "Dùng lại" : "Reactivate"}</button>}</td></tr>)}</tbody></table></div></>}
  </section>;

  const patients = patientsQuery.data?.duLieu;
  const pending = verificationQuery.data?.duLieu as { noiDung?: Array<{ hoSo?: { id: number; hoTen: string | null }; taiKhoan?: { hoTen: string; email: string }; id?: number; khopHoTen?: boolean; khopSoDienThoai?: boolean }> } | undefined;
  return <section className={styles.sectionCard}>
    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>{vi ? "Hồ sơ bệnh nhân" : "Patient profiles"}</h2></div>
    {error && <p role="alert" className="mb-3 text-sm text-rose-700">{error}</p>}{message && <p role="status" className="mb-3 text-sm text-emerald-800">{message}</p>}
    <h3 className="mb-2 font-semibold">{vi ? "Liên kết chờ xác minh" : "Pending profile links"}</h3>
    {(pending?.noiDung ?? []).map((item) => <article className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3" key={item.id ?? item.hoSo?.id}><div><strong>{item.hoSo?.hoTen ?? item.taiKhoan?.hoTen}</strong><p className="text-xs text-slate-600">{item.taiKhoan?.email} · {vi ? "Khớp tên" : "Name match"}: {item.khopHoTen ? "✓" : "—"} · {vi ? "Khớp điện thoại" : "Phone match"}: {item.khopSoDienThoai ? "✓" : "—"}</p></div><div className="flex gap-2"><button className={styles.actionBtn} type="button" onClick={() => void handlePatientLink(item.hoSo?.id ?? item.id ?? 0, true)}>{vi ? "Duyệt" : "Approve"}</button><button className={styles.actionBtnDanger} type="button" onClick={() => void handlePatientLink(item.hoSo?.id ?? item.id ?? 0, false)}>{vi ? "Từ chối" : "Reject"}</button></div></article>)}
    <div className="my-5 flex gap-2"><input className={styles.searchInput} value={patientSearch} onChange={(event) => { setPatientSearch(event.target.value); setPatientPage(0); }} placeholder={vi ? "Tìm tên, điện thoại, CCCD đủ 12 số..." : "Search name, phone, full 12-digit ID..."} /></div>
    <div className={styles.tableScroll}><table className={styles.adminTable}><thead><tr><th>ID</th><th>{vi ? "Bệnh nhân" : "Patient"}</th><th>{vi ? "Ngày sinh" : "Birth date"}</th><th>{vi ? "Điện thoại" : "Phone"}</th><th>{vi ? "CCCD" : "National ID"}</th><th>{vi ? "Lịch hẹn" : "Appointments"}</th></tr></thead><tbody>{(patients?.noiDung ?? []).map((patient) => <tr key={patient.id}><td>{patient.id}</td><td>{patient.hoTen}</td><td>{patient.ngaySinh ?? "—"}</td><td>{patient.soDienThoai ?? "—"}</td><td>{patient.cccd ?? "—"}</td><td>{patient.soLichHen ?? "—"}</td></tr>)}</tbody></table></div>
    <div className={styles.paginationBar}><span>{vi ? `Trang ${patientPage + 1} / ${patients?.tongSoTrang ?? 1}` : `Page ${patientPage + 1} / ${patients?.tongSoTrang ?? 1}`}</span><div className={styles.paginationActions}><button className={styles.pageBtn} disabled={!patientPage} onClick={() => setPatientPage((page) => page - 1)}>{vi ? "Trước" : "Previous"}</button><button className={styles.pageBtn} disabled={patientPage + 1 >= (patients?.tongSoTrang ?? 1)} onClick={() => setPatientPage((page) => page + 1)}>{vi ? "Sau" : "Next"}</button></div></div>
  </section>;
}
