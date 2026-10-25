import { useLanguage } from "@/shared/context/LanguageContext";
import type { PhongKhamQuanTriResponse } from "@/types/catalog.type";
import { Pagination } from "@/shared/components/ui/Pagination";
import styles from "../../../AdminDashboardPage.module.css";
import { Plus, Edit3, Lock, Check } from "lucide-react";

interface ClinicsTabProps {
  clinics: PhongKhamQuanTriResponse[];
  isLoading: boolean;
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onOpenAddModal: () => void;
  onSelectEdit: (clinic: PhongKhamQuanTriResponse) => void;
  onDeactivate: (clinicId: number) => void;
  onActivate: (clinicId: number) => void;
}

export function ClinicsTab({
  clinics,
  isLoading,
  currentPage = 0,
  totalPages = 1,
  totalElements,
  onPageChange = () => {},
  onOpenAddModal,
  onSelectEdit,
  onDeactivate,
  onActivate,
}: ClinicsTabProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={onOpenAddModal}
          className={styles.actionBtnPrimary}
        >
          <Plus size={14} />
          <span>{vi ? "Thêm phòng khám" : "Add Clinic"}</span>
        </button>
      </div>

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
            {clinics.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-xs text-slate-500"
                >
                  {isLoading
                    ? vi
                      ? "Đang tải dữ liệu..."
                      : "Loading..."
                    : vi
                      ? "Không có phòng khám nào."
                      : "No clinics found."}
                </td>
              </tr>
            ) : (
              clinics.map((clinic) => (
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
                  <td>
                    <div className="flex gap-1.5 items-center">
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => onSelectEdit(clinic)}
                      >
                        <Edit3 size={13} />
                        {vi ? "Sửa" : "Edit"}
                      </button>
                      {clinic.trangThai === "HOAT_DONG" ? (
                        <button
                          className={styles.actionBtnDanger}
                          type="button"
                          onClick={() => onDeactivate(clinic.id)}
                        >
                          <Lock size={13} />
                          {vi ? "Ngừng" : "Deactivate"}
                        </button>
                      ) : (
                        <button
                          className={styles.actionBtnSuccess}
                          type="button"
                          onClick={() => onActivate(clinic.id)}
                        >
                          <Check size={13} />
                          {vi ? "Kích hoạt" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={10}
        onPageChange={onPageChange}
      />
    </>
  );
}
