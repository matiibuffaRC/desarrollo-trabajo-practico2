import { useEffect, useRef, useState } from "react";
import { useApp } from "../../lib/AppContext";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatMoney,
  fromInputDate,
  toInputDate,
  signedAmount,
} from "../../lib/finance";
import { XIcon } from "./Icons";

function MovementForm() {
  const { form, closeForm, saveMovement, total, showToast } = useApp();
  const editing = form.movement && !form.movement.__duplicate ? form.movement : null;
  const source = form.movement;

  const [tipo, setTipo] = useState(source?.tipo || form.tipo || "Gasto");
  const [monto, setMonto] = useState(source ? String(source.monto) : "");
  const [categoria, setCategoria] = useState(source?.categoria || "");
  const [descripcion, setDescripcion] = useState(source?.descripcion || "");
  const [fecha, setFecha] = useState(toInputDate(editing ? editing.fecha : new Date()));
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const amountRef = useRef(null);

  const categories = tipo === "Gasto" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    setTimeout(() => amountRef.current?.focus(), 250);
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setShow(false);
    setTimeout(closeForm, 220);
  }

  const changeTipo = (t) => {
    setTipo(t);
    setCategoria("");
    setErrors({});
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
    if (Object.keys(next).length) return;

    const keepTime = editing && toInputDate(editing.fecha) === fecha;
    const mov = {
      ...(editing || {}),
      id: editing?.id || crypto.randomUUID(),
      tipo,
      monto: Math.round(amount * 100) / 100,
      categoria,
      descripcion: descripcion.trim() || categoria,
      fecha: keepTime ? editing.fecha : fromInputDate(fecha).toISOString(),
    };
    delete mov.isMock;
    saveMovement(mov);
    showToast(editing ? "Cambios guardados" : `${tipo} de ${formatMoney(mov.monto)} agregado`);
    handleClose();
  }

  const isExpense = tipo === "Gasto";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200 md:items-center md:pl-60 ${show ? "opacity-100" : "opacity-0"}`}
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-form-title"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`safe-bottom max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl transition-transform duration-200 md:max-w-lg md:rounded-[32px] md:p-7 ${show ? "translate-y-0" : "translate-y-full md:translate-y-6"}`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 md:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 id="movement-form-title" className="text-xl font-extrabold">
            {editing ? "Editar movimiento" : "Nuevo movimiento"}
          </h2>
          <button type="button" onClick={handleClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>

        {/* Tipo */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          {["Gasto", "Ingreso"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeTipo(t)}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                tipo === t ? `bg-white shadow-sm ${t === "Gasto" ? "text-expense" : "text-income"}` : "text-slate-500"
              }`}
            >
              {t === "Gasto" ? "− Gasto" : "+ Ingreso"}
            </button>
          ))}
        </div>

        {/* Monto */}
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monto</span>
          <div className={`mt-1 flex items-center gap-1 border-b-2 pb-1 transition ${errors.monto ? "border-rose-400" : "border-slate-200 focus-within:border-brand-500"}`}>
            <span className={`text-3xl font-extrabold ${isExpense ? "text-expense" : "text-income"}`}>$</span>
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
          <div className="mt-2 grid grid-cols-4 gap-2">
            {categories.map((c) => {
              const active = categoria === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setCategoria(c.name);
                    setErrors((er) => ({ ...er, categoria: undefined }));
                  }}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-[11px] font-semibold transition ${
                    active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                  }`}
                  aria-pressed={active}
                >
                  <span className="text-xl leading-none">{c.icon}</span>
                  <span className="w-full break-words text-center text-[10.5px] leading-tight sm:text-[11px]">{{ Entretenimiento: "Ocio", Transporte: "Transp.", "Otros ingresos": "Otros" }[c.name] || c.name}</span>
                </button>
              );
            })}
          </div>
          {errors.categoria && <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.categoria}</p>}
        </div>

        {/* Descripción + fecha */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Descripción</span>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={categoria ? `Ej: ${categoria}` : "Opcional"}
              maxLength={60}
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha</span>
            <input
              type="date"
              value={fecha}
              max={toInputDate(new Date())}
              onChange={(e) => setFecha(e.target.value)}
              className="input mt-1"
            />
            {errors.fecha && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.fecha}</p>}
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleClose} className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-[2] rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition hover:bg-black active:scale-[0.99]"
          >
            {editing ? "Guardar cambios" : `Agregar ${tipo.toLowerCase()}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MovementForm;
