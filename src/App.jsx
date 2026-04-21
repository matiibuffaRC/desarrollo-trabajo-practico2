import FooterComponent from "./assets/Components/FooterComponent"
import { BrowserRouter, Routes, Route, Link} from "react-router-dom";
import { useState, useEffect } from "react"; // Agrega useEffect

// Import pages 
import Homepage from "./assets/Pages/Homepage.jsx";
import ActivityPage from "./assets/Pages/ActivityPage.jsx";
import StatsPage from "./assets/Pages/StatsPage.jsx";
import ProfilePage from "./assets/Pages/ProfilePage.jsx";
//

function App() {
  // Carga inicial desde localStorage (o vacío si no hay nada)
  const [movements, setMovements] = useState(() => {
    const saved = localStorage.getItem('movements');
    return saved ? JSON.parse(saved) : [];
  });

  // Guarda en localStorage cada vez que movements cambie
  useEffect(() => {
    localStorage.setItem('movements', JSON.stringify(movements));
  }, [movements]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage movements={movements} setMovements={setMovements}/>}/>
        <Route path="/activity" element={<ActivityPage movements={movements} setMovements={setMovements} />}/>
        <Route path="/stats" element={<StatsPage movements={movements} />}/>
        <Route path="/profile" element={<ProfilePage />}/>
      </Routes>
      <FooterComponent></FooterComponent>
    </BrowserRouter>
  )
}

export default App