import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  specialtyService,
  clinicService,
  medicineService,
} from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import type {
  ChuyenKhoaRequest,
  PhongKhamRequest,
  ThuocRequest,
  ThuocResponse,
  PhongKhamQuanTriResponse,
  ChuyenKhoaResponse,
} from "@/types/catalog.type";
import type { CatalogTab } from "../operations.types";
import styles from "../../AdminDashboardPage.module.css";
import { CheckCircle2, AlertTriangle, Plus, X, Edit3, ShieldCheck } from "lucide-react";

export function AdminCatalogSection() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [tab, setTab] = useState<CatalogTab>("specialties");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Edit states for modals
  const [editingSpecialty, setEditingSpecialty] = useState<ChuyenKhoaResponse | null>(null);
  const [editingClinic, setEditingClinic] = useState<PhongKhamQuanTriResponse | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<ThuocResponse | null>(null);

  const specialtiesQuery = useQuery({
    queryKey: ["catalog", "admin-specialties"],
    queryFn: () =>
      specialtyService.getDanhSachChuyenKhoaQuanTri({ trang: 0, kichThuoc: 100 }),
  });

  const clinicsQuery = useQuery({
    queryKey: ["catalog", "admin-clinics", tab],
    queryFn: () =>
      clinicService.getDanhSachPhongKhamQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: tab === "clinics",
  });

  const medicinesQuery = useQuery({
    queryKey: ["catalog", "admin-medicines"],
    queryFn: () =>
      medicineService.getDanhSachThuocQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: tab === "medicines",
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

  // ================= Specialty Actions =================
  const saveSpecialty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: ChuyenKhoaRequest = {
      tenChuyenKhoa: String(values.get("tenChuyenKhoa")),
      moTa: String(values.get("moTa") || "") || null,
      tenChuyenKhoaEn: String(values.get("tenChuyenKhoaEn") || "") || null,
      moTaEn: String(values.get("moTaEn") || "") || null,
      trieuChung: String(values.get("trieuChung") || "") || null,
      trieuChungEn: String(values.get("trieuChungEn") || "") || null,
    };
    try {
      const result = await specialtyService.taoChuyenKhoa(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, [
        "catalog|admin-specialties",
        "catalog|chuyen-khoa",
      ]);
      form.reset();
    } catch (cause) {
      showFailure(cause);
    }
  };

  const handleUpdateSpecialty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingSpecialty) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: ChuyenKhoaRequest = {
      tenChuyenKhoa: String(values.get("tenChuyenKhoa")),
      tenChuyenKhoaEn: String(values.get("tenChuyenKhoaEn") || "") || null,
      moTa: String(values.get("moTa") || "") || null,
      moTaEn: String(values.get("moTaEn") || "") || null,
      trieuChung: String(values.get("trieuChung") || "") || null,
      trieuChungEn: String(values.get("trieuChungEn") || "") || null,
    };
    try {
      const response = await specialtyService.capNhatChuyenKhoa(
        editingSpecialty.id,
        request,
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, [
        "catalog|admin-specialties",
        "catalog|chuyen-khoa",
      ]);
      setEditingSpecialty(null);
    } catch (cause) {
      showFailure(cause);
    }
  };

  // ================= Clinic Actions =================
  const saveClinic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: PhongKhamRequest = {
      tenPhong: String(values.get("tenPhong")),
      tang: String(values.get("tang") || "") || null,
      idChuyenKhoa: Number(values.get("idChuyenKhoa")),
      tenPhongEn: String(values.get("tenPhongEn") || "") || null,
      tangEn: String(values.get("tangEn") || "") || null,
    };
    try {
      const result = await clinicService.themPhongKham(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, [
        "catalog|admin-clinics",
        "catalog|phong-kham",
      ]);
      form.reset();
    } catch (cause) {
      showFailure(cause);
    }
  };

  const handleUpdateClinic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingClinic) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: PhongKhamRequest = {
      tenPhong: String(values.get("tenPhong")),
      tenPhongEn: String(values.get("tenPhongEn") || "") || null,
      tang: String(values.get("tang") || "") || null,
      tangEn: String(values.get("tangEn") || "") || null,
      idChuyenKhoa: Number(values.get("idChuyenKhoa")),
    };
    try {
      const response = await clinicService.suaPhongKham(editingClinic.id, request);
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, [
        "catalog|admin-clinics",
        "catalog|phong-kham",
      ]);
      setEditingClinic(null);
    } catch (cause) {
      showFailure(cause);
    }
  };

  // ================= Medicine Actions =================
  const saveMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: ThuocRequest = {
      tenThuoc: String(values.get("tenThuoc")),
      hoatChat: String(values.get("hoatChat") || "") || null,
      hamLuong: String(values.get("hamLuong") || "") || null,
      dangBaoChe: String(values.get("dangBaoChe") || "") || null,
      duongDung: String(values.get("duongDung") || "") || null,
      donVi: String(values.get("donVi") || "") || null,
      moTa: String(values.get("moTa") || "") || null,
    };
    try {
      const result = await medicineService.taoThuoc(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await finish(result.thongDiep, ["catalog|admin-medicines"]);
      form.reset();
    } catch (cause) {
      showFailure(cause);
    }
  };

  const handleUpdateMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMedicine) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: ThuocRequest = {
      tenThuoc: String(values.get("tenThuoc")),
      hoatChat: String(values.get("hoatChat") || "") || null,
      hamLuong: String(values.get("hamLuong") || "") || null,
      dangBaoChe: String(values.get("dangBaoChe") || "") || null,
      duongDung: String(values.get("duongDung") || "") || null,
      donVi: String(values.get("donVi") || "") || null,
      moTa: String(values.get("moTa") || "") || null,
    };
    try {
      const response = await medicineService.capNhatThuoc(
        editingMedicine.id,
        request,
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, ["catalog|admin-medicines"]);
      setEditingMedicine(null);
    } catch (cause) {
      showFailure(cause);
    }
  };

  const specialtiesList = specialtiesQuery.data?.duLieu?.noiDung ?? [];

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {vi ? "Danh mục y tế" : "Medical catalog"}
        </h2>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-rose-700 font-semibold">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-3 text-sm text-emerald-800 font-semibold">
          {message}
        </p>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-2 border-b border-slate-200">
        {(["specialties", "clinics", "medicines"] as const).map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={tab === value}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === value
                ? "border-emerald-800 text-emerald-900 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setTab(value)}
          >
            {value === "specialties"
              ? vi
                ? "Chuyên khoa"
                : "Specialties"
              : value === "clinics"
                ? vi
                  ? "Phòng khám"
                  : "Clinics"
                : vi
                  ? "Danh mục thuốc"
                  : "Medicines"}
          </button>
        ))}
      </div>

      {/* TAB 1: SPECIALTIES */}
      {tab === "specialties" && (
        <>
          <form
            className="mb-5 grid gap-3 sm:grid-cols-2 p-4 border border-slate-200 rounded-lg bg-slate-50/50"
            onSubmit={(event) => void saveSpecialty(event)}
          >
            <h3 className="sm:col-span-2 text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus size={16} />
              {vi ? "Thêm chuyên khoa mới" : "Add New Specialty"}
            </h3>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Tên chuyên khoa (VI) *" : "Specialty Name (VI) *"}
              <input
                name="tenChuyenKhoa"
                required
                maxLength={255}
                className="p-2 border rounded text-xs"
                placeholder="VD: Tim mạch, Nhi khoa..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Tên chuyên khoa (EN)" : "Specialty Name (EN)"}
              <input
                name="tenChuyenKhoaEn"
                maxLength={255}
                className="p-2 border rounded text-xs"
                placeholder="e.g. Cardiology, Pediatrics..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Mô tả chuyên khoa (VI)" : "Description (VI)"}
              <input
                name="moTa"
                maxLength={255}
                className="p-2 border rounded text-xs"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Mô tả chuyên khoa (EN)" : "Description (EN)"}
              <input
                name="moTaEn"
                maxLength={255}
                className="p-2 border rounded text-xs"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Triệu chứng thường gặp (VI)" : "Symptoms (VI)"}
              <input
                name="trieuChung"
                maxLength={2000}
                className="p-2 border rounded text-xs"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Triệu chứng thường gặp (EN)" : "Symptoms (EN)"}
              <input
                name="trieuChungEn"
                maxLength={2000}
                className="p-2 border rounded text-xs"
              />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button className={styles.actionBtn} type="submit">
                {vi ? "Thêm chuyên khoa" : "Add specialty"}
              </button>
            </div>
          </form>

          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{vi ? "Chuyên khoa" : "Specialty"}</th>
                  <th>{vi ? "Mô tả" : "Description"}</th>
                  <th>{vi ? "Triệu chứng" : "Symptoms"}</th>
                  <th>{vi ? "Thao tác" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {(specialtiesQuery.data?.duLieu?.noiDung ?? []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td className="font-semibold text-slate-900">
                      {item.tenChuyenKhoa}
                      {item.tenChuyenKhoaEn && (
                        <div className="text-xs text-slate-500 font-normal">
                          {item.tenChuyenKhoaEn}
                        </div>
                      )}
                    </td>
                    <td>{item.moTa || "—"}</td>
                    <td className="text-xs text-slate-600 max-w-xs truncate">
                      {item.trieuChung || "—"}
                    </td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => setEditingSpecialty(item)}
                      >
                        <Edit3 size={13} className="inline mr-1" />
                        {vi ? "Sửa" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 2: CLINICS */}
      {tab === "clinics" && (
        <>
          <form
            className="mb-5 grid gap-3 sm:grid-cols-2 p-4 border border-slate-200 rounded-lg bg-slate-50/50"
            onSubmit={(event) => void saveClinic(event)}
          >
            <h3 className="sm:col-span-2 text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus size={16} />
              {vi ? "Thêm phòng khám mới" : "Add New Clinic"}
            </h3>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Tên phòng khám (VI) *" : "Clinic Name (VI) *"}
              <input
                name="tenPhong"
                required
                className="p-2 border rounded text-xs"
                placeholder="VD: Phòng khám Nội 1..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Tên phòng khám (EN)" : "Clinic Name (EN)"}
              <input
                name="tenPhongEn"
                className="p-2 border rounded text-xs"
                placeholder="e.g. Internal Medicine Clinic 1..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Chuyên khoa *" : "Specialty *"}
              <select
                name="idChuyenKhoa"
                required
                className="p-2 border rounded text-xs bg-white"
              >
                <option value="">
                  {vi ? "-- Chọn chuyên khoa --" : "-- Select specialty --"}
                </option>
                {specialtiesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.tenChuyenKhoa}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Tầng / Khu vực" : "Floor / Area"}
              <input
                name="tang"
                className="p-2 border rounded text-xs"
                placeholder="VD: Tầng 2, Khu A"
              />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button className={styles.actionBtn} type="submit">
                {vi ? "Thêm phòng khám" : "Add clinic"}
              </button>
            </div>
          </form>

          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>{vi ? "Phòng khám" : "Clinic"}</th>
                  <th>{vi ? "Chuyên khoa" : "Specialty"}</th>
                  <th>{vi ? "Tầng" : "Floor"}</th>
                  <th>{vi ? "Ca sắp tới" : "Upcoming shifts"}</th>
                  <th>{vi ? "Trạng thái" : "Status"}</th>
                  <th>{vi ? "Thao tác" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {(clinicsQuery.data?.duLieu?.noiDung ?? []).map((clinic) => (
                  <tr key={clinic.id}>
                    <td className="font-semibold text-slate-900">
                      {clinic.tenPhong}
                      {clinic.tenPhongEn && (
                        <div className="text-xs text-slate-500 font-normal">
                          {clinic.tenPhongEn}
                        </div>
                      )}
                    </td>
                    <td>{clinic.tenChuyenKhoa}</td>
                    <td>{clinic.tang || "—"}</td>
                    <td>
                      <span className="font-bold text-emerald-800">
                        {clinic.soCaSapToi}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          clinic.trangThai === "HOAT_DONG"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {clinic.trangThai === "HOAT_DONG"
                          ? vi
                            ? "Hoạt động"
                            : "Active"
                          : vi
                            ? "Ngừng hoạt động"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="space-x-2">
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => setEditingClinic(clinic)}
                      >
                        <Edit3 size={13} className="inline mr-1" />
                        {vi ? "Sửa" : "Edit"}
                      </button>
                      {clinic.trangThai === "HOAT_DONG" ? (
                        <button
                          className={styles.actionBtnDanger}
                          type="button"
                          onClick={() =>
                            void clinicService
                              .ngungHoatDongPhongKham(clinic.id)
                              .then(() =>
                                finish(
                                  vi
                                    ? "Đã ngừng hoạt động phòng khám"
                                    : "Clinic deactivated",
                                  ["catalog|admin-clinics"],
                                ),
                              )
                              .catch(showFailure)
                          }
                        >
                          {vi ? "Ngừng hoạt động" : "Deactivate"}
                        </button>
                      ) : (
                        <button
                          className={styles.actionBtn}
                          type="button"
                          onClick={() =>
                            void clinicService
                              .hoatDongLaiPhongKham(clinic.id)
                              .then(() =>
                                finish(
                                  vi
                                    ? "Đã kích hoạt lại phòng khám"
                                    : "Clinic activated",
                                  ["catalog|admin-clinics"],
                                ),
                              )
                              .catch(showFailure)
                          }
                        >
                          {vi ? "Kích hoạt" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB 3: MEDICINES */}
      {tab === "medicines" && (
        <>
          <form
            className="mb-5 grid gap-3 sm:grid-cols-3 p-4 border border-slate-200 rounded-lg bg-slate-50/50"
            onSubmit={(event) => void saveMedicine(event)}
          >
            <h3 className="sm:col-span-3 text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus size={16} />
              {vi ? "Thêm thuốc vào danh mục y tế" : "Add Medicine to Catalog"}
            </h3>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Tên biệt dược / Tên thuốc *" : "Medicine / Brand Name *"}
              <input
                name="tenThuoc"
                required
                className="p-2 border rounded text-xs"
                placeholder="VD: Paracetamol, Amoxicillin..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Hoạt chất chính" : "Active Ingredient"}
              <input
                name="hoatChat"
                className="p-2 border rounded text-xs"
                placeholder="VD: Paracetamol 500mg"
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Hàm lượng" : "Strength / Dosage"}
              <input
                name="hamLuong"
                className="p-2 border rounded text-xs"
                placeholder="VD: 500mg, 10ml..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Dạng bào chế" : "Dosage Form"}
              <input
                name="dangBaoChe"
                className="p-2 border rounded text-xs"
                placeholder="VD: Viên nén, Siro, Gói bột..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Đường dùng" : "Administration Route"}
              <input
                name="duongDung"
                className="p-2 border rounded text-xs"
                placeholder="VD: Uống, Tiêm bắp, Bôi ngoài da..."
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              {vi ? "Đơn vị đóng gói / cấp phát" : "Unit"}
              <input
                name="donVi"
                className="p-2 border rounded text-xs"
                placeholder="VD: Viên, Vỉ, Hộp, Lọ..."
              />
            </label>
            <label className="sm:col-span-3 grid gap-1 text-xs font-semibold">
              {vi ? "Mô tả / Lưu ý sử dụng" : "Usage Notes / Description"}
              <input
                name="moTa"
                className="p-2 border rounded text-xs"
                placeholder="Lưu ý tương tác, chống chỉ định..."
              />
            </label>
            <div className="sm:col-span-3 flex justify-end">
              <button className={styles.actionBtn} type="submit">
                {vi ? "Thêm thuốc" : "Add medicine"}
              </button>
            </div>
          </form>

          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>{vi ? "Tên thuốc" : "Medicine"}</th>
                  <th>{vi ? "Hoạt chất / Hàm lượng" : "Active Ingredient"}</th>
                  <th>{vi ? "Dạng / Đường dùng" : "Form & Route"}</th>
                  <th>{vi ? "Đơn vị" : "Unit"}</th>
                  <th>{vi ? "Xác minh" : "Verified"}</th>
                  <th>{vi ? "Trạng thái" : "Status"}</th>
                  <th>{vi ? "Thao tác" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {(medicinesQuery.data?.duLieu?.noiDung ?? []).map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="font-semibold text-slate-900">
                      {medicine.tenThuoc}
                      {medicine.tenBacSiTao && (
                        <div className="text-[11px] text-slate-500 font-normal">
                          {vi ? "Bác sĩ tạo:" : "Created by:"} {medicine.tenBacSiTao}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-xs font-medium text-slate-800">
                        {medicine.hoatChat || "—"}
                      </div>
                      {medicine.hamLuong && (
                        <div className="text-[11px] text-slate-500">
                          {medicine.hamLuong}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-xs text-slate-700">
                        {[medicine.dangBaoChe, medicine.duongDung]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </td>
                    <td>{medicine.donVi || "—"}</td>
                    <td>
                      {medicine.daXacMinh ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 size={12} />
                          {vi ? "Đã duyệt" : "Verified"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <AlertTriangle size={12} />
                          {vi ? "Chờ duyệt" : "Pending"}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          medicine.trangThai === "DANG_DUNG"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {medicine.trangThai === "DANG_DUNG"
                          ? vi
                            ? "Đang dùng"
                            : "In Use"
                          : vi
                            ? "Ngừng dùng"
                            : "Disabled"}
                      </span>
                    </td>
                    <td className="space-x-2">
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => setEditingMedicine(medicine)}
                      >
                        <Edit3 size={13} className="inline mr-1" />
                        {vi ? "Sửa" : "Edit"}
                      </button>

                      {!medicine.daXacMinh && (
                        <button
                          className={styles.actionBtn}
                          type="button"
                          onClick={() =>
                            void medicineService
                              .xacMinhThuoc(medicine.id)
                              .then(() =>
                                finish(
                                  vi
                                    ? "Đã xác minh thuốc vào danh mục chính thức"
                                    : "Medicine verified",
                                  ["catalog|admin-medicines"],
                                ),
                              )
                              .catch(showFailure)
                          }
                        >
                          <ShieldCheck size={13} className="inline mr-1" />
                          {vi ? "Xác minh" : "Verify"}
                        </button>
                      )}

                      {medicine.trangThai === "DANG_DUNG" ? (
                        <button
                          className={styles.actionBtnDanger}
                          type="button"
                          onClick={() =>
                            void medicineService
                              .ngungDungThuoc(medicine.id)
                              .then(() =>
                                finish(
                                  vi
                                    ? "Đã ngừng dùng thuốc"
                                    : "Medicine disabled",
                                  ["catalog|admin-medicines"],
                                ),
                              )
                              .catch(showFailure)
                          }
                        >
                          {vi ? "Ngừng dùng" : "Disable"}
                        </button>
                      ) : (
                        <button
                          className={styles.actionBtn}
                          type="button"
                          onClick={() =>
                            void medicineService
                              .dungLaiThuoc(medicine.id)
                              .then(() =>
                                finish(
                                  vi
                                    ? "Đã kích hoạt dùng lại thuốc"
                                    : "Medicine reactivated",
                                  ["catalog|admin-medicines"],
                                ),
                              )
                              .catch(showFailure)
                          }
                        >
                          {vi ? "Dùng lại" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* EDIT MODAL: SPECIALTY */}
      {editingSpecialty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {vi ? "Chỉnh sửa chuyên khoa" : "Edit Specialty"} #{editingSpecialty.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSpecialty(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => void handleUpdateSpecialty(e)} className="grid gap-3">
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Tên chuyên khoa (VI) *" : "Specialty Name (VI) *"}
                <input
                  name="tenChuyenKhoa"
                  defaultValue={editingSpecialty.tenChuyenKhoa}
                  required
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Tên chuyên khoa (EN)" : "Specialty Name (EN)"}
                <input
                  name="tenChuyenKhoaEn"
                  defaultValue={editingSpecialty.tenChuyenKhoaEn || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Mô tả (VI)" : "Description (VI)"}
                <input
                  name="moTa"
                  defaultValue={editingSpecialty.moTa || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Mô tả (EN)" : "Description (EN)"}
                <input
                  name="moTaEn"
                  defaultValue={editingSpecialty.moTaEn || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Triệu chứng (VI)" : "Symptoms (VI)"}
                <input
                  name="trieuChung"
                  defaultValue={editingSpecialty.trieuChung || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Triệu chứng (EN)" : "Symptoms (EN)"}
                <input
                  name="trieuChungEn"
                  defaultValue={editingSpecialty.trieuChungEn || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setEditingSpecialty(null)}
                >
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className={styles.actionBtn}>
                  {vi ? "Lưu thay đổi" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: CLINIC */}
      {editingClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {vi ? "Chỉnh sửa phòng khám" : "Edit Clinic"} #{editingClinic.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingClinic(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => void handleUpdateClinic(e)} className="grid gap-3">
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Tên phòng khám (VI) *" : "Clinic Name (VI) *"}
                <input
                  name="tenPhong"
                  defaultValue={editingClinic.tenPhong}
                  required
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Tên phòng khám (EN)" : "Clinic Name (EN)"}
                <input
                  name="tenPhongEn"
                  defaultValue={editingClinic.tenPhongEn || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Chuyên khoa *" : "Specialty *"}
                <select
                  name="idChuyenKhoa"
                  defaultValue={editingClinic.idChuyenKhoa}
                  required
                  className="p-2 border rounded text-xs bg-white"
                >
                  {specialtiesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tenChuyenKhoa}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Tầng / Khu vực" : "Floor / Area"}
                <input
                  name="tang"
                  defaultValue={editingClinic.tang || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setEditingClinic(null)}
                >
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className={styles.actionBtn}>
                  {vi ? "Lưu thay đổi" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: MEDICINE */}
      {editingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {vi ? "Chỉnh sửa thông tin thuốc" : "Edit Medicine"} #{editingMedicine.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMedicine(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => void handleUpdateMedicine(e)} className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 grid gap-1 text-xs font-semibold">
                {vi ? "Tên thuốc *" : "Medicine Name *"}
                <input
                  name="tenThuoc"
                  defaultValue={editingMedicine.tenThuoc}
                  required
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Hoạt chất chính" : "Active Ingredient"}
                <input
                  name="hoatChat"
                  defaultValue={editingMedicine.hoatChat || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Hàm lượng" : "Strength"}
                <input
                  name="hamLuong"
                  defaultValue={editingMedicine.hamLuong || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Dạng bào chế" : "Dosage Form"}
                <input
                  name="dangBaoChe"
                  defaultValue={editingMedicine.dangBaoChe || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold">
                {vi ? "Đường dùng" : "Administration Route"}
                <input
                  name="duongDung"
                  defaultValue={editingMedicine.duongDung || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="sm:col-span-2 grid gap-1 text-xs font-semibold">
                {vi ? "Đơn vị tính" : "Unit"}
                <input
                  name="donVi"
                  defaultValue={editingMedicine.donVi || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <label className="sm:col-span-2 grid gap-1 text-xs font-semibold">
                {vi ? "Mô tả / Hướng dẫn" : "Description / Notes"}
                <input
                  name="moTa"
                  defaultValue={editingMedicine.moTa || ""}
                  className="p-2 border rounded text-xs"
                />
              </label>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setEditingMedicine(null)}
                >
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button type="submit" className={styles.actionBtn}>
                  {vi ? "Lưu thay đổi" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
