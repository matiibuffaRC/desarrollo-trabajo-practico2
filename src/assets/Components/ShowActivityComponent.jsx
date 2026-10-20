import React from 'react';
import { Link } from 'react-router-dom';

function ShowActivityComponent({ movements }) {
    const printMovements = () => {
        if (!movements.length) {
            return (
                <div className='rounded-[22px] border border-dashed border-slate-200 bg-white/80 p-5 text-center'>
                    <p className='text-sm text-slate-500'>Todavía no registraste movimientos.</p>
                    <p className='mt-1 text-xs text-slate-400'>Agregá tu primer ingreso o gasto desde el panel principal.</p>
                </div>
            );
        }

        return [...movements]
            .reverse()
            .slice(0, 3)
            .map((mov) => (
                <div key={mov.id} className='flex items-start justify-between rounded-[22px] bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100'>
                    <div className='min-w-0 pr-3'>
                        <h2 className='sora text-base font-bold text-slate-800'>{mov.descripcion}</h2>
                        {mov.tipo === 'Gasto' && mov.categoria && (
                            <p className='mt-1 text-xs text-slate-500'>{mov.categoria}</p>
                        )}
                    </div>
                    <div className='flex min-w-[110px] flex-col items-end'>
                        <h3 className={`sora text-base font-black ${mov.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {mov.tipo === 'Ingreso' ? '+' : '-'}${Number(mov.monto || 0).toFixed(2)}
                        </h3>
                        <h3 className='mt-1 text-xs text-slate-500'>
                            {new Date(mov.fecha).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit'
                            })}
                        </h3>
                    </div>
                </div>
            ));
    };

    return (
        <div>
            <div className='mb-3 flex items-center justify-between px-1'>
                <h2 className='sora text-xl font-black text-slate-900'>Actividad reciente</h2>
                <Link to='/activity' className='text-sm font-semibold text-violet-600 transition hover:text-violet-700'>Ver todo</Link>
            </div>
            <div className='flex flex-col gap-2'>
                {printMovements()}
                {movements.length > 3 && (
                    <div className='mt-2 flex justify-center'>
                        <Link to='/activity' className='flex items-center gap-1 text-sm font-semibold text-violet-600 transition hover:text-violet-700'>
                            Ver más ↓
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShowActivityComponent;