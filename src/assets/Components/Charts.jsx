import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function Charts({ movements }) {
    
    const data = Object.values(
        movements
            .filter(mov => mov.tipo?.toLowerCase() === "gasto")
            .reduce((acc, mov) => {
                const categoria = mov.categoria || "Sin categoría";

                if (!acc[categoria]) {
                    acc[categoria] = { name: categoria, value: 0 };
                }

                acc[categoria].value += mov.monto;
                return acc;
            }, {})
    );

    const COLORS = ["#00A650", "#FF8042", "#0088FE", "#FFBB28", "#AF19FF"];

    const total = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="bg-white w-full p-4 sm:p-5 rounded-2xl shadow-md">

            {/* HEADER */}
            <div className="mb-4">
                <h2 className="font-bold text-base sm:text-lg">Gastos por categoría</h2>
                <p className="text-xs sm:text-sm text-gray-500">
                    Total: <span className="font-semibold text-black">${total.toFixed(2)}</span>
                </p>
            </div>

            {data.length === 0 ? (
                <p className="text-gray-500">No hay datos</p>
            ) : (
                <>
                    {/* 📊 GRÁFICO */}
                    <div className="w-full h-52 sm:h-64">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius="80%"
                                    paddingAngle={2}
                                    label={window.innerWidth > 640 
                                        ? ({ name, value }) => `${name}: $${value.toFixed(0)}`
                                        : false // ❌ ocultamos en mobile
                                    }
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>

                                <Tooltip 
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 📋 LEYENDA */}
                    <div className="mt-4 flex flex-col gap-2">
                        {data.map((item, index) => {
                            const porcentaje = ((item.value / total) * 100).toFixed(1);

                            return (
                                <div 
                                    key={index} 
                                    className="flex justify-between items-center text-xs sm:text-sm bg-gray-50 px-3 py-2 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="font-medium">{item.name}</span>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-semibold">
                                            ${item.value.toFixed(2)}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-500">
                                            {porcentaje}%
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default Charts;