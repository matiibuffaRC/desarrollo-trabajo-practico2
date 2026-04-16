function ListaMovimientos({ movimientos, onEliminar }) {
  if (movimientos.length === 0) {
    return <p>No hay movimientos</p>
  }

  return (
    <ul className="bg-white rounded-2xl shadow p-4 space-y-3">
      {movimientos.map(mov => (
        <li
          key={mov.id}
          className="flex justify-between items-center border-b pb-2"
        >
          <div>
            <p className="font-medium">{mov.descripcion}</p>
            <p className="text-sm text-gray-400">{mov.tipo}</p>
          </div>

          <div className="flex gap-3 items-center">
            <span
              className={
                mov.tipo === "ingreso"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              ${mov.monto}
            </span>

            <button
              onClick={() => onEliminar(mov.id)}
              className="text-red-500"
            >
              X
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ListaMovimientos