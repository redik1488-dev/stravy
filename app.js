/* ===================================
   365 OBIADÓW ZA 5 ZŁOTYCH – App JS
   =================================== */

const MONTH_EMOJIS = {
  'Styczeń':    '❄️',
  'Luty':       '🌨️',
  'Marzec':     '🌱',
  'Kwiecień':   '🌸',
  'Maj':        '🌿',
  'Czerwiec':   '☀️',
  'Lipiec':     '🌞',
  'Sierpień':   '🍓',
  'Wrzesień':   '🍂',
  'Październik':'🍁',
  'Listopad':   '🕯️',
  'Grudzień':   '⛄',
};

const MONTH_DESCRIPTIONS = {
  'Styczeń':    'Miesiąc zimowy – zasoby spiżarni, zwierzyna, kapusta kwaszona.',
  'Luty':       'Ostatnie zapasy zimy, czas na ciepłe zupy i pieczenie.',
  'Marzec':     'Czas postu – trzy obiady postne w tygodniu.',
  'Kwiecień':   'Wiosenny post, pierwsze nowalije, szparagi.',
  'Maj':        'Szparagi, nowalije, szczaw – czas odrodzenia kuchni.',
  'Czerwiec':   'Lato w pełni – raki, poziomki, świeże jarzyny.',
  'Lipiec':     'Pełnia lata – owoce, jarmuż, raki i kurczęta.',
  'Sierpień':   'Najobfitszy miesiąc – zwierzyna, owoce, warzywa.',
  'Wrzesień':   'Złoty miesiąc – zwierzyna, ptastwo, owoce w obfitości.',
  'Październik':'Jesień – grzyby, jabłka, kapusta, konserwy.',
  'Listopad':   'Późna jesień – zapasy na zimę, korzenne potrawy.',
  'Grudzień':   'Adwent i Boże Narodzenie – potrawy postne i świąteczne.',
};

let appData = null;
let currentMonth = 0;
let searchQuery = '';

// ─── LOAD DATA ────────────────────────────────────────────────────────────────
async function loadData() {
  const res = await fetch('data.json');
  appData = await res.json();
  init();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  buildMonthTabs();
  buildSearchBar();
  buildStatsBar();
  selectMonth(0);
  initModal();
}

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function buildStatsBar() {
  const totalDays = appData.months.reduce((s, m) => s + m.days.length, 0);
  const totalRecipes = Object.keys(appData.recipes).length;
  const totalMonths = appData.months.length;

  const header = document.querySelector('.days-header');
  const statsBar = document.createElement('div');
  statsBar.className = 'stats-bar';
  statsBar.innerHTML = `
    <div class="stat-item">
      <div class="stat-num">${totalDays}</div>
      <div class="stat-label">Jadłospisów</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">${totalRecipes}</div>
      <div class="stat-label">Stron przepisów</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">${totalMonths}</div>
      <div class="stat-label">Miesięcy</div>
    </div>
  `;
  // Insert before months section (after month nav)
  const main = document.getElementById('mainContent');
  main.insertBefore(statsBar, main.firstChild);
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function buildSearchBar() {
  const daysHeader = document.querySelector('.days-header');
  const wrap = document.createElement('div');
  wrap.className = 'search-bar-wrap';
  wrap.innerHTML = `
    <input type="search" class="search-bar" id="searchInput" placeholder="Szukaj dania, składnika…" autocomplete="off" />
    <span class="search-icon">🔍</span>
  `;
  daysHeader.appendChild(wrap);

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderDays();
  });
}

// ─── MONTH TABS ───────────────────────────────────────────────────────────────
function buildMonthTabs() {
  const container = document.getElementById('monthTabs');
  appData.months.forEach((month, i) => {
    const btn = document.createElement('button');
    btn.className = 'month-tab';
    btn.dataset.index = i;
    const emoji = MONTH_EMOJIS[month.name] || '';
    btn.innerHTML = `
      <span>${emoji} ${month.name}</span>
      <span class="month-tab-count">${month.days.length}</span>
    `;
    btn.addEventListener('click', () => selectMonth(i));
    container.appendChild(btn);
  });
}

function selectMonth(index) {
  currentMonth = index;
  searchQuery = '';
  const inp = document.getElementById('searchInput');
  if (inp) inp.value = '';

  // Update tabs
  document.querySelectorAll('.month-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  // Scroll active tab into view
  const activeTab = document.querySelector('.month-tab.active');
  if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  renderMonthHeader();
  renderDays();
}

// ─── MONTH HEADER ─────────────────────────────────────────────────────────────
function renderMonthHeader() {
  const month = appData.months[currentMonth];
  const emoji = MONTH_EMOJIS[month.name] || '';
  document.getElementById('monthTitle').textContent = `${emoji} ${month.name}`;
  document.getElementById('monthSubtitle').textContent =
    MONTH_DESCRIPTIONS[month.name] || '';
}

// ─── DAYS GRID ────────────────────────────────────────────────────────────────
function renderDays() {
  const month = appData.months[currentMonth];
  const grid = document.getElementById('daysGrid');

  // Filter days by search query
  let days = month.days;
  if (searchQuery) {
    days = days.filter(day =>
      day.courses.some(c => c.text.toLowerCase().includes(searchQuery))
    );
  }

  // Animate out
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(8px)';

  setTimeout(() => {
    grid.innerHTML = '';

    if (days.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:64px;color:var(--text-soft)">
          <div style="font-size:40px;margin-bottom:16px">🔍</div>
          <div style="font-family:'Lora',serif;font-size:16px;font-style:italic">
            Nie znaleziono potraw pasujących do „${searchQuery}"
          </div>
        </div>`;
    } else {
      days.forEach((day, idx) => {
        const card = buildDayCard(day, idx);
        grid.appendChild(card);
      });
    }

    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
    grid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }, 120);
}

function buildDayCard(day, idx) {
  const card = document.createElement('div');
  card.className = `day-card${day.is_fasting ? ' fasting' : ''}`;
  card.style.animationDelay = `${Math.min(idx * 35, 400)}ms`;

  const maxShow = 3;
  const shown = day.courses.slice(0, maxShow);
  const extra = day.courses.length - maxShow;

  const courseHTML = shown.map(c => {
    const highlighted = searchQuery
      ? c.text.replace(new RegExp(`(${escapeRegex(searchQuery)})`, 'gi'), '<mark>$1</mark>')
      : escapeHtml(c.text);
    return `<div class="day-course-item">
      <div class="course-dot"></div>
      <span class="day-course-text">${highlighted}</span>
    </div>`;
  }).join('');

  card.innerHTML = `
    <div class="day-card-header">
      <div class="day-number">${day.day}</div>
      <div class="day-badges">
        ${day.is_fasting ? '<span class="badge-fasting">✝ Postny</span>' : ''}
      </div>
    </div>
    <div class="day-courses">
      ${courseHTML}
      ${extra > 0 ? `<div class="day-more">+ ${extra} więcej danie${extra > 1 ? 'ń' : ''}</div>` : ''}
    </div>
    <div class="day-card-footer">
      <span class="day-courses-count">${day.courses.length} dań</span>
      <span class="day-recipe-link">Przepisy →</span>
    </div>
  `;

  card.addEventListener('click', () => openRecipeModal(day));
  return card;
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openRecipeModal(day) {
  const month = appData.months[currentMonth];
  const emoji = MONTH_EMOJIS[month.name] || '';
  const isFasting = day.is_fasting;

  document.getElementById('modalBadge').textContent =
    `${emoji} ${month.name} · Dzień ${day.day}${isFasting ? ' · ✝ Obiad Postny' : ''}`;

  document.getElementById('modalTitle').textContent =
    `Jadłospis na ${day.day} ${month.name.toLowerCase()}`;

  document.getElementById('modalMeta').textContent =
    `${day.courses.length} dań · ${isFasting ? 'Obiad postny' : 'Obiad zwykły'}`;

  // Build day summary with course buttons
  const summary = document.getElementById('modalDaySummary');
  summary.innerHTML = `
    <h3>Układ obiadu</h3>
    <div class="modal-course-list">
      ${day.courses.map((c, i) => {
        const hasPages = c.pages && c.pages.length > 0;
        return `<div class="modal-course-row" data-course="${i}">
          <div class="modal-course-num">${i + 1}</div>
          <span class="modal-course-name">${escapeHtml(c.text)}</span>
          ${hasPages ? `<button class="modal-course-btn" onclick="scrollToRecipe(${c.pages[0]})">
            str. ${c.pages[0]} →
          </button>` : ''}
        </div>`;
      }).join('')}
    </div>
  `;

  // Build recipe sections
  const recipesContainer = document.getElementById('modalRecipes');
  recipesContainer.innerHTML = '';

  // Collect unique pages across all courses
  const allPages = [];
  const seenPages = new Set();
  day.courses.forEach(c => {
    (c.pages || []).forEach(p => {
      if (!seenPages.has(p)) {
        seenPages.add(p);
        allPages.push({ page: p, dish: c.text });
      }
    });
  });

  if (allPages.length === 0) {
    recipesContainer.innerHTML = `
      <div class="no-recipe">Brak bezpośrednich odniesień do stron przepisów.</div>`;
  } else {
    const heading = document.createElement('div');
    heading.style.cssText = 'font-family:"Playfair Display",serif;font-size:18px;font-weight:700;color:var(--brown);margin-bottom:12px;';
    heading.textContent = 'Przepisy';
    recipesContainer.appendChild(heading);

    allPages.forEach(({ page, dish }) => {
      const pageData = appData.recipes[String(page)];
      if (!pageData) return;

      const section = document.createElement('div');
      section.className = 'recipe-section';
      section.id = `recipe-page-${page}`;

      // Build HTML for each structured recipe on this page
      let bodyHtml = '';
      if (Array.isArray(pageData)) {
        pageData.forEach(item => {
          if (item.title) {
            bodyHtml += `<div style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:var(--gold-dark);margin-top:16px;margin-bottom:8px;">${escapeHtml(item.title)}</div>`;
          }
          if (item.body) {
            bodyHtml += `<div class="recipe-text" style="margin-bottom:16px;">${escapeHtml(item.body)}</div>`;
          }
        });
      } else {
        // Fallback if it's a string
        bodyHtml = `<div class="recipe-text">${escapeHtml(pageData)}</div>`;
      }

      section.innerHTML = `
        <div class="recipe-section-header" onclick="toggleRecipeSection(this)">
          <span class="recipe-section-title">${escapeHtml(dish.replace(/\.$/, ''))}</span>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="recipe-section-page">str. ${page}</span>
            <span class="recipe-section-toggle">▾</span>
          </div>
        </div>
        <div class="recipe-section-body" style="padding-top:4px;">
          ${bodyHtml}
        </div>
      `;
      recipesContainer.appendChild(section);
    });
  }

  // Show modal
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleRecipeSection(header) {
  const section = header.closest('.recipe-section');
  section.classList.toggle('collapsed');
}

function scrollToRecipe(pageNum) {
  const el = document.getElementById(`recipe-page-${pageNum}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.remove('collapsed');
    el.style.outline = '2px solid var(--gold)';
    setTimeout(() => el.style.outline = '', 1500);
  }
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



// ─── START ────────────────────────────────────────────────────────────────────
loadData().catch(err => {
  document.getElementById('daysGrid').innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:64px;color:var(--text-soft)">
      <div style="font-size:40px;margin-bottom:16px">⚠️</div>
      <p style="font-family:'Lora',serif;">Błąd ładowania danych: ${err.message}</p>
      <p style="font-size:12px;margin-top:8px;">Upewnij się, że plik data.json istnieje.</p>
    </div>`;
});
