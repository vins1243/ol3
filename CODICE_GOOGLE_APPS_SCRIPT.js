/**
 * BACKEND GOOGLE APPS SCRIPT - OL3 RISTORANTE PIZZERIA (VERSIONE MULTI-FOGLIO)
 * Gestione sincronizzata a 2 Fogli:
 *  - Foglio 1 ("Prenotazioni" / "Foglio1"): Archivio storico delle prenotazioni clienti
 *  - Foglio 2 ("Comande"): Monitoraggio ordinazioni ai tavoli in tempo reale con colonna "Stato Ordinazione"
 * 
 * Regola interattività richiesta:
 *  - Nuova prenotazione: cella "Stato Ordinazione" VUOTA (tavolo Da Servire - ROSSO).
 *  - Ordinazione presa dal sito: cella "Stato Ordinazione" impostata su "Prenotato" (tavolo Ordinazione Presa - GRIGIO).
 *  - Interattività multi-dispositivo: qualunque cameriere o smartphone apra la pagina web
 *    legge direttamente il Foglio Google e vede istantaneamente quali tavoli sono già stati ordinati.
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

function getBookingsSheet(ss) {
  return ss.getSheetByName("Prenotazioni") || ss.getSheetByName("Foglio1") || ss.getSheets()[0];
}

function getComandeSheet(ss) {
  let sheet = ss.getSheetByName("Comande") || ss.getSheetByName("Foglio2");
  if (!sheet && ss.getSheets().length > 1) {
    sheet = ss.getSheets()[1];
  }
  return sheet;
}

function ensureComandeSheet(ss) {
  let sheet = getComandeSheet(ss);
  if (!sheet) {
    sheet = ss.insertSheet("Comande");
    sheet.appendRow([
      "ID Prenotazione",
      "Data Richiesta",
      "Data Prenotazione",
      "Turno",
      "Orario",
      "Numero Tavolo",
      "Nome e Cognome",
      "Telefono WhatsApp",
      "Numero Ospiti",
      "Note",
      "Stato Ordinazione",
      "Dettaglio Piatti Comanda"
    ]);
  }
  return sheet;
}

// Funzione unificata di registrazione prenotazione (scrive su entrambi i fogli)
function processBooking(payload) {
  const ss = getSpreadsheet();
  const bookSheet = getBookingsSheet(ss);
  const comandeSheet = ensureComandeSheet(ss);

  const targetDate = normalizeDate(payload.date);
  const guests = parseInt(payload.guests, 10) || 2;
  const tablesNeeded = calculateTables(guests);
  const chosenTurno = String(payload.time || '').trim();

  // Verifica occupazione nel turno
  const rows = bookSheet.getDataRange().getValues();
  let occupied = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    const rDate = normalizeDate(r[4]);
    const status = String(r[8] || '').trim().toLowerCase();

    if (rDate === targetDate && status !== 'annullata' && status !== 'rifiutata') {
      const rTurno = String(r[5] || '').toLowerCase();
      const rTables = parseInt(r[7], 10) || calculateTables(r[6]);
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

  const bookingId = payload.id || ('OL3_' + Date.now());
  const createdAt = new Date().toLocaleString('it-IT');
  const displayTurno = isTurno1(chosenTurno) ? "1° Turno (20:00 - 21:30)" : "2° Turno (dalle 21:30)";

  // Calcolo etichetta tavolo
  const startNum = occupied + 1;
  const endNum = Math.min(MAX_TABLES, startNum + tablesNeeded - 1);
  const tableLabel = (tablesNeeded === 1) 
    ? `T${String(startNum).padStart(2, '0')}` 
    : `Tavoli Uniti T${String(startNum).padStart(2, '0')} - T${String(endNum).padStart(2, '0')}`;

  // 1. Inserimento in Foglio 1 (Prenotazioni)
  bookSheet.appendRow([
    bookingId,
    createdAt,
    payload.name || '',
    payload.phone || '',
    targetDate,
    displayTurno,
    guests,
    tablesNeeded,
    'Confermata',
    payload.notes || ''
  ]);

  // 2. Inserimento in Foglio 2 (Comande) con Stato Ordinazione inizialmente VUOTO ('')
  comandeSheet.appendRow([
    bookingId,
    createdAt,
    targetDate,
    displayTurno,
    chosenTurno,
    tableLabel,
    payload.name || '',
    payload.phone || '',
    guests,
    payload.notes || '',
    '', // Cella inizialmente vuota (ordinazione non ancora presa)
    ''  // Dettaglio piatti vuoto
  ]);

  return {
    status: "success",
    confirmed: true,
    bookingId: bookingId,
    tableAssigned: tableLabel,
    tablesAssigned: tablesNeeded,
    tablesLeft: (MAX_TABLES - (occupied + tablesNeeded))
  };
}

// Aggiorna lo stato dell'ordinazione nel Foglio "Comande" (Col K = "Prenotato" o vuoto)
function updateOrderStatus(params) {
  const ss = getSpreadsheet();
  const comandeSheet = ensureComandeSheet(ss);
  const targetId = String(params.id || '').trim();
  const targetStatus = (params.status !== undefined) ? String(params.status).trim() : 'Prenotato';
  const targetDetails = String(params.details || '').trim();
  const targetDate = normalizeDate(params.date);
  const targetTable = String(params.table || '').trim();

  const data = comandeSheet.getDataRange().getValues();
  let updated = false;

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0]).trim();
    const rowDate = normalizeDate(data[i][2]);
    const rowTable = String(data[i][5]).trim();

    const matchId = targetId && (rowId === targetId);
    const matchTable = targetDate && targetTable && (rowDate === targetDate && (rowTable.includes(targetTable) || targetTable.includes(rowTable)));

    if (matchId || matchTable) {
      // Col K: Stato Ordinazione (indice 11 in Apps Script 1-based)
      comandeSheet.getRange(i + 1, 11).setValue(targetStatus);
      if (targetDetails) {
        // Col L: Dettaglio Piatti Comanda (indice 12)
        comandeSheet.getRange(i + 1, 12).setValue(targetDetails);
      }
      updated = true;
      break;
    }
  }

  // Fallback: se la riga non esiste ancora in Comande, la inserisce per non perdere l'ordinazione
  if (!updated && (targetId || (targetDate && targetTable))) {
    comandeSheet.appendRow([
      targetId || ('OL3_' + Date.now()),
      new Date().toLocaleString('it-IT'),
      targetDate || '',
      '', // Turno
      '', // Orario
      targetTable || '',
      params.name || '',
      params.phone || '',
      params.guests || '',
      '', // Note
      targetStatus, // Col K: Stato Ordinazione
      targetDetails // Col L: Dettaglio Piatti Comanda
    ]);
    updated = true;
  }

  return {
    status: updated ? "success" : "not_found",
    updated: updated,
    order_status: targetStatus
  };
}

function doGet(e) {
  try {
    const ss = getSpreadsheet();
    const params = e ? e.parameter : {};

    // 1. AGGIORNAMENTO ORDINAZIONE DA COMANDI SITO (INTERATTIVITÀ MULTI-DISPOSITIVO)
    if (params && (params.action === "update_order" || params.action === "save_order")) {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(15000);
        const res = updateOrderStatus(params);
        return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
      } finally {
        lock.releaseLock();
      }
    }

    // 2. REGISTRAZIONE VIA GET (FALLBACK SENZA PROBLEMI CORS)
    if (params && params.action === "book") {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(15000);
        const res = processBooking(params);
        return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
      } finally {
        lock.releaseLock();
      }
    }

    // 3. VERIFICA DISPONIBILITÀ
    if (params && params.action === "check_availability") {
      const bookSheet = getBookingsSheet(ss);
      const rows = bookSheet.getDataRange().getValues();
      const targetDate = normalizeDate(params.date);
      const guests = parseInt(params.guests, 10) || 2;
      const tablesNeeded = calculateTables(guests);

      let occupiedTurno1 = 0;
      let occupiedTurno2 = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        const rowDate = normalizeDate(row[4]);
        const status = String(row[8] || '').trim().toLowerCase();

        if (rowDate === targetDate && status !== 'annullata' && status !== 'rifiutata') {
          const turno = String(row[5] || '').toLowerCase();
          const tablesInRow = parseInt(row[7], 10) || calculateTables(row[6]);
          if (isTurno1(turno)) {
            occupiedTurno1 += tablesInRow;
          } else if (isTurno2(turno)) {
            occupiedTurno2 += tablesInRow;
          }
        }
      }

      const leftTurno1 = Math.max(0, MAX_TABLES - occupiedTurno1);
      const leftTurno2 = Math.max(0, MAX_TABLES - occupiedTurno2);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        date: targetDate,
        guests: guests,
        tablesNeeded: tablesNeeded,
        turno1: { id: "20:00", name: "1° Turno (20:00 - 21:30)", tablesLeft: leftTurno1, available: (tablesNeeded <= leftTurno1) },
        turno2: { id: "21:30", name: "2° Turno (dalle 21:30)", tablesLeft: leftTurno2, available: (tablesNeeded <= leftTurno2) }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. ELENCO COMPLETO: LEGGE DAL FOGLIO "COMANDE" (CON STATO ORDINAZIONE)
    const comandeSheet = getComandeSheet(ss);
    if (comandeSheet) {
      const cRows = comandeSheet.getDataRange().getValues();
      const data = [];
      for (let i = 1; i < cRows.length; i++) {
        const r = cRows[i];
        if (!r[0]) continue;
        data.push({
          id: String(r[0]),
          created_at: String(r[1]),
          date: normalizeDate(r[2]),
          turno: String(r[3]),
          time: String(r[4]),
          table: String(r[5]),
          name: String(r[6]),
          phone: String(r[7]),
          guests: String(r[8]),
          notes: String(r[9] || ''),
          order_status: String(r[10] || '').trim(), // "Prenotato" o ""
          order_details: String(r[11] || '').trim()
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", source: "comande", data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Fallback su foglio prenotazioni standard
    const bookSheet = getBookingsSheet(ss);
    const rows = bookSheet.getDataRange().getValues();
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      data.push({
        id: String(row[0]),
        created_at: String(row[1]),
        name: String(row[2]),
        phone: String(row[3]),
        date: normalizeDate(row[4]),
        time: String(row[5]),
        guests: String(row[6]),
        tables: String(row[7] || calculateTables(row[6])),
        status: String(row[8] || 'Confermata'),
        notes: String(row[9] || ''),
        order_status: ''
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", source: "prenotazioni", data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
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

    // 1. Aggiornamento stato ordinazione (da comande.html)
    if (payload.action === "update_order" || payload.action === "save_order") {
      const res = updateOrderStatus(payload);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = getSpreadsheet();
    const bookSheet = getBookingsSheet(ss);

    // 2. Aggiornamento stato prenotazione o cancellazione
    if (payload.action === "update_status") {
      const data = bookSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          bookSheet.getRange(i + 1, 9).setValue(payload.status);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", updated: true })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (payload.action === "delete_booking") {
      const data = bookSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          bookSheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", deleted: true })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Nuova prenotazione
    const res = processBooking(payload);
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
