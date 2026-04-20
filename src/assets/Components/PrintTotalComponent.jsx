import React from 'react'

// Import iconos
import plusIcon from "../icons/plus-svgrepo-com.svg";
// 

function PrintTotalComponent() {
    // Tenemos que recorrer el array de movimientos para obtener el total
    
    
    return (
        <div className='border border-black  rounded-3xl bg-linear-to-l from-[#AFACF4] to-[#F3EDEB] flex flex-col justify-center items-center px-5 py-3'>
            <div className='flex flex-row justify-between items-center w-full'>
                <div>
                    <h2 className='text-sm text-gray-700'>Dinero disponible</h2>
                    <h3 className='font-bold text-3xl'>$0</h3>
                </div>
                <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                    <img src={plusIcon} alt="Icon" className='h-4 w-4'/>
                </div>
            </div>
        </div>
    )
}

export default PrintTotalComponent