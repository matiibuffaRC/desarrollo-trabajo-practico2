import React, { useState, useEffect } from 'react';

function MonthlyLimitTracker({ monthlyLimit, setMonthlyLimit, totalExpenses = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editValue, setEditValue] = useState(monthlyLimit);

    // Calcular valores
    const remaining = monthlyLimit - totalExpenses;
    const percentage = Math.min((totalExpenses / monthlyLimit) * 100, 100);
    const isExceeded = totalExpenses > monthlyLimit;

    // Actualizar editValue cuando cambia monthlyLimit
    useEffect(() => {
        setEditValue(monthlyLimit);
    }, [monthlyLimit]);

    // Guardar el límite en localStorage
    useEffect(() => {
        localStorage.setItem('monthlyLimit', monthlyLimit.toString());
    }, [monthlyLimit]);

    const handleSaveLimit = () => {
        if (editValue > 0) {
        setMonthlyLimit(Number(editValue));
        setIsOpen(false);
        } else {
        alert('El límite debe ser mayor a 0');
        }
    };

    const handleCancelEdit = () => {
        setEditValue(monthlyLimit);
        setIsOpen(false);
    };

    return (
        <div className='w-full'>
        {/* CARD - ESTADO CERRADO */}
        <div
            onClick={() => setIsOpen(!isOpen)}
            className={`bg-white rounded-2xl shadow-md p-6 cursor-pointer transition-all duration-300 transform hover:shadow-lg hover:scale-[1.02] ${
            isOpen ? 'rounded-b-none shadow-lg' : ''
            }`}
        >
            {/* CONTENIDO DEL CARD */}
            <div
            className={`transition-all duration-300 ${
                isOpen ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100'
            }`}
            >
            {/* HEADER */}
            <div className='flex justify-between items-center mb-6'>
                <h2 className='sora font-bold text-md md:text-lg'>Límite Mensual</h2>
                <span className='text-2xl transition-transform duration-300'>💳</span>
            </div>

            {/* INFORMACIÓN PRINCIPAL */}
            <div className='space-y-4 pb-1'>
                {/* LÍMITE */}
                <div className='bg-linear-to-r from-blue-50 to-blue-100 p-4 rounded-xl'>
                <p className='inter text-md md:text-lg font-bold text-gray-600'>Límite establecido</p>
                <p className='sora font-bold text-md md:text-lg text-blue-900'>${monthlyLimit.toFixed(2)}</p>
                </div>

                {/* FALTA / GASTADO */}
                <div className='grid grid-cols-2 gap-3'>
                <div className={`p-4 rounded-xl ${isExceeded ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className='inter text-md md:text-lg text-gray-600 mb-1'>Gastado</p>
                    <p
                    className={`sora font-bold text-md md:text-lg ${
                        isExceeded ? 'text-red-600' : 'text-green-600'
                    }`}
                    >
                    ${totalExpenses.toFixed(2)}
                    </p>
                </div>
                <div className={`p-4 rounded-xl ${isExceeded ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className='inter text-sm text-gray-600 mb-1'>
                    {isExceeded ? 'Excedido' : 'Falta'}
                    </p>
                    <p
                    className={`sora font-bold text-md md:text-lg ${
                        isExceeded ? 'text-red-600' : 'text-green-600'
                    }`}
                    >
                    ${Math.abs(remaining).toFixed(2)}
                    </p>
                </div>
                </div>

                {/* BARRA DE PROGRESO */}
                <div>
                <div className='flex justify-between items-center mb-2'>
                    <p className='inter text-xs text-gray-500'>Progreso</p>
                    <p className='inter text-sm font-semibold text-gray-700'>
                    {percentage.toFixed(1)}%
                    </p>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                    <div
                    className={`h-full transition-all duration-500 ease-out ${
                        isExceeded ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                    />
                </div>
                </div>

                {/* ALERTA SI SUPERA */}
                {isExceeded && (
                <div className='bg-red-100 border-l-4 border-red-500 p-3 rounded-lg'>
                    <p className='inter text-sm text-red-700 font-semibold'>
                    ⚠️ Has superado tu límite
                    </p>
                    <p className='inter text-xs text-red-600 mt-1'>
                    Excedido por ${Math.abs(remaining).toFixed(2)}
                    </p>
                </div>
                )}
                
            </div>
            </div>

            {/* FORMULARIO - ESTADO ABIERTO */}
            <div
            className={`transition-all duration-300 overflow-hidden ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
            >
            <div className='pt-6 border-t border-gray-200'>
                {/* HEADER FORM */}
                <div className='mb-5'>
                <h3 className='sora font-bold text-lg mb-2'>Editar Límite</h3>
                <p className='inter text-sm text-gray-600'>
                    Límite actual: <span className='font-bold'>${monthlyLimit.toFixed(2)}</span>
                </p>
                </div>

                {/* INFO ACTUAL EN FORM */}
                <div className='grid grid-cols-2 gap-3 mb-5 p-3 bg-gray-50 rounded-lg'>
                <div>
                    <p className='inter text-xs text-gray-500 mb-1'>Límite</p>
                    <p className='sora font-bold text-gray-800'>${monthlyLimit.toFixed(2)}</p>
                </div>
                <div>
                    <p className='inter text-xs text-gray-500 mb-1'>Gastado</p>
                    <p className={`sora font-bold ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
                    ${totalExpenses.toFixed(2)}
                    </p>
                </div>
                </div>

                {/* INPUT */}
                <div className='mb-5'>
                <label className='inter text-sm font-semibold text-gray-700 block mb-2'>
                    Nuevo límite
                </label>
                <div className='relative'>
                    <span className='absolute left-3 top-3 text-gray-500 text-lg'>$</span>
                    <input
                    type='number'
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className='w-full border-2 border-gray-300 rounded-lg p-3 pl-8 focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition inter'
                    min='0'
                    step='100'
                    autoFocus
                    />
                </div>
                <p className='inter text-xs text-gray-500 mt-2'>
                    {editValue > 0
                    ? `Te quedarían $${(editValue - totalExpenses).toFixed(2)} disponibles`
                    : 'Ingresa un valor válido'}
                </p>
                </div>

                {/* BOTONES */}
                <div className='flex gap-3'>
                <button
                    onClick={handleSaveLimit}
                    className='flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-lg hover:from-green-600 hover:to-green-700 hover:cursor-pointer active:scale-95 transition-all sora shadow-md hover:shadow-lg'
                >
                    Guardar
                </button>
                <button
                    onClick={handleCancelEdit}
                    className='flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 hover:cursor-pointer active:scale-95 transition-all sora'
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

