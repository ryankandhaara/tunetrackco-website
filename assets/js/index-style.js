/* =========================================================
   TUNETRACK HOME — EINAR STYLE INTERACTION LAYER
   GSAP + ScrollTrigger, but native browser scrolling only.
========================================================= */
(function(){
    'use strict';

    function ready(fn){
        if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
        else fn();
    }

    ready(function(){
        /* ---------------------------------------------------------
           Header / mobile menu — same behavior family as current
           Tunetrack index.
        --------------------------------------------------------- */
        const menuButton = document.getElementById('tncoHeaderMenuButton');
        const menu = document.getElementById('tncoMobileMenu');
        const menuClose = document.getElementById('tncoMobileMenuClose');

        function openMenu(){
            if(!menu) return;
            menu.classList.add('is-open');
            menu.setAttribute('aria-hidden','false');
            menuButton && menuButton.setAttribute('aria-expanded','true');
            document.body.classList.add('menu-open');
        }
        function closeMenu(){
            if(!menu) return;
            menu.classList.remove('is-open');
            menu.setAttribute('aria-hidden','true');
            menuButton && menuButton.setAttribute('aria-expanded','false');
            document.body.classList.remove('menu-open');
        }
        menuButton && menuButton.addEventListener('click', openMenu);
        menuClose && menuClose.addEventListener('click', closeMenu);
        menu && menu.addEventListener('click', function(e){ if(e.target === menu) closeMenu(); });
        document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });
        menu && menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });

        /* ---------------------------------------------------------
           Hero typewriter: exactly three words, swapping every 3 sec.
           Each swap uses a small Einar-style erase/type transition.
        --------------------------------------------------------- */
        const typeTarget = document.getElementById('heroTypewriter');
        const typeWords = ['Howdy','Halo','Hello'];
        let wordIndex = 0;
        let typeTimer = null;
        let activeWord = typeWords[0];
        let running = true;

        function sleep(ms){ return new Promise(function(resolve){ setTimeout(resolve, ms); }); }

        async function replaceWord(nextWord){
            if(!typeTarget || !running) return;
            const current = typeTarget.textContent || '';
            for(let i=current.length; i>0; i--){
                if(!running) return;
                typeTarget.textContent = current.slice(0, i-1);
                await sleep(24);
            }
            for(let i=0; i<nextWord.length; i++){
                if(!running) return;
                typeTarget.textContent = nextWord.slice(0, i+1);
                await sleep(38);
            }
            activeWord = nextWord;
        }

        function startTypewriter(){
            if(!typeTarget) return;
            typeTarget.textContent = activeWord;
            typeTimer = window.setInterval(function(){
                wordIndex = (wordIndex + 1) % typeWords.length;
                replaceWord(typeWords[wordIndex]);
            }, 3000);
        }
        startTypewriter();

        document.addEventListener('visibilitychange', function(){
            if(document.hidden){
                running = false;
                if(typeTimer) clearInterval(typeTimer);
            }else{
                running = true;
                wordIndex = (typeWords.indexOf(activeWord) + 1) % typeWords.length;
                replaceWord(typeWords[wordIndex]);
                if(typeTimer) clearInterval(typeTimer);
                typeTimer = setInterval(function(){
                    wordIndex = (wordIndex + 1) % typeWords.length;
                    replaceWord(typeWords[wordIndex]);
                },3000);
            }
        });

        /* ---------------------------------------------------------
           V5 — seamless top marquee.
           Keep enough identical sets to cover the viewport, then move
           exactly one set-width per cycle. The loop boundary therefore
           lands on an identical frame with no blank area or teleport.
        --------------------------------------------------------- */
        const topMarquee = document.querySelector('.tnco-top-marquee');
        const topTrack = document.getElementById('tncoTopMarqueeTrack');
        if(topMarquee && topTrack){
            const sourceSet = topTrack.querySelector('.tnco-top-marquee-set');
            if(sourceSet){
                const sourceHTML = sourceSet.innerHTML;
                const speed = 48; // px/sec — deliberately subtle

                topTrack.innerHTML = '';

                // Six sets give plenty of continuous runway on desktop
                // while the animation itself only advances one set per cycle.
                for(let i = 0; i < 6; i++){
                    const set = document.createElement('div');
                    set.className = 'tnco-top-marquee-set';
                    set.innerHTML = sourceHTML;
                    if(i > 0) set.setAttribute('aria-hidden','true');
                    topTrack.appendChild(set);
                }

                const firstSet = topTrack.querySelector('.tnco-top-marquee-set');

                function measureTopMarquee(){
                    const setWidth = firstSet.getBoundingClientRect().width;
                    if(setWidth <= 0) return;
                    topTrack.style.setProperty('--tnco-top-marquee-shift', (-setWidth) + 'px');
                    topTrack.style.setProperty('--tnco-top-marquee-duration', (setWidth / speed) + 's');
                }

                measureTopMarquee();
                topTrack.style.animation = 'tncoTopMarquee var(--tnco-top-marquee-duration, 20s) linear infinite';
                window.addEventListener('resize', measureTopMarquee, {passive:true});
            }
        }

        /* ---------------------------------------------------------
           Hero media marquee — one continuous infinite video row.
           The second half is cloned in JS so the loop never exposes
           an empty gap while the first half leaves the viewport.
        --------------------------------------------------------- */
        const mediaTrack = document.getElementById('ttHeroMediaTrack');
        if(mediaTrack){
            const originalCards = Array.from(mediaTrack.children);
            originalCards.forEach(function(card){
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden','true');
                clone.querySelectorAll('video').forEach(function(video){
                    video.muted = true;
                    video.setAttribute('muted','');
                    video.setAttribute('playsinline','');
                });
                mediaTrack.appendChild(clone);
            });

            const videos = mediaTrack.querySelectorAll('video');
            videos.forEach(function(video){
                const play = function(){
                    const promise = video.play();
                    if(promise && typeof promise.catch === 'function') promise.catch(function(){});
                };
                if(video.readyState >= 2) play();
                else video.addEventListener('loadeddata',play,{once:true});
            });
        }

        /* ---------------------------------------------------------
           V5 — Section 2 fisheye image carousel
           Smooth DOM implementation of the supplied carousel feel.
           Ten images, continuous wrapping, eased drag/wheel and a
           perspective/fisheye response around the viewport center.
        --------------------------------------------------------- */
        const galleryStage = document.getElementById('ttGalleryViewport');
        const gallerySource = document.getElementById('ttGallerySource');
        const galleryCaptions = document.getElementById('ttGalleryCaptions');
        const galleryPrev = document.getElementById('ttGalleryPrev');
        const galleryNext = document.getElementById('ttGalleryNext');

        if(galleryStage && gallerySource && galleryCaptions){
            const sourceProjects = Array.from(gallerySource.querySelectorAll('.tt-einar-project'));
            const cards = [];
            const clamp = (v,min,max) => Math.min(Math.max(v,min),max);
            const lerp = (a,b,t) => a + (b-a)*t;

            sourceProjects.forEach(function(project,index){
                const card = document.createElement('figure');
                card.className = 'tt-fisheye-card ' + Array.from(project.classList).filter(c=>c.indexOf('tt-einar-project--')===0).join(' ');
                card.innerHTML = '<img src="'+(project.querySelector('img')?.getAttribute('src')||'')+'" alt="'+(project.querySelector('img')?.getAttribute('alt')||'')+'" draggable="false"><figcaption><strong>'+(project.querySelector('strong')?.textContent||'')+'</strong><span>'+(project.querySelector('figcaption span')?.textContent||'')+'</span></figcaption>';
                galleryStage.insertBefore(card,galleryCaptions);
                cards.push({el:card,index:index,x:0,targetX:0,width:0,height:0,baseX:0});
            });

            let totalWidth = 1;
            let current = 0;
            let target = 0;
            let last = 0;
            let velocity = 0;
            let dragging = false;
            let lastPointerX = 0;
            let dragVelocity = 0;

            function wrap(v,w){
                if(!w) return 0;
                v%=w;
                return v<0?v+w:v;
            }
            function signedDelta(v,w){
                if(v>w/2) v-=w;
                if(v<-w/2) v+=w;
                return v;
            }

            function metrics(project){
                // Uniform card dimensions across all items for consistent rhythm & spacing
                if(window.innerWidth<=600){
                    const w = Math.min(300, Math.round(galleryStage.clientWidth * 0.78));
                    return {width: w, height: 230};
                }
                if(window.innerWidth<=900){
                    const w = Math.min(420, Math.round(galleryStage.clientWidth * 0.62));
                    return {width: w, height: 295};
                }
                return {width: 480, height: 340};
            }

            function rebuild(){
                let x=0;
                const gap=window.innerWidth<=600?20:window.innerWidth<=900?35:50;
                cards.forEach(function(card,i){
                    const m=metrics(sourceProjects[i]);
                    card.width=m.width;
                    card.height=m.height;
                    card.baseX=x+m.width/2;
                    x+=m.width+gap;
                });
                totalWidth=Math.max(1,x-gap);
                current=wrap(current,totalWidth);
                target=wrap(target,totalWidth);
            }

            function moveBy(direction){
                target += direction*Math.max(galleryStage.clientWidth*.65,400);
            }

            galleryPrev && galleryPrev.addEventListener('click',function(){moveBy(-1)});
            galleryNext && galleryNext.addEventListener('click',function(){moveBy(1)});

            galleryStage.addEventListener('pointerdown',function(e){
                if(e.pointerType==='mouse' && e.button!==0) return;
                dragging=true;
                lastPointerX=e.clientX;
                dragVelocity=0;
                galleryStage.classList.add('is-dragging');
                try{galleryStage.setPointerCapture(e.pointerId)}catch(err){}
            });
            galleryStage.addEventListener('pointermove',function(e){
                if(!dragging) return;
                const dx=e.clientX-lastPointerX;
                dragVelocity=dx;
                target-=dx*1.12;
                lastPointerX=e.clientX;
            });
            function stopDrag(){
                if(!dragging) return;
                dragging=false;
                galleryStage.classList.remove('is-dragging');
                target-=dragVelocity*1.8;
                dragVelocity=0;
            }
            galleryStage.addEventListener('pointerup',stopDrag);
            galleryStage.addEventListener('pointercancel',stopDrag);
            galleryStage.addEventListener('lostpointercapture',stopDrag);
            galleryStage.addEventListener('wheel',function(e){
                const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
                if(!delta) return;
                e.preventDefault();
                target+=delta*.72;
            },{passive:false});

            function renderCarousel(){
                current=lerp(current,target,.075);
                velocity=current-last;
                last=current;
                const center=galleryStage.clientWidth/2;
                const half=totalWidth/2;

                cards.forEach(function(card){
                    let x=card.baseX-current;
                    x=((x+half)%totalWidth+totalWidth)%totalWidth-half;
                    x+=center;

                    const distance=x-center;
                    const normalized=clamp(distance/(galleryStage.clientWidth*.65),-1.5,1.5);
                    const abs=Math.abs(normalized);
                    const focus=1-clamp(abs,0,1);

                    const scale = 0.82 + focus * 0.22;
                    const rotateY = -normalized * 28;
                    const depth = -abs * 240 + focus * 60;
                    const opacity = clamp(0.35 + focus * 0.65, 0, 1);
                    const blur = Math.max(0, (abs - 0.65) * 2.5);

                    card.el.style.width=card.width+'px';
                    card.el.style.height=card.height+'px';
                    card.el.style.transform='translate3d('+(x-card.width/2)+'px,0,'+depth+'px) rotateY('+rotateY+'deg) scale('+scale+')';
                    card.el.style.opacity=opacity.toFixed(3);
                    card.el.style.filter='blur('+blur.toFixed(2)+'px)';
                    card.el.style.zIndex=String(Math.round(1000+focus*100));

                    const caption=card.el.querySelector('figcaption');
                    if(caption){
                        caption.style.opacity=String(clamp((focus-0.55)/0.35,0,1));
                    }
                });

                requestAnimationFrame(renderCarousel);
            }

            window.addEventListener('resize',rebuild,{passive:true});
            rebuild();
            renderCarousel();
        }/* ---------------------------------------------------------
           V5 — scroll-driven gray -> white text reveal
           The whole statement progresses with the section itself so it
           cannot get stuck in gray when the user scrolls through it.
        --------------------------------------------------------- */
        const revealSection = document.getElementById('ttEinarGallery');
        const revealHeading = document.querySelector('.tt-scroll-reveal-heading');
        const revealWords = revealHeading ? Array.from(revealHeading.querySelectorAll('.tt-reveal-word')) : [];
        const revealChars = [];

        /* Keep the existing word wrappers/layout, but split the visible text
           into real character units so the scroll reveal advances one letter
           at a time. Spaces stay outside the character spans. */
        revealWords.forEach(function(word){
            if(word.dataset.split === '1') return;
            const text = word.textContent;
            word.textContent = '';
            Array.from(text).forEach(function(char){
                const span = document.createElement('span');
                span.className = 'tt-reveal-char';
                span.textContent = char;
                span.style.setProperty('--char-progress','0');
                word.appendChild(span);
                revealChars.push(span);
            });
            word.dataset.split = '1';
        });

        function updateScrollReveal(){
            if(!revealSection || !revealChars.length) return;
            const rect = revealSection.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const travel = Math.max(1, rect.height - vh*.20);
            const sectionProgress = clamp01((vh*.78 - rect.top) / travel);

            /* One continuous character timeline. The easing is applied to
               each individual character so only the current letter carries
               the soft feather while completed letters remain solid white. */
            const total = Math.max(1, revealChars.length);
            const rawPosition = sectionProgress * total;
            revealChars.forEach(function(char,index){
                const local = clamp01(rawPosition - index);
                const eased = local * local * (3 - 2 * local);
                char.style.setProperty('--char-progress', eased.toFixed(4));
                char.classList.toggle('is-revealing', eased > 0 && eased < 1);
                char.classList.toggle('is-revealed', eased >= 1);
            });
        }

        function clamp01(v){ return Math.max(0,Math.min(1,v)); }
        let revealRaf=0;
        function requestRevealUpdate(){
            if(revealRaf) return;
            revealRaf=requestAnimationFrame(function(){
                revealRaf=0;
                updateScrollReveal();
            });
        }
        window.addEventListener('scroll',requestRevealUpdate,{passive:true});
        window.addEventListener('resize',requestRevealUpdate,{passive:true});
        requestRevealUpdate();

        /* ---------------------------------------------------------
           V12 — one-time cookie popup
           Showing it marks the first visit as seen, so a reload will not
           replay the popup unless site storage is cleared.
        --------------------------------------------------------- */
        
        /* ---------------------------------------------------------
           INTERACTIVE 1:1 COOKIE MANAGEMENT & CUSTOMIZE MODAL
        --------------------------------------------------------- */
        (function initInteractiveCookieSystem(){
            const cookieBar = document.getElementById('ttCookiePopup');
            const allowBtn = document.getElementById('ttCookieAllowAll');
            const customizeBtn = document.getElementById('ttCookieCustomize');
            const rejectBtn = document.getElementById('ttCookieReject');

            const prefModal = document.getElementById('ttCookiePrefModal');
            const prefBackdrop = document.getElementById('ttCookiePrefBackdrop');
            const prefClose = document.getElementById('ttCookiePrefClose');
            const prefSave = document.getElementById('ttCookiePrefSave');
            const prefRejectAll = document.getElementById('ttCookiePrefRejectAll');

            const consentKey = 'tunetrack_cookie_consent_v1';

            function dismissCookieBar(){
                if(!cookieBar) return;
                cookieBar.classList.add('is-hidden');
                setTimeout(function(){
                    cookieBar.style.display = 'none';
                }, 600);
            }

            function openPreferencesModal(){
                if(!prefModal) return;
                prefModal.classList.add('is-active');
                prefModal.setAttribute('aria-hidden', 'false');
            }

            function closePreferencesModal(){
                if(!prefModal) return;
                prefModal.classList.remove('is-active');
                prefModal.setAttribute('aria-hidden', 'true');
            }

            // Click: Allow All
            if(allowBtn){
                allowBtn.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    try { localStorage.setItem(consentKey, 'all_allowed'); } catch(err){}
                    dismissCookieBar();
                });
            }

            // Click: Reject All
            if(rejectBtn){
                rejectBtn.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    try { localStorage.setItem(consentKey, 'all_rejected'); } catch(err){}
                    dismissCookieBar();
                });
            }

            // Click: Customize
            if(customizeBtn){
                customizeBtn.addEventListener('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    openPreferencesModal();
                });
            }

            // Modal Interactions
            if(prefClose) prefClose.addEventListener('click', closePreferencesModal);
            if(prefBackdrop) prefBackdrop.addEventListener('click', closePreferencesModal);

            if(prefRejectAll){
                prefRejectAll.addEventListener('click', function(){
                    try { localStorage.setItem(consentKey, 'custom_rejected'); } catch(err){}
                    closePreferencesModal();
                    dismissCookieBar();
                });
            }

            if(prefSave){
                prefSave.addEventListener('click', function(){
                    const prefs = {
                        functional: document.getElementById('prefFunctional')?.checked ?? false,
                        analytics: document.getElementById('prefAnalytics')?.checked ?? false,
                        marketing: document.getElementById('prefMarketing')?.checked ?? false
                    };
                    try { localStorage.setItem(consentKey, JSON.stringify(prefs)); } catch(err){}
                    closePreferencesModal();
                    dismissCookieBar();
                });
            }

            // ESC closes the modal
            document.addEventListener('keydown', function(e){
                if(e.key === 'Escape' && prefModal && prefModal.classList.contains('is-active')){
                    closePreferencesModal();
                }
            });

            // Check if already consented in this session
            const hasConsent = (() => {
                try { return localStorage.getItem(consentKey); } catch(err){ return false; }
            })();

            // Consent check bypassed for testing
        })();

        /* ---------------------------------------------------------
           Motion system — GSAP / ScrollTrigger, directly modeled on
           the animation approach in the supplied Einar source.
           IMPORTANT: no Locomotive Scroll and no scrollerProxy.
        --------------------------------------------------------- */
        if(typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined'){
            document.documentElement.classList.add('motion-fallback');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(reduceMotion) return;

        /* Hero image parallax — light and native-scroll friendly. */
        const heroImage = document.querySelector('.hero-image');
        if(heroImage){
            gsap.to(heroImage, {
                yPercent: 9,
                scale: 1.08,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero-einar',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        /* Hero copy reveal, Einar-style upward stagger. */
        const heroElements = gsap.utils.toArray('.hero-copy > *');
        gsap.fromTo(heroElements,
            {y:40, opacity:0},
            {y:0, opacity:1, duration:.9, stagger:.08, ease:'power3.out', delay:.15}
        );

        /* ---------------------------------------------------------
           Asymmetric grid: each card has its own vertical position,
           slight parallax, and progressive scale. The center statement
           is revealed word/line by line while the cards get smaller.
        --------------------------------------------------------- */
        const stage = document.getElementById('worksStage');
        const cards = gsap.utils.toArray('.asym-card');
        const copyLines = gsap.utils.toArray('.works-center-copy span');

        cards.forEach(function(card, index){
            const speed = parseFloat(card.dataset.speed || '1');
            const image = card.querySelector('img');

            gsap.fromTo(card,
                {opacity:0, scale:1.06, y:42},
                {
                    opacity:1,
                    scale:Math.max(.74, speed),
                    y:0,
                    duration:1.15,
                    ease:'power3.out',
                    scrollTrigger:{
                        trigger:card,
                        start:'top 92%',
                        end:'top 60%',
                        scrub:1.1
                    }
                }
            );

            if(image){
                gsap.to(image, {
                    yPercent:(index % 2 ? 6 : -6),
                    scale:1.08,
                    ease:'none',
                    scrollTrigger:{
                        trigger:card,
                        start:'top bottom',
                        end:'bottom top',
                        scrub:1.3
                    }
                });
            }
        });

        /* Center copy reveal sequence. Each line owns its own trigger,
           so the statement appears progressively through the long field. */
        copyLines.forEach(function(line, index){
            gsap.to(line, {
                opacity:1,
                y:0,
                filter:'blur(0px)',
                duration:.75,
                ease:'power3.out',
                scrollTrigger:{
                    trigger:stage,
                    start:(8 + index * 10) + '% 58%',
                    end:(14 + index * 10) + '% 44%',
                    scrub:1
                }
            });
        });

        /* Keep the center copy visually centered while the stage is active. */
        if(stage){
            ScrollTrigger.create({
                trigger:stage,
                start:'top top',
                end:'bottom bottom',
                pin:'.works-center-copy',
                pinSpacing:false,
                anticipatePin:1
            });
        }

        /* ---------------------------------------------------------
           Requested slow black -> white blur transition.
           It is deliberately simple: one transform + opacity tween.
        --------------------------------------------------------- */
        const transition = document.getElementById('sectionTransition');
        if(transition){
            gsap.fromTo(transition,
                {filter:'blur(34px)', opacity:.35, y:40},
                {filter:'blur(0px)', opacity:1, y:0, ease:'none',
                    scrollTrigger:{trigger:transition,start:'top 88%',end:'bottom 30%',scrub:1.4}}
            );
        }

        /* ---------------------------------------------------------
           Product editorial reveals + subtle 3D hover tilt.
        --------------------------------------------------------- */
        gsap.utils.toArray('.product-showcase').forEach(function(section){
            gsap.fromTo(section.children,
                {y:70, opacity:0},
                {y:0, opacity:1, duration:1, stagger:.12, ease:'power3.out',
                    scrollTrigger:{trigger:section,start:'top 78%',once:true}}
            );
        });

        const render = document.querySelector('.render-device');
        const renderWrap = document.querySelector('.product-render');
        if(render && renderWrap){
            renderWrap.addEventListener('pointermove', function(e){
                const r = renderWrap.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - .5;
                const y = (e.clientY - r.top) / r.height - .5;
                gsap.to(render,{rotateY:x*10,rotateX:-y*8,duration:.55,ease:'power3.out',overwrite:true});
            });
            renderWrap.addEventListener('pointerleave', function(){
                gsap.to(render,{rotateY:-7,rotateX:7,duration:.8,ease:'power3.out'});
            });
        }

        /* Blog cards reveal with the same clean upward stagger. */
        gsap.fromTo('.blog-card',
            {y:70,opacity:0},
            {y:0,opacity:1,duration:1,stagger:.14,ease:'power3.out',
                scrollTrigger:{trigger:'.blog-grid',start:'top 78%',once:true}}
        );

        /* Footer enters as a single large Einar-like block. */
        gsap.fromTo('.footer-brand',
            {y:100,opacity:0},
            {y:0,opacity:1,duration:1.2,ease:'power3.out',
                scrollTrigger:{trigger:'.tnco-footer-einar',start:'top 75%',once:true}}
        );

        /* ---------------------------------------------------------
           Refresh after all remote images have dimensions. This is
           important for ScrollTrigger reliability with image-heavy pages.
        --------------------------------------------------------- */
        const images = Array.from(document.images);
        let pending = images.length;
        function imageDone(){
            pending -= 1;
            if(pending <= 0){
                ScrollTrigger.refresh(true);
            }
        }
        images.forEach(function(img){
            if(img.complete) imageDone();
            else {
                img.addEventListener('load',imageDone,{once:true});
                img.addEventListener('error',imageDone,{once:true});
            }
        });

        window.addEventListener('load',function(){
            ScrollTrigger.refresh(true);
        },{once:true});

        
        /* ---------------------------------------------------------
           SWISS HEADER, FULL-INDEX SEARCH & CHECKOUT DRAWER
        --------------------------------------------------------- */
        (function initSwissHeaderUtilities(){
            // --- Elements ---
            const searchBtn = document.getElementById('swissSearchBtn');
            const searchOverlay = document.getElementById('swissSearchOverlay');
            const searchBackdrop = document.getElementById('swissSearchBackdrop');
            const searchClose = document.getElementById('swissSearchClose');
            const searchInput = document.getElementById('swissSearchInput');
            const searchResults = document.getElementById('swissSearchResults');
            const searchCount = document.getElementById('swissSearchCount');

            const cartBtn = document.getElementById('swissCartBtn');
            const checkoutDrawer = document.getElementById('swissCheckoutDrawer');
            const checkoutBackdrop = document.getElementById('swissCheckoutBackdrop');
            const checkoutClose = document.getElementById('swissCheckoutClose');
            const payBtn = document.getElementById('swissPayBtn');

            // --- 1. Dynamic Search Indexing ---
            let searchableIndex = [];

            function buildSearchIndex(){
                const index = [];
                // 1. Headings & Main Sections
                document.querySelectorAll('section, article, header, footer').forEach(function(sec, sIdx){
                    const h = sec.querySelector('h1, h2, h3, h4, .section-label, .works-eyebrow');
                    if(h && h.textContent.trim()){
                        const text = h.textContent.trim().replace(/\s+/g, ' ');
                        const id = sec.id || ('sec-' + sIdx);
                        if(!sec.id) sec.id = id;
                        index.push({
                            title: text,
                            desc: 'Section · ' + (sec.className.split(' ')[0] || 'Content block'),
                            category: 'Section',
                            targetId: id
                        });
                    }
                });

                // 2. Carousel Projects & Editorial Cards
                document.querySelectorAll('.tt-einar-project, .tt-fisheye-card, .asym-card').forEach(function(card, cIdx){
                    const title = card.querySelector('strong, span, figcaption');
                    const img = card.querySelector('img');
                    const label = (title ? title.textContent.trim() : (img ? img.alt : '')) || '';
                    if(label && label.length > 2){
                        const id = card.id || ('project-node-' + cIdx);
                        if(!card.id) card.id = id;
                        index.push({
                            title: label,
                            desc: 'Visual Asset · ' + (img ? img.alt || 'Photography / 3D' : 'Media file'),
                            category: 'Gallery',
                            targetId: id
                        });
                    }
                });

                // 3. Products Showcase
                document.querySelectorAll('.product-showcase').forEach(function(prod, pIdx){
                    const title = prod.querySelector('h3, .product-copy h3');
                    const desc = prod.querySelector('p');
                    if(title){
                        const id = prod.id || ('product-item-' + pIdx);
                        if(!prod.id) prod.id = id;
                        index.push({
                            title: title.textContent.trim().replace(/\s+/g, ' '),
                            desc: desc ? desc.textContent.trim() : 'Digital resource / sequencer',
                            category: 'Product',
                            targetId: id
                        });
                    }
                });

                // 4. Blog / Papers
                document.querySelectorAll('.blog-card').forEach(function(blog, bIdx){
                    const title = blog.querySelector('h3');
                    const meta = blog.querySelector('.blog-meta');
                    if(title){
                        const id = blog.id || ('blog-item-' + bIdx);
                        if(!blog.id) blog.id = id;
                        index.push({
                            title: title.textContent.trim(),
                            desc: meta ? meta.textContent.trim() : 'Editorial Article',
                            category: 'Paper',
                            targetId: id
                        });
                    }
                });

                // Deduplicate by title
                const seen = new Set();
                searchableIndex = index.filter(function(item){
                    const key = item.title.toLowerCase();
                    if(seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
            }

            let activeResultIndex = -1;

            function renderResults(query){
                if(!searchResults) return;
                const q = (query || '').trim().toLowerCase();
                const matched = q === '' 
                    ? searchableIndex.slice(0, 8) 
                    : searchableIndex.filter(function(item){
                        return item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
                    });

                if(searchCount){
                    searchCount.textContent = matched.length + ' RESULT' + (matched.length === 1 ? '' : 'S') + (q ? ' FOR "' + q.toUpperCase() + '"' : ' (SHOWING INDEX SUGGESTIONS)');
                }

                if(matched.length === 0){
                    searchResults.innerHTML = '<div class="swiss-search-empty">No results found matching "' + query + '". Try another keyword.</div>';
                    activeResultIndex = -1;
                    return;
                }

                activeResultIndex = 0;
                searchResults.innerHTML = matched.map(function(item, idx){
                    return '<div class="swiss-search-item' + (idx === 0 ? ' is-selected' : '') + '" data-target="' + item.targetId + '" data-idx="' + idx + '">' +
                        '<div class="swiss-search-item-main">' +
                            '<span class="swiss-search-item-title">' + item.title + '</span>' +
                            '<span class="swiss-search-item-desc">' + item.desc + '</span>' +
                        '</div>' +
                        '<span class="swiss-search-item-badge">' + item.category + '</span>' +
                    '</div>';
                }).join('');

                // Click event on items
                searchResults.querySelectorAll('.swiss-search-item').forEach(function(el){
                    el.addEventListener('click', function(){
                        const targetId = el.getAttribute('data-target');
                        jumpToElement(targetId);
                    });
                });
            }

            function jumpToElement(id){
                closeSearch();
                if(!id) return;
                const el = document.getElementById(id);
                if(el){
                    el.scrollIntoView({behavior:'smooth', block:'center'});
                    el.style.outline = '2px solid #000';
                    setTimeout(function(){ el.style.outline = 'none'; }, 1600);
                }
            }

            function openSearch(){
                buildSearchIndex();
                searchOverlay && searchOverlay.classList.add('is-active');
                searchOverlay && searchOverlay.setAttribute('aria-hidden', 'false');
                document.body.classList.add('menu-open');
                if(searchInput){
                    searchInput.value = '';
                    renderResults('');
                    setTimeout(function(){ searchInput.focus(); }, 80);
                }
            }

            function closeSearch(){
                searchOverlay && searchOverlay.classList.remove('is-active');
                searchOverlay && searchOverlay.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('menu-open');
            }

            searchBtn && searchBtn.addEventListener('click', openSearch);
            searchClose && searchClose.addEventListener('click', closeSearch);
            searchBackdrop && searchBackdrop.addEventListener('click', closeSearch);

            searchInput && searchInput.addEventListener('input', function(e){
                renderResults(e.target.value);
            });

            searchInput && searchInput.addEventListener('keydown', function(e){
                const items = searchResults ? Array.from(searchResults.querySelectorAll('.swiss-search-item')) : [];
                if(!items.length) return;

                if(e.key === 'ArrowDown'){
                    e.preventDefault();
                    items[activeResultIndex] && items[activeResultIndex].classList.remove('is-selected');
                    activeResultIndex = (activeResultIndex + 1) % items.length;
                    items[activeResultIndex].classList.add('is-selected');
                    items[activeResultIndex].scrollIntoView({block:'nearest'});
                }else if(e.key === 'ArrowUp'){
                    e.preventDefault();
                    items[activeResultIndex] && items[activeResultIndex].classList.remove('is-selected');
                    activeResultIndex = (activeResultIndex - 1 + items.length) % items.length;
                    items[activeResultIndex].classList.add('is-selected');
                    items[activeResultIndex].scrollIntoView({block:'nearest'});
                }else if(e.key === 'Enter'){
                    e.preventDefault();
                    if(items[activeResultIndex]){
                        items[activeResultIndex].click();
                    }
                }
            });

            // --- 2. Swiss Checkout Drawer System ---
            function openCheckout(){
                checkoutDrawer && checkoutDrawer.classList.add('is-active');
                checkoutDrawer && checkoutDrawer.setAttribute('aria-hidden', 'false');
                document.body.classList.add('menu-open');
            }

            function closeCheckout(){
                checkoutDrawer && checkoutDrawer.classList.remove('is-active');
                checkoutDrawer && checkoutDrawer.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('menu-open');
            }

            cartBtn && cartBtn.addEventListener('click', openCheckout);
            checkoutClose && checkoutClose.addEventListener('click', closeCheckout);
            checkoutBackdrop && checkoutBackdrop.addEventListener('click', closeCheckout);

            // Remove cart items & recalculate
            const removeButtons = document.querySelectorAll('.swiss-item-remove');
            const cartCountBadge = document.getElementById('swissCartCount');
            const subtotalEl = document.getElementById('swissSubtotal');
            const totalEl = document.getElementById('swissTotal');

            removeButtons.forEach(function(btn){
                btn.addEventListener('click', function(){
                    const item = btn.closest('.swiss-cart-item');
                    if(item){
                        item.style.opacity = '0';
                        item.style.transform = 'translateX(20px)';
                        item.style.transition = 'all .3s ease';
                        setTimeout(function(){
                            item.remove();
                            const remaining = document.querySelectorAll('.swiss-cart-item');
                            if(cartCountBadge) cartCountBadge.textContent = String(remaining.length);
                            if(remaining.length === 0){
                                if(subtotalEl) subtotalEl.textContent = '$0.00';
                                if(totalEl) totalEl.textContent = '$0.00 USD';
                                const body = document.querySelector('.swiss-checkout-items');
                                if(body) body.innerHTML = '<div class="swiss-search-empty">Your shopping bag is currently empty.</div>';
                            }else{
                                if(subtotalEl) subtotalEl.textContent = '$38.00';
                                if(totalEl) totalEl.textContent = '$38.00 USD';
                            }
                        }, 300);
                    }
                });
            });

            // Coupon Code handler
            const couponBtn = document.querySelector('.swiss-coupon-btn');
            const couponInput = document.querySelector('.swiss-coupon-input');
            if(couponBtn && couponInput){
                couponBtn.addEventListener('click', function(){
                    const code = couponInput.value.trim().toUpperCase();
                    if(code === 'TUNETRACK' || code === 'SWISS2026'){
                        couponBtn.textContent = 'APPLIED (-15%)';
                        couponBtn.style.background = '#27ae60';
                        if(totalEl) totalEl.textContent = '$78.20 USD';
                    }else{
                        couponBtn.textContent = 'INVALID CODE';
                        couponBtn.style.background = '#e74c3c';
                        setTimeout(function(){
                            couponBtn.textContent = 'APPLY';
                            couponBtn.style.background = '#050505';
                        }, 1800);
                    }
                });
            }

            // Checkout CTA
            if(payBtn){
                payBtn.addEventListener('click', function(){
                    payBtn.innerHTML = '<span>CONNECTING SECURE GATEWAY...</span>';
                    setTimeout(function(){
                        alert('Order checkout demo initiated. In production, this connects to your payment provider (Stripe / Shopify).');
                        payBtn.innerHTML = '<span>PROCEED TO CHECKOUT</span><span>→</span>';
                    }, 800);
                });
            }

            
            // --- Reactive Cart State (Real Data Sync) ---
            let cartItems = [];

            function updateCartUI(){
                const badge = document.getElementById('swissCartCount');
                const headBadge = document.getElementById('swissCartHeaderBadge');
                const list = document.getElementById('swissCartItemsList');
                const subtotalEl = document.getElementById('swissSubtotal');
                const totalEl = document.getElementById('swissTotal');

                const count = cartItems.length;
                if(badge){
                    badge.textContent = String(count);
                    badge.style.display = count > 0 ? 'flex' : 'none';
                }
                if(headBadge){
                    headBadge.textContent = 'BAG / ' + (count < 10 ? '0' + count : count) + ' ITEMS';
                }

                if(!list) return;

                if(count === 0){
                    list.innerHTML = '<div class="swiss-search-empty" id="swissEmptyCartNotice">Your bag is currently empty.<br><small style="opacity:0.6;margin-top:4px;display:block">Click "+ ADD TO BAG" on products in the page.</small></div>';
                    if(subtotalEl) subtotalEl.textContent = '$0.00';
                    if(totalEl) totalEl.textContent = '$0.00 USD';
                } else {
                    let sum = 0;
                    list.innerHTML = cartItems.map(function(item, idx){
                        sum += Number(item.price);
                        return '<div class="swiss-cart-item">' +
                            '<div class="swiss-cart-item-info">' +
                                '<span class="swiss-item-code">' + (item.code || 'ASSET-0' + (idx+1)) + '</span>' +
                                '<h4 class="swiss-item-name">' + item.name + '</h4>' +
                                '<p class="swiss-item-spec">' + (item.spec || 'Instant Digital Download') + '</p>' +
                            '</div>' +
                            '<div class="swiss-cart-item-pricing">' +
                                '<span class="swiss-item-price">$' + Number(item.price).toFixed(2) + '</span>' +
                                '<button type="button" class="swiss-item-remove" data-del="' + idx + '" title="Remove item">✕</button>' +
                            '</div>' +
                        '</div>';
                    }).join('');

                    if(subtotalEl) subtotalEl.textContent = '$' + sum.toFixed(2);
                    if(totalEl) totalEl.textContent = '$' + sum.toFixed(2) + ' USD';

                    list.querySelectorAll('.swiss-item-remove').forEach(function(b){
                        b.addEventListener('click', function(){
                            const i = parseInt(b.getAttribute('data-del'), 10);
                            cartItems.splice(i, 1);
                            updateCartUI();
                        });
                    });
                }
            }

            // Bind Add-to-Cart buttons in Index
            document.querySelectorAll('[data-product]').forEach(function(btn){
                btn.addEventListener('click', function(){
                    try{
                        const p = JSON.parse(btn.getAttribute('data-product'));
                        cartItems.push(p);
                        updateCartUI();
                        openCheckout();
                    }catch(e){}
                });
            });

            updateCartUI();


            // Global ESC key to close search or checkout
            document.addEventListener('keydown', function(e){
                if(e.key === 'Escape'){
                    closeSearch();
                    closeCheckout();
                }
            });
        })();


        
        /* ---------------------------------------------------------
           SMART AUTO-HIDE HEADER & REFINED LIQUID SEARCH
        --------------------------------------------------------- */
        (function initRefinedHeaderAndSearch(){
            const header = document.getElementById('tnco-header');
            const searchBtn = document.getElementById('swissSearchBtn');
            const searchOverlay = document.getElementById('swissSearchOverlay');
            const searchBackdrop = document.getElementById('swissSearchBackdrop');
            const searchClose = document.getElementById('swissSearchClose');
            const searchInput = document.getElementById('swissSearchInput');
            const searchResults = document.getElementById('swissSearchResults');
            const searchCount = document.getElementById('swissSearchCount');

            
            // 1. Natural Sticky Auto-Hide (Zero Gap)
            let lastScroll = window.scrollY || 0;
            let tick = false;

            function onScroll(){
                const cur = window.scrollY || 0;
                // Saat scroll ke bawah melewati marquee, auto-hide smooth
                if(cur > lastScroll + 6 && cur > 100){
                    header && header.classList.add('is-hidden');
                } else if(cur < lastScroll - 6){
                    header && header.classList.remove('is-hidden');
                }
                lastScroll = cur;
                tick = false;
            }

            window.addEventListener('scroll', function(){
                if(!tick){
                    requestAnimationFrame(onScroll);
                    tick = true;
                }
            }, {passive:true});


            // 2. Curated Search Directory with Exact Destinations
            const searchDirectory = [
                {
                    title: 'Our Catalog ©',
                    desc: 'Browse complete digital worship tracks, pads & loops',
                    badge: 'CATALOG',
                    url: 'catalog-tntsco.html'
                },
                {
                    title: 'Starter Packs',
                    desc: 'Curated multitrack bundles & stems for church worship',
                    badge: 'BUNDLE',
                    url: 'catalog-tntsco.html'
                },
                {
                    title: 'All Media Library',
                    desc: 'Worship backgrounds, church graphics and countdowns',
                    badge: 'MEDIA',
                    url: 'catalog-tntsco.html'
                },
                {
                    title: 'NOEL med. GLORIA',
                    desc: 'Full worship arrangement & Ableton Live session sequencer',
                    badge: 'MULTITRACK',
                    url: '#products',
                    targetId: 'products'
                },
                {
                    title: 'WORSHIP TOOLS / 2026',
                    desc: 'Templates, sounds and practical church workflow resources',
                    badge: 'RESOURCE',
                    url: '#products',
                    targetId: 'products'
                },
                {
                    title: 'Tunetrack Papers',
                    desc: 'Notes for the people behind the sound',
                    badge: 'PAPERS',
                    url: 'blog-list.html'
                },
                {
                    title: 'Why the arrangement matters before the mix does',
                    desc: 'Tunetrack Papers · Practice notes (04 Min Read)',
                    badge: 'PAPER',
                    url: 'blog-list.html'
                },
                {
                    title: 'Building a live set that leaves room to breathe',
                    desc: 'Tunetrack Papers · Live set dynamics (06 Min Read)',
                    badge: 'PAPER',
                    url: 'blog-list.html'
                },
                {
                    title: '3D Rendering & Motion Design',
                    desc: 'Stage visual assets, 4K loops & editorial motion art',
                    badge: 'VISUAL',
                    url: '#ttEinarGallery',
                    targetId: 'ttEinarGallery'
                },
                {
                    title: 'Festival Expo & Visual Direction',
                    desc: 'Live crowd aesthetics & worship concert lighting',
                    badge: 'STAGE',
                    url: '#ttEinarGallery',
                    targetId: 'ttEinarGallery'
                },
                {
                    title: 'Contact & Support',
                    desc: 'Get in touch with Tunetrack licensing & engineering team',
                    badge: 'SUPPORT',
                    url: 'contactus.html'
                }
            ];

            let activeIdx = -1;

            function runSearch(query){
                if(!searchResults) return;
                const q = (query || '').trim().toLowerCase();

                // Kosongkan hasil jika user belum mengetik apapun
                if(!q){
                    searchResults.innerHTML = '';
                    if(searchCount) searchCount.textContent = 'TYPE A KEYWORD (E.G. CATALOG, GLORIA, PAPERS, MEDIA)';
                    activeIdx = -1;
                    return;
                }

                const matches = searchDirectory.filter(function(item){
                    return item.title.toLowerCase().includes(q) ||
                           item.desc.toLowerCase().includes(q) ||
                           item.badge.toLowerCase().includes(q);
                });

                const list = matches.slice();
                list.push({
                    title: 'Open "' + query.trim() + '" in Catalog',
                    desc: 'Jump directly to Tunetrack full library search for ' + query.trim(),
                    badge: 'CATALOG',
                    url: 'catalog-tntsco.html'
                });

                if(searchCount){
                    searchCount.textContent = matches.length + ' MATCH' + (matches.length === 1 ? '' : 'ES') + ' FOUND · PRESS ENTER TO OPEN';
                }

                activeIdx = 0;
                searchResults.innerHTML = list.map(function(item, idx){
                    return '<div class="swiss-search-item' + (idx === 0 ? ' is-selected' : '') + '" data-url="' + item.url + '" data-target="' + (item.targetId || '') + '">' +
                        '<div class="swiss-search-item-main">' +
                            '<span class="swiss-search-item-title">' + item.title + '</span>' +
                            '<span class="swiss-search-item-desc">' + item.desc + '</span>' +
                        '</div>' +
                        '<span class="swiss-search-item-badge">' + item.badge + '</span>' +
                    '</div>';
                }).join('');

                searchResults.querySelectorAll('.swiss-search-item').forEach(function(el){
                    el.addEventListener('click', function(){
                        selectItem(el);
                    });
                });
            }

            function selectItem(el){
                const targetId = el.getAttribute('data-target');
                const url = el.getAttribute('data-url');
                closeSearchModal();

                if(targetId){
                    const node = document.getElementById(targetId);
                    if(node){
                        node.scrollIntoView({behavior:'smooth', block:'center'});
                        node.style.outline = '2px solid #0055ff';
                        setTimeout(function(){ node.style.outline = 'none'; }, 1600);
                        return;
                    }
                }
                if(url){
                    window.location.href = url;
                }
            }

            function openSearchModal(){
                searchOverlay && searchOverlay.classList.add('is-active');
                searchOverlay && searchOverlay.setAttribute('aria-hidden', 'false');
                document.body.classList.add('menu-open');
                if(searchInput){
                    searchInput.value = '';
                    runSearch('');
                    setTimeout(function(){ searchInput.focus(); }, 80);
                }
            }

            function closeSearchModal(){
                searchOverlay && searchOverlay.classList.remove('is-active');
                searchOverlay && searchOverlay.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('menu-open');
            }

            searchBtn && searchBtn.addEventListener('click', openSearchModal);
            searchClose && searchClose.addEventListener('click', closeSearchModal);
            searchBackdrop && searchBackdrop.addEventListener('click', closeSearchModal);

            searchInput && searchInput.addEventListener('input', function(e){
                runSearch(e.target.value);
            });

            searchInput && searchInput.addEventListener('keydown', function(e){
                const items = searchResults ? Array.from(searchResults.querySelectorAll('.swiss-search-item')) : [];
                if(!items.length) return;

                if(e.key === 'ArrowDown'){
                    e.preventDefault();
                    items[activeIdx] && items[activeIdx].classList.remove('is-selected');
                    activeIdx = (activeIdx + 1) % items.length;
                    items[activeIdx].classList.add('is-selected');
                    items[activeIdx].scrollIntoView({block:'nearest'});
                } else if(e.key === 'ArrowUp'){
                    e.preventDefault();
                    items[activeIdx] && items[activeIdx].classList.remove('is-selected');
                    activeIdx = (activeIdx - 1 + items.length) % items.length;
                    items[activeIdx].classList.add('is-selected');
                    items[activeIdx].scrollIntoView({block:'nearest'});
                } else if(e.key === 'Enter'){
                    e.preventDefault();
                    if(items[activeIdx]){
                        selectItem(items[activeIdx]);
                    }
                }
            });
        })();


        window.addEventListener('resize',function(){
            ScrollTrigger.refresh();
        },{passive:true});
    });
})();


/* ---------------------------------------------------------
   GLOBAL COOKIE CONTROLLER (100% UNBREAKABLE CLICK BINDING)
--------------------------------------------------------- */
(function(){
    const consentKey = 'tunetrack_cookie_consent_v1';

    window.ttDismissCookie = function(choice){
        try { localStorage.setItem(consentKey, choice || 'acknowledged'); } catch(e){}
        const bar = document.getElementById('ttCookiePopup');
        if(bar){
            bar.classList.add('is-hidden');
            setTimeout(function(){
                bar.style.display = 'none';
            }, 540);
        }
    };

    window.ttOpenCookiePref = function(){
        const modal = document.getElementById('ttCookiePrefModal');
        if(modal){
            modal.style.display = 'flex';
            setTimeout(function(){
                modal.classList.add('is-active');
            }, 20);
        }
    };

    window.ttCloseCookiePref = function(){
        const modal = document.getElementById('ttCookiePrefModal');
        if(modal){
            modal.classList.remove('is-active');
            setTimeout(function(){
                modal.style.display = 'none';
            }, 320);
        }
    };

    // Auto-check on load
    function checkCookieState(){
        try {
            if(localStorage.getItem(consentKey)){
                const bar = document.getElementById('ttCookiePopup');
                // Consent check bypassed for testing
            }
        }catch(e){}
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', checkCookieState);
    } else {
        checkCookieState();
    }
})();


/* ---------------------------------------------------------
   Y2K DREAM SLIDER: THIN PROGRESS TRACK & THUMB SWITCHING
--------------------------------------------------------- */
(function initY2kSlider(){
    const sliderWrap = document.getElementById('y2kSliderWrap');
    const thumb = document.getElementById('y2kIndicatorThumb');

    if(sliderWrap && thumb){
        function updateSliderProgress(){
            const scrollLeft = sliderWrap.scrollLeft;
            const maxScroll = sliderWrap.scrollWidth - sliderWrap.clientWidth;
            if(maxScroll > 0){
                const trackWidth = thumb.parentElement.clientWidth;
                const thumbWidth = thumb.clientWidth;
                const maxTravel = trackWidth - thumbWidth;
                const progress = scrollLeft / maxScroll;
                thumb.style.transform = 'translate3d(' + (progress * maxTravel) + 'px, 0, 0)';
            }
        }
        sliderWrap.addEventListener('scroll', updateSliderProgress, {passive:true});
        window.addEventListener('resize', updateSliderProgress, {passive:true});
        updateSliderProgress();
    }

    // Thumbnail variant image switching
    document.querySelectorAll('.y2k-card').forEach(function(card){
        const mainImg = card.querySelector('.y2k-main-img');
        const thumbs = card.querySelectorAll('.y2k-thumb');
        thumbs.forEach(function(t){
            t.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                thumbs.forEach(other => other.classList.remove('is-active'));
                t.classList.add('is-active');
                const tImg = t.querySelector('img');
                if(mainImg && tImg){
                    mainImg.style.opacity = '0.7';
                    setTimeout(function(){
                        mainImg.src = tImg.src.replace('&w=120', '&w=900');
                        mainImg.style.opacity = '1';
                    }, 120);
                }
            });
        });

        // Quick add action
        const quickAddBtn = card.querySelector('.y2k-quick-add');
        if(quickAddBtn){
            quickAddBtn.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                const title = card.querySelector('.y2k-card-title')?.textContent || 'Y2K Item';
                const priceText = card.querySelector('.y2k-card-price')?.textContent || 'Rp 1.000.000';
                quickAddBtn.textContent = '✓ Added';
                quickAddBtn.style.background = '#0055ff';
                setTimeout(function(){
                    quickAddBtn.textContent = '+ Quick add';
                    quickAddBtn.style.background = '#000000';
                }, 1400);
            });
        }
    });
})();







/* ---------------------------------------------------------
   CHAEL SUBTEXT HOVER PREVIEW (3:4 RATIO IMAGE)
--------------------------------------------------------- */
(function initChaelHoverPreview(){
    const trigger = document.getElementById('ttChaelTrigger');
    const wrap = document.getElementById('ttChaelPreviewWrap');

    if(trigger && wrap){
        trigger.addEventListener('mouseenter', function(){
            wrap.classList.add('is-visible');
        });
        trigger.addEventListener('mouseleave', function(){
            wrap.classList.remove('is-visible');
        });
        window.addEventListener('mousemove', function(e){
            wrap.style.left = (e.clientX + 28) + 'px';
            wrap.style.top = (e.clientY - 20) + 'px';
        }, {passive:true});
    }

    // Carousel track navigation controls for revised 3-card layout
    const track = document.getElementById('ttEinarTrack');
    const prevBtn = document.getElementById('ttGalleryPrev');
    const nextBtn = document.getElementById('ttGalleryNext');
    // Persist the carousel's exact horizontal position so it never jumps back
    // to the starting point when the page/section is revisited or this block is re-run.
    const manualOffsetKey = 'tt-einar-carousel-offset';
    let manualOffset = 0;
    if(track){
        const storedOffset = Number(sessionStorage.getItem(manualOffsetKey));
        if(Number.isFinite(storedOffset)) manualOffset = storedOffset;
        track.dataset.manualOffset = String(manualOffset);
    }

    function applyManualOffset(){
        if(!track) return;
        track.style.transform = 'translate3d(' + manualOffset + 'px, 0, 0)';
        track.dataset.manualOffset = String(manualOffset);
        sessionStorage.setItem(manualOffsetKey, String(manualOffset));
    }

    const step = 310;
    if(nextBtn && track){
        nextBtn.addEventListener('click', function(e){
            e.preventDefault();
            const maxScroll = Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 100);
            manualOffset = Math.max(-maxScroll, manualOffset - step);
            applyManualOffset();
        });
    }
    if(prevBtn && track){
        prevBtn.addEventListener('click', function(e){
            e.preventDefault();
            manualOffset = Math.min(0, manualOffset + step);
            applyManualOffset();
        });
    }

    // Wheel / trackpad control for the existing image carousel.
    // Only intercept scrolling while the pointer is over this carousel.
    const carouselStage = document.getElementById('ttEinarCarouselStage');
    if(carouselStage && track){
        carouselStage.addEventListener('wheel', function(e){
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if(!delta) return;

            const maxScroll = Math.max(0, track.scrollWidth - carouselStage.clientWidth + 100);
            if(maxScroll <= 0) return;

            // The page keeps its native vertical scroll. The same gesture advances
            // the image rail, and the resulting position is persisted immediately.
            manualOffset = Math.max(-maxScroll, Math.min(0, manualOffset - delta));
            applyManualOffset();
        }, {passive:true});

        // Restore the last known position after layout has settled.
        requestAnimationFrame(function(){
            const maxScroll = Math.max(0, track.scrollWidth - carouselStage.clientWidth + 100);
            manualOffset = Math.max(-maxScroll, Math.min(0, manualOffset));
            applyManualOffset();
        });
    }
})();

/* =========================================================
   TUNETRACK SHOWCASE — FINAL DATA-DRIVEN VERSION
   DATA  : data-catalog.js
   ORDER : Pasted text.txt
   UI    : stable layout + smooth slide transitions
========================================================= */

(function () {
    'use strict';

    const CATALOG_URL =
        'https://raw.githubusercontent.com/ryankandhaara/tunetrack2-website/main/tunetrack/assets/js/data-catalog.js';

    const SHOWCASE_ORDER = [
        'Yang Terutama',
        'Turn it Up',
        'Puji dia Yesus Sukacitaku',
        'Penulis Hidupku',
        'This is Living 2025',
        'Yesus Kumenyembahmu',
        'Nothing Is Impossible',
        'Lebih dari Pemenang 2026'
    ];

    const section = document.getElementById('showcase-section');
    if (!section) return;

    const headline = document.getElementById('showcase-headline');
    const description = document.getElementById('showcase-desc');
    const tags = document.getElementById('showcase-tags');
    const primaryButton = document.getElementById('showcase-primary-btn');
    const secondaryButton = document.getElementById('showcase-secondary-btn');
    const cardTitle = document.getElementById('showcase-title');
    const statusBadge = document.getElementById('instrument-status-badge');
    const youtubeContainer = document.getElementById('showcase-youtube');
    const dotsContainer = document.getElementById('showcase-dots');
    const previousButton = document.getElementById('slide-prev');
    const nextButton = document.getElementById('slide-next');
    const layout = section.querySelector('.showcase-layout');
    const mediaWrapper = section.querySelector('.instrument-card-wrapper');

    if (!headline || !description || !tags || !primaryButton ||
        !secondaryButton || !cardTitle || !statusBadge ||
        !youtubeContainer || !dotsContainer ||
        !previousButton || !nextButton) {
        console.warn('[Tunetrack Showcase] Required showcase elements are missing.');
        return;
    }

    let products = [];
    let currentIndex = 0;
    let isAnimating = false;
    let observer = null;
    let observerPause = false;

    /* ---------------------------------------------------------
       Stable / polished UI layer.
       This is injected here so the JS remains drop-in and does not
       require replacing the user's current stylesheet.
    --------------------------------------------------------- */
    const style = document.createElement('style');
    style.id = 'tunetrack-showcase-final-ui';
    style.textContent = `
        #showcase-section .showcase-layout {
            align-items: start !important;
            grid-template-columns: minmax(0, 1fr) minmax(500px, 600px) !important;
            gap: clamp(48px, 5vw, 88px) !important;
        }

        #showcase-section .showcase-layout > div {
            min-width: 0;
        }

        #showcase-section .showcase-layout > div:first-child {
            padding-top: 2px;
        }

        #showcase-section .instrument-card-wrapper {
            width: 100% !important;
            min-height: 0 !important;
        }

        #showcase-section .instrument-card {
            width: 100% !important;
            min-height: 0 !important;
        }

        #showcase-section .instrument-header-row {
            min-height: 30px;
        }

        #showcase-section .instrument-header {
            font-size: 0 !important;
            line-height: 1 !important;
            width: 1px !important;
            min-width: 1px !important;
            overflow: hidden !important;
        }

        #showcase-section .instrument-header::after {
            content: 'LIVE SESSION';
            display: block;
            width: max-content;
            font-size: 11px;
            line-height: 1;
            letter-spacing: .14em;
            font-family: var(--font-mono, monospace);
            font-weight: 800;
            opacity: .78;
        }

        #showcase-section .showcase-youtube-card {
            position: relative;
            isolation: isolate;
        }

        #showcase-section .showcase-youtube-panel {
            aspect-ratio: 16 / 9 !important;
            min-height: 0 !important;
            height: auto !important;
        }

        #showcase-section .showcase-youtube-panel > iframe,
        #showcase-section .showcase-youtube-panel > img {
            transition: opacity .34s ease, transform .55s cubic-bezier(.22,.61,.36,1), filter .34s ease;
        }

        #showcase-section .showcase-youtube-panel.is-loading > iframe,
        #showcase-section .showcase-youtube-panel.is-loading > img {
            opacity: .18;
            transform: scale(1.035);
            filter: blur(3px);
        }

        #showcase-section .showcase-live-overlay {
            position: absolute;
            left: 16px;
            bottom: 14px;
            z-index: 4;
            display: flex;
            align-items: center;
            gap: 9px;
            pointer-events: none;
            padding: 8px 11px;
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 999px;
            background: rgba(0,0,0,.58);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }

        #showcase-section .showcase-live-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 0 0 rgba(255,255,255,.55);
            animation: ttShowcasePulse 1.65s ease-out infinite;
        }

        #showcase-section .showcase-live-label {
            font: 800 9px/1 var(--font-mono, monospace);
            letter-spacing: .14em;
            color: #fff;
        }

        #showcase-section .showcase-waveform {
            position: absolute;
            right: 15px;
            bottom: 15px;
            z-index: 4;
            display: flex;
            align-items: center;
            gap: 2px;
            height: 28px;
            padding: 7px 9px;
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 999px;
            background: rgba(0,0,0,.48);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            pointer-events: none;
        }

        #showcase-section .showcase-waveform span {
            width: 2px;
            height: var(--h, 9px);
            border-radius: 999px;
            background: rgba(255,255,255,.82);
            transform-origin: center;
            animation: ttShowcaseWave .95s ease-in-out infinite alternate;
            animation-delay: var(--d, 0ms);
        }

        #showcase-section .showcase-slide-content {
            transition: opacity .28s ease, transform .46s cubic-bezier(.22,.61,.36,1), filter .28s ease;
            will-change: opacity, transform;
        }

        #showcase-section .showcase-slide-content.is-exiting {
            opacity: 0;
            transform: translate3d(var(--slide-out-x, -34px), 0, 0);
            filter: blur(2px);
        }

        #showcase-section .showcase-slide-content.is-entering {
            opacity: 0;
            transform: translate3d(var(--slide-in-x, 34px), 0, 0);
            filter: blur(2px);
        }

        #showcase-section .showcase-slide-content.is-settled {
            opacity: 1;
            transform: translate3d(0,0,0);
            filter: blur(0);
        }

        #showcase-section .showcase-dot {
            transition: width .28s cubic-bezier(.22,.61,.36,1), background .25s ease, transform .25s ease;
        }

        #showcase-section .showcase-dot:active {
            transform: scale(.88);
        }

        @keyframes ttShowcasePulse {
            0% { box-shadow: 0 0 0 0 rgba(255,255,255,.48); }
            70% { box-shadow: 0 0 0 7px rgba(255,255,255,0); }
            100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }

        @keyframes ttShowcaseWave {
            from { transform: scaleY(.55); opacity: .52; }
            to { transform: scaleY(1.15); opacity: 1; }
        }

        @media (max-width: 1100px) {
            #showcase-section .showcase-layout {
                grid-template-columns: minmax(0, 1fr) minmax(440px, 520px) !important;
                gap: 44px !important;
            }
        }

        @media (max-width: 900px) {
            #showcase-section .showcase-layout {
                grid-template-columns: 1fr !important;
                gap: 42px !important;
            }
            #showcase-section .showcase-media-column {
                width: min(100%, 600px) !important;
            }
        }

        @media (max-width: 560px) {
            #showcase-section .showcase-layout {
                gap: 30px !important;
            }
            #showcase-section .showcase-live-overlay {
                left: 10px;
                bottom: 10px;
            }
            #showcase-section .showcase-waveform {
                right: 10px;
                bottom: 10px;
            }
        }
    `;
    document.head.appendChild(style);

    /* Wrap both visible columns once. This gives the whole slide one
       controlled animation while the grid itself never moves or reflows. */
    let animatedColumns = [];
    if (layout) {
        animatedColumns = Array.from(layout.children).slice(0, 2);
        animatedColumns.forEach(function (column) {
            column.classList.add('showcase-slide-content', 'is-settled');
        });
    }

    if (mediaWrapper) {
        mediaWrapper.style.flex = '1 1 auto';
    }

    function normalizeTitle(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[–—]/g, '-')
            .replace(/\s+/g, ' ');
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getYoutubeId(value) {
        if (!value) return '';

        const source = String(value).trim();
        const patterns = [
            /youtube\.com\/watch\?v=([^&]+)/i,
            /youtube\.com\/embed\/([^?&/]+)/i,
            /youtube-nocookie\.com\/embed\/([^?&/]+)/i,
            /youtu\.be\/([^?&/]+)/i
        ];

        for (const pattern of patterns) {
            const match = source.match(pattern);
            if (match) return match[1];
        }

        return /^[A-Za-z0-9_-]{6,20}$/.test(source)
            ? source
            : '';
    }

    function parseCatalogSource(source) {
        const start = source.indexOf('[');
        const end = source.lastIndexOf(']');

        if (start < 0 || end <= start) {
            throw new Error('Products array was not found in data-catalog.js.');
        }

        const arraySource = source.slice(start, end + 1);
        let data;

        try {
            data = JSON.parse(arraySource);
        } catch (_) {
            data = Function('"use strict"; return (' + arraySource + ');')();
        }

        if (!Array.isArray(data)) {
            throw new Error('data-catalog.js did not contain a product array.');
        }

        return data;
    }

    async function loadCatalog() {
        const response = await fetch(CATALOG_URL + '?showcase=' + Date.now(), {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Catalog request failed: HTTP ' + response.status);
        }

        return parseCatalogSource(await response.text());
    }

    function buildOrderedProducts(catalog) {
        const lookup = new Map();

        catalog.forEach(function (product) {
            if (!product || !product.title) return;
            lookup.set(normalizeTitle(product.title), product);
        });

        return SHOWCASE_ORDER.map(function (requestedTitle) {
            const product = lookup.get(normalizeTitle(requestedTitle));
            if (!product) {
                console.warn('[Tunetrack Showcase] Missing catalog product:', requestedTitle);
            }
            return product;
        }).filter(Boolean);
    }

    function setHref(element, href) {
        element.href = href || '#';
    }

    function descriptionFor(product, index) {
        const free = String(product.price || '').trim().toLowerCase() === 'free';
        const templates = [
            'A polished multitrack featuring a full arrangement, clear sections, and production-ready stems for flexible sessions.',
            'A production-focused sequence with layered parts, musical transitions, and enough detail to shape your own mix.',
            'A worship-ready multitrack built around expressive sections, balanced instrumentation, and a clean workflow from start to finish.',
            'A carefully arranged sequence with useful stems, dynamic movement, and plenty of room for your own creative direction.',
            'A versatile multitrack designed for rehearsals, live playback, and detailed production work inside your favorite DAW.',
            'A tightly produced sequence with musical depth, practical stems, and an arrangement that stays easy to customize.',
            'A complete session built for flexible worship production, with structured parts, smooth transitions, and a focused sonic foundation.',
            'A ready-to-shape multitrack combining useful layers, clear song sections, and production details that keep sessions moving.'
        ];

        let copy = templates[index % templates.length];
        if (free) {
            copy = copy.replace(/A /, 'A free ');
        }
        return copy;
    }

    function buildTags(product) {
        const source = Array.isArray(product.category) ? product.category : [];
        const normalized = source
            .map(function (item) { return String(item || '').trim().toUpperCase(); })
            .filter(Boolean);

        const free = String(product.price || '').trim().toLowerCase() === 'free';
        const defaults = ['PRAISE', 'MULTITRACK', 'SEQUENCER'];
        const extra = free ? ['FREEBIES', 'PRODUCTION'] : ['PRODUCTION', 'SESSION'];

        const all = defaults.concat(normalized, extra);
        const seen = new Set();
        return all.filter(function (item) {
            if (!item || seen.has(item)) return false;
            seen.add(item);
            return true;
        }).slice(0, 6);
    }

    function renderDots() {
        dotsContainer.innerHTML = products.map(function (_, index) {
            return `
                <button
                    type="button"
                    class="showcase-dot ${index === currentIndex ? 'is-active' : ''}"
                    data-showcase-index="${index}"
                    aria-label="Showcase ${index + 1}">
                </button>
            `;
        }).join('');

        dotsContainer.querySelectorAll('[data-showcase-index]').forEach(function (dot) {
            dot.addEventListener('click', function () {
                const nextIndex = Number(dot.dataset.showcaseIndex);
                goTo(nextIndex, nextIndex > currentIndex ? 1 : -1);
            });
        });
    }

    function createWaveform() {
        const waveform = document.createElement('div');
        waveform.className = 'showcase-waveform';
        waveform.setAttribute('aria-hidden', 'true');

        const heights = [8,14,22,11,18,25,13,20,9,16,24,12,19,10,15,23,12,18];
        waveform.innerHTML = heights.map(function (height, i) {
            return '<span style="--h:' + height + 'px;--d:' + (i * 42) + 'ms"></span>';
        }).join('');
        return waveform;
    }

    function createLiveOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'showcase-live-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = '<span class="showcase-live-dot"></span><span class="showcase-live-label">LIVE SESSION</span>';
        return overlay;
    }

    function renderMedia(product) {
        const youtubeId = getYoutubeId(product.youtube);
        const image = product.image || '';
        const panel = youtubeContainer;

        panel.classList.add('is-loading');
        panel.innerHTML = '';

        if (youtubeId) {
            statusBadge.textContent = 'LIVE VIDEO';

            const iframe = document.createElement('iframe');
            iframe.src =
                'https://www.youtube.com/embed/' +
                encodeURIComponent(youtubeId) +
                '?rel=0&modestbranding=1';
            iframe.title = 'Live product preview';
            iframe.loading = 'lazy';
            iframe.allow =
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.addEventListener('load', function () {
                panel.classList.remove('is-loading');
            }, { once: true });
            panel.appendChild(iframe);
        } else if (image) {
            statusBadge.textContent = 'LIVE VIDEO';

            const img = document.createElement('img');
            img.src = image;
            img.alt = 'Product preview';
            img.loading = 'eager';
            img.addEventListener('load', function () {
                panel.classList.remove('is-loading');
            }, { once: true });
            panel.appendChild(img);
        } else {
            statusBadge.textContent = 'LIVE VIDEO';
            const empty = document.createElement('div');
            empty.className = 'showcase-no-video';
            empty.textContent = 'LIVE VIDEO';
            panel.appendChild(empty);
            requestAnimationFrame(function () { panel.classList.remove('is-loading'); });
        }

        panel.appendChild(createLiveOverlay());
        panel.appendChild(createWaveform());
    }

    function updateContent(product, index) {
        const title = product.title || '';
        const link = product.link || '#';
        const exclusive = product.exclusive === true;
        const exclusivePage = product.exclusivePage || '';

        /* LEFT — catalog title + reusable generic editorial copy. */
        headline.textContent = title;
        description.textContent = descriptionFor(product, index);

        tags.innerHTML = buildTags(product).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');

        setHref(primaryButton, link);
        primaryButton.textContent =
            String(product.price || '').toLowerCase() === 'free'
                ? 'Get free'
                : (exclusive ? 'View exclusive' : 'View product');

        if (exclusive && exclusivePage) {
            setHref(secondaryButton, exclusivePage);
            secondaryButton.textContent = 'Exclusive item';
            secondaryButton.target = '_self';
            secondaryButton.removeAttribute('rel');
        } else {
            setHref(secondaryButton, link);
            secondaryButton.textContent = 'More info';
            secondaryButton.target = '_blank';
            secondaryButton.rel = 'noopener';
        }

        /* IMPORTANT: never repeat the product title inside the media card. */
        cardTitle.textContent = '';

        renderMedia(product);
        renderDots();
    }

    function settleColumns() {
        animatedColumns.forEach(function (column) {
            column.classList.remove('is-exiting', 'is-entering');
            column.classList.add('is-settled');
            column.style.removeProperty('--slide-out-x');
            column.style.removeProperty('--slide-in-x');
        });
    }

    function goTo(nextIndex, direction) {
        if (!products.length || isAnimating) return;

        const normalizedIndex =
            (nextIndex + products.length) % products.length;

        if (normalizedIndex === currentIndex) return;

        const dir = direction >= 0 ? 1 : -1;
        isAnimating = true;
        observerPause = true;

        animatedColumns.forEach(function (column) {
            column.style.setProperty('--slide-out-x', (dir * -42) + 'px');
            column.classList.remove('is-settled', 'is-entering');
            column.classList.add('is-exiting');
        });

        window.setTimeout(function () {
            currentIndex = normalizedIndex;
            updateContent(products[currentIndex], currentIndex);

            animatedColumns.forEach(function (column) {
                column.style.setProperty('--slide-in-x', (dir * 42) + 'px');
                column.classList.remove('is-exiting', 'is-settled');
                column.classList.add('is-entering');
            });

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    animatedColumns.forEach(function (column) {
                        column.classList.remove('is-entering');
                        column.classList.add('is-settled');
                    });
                });
            });

            window.setTimeout(function () {
                isAnimating = false;
                observerPause = false;
            }, 500);
        }, 280);
    }

    function installObserver() {
        if (observer || !section) return;

        observer = new MutationObserver(function () {
            if (observerPause || isAnimating || !products.length) return;

            const activeTitle = products[currentIndex]?.title || '';
            if (headline.textContent !== activeTitle) {
                updateContent(products[currentIndex], currentIndex);
            }
        });

        observer.observe(section, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    previousButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (!products.length) return;
        goTo(currentIndex - 1, -1);
    });

    nextButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (!products.length) return;
        goTo(currentIndex + 1, 1);
    });

    /* Keyboard navigation is intentionally scoped to this showcase. */
    section.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') goTo(currentIndex - 1, -1);
        if (event.key === 'ArrowRight') goTo(currentIndex + 1, 1);
    });

    async function init() {
        try {
            const catalog = await loadCatalog();
            products = buildOrderedProducts(catalog);

            if (!products.length) {
                throw new Error('No showcase products matched the requested order.');
            }

            currentIndex = 0;
            observerPause = true;
            updateContent(products[currentIndex], currentIndex);
            observerPause = false;
            installObserver();

            console.log(
                '[Tunetrack Showcase] Loaded:',
                products.map(function (product) { return product.title; })
            );
        } catch (error) {
            console.error('[Tunetrack Showcase] Failed:', error);
        }
    }

    init();
})();

/* =========================================================
   PANGRAM-STYLE BLOG LOGIC (Ruler, Local Search, Pills)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // 1. FILTER PILLS TOGGLE LOGIC
    const categoryBtns = document.querySelectorAll('#pgBlogCategories .pg-cat-btn:not(.pg-cat-special)');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
        });
    });

    // 2. RULER PAGINATION LOGIC
    const viewport = document.getElementById('pgBlogViewport');
    const track = document.getElementById('pgBlogTrack');
    const rulerTrack = document.getElementById('pgRulerTrack');
    const rulerThumb = document.getElementById('pgRulerThumb');

    if (viewport && rulerTrack && rulerThumb) {
        let isDraggingRuler = false;
        
        const updateThumbPosition = () => {
            if (isDraggingRuler) return;
            const scrollMax = track.scrollWidth - viewport.clientWidth;
            if (scrollMax <= 0) return;

            const scrollPercentage = viewport.scrollLeft / scrollMax;
            const isMobile = window.innerWidth <= 900;
            
            if (isMobile) {
                const rulerTravel = rulerTrack.clientWidth - rulerThumb.clientWidth;
                rulerThumb.style.transform = `translate3d(${scrollPercentage * rulerTravel}px, 0, 0)`;
            } else {
                const rulerTravel = rulerTrack.clientHeight - rulerThumb.clientHeight;
                rulerThumb.style.transform = `translate3d(0, ${scrollPercentage * rulerTravel}px, 0)`;
            }
        };

        viewport.addEventListener('scroll', () => requestAnimationFrame(updateThumbPosition));
        window.addEventListener('resize', updateThumbPosition);

        const moveScrollByRuler = (e) => {
            const rect = rulerTrack.getBoundingClientRect();
            const scrollMax = track.scrollWidth - viewport.clientWidth;
            const isMobile = window.innerWidth <= 900;
            
            if (isMobile) {
                const clickPos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percentage = clickPos / rect.width;
                viewport.scrollTo({ left: percentage * scrollMax, behavior: 'instant' });
            } else {
                const clickPos = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
                const percentage = clickPos / rect.height;
                viewport.scrollTo({ left: percentage * scrollMax, behavior: 'instant' });
            }
        };

        rulerTrack.addEventListener('pointerdown', (e) => {
            isDraggingRuler = true;
            rulerTrack.setPointerCapture(e.pointerId);
            moveScrollByRuler(e);
        });

        rulerTrack.addEventListener('pointermove', (e) => {
            if (!isDraggingRuler) return;
            moveScrollByRuler(e);
        });

        const stopDragging = () => { isDraggingRuler = false; };
        rulerTrack.addEventListener('pointerup', stopDragging);
        rulerTrack.addEventListener('pointercancel', stopDragging);

        updateThumbPosition();
    }

    // 3. LOCAL SEARCH LOGIC
    const searchInput = document.getElementById('pgLocalSearch');
    const searchDropdown = document.getElementById('pgSearchDropdown');
    const cards = document.querySelectorAll('.pg-flip-card');

    if (searchInput && searchDropdown && cards.length > 0) {
        // Build local index
        const blogIndex = Array.from(cards).map(card => {
            return {
                id: card.id,
                title: card.getAttribute('data-title'),
                element: card
            };
        });

        // Hide dropdown clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.pg-search-container')) {
                searchDropdown.classList.remove('is-active');
            }
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchDropdown.innerHTML = '';

            if (query.length === 0) {
                searchDropdown.classList.remove('is-active');
                return;
            }

            const matches = blogIndex.filter(item => item.title.toLowerCase().includes(query));

            if (matches.length > 0) {
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'pg-search-item';
                    div.textContent = match.title;
                    div.addEventListener('click', () => {
                        // Scroll viewport to the card
                        const scrollPos = match.element.offsetLeft - 40; // Offset padding
                        viewport.scrollTo({ left: scrollPos, behavior: 'smooth' });
                        
                        // Close dropdown & clear
                        searchDropdown.classList.remove('is-active');
                        searchInput.value = '';

                        // Give it a brief highlight (trigger hover via CSS class optionally)
                        match.element.querySelector('.pg-card-inner').style.transform = 'rotateY(180deg)';
                        setTimeout(() => {
                            match.element.querySelector('.pg-card-inner').style.transform = '';
                        }, 2000);
                    });
                    searchDropdown.appendChild(div);
                });
                searchDropdown.classList.add('is-active');
            } else {
                searchDropdown.innerHTML = '<div class="pg-search-item" style="color:#666;">No post found...</div>';
                searchDropdown.classList.add('is-active');
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".tt-vcard-card");

    cards.forEach(card => {
        const textElement = card.querySelector(".tt-vcard-tw-text");
        if (!textElement) return;

        const fullText = textElement.getAttribute("data-text");
        if (!fullText) return;

        let timeoutId = null;
        textElement.textContent = "";

        card.addEventListener("mouseenter", () => {
            textElement.textContent = "";
            let charIndex = 0;
            const speed = Math.max(20, 1000 / fullText.length);

            function typeChar() {
                if (charIndex < fullText.length) {
                    textElement.textContent += fullText.charAt(charIndex);
                    charIndex++;
                    timeoutId = setTimeout(typeChar, speed);
                }
            }
            typeChar();
        });

        card.addEventListener("mouseleave", () => {
            if (timeoutId) clearTimeout(timeoutId);
            textElement.textContent = "";
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('swissSearchBtn');
    const overlay = document.getElementById('swissSearchOverlay');
    const input = document.getElementById('swissSearchInput');
    const results = document.getElementById('swissSearchResults');
    const count = document.getElementById('swissSearchCount');
    const close = document.getElementById('swissSearchClose');
    const backdrop = document.getElementById('swissSearchBackdrop');

    if (!btn || !overlay || !input || !results) return;

    function doSearch(query) {
        const q = query.trim().toLowerCase();

        if (!q) {
            results.innerHTML = '';
            count.textContent = 'TYPE A KEYWORD TO SEARCH';
            return;
        }

        const found = [];
        const seen = new Set();

        document.querySelectorAll('h1,h2,h3,h4,h5,p,a,button,[data-title]').forEach(function (el) {
            const text = (el.textContent || el.getAttribute('data-title') || '')
                .replace(/\s+/g, ' ')
                .trim();

            if (!text || text.length < 2) return;

            if (text.toLowerCase().includes(q)) {
                const key = text.toLowerCase();

                if (seen.has(key)) return;
                seen.add(key);

                found.push({
                    title: text,
                    element: el
                });
            }
        });

        count.textContent =
            found.length + ' RESULT' + (found.length === 1 ? '' : 'S') +
            ' FOR "' + query.toUpperCase() + '"';

        if (!found.length) {
            results.innerHTML =
                '<div class="swiss-search-empty">' +
                'No results found for "' + query + '"' +
                '</div>';
            return;
        }

        results.innerHTML = found.slice(0, 30).map(function (item, index) {
            return `
                <div class="swiss-search-item ${index === 0 ? 'is-selected' : ''}" data-index="${index}">
                    <div class="swiss-search-item-main">
                        <span class="swiss-search-item-title">${item.title}</span>
                        <span class="swiss-search-item-desc">Tunetrack · Search result</span>
                    </div>
                    <span class="swiss-search-item-badge">RESULT</span>
                </div>
            `;
        }).join('');

        results.querySelectorAll('.swiss-search-item').forEach(function (item, index) {
            item.addEventListener('click', function () {
                const target = found[index].element;

                overlay.classList.remove('is-active');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('menu-open');

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            });
        });
    }

    btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();

        overlay.classList.add('is-active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');

        input.value = '';
        results.innerHTML = '';
        count.textContent = 'TYPE A KEYWORD TO SEARCH';

        setTimeout(function () {
            input.focus();
        }, 100);
    };

    input.oninput = function () {
        doSearch(this.value);
    };

    close.onclick = function () {
        overlay.classList.remove('is-active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
    };

    backdrop.onclick = function () {
        overlay.classList.remove('is-active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
    };

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            overlay.classList.remove('is-active');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('menu-open');
        }
    });
});
/* =========================================================
   HERO VIDEO WALL — immediate independent autoplay
   No row waits for another row. No currentTime synchronization.
   ========================================================= */
(() => {
    const startHeroWallVideos = () => {
        const wall = document.querySelector('.tt-media-wall');
        if (!wall) return;

        wall.querySelectorAll('video').forEach((video) => {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.autoplay = true;
            video.preload = 'auto';
            video.play().catch(() => {});
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startHeroWallVideos, { once: true });
    } else {
        startHeroWallVideos();
    }
})();
