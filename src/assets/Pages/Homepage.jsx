import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import {
  formatMoney,
  isSameMonth,
  sumBy,
  balanceSeries,
  categoryBreakdown,
  generateMockMovements,
} from "../../lib/finance";
import MonthlyLimitTracker from "../Components/MonthlyLimitTracker";
import MovementItem from "../Components/MovementItem";
import ConfirmDialog from "../Components/ConfirmDialog";
import { BalanceArea, CategoryList } from "../Components/ChartKit";
import { ArrowUp, ArrowDown, ChevronRight, SparkIcon, PlusIcon } from "../Components/Icons";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buen día";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function Homepage() {
  const { movements, setMovements, total, profile, openForm, deleteMovements, showToast } = useApp();
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();

  const data = useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = movements.filter((m) => isSameMonth(new Date(m.fecha), now));
    const lastMonth = movements.filter((m) => isSameMonth(new Date(m.fecha), prev));
    const ingresos = sumBy(thisMonth, "Ingreso");
    const gastos = sumBy(thisMonth, "Gasto");
    const gastosPrev = sumBy(lastMonth, "Gasto");
    const recent = [...movements].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
    return {
      ingresos,
      gastos,
      gastosDelta: gastosPrev ? ((gastos - gastosPrev) / gastosPrev) * 100 : null,
      ahorro: ingresos ? ((ingresos - gastos) / ingresos) * 100 : null,
      trend: balanceSeries(movements, 30),
      categories: categoryBreakdown(thisMonth),
      recent,
    };
  }, [movements]);

  const todayRaw = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);
  const firstName = profile.name.split(" ")[0];

  const loadDemo = () => {
    setMovements((prev) => [...prev.filter((m) => !m.isMock), ...generateMockMovements(6)]);
    showToast("Datos de ejemplo cargados");
  };

  return (
    <div className="animate-fade-up">
      {/* Saludo */}
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{today}</p>
          <h1 className="mt-0.5 text-[26px] font-extrabold leading-tight tracking-tight md:text-3xl">
            {greeting()}, {firstName} 👋
          </h1>
        </div>
        <Link
          to="/profile"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-400 text-base font-bold text-white shadow-md md:hidden"
          aria-label="Ir al perfil"
        >
          {profile.name.charAt(0).toUpperCase()}
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-5">
          {/* Tarjeta de saldo */}
          <section className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-[0_24px_48px_rgba(18,18,26,0.25)]">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-medium text-white/60">Saldo disponible</p>
              <p className={`num mt-1 text-[38px] font-extrabold leading-none tracking-tight md:text-5xl ${total < 0 ? "text-rose-300" : ""}`}>
                {formatMoney(total)}
              </p>

              <div className="mt-4 -mx-2 h-16">
                <BalanceArea data={data.trend} compact height={64} color="#a99fff" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <p className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-white/60">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                      <ArrowDown className="h-3 w-3" />
                    </span>
                    Ingresos
                  </p>
                  <p className="num mt-1.5 truncate text-[15px] font-extrabold sm:text-lg">{formatMoney(data.ingresos)}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <p className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-white/60">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-400/20 text-orange-300">
                      <ArrowUp className="h-3 w-3" />
                    </span>
                    Gastos
                  </p>
                  <p className="num mt-1.5 truncate text-[15px] font-extrabold sm:text-lg">{formatMoney(data.gastos)}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openForm(null, "Ingreso")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-bold text-ink transition hover:bg-white/90 active:scale-[0.98]"
                >
                  <PlusIcon className="h-4 w-4" /> Ingreso
                </button>
                <button
                  onClick={() => openForm(null, "Gasto")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]"
                >
                  <PlusIcon className="h-4 w-4" /> Gasto
                </button>
              </div>
            </div>
          </section>

          {/* Insights rápidos */}
          {movements.length > 0 && (
            <div className="hidden-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0">
              <Insight
                label="vs. mes pasado"
                value={data.gastosDelta === null ? "—" : `${data.gastosDelta > 0 ? "+" : ""}${data.gastosDelta.toFixed(0)}%`}
                hint={data.gastosDelta === null ? "Sin datos previos" : data.gastosDelta > 0 ? "Gastás más que el mes pasado" : "Gastás menos que el mes pasado"}
                tone={data.gastosDelta === null ? "neutral" : data.gastosDelta > 0 ? "bad" : "good"}
              />
              <Insight
                label="Tasa de ahorro"
                value={data.ahorro === null ? "—" : `${data.ahorro.toFixed(0)}%`}
                hint="De tus ingresos del mes"
                tone={data.ahorro === null ? "neutral" : data.ahorro >= 0 ? "good" : "bad"}
              />
              <Insight
                label="Mayor categoría"
                value={data.categories.length ? [...data.categories].sort((a, b) => b.value - a.value)[0].name : "—"}
                hint={data.categories.length ? "Donde más gastaste este mes" : "Sin gastos este mes"}
                tone="neutral"
              />
            </div>
          )}

          {/* Actividad reciente */}
          <section className="card p-4 md:p-5">
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 className="text-lg font-extrabold">Actividad reciente</h2>
              {movements.length > 0 && (
                <Link to="/activity" className="flex items-center gap-0.5 text-sm font-bold text-brand-600 hover:text-brand-700">
                  Ver todo <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            {data.recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                  <SparkIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-bold">Todavía no hay movimientos</p>
                  <p className="mt-1 text-sm text-slate-500">Agregá tu primer ingreso o gasto, o probá la app con datos de ejemplo.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => openForm(null, "Ingreso")} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white">
                    Agregar movimiento
                  </button>
                  <button onClick={loadDemo} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">
                    Cargar datos de ejemplo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {data.recent.map((m) => (
                  <MovementItem
                    key={m.id}
                    mov={m}
                    showDate
                    onEdit={(mov) => openForm(mov)}
                    onDuplicate={(mov) => openForm({ ...mov, __duplicate: true })}
                    onDelete={setToDelete}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-5">
          <MonthlyLimitTracker spent={data.gastos} />

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Gastos por categoría</h2>
              <span className="text-xs font-semibold text-slate-400">Este mes</span>
            </div>
            {data.categories.length ? (
              <>
                <CategoryList data={data.categories} limit={5} />
                <button
                  onClick={() => navigate("/stats")}
                  className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-50 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  Ver estadísticas <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">No registraste gastos este mes.</p>
            )}
          </section>
        </div>
      </div>

      {toDelete && (
        <ConfirmDialog
          title="¿Eliminar movimiento?"
          message={`"${toDelete.descripcion}" por ${formatMoney(toDelete.monto)}. Vas a poder deshacerlo unos segundos.`}
          confirmLabel="Eliminar"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            deleteMovements([toDelete.id]);
            setToDelete(null);
          }}
        />
      )}
    </div>
  );
}

function Insight({ label, value, hint, tone }) {
  const color = { good: "text-income", bad: "text-expense", neutral: "text-ink" }[tone];
  return (
    <div className="card min-w-[170px] shrink-0 p-4 md:min-w-0">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={`num mt-1 truncate text-xl font-extrabold ${color}`}>{value}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</p>
    </div>
  );
}

export default Homepage;
