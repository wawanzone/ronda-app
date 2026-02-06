"use client";

import { Transaction } from "@/types";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    year: number;
    loading?: boolean;
    type?: 'expense' | 'income' | 'unpaid';
}

export function TransactionModal({ isOpen, onClose, transactions, year, loading, type = 'expense' }: TransactionModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const formatNumber = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    // Dynamic title and column based on type
    const config = {
        expense: {
            title: 'Detail Uang Keluar',
            column: 'uangKeluar' as keyof Transaction,
            colorClass: 'text-accent-red'
        },
        income: {
            title: 'Detail Uang Masuk',
            column: 'uangMasuk' as keyof Transaction,
            colorClass: 'text-accent-green'
        },
        unpaid: {
            title: 'Detail Belum Disetor',
            column: 'belumDisetor' as keyof Transaction,
            colorClass: 'text-accent-yellow'
        },
    };

    const { title, column, colorClass } = config[type];
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx[column] as number), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal - Fullscreen on mobile, centered on desktop */}
            <div className="relative bg-bg-primary border border-border-color rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                {/* Header - Compact on mobile */}
                <div className="flex items-center justify-between p-3 sm:p-6 border-b border-border-color">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-text-primary">{title}</h2>
                        <p className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1">Tahun {year} • {transactions.length} transaksi</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                {/* Content - Compact padding on mobile */}
                <div className="flex-1 overflow-auto p-2 sm:p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-text-muted">Loading...</div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-text-muted">Tidak ada data transaksi</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <table className="w-full text-sm min-w-max">
                                <thead className="sticky top-0 bg-bg-secondary border-b border-border-color">
                                    <tr className="text-left">
                                        <th className="px-2 sm:px-3 py-2 sm:py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Tanggal</th>
                                        {type === 'unpaid' && <th className="px-2 sm:px-3 py-2 sm:py-3 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Belum Disetor</th>}
                                        {type === 'income' && <th className="px-2 sm:px-3 py-2 sm:py-3 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Uang Masuk</th>}
                                        {type === 'expense' && <th className="px-2 sm:px-3 py-2 sm:py-3 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Uang Keluar</th>}
                                        <th className="px-2 sm:px-3 py-2 sm:py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Keterangan</th>
                                        {type === 'expense' && <th className="px-2 sm:px-3 py-2 sm:py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Info</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color/50">
                                    {transactions.map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-bg-secondary/50 transition-colors">
                                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-text-primary font-medium whitespace-nowrap text-xs sm:text-sm">{tx.tanggal}</td>
                                            <td className={cn("px-2 sm:px-3 py-2 sm:py-3 font-mono text-right whitespace-nowrap text-xs sm:text-sm", colorClass)}>
                                                {formatNumber(tx[column] as number)}
                                            </td>
                                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-text-primary text-xs sm:text-sm">{tx.keterangan}</td>
                                            {type === 'expense' && <td className="px-2 sm:px-3 py-2 sm:py-3 text-text-muted text-xs sm:text-sm">{tx.info}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer - Compact on mobile */}
                <div className="p-3 sm:p-6 border-t border-border-color bg-bg-secondary/30">
                    <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm text-text-muted">
                            Total: <span className="font-bold text-text-primary">{transactions.length}</span> transaksi
                        </div>
                        <div className={cn("text-xs sm:text-sm font-mono font-bold", colorClass)}>
                            {formatNumber(totalAmount)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
