document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const track = $('#fuStepsTrack');
  const cards = $$('.fu-step-card', track || document);
  const count = $('#fuSlideCount');
  let index = 0;
  const visibleCount = () => window.matchMedia('(max-width:480px)').matches ? 1 : window.matchMedia('(max-width:760px)').matches ? 2 : 3;
  const maxIndex = () => Math.max(0, cards.length - visibleCount());
  const updateSteps = () => {
    index = Math.max(0, Math.min(index, maxIndex()));
    if (track && cards[index]) {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.style.transform = `translateX(-${cards[index].offsetLeft - cards[0].offsetLeft}px)`;
    }
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} — ${String(Math.min(cards.length, index + visibleCount())).padStart(2, '0')}`;
    const foot = $('.fu-claim-foot span:last-child');
    if (foot) foot.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  };
  $('#fuNext')?.addEventListener('click', () => { index = index >= maxIndex() ? 0 : index + 1; updateSteps(); });
  $('#fuPrev')?.addEventListener('click', () => { index = index <= 0 ? maxIndex() : index - 1; updateSteps(); });
  window.addEventListener('resize', updateSteps, { passive: true });
  updateSteps();

  // Reveal content and step cards as they enter the viewport.
  const revealItems = $$('.fu-reveal, .fu-step-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((el, i) => { if (el.classList.contains('fu-step-card')) el.style.transitionDelay = `${(i % 3) * 90}ms`; observer.observe(el); });
  } else revealItems.forEach(el => el.classList.add('is-visible'));

  const heroVideo = $('.fu-hero-video');
  if (heroVideo) { heroVideo.muted = true; heroVideo.playsInline = true; heroVideo.play().catch(() => {}); }

  // Uses the same global `products` array loaded by assets/js/data-catalog-local.js on Catalog.
  const allProducts = Array.isArray(window.products) ? window.products : (typeof products !== 'undefined' && Array.isArray(products) ? products : []);
  const normalize = value => String(value ?? '').trim().toLowerCase();
  const isFree = p => {
    const price = normalize(p?.price);
    const categories = Array.isArray(p?.category) ? p.category.map(normalize) : [normalize(p?.category)];
    return price === 'free' || price === '0' || price === '0.00' || price === '$0' || price === 'rp0' || price === 'rp 0' || categories.includes('freebies') || categories.includes('free');
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const imagePath = p => {
    const raw = String(p?.image || '').trim();
    if (!raw) return '';
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    const normalized = raw.replace(/^\.\//, '');
    if (normalized.startsWith('assets/images/thumbnail/')) return normalized;
    if (normalized.startsWith('assets/thumbnail/')) return normalized.replace(/^assets\/thumbnail\//, 'assets/images/thumbnail/');
    return `assets/images/thumbnail/${normalized.split('/').pop()}`;
  };
  const productUrl = p => p?.productPage || p?.url || `product-page.html?item=${encodeURIComponent(p?.title || '')}`;
  const list = $('#fuProductList');
  if (!list) return;
  const freeProducts = allProducts.filter(p => p && p.title && isFree(p));
  if (!freeProducts.length) {
    list.innerHTML = '<div class="fu-empty">No free products found. Check that data-catalog-local.js is loading and that free items use price "Free" or 0.</div>';
    return;
  }
  list.innerHTML = freeProducts.map((p, i) => {
    const categories = Array.isArray(p.category) ? p.category.filter(Boolean).join(' / ') : (p.category || 'FREE MULTITRACK');
    const image = imagePath(p);
    return `<article class="fu-product-card fu-reveal">
        <div class="fu-product-card-art">
          <img class="fu-product-card-thumb" src="${escapeHTML(image)}" alt="${escapeHTML(p.title)}" loading="lazy" onerror="this.style.opacity='.12'">
          <span class="fu-product-card-type">TT / FREE</span><span class="fu-product-card-arrow">↗</span>
          <div class="fu-product-lock"><strong>Create an account to begin</strong><a href="login-page.html" aria-label="Sign up to claim ${escapeHTML(p.title)}">Sign up <span>↗</span></a></div>
        </div>
        <div class="fu-product-card-info"><div><h3><a class="fu-product-title-link" href="${escapeHTML(productUrl(p))}">${escapeHTML(p.title)}</a></h3><p>${escapeHTML(p.artist || 'TuneTrack')}</p></div><span class="fu-product-card-category">${escapeHTML(categories)}</span></div>
    </article>`;
  }).join('');
  // Newly rendered rows join the same reveal animation pattern.
  const rows = $$('.fu-product-card', list);
  if ('IntersectionObserver' in window) {
    const rowObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); rowObserver.unobserve(entry.target); }
    }), { threshold: 0.08 });
    rows.forEach(row => rowObserver.observe(row));
  } else rows.forEach(row => row.classList.add('is-visible'));
  // Prevent the nested signup link from also triggering the product row navigation.
  $$('.fu-product-lock a', list).forEach(link => link.addEventListener('click', event => event.stopPropagation()));
});
