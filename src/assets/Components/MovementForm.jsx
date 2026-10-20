import React, { useState, useEffect } from 'react';

function MovementForm({ setMovements, onClose, movementToEdit, total }) {
    const [monto, setMonto] = useState("");
    const [tipo, setTipo] = useState("ingreso");
    const [descripcion, setDescripcion] = useState("");
    const [categoria, setCategoria] = useState("");
    const [show, setShow] = useState(false);

    const categorias = ["Comida", "Transporte", "Entretenimiento", "Servicios", "Otros"];

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (movementToEdit) {
            setMonto(String(movementToEdit.monto ?? ""));
            setTipo((movementToEdit.tipo || "Ingreso").toLowerCase());
            setDescripcion(movementToEdit.descripcion || "");
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
        setTimeout(onClose, 260);
    };

    const addMovement = () => {
        const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const descripcionFinal = descripcion.trim() !== ""
            ? descripcion.trim()
            : tipoCapitalizado === "Ingreso"
            ? "Ingreso"
            : "Gasto";

        const montoNumber = Number(monto);

        if (movementToEdit) {
            const movimientoActualizado = {
                ...movementToEdit,
                monto: montoNumber,
                tipo: tipoCapitalizado,
                descripcion: descripcionFinal,
                categoria: tipo === "gasto" ? categoria : null,
            };

            setMovements(prev => prev.map(mov => mov.id === movementToEdit.id ? movimientoActualizado : mov));
        } else {
            const nuevoMovimiento = {
                id: crypto.randomUUID(),
                monto: montoNumber,
                tipo: tipoCapitalizado,
                descripcion: descripcionFinal,
                categoria: tipo === "gasto" ? categoria : null,
                fecha: new Date().toISOString(),
            };
            setMovements(prev => [...prev, nuevoMovimiento]);
        }

        setMonto("");
        setTipo("ingreso");
        setDescripcion("");
        setCategoria("");

        handleClose();
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const montoNumber = Number(monto);

        if (!monto || montoNumber <= 0) {
            alert("Ingresá un monto válido");
            return;
        }

        if (tipo === "gasto" && !categoria) {
            alert("Seleccioná una categoría");
            return;
        }

        let saldoDisponible = total;
        if (movementToEdit) {
            saldoDisponible -= movementToEdit.tipo === "Gasto" ? movementToEdit.monto : -movementToEdit.monto;
        }

        if (tipo === "gasto" && montoNumber > saldoDisponible) {
            alert(`No tienes suficiente saldo. Disponible: $${saldoDisponible.toFixed(2)} | Estás queriendo gastar: $${montoNumber.toFixed(2)}`);
            return;
        }

        addMovement();
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center bg-black/40 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
            <form
                onSubmit={handleSubmit}
                className={`w-full rounded-t-[28px] bg-white p-5 shadow-[0_-18px_40px_rgba(15,23,42,0.12)] transition-all duration-300 md:ml-52 md:max-w-xl ${show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
            >
                <div className='mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200' />
                <div className='mb-4 flex items-center justify-between'>
                    <h2 className='sora text-xl font-black text-slate-900'>
                        {movementToEdit ? 'Editar movimiento' : 'Nuevo movimiento'}
                    </h2>
                    <button type='button' onClick={handleClose} className='rounded-full p-2 text-sm text-slate-500 hover:bg-slate-100'>✕</button>
                </div>

                <div className='space-y-3'>
                    <input
                        type='number'
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder='Monto'
                        className='input-shell w-full rounded-2xl px-4 py-3 text-base text-slate-800'
                        min='0'
                        step='0.01'
                    />

                    <input
                        type='text'
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder='Descripción (opcional)'
                        className='input-shell w-full rounded-2xl px-4 py-3 text-base text-slate-800'
                    />

                    <select
                        value={tipo}
                        onChange={(e) => { setTipo(e.target.value); setCategoria(''); }}
                        className='input-shell w-full rounded-2xl px-4 py-3 text-base text-slate-800'
                    >
                        <option value='ingreso'>Ingreso</option>
                        <option value='gasto'>Gasto</option>
                    </select>

                    {tipo === 'gasto' && (
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className='input-shell w-full rounded-2xl px-4 py-3 text-base text-slate-800'
                        >
                            <option value=''>Seleccionar categoría</option>
                            {categorias.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className='mt-5 flex flex-col gap-3'>
                    <button type='submit' className='rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.99]'>
                        {movementToEdit ? 'Guardar cambios' : 'Agregar movimiento'}
                    </button>
                    <button type='button' onClick={handleClose} className='rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200'>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default MovementForm;