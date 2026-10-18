import { useState, type FormEvent } from "react";
import { clinicService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type { PhongKhamRequest, PhongKhamQuanTriResponse, ChuyenKhoaResponse } from "@/types/catalog.type";
import styles from "../../../../AdminDashboardPage.module.css";
import { X } from "lucide-react";

interface EditClinicModalProps {
  clinic: PhongKhamQuanTriResponse | null;
  specialties: ChuyenKhoaResponse[];
  onClose: () => void;
  onSuccess: (message: string) => Promise<void>;
  onError: (errorText: string) => void;
}

export function EditClinicModal({
  clinic,
  specialties,
  onClose,
  onSuccess,
  onError,
}: EditClinicModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!clinic) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const request: PhongKhamRequest = {
      tenPhong: String(values.get("tenPhong")),
      tenPhongEn: String(values.get("tenPhongEn") || "") || null,
      tang: String(values.get("tang") || "") || null,
      tangEn: String(values.get("tangEn") || "") || null,
      idChuyenKhoa: Number(values.get("idChuyenKhoa")),
    };

    setIsSubmitting(true);
    try {
      const response = await clinicService.suaPhongKham(clinic.id, request);
      if (!response.thanhCong) throw new Error(response.thongDiep);
      await onSuccess(response.thongDiep);
      onClose();
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể cập nhật phòng khám." : "Failed to update clinic."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800">
            {vi ? "Chỉnh sửa phòng khám" : "Edit Clinic"} #{clinic.id}
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
              defaultValue={clinic.tenPhong}
              required
              className="p-2 border rounded text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Tên phòng khám (EN)" : "Clinic Name (EN)"}
            <input
              name="tenPhongEn"
              defaultValue={clinic.tenPhongEn || ""}
              className="p-2 border rounded text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            {vi ? "Chuyên khoa *" : "Specialty *"}
            <select
              name="idChuyenKhoa"
              defaultValue={clinic.idChuyenKhoa}
              required
              className="p-2 border rounded text-xs bg-white"
            >
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
              defaultValue={clinic.tang || ""}
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
