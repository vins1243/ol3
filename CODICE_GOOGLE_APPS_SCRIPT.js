/**
 * BACKEND GOOGLE APPS SCRIPT - OL3 RISTORANTE PIZZERIA (VERSIONE COMPLETA)
 * Capienza: 50 tavoli da 2 posti = 100 posti massimi.
 * Formula tavoli: Math.ceil(ospiti / 2) -> 5 persone = 3 tavoli da 2.
 * Turni: 1° Turno (20:00 - 21:30) | 2° Turno (dalle 21:30 in poi).
 * Supporta sia POST che GET per garantire il 100% della sincronizzazione da mobile e desktop.
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

function getTargetSheet() {
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
  return ss.getSheetByName("Prenotazioni") || ss.getSheets()[0];
}

// Funzione unificata di registrazione prenotazione
function processBooking(payload) {
  const sheet = getTargetSheet();
  const targetDate = normalizeDate(payload.date);
  const guests = parseInt(payload.guests, 10) || 2;
  const tablesNeeded = calculateTables(guests);
  const chosenTurno = String(payload.time || '').trim();

  const rows = sheet.getDataRange().getValues();
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
  const displayTurno = chosenTurno.includes("20:00") ? "1° Turno (20:00 - 21:30)" : "2° Turno (dalle 21:30)";

  sheet.appendRow([
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

  return {
    status: "success",
    confirmed: true,
    bookingId: bookingId,
    tablesAssigned: tablesNeeded,
    tablesLeft: (MAX_TABLES - (occupied + tablesNeeded))
  };
}

function doGet(e) {
  try {
    const sheet = getTargetSheet();
    const rows = sheet.getDataRange().getValues();
    const params = e ? e.parameter : {};

    // 1. REGISTRAZIONE VIA GET (FALLBACK SENZA PROBLEMI CORS)
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

    // 2. VERIFICA DISPONIBILITA IN TEMPO REALE
    if (params && params.action === "check_availability") {
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

    // 3. ELENCO COMPLETO PRENOTAZIONI (PER LA PIANTINA DEI TAVOLI)
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
        notes: String(row[9] || '')
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
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

    const sheet = getTargetSheet();

    // Aggiornamento stato o rimozione
    if (payload.action === "update_status") {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          sheet.getRange(i + 1, 9).setValue(payload.status);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", updated: true })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (payload.action === "delete_booking") {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", deleted: true })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
    }

    // Nuova prenotazione
    const res = processBooking(payload);
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
