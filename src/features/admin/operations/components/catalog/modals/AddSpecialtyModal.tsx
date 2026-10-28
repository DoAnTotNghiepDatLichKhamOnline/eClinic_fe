import { useState, type FormEvent } from "react";
import { specialtyService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ChuyenKhoaRequest } from "@/types/catalog.type";
import styles from "../../../../AdminDashboardPage.module.css";
import { Plus, X } from "lucide-react";

interface AddSpecialtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => Promise<void>;
  onError: (errorText: string) => void;
}

export function AddSpecialtyModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: AddSpecialtyModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    setIsSubmitting(true);
    try {
      const result = await specialtyService.taoChuyenKhoa(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await onSuccess(result.thongDiep);
      form.reset();
      onClose();
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể tạo chuyên khoa." : "Failed to create specialty."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-teal-700" />
            <span>{vi ? "Thêm chuyên khoa mới" : "Add New Specialty"}</span>
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
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Tên chuyên khoa (VI) *" : "Specialty Name (VI) *"}
            <input
              name="tenChuyenKhoa"
              required
              maxLength={255}
              className="px-3 py-2 text-xs"
              placeholder="VD: Tim mạch, Nhi khoa..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Tên chuyên khoa (EN)" : "Specialty Name (EN)"}
            <input
              name="tenChuyenKhoaEn"
              maxLength={255}
              className="px-3 py-2 text-xs"
              placeholder="e.g. Cardiology, Pediatrics..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Mô tả chuyên khoa (VI)" : "Description (VI)"}
            <textarea
              name="moTa"
              rows={3}
              maxLength={255}
              className="px-3 py-2 text-xs"
              placeholder={vi ? "Mô tả chuyên môn..." : "Specialty description..."}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Mô tả chuyên khoa (EN)" : "Description (EN)"}
            <textarea
              name="moTaEn"
              rows={3}
              maxLength={255}
              className="px-3 py-2 text-xs"
              placeholder="Description in English..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Triệu chứng thường gặp (VI)" : "Symptoms (VI)"}
            <textarea
              name="trieuChung"
              rows={3}
              maxLength={2000}
              className="px-3 py-2 text-xs"
              placeholder={vi ? "Các triệu chứng điển hình (sốt, ho, khó thở...)" : "Common symptoms..."}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Triệu chứng thường gặp (EN)" : "Symptoms (EN)"}
            <textarea
              name="trieuChungEn"
              rows={3}
              maxLength={2000}
              className="px-3 py-2 text-xs"
              placeholder="Common symptoms in English..."
            />
          </label>
          <div className="flex justify-end gap-2 mt-2 pt-3 border-t">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              {vi ? "Hủy" : "Cancel"}
            </button>
            <button
              className={styles.actionBtn}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? vi
                  ? "Đang lưu..."
                  : "Saving..."
                : vi
                  ? "Thêm chuyên khoa"
                  : "Add specialty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
