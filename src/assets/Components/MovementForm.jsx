import React, { useState, useEffect } from 'react';

function MovementForm({ setMovements, onClose, movementToEdit }) {
    const [monto, setMonto] = useState("");
    const [tipo, setTipo] = useState("ingreso");
    const [descripcion, setDescripcion] = useState("");
    const [categoria, setCategoria] = useState(""); // ✅ nuevo estado
    const [show, setShow] = useState(false);

    const categorias = ["Comida", "Transporte", "Entretenimiento", "Servicios", "Otros"];

    useEffect(() => {
        setTimeout(() => setShow(true), 10);
    }, []);

    /* eslint-disable react-hooks/set-state-in-effect */
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
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
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

        const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);

        const descripcionFinal =
            descripcion.trim() !== ""
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
    };

    return (
        <div className={`fixed inset-0 flex items-end justify-center transition-opacity duration-300 ${show ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"}`}>
            <form onSubmit={handleSubmit} className={`bg-white h-1/2 w-full md:max-w-3xl p-5 rounded-t-2xl flex flex-col gap-3 transform transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
                
                <h2 className="font-bold text-lg">Nuevo movimiento</h2>

                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className="border p-2 rounded"/>

                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción (opcional)" className="border p-2 rounded"/>

                <select value={tipo} onChange={(e) => {
                        setTipo(e.target.value);
                        setCategoria(""); // reset categoría si cambia tipo
                    }} 
                    className="border p-2 rounded">
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                </select>

                
                {tipo === "gasto" && (
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="border p-2 rounded">
                        <option value="">Seleccionar categoría</option>
                            {categorias.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                )}

                <button type="submit" className="bg-black text-white py-2 rounded-xl">
                    Agregar
                </button>

                <button type="button" onClick={handleClose} className="text-sm text-gray-500">
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default MovementForm;