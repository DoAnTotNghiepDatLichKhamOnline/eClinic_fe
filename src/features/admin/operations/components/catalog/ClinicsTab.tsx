import { useLanguage } from "@/shared/context/LanguageContext";
import type { PhongKhamQuanTriResponse } from "@/types/catalog.type";
import styles from "../../../AdminDashboardPage.module.css";
import { Plus, Edit3 } from "lucide-react";

interface ClinicsTabProps {
  clinics: PhongKhamQuanTriResponse[];
  isLoading: boolean;
  onOpenAddModal: () => void;
  onSelectEdit: (clinic: PhongKhamQuanTriResponse) => void;
  onDeactivate: (clinicId: number) => void;
  onActivate: (clinicId: number) => void;
}

export function ClinicsTab({
  clinics,
  isLoading,
  onOpenAddModal,
  onSelectEdit,
  onDeactivate,
  onActivate,
}: ClinicsTabProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          {vi ? "Danh sách phòng khám" : "Clinics List"}
        </h3>
        <button
          type="button"
          onClick={onOpenAddModal}
          className={styles.actionBtn}
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
                  <td className="space-x-2">
                    <button
                      className={styles.actionBtn}
                      type="button"
                      onClick={() => onSelectEdit(clinic)}
                    >
                      <Edit3 size={13} className="inline mr-1" />
                      {vi ? "Sửa" : "Edit"}
                    </button>
                    {clinic.trangThai === "HOAT_DONG" ? (
                      <button
                        className={styles.actionBtnDanger}
                        type="button"
                        onClick={() => onDeactivate(clinic.id)}
                      >
                        {vi ? "Ngừng hoạt động" : "Deactivate"}
                      </button>
                    ) : (
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => onActivate(clinic.id)}
                      >
                        {vi ? "Kích hoạt" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
