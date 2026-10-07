import type { AppointmentRecord } from "@/features/patient/appointment/appointment.types";

const STORAGE_KEY = "eclinic_appointments_v1";
let memoryAppointments: AppointmentRecord[] = [];

function readAppointments(): AppointmentRecord[] {
  if (typeof window === "undefined") return memoryAppointments;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return memoryAppointments;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as AppointmentRecord[]) : [];
  } catch {
    return memoryAppointments;
  }
}

function writeAppointments(appointments: AppointmentRecord[]) {
  memoryAppointments = appointments;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch {}
}

export function createAppointment(
  values: Omit<AppointmentRecord, "bookingCode" | "status" | "createdAt">,
): AppointmentRecord {
  const bookingCode =
    "ECL-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    Math.floor(1000 + Math.random() * 9000);
  const appointment: AppointmentRecord = {
    ...values,
    bookingCode,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (appointment.patientId) {
    writeAppointments([...readAppointments(), appointment]);
  }
  return appointment;
}

export function getAppointmentsForPatient(
  patientId: string,
): AppointmentRecord[] {
  return readAppointments()
    .filter((appointment) => appointment.patientId === patientId)
    .sort((first, second) =>
      `${first.date}T${first.slotTime}`.localeCompare(
        `${second.date}T${second.slotTime}`,
      ),
    );
}
