import { useApp } from "../../lib/AppContext";
import { CheckIcon } from "./Icons";

function Toast() {
  const { toast, dismissToast } = useApp();
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 md:bottom-8 md:pl-60" role="status" aria-live="polite">
      <div key={toast.id} className="animate-fade-up pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink py-3 pl-4 pr-3 text-sm text-white shadow-2xl">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
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
      </div>
    </div>
  );
}

export default Toast;
