import { useState, useEffect } from "react";
import MovementForm from "../Components/MovementForm";

function ActivityPage({ movements, setMovements }) {
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [fechaFiltro, setFechaFiltro] = useState("todas");
    const [tipoFiltro, setTipoFiltro] = useState("todos"); // ✅ nuevo filtro
    const [showForm, setShowForm] = useState(false);
    const [movementToEdit, setMovementToEdit] = useState(null);
    const [menuAbiertoId, setMenuAbiertoId] = useState(null);

    const categorias = ["Comida", "Transporte", "Entretenimiento", "Servicios", "Otros"];

    // 🗑️ borrar todos
    const handleClearAll = () => {
        const confirmacion = confirm("¿Seguro que querés borrar todas las transacciones?");
        if (!confirmacion) return;

        setMovements([]);
        localStorage.removeItem("movements");
    };

    // 🗑️ borrar uno
    const handleDelete = (id) => {
        const nuevos = movements.filter(mov => mov.id !== id);
        setMovements(nuevos);
        localStorage.setItem("movements", JSON.stringify(nuevos));
    };

    // 🔒 cerrar menú al hacer click afuera
    useEffect(() => {
        const handleClickOutside = () => setMenuAbiertoId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    // 🔎 filtros
    const movimientosFiltrados = movements
        .filter(mov => {

            // ✅ filtro por tipo
            if (tipoFiltro !== "todos" && mov.tipo !== tipoFiltro) {
                return false;
            }

            // ✅ filtro por categoría (solo gastos)
            if (categoriaFiltro !== "todas") {
                if (mov.tipo !== "Gasto") return false;
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
        <div className="pb-20 min-h-screen flex flex-col items-center md:pl-20">
            <div className="w-full md:max-w-xl p-5 py-10">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="sora text-xl md:text-2xl font-bold">Movimientos</h2>

                    <button onClick={handleClearAll} className="hover:cursor-pointer p-2 rounded-full hover:bg-red-100 transition" title="Borrar todo">
                        <span className="text-red-500 text-sm">🗑️</span>
                    </button>
                </div>

                {/* FILTROS */}
                <div className="flex gap-2 mb-4 w-full">
                    <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}className="inter flex-1 min-w-0 p-2 rounded shadow">
                        <option value="todos">Todos</option>
                        <option value="Ingreso">Ingresos</option>
                        <option value="Gasto">Gastos</option>
                    </select>

                    <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}className="inter flex-1 min-w-0 p-2 rounded shadow">
                        <option value="todas">Todas</option>
                        {categorias.map((cat, i) => (
                            <option key={i} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)}className="inter flex-1 min-w-0 p-2 rounded shadow">
                        <option value="todas">Todas</option>
                        <option value="hoy">Hoy</option>
                        <option value="semana">7 días</option>
                        <option value="mes">Mes</option>
                    </select>

                </div>

                {/* LISTA */}
                {movimientosFiltrados.length === 0 ? (
                    <p className="text-gray-500 inter">No hay movimientos</p>
                ) : (
                    movimientosFiltrados.map(mov => (
                        <div key={mov.id} className="relative">

                            {/* ITEM */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuAbiertoId(menuAbiertoId === mov.id ? null : mov.id);
                                }}
                                className="bg-[#FEFEFE] flex flex-row justify-between items-start p-3 rounded-xl shadow mb-2 cursor-pointer active:scale-[0.98] transition"
                            >
                                <div>
                                    <h2 className="sora text-md font-bold">{mov.descripcion}</h2>
                                    {mov.tipo === "Gasto" && (
                                        <p className="inter text-sm text-gray-500">{mov.categoria}</p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end">
                                    <h3 className={`sora font-bold text-md ${mov.tipo === "Ingreso" ? "text-[#00A650]" : ""}`}>
                                        {mov.tipo === "Ingreso" ? "+" : "-"}${mov.monto.toFixed(2)}
                                    </h3>

                                    <h3 className="inter text-sm text-gray-500">
                                        {new Date(mov.fecha).toLocaleDateString("es-AR", {
                                            day: "2-digit",
                                            month: "2-digit"
                                        })}
                                    </h3>
                                </div>
                            </div>

                            {/* MENU */}
                            {menuAbiertoId === mov.id && (
                                <div 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="absolute right-1 top-18 bg-white rounded shadow-md w-32 z-50 animate-dropdown origin-top-right"
                                >
                                    <button
                                        onClick={() => {
                                            setMovementToEdit(mov);
                                            setShowForm(true);
                                            setMenuAbiertoId(null);
                                        }}
                                        className="inter hover:cursor-pointer block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                                    >
                                        ✏️ Editar
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleDelete(mov.id);
                                            setMenuAbiertoId(null);
                                        }}
                                        className="inter hover:cursor-pointer block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-red-500"
                                    >
                                        🗑️ Borrar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* FORM */}
                {showForm && (
                    <MovementForm
                        setMovements={setMovements}
                        onClose={() => {
                            setShowForm(false);
                            setMovementToEdit(null);
                        }}
                        movementToEdit={movementToEdit}
                    />
                )}
            </div>
        </div>
    );
}

export default ActivityPage;