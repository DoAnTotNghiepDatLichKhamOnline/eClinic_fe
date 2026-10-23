import { useLanguage } from "@/shared/context/LanguageContext";
import type { ChuyenKhoaResponse } from "@/types/catalog.type";
import { Pagination } from "@/shared/components/ui/Pagination";
import styles from "../../../AdminDashboardPage.module.css";
import { Plus, Edit3, Trash2 } from "lucide-react";

interface SpecialtiesTabProps {
  specialties: ChuyenKhoaResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  onOpenAddModal: () => void;
  onSelectEdit: (specialty: ChuyenKhoaResponse) => void;
  onDeleteSpecialty?: (specialty: ChuyenKhoaResponse) => void;
}

export function SpecialtiesTab({
  specialties,
  isLoading,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  onOpenAddModal,
  onSelectEdit,
  onDeleteSpecialty,
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
                    <div className="flex gap-1.5 items-center">
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => onSelectEdit(item)}
                      >
                        <Edit3 size={13} className="inline mr-1" />
                        {vi ? "Sửa" : "Edit"}
                      </button>
                      {onDeleteSpecialty && (
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                          type="button"
                          onClick={() => onDeleteSpecialty(item)}
                          title={vi ? "Xóa chuyên khoa" : "Delete specialty"}
                        >
                          <Trash2 size={13} />
                          {vi ? "Xóa" : "Delete"}
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
