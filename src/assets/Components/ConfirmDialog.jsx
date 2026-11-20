import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertIcon } from "./Icons";

function ConfirmDialog({ title, message, confirmLabel = "Confirmar", danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return createPortal(
    <div
      className="overlay animate-fade-up fixed inset-0 z-[55] flex items-center justify-center p-4 md:pl-60"
      style={{ animationDuration: "0.2s" }}
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      role="alertdialog"
      aria-modal="true"
    >
      <div className="animate-pop w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        {danger && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertIcon className="h-6 w-6" />
          </div>
        )}
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`flex-1 rounded-2xl py-3 text-sm font-bold transition active:scale-[0.98] ${danger ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-ink text-white hover:bg-black"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;
