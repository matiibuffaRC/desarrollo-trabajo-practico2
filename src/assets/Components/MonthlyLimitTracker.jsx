import React, { useState, useEffect } from 'react';

function MonthlyLimitTracker({ monthlyLimit, setMonthlyLimit, totalExpenses = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editValue, setEditValue] = useState(monthlyLimit);

    const remaining = monthlyLimit - totalExpenses;
    const percentage = Math.min((totalExpenses / monthlyLimit) * 100, 100);
    const isExceeded = totalExpenses > monthlyLimit;

    useEffect(() => {
        setEditValue(monthlyLimit);
    }, [monthlyLimit]);

    const handleSaveLimit = () => {
        const parsedValue = Number(editValue);
        if (parsedValue > 0) {
            setMonthlyLimit(parsedValue);
            setIsOpen(false);
            return;
        }

        alert('El límite debe ser mayor a 0');
    };

    const handleCancelEdit = () => {
        setEditValue(monthlyLimit);
        setIsOpen(false);
    };

    return (
        <div className='w-full'>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-[26px] bg-white/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-white/70 transition-all duration-300 ${isOpen ? 'rounded-b-none shadow-lg' : ''}`}
            >
                <div className={`transition-all duration-300 ${isOpen ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[320px] opacity-100'}`}>
                    <div className='mb-5 flex items-center justify-between'>
                        <div>
                            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-violet-500'>Presupuesto</p>
                            <h2 className='sora mt-2 text-lg font-black text-slate-900'>Límite mensual</h2>
                        </div>
                        <span className='text-2xl'>💳</span>
                    </div>

                    <div className='space-y-3 pb-1'>
                        <div className='rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 p-4'>
                            <p className='text-sm font-medium text-slate-600'>Límite establecido</p>
                            <p className='sora mt-2 text-xl font-black text-violet-800'>${monthlyLimit.toFixed(2)}</p>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <div className={`rounded-2xl p-4 ${isExceeded ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                                <p className='text-sm text-slate-600'>Gastado</p>
                                <p className={`sora mt-2 text-lg font-black ${isExceeded ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    ${totalExpenses.toFixed(2)}
                                </p>
                            </div>

                            <div className={`rounded-2xl p-4 ${isExceeded ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                                <p className='text-sm text-slate-600'>{isExceeded ? 'Excedido' : 'Disponible'}</p>
                                <p className={`sora mt-2 text-lg font-black ${isExceeded ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    ${Math.abs(remaining).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='mt-5'>
                        <div className='mb-2 flex items-center justify-between'>
                            <p className='text-xs font-medium uppercase tracking-[0.15em] text-slate-500'>Progreso</p>
                            <p className='text-sm font-semibold text-slate-700'>{percentage.toFixed(1)}%</p>
                        </div>
                        <div className='h-3 w-full overflow-hidden rounded-full bg-slate-200'>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </div>

                    {isExceeded && (
                        <div className='mt-4 rounded-2xl border-l-4 border-rose-500 bg-rose-50 p-3'>
                            <p className='text-sm font-semibold text-rose-700'>⚠️ Has superado tu límite</p>
                            <p className='mt-1 text-xs text-rose-600'>Excedido por ${Math.abs(remaining).toFixed(2)}</p>
                        </div>
                    )}
                </div>

                <div onClick={(e) => e.stopPropagation()} className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className='border-t border-slate-200 pt-5'>
                        <div className='mb-5'>
                            <h3 className='sora text-lg font-black text-slate-900'>Editar límite</h3>
                            <p className='mt-1 text-sm text-slate-600'>Límite actual: <span className='font-bold'>${monthlyLimit.toFixed(2)}</span></p>
                        </div>

                        <div className='mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3'>
                            <div>
                                <p className='text-[11px] uppercase tracking-[0.14em] text-slate-500'>Límite</p>
                                <p className='sora mt-1 font-bold text-slate-800'>${monthlyLimit.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className='text-[11px] uppercase tracking-[0.14em] text-slate-500'>Gastado</p>
                                <p className={`sora mt-1 font-bold ${isExceeded ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    ${totalExpenses.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className='mb-5'>
                            <label className='mb-2 block text-sm font-semibold text-slate-700'>Nuevo límite</label>
                            <div className='relative'>
                                <span className='absolute left-3 top-3 text-lg text-slate-500'>$</span>
                                <input
                                    type='number'
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className='input-shell w-full rounded-2xl p-3 pl-8 text-slate-800'
                                    min='0'
                                    step='100'
                                    autoFocus
                                />
                            </div>
                            <p className='mt-2 text-xs text-slate-500'>
                                {Number(editValue) > 0
                                    ? `Te quedarían $${(Number(editValue) - totalExpenses).toFixed(2)} disponibles`
                                    : 'Ingresa un valor válido'}
                            </p>
                        </div>

                        <div className='flex gap-3 px-6'>
                            <button
                                onClick={handleSaveLimit}
                                className='flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-95'
                            >
                                Guardar
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className='flex-1 rounded-xl bg-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-300 active:scale-95'
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MonthlyLimitTracker;