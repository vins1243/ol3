/**
 * SCRIPT GOOGLE APPS SCRIPT PER OL3 RISTORANTE PIZZERIA (VERSIONE CORRETTA)
 * Incolla in Estensioni > Apps Script del foglio Google 'Prenotazioni - OL3 Ristorante'
 */

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    
    let dataStr = row[4];
    if (row[4] instanceof Date) {
      dataStr = Utilities.formatDate(row[4], "GMT+2", "yyyy-MM-dd");
    }
    let orarioStr = row[5];
    if (row[5] instanceof Date) {
      orarioStr = Utilities.formatDate(row[5], "GMT+2", "HH:mm");
    }

    data.push({
      id: String(row[0]),
      created_at: String(row[1]),
      name: String(row[2]),
      phone: String(row[3]),
      date: String(dataStr),
      time: String(orarioStr),
      guests: String(row[6]),
      notes: String(row[7]),
      status: String(row[8] || 'In attesa')
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const payload = JSON.parse(e.postData.contents);
    
    // Aggiornamento dello stato (Confermato / Rifiutato / Annullato)
    if (payload.action === "update_status") {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          sheet.getRange(i + 1, 9).setValue(payload.status);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", updated: true }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Rimozione riga prenotazione
    if (payload.action === "delete_booking") {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", deleted: true }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Nuova Prenotazione
    const newRow = [
      payload.id || ('book_' + Date.now()),
      new Date().toLocaleString('it-IT'),
      payload.name || '',
      payload.phone || '',
      payload.date || '',
      payload.time || '',
      payload.guests || '',
      payload.notes || '',
      'In attesa'
    ];
    
    sheet.appendRow(newRow);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: newRow[0] }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
