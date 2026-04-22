import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function MonthlyChart({ movements }) {

    const data = Object.values(
        movements
        .filter(mov => mov.tipo?.toLowerCase() === "gasto")
        .reduce((acc, mov) => {
            const fecha = new Date(mov.fecha);

            const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
            const label = fecha.toLocaleDateString("es-AR", {
                month: "short",
                year: "2-digit"
            });

            if (!acc[key]) {
                acc[key] = { name: label, total: 0, date: fecha };
            }

            acc[key].total += mov.monto;

            return acc;
        }, {})
    ).sort((a, b) => a.date - b.date);

    // 🔥 RESUMEN
    const totalGastos = data.reduce((acc, item) => acc + item.total, 0);
    const promedio = data.length ? totalGastos / data.length : 0;

    const maxMes = data.length
        ? data.reduce((max, item) => item.total > max.total ? item : max, data[0])
        : null;

    const minMes = data.length
        ? data.reduce((min, item) => item.total < min.total ? item : min, data[0])
        : null;

    return (
        <div className="bg-white w-full p-4 sm:p-5 rounded-2xl shadow-md">

            <h2 className="font-bold mb-13">Gastos por mes</h2>

            {data.length === 0 ? (
                <p className="text-gray-500">No hay datos</p>
            ) : (
                <>
                    {/* 📊 GRÁFICO */}
                    <div className="w-full h-56 sm:h-64 my-4 bg-linear-to-bl from-[#AFACF4] to-[#F3EDEB] p-5 rounded-2xl shadow">
                        <ResponsiveContainer className={`pr-6 pt-6`}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#48e"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-3 text-sm">
                        
                        <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="text-gray-500">
                                Total
                            </p>
                            <p className="font-semibold">
                                ${totalGastos.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="text-gray-500">
                                Promedio
                            </p>
                            <p className="font-semibold">
                                ${promedio.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="text-gray-500">
                                Mayor gasto
                            </p>
                            <p className="font-semibold">
                                {maxMes?.name} (${maxMes?.total.toFixed(2)})
                            </p>
                        </div>

                        <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="text-gray-500">
                                Menor gasto
                            </p>
                            <p className="font-semibold">
                                {minMes?.name} (${minMes?.total.toFixed(2)})
                            </p>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

export default MonthlyChart;