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

const AXIS = { fontSize: 11, fill: "#898781" };
const GRID = "#e9e8e2";

export function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;
  const title = labelFormatter ? labelFormatter(label, payload) : label;
  return (
    <div className="rounded-xl border border-black/5 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
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
      <span className="text-2xl">📊</span>
      <p className="max-w-[220px] text-sm text-slate-400">{message}</p>
    </div>
  );
}

// Dona de gastos por categoría con total al centro
export function CategoryDonut({ data, height = 220 }) {
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
            stroke="#fff"
            strokeWidth={2}
            isAnimationActive
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
        <p className="num text-lg font-extrabold">{formatCompact(total)}</p>
      </div>
    </div>
  );
}

// Lista de categorías con barra de proporción
export function CategoryList({ data, limit }) {
  const rows = limit ? [...data].sort((a, b) => b.value - a.value).slice(0, limit) : data;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((d) => (
        <li key={d.name}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-semibold">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: d.color }} />
              <span className="truncate">
                {d.icon} {d.name}
              </span>
            </span>
            <span className="num shrink-0 font-bold">
              {formatMoney(d.value)} <span className="ml-1 text-xs font-semibold text-slate-400">{d.pct.toFixed(0)}%</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Barras agrupadas: ingresos vs gastos por mes
export function IncomeExpenseBars({ data, height = 260 }) {
  if (!data.some((d) => d.ingresos || d.gastos)) return <EmptyChart height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={52} />
          <Tooltip
            content={<ChartTooltip labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />}
            cursor={{ fill: "rgba(18,18,26,0.04)" }}
          />
          <Bar dataKey="ingresos" name="Ingresos" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="gastos" name="Gastos" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Área con la evolución del saldo
export function BalanceArea({ data, height = 220, compact = false, color = "#5b4cff" }) {
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
          {!compact && <CartesianGrid vertical={false} stroke={GRID} />}
          <XAxis dataKey="name" hide={compact} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis hide={compact} tick={AXIS} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={52} domain={["auto", "auto"]} />
          {!compact && <ReferenceLine y={0} stroke="#c3c2b7" />}
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }} />
          <Area
            type="monotone"
            dataKey="saldo"
            name="Saldo"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Barras simples (ej: gasto por día de la semana)
export function SimpleBars({ data, dataKey = "value", name = "Gastos", color = EXPENSE_COLOR, height = 200, highlightMax = true }) {
  if (!data.some((d) => d[dataKey])) return <EmptyChart height={height} />;
  const max = Math.max(...data.map((d) => d[dataKey]));
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={52} />
          <Tooltip content={<ChartTooltip labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />} cursor={{ fill: "rgba(18,18,26,0.04)" }} />
          <Bar dataKey={dataKey} name={name} radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((d) => (
              <Cell key={d.name} fill={color} fillOpacity={highlightMax && d[dataKey] !== max ? 0.45 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
