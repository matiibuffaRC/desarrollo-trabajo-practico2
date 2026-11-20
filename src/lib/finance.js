// Utilidades compartidas: categorías, formateo, fechas y generación de datos de prueba.

// Paleta categórica en orden fijo (validada para daltonismo en pares adyacentes).
// El color sigue a la categoría, nunca a su posición en un ranking.
export const EXPENSE_CATEGORIES = [
  { name: "Comida", icon: "🍔", color: "#2a78d6" },
  { name: "Transporte", icon: "🚌", color: "#eb6834" },
  { name: "Servicios", icon: "💡", color: "#1baf7a" },
  { name: "Entretenimiento", icon: "🎬", color: "#eda100" },
  { name: "Compras", icon: "🛍️", color: "#e87ba4" },
  { name: "Salud", icon: "💊", color: "#008300" },
  { name: "Hogar", icon: "🏠", color: "#6250d6" },
  { name: "Otros", icon: "📦", color: "#898781" },
];

export const INCOME_CATEGORIES = [
  { name: "Sueldo", icon: "💼", color: "#1baf7a" },
  { name: "Freelance", icon: "💻", color: "#2a78d6" },
  { name: "Inversiones", icon: "📈", color: "#6250d6" },
  { name: "Otros ingresos", icon: "💰", color: "#898781" },
];

export const INCOME_COLOR = "#1baf7a";
export const EXPENSE_COLOR = "#eb6834";

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategory(mov) {
  const found = ALL_CATEGORIES.find((c) => c.name === mov?.categoria);
  if (found) return found;
  return mov?.tipo === "Ingreso"
    ? { name: "Ingreso", icon: "💰", color: INCOME_COLOR }
    : { name: mov?.categoria || "Otros", icon: "📦", color: "#898781" };
}

const currencyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFmt = new Intl.NumberFormat("es-AR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatMoney = (value) => currencyFmt.format(Number(value) || 0);
export const formatCompact = (value) => `$${compactFmt.format(Number(value) || 0)}`;

export const signedAmount = (mov) =>
  mov.tipo === "Ingreso" ? Number(mov.monto || 0) : -Number(mov.monto || 0);

export const sumBy = (list, tipo) =>
  list.reduce((acc, m) => (m.tipo === tipo ? acc + Number(m.monto || 0) : acc), 0);

// ---------- Fechas ----------
export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const isSameMonth = (a, b) =>
  a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

export const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const monthLabel = (d, opts = { month: "short" }) => {
  const label = d.toLocaleDateString("es-AR", opts).replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// yyyy-mm-dd en hora local (para <input type="date">)
export const toInputDate = (d) => {
  const x = new Date(d);
  const off = x.getTimezoneOffset();
  return new Date(x.getTime() - off * 60000).toISOString().slice(0, 10);
};

export const fromInputDate = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  const now = new Date();
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
};

export function dayLabel(date) {
  const d = startOfDay(date);
  const today = startOfDay(new Date());
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  const label = d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Agrupa movimientos por mes dentro de los últimos `months` meses (incluye meses vacíos).
export function monthlySeries(movements, months) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: monthKey(d),
      name: monthLabel(d),
      fullName: monthLabel(d, { month: "long", year: "numeric" }),
      ingresos: 0,
      gastos: 0,
    });
  }
  const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
  movements.forEach((m) => {
    const i = index[monthKey(new Date(m.fecha))];
    if (i === undefined) return;
    if (m.tipo === "Ingreso") buckets[i].ingresos += Number(m.monto || 0);
    else buckets[i].gastos += Number(m.monto || 0);
  });
  return buckets.map((b) => ({ ...b, neto: b.ingresos - b.gastos }));
}

// Evolución del saldo acumulado día a día en los últimos `days` días.
export function balanceSeries(movements, days) {
  const sorted = [...movements].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - (days - 1));

  let running = 0;
  let idx = 0;
  while (idx < sorted.length && new Date(sorted[idx].fecha) < start) {
    running += signedAmount(sorted[idx]);
    idx += 1;
  }

  const points = [];
  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const end = endOfDay(day);
    while (idx < sorted.length && new Date(sorted[idx].fecha) <= end) {
      running += signedAmount(sorted[idx]);
      idx += 1;
    }
    points.push({
      name: day.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).replace(".", ""),
      saldo: Math.round(running * 100) / 100,
    });
  }
  return points;
}

export function categoryBreakdown(movements) {
  const totals = {};
  movements.forEach((m) => {
    if (m.tipo !== "Gasto") return;
    const cat = getCategory(m);
    totals[cat.name] = (totals[cat.name] || 0) + Number(m.monto || 0);
  });
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  // Orden de la leyenda: categorías en su orden fijo, para que los colores no "salten".
  return EXPENSE_CATEGORIES.filter((c) => totals[c.name])
    .map((c) => ({ ...c, value: totals[c.name], pct: total ? (totals[c.name] / total) * 100 : 0 }))
    .concat(
      Object.keys(totals)
        .filter((n) => !EXPENSE_CATEGORIES.some((c) => c.name === n))
        .map((n) => ({ name: n, icon: "📦", color: "#898781", value: totals[n], pct: (totals[n] / total) * 100 }))
    );
}

// ---------- CSV ----------
export function exportCSV(movements, filename = "movimientos.csv") {
  const header = ["Fecha", "Tipo", "Categoría", "Descripción", "Monto"];
  const rows = movements.map((m) => [
    new Date(m.fecha).toLocaleDateString("es-AR"),
    m.tipo,
    m.categoria || "",
    `"${String(m.descripcion || "").replace(/"/g, '""')}"`,
    String(Number(m.monto || 0).toFixed(2)).replace(".", ","),
  ]);
  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Datos de prueba realistas ----------
const EXPENSE_TEMPLATES = {
  Comida: [["Supermercado", 18000, 65000], ["Delivery", 8000, 22000], ["Almuerzo", 6000, 14000], ["Verdulería", 4000, 12000], ["Café", 2500, 5500]],
  Transporte: [["Carga SUBE", 5000, 15000], ["Nafta", 25000, 60000], ["Uber", 4000, 12000], ["Estacionamiento", 3000, 8000]],
  Entretenimiento: [["Cine", 7000, 16000], ["Salida con amigos", 15000, 45000], ["Recital", 30000, 80000], ["Videojuego", 10000, 40000]],
  Compras: [["Ropa", 20000, 90000], ["Electrónica", 30000, 150000], ["Regalo", 10000, 40000]],
  Salud: [["Farmacia", 5000, 25000], ["Consulta médica", 15000, 40000]],
  Hogar: [["Artículos de limpieza", 6000, 18000], ["Ferretería", 5000, 30000]],
  Otros: [["Varios", 3000, 20000]],
};

const SUBSCRIPTIONS = [["Netflix", 9500, "Entretenimiento"], ["Spotify", 4500, "Entretenimiento"], ["Gimnasio", 28000, "Salud"]];

const rand = (min, max) => Math.round((Math.random() * (max - min) + min) / 10) * 10;
const randDay = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function generateMockMovements(months = 6) {
  const result = [];
  const now = new Date();
  const salary = rand(900000, 1300000);
  const rent = rand(280000, 380000);

  const make = (fecha, tipo, categoria, descripcion, monto) => ({
    id: crypto.randomUUID(),
    monto,
    tipo,
    categoria,
    descripcion,
    fecha: fecha.toISOString(),
    isMock: true,
  });

  for (let i = months - 1; i >= 0; i -= 1) {
    const y = now.getFullYear();
    const m = now.getMonth() - i;
    const lastDay = i === 0 ? now.getDate() : new Date(y, m + 1, 0).getDate();
    const at = (day) =>
      new Date(y, m, Math.min(day, lastDay), 8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60));

    // Ingresos fijos
    result.push(make(at(1), "Ingreso", "Sueldo", "Sueldo mensual", salary + rand(-20000, 40000)));
    if (Math.random() > 0.45) result.push(make(at(randDay(5, 25)), "Ingreso", "Freelance", pick(["Proyecto web", "Diseño de logo", "Consultoría"]), rand(80000, 350000)));
    if (Math.random() > 0.7) result.push(make(at(randDay(10, 28)), "Ingreso", "Inversiones", "Rendimiento plazo fijo", rand(15000, 60000)));

    // Gastos fijos
    if (lastDay >= 3) result.push(make(at(3), "Gasto", "Hogar", "Alquiler", rent));
    if (lastDay >= 8) result.push(make(at(8), "Gasto", "Servicios", "Luz", rand(18000, 45000)));
    if (lastDay >= 10) result.push(make(at(10), "Gasto", "Servicios", "Internet", rand(22000, 30000)));
    if (lastDay >= 12) result.push(make(at(12), "Gasto", "Servicios", "Gas", rand(9000, 30000)));
    SUBSCRIPTIONS.forEach(([desc, amount, cat], k) => {
      if (lastDay >= 5 + k * 4) result.push(make(at(5 + k * 4), "Gasto", cat, desc, amount));
    });

    // Gastos variables
    const variable = Math.round((lastDay / 30) * rand(14, 24));
    const weights = ["Comida", "Comida", "Comida", "Comida", "Transporte", "Transporte", "Transporte", "Entretenimiento", "Entretenimiento", "Compras", "Salud", "Hogar", "Otros"];
    for (let k = 0; k < variable; k += 1) {
      const cat = pick(weights);
      const [desc, min, max] = pick(EXPENSE_TEMPLATES[cat]);
      result.push(make(at(1 + Math.floor(Math.random() * lastDay)), "Gasto", cat, desc, rand(min, max)));
    }
  }

  // No generar movimientos en el futuro
  return result.filter((m) => new Date(m.fecha) <= now);
}
