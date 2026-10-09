import type { ReactNode } from "react";
import { Header } from "@/features/landing/components/header/Header";
import styles from "./PatientPortal.module.css";

export function PatientPortal({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

