import { useState } from 'react';
import PrintTotalComponent from '../Components/PrintTotalComponent';
import MovementForm from '../Components/MovementForm';

function Homepage({ movements, setMovements }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className='p-3 h-screen bg-linear-to-b from-white to-[#F4F4F6]'>
      <div className='mb-5'>
        <h2>
          <span className='block text-2xl'>Hola,</span>
          <span className='block text-2xl font-bold'>Matías Buffa!</span>
        </h2>
      </div>

      <PrintTotalComponent
        movements={movements}
        onAddClick={() => setShowForm(true)}
      />

      {showForm && (
        <MovementForm
          setMovements={setMovements}
          onClose={() => setShowForm(false)}
        />
      )}
    </section>
  );
}

export default Homepage;