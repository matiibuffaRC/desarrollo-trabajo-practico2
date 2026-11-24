import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import { HomeIcon, ListIcon, ChartIcon, UserIcon, PlusIcon, WalletIcon, TargetIcon, SunIcon, MoonIcon, EyeIcon, EyeOffIcon } from "./Icons";

const LINKS = [
  { to: "/", label: "Inicio", short: "Inicio", Icon: HomeIcon, end: true },
  { to: "/activity", label: "Movimientos", short: "Movim.", Icon: ListIcon },
  { to: "/stats", label: "Estadísticas", short: "Stats", Icon: ChartIcon },
  { to: "/plan", label: "Planificar", short: "Planificar", Icon: TargetIcon },
  { to: "/profile", label: "Perfil", short: "Perfil", Icon: UserIcon },
];

const MOBILE_LINKS = LINKS.slice(0, 4); // Perfil se abre desde el avatar

const activeIndex = (links, pathname) =>
  links.findIndex((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)));

// Mide la posición del link activo para deslizar el indicador hasta ahí.
function useIndicator(links) {
  const { pathname } = useLocation();
  const refs = useRef([]);
  const [box, setBox] = useState(null);
  const idx = activeIndex(links, pathname);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[idx];
      setBox(el ? { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [idx]);

  return { refs, box, idx };
}

function Navigation({ hidden = false }) {
  const { openForm, profile, isDark, setTheme, privacy, setPrivacy, movements } = useApp();
  const desk = useIndicator(LINKS);
  const mob = useIndicator(MOBILE_LINKS);

  return (
    <>
      {/* Desktop: barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[var(--line)] bg-white/80 px-4 py-8 backdrop-blur-xl md:flex">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400 text-snow shadow-[0_8px_20px_rgba(26, 143, 227,0.35)]">
            <WalletIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[15px] font-extrabold leading-tight">Billetera</p>
            <p className="text-xs text-slate-500">Gestor de gastos</p>
          </div>
        </div>

        <button
          onClick={() => openForm()}
          className={`group mb-6 flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-bold text-snow shadow-[0_10px_24px_rgba(26, 143, 227,0.35)] transition hover:-translate-y-0.5 hover:bg-brand-600 active:scale-[0.98] ${
            movements.length === 0 ? "animate-pulse-ring" : ""
          }`}
        >
          <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Nuevo movimiento
          <kbd className="ml-1 rounded-md bg-white/20 px-1.5 text-[10px] font-bold">N</kbd>
        </button>

        <nav className="relative flex flex-col gap-1">
          {desk.box && (
            <span
              className="absolute left-0 right-0 rounded-xl bg-brand-50 transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1.15)]"
              style={{ top: desk.box.top, height: desk.box.height }}
              aria-hidden="true"
            />
          )}
          {LINKS.map(({ to, label, Icon, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              ref={(el) => (desk.refs.current[i] = el)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "text-brand-600" : "text-slate-500 hover:bg-slate-100/70 hover:text-ink"
                }`
              }
            >
              <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              {label}
              <span className="ml-auto text-[10px] font-bold text-slate-300 opacity-0 transition group-hover:opacity-100">{i + 1}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-ink"
              title="Cambiar tema"
            >
              <span key={isDark ? "d" : "l"} className="animate-pop">
                {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              </span>
              {isDark ? "Claro" : "Oscuro"}
            </button>
            <button
              onClick={() => setPrivacy((p) => !p)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition hover:bg-white ${privacy ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-ink"}`}
              title="Ocultar montos (P)"
            >
              {privacy ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              Montos
            </button>
          </div>

          <Link to="/profile" className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-sky-400 text-sm font-bold text-snow">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{profile.name}</p>
              <p className="truncate text-xs text-slate-500">{profile.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile: menú flotante inferior (se esconde al bajar) */}
      <nav
        className={`safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-transform duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1)] md:hidden ${
          hidden ? "translate-y-[140%]" : "translate-y-0"
        }`}
        aria-label="Navegación principal"
      >
        <div className="relative mx-auto flex max-w-md items-center justify-between rounded-[28px] border border-[var(--line)] bg-white/85 px-2 py-2 shadow-[0_12px_40px_rgba(18,18,26,0.16)] backdrop-blur-xl">
          {mob.box && (
            <span
              className="absolute rounded-2xl bg-brand-50 transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1.2)]"
              style={{ left: mob.box.left, top: mob.box.top, width: mob.box.width, height: mob.box.height }}
              aria-hidden="true"
            />
          )}
          {MOBILE_LINKS.slice(0, 2).map((l, i) => (
            <MobileItem key={l.to} {...l} innerRef={(el) => (mob.refs.current[i] = el)} />
          ))}

          <div className="w-16 shrink-0" />
          <button
            onClick={() => openForm()}
            aria-label="Nuevo movimiento"
            className={`absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-[18%] items-center justify-center rounded-full bg-brand-500 text-snow shadow-[0_10px_24px_rgba(26, 143, 227,0.45)] ring-4 ring-[var(--bg-page)] transition active:scale-90 ${
              movements.length === 0 ? "animate-pulse-ring" : ""
            }`}
          >
            <PlusIcon className="h-6 w-6" />
          </button>

          {MOBILE_LINKS.slice(2).map((l, i) => (
            <MobileItem key={l.to} {...l} innerRef={(el) => (mob.refs.current[i + 2] = el)} />
          ))}
        </div>
      </nav>
    </>
  );
}

function MobileItem({ to, short, Icon, end, innerRef }) {
  return (
    <NavLink
      to={to}
      end={end}
      ref={innerRef}
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-semibold transition-colors ${
          isActive ? "text-brand-600" : "text-slate-400"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`flex h-7 items-center justify-center transition-transform duration-300 ${isActive ? "-translate-y-0.5 scale-110" : ""}`}>
            <Icon className="h-[22px] w-[22px]" />
          </span>
          {short}
        </>
      )}
    </NavLink>
  );
}

export default Navigation;
