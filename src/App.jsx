import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { AppProvider, useApp } from "./lib/AppContext.jsx";
import Navigation from "./assets/Components/Navigation.jsx";
import MovementForm from "./assets/Components/MovementForm.jsx";
import Toast from "./assets/Components/Toast.jsx";

import Homepage from "./assets/Pages/Homepage.jsx";
import ActivityPage from "./assets/Pages/ActivityPage.jsx";
import StatsPage from "./assets/Pages/StatsPage.jsx";
import ProfilePage from "./assets/Pages/ProfilePage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Shell() {
  const { form } = useApp();
  return (
    <>
      <ScrollToTop />
      <Navigation />
      <main className="min-h-screen px-4 pt-6 pb-32 md:pl-64 md:pr-8 md:pt-10 md:pb-12">
        <div className="mx-auto w-full max-w-5xl">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      {form.open && <MovementForm />}
      <Toast />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
