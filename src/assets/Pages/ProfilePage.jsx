import React, { useState, useMemo } from 'react';

function ProfilePage({ movements = [], total = 0 }) {
  // Calcula estadísticas financieras reales
  const stats = useMemo(() => {
    const ingresos = movements
      .filter(mov => mov.tipo === 'Ingreso')
      .reduce((acc, mov) => acc + mov.monto, 0);
    
    const egresos = movements
      .filter(mov => mov.tipo === 'Egreso')
      .reduce((acc, mov) => acc + mov.monto, 0);
    
    const presupuestoMensual = movements.length > 0 
      ? Math.max(...movements.map(m => m.monto || 0)) * 3
      : 5000;
    
    return {
      movimientos: movements.length,
      ingresos,
      egresos,
      presupuestoMensual,
      saldoActual: total
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
    <div className="p-4 pb-20 min-h-screen bg-gradient-to-b from-white to-[#F4F4F6] md:pl-56 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 text-sm md:text-base mt-2">Gestiona tu información personal</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#6128FF] flex items-center justify-center">
              <span className="text-4xl md:text-5xl text-white font-bold">
                {userData.name.charAt(0)}
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedData.name}
                onChange={handleChange}
                className="text-2xl md:text-3xl font-bold text-gray-900 w-full border-b-2 border-[#6128FF] focus:outline-none mb-2"
              />
            ) : (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {userData.name}
              </h2>
            )}
            {!isEditing && (
              <p className="text-[#6128FF] font-semibold mb-4">{userData.bio}</p>
            )}
            <p className="text-gray-600 text-sm">
              Miembro desde {userData.joinDate}
            </p>
          </div>
        </div>

        <hr className="my-8" />

        {/* Information Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Correo Electrónico
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6128FF] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800 font-medium">{userData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📱 Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6128FF] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800 font-medium">{userData.phone}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Ubicación
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={editedData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6128FF] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800 font-medium">{userData.location}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💬 Bio
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="bio"
                  value={editedData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6128FF] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800 font-medium">{userData.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedData(userData);
                }}
                className="flex-1 px-6 py-3 bg-[#6128FF] text-white font-semibold rounded-lg hover:opacity-90 transition-colors duration-200"
              >
                ✏️ Editar Perfil
              </button>
              <button className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200">
                🔐 Cambiar Contraseña
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                ✅ Guardar Cambios
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                ❌ Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Additional Info Cards - Datos Reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Movimientos</h3>
          <p className="text-3xl font-bold text-[#6128FF] mb-1">{stats.movimientos}</p>
          <p className="text-gray-600 text-sm">Registrados en total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#6128FF]">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 Saldo Actual</h3>
          <p className={`text-3xl font-bold mb-1 ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${stats.saldoActual.toFixed(2)}
          </p>
          <p className="text-gray-600 text-sm">Disponible</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 Ingresos</h3>
          <p className="text-3xl font-bold text-green-600 mb-1">${stats.ingresos.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Total ingresado</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📉 Egresos</h3>
          <p className="text-3xl font-bold text-red-600 mb-1">${stats.egresos.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Total gastado</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;