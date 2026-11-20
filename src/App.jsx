import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { AppProvider, useApp } from "./lib/AppContext.jsx";
import Navigation from "./assets/Components/Navigation.jsx";
import MovementForm from "./assets/Components/MovementForm.jsx";
import Toast from "./assets/Components/Toast.jsx";
import { useScrollReveal, useScroll, ScrollProgress, BackToTop } from "./assets/Components/ScrollFX.jsx";

import Homepage from "./assets/Pages/Homepage.jsx";
import ActivityPage from "./assets/Pages/ActivityPage.jsx";
import StatsPage from "./assets/Pages/StatsPage.jsx";
import PlanPage from "./assets/Pages/PlanPage.jsx";
import ProfilePage from "./assets/Pages/ProfilePage.jsx";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}

const isTyping = (el) => el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

// Atajos: N = nuevo movimiento · / = buscar · 1-5 = cambiar de sección · P = privacidad
function useShortcuts() {
  const { openForm, form, setPrivacy } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    const routes = ["/", "/activity", "/stats", "/plan", "/profile"];
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement) || form.open) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const k = e.key.toLowerCase();
      if (k === "n") {
        e.preventDefault();
        openForm();
      } else if (k === "/") {
        e.preventDefault();
        navigate("/activity");
        setTimeout(() => document.getElementById("search-input")?.focus(), 80);
      } else if (k === "p") {
        setPrivacy((p) => !p);
      } else if (/^[1-5]$/.test(k)) {
        navigate(routes[Number(k) - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openForm, form.open, navigate, setPrivacy]);
}

function Shell() {
  const { form } = useApp();
  const location = useLocation();
  const scroll = useScroll();
  useScrollReveal();
  useShortcuts();

  return (
    <>
      <ScrollToTop />
      <ScrollProgress progress={scroll.progress} />
      <Navigation hidden={scroll.down} />
      <main className="min-h-screen px-4 pt-6 pb-32 md:pl-64 md:pr-8 md:pt-10 md:pb-12">
        {/* La key fuerza la animación de entrada en cada cambio de página */}
        <div key={location.pathname} className="page-enter mx-auto w-full max-w-5xl">
          <Routes location={location}>
            <Route path="/" element={<Homepage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <BackToTop visible={scroll.y > 600} navHidden={scroll.down} />
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
