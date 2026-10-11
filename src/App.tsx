import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveHubProvider } from '@/shared/context/ActiveHubContext';
import { LanguageProvider } from '@/shared/context/LanguageContext';
import { AuthProvider } from '@/shared/context/AuthContext';
import { AppRouter } from '@/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 phút
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ActiveHubProvider>
            {/* Toàn bộ hệ thống định tuyến nằm ở đây */}
            <AppRouter />
          </ActiveHubProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;