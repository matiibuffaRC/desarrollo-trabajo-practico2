import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";

import { AppProvider, useApp } from "./lib/AppContext.jsx";
import Navigation from "./assets/Components/Navigation.jsx";
import Toast from "./assets/Components/Toast.jsx";
import { useScrollReveal, useScroll, ScrollProgress, BackToTop } from "./assets/Components/ScrollFX.jsx";

import Homepage from "./assets/Pages/Homepage.jsx";
// La home va en el bundle inicial; el resto se descarga recién cuando hace falta
const loaders = {
  activity: () => import("./assets/Pages/ActivityPage.jsx"),
  stats: () => import("./assets/Pages/StatsPage.jsx"),
  plan: () => import("./assets/Pages/PlanPage.jsx"),
  profile: () => import("./assets/Pages/ProfilePage.jsx"),
  form: () => import("./assets/Components/MovementForm.jsx"),
};
const ActivityPage = lazy(loaders.activity);
const StatsPage = lazy(loaders.stats);
const PlanPage = lazy(loaders.plan);
const ProfilePage = lazy(loaders.profile);
const MovementForm = lazy(loaders.form);

// Precarga las demás secciones cuando el navegador está ocioso, así navegar sigue siendo instantáneo
function usePrefetch() {
  useEffect(() => {
    const run = () => Object.values(loaders).forEach((load) => load().catch(() => {}));
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(run, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(run, 2500);
    return () => clearTimeout(id);
  }, []);
}

const SITE = "Gestor de gastos";
const META = {
  "/": { title: `${SITE} · Controlá tus finanzas personales`, description: "Registrá ingresos y gastos, controlá tu presupuesto mensual y mirá en qué se va tu plata. Gratis y sin registrarte." },
  "/activity": { title: `Movimientos · ${SITE}`, description: "Buscá, filtrá y exportá todos tus ingresos y gastos en un solo lugar." },
  "/stats": { title: `Estadísticas · ${SITE}`, description: "Gráficos de ingresos vs. gastos, evolución del saldo y gastos por categoría." },
  "/plan": { title: `Planificar · ${SITE}`, description: "Metas de ahorro, presupuestos por categoría y movimientos recurrentes." },
  "/profile": { title: `Perfil · ${SITE}`, description: "Configurá tu perfil, el tema de la app y tus datos." },
};

// Título, descripción y URL canónica según la sección
function useRouteMeta(pathname) {
  useEffect(() => {
    const meta = META[pathname] || META["/"];
    document.title = meta.title;
    const set = (sel, attr, value) => document.querySelector(sel)?.setAttribute(attr, value);
    set('meta[name="description"]', "content", meta.description);
    set('meta[property="og:title"]', "content", meta.title);
    set('meta[property="og:description"]', "content", meta.description);
    set('meta[property="og:url"]', "content", location.origin + pathname);
    set('link[rel="canonical"]', "href", location.origin + pathname);
  }, [pathname]);
}

function PageFallback() {
  return <div className="min-h-[60vh]" aria-busy="true" />;
}

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
  usePrefetch();
  useRouteMeta(location.pathname);

  return (
    <>
      <ScrollToTop />
      <ScrollProgress progress={scroll.progress} />
      <Navigation hidden={scroll.down} />
      <main className="min-h-screen px-4 pt-6 pb-32 md:pl-64 md:pr-8 md:pt-10 md:pb-12">
        {/* La key fuerza la animación de entrada en cada cambio de página */}
        <div key={location.pathname} className="page-enter mx-auto w-full max-w-5xl">
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<Homepage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <BackToTop visible={scroll.y > 600} navHidden={scroll.down} />
      {form.open && (
        <Suspense fallback={null}>
          <MovementForm />
        </Suspense>
      )}
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
