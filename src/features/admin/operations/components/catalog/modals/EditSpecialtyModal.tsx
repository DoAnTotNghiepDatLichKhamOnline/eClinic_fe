import { useState, type FormEvent } from "react";
import { specialtyService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ChuyenKhoaRequest, ChuyenKhoaResponse } from "@/types/catalog.type";
import styles from "../../../../AdminDashboardPage.module.css";
import { X } from "lucide-react";

interface EditSpecialtyModalProps {
  specialty: ChuyenKhoaResponse | null;
  onClose: () => void;
  onSuccess: (message: string) => Promise<void>;
  onError: (errorText: string) => void;
}

export function EditSpecialtyModal({
  specialty,
  onClose,
  onSuccess,
  onError,
}: EditSpecialtyModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!specialty) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    setIsSubmitting(true);
    try {
      const response = await specialtyService.capNhatChuyenKhoa(
        specialty.id,
        request,
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await onSuccess(response.thongDiep);
      onClose();
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể cập nhật chuyên khoa." : "Failed to update specialty."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800">
            {vi ? "Chỉnh sửa chuyên khoa" : "Edit Specialty"} #{specialty.id}
          </h3>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-3">
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Tên chuyên khoa (VI) *" : "Specialty Name (VI) *"}
            <input
              name="tenChuyenKhoa"
              defaultValue={specialty.tenChuyenKhoa}
              required
              className="p-2 border rounded text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Tên chuyên khoa (EN)" : "Specialty Name (EN)"}
            <input
              name="tenChuyenKhoaEn"
              defaultValue={specialty.tenChuyenKhoaEn || ""}
              className="p-2 border rounded text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Mô tả (VI)" : "Description (VI)"}
            <input
              name="moTa"
              defaultValue={specialty.moTa || ""}
              className="p-2 border rounded text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Mô tả (EN)" : "Description (EN)"}
            <input
              name="moTaEn"
              defaultValue={specialty.moTaEn || ""}
              className="p-2 border rounded text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Triệu chứng (VI)" : "Symptoms (VI)"}
            <input
              name="trieuChung"
              defaultValue={specialty.trieuChung || ""}
              className="p-2 border rounded text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Triệu chứng (EN)" : "Symptoms (EN)"}
            <input
              name="trieuChungEn"
              defaultValue={specialty.trieuChungEn || ""}
              className="p-2 border rounded text-xs"
            />
          </label>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              disabled={isSubmitting}
              className={styles.secondaryButton}
              onClick={onClose}
            >
              {vi ? "Hủy" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.actionBtn}
            >
              {isSubmitting
                ? vi
                  ? "Đang lưu..."
                  : "Saving..."
                : vi
                  ? "Lưu thay đổi"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
