import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import {
  formatMoney,
  formatCompact,
  isSameMonth,
  sumBy,
  balanceSeries,
  categoryBreakdown,
  generateMockMovements,
  nextOccurrence,
  relativeDays,
  getCategory,
  goalInsight,
} from "../../lib/finance";
import MonthlyLimitTracker from "../Components/MonthlyLimitTracker";
import MovementItem from "../Components/MovementItem";
import ConfirmDialog from "../Components/ConfirmDialog";
import AnimatedNumber from "../Components/AnimatedNumber";
import { BalanceArea, CategoryList } from "../Components/ChartKit";
import { ArrowUp, ArrowDown, ChevronRight, SparkIcon, PlusIcon, EyeIcon, EyeOffIcon, RepeatIcon, TargetIcon } from "../Components/Icons";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buen día";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function Homepage() {
  const { movements, setMovements, total, profile, openForm, deleteMovements, showToast, privacy, setPrivacy, budgets, recurring, goals } = useApp();
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
    const categories = categoryBreakdown(thisMonth);
    const overBudget = categories.filter((c) => budgets[c.name] && c.value > budgets[c.name]).map((c) => c.name);
    const upcoming = recurring
      .filter((r) => r.active)
      .map((r) => ({ rule: r, date: nextOccurrence(r, now) }))
      .filter((x) => x.date)
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);
    return {
      ingresos,
      gastos,
      gastosDelta: gastosPrev ? ((gastos - gastosPrev) / gastosPrev) * 100 : null,
      ahorro: ingresos ? ((ingresos - gastos) / ingresos) * 100 : null,
      trend: balanceSeries(movements, 30),
      categories,
      overBudget,
      upcoming,
      recent,
    };
  }, [movements, budgets, recurring]);

  const todayRaw = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);
  const firstName = profile.name.split(" ")[0];
  const activeGoals = goals.filter((g) => !goalInsight(g).done).slice(0, 2);

  const loadDemo = () => {
    setMovements((prev) => [...prev.filter((m) => !m.isMock), ...generateMockMovements(6)]);
    showToast("Datos de ejemplo cargados");
  };

  return (
    <div>
      {/* Saludo */}
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="stagger-item text-sm font-medium text-slate-500">{today}</p>
          <h1 className="stagger-item mt-0.5 text-[26px] font-extrabold leading-tight tracking-tight md:text-3xl" style={{ animationDelay: "80ms" }}>
            {greeting()}, {firstName} <span className="inline-block origin-[70%_70%] animate-[wiggle_0.6s_ease_0.6s_2]">👋</span>
          </h1>
        </div>
        <Link
          to="/profile"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-400 text-base font-bold text-snow shadow-md transition active:scale-90 md:hidden"
          aria-label="Ir al perfil"
        >
          {profile.name.charAt(0).toUpperCase()}
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-5">
          {/* Tarjeta de saldo */}
          <section
            data-reveal
            className="keep-dark shimmer relative overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-[0_24px_48px_rgba(18,18,26,0.25)]"
          >
            <div className="animate-drift pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/50 blur-3xl" />
            <div className="animate-drift-slow pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/60">Saldo disponible</p>
                <button
                  onClick={() => setPrivacy((p) => !p)}
                  className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label={privacy ? "Mostrar montos" : "Ocultar montos"}
                  title="Ocultar montos (P)"
                >
                  <span key={String(privacy)} className="animate-pop block">
                    {privacy ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
                  </span>
                </button>
              </div>
              <p className={`num mt-1 text-[38px] font-extrabold leading-none tracking-tight md:text-5xl ${total < 0 ? "text-rose-300" : ""}`}>
                <AnimatedNumber value={total} duration={1400} />
              </p>

              <div className="-mx-2 mt-4 h-16">
                <BalanceArea data={data.trend} compact height={64} color="#a99fff" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10 transition hover:bg-white/[0.1]">
                  <p className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-white/60">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                      <ArrowDown className="h-3 w-3" />
                    </span>
                    Ingresos del mes
                  </p>
                  <p className="num mt-1.5 truncate text-[15px] font-extrabold sm:text-lg">
                    <AnimatedNumber value={data.ingresos} />
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10 transition hover:bg-white/[0.1]">
                  <p className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-white/60">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-400/20 text-orange-300">
                      <ArrowUp className="h-3 w-3" />
                    </span>
                    Gastos del mes
                  </p>
                  <p className="num mt-1.5 truncate text-[15px] font-extrabold sm:text-lg">
                    <AnimatedNumber value={data.gastos} />
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openForm(null, "Ingreso")}
                  className="group flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white/90 active:scale-[0.98]"
                >
                  <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Ingreso
                </button>
                <button
                  onClick={() => openForm(null, "Gasto")}
                  className="group flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.98]"
                >
                  <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Gasto
                </button>
              </div>
            </div>
          </section>

          {/* Insights rápidos */}
          {movements.length > 0 && (
            <div className="hidden-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0">
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
                <Link to="/activity" className="group flex items-center gap-0.5 text-sm font-bold text-brand-600 hover:text-brand-700">
                  Ver todo <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>

            {data.recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <div className="flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-brand-50 text-brand-500 [animation-duration:2s]">
                  <SparkIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-bold">Todavía no hay movimientos</p>
                  <p className="mt-1 text-sm text-slate-500">Agregá tu primer ingreso o gasto, o probá la app con datos de ejemplo.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => openForm(null, "Ingreso")} className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5">
                    Agregar movimiento
                  </button>
                  <button onClick={loadDemo} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200">
                    Cargar datos de ejemplo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {data.recent.map((m, i) => (
                  <MovementItem
                    key={m.id}
                    mov={m}
                    index={i}
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
          <MonthlyLimitTracker spent={data.gastos} overBudget={data.overBudget} />

          {/* Próximos pagos recurrentes */}
          {data.upcoming.length > 0 && (
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-extrabold">
                  <RepeatIcon className="h-[18px] w-[18px] text-brand-500" /> Próximos
                </h2>
                <Link to="/plan#recurrentes" className="text-xs font-bold text-brand-600 hover:underline">
                  Gestionar
                </Link>
              </div>
              <ul className="flex flex-col gap-1">
                {data.upcoming.map(({ rule, date }) => {
                  const cat = getCategory(rule);
                  return (
                    <li key={rule.id} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base" style={{ backgroundColor: `${cat.color}1f` }}>
                        {cat.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{rule.descripcion}</p>
                        <p className="text-xs text-slate-500">{relativeDays(date)}</p>
                      </div>
                      <p className={`num text-sm font-extrabold ${rule.tipo === "Ingreso" ? "text-income" : ""}`}>
                        {rule.tipo === "Ingreso" ? "+" : "−"}
                        {formatCompact(rule.monto)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Metas */}
          {activeGoals.length > 0 && (
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-extrabold">
                  <TargetIcon className="h-[18px] w-[18px] text-brand-500" /> Metas
                </h2>
                <Link to="/plan" className="text-xs font-bold text-brand-600 hover:underline">
                  Ver todas
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {activeGoals.map((g) => {
                  const ins = goalInsight(g);
                  return (
                    <div key={g.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-bold">
                          {g.icon} {g.name}
                        </span>
                        <span className="no-privacy shrink-0 text-xs font-bold text-slate-500">{ins.pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="fill-on-reveal h-full rounded-full" style={{ width: `${ins.pct}%`, backgroundColor: g.color }} />
                      </div>
                      <p className="num mt-1 text-xs text-slate-500">
                        {formatMoney(g.saved)} de {formatMoney(g.target)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

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
                  className="group mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-50 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  Ver estadísticas <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
    <div className="card card-hover min-w-[170px] shrink-0 snap-start p-4 md:min-w-0">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-xl font-extrabold ${color}`}>{value}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</p>
    </div>
  );
}

export default Homepage;
