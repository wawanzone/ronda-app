import Papa from 'papaparse';
import { DashboardData, FinanceSummary, MonthlyRecord, YearlyRecord } from '@/types';

// Robust Currency Parser (Module Scope)
const parseCurrency = (value: string | undefined): number => {
    if (!value) return 0;
    // 1. Remove "Rp", whitespace, and non-numeric chars except . , -
    let str = value.toString().replace(/[^\d.,-]/g, "");

    // 2. Detect Format (US vs ID)
    // US: 1,234.56 (comma before dot) -> Remove commas
    // ID: 1.234,56 (dot before comma) -> Remove dots, swap comma to dot
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');

    if (lastComma > lastDot) {
        // ID Format (Decimal is comma)
        str = str.replace(/\./g, "").replace(",", ".");
    } else {
        // US Format (Decimal is dot) or Integer
        str = str.replace(/,/g, "");
    }

    return parseFloat(str) || 0;
};

// Fallback Mock Data
const MOCK_DATA: DashboardData = {
    summary: {
        uangBelumDisetor: 5000000,
        uangMasuk: 156000000,
        uangKeluar: 45000000,
        saldo: 111000000,
    },
    monthlyReport: [
        { year: 2026, month: 'Jan', income: 12000000, expense: 4000000 },
        { year: 2026, month: 'Feb', income: 15000000, expense: 5000000 },
        { year: 2026, month: 'Mar', income: 10000000, expense: 3000000 },
    ],
    yearlyReport: [
        { year: 2023, income: 150000000, expense: 50000000 },
        { year: 2024, income: 180000000, expense: 60000000 },
    ],
    yearlySummaries: [
        { year: 2026, unpaid: 5000000, income: 156000000, expense: 45000000, balance: 111000000 }
    ]
};

async function fetchCSV(sheetId: string, gid: string) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    try {
        const response = await fetch(url, { next: { revalidate: 60 } }); // Revalidate every 60s
        if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        const text = await response.text();
        return Papa.parse(text, { header: false, skipEmptyLines: true }).data as string[][];
    } catch (error) {
        console.error(`Error fetching CSV (GID: ${gid}):`, error);
        return [];
    }
}

export async function getDashboardData(): Promise<DashboardData> {
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Default GIDs (Tab IDs). User can override these in .env
    const dashboardGid = process.env.GOOGLE_SHEET_DASHBOARD_GID || '0';
    const monthlyGid = process.env.GOOGLE_SHEET_MONTHLY_GID || '0'; // Assuming same sheet for now if not specified
    const yearlyGid = process.env.GOOGLE_SHEET_YEARLY_GID || '0';    // Assuming same sheet for now if not specified

    if (!sheetId) {
        console.warn("⚠️ GOOGLE_SHEET_ID is missing. Using Mock Data.");
        return MOCK_DATA;
    }

    try {
        // Fetch Dictionary-style or distinct sheets
        // Strategy: We attempt to fetch the specific tabs. 
        // If users put everything on one sheet (GID 0), we parse precise cells.

        // 1. Fetch Dashboard Summary (Assuming GID 0 or Specific GID)
        // Parallel fetch for valid GIDs to optimize performance
        const pSummary = fetchCSV(sheetId, dashboardGid);
        const pMixed = fetchCSV(sheetId, monthlyGid);

        const [summaryData, mixedData] = await Promise.all([pSummary, pMixed]);

        const getCellValue = (data: string[][], row: number, col: number) => {
            return data[row]?.[col];
        };

        const summary: FinanceSummary = {
            uangBelumDisetor: parseCurrency(getCellValue(summaryData, 1, 1)), // B2
            uangMasuk: parseCurrency(getCellValue(summaryData, 1, 2)),        // C2
            uangKeluar: parseCurrency(getCellValue(summaryData, 1, 3)),       // D2
            saldo: parseCurrency(getCellValue(summaryData, 1, 4)),            // E2
        };

        let yearlyReport: YearlyRecord[] = [];
        let yearlySummaries: import('@/types').YearlySummary[] = [];
        let monthRecords: { year: number, month: string, income: number, expense: number, balance: number }[] = [];
        let currentYear = 0;

        // Valid Indonesian Months
        const validMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        for (const row of mixedData) {
            const col0 = row[0]?.toString().trim();
            if (!col0) continue;

            // Detect Year Header (e.g. "2026")
            if (/^\d{4}$/.test(col0)) {
                currentYear = parseInt(col0);
                const openingBalance = parseCurrency(row[1]); // Col B: Saldo Awal
                const unpaid = parseCurrency(row[2]);         // Col C: Uang Belum Disetor (Filled by User)

                yearlySummaries.push({
                    year: currentYear,
                    unpaid: unpaid,
                    income: openingBalance,  // Initialize Income with Opening Balance
                    expense: 0, // Will aggregate from months
                    balance: 0 // Will update from last month's running balance
                });
                continue;
            }

            // Detect Month Row (e.g. "Januari")
            if (validMonths.includes(col0) && currentYear > 0) {
                const income = parseCurrency(row[1]);
                const expense = parseCurrency(row[2]);
                const runningBalance = parseCurrency(row[3]);

                // Update Partial Yearly Summary
                const summary = yearlySummaries.find(s => s.year === currentYear);
                if (summary) {
                    summary.income += income;
                    summary.expense += expense;
                    // Always update balance to the latest month's running balance
                    // (Assuming months are chronological, the last one processed is the latest)
                    summary.balance = runningBalance;
                }

                // Only add if there is data (ignore empty rows placeholder)
                if (income > 0 || expense > 0) {
                    monthRecords.push({
                        year: currentYear,
                        month: col0,
                        income,
                        expense,
                        balance: runningBalance
                    });
                }
            }
        }

        // Filter Monthly Report: Show ALL active months (UI will filter by year)
        // We just sort them by Year -> Month Index
        const monthlyReport: MonthlyRecord[] = monthRecords
            .map(m => ({
                year: m.year,
                month: m.month.substring(0, 3), // Shorten to "Jan", "Feb"
                income: m.income,
                expense: m.expense,
                balance: m.balance
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                // Simple month sort logic could be added here if needed, 
                // but usually input order or index map is safer. 
                // Assuming input is chronologically sorted per year group.
                return 0;
            });

        // Sort Yearly Report Ascending (Recharts usually prefers time asc)
        yearlyReport.sort((a, b) => a.year - b.year);

        return {
            summary: summary.uangMasuk ? summary : MOCK_DATA.summary,
            monthlyReport: monthlyReport.length ? monthlyReport : MOCK_DATA.monthlyReport,
            yearlyReport: yearlyReport.length ? yearlyReport : MOCK_DATA.yearlyReport,
            yearlySummaries
        };

    } catch (error) {
        console.error("Error parsing Google Sheets CSV:", error);
        return MOCK_DATA;
    }
}
