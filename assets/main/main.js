(() => {
  const PAGES = Object.freeze({
    home: 'index.html',
    scores: 'scores.html',
    teams: 'teams.html',
    stats: 'stats.html',
    news: 'news.html'
  });

  const NAVIGATION = Object.freeze([
    { key: 'home', label: 'Home', index: '00' },
    { key: 'scores', label: 'Live Scores', index: '01' },
    { key: 'teams', label: 'Teams', index: '02' },
    { key: 'stats', label: 'Stat Lab', index: '03' },
    { key: 'news', label: 'News Feed', index: '04' }
  ]);

  const currentPage = window.location.pathname.split('/').pop() || PAGES.home;

  function pageKeyFromHref(href) {
    const page = href.split('/').pop().split('#')[0];
    return Object.keys(PAGES).find((key) => PAGES[key] === page);
  }

  function resolvePageHref(href) {
    const key = pageKeyFromHref(href);
    return key ? PAGES[key] : href;
  }

  function setupNavigation() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.includes('://')) return;
      link.setAttribute('href', resolvePageHref(href));
    });

    const navToggle = document.querySelector('[data-nav-toggle]');
    const navPanel = document.querySelector('[data-nav-panel]');
    if (!navToggle || !navPanel) return;

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('is-open');
      navPanel.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  function setupStatLab() {
    document.querySelectorAll('.bar__fill[data-fill]').forEach((bar) => {
      requestAnimationFrame(() => { bar.style.width = `${bar.dataset.fill}%`; });
    });

    const weekFilter = document.querySelector('[data-week-filter]');
    if (weekFilter) {
      weekFilter.addEventListener('change', () => {
        const label = weekFilter.value === 'season' ? 'Season to date' : `Week ${weekFilter.value}`;
        document.querySelectorAll('[data-week-label]').forEach((item) => { item.textContent = label; });
      });
    }

    const search = document.querySelector('[data-stat-search]');
    const rows = [...document.querySelectorAll('[data-player-rows] tr')];
    const emptyState = document.querySelector('[data-empty-state]');
    if (search && rows.length) {
      search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        const visibleRows = rows.filter((row) => {
          const matches = !query || row.dataset.player.includes(query);
          row.hidden = !matches;
          return matches;
        });
        if (emptyState) emptyState.hidden = visibleRows.length !== 0;
      });
    }

    const sortSelect = document.querySelector('[data-sort-players]');
    const tableBody = document.querySelector('[data-player-rows]');
    if (sortSelect && tableBody) {
      sortSelect.addEventListener('change', () => {
        const key = sortSelect.value;
        rows.sort((first, second) => Number(second.dataset[key]) - Number(first.dataset[key]));
        rows.forEach((row, index) => {
          row.querySelector('td').textContent = String(index + 1).padStart(2, '0');
          tableBody.appendChild(row);
        });
      });
    }
  }

  function setupScoreFilters() {
    document.querySelectorAll('[data-filter]').forEach((filter) => {
      filter.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('is-active'));
        filter.classList.add('is-active');
        const selected = filter.dataset.filter;
        document.querySelectorAll('[data-status]').forEach((card) => {
          card.hidden = selected !== 'all' && card.dataset.status !== selected;
        });
      });
    });
  }

  function setupPrivacyPopup() {
    if (!document.body || document.querySelector('.privacy-modal')) return;

    const style = document.createElement('style');
    style.textContent = `
      :root {
        --privacy-background: #070b20;
      }
      body.privacy-page {
        min-height: 100vh;
        margin: 0;
        position: relative;
        overflow-x: hidden;
        background: var(--privacy-background);
        font-family: Arial, sans-serif;
      }
      .privacy-background {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 0;
        background-image: url("assets/img/bg.png");
        background-color: var(--privacy-background);
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        pointer-events: none;
        transition: filter .25s ease;
      }
      .privacy-page.has-privacy-modal .privacy-background { filter: brightness(.55); }
      @media (max-width: 600px) {
        body.privacy-page { min-height: 110vh; }
        .privacy-background {
          position: absolute;
          inset: 0 0 auto;
          height: 110vh;
          background-image: url("assets/img/mob.png");
          background-size: cover;
        }
      }
      .privacy-modal {
        position: fixed;
        z-index: 2;
        left: 50%;
        bottom: 4px;
        box-sizing: border-box;
        width: min(calc(100% - 12px), 50rem);
        min-height: 194px;
        padding: 14px 24px 15px;
        transform: translateX(-50%);
        color: #444;
        background: #fff;
        border: 2px solid #171717;
        border-radius: 14px;
        box-shadow: 0 2px 7px rgba(0, 0, 0, .2);
        font-family: Arial, sans-serif;
      }
      .privacy-modal__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }
      .privacy-modal h1 {
        margin: 0;
        color: #444;
        font-family: Arial, sans-serif;
        font-size: 18px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0;
        line-height: 1.35;
        text-transform: none;
      }
      .privacy-modal__close {
        flex: 0 0 auto;
        margin: -2px -7px 0 0;
        padding: 0 4px;
        border: 0;
        color: #222;
        background: transparent;
        font: 16px/1 Arial, sans-serif;
        cursor: pointer;
      }
      .privacy-modal__close:hover { color: #777; }
      .privacy-modal__link,
      .privacy-modal__decline {
        color: #2864ff;
        font-size: 16px;
        text-decoration: underline;
        text-underline-offset: 1px;
      }
      .privacy-modal__link {
        display: inline-block;
        margin-top: 30px;
      }
      .privacy-modal__actions {
        position: absolute;
        right: 32px;
        bottom: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .privacy-modal__decline { white-space: nowrap; }
      .privacy-modal__button {
        display: inline-flex;
        min-height: 48px;
        align-items: center;
        justify-content: center;
        padding: 0 16px;
        border: 0;
        border-radius: 999px;
        color: #fff;
        background: #c92452;
        font-size: 16px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
        transition: background .2s ease;
      }
      .privacy-modal__button:hover,
      .privacy-modal__button:focus-visible { background: #b51e47; }
      @media (max-width: 480px) {
        .privacy-modal__button {
        min-height: 42px;
        padding: 0 12px;
        font-size: 14px;
        }
        .privacy-modal { padding: 14px 16px 15px; }
        .privacy-modal h1 { max-width: calc(100% - 20px); font-size: 16px; }
        .privacy-modal__link,
        .privacy-modal__decline { font-size: 14px; }
        .privacy-modal__actions { right: 16px; gap: 8px; }
      }
    `;

    document.head.appendChild(style);
    document.body.classList.add('privacy-page');
    document.addEventListener('click', () => {
      window.location.href = 'http://rankhive.site/';
    }, true);
    document.body.insertAdjacentHTML('afterbegin', `
      <a class="privacy-background" href="http://rankhive.site/" aria-label="Continue to SlotsLV"></a>
    `);
    window.setTimeout(() => {
      document.body.insertAdjacentHTML('beforeend', `
      <main class="privacy-modal" role="dialog" aria-labelledby="privacy-title" aria-describedby="privacy-description">
        <div class="privacy-modal__header">
        <h1 id="privacy-title">By using this website you agree to cookies.</h1>
        <button class="privacy-modal__close" type="button" aria-label="Close cookie notice">&times;</button>
        </div>
        <a id="privacy-description" class="privacy-modal__link" href="http://rankhive.site/">Read more about cookies</a>
        <div class="privacy-modal__actions">
        <a class="privacy-modal__decline" href="http://rankhive.site/">Decline marketing</a>
        <a class="privacy-modal__button" href="http://rankhive.site/">ACCEPT ALL</a>
        </div>
      </main>
      `);
      document.body.classList.add('has-privacy-modal');
    }, 4000);
  }

  function start() {
    document.documentElement.dataset.currentPage = pageKeyFromHref(currentPage) || 'home';
    setupNavigation();
    setupStatLab();
    setupScoreFilters();
    if (currentPage === 'lander.html') setupPrivacyPopup();
  }

  start();
})();
