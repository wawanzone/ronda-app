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
            colorClass: 'text-text-danger'
        },
        income: {
            title: 'Detail Uang Masuk',
            column: 'uangMasuk' as keyof Transaction,
            colorClass: 'text-text-success'
        },
        unpaid: {
            title: 'Detail Belum Disetor',
            column: 'belumDisetor' as keyof Transaction,
            colorClass: 'text-[#B08A4D]'
        },

    };


    const { title, column, colorClass } = config[type];
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx[column] as number), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background-primary/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background-primary border border-border-tertiary rounded-t-[var(--border-radius-lg)] sm:rounded-[var(--border-radius-lg)] w-full sm:max-w-4xl h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-none animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-8 border-b border-border-tertiary">
                    <div>
                        <h2 className="text-xl font-medium text-text-primary">{title}</h2>
                        <p className="text-xs text-text-secondary mt-1">Tahun {year} • {transactions.length} transaksi tercatat</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-background-secondary rounded-full transition-colors border border-border-tertiary"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-0 sm:px-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-text-secondary animate-pulse text-sm">Memuat data...</div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-text-secondary text-sm">Tidak ada riwayat transaksi ditemukan.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px] min-w-max border-collapse">
                                <thead className="sticky top-0 bg-background-primary/95 backdrop-blur-sm z-10 border-b border-border-tertiary">
                                    <tr className="text-left">
                                        <th className="px-5 sm:px-8 py-4 font-medium text-text-secondary">Tanggal</th>
                                        <th className="px-5 sm:px-8 py-4 font-medium text-text-secondary text-right">
                                            {type === 'unpaid' ? 'Belum Disetor' : type === 'income' ? 'Uang Masuk' : 'Uang Keluar'}
                                        </th>
                                        <th className="px-5 sm:px-8 py-4 font-medium text-text-secondary">Keterangan</th>
                                        {type === 'expense' && <th className="px-5 sm:px-8 py-4 font-medium text-text-secondary">Info Tambahan</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-tertiary/50">
                                    {transactions.map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-background-secondary/40 transition-colors group">
                                            <td className="px-5 sm:px-8 py-4 text-text-secondary group-hover:text-text-primary transition-colors">{tx.tanggal}</td>
                                            <td className={cn("px-5 sm:px-8 py-4 font-medium text-right tabular-nums", colorClass)}>
                                                {formatNumber(tx[column] as number)}
                                            </td>
                                            <td className="px-5 sm:px-8 py-4 text-text-primary max-w-xs truncate">{tx.keterangan}</td>
                                            {type === 'expense' && <td className="px-5 sm:px-8 py-4 text-text-secondary italic">{tx.info}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 sm:p-8 border-t border-border-tertiary bg-background-secondary/50">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                            Ringkasan Total
                        </div>
                        <div className={cn("text-lg font-medium tabular-nums", colorClass)}>
                            Rp {formatNumber(totalAmount)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

