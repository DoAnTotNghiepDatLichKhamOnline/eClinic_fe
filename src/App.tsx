import { useEffect, useState } from 'react'
import { ActiveHubProvider } from '@/shared/context/ActiveHubContext'
import { LanguageProvider } from '@/shared/context/LanguageContext'
import { AuthProvider } from '@/shared/context/AuthContext'
import { LandingPage } from '@/features/landing'
import { LoginPagePatient } from '@/features/auth/login-patient/LoginPagePatient'
import { LoginPageDoctor } from '@/features/auth/login-doctor/LoginPageDoctor'
import { LoginPageAdmin } from '@/features/auth/login-admin/LoginPageAdmin'
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
    if (route === '#login-staff' || route === '#login-doctor') {
      return <LoginPageDoctor />
    }
    if (route === '#login-admin') {
      return <LoginPageAdmin />
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
