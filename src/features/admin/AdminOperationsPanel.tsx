import type { OperationsSection } from "./operations/operations.types";
import { AdminScheduleSection } from "./operations/components/AdminScheduleSection";
import { AdminCatalogSection } from "./operations/components/AdminCatalogSection";
import { AdminPatientsSection } from "./operations/components/AdminPatientsSection";

export type { OperationsSection };

export function AdminOperationsPanel({
  activeSection,
}: {
  activeSection: OperationsSection;
}) {
  if (activeSection === "schedule") {
    return <AdminScheduleSection />;
  }

  if (activeSection === "catalog") {
    return <AdminCatalogSection />;
  }

  return <AdminPatientsSection />;
}
