import React, { useState, useEffect } from 'react';

function MovementForm({ setMovements, onClose, movementToEdit, total }) {
    const [monto, setMonto] = useState("");
    const [tipo, setTipo] = useState("ingreso");
    const [descripcion, setDescripcion] = useState("");
    const [categoria, setCategoria] = useState("");
    const [show, setShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentSaldo, setCurrentSaldo] = useState(0);

    const categorias = ["Comida", "Transporte", "Entretenimiento", "Servicios", "Otros"];

    useEffect(() => {
        setTimeout(() => setShow(true), 10);
    }, []);

    useEffect(() => {
        if (movementToEdit) {
            setMonto(movementToEdit.monto.toString());
            setTipo(movementToEdit.tipo.toLowerCase());
            setDescripcion(movementToEdit.descripcion);
            setCategoria(movementToEdit.categoria || "");
        } else {
            setMonto("");
            setTipo("ingreso");
            setDescripcion("");
            setCategoria("");
        }
    }, [movementToEdit]);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    const addMovement = (force = false) => {
        // Validación ya hecha en handleSubmit
        const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const descripcionFinal = descripcion.trim() !== ""
            ? descripcion
            : tipoCapitalizado === "Ingreso"
            ? "Ingreso"
            : "Gasto";

        if (movementToEdit) {
            // Editar existente
            const movimientoActualizado = {
                ...movementToEdit,
                monto: Number(monto),
                tipo: tipoCapitalizado,
                descripcion: descripcionFinal,
                categoria: tipo === "gasto" ? categoria : null,
            };
            setMovements(prev => prev.map(mov => mov.id === movementToEdit.id ? movimientoActualizado : mov));
        } else {
            // Crear nuevo
            const nuevoMovimiento = {
                id: crypto.randomUUID(),
                monto: Number(monto),
                tipo: tipoCapitalizado,
                descripcion: descripcionFinal,
                categoria: tipo === "gasto" ? categoria : null,
                fecha: new Date().toISOString()
            };
            setMovements(prev => [...prev, nuevoMovimiento]);
        }

        // Resetear form
        setMonto("");
        setTipo("ingreso");
        setDescripcion("");
        setCategoria("");

        handleClose();
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!monto || Number(monto) <= 0) {
            alert("Ingresá un monto válido");
            return;
        }

        // ✅ Validar categoría si es gasto
        if (tipo === "gasto" && !categoria) {
            alert("Seleccioná una categoría");
            return;
        }

        let saldoDisponible = total;
        if (movementToEdit) {
            saldoDisponible -= movementToEdit.tipo === "Gasto" ? movementToEdit.monto : -movementToEdit.monto;
        }
        if (tipo === "gasto" && Number(monto) > saldoDisponible) {
            setCurrentSaldo(saldoDisponible);
            setShowModal(true);
            return;
        }

        addMovement(true); // force=true para proceder
    };

    return (
        <div className={`fixed z-100 inset-0 flex items-end justify-center transition-opacity duration-300 ${show ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"}`}>
            <form onSubmit={handleSubmit} className={`md:ml-45 bg-white h-1/2 w-full md:max-w-xl p-5 rounded-t-2xl flex flex-col gap-3 transform transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
                <h2 className="font-bold text-lg">
                    Nuevo movimiento
                    </h2>
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className="border p-2 rounded"/>
                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción (opcional)" className="border p-2 rounded"/>
                <select value={tipo} onChange={(e) => {setTipo(e.target.value); setCategoria("");}} className="border p-2 rounded">
                    <option value="ingreso">
                        Ingreso
                    </option>
                    <option value="gasto">
                        Gasto
                        </option>
                </select>
                {tipo === "gasto" && (
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="border p-2 rounded">
                        <option value="">Seleccionar categoría</option>
                            {categorias.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                )}
                {/* Botones */}
                <button type="submit" className="bg-black hover:cursor-pointer text-white py-2 rounded-xl">
                    Agregar
                </button>
                <button type="button" onClick={handleClose} className="hover:cursor-pointer text-sm text-gray-500">
                    Cancelar
                </button>
            </form>

            {showModal && (
                <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
                        <h3 className="font-bold text-lg mb-4">Advertencia</h3>
                        <p className="mb-4">
                            Estás intentando registrar un gasto de ${Number(monto)} pero solo tienes ${currentSaldo} disponible. ¿Deseas continuar de todos modos?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    addMovement(true);
                                    setShowModal(false);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MovementForm;