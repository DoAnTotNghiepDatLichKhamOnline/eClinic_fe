import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  specialtyService,
  clinicService,
  medicineService,
} from "@/services/catalog";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getApiErrorMessage } from "@/utils/apiError";
import type {
  ThuocResponse,
  PhongKhamQuanTriResponse,
  ChuyenKhoaResponse,
} from "@/types/catalog.type";
import type { CatalogTab } from "../operations.types";
import styles from "../../AdminDashboardPage.module.css";
import { CATALOG_QUERY_KEYS } from "./catalog/catalog.constants";
import { SpecialtiesTab } from "./catalog/SpecialtiesTab";
import { ClinicsTab } from "./catalog/ClinicsTab";
import { MedicinesTab } from "./catalog/MedicinesTab";
import { AddSpecialtyModal } from "./catalog/modals/AddSpecialtyModal";
import { EditSpecialtyModal } from "./catalog/modals/EditSpecialtyModal";
import { AddClinicModal } from "./catalog/modals/AddClinicModal";
import { EditClinicModal } from "./catalog/modals/EditClinicModal";
import { AddMedicineModal } from "./catalog/modals/AddMedicineModal";
import { EditMedicineModal } from "./catalog/modals/EditMedicineModal";

export function AdminCatalogSection() {
  const { lang } = useLanguage();
  const vi = lang === "vi";
  const client = useQueryClient();
  const [tab, setTab] = useState<CatalogTab>("specialties");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Edit states for modals
  const [editingSpecialty, setEditingSpecialty] =
    useState<ChuyenKhoaResponse | null>(null);
  const [editingClinic, setEditingClinic] =
    useState<PhongKhamQuanTriResponse | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<ThuocResponse | null>(
    null,
  );

  // Add modal states
  const [isAddSpecialtyOpen, setIsAddSpecialtyOpen] = useState(false);
  const [isAddClinicOpen, setIsAddClinicOpen] = useState(false);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);

  const specialtiesQuery = useQuery({
    queryKey: CATALOG_QUERY_KEYS.adminSpecialties,
    queryFn: () =>
      specialtyService.getDanhSachChuyenKhoaQuanTri({
        trang: 0,
        kichThuoc: 100,
      }),
  });

  const clinicsQuery = useQuery({
    queryKey: [...CATALOG_QUERY_KEYS.adminClinics, tab],
    queryFn: () =>
      clinicService.getDanhSachPhongKhamQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: tab === "clinics",
  });

  const medicinesQuery = useQuery({
    queryKey: CATALOG_QUERY_KEYS.adminMedicines,
    queryFn: () =>
      medicineService.getDanhSachThuocQuanTri({ trang: 0, kichThuoc: 100 }),
    enabled: tab === "medicines",
  });

  const showFailure = (cause: unknown) => {
    setError(
      getApiErrorMessage(
        cause,
        vi ? "Thao tác thất bại." : "The operation failed.",
      ),
    );
    setMessage("");
  };

  const finish = async (text: string, keys: readonly (readonly string[])[]) => {
    setError("");
    setMessage(text);
    await Promise.all(
      keys.map((queryKey) => client.invalidateQueries({ queryKey })),
    );
  };

  const specialtiesList = specialtiesQuery.data?.duLieu?.noiDung ?? [];
  const clinicsList = clinicsQuery.data?.duLieu?.noiDung ?? [];
  const medicinesList = medicinesQuery.data?.duLieu?.noiDung ?? [];

  return (
    <section className={styles.sectionCard}>
      {error && (
        <p role="alert" className="mb-3 text-sm text-rose-700 font-semibold">
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="mb-3 text-sm text-emerald-800 font-semibold"
        >
          {message}
        </p>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-2 border-b border-slate-200">
        {(["specialties", "clinics", "medicines"] as const).map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={tab === value}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === value
                ? "border-emerald-800 text-emerald-900 bg-emerald-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setTab(value)}
          >
            {value === "specialties"
              ? vi
                ? "Chuyên khoa"
                : "Specialties"
              : value === "clinics"
                ? vi
                  ? "Phòng khám"
                  : "Clinics"
                : vi
                  ? "Danh mục thuốc"
                  : "Medicines"}
          </button>
        ))}
      </div>

      {/* TAB 1: SPECIALTIES */}
      {tab === "specialties" && (
        <SpecialtiesTab
          specialties={specialtiesList}
          isLoading={specialtiesQuery.isLoading}
          onOpenAddModal={() => setIsAddSpecialtyOpen(true)}
          onSelectEdit={(item) => setEditingSpecialty(item)}
        />
      )}

      {/* TAB 2: CLINICS */}
      {tab === "clinics" && (
        <ClinicsTab
          clinics={clinicsList}
          isLoading={clinicsQuery.isLoading}
          onOpenAddModal={() => setIsAddClinicOpen(true)}
          onSelectEdit={(clinic) => setEditingClinic(clinic)}
          onDeactivate={(id) => {
            void clinicService
              .ngungHoatDongPhongKham(id)
              .then(() =>
                finish(
                  vi ? "Đã ngừng hoạt động phòng khám" : "Clinic deactivated",
                  [
                    CATALOG_QUERY_KEYS.adminClinics,
                    CATALOG_QUERY_KEYS.publicClinics,
                  ],
                ),
              )
              .catch(showFailure);
          }}
          onActivate={(id) => {
            void clinicService
              .hoatDongLaiPhongKham(id)
              .then(() =>
                finish(
                  vi ? "Đã kích hoạt lại phòng khám" : "Clinic activated",
                  [
                    CATALOG_QUERY_KEYS.adminClinics,
                    CATALOG_QUERY_KEYS.publicClinics,
                  ],
                ),
              )
              .catch(showFailure);
          }}
        />
      )}

      {/* TAB 3: MEDICINES */}
      {tab === "medicines" && (
        <MedicinesTab
          medicines={medicinesList}
          isLoading={medicinesQuery.isLoading}
          onOpenAddModal={() => setIsAddMedicineOpen(true)}
          onSelectEdit={(medicine) => setEditingMedicine(medicine)}
          onVerify={(id) => {
            void medicineService
              .xacMinhThuoc(id)
              .then(() =>
                finish(
                  vi
                    ? "Đã xác minh thuốc vào danh mục chính thức"
                    : "Medicine verified",
                  [CATALOG_QUERY_KEYS.adminMedicines],
                ),
              )
              .catch(showFailure);
          }}
          onDisable={(id) => {
            void medicineService
              .ngungDungThuoc(id)
              .then(() =>
                finish(vi ? "Đã ngừng dùng thuốc" : "Medicine disabled", [
                  CATALOG_QUERY_KEYS.adminMedicines,
                ]),
              )
              .catch(showFailure);
          }}
          onReactivate={(id) => {
            void medicineService
              .dungLaiThuoc(id)
              .then(() =>
                finish(
                  vi ? "Đã kích hoạt dùng lại thuốc" : "Medicine reactivated",
                  [CATALOG_QUERY_KEYS.adminMedicines],
                ),
              )
              .catch(showFailure);
          }}
        />
      )}

      {/* SPECIALTY MODALS */}
      <AddSpecialtyModal
        isOpen={isAddSpecialtyOpen}
        onClose={() => setIsAddSpecialtyOpen(false)}
        onSuccess={async (text) => {
          await finish(text, [
            CATALOG_QUERY_KEYS.adminSpecialties,
            CATALOG_QUERY_KEYS.publicSpecialties,
          ]);
        }}
        onError={(err) => {
          setError(err);
          setMessage("");
        }}
      />
      <EditSpecialtyModal
        specialty={editingSpecialty}
        onClose={() => setEditingSpecialty(null)}
        onSuccess={async (text) => {
          await finish(text, [
            CATALOG_QUERY_KEYS.adminSpecialties,
            CATALOG_QUERY_KEYS.publicSpecialties,
          ]);
        }}
        onError={(err) => {
          setError(err);
          setMessage("");
        }}
      />

      {/* CLINIC MODALS */}
      <AddClinicModal
        isOpen={isAddClinicOpen}
        specialties={specialtiesList}
        onClose={() => setIsAddClinicOpen(false)}
        onSuccess={async (text) => {
          await finish(text, [
            CATALOG_QUERY_KEYS.adminClinics,
            CATALOG_QUERY_KEYS.publicClinics,
          ]);
        }}
        onError={(err) => {
          setError(err);
          setMessage("");
        }}
      />
      <EditClinicModal
        clinic={editingClinic}
        specialties={specialtiesList}
        onClose={() => setEditingClinic(null)}
        onSuccess={async (text) => {
          await finish(text, [
            CATALOG_QUERY_KEYS.adminClinics,
            CATALOG_QUERY_KEYS.publicClinics,
          ]);
        }}
        onError={(err) => {
          setError(err);
          setMessage("");
        }}
      />

      {/* MEDICINE MODALS */}
      <AddMedicineModal
        isOpen={isAddMedicineOpen}
        onClose={() => setIsAddMedicineOpen(false)}
        onSuccess={async (text) => {
          await finish(text, [CATALOG_QUERY_KEYS.adminMedicines]);
        }}
        onError={(err) => {
          setError(err);
          setMessage("");
        }}
      />
      <EditMedicineModal
        medicine={editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSuccess={async (text) => {
          await finish(text, [CATALOG_QUERY_KEYS.adminMedicines]);
        }}
        onError={(err) => {
          setError(err);
          setMessage("");
        }}
      />
    </section>
  );
}
