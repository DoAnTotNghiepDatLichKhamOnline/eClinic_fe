import { useState, useEffect, type FormEvent } from "react";
import {
  User,
  ShieldAlert,
  Save,
  CheckCircle2,
  FileBadge,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import type {
  HoSoKhamResponse,
  SuaHoSoBenhNhanEMRRequest,
} from "@/types/consultation.type";
import type { GioiTinh } from "@/types/common.type";

interface PatientIdentityCardProps {
  hoSoKham: HoSoKhamResponse;
  onUpdatePatient: (data: SuaHoSoBenhNhanEMRRequest) => Promise<unknown>;
  onMarkVerified: () => Promise<unknown>;
  isUpdating?: boolean;
  isMarkingVerified?: boolean;
}

export function PatientIdentityCard({
  hoSoKham,
  onUpdatePatient,
  onMarkVerified,
  isUpdating = false,
  isMarkingVerified = false,
}: PatientIdentityCardProps) {
  const { lang } = useLanguage();
  const { lichHen, hoSoBenhNhan } = hoSoKham;
  const doiChieu = lichHen.doiChieu;

  // Form state
  const [formData, setFormData] = useState<SuaHoSoBenhNhanEMRRequest>({
    hoTen: hoSoBenhNhan.hoTen || "",
    ngaySinh: hoSoBenhNhan.ngaySinh || "",
    gioiTinh: (hoSoBenhNhan.gioiTinh as GioiTinh) || "NAM",
    soDienThoai: hoSoBenhNhan.soDienThoai || "",
    cccd: hoSoBenhNhan.cccd || "",
    soBaoHiemYTe: hoSoBenhNhan.soBaoHiemYTe || "",
    diaChi: hoSoBenhNhan.diaChi || "",
  });

  useEffect(() => {
    setFormData({
      hoTen: hoSoBenhNhan.hoTen || "",
      ngaySinh: hoSoBenhNhan.ngaySinh || "",
      gioiTinh: (hoSoBenhNhan.gioiTinh as GioiTinh) || "NAM",
      soDienThoai: hoSoBenhNhan.soDienThoai || "",
      cccd: hoSoBenhNhan.cccd || "",
      soBaoHiemYTe: hoSoBenhNhan.soBaoHiemYTe || "",
      diaChi: hoSoBenhNhan.diaChi || "",
    });
  }, [hoSoBenhNhan]);

  // Điền nhanh thông tin người đặt đã nhập vào form sửa
  const handleAutoFillFromBooking = () => {
    setFormData((prev) => ({
      ...prev,
      hoTen: doiChieu?.hoTenDaNhap || prev.hoTen,
      ngaySinh: doiChieu?.ngaySinhDaNhap || prev.ngaySinh,
      gioiTinh: (doiChieu?.gioiTinhDaNhap as GioiTinh) || prev.gioiTinh,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onUpdatePatient(formData);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 mb-6">
      {/* Cảnh báo cần đối chiếu giấy tờ */}
      {doiChieu?.canDoiChieu && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {lang === "vi"
                  ? "Cảnh báo: Thông tin người đặt nhập KHÁC hồ sơ bệnh nhân!"
                  : "Identity Warning: Booker entry differs from stored profile!"}
              </h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                {lang === "vi"
                  ? "Vui lòng đối chiếu giấy tờ tùy thân của bệnh nhân. Nếu hồ sơ sai, hãy cập nhật lại bên dưới rồi bấm 'Đã đối chiếu giấy tờ'."
                  : "Please verify the patient's identity papers. Update the profile below if needed, then confirm identity checked."}
              </p>
              {doiChieu.hoTenDaNhap && (
                <div className="mt-2 text-xs bg-white/70 p-2 rounded border border-amber-200/60 inline-flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    <strong>{lang === "vi" ? "Tên nhập: " : "Entered name: "}</strong>
                    {doiChieu.hoTenDaNhap}
                  </span>
                  {doiChieu.ngaySinhDaNhap && (
                    <span>
                      <strong>{lang === "vi" ? "Ngày sinh: " : "DOB: "}</strong>
                      {doiChieu.ngaySinhDaNhap}
                    </span>
                  )}
                  {doiChieu.gioiTinhDaNhap && (
                    <span>
                      <strong>{lang === "vi" ? "Giới tính: " : "Gender: "}</strong>
                      {doiChieu.gioiTinhDaNhap}
                    </span>
                  )}
                  {doiChieu.hoTenGiamHoDaNhap && (
                    <span>
                      <strong>{lang === "vi" ? "Giám hộ: " : "Guardian: "}</strong>
                      {doiChieu.hoTenGiamHoDaNhap}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFillFromBooking}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {lang === "vi"
              ? "Điền theo người đặt nhập"
              : "Fill from booking"}
          </button>
        </div>
      )}

      {/* Grid: 2 Cột (Cột 1: Thông tin Lịch hẹn & Hồ sơ gốc; Cột 2: Form đối chiếu & sửa) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột 1: Tổng quan lượt khám & Hồ sơ bệnh nhân (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
            <User className="w-4 h-4 text-teal-600" />
            {lang === "vi" ? "Thông tin lượt khám" : "Visit Details"}
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã tra cứu:</span>
              <span className="font-mono font-bold text-slate-700">
                {lichHen.maTraCuu}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số thứ tự khám:</span>
              <span className="font-bold text-teal-700">#{lichHen.soThuTu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Giờ khám dự kiến:</span>
              <span className="font-semibold text-slate-700">
                {lichHen.gioKhamDuKien}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phòng khám:</span>
              <span className="text-slate-700 font-medium">
                {lichHen.phongKham?.tenPhong || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lý do khám:</span>
              <span className="text-slate-700 font-medium text-right max-w-[200px]">
                {lichHen.lyDoKham || "—"}
              </span>
            </div>
            {lichHen.nguoiGiamHo && (
              <div className="flex justify-between">
                <span className="text-slate-500">Người giám hộ:</span>
                <span className="text-slate-700 font-medium">
                  {lichHen.nguoiGiamHo.hoTen} ({lichHen.nguoiGiamHo.soDienThoai})
                </span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mt-5 mb-3 pt-3 border-t border-slate-200">
            <FileBadge className="w-4 h-4 text-blue-600" />
            {lang === "vi" ? "Hồ sơ bệnh nhân lưu trữ" : "Stored Patient Info"}
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Họ và tên:</span>
              <span className="font-bold text-slate-800">
                {hoSoBenhNhan.hoTen}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số CCCD / Định danh:</span>
              <span className="font-mono text-slate-700">
                {hoSoBenhNhan.cccd || (lang === "vi" ? "(Chưa có)" : "(None)")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngày sinh & Tuổi:</span>
              <span className="text-slate-700">
                {hoSoBenhNhan.ngaySinh} ({hoSoBenhNhan.tuoi}{" "}
                {lang === "vi" ? "tuổi" : "yo"})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Giới tính:</span>
              <span className="text-slate-700 font-medium">
                {hoSoBenhNhan.gioiTinh === "NAM"
                  ? "Nam"
                  : hoSoBenhNhan.gioiTinh === "NU"
                    ? "Nữ"
                    : "Khác"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <span className="text-slate-700 font-medium">
                {hoSoBenhNhan.soDienThoai}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thẻ BHYT:</span>
              <span className="text-slate-700 font-mono">
                {hoSoBenhNhan.soBaoHiemYTe || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Địa chỉ:</span>
              <span className="text-slate-700 text-right max-w-[200px]">
                {hoSoBenhNhan.diaChi || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tiền sử bệnh lý:</span>
              <span className="text-slate-700 text-right max-w-[200px]">
                {hoSoBenhNhan.tienSuBenhLy || (lang === "vi" ? "Chưa ghi nhận" : "None")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tài khoản:</span>
              <span
                className={`font-semibold ${
                  hoSoBenhNhan.daLienKetTaiKhoan
                    ? "text-emerald-700"
                    : "text-slate-500"
                }`}
              >
                {hoSoBenhNhan.daLienKetTaiKhoan
                  ? lang === "vi"
                    ? "Đã liên kết tài khoản"
                    : "Linked to Account"
                  : lang === "vi"
                    ? "Chưa liên kết"
                    : "Unlinked"}
              </span>
            </div>
          </div>
        </div>

        {/* Cột 2: Form đối chiếu & sửa hồ sơ bệnh nhân (7 cols) */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === "vi"
                ? "Sửa hồ sơ bệnh nhân (nếu đối chiếu có sai lệch)"
                : "Edit Patient Identity (if discrepant)"}
            </h3>
            {doiChieu?.canDoiChieu && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {lang === "vi" ? "Cần đối chiếu" : "Check Needed"}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Họ và tên *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={formData.hoTen}
                  onChange={(e) =>
                    setFormData({ ...formData, hoTen: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Ngày sinh *" : "Date of Birth *"}
                </label>
                <input
                  type="date"
                  required
                  value={formData.ngaySinh}
                  onChange={(e) =>
                    setFormData({ ...formData, ngaySinh: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Giới tính" : "Gender"}
                </label>
                <select
                  value={formData.gioiTinh || "NAM"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gioiTinh: e.target.value as GioiTinh,
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="NAM">{lang === "vi" ? "Nam" : "Male"}</option>
                  <option value="NU">{lang === "vi" ? "Nữ" : "Female"}</option>
                  <option value="KHAC">{lang === "vi" ? "Khác" : "Other"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Số điện thoại *" : "Phone *"}
                </label>
                <input
                  type="tel"
                  required
                  pattern="0\d{9}"
                  placeholder="0xxxxxxxxx"
                  value={formData.soDienThoai}
                  onChange={(e) =>
                    setFormData({ ...formData, soDienThoai: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Số CCCD / Định danh" : "National ID"}
                </label>
                <input
                  type="text"
                  maxLength={12}
                  disabled={Boolean(hoSoBenhNhan.cccd)}
                  placeholder={
                    hoSoBenhNhan.cccd
                      ? lang === "vi"
                        ? "Đã có CCCD (khóa)"
                        : "Locked"
                      : "12 chữ số..."
                  }
                  value={formData.cccd || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cccd: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Số thẻ BHYT" : "Insurance Card No."}
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.soBaoHiemYTe || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, soBaoHiemYTe: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === "vi" ? "Địa chỉ cư trú" : "Address"}
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={formData.diaChi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, diaChi: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5" />
                {isUpdating
                  ? lang === "vi"
                    ? "Đang lưu..."
                    : "Saving..."
                  : lang === "vi"
                    ? "Lưu hồ sơ bệnh nhân"
                    : "Save Patient"}
              </button>

              {doiChieu?.canDoiChieu && (
                <button
                  type="button"
                  onClick={() => onMarkVerified()}
                  disabled={isMarkingVerified}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isMarkingVerified
                    ? lang === "vi"
                      ? "Đang ghi nhận..."
                      : "Recording..."
                    : lang === "vi"
                      ? "Đã đối chiếu giấy tờ"
                      : "Identity Checked"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
