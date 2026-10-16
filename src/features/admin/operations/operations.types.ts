import type { AdminSection } from "../AdminSidebar";

export type OperationsSection = Extract<
  AdminSection,
  "schedule" | "catalog" | "patients"
>;

export type CatalogTab = "specialties" | "clinics" | "medicines";

export interface PendingVerificationItem {
  id?: number;
  hoSo?: {
    id: number;
    hoTen: string | null;
  };
  taiKhoan?: {
    hoTen: string;
    email: string;
  };
  khopHoTen?: boolean;
  khopSoDienThoai?: boolean;
}

export interface PatientDetailModalProps {
  patientId: number;
  onClose: () => void;
  onSaved?: (message: string) => void;
  onError?: (cause: unknown) => void;
}
