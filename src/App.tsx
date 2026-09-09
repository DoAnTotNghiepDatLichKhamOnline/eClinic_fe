import { ActiveHubProvider } from '@/context/ActiveHubContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { LandingPage } from '@/features/landing'

function App() {
  return (
    <LanguageProvider>
      <ActiveHubProvider>
        <LandingPage />
      </ActiveHubProvider>
    </LanguageProvider>
  )
}

export default App
