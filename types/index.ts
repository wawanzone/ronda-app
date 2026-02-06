export interface FinanceSummary {
    uangBelumDisetor: number;
    uangMasuk: number;
    uangKeluar: number;
    saldo: number;
}

export interface MonthlyRecord {
    year: number; // Added to support multi-year filtering
    month: string; // e.g., "Januari", "Februari"
    income: number;
    expense: number;
    balance?: number; // Running Balance (Saldo)
}

export interface YearlyRecord {
    year: number;
    income: number;
    expense: number;
}

// Year-level summary extracted from the header row (e.g., "2024")
export interface YearlySummary {
    year: number;
    unpaid: number; // Uang Belum Disetor
    income: number;
    expense: number;
    balance: number; // Saldo
}

// Transaction detail from year sheet (columns A-F)
export interface Transaction {
    tanggal: string;        // A: Date
    belumDisetor: number;   // B: Unpaid amount
    uangMasuk: number;      // C: Income
    uangKeluar: number;     // D: Expense (filter criteria)
    keterangan: string;     // E: Description
    info: string;           // F: Additional info
}

export interface DashboardData {
    summary: FinanceSummary; // Legacy/Current Summary
    monthlyReport: MonthlyRecord[];
    yearlyReport: YearlyRecord[];
    yearlySummaries: YearlySummary[]; // New: List of summaries per year
}
