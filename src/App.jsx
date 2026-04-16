import { BrowserRouter, Routes, Route, Link} from "react-router-dom"
import { useState } from "react"
import Dashboard from "./Pages/Dashboard"
import Movements from "./Pages/Movements"

function App() {
  const [movimientos, setMovimientos] = useState([])

  const agregarMovimiento = (mov) => {
    setMovimientos(prev => [
      ...prev,
      {
        ...mov,
        id: crypto.randomUUID(),
        fecha: new Date()
      }
    ])
  }

  const eliminarMovimiento = (id) => {
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard movimientos={movimientos} />}
        />

        <Route
          path="/movements"
          element={
            <Movements
              movimientos={movimientos}
              agregarMovimiento={agregarMovimiento}
              eliminarMovimiento={eliminarMovimiento}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App