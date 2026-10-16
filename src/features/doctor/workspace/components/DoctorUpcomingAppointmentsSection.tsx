import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileHeart, X, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { notifyAuth } from "@/utils/authNotification";
import { doctorBookingService } from "@/services/booking";
import type { Appointment, AppointmentStatus } from "../doctor-workspace.types";
import styles from "../DoctorWorkspace.module.css";

export interface DoctorUpcomingAppointmentsSectionProps {
  onSelectAppointment?: (appointment: Appointment) => void;
}

export function DoctorUpcomingAppointmentsSection({
  onSelectAppointment,
}: DoctorUpcomingAppointmentsSectionProps) {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const handleCancelAppointment = async (
    event: FormEvent<HTMLFormElement>,
    appointmentId: string,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("cancellationReason") || "").trim();
    if (!reason) {
      notifyAuth(
        "error",
        lang === "vi" ? "Thiếu lý do" : "Reason required",
        lang === "vi" ? "Vui lòng nhập lý do hủy lịch khám." : "Please enter a reason for cancellation.",
      );
      return;
    }

    try {
      const res = await doctorBookingService.huyLichHenBacSi(Number(appointmentId), {
        lyDo: reason,
      });
      if (res.thanhCong) {
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-upcoming-appointments"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["booking", "doctor-summary"],
        });
        setCancellingId(null);
        notifyAuth(
          "success",
          lang === "vi" ? "Đã hủy lịch hẹn" : "Appointment cancelled",
          lang === "vi"
            ? `Lịch hẹn #${appointmentId} đã được hủy thành công.`
            : `Appointment #${appointmentId} has been cancelled.`,
        );
      }
    } catch (error) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể hủy lịch" : "Could not cancel",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ?? "Cancellation request failed",
      );
    }
  };

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>{lang === "vi" ? "Lịch hẹn sắp tới" : "Upcoming Appointments"}</h1>
          <p>
            {lang === "vi"
              ? "Danh sách lịch hẹn đã xác nhận sắp tới. Bác sĩ có thể hủy trước giờ khám nếu có sự cố."
              : "Confirmed upcoming appointments. Doctor can cancel before appointment time if needed."}
          </p>
        </div>
        <span className={styles.pendingCount}>
          {appointments.length} {lang === "vi" ? "lịch hẹn" : "appointments"}
        </span>
      </div>

      <div className={styles.appointmentList}>
        {isLoading ? (
          <p>{lang === "vi" ? "Đang tải lịch hẹn..." : "Loading appointments..."}</p>
        ) : appointments.length === 0 ? (
          <p>{lang === "vi" ? "Hiện không có lịch hẹn nào sắp tới." : "No upcoming appointments."}</p>
        ) : (
          appointments.map((appointment) => (
            <article className={styles.appointmentCard} key={appointment.id}>
              <div className={styles.appointmentTop}>
                <div>
                  <span className={styles.appointmentCode}>{appointment.id}</span>
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
                  onClick={() =>
                    setCancellingId(
                      cancellingId === appointment.id ? null : appointment.id,
                    )
                  }
                >
                  <X size={16} aria-hidden="true" />
                  {lang === "vi" ? "Hủy lịch" : "Cancel"}
                </button>
              </div>

              {cancellingId === appointment.id && (
                <form
                  className={styles.rejectForm}
                  onSubmit={(event) => handleCancelAppointment(event, appointment.id)}
                >
                  <label>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                      placeholder={
                        lang === "vi"
                          ? "Nhập lý do bác sĩ không thể thực hiện ca khám..."
                          : "Enter reason for cancellation..."
                      }
                    />
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button type="submit" className={styles.dangerButton}>
                      {lang === "vi" ? "Xác nhận hủy lịch" : "Confirm Cancel"}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => setCancellingId(null)}
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
    </section>
  );
}
