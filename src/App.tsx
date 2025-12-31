import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BottomNav } from './components/Navigation';
import { TrackerPage, StatsPage, SettingsPage, OnboardingPage } from './pages';

function AppShell() {
  const location = useLocation();
  const hideNav = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <main className={hideNav ? '' : 'pb-16'}>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
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
