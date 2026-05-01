# Gestor de gastos
deploy: https://desarrollo-trabajo-practico2.vercel.app/


En el presente trabajo práctico realicé un gestor de gastos utilizando las siguientes herramientas:

- React para el desarrollo frontend de la aplicación por componentes.
- TailwindCSS para los estilos.
- La librería charts para obtener gráficos en tiempo real con la información ingresada en la página.}
- LocalStorage del navegador que simula una base de datos.

La idea principal fue respetar lo máximo posible las consignas y peticiones del trabajo pero buscando ir un poco más allá para poder seguir escalando este trabajo y poder
utilizarlo como proyecto personal para mi portfolio.

Funcionalidades con las que cuentas:

- Diseño responsive.
- Muestra del monto disponible del usuario para gastar.
- Establecimiento de límites de gastos mensuales.
- Advertencias para casos donde el límite de gasto mensual es excedido.
- Barra de porcentaje que muestra el progreso respecto al límite establecido.
- Formulario para agregar una nueva transacción con toda la información necesaria.
- Historial con todas las transacciones recientes.
- Sección de transacciones que permite:
    - Filtrado por categorias de gastos.
    - Filtrado por tipo de transacción (si es un ingreso o un gasto).
    - Filtrado por tiempo en que se realizó una transacción.
    - Ordenamiento ascendente o descendente de transacciones por:
        - Fechas.
        - Montos.
    - Combinaciones de filtrados de los anteriores criterios.
    - Posibilidad de edición o borrado de una transacción en particular.
    - Funcionalidad de borrado completo de todas las transacciones.
- Sección de estadísticas donde encontramos:
    - Generador de transacciones randoms para poder utilizar y simular funcionamiento de los gráficos.
    - Un gráfico torta donde podemos ver los gastos por categorías.
          - Filtrado por meses
    - Un gráfico de barras que muestra el total de gastos por mes.
          - Resumen con estadísticas considerables por mes.


Potenciales mejoras para la aplicación:

    - Funcionalidad del modo claro/oscuro.
    - Conexión de una base de datos. 
    - Posibilidad de crear usuarios para más personas utilicen la aplicación.
    - Posiblidad de anexar con alguna aplicación de una billetera virtual para eliminar la necesidad de la carga manual de todas las transacciones.
