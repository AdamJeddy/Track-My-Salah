import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BottomNav } from './components/Navigation';
import { InstallPrompt } from './components/InstallPrompt';
import { TrackerPage, StatsPage, SettingsPage, OnboardingPage } from './pages';
import { getGenderPreference, getOnboardingStatus } from './services/localStorageService';
import { applyNotificationScheduler, getNotificationSettings } from './services/notificationService';

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const hideNav = location.pathname === '/';

  useEffect(() => {
    let active = true;

    async function checkOnboarding() {
      const [completedFlag, gender] = await Promise.all([
        getOnboardingStatus(),
        getGenderPreference(),
      ]);

      // Apply notification scheduler separately to avoid blocking onboarding flow
      getNotificationSettings()
        .then((settings) => applyNotificationScheduler(settings))
        .catch((error) => console.error('Notification scheduler init failed:', error));

      if (!active) return;

      const isOnboarded = completedFlag || Boolean(gender);

      setOnboarded(isOnboarded);

      if (location.pathname === '/' && isOnboarded) {
        navigate('/tracker', { replace: true });
      }
    }

    checkOnboarding();

    return () => {
      active = false;
    };
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <main className={hideNav ? '' : 'pb-16'}>
        <Routes>
          <Route
            path="/"
            element={
              onboarded === null ? null : onboarded ? (
                <Navigate to="/tracker" replace />
              ) : (
                <OnboardingPage />
              )
            }
          />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
      {!hideNav && <InstallPrompt />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
