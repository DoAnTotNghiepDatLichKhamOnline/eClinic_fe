import { User, Phone, ShieldCheck, FileText, AlertCircle, Baby, Users } from 'lucide-react'
import type { Lang } from '@/shared/types/i18n'
import type { AppointmentFormValues } from '../appointment.types'

interface PatientInfoStepProps {
  lang: Lang
  formValues: AppointmentFormValues
  onChange: (field: keyof AppointmentFormValues, value: string) => void
  errors?: Partial<Record<keyof AppointmentFormValues, string>>
}

export function PatientInfoStep({
  lang,
  formValues,
  onChange,
  errors = {},
}: PatientInfoStepProps) {
  const isPediatric = formValues.specialtyId === 'pediatrics'

  return (
    <div className="space-y-6">
      {/* NHÓM THÔNG TIN CÁ NHÂN BỆNH NHÂN */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all hover:border-slate-300">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-[#0f4d3a] font-bold text-sm">
            5
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>
                {isPediatric
                  ? lang === 'vi'
                    ? 'Thông tin Bệnh nhi (Người đến khám)'
                    : 'Child Patient Information'
                  : lang === 'vi'
                  ? 'Thông tin Cá nhân Bệnh nhân (Người đến khám)'
                  : 'Patient Personal Information'}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'vi'
                ? 'Thông tin chính xác giúp tạo hoặc đồng bộ đúng hồ sơ y tế'
                : 'Accurate details help create or link to your medical records'}
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
                {isPediatric
                  ? lang === 'vi'
                    ? 'Họ và tên bệnh nhi'
                    : 'Child Full Name'
                  : lang === 'vi'
                  ? 'Họ và tên đầy đủ'
                  : 'Full Name'}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="patient-name"
              type="text"
              autoComplete="name"
              maxLength={150}
              value={formValues.patientName}
              onChange={(e) => onChange('patientName', e.target.value)}
              placeholder={
                lang === 'vi'
                  ? 'Ví dụ: NGUYỄN VĂN AN'
                  : 'E.g., NGUYEN VAN AN'
              }
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                errors.patientName
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15'
              }`}
            />
            {errors.patientName && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientName}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label
              htmlFor="patient-phone"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Phone size={14} className="text-slate-500" />
              <span>{lang === 'vi' ? 'Số điện thoại' : 'Phone Number'}</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="patient-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formValues.patientPhone}
              onChange={(e) =>
                onChange('patientPhone', e.target.value.replace(/\D/g, ''))
              }
              placeholder={lang === 'vi' ? 'Ví dụ: 0912345678' : '0912345678'}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                errors.patientPhone
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15'
              }`}
            />
            <p className="text-[11px] text-slate-500 leading-normal">
              {lang === 'vi'
                ? 'Dùng để nhận thông tin lịch hẹn và làm cơ sở xác minh khi muốn đổi/hủy lịch.'
                : 'Used to receive booking confirmation and verify changes/cancellations.'}
            </p>
            {errors.patientPhone && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientPhone}
              </p>
            )}
          </div>

          {/* Số CCCD */}
          <div className="space-y-1.5">
            <label
              htmlFor="patient-cccd"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-slate-500" />
              <span>
                {isPediatric
                  ? lang === 'vi'
                    ? 'Số Định danh / CCCD của trẻ (hoặc mã định danh trên giấy khai sinh)'
                    : 'Child ID / Birth Certificate ID'
                  : lang === 'vi'
                  ? 'Số Căn cước công dân (CCCD)'
                  : 'Citizen ID (CCCD)'}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="patient-cccd"
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={formValues.patientCccd}
              onChange={(e) =>
                onChange('patientCccd', e.target.value.replace(/\D/g, ''))
              }
              placeholder={lang === 'vi' ? '12 chữ số CCCD / Định danh cá nhân' : '12-digit Citizen ID'}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                errors.patientCccd
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15'
              }`}
            />
            <p className="text-[11px] text-slate-500 leading-normal">
              {lang === 'vi'
                ? 'Khóa định danh cốt lõi giúp hệ thống tra cứu và liên kết đúng hồ sơ bệnh nhân (chưa có thì khởi tạo hồ sơ mới, đã có thì dùng lại hồ sơ cũ).'
                : 'Core identification key to match existing medical records or initialize a new record.'}
            </p>
            {errors.patientCccd && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle size={13} />
                {errors.patientCccd}
              </p>
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
                {lang === 'vi'
                  ? 'Lý do khám / Triệu chứng bệnh lý'
                  : 'Reason for Visit / Symptoms'}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              id="patient-reason"
              rows={3}
              value={formValues.reason}
              onChange={(e) => onChange('reason', e.target.value)}
              placeholder={
                lang === 'vi'
                  ? 'Mô tả sơ bộ tình trạng sức khỏe, triệu chứng hiện tại để bác sĩ nắm thông tin trước khi tiếp nhận...'
                  : 'Describe your symptoms or reason for visiting so the doctor is prepared before consultation...'
              }
              className={`w-full p-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none resize-none ${
                errors.reason
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:border-[#0f4d3a] focus:ring-2 focus:ring-[#0f4d3a]/15'
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

      {/* FORM NGƯỜI GIÁM HỘ (HIỆN NẾU LÀ KHOA NHI) */}
      {isPediatric && (
        <section className="bg-amber-50/60 rounded-2xl p-6 border-2 border-amber-300 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Baby size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-950 font-display">
                  {lang === 'vi'
                    ? 'Thông tin Người giám hộ (Bắt buộc cho Khoa Nhi)'
                    : 'Guardian Information (Required for Pediatrics)'}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {lang === 'vi' ? 'Bắt buộc' : 'Required'}
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                {lang === 'vi'
                  ? 'Do bệnh nhân thăm khám thuộc Khoa Nhi, vui lòng cung cấp thông tin người giám hộ hợp pháp (Bố/Mẹ/Người bảo hộ).'
                  : 'Since this appointment is in Pediatrics, please provide details of the accompanying parent or legal guardian.'}
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
                  {lang === 'vi'
                    ? 'Họ và tên người giám hộ'
                    : 'Guardian Full Name'}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="guardian-name"
                type="text"
                autoComplete="name"
                maxLength={150}
                value={formValues.guardianName || ''}
                onChange={(e) => onChange('guardianName', e.target.value)}
                placeholder={
                  lang === 'vi'
                    ? 'Ví dụ: NGUYỄN THỊ MAI (Bố / Mẹ / Người giám hộ)'
                    : 'E.g., NGUYEN THI MAI (Parent / Legal Guardian)'
                }
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                  errors.guardianName
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20'
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
                  {lang === 'vi'
                    ? 'Số CCCD người giám hộ'
                    : 'Guardian Citizen ID (CCCD)'}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="guardian-cccd"
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={formValues.guardianCccd || ''}
                onChange={(e) =>
                  onChange('guardianCccd', e.target.value.replace(/\D/g, ''))
                }
                placeholder={lang === 'vi' ? '12 chữ số CCCD người giám hộ' : '12-digit Citizen ID'}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                  errors.guardianCccd
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20'
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
                  {lang === 'vi'
                    ? 'Số điện thoại người giám hộ'
                    : 'Guardian Phone Number'}
                </span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="guardian-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formValues.guardianPhone || ''}
                onChange={(e) =>
                  onChange('guardianPhone', e.target.value.replace(/\D/g, ''))
                }
                placeholder={lang === 'vi' ? 'Ví dụ: 0987654321' : '0987654321'}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-white transition-all outline-none ${
                  errors.guardianPhone
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20'
                }`}
              />
              {errors.guardianPhone && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-semibold">
                  <AlertCircle size={13} />
                  {errors.guardianPhone}
                </p>
              )}
            </div>

            {/* Quan hệ với bệnh nhi */}
            <div className="space-y-1.5 md:col-span-2">
              <label
                htmlFor="guardian-rel"
                className="text-xs font-bold text-amber-950 flex items-center gap-1.5"
              >
                <Users size={14} className="text-amber-700" />
                <span>
                  {lang === 'vi'
                    ? 'Mối quan hệ với bệnh nhi'
                    : 'Relationship with Child'}
                </span>
              </label>
              <select
                id="guardian-rel"
                value={formValues.guardianRelationship || 'Cha/Mẹ'}
                onChange={(e) => onChange('guardianRelationship', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20"
              >
                <option value="Cha/Mẹ">{lang === 'vi' ? 'Cha / Mẹ' : 'Parent (Father / Mother)'}</option>
                <option value="Ông/Bà">{lang === 'vi' ? 'Ông / Bà' : 'Grandparent'}</option>
                <option value="Người giám hộ hợp pháp">{lang === 'vi' ? 'Người giám hộ hợp pháp' : 'Legal Guardian'}</option>
                <option value="Khác">{lang === 'vi' ? 'Khác (Anh/Chị/Người thân)' : 'Other Relative'}</option>
              </select>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
