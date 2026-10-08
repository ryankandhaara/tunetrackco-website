
            /* =====================================================
            LOCOMOTIVE SCROLL
            ===================================================== */

            const locomotiveScroll =
                new LocomotiveScroll({
                    el: document.querySelector("[data-scroll-container]"),
                    smooth: true,
                    lerp: 0.08,
                    smartphone: {
                        smooth: true
                    },
                    tablet: {
                        smooth: true
                    }
                });


            /* =====================================================
            ELEMENTS
            ===================================================== */

            const header =
                document.getElementById("tnco-header");

            const intro =
                document.getElementById("worksIntro");

            const searchButton =
                document.getElementById("searchButton");

            const worksList =
                document.getElementById("worksList");

            /*
            * Locomotive transforms the scroll container. Since the search pill
            * must stay locked to the browser viewport, keep it outside the
            * transformed body element.
            */
            document.documentElement.appendChild(searchButton);

            const workItems =
                [...document.querySelectorAll(".work-item")];


            /* =====================================================
            SCROLL STATE
            ===================================================== */

            let ticking = false;


            function updateScrollState(scrollPosition) {

                const scrollY =
                    typeof scrollPosition === "number"
                        ? scrollPosition
                        : window.scrollY;


                /*
                * HERO
                */

                if (scrollY <= 5) {

                    intro.classList.add("is-top");
                    intro.classList.remove("is-scrolling");

                } else {

                    intro.classList.remove("is-top");
                    intro.classList.add("is-scrolling");

                }


                /*
                * HEADER
                */

                if (scrollY > 10) {

                    header.classList.add("hidden");

                } else {

                    header.classList.remove("hidden");

                }


                /*
                * SEARCH
                *
                * Reveal immediately after roughly 3% of the works scroll
                * distance has been passed. This keeps the pill out
                * of the hero and gives it a soft blur/fade entrance.
                */

                const worksTop = worksList.offsetTop;
                const worksHeight = worksList.offsetHeight;
                const worksScrollDistance = Math.max(1, worksHeight - window.innerHeight);
                const worksProgress = (scrollY - worksTop) / worksScrollDistance;
                const footer = document.getElementById("tncoFooter");
                const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
                const footerHasStarted = footerTop <= window.innerHeight * 0.98;
                const shouldRevealSearch = worksProgress >= 0.03 && !footerHasStarted;

                if (footerHasStarted) {
                    searchButton.classList.add("footer-hidden");
                    searchButton.classList.remove("visible", "search-enter", "is-searching");
                } else if (shouldRevealSearch) {
                    searchButton.classList.remove("footer-hidden");
                    if (!searchButton.classList.contains("visible")) {
                        searchButton.classList.add("visible", "search-enter");
                        window.setTimeout(() => {
                            searchButton.classList.remove("search-enter");
                        }, 950);
                    }
                } else {
                    searchButton.classList.remove("footer-hidden");
                    searchButton.classList.remove("visible", "search-enter");
                    searchButton.classList.remove("is-searching");
                }


                /*
                * 3D WHEEL
                */

                updateWheel();


                ticking = false;

            }


            window.addEventListener(
                "scroll",
                () => {

                    if (!ticking) {

                        window.requestAnimationFrame(
                            updateScrollState
                        );

                        ticking = true;

                    }

                },
                {
                    passive: true
                }
            );


            locomotiveScroll.on("scroll", (args) => {

                updateScrollState(args.scroll.y);

            });


            /* =====================================================
            3D WHEEL EFFECT
            ===================================================== */

            function updateWheel() {

                const viewportCenter =
                    window.innerHeight / 2;


                workItems.forEach((item) => {

                    const rect =
                        item.getBoundingClientRect();


                    const itemCenter =
                        rect.top + rect.height / 2;


                    const distance =
                        itemCenter - viewportCenter;


                    const normalized =
                        Math.max(
                            -1,
                            Math.min(
                                1,
                                distance /
                                (window.innerHeight * 0.48)
                            )
                        );


                    const rotateX =
                        normalized * -24;


                    const translateZ =
                        (1 - Math.abs(normalized)) * 20;


                    const scale =
                        1 - Math.abs(normalized) * 0.10;


                    item.style.transform =
                        `perspective(1200px)
                        rotateX(${rotateX}deg)
                        translateZ(${translateZ}px)
                        scale(${scale})`;

                });

            }



            /* =====================================================
            EMOJI ROTATION
            ===================================================== */

            const emojiElements =
                [...document.querySelectorAll(".works-emoji")];


            const emojis = [

                "😎",
                "🥶",
                "😍",
                "🎹",
                "🥁"

            ];


            let emojiIndex = 0;


            setInterval(() => {


                emojiElements.forEach((emoji) => {

                    emoji.style.transform =
                        "rotate(360deg)";

                });


                setTimeout(() => {


                    emojiIndex =
                        (emojiIndex + 1) %
                        emojis.length;


                    emojiElements.forEach((emoji) => {

                        emoji.textContent =
                            emojis[emojiIndex];

                        emoji.style.transform =
                            "rotate(0deg)";

                    });


                }, 650);


            }, 2000);



            /* =====================================================
            LOCAL SEARCH LOGIC
            ===================================================== */

            /*
            * Build the index from the ORIGINAL work items, not only the title
            * link. This keeps every real piece of searchable text/metadata in
            * the product card available to the local search.
            */
            const localSearchData =
                [...document.querySelectorAll(".work-item")].map((work, index) => {
                    const link = work.querySelector("a");
                    const title = link
                        ? link.textContent.replace(/\s+/g, " ").trim()
                        : work.textContent.replace(/\s+/g, " ").trim();

                    const attributes = [...work.attributes]
                        .map(attr => `${attr.name} ${attr.value}`)
                        .join(" ");

                    const childAttributes = [...work.querySelectorAll("*")]
                        .flatMap(el => [...el.attributes].map(attr => `${attr.name} ${attr.value}`))
                        .join(" ");

                    const href = link ? (link.getAttribute("href") || "") : "";

                    const searchableText = [
                        title,
                        work.textContent.replace(/\s+/g, " ").trim(),
                        href,
                        attributes,
                        childAttributes
                    ].join(" ");

                    return {
                        index,
                        work,
                        link,
                        title,
                        href: link ? (link.getAttribute("href") || "#") : "#",
                        searchableText
                    };
                });

            const localSearchItems =
                localSearchData.map(item => item.link || item.work);

            function normalizeSearchText(value = "") {
                return String(value ?? "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
            }

            function getMeaningfulSearchTerms(value = "") {
                const raw = String(value ?? "").trim();
                const normalized = normalizeSearchText(raw);

                // A query made only of punctuation/symbols must never match.
                if (!normalized || !/[a-z0-9]/i.test(raw)) {
                    return [];
                }

                return normalized
                    .split(" ")
                    .filter(term => /[a-z0-9]/i.test(term));
            }

            let localSearchValue = "";

            function getSearchElements() {
                return {
                    overlay: document.getElementById("localSearchOverlay"),
                    input: document.getElementById("localSearchInput"),
                    results: document.getElementById("localSearchResults"),
                    animated: document.getElementById("localSearchAnimatedText"),
                    prompt: document.getElementById("localSearchPrompt")
                };
            }

            function ensureSearchOverlayViewport() {
                const overlay =
                    document.getElementById("localSearchOverlay");

                if (overlay && overlay.parentElement !== document.documentElement) {
                    document.documentElement.appendChild(overlay);
                }

                return overlay;
            }

            function escapeSearchHTML(value) {
                return value
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
            }

            function renderLocalSearch(query = "") {

                const { results, overlay } =
                    getSearchElements();

                if (!results || !overlay) return;

                const normalizedQuery =
                    normalizeSearchText(query);

                const queryTerms =
                    getMeaningfulSearchTerms(query);

                const matches =
                    queryTerms.length
                        ? localSearchData.filter((item) => {
                            const haystack = normalizeSearchText(item.searchableText);
                            return queryTerms.every(term => haystack.includes(term));
                        })
                        : [];

                overlay.classList.toggle(
                    "has-query",
                    Boolean(queryTerms.length)
                );

                if (!queryTerms.length) {
                    results.innerHTML = "";
                    return;
                }

                if (!matches.length) {
                    results.innerHTML =
                        '<div class="tnco-local-search-empty">No works found.</div>';
                    return;
                }

                results.innerHTML =
                    matches.map((item) => `
                        <button
                            class="tnco-local-search-result"
                            type="button"
                            data-search-index="${item.index}">
                            ${escapeSearchHTML(item.title)}
                        </button>
                    `).join("");
            }

            function createSearchChar(char, index) {

                const span =
                    document.createElement("span");

                span.className =
                    "tnco-search-char";

                span.textContent =
                    char === " " ? "\u00A0" : char;

                const x =
                    ((index % 5) - 2) * 18;

                const y =
                    index % 2 === 0
                        ? 34 + (index % 3) * 8
                        : -28 - (index % 3) * 7;

                const r =
                    index % 2 === 0
                        ? (index % 3 + 1) * 1.8
                        : -(index % 3 + 1) * 1.6;

                span.style.setProperty(
                    "--char-x",
                    `${x}px`
                );

                span.style.setProperty(
                    "--char-y",
                    `${y}px`
                );

                span.style.setProperty(
                    "--char-r",
                    `${r}deg`
                );

                span.style.animationDelay =
                    `${Math.min(index * 32, 420)}ms`;

                return span;
            }

            function animateSearchText(value) {

                const { animated } =
                    getSearchElements();

                if (!animated) return;

                const chars =
                    [...value];

                const existing =
                    [...animated.children];

                const shared =
                    Math.min(existing.length, chars.length);

                for (let i = 0; i < shared; i++) {
                    if (existing[i].textContent !==
                        (chars[i] === " " ? "\u00A0" : chars[i])) {

                        existing[i].replaceWith(
                            createSearchChar(chars[i], i)
                        );
                    }
                }

                while (animated.children.length > chars.length) {
                    animated.lastElementChild.remove();
                }

                for (let i = shared; i < chars.length; i++) {
                    animated.appendChild(
                        createSearchChar(chars[i], i)
                    );
                }
            }

            function openLocalSearch() {

                const overlay =
                    ensureSearchOverlayViewport();

                if (!overlay) return;

                const { input, animated } =
                    getSearchElements();

                searchButton.classList.add(
                    "is-searching"
                );

                overlay.classList.add("is-open");
                overlay.setAttribute(
                    "aria-hidden",
                    "false"
                );

                document.body.classList.add(
                    "tnco-search-open"
                );

                localSearchValue = "";

                if (input) {
                    input.value = "";
                }

                if (animated) {
                    animated.innerHTML = "";
                }

                renderLocalSearch("");

                requestAnimationFrame(() => {
                    if (input) input.focus();
                });
            }

            function closeLocalSearch() {

                const { overlay, input, animated } =
                    getSearchElements();

                if (!overlay) return;

                overlay.classList.remove("is-open");
                overlay.classList.remove("has-query");
                overlay.setAttribute(
                    "aria-hidden",
                    "true"
                );

                document.body.classList.remove(
                    "tnco-search-open"
                );

                searchButton.classList.remove(
                    "is-searching"
                );

                localSearchValue = "";

                if (input) {
                    input.value = "";
                }

                if (animated) {
                    animated.innerHTML = "";
                }

                renderLocalSearch("");
            }

            document.addEventListener("click", (event) => {

                const trigger =
                    event.target.closest("#searchButton");

                if (trigger) {
                    event.preventDefault();
                    openLocalSearch();
                    return;
                }

                if (
                    event.target.closest("#localSearchClose")
                ) {
                    event.preventDefault();
                    closeLocalSearch();
                    return;
                }

                const overlay =
                    document.getElementById(
                        "localSearchOverlay"
                    );

                if (
                    overlay &&
                    event.target === overlay
                ) {
                    closeLocalSearch();
                }
            });

            function goToLocalSearchResult(index) {

                const item =
                    Number.isInteger(index) && index >= 0
                        ? localSearchData[index]
                        : null;

                if (!item || !item.work) return;

                const work = item.work;

                closeLocalSearch();

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (typeof locomotiveScroll !== "undefined" && locomotiveScroll) {
                            locomotiveScroll.scrollTo(work, {
                                offset: -window.innerHeight * 0.22,
                                duration: 1100,
                                disableLerp: false,
                                callback: () => highlightLocalSearchTarget(work)
                            });
                        } else {
                            work.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                                inline: "nearest"
                            });
                            window.setTimeout(() => highlightLocalSearchTarget(work), 650);
                        }
                    });
                });
            }

            let tncoSearchAnnotation = null;
            let tncoSearchAnnotationTimer = null;
            let tncoSearchAnnotationDelay = null;

            function clearSearchAnnotation() {
                if (tncoSearchAnnotationDelay) {
                    window.clearTimeout(tncoSearchAnnotationDelay);
                    tncoSearchAnnotationDelay = null;
                }

                if (tncoSearchAnnotationTimer) {
                    window.clearTimeout(tncoSearchAnnotationTimer);
                    tncoSearchAnnotationTimer = null;
                }

                if (tncoSearchAnnotation) {
                    const annotation = tncoSearchAnnotation;
                    const target = annotation.element;
                    const svg = target && target.parentElement
                        ? target.parentElement.querySelector(".rough-annotation")
                        : null;
                    const paths = svg ? Array.from(svg.querySelectorAll("path")) : [];

                    paths.forEach((path) => {
                        const length = path.getTotalLength
                            ? path.getTotalLength()
                            : 1000;

                        path.style.strokeDasharray = length + " " + length;
                        path.style.strokeDashoffset = "0";
                        path.style.transition =
                            "stroke-dashoffset 350ms cubic-bezier(.65,0,.35,1)";

                        requestAnimationFrame(() => {
                            path.style.strokeDashoffset =
                                path.getTotalLength ? path.getTotalLength() : 1000;
                        });
                    });

                    window.setTimeout(() => {
                        annotation.remove();
                    }, 380);

                    tncoSearchAnnotation = null;
                }

                document
                    .querySelectorAll(".tnco-search-target-hit")
                    .forEach((el) => el.classList.remove("tnco-search-target-hit"));
            }

            function highlightLocalSearchTarget(work) {
                clearSearchAnnotation();

                if (!work || !window.RoughNotation) return;

                const target = work.querySelector("a");
                if (!target) return;

                work.classList.remove("tnco-search-target-hit");
                void work.offsetWidth;
                work.classList.add("tnco-search-target-hit");

                // Give Locomotive's final position a moment to settle,
                // then draw the annotation naturally.
                tncoSearchAnnotationDelay = window.setTimeout(() => {
                    tncoSearchAnnotationDelay = null;

                    if (!document.body.contains(target)) return;

                    tncoSearchAnnotation = RoughNotation.annotate(target, {
                        type: "circle",
                        color: "#ffffff",
                        strokeWidth: 2,
                        padding: [8, 14],
                        animationDuration: 950,
                        iterations: 4,
                        roughness: 1.35,
                        bowing: 1.8,
                        multiline: false
                    });

                    tncoSearchAnnotation.show();

                    // Hold the finished drawing, then erase it by reversing
                    // the same SVG strokes instead of simply hiding the circle.
                    tncoSearchAnnotationTimer = window.setTimeout(() => {
                        const annotation = tncoSearchAnnotation;
                        if (!annotation) return;

                        const svg = target.parentElement &&
                            target.parentElement.querySelector(".rough-annotation");

                        const paths = svg
                            ? Array.from(svg.querySelectorAll("path"))
                            : [];

                        paths.forEach((path) => {
                            const length = path.getTotalLength
                                ? path.getTotalLength()
                                : 1000;

                            path.style.strokeDasharray = length + " " + length;
                            path.style.strokeDashoffset = "0";
                            path.style.transition =
                                "stroke-dashoffset 650ms cubic-bezier(.65,0,.35,1)";
                        });

                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                paths.forEach((path) => {
                                    path.style.strokeDashoffset =
                                        path.getTotalLength
                                            ? path.getTotalLength()
                                            : 1000;
                                });
                            });
                        });

                        window.setTimeout(() => {
                            if (tncoSearchAnnotation === annotation) {
                                annotation.remove();
                                tncoSearchAnnotation = null;
                            }

                            work.classList.remove("tnco-search-target-hit");
                        }, 720);

                        tncoSearchAnnotationTimer = null;
                    }, 3000);
                }, 500);
            }

            document.addEventListener("click", (event) => {

                const clickedSearchTarget =
                    event.target.closest(".tnco-search-target-hit > a");

                if (clickedSearchTarget) {
                    clearSearchAnnotation();
                    return;
                }

                const result =
                    event.target.closest(".tnco-local-search-result");

                if (!result) return;

                event.preventDefault();

                const index =
                    Number(result.getAttribute("data-search-index"));

                if (Number.isInteger(index) && index >= 0) {
                    goToLocalSearchResult(index);
                }
            });


            document.addEventListener("keydown", (event) => {

                const input = event.target && event.target.closest("#localSearchInput");
                const overlay = document.getElementById("localSearchOverlay");

                if (event.key === "Enter" && input && overlay && overlay.classList.contains("is-open")) {
                    event.preventDefault();

                    const query = normalizeSearchText(input.value);
                    if (!query) return;

                    const exactIndex = localSearchData.findIndex((item) =>
                        normalizeSearchText(item.title) === query
                    );

                    const terms = query.split(" ").filter(Boolean);
                    const partialIndex = localSearchData.findIndex((item) => {
                        const haystack = normalizeSearchText(item.searchableText);
                        return terms.every(term => haystack.includes(term));
                    });

                    goToLocalSearchResult(exactIndex >= 0 ? exactIndex : partialIndex);
                    return;
                }

                if (event.key === "Escape") {

                    if (
                        overlay &&
                        overlay.classList.contains("is-open")
                    ) {
                        closeLocalSearch();
                    }

                    return;
                }

                if (
                    (event.metaKey || event.ctrlKey) &&
                    event.key.toLowerCase() === "k"
                ) {
                    event.preventDefault();
                    openLocalSearch();
                }
            });


            document.addEventListener("input", (event) => {

                if (
                    event.target &&
                    event.target.id === "localSearchInput"
                ) {
                    localSearchValue =
                        event.target.value;

                    animateSearchText(
                        localSearchValue
                    );

                    renderLocalSearch(
                        localSearchValue
                    );
                }
            });

            /* =====================================================
            INITIAL
            ===================================================== */

            updateScrollState(0);

    (function () {
        const hero = document.querySelector('.tnco-hero-media');
        const mediaItems = Array.from(document.querySelectorAll('.tnco-hero-media-item'));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!hero || !mediaItems.length) return;

        const particleLayer = document.createElement('div');
        particleLayer.className = 'tnco-hero-particles';
        hero.appendChild(particleLayer);

        const state = mediaItems.map((el, index) => ({
            el,
            index,
            x: 0, y: 0,
            vx: 0, vy: 0,
            targetX: 0, targetY: 0,
            w: 0, h: 0,
            homeX: 0, homeY: 0,
            dragging: false,
            pointerId: null,
            lastX: 0, lastY: 0,
            moved: false,
            lastImpact: 0,
            impactUntil: 0,
            impactStrength: 0,
            wanderPhase: Math.random() * Math.PI * 2,
            wanderSpeed: 0.18 + Math.random() * 0.18,
            driftX: (Math.random() - 0.5) * 0.055,
            driftY: (Math.random() - 0.5) * 0.045
        }));

        let zCounter = 10;
        let raf = 0;
        let lastFrame = performance.now();

        function measure() {
            const heroRect = hero.getBoundingClientRect();
            state.forEach(s => {
                const r = s.el.getBoundingClientRect();
                const oldW = s.w || r.width;
                const oldH = s.h || r.height;
                s.w = r.width;
                s.h = r.height;
                if (!s.homeSet) {
                    s.homeX = r.left - heroRect.left;
                    s.homeY = r.top - heroRect.top;
                    s.homeSet = true;
                } else if (oldW && oldH) {
                    const sx = s.w / oldW;
                    const sy = s.h / oldH;
                    s.x *= sx;
                    s.y *= sy;
                }
            });
            keepInsideAll();
        }

        function bounds(s) {
            const hr = hero.getBoundingClientRect();
            const pad = Math.max(8, Math.min(24, hr.width * 0.012));
            const minX = pad - s.homeX;
            const minY = pad - s.homeY;
            const maxX = hr.width - pad - s.w - s.homeX;
            const maxY = hr.height - pad - s.h - s.homeY;
            return { minX, minY, maxX: Math.max(minX, maxX), maxY: Math.max(minY, maxY) };
        }

        function keepInside(s) {
            const b = bounds(s);
            const bounce = 0.055;

            /* DVD-style wall bounce: force a new direction instead of allowing an edge stall. */
            if (s.x <= b.minX) {
                s.x = b.minX;
                if (!s.dragging && s.vx <= 0) {
                    s.vx = Math.max(Math.abs(s.vx) * .92, bounce);
                    s.vy += (Math.random() - .5) * .006;
                }
            } else if (s.x >= b.maxX) {
                s.x = b.maxX;
                if (!s.dragging && s.vx >= 0) {
                    s.vx = -Math.max(Math.abs(s.vx) * .92, bounce);
                    s.vy += (Math.random() - .5) * .006;
                }
            }

            if (s.y <= b.minY) {
                s.y = b.minY;
                if (!s.dragging && s.vy <= 0) {
                    s.vy = Math.max(Math.abs(s.vy) * .92, bounce);
                    s.vx += (Math.random() - .5) * .006;
                }
            } else if (s.y >= b.maxY) {
                s.y = b.maxY;
                if (!s.dragging && s.vy >= 0) {
                    s.vy = -Math.max(Math.abs(s.vy) * .92, bounce);
                    s.vx += (Math.random() - .5) * .006;
                }
            }
        }

        function keepInsideAll() { state.forEach(keepInside); }

        function center(s) {
            return { x: s.homeX + s.x + s.w / 2, y: s.homeY + s.y + s.h / 2 };
        }

        function impactParticles(x, y, nx, ny, amount = 7) {
            if (reduceMotion) return;
            const hr = hero.getBoundingClientRect();
            const px = x - hr.left;
            const py = y - hr.top;
            for (let i = 0; i < amount; i++) {
                const p = document.createElement('i');
                p.className = 'tnco-hero-particle';
                const angle = Math.atan2(ny, nx) + (Math.random() - .5) * 1.7;
                const speed = 16 + Math.random() * 32;
                p.style.left = px + 'px';
                p.style.top = py + 'px';
                p.style.setProperty('--size', (2 + Math.random() * 4).toFixed(1) + 'px');
                p.style.setProperty('--tx', (Math.cos(angle) * speed).toFixed(1) + 'px');
                p.style.setProperty('--ty', (Math.sin(angle) * speed).toFixed(1) + 'px');
                p.style.setProperty('--life', (430 + Math.random() * 360).toFixed(0) + 'ms');
                particleLayer.appendChild(p);
                p.addEventListener('animationend', () => p.remove(), { once: true });
            }
        }

        function collide(a, b, now) {
            const ac = center(a), bc = center(b);
            const dx = bc.x - ac.x;
            const dy = bc.y - ac.y;
            const halfW = (a.w + b.w) * .5;
            const halfH = (a.h + b.h) * .5;
            const ox = halfW - Math.abs(dx);
            const oy = halfH - Math.abs(dy);
            if (ox <= 0 || oy <= 0) return;

            let nx = 0, ny = 0, depth;
            if (ox < oy) {
                nx = dx >= 0 ? 1 : -1;
                depth = ox;
            } else {
                ny = dy >= 0 ? 1 : -1;
                depth = oy;
            }

            const push = depth * .56 + 0.35;
            if (!a.dragging) {
                a.x -= nx * push;
                a.y -= ny * push;
            }
            if (!b.dragging) {
                b.x += nx * push;
                b.y += ny * push;
            }

            const impulse = 0.42 + Math.min(1.1, depth / 30);
            if (!a.dragging) { a.vx -= nx * impulse; a.vy -= ny * impulse; }
            if (!b.dragging) { b.vx += nx * impulse; b.vy += ny * impulse; }

            if (now - Math.max(a.lastImpact, b.lastImpact) > 120) {
                const p = { x: ac.x + (bc.x - ac.x) * .5, y: ac.y + (bc.y - ac.y) * .5 };
                const hr = hero.getBoundingClientRect();
                impactParticles(hr.left + p.x, hr.top + p.y, nx, ny, 8);
                a.lastImpact = b.lastImpact = now;
                a.impactUntil = b.impactUntil = now + 190;
                a.impactStrength = b.impactStrength = Math.min(1, .45 + depth / 80);
            }
        }

        function applyTransform(s) {
            const speed = Math.hypot(s.vx, s.vy);
            const tilt = Math.max(-3.2, Math.min(3.2, s.vx * .42));
            const impactT = Math.max(0, Math.min(1, (s.impactUntil - performance.now()) / 190));
            const impact = impactT * s.impactStrength;
            const scale = s.dragging ? 1.025 : 1 + Math.min(.012, speed * .002) + impact * .018;
            s.el.style.setProperty('--drag-x', s.x.toFixed(2) + 'px');
            s.el.style.setProperty('--drag-y', s.y.toFixed(2) + 'px');
            s.el.style.setProperty('--drag-r', tilt.toFixed(2) + 'deg');
            s.el.style.setProperty('--drag-s', scale.toFixed(4));
        }

        function tick(now) {
            const dt = Math.min(2, (now - lastFrame) / 16.6667);
            lastFrame = now;

            state.forEach(s => {
                if (!s.dragging) {
                    /* Slow ambient drift keeps every placeholder alive even when untouched. */
                    s.wanderPhase += 0.005 * s.wanderSpeed * dt;
                    const wanderX = Math.cos(s.wanderPhase * 1.13) * 0.008;
                    const wanderY = Math.sin(s.wanderPhase * 0.91 + s.index) * 0.007;
                    s.vx += (s.driftX + wanderX) * dt;
                    s.vy += (s.driftY + wanderY) * dt;

                    /* Very soft damping: momentum remains visible instead of snapping dead. */
                    s.vx *= Math.pow(.985, dt);
                    s.vy *= Math.pow(.985, dt);

                    const maxIdleSpeed = 0.18;
                    const idleSpeed = Math.hypot(s.vx, s.vy);
                    if (idleSpeed > maxIdleSpeed) {
                        const scale = maxIdleSpeed / idleSpeed;
                        s.vx *= scale;
                        s.vy *= scale;
                    }

                    s.x += s.vx * dt * 1.15;
                    s.y += s.vy * dt * 1.15;

                    // No snap-back: after being moved or hit, the image stays where it landed.
                }
                keepInside(s);
            });

            for (let i = 0; i < state.length; i++) {
                for (let j = i + 1; j < state.length; j++) collide(state[i], state[j], now);
            }

            state.forEach(applyTransform);
            raf = requestAnimationFrame(tick);
        }

        function wake() {
            if (!raf) {
                lastFrame = performance.now();
                raf = requestAnimationFrame(tick);
            }
        }

        state.forEach(s => {
            s.el.addEventListener('pointerdown', (event) => {
                if (event.button !== undefined && event.button !== 0) return;
                event.preventDefault();
                s.dragging = true;
                s.pointerId = event.pointerId;
                s.moved = false;
                s.lastX = event.clientX;
                s.lastY = event.clientY;
                s.vx = 0;
                s.vy = 0;
                s.el.style.zIndex = String(++zCounter);
                s.el.classList.add('is-dragging');
                try { s.el.setPointerCapture(event.pointerId); } catch (_) {}
                wake();
            }, { passive: false });

            s.el.addEventListener('pointermove', (event) => {
                if (!s.dragging || event.pointerId !== s.pointerId) return;
                event.preventDefault();
                const dx = event.clientX - s.lastX;
                const dy = event.clientY - s.lastY;
                if (Math.abs(dx) + Math.abs(dy) > 2) s.moved = true;
                s.x += dx;
                s.y += dy;
                s.vx = dx * .72;
                s.vy = dy * .72;
                s.lastX = event.clientX;
                s.lastY = event.clientY;
                keepInside(s);
                wake();
            }, { passive: false });

            const release = (event) => {
                if (!s.dragging || (event.pointerId != null && event.pointerId !== s.pointerId)) return;
                s.dragging = false;
                s.el.classList.remove('is-dragging');
                try { s.el.releasePointerCapture(s.pointerId); } catch (_) {}
                // A simple click gives the image a tiny tactile nudge toward the pointer.
                if (!s.moved) {
                    const rect = s.el.getBoundingClientRect();
                    const px = (event.clientX - rect.left) / rect.width - .5;
                    const py = (event.clientY - rect.top) / rect.height - .5;
                    s.vx += px * 3.4;
                    s.vy += py * 3.4;
                }
                s.pointerId = null;
                wake();
            };

            s.el.addEventListener('pointerup', release, { passive: false });
            s.el.addEventListener('pointercancel', release, { passive: false });
            s.el.addEventListener('lostpointercapture', () => {
                if (s.dragging) {
                    s.dragging = false;
                    s.el.classList.remove('is-dragging');
                    s.pointerId = null;
                }
            });
        });

        document.querySelectorAll('.works-emoji').forEach((emoji) => {
            const value = emoji.textContent.trim();
            emoji.classList.remove('glow-dark', 'glow-blue', 'glow-pink', 'glow-gold', 'glow-red');
            if (value === '🥶' || value === '🎹') emoji.classList.add('glow-blue');
            else if (value === '😍') emoji.classList.add('glow-pink');
            else if (value === '🥁') emoji.classList.add('glow-red');
            else emoji.classList.add('glow-gold');
        });

        const seedIdleMotion = () => {
            state.forEach((s, i) => {
                const angle = (i * 2.399963) + Math.random() * 0.7;
                const speed = 0.025 + Math.random() * 0.045;
                s.vx = Math.cos(angle) * speed;
                s.vy = Math.sin(angle) * speed;
            });
        };

        const resize = () => {
            measure();
            state.forEach(applyTransform);
            wake();
        };

        window.addEventListener('resize', resize, { passive: true });
        window.addEventListener('orientationchange', resize, { passive: true });

        // Smooth localized liquid hover — subtle warm shift with a soft lag.
        const scrollMarquee = document.querySelector('.tnco-scroll-marquee');
        if (scrollMarquee) {
            let targetX = -500;
            let targetY = -500;
            let currentX = -500;
            let currentY = -500;
            let marqueeAnimating = true;

            const updateMarqueeGlow = (event) => {
                const rect = scrollMarquee.getBoundingClientRect();
                targetX = event.clientX - rect.left;
                targetY = event.clientY - rect.top;
                marqueeAnimating = true;
            };

            const clearMarqueeGlow = () => {
                targetX = -500;
                targetY = -500;
                marqueeAnimating = true;
            };

            const animateMarqueeGlow = () => {
                currentX += (targetX - currentX) * 0.045;
                currentY += (targetY - currentY) * 0.045;
                scrollMarquee.style.setProperty('--mx', `${currentX}px`);
                scrollMarquee.style.setProperty('--my', `${currentY}px`);
                if (marqueeAnimating || Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
                    requestAnimationFrame(animateMarqueeGlow);
                } else {
                    marqueeAnimating = false;
                }
            };

            scrollMarquee.addEventListener('pointermove', updateMarqueeGlow, { passive: true });
            scrollMarquee.addEventListener('pointerleave', clearMarqueeGlow, { passive: true });
            requestAnimationFrame(animateMarqueeGlow);
        }

        requestAnimationFrame(() => {
            measure();
            seedIdleMotion();
            state.forEach(applyTransform);
            wake();
        });
    })();

    /* V37 — reliable native MP4 playback for local file:// preview. */
    (function () {
        const videos = Array.from(document.querySelectorAll('.tnco-hero-media-item video'));
        if (videos.length !== 5) return;

        const wake = (video) => {
            video.autoplay = true;
            video.muted = true;
            video.defaultMuted = true;
            video.loop = true;
            video.playsInline = true;
            video.controls = false;
            video.removeAttribute('controls');
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
        };

        videos.forEach((video) => {
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('loop', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('preload', 'auto');
            video.removeAttribute('controls');

            video.addEventListener('loadedmetadata', () => wake(video));
            video.addEventListener('loadeddata', () => wake(video));
            video.addEventListener('canplay', () => wake(video));
            video.addEventListener('pause', () => {
                if (!document.hidden && !video.ended) wake(video);
            });
            video.addEventListener('ended', () => {
                try { video.currentTime = 0; } catch (_) {}
                wake(video);
            });
            video.addEventListener('error', () => {
                /* Never create a fake placeholder. Retry the same real MP4. */
                setTimeout(() => {
                    try { video.load(); wake(video); } catch (_) {}
                }, 900);
            });

            wake(video);
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) videos.forEach(wake);
        });
    })();

    /* V41 — five distinct primary visuals with the proven keyboard fallback. */
    (function () {
        const FALLBACK_VIDEO = "https://videos.pexels.com/video-files/7722817/7722817-hd_1920_1080_25fps.mp4";
        const videos = Array.from(document.querySelectorAll(".tnco-hero-media-item video"));

        function playVideo(video) {
            video.muted = true;
            video.defaultMuted = true;
            video.loop = true;
            video.playsInline = true;
            video.controls = false;
            const p = video.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
        }

        videos.forEach((video) => {
            let usingFallback = false;

            const useFallback = () => {
                if (usingFallback && video.src === FALLBACK_VIDEO) {
                    return;
                }
                usingFallback = true;
                video.pause();
                video.src = FALLBACK_VIDEO;
                video.load();
                playVideo(video);
            };

            video.addEventListener("error", useFallback);
            video.addEventListener("loadeddata", () => playVideo(video));
            video.addEventListener("canplay", () => playVideo(video));
            video.addEventListener("pause", () => {
                if (!document.hidden) playVideo(video);
            });
            video.addEventListener("ended", () => {
                try { video.currentTime = 0; } catch (_) {}
                playVideo(video);
            });

            // Start all five immediately.
            playVideo(video);

            // If the primary source cannot produce media, switch to the source
            // that is already confirmed to work in this exact preview setup.
            setTimeout(() => {
                if (video.readyState === 0 && !usingFallback) useFallback();
            }, 2200);
        });

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) videos.forEach(playVideo);
        });
    })();

    (function () {
        const searchButton = document.querySelector('.tnco-search');
        if (!searchButton) return;

        let hoverTimer = null;
        let celebrationTimer = null;

        searchButton.addEventListener('mouseenter', function () {
            clearTimeout(hoverTimer);
            clearTimeout(celebrationTimer);
            searchButton.classList.remove('tnco-hover-celebrate');

            hoverTimer = setTimeout(function () {
                if (!searchButton.matches(':hover')) return;

                searchButton.classList.add('tnco-hover-celebrate');

                celebrationTimer = setTimeout(function () {
                    searchButton.classList.remove('tnco-hover-celebrate');
                }, 2100);
            }, 2000);
        });

        searchButton.addEventListener('mouseleave', function () {
            clearTimeout(hoverTimer);
            clearTimeout(celebrationTimer);
            hoverTimer = null;
            celebrationTimer = null;
            searchButton.classList.remove('tnco-hover-celebrate');
        });
    })();

    (function () {
        if (typeof Vara === "undefined") return;

        const works = Array.from(document.querySelectorAll(".work-item")).slice(0, 3);
        if (!works.length) return;

        const configs = [
            {
                fontURL: "https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Satisfy/SatisfySL.json",
                color: "#ffffff",
                fontSize: 74,
                strokeWidth: 0.82,
                duration: 1450,
                letterSpacing: -7,
                rotate: -2.5,
                scaleX: 1.0,
                scaleY: 0.82,
                height: 118,
                alive: 4.2,
                y: 86
            },
            {
                fontURL: "https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Shadows-Into-Light/ShadowsIntoLight.json",
                color: "#FDF505",
                fontSize: 70,
                strokeWidth: 0.78,
                duration: 1350,
                letterSpacing: -2,
                rotate: 1.4,
                scaleX: 0.98,
                scaleY: 0.88,
                height: 112,
                alive: 3.7,
                y: 84
            },
            {
                fontURL: "https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Parisienne/Parisienne.json",
                color: "#ffffff",
                fontSize: 82,
                strokeWidth: 0.72,
                duration: 1550,
                letterSpacing: -13,
                rotate: -3.2,
                scaleX: 1.0,
                scaleY: 0.82,
                height: 126,
                alive: 4.5,
                y: 92
            }
        ];

        works.forEach((work, index) => {
            const anchor = work.querySelector("a");
            const config = configs[index];
            if (!anchor || !config) return;

            const holder = document.createElement("div");
            holder.id = "tnco-vara-hover-" + index;
            holder.className = "tnco-vara-hover";
            holder.setAttribute("aria-hidden", "true");
            holder.style.setProperty("--vara-rotate", config.rotate + "deg");
            holder.style.setProperty("--vara-scale-x", config.scaleX);
            holder.style.setProperty("--vara-scale-y", config.scaleY);
            holder.style.setProperty("--vara-alive-duration", config.alive + "s");
            holder.style.setProperty("--vara-height", config.height + "px");
            holder.style.setProperty("--vara-height-mobile", Math.round(config.height * .72) + "px");
            work.appendChild(holder);

            let vara = null;
            let generation = 0;
            let hideTimer = null;
            let aliveTimer = null;

            function setDrawingSize() {
                const rect = anchor.getBoundingClientRect();
                const workRect = work.getBoundingClientRect();
                const width = Math.max(180, Math.min(rect.width + 70, workRect.width * 0.96));
                holder.style.setProperty("--vara-width", width + "px");
            }

            function hide() {
                clearTimeout(hideTimer);
                clearTimeout(aliveTimer);
                generation++;
                vara = null;
                holder.classList.remove("is-alive", "is-visible");
                work.classList.remove("tnco-vara-active");
                holder.innerHTML = "";
            }

            function show() {
                clearTimeout(hideTimer);
                clearTimeout(aliveTimer);
                generation++;
                const run = generation;

                work.classList.add("tnco-vara-active");
                holder.classList.remove("is-alive", "is-visible");
                holder.innerHTML = "";
                setDrawingSize();

                vara = new Vara(
                    "#" + holder.id,
                    config.fontURL,
                    [{
                        id: "hover-" + index,
                        text: anchor.textContent.replace(/\s+/g, " ").trim(),
                        textAlign: "center",
                        fontSize: config.fontSize,
                        strokeWidth: config.strokeWidth,
                        color: config.color,
                        x: 0,
                        y: config.y,
                        duration: config.duration,
                        autoAnimation: false,
                        queued: true,
                        letterSpacing: { global: config.letterSpacing }
                    }],
                    {
                        fontSize: config.fontSize,
                        strokeWidth: config.strokeWidth,
                        color: config.color,
                        autoAnimation: false,
                        queued: true
                    }
                );

                vara.ready(function () {
                    if (run !== generation) return;

                    const svg = holder.querySelector("svg");
                    if (svg) {
                        svg.style.color = config.color;
                        svg.style.transform =
                            "translate(-50%, -50%) rotate(" + config.rotate + "deg) scale(" + config.scaleX + "," + config.scaleY + ")";
                        svg.style.transformOrigin = "center center";
                        svg.style.overflow = "visible";
                    }

                    holder.classList.add("is-visible");

                    // Real Vara stroke-by-stroke drawing.
                    vara.draw("hover-" + index);

                    // Let the hand-drawn stroke finish, then give it a tiny alive motion.
                    aliveTimer = window.setTimeout(function () {
                        if (run === generation) holder.classList.add("is-alive");
                    }, config.duration + 120);
                });
            }

            anchor.addEventListener("mouseenter", show);
            anchor.addEventListener("focus", show);

            anchor.addEventListener("mouseleave", function () {
                hideTimer = window.setTimeout(hide, 70);
            });

            anchor.addEventListener("blur", hide);
            work.addEventListener("mouseleave", function () {
                if (!anchor.matches(":hover")) hide();
            });

            window.addEventListener("resize", function () {
                if (anchor.matches(":hover")) setDrawingSize();
            }, { passive: true });
        });
    })();


    /* V48 — products 4, 5, 6 only */
    (function(){
        if(typeof Vara==="undefined") return;

        const works=Array.from(document.querySelectorAll(".work-item")).slice(3,6);
        if(!works.length) return;

        const cfg=[
            {
                font:"https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Shadows-Into-Light/ShadowsIntoLight.json",
                size:92, stroke:.72, duration:1500, spacing:-8,
                rotate:-5, sx:1.38, sy:.78, height:150, alive:"4.1s",
                icon:"dance"
            },
            {
                font:"https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Satisfy/SatisfySL.json",
                size:86, stroke:.78, duration:1550, spacing:-10,
                rotate:4.8, sx:1.30, sy:.80, height:145, alive:"4.5s",
                icon:"fire"
            },
            {
                font:"https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Parisienne/Parisienne.json",
                size:90, stroke:.68, duration:1650, spacing:-14,
                rotate:-5, sx:1.32, sy:.78, height:150, alive:"4.8s",
                icon:null
            }
        ];

        function icon(type){
            if(!type) return null;
            const s=document.createElementNS("http://www.w3.org/2000/svg","svg");
            s.classList.add("tnco-v48-icon");
            s.setAttribute("viewBox","0 0 100 100");
            s.setAttribute("aria-hidden","true");

            if(type==="dance"){
                s.style.cssText="--icon-x:87%;--icon-y:18%;--icon-size:82px;--icon-r:-8deg;";
                s.innerHTML=`
                    <circle cx="54" cy="15" r="6"/>
                    <path d="M54 22C49 32 47 40 51 49C55 57 62 62 68 66"/>
                    <path d="M50 34C41 33 33 29 26 23"/>
                    <path d="M51 35C60 34 68 29 76 22"/>
                    <path d="M67 65C59 74 50 80 39 85"/>
                    <path d="M67 65C75 70 82 77 88 84"/>
                    <path d="M24 23C19 20 15 19 11 22"/>
                    <path d="M77 22C83 19 87 19 91 22"/>
                `;
            }else{
                s.style.cssText="--icon-x:87%;--icon-y:22%;--icon-size:88px;--icon-r:7deg;";
                s.innerHTML=`
                    <path d="M51 89C34 82 29 68 36 55C40 48 45 43 44 34C54 39 57 47 56 54C62 49 64 42 62 35C76 45 80 57 75 68C71 79 62 86 51 89Z"/>
                    <path d="M50 78C44 73 44 65 50 59C55 64 58 68 57 73C56 77 53 79 50 78Z"/>
                    <path d="M72 31V16C72 13 76 13 77 16V29"/>
                    <path d="M72 17C77 18 82 16 85 13"/>
                    <path d="M77 29C83 28 85 31 84 35C83 39 79 41 76 39"/>
                `;
            }
            return s;
        }

        works.forEach((work,i)=>{
            const a=work.querySelector("a");
            const c=cfg[i];
            if(!a) return;

            const holder=document.createElement("div");
            holder.id="tnco-v48-"+i;
            holder.className="tnco-v48-holder";
            holder.setAttribute("aria-hidden","true");

            holder.style.setProperty("--v48-rotate",c.rotate+"deg");
            holder.style.setProperty("--v48-sx",c.sx);
            holder.style.setProperty("--v48-sy",c.sy);
            holder.style.setProperty("--v48-height",c.height+"px");
            holder.style.setProperty("--v48-alive",c.alive);

            work.appendChild(holder);

            let timer=null,gen=0;

            function hide(){
                clearTimeout(timer);
                gen++;
                holder.classList.remove("is-visible","is-alive");
                work.classList.remove("tnco-v48-active");
                holder.innerHTML="";
            }

            function show(){
                clearTimeout(timer);
                gen++;
                const run=gen;

                holder.innerHTML="";
                holder.classList.remove("is-visible","is-alive");
                work.classList.add("tnco-v48-active");

                const width=Math.max(window.innerWidth,320);
                holder.style.setProperty("--v48-width",width+"px");

                const vara=new Vara("#"+holder.id,c.font,[{
                    id:"v48-"+i,
                    text:a.textContent.replace(/\s+/g," ").trim().toLowerCase(),
                    textAlign:"center",
                    fontSize:c.size,
                    strokeWidth:c.stroke,
                    color:"#fff",
                    x:0,
                    y:100,
                    duration:c.duration,
                    autoAnimation:false,
                    queued:true,
                    letterSpacing:{global:c.spacing}
                }],{
                    fontSize:c.size,
                    strokeWidth:c.stroke,
                    color:"#fff",
                    autoAnimation:false,
                    queued:true
                });

                vara.ready(()=>{
                    if(run!==gen) return;

                    const svg=holder.querySelector("svg");
                    if(!svg) return;

                    svg.style.color="#fff";
                    holder.classList.add("is-visible");
                    vara.draw("v48-"+i);

                    /* Wait for the SVG to have its real dimensions, then calculate
                    the exact title intersection and replace that section only. */
                    requestAnimationFrame(()=>{
                        if(run!==gen) return;

                        /* Wait until Vara has actually inserted/drawn its SVG. */
                        const buildBlur=()=>{
                            if(run!==gen) return;

                            const sr=svg.getBoundingClientRect();
                            const tr=a.getBoundingClientRect();
                            const hr=holder.getBoundingClientRect();

                            const left=Math.max(tr.left,sr.left,hr.left);
                            const right=Math.min(tr.right,sr.right,hr.right);
                            const top=Math.max(tr.top,sr.top,hr.top);
                            const bottom=Math.min(tr.bottom,sr.bottom,hr.bottom);

                            if(right<=left || bottom<=top) return;

                            const ox=left-hr.left;
                            const oy=top-hr.top;
                            const ow=right-left;
                            const oh=bottom-top;

                            /* V54: make the blur copy occupy only the handwriting/title intersection. */
                            const pad = 34;
                            const bx = Math.max(0, ox - pad);
                            const by = Math.max(0, oy - pad);
                            const bw = Math.min(hr.width - bx, ow + pad * 2);
                            const bh = Math.min(hr.height - by, oh + pad * 2);

                            const blur=document.createElement('div');
                            blur.className='tnco-v48-blur';
                            blur.style.left=bx+'px';
                            blur.style.top=by+'px';
                            blur.style.width=bw+'px';
                            blur.style.height=bh+'px';

                            const svgCenterX = sr.left - hr.left + sr.width / 2;
                            const svgCenterY = sr.top - hr.top + sr.height / 2;
                            blur.style.setProperty('--v54-svg-cx',(svgCenterX-bx)+'px');
                            blur.style.setProperty('--v54-svg-cy',(svgCenterY-by)+'px');

                            const clone=svg.cloneNode(true);
                            clone.removeAttribute('mask');
                            clone.style.color='#fff';
                            clone.style.filter='none';
                            blur.appendChild(clone);
                            holder.appendChild(blur);
                        };

                        setTimeout(buildBlur,80);
                    });

                    const ic=icon(c.icon);
                    if(ic) holder.appendChild(ic);

                    timer=setTimeout(()=>{
                        if(run===gen){
                            holder.classList.add("is-alive");
                            const el=holder.querySelector(".tnco-v48-icon");
                            if(el){
                                requestAnimationFrame(()=>{
                                    el.classList.add("is-drawn");
                                    setTimeout(()=>el.classList.add("is-alive"),1100);
                                });
                            }
                        }
                    },c.duration+120);
                });
            }

            a.addEventListener("mouseenter",show);
            a.addEventListener("focus",show);
            a.addEventListener("mouseleave",()=>timer=setTimeout(hide,90));
            a.addEventListener("blur",hide);
            work.addEventListener("mouseleave",()=>{if(!a.matches(":hover")) hide()});

            window.addEventListener("resize",()=>{
                if(a.matches(":hover")) show();
            },{passive:true});
        });
    })();

    /* =========================================================
   TNCO — LIQUID GLASS CURSOR TRACKER
   Cursor / Touch follows actual pointer position
   ========================================================= */

(() => {
    const header = document.querySelector(".tnco-header");

    if (!header) return;

    let raf = null;
    let lastX = 0;
    let lastY = 0;

    function updateLiquidPosition(x, y) {
        lastX = x;
        lastY = y;

        if (raf) return;

        raf = requestAnimationFrame(() => {
            const rect = header.getBoundingClientRect();

            const xInside = lastX - rect.left;
            const yInside = lastY - rect.top;

            header.style.setProperty(
                "--tnco-mx",
                `${xInside}px`
            );

            header.style.setProperty(
                "--tnco-my",
                `${yInside}px`
            );

            raf = null;
        });
    }


    /* =====================================================
       DESKTOP — MOUSE
       ===================================================== */

    header.addEventListener("mouseenter", (e) => {
        header.classList.add("tnco-liquid-active");

        updateLiquidPosition(
            e.clientX,
            e.clientY
        );
    });

    header.addEventListener("mousemove", (e) => {
        updateLiquidPosition(
            e.clientX,
            e.clientY
        );
    });

    header.addEventListener("mouseleave", () => {
        header.classList.remove("tnco-liquid-active");
    });


    /* =====================================================
       MOBILE — TOUCH
       ===================================================== */

    header.addEventListener(
        "touchstart",
        (e) => {
            const touch = e.touches[0];

            if (!touch) return;

            header.classList.add("tnco-liquid-active");

            updateLiquidPosition(
                touch.clientX,
                touch.clientY
            );
        },
        { passive: true }
    );


    header.addEventListener(
        "touchmove",
        (e) => {
            const touch = e.touches[0];

            if (!touch) return;

            updateLiquidPosition(
                touch.clientX,
                touch.clientY
            );
        },
        { passive: true }
    );


    header.addEventListener(
        "touchend",
        () => {
            header.classList.remove("tnco-liquid-active");
        },
        { passive: true }
    );
})();

/* =========================================================
   V59 — VARA SCRIBBLE FOR EVERY SERIF / WORSHIP SONG
   RESTORED FROM WORKING V61
   ========================================================= */

(function(){
    if(typeof Vara === "undefined") return;

    const worshipItems = Array.from(
        document.querySelectorAll(".works-list .work-item.worship")
    );

    if(!worshipItems.length) return;

    document
        .querySelectorAll(".works-list .tnco-v48-holder")
        .forEach(function(holder){
            holder.remove();
        });

    const angles = [
        -5, 3.5, -2.5, 5, -4, 2.5,
        -5, 4, -3.5, 5, -2, 3,
        -4.5, 2.5, -5, 4.5, -3
    ];

    worshipItems.forEach(function(target, index){

        const anchor = target.querySelector("a");
        if(!anchor) return;

        target.classList.add("v58-scribble-item");

        const holder = document.createElement("div");

        holder.id = "tnco-v58-scribble-" + index;
        holder.className = "tnco-v48-holder";
        holder.setAttribute("aria-hidden","true");

        target.appendChild(holder);

        const angle = angles[index % angles.length];

        holder.style.setProperty(
            "--v58-rotate",
            angle + "deg"
        );

        let generation = 0;
        let hideTimer = null;

        function hide(){

            clearTimeout(hideTimer);

            generation++;

            holder.classList.remove(
                "is-visible",
                "is-alive"
            );

            holder.innerHTML = "";
        }

        function show(){

            clearTimeout(hideTimer);

            generation++;

            const run = generation;

            holder.classList.remove(
                "is-visible",
                "is-alive"
            );

            holder.innerHTML = "";

            const width = Math.max(
                window.innerWidth - 18,
                320
            );

            holder.style.setProperty(
                "--v48-width",
                width + "px"
            );

            holder.style.setProperty(
                "--v48-height",
                "175px"
            );

            holder.style.setProperty(
                "--v48-alive",
                "4.2s"
            );

            const phrase = anchor.textContent
                .replace(/\s+/g," ")
                .trim();

            const id = "v58-song-" + index;

            const vara = new Vara(
                "#" + holder.id,

                "https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Parisienne/Parisienne.json",

                [{
                    id: id,
                    text: phrase,
                    textAlign: "left",
                    fontSize: 94,
                    strokeWidth: .70,
                    color: "#fff",
                    x: 0,
                    y: 92,
                    duration: 2200,
                    autoAnimation: false,
                    queued: true,
                    letterSpacing: {
                        global: -12
                    }
                }],

                {
                    fontSize: 94,
                    strokeWidth: .70,
                    color: "#fff",
                    autoAnimation: false,
                    queued: true
                }
            );

            vara.ready(function(){

                if(run !== generation) return;

                const svg = holder.querySelector("svg");

                if(!svg) return;

                svg.style.color = "#fff";
                svg.style.filter = "brightness(.60)";
                svg.style.webkitFilter = "brightness(.60)";
                svg.style.opacity = "1";
                svg.style.overflow = "visible";

                holder.classList.add("is-visible");

                vara.draw(id);

                setTimeout(function(){

                    if(run === generation){
                        holder.classList.add("is-alive");
                    }

                }, 2280);

            });
        }

        anchor.addEventListener(
            "mouseenter",
            show
        );

        anchor.addEventListener(
            "focus",
            show
        );

        anchor.addEventListener(
            "mouseleave",
            function(){

                hideTimer = setTimeout(
                    hide,
                    90
                );

            }
        );

        anchor.addEventListener(
            "blur",
            hide
        );

        target.addEventListener(
            "mouseleave",
            function(){

                if(!anchor.matches(":hover")){
                    hide();
                }

            }
        );

        window.addEventListener(
            "resize",
            function(){

                if(anchor.matches(":hover")){
                    show();
                }

            },
            { passive: true }
        );

    });

})();