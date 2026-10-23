import { useLanguage } from "@/shared/context/LanguageContext";
import type { ThuocResponse } from "@/types/catalog.type";
import { Pagination } from "@/shared/components/ui/Pagination";
import styles from "../../../AdminDashboardPage.module.css";
import {
  Plus,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface MedicinesTabProps {
  medicines: ThuocResponse[];
  isLoading: boolean;
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onOpenAddModal: () => void;
  onSelectEdit: (medicine: ThuocResponse) => void;
  onVerify: (medicineId: number) => void;
  onDisable: (medicineId: number) => void;
  onReactivate: (medicineId: number) => void;
}

export function MedicinesTab({
  medicines,
  isLoading,
  currentPage = 0,
  totalPages = 1,
  totalElements,
  onPageChange = () => {},
  onOpenAddModal,
  onSelectEdit,
  onVerify,
  onDisable,
  onReactivate,
}: MedicinesTabProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          {vi ? "Danh mục thuốc y tế" : "Medicines Directory"}
        </h3>
        <button
          type="button"
          onClick={onOpenAddModal}
          className={styles.actionBtn}
        >
          <Plus size={14} />
          <span>{vi ? "Thêm thuốc" : "Add Medicine"}</span>
        </button>
      </div>

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
            {medicines.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-xs text-slate-500"
                >
                  {isLoading
                    ? vi
                      ? "Đang tải dữ liệu..."
                      : "Loading..."
                    : vi
                      ? "Không có thuốc nào trong danh mục."
                      : "No medicines found."}
                </td>
              </tr>
            ) : (
              medicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td className="font-semibold text-slate-900">
                    {medicine.tenThuoc}
                    {medicine.tenBacSiTao && (
                      <div className="text-[11px] text-slate-500 font-normal">
                        {vi ? "Bác sĩ tạo:" : "Created by:"}{" "}
                        {medicine.tenBacSiTao}
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
                      onClick={() => onSelectEdit(medicine)}
                    >
                      <Edit3 size={13} className="inline mr-1" />
                      {vi ? "Sửa" : "Edit"}
                    </button>

                    {!medicine.daXacMinh && (
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => onVerify(medicine.id)}
                      >
                        <ShieldCheck size={13} className="inline mr-1" />
                        {vi ? "Xác minh" : "Verify"}
                      </button>
                    )}

                    {medicine.trangThai === "DANG_DUNG" ? (
                      <button
                        className={styles.actionBtnDanger}
                        type="button"
                        onClick={() => onDisable(medicine.id)}
                      >
                        {vi ? "Ngừng dùng" : "Disable"}
                      </button>
                    ) : (
                      <button
                        className={styles.actionBtn}
                        type="button"
                        onClick={() => onReactivate(medicine.id)}
                      >
                        {vi ? "Dùng lại" : "Reactivate"}
                      </button>
                    )}
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
