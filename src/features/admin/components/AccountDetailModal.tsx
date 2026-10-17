import { useLanguage } from "@/shared/context/LanguageContext";
import { useChiTietTaiKhoan } from "@/hooks/useIdentity";
import {
  Loader2,
  X,
  User,
  Mail,
  Shield,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";

interface AccountDetailModalProps {
  userId: number;
  onClose: () => void;
}

export function AccountDetailModal({ userId, onClose }: AccountDetailModalProps) {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const { chiTiet, isLoading, error } = useChiTietTaiKhoan(userId);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={vi ? "Chi tiết tài khoản" : "Account details"}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {vi ? "Chi tiết tài khoản" : "Account Details"} #{userId}
              </h2>
              <p className="text-xs text-slate-500">
                {vi ? "Thông tin định danh và liên kết hệ thống" : "Identity and system association info"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 size={32} className="mx-auto mb-3 animate-spin text-blue-600" />
            <p className="text-sm">{vi ? "Đang tải thông tin chi tiết..." : "Loading account details..."}</p>
          </div>
        ) : error || !chiTiet ? (
          <div className="py-12 text-center text-rose-600">
            <AlertTriangle size={32} className="mx-auto mb-2 text-rose-500" />
            <p className="text-sm font-medium">
              {vi ? "Không thể tải thông tin tài khoản." : "Failed to load account information."}
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-5">
            {/* User overview card */}
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-blue-100 shadow-sm flex items-center justify-center text-blue-700 font-bold text-xl">
                {chiTiet.anhDaiDien ? (
                  <img src={chiTiet.anhDaiDien} alt="" className="h-full w-full object-cover" />
                ) : (
                  (chiTiet.hoTen || "U").trim().split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase() || <User size={28} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 truncate">{chiTiet.hoTen}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      chiTiet.vaiTro === "QUAN_TRI_VIEN"
                        ? "bg-purple-100 text-purple-700"
                        : chiTiet.vaiTro === "BAC_SI"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {chiTiet.vaiTro}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      chiTiet.trangThai === "DA_KICH_HOAT"
                        ? "bg-green-100 text-green-700"
                        : chiTiet.trangThai === "CHO_XAC_NHAN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {chiTiet.trangThai}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Mail size={13} /> {chiTiet.email}
                </p>
              </div>
            </div>

            {/* Thông báo nếu vô hiệu hóa */}
            {chiTiet.trangThai === "VO_HIEU_HOA" && chiTiet.lyDoVoHieuHoa && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-800">
                <div className="flex items-center gap-1.5 font-semibold text-rose-900 mb-1">
                  <AlertTriangle size={14} />
                  {vi ? "Lý do vô hiệu hóa:" : "Disable reason:"}
                </div>
                <p>{chiTiet.lyDoVoHieuHoa}</p>
              </div>
            )}

            {/* Grid thông tin chi tiết */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 rounded-xl border border-slate-200/80 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User size={14} className="text-blue-500" />
                  {vi ? "Thông tin cá nhân" : "Personal Information"}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{vi ? "Số điện thoại:" : "Phone:"}</span>
                    <span className="font-medium text-slate-800">{chiTiet.soDienThoai || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{vi ? "Ngày sinh:" : "Date of birth:"}</span>
                    <span className="font-medium text-slate-800">
                      {chiTiet.ngaySinh ? new Date(chiTiet.ngaySinh).toLocaleDateString("vi-VN") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{vi ? "Ngày tạo:" : "Created at:"}</span>
                    <span className="font-medium text-slate-800">
                      {new Date(chiTiet.ngayTao).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{vi ? "Cập nhật:" : "Updated at:"}</span>
                    <span className="font-medium text-slate-800">
                      {chiTiet.ngayCapNhat ? new Date(chiTiet.ngayCapNhat).toLocaleString("vi-VN") : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200/80 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-500" />
                  {vi ? "Phương thức & Trạng thái" : "Methods & Status"}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{vi ? "Mật khẩu nội bộ:" : "Local password:"}</span>
                    <span className="font-medium text-slate-800">
                      {chiTiet.coMatKhau ? (vi ? "Đã thiết lập" : "Configured") : (vi ? "Chưa có" : "None")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{vi ? "Liên kết Google:" : "Google linked:"}</span>
                    <span className="font-medium text-slate-800">
                      {chiTiet.lienKetGoogle ? (
                        <span className="text-emerald-600 font-semibold">{vi ? "Đã liên kết" : "Linked"}</span>
                      ) : (
                        <span className="text-slate-400">{vi ? "Chưa liên kết" : "Not linked"}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{vi ? "Hồ sơ bệnh nhân:" : "Patient record:"}</span>
                    <span className="font-medium text-slate-800">
                      {chiTiet.trangThaiLienKetHoSo || (vi ? "Chưa liên kết" : "Not linked")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bác sĩ liên kết (nếu có) */}
            {chiTiet.bacSi && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                  <Stethoscope size={15} />
                  {vi ? "Hồ sơ Bác sĩ liên kết" : "Linked Doctor Profile"}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">{vi ? "Số giấy phép:" : "License No:"} </span>
                    <span className="font-semibold">{chiTiet.bacSi.soGiayPhep || `#${chiTiet.bacSi.id}`}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{vi ? "Chuyên khoa:" : "Department:"} </span>
                    <span className="font-semibold">{chiTiet.bacSi.tenChuyenKhoa || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{vi ? "Học vị:" : "Degree:"} </span>
                    <span className="font-semibold">{chiTiet.bacSi.hocVi || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{vi ? "Kinh nghiệm:" : "Experience:"} </span>
                    <span className="font-semibold">{chiTiet.bacSi.soNamKinhNghiem ?? 0} {vi ? "năm" : "years"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            {vi ? "Đóng" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
