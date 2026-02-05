"use client";

"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { MonthlyRecord } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface InteractiveChartProps {
    data: MonthlyRecord[];
}

export function InteractiveChart({ data }: InteractiveChartProps) {
    // Data is now pre-filtered by the parent (DashboardClient)
    // We just extract the year from the first record for the title (if data exists)
    const displayYear = data[0]?.year || "No Data";

    return (
        <div className="card w-full h-full flex flex-col">
            <div className="flex flex-row items-center justify-between mb-6 shrink-0">
                <div className="flex flex-col space-y-1">
                    <h3 className="text-value text-base">Laporan Bulanan</h3>
                    <p className="text-label normal-case tracking-normal">
                        Pemasukan vs Pengeluaran Tahun {displayYear}
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barGap={4} barCategoryGap="50%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-color)" opacity={0.5} />
                            <XAxis
                                dataKey="month"
                                stroke="var(--color-text-muted)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--color-text-muted)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value / 1000000}jt`}
                            />
                            <Tooltip
                                formatter={(value: any) => [formatCurrency(value as number), ""]}
                                contentStyle={{
                                    backgroundColor: "var(--color-bg-tertiary)",
                                    borderColor: "var(--color-border-color)",
                                    color: "var(--color-text-primary)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                }}
                                cursor={{ fill: "var(--color-border-color)", opacity: 0.2 }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{
                                    paddingTop: "24px",
                                    fontSize: "12px",
                                    opacity: 0.8
                                }}
                            />
                            <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                            <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        Belum ada data untuk tahun ini.
                    </div>
                )}
            </div>
        </div>
    );
}
