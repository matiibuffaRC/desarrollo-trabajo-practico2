import React, { useState, useMemo } from 'react';

function ProfilePage({ movements = [], total = 0 }) {
  const stats = useMemo(() => {
    const ingresos = movements
      .filter((mov) => mov.tipo === 'Ingreso')
      .reduce((acc, mov) => acc + Number(mov.monto || 0), 0);

    const egresos = movements
      .filter((mov) => mov.tipo === 'Gasto')
      .reduce((acc, mov) => acc + Number(mov.monto || 0), 0);

    const presupuestoMensual = movements.length > 0
      ? Math.max(...movements.map((m) => Number(m.monto || 0))) * 3
      : 5000;

    return {
      movimientos: movements.length,
      ingresos,
      egresos,
      presupuestoMensual,
      saldoActual: total,
    };
  }, [movements, total]);

  const [userData, setUserData] = useState({
    name: 'Mi Perfil',
    email: 'usuario@email.com',
    phone: '+34 612 345 678',
    location: 'Mi Ubicación',
    joinDate: 'Enero 2024',
    bio: 'Gestor de finanzas personales',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);

  const handleSave = () => {
    setUserData(editedData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value,
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-[#F4F4F6] p-4 pb-20 md:pl-56 md:pb-10'>
      <div className='mx-auto max-w-5xl'>
        <div className='mb-8'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-violet-500'>Cuenta</p>
          <h1 className='sora mt-2 text-3xl font-black text-slate-900'>Mi perfil</h1>
          <p className='mt-2 text-sm text-slate-600'>Gestioná tu información personal y revisá tus métricas.</p>
        </div>

        <div className='mx-auto max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(91,76,255,0.08)] ring-1 ring-slate-100 md:p-8'>
          <div className='mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start'>
            <div className='flex-shrink-0'>
              <div className='flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 text-3xl font-black text-white shadow-lg md:h-32 md:w-32 md:text-5xl'>
                {userData.name.charAt(0)}
              </div>
            </div>

            <div className='flex-1 text-center md:text-left'>
              {isEditing ? (
                <input
                  type='text'
                  name='name'
                  value={editedData.name}
                  onChange={handleChange}
                  className='input-shell mb-2 w-full rounded-xl border-0 px-3 py-2 text-2xl font-black text-slate-900 md:text-3xl'
                />
              ) : (
                <h2 className='sora mb-2 text-2xl font-black text-slate-900 md:text-3xl'>{userData.name}</h2>
              )}

              {!isEditing && <p className='mb-4 text-sm font-semibold text-violet-600'>{userData.bio}</p>}
              <p className='text-sm text-slate-500'>Miembro desde {userData.joinDate}</p>
            </div>
          </div>

          <hr className='soft-divider my-8' />

          <div className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>📧 Correo electrónico</label>
                {isEditing ? (
                  <input type='email' name='email' value={editedData.email} onChange={handleChange} className='input-shell w-full rounded-xl px-3 py-2.5 text-slate-800' />
                ) : (
                  <p className='text-base font-medium text-slate-800'>{userData.email}</p>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>📱 Teléfono</label>
                {isEditing ? (
                  <input type='tel' name='phone' value={editedData.phone} onChange={handleChange} className='input-shell w-full rounded-xl px-3 py-2.5 text-slate-800' />
                ) : (
                  <p className='text-base font-medium text-slate-800'>{userData.phone}</p>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>📍 Ubicación</label>
                {isEditing ? (
                  <input type='text' name='location' value={editedData.location} onChange={handleChange} className='input-shell w-full rounded-xl px-3 py-2.5 text-slate-800' />
                ) : (
                  <p className='text-base font-medium text-slate-800'>{userData.location}</p>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-slate-700'>💬 Bio</label>
                {isEditing ? (
                  <input type='text' name='bio' value={editedData.bio} onChange={handleChange} className='input-shell w-full rounded-xl px-3 py-2.5 text-slate-800' />
                ) : (
                  <p className='text-base font-medium text-slate-800'>{userData.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
            {!isEditing ? (
              <>
                <button onClick={() => { setIsEditing(true); setEditedData(userData); }} className='flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:opacity-95'>
                  ✏️ Editar perfil
                </button>
                <button className='flex-1 rounded-2xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-300'>
                  🔐 Cambiar contraseña
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} className='flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white shadow-md transition hover:opacity-95'>
                  ✅ Guardar cambios
                </button>
                <button onClick={() => setIsEditing(false)} className='flex-1 rounded-2xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-300'>
                  ❌ Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <div className='mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          <div className='rounded-[24px] bg-white p-6 shadow-[0_18px_50px_rgba(91,76,255,0.08)] ring-1 ring-slate-100'>
            <h3 className='mb-2 text-lg font-semibold text-slate-900'>📊 Movimientos</h3>
            <p className='mb-1 text-3xl font-black text-violet-600'>{stats.movimientos}</p>
            <p className='text-sm text-slate-500'>Registrados en total</p>
          </div>

          <div className='rounded-[24px] bg-white p-6 shadow-[0_18px_50px_rgba(91,76,255,0.08)] ring-1 ring-slate-100'>
            <h3 className='mb-2 text-lg font-semibold text-slate-900'>💰 Saldo actual</h3>
            <p className={`mb-1 text-3xl font-black ${total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${stats.saldoActual.toFixed(2)}</p>
            <p className='text-sm text-slate-500'>Disponible</p>
          </div>

          <div className='rounded-[24px] bg-white p-6 shadow-[0_18px_50px_rgba(91,76,255,0.08)] ring-1 ring-slate-100'>
            <h3 className='mb-2 text-lg font-semibold text-slate-900'>📈 Ingresos</h3>
            <p className='mb-1 text-3xl font-black text-emerald-600'>${stats.ingresos.toFixed(2)}</p>
            <p className='text-sm text-slate-500'>Total ingresado</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;