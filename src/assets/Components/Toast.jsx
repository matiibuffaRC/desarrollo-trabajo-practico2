import { useApp } from "../../lib/AppContext";
import { CheckIcon } from "./Icons";

function Toast() {
  const { toast, dismissToast } = useApp();
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 md:bottom-8 md:pl-60" role="status" aria-live="polite">
      <div
        key={toast.id}
        className="keep-dark animate-pop pointer-events-auto relative flex max-w-md items-center gap-3 overflow-hidden rounded-2xl bg-ink py-3 pl-4 pr-3 text-sm text-white shadow-2xl ring-1 ring-white/10"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
        <span className="font-medium">{toast.message}</span>
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick();
              dismissToast();
            }}
            className="ml-2 rounded-lg px-2 py-1 font-bold text-brand-200 hover:bg-white/10"
          >
            {toast.action.label}
          </button>
        )}
        {/* Cuenta regresiva hasta que se cierra */}
        <span
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white/30"
          style={{ animation: "toastBar 4.5s linear forwards" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default Toast;
