document.addEventListener("DOMContentLoaded", () => {
  // INDEX-STYLE HEADER: keep the header visible through the full hero, then
  // slide it smoothly upward only after the hero has completely passed.
  const tncoHeader = document.getElementById("tnco-header");
  const tncoHero = document.getElementById("hero");
  const syncHeroHeader = () => {
    if (!tncoHeader || !tncoHero) return;
    const heroBottom = tncoHero.getBoundingClientRect().bottom;
    tncoHeader.classList.toggle("is-hero-passed", heroBottom <= 0);
  };
  syncHeroHeader();
  window.addEventListener("scroll", syncHeroHeader, { passive: true });
  window.addEventListener("resize", syncHeroHeader, { passive: true });
  const data =
    typeof products !== "undefined" && Array.isArray(products) ? products : [];
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[ch],
    );
  const isFree = (p) =>
    String(p?.price ?? "")
      .trim()
      .toLowerCase() === "free" ||
    (Array.isArray(p?.category) && p.category.includes("freebies"));
  const isLimited = (p) =>
    Boolean(p?.exclusive) ||
    String(p?.price ?? "")
      .toLowerCase()
      .includes("exclusive");
  const isPaid = (p) => !isFree(p) && !isLimited(p);
  const typeOf = (p) =>
    isLimited(p) ? "CHRISTMAS SPECIAL" : isFree(p) ? "FREE" : "PAID";
  const usable = data.filter((p) => p && p.title);

  const imageCandidates = (p) => {
    const raw = String(p?.image || "").trim();
    if (!raw) return [];
    if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return [raw];
    const normalized = raw.replace(/^\.?\//, "");
    const candidates = [];
    if (normalized.startsWith("assets/thumbnail/"))
      candidates.push(
        normalized.replace(/^assets\/thumbnail\//, "assets/images/thumbnail/"),
      );
    if (normalized.startsWith("assets/images/thumbnail/"))
      candidates.push(normalized);
    else
      candidates.push(`assets/images/thumbnail/${normalized.split("/").pop()}`);
    candidates.push(normalized);
    return [...new Set(candidates)];
  };
  const imageCache = new Map();
  const resolveImage = (p) => {
    const key = String(p?.image || "");
    if (imageCache.has(key)) return imageCache.get(key);
    const candidates = imageCandidates(p);
    const promise = new Promise((resolve) => {
      let i = 0;
      const next = () => {
        if (i >= candidates.length) return resolve("");
        const src = candidates[i++];
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = next;
        img.src = src;
      };
      next();
    });
    imageCache.set(key, promise);
    return promise;
  };
  const shuffled = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const randomSet = (pool, count) =>
    shuffled(pool.length ? pool : usable).slice(
      0,
      Math.min(count, pool.length || usable.length),
    );
  const imageHtml = (id, p, cls = "") => {
    const c = imageCandidates(p);
    return `<img id="${id || ""}" class="${cls}" src="${esc(c[0] || "")}" data-fallback="${esc(c[1] || "")}" alt="${esc(p.title)}" loading="lazy">`;
  };
  const setImg = async (img, p) => {
    if (!img || !p) return;
    const src = await resolveImage(p);
    if (!src) {
      img.removeAttribute("src");
      img.classList.add("image-missing");
      return;
    }
    img.src = src;
    img.classList.add("is-loaded");
  };
  const productHref = (p) =>
    p?.productPage ||
    p?.url ||
    `product-page.html?item=${encodeURIComponent(p.title)}`;

  const allCount = document.getElementById("allCount");
  const freeCount = document.getElementById("freeCount");
  const paidCount = document.getElementById("paidCount");
  const limitedCount = document.getElementById("limitedCount");
  const totalCount = document.getElementById("totalCount");
  if (allCount) allCount.textContent = String(usable.length).padStart(2, "0");
  if (freeCount)
    freeCount.textContent = String(usable.filter(isFree).length).padStart(
      2,
      "0",
    );
  if (paidCount)
    paidCount.textContent = String(usable.filter(isPaid).length).padStart(
      2,
      "0",
    );
  if (limitedCount)
    limitedCount.textContent = String(usable.filter(isLimited).length).padStart(
      2,
      "0",
    );
  if (totalCount) {
    totalCount.textContent = "000";
    totalCount.dataset.target = String(usable.length);
  }

  // TOP HERO — single looping video, no carousel/slideshow.
  const heroVideo = document.querySelector(".catalog-rinse-single-video");
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.loop = true;
    heroVideo.play().catch(() => {
      const startHero = () => heroVideo.play().catch(() => {});
      document.addEventListener("click", startHero, { once: true });
      document.addEventListener("touchstart", startHero, { once: true });
    });
  }

  // FEATURED / ROOM / LATEST — Rinse-inspired presentation.
  const mustPlayTrack = document.getElementById("mustPlayTrack");
  const mustPlayItems = randomSet(usable, 8);

  const formatMustPlayTag = (value) => {
    const raw = String(value ?? "")
      .replace(/[-_]/g, " ")
      .trim();
    if (!raw) return "";
    return raw.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const bindMustPlayControls = (card, product) => {
    const wishlist = card.querySelector(".wishlist");
    const play = card.querySelector(".play");

    wishlist?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const active = wishlist.classList.toggle("is-wishlisted");
      wishlist.textContent = active ? "★" : "☆";
      wishlist.setAttribute("aria-pressed", active ? "true" : "false");
    });

    play?.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Must Play / marquee cards always play the exact card product.
      // Do not resolve through the filtered catalog index.
      await loadTrack(product, -1, true);
    });
  };

  mustPlayItems.forEach((p, i) => {
    if (!mustPlayTrack) return;

    const a = document.createElement("a");
    a.className = "featured-card";
    a.href = productHref(p);
    a.dataset.productTitle = String(p.title || "");

    const categories = Array.isArray(p.category)
      ? p.category.filter(Boolean).map(String)
      : [];
    const tagPool = [
      ...categories,
      typeOf(p),
      p.artist || "TuneTrack",
      "Worship",
    ];
    const tagList = [
      ...new Set(
        tagPool
          .filter(Boolean)
          .map((v) => String(v).trim())
          .filter(Boolean),
      ),
    ].slice(0, 3);

    a.innerHTML = `
      ${imageHtml("", p)}
      <div class="rinse-card-channel">
        <span class="channel-dot">TT</span>
        <span>${esc(typeOf(p))}</span>
      </div>

      <div class="rinse-card-actions">
        <button
          type="button"
          class="rinse-card-action must-play-btn wishlist"
          aria-label="Add ${esc(p.title)} to wishlist"
          aria-pressed="false"
        >☆</button>

        <button
          type="button"
          class="rinse-card-action must-play-btn play"
          aria-label="Play ${esc(p.title)}"
        >▶</button>
      </div>

      <div class="featured-meta">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description || p.artist || "TuneTrack")}</p>
      </div>

      <div class="featured-tags">
        ${tagList.map((tag) => `<span class="featured-tag">${esc(formatMustPlayTag(tag))}</span>`).join("")}
      </div>
    `;

    mustPlayTrack.appendChild(a);
    setImg(a.querySelector("img"), p);
    bindMustPlayControls(a, p);
  });

  // Duplicate the same card set for the visual marquee.
  // Re-bind controls because cloneNode() does not copy listeners.
  if (mustPlayTrack && mustPlayItems.length) {
    const originals = Array.from(mustPlayTrack.children);

    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      mustPlayTrack.appendChild(clone);

      const product = mustPlayItems.find(
        (p) =>
          String(p.title || "") === String(clone.dataset.productTitle || ""),
      );
      if (product) bindMustPlayControls(clone, product);
    });
  }

  const editorialTrack = document.getElementById("editorialGrid");
  randomSet(usable, 7).forEach((p) => {
    if (!editorialTrack) return;
    const a = document.createElement("a");
    a.className = "editorial-card";
    a.href = productHref(p);
    a.dataset.productTitle = String(p.title || "");

    a.innerHTML = `
      ${imageHtml("", p)}
      <div class="editorial-copy">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description || p.artist || "TuneTrack — worship resources, multitracks and sequencers.")}</p>
      </div>
    `;

    editorialTrack.appendChild(a);
    setImg(a.querySelector("img"), p);
  });

  const latestTrack = document.getElementById("latestTrack");
  const latestItems = randomSet(usable, 10).slice(0, 10);

  // Recent Releases title cap: max 21 characters.
  // Any overflow is moved to the artist line after a pipe.
  const formatLatestTitle = (product) => {
    const originalTitle = String(product?.title || "").trim();
    const originalArtist = String(product?.artist || "TuneTrack").trim();
    const MAX_TITLE_CHARS = 21;

    if (!originalTitle || originalTitle.length <= MAX_TITLE_CHARS) {
      return { title: originalTitle, artist: originalArtist };
    }

    // Prefer keeping a parenthetical suffix intact when the main title fits.
    const bracketMatch = originalTitle.match(/^(.*?)(\s*\([^)]*\).*)$/);
    if (bracketMatch && bracketMatch[1].trim().length <= MAX_TITLE_CHARS) {
      return {
        title: bracketMatch[1].trim(),
        artist: `${originalArtist} | ${bracketMatch[2].trim()}`,
      };
    }

    // Otherwise cap at 21 characters without cutting a word when possible.
    const cut = originalTitle.slice(0, MAX_TITLE_CHARS);
    const lastSpace = cut.lastIndexOf(" ");
    const safeCut = lastSpace > 0 ? lastSpace : MAX_TITLE_CHARS;
    const title = originalTitle.slice(0, safeCut).trim();
    const remainder = originalTitle.slice(safeCut).trim();

    return {
      title,
      artist: remainder ? `${originalArtist} | ${remainder}` : originalArtist,
    };
  };

  latestItems.forEach((p, i) => {
    if (!latestTrack) return;

    const categories = Array.isArray(p.category)
      ? p.category.filter(Boolean).map(String)
      : [];
    const releaseDate = String(
      p.date || p.releaseDate || p.publishedAt || "",
    ).trim();
    const metaDate = releaseDate || "Latest release";
    const genre = (categories[0] || typeOf(p))
      .toLowerCase()
      .replace(/^./, (char) => char.toUpperCase());
    const latestText = formatLatestTitle(p);

    const card = document.createElement("article");
    card.className = "latest-card";
    card.dataset.productTitle = String(p.title || "");

    card.innerHTML = `
      <a class="latest-card-link" href="${esc(productHref(p))}" aria-label="Open ${esc(p.title)}">
        <div class="latest-art">
          ${imageHtml("", p)}
        </div>

        <div class="latest-copy">
          <h3>${esc(latestText.title)}</h3>
          <p class="latest-artist">${esc(latestText.artist)}</p>

          <div class="latest-bottom">
            <div class="latest-details">
              <span class="latest-date">${esc(metaDate)}</span>
              <span class="latest-genre">${esc(genre)}</span>
            </div>
          </div>
        </div>
      </a>

      <button type="button" class="latest-play" data-play-title="${esc(p.title)}" aria-label="Play ${esc(p.title)}">
        <span class="latest-play-icon" aria-hidden="true">▷</span>
        <span>Play</span>
      </button>
    `;

    latestTrack.appendChild(card);
    setImg(card.querySelector("img"), p);

    const latestPlay = card.querySelector(".latest-play");
    latestPlay?.addEventListener("pointerenter", () =>
      latestPlay.classList.add("is-play-hover"),
    );
    latestPlay?.addEventListener("pointerleave", () =>
      latestPlay.classList.remove("is-play-hover"),
    );
    latestPlay?.addEventListener("focus", () =>
      latestPlay.classList.add("is-play-hover"),
    );
    latestPlay?.addEventListener("blur", () =>
      latestPlay.classList.remove("is-play-hover"),
    );
    latestPlay?.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
    latestPlay?.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const title = latestPlay.dataset.playTitle || p.title;
      const selected =
        usable.find((item) => String(item?.title || "") === String(title)) || p;
      await loadTrack(selected, -1, true);
    });
  });

  // AUDIO PLAYER — direct media OR the catalog item's existing YouTube preview.
  const rows = document.getElementById("warpRows");
  const art = document.getElementById("warpArtwork");
  const artArtist = document.getElementById("warpArtArtist");
  const artTitle = document.getElementById("warpArtTitle");
  const artType = document.getElementById("warpArtType");
  const media = document.getElementById("warpAudioMedia");
  const ytFrame = document.getElementById("warpYouTubeMedia");
  const player = document.getElementById("warpPlayer");
  const playerPlay = document.getElementById("warpPlay");
  const playerPlayIcon = document.getElementById("warpPlayIcon");
  const playerPrev = document.getElementById("warpPrev");
  const playerNext = document.getElementById("warpNext");
  const playerTitle = document.getElementById("warpPlayerTitle");
  const playerTime = document.getElementById("warpPlayerTime");
  const playerProgress = document.getElementById("warpPlayerProgress");
  const playerProgressFill = document.getElementById("warpPlayerProgressFill");
  const playerClose = document.getElementById("warpClosePlayer");
  const waveHit = document.getElementById("warpWaveHit");
  const waveContainer = document.getElementById("warpWaveform");
  let playerList = [],
    playerIndex = -1,
    loadingToken = 0,
    playbackKind = "none",
    ytPlayer = null,
    ytReadyPromise = null;

  // LIVE WAVEFORM — fixed full waveform + moving played/locator waveform.
  // The waveform shape stays stable; only the played portion moves with the
  // real playback clock (YouTube or direct media), like a normal music player.
  const waveLive = document.getElementById("warpWaveLive");
  const waveBase = document.getElementById("warpWaveBase");
  const waveProgress = document.getElementById("warpWaveProgress");
  const WAVE_BARS = 144;
  let waveBarsBase = [];
  let waveBarsProgress = [];
  let waveSeed = [];
  let waveRaf = 0;
  let lastWaveRatio = 0;
  let waveLocator = null;
  let waveTooltip = null;

  const fmtTime = (s) => {
    if (!Number.isFinite(s) || s < 0) return "00:00";
    const n = Math.floor(s);
    return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  };

  const initWaveform = () => {
    if (!waveBase || !waveProgress || waveBarsBase.length) return;
    waveBase.innerHTML = "";
    waveProgress.innerHTML = "";
    const fragBase = document.createDocumentFragment();
    const fragProgress = document.createDocumentFragment();
    for (let i = 0; i < WAVE_BARS; i++) {
      const phase = (i * 0.61803398875) % 1;
      waveSeed.push(phase);
      const a = document.createElement("i");
      const b = document.createElement("i");
      fragBase.appendChild(a);
      fragProgress.appendChild(b);
      waveBarsBase.push(a);
      waveBarsProgress.push(b);
    }
    waveBase.appendChild(fragBase);
    waveProgress.appendChild(fragProgress);

    if (waveContainer && !document.getElementById("warpWaveLocator")) {
      waveLocator = document.createElement("span");
      waveLocator.id = "warpWaveLocator";
      waveContainer.appendChild(waveLocator);
      waveTooltip = document.createElement("span");
      waveTooltip.id = "warpWaveTooltip";
      waveContainer.appendChild(waveTooltip);
    } else {
      waveLocator = document.getElementById("warpWaveLocator");
      waveTooltip = document.getElementById("warpWaveTooltip");
    }
  };
  initWaveform();

  const drawWave = (ratio = 0, time = 0, playing = false) => {
    lastWaveRatio = Math.min(1, Math.max(0, Number(ratio) || 0));
    if (!waveBase || !waveProgress) return;

    // Two real waveform layers: the dark layer is the complete waveform,
    // while the bright layer reveals only the portion that has already played.
    // We intentionally control each bright bar instead of relying on CSS
    // clip-path, because Safari can paint clip-path on this fixed player
    // inconsistently when the player is mounted/animated.
    waveProgress.style.width = "100%";
    waveProgress.style.clipPath = "none";
    waveProgress.style.webkitClipPath = "none";

    // Generate one stable waveform shape only once. Do NOT animate bar heights
    // with time — only the played/locator layer changes opacity.
    if (!waveBarsBase.length) return;
    if (waveBarsBase[0].dataset.waveReady != "1") {
      for (let i = 0; i < WAVE_BARS; i++) {
        const phase = waveSeed[i] * Math.PI * 2;
        const envelope = 0.5 + 0.5 * Math.sin(i * 0.19 + 1.7);
        const texture = 0.5 + 0.5 * Math.sin(i * 0.53 + phase * 1.7);
        const detail = 0.5 + 0.5 * Math.sin(i * 0.097 + phase * 3.1);
        const h = Math.max(
          7,
          Math.min(
            58,
            8 + 42 * (0.52 * envelope + 0.3 * texture + 0.18 * detail),
          ),
        );
        const b = waveBarsBase[i],
          p = waveBarsProgress[i];
        b.style.setProperty("--wave-h", `${h.toFixed(1)}px`);
        b.style.setProperty("--wave-s", "1");
        p.style.setProperty("--wave-h", `${h.toFixed(1)}px`);
        p.style.setProperty("--wave-s", "1");
      }
      waveBarsBase[0].dataset.waveReady = "1";
    }

    // Reveal the bright waveform from left to right according to playback.
    // A tiny soft boundary keeps the locator natural rather than a hard line.
    for (let i = 0; i < waveBarsProgress.length; i++) {
      const pos = (i + 0.5) / WAVE_BARS;
      const edge = (lastWaveRatio - pos) / 0.018;
      const opacity = Math.max(0, Math.min(1, 0.5 + edge));
      waveBarsProgress[i].style.opacity = opacity.toFixed(3);
    }
  };

  const stopWaveAnimation = () => {
    if (waveRaf) {
      cancelAnimationFrame(waveRaf);
      waveRaf = 0;
    }
    const s = getPlaybackState();
    drawWave(s.duration > 0 ? s.current / s.duration : 0, s.current, false);
  };
  const animateWave = () => {
    if (waveRaf) cancelAnimationFrame(waveRaf);
    const tick = () => {
      const s = getPlaybackState();
      const ratio =
        s.duration > 0 ? Math.min(1, Math.max(0, s.current / s.duration)) : 0;
      drawWave(ratio, s.current, s.playing);
      if (s.playing) waveRaf = requestAnimationFrame(tick);
      else waveRaf = 0;
    };
    waveRaf = requestAnimationFrame(tick);
  };

  const setPlayerVisible = (visible) => {
    if (!player) return;

    /* =========================
     OPEN
     ========================= */
    if (visible) {
      player.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-warp-player");

      const wasHidden = player.classList.contains("is-hidden");

      player.classList.remove("is-hidden");
      player.classList.remove("slide-out-anim");

      if (wasHidden) {
        void player.offsetHeight;

        player.classList.add("slide-in-anim");

        window.setTimeout(() => {
          player.classList.remove("slide-in-anim");
        }, 450);
      }

      return;
    }

    /* =========================
     CLOSE
     ========================= */

    document.body.classList.remove("has-warp-player");

    // KEEP PLAYER MOUNTED
    player.classList.remove("is-hidden");
    player.classList.remove("slide-in-anim");

    player.setAttribute("aria-hidden", "false");

    // FORCE OPEN FRAME FIRST
    void player.offsetHeight;

    // START CLOSE ANIMATION IMMEDIATELY
    player.classList.add("slide-out-anim");

    // ONLY HIDE AFTER ANIMATION FINISHES
    window.setTimeout(() => {
      player.classList.remove("slide-out-anim");
      player.classList.add("is-hidden");
      player.setAttribute("aria-hidden", "true");
    }, 450);
  };

  const setPlayIcon = (playing) => {
    if (playerPlayIcon)
      playerPlayIcon.innerHTML = playing
        ? '<path d="M7 5h4v14H7zm6 0h4v14h-4z"/>'
        : '<path d="M8 5v14l11-7z"/>';
  };
  const markPlayingRow = () => {
    document
      .querySelectorAll(".warp-row.is-playing")
      .forEach((x) => x.classList.remove("is-playing"));
    const cur = playerList[playerIndex];
    if (!cur) return;
    document.querySelectorAll(".warp-row").forEach((r) => {
      if (r.dataset.title === String(cur.title || ""))
        r.classList.add("is-playing");
    });
  };

  const getPlaybackState = () => {
    if (playbackKind === "youtube" && ytPlayer) {
      const c = Number(ytPlayer.getCurrentTime?.() || 0);
      const d = Number(ytPlayer.getDuration?.() || 0);
      const state = ytPlayer.getPlayerState?.();
      return { current: c, duration: d, playing: state === 1 };
    }
    if (playbackKind === "media" && media) {
      return {
        current: Number(media.currentTime || 0),
        duration: Number(media.duration || 0),
        playing: !media.paused,
      };
    }
    return { current: 0, duration: 0, playing: false };
  };

  const syncPlayer = () => {
    const s = getPlaybackState();
    const r =
      s.duration > 0 ? Math.min(1, Math.max(0, s.current / s.duration)) : 0;
    const current = playerList[playerIndex];
    if (playerTime) {
      const artist = String(current?.artist || "TuneTrack");
      const duration = s.duration > 0 ? fmtTime(s.duration) : "00:00";
      playerTime.textContent = `${artist} • ${fmtTime(s.current)} / ${duration}`;
    }
    if (playerProgressFill) playerProgressFill.style.width = `${r * 100}%`;
    setPlayIcon(s.playing);
    player?.classList.toggle("is-playing", s.playing);
    drawWave(r, s.current, s.playing);
  };

  const resetPlayerState = (hide) => {
    if (hide) setPlayerVisible(false);

    loadingToken++;
    activeYoutubeId = "";
    stopWaveAnimation();

    if (media) {
      try {
        media.pause();
      } catch (e) {}
      media.removeAttribute("src");
      media.load();
    }

    if (ytPlayer) {
      try {
        ytPlayer.stopVideo();
      } catch (e) {}
    }

    playbackKind = "none";
    playerIndex = -1;
    playerList = [];
    setPlayIcon(false);
    player?.classList.remove("is-playing");
    document
      .querySelectorAll(".warp-row.is-playing")
      .forEach((x) => x.classList.remove("is-playing"));
    if (playerTitle) playerTitle.textContent = "";
    if (playerTime) playerTime.textContent = "00:00 / 00:00";
    if (playerProgressFill) playerProgressFill.style.width = "0%";
    drawWave(0, 0, false);
  };

  const mediaKeys = [
    "audio",
    "audioUrl",
    "audioURL",
    "audioFile",
    "audioSrc",
    "audioPreview",
    "audio_preview",
    "previewAudio",
    "preview",
    "previewUrl",
    "previewURL",
    "track",
    "trackUrl",
    "trackURL",
    "sample",
    "sampleUrl",
    "sampleURL",
    "media",
    "mediaUrl",
    "mediaURL",
  ];

  const mediaUrl = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) {
      for (const x of value) {
        const f = mediaUrl(x);
        if (f) return f;
      }
      return "";
    }
    if (typeof value === "object") {
      for (const k of ["url", "src", "source", "file", "path"]) {
        const f = mediaUrl(value[k]);
        if (f) return f;
      }
    }
    return "";
  };

  const resolveMedia = (p) => {
    for (const k of mediaKeys) {
      const f = mediaUrl(p?.[k]);
      if (f) return f;
    }
    return "";
  };

  const youtubeId = (p) => {
    const raw = String(
      p?.youtube || p?.youtubeUrl || p?.youtubeURL || "",
    ).trim();
    if (!raw) return "";
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    try {
      const u = new URL(raw);
      if (u.hostname.includes("youtu.be"))
        return u.pathname.slice(1).split("/")[0];
      if (u.hostname.includes("youtube.com"))
        return (
          u.searchParams.get("v") ||
          u.pathname.split("/").filter(Boolean).pop() ||
          ""
        );
    } catch (e) {}
    return "";
  };

  const ensureYouTube = () => {
    if (window.YT?.Player) return Promise.resolve();
    if (ytReadyPromise) return ytReadyPromise;

    ytReadyPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    });

    return ytReadyPromise;
  };

  const ensureYTPlayer = async () => {
    await ensureYouTube();
    if (ytPlayer) return ytPlayer;

    return new Promise((resolve) => {
      ytPlayer = new YT.Player("warpYouTubeMedia", {
        width: "1",
        height: "1",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: location.origin,
        },
        events: {
          onReady: () => {
            try {
              ytPlayer.setVolume(100);
            } catch (e) {}
            resolve(ytPlayer);
          },

          onStateChange: (e) => {
            // Ignore callbacks only when there is no active YouTube session.
            // The API can briefly report the previous video id while a new
            // source is being loaded, so do not reject the new state solely
            // because getVideoData() has not caught up yet.
            if (!activeYoutubeId) return;

            if (e.data === 1) {
              setPlayIcon(true);
              player?.classList.add("is-playing");
              markPlayingRow();
              syncPlayer();
              animateWave();
            } else if (e.data === 2) {
              setPlayIcon(false);
              player?.classList.remove("is-playing");
              markPlayingRow();
              syncPlayer();
              stopWaveAnimation();
            } else if (e.data === 0) {
              setPlayIcon(false);
              player?.classList.remove("is-playing");
              stopWaveAnimation();
              syncPlayer();

              // Ended callbacks always advance using the snapshot that
              // belonged to the active track session.
              if (playerIndex >= 0) playAt(playerIndex + 1);
            }
          },

          onError: (e) => {
            if (!activeYoutubeId) return;
            console.warn("TuneTrack YouTube error", e?.data);
            setPlayIcon(false);
            player?.classList.remove("is-playing");
            stopWaveAnimation();
            syncPlayer();
          },
        },
      });
    });
  };

  // Pre-initialize the hidden YouTube player. The actual product button still
  // starts the selected video, but the API itself is already ready.
  ensureYTPlayer().catch((err) =>
    console.warn("TuneTrack YouTube init failed", err),
  );

  const loadTrack = async (p, index, autoplay = true) => {
    if (!p) return;

    // Every click creates a new session. Any older async request is now stale.
    const token = ++loadingToken;

    // Snapshot the exact list at click time. If the selected card is not in
    // the current filter, keep it as the active item instead of silently
    // falling back to item 0.
    const activeList = filterProducts().slice();
    let selectedIndex = activeList.indexOf(p);
    if (selectedIndex < 0) {
      activeList.push(p);
      selectedIndex = activeList.length - 1;
    }

    playerList = activeList;
    playerIndex = selectedIndex;

    // HARD KILL previous playback BEFORE loading the new item.
    activeYoutubeId = "";
    stopWaveAnimation();

    if (media) {
      try {
        media.pause();
      } catch (e) {}
      media.removeAttribute("src");
      media.load();
    }

    if (ytPlayer) {
      try {
        ytPlayer.stopVideo();
      } catch (e) {}
    }

    playbackKind = "none";
    setPlayIcon(false);
    player?.classList.remove("is-playing");

    setPlayerVisible(true);
    if (playerTitle)
      playerTitle.textContent = `${p.title || "UNTITLED"} • ${p.artist || "TUNETRACK"}`;
    if (playerTime) playerTime.textContent = String(p.artist || "TuneTrack");
    if (playerProgressFill) playerProgressFill.style.width = "0%";
    markPlayingRow();
    drawWave(0, 0, false);

    const direct = resolveMedia(p);
    const ytId = youtubeId(p);

    try {
      if (direct) {
        playbackKind = "media";

        const abs = new URL(direct, location.href).href;
        media.src = abs;
        media.load();

        await new Promise((resolve, reject) => {
          let done = false;

          const ok = () => {
            if (done) return;
            done = true;
            cleanup();
            resolve();
          };

          const bad = () => {
            if (done) return;
            done = true;
            cleanup();
            reject(new Error("media error"));
          };

          const cleanup = () => {
            media.removeEventListener("canplay", ok);
            media.removeEventListener("error", bad);
          };

          media.addEventListener("canplay", ok, { once: true });
          media.addEventListener("error", bad, { once: true });

          setTimeout(() => {
            if (!done && media.readyState >= 2) ok();
          }, 5000);
        });

        // User selected another item while the direct file was loading.
        if (token !== loadingToken) {
          try {
            media.pause();
          } catch (e) {}
          return;
        }

        if (autoplay) {
          await media.play();

          // A second selection can happen while play() is resolving.
          if (token !== loadingToken) {
            try {
              media.pause();
            } catch (e) {}
            return;
          }
        }
      } else if (ytId) {
        const ytp = await ensureYTPlayer();

        if (token !== loadingToken) return;

        playbackKind = "youtube";
        activeYoutubeId = ytId;

        // Hard replace the source. Cue first so the old video cannot keep
        // playing while the new video's metadata is arriving, then start the
        // exact id from the catalog.
        try {
          ytp.pauseVideo();
        } catch (e) {}
        try {
          ytp.stopVideo();
        } catch (e) {}
        try {
          ytp.cueVideoById({ videoId: ytId, startSeconds: 0 });
        } catch (e) {
          ytp.loadVideoById({ videoId: ytId, startSeconds: 0 });
        }

        await new Promise((resolve) => {
          const started = performance.now();
          const wait = () => {
            if (token !== loadingToken) {
              resolve();
              return;
            }
            const currentId = String(ytp.getVideoData?.()?.video_id || "");
            const duration = Number(ytp.getDuration?.() || 0);
            if (
              currentId === ytId &&
              (duration > 0 || performance.now() - started > 2200)
            ) {
              resolve();
              return;
            }
            requestAnimationFrame(wait);
          };
          wait();
        });

        if (token !== loadingToken) return;

        if (autoplay) {
          try {
            ytp.unMute();
          } catch (e) {}
          try {
            ytp.playVideo();
          } catch (e) {}
        }

        if (token !== loadingToken) {
          // The request lost the race. Do not allow its video to continue.
          if (activeYoutubeId === ytId) {
            activeYoutubeId = "";
            try {
              ytp.stopVideo();
            } catch (e) {}
          }
          return;
        }
      } else {
        playbackKind = "none";
        playerTime.textContent = String(p.artist || "TuneTrack");
        setPlayIcon(false);
        player?.classList.remove("is-playing");
        stopWaveAnimation();
        drawWave(0, 0, false);
        return;
      }

      if (token !== loadingToken) return;

      syncPlayer();
      const playing = getPlaybackState().playing;
      setPlayIcon(playing);
      player?.classList.toggle("is-playing", playing);
      if (playing) animateWave();
      else stopWaveAnimation();
      markPlayingRow();
    } catch (err) {
      if (token !== loadingToken) return;

      console.warn("TuneTrack player load failed", err);
      setPlayIcon(false);
      player?.classList.remove("is-playing");
      stopWaveAnimation();
      playerTime.textContent = String(p.artist || "TuneTrack");
      drawWave(0, 0, false);
    }
  };

  // LATEST RELEASES HARD ROUTE: use the exact same player controller as the catalog rows.
  // This delegated listener is intentionally a safety net so the card button can never
  // fall through to the card link/drag layer or resolve the wrong list index.
  document.addEventListener(
    "click",
    async (e) => {
      const btn = e.target.closest?.(".latest-play");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const title =
        btn.dataset.playTitle ||
        btn
          .getAttribute("aria-label")
          ?.replace(/^Play\s+/i, "")
          .trim();
      const selected = usable.find(
        (item) => String(item?.title || "") === String(title || ""),
      );
      if (!selected) {
        console.warn("TuneTrack: Latest Releases product not found:", title);
        return;
      }

      await loadTrack(selected, -1, true);
    },
    true,
  );

  // MUST PLAY / CAROUSEL HARD ROUTE
  // The marquee contains cloned cards, so use delegated capture here.
  // This guarantees every Play button — original or clone — enters the
  // exact same player controller and cannot fall through to the card link.
  const mustPlayRoot = document.getElementById("mustPlayTrack");
  mustPlayRoot?.addEventListener(
    "click",
    async (e) => {
      const btn = e.target.closest?.(".must-play-btn.play");
      if (!btn || !mustPlayRoot.contains(btn)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const card = btn.closest(".featured-card");
      const title = String(card?.dataset?.productTitle || "").trim();
      if (!title) return;

      const selected = usable.find(
        (item) => String(item?.title || "").trim() === title,
      );

      if (!selected) {
        console.warn("TuneTrack: Must Play product not found:", title);
        return;
      }

      await loadTrack(selected, -1, true);
    },
    true,
  );

  const playAt = async (index) => {
    const list = playerList.length
      ? playerList.slice()
      : filterProducts().slice();
    if (!list.length) return;

    const i = (index + list.length) % list.length;
    await loadTrack(list[i], i, true);
  };

  playerPlay?.addEventListener("click", async () => {
    if (playerIndex < 0) return playAt(0);

    try {
      if (playbackKind === "youtube" && ytPlayer) {
        const state = ytPlayer.getPlayerState();
        if (state === 1) {
          ytPlayer.pauseVideo();
        } else {
          try {
            ytPlayer.unMute();
          } catch (e) {}
          ytPlayer.playVideo();
        }
      } else if (playbackKind === "media" && media) {
        if (media.paused) await media.play();
        else media.pause();
      } else {
        await loadTrack(playerList[playerIndex], playerIndex, true);
      }
    } catch (e) {
      console.warn(e);
    }
  });

  playerPrev?.addEventListener("click", () => {
    if (playerIndex >= 0) playAt(playerIndex - 1);
  });

  playerNext?.addEventListener("click", () => {
    if (playerIndex >= 0) playAt(playerIndex + 1);
  });

  playerClose?.addEventListener("click", () => {
    resetPlayerState(true);
  });

  media?.addEventListener("timeupdate", syncPlayer);
  media?.addEventListener("durationchange", syncPlayer);
  media?.addEventListener("loadedmetadata", syncPlayer);

  media?.addEventListener("play", () => {
    setPlayIcon(true);
    player?.classList.add("is-playing");
    markPlayingRow();
    animateWave();
  });

  media?.addEventListener("pause", () => {
    setPlayIcon(false);
    player?.classList.remove("is-playing");
    markPlayingRow();
    stopWaveAnimation();
  });

  media?.addEventListener("ended", () => {
    stopWaveAnimation();
    if (playerIndex >= 0) playAt(playerIndex + 1);
  });

  media?.addEventListener("error", () => {
    if (playbackKind === "media") {
      setPlayIcon(false);
      player?.classList.remove("is-playing");
      stopWaveAnimation();
      syncPlayer();
    }
  });

  const seekFromPointer = (e) => {
    const s = getPlaybackState();
    if (!s.duration) return;

    const rect = (waveHit || playerProgress).getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    const t = ratio * s.duration;

    if (playbackKind === "youtube" && ytPlayer) ytPlayer.seekTo(t, true);
    else if (playbackKind === "media" && media) media.currentTime = t;

    syncPlayer();
  };

  waveHit?.addEventListener("pointerdown", seekFromPointer);
  playerProgress?.addEventListener("pointerdown", seekFromPointer);

  const updateWaveLocator = (e) => {
    if (!waveHit || !waveContainer || !waveLocator) return;
    const s = getPlaybackState();
    const rect = waveHit.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    const x = ratio * 100;
    waveContainer.classList.add("is-hovering");
    if (waveTooltip) {
      waveTooltip.style.left = `${x}%`;
      waveTooltip.textContent = fmtTime(s.duration * ratio);
    }
  };
  waveHit?.addEventListener("pointermove", updateWaveLocator);
  waveHit?.addEventListener("pointerenter", updateWaveLocator);
  waveHit?.addEventListener("pointerleave", () =>
    waveContainer?.classList.remove("is-hovering"),
  );

  window.setInterval(() => {
    if (player && !player.classList.contains("is-hidden")) syncPlayer();
  }, 100);

  window.addEventListener("resize", () => {
    const s = getPlaybackState();
    drawWave(s.duration ? s.current / s.duration : 0, s.current, s.playing);
  });

  let currentFilter = "all",
    currentSearch = "";
  const filterProducts = () => {
    let result = usable;
    if (currentFilter === "free") result = result.filter(isFree);
    if (currentFilter === "paid") result = result.filter(isPaid);
    if (currentFilter === "limited") result = result.filter(isLimited);
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      result = result.filter(
        (p) =>
          String(p.title || "")
            .toLowerCase()
            .includes(q) ||
          String(p.artist || "")
            .toLowerCase()
            .includes(q) ||
          (Array.isArray(p.category) &&
            p.category.join(" ").toLowerCase().includes(q)),
      );
    }
    return result;
  };
  const showArtwork = async (p) => {
    if (!p || !art) return;
    const src = await resolveImage(p);
    art.classList.remove("is-loaded");
    if (src) {
      art.src = src;
      art.onload = () => art.classList.add("is-loaded");
    } else art.removeAttribute("src");
    if (artArtist) artArtist.textContent = p.artist || "TuneTrack";
    if (artTitle) artTitle.textContent = p.title || "";
    if (artType) artType.textContent = typeOf(p);
  };
  const renderRows = () => {
    const list = filterProducts();
    if (rows) rows.innerHTML = "";
    if (!list.length) {
      if (rows)
        rows.innerHTML = '<div class="warp-empty">NO RELEASES FOUND.</div>';
      return;
    }
    list.forEach((p, idx) => {
      const a = document.createElement("a");
      a.className = "warp-row";
      a.href = productHref(p);
      a.dataset.title = String(p.title || "");
      a.innerHTML = `<span class="row-no">${String(idx + 1).padStart(2, "0")}</span><span class="row-title"><button type="button" class="row-play" aria-label="Play ${esc(p.title)}"><svg class="row-triangle" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg class="row-eq" viewBox="0 0 24 24"><path d="M5 13h3v6H5zm5-5h3v11h-3zm5-3h3v14h-3z"/></svg></button>${esc(p.title)}</span><span class="row-artist">${esc(p.artist || "—")}</span><span class="row-type">${esc(typeOf(p))}</span><span class="row-price">${esc(p.price || "—")}</span>`;
      a.querySelector(".row-play")?.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await loadTrack(p, filterProducts().indexOf(p), true);
      });
      a.addEventListener("mouseenter", () => showArtwork(p));
      a.addEventListener("focus", () => showArtwork(p));
      rows.appendChild(a);
    });
    showArtwork(list[0]);
  };
  renderRows();

  // ODOMETER — follows the currently selected catalog filter.
  // ALL = all releases, FREE = freebies, PAID = paid releases,
  // LIMITED = limited / Christmas releases.
  const odo = document.getElementById("totalCount");
  let odoAnimationFrame = 0;

  const getOdometerTarget = (filter = currentFilter) => {
    if (filter === "free") return usable.filter(isFree).length;
    if (filter === "paid") return usable.filter(isPaid).length;
    if (filter === "limited") return usable.filter(isLimited).length;
    return usable.length;
  };

  // The large catalog heading changes with the active filter too.
  const odometerLabel = document.querySelector(".warp-title-label");
  const odometerLabels = {
    all: "ALL RELEASES",
    free: "FREEBIES",
    paid: "PAID PRODUCTS",
    limited: "CHRISTMAS SPECIAL",
  };

  const setOdometerLabel = (filter = "all") => {
    if (!odometerLabel) return;
    odometerLabel.textContent = odometerLabels[filter] || odometerLabels.all;
  };

  setOdometerLabel("all");

  const setOdometerTarget = (target, animate = true) => {
    if (!odo) return;

    const safeTarget = Math.max(0, Number(target) || 0);
    odo.dataset.target = String(safeTarget);

    if (odoAnimationFrame) {
      cancelAnimationFrame(odoAnimationFrame);
      odoAnimationFrame = 0;
    }

    if (!animate) {
      odo.textContent = String(safeTarget).padStart(3, "0");
      return;
    }

    const currentText = String(odo.textContent || "").replace(/\D/g, "");
    const startValue = Number(currentText) || 0;
    const start = performance.now();
    const duration = 650;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      const value = Math.round(startValue + (safeTarget - startValue) * e);

      odo.textContent = String(value).padStart(3, "0");

      if (t < 1) {
        odoAnimationFrame = requestAnimationFrame(tick);
      } else {
        odo.textContent = String(safeTarget).padStart(3, "0");
        odoAnimationFrame = 0;
      }
    };

    odoAnimationFrame = requestAnimationFrame(tick);
  };

  // Keep the initial ALL RELEASES target.
  if (odo) {
    odo.dataset.target = String(getOdometerTarget("all"));
    odo.textContent = "000";
  }

  let odoDone = false;
  const runOdo = () => {
    if (odoDone || !odo) return;
    odoDone = true;
    setOdometerTarget(getOdometerTarget(currentFilter), true);
  };
  const listSection = document.getElementById("catalog-list");
  if (listSection && "IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && runOdo()),
      { threshold: 0.25 },
    ).observe(listSection);
  } else runOdo();

  document.querySelectorAll(".catalog-filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".catalog-filter")
        .forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentFilter = btn.dataset.filter || "all";

      // Update both the heading label and the large odometer.
      setOdometerLabel(currentFilter);

      // Update the large odometer to match the active filter.
      // Example: clicking FREE immediately changes it to the number of freebies.
      setOdometerTarget(getOdometerTarget(currentFilter), true);

      renderRows();
      document
        .getElementById("catalog-list")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }),
  );
  document.querySelectorAll("[data-drag]").forEach((track) => {
    let down = false,
      moved = false,
      startX = 0,
      scrollLeft = 0;

    track.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".must-play-btn,.latest-play")) return;
      down = true;
      moved = false;
      startX = e.clientX;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const delta = e.clientX - startX;
      if (!moved && Math.abs(delta) < 6) return;
      moved = true;
      track.classList.add("is-dragging");
      track.setPointerCapture?.(e.pointerId);
      track.scrollLeft = scrollLeft - delta;
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
      track.addEventListener(ev, () => {
        down = false;
        moved = false;
        track.classList.remove("is-dragging");
      }),
    );
  });
  document.querySelectorAll("[data-slider]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.slider);
      if (target)
        target.parentElement?.scrollBy({
          left:
            (Number(btn.dataset.dir) || 1) *
            Math.max(300, Math.round(window.innerWidth * 0.32)),
          behavior: "smooth",
        });
    }),
  );

  // SEARCH
  const searchBtn = document.getElementById("swissSearchBtn"),
    searchOverlay = document.getElementById("catalogSearchOverlay"),
    searchClose = document.getElementById("catalogSearchClose"),
    searchInput = document.getElementById("globalSearch"),
    searchResults = document.getElementById("searchResults"),
    searchCount = document.getElementById("searchResultCount"),
    clearSearch = document.getElementById("clearSearch");
  const openSearch = () => {
    searchOverlay?.classList.add("is-open");
    searchOverlay?.setAttribute("aria-hidden", "false");
    setTimeout(() => searchInput?.focus(), 80);
  };
  const closeSearch = () => {
    searchOverlay?.classList.remove("is-open");
    searchOverlay?.setAttribute("aria-hidden", "true");
  };
  searchBtn?.addEventListener("click", openSearch);
  searchClose?.addEventListener("click", closeSearch);
  searchOverlay?.addEventListener("click", (e) => {
    if (e.target === searchOverlay) closeSearch();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
  });
  const scrollToSearchResult = (product) => {
    if (!product) return;
    currentFilter = "all";
    document
      .querySelectorAll(".catalog-filter")
      .forEach((btn) =>
        btn.classList.toggle("is-active", btn.dataset.filter === "all"),
      );
    if (searchInput) searchInput.value = "";
    currentSearch = "";
    renderRows();
    closeSearch();
    window.setTimeout(() => {
      const row = [...document.querySelectorAll(".warp-row")].find(
        (el) => el.dataset.title === String(product.title || ""),
      );
      if (!row) return;
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("search-hit");
      window.setTimeout(() => row.classList.remove("search-hit"), 1100);
    }, 80);
  };

  const renderSearch = () => {
    if (!searchResults) return;
    const q = String(searchInput?.value || "")
      .trim()
      .toLowerCase();
    currentSearch = q;
    const found = q
      ? usable
          .filter(
            (p) =>
              String(p.title || "")
                .toLowerCase()
                .includes(q) ||
              String(p.artist || "")
                .toLowerCase()
                .includes(q) ||
              (Array.isArray(p.category) &&
                p.category.join(" ").toLowerCase().includes(q)),
          )
          .slice(0, 8)
      : [];
    if (searchCount)
      searchCount.textContent = q
        ? `${found.length} SUGGESTIONS`
        : "SEARCH CATALOG";
    searchResults.innerHTML =
      found
        .map(
          (p, i) =>
            `<button class="catalog-search-result" type="button" data-search-index="${i}">${imageHtml(`search-${i}`, p)}<div><strong>${esc(p.title)}</strong><small>${esc(p.artist || "")}</small></div><span>${esc(typeOf(p))}</span></button>`,
        )
        .join("") || (q ? '<div class="warp-empty">NO MATCHES.</div>' : "");
    found.forEach((p, i) => {
      setImg(document.getElementById(`search-${i}`), p);
      const item = searchResults.querySelector(`[data-search-index="${i}"]`);
      item?.addEventListener("click", () => scrollToSearchResult(p));
    });
  };
  searchInput?.addEventListener("input", renderSearch);
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  clearSearch?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    currentSearch = "";
    renderSearch();
    renderRows();
    searchInput?.focus();
  });
  document.getElementById("swissAccountBtn")?.addEventListener("click", () => {
    let isLoggedIn = false;
    try {
      isLoggedIn = sessionStorage.getItem("tt_session") === "active";
    } catch (e) {}
    window.location.href = isLoggedIn ? "dashboard.html" : "login-page.html";
  });
  (function () {
    const button = document.getElementById("tncoHeaderMenuButton");
    const menu = document.getElementById("tncoMobileMenu");
    const close = document.getElementById("tncoMobileMenuClose");
    if (!button || !menu || button.dataset.ttMenuBound === "true") return;
    button.dataset.ttMenuBound = "true";
    const closeMenu = () => {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "false");
      document.body.classList.remove("tnco-mobile-menu-open");
      document.documentElement.classList.remove("tnco-mobile-menu-open");
      document.body.style.overflow = "";
    };
    const openMenu = () => {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      button.setAttribute("aria-expanded", "true");
      document.body.classList.add("tnco-mobile-menu-open");
      document.documentElement.classList.add("tnco-mobile-menu-open");
      document.body.style.overflow = "hidden";
    };
    closeMenu();
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    close?.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
    });
    menu.addEventListener("click", (e) => {
      if (e.target === menu) closeMenu();
    });
    menu
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
    });
  })();
  document.addEventListener(
    "error",
    (e) => {
      const t = e.target;
      if (!(t instanceof HTMLImageElement)) return;
      if (
        t.dataset.fallback &&
        t.src !== new URL(t.dataset.fallback, location.href).href
      ) {
        const f = t.dataset.fallback;
        delete t.dataset.fallback;
        t.src = f;
      } else if (
        t.closest(
          ".featured-card,.latest-card,.editorial-card,.warp-art-sticky,.catalog-search-result",
        )
      )
        t.style.opacity = "0";
    },
    true,
  );
});

/* =========================================================
   FOR THE ROOM — RIGHT ARROW SCROLL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#editorial");
  const track = section?.querySelector(".editorial-grid");

  if (!section || !track) return;

  section.addEventListener("click", (e) => {
    const rect = section.getBoundingClientRect();

    const arrowZone =
      e.clientX > rect.right - 100 &&
      e.clientY > rect.top &&
      e.clientY < rect.top + 120;

    if (!arrowZone) return;

    track.scrollBy({
      left: track.clientWidth * 0.72,
      behavior: "smooth",
    });
  });
});

/* ============================================================
   SAFE CLOSE OVERRIDE
   ONLY HIDE "SELECT A RELEASE"
   DOES NOT HIDE / REMOVE PLAYER DATA
   ============================================================ */

(() => {
  const player = document.getElementById("warpPlayer");
  if (!player) return;

  const isClosing = () =>
    player.classList.contains("is-hidden") ||
    player.classList.contains("player-closing") ||
    player.getAttribute("aria-hidden") === "true";

  const hideSelectText = () => {
    if (!isClosing()) return;

    const walker = document.createTreeWalker(player, NodeFilter.SHOW_TEXT);

    const targets = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;

      if (
        node.nodeValue &&
        node.nodeValue.trim().toLowerCase() === "select a release"
      ) {
        targets.push(node);
      }
    }

    targets.forEach((node) => {
      // Jangan hapus text/data.
      // Cuma bungkus teks target.
      if (
        node.parentElement &&
        node.parentElement.dataset.ttReleaseHidden === "true"
      ) {
        return;
      }

      const span = document.createElement("span");

      span.dataset.ttReleaseHidden = "true";

      span.style.setProperty("display", "none", "important");

      node.parentNode.insertBefore(span, node);
      span.appendChild(node);
    });
  };

  const observer = new MutationObserver(() => {
    if (isClosing()) {
      hideSelectText();
    }
  });

  observer.observe(player, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "aria-hidden"],
  });

  hideSelectText();
})();
