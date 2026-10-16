import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/shared/context/AuthContext";
import { userProfileService } from "@/services/identity/userProfileService";
import { doctorService } from "@/services/catalog/doctorService";
import styles from "../DoctorWorkspace.module.css";

export function DoctorProfileSection() {
  const { lang } = useLanguage();
  const { user } = useAuth();

  const doctorAccountQuery = useQuery({
    queryKey: ["identity", "doctor-profile"],
    queryFn: () => userProfileService.getHoSoCaNhan(),
  });

  const doctorId = doctorAccountQuery.data?.duLieu?.bacSi?.id;

  const doctorProfileQuery = useQuery({
    queryKey: ["catalog", "doctor-profile", doctorId],
    queryFn: () => doctorService.getChiTietBacSi(doctorId!),
    enabled: Boolean(doctorId),
  });

  const doctorProfile = doctorProfileQuery.data?.duLieu;
  const doctorAccount = doctorAccountQuery.data?.duLieu;

  return (
    <section className={styles.workspace}>
      <div className={styles.pageHeading}>
        <div>
          <h1>{lang === "vi" ? "Hồ sơ cá nhân" : "Doctor Profile"}</h1>
          <p>
            {lang === "vi"
              ? "Thông tin do Quản trị viên quản lý. Chế độ chỉ xem."
              : "Managed by your administrator. Read-only profile."}
          </p>
        </div>
      </div>
      <section className={styles.panel}>
        <div className={styles.profileHeading}>
          <span className={styles.profileAvatar}>
            {(user?.name || "BS")
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </span>
          <div>
            <h2>
              {doctorAccount?.hoTen ||
                user?.name ||
                (lang === "vi" ? "Bác sĩ eClinic" : "eClinic Doctor")}
            </h2>
            <span>{lang === "vi" ? "Hồ sơ bác sĩ" : "Doctor profile"}</span>
          </div>
        </div>
        <dl className={styles.profileGrid}>
          <div>
            <dt>{lang === "vi" ? "Email" : "Email"}</dt>
            <dd>{doctorAccount?.email || user?.email || "—"}</dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Điện thoại" : "Phone"}</dt>
            <dd>{doctorAccount?.soDienThoai || user?.phone || "—"}</dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Chuyên khoa" : "Specialty"}</dt>
            <dd>
              {doctorProfile?.tenChuyenKhoa ||
                doctorAccount?.bacSi?.tenChuyenKhoa ||
                user?.specialty ||
                (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Trình độ / Học vị" : "Qualification"}</dt>
            <dd>
              {doctorProfile?.hocVi ||
                doctorAccount?.bacSi?.hocVi ||
                user?.degree ||
                (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
            </dd>
          </div>
          <div>
            <dt>{lang === "vi" ? "Phòng khám công tác" : "Clinic"}</dt>
            <dd>
              {user?.clinic ||
                (lang === "vi" ? "Chưa cập nhật" : "Not provided")}
            </dd>
          </div>
        </dl>
        {doctorProfile?.gioiThieuNgan && (
          <p className={styles.readOnlyNote}>{doctorProfile.gioiThieuNgan}</p>
        )}
        {doctorProfile?.tieuSu && (
          <p className={styles.readOnlyNote}>{doctorProfile.tieuSu}</p>
        )}
        <p className={styles.readOnlyNote}>
          {lang === "vi"
            ? "Muốn cập nhật thông tin? Vui lòng liên hệ Quản trị viên."
            : "Contact your administrator to update this information."}
        </p>
      </section>
    </section>
  );
}
