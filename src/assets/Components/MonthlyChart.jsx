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

            const key = `${fecha.getFullYear()}-${fecha.getMonth()}`; // 🔥 clave real para ordenar
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
    ).sort((a, b) => a.date - b.date); // ✅ orden real

    return (
        <div className="bg-white w-full p-4 sm:p-5 rounded-2xl shadow-md">

        <h2 className="font-bold mb-4">Gastos por mes</h2>

        {data.length === 0 ? (
            <p className="text-gray-500">No hay datos</p>
        ) : (
            <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer>
                <BarChart data={data}>
                
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />

                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />

                <Bar 
                    dataKey="total" 
                    radius={[6, 6, 0, 0]} 
                />

                </BarChart>
            </ResponsiveContainer>
            </div>
        )}
        </div>
    );
}

export default MonthlyChart;