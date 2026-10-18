import { useState } from "react";
import type { DoctorSection } from "./DoctorSidebar";
import {
  DoctorScheduleSection,
  DoctorConsultationSection,
  DoctorProfileSection,
  type Appointment,
  type ConsultationLookup,
  type CompletedRecord,
} from "./workspace";

export interface DoctorWorkspaceProps {
  activeSection: DoctorSection;
}

export function DoctorWorkspace({ activeSection }: DoctorWorkspaceProps) {
  const [patientCode, setPatientCode] = useState("");
  const [patientLookup, setPatientLookup] = useState<Appointment | null>(null);
  const [lookupDetails, setLookupDetails] = useState<ConsultationLookup | null>(
    null,
  );
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [completedRecord, setCompletedRecord] =
    useState<CompletedRecord | null>(null);

  if (activeSection === "schedule") {
    return <DoctorScheduleSection />;
  }

  if (activeSection === "consultation") {
    return (
      <DoctorConsultationSection
        patientCode={patientCode}
        setPatientCode={setPatientCode}
        patientLookup={patientLookup}
        setPatientLookup={setPatientLookup}
        lookupDetails={lookupDetails}
        setLookupDetails={setLookupDetails}
        diagnosis={diagnosis}
        setDiagnosis={setDiagnosis}
        prescription={prescription}
        setPrescription={setPrescription}
        completedRecord={completedRecord}
        setCompletedRecord={setCompletedRecord}
      />
    );
  }

  return <DoctorProfileSection />;
}
