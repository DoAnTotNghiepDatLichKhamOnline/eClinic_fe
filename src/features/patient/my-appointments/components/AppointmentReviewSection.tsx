import { useState, useEffect, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  Star,
  X,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useBookingActions } from "@/hooks/useBooking";
import type { DanhGiaCuaToiResponse } from "@/types/booking.type";
import type { TrangThaiLichHen } from "@/types/common.type";
import { formatDateTimeWithWeekday } from "@/utils/dateFormatting";

interface AppointmentReviewSectionProps {
  maPhieuKham: string;
  trangThai: TrangThaiLichHen;
  duocDanhGia: boolean;
  danhGia: DanhGiaCuaToiResponse | null;
  tenBacSi?: string;
  onSuccess?: () => void;
}

const STAR_LABELS: Record<number, { vi: string; en: string }> = {
  1: { vi: "Rất không hài lòng", en: "Very Dissatisfied" },
  2: { vi: "Không hài lòng", en: "Dissatisfied" },
  3: { vi: "Bình thường", en: "Average" },
  4: { vi: "Hài lòng", en: "Satisfied" },
  5: { vi: "Rất hài lòng", en: "Very Satisfied" },
};

export function AppointmentReviewSection({
  maPhieuKham,
  trangThai,
  duocDanhGia,
  danhGia,
  tenBacSi,
  onSuccess,
}: AppointmentReviewSectionProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const { danhGia: submitReview, isSubmittingReview, suaDanhGia: updateReview, isUpdatingReview } =
    useBookingActions();

  const [stars, setStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (danhGia) {
      setStars(danhGia.soSao);
      setComment(danhGia.nhanXet ?? "");
    } else {
      setStars(5);
      setComment("");
    }
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(false);
  }, [danhGia, maPhieuKham]);

  // Đánh giá chỉ áp dụng khi lượt khám đã hoàn thành
  if (trangThai !== "DA_HOAN_THANH") {
    return null;
  }

  // Trường hợp 1: Đã đánh giá trước đó (danhGia !== null)
  if (danhGia && !isEditing) {
    const editUntilDate = new Date(danhGia.duocSuaDen);
    const canEdit = !isNaN(editUntilDate.getTime()) && Date.now() <= editUntilDate.getTime();

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {vi ? "Đánh giá của bạn về lượt khám" : "Your Consultation Review"}
              </h4>
              {tenBacSi && (
                <p className="text-xs text-slate-500">
                  {vi ? `Bác sĩ phụ trách: ${tenBacSi}` : `Attending Doctor: ${tenBacSi}`}
                </p>
              )}
            </div>
          </div>

          {canEdit ? (
            <button
              type="button"
              onClick={() => {
                setStars(danhGia.soSao);
                setComment(danhGia.nhanXet ?? "");
                setIsEditing(true);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Edit3 size={13} />
              {vi ? "Chỉnh sửa đánh giá" : "Edit review"}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              <Lock size={12} />
              {vi ? "Đã khóa (quá 7 ngày)" : "Locked (over 7 days)"}
            </span>
          )}
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Star rating display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((index) => (
                <Star
                  key={index}
                  size={18}
                  className={
                    index <= danhGia.soSao
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-300"
                  }
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800">
              {STAR_LABELS[danhGia.soSao]?.[lang] || `${danhGia.soSao}/5`}
            </span>
          </div>

          {/* Comment */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-700 leading-relaxed">
            {danhGia.nhanXet ? (
              <p className="whitespace-pre-line">{danhGia.nhanXet}</p>
            ) : (
              <p className="italic text-slate-400">
                {vi ? "Không có nhận xét chi tiết." : "No written feedback provided."}
              </p>
            )}
          </div>

          {/* Timestamps & Edit Deadline Notice */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
            <span>
              {vi ? "Đã gửi vào: " : "Submitted on: "}
              <b className="text-slate-700">
                {danhGia.ngayTao ? formatDateTimeWithWeekday(danhGia.ngayTao, lang) : "—"}
              </b>
            </span>

            {canEdit && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <Clock size={12} />
                {vi
                  ? `Được phép sửa đến: ${formatDateTimeWithWeekday(danhGia.duocSuaDen, lang)}`
                  : `Editable until: ${formatDateTimeWithWeekday(danhGia.duocSuaDen, lang)}`}
              </span>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Trường hợp 2: Đang chỉnh sửa đánh giá (PUT)
  if (danhGia && isEditing) {
    const activeStars = hoverStars ?? stars;

    const handleUpdateSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");

      try {
        await updateReview({
          maPhieuKham,
          data: {
            soSao: stars,
            nhanXet: comment.trim() || undefined,
          },
        });
        setIsEditing(false);
        setSuccessMessage(
          vi ? "Đã cập nhật đánh giá thành công!" : "Review updated successfully!"
        );
        onSuccess?.();
      } catch (err: unknown) {
        setErrorMessage(
          (err as { response?: { data?: { thongDiep?: string } } }).response?.data?.thongDiep ??
            (err instanceof Error
              ? err.message
              : vi
                ? "Không thể cập nhật đánh giá. Vui lòng thử lại sau."
                : "Could not update review. Please try again.")
        );
      }
    };

    return (
      <form
        onSubmit={handleUpdateSubmit}
        className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-emerald-700" />
            <h4 className="text-sm font-bold text-slate-900">
              {vi ? "Chỉnh sửa đánh giá lượt khám" : "Edit Consultation Review"}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label={vi ? "Hủy chỉnh sửa" : "Cancel edit"}
          >
            <X size={16} />
          </button>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 flex items-center gap-2">
          <Clock size={14} className="shrink-0 text-emerald-700" />
          <span>
            {vi
              ? `Chính sách eClinic: Bệnh nhân có thể điều chỉnh đánh giá trong vòng 7 ngày kể từ lúc gửi (đến ${formatDateTimeWithWeekday(danhGia.duocSuaDen, lang)}).`
              : `eClinic Policy: You can update your review within 7 days of posting (until ${formatDateTimeWithWeekday(danhGia.duocSuaDen, lang)}).`}
          </span>
        </div>

        {errorMessage && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Interactive Star Rating */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            {vi ? "Chất lượng phục vụ & Mức độ hài lòng:" : "Service Quality & Satisfaction:"}{" "}
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label={vi ? "Chọn số sao" : "Select rating"}>
              {[1, 2, 3, 4, 5].map((index) => (
                <button
                  type="button"
                  key={index}
                  role="radio"
                  aria-checked={stars === index}
                  aria-label={`${index} ${vi ? "sao" : "stars"}`}
                  onMouseEnter={() => setHoverStars(index)}
                  onMouseLeave={() => setHoverStars(null)}
                  onClick={() => setStars(index)}
                  className="rounded-md p-1 transition hover:scale-110 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Star
                    size={24}
                    className={
                      index <= activeStars
                        ? "fill-amber-400 text-amber-400 transition-colors"
                        : "fill-slate-100 text-slate-300 transition-colors"
                    }
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-700">
              {STAR_LABELS[activeStars]?.[lang]}
            </span>
          </div>
        </div>

        {/* Comment field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="review-update-comment" className="font-bold text-slate-700">
              {vi ? "Nhận xét của bạn (không bắt buộc):" : "Your Feedback (optional):"}
            </label>
            <span className="text-[11px] text-slate-500">{comment.length}/1000</span>
          </div>
          <textarea
            id="review-update-comment"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              vi
                ? "Chia sẻ cảm nhận về thái độ tư vấn của bác sĩ, sự chu đáo, cơ sở vật chất..."
                : "Share your experience about doctor consultation, care, facilities..."
            }
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            disabled={isUpdatingReview}
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {vi ? "Hủy" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isUpdatingReview}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-900 disabled:opacity-50"
          >
            {isUpdatingReview && <Loader2 size={14} className="animate-spin" />}
            {vi ? "Cập nhật đánh giá" : "Update Review"}
          </button>
        </div>
      </form>
    );
  }

  // Trường hợp 3: Chưa đánh giá và có quyền gửi (duocDanhGia === true)
  if (duocDanhGia) {
    const activeStars = hoverStars ?? stars;

    const handleCreateSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");

      try {
        await submitReview({
          maPhieuKham,
          data: {
            soSao: stars,
            nhanXet: comment.trim() || undefined,
          },
        });
        setSuccessMessage(
          vi ? "Đã gửi đánh giá thành công! Cảm ơn bạn đã phản hồi." : "Review submitted successfully! Thank you."
        );
        onSuccess?.();
      } catch (err: unknown) {
        setErrorMessage(
          (err as { response?: { data?: { thongDiep?: string } } }).response?.data?.thongDiep ??
            (err instanceof Error
              ? err.message
              : vi
                ? "Không thể gửi đánh giá. Vui lòng thử lại sau."
                : "Could not submit review. Please try again.")
        );
      }
    };

    return (
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50/50 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <MessageSquare size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {vi ? "Đánh giá chất lượng lượt khám" : "Rate Your Consultation Experience"}
            </h4>
            <p className="text-xs text-slate-500">
              {vi
                ? "Ý kiến của bạn là động lực giúp Bác sĩ và phòng khám nâng cao chất lượng dịch vụ."
                : "Your feedback helps our doctors and clinic continuously improve care."}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Interactive Star Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {vi ? "Mức độ hài lòng chung:" : "Overall Satisfaction:"}{" "}
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label={vi ? "Chọn số sao" : "Select rating"}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <button
                    type="button"
                    key={index}
                    role="radio"
                    aria-checked={stars === index}
                    aria-label={`${index} ${vi ? "sao" : "stars"}`}
                    onMouseEnter={() => setHoverStars(index)}
                    onMouseLeave={() => setHoverStars(null)}
                    onClick={() => setStars(index)}
                    className="rounded-md p-1 transition hover:scale-110 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <Star
                      size={26}
                      className={
                        index <= activeStars
                          ? "fill-amber-400 text-amber-400 transition-colors"
                          : "fill-slate-100 text-slate-300 transition-colors"
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-700">
                {STAR_LABELS[activeStars]?.[lang]}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="review-create-comment" className="font-bold text-slate-700">
                {vi ? "Lời nhắn / Nhận xét chi tiết (tùy chọn):" : "Detailed Feedback / Notes (optional):"}
              </label>
              <span className="text-[11px] text-slate-500">{comment.length}/1000</span>
            </div>
            <textarea
              id="review-create-comment"
              rows={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                vi
                  ? "Bác sĩ tư vấn có nhiệt tình không? Bạn có đề xuất cải thiện gì không?..."
                  : "Was the doctor attentive? Do you have any suggestions to improve?..."
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Info size={12} />
              {vi
                ? "Bạn có thể chỉnh sửa lại đánh giá trong vòng 7 ngày sau khi gửi."
                : "You can update this review within 7 days after submission."}
            </p>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-900 disabled:opacity-50"
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{vi ? "Đang gửi..." : "Submitting..."}</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{vi ? "Gửi đánh giá" : "Submit Review"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // Trường hợp 4: Đã hoàn thành nhưng không có quyền đánh giá (!duocDanhGia && !danhGia)
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
      <Info size={16} className="shrink-0 text-slate-400 mt-0.5" />
      <div>
        <p className="font-semibold text-slate-700">
          {vi ? "Quyền hạn đánh giá lượt khám:" : "Review Permission Notice:"}
        </p>
        <p className="mt-0.5 text-slate-500">
          {vi
            ? "Theo quy định của eClinic, chỉ người bệnh trực tiếp khám hoặc tài khoản người trực tiếp đặt lịch đó mới có quyền gửi nhận xét đánh giá cho Bác sĩ."
            : "Under eClinic policy, only the patient who attended the consultation or the account that placed the booking can submit a review."}
        </p>
      </div>
    </div>
  );
}

