/**
 * JAVASCRIPT PRINCIPALE - OL3 Ristorante Pizzeria
 * Gestione prenotazioni con scambiatore di data, messaggi WhatsApp in grassetto e sync controllata.
 */

const STORAGE_KEY = 'ol3_prenotazioni_db';

document.addEventListener('DOMContentLoaded', () => {
  renderCommonData();
  renderHighlights();
  renderStory();
  renderPhilosophy();
  renderGallery();
  renderMenu();
  renderContactMap();
  initNavigation();
  initReservationForm();
  initAdminDashboard();
});

function getGoogleSheetEndpoint() {
  if (SITE_CONFIG.googleSheetEndpoint && SITE_CONFIG.googleSheetEndpoint.trim() !== '') {
    return SITE_CONFIG.googleSheetEndpoint.trim();
  }
  return "https://script.google.com/macros/s/AKfycbywuk8Mgl7oeB8vrXjmsftYINLiRTpuRNToJYdur0TDXJTXAvJXA_9GfmGeuQuwT80h/exec";
}

// Pulizia numero per WhatsApp
function formatWhatsAppNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0039')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('39') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  return '39' + cleaned;
}

// Conversione in formato ISO YYYY-MM-DD per confronti precisi
function toIsoDate(d) {
  if (!d) return '';
  let s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  if (s.includes('GMT')) {
    try {
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        const y = dt.getFullYear();
        const mo = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${mo}-${day}`;
      }
    } catch(e) {}
  }
  return s;
}

// Data formattata in italiano per display (es. 15/09/2026)
function formatItalianDate(d) {
  const iso = toIsoDate(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const p = iso.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  }
  return d;
}

// Data leggibile estesa (es. "Giovedì, 17 Settembre 2026")
function formatFriendlyDate(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return 'Tutte le date';
  const p = isoDate.split('-');
  const dt = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const str = dt.toLocaleDateString('it-IT', options);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanTime(t) {
  if (!t) return '';
  let s = String(t).trim();
  if (s.includes('GMT')) {
    try {
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      }
    } catch(e) {}
  }
  return s;
}

// Normalizza e pulisce le prenotazioni
function normalizeBooking(b) {
  if (!b) return null;

  if (typeof b.name === 'string' && b.name.includes(',') && b.name.includes('book_')) {
    const p = b.name.split(',');
    if (p.length >= 7) {
      return {
        id: p[0].trim(),
        created_at: p[1].trim() + ' ' + p[2].trim(),
        name: p[3].trim(),
        phone: p[4].trim(),
        date: toIsoDate(p[5]),
        time: cleanTime(p[6]),
        guests: p[7].trim(),
        notes: p[8] ? p[8].trim() : '',
        status: b.status || (p[9] ? p[9].trim() : 'In attesa')
      };
    }
  }

  return {
    id: String(b.id || ('book_' + Date.now())),
    created_at: String(b.created_at || ''),
    name: String(b.name || 'Cliente'),
    phone: String(b.phone || ''),
    date: toIsoDate(b.date),
    time: cleanTime(b.time),
    guests: String(b.guests || ''),
    notes: String(b.notes || ''),
    status: String(b.status || 'In attesa')
  };
}

function renderCommonData() {
  document.querySelectorAll('[data-brand-name]').forEach(el => el.textContent = SITE_CONFIG.brand.name);
  document.querySelectorAll('[data-contact-address]').forEach(el => el.textContent = SITE_CONFIG.contact.address + ', ' + SITE_CONFIG.contact.cap + ' ' + SITE_CONFIG.contact.city + ' (' + SITE_CONFIG.contact.province + ')');
  document.querySelectorAll('[data-contact-phone]').forEach(el => {
    el.textContent = SITE_CONFIG.contact.phoneDisplay;
    el.setAttribute('href', 'tel:' + SITE_CONFIG.contact.phone);
  });
  document.querySelectorAll('[data-contact-hours]').forEach(el => el.textContent = SITE_CONFIG.contact.hours);

  document.querySelectorAll('.social-fb').forEach(a => {
    a.href = SITE_CONFIG.socials.facebook;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  document.querySelectorAll('.social-ig').forEach(a => {
    a.href = SITE_CONFIG.socials.instagram;
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

function renderHighlights() {
  const container = document.getElementById('highlights-container');
  if (!container || !SITE_CONFIG.highlights) return;

  container.innerHTML = SITE_CONFIG.highlights.map(item => `
    <div class="highlight-card">
      <div class="highlight-num">${item.number}</div>
      <h3 class="highlight-title">${item.title}</h3>
      <p class="highlight-text">${item.text}</p>
    </div>
  `).join('');
}

function renderStory() {
  const titleEl = document.getElementById('story-title');
  const bodyEl = document.getElementById('story-paragraphs');
  if (titleEl && SITE_CONFIG.story) titleEl.textContent = SITE_CONFIG.story.title;
  if (bodyEl && SITE_CONFIG.story) {
    bodyEl.innerHTML = SITE_CONFIG.story.paragraphs.map(p => `<p>${p}</p>`).join('');
  }
}

function renderPhilosophy() {
  const titleEl = document.getElementById('philosophy-title');
  const textEl = document.getElementById('philosophy-text');
  if (titleEl && SITE_CONFIG.philosophy) titleEl.textContent = SITE_CONFIG.philosophy.title;
  if (textEl && SITE_CONFIG.philosophy) textEl.textContent = SITE_CONFIG.philosophy.text;
}

function renderGallery() {
  const container = document.getElementById('gallery-container');
  if (!container || !SITE_CONFIG.gallery) return;

  container.innerHTML = SITE_CONFIG.gallery.map(item => `
    <div class="gallery-item">
      <img src="${item.url}" alt="${item.caption}" loading="lazy">
      <div class="gallery-overlay">
        <span class="gallery-caption">${item.caption}</span>
      </div>
    </div>
  `).join('');
}

function renderMenu() {
  const tabsContainer = document.getElementById('menu-tabs');
  const listContainer = document.getElementById('menu-category-list');
  if (!tabsContainer || !listContainer || !SITE_CONFIG.menu) return;

  const totalItems = SITE_CONFIG.menu.categories.reduce((sum, c) => sum + c.items.length, 0);

  tabsContainer.innerHTML = `
    <button class="menu-tab-btn active" data-category="all">TUTTO IL MENU (${totalItems})</button>
    ${SITE_CONFIG.menu.categories.map(cat => `
      <button class="menu-tab-btn" data-category="${cat.id}">${cat.name} (${cat.items.length})</button>
    `).join('')}
  `;

  function displayCategories(filterId) {
    const categoriesToDisplay = filterId === 'all' 
      ? SITE_CONFIG.menu.categories 
      : SITE_CONFIG.menu.categories.filter(c => c.id === filterId);

    listContainer.innerHTML = categoriesToDisplay.map(cat => `
      <div class="menu-category-group" id="cat-${cat.id}">
        <h3 class="category-title">${cat.name}</h3>
        <p class="category-subtitle">${cat.subtitle}</p>
        <div class="menu-items-grid">
          ${cat.items.map(dish => `
            <div class="menu-card">
              <div class="menu-card-info">
                <div class="menu-item-header">
                  <h4 class="menu-item-name">${dish.name}</h4>
                  <span class="menu-item-price">${dish.price}</span>
                </div>
                <p class="menu-item-desc">${dish.description}</p>
                <div class="menu-tags">
                  ${dish.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
                </div>
              </div>
              ${dish.image ? `
                <div class="menu-card-thumb">
                  <img src="${dish.image}" alt="${dish.name}" loading="lazy">
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  displayCategories('all');

  tabsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-tab-btn')) {
      document.querySelectorAll('.menu-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const catId = e.target.getAttribute('data-category');
      displayCategories(catId);
    }
  });
}

function renderContactMap() {
  const mapIframe = document.getElementById('maps-iframe');
  if (mapIframe && SITE_CONFIG.contact) {
    mapIframe.src = SITE_CONFIG.contact.mapsEmbedUrl;
  }
}

function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

function initReservationForm() {
  const form = document.getElementById('reservation-form');
  const successCard = document.getElementById('booking-success-card');
  if (!form) return;

  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('res-name').value.trim();
    const phone = document.getElementById('res-phone').value.trim();
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const guests = document.getElementById('res-guests').value;
    const email = document.getElementById('res-email') ? document.getElementById('res-email').value.trim() : '';
    const notes = document.getElementById('res-notes') ? document.getElementById('res-notes').value.trim() : '';

    const booking = {
      id: 'book_' + Date.now(),
      created_at: new Date().toLocaleString('it-IT'),
      name: name,
      phone: phone,
      date: date,
      time: time,
      guests: guests,
      email: email,
      notes: notes,
      status: 'In attesa'
    };

    saveBookingLocally(booking);

    const endpoint = getGoogleSheetEndpoint();
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(booking)
      }).catch(err => console.log('Sincronizzazione Sheet:', err));
    }

    const formData = new FormData(form);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    }).catch(() => {});

    if (successCard) {
      document.getElementById('confirmed-date-time').textContent = `${formatItalianDate(date)} ore ${time}`;
      document.getElementById('confirmed-guests').textContent = guests;
      document.getElementById('confirmed-phone').textContent = phone;
      form.style.display = 'none';
      successCard.style.display = 'block';
      successCard.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function saveBookingLocally(booking) {
  let list = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  list.unshift(booking);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

function getStoredBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeBooking).filter(Boolean);
      }
    }
  } catch (e) {}
  return [];
}

// Inizializza Dashboard Amministratore (Zero refresh continui, scambiatore data in alto, messaggi WhatsApp con grassetti)
async function initAdminDashboard() {
  const confirmedContainer = document.getElementById('confirmed-bookings-list');
  const pendingContainer = document.getElementById('pending-bookings-list');
  if (!confirmedContainer || !pendingContainer) return;

  const confirmedBadge = document.getElementById('confirmed-count-badge');
  const pendingBadge = document.getElementById('pending-count-badge');
  const datePicker = document.getElementById('admin-date-picker');
  const dateLabel = document.getElementById('date-display-friendly');
  const prevBtn = document.getElementById('date-prev-btn');
  const nextBtn = document.getElementById('date-next-btn');
  const todayBtn = document.getElementById('date-today-btn');
  const allBtn = document.getElementById('date-all-btn');
  const refreshBtn = document.getElementById('admin-refresh-btn');

  const todayIso = new Date().toISOString().split('T')[0];
  let selectedDate = todayIso;
  let showAllDates = false;

  if (datePicker) {
    datePicker.value = todayIso;
  }

  // Carica i dati locali immediatamente senza far sparire nulla
  const initialLocal = getStoredBookings();
  if (initialLocal.length > 0) {
    renderBoard(initialLocal);
  }

  // Sincronizzazione pulita senza cancellare le schede dallo schermo
  async function fetchFromSheet() {
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Sincronizzazione...';
    }

    const endpoint = getGoogleSheetEndpoint();
    let bookings = [];

    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        bookings = json.data.map(normalizeBooking).filter(Boolean);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        renderBoard(bookings);
      }
    } catch (e) {
      console.warn('Lettura Google Sheets completata, dati pronti:', e);
    }

    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Aggiorna Dati dal Foglio';
    }
  }

  function renderBoard(bookings) {
    // 1. COLONNA DESTRA: Nuove richieste in arrivo (ordinate per arrivo, ultime in cima)
    const pending = bookings.filter(b => b.status === 'In attesa');
    if (pendingBadge) pendingBadge.textContent = `${pending.length} in attesa`;

    if (pending.length === 0) {
      pendingContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
          <i class="fa-regular fa-bell-slash" style="font-size: 2.2rem; color: #555; margin-bottom: 12px; display:block;"></i>
          <p style="font-size: 0.92rem;">Nessuna nuova richiesta in arrivo.</p>
        </div>
      `;
    } else {
      pendingContainer.innerHTML = pending.map(b => {
        const waNum = formatWhatsAppNumber(b.phone);
        const displayDate = formatItalianDate(b.date);

        // Messaggio di conferma ufficiale con i grassetti corretti
        const confirmText = `Gentile *${b.name}* ☺️,\nti confermiamo con piacere la prenotazione del tavolo per *${b.guests}* da *OL3 Ristorante Pizzeria* per il giorno *${displayDate}* alle ore *${b.time}*. Vi aspettiamo in Piazza Enrico Berlinguer a Villapiana Lido! Per variazioni contattaci al *352 038 9996*. A presto, Lo Staff OL3 ☺️.`;
        const confirmUrl = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(confirmText)}`;

        // Messaggio di rifiuto ufficiale con grassetti
        const rejectText = `Gentile *${b.name}* 🥺,\nci dispiace informarti che per il giorno *${displayDate}* alle ore *${b.time}* il nostro locale *OL3 Ristorante Pizzeria* è al completo e non abbiamo tavoli disponibili. Ci scusiamo per il disagio e speriamo di poterti accogliere molto presto! Un cordiale saluto, Lo Staff OL3 🥺.`;
        const rejectUrl = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(rejectText)}`;

        return `
          <div class="table-card table-card-pending" id="card-${b.id}">
            <div class="table-card-header">
              <span class="table-card-name">${b.name}</span>
              <span class="table-time-tag">${displayDate} • ${b.time}</span>
            </div>

            <div class="table-card-info">
              <span><i class="fa-solid fa-users" style="color: var(--accent-gold);"></i> <strong>${b.guests}</strong></span>
              <span><i class="fa-solid fa-phone" style="color: var(--accent-gold);"></i> <a href="tel:${b.phone}" style="color: #fff; text-decoration: underline;">${b.phone}</a></span>
              <span style="font-size: 0.78rem; color: #999; margin-left: auto;">Richiesta: ${b.created_at || 'Recente'}</span>
            </div>

            ${b.notes ? `<div style="font-size: 0.85rem; color: #d5cfc7; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 4px; margin-bottom: 12px;"><strong>Note:</strong> ${b.notes}</div>` : ''}

            <div style="display: flex; gap: 10px; flex-direction: column; margin-top: 14px;">
              <a href="${confirmUrl}" target="_blank" rel="noopener" class="btn-whatsapp-confirm" onclick="confirmBooking('${b.id}')">
                <i class="fa-brands fa-whatsapp"></i> CONFERMA VIA WHATSAPP
              </a>
              <a href="${rejectUrl}" target="_blank" rel="noopener" class="btn-whatsapp-reject" onclick="rejectBooking('${b.id}')">
                <i class="fa-solid fa-xmark"></i> RIFIUTA VIA WHATSAPP
              </a>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. COLONNA SINISTRA: Tavoli confermati divisi per giorno
    const allConfirmed = bookings.filter(b => b.status === 'Confermato');
    
    let displayedConfirmed = allConfirmed;
    if (!showAllDates && selectedDate) {
      displayedConfirmed = allConfirmed.filter(b => toIsoDate(b.date) === selectedDate);
    }

    if (dateLabel) {
      if (showAllDates) {
        dateLabel.textContent = `Visualizzazione: Tutte le date (${allConfirmed.length} tavoli totali)`;
      } else {
        const isToday = selectedDate === todayIso;
        const friendly = formatFriendlyDate(selectedDate);
        dateLabel.textContent = `${isToday ? 'Oggi, ' : ''}${friendly} (${displayedConfirmed.length} ${displayedConfirmed.length === 1 ? 'tavolo' : 'tavoli'})`;
      }
    }

    if (confirmedBadge) {
      confirmedBadge.textContent = `${displayedConfirmed.length} tavoli`;
    }

    if (displayedConfirmed.length === 0) {
      confirmedContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
          <i class="fa-regular fa-calendar-xmark" style="font-size: 2.2rem; color: #555; margin-bottom: 12px; display:block;"></i>
          <p style="font-size: 0.92rem;">Nessun tavolo confermato per ${showAllDates ? 'alcuna data' : 'il giorno selezionato'}.</p>
          ${!showAllDates ? `<button onclick="document.getElementById('date-all-btn').click()" style="margin-top: 10px; background: none; border: none; color: var(--accent-gold); text-decoration: underline; cursor: pointer; font-size: 0.85rem;">Vedi tutte le date</button>` : ''}
        </div>
      `;
    } else {
      // Se si visualizzano tutti i giorni, raggruppali visivamente per data
      if (showAllDates) {
        // Raggruppa per data
        const groups = {};
        displayedConfirmed.forEach(b => {
          const iso = toIsoDate(b.date);
          if (!groups[iso]) groups[iso] = [];
          groups[iso].push(b);
        });

        const sortedDates = Object.keys(groups).sort();
        confirmedContainer.innerHTML = sortedDates.map(dIso => {
          const items = groups[dIso];
          const friendly = formatFriendlyDate(dIso);
          return `
            <div class="day-group-header">
              <i class="fa-regular fa-calendar"></i> ${friendly} (${items.length} ${items.length === 1 ? 'tavolo' : 'tavoli'})
            </div>
            ${items.map(renderConfirmedCard).join('')}
          `;
        }).join('');
      } else {
        confirmedContainer.innerHTML = displayedConfirmed.map(renderConfirmedCard).join('');
      }
    }
  }

  function renderConfirmedCard(b) {
    const waNum = formatWhatsAppNumber(b.phone);
    const waChatUrl = `https://api.whatsapp.com/send?phone=${waNum}`;
    const displayDate = formatItalianDate(b.date);

    return `
      <div class="table-card table-card-confirmed" id="card-${b.id}">
        <div class="table-card-header">
          <span class="table-card-name">${b.name}</span>
          <span class="table-time-tag">${displayDate} • ${b.time}</span>
        </div>

        <div class="table-card-info">
          <span><i class="fa-solid fa-users" style="color: var(--accent-gold);"></i> <strong>${b.guests}</strong></span>
          <span><i class="fa-solid fa-phone" style="color: var(--accent-gold);"></i> <a href="tel:${b.phone}" style="color: #fff; text-decoration: underline;">${b.phone}</a></span>
        </div>

        ${b.notes ? `<div style="font-size: 0.85rem; color: #d5cfc7; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 4px; margin-bottom: 12px;"><strong>Note:</strong> ${b.notes}</div>` : ''}

        <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; margin-top: 10px; flex-wrap: wrap;">
          <a href="${waChatUrl}" target="_blank" rel="noopener" class="btn-whatsapp-chat">
            <i class="fa-brands fa-whatsapp"></i> Scrivi su WhatsApp
          </a>
          <button class="btn-remove-booking" onclick="cancelBooking('${b.id}', '${b.name}', '${b.phone}', '${displayDate}', '${b.time}')">
            <i class="fa-solid fa-trash-can"></i> Rimuovi / Annulla
          </button>
        </div>
      </div>
    `;
  }

  // Navigatore data avanti e indietro
  function changeDateByDays(offset) {
    showAllDates = false;
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    selectedDate = current.toISOString().split('T')[0];
    if (datePicker) datePicker.value = selectedDate;
    renderBoard(getStoredBookings());
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => changeDateByDays(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => changeDateByDays(1));
  }
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      showAllDates = false;
      selectedDate = todayIso;
      if (datePicker) datePicker.value = todayIso;
      renderBoard(getStoredBookings());
    });
  }
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      showAllDates = true;
      renderBoard(getStoredBookings());
    });
  }
  if (datePicker) {
    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        showAllDates = false;
        selectedDate = e.target.value;
        renderBoard(getStoredBookings());
      }
    });
  }

  window.confirmBooking = function(id) {
    updateBookingInState(id, 'Confermato');
  };

  window.rejectBooking = function(id) {
    updateBookingInState(id, 'Rifiutato');
  };

  window.cancelBooking = function(id, name, phone, displayDate, time) {
    const confirmCancel = confirm(`Sei sicuro di voler annullare la prenotazione di ${name} per il giorno ${displayDate} alle ore ${time}?`);
    if (!confirmCancel) return;

    const waNum = formatWhatsAppNumber(phone);
    const cancelMsg = `Gentile *${name}*,\nti comunichiamo che la tua prenotazione per il giorno *${displayDate}* alle ore *${time}* da *OL3 Ristorante Pizzeria* è stata *annullata*. Per qualsiasi chiarimento o per verificare altre date puoi contattarci al *352 038 9996*. Un cordiale saluto, Lo Staff OL3.`;
    const cancelWaUrl = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(cancelMsg)}`;

    updateBookingInState(id, 'Annullato');

    const notifyWa = confirm("Vuoi inviare l'avviso di annullamento al cliente su WhatsApp?");
    if (notifyWa) {
      window.open(cancelWaUrl, '_blank');
    }
  };

  function updateBookingInState(id, newStatus) {
    const list = getStoredBookings();
    const item = list.find(b => String(b.id) === String(id));
    if (item) {
      item.status = newStatus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      renderBoard(list);
    }

    const endpoint = getGoogleSheetEndpoint();
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'update_status', id: id, status: newStatus })
      }).catch(() => {});
    }
  }

  // Carica all'avvio dal foglio una sola volta
  fetchFromSheet();

  // Pulsante manuale Aggiorna
  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchFromSheet);
  }

  // Sincronizzazione automatica solo ogni 10 minuti, senza mai cancellare le schede a video
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  setInterval(fetchFromSheet, TEN_MINUTES_MS);
}
