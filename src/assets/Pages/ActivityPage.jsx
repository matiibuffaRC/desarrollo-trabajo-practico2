import { useState, useEffect } from "react";
import MovementForm from "../Components/MovementForm";

function ActivityPage({ movements, setMovements }) {
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [fechaFiltro, setFechaFiltro] = useState("todas");
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
        <div className="p-4">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Movimientos</h2>

                <button
                    onClick={handleClearAll}
                    className="p-2 rounded-full hover:bg-red-100 transition"
                    title="Borrar todo"
                >
                    <span className="text-red-500 text-sm">🗑️</span>
                </button>
            </div>

            {/* FILTROS */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <select 
                    value={categoriaFiltro} 
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="p-2 rounded shadow"
                >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                    ))}
                </select>

                <select 
                    value={fechaFiltro} 
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    className="p-2 rounded shadow"
                >
                    <option value="todas">Todas</option>
                    <option value="hoy">Hoy</option>
                    <option value="semana">Últimos 7 días</option>
                    <option value="mes">Este mes</option>
                </select>
            </div>

            {/* LISTA */}
            {movimientosFiltrados.length === 0 ? (
                <p className="text-gray-500">No hay movimientos</p>
            ) : (
                movimientosFiltrados.map(mov => (
                    <div key={mov.id} className="relative">

                        {/* ITEM CLICKEABLE */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation(); // 🔥 evita cierre instantáneo
                                setMenuAbiertoId(menuAbiertoId === mov.id ? null : mov.id);
                            }}
                            className="bg-[#FEFEFE] flex flex-row justify-between items-start p-3 rounded-xl shadow mb-2 cursor-pointer active:scale-[0.98] transition"
                        >
                            <div>
                                <h2 className="text-md font-bold">{mov.descripcion}</h2>
                                {mov.tipo === "gasto" && (
                                    <p className="text-sm text-gray-500">{mov.categoria}</p>
                                )}
                            </div>

                            <div className="flex flex-col items-end">
                                <h3 className={`font-bold text-md ${mov.tipo === "Ingreso" ? "text-[#00A650]" : ""}`}>
                                    {mov.tipo === "Ingreso" ? "+" : "-"}${mov.monto.toFixed(2)}
                                </h3>

                                <h3 className="text-sm text-gray-500">
                                    {new Date(mov.fecha).toLocaleDateString("es-AR", {
                                        day: "2-digit",
                                        month: "2-digit"
                                    })}
                                </h3>
                            </div>
                        </div>

                        {/* MENU */}
                        {menuAbiertoId === mov.id && (
                            <div onClick={(e) => e.stopPropagation()} className="absolute right-1 top-18 bg-white rounded shadow-md w-32 z-50 animate-dropdown origin-top-right" >
                                <button
                                    onClick={() => {
                                        setMovementToEdit(mov);
                                        setShowForm(true);
                                        setMenuAbiertoId(null);
                                    }}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                                >
                                    ✏️ Editar
                                </button>

                                <button
                                    onClick={() => {
                                        handleDelete(mov.id);
                                        setMenuAbiertoId(null);
                                    }}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-red-500"
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
    );
}

export default ActivityPage;