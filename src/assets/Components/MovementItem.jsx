import { useEffect, useRef, useState } from "react";
import { getCategory, formatMoney } from "../../lib/finance";
import { DotsIcon, EditIcon, CopyIcon, TrashIcon, RepeatIcon, AppIcon } from "./Icons";

function MovementItem({ mov, onEdit, onDuplicate, onDelete, showDate = false, compact = false, index }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const cat = getCategory(mov);
  const isIncome = mov.tipo === "Ingreso";
  const date = new Date(mov.fecha);
  const hasActions = onEdit || onDelete;

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => !ref.current?.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div
      ref={ref}
      className={`group relative flex items-center gap-3 rounded-2xl px-2 transition-colors hover:bg-slate-50 ${compact ? "py-2" : "py-2.5"} ${index !== undefined ? "stagger-item" : ""} ${menuOpen ? "z-20" : ""}`}
      style={index !== undefined ? { animationDelay: `${Math.min(index, 12) * 45}ms` } : undefined}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
        style={{ backgroundColor: `${cat.color}1f`, color: cat.color }}
        aria-hidden="true"
      >
        <AppIcon name={cat.icon} className="h-5 w-5" />
      </div>

      <button
        type="button"
        onClick={() => onEdit?.(mov)}
        disabled={!onEdit}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left disabled:cursor-default"
      >
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold">{mov.descripcion}</p>
          <p className="truncate text-xs text-slate-500">
            {cat.name}
            {showDate
              ? ` · ${date.toLocaleDateString("es-AR", { day: "numeric", month: "short" }).replace(".", "")}`
              : ` · ${date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`}
            {mov.isMock && <span className="ml-1.5 rounded bg-slate-100 px-1 py-px text-[10px] font-semibold text-slate-400">demo</span>}
            {mov.recurringId && <span className="ml-1.5 rounded bg-brand-50 px-1 py-px text-[10px] font-semibold text-brand-600"><RepeatIcon className="mr-0.5 inline h-2.5 w-2.5 align-[-1px]" />recurrente</span>}
          </p>
        </div>
        <p className={`num shrink-0 text-[15px] font-extrabold ${isIncome ? "text-income" : "text-ink"}`}>
          {isIncome ? "+" : "−"}
          {formatMoney(mov.monto)}
        </p>
      </button>

      {hasActions && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-ink"
            aria-label="Acciones"
            aria-expanded={menuOpen}
          >
            <DotsIcon className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="animate-pop absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-2xl border border-black/5 bg-white p-1 shadow-xl">
              <MenuButton icon={EditIcon} label="Editar" onClick={() => { setMenuOpen(false); onEdit(mov); }} />
              {onDuplicate && <MenuButton icon={CopyIcon} label="Duplicar" onClick={() => { setMenuOpen(false); onDuplicate(mov); }} />}
              <MenuButton icon={TrashIcon} label="Eliminar" danger onClick={() => { setMenuOpen(false); onDelete(mov); }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold ${danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-100"}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

export default MovementItem;
