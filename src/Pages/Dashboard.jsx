function Dashboard({ movimientos }) {
  const ingresos = movimientos
    .filter(m => m.tipo === "ingreso")
    .reduce((acc, m) => acc + m.monto, 0)

  const gastos = movimientos
    .filter(m => m.tipo === "gasto")
    .reduce((acc, m) => acc + m.monto, 0)

  const balance = ingresos - gastos
  
  // 👇 NUEVO: últimos movimientos
const ultimos = [...movimientos]
  .slice(-5)
  .reverse()

    

  return (
    <div className="bg-linear-to-b from-[#fbfbfb] to-[#eee] min-h-screen bg-[#fbfbfd] p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <h2 className="mb-6 text-3xl">
        <span className="block">Hola,</span>
        <span className="block font-bold">Matías Buffa!</span>
      </h2>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-linear-to-r from-white to-[#B1AAFB] p-4 rounded-2xl shadow">
          <p className="text-[#777] text-xl">Balance actual</p>
          <h2 className="text-2xl font-bold">${balance}</h2>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p>Ingresos</p>
          <h2 className="text-green-500">${ingresos}</h2>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <p>Gastos</p>
          <h2 className="text-red-500">${gastos}</h2>
        </div>
      </div>

      {/* 🕒 ACTIVIDADES RECIENTES */}
      <div className="bg-white rounded-2xl shadow p-5">
  <h2 className="text-lg font-semibold mb-4">
    Actividad reciente
  </h2>

  {ultimos.length === 0 ? (
    <p className="text-gray-500">
      No hay movimientos todavía
    </p>
  ) : (
    <div className="space-y-3">
      {ultimos.map(mov => {
        const esIngreso = mov.tipo === "ingreso"

        return (
          <div
            key={mov.id}
            className="flex justify-between items-center bg-[#f6f6f9] p-3 rounded-xl"
          >
            {/* TEXTO */}
            <div>
              <p className="text-sm text-gray-700">
                {esIngreso ? "Agregaste un ingreso" : "Registraste un gasto"}
                {" "}
                <span className="font-semibold">
                  {mov.descripcion}
                </span>
              </p>

              <p className="text-xs text-gray-400">
                {new Date(mov.fecha).toLocaleDateString()}
              </p>
            </div>

            {/* MONTO */}
            <span
              className={`font-semibold ${
                esIngreso ? "text-green-500" : "text-red-500"
              }`}
            >
              {esIngreso ? "+" : "-"}${mov.monto}
            </span>
          </div>
        )
      })}
    </div>
  )}
</div>
    </div>
  )
}

export default Dashboard

