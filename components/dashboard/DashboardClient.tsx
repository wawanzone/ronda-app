"use client";

import { useState, useMemo } from "react";
import { DashboardData, Transaction } from "@/types";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { InteractiveChart } from "@/components/dashboard/InteractiveChart";
import { MonthlyBreakdown } from "@/components/dashboard/MonthlyBreakdown";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wallet, TrendingUp, TrendingDown, CreditCard, ChevronDown } from "lucide-react";

interface DashboardClientProps {
    data: DashboardData;
}

export function DashboardClient({ data }: DashboardClientProps) {
    const { monthlyReport, yearlySummaries, summary: defaultSummary } = data;

    // Extract Available Years from Monthly Report (Unique & Sorted Descending)
    const availableYears = useMemo(() => {
        const years = Array.from(new Set(monthlyReport.map((d) => d.year)));
        return years.sort((a, b) => b - a);
    }, [monthlyReport]);

    // State for Selected Year (Default to latest year available)
    const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || new Date().getFullYear());

    // State for Transaction Modal
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'unpaid'>('expense');

    // Generic handler for fetching transactions
    const handleTransactionClick = async (type: 'expense' | 'income' | 'unpaid') => {
        setTransactionType(type);
        setShowTransactionModal(true);
        setLoadingTransactions(true);

        try {
            const response = await fetch(`/api/transactions?year=${selectedYear}&type=${type}`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    // Filter Monthly Data for Chart
    const filteredMonthlyData = useMemo(() => {
        return monthlyReport.filter(d => d.year === selectedYear);
    }, [monthlyReport, selectedYear]);

    // determine Dynamic Summary Values
    const dynamicSummary = useMemo(() => {
        if (selectedYear === availableYears[0]) {
            return defaultSummary;
        }

        const exactMatch = yearlySummaries.find(s => s.year === selectedYear);

        if (exactMatch) {
            return {
                uangBelumDisetor: exactMatch.unpaid,
                uangMasuk: exactMatch.income,
                uangKeluar: exactMatch.expense,
                saldo: exactMatch.balance
            };
        }

        const income = filteredMonthlyData.reduce((acc, curr) => acc + curr.income, 0);
        const expense = filteredMonthlyData.reduce((acc, curr) => acc + curr.expense, 0);

        return {
            uangBelumDisetor: defaultSummary.uangBelumDisetor,
            uangMasuk: income,
            uangKeluar: expense,
            saldo: income - expense
        };

    }, [yearlySummaries, selectedYear, filteredMonthlyData, defaultSummary, availableYears]);

    return (
        <div className="app-shell pb-12">
            {/* Header Section */}
            <header className="py-6 flex items-center justify-between gap-4 border-b border-border-tertiary mb-8">
                <div className="flex flex-col">
                    <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-text-primary">
                        Ronda Pro
                    </h1>
                    <p className="text-text-secondary text-[12px] sm:text-sm hidden sm:block">
                        Jimpitan Coin Padon RT 03-04 RW 29
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="appearance-none bg-background-secondary text-text-primary text-sm font-medium border border-border-tertiary rounded-[var(--border-radius-md)] pl-3 pr-9 py-2 hover:bg-background-primary transition-colors cursor-pointer outline-none focus:border-text-secondary"
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    Tahun {year}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    </div>
                </div>
            </header>

            <div className="space-y-10">
                {/* Summary Section */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <SummaryCard
                            title="Belum Setor"
                            amount={dynamicSummary.uangBelumDisetor}
                            icon={Wallet}
                            className="card-sand"
                            onClick={() => handleTransactionClick('unpaid')}
                        />
                        <SummaryCard
                            title="Uang Masuk"
                            amount={dynamicSummary.uangMasuk}
                            icon={TrendingUp}
                            className="card-sage"
                            onClick={() => handleTransactionClick('income')}
                        />
                        <SummaryCard
                            title="Uang Keluar"
                            amount={dynamicSummary.uangKeluar}
                            icon={TrendingDown}
                            className="card-clay"
                            onClick={() => handleTransactionClick('expense')}
                        />
                        <SummaryCard
                            title="Saldo Akhir"
                            amount={dynamicSummary.saldo}
                            icon={CreditCard}
                            className="card-sky"
                        />
                    </div>
                </section>


                {/* Analysis Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-medium text-text-primary">Rincian Bulanan</h2>
                            <span className="text-xs text-text-secondary">Tahun {selectedYear}</span>
                        </div>
                        <MonthlyBreakdown data={filteredMonthlyData} year={selectedYear} />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-medium text-text-primary">Tren Keuangan</h2>
                            <div className="flex items-center gap-4 text-[11px] text-text-secondary">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#CC785C]" />
                                    <span>Masuk</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-text-secondary opacity-40" />
                                    <span>Keluar</span>
                                </div>
                            </div>
                        </div>
                        <div className="card bg-background-primary p-6">
                            <InteractiveChart data={filteredMonthlyData} />
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="mt-20 py-10 border-t border-border-tertiary flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-text-secondary text-xs">
                    &copy; 2026 Ronda Pro Dashboard
                </p>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="opacity-50">Handcrafted by</span>
                    <span className="font-medium text-text-primary">@wawanzone</span>
                </div>
            </footer>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                transactions={transactions}
                year={selectedYear}
                loading={loadingTransactions}
                type={transactionType}
            />
        </div>
    );
}

