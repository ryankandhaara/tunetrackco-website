/**
 * BP&O — Editorial Architecture & Brutalist Interaction Engine
 * Features:
 *  1. Custom Lerped Magnetic Cursor with dynamic label triggers
 *  2. Real-time GMT+7 System Time Clock
 *  3. Brutalist Synthesized Web Audio micro-feedback system
 *  4. Contrast Dark / Light Theme switch with localStorage state
 *  5. Fullscreen Mobile Nav Drawer orchestration
 *  6. Real-time Live Filter Search Engine modal
 *  7. Drag & Flick Momentum Carousel Pagination Deck + scrub track
 *  8. BP&O Plus Pricing Engine with student discount calculation
 *  9. IntersectionObserver scroll reveals
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     00. TUNETRACK PAPERS — LEGACY BLOG DATA BRIDGE
     The article data below is sourced directly from the legacy Blog List.
     ========================================================================== */
  // Single source of truth: assets/js/blog-list-data.js
  const legacyBlogPosts = Array.isArray(window.TUNETRACK_BLOGS?.posts)
    ? window.TUNETRACK_BLOGS.posts.map((post) => ({
        ...post,
        href: post.href || `single-blog.html?slug=${encodeURIComponent(post.slug || '')}`
      }))
    : [];

  const latestFeed = document.getElementById('latestArticlesFeed');

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[char]);
  }

  function renderLegacyBlogPosts() {
    if (!latestFeed) return;

    latestFeed.innerHTML = legacyBlogPosts.map((post) => {
      const locked = post.locked && post.unlock && new Date(post.unlock).getTime() > Date.now();
      const cls = locked ? 'feed-item item-community tnco-locked-article' : 'feed-item item-community';
      const lockAttr = post.unlock ? ` data-unlock="${escapeHtml(post.unlock)}"` : '';
      const image = post.image ? `<img class="blog-feed-image" src="${escapeHtml(post.image)}" alt="" loading="lazy" decoding="async">` : '';

      return `
        <article class="${cls}" data-observe data-category="${escapeHtml(post.category)}" data-title="${escapeHtml(post.title)}"${lockAttr}>
          <a href="${locked ? '#' : escapeHtml(post.href)}" class="feed-card-link" data-blog-href="${escapeHtml(post.href)}">
            <div class="feed-visual-box aspect-3-2">
              <div class="crosshair ch-tl">+</div>
              <div class="crosshair ch-tr">+</div>
              <div class="crosshair ch-bl">+</div>
              <div class="crosshair ch-br">+</div>
              ${image}
              <div class="badge-pill-float">
                <span class="swiss-pill">${escapeHtml(post.category)}</span>
                <span class="mono-meta-small">${escapeHtml(post.number)} // ${escapeHtml(post.date)}</span>
              </div>
            </div>
            <div class="feed-meta-content">
              <h2 class="feed-title">${escapeHtml(post.title)}</h2>
              <p class="feed-excerpt">${escapeHtml(post.date)} · ${escapeHtml(post.category)}</p>
              <div class="feed-meta-footer mono-meta">
                <span>PAPERS // TUNETRACK</span>
                <span>${escapeHtml(post.number)} / ${escapeHtml(post.date)}</span>
              </div>
            </div>
          </a>
          ${locked ? `
            <div class="tnco-lock-overlay" aria-hidden="true">
              <div class="tnco-lock-message">
                <span class="tnco-lock-symbol">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>
                </span>
                <span class="tnco-lock-text">THIS ARTICLE IS NOT YET UNLOCKED</span>
                <span class="tnco-lock-divider">|</span>
                <span class="tnco-lock-countdown">00:00:00</span>
              </div>
            </div>` : ''}
        </article>
      `;
    }).join('');

    initBlogLockState();
  }

  function initBlogLockState() {
    document.querySelectorAll('.tnco-locked-article').forEach((article) => {
      const unlockAt = article.dataset.unlock ? new Date(article.dataset.unlock).getTime() : 0;
      const link = article.querySelector('.feed-card-link');
      const countdown = article.querySelector('.tnco-lock-countdown');

      const tick = () => {
        const remaining = unlockAt - Date.now();
        if (remaining <= 0) {
          article.classList.add('is-unlocked');
          if (link) {
            link.href = link.dataset.blogHref || '#';
            link.style.pointerEvents = '';
          }
          return;
        }
        const total = Math.floor(remaining / 1000);
        const h = String(Math.floor(total / 3600)).padStart(2, '0');
        const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
        const s = String(total % 60).padStart(2, '0');
        if (countdown) countdown.textContent = `${h}:${m}:${s}`;
      };

      tick();
      const timer = setInterval(() => {
        tick();
        if (unlockAt <= Date.now()) clearInterval(timer);
      }, 1000);
    });
  }

  renderLegacyBlogPosts();

  /* ==========================================================================
     00B. DYNAMIC TUNETRACK PRODUCT PROMOTION
     ========================================================================== */
  /* ==========================================================================
     05. CATALOG PRODUCT PROMOTION — RENDER INTO THE EXISTING LOGO GRID
     ========================================================================== */
  const logoTilesGrid = document.getElementById('logoTilesGrid');
  if (logoTilesGrid && Array.isArray(window.products)) {
    // HARD LIMIT: this block may render ONLY 14 products.
    // Additional catalog products remain available in window.products for future blocks/pages.
    const PRODUCTS_PER_BLOCK = 14;
    const promoProducts = window.products
      .filter((product) => product && product.title && product.image)
      .slice(0, PRODUCTS_PER_BLOCK);

    logoTilesGrid.dataset.productCount = String(promoProducts.length);
    logoTilesGrid.dataset.productLimit = String(PRODUCTS_PER_BLOCK);

    logoTilesGrid.innerHTML = promoProducts.map((product) => {
      const categories = Array.isArray(product.category) ? product.category.join(' / ') : (product.category || 'PRODUCT');
      const price = product.price || 'VIEW PRODUCT';
      const href = `product-page.html?item=${encodeURIComponent(product.title)}`;
      return `
        <article class="logo-tile-item product-logo-tile" data-logo-name="${escapeHtml(product.title)}">
          <a href="${escapeHtml(href)}" class="logo-tile-link">
<div class="logo-canvas-box product-logo-canvas">
  <img
    class="product-tile-thumbnail"
    src="${escapeHtml(product.image).replace(/^assets\/thumbnail\//, 'assets/images/thumbnail/')}"
    alt="${escapeHtml(product.title)}"
    loading="lazy"
    decoding="async">
  <span class="product-tile-price swiss-pill">${escapeHtml(price)}</span>
</div>
            <div class="product-tile-copy">
              <span class="logo-tile-label">${escapeHtml(product.title)}</span>
              <span class="product-tile-meta mono-meta-small">${escapeHtml(categories)} · ${escapeHtml(product.artist || 'TUNETRACK')}</span>
            </div>
          </a>
        </article>
      `;
    }).join('');
  }

  const catalogMenuBtn = document.getElementById('tncoHeaderMenuButton');
  const catalogMenu = document.getElementById('tncoMobileMenu');
  const catalogMenuClose = document.getElementById('tncoMobileMenuClose');

  const setCatalogMenu = (open) => {
    if (!catalogMenu) return;
    catalogMenu.classList.toggle('is-open', open);
    catalogMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (catalogMenuBtn) catalogMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('tnco-menu-open', open);
  };
  catalogMenuBtn?.addEventListener('click', () => setCatalogMenu(true));
  catalogMenuClose?.addEventListener('click', () => setCatalogMenu(false));
  catalogMenu?.addEventListener('click', (event) => {
    if (event.target === catalogMenu) setCatalogMenu(false);
  });

  const catalogSearchBtn = document.getElementById('swissSearchBtn');
  const catalogSearchOverlay = document.getElementById('catalogSearchOverlay');
  const catalogSearchClose = document.getElementById('catalogSearchClose');
  const catalogSearchInput = document.getElementById('globalSearch');
  const catalogSearchResults = document.getElementById('searchResults');
  const catalogSearchCount = document.getElementById('searchResultCount');

  const closeCatalogSearch = () => {
    catalogSearchOverlay?.classList.remove('is-open');
    catalogSearchOverlay?.setAttribute('aria-hidden', 'true');
  };

  catalogSearchBtn?.addEventListener('click', () => {
    catalogSearchOverlay?.classList.add('is-open');
    catalogSearchOverlay?.setAttribute('aria-hidden', 'false');
    setTimeout(() => catalogSearchInput?.focus(), 100);
  });
  catalogSearchClose?.addEventListener('click', closeCatalogSearch);

  function renderBlogSearch(query = '') {
    if (!catalogSearchResults) return;
    const q = query.trim().toLowerCase();
    const matches = legacyBlogPosts.filter((post) =>
      !q || [post.title, post.category, post.date].some((value) => String(value).toLowerCase().includes(q))
    );
    if (catalogSearchCount) catalogSearchCount.textContent = `${matches.length} PAPERS`;
    catalogSearchResults.innerHTML = matches.map((post) => `
      <a class="catalog-search-result" href="${escapeHtml(post.href)}">
        <span class="mono-meta">${escapeHtml(post.number)} // ${escapeHtml(post.category)} // ${escapeHtml(post.date)}</span>
        <strong>${escapeHtml(post.title)}</strong>
      </a>
    `).join('') || '<div class="catalog-search-empty mono-meta">NO PAPERS FOUND</div>';
  }
  catalogSearchInput?.addEventListener('input', (event) => renderBlogSearch(event.target.value));
  renderBlogSearch();


  /* ==========================================================================
     01. REAL-TIME GMT+7 SYSTEM CLOCK
     ========================================================================== */
  const liveTimeEl = document.getElementById('liveTime');
  function updateLiveTime() {
    if (!liveTimeEl) return;
    const now = new Date();
    // Offset for UTC+7
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const gmt7Time = new Date(utc + (3600000 * 7));
    
    const pad = (n) => String(n).padStart(2, '0');
    const hours = pad(gmt7Time.getHours());
    const minutes = pad(gmt7Time.getMinutes());
    const seconds = pad(gmt7Time.getSeconds());
    
    liveTimeEl.textContent = `${hours}:${minutes}:${seconds} GMT+7`;
  }
  setInterval(updateLiveTime, 1000);
  updateLiveTime();

  /* ==========================================================================
     02. WEB AUDIO FEEDBACK SYNTHESIZER
     ========================================================================== */
  let audioCtx = null;
  let isSoundMuted = true;
  const soundToggleBtn = document.getElementById('soundToggle');
  const soundStateEl = document.getElementById('soundState');

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBlip(freq = 600, duration = 0.04, type = 'sine') {
    if (isSoundMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + duration);
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext policy suppression fallback
    }
  }

  if (soundToggleBtn && soundStateEl) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      isSoundMuted = !isSoundMuted;
      soundStateEl.textContent = isSoundMuted ? 'MUTED' : 'ACTIVE';
      soundStateEl.style.color = isSoundMuted ? 'var(--c-blue)' : '#27C93F';
      if (!isSoundMuted) playBlip(880, 0.08);
    });
  }

  /* ==========================================================================
     03. LIGHT MODE — FIXED
     ========================================================================== */
  document.documentElement.setAttribute('data-theme', 'light');
  try { localStorage.setItem('bpo_theme', 'light'); } catch (e) {}

  /* ==========================================================================
     04. NATIVE CURSOR + LIGHTWEIGHT MAGNETIC BUTTON MOTION
     ========================================================================== */
  const magneticElems = document.querySelectorAll('.magnetic-elem');
  magneticElems.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* ==========================================================================
     05. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileSearchTrigger = document.getElementById('mobileSearchTrigger');

  function openMobileNav() {
    if (mobileNavOverlay) {
      mobileNavOverlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      playBlip(540, 0.05);
    }
  }

  function closeMobileNav() {
    if (mobileNavOverlay) {
      mobileNavOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
      playBlip(440, 0.04);
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileNav);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);

  /* ==========================================================================
     06. LIVE REAL-TIME SEARCH MODAL
     ========================================================================== */
  const searchModal = document.getElementById('searchModal');
  const searchOpenBtn = document.getElementById('searchOpenBtn');
  const searchBackdrop = document.getElementById('searchBackdrop');
  const searchCloseX = document.getElementById('searchCloseX');
  const liveSearchInput = document.getElementById('liveSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const searchResultsList = document.getElementById('searchResultsList');

  // Build local searchable dictionary from articles & logos
  const searchableIndex = [];
  document.querySelectorAll('#latestArticlesFeed .feed-item').forEach((item) => {
    const title = item.getAttribute('data-title') || item.querySelector('.feed-title')?.textContent || '';
    const cat = item.getAttribute('data-category') || 'Article';
    const link = item.querySelector('.feed-card-link')?.getAttribute('href') || '#';
    searchableIndex.push({ title, category: cat, url: link });
  });

  document.querySelectorAll('#logoTilesGrid .logo-tile-item').forEach((item) => {
    const title = item.getAttribute('data-logo-name') || item.querySelector('.logo-tile-label')?.textContent || '';
    const link = item.querySelector('.logo-tile-link')?.getAttribute('href') || '#';
    searchableIndex.push({ title: `${title} (Logomark)`, category: 'Logo', url: link });
  });

  function openSearch() {
    closeMobileNav();
    if (searchModal) {
      searchModal.classList.add('is-open');
      searchModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => liveSearchInput?.focus(), 50);
      playBlip(750, 0.04);
    }
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove('is-open');
      searchModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (liveSearchInput) liveSearchInput.value = '';
      renderSearchResults('');
      playBlip(380, 0.04);
    }
  }

  function renderSearchResults(query) {
    if (!searchResultsList) return;
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      searchResultsList.innerHTML = '<div class="search-empty-state mono-meta">START TYPING TO QUERY EDITORIAL ARCHIVE...</div>';
      return;
    }

    const matches = searchableIndex.filter((entry) =>
      entry.title.toLowerCase().includes(cleanQuery) ||
      entry.category.toLowerCase().includes(cleanQuery)
    );

    if (matches.length === 0) {
      searchResultsList.innerHTML = `<div class="search-empty-state mono-meta">NO EDITORIAL MATCHES FOUND FOR "${query.toUpperCase()}".</div>`;
      return;
    }

    searchResultsList.innerHTML = matches.map((match) => `
      <a href="${match.url}" class="search-result-row">
        <span class="result-main">${match.title}</span>
        <span class="mono-meta-small swiss-pill">${match.category}</span>
      </a>
    `).join('');
  }

  if (searchOpenBtn) searchOpenBtn.addEventListener('click', openSearch);
  if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });
  }
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
  if (searchCloseX) searchCloseX.addEventListener('click', closeSearch);

  if (liveSearchInput) {
    liveSearchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (liveSearchInput) {
        liveSearchInput.value = '';
        liveSearchInput.focus();
        renderSearchResults('');
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (searchModal?.classList.contains('is-open')) closeSearch();
      if (mobileNavOverlay?.classList.contains('is-active')) closeMobileNav();
    }
  });

  /* ==========================================================================
     07. SIMPLE PAGINATION CONTROLS
     ========================================================================== */
  const pagPrevBtn = document.getElementById('pagPrevBtn');
  const pagNextBtn = document.getElementById('pagNextBtn');
  const jumpInput = document.getElementById('jumpInput');
  const jumpGoBtn = document.getElementById('jumpGoBtn');
  const articleItems = Array.from(document.querySelectorAll('#latestArticlesFeed .feed-item'));
  let currentArticleIndex = 0;

  // Current build has one block only. PREV/NEXT stay structurally functional
  // but are intentionally unavailable until additional blocks/pages exist.
  const paginationHasMultipleBlocks = false;
  [pagPrevBtn, pagNextBtn].forEach((button) => {
    if (!button) return;
    button.classList.add('unavailable');
    button.setAttribute('aria-disabled', 'true');
    button.dataset.paginationState = 'unavailable';
  });

  function goToArticle(index) {
    if (!articleItems.length) return;
    currentArticleIndex = Math.max(0, Math.min(articleItems.length - 1, index));
    articleItems[currentArticleIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (jumpInput) jumpInput.value = String(currentArticleIndex + 1).padStart(2, '0');
    pagPrevBtn?.classList.toggle('disabled', currentArticleIndex === 0);
    pagNextBtn?.classList.toggle('disabled', currentArticleIndex === articleItems.length - 1);
  }

  pagPrevBtn?.addEventListener('click', (event) => {
    if (!paginationHasMultipleBlocks) { event.preventDefault(); return; }
    if (currentArticleIndex > 0) goToArticle(currentArticleIndex - 1);
  });

  pagNextBtn?.addEventListener('click', (event) => {
    if (!paginationHasMultipleBlocks) { event.preventDefault(); return; }
    if (currentArticleIndex < articleItems.length - 1) goToArticle(currentArticleIndex + 1);
  });

  jumpGoBtn?.addEventListener('click', () => {
    const target = Number.parseInt(jumpInput?.value || '1', 10);
    if (Number.isFinite(target)) goToArticle(target - 1);
  });

  if (jumpInput) {
    jumpInput.max = String(Math.max(1, articleItems.length));
    jumpInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') jumpGoBtn?.click();
    });
  }

  // Initial article scroll intentionally disabled.

  /* ==========================================================================
     09. INTERSECTION OBSERVER (SCROLL REVEALS)
     ========================================================================== */
  const observedElements = document.querySelectorAll('[data-observe]');
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersect2D || entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observedElements.forEach((el) => revealObserver.observe(el));

  /* ==========================================================================
     10. BACK TO TOP SMOOTH SCROLL
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      playBlip(800, 0.06);
    });
  }

});