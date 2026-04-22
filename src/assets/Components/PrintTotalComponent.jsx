import React from 'react';
import plusIcon from "../icons/plus-svgrepo-com.svg";

function PrintTotalComponent({ movements, onAddClick }) {
    const total = movements.reduce((acc, mov) => {
        return mov.tipo === "Ingreso"
        ? acc + mov.monto
        : acc - mov.monto;
    }, 0); //Boludon acordate del valor inicial 0

    return (
        <div className='shadow-md rounded-3xl bg-linear-to-l from-[#AFACF4] to-[#F3EDEB] flex flex-col justify-center items-center px-5 py-3'>
            <div className='flex flex-row justify-between items-center w-full'>
                <div>
                    <h2 className='text-sm text-gray-700'>
                        Dinero disponible
                        </h2>
                    <h3 className={`font-bold text-2xl ${total < 0? "text-red-500" : "text-black"}`}>
                        ${total}
                    </h3>
                </div>

                <button onClick={onAddClick} className="h-7 w-7 hover:cursor-pointer bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 active:scale-95 transition" >
                    <img src={plusIcon} alt="Icon" className='h-4 w-4' />
                </button>
            </div>
        </div>
    );
}

export default PrintTotalComponent;
