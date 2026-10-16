import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileHeart, X } from "lucide-react";
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
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data: requestResponse } = useQuery({
    queryKey: ["booking", "doctor-appointment-requests"],
    queryFn: () =>
      doctorBookingService.getDanhSachYeuCauBacSi({
        trang: 0,
        kichThuoc: 100,
      }),
  });

  const today = new Date();
  const appointments: Appointment[] = (
    requestResponse?.duLieu?.noiDung ?? []
  ).map((visit) => ({
    id: String(visit.id ?? visit.maTraCuu),
    time: `${visit.gioKhamDuKien} - ${visit.gioKetThucKhung}`,
    patientName: visit.hoTenBenhNhan,
    age: visit.ngaySinhBenhNhan
      ? today.getFullYear() - Number(visit.ngaySinhBenhNhan.slice(0, 4))
      : 0,
    phone: "",
    reason: visit.lyDoKham,
    status:
      visit.trangThai === "DA_XAC_NHAN"
        ? "accepted"
        : visit.trangThai === "DA_HOAN_THANH"
          ? "completed"
          : visit.trangThai === "BI_TU_CHOI"
            ? "declined"
            : "pending",
  }));

  const statusLabel = (status: AppointmentStatus) => {
    if (status === "pending") return lang === "vi" ? "Chờ xác nhận" : "Pending";
    if (status === "accepted")
      return lang === "vi" ? "Đã tiếp nhận" : "Accepted";
    if (status === "declined") return lang === "vi" ? "Đã từ chối" : "Declined";
    return lang === "vi" ? "Hoàn thành" : "Completed";
  };

  const acceptAppointment = async (appointmentId: string) => {
    try {
      await doctorBookingService.xacNhanLichHenBacSi(Number(appointmentId));
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-appointment-requests"],
      });
    } catch (error) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể xác nhận" : "Could not accept",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ?? "Request failed",
      );
      return;
    }
    notifyAuth(
      "success",
      lang === "vi" ? "Đã xác nhận tiếp nhận" : "Appointment accepted",
      lang === "vi"
        ? `Lịch hẹn ${appointmentId} đã được xác nhận.`
        : `Appointment ${appointmentId} has been accepted.`,
    );
  };

  const rejectAppointment = async (
    event: FormEvent<HTMLFormElement>,
    appointmentId: string,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("rejectionReason") || "").trim();
    if (!reason) return;
    try {
      await doctorBookingService.tuChoiLichHenBacSi(Number(appointmentId), {
        lyDo: reason,
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking", "doctor-appointment-requests"],
      });
    } catch (error) {
      notifyAuth(
        "error",
        lang === "vi" ? "Không thể từ chối" : "Could not decline",
        (error as { response?: { data?: { thongDiep?: string } } }).response
          ?.data?.thongDiep ?? "Request failed",
      );
      return;
    }
    setRejectingId(null);
    notifyAuth(
      "info",
      lang === "vi" ? "Đã từ chối lịch hẹn" : "Appointment declined",
      lang === "vi"
        ? `Lý do từ chối đã được lưu cho ${appointmentId}.`
        : `The reason was saved for ${appointmentId}.`,
    );
  };

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending",
  ).length;

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>{lang === "vi" ? "Yêu cầu đặt lịch" : "Appointment Requests"}</h1>
          <p>
            {lang === "vi"
              ? "Xem lý do khám và xác nhận các lịch đang chờ."
              : "Review symptoms and respond to pending appointment requests."}
          </p>
        </div>
        <span className={styles.pendingCount}>
          {pendingCount} {lang === "vi" ? "chờ xác nhận" : "pending"}
        </span>
      </div>
      <div className={styles.appointmentList}>
        {appointments.map((appointment) => (
          <article className={styles.appointmentCard} key={appointment.id}>
            <div className={styles.appointmentTop}>
              <div>
                <span className={styles.appointmentCode}>{appointment.id}</span>
                <h2>{appointment.patientName}</h2>
              </div>
              <span
                className={`${styles.status} ${styles[`status_${appointment.status}`]}`}
              >
                {statusLabel(appointment.status)}
              </span>
            </div>
            <div className={styles.patientFacts}>
              <span>
                {appointment.age} {lang === "vi" ? "tuổi" : "years"}
              </span>
              <span>{appointment.phone}</span>
              <span>{appointment.time}</span>
            </div>
            <p className={styles.reason}>
              <strong>{lang === "vi" ? "Lý do khám:" : "Reason:"}</strong>{" "}
              {appointment.reason}
            </p>
            {appointment.status === "declined" && appointment.refusalReason && (
              <p className={styles.refusal}>
                <strong>
                  {lang === "vi" ? "Lý do từ chối:" : "Decline reason:"}
                </strong>{" "}
                {appointment.refusalReason}
              </p>
            )}
            {appointment.status === "pending" && (
              <div className={styles.appointmentActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => acceptAppointment(appointment.id)}
                >
                  <Check size={16} aria-hidden="true" />
                  {lang === "vi" ? "Xác nhận tiếp nhận" : "Accept appointment"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() =>
                    setRejectingId(
                      rejectingId === appointment.id ? null : appointment.id,
                    )
                  }
                >
                  <X size={16} aria-hidden="true" />
                  {lang === "vi" ? "Từ chối" : "Decline"}
                </button>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => onSelectAppointment?.(appointment)}
                >
                  <FileHeart size={16} aria-hidden="true" />
                  {lang === "vi" ? "Mở hồ sơ" : "Open record"}
                </button>
              </div>
            )}
            {rejectingId === appointment.id && (
              <form
                className={styles.rejectForm}
                onSubmit={(event) => rejectAppointment(event, appointment.id)}
              >
                <label>
                  {lang === "vi"
                    ? "Lý do từ chối (bắt buộc)"
                    : "Reason for declining (required)"}
                  <textarea
                    name="rejectionReason"
                    required
                    rows={2}
                    autoFocus
                  />
                </label>
                <button type="submit" className={styles.dangerButton}>
                  {lang === "vi" ? "Gửi từ chối" : "Confirm decline"}
                </button>
              </form>
            )}
            {appointment.status === "accepted" && (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => onSelectAppointment?.(appointment)}
              >
                <FileHeart size={16} aria-hidden="true" />
                {lang === "vi" ? "Bắt đầu khám" : "Start consultation"}
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
