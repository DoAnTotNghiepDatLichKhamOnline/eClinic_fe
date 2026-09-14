import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { Footer } from '@/features/landing/components/footer/Footer'
import styles from './DoctorDashboardPage.module.css'

export function DoctorDashboardPage() {
  const { lang } = useLanguage()
  const { user, logout } = useAuth()

  const appointments = [
    {
      id: 'AP-101',
      time: '08:30 - 09:00',
      patientName: 'Nguyễn Thị Hoa',
      age: 34,
      reason: 'Khám tim mạch định kỳ',
      status: 'waiting',
    },
    {
      id: 'AP-102',
      time: '09:15 - 09:45',
      patientName: 'Trần Văn Minh',
      age: 45,
      reason: 'Tái khám huyết áp',
      status: 'progress',
    },
    {
      id: 'AP-103',
      time: '10:00 - 10:30',
      patientName: 'Lê Hoàng Nam',
      age: 28,
      reason: 'Đau ngực nhẹ',
      status: 'done',
    },
    {
      id: 'AP-104',
      time: '10:45 - 11:15',
      patientName: 'Phạm Thu Trang',
      age: 52,
      reason: 'Tư vấn xét nghiệm máu',
      status: 'waiting',
    },
  ]

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.topBar}>
        <div className={styles.topBarRow}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>eClinic Doctor Portal</span>
            <span className={styles.brandTag}>{lang === 'vi' ? 'Bác sĩ chuyên khoa' : 'Specialist Doctor'}</span>
          </div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>👨‍⚕️ {user?.name || 'BS. Nguyễn Văn A'}</span>
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
            {lang === 'vi' ? 'Chào bác sĩ, chúc một ngày làm việc hiệu quả!' : 'Welcome Doctor, have a great day!'}
          </h1>
          <p className={styles.welcomeSub}>
            {lang === 'vi' 
              ? 'Tổng quan lịch khám bệnh và danh sách bệnh nhân chờ trong ngày.' 
              : 'Overview of your appointment schedule and patient waiting list for today.'}
          </p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>8</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Lịch khám hôm nay' : "Today's Appointments"}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>2</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Bệnh nhân chờ khám' : 'Patients Waiting'}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>5</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Đã hoàn thành' : 'Completed Exams'}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>4.9</span>
              <span className={styles.statLabel}>{lang === 'vi' ? 'Đánh giá trung bình' : 'Average Rating'}</span>
            </div>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {lang === 'vi' ? 'Danh sách Bệnh nhân Khám Hôm nay' : "Today's Patient Schedule"}
            </h2>
          </div>

          <table className={styles.patientTable}>
            <thead>
              <tr>
                <th>Mã HS</th>
                <th>Giờ khám</th>
                <th>Tên bệnh nhân</th>
                <th>Tuổi</th>
                <th>Lý do khám</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td><strong>{apt.id}</strong></td>
                  <td>{apt.time}</td>
                  <td><strong>{apt.patientName}</strong></td>
                  <td>{apt.age}</td>
                  <td>{apt.reason}</td>
                  <td>
                    {apt.status === 'waiting' && <span className={`${styles.badge} ${styles.badgeWaiting}`}>⏳ Chờ khám</span>}
                    {apt.status === 'progress' && <span className={`${styles.badge} ${styles.badgeProgress}`}>🩺 Đang khám</span>}
                    {apt.status === 'done' && <span className={`${styles.badge} ${styles.badgeDone}`}>✅ Hoàn thành</span>}
                  </td>
                  <td>
                    <button type="button" className={styles.actionBtn}>
                      {apt.status === 'done' ? 'Xem hồ sơ' : 'Khám bệnh'}
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
