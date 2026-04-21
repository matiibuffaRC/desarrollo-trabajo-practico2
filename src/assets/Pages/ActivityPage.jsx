import { useState } from "react";

function ActivityPage({ movements }) {
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [fechaFiltro, setFechaFiltro] = useState("todas");

    const categorias = ["Comida", "Transporte", "Entretenimiento", "Servicios", "Otros"];

    const movimientosFiltrados = movements
        .filter(mov => {
        if (categoriaFiltro !== "todas") {
            if (mov.tipo !== "Gasto") return false; // solo gastos tienen categoría
            if (mov.categoria !== categoriaFiltro) return false;
        }

        const fechaMov = new Date(mov.fecha);
        const hoy = new Date();

        if (fechaFiltro === "hoy") {
            return fechaMov.toDateString() === hoy.toDateString();
        }

        if (fechaFiltro === "semana") {
            const hace7Dias = new Date();
            hace7Dias.setDate(hoy.getDate() - 7);
            return fechaMov >= hace7Dias;
        }

        if (fechaFiltro === "mes") {
            return (
            fechaMov.getMonth() === hoy.getMonth() &&
            fechaMov.getFullYear() === hoy.getFullYear()
            );
        }

        return true;
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return (
        <div className="p-4">
        <h2 className="text-xl font-bold mb-3">Movimientos</h2>

        <div className="flex gap-2 mb-4 flex-wrap">
            
            
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}className="p-2 rounded-xl shadow">
                <option value="todas">Todas las categorías</option>
                    {categorias.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                    ))}
            </select>

            
            <select value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)}className="p-2 rounded-xl shadow">
                <option value="todas">Todas</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Últimos 7 días</option>
                <option value="mes">Este mes</option>
            </select>
        </div>

        {movimientosFiltrados.length === 0 ? (
            <p className="text-gray-500">No hay movimientos</p>
            ) : (
            movimientosFiltrados.map(mov => (
            <div key={mov.id} className='bg-[#FEFEFE] flex flex-row justify-between items-start p-3 rounded-xl shadow mb-2'>
                <div>
                    <h2 className='text-md font-bold'>{mov.descripcion}</h2>
                    {mov.tipo === "Gasto" && (
                        <p className="text-sm text-gray-500">{mov.categoria}</p>
                    )}
                </div>
                <div className='flex flex-col items-end'>
                    <h3 className={`font-bold text-md ${mov.tipo === "Ingreso" ? "text-[#00A650]" : ""}`}>{mov.tipo === "Ingreso" ? "+" : "-"}${mov.monto.toFixed(2)}</h3>
                    <h3 className="text-sm text-gray-500">
                        {new Date(mov.fecha).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit"
                        })}
                    </h3>
                </div>
            </div>
            ))
        )}
        </div>
    );
}

export default ActivityPage;