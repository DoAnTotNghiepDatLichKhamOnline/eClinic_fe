import {
  User,
  Phone,
  ShieldCheck,
  FileText,
  AlertCircle,
  Baby,
  Users,
  Calendar,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Lang } from "@/types/i18n";
import type { AppointmentFormValues } from "../appointment.types";
import { calculateAge, calculateAgeInYears } from "../appointment.utils";

interface PatientInfoStepProps {
  lang: Lang;
  formValues: AppointmentFormValues;
  onChange: (field: keyof AppointmentFormValues, value: any) => void;
  errors?: Partial<Record<keyof AppointmentFormValues, string>>;
  isPediatric?: boolean;
}

export function PatientInfoStep({
  lang,
  formValues,
  onChange,
  errors = {},
  isPediatric = false,
}: PatientInfoStepProps) {
  // Bệnh nhân là vị thành niên nếu khám khoa nhi hoặc ngày sinh < 18 tuổi
  const effectiveDob = isPediatric
    ? formValues.childDob
    : formValues.patientDob;
  const ageYears = calculateAgeInYears(effectiveDob, formValues.date);
  const isMinor = isPediatric || (effectiveDob ? ageYears < 18 : false);
  const ageDisplay = calculateAge(effectiveDob, lang);

  return (
    <div className="space-y-6">
      {/* NHÓM THÔNG TIN CÁ NHÂN BỆNH NHÂN / BỆNH NHI */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-[#0f4d3a] font-bold text-sm">
            {isMinor ? <Baby size={18} /> : "5"}
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>
                {isMinor
                  ? lang === "vi"
                    ? "Thông tin Bệnh nhi / Người khám (< 18 tuổi)"
                    : "Child / Minor Information (< 18 yrs)"
                  : lang === "vi"
                    ? "Thông tin Cá nhân Bệnh nhân (Người đến khám)"
                    : "Patient Personal Information"}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isMinor
                ? lang === "vi"
                  ? "Nhập họ tên, ngày sinh và giới tính để bác sĩ đánh giá thể trạng phát triển"
                  : "Enter patient full name, date of birth, and gender"
                : lang === "vi"
                  ? "Thông tin chính xác giúp tạo hoặc đồng bộ đúng hồ sơ y tế bệnh viện"
                  : "Accurate details help create or link to your medical records"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Họ và tên */}
          <div className="space-y-1.5 md:col-span-2">
            <label
              htmlFor="patient-name"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <User size={14} className="text-slate-500" />
              <span>
                {isMinor
                  ? lang === "vi"
                    ? "Họ và tên người khám / bệnh nhi"
                    : "Patient / Child Full Name"
                  : lang === "vi"
                    ? "Họ và tên đầy đủ"
                    : "Full Name"}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="patient-name"
              type="text"
              autoComplete="name"
              maxLength={150}
              value={formValues.patientName}
              onChange={(e) => onChange("patientName", e.target.value)}
              placeholder={
                lang === "vi"
                  ? isMinor
                    ? "Ví dụ: NGUYỄN GIA HÂN"
                    : "Ví dụ: NGUYỄN VĂN AN"
                  : isMinor
                    ? "E.g., NGUYEN GIA HAN"
                    : "E.g., NGUYEN VAN AN"
              }
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                errors.patientName
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : "border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15"
              }`}
            />
            {errors.patientName && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientName}
              </p>
            )}
          </div>

          {/* Ngày sinh */}
          <div className="space-y-1.5">
            <label
              htmlFor="patient-dob"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Calendar size={14} className="text-slate-500" />
              <span>
                {isMinor
                  ? lang === "vi"
                    ? "Ngày sinh của người khám / bé"
                    : "Date of Birth"
                  : lang === "vi"
                    ? "Ngày sinh"
                    : "Date of Birth"}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <DatePicker
              id="patient-dob"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current.isAfter(dayjs())}
              value={effectiveDob ? dayjs(effectiveDob, "YYYY-MM-DD") : null}
              onChange={(date) => {
                const val = date ? date.format("YYYY-MM-DD") : "";
                onChange("patientDob", val);
                if (isPediatric) {
                  onChange("childDob", val);
                }
              }}
              placeholder={lang === "vi" ? "Chọn hoặc nhập ngày (DD/MM/YYYY)" : "DD/MM/YYYY"}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 bg-white transition-all outline-none ${
                errors.patientDob || (isPediatric && errors.childDob)
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : "border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15"
              }`}
            />
            {ageDisplay && (
              <p className="text-[11px] text-[#0f4d3a] font-semibold flex items-center gap-1">
                <Sparkles size={12} />
                <span>
                  {lang === "vi" ? "Độ tuổi:" : "Age:"} {ageDisplay}
                </span>
              </p>
            )}
            {(errors.patientDob || (isPediatric && errors.childDob)) && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientDob || errors.childDob}
              </p>
            )}
          </div>

          {/* Giới tính */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>{lang === "vi" ? "Giới tính" : "Gender"}</span>
              <span className="text-rose-500 font-bold">*</span>
            </span>
            <div className="grid grid-cols-3 gap-2 h-11">
              {[
                { value: "NAM", vi: "Nam", en: "Male" },
                { value: "NU", vi: "Nữ", en: "Female" },
                { value: "KHAC", vi: "Khác", en: "Other" },
              ].map((g) => {
                const isSelected = formValues.patientGender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => {
                      onChange("patientGender", g.value);
                      if (isPediatric) {
                        onChange("childGender", g.value);
                      }
                    }}
                    className={`h-full rounded-xl text-xs transition-all ${
                      isSelected
                        ? "border-2 border-emerald-800 bg-white text-slate-900 font-bold shadow-sm ring-2 ring-emerald-600/20"
                        : "border border-slate-200 bg-white hover:border-emerald-600 hover:bg-white text-slate-800 font-medium"
                    }`}
                  >
                    {lang === "vi" ? g.vi : g.en}
                  </button>
                );
              })}
            </div>
            {errors.patientGender && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientGender}
              </p>
            )}
          </div>

          {/* Số điện thoại (Chỉ bắt buộc nếu >= 18 tuổi) */}
          <div className="space-y-1.5">
            <label
              htmlFor="patient-phone"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Phone size={14} className="text-slate-500" />
              <span>
                {lang === "vi" ? "Số điện thoại liên hệ" : "Phone Number"}
              </span>
              {!isMinor && <span className="text-rose-500 font-bold">*</span>}
              {isMinor && (
                <span className="text-slate-400 font-normal">
                  ({lang === "vi" ? "tùy chọn" : "optional"})
                </span>
              )}
            </label>
            <input
              id="patient-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formValues.patientPhone}
              onChange={(e) =>
                onChange("patientPhone", e.target.value.replace(/\D/g, ""))
              }
              placeholder={lang === "vi" ? "Ví dụ: 0912345678" : "0912345678"}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                errors.patientPhone
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : "border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15"
              }`}
            />
            {errors.patientPhone && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientPhone}
              </p>
            )}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label
              htmlFor="patient-email"
              className="text-xs font-bold text-slate-700"
            >
              {lang === "vi"
                ? "Email nhận xác nhận và nhắc lịch (không bắt buộc)"
                : "Email for confirmation and reminders (optional)"}
            </label>
            <input
              id="patient-email"
              type="email"
              maxLength={255}
              value={formValues.patientEmail || ""}
              onChange={(event) => onChange("patientEmail", event.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15"
            />
            <p className="text-xs text-slate-500">
              {lang === "vi"
                ? "Khách không nhập email sẽ không nhận được email xác nhận hoặc nhắc lịch."
                : "Guests who leave this blank will not receive booking confirmations or reminders."}
            </p>
          </div>

          {/* Số CCCD (Bắt buộc nếu >= 18 tuổi, trẻ em bỏ trống) */}
          <div className="space-y-1.5">
            <label
              htmlFor="patient-cccd"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-slate-500" />
              <span>
                {lang === "vi"
                  ? "Số Căn cước công dân (CCCD)"
                  : "Citizen ID (CCCD)"}
              </span>
              {!isMinor && <span className="text-rose-500 font-bold">*</span>}
              {isMinor && (
                <span className="text-slate-400 font-normal">
                  (
                  {lang === "vi"
                    ? "trẻ em chưa có CCCD bỏ trống"
                    : "optional for minors"}
                  )
                </span>
              )}
            </label>
            <input
              id="patient-cccd"
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={formValues.patientCccd}
              onChange={(e) =>
                onChange("patientCccd", e.target.value.replace(/\D/g, ""))
              }
              placeholder={
                lang === "vi" ? "12 chữ số CCCD" : "12-digit Citizen ID"
              }
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                errors.patientCccd
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : "border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15"
              }`}
            />
            {errors.patientCccd && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientCccd}
              </p>
            )}
          </div>

          {/* Bảo hiểm y tế (BHYT) */}
          <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard size={14} className="text-emerald-700" />
                <span>
                  {lang === "vi"
                    ? "Bảo hiểm y tế (BHYT)"
                    : "Health Insurance"}
                </span>
              </label>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    onChange("hasHealthInsurance", false);
                    onChange("healthInsuranceNumber", "");
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    !formValues.hasHealthInsurance
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {lang === "vi" ? "Không có BHYT" : "No Insurance"}
                </button>
                <button
                  type="button"
                  onClick={() => onChange("hasHealthInsurance", true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    formValues.hasHealthInsurance
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {lang === "vi" ? "Có thẻ BHYT" : "Has Insurance"}
                </button>
              </div>
            </div>

            {formValues.hasHealthInsurance && (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 animate-fade-in">
                <div className="space-y-1">
                  <label
                    htmlFor="health-insurance-number"
                    className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5"
                  >
                    <span>{lang === "vi" ? "Số thẻ BHYT (15 ký tự)" : "Insurance Card Number"}</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="health-insurance-number"
                    type="text"
                    maxLength={15}
                    value={formValues.healthInsuranceNumber || ""}
                    onChange={(e) =>
                      onChange(
                        "healthInsuranceNumber",
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                      )
                    }
                    placeholder="VD: DN4797931800123"
                    className="w-full h-10 px-3 rounded-lg border border-emerald-300 bg-white font-mono text-sm tracking-wider uppercase text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <p className="text-[11px] text-emerald-800">
                    {lang === "vi"
                      ? "Mã thẻ BHYT hợp lệ gồm 15 ký tự (chữ in hoa và số) theo quy định của BHXH Việt Nam."
                      : "Valid Vietnam health insurance code consists of 15 alphanumeric characters."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lý do khám / Triệu chứng */}
          <div className="space-y-1.5 md:col-span-2">
            <label
              htmlFor="patient-reason"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <FileText size={14} className="text-slate-500" />
              <span>
                {lang === "vi"
                  ? "Lý do khám / Triệu chứng bệnh lý"
                  : "Reason for Visit / Symptoms"}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              id="patient-reason"
              rows={3}
              value={formValues.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              placeholder={
                lang === "vi"
                  ? isMinor
                    ? "Mô tả triệu chứng của bé (sốt, ho, tiêu hóa, tiêm chủng, phát ban...)..."
                    : "Mô tả sơ bộ tình trạng sức khỏe, triệu chứng hiện tại để bác sĩ nắm thông tin..."
                  : "Describe symptoms or health concerns for the doctor..."
              }
              className={`w-full p-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none resize-none ${
                errors.reason
                  ? "border-rose-300 ring-2 ring-rose-100"
                  : "border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15"
              }`}
            />
            {errors.reason && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.reason}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FORM NGƯỜI GIÁM HỘ (BẮT BUỘC KHI < 18 TUỔI / KHOA NHI) */}
      {isMinor && (
        <section className="bg-amber-50/70 rounded-2xl p-6 border-2 border-amber-300/80 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-950 font-display">
                  {lang === "vi"
                    ? "Thông tin Người giám hộ (Bắt buộc cho người khám < 18 tuổi)"
                    : "Guardian Information (Required for minors < 18 yrs)"}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {lang === "vi" ? "Bắt buộc" : "Required"}
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                {lang === "vi"
                  ? "Người khám dưới 18 tuổi bắt buộc có người giám hộ hợp pháp (Bố/Mẹ/Người giám hộ) bảo lãnh pháp lý."
                  : "Minors under 18 must be accompanied by a legal parent/guardian."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Họ tên người giám hộ */}
            <div className="space-y-1.5 md:col-span-2">
              <label
                htmlFor="guardian-name"
                className="text-xs font-bold text-amber-950 flex items-center gap-1.5"
              >
                <User size={14} className="text-amber-700" />
                <span>
                  {lang === "vi"
                    ? "Họ và tên người giám hộ"
                    : "Guardian Full Name"}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="guardian-name"
                type="text"
                autoComplete="name"
                maxLength={150}
                value={formValues.guardianName || ""}
                onChange={(e) => onChange("guardianName", e.target.value)}
                placeholder={
                  lang === "vi"
                    ? "Ví dụ: NGUYỄN THỊ MAI (Bố / Mẹ / Người giám hộ)"
                    : "E.g., NGUYEN THI MAI (Parent / Legal Guardian)"
                }
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                  errors.guardianName
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20"
                }`}
              />
              {errors.guardianName && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-semibold">
                  <AlertCircle size={13} />
                  {errors.guardianName}
                </p>
              )}
            </div>

            {/* Số CCCD người giám hộ */}
            <div className="space-y-1.5">
              <label
                htmlFor="guardian-cccd"
                className="text-xs font-bold text-amber-950 flex items-center gap-1.5"
              >
                <ShieldCheck size={14} className="text-amber-700" />
                <span>
                  {lang === "vi"
                    ? "Số CCCD người giám hộ (12 chữ số)"
                    : "Guardian Citizen ID (12 digits)"}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="guardian-cccd"
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={formValues.guardianCccd || ""}
                onChange={(e) =>
                  onChange("guardianCccd", e.target.value.replace(/\D/g, ""))
                }
                placeholder={
                  lang === "vi"
                    ? "12 chữ số CCCD người giám hộ"
                    : "12-digit Citizen ID"
                }
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                  errors.guardianCccd
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20"
                }`}
              />
              {errors.guardianCccd && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-semibold">
                  <AlertCircle size={13} />
                  {errors.guardianCccd}
                </p>
              )}
            </div>

            {/* Số điện thoại người giám hộ */}
            <div className="space-y-1.5">
              <label
                htmlFor="guardian-phone"
                className="text-xs font-bold text-amber-950 flex items-center gap-1.5"
              >
                <Phone size={14} className="text-amber-700" />
                <span>
                  {lang === "vi"
                    ? "Số điện thoại người giám hộ"
                    : "Guardian Phone Number"}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="guardian-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formValues.guardianPhone || ""}
                onChange={(e) =>
                  onChange("guardianPhone", e.target.value.replace(/\D/g, ""))
                }
                placeholder={lang === "vi" ? "Ví dụ: 0987654321" : "0987654321"}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                  errors.guardianPhone
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20"
                }`}
              />
              {errors.guardianPhone && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-semibold">
                  <AlertCircle size={13} />
                  {errors.guardianPhone}
                </p>
              )}
            </div>

            {/* Quan hệ với bệnh nhân */}
            <div className="space-y-1.5 md:col-span-2">
              <label
                htmlFor="guardian-rel"
                className="text-xs font-bold text-amber-950 flex items-center gap-1.5"
              >
                <Users size={14} className="text-amber-700" />
                <span>
                  {lang === "vi"
                    ? "Mối quan hệ với người khám"
                    : "Relationship with Patient"}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                id="guardian-rel"
                value={formValues.guardianRelationship || "CHA"}
                onChange={(e) =>
                  onChange("guardianRelationship", e.target.value)
                }
                className="w-full h-11 px-3.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20"
              >
                <option value="CHA">
                  {lang === "vi" ? "Cha / Bố" : "Father"}
                </option>
                <option value="ME">{lang === "vi" ? "Mẹ" : "Mother"}</option>
                <option value="NGUOI_GIAM_HO_HOP_PHAP">
                  {lang === "vi" ? "Người giám hộ hợp pháp" : "Legal Guardian"}
                </option>
                <option value="KHAC">
                  {lang === "vi" ? "Khác (Ông/Bà/Anh/Chị)" : "Other Relative"}
                </option>
              </select>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
