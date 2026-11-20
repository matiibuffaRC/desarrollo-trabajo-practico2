import { ChevronLeft, ChevronRight } from "./Icons";

// Devuelve [1, "…", 4, 5, 6, "…", 12]
function pageList(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(`gap-${p}`);
    result.push(p);
  });
  return result;
}

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) {
  if (totalItems === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="num no-privacy">
          {from}–{to} de {totalItems}
        </span>
        <span className="text-slate-300">·</span>
        <label className="flex items-center gap-1">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-600 outline-none"
            aria-label="Movimientos por página"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          por página
        </label>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Paginación">
          <PageBtn disabled={page === 1} onClick={() => onPageChange(page - 1)} label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </PageBtn>
          {pageList(page, totalPages).map((p) =>
            typeof p === "string" ? (
              <span key={p} className="w-6 text-center text-sm text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`num h-9 min-w-9 rounded-xl px-2 text-sm font-bold transition ${
                  p === page ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            )
          )}
          <PageBtn disabled={page === totalPages} onClick={() => onPageChange(page + 1)} label="Siguiente">
            <ChevronRight className="h-4 w-4" />
          </PageBtn>
        </nav>
      )}
    </div>
  );
}

function PageBtn({ children, disabled, onClick, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

export default Pagination;
