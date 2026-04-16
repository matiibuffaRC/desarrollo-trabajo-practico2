import { useState } from "react"

function FormularioMovimiento({ onAgregar }) {
  const [descripcion, setDescripcion] = useState("")
  const [monto, setMonto] = useState("")
  const [tipo, setTipo] = useState("ingreso")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!descripcion || !monto) return

    onAgregar({
      descripcion,
      monto: Number(monto),
      tipo
    })

    setDescripcion("")
    setMonto("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl shadow space-y-4"
    >
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="ingreso">Ingreso</option>
        <option value="gasto">Gasto</option>
      </select>

      <button className="bg-black text-white px-4 py-2 rounded">
        Agregar
      </button>
    </form>
  )
}

export default FormularioMovimiento