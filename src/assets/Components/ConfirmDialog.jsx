import { useEffect } from "react";

function ConfirmDialog({ title, message, confirmLabel = "Confirmar", danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px] md:pl-60"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      role="alertdialog"
      aria-modal="true"
    >
      <div className="animate-pop w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`flex-1 rounded-2xl py-3 text-sm font-bold text-white ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-ink hover:bg-black"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
