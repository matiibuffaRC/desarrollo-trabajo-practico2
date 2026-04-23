import React from 'react'
import { Link } from 'react-router-dom'

function ShowActivityComponent({ movements }) {
    const printMovements = () => {
        return [...movements].reverse().map(mov => (
            <div key={mov.id} className='bg-[#FEFEFE] flex flex-row justify-between items-start p-3 rounded-xl shadow'>
                <h2 className='text-md font-bold'>{mov.descripcion}</h2>
                <div className='flex flex-col items-end'>
                    <h3 className={`font-bold text-md ${mov.tipo === "Ingreso" ? "text-[#00A650]" : ""}`}>{mov.tipo === "Ingreso" ? "+" : "-"}${mov.monto.toFixed(2)}</h3>
                    <h3 className="text-sm text-gray-500">
                        {new Date(mov.fecha).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit"
                        })}
                    </h3>
                </div>
            </div>
        )
    )}
    
    return (
        <div>
            <div className='flex flex-row items-center justify-between px-2 mt-3 mb-1'>
                <h2 className='text-xl font-bold'>Actividad reciente</h2>
                <Link to="/activity" className='text-sm text-blue-500 underline'>Ver todo</Link>
            </div>
            <div className='flex flex-col gap-2 px-2'>
                {printMovements()}
            </div>
        </div>
    )
}

export default ShowActivityComponent