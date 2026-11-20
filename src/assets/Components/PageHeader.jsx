import { Link } from "react-router-dom";
import { useApp } from "../../lib/AppContext";

function PageHeader({ eyebrow, title, subtitle, actions, showAvatar = true }) {
  const { profile } = useApp();
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex w-full items-start justify-between gap-3 sm:w-auto">
        <div>
          {eyebrow && <p className="stagger-item text-xs font-bold uppercase tracking-[0.18em] text-brand-500">{eyebrow}</p>}
          <h1 className="stagger-item mt-1 text-[28px] font-extrabold leading-tight tracking-tight md:text-3xl" style={{ animationDelay: "60ms" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="stagger-item mt-1 text-sm text-slate-500" style={{ animationDelay: "120ms" }}>
              {subtitle}
            </p>
          )}
        </div>
        {showAvatar && (
          <Link
            to="/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-400 text-sm font-bold text-snow shadow-md transition active:scale-90 sm:hidden"
            aria-label="Ir al perfil"
          >
            {profile.name.charAt(0).toUpperCase()}
          </Link>
        )}
      </div>
      {actions && (
        <div className="stagger-item flex flex-wrap items-center gap-2" style={{ animationDelay: "160ms" }}>
          {actions}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
