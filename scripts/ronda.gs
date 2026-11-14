function onOpen() {
  SpreadsheetApp.getUi().createMenu('Ronda').addItem('Buat tahun baru', 'buatTahunBaru').addToUi();
}

function buatTahunBaru() {
  const ui = SpreadsheetApp.getUi();
  const answer = ui.prompt('Buat tahun baru', 'Masukkan tahun, misalnya 2028', ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  const year = Number(answer.getResponseText().trim());
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    ui.alert('Tahun harus antara 2000 dan 2100.');
    return;
  }
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.getActive();
    const report = ss.getSheetByName('Laporan Bulanan');
    const previous = ss.getSheetByName(String(year - 1));
    if (!report || !previous) throw new Error('Tab tahun sebelumnya dan Laporan Bulanan harus tersedia.');
    const labels = report.getRange(1, 1, Math.max(1, report.getLastRow()), 1).getValues().flat();
    if (ss.getSheetByName(String(year)) || labels.some(value => String(value) === String(year))) {
      throw new Error('Tahun tersebut sudah tersedia. Tidak ada data yang ditimpa.');
    }
    const sheet = ss.insertSheet(String(year));
    sheet.setFrozenRows(4);
    sheet.getRange('B1:E2').setValues([
      ['Total Uang Belum Disetor', 'Total Uang Masuk', 'Total Uang Keluar', 'Saldo'],
      ['=SUM(B5:B)', '=SUM(C5:C)', '=SUM(D5:D)', '=C2-D2']
    ]);
    sheet.getRange('G2:I2').setValues([['Masuk bulanan', 'Keluar bulanan', 'Saldo']]);
    sheet.getRange('A4:F4').setValues([['Tanggal', 'Belum Disetor', 'Uang Masuk', 'Uang Keluar', 'Keterangan', 'Info']]);
    sheet.getRange('A5:I5').setValues([[new Date(year - 1, 11, 31, 12), '', "='" + (year - 1) + "'!E2", '', 'Saldo awal', '', '=C5', 0, '=C5']]);
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const days = ['minggu','senin','selasa','rabu','kamis','jumat','sabtu'];
    const rows = [];
    const totals = [];
    for (let month = 0; month < 12; month++) {
      const first = rows.length + 6;
      const count = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= count; day++) {
        const date = new Date(year, month, day, 12);
        rows.push([date, '', '', '', 'malam ' + days[(date.getDay() + 1) % 7], '', '', '', '']);
      }
      const last = rows.length + 5;
      rows[rows.length - 1].splice(6, 3, '=SUM(C' + first + ':C' + last + ')', '=SUM(D' + first + ':D' + last + ')', '=SUM(C5:C' + last + ')-SUM(D5:D' + last + ')');
      totals.push(last);
    }
    sheet.getRange(6, 1, rows.length, 9).setValues(rows);
    sheet.getRange(5, 1, rows.length + 1, 1).setNumberFormat('dd-mmm-yyyy');
    sheet.getRange('B5:D' + (rows.length + 5)).setNumberFormat('"Rp" #,##0.00');
    sheet.getRange('G5:I' + (rows.length + 5)).setNumberFormat('"Rp" #,##0.00');
    sheet.getRange('B2:E2').setNumberFormat('"Rp" #,##0.00');
    ['B1:E1','A4:I4'].forEach(range => sheet.getRange(range).setBackground('#356854').setFontColor('#ffffff').setFontWeight('bold'));
    sheet.setColumnWidths(1, 9, 150);
    sheet.setColumnWidths(5, 2, 220);
    const start = report.getLastRow() + 2;
    if (start + 13 > report.getMaxRows()) report.insertRowsAfter(report.getMaxRows(), start + 13 - report.getMaxRows());
    const block = [['Periode','Uang Masuk','Uang Keluar','Saldo'], [year, "='" + year + "'!C5", "='" + year + "'!B2", '']];
    totals.forEach((row, index) => block.push([months[index], "='" + year + "'!G" + row, "='" + year + "'!H" + row, "='" + year + "'!I" + row]));
    report.getRange(start, 1, block.length, 4).setValues(block).applyRowBanding(SpreadsheetApp.BandingTheme.GREEN);
    report.getRange(start + 1, 2, 13, 3).setNumberFormat('"Rp" #,##0.00');
    SpreadsheetApp.flush();
    ui.alert('Tab ' + year + ' dan laporan bulanan selesai dibuat.');
  } catch (error) {
    ui.alert('Pembuatan tahun: ' + error.message);
  } finally {
    lock.releaseLock();
  }
}
