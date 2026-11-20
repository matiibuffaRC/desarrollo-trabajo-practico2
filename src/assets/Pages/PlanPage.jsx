import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  FREQUENCIES,
  GOAL_ICONS,
  GOAL_COLORS,
  formatMoney,
  formatCompact,
  isSameMonth,
  getCategory,
  goalInsight,
  nextOccurrence,
  relativeDays,
  monthlyEquivalent,
  frequencyLabel,
  toInputDate,
  fromInputDate,
} from "../../lib/finance";
import PageHeader from "../Components/PageHeader";
import Modal from "../Components/Modal";
import ConfirmDialog from "../Components/ConfirmDialog";
import ProgressRing from "../Components/ProgressRing";
import AnimatedNumber from "../Components/AnimatedNumber";
import { PlusIcon, MinusIcon, EditIcon, TrashIcon, TargetIcon, PieIcon, RepeatIcon, PauseIcon, PlayIcon, CheckIcon } from "../Components/Icons";

const SECTIONS = [
  { id: "metas", label: "Metas", Icon: TargetIcon },
  { id: "presupuestos", label: "Presupuestos", Icon: PieIcon },
  { id: "recurrentes", label: "Recurrentes", Icon: RepeatIcon },
];

// Resalta la sección visible mientras se hace scroll
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return [active, setActive];
}

const SECTION_IDS = SECTIONS.map((s) => s.id);

function PlanPage() {
  const { hash } = useLocation();
  const [active, setActive] = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
    return () => clearTimeout(t);
  }, [hash]);

  const goTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <PageHeader eyebrow="Objetivos" title="Planificar" subtitle="Metas de ahorro, presupuestos por categoría y pagos que se repiten." />

      {/* Sub-navegación fija con indicador */}
      <div className="sticky top-3 z-30 mb-6 flex justify-center md:top-4">
        <div className="relative grid grid-cols-3 gap-1 rounded-2xl border border-[var(--line)] bg-white/85 p-1 shadow-lg backdrop-blur-xl">
          <span
            className="absolute bottom-1 left-1 top-1 w-[calc((100%-16px)/3)] rounded-xl bg-ink transition-transform duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1.2)]"
            style={{ transform: `translateX(calc(${SECTION_IDS.indexOf(active)} * (100% + 4px)))` }}
            aria-hidden="true"
          />
          {SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => goTo(id)}
              className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${
                active === id ? "text-white" : "text-slate-500 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <GoalsSection />
        <BudgetsSection />
        <RecurringSection />
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div data-reveal className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const primaryBtn =
  "group flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black active:scale-[0.98]";

/* ======================= METAS ======================= */
function GoalsSection() {
  const { goals, setGoals, showToast } = useApp();
  const [editing, setEditing] = useState(null); // null | "new" | goal
  const [contrib, setContrib] = useState(null); // { goal, mode }
  const [toDelete, setToDelete] = useState(null);

  const totals = useMemo(
    () => ({ saved: goals.reduce((a, g) => a + g.saved, 0), target: goals.reduce((a, g) => a + g.target, 0) }),
    [goals]
  );

  return (
    <section id="metas" className="scroll-mt-24">
      <SectionTitle
        title="Metas de ahorro"
        subtitle={
          goals.length ? (
            <>
              Ahorraste <b className="num text-ink">{formatMoney(totals.saved)}</b> de <span className="num">{formatMoney(totals.target)}</span>
            </>
          ) : (
            "Poné un objetivo y seguí tu progreso."
          )
        }
        action={
          <button onClick={() => setEditing("new")} className={primaryBtn}>
            <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Nueva meta
          </button>
        }
      />

      {goals.length === 0 ? (
        <button
          onClick={() => setEditing("new")}
          className="card card-hover flex w-full flex-col items-center gap-3 border-2 border-dashed !border-slate-200 px-6 py-10 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl">🎯</span>
          <span className="font-bold">Creá tu primera meta</span>
          <span className="max-w-xs text-sm text-slate-500">Un viaje, un fondo de emergencia o una compra grande: separá tu ahorro y mirá cuánto te falta.</span>
        </button>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((g) => {
            const ins = goalInsight(g);
            return (
              <article key={g.id} className="card card-hover relative overflow-hidden p-5">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: g.color }} />
                <div className="relative flex items-start gap-4">
                  <ProgressRing pct={ins.pct} color={g.color} size={84}>
                    <span className="text-2xl leading-none">{ins.done ? "🏆" : g.icon}</span>
                    <span className="no-privacy mt-0.5 text-[11px] font-extrabold">{ins.pct.toFixed(0)}%</span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-extrabold">{g.name}</h3>
                      <div className="-mr-2 -mt-1 flex shrink-0">
                        <IconBtn label="Editar meta" onClick={() => setEditing(g)}>
                          <EditIcon className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn label="Eliminar meta" danger onClick={() => setToDelete(g)}>
                          <TrashIcon className="h-3.5 w-3.5" />
                        </IconBtn>
                      </div>
                    </div>
                    <p className="num mt-1 text-lg font-extrabold leading-tight">
                      <AnimatedNumber value={g.saved} />
                    </p>
                    <p className="num text-xs text-slate-500">de {formatMoney(g.target)}</p>
                  </div>
                </div>

                <div className="relative mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {ins.done ? (
                    <span className="flex items-center gap-1.5 font-bold text-income">
                      <CheckIcon className="h-4 w-4" /> ¡Meta cumplida!
                    </span>
                  ) : ins.monthly !== null ? (
                    <>
                      Faltan <b className="num">{formatMoney(ins.remaining)}</b> · ahorrá <b className="num">{formatCompact(ins.monthly)}</b>/mes
                      {ins.monthsLeft > 0 ? ` durante ${ins.monthsLeft} ${ins.monthsLeft === 1 ? "mes" : "meses"}` : " (vence este mes)"}
                    </>
                  ) : (
                    <>
                      Faltan <b className="num">{formatMoney(ins.remaining)}</b>
                    </>
                  )}
                </div>

                <div className="relative mt-3 flex gap-2">
                  <button
                    onClick={() => setContrib({ goal: g, mode: "add" })}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-sm font-bold text-snow transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
                    style={{ backgroundColor: g.color }}
                  >
                    <PlusIcon className="h-4 w-4" /> Aportar
                  </button>
                  <button
                    onClick={() => setContrib({ goal: g, mode: "remove" })}
                    disabled={g.saved <= 0}
                    className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200 disabled:opacity-40"
                    aria-label="Retirar"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <GoalForm
          goal={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(goal) => {
            setGoals((prev) => (prev.some((x) => x.id === goal.id) ? prev.map((x) => (x.id === goal.id ? goal : x)) : [...prev, goal]));
            showToast(editing === "new" ? `Meta "${goal.name}" creada` : "Meta actualizada");
          }}
        />
      )}

      {contrib && (
        <ContributionForm
          {...contrib}
          onClose={() => setContrib(null)}
          onSave={(amount) => {
            const { goal, mode } = contrib;
            const delta = mode === "add" ? amount : -Math.min(amount, goal.saved);
            const wasDone = goalInsight(goal).done;
            setGoals((prev) =>
              prev.map((x) =>
                x.id === goal.id
                  ? {
                      ...x,
                      saved: Math.round((x.saved + delta) * 100) / 100,
                      history: [...(x.history || []), { id: crypto.randomUUID(), date: new Date().toISOString(), amount: delta }],
                    }
                  : x
              )
            );
            const nowDone = goal.saved + delta >= goal.target;
            showToast(nowDone && !wasDone ? `🎉 ¡Completaste "${goal.name}"!` : `${mode === "add" ? "Aportaste" : "Retiraste"} ${formatMoney(Math.abs(delta))}`);
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="¿Eliminar meta?"
          message={`Se elimina "${toDelete.name}" y su historial de aportes. Tus movimientos no se tocan.`}
          confirmLabel="Eliminar"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            setGoals((prev) => prev.filter((g) => g.id !== toDelete.id));
            setToDelete(null);
            showToast("Meta eliminada");
          }}
        />
      )}
    </section>
  );
}

function GoalForm({ goal, onClose, onSave }) {
  const [name, setName] = useState(goal?.name || "");
  const [target, setTarget] = useState(goal ? String(goal.target) : "");
  const [saved, setSaved] = useState(goal ? String(goal.saved) : "");
  const [deadline, setDeadline] = useState(goal?.deadline ? toInputDate(goal.deadline) : "");
  const [icon, setIcon] = useState(goal?.icon || GOAL_ICONS[0]);
  const [color, setColor] = useState(goal?.color || GOAL_COLORS[0]);
  const [error, setError] = useState("");

  const submit = (close) => (e) => {
    e.preventDefault();
    const t = Number(target);
    const s = saved === "" ? 0 : Number(saved);
    if (!name.trim()) return setError("Poné un nombre");
    if (!Number.isFinite(t) || t <= 0) return setError("El objetivo tiene que ser mayor a 0");
    if (!Number.isFinite(s) || s < 0) return setError("El monto ahorrado no es válido");
    onSave({
      ...(goal || { id: crypto.randomUUID(), createdAt: new Date().toISOString(), history: [] }),
      name: name.trim(),
      target: t,
      saved: s,
      deadline: deadline ? fromInputDate(deadline).toISOString() : null,
      icon,
      color,
    });
    close();
  };

  return (
    <Modal title={goal ? "Editar meta" : "Nueva meta"} onClose={onClose}>
      {(close) => (
        <form onSubmit={submit(close)} noValidate className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              key={icon + color}
              className="animate-pop flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: `${color}26` }}
            >
              {icon}
            </span>
            <label className="block flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nombre</span>
              <input className="input mt-1" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Ej: Vacaciones" autoFocus />
            </label>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ícono</span>
            <div className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
              {GOAL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`flex h-10 items-center justify-center rounded-xl text-xl transition active:scale-90 ${icon === ic ? "bg-brand-50 ring-2 ring-brand-500" : "bg-slate-50 hover:bg-slate-100"}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Color</span>
            <div className="mt-2 flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={`h-8 w-8 rounded-full transition hover:scale-110 ${color === c ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-white" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MoneyInput label="Objetivo" value={target} onChange={setTarget} />
            <MoneyInput label="Ya ahorrado" value={saved} onChange={setSaved} placeholder="0" />
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha límite (opcional)</span>
            <input type="date" className="input mt-1" value={deadline} min={toInputDate(new Date())} onChange={(e) => setDeadline(e.target.value)} />
          </label>

          {error && <p className="animate-fade-up text-xs font-semibold text-rose-500">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button type="button" onClick={close} className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-200">
              Cancelar
            </button>
            <button type="submit" className="flex-[2] rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition hover:bg-black active:scale-[0.98]">
              {goal ? "Guardar cambios" : "Crear meta"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function ContributionForm({ goal, mode, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const remaining = Math.max(0, goal.target - goal.saved);
  const quick = mode === "add" ? [5000, 10000, 25000, 50000].filter((n) => n <= Math.max(remaining, 5000)) : [];

  const submit = (close) => (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return setError("Ingresá un monto mayor a 0");
    if (mode === "remove" && n > goal.saved) return setError(`Solo tenés ${formatMoney(goal.saved)} en esta meta`);
    onSave(n);
    close();
  };

  return (
    <Modal title={`${mode === "add" ? "Aportar a" : "Retirar de"} ${goal.name}`} onClose={onClose} maxWidth="md:max-w-sm">
      {(close) => (
        <form onSubmit={submit(close)} noValidate>
          <MoneyInput big value={amount} onChange={setAmount} autoFocus />
          <p className="num mt-2 text-xs text-slate-500">
            {mode === "add" ? `Te faltan ${formatMoney(remaining)}` : `Disponible en la meta: ${formatMoney(goal.saved)}`}
          </p>
          {quick.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {quick.map((n) => (
                <button key={n} type="button" className="chip num" onClick={() => setAmount(String(n))}>
                  +{formatCompact(n)}
                </button>
              ))}
              {remaining > 0 && (
                <button type="button" className="chip" onClick={() => setAmount(String(remaining))}>
                  Completar
                </button>
              )}
            </div>
          )}
          {error && <p className="animate-fade-up mt-2 text-xs font-semibold text-rose-500">{error}</p>}
          <button
            type="submit"
            className="mt-6 w-full rounded-2xl py-3.5 text-sm font-bold text-snow transition hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: mode === "add" ? goal.color : "#d03b3b" }}
          >
            {mode === "add" ? "Aportar" : "Retirar"}
          </button>
        </form>
      )}
    </Modal>
  );
}

/* ======================= PRESUPUESTOS ======================= */
function BudgetsSection() {
  const { movements, budgets, setBudgets, monthlyLimit, showToast } = useApp();
  const [editing, setEditing] = useState(null); // nombre de categoría
  const [value, setValue] = useState("");

  const spent = useMemo(() => {
    const now = new Date();
    const out = {};
    movements.forEach((m) => {
      if (m.tipo !== "Gasto" || !isSameMonth(new Date(m.fecha), now)) return;
      const name = getCategory(m).name;
      out[name] = (out[name] || 0) + Number(m.monto || 0);
    });
    return out;
  }, [movements]);

  const assigned = Object.values(budgets).reduce((a, b) => a + b, 0);

  const save = (name) => {
    const n = Number(value);
    setBudgets((prev) => {
      const next = { ...prev };
      if (!value || !Number.isFinite(n) || n <= 0) delete next[name];
      else next[name] = n;
      return next;
    });
    setEditing(null);
    showToast(!value || n <= 0 ? `Presupuesto de ${name} quitado` : `Presupuesto de ${name}: ${formatMoney(n)}`);
  };

  // Primero las categorías con presupuesto, ordenadas por % usado
  const rows = [...EXPENSE_CATEGORIES].sort((a, b) => {
    const pa = budgets[a.name] ? (spent[a.name] || 0) / budgets[a.name] : -1;
    const pb = budgets[b.name] ? (spent[b.name] || 0) / budgets[b.name] : -1;
    return pb - pa;
  });

  return (
    <section id="presupuestos" className="scroll-mt-24">
      <SectionTitle
        title="Presupuestos por categoría"
        subtitle={
          <>
            Asignado <b className="num text-ink">{formatMoney(assigned)}</b> de tu límite mensual de <span className="num">{formatMoney(monthlyLimit)}</span>
            {assigned > monthlyLimit && <span className="ml-1 font-bold text-rose-600">· superás el límite</span>}
          </>
        }
      />

      <div className="card p-2 md:p-3">
        {/* Barra de reparto del límite mensual */}
        <div className="px-3 pb-3 pt-2">
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
            {EXPENSE_CATEGORIES.filter((c) => budgets[c.name]).map((c) => (
              <div
                key={c.name}
                className="fill-on-reveal h-full first:rounded-l-full"
                title={`${c.name}: ${formatMoney(budgets[c.name])}`}
                style={{ width: `${Math.min(100, (budgets[c.name] / Math.max(monthlyLimit, assigned)) * 100)}%`, backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>

        <ul className="flex flex-col">
          {rows.map((c, i) => {
            const budget = budgets[c.name];
            const used = spent[c.name] || 0;
            const pct = budget ? (used / budget) * 100 : 0;
            const tone = pct >= 100 ? "#d03b3b" : pct >= 80 ? "#ec835a" : c.color;
            const isEditing = editing === c.name;
            return (
              <li key={c.name} className="stagger-item rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${c.color}1f` }}>
                    {c.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold">{c.name}</p>
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditing(c.name);
                            setValue(budget ? String(budget) : "");
                          }}
                          className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold transition ${budget ? "text-slate-500 hover:bg-slate-100" : "bg-brand-50 text-brand-600 hover:bg-brand-100"}`}
                        >
                          {budget ? "Editar" : "+ Definir"}
                        </button>
                      )}
                    </div>
                    {!isEditing && (
                      <p className="num text-xs text-slate-500">
                        {formatMoney(used)}
                        {budget ? ` de ${formatMoney(budget)}` : " este mes"}
                        {budget > 0 && (
                          <span className="no-privacy ml-1.5 font-bold" style={{ color: pct >= 80 ? tone : undefined }}>
                            {pct >= 100 ? `+${formatCompact(used - budget)} excedido` : `${pct.toFixed(0)}%`}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="animate-fade-up mt-3 flex gap-2 pl-[52px]">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="1000"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") save(c.name);
                          if (e.key === "Escape") setEditing(null);
                        }}
                        placeholder="Sin presupuesto"
                        className="input num !rounded-xl !py-2 pl-7 text-sm"
                        autoFocus
                      />
                    </div>
                    <button onClick={() => save(c.name)} className="rounded-xl bg-ink px-3 text-sm font-bold text-white">
                      Guardar
                    </button>
                    <button onClick={() => setEditing(null)} className="rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-600">
                      ✕
                    </button>
                  </div>
                ) : (
                  budget > 0 && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 sm:ml-[52px]">
                      <div className="fill-on-reveal h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: tone }} />
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ======================= RECURRENTES ======================= */
function RecurringSection() {
  const { recurring, setRecurring, showToast } = useApp();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const list = useMemo(() => {
    const now = new Date();
    return recurring
      .map((r) => ({ rule: r, next: r.active ? nextOccurrence(r, now) : null }))
      .sort((a, b) => (a.next && b.next ? a.next - b.next : a.next ? -1 : b.next ? 1 : 0));
  }, [recurring]);

  const monthly = recurring
    .filter((r) => r.active)
    .reduce(
      (acc, r) => {
        acc[r.tipo === "Ingreso" ? "in" : "out"] += monthlyEquivalent(r);
        return acc;
      },
      { in: 0, out: 0 }
    );

  const toggle = (rule) => {
    // Al reactivar, no se recuperan las repeticiones que pasaron mientras estaba pausado
    setRecurring((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active, ...(!r.active ? { lastRun: new Date().toISOString() } : {}) } : r))
    );
    showToast(rule.active ? `"${rule.descripcion}" pausado` : `"${rule.descripcion}" reactivado`);
  };

  return (
    <section id="recurrentes" className="scroll-mt-24">
      <SectionTitle
        title="Movimientos recurrentes"
        subtitle="Se registran solos cuando llega la fecha: sueldo, alquiler, suscripciones…"
        action={
          <button onClick={() => setEditing("new")} className={primaryBtn}>
            <PlusIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Nuevo
          </button>
        }
      />

      {recurring.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="card card-hover p-4">
            <p className="text-xs font-semibold text-slate-400">Ingresos fijos / mes</p>
            <p className="num mt-1 truncate text-lg font-extrabold text-income">
              <AnimatedNumber value={monthly.in} />
            </p>
          </div>
          <div className="card card-hover p-4">
            <p className="text-xs font-semibold text-slate-400">Gastos fijos / mes</p>
            <p className="num mt-1 truncate text-lg font-extrabold text-expense">
              <AnimatedNumber value={monthly.out} />
            </p>
          </div>
        </div>
      )}

      <div className="card p-2 md:p-3">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <RepeatIcon className="h-7 w-7" />
            </span>
            <p className="font-bold">No tenés movimientos recurrentes</p>
            <p className="max-w-xs text-sm text-slate-500">Creá uno acá o marcá "Repetir" al cargar un movimiento.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {list.map(({ rule, next }, i) => {
              const cat = getCategory(rule);
              return (
                <li
                  key={rule.id}
                  className={`stagger-item flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50 ${rule.active ? "" : "opacity-55"}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: `${cat.color}1f` }}>
                    {cat.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold">{rule.descripcion}</p>
                    <p className="truncate text-xs text-slate-500">
                      {frequencyLabel(rule.frecuencia)} · {rule.active ? `Próximo: ${relativeDays(next)}` : "Pausado"}
                    </p>
                  </div>
                  <p className={`num shrink-0 text-[15px] font-extrabold ${rule.tipo === "Ingreso" ? "text-income" : ""}`}>
                    {rule.tipo === "Ingreso" ? "+" : "−"}
                    {formatMoney(rule.monto)}
                  </p>
                  <div className="flex shrink-0">
                    <IconBtn label={rule.active ? "Pausar" : "Reactivar"} onClick={() => toggle(rule)}>
                      {rule.active ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
                    </IconBtn>
                    <IconBtn label="Editar" onClick={() => setEditing(rule)}>
                      <EditIcon className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn label="Eliminar" danger onClick={() => setToDelete(rule)}>
                      <TrashIcon className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editing && (
        <RecurringForm
          rule={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(rule) => {
            setRecurring((prev) => (prev.some((r) => r.id === rule.id) ? prev.map((r) => (r.id === rule.id ? rule : r)) : [...prev, rule]));
            showToast(editing === "new" ? "Movimiento recurrente creado" : "Cambios guardados");
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="¿Eliminar recurrente?"
          message={`"${toDelete.descripcion}" deja de registrarse. Los movimientos que ya se cargaron se mantienen.`}
          confirmLabel="Eliminar"
          danger
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            setRecurring((prev) => prev.filter((r) => r.id !== toDelete.id));
            setToDelete(null);
            showToast("Recurrente eliminado");
          }}
        />
      )}
    </section>
  );
}

function RecurringForm({ rule, onClose, onSave }) {
  const [tipo, setTipo] = useState(rule?.tipo || "Gasto");
  const [monto, setMonto] = useState(rule ? String(rule.monto) : "");
  const [categoria, setCategoria] = useState(rule?.categoria || "");
  const [descripcion, setDescripcion] = useState(rule?.descripcion || "");
  const [frecuencia, setFrecuencia] = useState(rule?.frecuencia || "mensual");
  const [start, setStart] = useState(toInputDate(rule?.startDate || new Date()));
  const [error, setError] = useState("");
  const categories = tipo === "Gasto" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const submit = (close) => (e) => {
    e.preventDefault();
    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) return setError("Ingresá un monto mayor a 0");
    if (!categoria) return setError("Elegí una categoría");
    if (!start) return setError("Elegí la fecha de inicio");
    const startDate = fromInputDate(start);
    startDate.setHours(9, 0, 0, 0);
    // En una regla nueva, la fecha de inicio cuenta como primera repetición si ya pasó
    const isNew = !rule;
    onSave({
      ...(rule || { id: crypto.randomUUID(), createdAt: new Date().toISOString(), active: true }),
      tipo,
      monto: Math.round(n * 100) / 100,
      categoria,
      descripcion: descripcion.trim() || categoria,
      frecuencia,
      startDate: startDate.toISOString(),
      lastRun: isNew ? null : rule.lastRun,
    });
    close();
  };

  return (
    <Modal title={rule ? "Editar recurrente" : "Nuevo recurrente"} onClose={onClose}>
      {(close) => (
        <form onSubmit={submit(close)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            {["Gasto", "Ingreso"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTipo(t);
                  setCategoria("");
                }}
                className={`rounded-xl py-2.5 text-sm font-bold transition ${tipo === t ? `bg-white shadow-sm ${t === "Gasto" ? "text-expense" : "text-income"}` : "text-slate-500"}`}
              >
                {t === "Gasto" ? "− Gasto" : "+ Ingreso"}
              </button>
            ))}
          </div>

          <MoneyInput label="Monto" value={monto} onChange={setMonto} big autoFocus />

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Categoría</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button key={c.name} type="button" className="chip" data-active={categoria === c.name} onClick={() => setCategoria(c.name)}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Descripción</span>
            <input className="input mt-1" value={descripcion} maxLength={60} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Netflix, Alquiler…" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Frecuencia</span>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrecuencia(f.id)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition ${frecuencia === f.id ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{rule ? "Fecha de inicio" : "Primera fecha"}</span>
              <input type="date" className="input mt-1 !py-2" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
          </div>

          {!rule && fromInputDate(start || toInputDate(new Date())) < new Date() && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              Las repeticiones desde esa fecha hasta hoy se van a registrar automáticamente.
            </p>
          )}

          {error && <p className="animate-fade-up text-xs font-semibold text-rose-500">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button type="button" onClick={close} className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-200">
              Cancelar
            </button>
            <button type="submit" className="flex-[2] rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition hover:bg-black active:scale-[0.98]">
              {rule ? "Guardar cambios" : "Crear recurrente"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ======================= Compartidos ======================= */
function MoneyInput({ label, value, onChange, placeholder = "0,00", big = false, autoFocus = false }) {
  return (
    <label className="block">
      {label && <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>}
      {big ? (
        <div className="mt-1 flex items-center gap-1 border-b-2 border-slate-200 pb-1 transition-colors focus-within:border-brand-500">
          <span className="text-3xl font-extrabold text-slate-400">$</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="num w-full bg-transparent text-4xl font-extrabold outline-none placeholder:text-slate-300"
          />
        </div>
      ) : (
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="input num pl-7"
          />
        </div>
      )}
    </label>
  );
}

function IconBtn({ children, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-full p-2 text-slate-400 transition hover:scale-110 ${danger ? "hover:bg-rose-50 hover:text-rose-600" : "hover:bg-slate-100 hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

export default PlanPage;
