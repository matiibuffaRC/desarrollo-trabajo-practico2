import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import { formatMoney, formatCompact } from "../../lib/finance";
import { EditIcon, AlertIcon, CheckIcon, ChevronRight, XIcon } from "./Icons";
import AnimatedNumber from "./AnimatedNumber";

function MonthlyLimitTracker({ spent, overBudget = [] }) {
  const { monthlyLimit, setMonthlyLimit, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(monthlyLimit));
  const [error, setError] = useState("");

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  const pct = monthlyLimit ? (spent / monthlyLimit) * 100 : 0;
  const remaining = monthlyLimit - spent;
  const projection = (spent / day) * daysInMonth;
  const dailyAllowance = remaining > 0 ? remaining / (daysInMonth - day + 1) : 0;
  const monthPct = (day / daysInMonth) * 100;

  const status =
    pct >= 100
      ? { label: "Límite superado", tone: "critical", bar: "#d03b3b", Icon: AlertIcon }
      : pct >= 80 || projection > monthlyLimit
        ? { label: projection > monthlyLimit && pct < 80 ? "Al ritmo actual lo superás" : "Cerca del límite", tone: "warning", bar: "#ec835a", Icon: AlertIcon }
        : { label: "Vas bien", tone: "good", bar: "#0ca30c", Icon: CheckIcon };

  const toneClass = {
    critical: "bg-rose-50 text-rose-700",
    warning: "bg-amber-50 text-amber-800",
    good: "bg-emerald-50 text-emerald-700",
  }[status.tone];

  const save = () => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Ingresá un monto mayor a 0");
      return;
    }
    setMonthlyLimit(n);
    setEditing(false);
    setError("");
    showToast("Límite mensual actualizado");
  };

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Presupuesto del mes</p>
          <p className="num mt-1 text-2xl font-extrabold">
            <AnimatedNumber value={spent} />
            <span className="text-sm font-semibold text-slate-400"> / {formatMoney(monthlyLimit)}</span>
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => {
              setValue(String(monthlyLimit));
              setEditing(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
          >
            <EditIcon className="h-3.5 w-3.5" /> Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="animate-fade-up mt-4">
          <label className="text-xs font-bold text-slate-500" htmlFor="limit-input">
            Nuevo límite mensual
          </label>
          <div className="mt-1 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input
                id="limit-input"
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                className="input num pl-7"
                autoFocus
              />
            </div>
            <button onClick={save} className="rounded-xl bg-ink px-4 text-sm font-bold text-white">
              Guardar
            </button>
            <button onClick={() => setEditing(false)} className="rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-600" aria-label="Cancelar">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[300000, 500000, 800000, 1000000].map((n) => (
              <button key={n} onClick={() => setValue(String(n))} className="chip num !py-1 !text-xs">
                {formatMoney(n).replace(",00", "")}
              </button>
            ))}
          </div>
          {error && <p className="mt-1.5 text-xs font-semibold text-rose-500">{error}</p>}
        </div>
      ) : (
        <>
          {/* Barra de progreso con marcador del día del mes */}
          <div className="relative mt-4">
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="fill-on-reveal h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: status.bar }} />
            </div>
            <div
              className="absolute -top-1 h-[18px] w-0.5 rounded bg-ink/40"
              style={{ left: `${monthPct}%` }}
              title={`Día ${day} de ${daysInMonth}`}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
            <span className="num">{pct.toFixed(0)}% usado</span>
            <span>
              Día {day} de {daysInMonth}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label={remaining >= 0 ? "Disponible" : "Excedido"} value={formatMoney(Math.abs(remaining))} danger={remaining < 0} />
            <Metric label="Por día" value={formatMoney(dailyAllowance)} />
            <Metric label="Proyección" value={formatCompact(projection)} danger={projection > monthlyLimit} />
          </div>

          <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${toneClass}`}>
            <status.Icon className="h-4 w-4" />
            {status.label}
          </div>
          {overBudget.length > 0 && (
            <Link
              to="/plan#presupuestos"
              className="animate-fade-up mt-2 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <AlertIcon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {overBudget.length === 1 ? `${overBudget[0]} superó su presupuesto` : `${overBudget.length} categorías superaron su presupuesto`}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </>
      )}
    </section>
  );
}

function Metric({ label, value, danger }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className={`num mt-0.5 truncate text-sm font-extrabold ${danger ? "text-rose-600" : ""}`}>{value}</p>
    </div>
  );
}

export default MonthlyLimitTracker;
