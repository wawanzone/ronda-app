"use client";

import { useState, useMemo } from "react";
import { DashboardData, Transaction } from "@/types";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { InteractiveChart } from "@/components/dashboard/InteractiveChart";
import { MonthlyBreakdown } from "@/components/dashboard/MonthlyBreakdown";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
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
    // Try to find exact summary from "Year Header" row (yearlySummaries)
    // If not found, fallback to calculating from detailed monthly data, or default summary
    const dynamicSummary = useMemo(() => {
        // 1. If looking at the latest year (Active Dashboard Year), use the B2-E2 parsing
        // This ensures "Uang Belum Disetor", "Saldo", etc match the specific Year Tab
        if (selectedYear === availableYears[0]) {
            return defaultSummary;
        }

        // 2. For historical years, try to find in YearlySummaries (from Laporan Bulanan headers)
        const exactMatch = yearlySummaries.find(s => s.year === selectedYear);

        if (exactMatch) {
            return {
                uangBelumDisetor: exactMatch.unpaid, // Use scraped value 
                uangMasuk: exactMatch.income,
                uangKeluar: exactMatch.expense,
                saldo: exactMatch.balance
            };
        }

        // Fallback: Calculate from monthly data
        const income = filteredMonthlyData.reduce((acc, curr) => acc + curr.income, 0);
        const expense = filteredMonthlyData.reduce((acc, curr) => acc + curr.expense, 0);

        return {
            uangBelumDisetor: defaultSummary.uangBelumDisetor,
            uangMasuk: income,
            uangKeluar: expense,
            saldo: income - expense // Heuristic
        };

    }, [yearlySummaries, selectedYear, filteredMonthlyData, defaultSummary]);

    return (
        <div className="app-shell pb-12 transition-all duration-300">
            {/* Header Section */}
            <header className="py-4 sm:py-6 border-b border-border-color mb-6 sm:mb-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary leading-tight sm:leading-none">
                            Ronda Pro
                        </h1>
                        <p className="text-text-muted text-[11px] sm:text-sm tracking-tight capitalize hidden sm:block">
                            Laporan Keuangan & Arus Kas
                        </p>
                    </div>

                    {/* Right Side: Global Year Dropdown */}
                    <div className="flex items-center justify-end">
                        {/* Global Year Selector */}
                        <div className="relative group">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="appearance-none bg-bg-secondary text-text-primary text-base font-bold uppercase tracking-wider border border-border-color rounded-lg pl-4 pr-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-text-muted/20 focus:border-text-muted cursor-pointer hover:bg-bg-tertiary transition-all"
                            >
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-hover:text-text-primary transition-colors pointer-events-none" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {/* Dynamic Summary Cards - Modified Layout for Saldo Prominence */}
                {/* Desktop: 3 Top (1fr each), Saldo Bottom (Full Width) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                    {/* Metric Cards */}
                    <SummaryCard
                        title="Belum Setor"
                        amount={dynamicSummary.uangBelumDisetor}
                        icon={Wallet}
                        iconClassName="text-accent-yellow"
                        onClick={() => handleTransactionClick('unpaid')}
                    />
                    <SummaryCard
                        title="Uang Masuk"
                        amount={dynamicSummary.uangMasuk}
                        icon={TrendingUp}
                        iconClassName="text-accent-green"
                        onClick={() => handleTransactionClick('income')}
                    />
                    <SummaryCard
                        title="Uang Keluar"
                        amount={dynamicSummary.uangKeluar}
                        icon={TrendingDown}
                        iconClassName="text-accent-red"
                        onClick={() => handleTransactionClick('expense')}
                    />

                    {/* Saldo - Wider (2 cols) & Prominent */}
                    <div className="col-span-1 lg:col-span-2">
                        <SummaryCard
                            title="Saldo Akhir"
                            amount={dynamicSummary.saldo}
                            icon={CreditCard}
                            iconClassName="text-accent-yellow"
                            className="bg-accent-yellow/10 border-accent-yellow/20 h-full"
                        />
                    </div>
                </div>

                {/* Charts Grid: Table (50%) + Chart (50%) - Equal Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div className="h-[500px] lg:h-auto">
                        <MonthlyBreakdown data={filteredMonthlyData} year={selectedYear} />
                    </div>
                    <div className="h-[300px] lg:h-auto order-first lg:order-last">
                        <InteractiveChart data={filteredMonthlyData} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 py-6 border-t border-border-color text-center">
                <p className="text-text-muted text-[11px] sm:text-sm tracking-tight lowercase">
                    &copy; 2026 by @wawanzone
                </p>
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
