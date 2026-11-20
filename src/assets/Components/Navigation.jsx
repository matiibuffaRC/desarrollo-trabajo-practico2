import { NavLink } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import { HomeIcon, ListIcon, ChartIcon, UserIcon, PlusIcon, WalletIcon } from "./Icons";

const LINKS = [
  { to: "/", label: "Inicio", Icon: HomeIcon, end: true },
  { to: "/activity", label: "Movimientos", Icon: ListIcon },
  { to: "/stats", label: "Estadísticas", Icon: ChartIcon },
  { to: "/profile", label: "Perfil", Icon: UserIcon },
];

function Navigation() {
  const { openForm, profile } = useApp();

  return (
    <>
      {/* Desktop: barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-black/5 bg-white/80 px-4 py-8 backdrop-blur-xl md:flex">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white">
            <WalletIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[15px] font-extrabold leading-tight">Billetera</p>
            <p className="text-xs text-slate-500">Gestor de gastos</p>
          </div>
        </div>

        <button
          onClick={() => openForm()}
          className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(91,76,255,0.35)] transition hover:bg-brand-600 active:scale-[0.98]"
        >
          <PlusIcon className="h-4 w-4" /> Nuevo movimiento
        </button>

        <nav className="flex flex-col gap-1">
          {LINKS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-50 text-brand-600" : "text-slate-500 hover:bg-slate-100 hover:text-ink"
                }`
              }
            >
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-400 text-sm font-bold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{profile.name}</p>
            <p className="truncate text-xs text-slate-500">{profile.email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile: menú flotante inferior */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:hidden" aria-label="Navegación principal">
        <div className="relative mx-auto flex max-w-md items-center justify-between rounded-[28px] border border-white/60 bg-white/85 px-2 py-2 shadow-[0_12px_40px_rgba(18,18,26,0.16)] backdrop-blur-xl">
          {LINKS.slice(0, 2).map((l) => (
            <MobileItem key={l.to} {...l} />
          ))}

          <div className="w-16 shrink-0" />
          <button
            onClick={() => openForm()}
            aria-label="Nuevo movimiento"
            className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-[18%] items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_10px_24px_rgba(91,76,255,0.45)] ring-4 ring-[var(--bg-page)] transition active:scale-90"
          >
            <PlusIcon className="h-6 w-6" />
          </button>

          {LINKS.slice(2).map((l) => (
            <MobileItem key={l.to} {...l} />
          ))}
        </div>
      </nav>
    </>
  );
}

function MobileItem({ to, label, Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-semibold transition ${
          isActive ? "text-brand-600" : "text-slate-400"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${isActive ? "bg-brand-50" : ""}`}>
            <Icon className="h-[22px] w-[22px]" />
          </span>
          {label === "Estadísticas" ? "Stats" : label}
        </>
      )}
    </NavLink>
  );
}

export default Navigation;
