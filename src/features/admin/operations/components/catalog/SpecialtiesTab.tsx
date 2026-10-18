import { useLanguage } from "@/shared/context/LanguageContext";
import type { ChuyenKhoaResponse } from "@/types/catalog.type";
import styles from "../../../AdminDashboardPage.module.css";
import { Plus, Edit3 } from "lucide-react";

interface SpecialtiesTabProps {
  specialties: ChuyenKhoaResponse[];
  isLoading: boolean;
  onOpenAddModal: () => void;
  onSelectEdit: (specialty: ChuyenKhoaResponse) => void;
}

export function SpecialtiesTab({
  specialties,
  isLoading,
  onOpenAddModal,
  onSelectEdit,
}: SpecialtiesTabProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          {vi ? "Danh sách chuyên khoa" : "Specialties List"}
        </h3>
        <button
          type="button"
          onClick={onOpenAddModal}
          className={styles.actionBtn}
        >
          <Plus size={14} />
          <span>{vi ? "Thêm chuyên khoa" : "Add Specialty"}</span>
        </button>
      </div>

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
            {specialties.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-xs text-slate-500"
                >
                  {isLoading
                    ? vi
                      ? "Đang tải dữ liệu..."
                      : "Loading..."
                    : vi
                      ? "Không có chuyên khoa nào."
                      : "No specialties found."}
                </td>
              </tr>
            ) : (
              specialties.map((item) => (
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
                      onClick={() => onSelectEdit(item)}
                    >
                      <Edit3 size={13} className="inline mr-1" />
                      {vi ? "Sửa" : "Edit"}
                    </button>
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
