import React from 'react';
import Charts from '../Components/Charts';
import MonthlyChart from '../Components/MonthlyChart';

function StatsPage({ movements }) {

    function generarDatosFake() {
        const categorias = ["Comida", "Transporte", "Entretenimiento", "Servicios", "Otros"];

        const movimientosFake = [];

        for (let i = 0; i < 6; i++) {
            const fechaBase = new Date();
            fechaBase.setMonth(fechaBase.getMonth() - i);

            for (let j = 0; j < 8; j++) {
                const esGasto = Math.random() > 0.3;

                movimientosFake.push({
                    id: crypto.randomUUID(),
                    monto: Math.floor(Math.random() * 5000) + 500,
                    tipo: esGasto ? "gasto" : "ingreso",
                    descripcion: esGasto ? "Gasto random" : "Ingreso random",
                    categoria: esGasto
                        ? categorias[Math.floor(Math.random() * categorias.length)]
                        : null,
                    fecha: new Date(
                        fechaBase.getFullYear(),
                        fechaBase.getMonth(),
                        Math.floor(Math.random() * 28) + 1
                    ).toISOString()
                });
            }
        }

        localStorage.setItem("movements", JSON.stringify(movimientosFake));
        location.reload();
    }

    return (
        <div className="min-h-screen w-full bg-linear-to-b from-white to-[#F4F4F6] px-4 py-6 pb-24 flex flex-col items-center">

            {/* HEADER */}
            <div className="w-full max-w-xl mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Estadísticas</h1>
                <p className="text-sm text-gray-500">
                    Estos fueron tus gastos los ultimos meses.
                </p>
            </div>

            {/* BOTÓN */}
            <div className="w-full max-w-xl mb-6">
                <button
                    onClick={generarDatosFake}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl shadow-sm hover:opacity-90 active:scale-[0.98] transition"
                >
                    📊 Generar datos de prueba
                </button>
            </div>

            {/* CONTENIDO */}
            <div className="w-full max-w-xl flex flex-col gap-5">

                <Charts movements={movements} />

                <MonthlyChart movements={movements} />

            </div>
        </div>
    );
}

export default StatsPage;