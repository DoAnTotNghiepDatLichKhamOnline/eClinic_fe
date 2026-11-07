import { useState, useEffect, type FormEvent } from "react";
import {
  PhoneCall,
  User,
  Calendar,
  Clock,
  Printer,
  QrCode,
  ExternalLink,
  Check,
  Loader2,
  Building2,
  AlertCircle,
  Copy,
  PlusCircle,
  Stethoscope,
} from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { useLanguage } from "@/shared/context/LanguageContext";
import { adminBookingService } from "@/services/booking";
import { notifyAuth } from "@/utils/authNotification";
import {
  validateFullName,
  validatePhoneNumber,
  validateCCCD,
} from "@/utils/formValidators";
import type {
  CaLamViecResponse,
  DatLichThayRequest,
  LichHenCuaToiResponse,
} from "@/types/booking.type";

export interface AdminBookOnBehalfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialShift?: CaLamViecResponse | null;
}

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AdminBookOnBehalfModal({
  isOpen,
  onClose,
  onSuccess,
  initialShift,
}: AdminBookOnBehalfModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";

  const todayStr = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(
    initialShift?.ngay || todayStr,
  );
  const [shifts, setShifts] = useState<CaLamViecResponse[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(
    initialShift?.id || null,
  );

  // Form patient fields
  const [hoTen, setHoTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [soCccd, setSoCccd] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [gioiTinh, setGioiTinh] = useState<"NAM" | "NU">("NAM");
  const [diaChi, setDiaChi] = useState("");
  const [lyDoKham, setLyDoKham] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  // Validation & state
  const [errors, setErrors] = useState<{
    shift?: string;
    hoTen?: string;
    soDienThoai?: string;
    soCccd?: string;
    ngaySinh?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] =
    useState<LichHenCuaToiResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // When initialShift changes
  useEffect(() => {
    if (initialShift) {
      setSelectedShiftId(initialShift.id);
      setSelectedDate(initialShift.ngay);
    }
  }, [initialShift]);

  // Fetch shifts for selected date if not locked to initialShift
  useEffect(() => {
    if (!isOpen || initialShift) return;
    let isMounted = true;
    const fetchShifts = async () => {
      setIsLoadingShifts(true);
      try {
        const res = await adminBookingService.getLichLamViecQuanTri({
          tuNgay: selectedDate,
          denNgay: selectedDate,
        });
        if (isMounted && res.thanhCong && res.duLieu) {
          setShifts(res.duLieu);
          if (res.duLieu.length > 0 && !selectedShiftId) {
            setSelectedShiftId(res.duLieu[0].id);
          }
        }
      } catch {
        if (isMounted) setShifts([]);
      } finally {
        if (isMounted) setIsLoadingShifts(false);
      }
    };
    fetchShifts();
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedDate, initialShift]);

  const activeShift =
    initialShift || shifts.find((s) => s.id === selectedShiftId) || null;

  const resetForm = () => {
    setHoTen("");
    setSoDienThoai("");
    setSoCccd("");
    setNgaySinh("");
    setGioiTinh("NAM");
    setDiaChi("");
    setLyDoKham("");
    setGhiChu("");
    setErrors({});
    setApiError(null);
    setCreatedAppointment(null);
    if (!initialShift) {
      setSelectedShiftId(null);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const shiftIdToUse = initialShift ? initialShift.id : selectedShiftId;
    const nameErr = validateFullName(hoTen, lang);
    const phoneErr = validatePhoneNumber(soDienThoai, lang);
    const cccdErr = validateCCCD(soCccd, lang, true);
    const dobErr = !ngaySinh
      ? vi
        ? "Ngày sinh không được để trống."
        : "Date of birth is required."
      : null;
    const shiftErr = !shiftIdToUse
      ? vi
        ? "Vui lòng chọn một ca khám."
        : "Please select a shift."
      : undefined;

    const newErrors = {
      shift: shiftErr,
      hoTen: nameErr || undefined,
      soDienThoai: phoneErr || undefined,
      soCccd: cccdErr || undefined,
      ngaySinh: dobErr || undefined,
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const payload: DatLichThayRequest = {
      idCa: shiftIdToUse!,
      hoTen: hoTen.trim(),
      soDienThoai: soDienThoai.trim(),
      soCccd: soCccd.trim() || undefined,
      ngaySinh: ngaySinh.trim(),
      gioiTinh,
      diaChi: diaChi.trim() || undefined,
      lyDoKham: lyDoKham.trim() || undefined,
      ghiChu: ghiChu.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const response = await adminBookingService.datLichThayQuanTri(payload);
      if (response.thanhCong && response.duLieu) {
        setCreatedAppointment(response.duLieu);
        notifyAuth(
          "success",
          vi ? "Đặt lịch thành công" : "Booking Successful",
          vi
            ? `Đã tiếp nhận bệnh nhân ${hoTen} vào ca khám #${payload.idCa}`
            : `Patient ${hoTen} successfully booked into shift #${payload.idCa}`,
        );
        onSuccess?.();
      } else {
        throw new Error(response.thongDiep || "Đặt lịch thay không thành công");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.thongDiep ||
        err?.response?.data?.maLoi ||
        err?.message ||
        (vi
          ? "Không thể đặt lịch. Vui lòng kiểm tra lại thông tin ca khám."
          : "Unable to book appointment. Please check shift details.");
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrImageUrl = createdAppointment?.maPhieuKham
    ? `/api/booking/phieu-kham/${createdAppointment.maPhieuKham}/qr`
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <PhoneCall className="w-5 h-5 text-teal-600" />
          <span>
            {vi
              ? "Tiếp nhận & Đặt lịch tại quầy / Hotline"
              : "Reception & Booking on Behalf (Counter / Hotline)"}
          </span>
        </div>
      }
    >
      {!createdAppointment ? (
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Section 1: Chọn Ca khám */}
          <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                {vi ? "1. Thông tin Ca khám" : "1. Shift Selection"}
              </span>
              {initialShift && (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                  {vi ? "Đã ghim ca chọn trước" : "Pre-selected Shift"}
                </span>
              )}
            </div>

            {initialShift ? (
              <div className="rounded-lg bg-white p-3 border border-teal-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {initialShift.bacSi?.hoTen || initialShift.hoTenBacSi || "—"}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    {initialShift.ngay}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-600" />
                    {initialShift.gioBatDau?.slice(0, 5)} -{" "}
                    {initialShift.gioKetThuc?.slice(0, 5)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-teal-600" />
                    {initialShift.phongKham?.tenPhong ||
                      initialShift.tenPhongKham ||
                      "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {vi ? "Ngày khám" : "Date"}
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={todayStr}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {vi ? "Chọn Ca khám" : "Select Shift"}
                  </label>
                  {isLoadingShifts ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      <Loader2 className="w-4 h-4 animate-spin inline-block mr-1" />
                      {vi ? "Đang tải ca khám..." : "Loading shifts..."}
                    </div>
                  ) : shifts.length === 0 ? (
                    <p className="p-3 bg-white rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      {vi
                        ? "Không có ca khám nào còn mở trong ngày đã chọn."
                        : "No available shifts for selected date."}
                    </p>
                  ) : (
                    <select
                      value={selectedShiftId || ""}
                      onChange={(e) => setSelectedShiftId(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">
                        {vi ? "-- Chọn ca khám --" : "-- Select a shift --"}
                      </option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.gioBatDau?.slice(0, 5)} - {s.gioKetThuc?.slice(0, 5)}{" "}
                          · {s.bacSi?.hoTen || s.hoTenBacSi} ·{" "}
                          {s.phongKham?.tenPhong || s.tenPhongKham} (
                          {vi ? "Còn: " : "Slots: "}
                          {s.soChoConLai ?? s.soLuotConTrong ?? "—"})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.shift && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">
                      {errors.shift}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Thông tin Bệnh nhân */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              {vi ? "2. Thông tin Bệnh nhân" : "2. Patient Information"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {vi ? "Họ và tên bệnh nhân" : "Full Name"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  placeholder={vi ? "Nguyễn Văn A" : "John Doe"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                />
                {errors.hoTen && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.hoTen}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {vi ? "Số điện thoại liên hệ" : "Phone Number"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  placeholder="0912345678"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                />
                {errors.soDienThoai && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.soDienThoai}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {vi ? "Ngày sinh" : "Date of Birth"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  max={todayStr}
                  value={ngaySinh}
                  onChange={(e) => setNgaySinh(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                />
                {errors.ngaySinh && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.ngaySinh}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {vi ? "Giới tính" : "Gender"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-1.5">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gioiTinh"
                      value="NAM"
                      checked={gioiTinh === "NAM"}
                      onChange={() => setGioiTinh("NAM")}
                      className="text-teal-600"
                    />
                    <span>{vi ? "Nam" : "Male"}</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gioiTinh"
                      value="NU"
                      checked={gioiTinh === "NU"}
                      onChange={() => setGioiTinh("NU")}
                      className="text-teal-600"
                    />
                    <span>{vi ? "Nữ" : "Female"}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {vi ? "Số CCCD (12 chữ số)" : "National ID (CCCD)"}
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={soCccd}
                  onChange={(e) => setSoCccd(e.target.value)}
                  placeholder="001200000001"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                />
                {errors.soCccd && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">
                    {errors.soCccd}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {vi ? "Địa chỉ cư trú" : "Address"}
                </label>
                <input
                  type="text"
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                  placeholder={vi ? "Hà Nội, Việt Nam" : "Address..."}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {vi ? "Lý do khám / Triệu chứng" : "Reason for Visit"}
              </label>
              <textarea
                rows={2}
                value={lyDoKham}
                onChange={(e) => setLyDoKham(e.target.value)}
                placeholder={vi ? "Đau đầu, sốt nhẹ..." : "Symptoms..."}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {vi
                  ? "Ghi chú tiếp nhận tại quầy / Hotline"
                  : "Front Desk / Hotline Notes"}
              </label>
              <input
                type="text"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder={
                  vi
                    ? "Bệnh nhân đăng ký tại quầy tiếp đón / Hotline 1900..."
                    : "Registered at front desk / Hotline..."
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {vi ? "Hủy" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg shadow-sm transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{vi ? "Đang tiếp nhận..." : "Processing..."}</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{vi ? "Xác nhận đặt lịch thay" : "Confirm Booking"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Result view: Counter ticket receipt */
        <div className="space-y-4 pt-1">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  {vi
                    ? "Tiếp nhận & Đặt lịch khám thành công!"
                    : "Appointment Booked Successfully!"}
                </h4>
                <p className="text-xs text-emerald-700">
                  {vi
                    ? "Kênh tiếp nhận: HOTLINE / QUẦY TIẾP ĐÓN"
                    : "Channel: HOTLINE / FRONT DESK"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-200/80 px-3 py-1 text-xs font-extrabold text-emerald-950">
              STT #{createdAppointment.soThuTu}
            </span>
          </div>

          {/* Ticket Information card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400 block text-[11px]">
                  {vi ? "Bệnh nhân" : "Patient"}
                </span>
                <strong className="text-slate-800 text-sm">
                  {createdAppointment.hoTenBenhNhan || hoTen}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  {vi ? "Bác sĩ phụ trách" : "Doctor"}
                </span>
                <strong className="text-slate-800">
                  {createdAppointment.bacSi?.hoTen ||
                    activeShift?.bacSi?.hoTen ||
                    "—"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  {vi ? "Phòng khám" : "Clinic Room"}
                </span>
                <strong className="text-slate-800">
                  {createdAppointment.phongKham?.tenPhong ||
                    activeShift?.phongKham?.tenPhong ||
                    "—"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">
                  {vi ? "Giờ khám dự kiến" : "Expected Time"}
                </span>
                <strong className="text-teal-700">
                  {createdAppointment.gioKhamDuKien?.slice(0, 5) || "—"}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {vi ? "Mã tra cứu ngắn" : "Lookup Code"}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {createdAppointment.maTraCuu}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(createdAppointment.maTraCuu, "maTraCuu")
                    }
                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition"
                  >
                    {copiedKey === "maTraCuu" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {vi ? "Mã phiếu khám" : "Ticket Code"}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm truncate max-w-[170px]">
                    {createdAppointment.maPhieuKham}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        createdAppointment.maPhieuKham,
                        "maPhieuKham",
                      )
                    }
                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition"
                  >
                    {copiedKey === "maPhieuKham" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code and Print Section */}
            {qrImageUrl && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-18 h-18 border border-slate-200 rounded-lg p-1 bg-white shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-teal-600" />
                      {vi ? "Mã QR Phiếu khám" : "Ticket QR Code"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {vi
                        ? "Bệnh nhân có thể quét trực tiếp tại màn hình hoặc giữ phiếu in."
                        : "Patient can scan directly on counter screen."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-slate-700 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>{vi ? "In phiếu tiếp đón" : "Print Ticket"}</span>
                  </button>
                  {createdAppointment.linkPhieuKham && (
                    <a
                      href={createdAppointment.linkPhieuKham}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{vi ? "Mở phiếu" : "Open"}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg transition"
            >
              {vi ? "Tiếp nhận bệnh nhân khác" : "Book Another Patient"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
            >
              {vi ? "Đóng" : "Close"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
