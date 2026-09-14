import { useEffect, useState } from 'react'
import { ActiveHubProvider } from '@/context/ActiveHubContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { LandingPage } from '@/features/landing'
import { LoginPagePatient } from '@/features/auth/LoginPagePatient'
import { LoginPageStaff } from '@/features/auth/LoginPageStaff'
import { DoctorDashboardPage } from '@/features/doctor/DoctorDashboardPage'
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage'

function App() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const renderPage = () => {
    if (route === '#login' || route === '#login-patient') {
      return <LoginPagePatient />
    }
    if (route === '#login-staff') {
      return <LoginPageStaff />
    }
    if (route === '#doctor' || route === '#doctor-dashboard') {
      return <DoctorDashboardPage />
    }
    if (route === '#admin' || route === '#admin-dashboard') {
      return <AdminDashboardPage />
    }
    return <LandingPage />
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <ActiveHubProvider>
          {renderPage()}
        </ActiveHubProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
