        (() => {
            const initFreebiesCategories = () => {
                const grid = document.getElementById('freebies-grid');
                if (!grid || grid.dataset.categoriesReady === 'true') return;

                const existingCards = [...grid.querySelectorAll('.catalog-data-card')];
                const christmasCard = existingCards.find(card =>
                    /sambutlah\s+dia/i.test(card.querySelector('.card-title')?.textContent || '')
                );
                const multitrackCards = existingCards;

                const addFreeTag = (card) => {
                    if (!card) return;
                    if (!card.querySelector('.tt-free-tag')) {
                        card.insertAdjacentHTML('afterbegin', '<span class="tt-free-tag">FREE</span>');
                    }
                    if (!card.querySelector('.tt-free-price-tag')) {
                        card.insertAdjacentHTML('afterbegin', '<span class="tt-free-price-tag" aria-hidden="true">FREE</span>');
                    }
                };
                existingCards.forEach(addFreeTag);

                /* Keep FREE badges attached to product cards that are rendered asynchronously. */
                const freeTagObserver = new MutationObserver(() => {
                    grid.querySelectorAll('.catalog-data-card').forEach(addFreeTag);
                });
                freeTagObserver.observe(grid, { childList: true, subtree: true });

                const makeCategoryCard = (title, kicker, meta, key, videoSrc) => {
                    const card = document.createElement('article');
                    card.className = 'tt-freebie-category-card';
                    card.tabIndex = 0;
                    card.setAttribute('role', 'button');
                    card.dataset.freebieCategory = key;
                    card.innerHTML = `
                    <div class="tt-freebie-video-layer" aria-hidden="true">
                        <video class="tt-freebie-bg-video" muted playsinline preload="metadata">
                            <source src="${videoSrc}" type="video/mp4">
                        </video>
                    </div>
                    <div class="tt-freebie-color-overlay" aria-hidden="true"></div>
                    <span class="tt-free-tag">FREE</span>
                    <div class="tt-freebie-category-copy">
                        <span class="tt-freebie-category-kicker">${kicker}</span>
                        <h2>${title}</h2>
                        <span class="tt-freebie-category-meta">${meta}</span>
                    </div>
                    <span class="tt-freebie-category-arrow">↗</span>`;

                    const video = card.querySelector('.tt-freebie-bg-video');
                    if (video) {
                        const resetVideo = () => {
                            try {
                                video.pause();
                                video.currentTime = 0;
                            } catch (_) { }
                        };
                        const playVideo = () => {
                            try {
                                video.currentTime = 0;
                                const promise = video.play();
                                if (promise?.catch) promise.catch(() => { });
                            } catch (_) { }
                        };
                        video.addEventListener('loadedmetadata', () => {
                            try { video.currentTime = 0; } catch (_) { }
                        });
                        card.addEventListener('mouseenter', playVideo);
                        card.addEventListener('mouseleave', resetVideo);
                        card.addEventListener('focusin', playVideo);
                        card.addEventListener('focusout', resetVideo);
                        resetVideo();
                    }
                    return card;
                };

                const categories = document.createElement('div');
                categories.className = 'tt-freebies-categories';
                categories.append(
                    makeCategoryCard('<span class="tt-title-first">CHRISTMAS</span> <span class="tt-title-second">SPECIAL.</span>', 'TUNETRACK / SEASONAL FREEBIE', 'OPEN SPECIAL / 01 ASSET', 'christmas', 'assets/videos/freebies-christmas.mp4'),
                    makeCategoryCard('<span class="tt-title-first">FREE</span> <span class="tt-title-second">MULTITRACK.</span>', 'TUNETRACK / MULTITRACK FREEBIES', 'OPEN COLLECTION / FREE ASSETS', 'multitrack', 'assets/videos/freebies-multitrack.mp4'),
                    makeCategoryCard('<span class="tt-title-first">FREE</span> <span class="tt-title-second">TOOLKIT.</span>', 'TUNETRACK / CREATOR TOOLS', 'OPEN COLLECTION / FREE TOOLS', 'toolkit', 'assets/videos/freebies-toolkit.mp4')
                );

                const detail = document.createElement('div');
                detail.className = 'tt-freebies-detail';
                detail.innerHTML = `
                <div class="tt-freebies-detail-head">
                    <div>
                        <span class="mono-meta" id="tt-freebies-detail-kicker">FREEBIES / COLLECTION</span>
                        <h2 class="tt-freebies-detail-title" id="tt-freebies-detail-title">FREEBIES.</h2>
                    </div>
                    <button type="button" class="pill-btn outline small" id="tt-freebies-back">BACK</button>
                </div>
                <div class="tt-freebies-detail-grid" id="tt-freebies-detail-grid"></div>`;

                const detailGrid = detail.querySelector('#tt-freebies-detail-grid');
                const detailTitle = detail.querySelector('#tt-freebies-detail-title');
                const detailKicker = detail.querySelector('#tt-freebies-detail-kicker');

                const renderDetail = (key) => {
                    detailGrid.replaceChildren();

                    if (key === 'christmas') {
                        detailKicker.textContent = 'FREEBIES / CHRISTMAS SPECIAL';
                        detailTitle.textContent = 'CHRISTMAS SPECIAL.';
                        if (christmasCard) detailGrid.append(christmasCard);
                        else detailGrid.innerHTML = '<div class="tt-freebies-empty"><p class="body-text">Sambutlah Dia (Symphony Worship) is not available in the current catalogue data.</p></div>';
                        return;
                    }

                    if (key === 'multitrack') {
                        detailKicker.textContent = 'FREEBIES / MULTITRACK COLLECTION';
                        detailTitle.textContent = 'FREE MULTITRACK.';
                        multitrackCards.forEach(card => detailGrid.append(card));
                        return;
                    }

                    detailKicker.textContent = 'FREEBIES / TOOLKIT';
                    detailTitle.textContent = 'FREE TOOLKIT.';
                    detailGrid.innerHTML = '<div class="tt-freebies-empty"><p class="body-text">Free Toolkit assets will appear here.</p></div>';
                };

                const scrollToElementTop = (element, duration = 0.7) => {
                    if (!element) return Promise.resolve();
                    const target = Math.max(0, Math.round(window.scrollY + element.getBoundingClientRect().top));
                    if (window.gsap) {
                        return new Promise(resolve => {
                            window.gsap.to(window, {
                                duration,
                                scrollTo: { y: target, autoKill: false },
                                ease: 'power3.inOut',
                                overwrite: true,
                                onComplete: resolve
                            });
                        });
                    }
                    window.scrollTo({ top: target, behavior: 'smooth' });
                    return new Promise(resolve => setTimeout(resolve, duration * 1000));
                };

                const sectionTop = () => {
                    const section = document.getElementById('freebies');
                    return section ? Math.max(0, Math.round(window.scrollY + section.getBoundingClientRect().top)) : 0;
                };

                const openDetail = async (key) => {
                    if (detail.classList.contains('is-open') || detail.classList.contains('is-opening')) return;
                    detail.classList.add('is-opening');
                    categories.setAttribute('aria-hidden', 'true');

                    renderDetail(key);

                    /* Detail is an overlay at TOP:0 while the category stack still owns layout.
                       This is the critical fix for the old "teleport downward then back up". */
                    detail.hidden = false;
                    detail.classList.add('is-open', 'is-overlay');
                    detail.style.display = 'block';

                    const cards = [...categories.querySelectorAll('.tt-freebie-category-card')];

                    if (gsap) {
                        gsap.killTweensOf([categories, ...cards, detail]);

                        gsap.set(detail, {
                            autoAlpha: 0,
                            y: 18,
                            scale: .985,
                            filter: 'blur(10px)'
                        });
                        gsap.set(cards, {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            filter: 'blur(0px)'
                        });

                        const tl = gsap.timeline({
                            defaults: { overwrite: 'auto' },
                            onComplete: () => {
                                /* Collapse the old category stack only after the detail is already
                                   fully visible. Both occupy the exact same top coordinate. */
                                categories.style.position = 'absolute';
                                categories.style.top = '0';
                                categories.style.left = '0';
                                categories.style.right = '0';
                                categories.style.width = '100%';
                                categories.style.pointerEvents = 'none';
                                categories.hidden = true;
                                categories.style.display = 'none';

                                detail.classList.remove('is-overlay');
                                detail.classList.add('is-ready');
                                detail.style.display = 'block';

                                gsap.set(detail, {
                                    clearProps: 'transform,filter',
                                    autoAlpha: 1
                                });

                                /* Keep the viewport anchored; switching overlay -> normal flow
                                   must not create a scroll jump. */
                                window.scrollTo({ top: targetTop, behavior: 'auto' });
                                detail.classList.remove('is-opening');
                            }
                        });

                        tl.to(cards, {
                            duration: .55,
                            y: -24,
                            scale: .985,
                            filter: 'blur(7px)',
                            autoAlpha: 0,
                            stagger: .035,
                            ease: 'power3.in'
                        }, 0)
                            .to(detail, {
                                duration: .78,
                                autoAlpha: 1,
                                y: 0,
                                scale: 1,
                                filter: 'blur(0px)',
                                ease: 'expo.out'
                            }, .06)
                            .fromTo(
                                detail.querySelector('.tt-freebies-detail-head'),
                                { autoAlpha: 0, y: 14 },
                                { duration: .42, autoAlpha: 1, y: 0, ease: 'power3.out' },
                                .20
                            )
                            .fromTo(
                                detail.querySelector('.tt-freebies-detail-grid'),
                                { autoAlpha: 0, y: 18 },
                                { duration: .56, autoAlpha: 1, y: 0, ease: 'power3.out' },
                                .28
                            );

                        return;
                    }

                    /* No-GSAP fallback: same layout rule, no lower-position render. */
                    categories.style.opacity = '0';
                    categories.style.visibility = 'hidden';
                    categories.style.position = 'absolute';
                    categories.style.top = '0';
                    categories.style.left = '0';
                    categories.style.right = '0';
                    categories.style.width = '100%';
                    categories.hidden = true;
                    categories.style.display = 'none';

                    detail.classList.remove('is-overlay');
                    detail.classList.add('is-ready');
                    detail.style.opacity = '1';
                    detail.classList.remove('is-opening');
                    window.scrollTo({ top: targetTop, behavior: 'auto' });
                };

                const closeDetail = async () => {
                    if (!detail.classList.contains('is-open')) return;

                    const gsap = window.gsap;
                    const targetTop = sectionTop();
                    const cards = [...categories.querySelectorAll('.tt-freebie-category-card')];

                    if (gsap && window.ScrollToPlugin) {
                        await new Promise(resolve => {
                            gsap.to(window, {
                                duration: .32,
                                scrollTo: { y: targetTop, autoKill: false },
                                ease: 'power3.out',
                                overwrite: true,
                                onComplete: resolve
                            });
                        });
                    } else {
                        window.scrollTo({ top: targetTop, behavior: 'auto' });
                    }

                    if (!gsap) {
                        detail.classList.remove('is-open', 'is-ready', 'is-overlay', 'is-entering', 'is-leaving', 'is-opening');
                        detail.style.display = 'none';
                        detail.hidden = true;
                        detailGrid.replaceChildren();

                        categories.hidden = false;
                        categories.style.display = '';
                        categories.style.position = 'relative';
                        categories.style.top = '';
                        categories.style.left = '';
                        categories.style.right = '';
                        categories.style.width = '';
                        categories.style.pointerEvents = '';
                        categories.removeAttribute('aria-hidden');
                        categories.style.opacity = '1';
                        categories.style.visibility = 'visible';
                        return;
                    }

                    gsap.killTweensOf([categories, ...cards, detail]);

                    /* Keep detail at the same top coordinate while it exits. */
                    detail.classList.remove('is-ready');
                    detail.classList.add('is-overlay');
                    detail.style.display = 'block';

                    categories.hidden = false;
                    categories.style.display = '';
                    categories.style.position = 'absolute';
                    categories.style.top = '0';
                    categories.style.left = '0';
                    categories.style.right = '0';
                    categories.style.width = '100%';
                    categories.style.pointerEvents = 'none';

                    gsap.set(categories, { autoAlpha: 1 });
                    gsap.set(cards, {
                        autoAlpha: 0,
                        y: 18,
                        scale: .985,
                        filter: 'blur(7px)'
                    });

                    const tl = gsap.timeline({
                        defaults: { overwrite: 'auto' },
                        onComplete: () => {
                            detail.classList.remove('is-open', 'is-overlay', 'is-entering', 'is-leaving', 'is-opening');
                            detail.style.display = 'none';
                            detail.hidden = true;
                            detailGrid.replaceChildren();

                            categories.hidden = false;
                            categories.style.display = '';
                            categories.style.position = 'relative';
                            categories.style.top = '';
                            categories.style.left = '';
                            categories.style.right = '';
                            categories.style.width = '';
                            categories.style.pointerEvents = '';
                            categories.removeAttribute('aria-hidden');

                            gsap.set(categories, {
                                clearProps: 'transform,filter,opacity,visibility'
                            });
                            gsap.set(cards, {
                                clearProps: 'transform,filter,opacity,visibility'
                            });

                            window.scrollTo({ top: targetTop, behavior: 'auto' });
                        }
                    });

                    tl.to(detail, {
                        duration: .44,
                        autoAlpha: 0,
                        y: -14,
                        scale: .99,
                        filter: 'blur(8px)',
                        ease: 'power3.in'
                    }, 0)
                        .to(cards, {
                            duration: .62,
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            filter: 'blur(0px)',
                            stagger: .045,
                            ease: 'expo.out'
                        }, .16);
                };

                categories.querySelectorAll('.tt-freebie-category-card').forEach(card => {
                    const activate = () => openDetail(card.dataset.freebieCategory);
                    card.addEventListener('click', activate);
                    card.addEventListener('keydown', event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            activate();
                        }
                    });
                });
                detail.querySelector('#tt-freebies-back')?.addEventListener('click', closeDetail);

                grid.replaceChildren(categories, detail);
                grid.dataset.categoriesReady = 'true';
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initFreebiesCategories, { once: true });
            } else {
                initFreebiesCategories();
            }
        })();
