import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type QrScanner from 'qr-scanner'
import { CalendarDays, Camera, Check, Clock3, FileHeart, Search, X } from 'lucide-react'
import { useAuth } from '@/shared/context/AuthContext'
import { useLanguage } from '@/shared/context/LanguageContext'
import { notifyAuth } from '@/shared/utils/authNotification'
import type { DoctorSection } from './DoctorSidebar'
import styles from './DoctorWorkspace.module.css'

type AppointmentStatus = 'pending' | 'accepted' | 'declined' | 'completed'

interface Appointment {
  id: string
  patientName: string
  age: number
  phone: string
  time: string
  reason: string
  status: AppointmentStatus
  refusalReason?: string
}

interface CompletedRecord {
  recordCode: string
  appointmentCode: string
  patientName: string
  diagnosis: string
  prescription: string
  createdAt: string
}

const initialAppointments: Appointment[] = [
  { id: 'AP-101', time: '08:30 - 09:00', patientName: 'Nguyễn Thị Hoa', age: 34, phone: '090 321 45 67', reason: 'Khám tim mạch định kỳ', status: 'pending' },
  { id: 'AP-102', time: '09:15 - 09:45', patientName: 'Trần Văn Minh', age: 45, phone: '090 415 28 19', reason: 'Tái khám huyết áp', status: 'pending' },
  { id: 'AP-103', time: '10:00 - 10:30', patientName: 'Lê Hoàng Nam', age: 28, phone: '091 284 61 33', reason: 'Đau ngực nhẹ', status: 'accepted' },
  { id: 'AP-104', time: '10:45 - 11:15', patientName: 'Phạm Thu Trang', age: 52, phone: '093 705 12 48', reason: 'Tư vấn xét nghiệm máu', status: 'pending' },
]

function getWorkWeek(lang: string) {
  const today = new Date()
  const dayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() + dayOffset)

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return {
      date,
      weekday: new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(date),
      dateText: new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short' }).format(date),
    }
  })
}

interface DoctorWorkspaceProps {
  activeSection: DoctorSection
}

export function DoctorWorkspace({ activeSection }: DoctorWorkspaceProps) {
  const { lang } = useLanguage()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [scheduleView, setScheduleView] = useState<'day' | 'week'>('week')
  const [shiftStart, setShiftStart] = useState('')
  const [shiftEnd, setShiftEnd] = useState('')
  const [shiftReason, setShiftReason] = useState('')
  const [shiftRequests, setShiftRequests] = useState<string[]>([])
  const [patientCode, setPatientCode] = useState('')
  const [patientLookup, setPatientLookup] = useState<Appointment | null>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [completedRecord, setCompletedRecord] = useState<CompletedRecord | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const workWeek = getWorkWeek(lang)

  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return

    let scanner: QrScanner | undefined
    let disposed = false

    void import('qr-scanner').then(({ default: QrScanner }) => {
      if (disposed || !videoRef.current) return
      scanner = new QrScanner(videoRef.current, (result) => {
        const qrText = result.data
        try {
          const decoded = JSON.parse(qrText) as { appointmentCode?: string }
          setPatientCode(decoded.appointmentCode || qrText)
        } catch {
          setPatientCode(qrText)
        }
        scanner?.stop()
        setScannerOpen(false)
      }, { preferredCamera: 'environment' })
      return scanner.start()
    }).catch(() => {
      if (!disposed) {
        setScannerOpen(false)
        notifyAuth('error', lang === 'vi' ? 'Không thể mở camera' : 'Camera unavailable', lang === 'vi' ? 'Kiểm tra quyền truy cập camera hoặc nhập mã phiếu thủ công.' : 'Check camera permission or enter the visit code manually.')
      }
    })

    return () => {
      disposed = true
      scanner?.stop()
      scanner?.destroy()
    }
  }, [scannerOpen, lang])

  const handleShiftRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const start = new Date(shiftStart).getTime()
    const end = new Date(shiftEnd).getTime()
    if (start < Date.now() + 24 * 60 * 60 * 1000) {
      notifyAuth('error', lang === 'vi' ? 'Chưa đủ thời gian báo trước' : 'Request too late', lang === 'vi' ? 'Yêu cầu cần được gửi trước ít nhất 24 giờ.' : 'Requests must be submitted at least 24 hours in advance.')
      return
    }
    if (end <= start) {
      notifyAuth('error', lang === 'vi' ? 'Khung giờ không hợp lệ' : 'Invalid time range', lang === 'vi' ? 'Thời gian kết thúc phải sau thời gian bắt đầu.' : 'The end time must be after the start time.')
      return
    }

    setShiftRequests((current) => [`${new Date(shiftStart).toLocaleString(lang)} – ${shiftReason}`, ...current])
    setShiftStart('')
    setShiftEnd('')
    setShiftReason('')
    notifyAuth('success', lang === 'vi' ? 'Đã gửi yêu cầu' : 'Request submitted', lang === 'vi' ? 'Yêu cầu đổi ca / xin nghỉ đã được chuyển đến Quản trị viên.' : 'Your schedule request was sent to the administrator.')
  }

  const acceptAppointment = (appointmentId: string) => {
    setAppointments((current) => current.map((appointment) => appointment.id === appointmentId ? { ...appointment, status: 'accepted' } : appointment))
    notifyAuth('success', lang === 'vi' ? 'Đã xác nhận tiếp nhận' : 'Appointment accepted', lang === 'vi' ? `Lịch hẹn ${appointmentId} đã được xác nhận.` : `Appointment ${appointmentId} has been accepted.`)
  }

  const rejectAppointment = (event: FormEvent<HTMLFormElement>, appointmentId: string) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const reason = String(formData.get('rejectionReason') || '').trim()
    if (!reason) return
    setAppointments((current) => current.map((appointment) => appointment.id === appointmentId ? { ...appointment, status: 'declined', refusalReason: reason } : appointment))
    setRejectingId(null)
    notifyAuth('info', lang === 'vi' ? 'Đã từ chối lịch hẹn' : 'Appointment declined', lang === 'vi' ? `Lý do từ chối đã được lưu cho ${appointmentId}.` : `The reason was saved for ${appointmentId}.`)
  }

  const lookupPatient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedCode = patientCode.trim().toUpperCase()
    const found = appointments.find((appointment) => appointment.id === normalizedCode)
    if (!found) {
      setPatientLookup(null)
      notifyAuth('error', lang === 'vi' ? 'Không tìm thấy phiếu khám' : 'Visit not found', lang === 'vi' ? 'Kiểm tra mã phiếu điện tử và thử lại.' : 'Check the visit code and try again.')
      return
    }
    setPatientLookup(found)
    setCompletedRecord(null)
    setDiagnosis('')
    setPrescription('')
  }

  const completeConsultation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!patientLookup) return
    const record = {
      recordCode: `EMR-${Date.now().toString().slice(-7)}`,
      appointmentCode: patientLookup.id,
      patientName: patientLookup.patientName,
      diagnosis: diagnosis.trim(),
      prescription: prescription.trim(),
      createdAt: new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    }
    setCompletedRecord(record)
    setAppointments((current) => current.map((appointment) => appointment.id === patientLookup.id ? { ...appointment, status: 'completed' } : appointment))
    notifyAuth('success', lang === 'vi' ? 'Đã hoàn tất hồ sơ khám' : 'Consultation completed', lang === 'vi' ? 'Sổ khám điện tử đã được tạo kèm mã QR.' : 'The electronic medical record and QR code are ready.')
  }

  const statusLabel = (status: AppointmentStatus) => {
    if (status === 'pending') return lang === 'vi' ? 'Chờ xác nhận' : 'Pending'
    if (status === 'accepted') return lang === 'vi' ? 'Đã tiếp nhận' : 'Accepted'
    if (status === 'declined') return lang === 'vi' ? 'Đã từ chối' : 'Declined'
    return lang === 'vi' ? 'Hoàn thành' : 'Completed'
  }

  if (activeSection === 'schedule') {
    return (
      <section className={styles.workspace}>
        <div className={styles.pageHeading}>
          <div><h1>{lang === 'vi' ? 'Lịch làm việc cá nhân' : 'Work Schedule'}</h1><p>{lang === 'vi' ? 'Ca khám và lịch trực do Quản trị viên phân công.' : 'Clinic shifts assigned by your administrator.'}</p></div>
          <div className={styles.segmented} role="group" aria-label={lang === 'vi' ? 'Chế độ xem lịch' : 'Schedule view'}>
            <button type="button" className={scheduleView === 'day' ? styles.selected : ''} onClick={() => setScheduleView('day')}>{lang === 'vi' ? 'Ngày' : 'Day'}</button>
            <button type="button" className={scheduleView === 'week' ? styles.selected : ''} onClick={() => setScheduleView('week')}>{lang === 'vi' ? 'Tuần' : 'Week'}</button>
          </div>
        </div>
        <div className={styles.shiftList}>
          {workWeek.filter((day) => scheduleView === 'week' || day.date.toDateString() === new Date().toDateString()).map((day, index) => (
            <article className={styles.shiftCard} key={day.date.toISOString()}>
              <div className={styles.shiftDate}><strong>{day.weekday}</strong><span>{day.dateText}</span></div>
              <div className={styles.shiftDetails}><span><Clock3 size={15} aria-hidden="true" />{index % 2 === 0 ? '08:00 – 12:00' : '13:00 – 17:00'}</span><span><CalendarDays size={15} aria-hidden="true" />{index % 2 === 0 ? (lang === 'vi' ? 'Phòng khám 02' : 'Clinic room 02') : (lang === 'vi' ? 'Phòng khám 04' : 'Clinic room 04')}</span></div>
              <span className={styles.shiftStatus}>{lang === 'vi' ? 'Đã phân công' : 'Assigned'}</span>
            </article>
          ))}
          {scheduleView === 'day' && workWeek.every((day) => day.date.toDateString() !== new Date().toDateString()) && <p className={styles.emptyNote}>{lang === 'vi' ? 'Hôm nay không có ca được phân công.' : 'No shift assigned for today.'}</p>}
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeading}><div><h2>{lang === 'vi' ? 'Yêu cầu đổi ca / xin nghỉ' : 'Request a shift change / leave'}</h2><p>{lang === 'vi' ? 'Gửi trước thời điểm đề xuất tối thiểu 24 giờ.' : 'Submit at least 24 hours before the requested start.'}</p></div></div>
          <form className={styles.formGrid} onSubmit={handleShiftRequest}>
            <label>{lang === 'vi' ? 'Bắt đầu' : 'Start'}<input type="datetime-local" required value={shiftStart} onChange={(event) => setShiftStart(event.target.value)} /></label>
            <label>{lang === 'vi' ? 'Kết thúc' : 'End'}<input type="datetime-local" required value={shiftEnd} onChange={(event) => setShiftEnd(event.target.value)} /></label>
            <label className={styles.fullWidth}>{lang === 'vi' ? 'Lý do' : 'Reason'}<textarea required rows={3} value={shiftReason} onChange={(event) => setShiftReason(event.target.value)} placeholder={lang === 'vi' ? 'Nhập lý do và khung thời gian đề xuất' : 'Explain the request and proposed time window'} /></label>
            <button className={styles.primaryButton} type="submit">{lang === 'vi' ? 'Gửi Quản trị viên' : 'Send to administrator'}</button>
          </form>
          {shiftRequests.length > 0 && <div className={styles.requestList}><h3>{lang === 'vi' ? 'Yêu cầu đã gửi' : 'Submitted requests'}</h3>{shiftRequests.map((request, index) => <p key={`${request}-${index}`}><Clock3 size={14} aria-hidden="true" />{request}</p>)}</div>}
        </section>
      </section>
    )
  }

  if (activeSection === 'appointments') {
    const pendingCount = appointments.filter((appointment) => appointment.status === 'pending').length
    return (
      <section className={styles.workspace}>
        <div className={styles.pageHeading}><div><h1>{lang === 'vi' ? 'Yêu cầu đặt lịch' : 'Appointment Requests'}</h1><p>{lang === 'vi' ? 'Xem lý do khám và xác nhận các lịch đang chờ.' : 'Review symptoms and respond to pending appointment requests.'}</p></div><span className={styles.pendingCount}>{pendingCount} {lang === 'vi' ? 'chờ xác nhận' : 'pending'}</span></div>
        <div className={styles.appointmentList}>
          {appointments.map((appointment) => (
            <article className={styles.appointmentCard} key={appointment.id}>
              <div className={styles.appointmentTop}><div><span className={styles.appointmentCode}>{appointment.id}</span><h2>{appointment.patientName}</h2></div><span className={`${styles.status} ${styles[`status_${appointment.status}`]}`}>{statusLabel(appointment.status)}</span></div>
              <div className={styles.patientFacts}><span>{appointment.age} {lang === 'vi' ? 'tuổi' : 'years'}</span><span>{appointment.phone}</span><span>{appointment.time}</span></div>
              <p className={styles.reason}><strong>{lang === 'vi' ? 'Lý do khám:' : 'Reason:'}</strong> {appointment.reason}</p>
              {appointment.status === 'declined' && appointment.refusalReason && <p className={styles.refusal}><strong>{lang === 'vi' ? 'Lý do từ chối:' : 'Decline reason:'}</strong> {appointment.refusalReason}</p>}
              {appointment.status === 'pending' && <div className={styles.appointmentActions}>
                <button type="button" className={styles.primaryButton} onClick={() => acceptAppointment(appointment.id)}><Check size={16} aria-hidden="true" />{lang === 'vi' ? 'Xác nhận tiếp nhận' : 'Accept appointment'}</button>
                <button type="button" className={styles.secondaryButton} onClick={() => setRejectingId(rejectingId === appointment.id ? null : appointment.id)}><X size={16} aria-hidden="true" />{lang === 'vi' ? 'Từ chối' : 'Decline'}</button>
                <button type="button" className={styles.textButton} onClick={() => { setPatientCode(appointment.id); setPatientLookup(appointment); setCompletedRecord(null); setDiagnosis(''); setPrescription(''); }}><FileHeart size={16} aria-hidden="true" />{lang === 'vi' ? 'Mở hồ sơ' : 'Open record'}</button>
              </div>}
              {rejectingId === appointment.id && <form className={styles.rejectForm} onSubmit={(event) => rejectAppointment(event, appointment.id)}><label>{lang === 'vi' ? 'Lý do từ chối (bắt buộc)' : 'Reason for declining (required)'}<textarea name="rejectionReason" required rows={2} autoFocus /></label><button type="submit" className={styles.dangerButton}>{lang === 'vi' ? 'Gửi từ chối' : 'Confirm decline'}</button></form>}
              {appointment.status === 'accepted' && <button type="button" className={styles.textButton} onClick={() => { setPatientCode(appointment.id); setPatientLookup(appointment); setCompletedRecord(null); setDiagnosis(''); setPrescription(''); }}><FileHeart size={16} aria-hidden="true" />{lang === 'vi' ? 'Bắt đầu khám' : 'Start consultation'}</button>}
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (activeSection === 'consultation') {
    return (
      <section className={styles.workspace}>
        <div className={styles.pageHeading}><div><h1>{lang === 'vi' ? 'Tiếp nhận & khám bệnh' : 'Consultation / EMR'}</h1><p>{lang === 'vi' ? 'Tra cứu phiếu khám, xem tiền sử và hoàn tất hồ sơ điện tử.' : 'Find a visit, review history, and complete the electronic record.'}</p></div></div>
        <section className={styles.panel}>
          <div className={styles.panelHeading}><div><h2>{lang === 'vi' ? 'Tiếp nhận bệnh nhân' : 'Check in a patient'}</h2><p>{lang === 'vi' ? 'Quét mã QR trên phiếu khám hoặc nhập mã phiếu.' : 'Scan the visit QR code or enter its code.'}</p></div></div>
          <form className={styles.lookupForm} onSubmit={lookupPatient}>
            <label htmlFor="patient-visit-code">{lang === 'vi' ? 'Mã phiếu khám điện tử' : 'Electronic visit code'}</label>
            <div className={styles.lookupControls}><input id="patient-visit-code" value={patientCode} onChange={(event) => setPatientCode(event.target.value)} placeholder="AP-101" required /><button type="submit" className={styles.primaryButton}><Search size={16} aria-hidden="true" />{lang === 'vi' ? 'Tra cứu' : 'Find visit'}</button><button type="button" className={styles.secondaryButton} onClick={() => setScannerOpen((value) => !value)}><Camera size={16} aria-hidden="true" />{scannerOpen ? (lang === 'vi' ? 'Đóng camera' : 'Close camera') : (lang === 'vi' ? 'Quét QR' : 'Scan QR')}</button></div>
          </form>
          {scannerOpen && <div className={styles.scanner}><video ref={videoRef} aria-label={lang === 'vi' ? 'Camera quét mã QR' : 'QR scanner camera'} /><p>{lang === 'vi' ? 'Đưa mã QR vào khung hình. Camera chỉ hoạt động khi được cấp quyền.' : 'Align the QR code in view. Camera access is required.'}</p></div>}
        </section>

        {patientLookup && <>
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><h2>{patientLookup.patientName}</h2><p>{patientLookup.id} · {patientLookup.age} {lang === 'vi' ? 'tuổi' : 'years'} · {patientLookup.phone}</p></div><span className={styles.status}>{lang === 'vi' ? 'Hồ sơ bệnh nhân' : 'Patient record'}</span></div>
            <div className={styles.historyBox}><strong>{lang === 'vi' ? 'Tiền sử khám liên quan' : 'Related visit history'}</strong><p>{lang === 'vi' ? 'Khám định kỳ 6 tháng trước; chưa ghi nhận dị ứng thuốc trong hồ sơ mẫu.' : 'Routine visit six months ago; no medication allergies listed in the sample record.'}</p><span>{lang === 'vi' ? 'Lý do lần này:' : 'Current reason:'} {patientLookup.reason}</span></div>
            <form className={styles.formGrid} onSubmit={completeConsultation}>
              <label className={styles.fullWidth}>{lang === 'vi' ? 'Chẩn đoán' : 'Diagnosis'}<textarea rows={3} required value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} /></label>
              <label className={styles.fullWidth}>{lang === 'vi' ? 'Đơn thuốc / hướng điều trị' : 'Prescription / treatment plan'}<textarea rows={3} required value={prescription} onChange={(event) => setPrescription(event.target.value)} /></label>
              <button type="submit" className={styles.primaryButton}>{lang === 'vi' ? 'Hoàn tất và tạo sổ khám điện tử' : 'Complete and create medical record'}</button>
            </form>
          </section>
          {completedRecord && <section className={`${styles.panel} ${styles.printableRecord}`}>
            <div className={styles.recordHeading}><div><span className={styles.eyebrow}>{lang === 'vi' ? 'SỔ KHÁM BỆNH ĐIỆN TỬ' : 'ELECTRONIC MEDICAL RECORD'}</span><h2>{completedRecord.patientName}</h2><p>{completedRecord.recordCode} · {completedRecord.createdAt}</p></div><QRCodeSVG value={JSON.stringify(completedRecord)} size={132} level="M" aria-label={lang === 'vi' ? 'Mã QR hồ sơ khám' : 'Medical record QR code'} /></div>
            <div className={styles.recordField}><strong>{lang === 'vi' ? 'Chẩn đoán' : 'Diagnosis'}</strong><p>{completedRecord.diagnosis}</p></div>
            <div className={styles.recordField}><strong>{lang === 'vi' ? 'Đơn thuốc / hướng điều trị' : 'Prescription / treatment'}</strong><p>{completedRecord.prescription}</p></div>
            <button type="button" className={styles.secondaryButton} onClick={() => window.print()}>{lang === 'vi' ? 'In / lưu sổ khám' : 'Print / save record'}</button>
          </section>}
        </>}
      </section>
    )
  }

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}><div><h1>{lang === 'vi' ? 'Hồ sơ cá nhân' : 'Doctor Profile'}</h1><p>{lang === 'vi' ? 'Thông tin do Quản trị viên quản lý. Chế độ chỉ xem.' : 'Managed by your administrator. Read-only profile.'}</p></div></div>
      <section className={styles.panel}>
        <div className={styles.profileHeading}><span className={styles.profileAvatar}>{(user?.name || 'BS').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><h2>{user?.name || (lang === 'vi' ? 'Bác sĩ eClinic' : 'eClinic Doctor')}</h2><span>{lang === 'vi' ? 'Hồ sơ bác sĩ' : 'Doctor profile'}</span></div></div>
        <dl className={styles.profileGrid}>
          <div><dt>{lang === 'vi' ? 'Email' : 'Email'}</dt><dd>{user?.email || '—'}</dd></div>
          <div><dt>{lang === 'vi' ? 'Điện thoại' : 'Phone'}</dt><dd>{user?.phone || '—'}</dd></div>
          <div><dt>{lang === 'vi' ? 'Chuyên khoa' : 'Specialty'}</dt><dd>{user?.specialty || (lang === 'vi' ? 'Chưa cập nhật' : 'Not provided')}</dd></div>
          <div><dt>{lang === 'vi' ? 'Trình độ / Học vị' : 'Qualification'}</dt><dd>{user?.degree || (lang === 'vi' ? 'Chưa cập nhật' : 'Not provided')}</dd></div>
          <div><dt>{lang === 'vi' ? 'Phòng khám công tác' : 'Clinic'}</dt><dd>{user?.clinic || (lang === 'vi' ? 'Chưa cập nhật' : 'Not provided')}</dd></div>
        </dl>
        <p className={styles.readOnlyNote}>{lang === 'vi' ? 'Muốn cập nhật thông tin? Vui lòng liên hệ Quản trị viên.' : 'Contact your administrator to update this information.'}</p>
      </section>
    </section>
  )
}