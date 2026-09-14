import { useEffect, useState } from 'react'
import { ActiveHubProvider } from '@/context/ActiveHubContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { LandingPage } from '@/features/landing'
import { LoginPagePatient } from '@/features/auth/LoginPagePatient'
import { LoginPageStaff } from '@/features/auth/LoginPageStaff'

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
    if (route === '#login-staff' || route === '#login-admin' || route === '#login-doctor') {
      return <LoginPageStaff />
    }
    return <LandingPage />
  }

  return (
    <LanguageProvider>
      <ActiveHubProvider>
        {renderPage()}
      </ActiveHubProvider>
    </LanguageProvider>
  )
}

export default App
