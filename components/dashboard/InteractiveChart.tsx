"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { MonthlyRecord } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface InteractiveChartProps {
    data: MonthlyRecord[];
}

export function InteractiveChart({ data }: InteractiveChartProps) {
    return (
        <div className="w-full h-[320px]">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={6} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border-tertiary)" opacity={0.4} />
                        <XAxis
                            dataKey="month"
                            stroke="var(--color-text-secondary)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            opacity={0.6}
                        />
                        <YAxis
                            stroke="var(--color-text-secondary)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value / 1000}k`}
                            opacity={0.6}
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(value as number), ""]}
                            contentStyle={{
                                backgroundColor: "var(--color-background-primary)",
                                borderColor: "var(--color-border-tertiary)",
                                color: "var(--color-text-primary)",
                                borderRadius: "var(--border-radius-md)",
                                fontSize: "12px",
                                border: "0.5px solid var(--color-border-tertiary)",
                                boxShadow: "none"
                            }}
                            cursor={{ fill: "var(--color-background-secondary)", opacity: 0.4 }}
                        />
                        <Bar 
                            dataKey="income" 
                            name="Pemasukan" 
                            fill="#CC785C" 
                            radius={[1, 1, 0, 0]} 
                            barSize={8} 
                        />
                        <Bar 
                            dataKey="expense" 
                            name="Pengeluaran" 
                            fill="var(--color-text-secondary)" 
                            fillOpacity={0.15}
                            radius={[1, 1, 0, 0]} 
                            barSize={8} 
                        />

                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                    Belum ada data tersedia.
                </div>
            )}
        </div>
    );
}

