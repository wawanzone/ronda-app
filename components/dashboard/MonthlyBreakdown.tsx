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
    const monthMap = {
        'Januari': 'Jan', 'Februari': 'Feb', 'Maret': 'Mar', 'April': 'Apr', 'Mei': 'Mei', 'Juni': 'Jun',
        'Juli': 'Jul', 'Agustus': 'Agu', 'September': 'Sep', 'Oktober': 'Okt', 'November': 'Nov', 'Desember': 'Des'
    };

    return (
        <div className="card w-full h-full flex flex-col bg-background-primary">
            {/* Header */}
            <div className="grid grid-cols-4 items-center text-[10px] uppercase tracking-wider text-text-secondary font-medium pb-3 border-b border-border-tertiary mb-1">
                <div className="pl-1">Bulan</div>
                <div className="text-right pr-2">Masuk</div>
                <div className="text-right pr-2">Keluar</div>
                <div className="text-right pr-1">Saldo</div>
            </div>

            <div className="flex-1 overflow-auto pr-1 no-scrollbar">
                <div className="space-y-0">
                    {allMonths.map((fullMonth, index) => {
                        // ... existing mapping logic ...
                        const shortMonth = monthMap[fullMonth as keyof typeof monthMap];
                        const record = data.find(d => d.month === shortMonth || d.month === fullMonth);
                        const income = record?.income || 0;
                        const expense = record?.expense || 0;
                        const balance = record?.balance ?? 0;
                        const hasData = income > 0 || expense > 0 || (record?.balance !== undefined);

                        // ... existing trend logic ...
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
                                "grid grid-cols-4 items-center text-[11px] py-2.5 border-b border-border-tertiary/20 last:border-0 hover:bg-background-secondary/30 transition-colors rounded-sm px-1",
                                !hasData && "opacity-20"
                            )}>
                                <div className="font-medium text-text-primary pl-1">{shortMonth}</div>
                                <div className={cn("text-right pr-2 tabular-nums", income > 0 ? "text-text-success" : "text-text-secondary")}>
                                    {income > 0 ? formatNumber(income) : "—"}
                                </div>
                                <div className={cn("text-right pr-2 tabular-nums", expense > 0 ? "text-text-danger" : "text-text-secondary")}>
                                    {expense > 0 ? formatNumber(expense) : "—"}
                                </div>
                                <div className="text-right pr-1 tabular-nums text-text-primary font-medium flex justify-end items-center gap-1">
                                    <span>{hasData ? formatNumber(balance) : "—"}</span>
                                    <div className="w-3 h-3 flex items-center justify-center">
                                        {hasData && trend === 'up' && <ArrowUp className="w-2.5 h-2.5 text-text-success opacity-70" />}
                                        {hasData && trend === 'down' && <ArrowDown className="w-2.5 h-2.5 text-text-danger opacity-70" />}
                                        {hasData && trend === 'flat' && <Minus className="w-2.5 h-2.5 text-text-secondary opacity-30" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}

