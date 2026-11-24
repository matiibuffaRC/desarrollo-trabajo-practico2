import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { formatMoney, formatCompact, INCOME_COLOR, EXPENSE_COLOR } from "../../lib/finance";
import { useApp } from "../../lib/AppContext";
import { ChartIcon } from "./Icons";

// Vive en su propio archivo para que la home no cargue recharts por usarla
export { CategoryList } from "./CategoryList";

const AXIS = { fontSize: 11, fill: "#898781" };

// Colores de soporte del gráfico según el tema
function useChartTheme() {
  const { isDark } = useApp();
  return isDark
    ? { grid: "#26262f", surface: "#16161f", cursor: "rgba(255,255,255,0.05)", zero: "#4a4a58" }
    : { grid: "#e9e8e2", surface: "#ffffff", cursor: "rgba(18,18,26,0.04)", zero: "#c3c2b7" };
}

export function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;
  const title = labelFormatter ? labelFormatter(label, payload) : label;
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {title && <p className="mb-1 font-bold text-ink">{title}</p>}
      {payload.map((p) => (
        <div key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.payload?.color || p.fill }} />
            {p.name}
          </span>
          <span className="num font-bold text-ink">{formatMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function EmptyChart({ message = "Todavía no hay datos para mostrar", height = 220 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 text-center" style={{ height }}>
      <ChartIcon className="h-7 w-7 text-slate-300" />
      <p className="max-w-[220px] text-sm text-slate-400">{message}</p>
    </div>
  );
}

// Dona de gastos por categoría con total al centro
export function CategoryDonut({ data, height = 220 }) {
  const t = useChartTheme();
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!data.length) return <EmptyChart height={height} message="No hay gastos en este período" />;
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={data.length > 1 ? 1.5 : 0}
            cornerRadius={4}
            stroke={t.surface}
            strokeWidth={2}
            isAnimationActive
            animationBegin={150}
            animationDuration={1100}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
        <p className="num animate-pop text-lg font-extrabold" style={{ animationDelay: "0.5s" }}>
          {formatCompact(total)}
        </p>
      </div>
    </div>
  );
}

// Lista de categorías con barra de proporción
// Barras agrupadas: ingresos vs gastos por mes
export function IncomeExpenseBars({ data, height = 260 }) {
  const t = useChartTheme();
  if (!data.some((d) => d.ingresos || d.gastos)) return <EmptyChart height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={t.grid} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={52} />
          <Tooltip content={<ChartTooltip labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />} cursor={{ fill: t.cursor }} />
          <Bar dataKey="ingresos" name="Ingresos" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={900} />
          <Bar dataKey="gastos" name="Gastos" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={900} animationBegin={150} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Área con la evolución del saldo
export function BalanceArea({ data, height = 220, compact = false, color = "#1a8fe3" }) {
  const t = useChartTheme();
  if (!data.length) return <EmptyChart height={height} />;
  const id = `grad-${color.replace("#", "")}-${compact ? "c" : "f"}`;
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={compact ? { top: 4, right: 0, left: 0, bottom: 0 } : { top: 8, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {!compact && <CartesianGrid vertical={false} stroke={t.grid} />}
          <XAxis dataKey="name" hide={compact} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis hide={compact} tick={AXIS} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={52} domain={["auto", "auto"]} />
          {!compact && <ReferenceLine y={0} stroke={t.zero} />}
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="saldo"
            name="Saldo"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            activeDot={{ r: 5, strokeWidth: 2, stroke: compact ? "#12121a" : t.surface }}
            animationDuration={1400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Barras simples (ej: gasto por día de la semana)
export function SimpleBars({ data, dataKey = "value", name = "Gastos", color = EXPENSE_COLOR, height = 200, highlightMax = true }) {
  const t = useChartTheme();
  if (!data.some((d) => d[dataKey])) return <EmptyChart height={height} />;
  const max = Math.max(...data.map((d) => d[dataKey]));
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={t.grid} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={52} />
          <Tooltip content={<ChartTooltip labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />} cursor={{ fill: t.cursor }} />
          <Bar dataKey={dataKey} name={name} radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={900}>
            {data.map((d) => (
              <Cell key={d.name} fill={color} fillOpacity={highlightMax && d[dataKey] !== max ? 0.45 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Calendario de calor: gasto diario de las últimas `weeks` semanas (estilo GitHub)
export function SpendingHeatmap({ movements, weeks = 18 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // lunes = 0
  const start = new Date(today);
  start.setDate(today.getDate() - dow - (weeks - 1) * 7);

  const totals = {};
  movements.forEach((m) => {
    if (m.tipo !== "Gasto") return;
    const d = new Date(m.fecha);
    if (d < start) return;
    const key = d.toDateString();
    totals[key] = (totals[key] || 0) + Number(m.monto || 0);
  });

  // Escala por cuantiles para que unos pocos gastos enormes no "apaguen" el resto
  const values = Object.values(totals).sort((a, b) => a - b);
  const q = (p) => values[Math.floor((values.length - 1) * p)] ?? 0;
  const steps = [q(0.25), q(0.5), q(0.75), q(0.92)];
  const level = (v) => (!v ? 0 : 1 + steps.filter((s) => v > s).length);
  const opacity = [0, 0.22, 0.4, 0.6, 0.8, 1];

  const columns = [];
  for (let w = 0; w < weeks; w += 1) {
    const col = [];
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const future = date > today;
      const v = totals[date.toDateString()] || 0;
      col.push({ date, v, future, level: level(v) });
    }
    columns.push(col);
  }

  const monthLabels = columns.map((col, i) => {
    const first = col[0].date;
    const prev = columns[i - 1]?.[0].date;
    return !prev || prev.getMonth() !== first.getMonth()
      ? first.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")
      : "";
  });

  return (
    <div className="hidden-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
      <div className="inline-flex min-w-full flex-col gap-1.5">
        <div className="flex gap-[5px] pl-8 text-[10px] font-semibold capitalize text-slate-400">
          {monthLabels.map((l, i) => (
            <span key={i} className="w-[15px] shrink-0 overflow-visible whitespace-nowrap md:w-[18px]">
              {l}
            </span>
          ))}
        </div>
        <div className="flex gap-[5px]">
          <div className="flex w-7 shrink-0 flex-col justify-between py-0.5 text-[10px] font-semibold text-slate-400">
            <span>Lun</span>
            <span>Jue</span>
            <span>Dom</span>
          </div>
          {columns.map((col, w) => (
            <div key={w} className="flex flex-col gap-[5px]">
              {col.map((c) => (
                <span
                  key={c.date.toISOString()}
                  title={c.future ? "" : `${c.date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}: ${formatMoney(c.v)}`}
                  className={`block h-[15px] w-[15px] rounded-[4px] md:h-[18px] md:w-[18px] ${c.future ? "opacity-0" : c.level === 0 ? "bg-slate-100" : ""} transition-transform hover:scale-125`}
                  style={{
                    backgroundColor: c.level > 0 ? EXPENSE_COLOR : undefined,
                    opacity: c.level > 0 ? opacity[c.level] : undefined,
                    animation: `cellIn 0.4s cubic-bezier(0.2,0.9,0.3,1.3) ${w * 30}ms backwards`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-slate-400">
          Menos
          {opacity.map((o, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-[3px] ${i === 0 ? "bg-slate-100" : ""}`}
              style={i ? { backgroundColor: EXPENSE_COLOR, opacity: o } : undefined}
            />
          ))}
          Más
        </div>
      </div>
    </div>
  );
}
