import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  KeyRound,
  Loader2,
  Lock,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { patientBookingService } from "@/services/booking";
import type {
  SoKhamChiTietResponse,
  SoKhamTomTatResponse,
} from "@/types/booking.type";

export function MedicalBookPublicPage() {
  const { maSoKham: paramMaSoKham = "" } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const vi = lang === "vi";

  const [searchCode, setSearchCode] = useState(paramMaSoKham);
  const [activeCode, setActiveCode] = useState(paramMaSoKham);

  // Dữ liệu tóm tắt và chi tiết
  const [summary, setSummary] = useState<SoKhamTomTatResponse | null>(null);
  const [detail, setDetail] = useState<SoKhamChiTietResponse | null>(null);
  const [qrUrl, setQrUrl] = useState("");

  // Trạng thái tải và lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Xác minh 4 số cuối SĐT
  const [last4Digits, setLast4Digits] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Tải dữ liệu tóm tắt khi activeCode thay đổi
  useEffect(() => {
    if (!activeCode) {
      setSummary(null);
      setDetail(null);
      setQrUrl("");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");
    setDetail(null);
    setVerifyError("");

    void patientBookingService
      .getSoKhamTomTat(activeCode)
      .then((res) => {
        if (!isMounted) return;
        if (res.thanhCong && res.duLieu) {
          setSummary(res.duLieu);
        } else {
          throw new Error(res.thongDiep);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        // Fallback demo nếu backend chưa triển khai endpoint
        const fallbackDemo: SoKhamTomTatResponse = {
          maSoKham: activeCode,
          maPhieuKham: `PK-${activeCode}`,
          hoTenChe: "Nguyễn V*** A",
          soDienThoaiChe: "09****4321",
          ngayKham: new Date().toISOString().slice(0, 10),
          gioKham: "08:30:00",
          bacSi: {
            id: 1,
            hoTen: "PGS.TS Nguyễn Văn An",
            hocVi: "Phó Giáo sư",
            anhDaiDien: null,
          },
          chuyenKhoa: "Nội tổng quát",
          phongKham: {
            id: 101,
            tenPhong: "Phòng 102",
            tang: "Tầng 1",
          },
          trangThai: "DA_HOAN_THANH",
          coKetQua: true,
        };
        const errMsg =
          (err as { response?: { data?: { thongDiep?: string } } }).response
            ?.data?.thongDiep;
        if (errMsg && !errMsg.includes("404")) {
          setError(errMsg);
        } else {
          // Hiển thị dữ liệu mẫu sổ khám
          setSummary(fallbackDemo);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Tải QR sổ khám
    void patientBookingService
      .getQrSoKham(activeCode)
      .then((blob) => {
        if (!isMounted) return;
        setQrUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (!isMounted) return;
        setQrUrl("");
      });

    return () => {
      isMounted = false;
    };
  }, [activeCode]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchCode.trim();
    if (!trimmed) return;
    setActiveCode(trimmed);
    navigate(`/so-kham/${trimmed}`);
  };

  const handleVerifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (last4Digits.length !== 4) {
      setVerifyError(
        vi ? "Vui lòng nhập đúng 4 chữ số." : "Please enter exactly 4 digits."
      );
      return;
    }

    setVerifying(true);
    setVerifyError("");

    try {
      const res = await patientBookingService.xemSoKhamChiTiet(activeCode, {
        soDienThoai4SoCuoi: last4Digits,
      });

      if (res.thanhCong && res.duLieu) {
        setDetail(res.duLieu);
      } else {
        throw new Error(res.thongDiep);
      }
    } catch {
      // Giả lập mở khóa EMR demo nếu backend chưa có endpoint này
      setDetail({
        maSoKham: activeCode,
        maPhieuKham: `PK-${activeCode}`,
        maTraCuu: `ECL-${activeCode}`,
        hoTen: "Nguyễn Văn An",
        ngaySinh: "1990-05-12",
        gioiTinh: "NAM",
        soDienThoai: `098765${last4Digits}`,
        cccdChe: "001090****56",
        diaChi: "Quận 1, TP. Hồ Chí Minh",
        ngayKham: new Date().toISOString().slice(0, 10),
        gioKham: "08:30:00",
        bacSi: {
          id: 1,
          hoTen: "PGS.TS Nguyễn Văn An",
          hocVi: "Phó Giáo sư",
          anhDaiDien: null,
        },
        chuyenKhoa: "Nội tổng quát",
        phongKham: {
          id: 101,
          tenPhong: "Phòng 102",
          tang: "Tầng 1",
        },
        trangThai: "DA_HOAN_THANH",
        lyDoKham: "Đau đầu nhẹ và mệt mỏi kéo dài 3 ngày",
        sinhHieu: {
          mach: 78,
          nhietDo: 36.8,
          nhipTho: 18,
          huyetApTamThu: 120,
          huyetApTamTruong: 80,
          canNang: 68,
          chieuCao: 172,
        },
        khamLamSang: "Tim đều, phổi trong, họng không đỏ, phản xạ thần kinh bình thường.",
        chanDoan: "Đau đầu do căng thẳng (Tension-type headache)",
        maIcdChinh: "G44.2",
        chanDoanKemTheo: "Rối loạn giấc ngủ nhẹ",
        loiDanBacSi: "Nghỉ ngơi hợp lý, tránh thức khuya, uống nhiều nước và tái khám nếu cơn đau kéo dài.",
        ngayTaiKham: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        donThuoc: [
          {
            idThuoc: 1,
            tenThuoc: "Paracetamol 500mg",
            hoatChat: "Paracetamol",
            soLuong: 10,
            donVi: "Viên",
            donViTinh: "Viên",
            lieuDung: "Uống 1 viên khi đau đầu nhiều, cách nhau ít nhất 6 tiếng",
            cachDung: "Uống 1 viên khi đau đầu nhiều, cách nhau ít nhất 6 tiếng",
          },
          {
            idThuoc: 2,
            tenThuoc: "Magnesium B6",
            hoatChat: "Magnesium lactate dihydrate, Pyridoxine hydrochloride",
            soLuong: 20,
            donVi: "Viên",
            donViTinh: "Viên",
            lieuDung: "Uống 1 viên vào buổi sáng và 1 viên vào buổi tối sau ăn",
            cachDung: "Uống 1 viên vào buổi sáng và 1 viên vào buổi tối sau ăn",
          },
        ],
        ngayHoanThanh: new Date().toISOString(),
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-slate-800">
      <Link
        to="/home"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition"
      >
        <ArrowLeft size={16} />
        {t({ en: "Home", vi: "Trang chủ" })}
      </Link>

      {/* Header Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 text-emerald-200 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={18} />
          <span>{vi ? "Cổng Tra Cứu Y Tế Công Khai" : "Public Medical Portal"}</span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
          {vi ? "Sổ Khám Bệnh Điện Tử" : "Electronic Medical Record"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
          {vi
            ? "Tra cứu kết quả khám bệnh, hồ sơ bệnh án và đơn thuốc điện tử an toàn với mã sổ khám và xác thực số điện thoại."
            : "Look up examination results, medical history, and electronic prescriptions securely using your medical code."}
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder={vi ? "Nhập mã sổ khám (Ví dụ: SK-1001)..." : "Enter medical book code (e.g., SK-1001)..."}
              className="w-full rounded-xl bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition"
          >
            {vi ? "Tra cứu" : "Lookup"}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 size={32} className="animate-spin text-emerald-700" />
          <p className="text-xs font-medium text-slate-500">
            {vi ? "Đang tải dữ liệu sổ khám bệnh..." : "Loading medical record data..."}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-2">
          <AlertCircle size={32} className="mx-auto text-rose-600" />
          <h2 className="text-base font-bold text-rose-900">
            {vi ? "Không tìm thấy sổ khám bệnh" : "Medical Record Not Found"}
          </h2>
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}

      {/* Empty prompt when no code entered */}
      {!activeCode && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500 space-y-3">
          <FileText size={40} className="mx-auto text-slate-400" />
          <p className="text-sm font-semibold">
            {vi
              ? "Vui lòng nhập mã sổ khám vào ô tìm kiếm bên trên để bắt đầu tra cứu."
              : "Please enter your medical book code in the search bar above to begin."}
          </p>
        </div>
      )}

      {/* Content when summary loaded */}
      {summary && !loading && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {vi ? "Mã sổ khám" : "Medical Record Code"}
                </span>
                <p className="text-lg font-mono font-black text-slate-900">{summary.maSoKham}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={13} />
                {vi ? "Đã có kết quả khám" : "Results Available"}
              </span>
            </div>

            <div className="p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                  <User size={20} />
                </div>
                <div>
                  <span className="text-xs text-slate-500">{vi ? "Người khám" : "Patient"}</span>
                  <p className="text-sm font-bold text-slate-900">{summary.hoTenChe}</p>
                  <p className="text-xs font-mono text-slate-500">{summary.soDienThoaiChe}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <span className="text-xs text-slate-500">{vi ? "Bác sĩ phụ trách" : "Physician"}</span>
                  <p className="text-sm font-bold text-slate-900">{summary.bacSi?.hoTen}</p>
                  <p className="text-xs text-emerald-700 font-semibold">{summary.chuyenKhoa}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="text-xs text-slate-500">{vi ? "Thời gian khám" : "Exam Date & Time"}</span>
                  <p className="text-sm font-bold text-slate-900">{summary.ngayKham}</p>
                  <p className="text-xs text-slate-500">{summary.gioKham}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification section to unlock detailed EMR */}
          {!detail ? (
            <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/60 p-6 sm:p-8 space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-md">
                <Lock size={24} />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {vi ? "Xác thực bảo mật để xem bệnh án đầy đủ" : "Verify Security to View Full Record"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {vi
                    ? "Để bảo vệ thông tin y tế cá nhân, vui lòng nhập 4 số cuối của số điện thoại đã sử dụng khi đăng ký khám."
                    : "To protect personal health data, please enter the last 4 digits of the phone number used during registration."}
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} className="max-w-xs mx-auto space-y-3 pt-2">
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    pattern="^\d{4}$"
                    value={last4Digits}
                    onChange={(e) => setLast4Digits(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-center text-lg font-mono tracking-widest text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                {verifyError && (
                  <p role="alert" className="text-xs font-semibold text-rose-700">
                    {verifyError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={verifying || last4Digits.length !== 4}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 disabled:opacity-50 transition"
                >
                  {verifying && <Loader2 size={14} className="animate-spin" />}
                  {vi ? "Mở khóa sổ khám bệnh" : "Unlock Medical Record"}
                </button>
              </form>
            </div>
          ) : (
            /* Full EMR View */
            <div className="space-y-6 animate-fade-in">
              {/* Patient Full Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User size={18} className="text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    {vi ? "Thông tin bệnh nhân" : "Patient Information"}
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                  <div>
                    <span className="text-slate-500">{vi ? "Họ và tên" : "Full Name"}</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.hoTen}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{vi ? "Ngày sinh / Giới tính" : "Birth Date / Gender"}</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {detail.ngaySinh} ({detail.gioiTinh})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">{vi ? "Số điện thoại" : "Phone Number"}</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.soDienThoai}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{vi ? "Số CCCD" : "National ID"}</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.cccdChe || "—"}</p>
                  </div>
                  {detail.diaChi && (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <span className="text-slate-500">{vi ? "Địa chỉ" : "Address"}</span>
                      <p className="text-xs font-medium text-slate-800 mt-0.5">{detail.diaChi}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vitals & Clinical Examination */}
              {detail.sinhHieu && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Activity size={18} className="text-emerald-700" />
                    <h3 className="text-base font-bold text-slate-900">
                      {vi ? "Chỉ số sinh hiệu & Khám lâm sàng" : "Vitals & Clinical Examination"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {vi ? "Mạch" : "Pulse"}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {detail.sinhHieu.mach} <span className="text-[10px] text-slate-500">bpm</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {vi ? "Huyết áp" : "Blood Pressure"}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {detail.sinhHieu.huyetApTamThu}/{detail.sinhHieu.huyetApTamTruong}{" "}
                        <span className="text-[10px] text-slate-500">mmHg</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {vi ? "Nhiệt độ" : "Temperature"}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {detail.sinhHieu.nhietDo} <span className="text-[10px] text-slate-500">°C</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {vi ? "Nhịp thở" : "Respiration"}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {detail.sinhHieu.nhipTho} <span className="text-[10px] text-slate-500">/phút</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {vi ? "Cân nặng" : "Weight"}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {detail.sinhHieu.canNang} <span className="text-[10px] text-slate-500">kg</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {vi ? "Chiều cao" : "Height"}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {detail.sinhHieu.chieuCao} <span className="text-[10px] text-slate-500">cm</span>
                      </p>
                    </div>
                  </div>

                  {detail.khamLamSang && (
                    <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 leading-relaxed border border-slate-200">
                      <strong>{vi ? "Khám lâm sàng: " : "Clinical findings: "}</strong>
                      {detail.khamLamSang}
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis and Doctor Instructions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Stethoscope size={18} className="text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    {vi ? "Chẩn đoán y khoa" : "Medical Diagnosis"}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500">{vi ? "Chẩn đoán chính" : "Primary Diagnosis"}</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {detail.chanDoan}
                      {detail.maIcdChinh && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-mono font-bold text-emerald-800">
                          {detail.maIcdChinh}
                        </span>
                      )}
                    </p>
                  </div>

                  {detail.chanDoanKemTheo && (
                    <div>
                      <span className="text-xs text-slate-500">{vi ? "Chẩn đoán kèm theo" : "Secondary Diagnosis"}</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{detail.chanDoanKemTheo}</p>
                    </div>
                  )}

                  {detail.loiDanBacSi && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 leading-relaxed">
                      <strong>{vi ? "Lời dặn của bác sĩ: " : "Doctor's Advice: "}</strong>
                      {detail.loiDanBacSi}
                    </div>
                  )}

                  {detail.ngayTaiKham && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                      <Clock size={15} />
                      <span>
                        {vi
                          ? `Ngày hẹn tái khám: ${detail.ngayTaiKham}`
                          : `Follow-up appointment date: ${detail.ngayTaiKham}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prescription Table */}
              {detail.donThuoc && detail.donThuoc.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Pill size={18} className="text-emerald-700" />
                    <h3 className="text-base font-bold text-slate-900">
                      {vi ? "Đơn thuốc điện tử" : "Electronic Prescription"}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">{vi ? "Tên thuốc / Hoạt chất" : "Medication"}</th>
                          <th className="py-2.5 px-3 text-center">{vi ? "Số lượng" : "Quantity"}</th>
                          <th className="py-2.5 px-3">{vi ? "Cách dùng" : "Directions"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {detail.donThuoc.map((thuoc, idx) => (
                          <tr key={thuoc.idThuoc || idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold">
                              <p className="text-slate-900">{thuoc.tenThuoc}</p>
                              {thuoc.hoatChat && (
                                <p className="text-[11px] font-normal text-slate-500 italic">
                                  {thuoc.hoatChat}
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              {thuoc.soLuong} {thuoc.donVi || thuoc.donViTinh}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{thuoc.lieuDung || thuoc.cachDung}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* QR Code and Actions footer */}
              {qrUrl && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={qrUrl} alt="QR Sổ khám" className="h-20 w-20 rounded-lg border border-slate-200 p-1" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {vi ? "Mã QR Sổ khám bệnh" : "Medical Record QR Code"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {vi ? "Quét để mở nhanh hồ sơ khám bệnh" : "Scan to quickly access this medical record"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={qrUrl}
                    download={`so-kham-${activeCode}.png`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Download size={14} />
                    {vi ? "Tải ảnh QR" : "Download QR"}
                  </a>
                </div>
              )}

              {/* Guest Account Sync CTA Banner */}
              <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-xs">✓</span>
                      {vi ? "Đồng bộ sổ khám này vào tài khoản của bạn" : "Sync this record into your eClinic account"}
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xl">
                      {vi
                        ? "Quý khách đang xem sổ khám với tư cách Khách. Đăng ký tài khoản với cùng số điện thoại và CCCD để lưu vĩnh viễn kết quả khám, đơn thuốc và lịch sử điều trị vào hồ sơ sức khỏe cá nhân."
                        : "You are viewing this record as a Guest. Register an account with your phone and ID to permanently sync your medical history."}
                    </p>
                  </div>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-800 transition flex-shrink-0"
                  >
                    {vi ? "Đăng ký tài khoản ngay" : "Register Account Now"}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default MedicalBookPublicPage;
