import { ActiveHubProvider } from '@/shared/context/ActiveHubContext';
import { LanguageProvider } from '@/shared/context/LanguageContext';
import { AuthProvider } from '@/shared/context/AuthContext';
import { AppRouter } from '@/routes';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ActiveHubProvider>
          {/* Toàn bộ hệ thống định tuyến nằm ở đây */}
          <AppRouter />
        </ActiveHubProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;