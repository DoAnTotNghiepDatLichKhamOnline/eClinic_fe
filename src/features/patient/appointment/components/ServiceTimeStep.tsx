import { useMemo } from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarX,
} from "lucide-react";
import type { Lang } from "@/types/i18n";
import type { AppointmentFormValues } from "../appointment.types";
import {
  getUpcomingBookingDays,
  getSpecialtyIcon,
  isSpecialtyPediatric,
  formatSlotRange,
} from "../appointment.utils";
import { useDanhSachChuyenKhoa, useDanhSachBacSi } from "@/hooks/useCatalog";
import { useCaKhamTheoNgay, useKhungGioGop } from "@/hooks/useBooking";

interface ServiceTimeStepProps {
  lang: Lang;
  formValues: AppointmentFormValues;
  onChange: (field: keyof AppointmentFormValues, value: any) => void;
  errors?: Partial<Record<keyof AppointmentFormValues, string>>;
}

export function ServiceTimeStep({
  lang,
  formValues,
  onChange,
  errors = {},
}: ServiceTimeStepProps) {
  const upcomingDays = useMemo(() => getUpcomingBookingDays(7), []);

  // 1. Fetch danh sách chuyên khoa từ API catalog-service
  const { danhSach: danhSachChuyenKhoa, isLoading: loadingChuyenKhoa } =
    useDanhSachChuyenKhoa({ kichThuoc: 50 });

  // 2. Fetch danh sách bác sĩ thuộc chuyên khoa đã chọn
  const idChuyenKhoaNum = formValues.specialtyId
    ? Number(formValues.specialtyId)
    : undefined;

  const { danhSach: danhSachBacSi, isLoading: loadingBacSi } = useDanhSachBacSi(
    idChuyenKhoaNum && !isNaN(idChuyenKhoaNum)
      ? { idChuyenKhoa: idChuyenKhoaNum, kichThuoc: 50 }
      : { kichThuoc: 50 },
  );

  // 3. Fetch khung giờ khám từ API booking-service
  const idBacSiNum = formValues.doctorId
    ? Number(formValues.doctorId)
    : undefined;

  // Khi chọn bác sĩ cụ thể -> Ca khám theo ngày
  const { danhSachCaKham, isLoading: loadingCaKham } = useCaKhamTheoNgay(
    formValues.date && idBacSiNum
      ? { ngay: formValues.date, idBacSi: idBacSiNum }
      : undefined,
  );

  // Khi chọn "Bác sĩ bất kỳ" -> Khung giờ gộp theo chuyên khoa
  const { danhSachKhungGio: danhSachKhungGioGop, isLoading: loadingKhungGioGop } =
    useKhungGioGop(
      formValues.date && idChuyenKhoaNum && !idBacSiNum
        ? { idChuyenKhoa: idChuyenKhoaNum, ngay: formValues.date }
        : undefined,
    );

  const loadingSlots = idBacSiNum ? loadingCaKham : loadingKhungGioGop;

  // Flattened slots list
  interface UnifiedSlot {
    key: string;
    idLichLamViec?: number;
    gioBatDau: string;
    gioKetThuc: string;
    timeLabel: string;
    soChoConLai: number;
    hetCho: boolean;
    isMorning: boolean;
    roomName?: string;
    tongSoCho: number;
  }

  const allSlots: UnifiedSlot[] = useMemo(() => {
    if (idBacSiNum) {
      const list: UnifiedSlot[] = [];
      danhSachCaKham.forEach((ca) => {
        ca.khungGio?.forEach((kg) => {
          const hour = kg.gioBatDau.includes("T")
            ? parseInt(kg.gioBatDau.split("T")[1].slice(0, 2), 10)
            : parseInt(kg.gioBatDau.slice(0, 2), 10);
          list.push({
            key: `${ca.idLichLamViec}-${kg.gioBatDau}`,
            idLichLamViec: ca.idLichLamViec,
            gioBatDau: kg.gioBatDau,
            gioKetThuc: kg.gioKetThuc,
            timeLabel: formatSlotRange(kg.gioBatDau, kg.gioKetThuc),
            soChoConLai: kg.soChoConLai,
            tongSoCho: kg.tongSoCho,
            hetCho: kg.hetCho || kg.soChoConLai <= 0,
            isMorning: isNaN(hour) ? true : hour < 12,
            roomName: ca.phongKham?.tenPhong,
          });
        });
      });
      return list;
    }

    // Trường hợp bác sĩ bất kỳ (khung giờ gộp)
    return danhSachKhungGioGop.map((kg) => {
      const hour = kg.gioBatDau.includes("T")
        ? parseInt(kg.gioBatDau.split("T")[1].slice(0, 2), 10)
        : parseInt(kg.gioBatDau.slice(0, 2), 10);
      return {
        key: `gop-${kg.gioBatDau}`,
        gioBatDau: kg.gioBatDau,
        gioKetThuc: kg.gioKetThuc,
        timeLabel: formatSlotRange(kg.gioBatDau, kg.gioKetThuc),
        soChoConLai: kg.soChoConLai,
        tongSoCho: kg.tongSoCho,
        hetCho: kg.hetCho || kg.soChoConLai <= 0,
        isMorning: isNaN(hour) ? true : hour < 12,
      };
    });
  }, [idBacSiNum, danhSachCaKham, danhSachKhungGioGop]);

  const morningSlots = useMemo(
    () => allSlots.filter((s) => s.isMorning),
    [allSlots],
  );

  const afternoonSlots = useMemo(
    () => allSlots.filter((s) => !s.isMorning),
    [allSlots],
  );

  const selectedSpecialty = danhSachChuyenKhoa.find(
    (s) => String(s.id) === formValues.specialtyId,
  );
  const isPediatric = isSpecialtyPediatric(selectedSpecialty?.tenChuyenKhoa);

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

        {loadingChuyenKhoa ? (
          <div className="flex items-center justify-center py-10 gap-2 text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#0f4d3a]" />
            <span>{lang === "vi" ? "Đang tải danh sách chuyên khoa..." : "Loading specialties..."}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {danhSachChuyenKhoa.map((spec) => {
              const Icon = getSpecialtyIcon(spec.tenChuyenKhoa);
              const isSelected = formValues.specialtyId === String(spec.id);
              const isChildSpec = isSpecialtyPediatric(spec.tenChuyenKhoa);

              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    onChange("specialtyId", String(spec.id));
                    // Reset doctor khi đổi chuyên khoa
                    onChange("doctorId", "");
                    onChange("slotId", "");
                    onChange("slotTime", "");
                    onChange("gioBatDauKhung", "");
                  }}
                  className={`relative flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[#0f4d3a] bg-emerald-50/60 ring-2 ring-[#0f4d3a]/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  {isChildSpec && (
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
                    {spec.tenChuyenKhoa}
                  </span>
                  {spec.moTa && (
                    <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {spec.moTa}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {isPediatric && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
            <span className="text-amber-600 font-bold mt-0.5">ℹ</span>
            <div>
              <strong>
                {lang === "vi" ? "Lưu ý Khoa Nhi:" : "Pediatric Note:"}
              </strong>{" "}
              {lang === "vi"
                ? "Theo quy định y tế, khám Khoa Nhi bắt buộc cung cấp thông tin Người giám hộ (Bố/Mẹ/Người giám hộ) đi cùng."
                : "Guardian information is required for pediatric consultations."}
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
                  ? "Chọn bác sĩ mong muốn, hoặc để phòng khám tự động xếp bác sĩ phù hợp"
                  : "Choose a preferred doctor or let the clinic assign for you"}
              </p>
            </div>
          </div>
        </div>

        {loadingBacSi ? (
          <div className="flex items-center justify-center py-8 gap-2 text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#0f4d3a]" />
            <span>{lang === "vi" ? "Đang tải danh sách bác sĩ..." : "Loading doctors..."}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Lựa chọn mặc định: Bác sĩ bất kỳ */}
            <button
              type="button"
              onClick={() => {
                onChange("doctorId", "");
                onChange("slotId", "");
                onChange("slotTime", "");
                onChange("gioBatDauKhung", "");
              }}
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
                    ? "Phòng khám tự động xếp bác sĩ còn nhiều chỗ nhất"
                    : "Clinic automatically assigns the best available doctor"}
                </p>
              </div>
            </button>

            {/* Danh sách bác sĩ từ API */}
            {danhSachBacSi.map((doc) => {
              const isSelected = formValues.doctorId === String(doc.id);

              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    onChange("doctorId", String(doc.id));
                    onChange("slotId", "");
                    onChange("slotTime", "");
                    onChange("gioBatDauKhung", "");
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#0f4d3a] bg-emerald-50/50 ring-2 ring-[#0f4d3a]/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                    {doc.anhDaiDien ? (
                      <img
                        src={doc.anhDaiDien}
                        alt={doc.hoTen}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-sm">
                        {doc.hoTen.split(" ").slice(-1)[0][0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {doc.hocVi ? `${doc.hocVi} ` : ""}
                      {doc.hoTen}
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold truncate mt-0.5">
                      {doc.chucVu || doc.tenChuyenKhoa}
                    </p>
                    {doc.soNamKinhNghiem ? (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {doc.soNamKinhNghiem}{" "}
                        {lang === "vi" ? "năm kinh nghiệm" : "years exp"}
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
                  ? "Chọn ngày khám để xem các ca làm việc còn mở"
                  : "Select an appointment date"}
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
                onClick={() => {
                  onChange("date", item.dateStr);
                  onChange("slotId", "");
                  onChange("slotTime", "");
                  onChange("gioBatDauKhung", "");
                }}
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
                  {lang === "vi" ? "Xem ca" : "View"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom date picker */}
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
            onChange={(e) => {
              onChange("date", e.target.value);
              onChange("slotId", "");
              onChange("slotTime", "");
              onChange("gioBatDauKhung", "");
            }}
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
                  ? "Khung giờ khám từ ca làm việc thực tế của phòng khám"
                  : "Available consultation time slots"}
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

        {loadingSlots ? (
          <div className="flex items-center justify-center py-10 gap-2 text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#0f4d3a]" />
            <span>{lang === "vi" ? "Đang tải khung giờ khám..." : "Loading time slots..."}</span>
          </div>
        ) : allSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <CalendarX className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {lang === "vi"
                ? "Chưa có khung giờ khám khả dụng trong ngày này"
                : "No available slots on this date"}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {lang === "vi"
                ? "Bác sĩ hoặc phòng khám chưa mở ca trực vào ngày đã chọn. Vui lòng chọn một ngày khác hoặc chọn bác sĩ khác."
                : "No active shifts found for the selected date. Please choose another date or doctor."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ca sáng */}
            {morningSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
                  <span>
                    ☀️ {lang === "vi" ? "Ca sáng" : "Morning Shift"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {morningSlots.map((slot) => {
                    const isSelected = formValues.slotId === slot.key;

                    if (slot.hetCho) {
                      return (
                        <div
                          key={slot.key}
                          className="py-2.5 px-2 rounded-xl border border-slate-100 bg-slate-100/70 text-slate-400 text-center cursor-not-allowed select-none"
                          title={lang === "vi" ? "Khung giờ này đã kín" : "Slot already booked"}
                        >
                          <span className="text-xs font-semibold line-through block">
                            {slot.timeLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lang === "vi" ? "Hết chỗ" : "Full"}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => {
                          onChange("slotId", slot.key);
                          onChange("slotTime", slot.timeLabel);
                          onChange("gioBatDauKhung", slot.gioBatDau);
                          if (slot.idLichLamViec) {
                            onChange("idLichLamViec", slot.idLichLamViec);
                          } else {
                            onChange("idLichLamViec", undefined);
                          }
                        }}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-[#0f4d3a] bg-emerald-700 text-white font-bold shadow-sm"
                            : "border-slate-200 bg-white hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-medium"
                        }`}
                      >
                        <span className="text-xs block">{slot.timeLabel}</span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? "text-emerald-100" : "text-emerald-600"
                          }`}
                        >
                          {lang === "vi"
                            ? `Còn ${slot.soChoConLai}/${slot.tongSoCho} chỗ`
                            : `${slot.soChoConLai}/${slot.tongSoCho} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ca chiều */}
            {afternoonSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
                  <span>
                    🌤️ {lang === "vi" ? "Ca chiều" : "Afternoon Shift"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isSelected = formValues.slotId === slot.key;

                    if (slot.hetCho) {
                      return (
                        <div
                          key={slot.key}
                          className="py-2.5 px-2 rounded-xl border border-slate-100 bg-slate-100/70 text-slate-400 text-center cursor-not-allowed select-none"
                          title={lang === "vi" ? "Khung giờ này đã kín" : "Slot already booked"}
                        >
                          <span className="text-xs font-semibold line-through block">
                            {slot.timeLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lang === "vi" ? "Hết chỗ" : "Full"}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => {
                          onChange("slotId", slot.key);
                          onChange("slotTime", slot.timeLabel);
                          onChange("gioBatDauKhung", slot.gioBatDau);
                          if (slot.idLichLamViec) {
                            onChange("idLichLamViec", slot.idLichLamViec);
                          } else {
                            onChange("idLichLamViec", undefined);
                          }
                        }}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-[#0f4d3a] bg-emerald-700 text-white font-bold shadow-sm"
                            : "border-slate-200 bg-white hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-medium"
                        }`}
                      >
                        <span className="text-xs block">{slot.timeLabel}</span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? "text-emerald-100" : "text-emerald-600"
                          }`}
                        >
                          {lang === "vi"
                            ? `Còn ${slot.soChoConLai}/${slot.tongSoCho} chỗ`
                            : `${slot.soChoConLai}/${slot.tongSoCho} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
