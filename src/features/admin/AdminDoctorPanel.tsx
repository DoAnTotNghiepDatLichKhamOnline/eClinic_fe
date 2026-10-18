import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { adminBookingService } from "@/services/booking";
import { doctorService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useDanhSachChuyenKhoa } from "@/hooks/useCatalog";
import type {
  BacSiQuanTriResponse,
  ThemBacSiRequest,
  CapNhatHoSoBacSiRequest,
} from "@/types/catalog.type";
import styles from "./AdminDashboardPage.module.css";

type DoctorTab = "directory" | "reviews";

export function AdminDoctorPanel() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [tab, setTab] = useState<DoctorTab>("directory");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [selectedDoctor, setSelectedDoctor] =
    useState<BacSiQuanTriResponse | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lowRatingOnly, setLowRatingOnly] = useState(false);
  const [uploadType, setUploadType] = useState("ANH_CONG_VIEC");
  const [deactivatingDoctor, setDeactivatingDoctor] = useState<{
    doctor: BacSiQuanTriResponse;
    impact: { soCaSapToi: number; soLichHenBiAnhHuong: number };
  } | null>(null);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);

  type DoctorSortField = "maBacSi" | "hoTen" | "email";
  const [sortField, setSortField] = useState<DoctorSortField>("maBacSi");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Debounce search 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const specialties = useDanhSachChuyenKhoa({ kichThuoc: 100 }).danhSach;
  const doctorsQuery = useQuery({
    queryKey: [
      "catalog",
      "admin-doctors",
      debouncedQuery,
      specialtyFilter,
      statusFilter,
      page,
    ],
    queryFn: () =>
      doctorService.getDanhSachBacSiQuanTri({
        tuKhoa: debouncedQuery || undefined,
        idChuyenKhoa: specialtyFilter ? Number(specialtyFilter) : undefined,
        trangThai: statusFilter
          ? (statusFilter as "DANG_CONG_TAC" | "NGUNG_CONG_TAC")
          : undefined,
        trang: page,
        kichThuoc: 20,
      }),
    enabled: tab === "directory",
  });
  const detailQuery = useQuery({
    queryKey: ["catalog", "admin-doctor-detail", selectedDoctor?.id],
    queryFn: () => doctorService.getHoSoBacSiQuanTri(selectedDoctor!.id),
    enabled: Boolean(selectedDoctor),
  });
  const reviewsQuery = useQuery({
    queryKey: ["booking", "admin-doctor-reviews", lowRatingOnly],
    queryFn: () =>
      adminBookingService.getDanhGiaQuanTri({
        soSaoToiDa: lowRatingOnly ? 2 : undefined,
        trang: 0,
        kichThuoc: 50,
      }),
    enabled: tab === "reviews",
  });
  const doctors = doctorsQuery.data?.duLieu?.noiDung ?? [];
  const detail = detailQuery.data?.duLieu;

  const refreshDoctors = async () => {
    await client.invalidateQueries({ queryKey: ["catalog", "admin-doctors"] });
    await client.invalidateQueries({
      queryKey: ["catalog", "admin-doctor-detail"],
    });
  };
  const fail = (cause: unknown) => {
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

  const handleSort = (field: DoctorSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIndicator = (field: DoctorSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={13} className="text-teal-700" />
    ) : (
      <ArrowDown size={13} className="text-teal-700" />
    );
  };

  const sortedDoctors = useMemo(() => {
    const list = [...doctors];
    list.sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), vi ? "vi" : "en", { sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return list;
  }, [doctors, sortField, sortDirection, vi]);

  const addDoctor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const namBatDau = Number(values.get("namBatDauHanhNghe")) || null;
    const body: ThemBacSiRequest = {
      hoTen: String(values.get("hoTen")),
      email: String(values.get("email")),
      soDienThoai: String(values.get("soDienThoai") || "") || null,
      idChuyenKhoa: Number(values.get("idChuyenKhoa")),
      soGiayPhep: String(values.get("soGiayPhep") || "") || null,
      hocVi: String(values.get("hocVi") || "") || null,
      chucVu: String(values.get("chucVu") || "") || null,
      namBatDauHanhNghe: namBatDau,
      soNamKinhNghiem: namBatDau
        ? new Date().getFullYear() - namBatDau
        : Number(values.get("soNamKinhNghiem")) || null,
    };
    setIsAddingDoctor(true);
    try {
      const result = await doctorService.themBacSi(body);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      setMessage(result.thongDiep);
      setError("");
      form.reset();
      setIsAddDoctorOpen(false);
      await refreshDoctors();
    } catch (cause) {
      fail(cause);
    } finally {
      setIsAddingDoctor(false);
    }
  };

  const saveBasics = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    const values = new FormData(event.currentTarget);
    try {
      const result = await doctorService.suaBacSi(selectedDoctor.id, {
        hoTen: String(values.get("hoTen")),
        soDienThoai: String(values.get("soDienThoai") || "") || null,
        idChuyenKhoa: Number(values.get("idChuyenKhoa")),
        soGiayPhep: String(values.get("soGiayPhep") || "") || null,
      });
      if (!result.thanhCong) throw new Error(result.thongDiep);
      setMessage(result.thongDiep);
      await refreshDoctors();
    } catch (cause) {
      fail(cause);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    const values = new FormData(event.currentTarget);
    const lines = (name: string) =>
      String(values.get(name) || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const namBatDau = Number(values.get("namBatDauHanhNghe")) || null;
    const body: CapNhatHoSoBacSiRequest = {
      hocVi: String(values.get("hocVi") || "") || null,
      chucVu: String(values.get("chucVu") || "") || null,
      chucVuEn: String(values.get("chucVuEn") || "") || null,
      namBatDauHanhNghe: namBatDau,
      soNamKinhNghiem: namBatDau
        ? new Date().getFullYear() - namBatDau
        : Number(values.get("soNamKinhNghiem")) || null,
      gioiThieuNgan: String(values.get("gioiThieuNgan") || "") || null,
      gioiThieuNganEn: String(values.get("gioiThieuNganEn") || "") || null,
      tieuSu: String(values.get("tieuSu") || "") || null,
      tieuSuEn: String(values.get("tieuSuEn") || "") || null,
      quaTrinhDaoTao: lines("quaTrinhDaoTao"),
      quaTrinhDaoTaoEn: lines("quaTrinhDaoTaoEn"),
      quaTrinhCongTac: lines("quaTrinhCongTac"),
      quaTrinhCongTacEn: lines("quaTrinhCongTacEn"),
      linhVucKhamChua: lines("linhVucKhamChua"),
      linhVucKhamChuaEn: lines("linhVucKhamChuaEn"),
    };
    try {
      const result = await doctorService.capNhatHoSoBacSi(
        selectedDoctor.id,
        body,
      );
      if (!result.thanhCong) throw new Error(result.thongDiep);
      setMessage(result.thongDiep);
      await refreshDoctors();
    } catch (cause) {
      fail(cause);
    }
  };

  const toggleWorkStatus = async (doctor: BacSiQuanTriResponse) => {
    try {
      if (doctor.trangThai === "DANG_CONG_TAC") {
        const impact = await doctorService.getAnhHuongNgungCongTac(doctor.id);
        if (!impact.thanhCong || !impact.duLieu)
          throw new Error(impact.thongDiep);
        setDeactivatingDoctor({ doctor, impact: impact.duLieu });
        setDeactivateReason("");
      } else {
        if (
          !window.confirm(
            vi
              ? `Kích hoạt lại trạng thái công tác cho bác sĩ ${doctor.hoTen}?`
              : `Reactivate doctor ${doctor.hoTen}?`,
          )
        )
          return;
        const result = await doctorService.congTacLaiBacSi(doctor.id);
        if (!result.thanhCong) throw new Error(result.thongDiep);
        setMessage(result.thongDiep);
        setError("");
        await refreshDoctors();
      }
    } catch (cause) {
      fail(cause);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivatingDoctor || !deactivateReason.trim()) return;
    try {
      const result = await doctorService.ngungCongTacBacSi(
        deactivatingDoctor.doctor.id,
        {
          lyDo: deactivateReason.trim(),
        },
      );
      if (!result.thanhCong) throw new Error(result.thongDiep);
      setMessage(result.thongDiep);
      setError("");
      setDeactivatingDoctor(null);
      await refreshDoctors();
    } catch (cause) {
      fail(cause);
    }
  };

  const uploadPhoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDoctor) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("anh");
    if (!(file instanceof File) || !file.size) return;
    try {
      const result = await doctorService.themAnhBacSi(
        selectedDoctor.id,
        file,
        uploadType as "ANH_CONG_VIEC" | "CHUNG_CHI",
        String(values.get("chuThich") || "") || undefined,
        String(values.get("chuThichEn") || "") || undefined,
      );
      if (!result.thanhCong) throw new Error(result.thongDiep);
      setMessage(result.thongDiep);
      await client.invalidateQueries({
        queryKey: ["catalog", "admin-doctor-detail", selectedDoctor.id],
      });
      form.reset();
    } catch (cause) {
      fail(cause);
    }
  };

  const reorderPhoto = async (index: number, direction: -1 | 1) => {
    if (!selectedDoctor || !detail) return;
    const imageIds = detail.anh.map((image) => image.id);
    const target = index + direction;
    if (target < 0 || target >= imageIds.length) return;
    [imageIds[index], imageIds[target]] = [imageIds[target], imageIds[index]];
    try {
      const result = await doctorService.sapXepAnhBacSi(selectedDoctor.id, {
        idAnh: imageIds,
      });
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await client.invalidateQueries({
        queryKey: ["catalog", "admin-doctor-detail", selectedDoctor.id],
      });
    } catch (cause) {
      fail(cause);
    }
  };

  const deletePhoto = async (idAnh: number) => {
    if (
      !selectedDoctor ||
      !window.confirm(vi ? "Xóa ảnh này?" : "Delete this image?")
    )
      return;
    try {
      const result = await doctorService.xoaAnhBacSi(selectedDoctor.id, idAnh);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await client.invalidateQueries({
        queryKey: ["catalog", "admin-doctor-detail", selectedDoctor.id],
      });
    } catch (cause) {
      fail(cause);
    }
  };

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {vi ? "Quản lý bác sĩ" : "Doctor management"}
        </h2>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className={styles.actionBtn}
            aria-pressed={tab === "directory"}
            onClick={() => setTab("directory")}
          >
            {vi ? "Danh bạ" : "Directory"}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            aria-pressed={tab === "reviews"}
            onClick={() => setTab("reviews")}
          >
            {vi ? "Đánh giá" : "Reviews"}
          </button>
          <button
            type="button"
            onClick={() => setIsAddDoctorOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-900 transition-colors"
          >
            <UserPlus size={14} />
            <span>{vi ? "Thêm bác sĩ" : "Add Doctor"}</span>
          </button>
        </div>
      </div>
      {error && (
        <p className="mb-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-3 text-sm text-emerald-800" role="status">
          {message}
        </p>
      )}
      {tab === "directory" ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              className={styles.searchInput}
              placeholder={vi ? "Tìm bác sĩ theo tên, mã, email..." : "Search doctors..."}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
            <select
              className={styles.filterSelect}
              value={specialtyFilter}
              onChange={(event) => {
                setSpecialtyFilter(event.target.value);
                setPage(0);
              }}
            >
              <option value="">
                {vi ? "Mọi chuyên khoa" : "All specialties"}
              </option>
              {specialties.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.tenChuyenKhoa}
                </option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(0);
              }}
            >
              <option value="">{vi ? "Mọi trạng thái" : "All statuses"}</option>
              <option value="DANG_CONG_TAC">
                {vi ? "Đang công tác" : "Active"}
              </option>
              <option value="NGUNG_CONG_TAC">
                {vi ? "Ngừng công tác" : "Inactive"}
              </option>
            </select>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      onClick={() => handleSort("maBacSi")}
                      className="group inline-flex items-center gap-1.5 font-bold hover:text-teal-800 transition-colors"
                    >
                      <span>{vi ? "Mã" : "Code"}</span>
                      {renderSortIndicator("maBacSi")}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => handleSort("hoTen")}
                      className="group inline-flex items-center gap-1.5 font-bold hover:text-teal-800 transition-colors"
                    >
                      <span>{vi ? "Bác sĩ" : "Doctor"}</span>
                      {renderSortIndicator("hoTen")}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => handleSort("email")}
                      className="group inline-flex items-center gap-1.5 font-bold hover:text-teal-800 transition-colors"
                    >
                      <span>Email</span>
                      {renderSortIndicator("email")}
                    </button>
                  </th>
                  <th>{vi ? "Chuyên khoa" : "Specialty"}</th>
                  <th>{vi ? "Lượt khám" : "Visits"}</th>
                  <th>{vi ? "Trạng thái" : "Status"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                      {doctorsQuery.isLoading
                        ? (vi ? "Đang tải danh sách bác sĩ..." : "Loading doctors...")
                        : (vi ? "Không có bác sĩ nào phù hợp." : "No doctors found.")}
                    </td>
                  </tr>
                ) : (
                  sortedDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="font-mono text-xs">{doctor.maBacSi}</td>
                      <td>
                        <span className="font-semibold text-slate-800">
                          {doctor.hocVi ? `${doctor.hocVi} ` : ""}
                          {doctor.hoTen}
                        </span>
                        {doctor.chucVu && (
                          <span className="block text-[11px] text-slate-500">
                            {doctor.chucVu}
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs text-slate-600">{doctor.email}</td>
                      <td>{doctor.tenChuyenKhoa}</td>
                      <td>{doctor.soLuotDaKham}</td>
                      <td>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            doctor.trangThai === "DANG_CONG_TAC"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {doctor.trangThai}
                        </span>
                      </td>
                    <td className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => setSelectedDoctor(doctor)}
                      >
                        {vi ? "Hồ sơ" : "Profile"}
                      </button>
                      <button
                        type="button"
                        className={
                          doctor.trangThai === "DANG_CONG_TAC"
                            ? styles.actionBtnDanger
                            : styles.actionBtn
                        }
                        onClick={() => void toggleWorkStatus(doctor)}
                      >
                        {doctor.trangThai === "DANG_CONG_TAC"
                          ? vi
                            ? "Ngừng"
                            : "Deactivate"
                          : vi
                            ? "Công tác lại"
                            : "Reactivate"}
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
                ? `Trang ${page + 1} / ${doctorsQuery.data?.duLieu?.tongSoTrang ?? 1}`
                : `Page ${page + 1} / ${doctorsQuery.data?.duLieu?.tongSoTrang ?? 1}`}
            </span>
            <div className={styles.paginationActions}>
              <button
                className={styles.pageBtn}
                type="button"
                disabled={!page}
                onClick={() => setPage((value) => value - 1)}
              >
                {vi ? "Trước" : "Previous"}
              </button>
              <button
                className={styles.pageBtn}
                type="button"
                disabled={
                  page + 1 >= (doctorsQuery.data?.duLieu?.tongSoTrang ?? 1)
                }
                onClick={() => setPage((value) => value + 1)}
              >
                {vi ? "Sau" : "Next"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <label className="mb-4 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lowRatingOnly}
              onChange={(event) => setLowRatingOnly(event.target.checked)}
            />
            {vi ? "Chỉ đánh giá 1–2 sao" : "Only 1–2 star reviews"}
          </label>
          <div className={styles.tableScroll}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>{vi ? "Sao" : "Rating"}</th>
                  <th>{vi ? "Bác sĩ" : "Doctor"}</th>
                  <th>{vi ? "Bệnh nhân" : "Patient"}</th>
                  <th>{vi ? "Nhận xét" : "Comment"}</th>
                  <th>{vi ? "Ngày khám" : "Visit date"}</th>
                </tr>
              </thead>
              <tbody>
                {(reviewsQuery.data?.duLieu?.noiDung ?? []).map((review) => (
                  <tr key={review.id}>
                    <td>{"★".repeat(review.soSao)}</td>
                    <td>{review.tenBacSi}</td>
                    <td>{review.tenBenhNhan}</td>
                    <td>{review.nhanXet}</td>
                    <td>{review.ngayKham}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {selectedDoctor && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDoctor(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={vi ? "Hồ sơ bác sĩ" : "Doctor profile"}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-white p-6"
          >
            <div className="mb-5 flex justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold">
                {detail?.hoTen ?? selectedDoctor.hoTen}
              </h2>
              <button type="button" onClick={() => setSelectedDoctor(null)}>
                {vi ? "Đóng" : "Close"}
              </button>
            </div>
            <form
              className="mb-6 grid gap-3 border-b border-slate-200 pb-6 sm:grid-cols-2"
              onSubmit={(event) => void saveBasics(event)}
            >
              <h3 className="font-semibold sm:col-span-2">
                {vi ? "Thông tin cơ bản" : "Basic information"}
              </h3>
              <input
                name="hoTen"
                aria-label="Full name"
                defaultValue={detail?.hoTen ?? selectedDoctor.hoTen}
                required
              />
              <input
                name="soDienThoai"
                aria-label="Phone"
                defaultValue={detail?.soDienThoai ?? ""}
              />
              <select
                name="idChuyenKhoa"
                aria-label="Specialty"
                defaultValue={
                  detail?.idChuyenKhoa ?? selectedDoctor.idChuyenKhoa
                }
              >
                {specialties.map((specialty) => (
                  <option value={specialty.id} key={specialty.id}>
                    {specialty.tenChuyenKhoa}
                  </option>
                ))}
              </select>
              <input
                name="soGiayPhep"
                aria-label="License number"
                defaultValue={detail?.soGiayPhep ?? ""}
              />
              <button className={styles.actionBtn} type="submit">
                {vi ? "Lưu thông tin" : "Save details"}
              </button>
            </form>
            {detail && (
              <form
                className="mb-6 grid gap-3 border-b border-slate-200 pb-6 sm:grid-cols-2"
                onSubmit={(event) => void saveProfile(event)}
              >
                <h3 className="font-semibold sm:col-span-2">
                  {vi
                    ? "Hồ sơ giới thiệu song ngữ"
                    : "Bilingual public profile"}
                </h3>
                {(
                  [
                    "hocVi",
                    "chucVu",
                    "chucVuEn",
                    "namBatDauHanhNghe",
                    "gioiThieuNgan",
                    "gioiThieuNganEn",
                    "tieuSu",
                    "tieuSuEn",
                    "quaTrinhDaoTao",
                    "quaTrinhDaoTaoEn",
                    "quaTrinhCongTac",
                    "quaTrinhCongTacEn",
                    "linhVucKhamChua",
                    "linhVucKhamChuaEn",
                  ] as const
                ).map((name) => (
                  <label className="grid gap-1 text-xs" key={name}>
                    {name}
                    {name.startsWith("quaTrinh") ||
                    name.startsWith("linhVuc") ||
                    name === "tieuSu" ||
                    name === "tieuSuEn" ? (
                      <textarea
                        name={name}
                        rows={3}
                        defaultValue={
                          Array.isArray(detail[name])
                            ? (detail[name] as string[]).join("\n")
                            : String(detail[name] ?? "")
                        }
                      />
                    ) : (
                      <input
                        name={name}
                        defaultValue={String(detail[name] ?? "")}
                      />
                    )}
                  </label>
                ))}
                <button className={styles.actionBtn} type="submit">
                  {vi ? "Lưu hồ sơ" : "Save profile"}
                </button>
              </form>
            )}
            <form
              className="mb-5 flex flex-wrap items-end gap-3"
              onSubmit={(event) => void uploadPhoto(event)}
            >
              <label className="grid gap-1 text-xs">
                {vi ? "Ảnh" : "Photo"}
                <input
                  name="anh"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs">
                {vi ? "Loại ảnh" : "Photo type"}
                <select
                  value={uploadType}
                  onChange={(event) => setUploadType(event.target.value)}
                >
                  <option value="ANH_CONG_VIEC">
                    {vi ? "Ảnh công việc" : "Work photo"}
                  </option>
                  <option value="CHUNG_CHI">
                    {vi ? "Chứng chỉ" : "Certificate"}
                  </option>
                </select>
              </label>
              <label className="grid gap-1 text-xs">
                {vi ? "Chú thích (VI)" : "Caption (VI)"}
                <input name="chuThich" />
              </label>
              <label className="grid gap-1 text-xs">
                {vi ? "Chú thích (EN)" : "Caption (EN)"}
                <input name="chuThichEn" />
              </label>
              <button className={styles.actionBtn} type="submit">
                {vi ? "Tải ảnh" : "Upload photo"}
              </button>
            </form>
            <div className="grid gap-3 sm:grid-cols-2">
              {(detail?.anh ?? []).map((image, index) => (
                <article
                  className="flex items-center gap-3 border border-slate-200 p-3"
                  key={image.id}
                >
                  <img
                    src={image.url}
                    alt={image.chuThich ?? ""}
                    className="h-16 w-16 object-cover"
                  />
                  <span className="min-w-0 flex-1 text-sm">
                    {image.chuThich || image.loai}
                  </span>
                  <button
                    type="button"
                    onClick={() => void reorderPhoto(index, -1)}
                    aria-label="Move photo up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => void reorderPhoto(index, 1)}
                    aria-label="Move photo down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="text-rose-700"
                    onClick={() => void deletePhoto(image.id)}
                  >
                    {vi ? "Xóa" : "Delete"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
      {/* SAFE DEACTIVATION MODAL */}
      {deactivatingDoctor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-700 mb-2">
              {vi ? "Ngừng công tác bác sĩ" : "Deactivate Doctor"}
            </h3>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {deactivatingDoctor.doctor.hoTen} ({deactivatingDoctor.doctor.maBacSi}) - {deactivatingDoctor.doctor.tenChuyenKhoa}
            </p>

            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <p className="font-bold mb-1">
                {vi ? "Cảnh báo ảnh hưởng:" : "Impact Warning:"}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  {vi
                    ? `Sẽ tự động hủy ${deactivatingDoctor.impact.soCaSapToi} ca trực sắp tới`
                    : `Will cancel ${deactivatingDoctor.impact.soCaSapToi} upcoming work shifts`}
                </li>
                <li>
                  {vi
                    ? `Ảnh hưởng đến ${deactivatingDoctor.impact.soLichHenBiAnhHuong} lịch hẹn đã đặt của bệnh nhân (chuyển sang trạng thái cần đổi lịch)`
                    : `Affects ${deactivatingDoctor.impact.soLichHenBiAnhHuong} booked patient appointments`}
                </li>
              </ul>
            </div>

            <label className="block text-xs font-semibold mb-3">
              {vi ? "Lý do ngừng công tác (bắt buộc) *" : "Reason for deactivation (required) *"}
              <textarea
                rows={3}
                required
                className="w-full mt-1 p-2 border rounded text-xs"
                placeholder={
                  vi
                    ? "Nhập lý do (nghỉ việc, chuyển viện, nghỉ phép dài hạn...)"
                    : "Enter reason..."
                }
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setDeactivatingDoctor(null)}
              >
                {vi ? "Hủy bỏ" : "Cancel"}
              </button>
              <button
                type="button"
                className={styles.actionBtnDanger}
                disabled={!deactivateReason.trim()}
                onClick={() => void confirmDeactivate()}
              >
                {vi ? "Xác nhận ngưng công tác" : "Confirm Deactivation"}
              </button>
            </div>
      {/* MODAL THÊM BÁC SĨ */}
      {isAddDoctorOpen && (
        <div
          className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isAddingDoctor) setIsAddDoctorOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={18} className="text-teal-700" />
                <span>{vi ? "Thêm tài khoản bác sĩ" : "Add Doctor Account"}</span>
              </h3>
              <button
                type="button"
                disabled={isAddingDoctor}
                onClick={() => setIsAddDoctorOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-teal-50 border border-teal-200/80 p-3 mb-4 text-xs text-teal-800">
              <p className="font-semibold mb-1">
                {vi ? "ℹ️ Thông tin cấp mật khẩu:" : "ℹ️ Account Credentials:"}
              </p>
              <p>
                {vi
                  ? "Mật khẩu mặc định sẽ được hệ thống tự động sinh và gửi qua email cho bác sĩ. Bác sĩ sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên."
                  : "Default password will be automatically generated by the backend and sent to the doctor. The doctor will be prompted to change password on first login."}
              </p>
            </div>

            <form onSubmit={(e) => void addDoctor(e)} className="grid gap-3 text-xs sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  {vi ? "Họ và tên" : "Full name"} <span className="text-rose-500">*</span>
                </span>
                <input
                  name="hoTen"
                  required
                  placeholder="BS. Nguyễn Văn A"
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  Email <span className="text-rose-500">*</span>
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="doctor@eclinic.vn"
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  {vi ? "Số điện thoại" : "Phone"}
                </span>
                <input
                  name="soDienThoai"
                  placeholder="0912345678"
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  {vi ? "Chuyên khoa" : "Specialty"} <span className="text-rose-500">*</span>
                </span>
                <select
                  name="idChuyenKhoa"
                  required
                  defaultValue=""
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                >
                  <option value="" disabled>
                    {vi ? "-- Chọn chuyên khoa --" : "-- Select specialty --"}
                  </option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.tenChuyenKhoa}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  {vi ? "Số giấy phép hành nghề" : "License number"}
                </span>
                <input
                  name="soGiayPhep"
                  placeholder="CCHN-12345"
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  {vi ? "Học vị" : "Degree"}
                </span>
                <input
                  name="hocVi"
                  placeholder="BSCKII, ThS.BS, TS..."
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  {vi ? "Chức vụ" : "Title / Position"}
                </span>
                <input
                  name="chucVu"
                  placeholder="Trưởng khoa, Bác sĩ điều trị..."
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                />
              </label>
              <label className="grid gap-1">
                <span className="font-medium text-slate-700">
                  {vi ? "Năm bắt đầu hành nghề" : "Practicing since (Year)"}
                </span>
                <input
                  name="namBatDauHanhNghe"
                  type="number"
                  min={1960}
                  max={new Date().getFullYear()}
                  placeholder="VD: 2015"
                  className="rounded-lg border border-slate-300 p-2 text-xs focus:border-teal-600 focus:outline-none"
                />
              </label>

              <div className="sm:col-span-2 flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isAddingDoctor}
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  {vi ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isAddingDoctor}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-900 disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  <span>{isAddingDoctor ? (vi ? "Đang xử lý..." : "Creating...") : (vi ? "Tạo bác sĩ" : "Create doctor")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

