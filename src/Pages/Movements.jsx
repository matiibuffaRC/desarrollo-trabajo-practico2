import FormularioMovimiento from "../assets/Components/FormularioMovimiento/FormularioMovimiento.jsx";
import ListaMovimientos from "../assets/Components/ListaMovimientos/ListaMovimientos.jsx"

function Movements({ movimientos, agregarMovimiento, eliminarMovimiento }) {
  return (
    <div className="min-h-screen bg-[#fbfbfd] p-6 space-y-6">
      <h1 className="text-2xl font-bold">Movimientos</h1>

      <FormularioMovimiento onAgregar={agregarMovimiento} />

      <ListaMovimientos
        movimientos={movimientos}
        onEliminar={eliminarMovimiento}
      />
    </div>
  )
}

export default Movements