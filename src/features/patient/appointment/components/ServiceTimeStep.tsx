import { useMemo } from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Lang } from "@/types/i18n";
import type { AppointmentFormValues } from "../appointment.types";
import {
  APPOINTMENT_SPECIALTIES,
  APPOINTMENT_DOCTORS,
  TIME_SLOTS,
  getUpcomingBookingDays,
} from "../appointment.data";

interface ServiceTimeStepProps {
  lang: Lang;
  formValues: AppointmentFormValues;
  onChange: (field: keyof AppointmentFormValues, value: string) => void;
  errors?: Partial<Record<keyof AppointmentFormValues, string>>;
}

export function ServiceTimeStep({
  lang,
  formValues,
  onChange,
  errors = {},
}: ServiceTimeStepProps) {
  const upcomingDays = useMemo(() => getUpcomingBookingDays(7), []);

  // Filter doctors according to selected specialty
  const availableDoctors = useMemo(() => {
    if (!formValues.specialtyId) {
      return APPOINTMENT_DOCTORS;
    }
    return APPOINTMENT_DOCTORS.filter(
      (doc) => doc.specialtyId === formValues.specialtyId,
    );
  }, [formValues.specialtyId]);

  const morningSlots = useMemo(
    () => TIME_SLOTS.filter((s) => s.period === "morning"),
    [],
  );

  const afternoonSlots = useMemo(
    () => TIME_SLOTS.filter((s) => s.period === "afternoon"),
    [],
  );

  const selectedSpecialty = APPOINTMENT_SPECIALTIES.find(
    (s) => s.id === formValues.specialtyId,
  );

  return (
    <div className="space-y-8">
      {/* 1. CHUYÊN KHOA (BẮT BUỘC) */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-[#0f4d3a] font-bold text-sm">
              1
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {lang === "vi" ? "Chuyên khoa khám" : "Medical Specialty"}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "vi"
                  ? "Chọn chuyên khoa bạn hoặc người thân cần thăm khám"
                  : "Select the specialty needed for consultation"}
              </p>
            </div>
          </div>

          {formValues.specialtyId && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <CheckCircle2 size={13} />
              {lang === "vi" ? "Đã chọn" : "Selected"}
            </span>
          )}
        </div>

        {errors.specialtyId && (
          <p className="text-xs text-rose-600 font-medium mb-3 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.specialtyId}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {APPOINTMENT_SPECIALTIES.map((spec) => {
            const Icon = spec.icon;
            const isSelected = formValues.specialtyId === spec.id;

            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => {
                  onChange("specialtyId", spec.id);
                  // Reset doctor if not in new specialty
                  if (formValues.doctorId) {
                    const docValid = APPOINTMENT_DOCTORS.some(
                      (d) =>
                        d.id === formValues.doctorId &&
                        d.specialtyId === spec.id,
                    );
                    if (!docValid) onChange("doctorId", "");
                  }
                }}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "border-[#0f4d3a] bg-emerald-50/60 ring-2 ring-[#0f4d3a]/20 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                {spec.isPediatric && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    {lang === "vi" ? "Trẻ em" : "Kids"}
                  </span>
                )}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                    isSelected
                      ? "bg-[#0f4d3a] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {spec.name[lang]}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {spec.description[lang]}
                </span>
              </button>
            );
          })}
        </div>

        {selectedSpecialty?.isPediatric && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
            <span className="text-amber-600 font-bold mt-0.5">ℹ</span>
            <div>
              <strong>
                {lang === "vi" ? "Lưu ý Khoa Nhi:" : "Pediatric Note:"}
              </strong>{" "}
              {lang === "vi"
                ? "Hệ thống sẽ yêu cầu cung cấp thêm thông tin Người giám hộ (Bố/Mẹ/Người giám hộ) ở bước thông tin cá nhân."
                : "Guardian information will be required in the personal details step."}
            </div>
          </div>
        )}
      </section>

      {/* 2. BÁC SĨ (TÙY CHỌN) */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
              2
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{lang === "vi" ? "Bác sĩ phụ trách" : "Doctor"}</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {lang === "vi" ? "Tùy chọn" : "Optional"}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "vi"
                  ? "Chọn bác sĩ mong muốn thuộc chuyên khoa đã chọn, hoặc để phòng khám tự sắp xếp"
                  : "Choose a preferred doctor or let the clinic assign for you"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Default option: Any doctor */}
          <button
            type="button"
            onClick={() => onChange("doctorId", "")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
              !formValues.doctorId
                ? "border-[#0f4d3a] bg-emerald-50/50 ring-2 ring-[#0f4d3a]/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                !formValues.doctorId
                  ? "bg-[#0f4d3a] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {lang === "vi" ? "Bác sĩ bất kỳ" : "Any Available Doctor"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === "vi"
                  ? "Hệ thống tự động sắp xếp bác sĩ phù hợp nhất trong ca"
                  : "Clinic automatically assigns the best available doctor"}
              </p>
            </div>
          </button>

          {/* Specific doctors */}
          {availableDoctors.map((doc) => {
            const isSelected = formValues.doctorId === doc.id;

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onChange("doctorId", doc.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#0f4d3a] bg-emerald-50/50 ring-2 ring-[#0f4d3a]/20 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                  {doc.image ? (
                    <img
                      src={doc.image}
                      alt={doc.name[lang]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-sm">
                      {doc.name.vi.split(" ").slice(-1)[0][0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {doc.name[lang]}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold truncate mt-0.5">
                    {doc.title[lang]}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {doc.experience[lang]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. NGÀY KHÁM (BẮT BUỘC) */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-[#0f4d3a] font-bold text-sm">
              3
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{lang === "vi" ? "Ngày khám" : "Appointment Date"}</span>
                <span className="text-rose-500 font-bold">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "vi"
                  ? "Chọn ngày khám theo lịch làm việc còn mở của phòng khám/bác sĩ"
                  : "Select an available working day"}
              </p>
            </div>
          </div>

          {formValues.date && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {formValues.date}
            </span>
          )}
        </div>

        {errors.date && (
          <p className="text-xs text-rose-600 font-medium mb-3 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.date}
          </p>
        )}

        {/* Quick select pills */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-4">
          {upcomingDays.map((item) => {
            const isSelected = formValues.date === item.dateStr;

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => onChange("date", item.dateStr)}
                className={`flex flex-col items-center py-2.5 px-1.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "border-[#0f4d3a] bg-[#0f4d3a] text-white shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                }`}
              >
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
                  {lang === "vi" ? item.dayNameVi : item.dayNameEn}
                </span>
                <span className="text-base font-extrabold mt-0.5">
                  {item.displayDate}
                </span>
                <span
                  className={`text-[10px] mt-1 px-1.5 py-0.2 rounded font-medium ${
                    isSelected
                      ? "bg-emerald-800 text-emerald-100"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {lang === "vi" ? "Còn lịch" : "Open"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Or pick custom date */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <label
            htmlFor="custom-appointment-date"
            className="text-xs font-bold text-slate-600 flex items-center gap-1.5"
          >
            <Calendar size={14} />
            {lang === "vi" ? "Hoặc chọn ngày khác:" : "Or choose another date:"}
          </label>
          <input
            id="custom-appointment-date"
            type="date"
            value={formValues.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange("date", e.target.value)}
            className="text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 focus:bg-white focus:border-[#0f4d3a] outline-none"
          />
        </div>
      </section>

      {/* 4. KHUNG GIỜ KHÁM (SLOT) (BẮT BUỘC) */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-[#0f4d3a] font-bold text-sm">
              4
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {lang === "vi" ? "Khung giờ khám (Slot)" : "Time Slot"}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "vi"
                  ? "Chọn khung giờ khám còn trống trong ca trực"
                  : "Select an available time slot in the shift"}
              </p>
            </div>
          </div>

          {formValues.slotTime && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
              <Clock size={12} />
              {formValues.slotTime}
            </span>
          )}
        </div>

        {errors.slotId && (
          <p className="text-xs text-rose-600 font-medium mb-3 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.slotId}
          </p>
        )}

        {/* Morning Shift */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
            <span>
              ☀️{" "}
              {lang === "vi"
                ? "Ca sáng (08:00 - 11:30)"
                : "Morning Shift (08:00 - 11:30)"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {morningSlots.map((slot) => {
              const isSelected = formValues.slotId === slot.id;

              if (!slot.available) {
                return (
                  <div
                    key={slot.id}
                    className="py-2.5 px-2 rounded-xl border border-slate-100 bg-slate-100/70 text-slate-400 text-center cursor-not-allowed select-none"
                    title={
                      lang === "vi"
                        ? "Khung giờ này đã kín"
                        : "Slot already booked"
                    }
                  >
                    <span className="text-xs font-semibold line-through block">
                      {slot.time}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {lang === "vi" ? "Đã kín" : "Booked"}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    onChange("slotId", slot.id);
                    onChange("slotTime", slot.time);
                  }}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-[#0f4d3a] bg-emerald-700 text-white font-bold shadow-sm"
                      : "border-slate-200 bg-white hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-medium"
                  }`}
                >
                  <span className="text-xs block">{slot.time}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-emerald-100" : "text-emerald-600"
                    }`}
                  >
                    {lang === "vi" ? "Còn trống" : "Available"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon Shift */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
            <span>
              🌤️{" "}
              {lang === "vi"
                ? "Ca chiều (13:30 - 17:00)"
                : "Afternoon Shift (13:30 - 17:00)"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {afternoonSlots.map((slot) => {
              const isSelected = formValues.slotId === slot.id;

              if (!slot.available) {
                return (
                  <div
                    key={slot.id}
                    className="py-2.5 px-2 rounded-xl border border-slate-100 bg-slate-100/70 text-slate-400 text-center cursor-not-allowed select-none"
                    title={
                      lang === "vi"
                        ? "Khung giờ này đã kín"
                        : "Slot already booked"
                    }
                  >
                    <span className="text-xs font-semibold line-through block">
                      {slot.time}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {lang === "vi" ? "Đã kín" : "Booked"}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    onChange("slotId", slot.id);
                    onChange("slotTime", slot.time);
                  }}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-[#0f4d3a] bg-emerald-700 text-white font-bold shadow-sm"
                      : "border-slate-200 bg-white hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-medium"
                  }`}
                >
                  <span className="text-xs block">{slot.time}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-emerald-100" : "text-emerald-600"
                    }`}
                  >
                    {lang === "vi" ? "Còn trống" : "Available"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
