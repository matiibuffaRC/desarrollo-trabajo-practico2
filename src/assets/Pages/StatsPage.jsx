import React from 'react';
import Charts from '../Components/Charts';
import MonthlyChart from '../Components/MonthlyChart';

function StatsPage({ movements }) {
    function generarDatosFake() {
        const data = JSON.parse(localStorage.getItem('movements')) || [];

        if (data.some((mov) => mov.isMock)) {
            alert('Ya hay datos de prueba generados.');
            return;
        }

        const categorias = ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Otros'];
        const movimientosFake = [];
        let saldoActual = 0;

        for (let i = 0; i < 6; i += 1) {
            const fechaBase = new Date();
            fechaBase.setMonth(fechaBase.getMonth() - i);

            for (let j = 0; j < 8; j += 1) {
                const esGasto = Math.random() > 0.6;
                const monto = Math.floor(Math.random() * 5000) + 500;

                if (esGasto && monto > saldoActual) {
                    movimientosFake.push({
                        id: crypto.randomUUID(),
                        monto,
                        tipo: 'Ingreso',
                        descripcion: 'Ingreso random',
                        categoria: null,
                        fecha: new Date(
                            fechaBase.getFullYear(),
                            fechaBase.getMonth(),
                            Math.floor(Math.random() * 28) + 1,
                        ).toISOString(),
                        isMock: true,
                    });
                    saldoActual += monto;
                } else {
                    movimientosFake.push({
                        id: crypto.randomUUID(),
                        monto,
                        tipo: esGasto ? 'Gasto' : 'Ingreso',
                        descripcion: esGasto ? 'Gasto random' : 'Ingreso random',
                        categoria: esGasto ? categorias[Math.floor(Math.random() * categorias.length)] : null,
                        fecha: new Date(
                            fechaBase.getFullYear(),
                            fechaBase.getMonth(),
                            Math.floor(Math.random() * 28) + 1,
                        ).toISOString(),
                        isMock: true,
                    });
                    saldoActual += esGasto ? -monto : monto;
                }
            }
        }

        const reales = data.filter((mov) => !mov.isMock);
        localStorage.setItem('movements', JSON.stringify([...reales, ...movimientosFake]));
        window.location.reload();
    }

    function eliminarDatosFake() {
        const data = JSON.parse(localStorage.getItem('movements')) || [];
        const nuevosMovimientos = data.filter((mov) => !mov.isMock);
        localStorage.setItem('movements', JSON.stringify(nuevosMovimientos));
        window.location.reload();
    }

    return (
        <div className='min-h-screen w-full bg-gradient-to-b from-white to-[#F4F4F6] px-4 py-6 pb-24 md:px-20 md:pl-56'>
            <div className='mx-auto flex w-full max-w-5xl flex-col items-center gap-2 py-5'>
                <div className='mb-6 w-full max-w-xl'>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-violet-500'>Insights</p>
                    <h1 className='sora mt-2 text-3xl font-black text-slate-900'>Estadísticas</h1>
                    <p className='mt-2 text-sm text-slate-500'>Estos fueron tus gastos y movimientos en los últimos meses.</p>
                </div>

                <div className='mb-6 flex w-full max-w-xl flex-col items-center gap-3'>
                    <button
                        onClick={generarDatosFake}
                        className='inter w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98] md:max-w-sm'
                    >
                        📊 Generar datos de prueba
                    </button>
                    <button
                        onClick={eliminarDatosFake}
                        className='inter w-full rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98] md:max-w-sm'
                    >
                        🧹 Limpiar datos de prueba
                    </button>
                </div>

                <div className='flex w-full max-w-5xl flex-col gap-4 lg:flex-row'>
                    <Charts movements={movements} />
                    <MonthlyChart movements={movements} />
                </div>
            </div>
        </div>
    );
}

export default StatsPage;