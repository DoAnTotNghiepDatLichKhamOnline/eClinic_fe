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
} from "@/types/catalog.type";
import type { CatalogTab } from "../operations.types";
import styles from "../../AdminDashboardPage.module.css";

export function AdminCatalogSection() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [tab, setTab] = useState<CatalogTab>("specialties");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const specialtiesQuery = useQuery({
    queryKey: ["catalog", "admin-specialties"],
    queryFn: () =>
      specialtyService.getDanhSachChuyenKhoaQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: tab === "specialties",
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

  const saveMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: ThuocRequest = {
      tenThuoc: String(values.get("tenThuoc")),
      donVi: String(values.get("donVi") || "") || null,
      moTa: String(values.get("moTa") || "") || null,
      donViEn: String(values.get("donViEn") || "") || null,
      moTaEn: String(values.get("moTaEn") || "") || null,
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

  const editSpecialty = async (
    specialty: NonNullable<
      typeof specialtiesQuery.data
    >["duLieu"] extends infer T
      ? T extends { noiDung: Array<infer V> }
        ? V
        : never
      : never,
  ) => {
    const tenChuyenKhoa = window.prompt(
      vi ? "Tên chuyên khoa (VI):" : "Specialty name (VI):",
      specialty.tenChuyenKhoa,
    );
    if (tenChuyenKhoa === null) return;
    const request: ChuyenKhoaRequest = {
      tenChuyenKhoa,
      tenChuyenKhoaEn:
        window.prompt(
          "Specialty name (EN):",
          specialty.tenChuyenKhoaEn ?? "",
        ) ?? specialty.tenChuyenKhoaEn,
      moTa:
        window.prompt(
          vi ? "Mô tả (VI):" : "Description (VI):",
          specialty.moTa ?? "",
        ) ?? specialty.moTa,
      moTaEn:
        window.prompt("Description (EN):", specialty.moTaEn ?? "") ??
        specialty.moTaEn,
      trieuChung: specialty.trieuChung,
      trieuChungEn: specialty.trieuChungEn,
    };
    try {
      const response = await specialtyService.capNhatChuyenKhoa(
        specialty.id,
        request,
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, [
        "catalog|admin-specialties",
        "catalog|chuyen-khoa",
      ]);
    } catch (cause) {
      showFailure(cause);
    }
  };

  const editClinic = async (
    clinic: NonNullable<typeof clinicsQuery.data>["duLieu"] extends infer T
      ? T extends { noiDung: Array<infer V> }
        ? V
        : never
      : never,
  ) => {
    const tenPhong = window.prompt(
      vi ? "Tên phòng (VI):" : "Clinic name (VI):",
      clinic.tenPhong,
    );
    if (tenPhong === null) return;
    const request: PhongKhamRequest = {
      tenPhong,
      tenPhongEn:
        window.prompt("Clinic name (EN):", clinic.tenPhongEn ?? "") ??
        clinic.tenPhongEn,
      tang:
        window.prompt(vi ? "Tầng:" : "Floor:", clinic.tang ?? "") ??
        clinic.tang,
      tangEn:
        window.prompt("Floor (EN):", clinic.tangEn ?? "") ?? clinic.tangEn,
      idChuyenKhoa: clinic.idChuyenKhoa,
    };
    try {
      const response = await clinicService.suaPhongKham(clinic.id, request);
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, [
        "catalog|admin-clinics",
        "catalog|phong-kham",
      ]);
    } catch (cause) {
      showFailure(cause);
    }
  };

  const editMedicine = async (
    medicine: NonNullable<typeof medicinesQuery.data>["duLieu"] extends infer T
      ? T extends { noiDung: Array<infer V> }
        ? V
        : never
      : never,
  ) => {
    const tenThuoc = window.prompt(
      vi ? "Tên thuốc:" : "Medicine name:",
      medicine.tenThuoc,
    );
    if (tenThuoc === null) return;
    const request: ThuocRequest = {
      tenThuoc,
      donVi:
        window.prompt(
          vi ? "Đơn vị (VI):" : "Unit (VI):",
          medicine.donVi ?? "",
        ) ?? medicine.donVi,
      donViEn:
        window.prompt("Unit (EN):", medicine.donViEn ?? "") ?? medicine.donViEn,
      moTa: medicine.moTa,
      moTaEn: medicine.moTaEn,
    };
    try {
      const response = await medicineService.capNhatThuoc(medicine.id, request);
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await finish(response.thongDiep, ["catalog|admin-medicines"]);
    } catch (cause) {
      showFailure(cause);
    }
  };

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {vi ? "Danh mục y tế" : "Medical catalog"}
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
      <div className="mb-5 flex gap-2 border-b border-slate-200">
        {(["specialties", "clinics", "medicines"] as const).map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={tab === value}
            className={`border-b-2 px-3 py-2 text-sm font-semibold ${
              tab === value
                ? "border-emerald-800 text-emerald-900"
                : "border-transparent text-slate-500"
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
                  ? "Thuốc"
                  : "Medicines"}
          </button>
        ))}
      </div>
      {tab === "specialties" && (
        <>
          <form
            className="mb-5 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => void saveSpecialty(event)}
          >
            {(
              [
                "tenChuyenKhoa",
                "tenChuyenKhoaEn",
                "moTa",
                "moTaEn",
                "trieuChung",
                "trieuChungEn",
              ] as const
            ).map((name) => (
              <label className="grid gap-1 text-xs" key={name}>
                {name}
                <input
                  name={name}
                  required={name === "tenChuyenKhoa"}
                  maxLength={name.startsWith("trieuChung") ? 2000 : 255}
                />
              </label>
            ))}
            <button className={styles.actionBtn} type="submit">
              {vi ? "Thêm chuyên khoa" : "Add specialty"}
            </button>
          </form>
          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{vi ? "Chuyên khoa" : "Specialty"}</th>
                  <th>{vi ? "Mô tả" : "Description"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(specialtiesQuery.data?.duLieu?.noiDung ?? []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      {item.tenChuyenKhoa}{" "}
                      {item.tenChuyenKhoaEn && (
                        <small> / {item.tenChuyenKhoaEn}</small>
                      )}
                    </td>
                    <td>{item.moTa}</td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => void editSpecialty(item)}
                      >
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
      {tab === "clinics" && (
        <>
          <form
            className="mb-5 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => void saveClinic(event)}
          >
            {(
              [
                "tenPhong",
                "tenPhongEn",
                "tang",
                "tangEn",
                "idChuyenKhoa",
              ] as const
            ).map((name) => (
              <label className="grid gap-1 text-xs" key={name}>
                {name}
                <input
                  name={name}
                  required={name === "tenPhong" || name === "idChuyenKhoa"}
                />
              </label>
            ))}
            <button className={styles.actionBtn} type="submit">
              {vi ? "Thêm phòng khám" : "Add clinic"}
            </button>
          </form>
          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>{vi ? "Phòng" : "Clinic"}</th>
                  <th>{vi ? "Chuyên khoa" : "Specialty"}</th>
                  <th>{vi ? "Ca sắp tới" : "Upcoming shifts"}</th>
                  <th>{vi ? "Trạng thái" : "Status"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(clinicsQuery.data?.duLieu?.noiDung ?? []).map((clinic) => (
                  <tr key={clinic.id}>
                    <td>
                      {clinic.tenPhong}{" "}
                      {clinic.tenPhongEn && <small>/ {clinic.tenPhongEn}</small>}
                    </td>
                    <td>{clinic.tenChuyenKhoa}</td>
                    <td>{clinic.soCaSapToi}</td>
                    <td>{clinic.trangThai}</td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => void editClinic(clinic)}
                      >
                        {vi ? "Sửa" : "Edit"}
                      </button>{" "}
                      {clinic.trangThai === "HOAT_DONG" ? (
                        <button
                          className={styles.actionBtnDanger}
                          type="button"
                          onClick={() =>
                            void clinicService
                              .ngungHoatDongPhongKham(clinic.id)
                              .then(() =>
                                client.invalidateQueries({
                                  queryKey: ["catalog", "admin-clinics"],
                                }),
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
                                client.invalidateQueries({
                                  queryKey: ["catalog", "admin-clinics"],
                                }),
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
      {tab === "medicines" && (
        <>
          <form
            className="mb-5 grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => void saveMedicine(event)}
          >
            {(
              ["tenThuoc", "donVi", "donViEn", "moTa", "moTaEn"] as const
            ).map((name) => (
              <label className="grid gap-1 text-xs" key={name}>
                {name}
                <input name={name} required={name === "tenThuoc"} />
              </label>
            ))}
            <button className={styles.actionBtn} type="submit">
              {vi ? "Thêm thuốc" : "Add medicine"}
            </button>
          </form>
          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>{vi ? "Thuốc" : "Medicine"}</th>
                  <th>{vi ? "Đơn vị" : "Unit"}</th>
                  <th>{vi ? "Đã xác minh" : "Verified"}</th>
                  <th>{vi ? "Trạng thái" : "Status"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(medicinesQuery.data?.duLieu?.noiDung ?? []).map(
                  (medicine) => (
                    <tr key={medicine.id}>
                      <td>{medicine.tenThuoc}</td>
                      <td>
                        {medicine.donVi}{" "}
                        {medicine.donViEn && (
                          <small>/ {medicine.donViEn}</small>
                        )}
                      </td>
                      <td>{medicine.daXacMinh ? "✓" : "—"}</td>
                      <td>{medicine.trangThai}</td>
                      <td className="flex gap-2">
                        <button
                          className={styles.actionBtn}
                          type="button"
                          onClick={() => void editMedicine(medicine)}
                        >
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
                                  client.invalidateQueries({
                                    queryKey: ["catalog", "admin-medicines"],
                                  }),
                                )
                                .catch(showFailure)
                            }
                          >
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
                                  client.invalidateQueries({
                                    queryKey: ["catalog", "admin-medicines"],
                                  }),
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
                                  client.invalidateQueries({
                                    queryKey: ["catalog", "admin-medicines"],
                                  }),
                                )
                                .catch(showFailure)
                            }
                          >
                            {vi ? "Dùng lại" : "Reactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
