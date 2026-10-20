import FooterComponent from "./assets/Components/FooterComponent"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

import Homepage from "./assets/Pages/Homepage.jsx";
import ActivityPage from "./assets/Pages/ActivityPage.jsx";
import StatsPage from "./assets/Pages/StatsPage.jsx";
import ProfilePage from "./assets/Pages/ProfilePage.jsx";

const readStoredMovements = () => {
  try {
    const saved = localStorage.getItem("movements");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readStoredLimit = () => {
  try {
    const saved = localStorage.getItem("monthlyLimit");
    const numeric = Number(saved ?? 5000);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 5000;
  } catch {
    return 5000;
  }
};

function App() {
  const [movements, setMovements] = useState(readStoredMovements);
  const [monthlyLimit, setMonthlyLimit] = useState(readStoredLimit);

  const total = useMemo(
    () =>
      movements.reduce((acc, mov) => {
        return mov.tipo === "Ingreso" ? acc + Number(mov.monto || 0) : acc - Number(mov.monto || 0);
      }, 0),
    [movements]
  );

  useEffect(() => {
    localStorage.setItem("movements", JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem("monthlyLimit", String(monthlyLimit));
  }, [monthlyLimit]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage movements={movements} setMovements={setMovements} total={total} monthlyLimit={monthlyLimit} setMonthlyLimit={setMonthlyLimit} />} />
        <Route path="/activity" element={<ActivityPage movements={movements} setMovements={setMovements} total={total} />} />
        <Route path="/stats" element={<StatsPage movements={movements} />} />
        <Route path="/profile" element={<ProfilePage movements={movements} total={total} />} />
      </Routes>
      <FooterComponent />
    </BrowserRouter>
  );
}

export default App;