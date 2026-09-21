/**
 * BACKEND GOOGLE APPS SCRIPT - OL3 RISTORANTE PIZZERIA (VERSIONE FOGLIO UNIFICATO)
 * Unico foglio "Prenotazioni" contenente tutti i dati e le 3 colonne di stato separate:
 * - Colonna L (12): Stato Prenotazione (Confermata, In attesa, Annullata, Rifiutata)
 * - Colonna M (13): Stato Ordinazione (Inizialmente vuoto / Da Servire; Ordinazione Presa)
 * - Colonna N (14): Dettaglio Piatti Comanda (JSON comanda e riepilogo piatti)
 * - Colonna O (15): Stato Pagamento (Da Saldare, Saldato)
 *
 * NOTA FONDAMENTALE: Le operazioni di comanda e cassa NON toccano MAI la Colonna L (Stato Prenotazione)!
 */

const SPREADSHEET_ID = "1u5aKXWIb00V_u038qUka_eje1f8DpvLuG0wznZmRpcI";
const MAX_TABLES = 50;

function calculateTables(guests) {
  const g = parseInt(guests, 10) || 1;
  return Math.ceil(g / 2);
}

function isTurno1(turno) {
  const s = String(turno || '').toLowerCase().trim();
  if (s.includes('2°') || s.includes('secondo') || s.includes('dalle 21:30') || s.startsWith('21:30')) return false;
  return s.includes('1°') || s.includes('primo') || s.includes('20:00') || s.includes('1');
}

function isTurno2(turno) {
  const s = String(turno || '').toLowerCase().trim();
  if (s.includes('2°') || s.includes('secondo') || s.includes('dalle 21:30') || s.startsWith('21:30')) return true;
  if (s.includes('21:30') && !s.includes('20:00')) return true;
  return false;
}

function normalizeDate(d) {
  if (!d) return '';
  if (d instanceof Date) {
    return Utilities.formatDate(d, "GMT+2", "yyyy-MM-dd");
  }
  const s = String(d).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  const mIt = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (mIt) {
    return mIt[3] + '-' + mIt[2].padStart(2, '0') + '-' + mIt[1].padStart(2, '0');
  }
  return s;
}

function getSpreadsheet() {
  let ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch(e) {}
  if (!ss && SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch(e) {}
  }
  if (!ss) throw new Error("Foglio Google non raggiungibile");
  return ss;
}

function getSheet(ss) {
  return ss.getSheetByName("Prenotazioni") || ss.getSheetByName("Foglio1") || ss.getSheets()[0];
}

// Inserimento NUOVA PRENOTAZIONE (scrive 1 sola riga nell'unico foglio)
function processBooking(payload) {
  const ss = getSpreadsheet();
  const sheet = getSheet(ss);

  const bookingId = String(payload.id || ('OL3_' + Date.now())).trim();

  // DEDUPLICAZIONE: controlla se l'ID esiste già nel foglio
  SpreadsheetApp.flush();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0] || '').trim() === bookingId) {
      return {
        status: "success",
        already_exists: true,
        confirmed: true,
        bookingId: bookingId,
        message: "Prenotazione già registrata"
      };
    }
  }

  const targetDate = normalizeDate(payload.date);
  const guests = parseInt(payload.guests, 10) || 2;
  const tablesNeeded = calculateTables(guests);
  const chosenTurno = String(payload.time || '').trim();

  // Calcolo occupazione tavoli nel turno
  let occupied = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || String(r[0]).trim() === bookingId) continue;
    const rDate = normalizeDate(r[2]);
    const rStatus = String(r[11] || '').trim().toLowerCase(); // Colonna L (Stato Prenotazione)

    if (rDate === targetDate && rStatus !== 'annullata' && rStatus !== 'rifiutata') {
      const rTurno = String(r[4] || r[3] || '').toLowerCase();
      const rTables = parseInt(r[9], 10) || calculateTables(r[8]);
      const isTargetTurno1 = isTurno1(chosenTurno);
      if (isTargetTurno1 && isTurno1(rTurno)) {
        occupied += rTables;
      } else if (!isTargetTurno1 && isTurno2(rTurno)) {
        occupied += rTables;
      }
    }
  }

  if ((occupied + tablesNeeded) > MAX_TABLES) {
    return {
      status: "full",
      message: "Tavoli esauriti per questo turno",
      tablesLeft: Math.max(0, MAX_TABLES - occupied)
    };
  }

  const createdAt = new Date().toLocaleString('it-IT');
  const displayTurno = isTurno1(chosenTurno) ? "1° Turno (20:00 - 21:30)" : "2° Turno (dalle 21:30)";

  // Calcolo etichetta tavolo
  const startNum = occupied + 1;
  const endNum = Math.min(MAX_TABLES, startNum + tablesNeeded - 1);
  const tableLabel = (tablesNeeded === 1) 
    ? `T${String(startNum).padStart(2, '0')}` 
    : `Tavoli Uniti T${String(startNum).padStart(2, '0')} - T${String(endNum).padStart(2, '0')}`;

  // Inserimento della riga nell'unico foglio (15 colonne)
  sheet.appendRow([
    bookingId,                                // Col A (1): ID Prenotazione
    createdAt,                                // Col B (2): Data Richiesta
    targetDate,                               // Col C (3): Data Prenotazione
    displayTurno,                             // Col D (4): Turno
    chosenTurno || '20:00',                   // Col E (5): Orario
    tableLabel,                               // Col F (6): Numero Tavolo
    payload.name || '',                       // Col G (7): Nome e Cognome
    payload.phone || '',                      // Col H (8): Telefono WhatsApp
    guests,                                   // Col I (9): Numero Ospiti
    tablesNeeded,                             // Col J (10): Numero Tavoli
    payload.notes || '',                      // Col K (11): Note / Intolleranze
    'Confermata',                             // Col L (12): Stato Prenotazione (MAI toccato da cassa/comande!)
    '',                                       // Col M (13): Stato Ordinazione (vuoto all'inizio)
    '',                                       // Col N (14): Dettaglio Piatti Comanda (vuoto all'inizio)
    ''                                        // Col O (15): Stato Pagamento (vuoto all'inizio)
  ]);

  SpreadsheetApp.flush();

  return {
    status: "success",
    confirmed: true,
    bookingId: bookingId,
    tableAssigned: tableLabel,
    tablesAssigned: tablesNeeded,
    tablesLeft: (MAX_TABLES - (occupied + tablesNeeded))
  };
}

// Aggiorna ordinazione o pagamento (agisce SOLO sulle colonne M, N, O. NON TOCCA MAI la colonna L!)
function updateOrderStatus(params) {
  const ss = getSpreadsheet();
  const sheet = getSheet(ss);
  const targetId = String(params.id || '').trim();
  const targetStatus = (params.status !== undefined) ? String(params.status).trim() : '';
  const targetDetails = (params.details !== undefined) ? String(params.details).trim() : '';
  const targetPaymentStatus = (params.payment_status || params.paymentStatus !== undefined) 
    ? String(params.payment_status || params.paymentStatus).trim() : '';
  const targetDate = normalizeDate(params.date);
  const targetTable = String(params.table || '').trim();
  const targetName = String(params.name || '').trim().toLowerCase();

  SpreadsheetApp.flush();
  const data = sheet.getDataRange().getValues();
  let updated = false;

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0] || '').trim();
    const rowDate = normalizeDate(data[i][2]);
    const rowTable = String(data[i][5] || '').trim();
    const rowName = String(data[i][6] || '').trim().toLowerCase();

    const matchId = targetId && (rowId === targetId);
    const matchName = targetDate && targetName && (rowDate === targetDate && rowName === targetName);
    const matchTable = targetDate && targetTable && (rowDate === targetDate && (rowTable.includes(targetTable) || targetTable.includes(rowTable)));

    if (matchId || matchName || matchTable) {
      // 1. Colonna M (13): Stato Ordinazione
      if (targetStatus) {
        sheet.getRange(i + 1, 13).setValue(targetStatus);
      }

      // 2. Colonna N (14): Dettaglio Piatti Comanda
      if (targetDetails) {
        sheet.getRange(i + 1, 14).setValue(targetDetails);
      }

      // 3. Colonna O (15): Stato Pagamento
      if (targetPaymentStatus) {
        sheet.getRange(i + 1, 15).setValue(targetPaymentStatus);
      } else if (targetStatus === 'Saldato' || targetStatus === 'Pagato') {
        sheet.getRange(i + 1, 15).setValue('Saldato');
      } else if (targetStatus === 'Ordinazione Presa' || targetStatus === 'Prenotato') {
        const curPay = String(sheet.getRange(i + 1, 15).getValue() || '').trim();
        if (!curPay) {
          sheet.getRange(i + 1, 15).setValue('Da Saldare');
        }
      }

      // NOTA BENE: Colonna L (12, Stato Prenotazione) NON viene MAI toccata qui!

      SpreadsheetApp.flush();
      updated = true;
      break;
    }
  }

  return {
    status: updated ? "success" : "not_found",
    updated: updated,
    order_status: targetStatus,
    payment_status: targetPaymentStatus
  };
}

// Aggiorna ESCLUSIVAMENTE lo Stato Prenotazione (Colonna L - indice 12: Confermata, In attesa, Annullata)
function updateBookingStatus(payload) {
  const ss = getSpreadsheet();
  const sheet = getSheet(ss);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === String(payload.id).trim()) {
      sheet.getRange(i + 1, 12).setValue(payload.status); // Colonna L: Stato Prenotazione
      SpreadsheetApp.flush();
      return { status: "success", updated: true };
    }
  }
  return { status: "not_found" };
}

// Elimina prenotazione per riga
function deleteBookingRow(payload) {
  const ss = getSpreadsheet();
  const sheet = getSheet(ss);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === String(payload.id).trim()) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { status: "success", deleted: true };
    }
  }
  return { status: "not_found" };
}

function doGet(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = getSpreadsheet();
    const sheet = getSheet(ss);
    const params = e ? e.parameter : {};

    // 1. Aggiornamento ordinazione o cassa
    if (params && (params.action === "update_order" || params.action === "save_order" || params.action === "update_payment_status")) {
      const res = updateOrderStatus(params);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Registrazione via GET (fallback)
    if (params && params.action === "book") {
      const res = processBooking(params);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Verifica disponibilità posti
    if (params && params.action === "check_availability") {
      const rows = sheet.getDataRange().getValues();
      const targetDate = normalizeDate(params.date);
      const guests = parseInt(params.guests, 10) || 2;
      const tablesNeeded = calculateTables(guests);

      let occupiedTurno1 = 0;
      let occupiedTurno2 = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        const rowDate = normalizeDate(row[2]);
        const status = String(row[11] || '').trim().toLowerCase(); // Colonna L

        if (rowDate === targetDate && status !== 'annullata' && status !== 'rifiutata') {
          const rowTurno = String(row[4] || row[3] || '').toLowerCase();
          const rowTables = parseInt(row[9], 10) || calculateTables(row[8]);
          if (isTurno1(rowTurno)) occupiedTurno1 += rowTables;
          else if (isTurno2(rowTurno)) occupiedTurno2 += rowTables;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        date: targetDate,
        tablesTurno1: Math.max(0, MAX_TABLES - occupiedTurno1),
        tablesTurno2: Math.max(0, MAX_TABLES - occupiedTurno2),
        canBookTurno1: (MAX_TABLES - occupiedTurno1) >= tablesNeeded,
        canBookTurno2: (MAX_TABLES - occupiedTurno2) >= tablesNeeded
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Lettura generale delle prenotazioni
    const rows = sheet.getDataRange().getValues();
    const data = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0]) continue;

      let dataStr = r[2];
      if (r[2] instanceof Date) {
        dataStr = Utilities.formatDate(r[2], "GMT+2", "yyyy-MM-dd");
      }

      data.push({
        id: String(r[0]),
        created_at: String(r[1] || ''),
        date: String(dataStr || ''),
        turno: String(r[3] || ''),
        time: String(r[4] || ''),
        table: String(r[5] || ''),
        name: String(r[6] || ''),
        phone: String(r[7] || ''),
        guests: String(r[8] || ''),
        tables: String(r[9] || ''),
        notes: String(r[10] || ''),
        booking_status: String(r[11] || 'Confermata'), // Colonna L: Stato Prenotazione
        order_status: String(r[12] || ''),            // Colonna M: Stato Ordinazione
        order_details: String(r[13] || ''),           // Colonna N: Dettaglio Piatti Comanda
        payment_status: String(r[14] || '')           // Colonna O: Stato Pagamento
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch(err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    // 1. Aggiornamento ordinazione / cassa (agisce SOLO su Colonne M, N, O)
    if (payload.action === "update_order" || payload.action === "save_order" || payload.action === "update_payment_status") {
      const res = updateOrderStatus(payload);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Aggiornamento Stato Prenotazione da gestione-prenotazioni.html (agisce SOLO su Colonna L)
    if (payload.action === "update_status") {
      const res = updateBookingStatus(payload);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Cancellazione prenotazione
    if (payload.action === "delete_booking") {
      const res = deleteBookingRow(payload);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Nuova prenotazione (inserisce 1 sola riga)
    const res = processBooking(payload);
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
