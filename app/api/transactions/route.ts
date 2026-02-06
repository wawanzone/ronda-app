import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { Transaction } from '@/types';

// Robust Currency Parser
const parseCurrency = (value: string | undefined): number => {
    if (!value) return 0;
    let str = value.toString().replace(/[^\d.,-]/g, "");

    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');

    if (lastComma > lastDot) {
        str = str.replace(/\./g, "").replace(",", ".");
    } else {
        str = str.replace(/,/g, "");
    }

    return parseFloat(str) || 0;
};

async function fetchCSV(sheetId: string, gid: string) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        const text = await response.text();
        return Papa.parse(text, { header: false, skipEmptyLines: false }).data as string[][];
    } catch (error) {
        console.error(`Error fetching CSV (GID: ${gid}):`, error);
        return [];
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const type = searchParams.get('type') || 'expense'; // expense, income, unpaid

    if (!year) {
        return NextResponse.json({ error: 'Year parameter required' }, { status: 400 });
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
        return NextResponse.json({ error: 'Sheet ID not configured' }, { status: 500 });
    }

    // Get year-specific GID from env
    const gidKey = `GOOGLE_SHEET_${year}_GID`;
    const gid = process.env[gidKey];

    if (!gid) {
        return NextResponse.json({ error: `GID for year ${year} not configured` }, { status: 404 });
    }

    try {
        const data = await fetchCSV(sheetId, gid);

        // Parse rows 4-500 (index 3-499), filter based on type
        const transactions: Transaction[] = [];

        // Determine which column to filter by
        const filterColumnIndex = type === 'unpaid' ? 1 : type === 'income' ? 2 : 3;

        for (let i = 3; i < Math.min(500, data.length); i++) {
            const row = data[i];
            if (!row) continue;

            const filterValue = parseCurrency(row[filterColumnIndex]);

            // Filter: only include rows where the target column has content (amount > 0)
            if (filterValue > 0) {
                transactions.push({
                    tanggal: row[0] || '',
                    belumDisetor: parseCurrency(row[1]),
                    uangMasuk: parseCurrency(row[2]),
                    uangKeluar: parseCurrency(row[3]),
                    keterangan: row[4] || '',
                    info: row[5] || '',
                });
            }
        }

        return NextResponse.json({ transactions, count: transactions.length, type });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
