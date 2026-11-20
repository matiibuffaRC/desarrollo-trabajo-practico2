# Gestor de gastos
deploy: https://desarrollo-trabajo-practico2.vercel.app/


En el presente trabajo práctico realicé un gestor de gastos utilizando las siguientes herramientas:

- React para el desarrollo frontend de la aplicación por componentes.
- TailwindCSS para los estilos.
- La librería charts para obtener gráficos en tiempo real con la información ingresada en la página.
- LocalStorage del navegador que simula una base de datos.
- Vercel en el despliegue de la web.

La idea principal fue respetar lo máximo posible las consignas y peticiones del trabajo pero buscando ir un poco más allá para poder seguir escalando este trabajo y poder
utilizarlo como proyecto personal para mi portfolio.

Funcionalidades:

- Diseño responsive con barra lateral en escritorio y **menú flotante inferior en mobile** con botón central para agregar movimientos desde cualquier pantalla.
- Tipografía Plus Jakarta Sans con cifras tabulares para los montos y formato de moneda argentina (ARS).
- **Inicio**: saludo según la hora, saldo disponible con mini gráfico de los últimos 30 días, ingresos/gastos del mes, comparación con el mes pasado, tasa de ahorro, categoría con más gasto y actividad reciente.
- **Presupuesto mensual**: progreso con marcador del día del mes, disponible por día, proyección de gasto al ritmo actual y alertas (vas bien / cerca del límite / superado).
- **Formulario de movimientos**: tipo (gasto/ingreso), categorías con íconos para gastos e ingresos, fecha editable, validaciones en línea y control de saldo disponible. Permite editar y duplicar.
- **Movimientos**:
    - Búsqueda por texto.
    - Filtros por tipo, varias categorías a la vez, período (hoy, 7 días, 30 días, este mes, mes pasado o rango personalizado) y rango de montos.
    - Chips con los filtros activos y botón para limpiarlos. Los filtros se guardan en la URL.
    - Orden por fecha, monto o alfabético.
    - Agrupación por día con el neto diario y resumen de ingresos, gastos y neto del resultado.
    - Paginación (10, 20 o 50 por página).
    - Exportación a CSV y borrado con opción de deshacer.
- **Estadísticas** (3 meses, 6 meses, 1 año o todo):
    - KPIs: ingresos, gastos, ahorro neto y gasto diario promedio.
    - Barras de ingresos vs. gastos por mes (con vista de tabla).
    - Evolución del saldo acumulado.
    - Dona y ranking de gastos por categoría.
    - Gasto por día de la semana.
    - Top 5 gastos más grandes.
    - Generador de datos de ejemplo realistas (sueldo, alquiler, servicios, suscripciones y gastos variables).
- **Perfil**: nombre y correo editables, resumen general, límite mensual, exportación CSV, backup/restauración en JSON y borrado de datos.

Potenciales mejoras para la aplicación:

    - Modo oscuro.
    - Presupuestos por categoría y movimientos recurrentes.
    - Conexión de una base de datos. 
    - Posibilidad de crear usuarios para más personas utilicen la aplicación.
    - Posiblidad de anexar con alguna aplicación de una billetera virtual para eliminar la necesidad de la carga manual de todas las transacciones mediante una API.
