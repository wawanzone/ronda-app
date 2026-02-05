"use client";

import { MonthlyRecord } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MonthlyBreakdownProps {
    data: MonthlyRecord[];
    year: number;
}

export function MonthlyBreakdown({ data, year }: MonthlyBreakdownProps) {
    // Ensure all months are listed (Jan-Des), even if no data
    const allMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // Map short month codes or indices if necessary. 
    // Assuming 'data' uses 3-letter codes ("Jan", "Feb") from googleSheets.ts logic
    const monthMap = {
        'Januari': 'Jan', 'Februari': 'Feb', 'Maret': 'Mar', 'April': 'Apr', 'Mei': 'Mei', 'Juni': 'Jun',
        'Juli': 'Jul', 'Agustus': 'Agu', 'September': 'Sep', 'Oktober': 'Okt', 'November': 'Nov', 'Desember': 'Des'
    };

    return (
        <div className="card w-full h-full flex flex-col p-4">
            <div className="flex flex-col space-y-1 mb-3">
                <h3 className="text-value text-base">Rincian Bulanan</h3>
                <p className="text-label normal-case tracking-normal">Periode Tahun {year}</p>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-muted font-semibold pb-2 border-b border-border-color mb-1">
                <div className="w-10">Bulan</div>
                <div className="text-right flex-1">Masuk</div>
                <div className="text-right flex-1">Keluar</div>
                <div className="text-right flex-1">Saldo</div>
            </div>

            <div className="flex-1 overflow-auto pr-1 custom-scrollbar">
                <div className="space-y-0.5">
                    {allMonths.map((fullMonth, index) => {
                        const shortMonth = monthMap[fullMonth as keyof typeof monthMap];
                        const record = data.find(d => d.month === shortMonth || d.month === fullMonth);
                        const income = record?.income || 0;
                        const expense = record?.expense || 0;
                        const balance = record?.balance ?? 0;

                        // Highlight active months
                        const hasData = income > 0 || expense > 0 || (record?.balance !== undefined);

                        // Trend Logic: Compare against Previous Month
                        let trend: 'up' | 'down' | 'flat' | 'none' = 'none';
                        if (index > 0 && hasData) {
                            const prevShort = monthMap[allMonths[index - 1] as keyof typeof monthMap];
                            const prevRecord = data.find(d => d.month === prevShort);

                            if (prevRecord && prevRecord.balance !== undefined) {
                                if (balance > prevRecord.balance) trend = 'up';
                                else if (balance < prevRecord.balance) trend = 'down';
                                else trend = 'flat';
                            }
                        }

                        const formatNumber = (val: number) => new Intl.NumberFormat('id-ID').format(val);

                        return (
                            <div key={fullMonth} className={cn(
                                "flex items-center justify-between text-xs py-1.5 border-b border-border-color/50 last:border-0 hover:bg-bg-secondary/50 transition-colors rounded-sm px-1",
                                !hasData && "opacity-30 grayscale"
                            )}>
                                <div className="font-medium text-text-primary w-10 truncate">{shortMonth}</div>
                                <div className={cn("text-right flex-1 font-mono", income > 0 ? "text-accent-green" : "text-text-muted/50")}>
                                    {income > 0 ? formatNumber(income) : "-"}
                                </div>
                                <div className={cn("text-right flex-1 font-mono", expense > 0 ? "text-accent-red" : "text-text-muted/50")}>
                                    {expense > 0 ? formatNumber(expense) : "-"}
                                </div>
                                <div className="text-right flex-1 font-mono text-text-primary relative pr-6 flex justify-end items-center">
                                    <span>{hasData ? formatNumber(balance) : "-"}</span>
                                    {hasData && trend !== 'none' && (
                                        <span
                                            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-4"
                                            title={trend === 'up' ? "Naik dari bulan lalu" : "Turun dari bulan lalu"}
                                        >
                                            {trend === 'up' && <ArrowUp className="w-3 h-3 text-accent-green" />}
                                            {trend === 'down' && <ArrowDown className="w-3 h-3 text-accent-red" />}
                                            {trend === 'flat' && <Minus className="w-3 h-3 text-text-muted" />}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
