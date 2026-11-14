"use client";

import { useState, useMemo } from "react";
import { DashboardData, Transaction } from "@/types";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { InteractiveChart } from "@/components/dashboard/InteractiveChart";
import { MonthlyBreakdown } from "@/components/dashboard/MonthlyBreakdown";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wallet, TrendingUp, TrendingDown, CreditCard, ChevronDown, Download } from "lucide-react";

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

    const exportAnnualTransactions = async () => {
        const response = await fetch(`/api/transactions?year=${selectedYear}&type=all`);
        if (!response.ok) return;
        const result = await response.json() as { transactions?: Transaction[] };
        const annualTransactions = result.transactions || [];
        if (!annualTransactions.length) return;

        const escapeHtml = (value: string | number) => String(value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const rows = annualTransactions.map((tx) => `<tr>
            <td>${escapeHtml(tx.tanggal)}</td><td>${tx.belumDisetor}</td>
            <td>${tx.uangMasuk}</td><td>${tx.uangKeluar}</td>
            <td>${escapeHtml(tx.keterangan)}</td><td>${escapeHtml(tx.info)}</td>
        </tr>`).join('');
        const workbook = `<html><head><meta charset="UTF-8"></head><body><table border="1">
            <thead><tr><th>Tanggal</th><th>Belum Disetor</th><th>Uang Masuk</th><th>Uang Keluar</th><th>Keterangan</th><th>Info Tambahan</th></tr></thead>
            <tbody>${rows}</tbody></table></body></html>`;
        const url = URL.createObjectURL(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `transaksi-tahunan-${selectedYear}.xls`;
        link.click();
        URL.revokeObjectURL(url);
    };

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
            <header className="py-6 sm:py-8 flex items-center justify-between gap-4 border-b border-border-tertiary mb-8 sm:mb-10">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] bg-[#63d8a3] text-[#07110d] flex items-center justify-center font-bold text-lg shadow-[0_8px_24px_rgba(99,216,163,.18)]">
                        R
                    </div>
                    <div className="flex flex-col min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary truncate">
                        Ronda <span className="text-[#63d8a3]">Kas</span>
                    </h1>
                    <p className="text-text-secondary text-[11px] sm:text-sm truncate">
                        Padon RT 03–04 · RW 29
                    </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={exportAnnualTransactions}
                        className="hidden sm:inline-flex items-center gap-2 min-h-10 px-3 rounded-[var(--border-radius-md)] border border-[#63d8a3]/30 text-[#63d8a3] text-xs font-semibold hover:bg-[#63d8a3]/10 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export tahunan
                    </button>
                    <ThemeToggle />
                    
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            aria-label="Pilih tahun laporan"
                            className="appearance-none bg-background-secondary text-text-primary text-sm font-semibold border border-border-tertiary rounded-[var(--border-radius-md)] pl-3 pr-9 py-2.5 hover:bg-background-primary transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#63d8a3]/40"
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

            <div className="space-y-12">
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
                <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
                    <div className="space-y-4 flex flex-col">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-bold text-text-primary">Rincian bulanan</h2>
                            <span className="text-xs text-text-secondary">Tahun {selectedYear}</span>
                        </div>
                        <MonthlyBreakdown data={filteredMonthlyData} year={selectedYear} />
                    </div>
                    
                    <div className="space-y-4 flex flex-col">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-semibold text-text-primary">Tren keuangan</h2>
                            <div className="flex items-center gap-4 text-[11px] text-text-secondary">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-0.5 bg-[#63d8a3]" />
                                    <span>Saldo</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#63d8a3]" />
                                    <span>Masuk</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-text-secondary opacity-40" />
                                    <span>Keluar</span>
                                </div>
                            </div>
                        </div>
                        <div className="card bg-background-primary p-5 sm:p-6 flex-1 flex items-center">
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

