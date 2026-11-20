import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { signedAmount, dueOccurrences, movementFromRule } from "./finance";

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

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

const DEFAULT_PROFILE = {
  name: "Matías Buffa",
  email: "usuario@email.com",
  currency: "ARS",
  joinDate: new Date().toISOString(),
};

const darkQuery = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)");

export function AppProvider({ children }) {
  const [movements, setMovements] = useState(() => readJSON("movements", [], Array.isArray));
  const [monthlyLimit, setMonthlyLimit] = useState(() => {
    const n = Number(readJSON("monthlyLimit", 900000));
    return Number.isFinite(n) && n > 0 ? n : 900000;
  });
  const [profile, setProfile] = useState(() => ({ ...DEFAULT_PROFILE, ...readJSON("profile", {}) }));
  const [budgets, setBudgets] = useState(() => readJSON("categoryBudgets", {}, isPlainObject));
  const [goals, setGoals] = useState(() => readJSON("goals", [], Array.isArray));
  const [recurring, setRecurring] = useState(() => readJSON("recurring", [], Array.isArray));

  // ---------- Tema (claro / oscuro / sistema) ----------
  const [theme, setTheme] = useState(() => readJSON("theme", "system", (v) => ["light", "dark", "system"].includes(v)));
  const [systemDark, setSystemDark] = useState(() => !!darkQuery()?.matches);
  useEffect(() => {
    const mq = darkQuery();
    if (!mq) return;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#0c0c12" : "#f5f5fa");
  }, [isDark]);

  // ---------- Modo privacidad ----------
  const [privacy, setPrivacy] = useState(() => readJSON("privacy", false) === true);
  useEffect(() => {
    document.documentElement.classList.toggle("privacy", privacy);
  }, [privacy]);

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
  useEffect(() => { writeJSON("categoryBudgets", budgets); }, [budgets]);
  useEffect(() => { writeJSON("goals", goals); }, [goals]);
  useEffect(() => { writeJSON("recurring", recurring); }, [recurring]);
  useEffect(() => { writeJSON("theme", theme); }, [theme]);
  useEffect(() => { writeJSON("privacy", privacy); }, [privacy]);

  // ---------- Recurrentes: registra automáticamente las repeticiones vencidas ----------
  // Los ids son deterministas (regla + fecha), así que correrlo dos veces no duplica nada.
  useEffect(() => {
    // Se difiere un tick: así el render inicial no espera y StrictMode no lo ejecuta dos veces.
    const timer = setTimeout(() => {
    const now = new Date();
    const created = [];
    const nextRules = recurring.map((r) => {
      if (!r.active) return r;
      const due = dueOccurrences(r, now);
      if (!due.length) return r;
      due.forEach((d) => created.push(movementFromRule(r, d)));
      return { ...r, lastRun: due[due.length - 1].toISOString() };
    });
    if (!created.length) return;
    setRecurring(nextRules);
    setMovements((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const add = created.filter((m) => !ids.has(m.id));
      return add.length ? [...prev, ...add] : prev;
    });
    showToast(
      created.length === 1
        ? `Se registró "${created[0].descripcion}" (recurrente)`
        : `Se registraron ${created.length} movimientos recurrentes`
    );
    }, 0);
    return () => clearTimeout(timer);
  }, [recurring, showToast]);

  const total = useMemo(() => movements.reduce((acc, m) => acc + signedAmount(m), 0), [movements]);

  const saveMovement = useCallback((mov) => {
    setMovements((prev) => {
      const exists = prev.some((m) => m.id === mov.id);
      return exists ? prev.map((m) => (m.id === mov.id ? mov : m)) : [...prev, mov];
    });
  }, []);

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

  const resetAll = useCallback(() => {
    setMovements([]);
    setGoals([]);
    setRecurring([]);
    setBudgets({});
  }, []);

  const value = {
    movements,
    setMovements,
    total,
    monthlyLimit,
    setMonthlyLimit,
    profile,
    setProfile,
    budgets,
    setBudgets,
    goals,
    setGoals,
    recurring,
    setRecurring,
    theme,
    setTheme,
    isDark,
    privacy,
    setPrivacy,
    form,
    openForm,
    closeForm,
    toast,
    showToast,
    dismissToast,
    saveMovement,
    deleteMovements,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
