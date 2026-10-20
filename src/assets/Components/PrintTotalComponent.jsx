import React from 'react';
import plusIcon from "../icons/plus-svgrepo-com.svg";

function PrintTotalComponent({ movements, onAddClick }) {
    const total = movements.reduce((acc, mov) => {
        return mov.tipo === "Ingreso"
            ? acc + Number(mov.monto || 0)
            : acc - Number(mov.monto || 0);
    }, 0);

    return (
        <div className='rounded-[28px] bg-gradient-to-br from-violet-500 via-violet-400 to-indigo-300 p-[1px] shadow-[0_18px_40px_rgba(91,76,255,0.2)]'>
            <div className='flex min-h-[150px] flex-col justify-between rounded-[27px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_25%),linear-gradient(135deg,#5b4cff_0%,#8d7ef7_35%,#f8d6d7_100%)] p-5 text-white'>
                <div className='flex items-start justify-between gap-3'>
                    <div>
                        <p className='text-sm font-medium text-violet-100'>Dinero disponible</p>
                        <h3 className={`mt-3 text-3xl font-black tracking-tight ${total < 0 ? 'text-rose-100' : 'text-white'}`}>
                            ${total.toFixed(2)}
                        </h3>
                    </div>

                    <button
                        onClick={onAddClick}
                        className='flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 active:scale-95'
                        aria-label='Agregar movimiento'
                    >
                        <img src={plusIcon} alt="Agregar" className='h-5 w-5' />
                    </button>
                </div>

                <div className='mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 text-sm text-violet-50 backdrop-blur-sm'>
                    <span>Saldo actual</span>
                    <span className='font-semibold'>{total >= 0 ? 'Estable' : 'Crítico'}</span>
                </div>
            </div>
        </div>
    );
}

export default PrintTotalComponent;
