import { useState } from 'react';

// Componentes
import PrintTotalComponent from '../Components/PrintTotalComponent';
import MovementForm from '../Components/MovementForm';
import ShowActivityComponent from '../Components/ShowActivityComponent';
// 

function Homepage({ movements, setMovements }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className='flex flex-col items-center bg-linear-to-b from-white to-[#F4F4F6]'>
      <div className='p-3 pb-20 min-h-screen md:max-w-3xl'>
        <div className='mb-5'>
          <h2>
            <span className='block text-2xl'>Hola,</span>
            <span className='block text-2xl font-bold'>Matías Buffa!</span>
          </h2>
        </div>

        <div className='flex flex-col items-center gap-5'>
          <div className='w-full'>
            <PrintTotalComponent
              movements={movements}
              onAddClick={() => setShowForm(true)}
            />

            {showForm && ( // Condicional para abrir o no el formulario 
              <MovementForm
                setMovements={setMovements}
                onClose={() => setShowForm(false)}
              />
            )}
          </div>
          <div className='border border-black h-40 w-full flex flex-row gap-1 p-1 items-center justify-between'>
            <div className='border border-black rounded-xl h-full w-100'>
              {/* Cuadro de relleno */}
            </div>
            <div className='border border-black rounded-xl h-full w-100'>
              {/* Cuadro de relleno */}
            </div>
          </div>
        </div>
        <div className='mt-5'> {/* Contenedor de la actividad reciente */}
          <ShowActivityComponent movements={movements}/>
        </div>
      </div>
    </section>
  );
}

export default Homepage;