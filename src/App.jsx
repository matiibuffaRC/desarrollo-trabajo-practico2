import FooterComponent from "./assets/Components/FooterComponent"
import { BrowserRouter, Routes, Route, Link} from "react-router-dom";
import { useState } from "react";

// Import pages 
import Homepage from "./assets/Pages/Homepage.jsx";
//

function App() {
  const [movements, setMovements] = useState([]); // Arrancaría vacío
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage movements={movements} setMovements={setMovements}/>}/>
      </Routes>
      <FooterComponent></FooterComponent>
    </BrowserRouter>
  )
}

export default App