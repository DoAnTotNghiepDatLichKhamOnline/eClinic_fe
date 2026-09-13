import { useEffect, useState } from 'react'
import { ActiveHubProvider } from '@/context/ActiveHubContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { LandingPage } from '@/features/landing'
import { LoginPage } from '@/features/auth/LoginPage'

function App() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <LanguageProvider>
      <ActiveHubProvider>
        {route === '#login' ? <LoginPage /> : <LandingPage />}
      </ActiveHubProvider>
    </LanguageProvider>
  )
}

export default App
