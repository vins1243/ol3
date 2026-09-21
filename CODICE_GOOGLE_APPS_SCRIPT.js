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
      "Dettaglio Piatti Comanda",
      "Stato Pagamento" // Colonna M: Da Saldare / Saldato
    ]);
  } else {
    // Verifica e imposta la testata della Colonna M (indice 13)
    const h13 = sheet.getRange(1, 13).getValue();
    if (!h13) {
      sheet.getRange(1, 13).setValue("Stato Pagamento").setFontWeight("bold");
    }
  }
  return sheet;
}

// Sincronizza automaticamente qualsiasi prenotazione da Foglio 1 a Foglio Comande se mancante
function syncBookingsToComande(ss) {
  try {
    const bookSheet = getBookingsSheet(ss);
    const comandeSheet = ensureComandeSheet(ss);
    if (!bookSheet || !comandeSheet) return;

    const bRows = bookSheet.getDataRange().getValues();
    const cRows = comandeSheet.getDataRange().getValues();

    const existingIds = new Set();
    for (let i = 1; i < cRows.length; i++) {
      if (cRows[i][0]) existingIds.add(String(cRows[i][0]).trim());
    }

    let occupiedTurno1 = 0;
    let occupiedTurno2 = 0;

    for (let i = 1; i < bRows.length; i++) {
      const r = bRows[i];
      const bId = String(r[0] || '').trim();
      if (!bId) continue;

      const rDate = normalizeDate(r[4]);
      const rTurno = String(r[5] || '');
      const guests = parseInt(r[6], 10) || 2;
      const needed = parseInt(r[7], 10) || Math.ceil(guests / 2);
      const rStatus = String(r[8] || '').trim();

      if (!existingIds.has(bId)) {
        const startNum = isTurno1(rTurno) ? (occupiedTurno1 + 1) : (occupiedTurno2 + 1);
        const endNum = Math.min(MAX_TABLES, startNum + needed - 1);
        const tableLabel = (needed === 1) 
          ? `T${String(startNum).padStart(2, '0')}` 
          : `Tavoli Uniti T${String(startNum).padStart(2, '0')} - T${String(endNum).padStart(2, '0')}`;

        const orderStatus = (rStatus.toLowerCase().includes('ordinat') || rStatus.toLowerCase().includes('pres')) ? 'Prenotato' : '';

        comandeSheet.appendRow([
          bId,
          String(r[1] || ''),
          rDate,
          isTurno1(rTurno) ? "1° Turno (20:00 - 21:30)" : "2° Turno (dalle 21:30)",
          String(r[5] || '20:00'),
          tableLabel,
          String(r[2] || ''),
          String(r[3] || ''),
          guests,
          String(r[9] || r[7] || ''),
          orderStatus,
          '',
          orderStatus === 'Prenotato' ? 'Da Saldare' : '' // Col M: Stato Pagamento
        ]);
        existingIds.add(bId);
      }

      if (isTurno1(rTurno)) occupiedTurno1 += needed;
      else occupiedTurno2 += needed;
    }
  } catch(e) {
    Logger.log("Errore syncBookingsToComande: " + e.toString());
  }
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
    '', // Dettaglio piatti vuoto
    ''  // Col M: Stato Pagamento inizialmente vuoto
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
  const targetPaymentStatus = String(params.payment_status || params.paymentStatus || '').trim();
  const targetDate = normalizeDate(params.date);
  const targetTable = String(params.table || '').trim();
  const targetName = String(params.name || '').trim().toLowerCase();

  const data = comandeSheet.getDataRange().getValues();
  let updated = false;

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0]).trim();
    const rowDate = normalizeDate(data[i][2]);
    const rowTable = String(data[i][5]).trim();
    const rowName = String(data[i][6] || '').trim().toLowerCase();

    const matchId = targetId && (rowId === targetId);
    const matchName = targetDate && targetName && (rowDate === targetDate && rowName === targetName);
    const matchTable = targetDate && targetTable && (rowDate === targetDate && (rowTable.includes(targetTable) || targetTable.includes(rowTable)));

    if (matchId || matchName || matchTable) {
      if (params.status !== undefined) {
        comandeSheet.getRange(i + 1, 11).setValue(targetStatus);
      }
      if (targetDetails) {
        comandeSheet.getRange(i + 1, 12).setValue(targetDetails);
      }
      if (targetPaymentStatus) {
        comandeSheet.getRange(i + 1, 13).setValue(targetPaymentStatus);
      } else if (targetStatus === 'Pagato' || targetStatus === 'Saldato') {
        comandeSheet.getRange(i + 1, 13).setValue('Saldato');
      } else if (targetStatus === 'Prenotato') {
        const curM = String(comandeSheet.getRange(i + 1, 13).getValue() || '').trim();
        if (!curM) {
          comandeSheet.getRange(i + 1, 13).setValue('Da Saldare');
        }
      }
      updated = true;
      break;
    }
  }

  // Inserimento solo se riga veramente non esistente
  if (!updated && (targetId || (targetDate && (targetTable || targetName)))) {
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
      targetStatus,
      targetDetails,
      targetPaymentStatus || (targetStatus === 'Prenotato' ? 'Da Saldare' : '')
    ]);
    updated = true;
  }

  return {
    status: updated ? "success" : "not_found",
    updated: updated,
    order_status: targetStatus,
    payment_status: targetPaymentStatus
  };
}

function doGet(e) {
  try {
    const ss = getSpreadsheet();
    syncBookingsToComande(ss);
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
    if (payload.action === "update_order" || payload.action === "save_order" || payload.action === "update_payment_status") {
      const res = updateOrderStatus(payload);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = getSpreadsheet();
    syncBookingsToComande(ss);
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
