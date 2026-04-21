import React, { useState, useEffect } from 'react';

function MovementForm({ setMovements, onClose }) {
    const [monto, setMonto] = useState("");
    const [tipo, setTipo] = useState("ingreso");
    const [descripcion, setDescripcion] = useState("");
    const [show, setShow] = useState(false);

    useEffect(() => {
        setTimeout(() => setShow(true), 10);
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // ✅ Validación
        if (!monto || Number(monto) <= 0) {
            alert("Ingresá un monto válido");
            return;
        }

        // ✅ Descripción automática si no hay
        const descripcionFinal =
            descripcion.trim() !== ""
                ? descripcion
                : tipo === "ingreso"
                ? "Ingreso"
                : "Gasto";

        const nuevoMovimiento = {
            id: crypto.randomUUID(),
            monto: Number(monto),
            tipo,
            descripcion: descripcionFinal,
            fecha: new Date().toISOString() // ✅ fecha automática
        };

        setMovements(prev => [...prev, nuevoMovimiento]);

        // limpiar form
        setMonto("");
        setDescripcion("");

        handleClose();
    };

    return (
        <div className={`fixed inset-0 flex items-end justify-center transition-opacity duration-300 ${show ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"}`}>
            <form onSubmit={handleSubmit} className={`bg-white h-1/2 w-full p-5 rounded-t-2xl flex flex-col gap-3 transform transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
                <h2 className="font-bold text-lg">Nuevo movimiento</h2>

                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className="border p-2 rounded"/>

                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción (opcional)" className="border p-2 rounded"/>

                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border p-2 rounded">
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                </select>

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