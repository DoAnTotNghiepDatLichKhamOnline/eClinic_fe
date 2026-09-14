import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { Footer } from '@/features/landing/components/footer/Footer'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardPage() {
  const { lang } = useLanguage()
  const { user, logout } = useAuth()

  const doctors = [
    { id: 'DOC-01', name: 'BS. Mattias Larsson', specialty: 'Tim mạch', status: 'Hoạt động', totalBookings: 142 },
    { id: 'DOC-02', name: 'BS. Rafi Kot', specialty: 'Nhi khoa', status: 'Hoạt động', totalBookings: 98 },
    { id: 'DOC-03', name: 'BS. Nguyễn Văn A', specialty: 'Nội khoa', status: 'Hoạt động', totalBookings: 215 },
    { id: 'DOC-04', name: 'BS. Trần Thị Bình', specialty: 'Sản phụ khoa', status: 'Hoạt động', totalBookings: 87 },
  ]

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.topBar}>
        <div className={styles.topBarRow}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>eClinic Admin Control Panel</span>
            <span className={styles.brandTag}>{lang === 'vi' ? 'Quản trị hệ thống' : 'System Admin'}</span>
          </div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>🛡️ {user?.name || 'Admin eClinic'}</span>
            <button
              type="button"
              className={styles.backHomeBtn}
              onClick={() => {
                window.location.hash = ''
              }}
            >
              {lang === 'vi' ? 'Về Trang chủ' : 'Home'}
            </button>
            <button
              type="button"
              className={styles.backHomeBtn}
              onClick={() => {
                logout()
                window.location.hash = ''
              }}
            >
              {lang === 'vi' ? 'Đăng xuất' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.welcomeHeader}>
          <h1 className={styles.welcomeTitle}>
            {lang === 'vi' ? 'Bảng Điều Hành Hệ Thống eClinic' : 'eClinic System Management Dashboard'}
          </h1>
          <p className={styles.welcomeSub}>
            {lang === 'vi' 
              ? 'Quản lý tài khoản bác sĩ, lịch đặt khám và cấu hình hệ thống.' 
              : 'Manage doctors, appointment bookings, and system configurations.'}
          </p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍⚕️</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>24</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Bác sĩ hoạt động' : 'Active Doctors'}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>1,420</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Bệnh nhân đăng ký' : 'Registered Patients'}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>312</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Lượt khám tháng này' : 'Monthly Bookings'}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>99.8%</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Uptime Hệ thống' : 'System Uptime'}</span>
            </div>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {lang === 'vi' ? 'Quản lý Danh sách Bác sĩ' : 'Doctor Directory Management'}
            </h2>
            <button type="button" className={styles.actionBtn}>
              {lang === 'vi' ? '+ Thêm Bác sĩ Mới' : '+ Add New Doctor'}
            </button>
          </div>

          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Mã BS</th>
                <th>Họ và Tên</th>
                <th>Chuyên khoa</th>
                <th>Lượt khám đã thực hiện</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id}>
                  <td><strong>{doc.id}</strong></td>
                  <td><strong>{doc.name}</strong></td>
                  <td>{doc.specialty}</td>
                  <td>{doc.totalBookings} ca</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeActive}`}>● {doc.status}</span>
                  </td>
                  <td>
                    <button type="button" className={styles.actionBtn}>
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  )
}
