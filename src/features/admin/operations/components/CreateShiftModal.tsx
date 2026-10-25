import { useState, type FormEvent } from "react";
import { Loader2, CalendarPlus } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { useLanguage } from "@/shared/context/LanguageContext";
import { adminBookingService as bookingService } from "@/services/booking";
import { notifyAuth } from "@/utils/authNotification";
import type { TaoCaRequest } from "@/types/booking.type";
import type {
  BacSiQuanTriResponse,
  PhongKhamQuanTriResponse,
} from "@/types/catalog.type";

interface CreateShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  doctors: BacSiQuanTriResponse[];
  clinics: PhongKhamQuanTriResponse[];
  minDate: string;
  maxDate: string;
}

export function CreateShiftModal({
  isOpen,
  onClose,
  onSuccess,
  doctors,
  clinics,
  minDate,
  maxDate,
}: CreateShiftModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const activeDoctors = doctors.filter(
    (doc) => doc.trangThai === "DANG_CONG_TAC",
  );
  const activeClinics = clinics.filter((c) => c.trangThai === "HOAT_DONG");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const form = event.currentTarget;
    const values = new FormData(form);

    const weekDays = values.getAll("repeatDay").map(Number);
    const idBacSi = Number(values.get("idBacSi"));
    const idPhongKham = Number(values.get("idPhongKham"));
    const ngay = String(values.get("ngay") || "");
    const gioBatDau = String(values.get("gioBatDau") || "");
    const gioKetThuc = String(values.get("gioKetThuc") || "");
    const soLuotToiDaMoiGio = Number(values.get("soLuotToiDaMoiGio"));
    const thoiLuongLuotPhut = Number(values.get("thoiLuongLuotPhut"));
    const denNgay = String(values.get("denNgay") || "");

    if (!idBacSi || !idPhongKham || !ngay || !gioBatDau || !gioKetThuc) {
      setFormError(
        vi
          ? "Vui lòng điền đầy đủ các thông tin bắt buộc."
          : "Please fill in all required fields.",
      );
      return;
    }

    if (gioKetThuc <= gioBatDau) {
      setFormError(
        vi
          ? "Giờ kết thúc phải sau giờ bắt đầu."
          : "End time must be after start time.",
      );
      return;
    }

    if (weekDays.length > 0 && !denNgay) {
      setFormError(
        vi
          ? "Vui lòng chọn ngày kết thúc chu kỳ lặp lại."
          : "Please select an end date for the recurrence.",
      );
      return;
    }

    const request: TaoCaRequest = {
      idBacSi,
      idPhongKham,
      ngay,
      gioBatDau,
      gioKetThuc,
      soLuotToiDaMoiGio,
      thoiLuongLuotPhut,
      ...(weekDays.length
        ? {
            lapLai: {
              cacThu: weekDays,
              denNgay,
            },
          }
        : {}),
    };

    try {
      setIsSubmitting(true);
      const result = await bookingService.taoCaLamViec(request);
      if (!result.thanhCong) {
        throw new Error(
          result.thongDiep ||
            (vi ? "Không thể xếp ca làm việc." : "Failed to create shift."),
        );
      }

      notifyAuth(
        "success",
        vi ? "Xếp ca thành công" : "Shift created successfully",
        result.thongDiep ||
          (vi
            ? "Ca làm việc mới đã được tạo vào hệ thống."
            : "New shift has been scheduled successfully."),
      );

      form.reset();
      await onSuccess();
      onClose();
    } catch (cause: any) {
      const msg =
        cause?.response?.data?.thongDiep ||
        (cause instanceof Error
          ? cause.message
          : vi
            ? "Thao tác thất bại."
            : "The operation failed.");
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold ">
          <CalendarPlus size={20} className="text-teal-700" />
          <span>{vi ? "Xếp ca làm việc mới" : "Schedule New Shift"}</span>
        </div>
      }
      description={
        vi
          ? "Phân công bác sĩ, phòng khám và thiết lập khung giờ làm việc."
          : "Assign doctor, room, and configure work schedule hours."
      }
      maxWidth="lg"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 pt-2">
        {formError && (
          <div
            role="alert"
            className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
          >
            {formError}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            <span>
              {vi ? "Bác sĩ phụ trách" : "Doctor"}{" "}
              <span className="text-rose-500">*</span>
            </span>
            <select
              name="idBacSi"
              required
              defaultValue=""
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="" disabled>
                {vi ? "-- Chọn bác sĩ --" : "-- Select doctor --"}
              </option>
              {activeDoctors.map((doc) => (
                <option value={doc.id} key={doc.id}>
                  {doc.hoTen} · {doc.tenChuyenKhoa}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            <span>
              {vi ? "Phòng khám" : "Clinic Room"}{" "}
              <span className="text-rose-500">*</span>
            </span>
            <select
              name="idPhongKham"
              required
              defaultValue=""
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="" disabled>
                {vi ? "-- Chọn phòng khám --" : "-- Select clinic --"}
              </option>
              {activeClinics.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.tenPhong} {c.tang ? `(Tầng ${c.tang})` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            <span>
              {vi ? "Ngày làm việc" : "Date"}{" "}
              <span className="text-rose-500">*</span>
            </span>
            <input
              name="ngay"
              type="date"
              required
              min={minDate}
              max={maxDate}
              defaultValue={minDate}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            <span>
              {vi ? "Giờ bắt đầu" : "Start Time"}{" "}
              <span className="text-rose-500">*</span>
            </span>
            <input
              name="gioBatDau"
              type="time"
              required
              defaultValue="08:00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            <span>
              {vi ? "Giờ kết thúc" : "End Time"}{" "}
              <span className="text-rose-500">*</span>
            </span>
            <input
              name="gioKetThuc"
              type="time"
              required
              defaultValue="12:00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            <span>{vi ? "Số lượt tối đa / giờ" : "Max patients / hour"}</span>
            <input
              name="soLuotToiDaMoiGio"
              type="number"
              min={1}
              max={60}
              defaultValue={6}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-slate-700">
            <span>
              {vi ? "Thời lượng mỗi lượt (phút)" : "Slot duration (mins)"}
            </span>
            <input
              name="thoiLuongLuotPhut"
              type="number"
              min={5}
              max={120}
              defaultValue={10}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            />
          </label>
        </div>

        <fieldset className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <legend className="px-2 text-xs font-bold text-slate-700">
            {vi
              ? "Tùy chọn lặp lại ca theo tuần (không bắt buộc)"
              : "Weekly recurrence (optional)"}
          </legend>
          <div className="flex flex-wrap gap-3 py-1 text-xs">
            {[
              { day: 2, vi: "Thứ 2", en: "Mon" },
              { day: 3, vi: "Thứ 3", en: "Tue" },
              { day: 4, vi: "Thứ 4", en: "Wed" },
              { day: 5, vi: "Thứ 5", en: "Thu" },
              { day: 6, vi: "Thứ 6", en: "Fri" },
              { day: 7, vi: "Thứ 7", en: "Sat" },
              { day: 1, vi: "Chủ nhật", en: "Sun" },
            ].map(({ day, vi: viText, en: enText }) => (
              <label
                key={day}
                className="inline-flex items-center gap-1.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="repeatDay"
                  value={day}
                  className="rounded text-emerald-600"
                />
                <span>{vi ? viText : enText}</span>
              </label>
            ))}
          </div>

          <label className="mt-2.5 grid gap-1 text-xs font-semibold text-slate-700">
            <span>{vi ? "Lặp lại đến ngày" : "Repeat until"}</span>
            <input
              name="denNgay"
              type="date"
              min={minDate}
              max={maxDate}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:outline-none"
            />
          </label>
        </fieldset>

        <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {vi ? "Hủy" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{vi ? "Đang xếp ca..." : "Scheduling..."}</span>
              </>
            ) : (
              <span>{vi ? "Lưu ca làm việc" : "Save Shift"}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
