import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../lib/AppContext";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  FREQUENCIES,
  formatMoney,
  fromInputDate,
  toInputDate,
  signedAmount,
  occurrenceId,
} from "../../lib/finance";
import { XIcon, RepeatIcon, AppIcon } from "./Icons";

function MovementForm() {
  const { form, closeForm, saveMovement, total, showToast, movements, setRecurring } = useApp();
  const editing = form.movement && !form.movement.__duplicate ? form.movement : null;
  const source = form.movement;

  const [tipo, setTipo] = useState(source?.tipo || form.tipo || "Gasto");
  const [monto, setMonto] = useState(source ? String(source.monto) : "");
  const [categoria, setCategoria] = useState(source?.categoria || "");
  const [descripcion, setDescripcion] = useState(source?.descripcion || "");
  const [fecha, setFecha] = useState(toInputDate(editing ? editing.fecha : new Date()));
  const [repeat, setRepeat] = useState(""); // "" | semanal | mensual | anual
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(0);
  const [show, setShow] = useState(false);
  const amountRef = useRef(null);

  const categories = tipo === "Gasto" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Sugerencias: descripciones usadas antes de este tipo, con su última categoría
  const suggestions = useMemo(() => {
    const map = new Map();
    [...movements]
      .filter((m) => m.tipo === tipo && m.descripcion)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .forEach((m) => !map.has(m.descripcion) && map.set(m.descripcion, m));
    return map;
  }, [movements, tipo]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    const focus = setTimeout(() => amountRef.current?.focus(), 280);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(focus);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setShow(false);
    setTimeout(closeForm, 260);
  }

  const changeTipo = (t) => {
    setTipo(t);
    setCategoria("");
    setErrors({});
  };

  const onDescripcion = (value) => {
    setDescripcion(value);
    const prev = suggestions.get(value);
    if (prev) {
      setCategoria(prev.categoria);
      if (!monto) setMonto(String(prev.monto));
    }
  };

  // Saldo disponible sin contar el movimiento que se está editando
  const available = editing ? total - signedAmount(editing) : total;

  function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(monto);
    const next = {};
    if (!monto || !Number.isFinite(amount) || amount <= 0) next.monto = "Ingresá un monto mayor a 0";
    if (!categoria) next.categoria = "Elegí una categoría";
    if (!fecha) next.fecha = "Elegí una fecha";
    else if (fromInputDate(fecha) > new Date(Date.now() + 60000)) next.fecha = "La fecha no puede ser futura";
    if (!next.monto && tipo === "Gasto" && amount > available)
      next.monto = `Saldo insuficiente. Disponible: ${formatMoney(available)}`;

    setErrors(next);
    if (Object.keys(next).length) {
      setShake((s) => s + 1);
      return;
    }

    const keepTime = editing && toInputDate(editing.fecha) === fecha;
    const date = keepTime ? new Date(editing.fecha) : fromInputDate(fecha);
    const desc = descripcion.trim() || categoria;
    const value = Math.round(amount * 100) / 100;

    let mov = {
      ...(editing || {}),
      id: editing?.id || crypto.randomUUID(),
      tipo,
      monto: value,
      categoria,
      descripcion: desc,
      fecha: date.toISOString(),
    };
    delete mov.isMock;
    delete mov.__duplicate;

    if (!editing && repeat) {
      const rule = {
        id: crypto.randomUUID(),
        tipo,
        monto: value,
        categoria,
        descripcion: desc,
        frecuencia: repeat,
        startDate: date.toISOString(),
        lastRun: date.toISOString(),
        active: true,
        createdAt: new Date().toISOString(),
      };
      mov = { ...mov, id: occurrenceId(rule, date), recurringId: rule.id };
      setRecurring((prev) => [...prev, rule]);
    }

    saveMovement(mov);
    showToast(
      editing
        ? "Cambios guardados"
        : `${tipo} de ${formatMoney(mov.monto)} agregado${repeat ? ` · se repite ${FREQUENCIES.find((f) => f.id === repeat).short}` : ""}`
    );
    handleClose();
  }

  const isExpense = tipo === "Gasto";

  return (
    <div
      className={`overlay fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 md:items-center md:pl-60 ${show ? "opacity-100" : "opacity-0"}`}
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-form-title"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`safe-bottom max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1.1)] md:max-w-lg md:rounded-[32px] md:p-7 ${
          show ? "translate-y-0 md:scale-100" : "translate-y-full md:translate-y-8 md:scale-95"
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 md:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 id="movement-form-title" className="text-xl font-extrabold">
            {editing ? "Editar movimiento" : "Nuevo movimiento"}
          </h2>
          <button type="button" onClick={handleClose} className="rounded-full p-2 text-slate-500 transition duration-300 hover:rotate-90 hover:bg-slate-100" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>

        {/* Tipo: con indicador que se desliza */}
        <div className="relative mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          <span
            className={`absolute bottom-1 left-0 top-1 w-[calc(50%-6px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1.2)] ${
              isExpense ? "translate-x-1" : "translate-x-[calc(100%+8px)]"
            }`}
            aria-hidden="true"
          />
          {["Gasto", "Ingreso"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeTipo(t)}
              className={`relative rounded-xl py-2.5 text-sm font-bold transition-colors ${
                tipo === t ? (t === "Gasto" ? "text-expense" : "text-income") : "text-slate-500"
              }`}
            >
              {t === "Gasto" ? "− Gasto" : "+ Ingreso"}
            </button>
          ))}
        </div>

        {/* Monto */}
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monto</span>
          <div
            key={shake}
            className={`mt-1 flex items-center gap-1 border-b-2 pb-1 transition-colors ${errors.monto ? "border-rose-400" : "border-slate-200 focus-within:border-brand-500"}`}
            style={errors.monto && shake ? { animation: "wiggle 0.3s ease 2" } : undefined}
          >
            <span className={`text-3xl font-extrabold transition-colors ${isExpense ? "text-expense" : "text-income"}`}>$</span>
            <input
              ref={amountRef}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0,00"
              className="num w-full bg-transparent text-4xl font-extrabold outline-none placeholder:text-slate-300"
            />
          </div>
        </label>
        <p className={`mt-1.5 min-h-4 text-xs ${errors.monto ? "font-semibold text-rose-500" : "text-slate-400"}`}>
          {errors.monto || (isExpense ? `Disponible: ${formatMoney(available)}` : "")}
        </p>

        {/* Categoría */}
        <div className="mt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Categoría</span>
          <div key={tipo} className="mt-2 grid grid-cols-4 gap-2">
            {categories.map((c, i) => {
              const active = categoria === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setCategoria(c.name);
                    setErrors((er) => ({ ...er, categoria: undefined }));
                  }}
                  className={`stagger-item flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-[11px] font-semibold transition-colors active:scale-95 ${
                    active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                  aria-pressed={active}
                >
                  <span className={`transition-transform duration-300 ${active ? "scale-125" : ""}`} style={{ color: c.color }}><AppIcon name={c.icon} className="h-5 w-5" /></span>
                  <span className="w-full break-words text-center text-[10.5px] leading-tight sm:text-[11px]">
                    {{ Entretenimiento: "Ocio", Transporte: "Transp.", "Otros ingresos": "Otros" }[c.name] || c.name}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.categoria && <p className="animate-fade-up mt-1.5 text-xs font-semibold text-rose-500">{errors.categoria}</p>}
        </div>

        {/* Descripción + fecha */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Descripción</span>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => onDescripcion(e.target.value)}
              placeholder={categoria ? `Ej: ${categoria}` : "Opcional"}
              maxLength={60}
              list="movement-suggestions"
              className="input mt-1"
            />
            <datalist id="movement-suggestions">
              {[...suggestions.keys()].slice(0, 30).map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha</span>
            <input type="date" value={fecha} max={toInputDate(new Date())} onChange={(e) => setFecha(e.target.value)} className="input mt-1" />
            {errors.fecha && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.fecha}</p>}
          </label>
        </div>

        {/* Repetir (solo al crear) */}
        {!editing && (
          <div className="mt-4">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <RepeatIcon className="h-3.5 w-3.5" /> Repetir
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[{ id: "", label: "No" }, ...FREQUENCIES].map((f) => (
                <button key={f.id || "no"} type="button" className="chip" data-active={repeat === f.id} onClick={() => setRepeat(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
            {repeat && (
              <p className="animate-fade-up mt-2 text-xs text-slate-500">
                Se va a registrar automáticamente {FREQUENCIES.find((f) => f.id === repeat).short}. Podés pausarlo desde <b>Planificar</b>.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleClose} className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
            Cancelar
          </button>
          <button type="submit" className="flex-[2] rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition hover:bg-black active:scale-[0.98]">
            {editing ? "Guardar cambios" : `Agregar ${tipo.toLowerCase()}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MovementForm;
