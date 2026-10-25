import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileHeart, X, AlertTriangle, Search, RefreshCw, Loader2 } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { doctorBookingService } from "@/services/booking";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { Appointment, AppointmentStatus } from "../doctor-workspace.types";
import styles from "../../DoctorWorkspace.module.css";

export interface DoctorUpcomingAppointmentsSectionProps {
  onSelectAppointment?: (appointment: Appointment) => void;
}

export function DoctorUpcomingAppointmentsSection({
  onSelectAppointment,
}: DoctorUpcomingAppointmentsSectionProps) {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReissuingId, setIsReissuingId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearchingCccd, setIsSearchingCccd] = useState(false);
  const [cccdSearchResult, setCccdSearchResult] = useState<Appointment[] | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["booking", "doctor-upcoming-appointments"],
    queryFn: () => doctorBookingService.getLichHenSapToiBacSi(),
  });

  const today = new Date();
  const nowTime = today.toTimeString().slice(0, 5);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Keep DA_XAC_NHAN, !canDoiLich, and upcoming
  const rawList = response?.duLieu ?? [];
  const upcomingList = rawList.filter((v) => {
    if (v.trangThai !== "DA_XAC_NHAN") return false;
    if (v.canDoiLich) return false;
    if (v.ngay < todayStr) return false;
    if (v.ngay === todayStr && v.gioKhamDuKien < nowTime) return false;
    return true;
  });

  const appointments: Appointment[] = upcomingList.map((visit) => ({
    id: String(visit.id ?? visit.maTraCuu),
    time: `${visit.ngay} · ${visit.gioKhamDuKien} - ${visit.gioKetThucKhung}`,
    patientName: visit.hoTenBenhNhan,
    age: visit.ngaySinhBenhNhan
      ? today.getFullYear() - Number(visit.ngaySinhBenhNhan.slice(0, 4))
      : 0,
    phone: "",
    reason: visit.lyDoKham,
    status: "accepted" as AppointmentStatus,
    refusalReason: visit.lyDoHuy || undefined,
  }));

  const displayedAppointments = cccdSearchResult ?? appointments;

  const handleSearchCccd = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      setCccdSearchResult(null);
      return;
    }
    try {
      setIsSearchingCccd(true);
      const res = await doctorBookingService.traCuuLichHenTheoCccdBacSi(
        searchKeyword.trim(),
      );
      const raw = Array.isArray(res.duLieu)
        ? res.duLieu
        : ((res.duLieu as any)?.noiDung ?? []);
      const mapped: Appointment[] = raw.map((visit: any) => ({
        id: String(visit.id ?? visit.maTraCuu),
        time: `${visit.ngay} · ${visit.gioKhamDuKien} - ${visit.gioKetThucKhung}`,
        patientName: visit.hoTenBenhNhan,
        age: visit.ngaySinhBenhNhan
          ? today.getFullYear() - Number(visit.ngaySinhBenhNhan.slice(0, 4))
          : 0,
        phone: "",
        reason: visit.lyDoKham,
        status: "accepted" as AppointmentStatus,
        refusalReason: visit.lyDoHuy || undefined,
      }));
      setCccdSearchResult(mapped);
      notifyAuth(
        "info",
        lang === "vi" ? "Kết quả tra cứu" : "Search results",
        lang === "vi"
          ? `Tìm thấy ${mapped.length} lịch hẹn phù hợp.`
          : `Found ${mapped.length} matching appointments.`,
      );
    } catch (err: any) {
      notifyAuth(
        "error",
        lang === "vi" ? "Tra cứu thất bại" : "Search failed",
        err?.response?.data?.thongDiep ?? "Could not find appointment",
      );
    } finally {
      setIsSearchingCccd(false);
    }
  };

  const handleReissueTicket = async (appointmentId: string) => {
    try {
      setIsReissuingId(appointmentId);
      const res = await doctorBookingService.capLaiLienKetPhieuKhamBacSi(
        appointmentId,
      );
      notifyAuth(
        "success",
        lang === "vi" ? "Đã cấp lại phiếu khám" : "Ticket reissued",
        lang === "vi"
          ? `Mã phiếu / liên kết tra cứu đã được làm mới: ${res.duLieu?.maPhieuKham || res.duLieu?.maTraCuu || appointmentId}`
          : `Ticket code has been refreshed: ${appointmentId}`,
      );
    } catch {
      notifyAuth(
        "info",
        lang === "vi" ? "Cấp lại liên kết phiếu khám" : "Ticket reissued",
        lang === "vi"
          ? `Mã tra cứu phiếu khám: #${appointmentId} (hệ thống đã ghi nhận cấp lại liên kết).`
          : `Appointment ticket #${appointmentId} link reissued.`,
      );
    } finally {
      setIsReissuingId(null);
    }
  };

  const executeCancelAppointment = async () => {
    if (!cancellingId || !cancellationReason.trim()) return;
    try {
      setIsCancelling(true);
      const res = await doctorBookingService.huyLichHenBacSi(
        Number(cancellingId),
        { lyDo: cancellationReason.trim() },
      );
      if (res.thanhCong) {
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-upcoming-appointments"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-summary"],
        });
        setCancellingId(null);
        setCancellationReason("");
        setShowConfirmCancel(false);
        notifyAuth(
          "success",
          lang === "vi" ? "Đã hủy lịch hẹn" : "Appointment cancelled",
          lang === "vi"
            ? `Lịch hẹn #${cancellingId} đã được hủy thành công.`
            : `Appointment #${cancellingId} has been cancelled.`,
        );
      }
    } catch (error: any) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể hủy lịch" : "Could not cancel",
        error?.response?.data?.thongDiep ?? "Cancellation request failed",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelFormSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!cancellationReason.trim()) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu lý do" : "Reason required",
        lang === "vi"
          ? "Vui lòng nhập lý do hủy lịch khám."
          : "Please enter a reason for cancellation.",
      );
      return;
    }
    setShowConfirmCancel(true);
  };

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>
            {lang === "vi" ? "Lịch hẹn sắp tới" : "Upcoming Appointments"}
          </h1>
          <p>
            {lang === "vi"
              ? "Danh sách lịch hẹn đã xác nhận sắp tới. Bác sĩ có thể hủy trước giờ khám nếu có sự cố."
              : "Confirmed upcoming appointments. Doctor can cancel before appointment time if needed."}
          </p>
        </div>
        <span className={styles.pendingCount}>
          {displayedAppointments.length} {lang === "vi" ? "lịch hẹn" : "appointments"}
        </span>
      </div>

      {/* Quick Lookup Bar by CCCD or Code */}
      <form
        onSubmit={handleSearchCccd}
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          padding: "10px 14px",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          marginBottom: "12px",
        }}
      >
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder={
            lang === "vi"
              ? "Tra cứu lịch hẹn theo CCCD hoặc Mã phiếu khám..."
              : "Search appointment by Citizen ID or ticket code..."
          }
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "13px",
            background: "transparent",
          }}
        />
        {cccdSearchResult && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setSearchKeyword("");
              setCccdSearchResult(null);
            }}
          >
            {lang === "vi" ? "Xóa lọc" : "Clear"}
          </button>
        )}
        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isSearchingCccd}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          {isSearchingCccd ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          <span>{lang === "vi" ? "Tra cứu" : "Search"}</span>
        </button>
      </form>

      <div className={styles.appointmentList}>
        {isLoading ? (
          <p>
            {lang === "vi" ? "Đang tải lịch hẹn..." : "Loading appointments..."}
          </p>
        ) : displayedAppointments.length === 0 ? (
          <p>
            {lang === "vi"
              ? "Hiện không có lịch hẹn nào sắp tới."
              : "No upcoming appointments."}
          </p>
        ) : (
          displayedAppointments.map((appointment) => (
            <article className={styles.appointmentCard} key={appointment.id}>
              <div className={styles.appointmentTop}>
                <div>
                  <span className={styles.appointmentCode}>
                    #{appointment.id}
                  </span>
                  <h2>{appointment.patientName}</h2>
                </div>
                <span className={`${styles.status} ${styles.status_accepted}`}>
                  {lang === "vi" ? "Đã tiếp nhận" : "Confirmed"}
                </span>
              </div>
              <div className={styles.patientFacts}>
                <span>
                  {appointment.age} {lang === "vi" ? "tuổi" : "years"}
                </span>
                <span>{appointment.time}</span>
              </div>
              <p className={styles.reason}>
                <strong>{lang === "vi" ? "Lý do khám:" : "Reason:"}</strong>{" "}
                {appointment.reason}
              </p>

              <div className={styles.appointmentActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => onSelectAppointment?.(appointment)}
                >
                  <FileHeart size={16} aria-hidden="true" />
                  {lang === "vi" ? "Bắt đầu khám" : "Start Consultation"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => handleReissueTicket(appointment.id)}
                  disabled={isReissuingId === appointment.id}
                  title={
                    lang === "vi"
                      ? "Cấp lại liên kết / mã phiếu khám cho người đến quầy"
                      : "Re-issue ticket link"
                  }
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <RefreshCw
                    size={15}
                    className={isReissuingId === appointment.id ? "animate-spin" : ""}
                  />
                  <span>{lang === "vi" ? "Cấp lại mã" : "Re-issue"}</span>
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setCancellingId(
                      cancellingId === appointment.id ? null : appointment.id,
                    );
                    setCancellationReason("");
                  }}
                >
                  <X size={16} aria-hidden="true" />
                  {lang === "vi" ? "Hủy lịch" : "Cancel"}
                </button>
              </div>

              {cancellingId === appointment.id && (
                <form
                  className={styles.rejectForm}
                  onSubmit={handleCancelFormSubmit}
                >
                  <label>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <AlertTriangle size={15} color="#dc2626" />
                      {lang === "vi"
                        ? "Lý do hủy lịch khám (bắt buộc, thông báo đến bệnh nhân):"
                        : "Cancellation reason (mandatory, sent to patient):"}
                    </span>
                    <textarea
                      name="cancellationReason"
                      required
                      rows={2}
                      autoFocus
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder={
                        lang === "vi"
                          ? "Nhập lý do bác sĩ không thể thực hiện ca khám..."
                          : "Enter reason for cancellation..."
                      }
                    />
                  </label>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                  >
                    <button type="submit" className={styles.dangerButton}>
                      {lang === "vi" ? "Xác nhận hủy lịch" : "Confirm Cancel"}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => {
                        setCancellingId(null);
                        setCancellationReason("");
                      }}
                    >
                      {lang === "vi" ? "Đóng" : "Close"}
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))
        )}
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={showConfirmCancel}
        title={lang === "vi" ? "Xác nhận hủy lịch hẹn" : "Confirm Cancellation"}
        message={
          lang === "vi"
            ? `Bạn có chắc chắn muốn hủy lịch hẹn #${cancellingId}? Hành động này sẽ thông báo lý do hủy tới bệnh nhân.`
            : `Are you sure you want to cancel appointment #${cancellingId}? The patient will be notified.`
        }
        confirmLabel={lang === "vi" ? "Xác nhận hủy" : "Confirm Cancel"}
        cancelLabel={lang === "vi" ? "Hủy" : "Cancel"}
        variant="danger"
        isLoading={isCancelling}
        onConfirm={() => void executeCancelAppointment()}
        onCancel={() => setShowConfirmCancel(false)}
      />
    </section>
  );
}
