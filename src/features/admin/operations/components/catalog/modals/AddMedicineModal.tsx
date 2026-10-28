import { useState, type FormEvent } from "react";
import { medicineService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ThuocRequest } from "@/types/catalog.type";
import styles from "../../../../AdminDashboardPage.module.css";
import { Plus, X } from "lucide-react";

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => Promise<void>;
  onError: (errorText: string) => void;
}

export function AddMedicineModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: AddMedicineModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    setIsSubmitting(true);
    try {
      const result = await medicineService.taoThuoc(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await onSuccess(result.thongDiep);
      form.reset();
      onClose();
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể thêm thuốc mới." : "Failed to add medicine."));
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
            <span>{vi ? "Thêm thuốc vào danh mục y tế" : "Add Medicine to Catalog"}</span>
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
        <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Tên biệt dược / Tên thuốc *" : "Medicine / Brand Name *"}
            <input
              name="tenThuoc"
              required
              className="px-3 py-2 text-xs"
              placeholder="VD: Paracetamol, Amoxicillin..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Hoạt chất chính" : "Active Ingredient"}
            <input
              name="hoatChat"
              className="px-3 py-2 text-xs"
              placeholder="VD: Paracetamol 500mg"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Hàm lượng" : "Strength / Dosage"}
            <input
              name="hamLuong"
              className="px-3 py-2 text-xs"
              placeholder="VD: 500mg, 10ml..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Dạng bào chế" : "Dosage Form"}
            <input
              name="dangBaoChe"
              className="px-3 py-2 text-xs"
              placeholder="VD: Viên nén, Siro, Gói bột..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Đường dùng" : "Administration Route"}
            <input
              name="duongDung"
              className="px-3 py-2 text-xs"
              placeholder="VD: Uống, Tiêm bắp, Bôi ngoài da..."
            />
          </label>
          <label className="sm:col-span-2 grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Đơn vị đóng gói / cấp phát" : "Unit"}
            <input
              name="donVi"
              className="px-3 py-2 text-xs"
              placeholder="VD: Viên, Vỉ, Hộp, Lọ..."
            />
          </label>
          <label className="sm:col-span-2 grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Mô tả / Lưu ý sử dụng" : "Usage Notes / Description"}
            <textarea
              name="moTa"
              rows={3}
              className="px-3 py-2 text-xs"
              placeholder="Lưu ý tương tác, chống chỉ định, hướng dẫn sử dụng..."
            />
          </label>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2 pt-3 border-t">
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
                  ? "Thêm thuốc"
                  : "Add medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
