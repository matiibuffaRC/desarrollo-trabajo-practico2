import { useMemo, useState } from "react";
import { useApp } from "../../lib/AppContext";
import {
  formatMoney,
  sumBy,
  monthlySeries,
  balanceSeries,
  categoryBreakdown,
  generateMockMovements,
  INCOME_COLOR,
  EXPENSE_COLOR,
} from "../../lib/finance";
import PageHeader from "../Components/PageHeader";
import MovementItem from "../Components/MovementItem";
import ConfirmDialog from "../Components/ConfirmDialog";
import { IncomeExpenseBars, BalanceArea, CategoryDonut, CategoryList, SimpleBars, Legend, SpendingHeatmap } from "../Components/ChartKit";
import AnimatedNumber from "../Components/AnimatedNumber";
import { SparkIcon, TrashIcon, CalendarIcon } from "../Components/Icons";

const RANGES = [
  { id: 3, label: "3M" },
  { id: 6, label: "6M" },
  { id: 12, label: "1A" },
  { id: 0, label: "Todo" },
];

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const WEEKDAYS_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function StatsPage() {
  const { movements, setMovements, showToast } = useApp();
  const [range, setRange] = useState(6);
  const [view, setView] = useState("chart"); // chart | table (accesibilidad)
  const [confirmClear, setConfirmClear] = useState(false);
  const hasMock = movements.some((m) => m.isMock);

  const stats = useMemo(() => {
    const now = new Date();
    let months = range;
    if (!months) {
      const oldest = movements.reduce((min, m) => Math.min(min, new Date(m.fecha).getTime()), now.getTime());
      const o = new Date(oldest);
      months = Math.min(36, (now.getFullYear() - o.getFullYear()) * 12 + now.getMonth() - o.getMonth() + 1);
    }
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const inRange = movements.filter((m) => new Date(m.fecha) >= start);

    const ingresos = sumBy(inRange, "Ingreso");
    const gastos = sumBy(inRange, "Gasto");
    const days = Math.max(1, Math.round((now - start) / 86400000) + 1);

    const weekday = WEEKDAYS.map((name, i) => ({ name, fullName: WEEKDAYS_FULL[i], value: 0 }));
    inRange.forEach((m) => {
      if (m.tipo !== "Gasto") return;
      const idx = (new Date(m.fecha).getDay() + 6) % 7;
      weekday[idx].value += Number(m.monto || 0);
    });

    const monthly = monthlySeries(movements, months);
    const monthsWithExpense = monthly.filter((m) => m.gastos > 0);
    const topMonth = monthsWithExpense.reduce((a, b) => (b.gastos > (a?.gastos ?? -1) ? b : a), null);

    return {
      months,
      ingresos,
      gastos,
      neto: ingresos - gastos,
      ahorro: ingresos ? ((ingresos - gastos) / ingresos) * 100 : null,
      daily: gastos / days,
      count: inRange.length,
      avgMonthlyExpense: monthsWithExpense.length ? gastos / monthsWithExpense.length : 0,
      topMonth,
      monthly,
      balance: balanceSeries(movements, Math.min(days, 400)),
      categories: categoryBreakdown(inRange),
      weekday,
      top: inRange
        .filter((m) => m.tipo === "Gasto")
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 5),
    };
  }, [movements, range]);

  const generate = () => {
    setMovements((prev) => [...prev.filter((m) => !m.isMock), ...generateMockMovements(range || 12)]);
    showToast("Datos de ejemplo generados");
  };

  const clearMock = () => {
    setMovements((prev) => prev.filter((m) => !m.isMock));
    setConfirmClear(false);
    showToast("Datos de ejemplo eliminados");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Estadísticas"
        subtitle="Cómo se mueve tu dinero en el tiempo."
        actions={
          <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5" role="tablist" aria-label="Período">
            {RANGES.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={range === r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ${range === r.id ? "scale-105 bg-ink text-white shadow" : "text-slate-500 hover:text-ink"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Datos de prueba */}
      <div className="card mb-5 flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
            <SparkIcon />
          </div>
          <div>
            <p className="text-sm font-bold">Datos de ejemplo</p>
            <p className="text-xs text-slate-500">
              {hasMock ? "Estás viendo datos simulados mezclados con los tuyos." : "Generá movimientos realistas para probar los gráficos."}
            </p>
          </div>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button onClick={generate} className="flex-1 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black sm:flex-none">
            {hasMock ? "Regenerar" : "Generar"}
          </button>
          {hasMock && (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <TrashIcon className="h-4 w-4" /> Quitar
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ingresos" value={stats.ingresos} dot={INCOME_COLOR} />
        <Kpi label="Gastos" value={stats.gastos} dot={EXPENSE_COLOR} />
        <Kpi
          label="Ahorro neto"
          value={stats.neto}
          hint={stats.ahorro === null ? "Sin ingresos" : `${stats.ahorro.toFixed(1)}% de tus ingresos`}
          valueClass={stats.neto < 0 ? "text-rose-600" : ""}
        />
        <Kpi label="Gasto diario promedio" value={stats.daily} hint={`${stats.count} movimientos en el período`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Ingresos vs gastos */}
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">Ingresos vs. gastos</h2>
              <p className="text-xs text-slate-500">
                Promedio mensual de gastos: <span className="num font-bold text-ink">{formatMoney(stats.avgMonthlyExpense)}</span>
                {stats.topMonth && (
                  <>
                    {" · "}Mes de mayor gasto: <span className="font-bold text-ink">{stats.topMonth.fullName}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Legend items={[{ label: "Ingresos", color: INCOME_COLOR }, { label: "Gastos", color: EXPENSE_COLOR }]} />
              <button onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200">
                {view === "chart" ? "Ver tabla" : "Ver gráfico"}
              </button>
            </div>
          </div>
          {view === "chart" ? (
            <IncomeExpenseBars data={stats.monthly} />
          ) : (
            <div className="overflow-x-auto">
              <table className="num w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="py-2 font-semibold">Mes</th>
                    <th className="py-2 text-right font-semibold">Ingresos</th>
                    <th className="py-2 text-right font-semibold">Gastos</th>
                    <th className="py-2 text-right font-semibold">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.monthly.map((m) => (
                    <tr key={m.key} className="border-b border-slate-50">
                      <td className="py-2 font-semibold">{m.fullName}</td>
                      <td className="py-2 text-right">{formatMoney(m.ingresos)}</td>
                      <td className="py-2 text-right">{formatMoney(m.gastos)}</td>
                      <td className={`py-2 text-right font-bold ${m.neto < 0 ? "text-rose-600" : ""}`}>{formatMoney(m.neto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Evolución del saldo */}
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-lg font-extrabold">Evolución del saldo</h2>
          <p className="mb-4 text-xs text-slate-500">Saldo acumulado al final de cada día.</p>
          <BalanceArea data={stats.balance} height={240} />
        </section>

        {/* Categorías */}
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-extrabold">Gastos por categoría</h2>
          <div className="grid items-center gap-5 sm:grid-cols-[180px_1fr] lg:grid-cols-1 xl:grid-cols-[180px_1fr]">
            <div className="mx-auto w-full max-w-[200px]">
              <CategoryDonut data={stats.categories} height={180} />
            </div>
            {stats.categories.length > 0 && <CategoryList data={stats.categories} />}
          </div>
        </section>

        {/* Día de la semana */}
        <section className="card p-5">
          <h2 className="text-lg font-extrabold">¿Qué días gastás más?</h2>
          <p className="mb-4 text-xs text-slate-500">
            {stats.weekday.some((d) => d.value)
              ? `Los ${stats.weekday.reduce((a, b) => (b.value > a.value ? b : a)).fullName.toLowerCase()} son tus días de mayor gasto.`
              : "Total gastado por día de la semana."}
          </p>
          <SimpleBars data={stats.weekday} height={220} />
        </section>

        {/* Calendario de calor */}
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <CalendarIcon className="h-[18px] w-[18px] text-brand-500" /> Calendario de gastos
              </h2>
              <p className="text-xs text-slate-500">Cada cuadrito es un día: cuanto más intenso, más gastaste. Pasá el mouse para ver el total.</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">Últimas 18 semanas</span>
          </div>
          <SpendingHeatmap movements={movements} weeks={18} />
        </section>

        {/* Top gastos */}
        <section className="card p-4 md:p-5 lg:col-span-2">
          <h2 className="mb-2 px-2 text-lg font-extrabold">Gastos más grandes</h2>
          {stats.top.length ? (
            stats.top.map((m, i) => (
              <div key={m.id} className="flex items-center gap-1">
                <span className="num w-6 shrink-0 text-center text-sm font-extrabold text-slate-300">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <MovementItem mov={m} showDate index={i} />
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">No hay gastos en este período.</p>
          )}
        </section>
      </div>

      {confirmClear && (
        <ConfirmDialog
          title="¿Quitar datos de ejemplo?"
          message="Se eliminan solo los movimientos simulados. Tus movimientos reales no se tocan."
          confirmLabel="Quitar"
          danger
          onCancel={() => setConfirmClear(false)}
          onConfirm={clearMock}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, hint, dot, valueClass = "" }) {
  return (
    <div className="card card-hover p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        {dot && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />}
        {label}
      </p>
      <p className={`num mt-1 truncate text-lg font-extrabold md:text-xl ${valueClass}`}>
        <AnimatedNumber value={value} />
      </p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default StatsPage;
