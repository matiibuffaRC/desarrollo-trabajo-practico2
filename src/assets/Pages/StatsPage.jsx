import React from 'react';
import Charts from '../Components/Charts';
import MonthlyChart from '../Components/MonthlyChart';

function StatsPage({ movements }) {

    function generarDatosFake() {
        const data = JSON.parse(localStorage.getItem("movements")) || [];

        // Verificar si ya hay datos fake
        if (data.some(mov => mov.isMock)) {
            alert("Ya hay datos de prueba generados. Elimínalos primero si quieres generar nuevos.");
            return;
        }

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
                    tipo: esGasto ? "Gasto" : "Ingreso", // Capitalizado
                    descripcion: esGasto ? "Gasto random" : "Ingreso random",
                    categoria: esGasto 
                        ? categorias[Math.floor(Math.random() * categorias.length)]
                        : null,
                    fecha: new Date(
                        fechaBase.getFullYear(),
                        fechaBase.getMonth(),
                        Math.floor(Math.random() * 28) + 1
                    ).toISOString(),

                    isMock: true // 🔥 CLAVE
                });
            }
        }

        // Combinar con datos reales
        const reales = data.filter(mov => !mov.isMock);
        localStorage.setItem("movements", JSON.stringify([...reales, ...movimientosFake]));
        location.reload();
    }

    function eliminarDatosFake() {
        const data = JSON.parse(localStorage.getItem("movements")) || [];

        const nuevosMovimientos = data.filter(mov => !mov.isMock);

        localStorage.setItem("movements", JSON.stringify(nuevosMovimientos));
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
            <div className="w-full max-w-xl mb-6 flex flex-col items-center gap-3">
                <button onClick={generarDatosFake} className="w-full md:max-w-sm flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl shadow-sm hover:opacity-90 active:scale-[0.98] transition">
                    📊 Generar datos de prueba
                </button>
                <button onClick={eliminarDatosFake} className="w-full md:max-w-sm flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl shadow-sm hover:bg-red-600 active:scale-[0.98] transition">
                    🧹 Limpiar datos de prueba
                </button>
            </div>

            {/* CONTENIDO */}
            <div className="w-full max-w-xl flex flex-col md:flex-row md:max-w-5xl gap-5">

                <Charts movements={movements} />

                <MonthlyChart movements={movements} />

            </div>
        </div>
    );
}

export default StatsPage;