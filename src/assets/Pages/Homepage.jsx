import { useState, useEffect } from 'react';

// Componentes
import PrintTotalComponent from '../Components/PrintTotalComponent';
import MovementForm from '../Components/MovementForm';
import ShowActivityComponent from '../Components/ShowActivityComponent';
import MonthlyLimitTracker from '../Components/MonthlyLimitTracker';
// 

function Homepage({ movements, setMovements }) {
  const [showForm, setShowForm] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(() => {
    const saved = localStorage.getItem('monthlyLimit');
    return saved ? Number(saved) : 5000;
  });

  // Calcular gastos del mes actual
  const calculateMonthlyExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return movements.reduce((total, mov) => {
      if (mov.tipo !== 'Gasto') return total;

      const movDate = new Date(mov.fecha);
      if (movDate.getMonth() === currentMonth && movDate.getFullYear() === currentYear) {
        return total + mov.monto;
      }

      return total;
    }, 0);
  };

  const totalExpenses = calculateMonthlyExpenses();

  return (
    <section className='flex flex-col items-center bg-linear-to-b from-white to-[#F4F4F6] md:pl-45'>
      <div className='md:pt-10 p-3 w-full pb-20 min-h-screen md:max-w-xl'>
        <div className='mb-5'>
          <h2>
            <span className='sora block text-2xl'>Hola,</span>
            <span className='sora block text-2xl font-bold'>Matías Buffa!</span>
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
          <div className='w-full'>
            <MonthlyLimitTracker
              monthlyLimit={monthlyLimit}
              setMonthlyLimit={setMonthlyLimit}
              totalExpenses={totalExpenses}
            />
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