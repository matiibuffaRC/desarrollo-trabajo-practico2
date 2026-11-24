import { formatMoney } from "../../lib/finance";

// Lista de categorías con barra de porcentaje (sin dependencias de gráficos)
export function CategoryList({ data, limit }) {
  const rows = limit ? [...data].sort((a, b) => b.value - a.value).slice(0, limit) : data;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((d, i) => (
        <li key={d.name}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-semibold">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: d.color }} />
              <span className="truncate">
                {d.name}
              </span>
            </span>
            <span className="num shrink-0 font-bold">
              {formatMoney(d.value)} <span className="no-privacy ml-1 text-xs font-semibold text-slate-400">{d.pct.toFixed(0)}%</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="fill-on-reveal h-full rounded-full"
              style={{ width: `${d.pct}%`, backgroundColor: d.color, transitionDelay: `${150 + i * 80}ms` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default CategoryList;
