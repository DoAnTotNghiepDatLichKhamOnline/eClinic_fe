import { useState, type FormEvent } from "react";
import { clinicService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type { PhongKhamRequest, ChuyenKhoaResponse } from "@/types/catalog.type";
import styles from "../../../AdminDashboardPage.module.css";
import { Plus, X } from "lucide-react";

interface AddClinicModalProps {
  isOpen: boolean;
  specialties: ChuyenKhoaResponse[];
  onClose: () => void;
  onSuccess: (message: string) => Promise<void>;
  onError: (errorText: string) => void;
}

export function AddClinicModal({
  isOpen,
  specialties,
  onClose,
  onSuccess,
  onError,
}: AddClinicModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: PhongKhamRequest = {
      tenPhong: String(values.get("tenPhong")),
      tang: String(values.get("tang") || "") || null,
      idChuyenKhoa: Number(values.get("idChuyenKhoa")),
      tenPhongEn: String(values.get("tenPhongEn") || "") || null,
      tangEn: String(values.get("tangEn") || "") || null,
    };

    setIsSubmitting(true);
    try {
      const result = await clinicService.themPhongKham(request);
      if (!result.thanhCong) throw new Error(result.thongDiep);
      await onSuccess(result.thongDiep);
      form.reset();
      onClose();
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể thêm phòng khám." : "Failed to add clinic."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-teal-700" />
            <span>{vi ? "Thêm phòng khám mới" : "Add New Clinic"}</span>
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
            {vi ? "Tên phòng khám (VI) *" : "Clinic Name (VI) *"}
            <input
              name="tenPhong"
              required
              className="p-2 border rounded text-xs"
              placeholder="VD: Phòng khám Nội 1..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Tên phòng khám (EN)" : "Clinic Name (EN)"}
            <input
              name="tenPhongEn"
              className="p-2 border rounded text-xs"
              placeholder="e.g. Internal Medicine Clinic 1..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Chuyên khoa *" : "Specialty *"}
            <select
              name="idChuyenKhoa"
              required
              defaultValue=""
              className="p-2 border rounded text-xs bg-white"
            >
              <option value="" disabled>
                {vi ? "-- Chọn chuyên khoa --" : "-- Select specialty --"}
              </option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tenChuyenKhoa}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Tầng / Khu vực" : "Floor / Area"}
            <input
              name="tang"
              className="p-2 border rounded text-xs"
              placeholder="VD: Tầng 2, Khu A"
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
                  ? "Thêm phòng khám"
                  : "Add clinic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
