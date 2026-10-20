import { useMemo, useState } from 'react';

import PrintTotalComponent from '../Components/PrintTotalComponent';
import MovementForm from '../Components/MovementForm';
import ShowActivityComponent from '../Components/ShowActivityComponent';
import MonthlyLimitTracker from '../Components/MonthlyLimitTracker';

function Homepage({ movements, setMovements, total, monthlyLimit, setMonthlyLimit }) {
  const [showForm, setShowForm] = useState(false);

  const totalExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return movements.reduce((acc, mov) => {
      if (mov.tipo !== 'Gasto') return acc;

      const movDate = new Date(mov.fecha);
      if (movDate.getMonth() === currentMonth && movDate.getFullYear() === currentYear) {
        return acc + Number(mov.monto || 0);
      }

      return acc;
    }, 0);
  }, [movements]);

  return (
    <section className='flex flex-col items-center md:pl-45'>
      <div className='md:pt-10 p-4 w-full pb-24 min-h-screen md:max-w-2xl'>
        <div className='mb-6 rounded-[28px] bg-white/75 p-5 shadow-[0_18px_50px_rgba(91,76,255,0.08)] ring-1 ring-white/70'>
          <p className='sora text-sm uppercase tracking-[0.2em] text-violet-500'>Panel principal</p>
          <h2 className='mt-3'>
            <span className='sora block text-2xl text-slate-600'>Hola,</span>
            <span className='sora block text-3xl font-black text-slate-900'>Matías Buffa</span>
          </h2>
          <div className='mt-4 flex items-center gap-2 text-sm text-slate-500'>
            <span className='inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]' />
            <span>Todo en orden este mes</span>
          </div>
        </div>

        <div className='flex flex-col items-center gap-5'>
          <div className='w-full'>
            <PrintTotalComponent movements={movements} onAddClick={() => setShowForm(true)} />

            {showForm && (
              <MovementForm
                setMovements={setMovements}
                onClose={() => setShowForm(false)}
                total={total}
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

        <div className='mt-6'>
          <ShowActivityComponent movements={movements} />
        </div>
      </div>
    </section>
  );
}

export default Homepage;