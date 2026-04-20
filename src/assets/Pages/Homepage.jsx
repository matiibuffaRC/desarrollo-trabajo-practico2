import React from 'react';

// Import componentes
import InicieComponent from '../Components/InicieComponent';
import PrintTotalComponent from '../Components/PrintTotalComponent';
//

function Homepage({movements, setMovements}) {
  return (
    <section className='p-3 h-screen bg-linear-to-b from-white to-[#F4F4F6]'>
      <div className='mb-5'>
        <h2>
          <span className='block text-2xl'>Hola,</span>
          <span className='block text-2xl font-bold'>Matías Buffa!</span>
        </h2>
      </div>
      <PrintTotalComponent></PrintTotalComponent>
    </section>
  )
}

export default Homepage
