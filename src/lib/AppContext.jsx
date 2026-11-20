import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { signedAmount } from "./finance";

const AppContext = createContext(null);

const readJSON = (key, fallback, validate = () => true) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
};

const DEFAULT_PROFILE = {
  name: "Matías Buffa",
  email: "usuario@email.com",
  currency: "ARS",
  joinDate: new Date().toISOString(),
};

export function AppProvider({ children }) {
  const [movements, setMovements] = useState(() => readJSON("movements", [], Array.isArray));
  const [monthlyLimit, setMonthlyLimit] = useState(() => {
    const n = Number(readJSON("monthlyLimit", 900000));
    return Number.isFinite(n) && n > 0 ? n : 900000;
  });
  const [profile, setProfile] = useState(() => ({ ...DEFAULT_PROFILE, ...readJSON("profile", {}) }));

  // Formulario global (lo abre el botón flotante desde cualquier página)
  const [form, setForm] = useState({ open: false, movement: null, tipo: "Gasto" });
  const openForm = useCallback((movement = null, tipo = "Gasto") => setForm({ open: true, movement, tipo }), []);
  const closeForm = useCallback(() => setForm((f) => ({ ...f, open: false, movement: null })), []);

  // Toasts
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((message, action) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, action });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => { writeJSON("movements", movements); }, [movements]);
  useEffect(() => { writeJSON("monthlyLimit", monthlyLimit); }, [monthlyLimit]);
  useEffect(() => { writeJSON("profile", profile); }, [profile]);

  const total = useMemo(() => movements.reduce((acc, m) => acc + signedAmount(m), 0), [movements]);

  const saveMovement = useCallback(
    (mov) => {
      setMovements((prev) => {
        const exists = prev.some((m) => m.id === mov.id);
        return exists ? prev.map((m) => (m.id === mov.id ? mov : m)) : [...prev, mov];
      });
    },
    []
  );

  const deleteMovements = useCallback(
    (ids) => {
      const set = new Set(ids);
      const removed = movements.filter((m) => set.has(m.id));
      if (!removed.length) return;
      setMovements((prev) => prev.filter((m) => !set.has(m.id)));
      showToast(removed.length === 1 ? "Movimiento eliminado" : `${removed.length} movimientos eliminados`, {
        label: "Deshacer",
        onClick: () => setMovements((prev) => [...prev, ...removed]),
      });
    },
    [movements, showToast]
  );

  const value = {
    movements,
    setMovements,
    total,
    monthlyLimit,
    setMonthlyLimit,
    profile,
    setProfile,
    form,
    openForm,
    closeForm,
    toast,
    showToast,
    dismissToast,
    saveMovement,
    deleteMovements,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
