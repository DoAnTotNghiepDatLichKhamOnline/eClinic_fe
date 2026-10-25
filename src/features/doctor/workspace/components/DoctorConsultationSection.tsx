import { useParams } from "react-router-dom";
import { DoctorConsultationPage } from "@/features/doctor/consultation/DoctorConsultationPage";
import { DoctorExaminePage } from "@/features/doctor/consultation/DoctorExaminePage";
import type {
  Appointment,
  ConsultationLookup,
  CompletedRecord,
} from "../doctor-workspace.types";

export interface DoctorConsultationSectionProps {
  patientCode?: string;
  setPatientCode?: (code: string) => void;
  patientLookup?: Appointment | null;
  setPatientLookup?: (lookup: Appointment | null) => void;
  lookupDetails?: ConsultationLookup | null;
  setLookupDetails?: (details: ConsultationLookup | null) => void;
  diagnosis?: string;
  setDiagnosis?: (d: string) => void;
  prescription?: string;
  setPrescription?: (p: string) => void;
  completedRecord?: CompletedRecord | null;
  setCompletedRecord?: (record: CompletedRecord | null) => void;
}

export function DoctorConsultationSection(
  _props: DoctorConsultationSectionProps,
) {
  const { appointmentId } = useParams<{ appointmentId?: string }>();

  if (appointmentId) {
    return <DoctorExaminePage appointmentId={Number(appointmentId)} />;
  }

  return <DoctorConsultationPage />;
}
