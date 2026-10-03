        (() => {
            const FALLBACK_THUMB_DIR = 'assets/images/thumbnail/';
            const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
            const catalog = Array.isArray(window.TuneTrackCatalog) ? window.TuneTrackCatalog : [];

            const thumbnailCandidates = (item) => {
                const raw = String(item?.image || '').replace(/^assets\/(?:images\/)?thumbnail\//i, '');
                const title = String(item?.title || '').trim();
                const candidates = [];
                const add = (name) => { if (name && !candidates.includes(name)) candidates.push(name); };
                add(raw);
                if (raw) {
                    add(raw.replace(/^assets\//i, ''));
                    const m = raw.match(/^(\d+)[_-](.*)\.(jpg|jpeg)$/i);
                    if (m) {
                        const n = Number(m[1]);
                        const stem = m[2].replace(/[-_]+/g, ' ').trim();
                        add(`${String(n).padStart(3, '0')} - ${stem}.jpg`);
                        add(`${String(Math.max(0, n - 1)).padStart(3, '0')} - ${stem}.jpg`);
                        add(`${String(n + 1).padStart(3, '0')} - ${stem}.jpg`);
                    }
                }
                if (title) {
                    const stem = title.replace(/[\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
                    add(`${stem}.jpg`);
                    add(`${stem.replace(/[()]/g, '').replace(/\s+/g, ' ')}.jpg`);
                }
                return candidates.map(name => FALLBACK_THUMB_DIR + name.replace(/^assets\//i, ''));
            };

            const setThumbWithFallback = (img, item) => {
                const candidates = thumbnailCandidates(item);
                let i = 0;
                img.src = candidates[i] || '';
                img.onerror = () => {
                    i += 1;
                    if (i < candidates.length) img.src = candidates[i];
                    else { img.onerror = null; img.style.display = 'none'; img.parentElement?.classList.add('thumb-missing'); }
                };
            };

            const isFree = (item) => {
                const price = String(item?.price ?? '').trim().toLowerCase();
                const cats = Array.isArray(item?.category) ? item.category.map(x => String(x).toLowerCase()) : [];
                return price === 'free' || price === '0' || price === '0 rp' || price === '0 idr' || cats.includes('freebies');
            };

            const productCard = (item, free = false) => {
                const article = document.createElement('article');
                article.className = 'product-card catalog-data-card';
                article.dataset.productTitle = item.title || '';
                article.innerHTML = `
                <div class="card-meta mono-meta">${esc((item.category || []).join(' / ')).toUpperCase() || 'TUNETRACK'} / ${esc(item.price || '')}</div>
                <div class="card-visual catalog-thumb-wrap">
                    <img class="catalog-thumb" alt="${esc(item.title || 'TuneTrack product')}" loading="lazy">
                </div>
                <div class="card-info">
                    <h3 class="card-title">${esc(item.title || 'Untitled')}</h3>
                    <p class="mono-meta catalog-artist">${esc(item.artist || '')}</p>
                    <div class="catalog-card-footer">
                        <span class="catalog-price">${esc(item.price || '')}</span>
                        ${free ? '<button type="button" class="pill-btn full-width claim-trigger" data-product-title="' + esc(item.title || '') + '">CLAIM ASSET</button>' : '<a class="pill-btn outline small" href="' + esc(item.link || '#') + '" target="_blank" rel="noopener">VIEW</a>'}
                    </div>
                </div>`;
                const img = article.querySelector('.catalog-thumb');
                setThumbWithFallback(img, item);
                return article;
            };

            const freebiesGrid = document.getElementById('freebies-grid');
            const freeItems = catalog.filter(isFree);
            if (freebiesGrid) {
                freebiesGrid.replaceChildren(...freeItems.map(item => productCard(item, true)));
            }

            const catalogueGrid = document.getElementById('catalogue-grid');
            const catalogueCount = document.getElementById('catalogue-count');
            if (catalogueCount) catalogueCount.textContent = `${catalog.length} ASSETS`;
            if (catalogueGrid) catalogueGrid.replaceChildren(...catalog.map(item => productCard(item, isFree(item))));

            const explore = document.getElementById('catalogue-explore');
            const index = document.getElementById('catalogue-index');
            const close = document.getElementById('catalogue-close');
            const openIndex = () => { if (!index || !explore) return; index.hidden = false; explore.hidden = true; explore.setAttribute('aria-expanded', 'true'); index.querySelector('.catalogue-product-grid')?.focus?.(); };
            const closeIndex = () => { if (!index || !explore) return; index.hidden = true; explore.hidden = false; explore.setAttribute('aria-expanded', 'false'); };
            explore?.addEventListener('click', openIndex);
            explore?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIndex(); } });
            close?.addEventListener('click', closeIndex);
        })();
