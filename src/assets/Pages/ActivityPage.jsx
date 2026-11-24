import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatMoney,
  formatCompact,
  sumBy,
  startOfDay,
  endOfDay,
  dayLabel,
  signedAmount,
  exportCSV,
  fromInputDate,
} from "../../lib/finance";
import PageHeader from "../Components/PageHeader";
import MovementItem from "../Components/MovementItem";
import Pagination from "../Components/Pagination";
import ConfirmDialog from "../Components/ConfirmDialog";
import AnimatedNumber from "../Components/AnimatedNumber";
import { SearchIcon, FilterIcon, XIcon, DownloadIcon, TrashIcon, ChevronDown, AppIcon } from "../Components/Icons";

const PERIODS = [
  { id: "todo", label: "Todo" },
  { id: "hoy", label: "Hoy" },
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "mes", label: "Este mes" },
  { id: "mes-pasado", label: "Mes pasado" },
  { id: "custom", label: "Personalizado" },
];

const SORTS = [
  { id: "fecha_desc", label: "Más recientes" },
  { id: "fecha_asc", label: "Más antiguos" },
  { id: "monto_desc", label: "Mayor monto" },
  { id: "monto_asc", label: "Menor monto" },
  { id: "alfa", label: "A → Z" },
];

const DEFAULTS = { q: "", tipo: "todos", cat: "", periodo: "todo", desde: "", hasta: "", min: "", max: "", orden: "fecha_desc", page: "1", size: "10" };

function periodRange(periodo, desde, hasta) {
  const now = new Date();
  switch (periodo) {
    case "hoy":
      return [startOfDay(now), endOfDay(now)];
    case "7d": {
      const d = startOfDay(now);
      d.setDate(d.getDate() - 6);
      return [d, endOfDay(now)];
    }
    case "30d": {
      const d = startOfDay(now);
      d.setDate(d.getDate() - 29);
      return [d, endOfDay(now)];
    }
    case "mes":
      return [new Date(now.getFullYear(), now.getMonth(), 1), endOfDay(now)];
    case "mes-pasado":
      return [new Date(now.getFullYear(), now.getMonth() - 1, 1), endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))];
    case "custom":
      return [desde ? startOfDay(fromInputDate(desde)) : null, hasta ? endOfDay(fromInputDate(hasta)) : null];
    default:
      return [null, null];
  }
}

function ActivityPage() {
  const { movements, openForm, deleteMovements, showToast } = useApp();
  const [params, setParams] = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirm, setConfirm] = useState(null);

  // Los filtros viven en la URL: se pueden compartir y sobreviven al navegar.
  const f = Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, params.get(k) ?? DEFAULTS[k]]));
  const selectedCats = f.cat ? f.cat.split(",") : [];
  const page = Math.max(1, Number(f.page) || 1);
  const pageSize = Number(f.size) || 10;

  const update = (changes, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries({ ...changes, ...(resetPage ? { page: "1" } : {}) }).forEach(([k, v]) => {
      if (v === "" || v === DEFAULTS[k]) next.delete(k);
      else next.set(k, v);
    });
    setParams(next, { replace: true });
  };

  // Búsqueda con pequeño debounce para no reescribir la URL en cada tecla
  const [search, setSearch] = useState(f.q);
  useEffect(() => {
    const t = setTimeout(() => search !== f.q && update({ q: search }), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const visibleCats =
    f.tipo === "Gasto" ? EXPENSE_CATEGORIES : f.tipo === "Ingreso" ? INCOME_CATEGORIES : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const toggleCat = (name) => {
    const set = new Set(selectedCats);
    set.has(name) ? set.delete(name) : set.add(name);
    update({ cat: [...set].join(",") });
  };

  const filtered = useMemo(() => {
    const [from, to] = periodRange(f.periodo, f.desde, f.hasta);
    const q = f.q.trim().toLowerCase();
    const min = f.min === "" ? null : Number(f.min);
    const max = f.max === "" ? null : Number(f.max);
    const cats = new Set(selectedCats);

    const list = movements.filter((m) => {
      const d = new Date(m.fecha);
      const amount = Number(m.monto || 0);
      if (f.tipo !== "todos" && m.tipo !== f.tipo) return false;
      if (cats.size && !cats.has(m.categoria)) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (min !== null && amount < min) return false;
      if (max !== null && amount > max) return false;
      if (q && !`${m.descripcion} ${m.categoria ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const sorters = {
      fecha_desc: (a, b) => new Date(b.fecha) - new Date(a.fecha),
      fecha_asc: (a, b) => new Date(a.fecha) - new Date(b.fecha),
      monto_desc: (a, b) => b.monto - a.monto,
      monto_asc: (a, b) => a.monto - b.monto,
      alfa: (a, b) => a.descripcion.localeCompare(b.descripcion, "es"),
    };
    return list.sort(sorters[f.orden] || sorters.fecha_desc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movements, params]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Agrupar por día solo cuando el orden es por fecha
  const groupByDay = f.orden.startsWith("fecha");
  const groups = (() => {
    if (!groupByDay) return [{ key: "all", items: pageItems }];
    const map = new Map();
    pageItems.forEach((m) => {
      const key = startOfDay(m.fecha).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: dayLabel(key),
      net: items.reduce((a, m) => a + signedAmount(m), 0),
      items,
    }));
  })();

  const ingresos = sumBy(filtered, "Ingreso");
  const gastos = sumBy(filtered, "Gasto");

  // Chips de filtros activos
  const active = [];
  if (f.q) active.push({ key: "q", label: `"${f.q}"`, clear: () => { setSearch(""); update({ q: "" }); } });
  if (f.tipo !== "todos") active.push({ key: "tipo", label: f.tipo === "Gasto" ? "Gastos" : "Ingresos", clear: () => update({ tipo: "todos", cat: "" }) });
  selectedCats.forEach((c) => active.push({ key: `cat-${c}`, label: c, clear: () => toggleCat(c) }));
  if (f.periodo !== "todo") {
    const label =
      f.periodo === "custom"
        ? `${f.desde ? new Date(fromInputDate(f.desde)).toLocaleDateString("es-AR") : "…"} – ${f.hasta ? new Date(fromInputDate(f.hasta)).toLocaleDateString("es-AR") : "…"}`
        : PERIODS.find((p) => p.id === f.periodo)?.label;
    active.push({ key: "periodo", label, clear: () => update({ periodo: "todo", desde: "", hasta: "" }) });
  }
  if (f.min || f.max)
    active.push({
      key: "monto",
      label: `${f.min ? formatMoney(f.min) : "$0"} – ${f.max ? formatMoney(f.max) : "∞"}`,
      clear: () => update({ min: "", max: "" }),
    });

  const advancedCount = selectedCats.length + (f.min || f.max ? 1 : 0) + (f.periodo === "custom" ? 1 : 0);

  const clearAll = () => {
    setSearch("");
    setParams(f.size !== DEFAULTS.size ? { size: f.size } : {}, { replace: true });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Historial"
        title="Movimientos"
        subtitle={`${movements.length} movimientos registrados`}
        actions={
          movements.length > 0 && (
            <>
              <button
                onClick={() => {
                  exportCSV(filtered);
                  showToast(`${filtered.length} movimientos exportados`);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
              >
                <DownloadIcon className="h-4 w-4" /> CSV
              </button>
              <button
                onClick={() => setConfirm("all")}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold text-rose-600 shadow-sm ring-1 ring-black/5 hover:bg-rose-50"
              >
                <TrashIcon className="h-4 w-4" /> <span className="hidden sm:inline">Borrar todo</span>
              </button>
            </>
          )
        }
      />

      {/* Barra de búsqueda y filtros */}
      <div className="card mb-4 p-3 md:p-4">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search-input"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar movimientos…  ( / )"
              className="input !rounded-xl pl-9"
              aria-label="Buscar movimientos"
            />
          </label>
          <button
            onClick={() => setShowAdvanced((s) => !s)}
            className={`relative flex items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition ${showAdvanced ? "bg-ink text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            aria-expanded={showAdvanced}
          >
            <FilterIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {advancedCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] text-white">{advancedCount}</span>
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Tipo */}
          <div className="grid grid-cols-3 gap-0.5 rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
            {[
              ["todos", "Todos"],
              ["Ingreso", "Ingresos"],
              ["Gasto", "Gastos"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => update({ tipo: id, cat: "" })}
                className={`rounded-[10px] px-3 py-1.5 transition ${f.tipo === id ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Orden */}
          <label className="relative ml-auto">
            <select
              value={f.orden}
              onChange={(e) => update({ orden: e.target.value })}
              className="appearance-none rounded-xl bg-slate-100 py-2 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none"
              aria-label="Ordenar por"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          </label>
        </div>

        {/* Período */}
        <div className="hidden-scrollbar -mx-3 mt-3 flex gap-1.5 overflow-x-auto px-3 md:-mx-4 md:px-4">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              className="chip"
              data-active={f.periodo === p.id}
              onClick={() => {
                update({ periodo: p.id, ...(p.id !== "custom" ? { desde: "", hasta: "" } : {}) });
                if (p.id === "custom") setShowAdvanced(true);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="animate-fade-up mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Categorías</p>
              <div className="flex flex-wrap gap-1.5">
                {visibleCats.map((c) => (
                  <button key={c.name} className="chip" data-active={selectedCats.includes(c.name)} onClick={() => toggleCat(c.name)}>
                    <AppIcon name={c.icon} className="h-3.5 w-3.5" /> {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Rango de fechas</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={f.desde}
                  max={f.hasta || undefined}
                  onChange={(e) => update({ periodo: "custom", desde: e.target.value })}
                  className="input !rounded-xl !py-2 text-sm"
                  aria-label="Desde"
                />
                <input
                  type="date"
                  value={f.hasta}
                  min={f.desde || undefined}
                  onChange={(e) => update({ periodo: "custom", hasta: e.target.value })}
                  className="input !rounded-xl !py-2 text-sm"
                  aria-label="Hasta"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Monto</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Mínimo"
                  value={f.min}
                  onChange={(e) => update({ min: e.target.value })}
                  className="input num !rounded-xl !py-2 text-sm"
                  aria-label="Monto mínimo"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Máximo"
                  value={f.max}
                  onChange={(e) => update({ max: e.target.value })}
                  className="input num !rounded-xl !py-2 text-sm"
                  aria-label="Monto máximo"
                />
              </div>
            </div>
          </div>
        )}

        {active.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            {active.map((a) => (
              <span key={a.key} className="animate-pop inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1 text-xs font-bold text-brand-700">
                {a.label}
                <button onClick={a.clear} className="rounded-full p-0.5 hover:bg-brand-100" aria-label={`Quitar filtro ${a.label}`}>
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="ml-1 text-xs font-bold text-slate-500 underline-offset-2 hover:text-ink hover:underline">
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Resumen del resultado */}
      <div className="mb-4 grid grid-cols-3 gap-2 md:gap-3">
        <SummaryTile label="Ingresos" value={ingresos} className="text-income" />
        <SummaryTile label="Gastos" value={gastos} className="text-expense" />
        <SummaryTile label="Neto" value={ingresos - gastos} className={ingresos - gastos >= 0 ? "text-ink" : "text-rose-600"} />
      </div>

      {/* Lista */}
      <section className="card p-3 md:p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <SearchIcon className="h-8 w-8 text-slate-300" />
            <p className="font-bold">{movements.length ? "No hay resultados" : "Todavía no hay movimientos"}</p>
            <p className="text-sm text-slate-500">
              {movements.length ? "Probá cambiando o limpiando los filtros." : "Tocá el botón + para agregar el primero."}
            </p>
            {active.length > 0 && (
              <button onClick={clearAll} className="mt-2 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div key={`${safePage}-${params.toString()}`}>
            {groups.map((g) => (
              <div key={g.key} className="mb-2 last:mb-0">
                {g.label && (
                  <div className="flex items-center justify-between px-2 pb-1 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{g.label}</p>
                    <p className={`num text-xs font-bold ${g.net >= 0 ? "text-income" : "text-slate-500"}`}>
                      {g.net >= 0 ? "+" : "−"}
                      {formatMoney(Math.abs(g.net))}
                    </p>
                  </div>
                )}
                {g.items.map((m) => (
                  <MovementItem
                    key={m.id}
                    mov={m}
                    index={pageItems.indexOf(m)}
                    showDate={!groupByDay}
                    onEdit={(mov) => openForm(mov)}
                    onDuplicate={(mov) => openForm({ ...mov, __duplicate: true })}
                    onDelete={(mov) => setConfirm(mov)}
                  />
                ))}
              </div>
            ))}
            </div>

            <div className="border-t border-slate-100">
              <Pagination
                page={safePage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={(p) => {
                  update({ page: String(p) }, false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPageSizeChange={(s) => update({ size: String(s) })}
              />
            </div>
          </>
        )}
      </section>

      {confirm && (
        <ConfirmDialog
          title={confirm === "all" ? "¿Borrar todos los movimientos?" : "¿Eliminar movimiento?"}
          message={
            confirm === "all"
              ? `Se van a eliminar los ${movements.length} movimientos. Vas a poder deshacerlo unos segundos.`
              : `"${confirm.descripcion}" por ${formatMoney(confirm.monto)}. Vas a poder deshacerlo unos segundos.`
          }
          confirmLabel={confirm === "all" ? "Borrar todo" : "Eliminar"}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === "all") {
              deleteMovements(movements.map((m) => m.id));
            } else {
              deleteMovements([confirm.id]);
            }
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function SummaryTile({ label, value, className }) {
  return (
    <div className="card card-hover px-3 py-3 md:px-4">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className={`num mt-0.5 truncate text-sm font-extrabold md:text-lg ${className}`}>
        <AnimatedNumber value={value} format={formatCompact} className="md:hidden" />
        <AnimatedNumber value={value} className="hidden md:inline" />
      </p>
    </div>
  );
}

export default ActivityPage;
