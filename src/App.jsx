import FooterComponent from "./assets/Components/FooterComponent"
import { BrowserRouter, Routes, Route, Link} from "react-router-dom";

// Import pages 
import Homepage from "./assets/Pages/Homepage.jsx";
//


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
      <FooterComponent></FooterComponent>
    </BrowserRouter>
  )
}

export default App