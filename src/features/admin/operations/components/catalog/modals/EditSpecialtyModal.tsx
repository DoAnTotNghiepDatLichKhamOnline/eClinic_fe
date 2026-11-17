import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { specialtyService } from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ChuyenKhoaRequest, ChuyenKhoaResponse } from "@/types/catalog.type";
import styles from "../../../../AdminDashboardPage.module.css";
import { X, Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

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
  const [currentImage, setCurrentImage] = useState<string | null>(specialty?.anhMinhHoa || null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!specialty) return null;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      onError(vi ? "Chỉ hỗ trợ file ảnh định dạng JPEG, PNG, hoặc WebP." : "Only JPEG, PNG, or WebP images are supported.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      onError(vi ? "Kích thước ảnh tối đa là 4 MB." : "Maximum image size is 4 MB.");
      return;
    }

    setIsUpdatingImage(true);
    try {
      const res = await specialtyService.doiAnhChuyenKhoa(specialty.id, file);
      if (!res.thanhCong) throw new Error(res.thongDiep);
      setCurrentImage(res.duLieu?.anhMinhHoa || null);
      await onSuccess(res.thongDiep || (vi ? "Đã cập nhật ảnh minh họa." : "Specialty image updated."));
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể tải ảnh minh họa lên." : "Failed to upload specialty image."));
    } finally {
      setIsUpdatingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm(vi ? "Bạn có chắc muốn xóa ảnh minh họa của chuyên khoa này?" : "Are you sure you want to delete this specialty's image?")) {
      return;
    }

    setIsUpdatingImage(true);
    try {
      const res = await specialtyService.xoaAnhChuyenKhoa(specialty.id);
      if (!res.thanhCong) throw new Error(res.thongDiep);
      setCurrentImage(null);
      await onSuccess(res.thongDiep || (vi ? "Đã xóa ảnh minh họa." : "Specialty image deleted."));
    } catch (cause) {
      onError(getApiErrorMessage(cause, vi ? "Không thể xóa ảnh minh họa." : "Failed to delete specialty image."));
    } finally {
      setIsUpdatingImage(false);
    }
  };

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
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
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
          {/* Ảnh minh họa chuyên khoa (v2) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {vi ? "Ảnh minh họa chuyên khoa" : "Specialty Illustration Image"}
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={specialty.tenChuyenKhoa}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center justify-center">
                    <ImageIcon size={24} />
                    <span className="text-[10px] text-slate-400 mt-0.5">{vi ? "Mặc định" : "Default"}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleFileChange(e)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isUpdatingImage || isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-600 bg-teal-50 text-teal-800 text-xs font-semibold hover:bg-teal-100 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isUpdatingImage ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    <span>
                      {currentImage
                        ? (vi ? "Đổi ảnh mới" : "Replace Image")
                        : (vi ? "Tải ảnh lên" : "Upload Image")}
                    </span>
                  </button>
                  {currentImage && (
                    <button
                      type="button"
                      disabled={isUpdatingImage || isSubmitting}
                      onClick={() => void handleDeleteImage()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>{vi ? "Xóa ảnh" : "Remove"}</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {vi
                    ? "Định dạng: JPEG, PNG, WebP (Tối đa 4 MB. Hệ thống tự động thu về cạnh dài 1280 px)."
                    : "Format: JPEG, PNG, WebP (Max 4 MB. System auto-scales to max 1280 px)."}
                </p>
              </div>
            </div>
          </div>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Tên chuyên khoa (VI) *" : "Specialty Name (VI) *"}
            <input
              name="tenChuyenKhoa"
              defaultValue={specialty.tenChuyenKhoa}
              required
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Tên chuyên khoa (EN)" : "Specialty Name (EN)"}
            <input
              name="tenChuyenKhoaEn"
              defaultValue={specialty.tenChuyenKhoaEn || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Mô tả (VI)" : "Description (VI)"}
            <textarea
              name="moTa"
              rows={3}
              maxLength={255}
              defaultValue={specialty.moTa || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Mô tả (EN)" : "Description (EN)"}
            <textarea
              name="moTaEn"
              rows={3}
              maxLength={255}
              defaultValue={specialty.moTaEn || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Triệu chứng (VI)" : "Symptoms (VI)"}
            <textarea
              name="trieuChung"
              rows={3}
              maxLength={2000}
              defaultValue={specialty.trieuChung || ""}
              className="px-3 py-2 text-xs"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            {vi ? "Triệu chứng (EN)" : "Symptoms (EN)"}
            <textarea
              name="trieuChungEn"
              rows={3}
              maxLength={2000}
              defaultValue={specialty.trieuChungEn || ""}
              className="px-3 py-2 text-xs"
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
