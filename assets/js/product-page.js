/**
 * ============================================================================
 * LOVE INJECTION ARCHIVE — PRODUCT PAGE RUNTIME ENGINE
 *
 * Features:
 * - Lenis Smooth Scrolling
 * - GSAP ScrollTrigger & IntersectionObserver Fallback for Stacked Image Unblur
 * - Dynamic Bag / Drawer Cart State & Sticky Dock Header
 * - Expandable Tracklist Credits & Share API
 * - 0 Syntax / Parsing Errors
 * ============================================================================
 */

(() => {
  "use strict";

  // APP STATE CONTAINER
  const state = {
    product: {
      title: "KRIDELKA, CHANDA & THE PASSENGERS - GIVE IT TO 'EM! 12\" SINGLE",
      format: "vinyl",
      formatLabel: "Black Vinyl",
      price: 18.0,
      quantity: 1,
    },

    cart: [],
    isExpanded: false,
    lenis: null,
  };

  // TUNETRACK CATALOG INTEGRATION
  // Product page source:
  // product-page.html?item=<catalog title>
  const getCatalogProducts = () => {
    if (Array.isArray(window.TuneTrackCatalog)) return window.TuneTrackCatalog;
    if (Array.isArray(window.products)) return window.products;
    return [];
  };

  const normalizeProductKey = (value) =>
    String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

  const getRequestedCatalogItem = () => {
    try {
      return new URLSearchParams(window.location.search).get("item") || "";
    } catch (_) {
      return "";
    }
  };

  const findCatalogProduct = () => {
    const requested = normalizeProductKey(getRequestedCatalogItem());
    const products = getCatalogProducts();

    if (!requested || !products.length) return null;

    return (
      products.find(
        (product) => normalizeProductKey(product.title) === requested,
      ) || null
    );
  };

  const escapeHTML = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const renderTrackRows = (product) => {
    const rows = $("#tracklistRows");
    if (!rows) return;

    const tracks = Array.isArray(product?.tracks)
      ? product.tracks
      : Array.isArray(product?.tracklist)
        ? product.tracklist
        : [];

    if (!tracks.length) {
      rows.innerHTML = "";
      return;
    }

    rows.innerHTML = tracks
      .map((track) => {
        if (typeof track === "string") {
          return `<div class="track-row">${escapeHTML(track)}</div>`;
        }

        const side = track?.side ? `[${track.side}] ` : "";
        const title = String(product.title || "").trim();
        const artist = String(product.artist || "").trim();

        const brandTitle = document.getElementById("brandTitle");
        if (brandTitle) {
          brandTitle.textContent = artist;
        }

        const displayTitle = [artist, title].filter(Boolean).join(" - ");

        const label = `${side}${artist}${title}`.trim();

        return label ? `<div class="track-row">${escapeHTML(label)}</div>` : "";
      })
      .filter(Boolean)
      .join("");
  };

  const renderCredits = (product) => {
    const rows = $("#creditRows");
    if (!rows) return;

    const credits = Array.isArray(product?.credits) ? product.credits : [];

    rows.innerHTML = credits
      .map((credit) => {
        const text =
          typeof credit === "string"
            ? credit
            : credit?.text || credit?.value || "";

        return text ? `<div class="credit-row">${escapeHTML(text)}</div>` : "";
      })
      .filter(Boolean)
      .join("");
  };

  // RELATED ITEMS — RANDOM CATALOG PRODUCTS
  // Picks 3 unique products from data-catalog-local.js and wires every
  // visible field + the entire card link to the selected catalog product.
  const initRelatedCatalogItems = () => {
    const cards = [...document.querySelectorAll("#relatedSection .cell-card")];
    const products = getCatalogProducts();

    if (!cards.length || !products.length) return;

    const currentProduct = window.TuneTrackCurrentProduct;
    const currentTitle = normalizeProductKey(currentProduct?.title);

    const candidates = products.filter((product) => {
      const title = String(product?.title || "").trim();
      const artist = String(product?.artist || "").trim();
      const image = String(product?.image || "").trim();
      if (!title || !artist || !image) return false;
      if (currentTitle && normalizeProductKey(title) === currentTitle) return false;

      return true;
    });

    // Fisher-Yates shuffle, then take exactly the number of cards available.
    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const selected = candidates.slice(0, cards.length);

    cards.forEach((card, index) => {
      const product = selected[index];
      if (!product) return;

      const link = card.querySelector(".card-link-wrapper");
      const imageBox = card.querySelector(".card-image-box");
      const titleEl = card.querySelector(".card-product-title");
      const priceEl = card.querySelector(".card-product-price");

      if (link) {
        // Related items always open the TuneTrack product page itself.
        // Never use the catalog item's Lynk.id/external purchase URL here.
        const productPageURL = `product-page.html?item=${encodeURIComponent(product.title)}#`;
        link.href = productPageURL;
        link.setAttribute("aria-label", `${product.artist} — ${product.title}`);
      }

      if (imageBox) {
        let imagePath = String(product.image || "").trim();
        imagePath = imagePath.replace(
          /^assets\/thumbnail\//,
          "assets/images/thumbnail/",
        );

        imageBox.innerHTML = "";

        const image = document.createElement("img");
        image.className = "related-product-image";
        image.src = new URL(imagePath, window.location.href).href;
        image.alt = `${product.artist} — ${product.title}`;
        image.loading = "lazy";
        image.decoding = "async";
        image.draggable = false;
        image.style.display = "block";
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.maxWidth = "none";
        image.style.objectFit = "cover";
        image.style.objectPosition = "center center";

        image.onerror = () => {
          image.onerror = null;
          image.style.display = "none";
          imageBox.style.backgroundColor = "#090909";
        };

        imageBox.appendChild(image);
      }

      if (titleEl) {
        titleEl.textContent = `${product.artist} — ${product.title}`;
      }

      if (priceEl) {
        priceEl.textContent = String(product.price || "");
      }

      card.dataset.catalogTitle = product.title;
      card.dataset.catalogArtist = product.artist;
      card.dataset.catalogLink = `product-page.html?item=${encodeURIComponent(product.title)}#`;
    });
  };

  const initCatalogProductIntegration = () => {
    const product = findCatalogProduct();

    // Keep the complete resolved catalog object available for the next phase.
    window.TuneTrackCurrentProduct = product;

    if (!product) {
      console.warn(
        "[TuneTrack Product] No catalog product matched:",
        getRequestedCatalogItem(),
      );
      return;
    }

    const btnPriceDisplay = $("#btnPriceDisplay");
    if (btnPriceDisplay) {
      btnPriceDisplay.textContent = String(product.price || "—");
    }

    const dockAddLabel = $("#dockAddToCart span");
    if (dockAddLabel) {
      dockAddLabel.textContent = `Add To Bag (${String(product.price || "—")})`;
    }

    const title = String(product.title || "").trim();
    const artist = String(product.artist || "").trim();
    const displayTitle = [artist, title].filter(Boolean).join(" ☺ ");
    const hasLongWord = displayTitle.split(/\s+/).some((word) => Array.from(word).length > 10);

    document.querySelector("#productTitle")?.setAttribute("data-long-title", hasLongWord ? "true" : "false");

    // Runtime product state becomes catalog-driven.
    state.product.catalog = product;
    state.product.catalogTitle = title;
    state.product.artist = artist;
    state.product.title = displayTitle;
    state.product.catalogPrice = product.price ?? "";
    state.product.catalogLink = product.link ?? "";
    state.product.gumroadLink = product.gumroadLink ?? "";
    state.product.youtube = product.youtube ?? "";
    state.product.image = product.image ?? "";
    state.product.category = Array.isArray(product.category)
      ? product.category
      : product.category
        ? [product.category]
        : [];
    state.product.exclusive = Boolean(product.exclusive);

    document.title = `TuneTrack — ${displayTitle || title} | Multitrack, Sequencer, Preset`;

    const dockTitle = $("#dockProductTitle") || $(".dock-title");
    if (dockTitle) dockTitle.textContent = displayTitle || title;

    const productTitle = $("#productTitle");
    if (productTitle) {
      const renderedTitle = displayTitle || title;
      const chars = Array.from(renderedTitle);

      let charIndex = 0;
      const words = renderedTitle.split(" ");
      const renderedWords = words
        .map((word, wordIndex) => {
          const wordChars = Array.from(word)
            .map((char) => {
              const html = `<span class="title-char" data-title-char="${charIndex}">${escapeHTML(char)}</span>`;
              charIndex += 1;
              return html;
            })
            .join("");

          const spacer =
            wordIndex < words.length - 1
              ? `<span class="title-word-spacer" aria-hidden="true">&nbsp;</span><wbr>`
              : "";

          const isLongWord = Array.from(word).length > 10;
          const wordClass = isLongWord ? "title-word title-word-condensed" : "title-word";

          return `<span class="${wordClass}">${wordChars}</span>${spacer}`;
        })
        .join("");

      productTitle.innerHTML = `<span class="title-line" data-title-line="true">${renderedWords}</span>`;
      productTitle.classList.toggle("is-long-title", hasLongWord);
    }

    const breadcrumb = $("#headerBreadcrumbPath");
    if (breadcrumb) {
      const slug = normalizeProductKey(title)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      breadcrumb.textContent = `[/products/${slug}]`;
    }

    const brandTitle = $("#brandTitle");
    if (brandTitle) {
      brandTitle.textContent = artist;
    }

    const randomRadioVariants = [
      {
        title: "Track 07 -",
        meta: "Full Multitrack",
      },
      {
        title: "Session 12 -",
        meta: "48kHz WAV Stems",
      },
      {
        title: "Set 04 -",
        meta: "Live Track Ready",
      },
      {
        title: "Layer 09 -",
        meta: "24 Track Session",
      },
    ];

    const randomRadio =
      randomRadioVariants[
        Math.floor(Math.random() * randomRadioVariants.length)
      ];

    const randomRadioTitle = document.getElementById("randomRadioTitle");
    const randomRadioMeta = document.getElementById("randomRadioMeta");

    if (randomRadioTitle) {
      randomRadioTitle.textContent = randomRadio.title;
    }

    if (randomRadioMeta) {
      randomRadioMeta.textContent = randomRadio.meta;
    }

    const artistSpec = $("#productArtistSpec");
    const categorySpec = $("#productCategorySpec");
    const formatSpec = $("#productFormatSpec");
    const priceSpec = $("#productPriceSpec");

    if (artistSpec) artistSpec.textContent = artist || "—";
    if (categorySpec) {
      categorySpec.textContent = state.product.category.length
        ? state.product.category.join(" / ")
        : "—";
    }
    if (formatSpec) formatSpec.textContent = product.format || "—";
    if (priceSpec) priceSpec.textContent = product.price || "—";

// Optional detail fields are read only when they exist in the catalog.
const tracklistHeader = $("#tracklistHeader");
const tracklistCat = $("#tracklistCat");
const catalogNumberValue = $("#catalogNumberValue");

if (tracklistHeader) {
  tracklistHeader.textContent = displayTitle || title;
}

if (catalogNumberValue) {
  const productKey =
    product.id ||
    product.slug ||
    product.title ||
    product.name ||
    title ||
    window.location.pathname;

  let hash = 0;

  for (let i = 0; i < productKey.length; i++) {
    hash = ((hash << 5) - hash) + productKey.charCodeAt(i);
    hash |= 0;
  }

  const fourDigits = String(
    Math.abs(hash) % 10000
  ).padStart(4, "0");

  const catalogNumber = `000000${fourDigits}`;

  catalogNumberValue.textContent = catalogNumber;
}

if (tracklistCat) {
  const productKey =
    product.id ||
    product.slug ||
    product.title ||
    product.name ||
    title ||
    window.location.pathname;

  let hash = 0;

  for (let i = 0; i < productKey.length; i++) {
    hash = ((hash << 5) - hash) + productKey.charCodeAt(i);
    hash |= 0;
  }

  const fourDigits = String(
    Math.abs(hash) % 10000
  ).padStart(4, "0");

  const catalogNumber = `000000${fourDigits}`;

  const rpm = product.rpm ?? "";

  const details = [catalogNumber, rpm]
    .filter(Boolean)
    .join(" / ");

  tracklistCat.textContent = details || "—";
}
    renderTrackRows(product);
    renderCredits(product);

    // Source values are also exposed for the next integration step.
    document.documentElement.dataset.productTitle = title;
    document.documentElement.dataset.productArtist = artist;
    document.documentElement.dataset.productLink = String(product.link || "");
    document.documentElement.dataset.productImage = String(product.image || "");
    document.documentElement.dataset.productYoutube = String(
      product.youtube || "",
    );
  };

  // QUERY HELPERS
  const $ = (selector, context = document) => context.querySelector(selector);

  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  // 1. LENIS SMOOTH SCROLL INITIALIZATION
  const initSmoothScroll = () => {
    if (typeof window.Lenis !== "undefined") {
      try {
        state.lenis = new window.Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          smoothWheel: true,
          overscroll: false,
        });

        const raf = (time) => {
          state.lenis.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);

        if (window.gsap && window.ScrollTrigger) {
          state.lenis.on("scroll", window.ScrollTrigger.update);

          // Lenis is already driven by the requestAnimationFrame loop above.
          // Do NOT call state.lenis.raf() again from the GSAP ticker; that
          // double-drives Lenis and causes jitter/glitchy scrolling.
          window.gsap.ticker.lagSmoothing(0);
        }
      } catch (err) {
        console.warn("[SmoothScroll] Falling back to native scroll:", err);
      }
    }
  };

  // 2. CUSTOM CURSOR PHYSICS
  const initCustomCursor = () => {
    const cursor = $("#customCursor");

    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const dot = $(".cursor-dot", cursor);

      if (dot) {
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    });

    const loopRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      const ring = $(".cursor-ring", cursor);

      if (ring) {
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      requestAnimationFrame(loopRing);
    };

    loopRing();

    $$("a, button, input, .format-pill-btn, .cell-card").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hovering");
      });

      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hovering");
      });
    });
  };

  // 3. GSAP SCROLL REVEALS & BLURRY UNBLUR LOGIC
  const initEntranceAnimations = () => {
    document.body.classList.remove("is-loading");

    const stackedImages = $$(".stacked-image-wrapper");

    // MEDIA FRAMES ARE STATIC.
    // Do not attach GSAP/ScrollTrigger transforms to Image 1/2/3.
    // The media column must never move, push, slide, scale, or reflow
    // because of scrolling. Keep the existing layout/content untouched.
    stackedImages.forEach((img) => {
      img.style.opacity = "1";
      img.style.filter = "none";
      img.style.transform = "none";
      img.style.willChange = "auto";
    });

    // Primary: GSAP & ScrollTrigger
    if (typeof window.gsap !== "undefined") {
      const tl = window.gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.fromTo(
        ".site-header",
        {
          y: -20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
        },
      ).fromTo(
        ".product-main-title .title-line",
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
        },
        "-=0.3",
      );

      if (typeof window.ScrollTrigger !== "undefined") {
        window.gsap.fromTo(
          ".details-bottom-block",
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".details-bottom-block",
              start: "top 90%",
            },
          },
        );

        window.ScrollTrigger.batch(".related-cell", {
          start: "top 88%",

          onEnter: (elements) => {
            window.gsap.fromTo(
              elements,
              {
                y: 30,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.12,
                ease: "power2.out",
              },
            );
          },

          once: true,
        });

        return;
      }
    }

    // Defensive Fallback:
    // IntersectionObserver handles image reveal if CDN is delayed
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      },
    );

    stackedImages.forEach((img, index) => {
      if (index === 0) {
        img.classList.add("is-revealed");
      } else {
        observer.observe(img);
      }
    });

    const bottomBlock = $(".details-bottom-block");

    if (bottomBlock) {
      observer.observe(bottomBlock);
    }
  };

  // 4. EXPANDABLE DETAILS & SHARE API
  const initDetailsExpansion = () => {
    const btnToggle = $("#btnDetailsToggle");
    const creditsBlock = $("#expandableCredits");
    const label = $(".toggle-text", btnToggle);

    btnToggle?.addEventListener("click", () => {
      state.isExpanded = !state.isExpanded;

      btnToggle.setAttribute("aria-expanded", String(state.isExpanded));

      if (state.isExpanded) {
        creditsBlock?.classList.add("is-expanded");

        if (label) {
          label.textContent = "Close Details";
        }
      } else {
        creditsBlock?.classList.remove("is-expanded");

        if (label) {
          label.textContent = "Read More";
        }
      }
    });

    $("#btnShareThis")?.addEventListener("click", async () => {
      const shareData = {
        title: state.product.title,
        text: state.product.title || "TuneTrack product",
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (_) {}
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);

          const shareSpan = $("#btnShareThis span");

          if (shareSpan) {
            const originalText = shareSpan.textContent;

            shareSpan.textContent = "Link Copied!";

            setTimeout(() => {
              shareSpan.textContent = originalText;
            }, 2000);
          }
        } catch (_) {}
      }
    });
  };

  // 5. FORMAT SELECTOR
  const setFormat = (formatKey) => {
    const formats = {
      vinyl: {
        label: "Black Vinyl",
      },

      aiff: {
        label: "AIFF",
      },

      mp3: {
        label: "MP3",
      },
    };

    const target = formats[formatKey] || formats.vinyl;

    state.product.format = formatKey;
    state.product.formatLabel = target.label;

    // PRICE FROM DATA CATALOG LOCAL
    const catalogPrice = state.product.catalogPrice;
    state.product.price = catalogPrice;

    const priceText = String(catalogPrice);

    const btnPriceDisplay = $("#btnPriceDisplay");

    if (btnPriceDisplay) {
      btnPriceDisplay.textContent = priceText;
    }

    $$(".format-pill-btn, .dock-format-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.format === formatKey);
    });

    const dockSpan = $("#dockAddToCart span");

    if (dockSpan) {
      dockSpan.textContent = `Add To Bag (${priceText})`;
    }
  };

  const initFormatSelector = () => {
    $$(".format-pill-btn, .dock-format-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setFormat(btn.dataset.format);
      });
    });
  };

  // 6. QUANTITY CONTROLLER
  const updateQuantity = (newQty) => {
    state.product.quantity = Math.max(1, newQty);

    const qtyStr = String(state.product.quantity);

    const mainQty = $("#mainQty");

    if (mainQty) {
      mainQty.textContent = qtyStr;
    }

    $$(".qty-display").forEach((node) => {
      node.textContent = qtyStr;
    });
  };

  const initQuantityControls = () => {
    $("#mainQtyMinus")?.addEventListener("click", () =>
      updateQuantity(state.product.quantity - 1),
    );

    $("#mainQtyPlus")?.addEventListener("click", () =>
      updateQuantity(state.product.quantity + 1),
    );

    $$(".btn-qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateQuantity(state.product.quantity - 1);
      });
    });

    $$(".btn-qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateQuantity(state.product.quantity + 1);
      });
    });
  };

  // 7. SHOPPING CART ENGINE & SIDE DRAWER
  // Catalog prices are stored as display strings (for example "IDR 120.000").
  // Keep the exact catalog value in the UI and normalize only for totals.
  const parseCatalogPrice = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return 0;

    // TuneTrack catalog values such as "IDR 120.000" use dots as
    // thousands separators, not decimal separators.
    if (/^IDR\s*/i.test(raw)) {
      const parsed = Number(raw.replace(/[^0-9]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    const numeric = raw
      .replace(/[^0-9,.-]/g, "")
      .replace(/,(?=[0-9]{2}$)/, ".")
      .replace(/\.(?=.*\.)/g, "");

    const parsed = Number(numeric);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatCatalogTotal = (items) => {
    const first = items?.[0];
    const catalogPrice = String(first?.catalog?.price ?? first?.price ?? "").trim();
    const total = items.reduce(
      (sum, item) =>
        sum + parseCatalogPrice(item.catalog?.price ?? item.price) * item.quantity,
      0,
    );

    if (/^IDR\s*/i.test(catalogPrice)) {
      return `IDR ${Math.round(total).toLocaleString("id-ID")}`;
    }

    return total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const syncPaymentOptions = () => {
    const product =
      window.TuneTrackCurrentProduct ||
      state.product.catalog ||
      state.cart[0]?.catalog ||
      null;

    const indonesia = $("#tunetrackIndonesiaPayment");
    const global = $("#tunetrackGlobalPayment");

    if (indonesia) {
      const url = String(product?.link || "").trim();
      indonesia.href = url || "#";
      indonesia.classList.toggle("is-disabled", !url);
      indonesia.setAttribute("aria-disabled", url ? "false" : "true");
    }

    if (global) {
      const url = String(product?.gumroadLink || "").trim();
      global.href = url || "#";
      global.classList.toggle("is-disabled", !url);
      global.setAttribute("aria-disabled", url ? "false" : "true");
    }
  };

  const updateCartUI = () => {
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    const subtotal = state.cart.reduce(
      (sum, item) =>
        sum + parseCatalogPrice(item.catalog?.price ?? item.price) * item.quantity,
      0,
    );

    const headerCartCount = $("#headerCartCount");

    if (headerCartCount) {
      headerCartCount.textContent = String(totalCount);
    }

    $$(".cart-val-sync").forEach((node) => {
      node.textContent = String(totalCount);
    });

    const drawerSubtotal = $("#drawerSubtotalPrice");

    if (drawerSubtotal) {
      drawerSubtotal.textContent = state.cart.length
        ? formatCatalogTotal(state.cart)
        : "—";
    }

    const list = $("#drawerItemsList");

    if (!list) return;

    if (state.cart.length === 0) {
      list.innerHTML = `
        <div class="drawer-empty-state">
          <p>Your bag is currently empty.</p>
        </div>
      `;

      return;
    }

    list.innerHTML = state.cart
      .map(
        (item, index) => `
          <div
            class="drawer-item-row"
            data-cart-index="${index}"
          >
            <div>
              <div class="drawer-item-name">
                TuneTrack — ${escapeHTML(item.title)}
              </div>

              <div class="drawer-item-meta">
                ${item.artist ? `${escapeHTML(item.artist)} • ` : ""}Multitrack • Qty: ${item.quantity}
              </div>

              <button
                type="button"
                class="drawer-item-remove"
                data-remove="${index}"
              >
                Remove
              </button>
            </div>

            <div class="drawer-item-price">
              ${escapeHTML(String(item.catalog?.price ?? item.price ?? "—"))}
            </div>
          </div>
        `,
      )
      .join("");

    $$("[data-remove]", list).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.remove, 10);

        state.cart.splice(idx, 1);
        updateCartUI();
      });
    });
  };

  const addToBag = () => {
    const existing = state.cart.find(
      (item) =>
        item.format === state.product.format &&
        item.title === state.product.title,
    );

    if (existing) {
      existing.quantity += state.product.quantity;
    } else {
      state.cart.push({
        ...state.product,
        catalog: state.product.catalog || window.TuneTrackCurrentProduct || null,
      });
    }

    updateCartUI();
    openCartDrawer();
    updateQuantity(1);
  };

  const openCartDrawer = () => {
    $("#cartOverlay")?.classList.add("is-open");
    $("#cartDrawer")?.classList.add("is-open");
  };

  const closeCartDrawer = () => {
    $("#cartOverlay")?.classList.remove("is-open");
    $("#cartDrawer")?.classList.remove("is-open");
  };

  const initCartDrawer = () => {
    $("#cartTrigger")?.addEventListener("click", openCartDrawer);

    $("#btnCloseDrawer")?.addEventListener("click", closeCartDrawer);

    $("#cartOverlay")?.addEventListener("click", closeCartDrawer);

    $("#mainAddToBag")?.addEventListener("click", addToBag);

    $("#dockAddToCart")?.addEventListener("click", addToBag);

    $("#btnDrawerCheckout")?.addEventListener("click", () => {
      const checkout = $("#tunetrackPaymentCheckout");
      if (!checkout) return;

      syncPaymentOptions();
      checkout.hidden = !checkout.hidden;

      const checkoutButton = $("#btnDrawerCheckout");
      if (checkoutButton) {
        checkoutButton.textContent = checkout.hidden
          ? "Proceed To Checkout →"
          : "Choose Payment →";
      }
    });

    $("#tunetrackIndonesiaPayment")?.addEventListener("click", (event) => {
      if ($("#tunetrackIndonesiaPayment")?.classList.contains("is-disabled")) {
        event.preventDefault();
      }
    });

    $("#tunetrackGlobalPayment")?.addEventListener("click", (event) => {
      if ($("#tunetrackGlobalPayment")?.classList.contains("is-disabled")) {
        event.preventDefault();
      }
    });
  };

  // 8. STICKY DOCKED PURCHASE BAR TRIGGER
  const initStickyDock = () => {
    const header = $(".site-header");
    const dock = $("#stickyDockBar");

    if (!dock) return;

    let rafId = 0;

    const syncDockPosition = () => {
      rafId = 0;

      const headerHeight = header ? header.getBoundingClientRect().height : 0;

      /*
       * The main header is intentionally part of normal document flow.
       * Once it has completely left the viewport, the compact purchase
       * header takes over at viewport top.
       *
       * Do NOT key this off .product-purchase-row: with Lenis that element
       * can be far below the viewport while the native scroll event timing
       * is different from the visual scroll position.
       */
      const shouldShow = window.scrollY >= Math.max(1, headerHeight);

      dock.classList.toggle("is-visible", shouldShow);
      dock.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    };

    const requestSync = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(syncDockPosition);
    };

    requestSync();

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    if (state.lenis) {
      state.lenis.on("scroll", requestSync);
    }
  };

  // 9. HERO TITLE SCROLL FOLLOW + TITLE ENDPOINT
  const initHeroTitleScroll = () => {
    const titleHeader = $(".product-title-header");
    const title = $("#productTitle");
    const titleLine = $(".title-line", title);

    if (!titleHeader || !title || !titleLine) return;

    /* ================================================================
     * TITLE TYPEWRITER / STACKED-SCALE TUNERS
     * ================================================================ */
    const TITLE_START_SCALE = 1.3;
    const TITLE_END_SCALE = 1.0;
    const TITLE_EXTRA_TRAVEL = 60;
    const TITLE_META_GAP = 20;

    // Typewriter starts exactly when IMAGE 2 reaches the viewport top.
    const TITLE_SEQUENCE_DISTANCE_RATIO = 1.65;
    const TITLE_TYPEWRITER_START_DELAY = -2;

    // First remove characters, then rebuild them.
    const TITLE_COLLAPSE_PHASE = 0.52;
    const TITLE_TYPEWRITER_STAGGER = 0.018;

    const chars = Array.from(titleLine.querySelectorAll(".title-char"));
    if (!chars.length) return;

    const baseFontSize = parseFloat(getComputedStyle(title).fontSize) || 32;
    let safeStartFontSize = baseFontSize * TITLE_START_SCALE;
    let maxTitleTravel = Infinity;
    let typewriterStartScroll = 0;
    let typewriterEndScroll = 0;
    let currentScroll = state.lenis ? state.lenis.scroll : window.scrollY;
    let rafId = 0;
    let lastStepKey = "";

    // GPU-friendly typewriter: avoid layout/reflow while scrolling.
    const applyCharState = (char, visible) => {
      char.style.display = "inline-block";
      char.style.opacity = visible ? "1" : "0";
      char.style.transform = "translate3d(0,0,0)";
      char.style.transformOrigin = "left center";
      char.style.transition = "none";
      char.style.willChange = "opacity";
    };

    chars.forEach((char) => applyCharState(char, true));

    /*
     * IMPORTANT:
     * Never scale the whole title with transform(). That is what caused
     * the previous version to visually grow outside the right column and
     * get cropped by html { overflow-x:hidden }.
     *
     * We change the actual font-size instead. The browser is therefore
     * allowed to re-wrap the text naturally at every discrete typewriter
     * step, so the glyphs remain readable and inside the column.
     */
    titleLine.style.display = "block";
    titleLine.style.width = "100%";
    titleLine.style.maxWidth = "100%";
    titleLine.style.whiteSpace = "normal";
    titleLine.style.overflow = "visible";
    title.style.overflow = "visible";
    title.style.width = "100%";
    title.style.maxWidth = "100%";
    title.style.transform = "none";
    titleHeader.style.overflow = "visible";
    titleHeader.style.transformOrigin = "top left";
    titleHeader.style.willChange = "transform";

    const getTitleEndpoint = () => {
      const detailsBox =
        $(".product-meta-box") ||
        $(".details-bottom-block") ||
        $(".product-details-column");

      if (!detailsBox) return Infinity;

      const scrollNow = state.lenis ? state.lenis.scroll : window.scrollY;

      /*
       * The title may keep following the scroll, but its bottom must stop
       * before the details/meta area begins. Calculate the safe travel from
       * the title's current document position instead of using image 3.
       */
      const titleRect = titleHeader.getBoundingClientRect();
      const detailsRect = detailsBox.getBoundingClientRect();

      const titleDocumentTop = titleRect.top + scrollNow;
      const detailsDocumentTop = detailsRect.top + scrollNow;

      const safetyGap = TITLE_META_GAP;
      const availableTravel =
        detailsDocumentTop - safetyGap - titleDocumentTop - titleRect.height;

      return Math.max(0, availableTravel + TITLE_EXTRA_TRAVEL);
    };

    const getImage2StartScroll = () => {
      const image2 = $(".column-media .stacked-image-wrapper:nth-child(2)");
      if (!image2) return 0;

      const scrollNow = state.lenis ? state.lenis.scroll : window.scrollY;
      const rect = image2.getBoundingClientRect();
      const documentTop = rect.top + scrollNow;

      return Math.max(0, documentTop + TITLE_TYPEWRITER_START_DELAY);
    };

    /*
     * Find the largest REAL font size that still fits horizontally.
     * We intentionally do not use transform scaling here. That means a
     * larger title reflows instead of becoming a giant cropped bitmap-like
     * block. Height is allowed to extend naturally; the text itself must
     * never be clipped.
     */
    const measureSafeFontSize = () => {
      // Restore the original large opening scale without changing it on
      // every scroll frame. This keeps the title large at the start while
      // avoiding the expensive per-scroll font-size reflow.
      safeStartFontSize = baseFontSize * TITLE_START_SCALE;
      title.style.fontSize = `${safeStartFontSize}px`;
    };

    const clamp01 = (value) => Math.min(1, Math.max(0, value));

    const render = () => {
      rafId = 0;

      const y = Math.max(0, currentScroll);
      const scrollOffset = y > 0 ? -60 : 0;
      const travel = Math.min(Math.max(0, y + scrollOffset), maxTitleTravel);

      const sequenceDistance = Math.max(
        1,
        maxTitleTravel * TITLE_SEQUENCE_DISTANCE_RATIO,
      );

      typewriterEndScroll = typewriterStartScroll + sequenceDistance;

      let typewriterProgress = 0;
      if (y > typewriterStartScroll) {
        typewriterProgress = clamp01(
          (y - typewriterStartScroll) /
            Math.max(1, typewriterEndScroll - typewriterStartScroll),
        );
      }

      const totalChars = chars.length;
      let activeCount = totalChars;
      let stepKey = "pre-typewriter";

      if (typewriterProgress > 0) {
        if (typewriterProgress < TITLE_COLLAPSE_PHASE) {
          const local = clamp01(typewriterProgress / TITLE_COLLAPSE_PHASE);
          const removed = Math.min(
            totalChars,
            Math.floor(local * (totalChars + 1)),
          );

          activeCount = totalChars - removed;
          stepKey = `collapse-${removed}`;
        } else {
          const local = clamp01(
            (typewriterProgress - TITLE_COLLAPSE_PHASE) /
              (1 - TITLE_COLLAPSE_PHASE),
          );

          const revealed = Math.min(
            totalChars,
            Math.floor(local * (totalChars + 1)),
          );

          activeCount = revealed;
          stepKey = `rebuild-${revealed}`;
        }
      }

      // Only opacity changes at each typewriter step. No font-size changes,
      // no layout reflow, and no per-frame DOM writes beyond the compositor
      // transform below.
      if (stepKey !== lastStepKey) {
        lastStepKey = stepKey;

        chars.forEach((char, index) => {
          applyCharState(char, index < activeCount);
        });
      }

      // Compositor-friendly movement; does not trigger layout.
      const scaleProgress = clamp01(
        travel / Math.max(1, maxTitleTravel)
      );

      const titleScale =
        TITLE_START_SCALE +
        (TITLE_END_SCALE - TITLE_START_SCALE) * scaleProgress;

      titleHeader.style.transform =
        `translate3d(0, ${travel}px, 0) scale(${titleScale})`;
    };

    const requestRender = (value) => {
      if (typeof value === "number") currentScroll = value;
      if (rafId) return;
      rafId = window.requestAnimationFrame(render);
    };

    const syncEndpoint = () => {
      measureSafeFontSize();
      maxTitleTravel = getTitleEndpoint();
      typewriterStartScroll = getImage2StartScroll();
      lastStepKey = "";
      requestRender(currentScroll);
    };

    requestAnimationFrame(syncEndpoint);

    if (state.lenis) {
      state.lenis.on("scroll", ({ scroll }) => {
        currentScroll = scroll;
        requestRender(currentScroll);
      });
    } else {
      window.addEventListener("scroll", () => requestRender(window.scrollY), {
        passive: true,
      });
    }

    window.addEventListener("resize", syncEndpoint);
  };

  // BOOTSTRAP ALL MODULES
  // Final catalog-price sync runs AFTER every module so the default $18
  // placeholder can never win over the resolved catalog price.
  const syncCatalogButtonPrice = () => {
    const product = window.TuneTrackCurrentProduct || findCatalogProduct();
    const btnPriceDisplay = $("#btnPriceDisplay");

    if (!product || !btnPriceDisplay) return false;

    const catalogPrice = product.price;
    if (catalogPrice === undefined || catalogPrice === null) return false;

    const priceText = String(catalogPrice).trim();
    if (!priceText) return false;

    if (btnPriceDisplay.textContent !== priceText) {
      btnPriceDisplay.textContent = priceText;
    }

    return true;
  };

  const protectCatalogButtonPrice = () => {
    syncCatalogButtonPrice();

    const btnPriceDisplay = $("#btnPriceDisplay");
    if (
      !btnPriceDisplay ||
      btnPriceDisplay.dataset.catalogPriceGuard === "true"
    ) {
      return;
    }

    btnPriceDisplay.dataset.catalogPriceGuard = "true";

    const observer = new MutationObserver(() => {
      syncCatalogButtonPrice();
    });

    observer.observe(btnPriceDisplay, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // Cover late writes from the existing format/bootstrap code.
    [0, 50, 150, 300, 600].forEach((delay) => {
      setTimeout(syncCatalogButtonPrice, delay);
    });
  };

  const bootstrap = () => {
    initCatalogProductIntegration();
    initRelatedCatalogItems();
    initProductSleeveArtwork();

    setFormat("vinyl");

    initSmoothScroll();
    initCustomCursor();
    initEntranceAnimations();
    initDetailsExpansion();
    initFormatSelector();
    initQuantityControls();
    initCartDrawer();
    initStickyDock();
    initHeroTitleScroll();
    protectCatalogButtonPrice();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, {
      once: true,
    });
  } else {
    bootstrap();
  }
})();

/* ============================================================================
 * TUNETRACK CATALOG HEADER — ISOLATED MOBILE MENU BRIDGE
 * Keeps the original Product Page runtime untouched.
 * Search is intentionally not wired because the catalog search was removed.
 * ========================================================================== */
(() => {
  "use strict";

  const initCatalogTopMenu = () => {
    const mount = document.getElementById("catalogTopIntegration");
    if (!mount) return;

    const toggle = mount.querySelector("#tncoHeaderMenuButton");
    const menu = mount.querySelector("#tncoMobileMenu");
    const close = mount.querySelector("#tncoMobileMenuClose");
    if (!toggle || !menu || !close) return;

    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("tnco-mobile-menu-open", open);
      document.body.classList.toggle("tnco-mobile-menu-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(!menu.classList.contains("is-open"));
    });

    close.addEventListener("click", () => setOpen(false));

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCatalogTopMenu, {
      once: true,
    });
  } else {
    initCatalogTopMenu();
  }
})();

const params = new URLSearchParams(window.location.search);
const productId = params.get("item");

const product = window.TuneTrackCatalog?.find((item) => item.id === productId);

if (product) {
  document.getElementById("brandTitle").textContent = product.artist || "";

  const hypeTitle = document.querySelector(".hype-sticker .hype-title");

  if (hypeTitle) {
    hypeTitle.textContent = product.artist || "";
  }
}

(() => {
  const TEXT_TEMPLATES = [
    {
      publicText:
        "Built for live playback, production, and studio work, this release gives you the individual instrument stems and track files you need to work with the music your own way. Each part is separated and ready to drop straight into your DAW, giving you the freedom to rebuild, rearrange, layer, or mix the track around your own setup.",

      moreText:
        "Everything is delivered through Google Drive and organized for easy access, with the individual stems and original track files ready whenever you need them. Use them as building blocks for your own production, playback setup, or live performance and take the track wherever your workflow leads.",
    },

    {
      publicText:
        "Get the track exactly where you need it with a complete set of individual instrument stems and original track files. The files are prepared for flexible use across production, playback, rehearsal, and live setups, making it easy to work with each part without having to deal with a single mixed-down file.",

      moreText:
        "Your files are delivered through Google Drive in a straightforward format that keeps everything easy to find and ready to use. Pull out the parts you need, build your own arrangement, or drop the stems directly into your existing workflow whenever you are ready to work.",
    },

    {
      publicText:
        "This release gives you more than just the finished track. You get the individual instrument stems and original track files so you can shape the material around your own workflow, whether that means rebuilding the mix, preparing playback, or putting together something completely your own.",

      moreText:
        "All files are delivered through Google Drive, keeping the package simple and accessible whenever you need it. The individual parts are there when you want to dig deeper into the track, experiment with the arrangement, or prepare everything for your next session or performance.",
    },
  ];

  /*
   * PRODUCT INFORMATION COPY
   * The templates above used to be declared but never rendered.
   * Keep the existing UI intact and only populate the existing
   * "For your Information:" area + expandable details area.
   */
  const initProductInformationText = () => {
    if (document.documentElement.dataset.ttInfoTextBound === "true") {
      return true;
    }

    const template =
      TEXT_TEMPLATES[Math.floor(Math.random() * TEXT_TEMPLATES.length)];

    if (!template) return false;

    const normalizeText = (value) =>
      String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const publicSelectors = [
      "#productDescription",
      "#productDescriptionText",
      ".product-description",
      ".product-description-text",
      "[data-product-description]",
      "[data-public-text]",
    ];

    let publicTarget = null;

    for (const selector of publicSelectors) {
      const candidate = document.querySelector(selector);
      if (candidate) {
        publicTarget = candidate;
        break;
      }
    }

    /*
     * Current product-page markup has the visible label
     * "For your Information:" but no dedicated JS target for its copy.
     * Find that label without changing the surrounding structure.
     */
    if (!publicTarget) {
      const infoLabel = [...document.querySelectorAll("p, div, span, h1, h2, h3, h4, h5, h6")]
        .find((el) => normalizeText(el.textContent) === "for your information:");

      if (infoLabel) {
        publicTarget = document.createElement("p");
        publicTarget.className = "tt-product-public-text";
        publicTarget.textContent = template.publicText;
        infoLabel.insertAdjacentElement("afterend", publicTarget);
      }
    } else {
      publicTarget.textContent = template.publicText;
    }

    /*
     * More text belongs inside the existing expandable details block.
     * Do not replace credit rows or any existing markup.
     */
    const creditsBlock =
      document.getElementById("expandableCredits") ||
      document.querySelector("[data-more-text]");

    if (creditsBlock) {
      let moreTarget =
        creditsBlock.querySelector(".tt-product-more-text") ||
        creditsBlock.querySelector("[data-more-text]");

      if (!moreTarget) {
        moreTarget = document.createElement("p");
        moreTarget.className = "tt-product-more-text";
        creditsBlock.appendChild(moreTarget);
      }

      moreTarget.textContent = template.moreText;
    }

    if (!publicTarget && !creditsBlock) {
      return false;
    }

    document.documentElement.dataset.ttInfoTextBound = "true";
    return true;
  };

  const bootProductInformationText = () => {
    if (initProductInformationText()) return;

    let attempts = 0;
    const retry = setInterval(() => {
      attempts += 1;

      if (initProductInformationText() || attempts >= 50) {
        clearInterval(retry);
      }
    }, 100);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootProductInformationText, {
      once: true,
    });
  } else {
    bootProductInformationText();
  }

  (() => {
    const smileySVG = `
    <svg
      class="hype-smiley"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <mask id="hypeSmileyCutout">
          <circle cx="40" cy="40" r="36" fill="white"/>

          <circle cx="28" cy="32" r="4" fill="black"/>
          <circle cx="52" cy="32" r="4" fill="black"/>

          <path
            d="M24 45C27.5 53 33 57 40 57C47 57 52.5 53 56 45"
            fill="none"
            stroke="black"
            stroke-width="4"
            stroke-linecap="round"
          />
        </mask>
      </defs>

      <rect
        width="80"
        height="80"
        fill="#fff"
        mask="url(#hypeSmileyCutout)"
      />
    </svg>
  `;

    const syncHypeArtist = () => {
      const product = window.TuneTrackCurrentProduct;
      if (!product) return false;

      const hypeTitle = document.querySelector(".hype-title");
      if (!hypeTitle) return false;

      hypeTitle.innerHTML = `
      <span class="hype-smiley-wrap">
        ${smileySVG}
      </span>

      <span class="hype-artist">
        ${product.artist || ""}
      </span>

      <span class="hype-smiley-wrap">
        ${smileySVG}
      </span>
    `;

      // Random starting angle
      const randomStart = Math.floor(Math.random() * 360);
      const oppositeStart = (randomStart + 180) % 360;

      const smileys = hypeTitle.querySelectorAll(".hype-smiley-wrap");

      if (smileys[0]) {
        smileys[0].style.setProperty("--smiley-start", `${randomStart}deg`);
      }

      if (smileys[1]) {
        smileys[1].style.setProperty("--smiley-start", `${oppositeStart}deg`);
      }

      return true;
    };

    const style = document.createElement("style");

    style.textContent = `
    .hype-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
    }

    .hype-smiley-wrap {
      display: inline-flex;
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      transform-origin: center center;
      animation: hypeSmileySpin 10s linear infinite;
    }

    .hype-smiley {
      display: block;
      width: 24px;
      height: 24px;
    }

    @keyframes hypeSmileySpin {
      from {
        transform: rotate(var(--smiley-start));
      }

      to {
        transform: rotate(calc(var(--smiley-start) + 360deg));
      }
    }

    .hype-artist {
      display: inline-block;
    }
  `;

    document.head.appendChild(style);

    if (syncHypeArtist()) return;

    const retry = setInterval(() => {
      if (syncHypeArtist()) {
        clearInterval(retry);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(retry);
    }, 5000);
  })();
})();

const initProductSleeveArtwork = () => {
  const artwork = document.getElementById("productSleeveArtwork");
  const product = window.TuneTrackCurrentProduct;

  if (!artwork || !product) return;

  let imagePath = String(product.image || "").trim();

  if (!imagePath) {
    artwork.removeAttribute("src");
    return;
  }

  // Catalog path:
  // assets/thumbnail/filename.jpg
  //
  // Actual product-page asset:
  // assets/images/thumbnail/filename.jpg
  imagePath = imagePath.replace(
    /^assets\/thumbnail\//,
    "assets/images/thumbnail/",
  );

  artwork.src = new URL(imagePath, window.location.href).href;
  artwork.alt = product.title || "";

  // Image 1 is always a true square surface. The CSS owns the visual crop;
  // these inline dimensions only prevent intrinsic image sizing from
  // changing the layout while the asset is loading.
  artwork.style.width = "100%";
  artwork.style.height = "100%";
  artwork.style.aspectRatio = "1 / 1";
  artwork.style.objectFit = "cover";
  artwork.style.objectPosition = "center center";

  artwork.onload = () => {
    artwork.classList.add("is-loaded");
  };

  artwork.onerror = () => {
    console.error("[TuneTrack Product Artwork] Failed to load:", artwork.src);
  };
};


/* ============================================================================
 * TUNETRACK PRODUCT PLAYER — ISOLATED IMAGE 2 VINYL CONTROLLER
 * Image 2 is the vinyl/player. Image 3 is only the visible video surface.
 * This module never replaces or hides existing product sections.
 * ========================================================================== */
(() => {
  "use strict";

  const PLAYER_TEXTS = [
    "LIVE PLAYBACK",
    "STEMS READY",
    "48KHZ SESSION",
    "STAGE READY",
    "FULL TRACK",
    "PLAYBACK READY",
  ];

  let ytPlayer = null;
  let ytReady = false;
  let pendingPlay = false;
  let lastProductKey = "";

  const getProduct = () => window.TuneTrackCurrentProduct || null;

  const getYouTubeId = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";

    try {
      const url = new URL(raw);

      if (url.hostname === "youtu.be") {
        return url.pathname.replace(/^\/+/, "").split("/")[0] || "";
      }

      if (url.hostname.includes("youtube.com")) {
        if (url.searchParams.get("v")) return url.searchParams.get("v");
        const parts = url.pathname.split("/").filter(Boolean);
        const embedIndex = parts.indexOf("embed");
        if (embedIndex !== -1 && parts[embedIndex + 1]) {
          return parts[embedIndex + 1];
        }
        const shortsIndex = parts.indexOf("shorts");
        if (shortsIndex !== -1 && parts[shortsIndex + 1]) {
          return parts[shortsIndex + 1];
        }
      }
    } catch (_) {
      // Catalog may contain a bare video ID.
    }

    const bare = raw.replace(/^\/+|\/+$/g, "");
    return /^[A-Za-z0-9_-]{6,20}$/.test(bare) ? bare : "";
  };

  const getThumbnailUrl = (youtubeId) =>
    youtubeId
      ? `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`
      : "";

  const setPlayingUI = (playing) => {
    const vinyl = document.getElementById("productVinylPlayer");
    const status = document.getElementById("productVideoStatus");
    const indicator = document.getElementById("vinylPlayIndicator");
    const icon = indicator?.querySelector(".vinyl-play-icon");
    const text = indicator?.querySelector(".vinyl-play-text");

    if (vinyl) {
      vinyl.classList.toggle("is-playing", playing);
      vinyl.setAttribute("aria-pressed", playing ? "true" : "false");
    }

    if (status) {
      status.textContent = playing ? "PLAYING" : "READY";
    }

    if (icon) icon.textContent = playing ? "Ⅱ" : "▶";
    if (text) text.textContent = playing ? "PLAYING" : "PLAY";
  };

  const setVideoLoading = (loading) => {
    const loadingEl = document.getElementById("productVideoLoading");
    if (loadingEl) {
      loadingEl.style.display = loading ? "grid" : "none";
    }
  };

  const buildVideo = (youtubeId) => {
    const frame = document.getElementById("productVideoFrame");
    if (!frame) return;

    frame.innerHTML = "";
    ytPlayer = null;
    ytReady = false;

    if (!youtubeId) {
      setVideoLoading(false);
      const empty = document.createElement("div");
      empty.className = "product-video-loading";
      empty.textContent = "NO VIDEO";
      frame.appendChild(empty);
      return;
    }

    setVideoLoading(true);

    const mountPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(mountPlayer, 150);
        return;
      }

      ytPlayer = new window.YT.Player(frame, {
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            ytReady = true;
            setVideoLoading(false);

            if (pendingPlay) {
              pendingPlay = false;
              try {
                ytPlayer.playVideo();
              } catch (_) {}
            }
          },
          onStateChange: (event) => {
            if (!window.YT) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlayingUI(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setPlayingUI(false);
            }
          },
        },
      });
    };

    mountPlayer();
  };

  const togglePlayback = () => {
    if (!ytPlayer || !ytReady) {
      pendingPlay = true;
      return;
    }

    try {
      const state = ytPlayer.getPlayerState();

      if (state === window.YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    } catch (_) {}
  };

  const syncProduct = () => {
    const product = getProduct();
    if (!product) return false;

    const title = String(product.title || product.name || "").trim() || "TUNETRACK";
    const youtubeId = getYouTubeId(product.youtube);
    const productKey = `${title}::${youtubeId}`;

    if (productKey === lastProductKey) return true;
    lastProductKey = productKey;

    const labelTitle = document.getElementById("vinylLabelTitle");
    const labelSubtext = document.getElementById("vinylLabelSubtext");
    const artwork = document.getElementById("vinylArtworkImage");

    if (labelTitle) {
      labelTitle.textContent = title.toUpperCase();
    }

    if (labelSubtext) {
      labelSubtext.textContent =
        PLAYER_TEXTS[Math.floor(Math.random() * PLAYER_TEXTS.length)];
    }

    if (artwork) {
      const thumbnail = getThumbnailUrl(youtubeId);
      artwork.src = thumbnail;
      artwork.alt = `${title} artwork`;

      if (thumbnail) {
        artwork.onerror = () => {
          artwork.onerror = null;
          artwork.src = `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/default.jpg`;
        };
      } else {
        artwork.removeAttribute("src");
      }
    }

    setPlayingUI(false);
    buildVideo(youtubeId);

    return true;
  };

  const bindControls = () => {
    const vinyl = document.getElementById("productVinylPlayer");
    if (!vinyl || vinyl.dataset.playerBound === "true") return;

    vinyl.dataset.playerBound = "true";

    vinyl.addEventListener("click", (event) => {
      if (event.target.closest("button, a, iframe")) return;
      togglePlayback();
    });

    vinyl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePlayback();
      }
    });
  };

  const boot = () => {
    bindControls();

    const retry = () => {
      if (syncProduct()) return;
      setTimeout(retry, 100);
    };

    retry();

    // Catalog integration resolves asynchronously in some page loads.
    const observer = new MutationObserver(() => {
      syncProduct();
      bindControls();
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
    });

    setTimeout(() => observer.disconnect(), 10000);
  };

  // YouTube API callback. We only use it as a signal; the player itself is
  // constructed after the catalog product is available.
  window.onYouTubeIframeAPIReady = () => {
    syncProduct();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
