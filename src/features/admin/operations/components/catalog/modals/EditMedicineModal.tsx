import { useState, type FormEvent } from "react";
import { medicineService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ThuocRequest, ThuocResponse } from "@/types/catalog.type";
import styles from "../../../../AdminDashboardPage.module.css";
import { X } from "lucide-react";

interface EditMedicineModalProps {
  medicine: ThuocResponse | null;
  onClose: () => void;
  onSuccess: (message: string) => Promise<void>;
  onError: (errorText: string) => void;
}

export function EditMedicineModal({
  medicine,
  onClose,
  onSuccess,
  onError,
}: EditMedicineModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!medicine) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const coBaoHiem = values.get("coBaoHiem") === "true";
    const donGiaRaw = Number(values.get("donGia") || 0);
    const donGia = Math.max(0, Math.round(isNaN(donGiaRaw) ? 0 : donGiaRaw));

    const request: ThuocRequest = {
      tenThuoc: String(values.get("tenThuoc")),
      hoatChat: String(values.get("hoatChat") || "") || null,
      hamLuong: String(values.get("hamLuong") || "") || null,
      dangBaoChe: String(values.get("dangBaoChe") || "") || null,
      duongDung: String(values.get("duongDung") || "") || null,
      donVi: String(values.get("donVi") || "") || null,
      moTa: String(values.get("moTa") || "") || null,
      coBaoHiem,
      donGia,
    };

    setIsSubmitting(true);
    try {
      const response = await medicineService.capNhatThuoc(
        medicine.id,
        request,
      );
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await onSuccess(response.thongDiep);
      onClose();
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể cập nhật thuốc." : "Failed to update medicine."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800">
            {vi ? "Chỉnh sửa thông tin thuốc" : "Edit Medicine"} #{medicine.id}
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
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className="sm:col-span-2 grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Tên thuốc *" : "Medicine Name *"}
            <input
              name="tenThuoc"
              defaultValue={medicine.tenThuoc}
              required
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Hoạt chất chính" : "Active Ingredient"}
            <input
              name="hoatChat"
              defaultValue={medicine.hoatChat || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Hàm lượng" : "Strength"}
            <input
              name="hamLuong"
              defaultValue={medicine.hamLuong || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Dạng bào chế" : "Dosage Form"}
            <input
              name="dangBaoChe"
              defaultValue={medicine.dangBaoChe || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Đường dùng" : "Administration Route"}
            <input
              name="duongDung"
              defaultValue={medicine.duongDung || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="sm:col-span-2 grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Đơn vị tính" : "Unit"}
            <input
              name="donVi"
              defaultValue={medicine.donVi || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Phạm vi Bảo hiểm Y tế (BHYT) *" : "Health Insurance (BHYT) *"}
            <select
              name="coBaoHiem"
              defaultValue={medicine.coBaoHiem ? "true" : "false"}
              className="px-3 py-2 text-xs border rounded-lg bg-white text-slate-800"
            >
              <option value="true">{vi ? "Có BHYT chi trả" : "Covered by BHYT"}</option>
              <option value="false">{vi ? "Ngoài BHYT (Tự túc)" : "Non-BHYT (Self-pay)"}</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Đơn giá (VND / đơn vị) *" : "Unit Price (VND) *"}
            <input
              name="donGia"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={medicine.donGia ?? 0}
              className="px-3 py-2 text-xs border rounded-lg text-slate-800"
              placeholder="VD: 5000, 15000..."
            />
          </label>
          <div className="sm:col-span-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
            ℹ {vi
              ? "Lưu ý v2: Thuốc đã có lượt kê đơn trong hệ thống vẫn luôn được phép điều chỉnh trạng thái BHYT và đơn giá."
              : "Note v2: Medicines with existing prescriptions can still update BHYT status and unit price."}
          </div>
          <label className="sm:col-span-2 grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Mô tả / Hướng dẫn" : "Description / Notes"}
            <textarea
              name="moTa"
              rows={3}
              defaultValue={medicine.moTa || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
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
