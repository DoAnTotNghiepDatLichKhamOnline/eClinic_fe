import { DoctorConsultationPage } from "@/features/doctor/consultation/DoctorConsultationPage";
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
  return <DoctorConsultationPage />;
}
