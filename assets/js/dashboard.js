// TuneTrack Dashboard — Firebase Auth + Profile + Notifications
// Functionality-only fix. Existing dashboard UI is intentionally untouched.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getAuth,
    getIdTokenResult,
    onAuthStateChanged,
    signOut,
    updateProfile,
    updatePassword,
    verifyBeforeUpdateEmail,
    reauthenticateWithCredential,
    deleteUser,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAd7sJx_5-rYDUBAuzEp-QZHTAgqoYKB7I",
    authDomain: "tunetrack-co.firebaseapp.com",
    projectId: "tunetrack-co",
    storageBucket: "tunetrack-co.firebasestorage.app",
    messagingSenderId: "6013781332",
    appId: "1:6013781332:web:86198dd552826c046eb4c1"
};

import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    deleteDoc,
    getDocs,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const LOGIN_PAGE = "login-page.html";


/* ============================================================
   TuneTrack — 3 HOUR ABSOLUTE AUTH SESSION
   Firebase Auth remains the source of truth.
   A dashboard session expires 3 hours after the last Firebase sign-in.
   ============================================================ */
const DASHBOARD_SESSION_MAX_AGE_MS = 3 * 60 * 60 * 1000;
let dashboardSessionExpiryTimer = null;
let dashboardIsAdmin = false;

const setAdminIndicator = (profile = null) => {
    const existing = document.getElementById("tt-admin-indicator");
    if (existing) existing.remove();

    if (!dashboardIsAdmin) return;

    const rawName = profile?.username || profile?.displayName || "Mintune";
    const adminName = String(rawName).replace(/\s*\|\s*Admin\s*$/i, "").trim() || "Mintune";

    const style = document.createElement("style");
    style.id = "tt-admin-indicator-style";
    style.textContent = `
        #tt-admin-indicator {
            position: fixed;
            left: 24px;
            bottom: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding: 10px 14px 11px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 13px;
            background: rgba(9,9,9,.84);
            box-shadow: 0 12px 34px rgba(0,0,0,.24);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            pointer-events: none;
            user-select: none;
            opacity: 0;
            transform: translateY(8px);
            animation: ttAdminIndicatorIn .45s cubic-bezier(.22,1,.36,1) .08s forwards;
        }
        #tt-admin-indicator .tt-admin-title,
        #tt-admin-indicator .tt-admin-sub {
            font-family: "Space Mono", "SFMono-Regular", Consolas, monospace;
            line-height: 1.25;
            white-space: nowrap;
        }
        #tt-admin-indicator .tt-admin-title {
            color: rgba(255,255,255,.92);
            font-size: 9px;
            letter-spacing: .015em;
        }
        #tt-admin-indicator .tt-admin-sub {
            color: rgba(255,255,255,.43);
            font-size: 8px;
            letter-spacing: .01em;
        }
        @keyframes ttAdminIndicatorIn {
            to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
            #tt-admin-indicator {
                left: 14px;
                bottom: 14px;
                padding: 9px 12px 10px;
                border-radius: 11px;
            }
        }
    `;

    const indicator = document.createElement("div");
    indicator.id = "tt-admin-indicator";
    indicator.innerHTML = `
        <div class="tt-admin-title">Logged in as Admin,</div>
        <div class="tt-admin-sub">hi there ${adminName}!</div>
    `;

    document.getElementById("tt-admin-indicator-style")?.remove();
    document.head.appendChild(style);
    document.body.appendChild(indicator);
};

const getFirebaseSignInTime = (user) => {
    const raw = user?.metadata?.lastSignInTime;
    const time = raw ? Date.parse(raw) : NaN;
    return Number.isFinite(time) ? time : 0;
};

const isDashboardSessionExpired = (user) => {
    if (dashboardIsAdmin) return false;

    const signedInAt = getFirebaseSignInTime(user);
    if (!signedInAt) return true;

    return (Date.now() - signedInAt) >= DASHBOARD_SESSION_MAX_AGE_MS;
};

const forceDashboardLogout = async (auth, reason = "expired") => {
    if (dashboardSessionExpiryTimer) {
        window.clearTimeout(dashboardSessionExpiryTimer);
        dashboardSessionExpiryTimer = null;
    }

    try {
        await signOut(auth);
    } catch (error) {
        console.warn("[TuneTrack Auth] Sign-out during session expiry failed:", error);
    } finally {
        redirectToLogin();
    }
};

const armDashboardSessionExpiry = (auth, user) => {
    if (dashboardIsAdmin) return true;

    if (dashboardSessionExpiryTimer) {
        window.clearTimeout(dashboardSessionExpiryTimer);
        dashboardSessionExpiryTimer = null;
    }

    const signedInAt = getFirebaseSignInTime(user);

    // No valid Firebase sign-in timestamp = never reveal the dashboard.
    if (!signedInAt) {
        forceDashboardLogout(auth, "missing-sign-in-time");
        return false;
    }

    const remaining = DASHBOARD_SESSION_MAX_AGE_MS - (Date.now() - signedInAt);

    if (remaining <= 0) {
        forceDashboardLogout(auth, "expired");
        return false;
    }

    dashboardSessionExpiryTimer = window.setTimeout(() => {
        forceDashboardLogout(auth, "expired");
    }, remaining);

    return true;
};

const enforceDashboardSession = async (auth, user) => {
    if (!user) return false;

    if (isDashboardSessionExpired(user)) {
        await forceDashboardLogout(auth, "expired");
        return false;
    }

    return armDashboardSessionExpiry(auth, user);
};


const redirectToLogin = () => {
    window.location.replace(LOGIN_PAGE);
};

const revealDashboard = () => {
    document.documentElement.classList.remove("auth-pending");
    document.documentElement.classList.add("auth-ready");
};

const updateUserUI = (user, profile = null) => {
    const profileName = profile?.displayName || profile?.username || "";
    const name = profileName || user?.displayName || user?.email?.split("@")[0] || "there";
    const email = user?.email || "";

    const welcome = document.getElementById("dashboardWelcome");
    if (welcome) {
        welcome.textContent = `Welcome back, ${name}. Here is your recent activity and product announcements.`;
    }

    const displayUsername = document.getElementById("displayUsername");
    if (displayUsername) displayUsername.textContent = name;

    const displayEmail = document.getElementById("displayEmail");
    if (displayEmail) displayEmail.textContent = email;

    const settingUsername = document.getElementById("settingUsername");
    if (settingUsername) settingUsername.value = profile?.username || profile?.displayName || user?.displayName || name;

    const settingEmail = document.getElementById("settingEmail");
    if (settingEmail) settingEmail.value = email;

    if (profile) {
        syncAvatarFromProfile(profile);
        syncAboutYouFromProfile(profile);
    }
};


const slugifyOwnedProduct = (value) => String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled-product";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (c) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"
}[c]));

const formatFreebieArtist = (value) => {
    let artist = String(value || "").trim();
    // Remove Ft./Feat./Featuring and everything that follows it.
    artist = artist.replace(/\s+(?:ft\.?|feat\.?|featuring)\b.*$/i, "").trim();
    // Hard cap: maximum two words, then maximum 20 characters.
    artist = artist.split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
    return artist.slice(0, 20).trim();
};

const applyFreebieArtistCap = (root = document) => {
    const grid = root?.querySelector ? (root.matches?.("#freebies-grid") ? root : root.querySelector("#freebies-grid")) : null;
    if (!grid) return;

    // The catalogue renderer has changed artist class names between versions.
    // Prefer known artist selectors, then fall back to the rendered catalogue
    // data so the cap is enforced without changing the source catalogue data.
    const nodes = new Set(grid.querySelectorAll(
        ".card-artist, .catalog-card-artist, .product-artist, .artist, [data-field=artist], [data-product-artist]"
    ));

    grid.querySelectorAll(".catalog-data-card").forEach(card => {
        const key = getFreebieCardKey(card);
        const item = getCatalogProductByKey(key);
        if (!item?.artist) return;
        const source = String(item.artist).trim();
        const formatted = formatFreebieArtist(source);
        if (!formatted) return;

        // If the renderer exposes a dedicated artist node, update it.
        // Otherwise locate a text-bearing descendant containing the original artist.
        card.querySelectorAll("*").forEach(node => {
            if (node.children.length) return;
            const text = String(node.textContent || "").trim();
            if (text && (text === source || text.includes(source))) nodes.add(node);
        });
    });

    nodes.forEach(node => {
        const formatted = formatFreebieArtist(node.textContent);
        if (formatted && formatted !== node.textContent.trim()) node.textContent = formatted;
    });
};

const normalizeOwnedKeys = (profile) => {
    const keys = new Set();
    // IMPORTANT: card claimed/inert state is based ONLY on ownedProducts.
    // freebieClaims is claim history/metadata and must never disable a card
    // by itself. This keeps every product clickable until ownership exists.
    const owned = Array.isArray(profile?.ownedProducts) ? profile.ownedProducts : [];
    owned.forEach(item => {
        if (typeof item === "string") keys.add(slugifyOwnedProduct(item));
        else if (item?.productKey) keys.add(slugifyOwnedProduct(item.productKey));
        else if (item?.title) keys.add(slugifyOwnedProduct(item.title));
    });
    return keys;
};

const productFromCatalog = (key, claim = null) => {
    const catalog = Array.isArray(window.TuneTrackCatalog) ? window.TuneTrackCatalog : [];
    const found = catalog.find(item => slugifyOwnedProduct(item?.title) === key);
    if (found) return found;
    if (claim?.title) return {
        title: claim.title,
        artist: claim.artist || "TuneTrack",
        image: claim.image || "",
        price: "Free"
    };
    return null;
};


const getYouTubeThumbnail = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
        const url = new URL(raw);
        let videoId = "";
        if (url.hostname.includes("youtu.be")) {
            videoId = url.pathname.replace(/^\/+/, "").split("/")[0];
        } else if (url.hostname.includes("youtube.com")) {
            videoId = url.searchParams.get("v") || "";
            if (!videoId && url.pathname.includes("/shorts/")) {
                videoId = url.pathname.split("/shorts/")[1]?.split("/")[0] || "";
            }
        }
        return videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : "";
    } catch {
        return "";
    }
};

const formatClaimedAt = (value) => {
    if (!value) return "—";
    let date = null;
    if (typeof value?.toDate === "function") {
        date = value.toDate();
    } else if (value?.seconds != null) {
        date = new Date(Number(value.seconds) * 1000);
    } else {
        const parsed = new Date(String(value));
        if (!Number.isNaN(parsed.getTime())) date = parsed;
    }
    if (!date || Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(date);
};

const renderOwnedProducts = (profile = {}) => {
    const list = document.getElementById("user-products-list");
    const empty = document.getElementById("empty-vault-state");
    if (!list) return;

    const ownedKeys = normalizeOwnedKeys(profile);
    const claims = Array.isArray(profile?.freebieClaims) ? profile.freebieClaims : [];
    const claimMap = new Map();
    claims.forEach(claim => {
        const key = claim?.productKey || slugifyOwnedProduct(claim?.title);
        if (key) claimMap.set(key, claim);
    });

    const products = [...ownedKeys]
        .map(key => productFromCatalog(key, claimMap.get(key)))
        .filter(Boolean);

    const statNumbers = document.querySelectorAll("#my-account .stat-number");
    if (statNumbers[0]) statNumbers[0].innerHTML = `${products.length} <span class="stat-label">ASSETS</span>`;
    if (statNumbers[1]) statNumbers[1].innerHTML = `${claims.length} <span class="stat-label">ASSETS</span>`;

    if (!products.length) {
        list.hidden = true;
        list.innerHTML = "";
        if (empty) empty.style.display = "";
        return;
    }

    if (empty) empty.style.display = "none";
    list.hidden = false;
    list.innerHTML = products.map((item, index) => {
        const title = String(item?.title || "Untitled");
        const artist = formatFreebieArtist(item?.artist || "TuneTrack");
        const key = slugifyOwnedProduct(title);
        const claim = claimMap.get(key) || {};
        // THE VAULT: always resolve the thumbnail from the LOCAL catalog first.
        // Firebase claim.image is deliberately not allowed to override the local asset.
        const catalogImage = String(item?.["myprod-thumb"] || item?.image || "").trim();
        const claimImage = String(claim?.image || "").trim();
        const image = catalogImage || claimImage;

        // Some older catalog entries use assets/thumbnail while some dashboard
        // builds keep the same assets under assets/images/thumbnail. Try both
        // local variants before falling back to a remote YouTube thumbnail.
        const localImageCandidates = [];
        const addLocalCandidate = (value) => {
            const raw = String(value || "").trim();
            if (!raw || localImageCandidates.includes(raw)) return;
            localImageCandidates.push(raw);
            if (raw.startsWith("assets/thumbnail/")) {
                localImageCandidates.push(raw.replace(/^assets\/thumbnail\//, "assets/images/thumbnail/"));
            } else if (raw.startsWith("assets/images/thumbnail/")) {
                localImageCandidates.push(raw.replace(/^assets\/images\/thumbnail\//, "assets/thumbnail/"));
            }
        };
        addLocalCandidate(catalogImage);
        addLocalCandidate(claimImage);

        const youtubeThumbnail = getYouTubeThumbnail(claim?.youtube || item?.youtube || item?.video || "");
        const fallbackImage = youtubeThumbnail || "";
        // FREE PRODUCT ACCESS: Google Drive must come from the local catalogue.
        // data-catalog-local.js stores this value in `drive-link`.
        // Do not let Firebase claim metadata override the local catalogue.
        const googleDrive = String(item?.["drive-link"] || "").trim();
        const imageHtml = image
            ? `<img class="tt-owned-card-thumb" src="${escapeHtml(localImageCandidates[0] || image)}" data-local-candidates="${escapeHtml(localImageCandidates.join("|"))}" data-fallback-src="${escapeHtml(fallbackImage)}" alt="${escapeHtml(title)}" loading="lazy">`
            : (fallbackImage
                ? `<img class="tt-owned-card-thumb" src="${escapeHtml(fallbackImage)}" alt="${escapeHtml(title)}" loading="lazy">`
                : `<div class="tt-owned-card-thumb tt-owned-card-thumb-empty" aria-hidden="true"></div>`);
        const claimedAt = formatClaimedAt(claim?.claimedAt);
        const claimedBy = String(profile?.displayName || profile?.username || claim?.displayName || claim?.username || "—").trim() || "—";
        const driveButton = googleDrive
            ? `<a class="tt-owned-option" href="${escapeHtml(googleDrive)}" target="_blank" rel="noopener noreferrer"><span>Google Drive</span><span class="tt-owned-option-arrow">↗</span></a>`
            : `<button class="tt-owned-option is-disabled" type="button" disabled><span>Google Drive</span><span class="tt-owned-option-note">Preparing</span></button>`;

        return `<article class="tt-owned-card" data-product-key="${escapeHtml(key)}">
            <button class="tt-owned-card-head" type="button" aria-expanded="false">
                <span class="tt-owned-card-number">${String(index + 1).padStart(2, "0")}</span>
                <span class="tt-owned-card-media">${imageHtml}</span>
                <span class="tt-owned-card-copy">
                    <strong class="tt-owned-card-title">${escapeHtml(title)}</strong>
                    <span class="tt-owned-card-artist">${escapeHtml(artist)}</span>
                </span>
                <span class="tt-owned-card-separator" aria-hidden="true"></span>
                <span class="tt-owned-card-chevron" aria-hidden="true">↘</span>
            </button>
            <div class="tt-owned-card-panel" hidden>
                <div class="tt-owned-card-panel-inner">
                    <div class="tt-owned-claim-meta" aria-label="Claim information">
                        <div class="tt-owned-claim-meta-item">
                            <span>CLAIM KEY</span>
                            <strong>${escapeHtml(claim?.productKey || key)}</strong>
                        </div>
                        <div class="tt-owned-claim-meta-item">
                            <span>CLAIMED</span>
                            <strong>${escapeHtml(claimedAt)}</strong>
                        </div>
                        <div class="tt-owned-claim-meta-item">
                            <span>CLAIMED BY</span>
                            <strong>${escapeHtml(claimedBy)}</strong>
                        </div>
                    </div>
                    <div class="tt-owned-card-panel-label">ACCESS FILE</div>
                    <div class="tt-owned-downloads">
                        ${driveButton}
                        <button class="tt-owned-option is-disabled" type="button" disabled>
                            <span>Dropbox</span><span class="tt-owned-option-note">Coming Soon</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>`;
    }).join("");

    list.querySelectorAll(".tt-owned-card-thumb[data-fallback-src]").forEach((imageNode) => {
        imageNode.addEventListener("error", () => {
            const candidates = String(imageNode.dataset.localCandidates || "")
                .split("|")
                .map(value => value.trim())
                .filter(Boolean);

            const current = imageNode.getAttribute("src") || "";
            const nextLocal = candidates.find(value => value !== current);

            if (nextLocal) {
                imageNode.dataset.ttLocalIndex = String(candidates.indexOf(nextLocal));
                imageNode.src = nextLocal;
                return;
            }

            const fallback = imageNode.dataset.fallbackSrc || "";
            if (fallback && imageNode.dataset.ttFallbackUsed !== "1") {
                imageNode.dataset.ttFallbackUsed = "1";
                imageNode.src = fallback;
                return;
            }

            imageNode.classList.add("tt-owned-card-thumb-broken");
        });
    });

    list.querySelectorAll(".tt-owned-card-head").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".tt-owned-card");
            const panel = card?.querySelector(".tt-owned-card-panel");
            if (!card || !panel) return;
            const open = card.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(open));
            panel.hidden = !open;
        });
    });
};


const receiptSafeFilename = (value) => String(value || "tunetrack-receipt")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "tunetrack-receipt";

const receiptDateLabel = (value) => {
    if (!value) return "—";
    let date = null;
    if (typeof value?.toDate === "function") date = value.toDate();
    else if (value?.seconds != null) date = new Date(Number(value.seconds) * 1000);
    else {
        const parsed = new Date(String(value));
        if (!Number.isNaN(parsed.getTime())) date = parsed;
    }
    if (!date || Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta", day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false
    }).format(date);
};

const downloadTransactionReceipt = (claim, profile = {}, reference = "FREE-01") => {
    const title = String(claim?.title || "Untitled Product").trim();
    const artist = String(claim?.artist || "TuneTrack").trim();
    const source = String(claim?.source || "freebie-gate").trim();
    const productKey = String(claim?.productKey || slugifyOwnedProduct(title)).trim();
    const status = source === "freebie-gate" ? "FREE / CLAIMED" : "CLAIMED";
    const claimedAt = receiptDateLabel(claim?.claimedAt);
    const customerName = String(profile?.displayName || profile?.username || profile?.email?.split("@")?.[0] || "TuneTrack Member").trim();
    const customerEmail = String(profile?.email || "—").trim();
    const amount = source === "freebie-gate" ? "FREE" : String(claim?.price ?? claim?.amount ?? "—").trim() || "—";

    const receiptHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TuneTrack Receipt ${escapeHtml(reference)}</title>
<style>
*{box-sizing:border-box}html,body{margin:0;background:#111;color:#111;font-family:Inter,Arial,sans-serif}body{min-height:100vh;display:flex;justify-content:center;padding:40px 18px}.receipt{width:380px;background:#fff;padding:28px 26px 30px;box-shadow:0 18px 55px rgba(0,0,0,.35)}.brand{text-align:center;font-weight:800;font-size:24px;letter-spacing:-.07em}.kicker{text-align:center;font:700 9px/1.4 "Courier New",monospace;letter-spacing:.16em;margin-top:7px}.rule{border-top:1px dashed #999;margin:18px 0}.meta,.row{display:flex;justify-content:space-between;gap:18px;font:11px/1.6 "Courier New",monospace}.meta span:last-child{text-align:right}.section-title{font:700 9px/1.4 "Courier New",monospace;letter-spacing:.13em;margin-bottom:10px}.product{padding:12px 0}.product-title{font-weight:750;font-size:17px;line-height:1.2}.artist{font:11px/1.5 "Courier New",monospace;color:#666;margin-top:4px}.row strong{font-weight:700}.total{display:flex;justify-content:space-between;font:800 14px/1.5 "Courier New",monospace}.status{display:inline-block;border:1px solid #111;border-radius:999px;padding:4px 8px;font:700 9px/1 "Courier New",monospace}.barcode{height:42px;margin:18px 0 8px;background:repeating-linear-gradient(90deg,#111 0 2px,#fff 2px 4px,#111 4px 5px,#fff 5px 8px)}.ref{text-align:center;font:700 9px/1.4 "Courier New",monospace;letter-spacing:.12em}.footer{text-align:center;font:9px/1.6 "Courier New",monospace;color:#666;margin-top:18px}@media print{body{background:#fff;padding:0}.receipt{box-shadow:none;width:100%;max-width:380px}}
</style></head><body><main class="receipt">
<div class="brand">tunetrack©</div><div class="kicker">OFFICIAL DIGITAL RECEIPT</div><div class="rule"></div>
<div class="meta"><span>REFERENCE</span><span>#${escapeHtml(reference)}</span></div><div class="meta"><span>DATE</span><span>${escapeHtml(claimedAt)}</span></div><div class="meta"><span>STATUS</span><span><span class="status">${escapeHtml(status)}</span></span></div>
<div class="rule"></div><div class="section-title">CUSTOMER</div><div class="row"><span>NAME</span><strong>${escapeHtml(customerName)}</strong></div><div class="row"><span>EMAIL</span><strong>${escapeHtml(customerEmail)}</strong></div>
<div class="rule"></div><div class="section-title">ITEM</div><div class="product"><div class="product-title">${escapeHtml(title)}</div><div class="artist">${escapeHtml(artist)}</div></div>
<div class="row"><span>PRODUCT KEY</span><span>${escapeHtml(productKey)}</span></div><div class="row"><span>ACCESS TYPE</span><span>${escapeHtml(source)}</span></div>
<div class="rule"></div><div class="total"><span>TOTAL</span><span>${escapeHtml(amount)}</span></div><div class="barcode"></div><div class="ref">${escapeHtml(reference)} · TUNETRACK</div>
<div class="rule"></div><div class="footer">Thank you for being part of TuneTrack.<br>Keep this receipt for your digital ownership record.</div>
</main></body></html>`;

    const blob = new Blob([receiptHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receiptSafeFilename(title)}-${receiptSafeFilename(reference)}-receipt.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const renderTransactions = (profile = {}) => {
    const list = document.querySelector("#orders .list-container");
    if (!list) return;
    const claims = Array.isArray(profile?.freebieClaims) ? [...profile.freebieClaims] : [];
    claims.sort((a, b) => new Date(b?.claimedAt || 0).getTime() - new Date(a?.claimedAt || 0).getTime());

    if (!claims.length) {
        list.innerHTML = `<div class="list-item"><div class="list-details"><h4 class="list-title">No transactions yet.</h4><span class="list-price">NO ACTIVITY</span></div></div>`;
        return;
    }

    list.innerHTML = claims.map((claim, index) => {
        const title = String(claim?.title || "Untitled Product").trim();
        const artist = String(claim?.artist || "TuneTrack").trim();
        const source = String(claim?.source || "freebie-gate").trim();
        const claimedAt = formatClaimedAt(claim?.claimedAt);
        const productKey = String(claim?.productKey || slugifyOwnedProduct(title)).trim();
        const reference = String(claim?.reference || claim?.orderId || `FREE-${String(index + 1).padStart(2, "0")}`).trim();
        const status = source === "freebie-gate" ? "FREE / CLAIMED" : "CLAIMED";
        return `<div class="list-item" data-transaction-key="${escapeHtml(productKey)}">
<div class="list-meta"><span class="mono-meta order-id">#${escapeHtml(reference)}</span><span class="mono-meta order-date">${escapeHtml(claimedAt)}</span></div>
<div class="list-details"><h4 class="list-title">${escapeHtml(title)}</h4><span class="list-price">${escapeHtml(status)} <span style="opacity:.45;"> · ${escapeHtml(artist)}</span></span></div>
<button class="pill-btn outline small" type="button" data-transaction-key="${escapeHtml(productKey)}" data-transaction-index="${index}">Download Receipt</button>
</div>`;
    }).join("");

    list.querySelectorAll("button[data-transaction-index]").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.transactionIndex);
            const claim = Number.isInteger(index) ? claims[index] : null;
            if (!claim) return;
            const reference = String(claim?.reference || claim?.orderId || `FREE-${String(index + 1).padStart(2, "0")}`).trim();
            downloadTransactionReceipt(claim, profile, reference);
        });
    });
};
const getClaimedKeys = (profile = {}) => normalizeOwnedKeys(profile);

// Every unclaimed freebie card routes to the same unlock gate.
// The gate receives the clicked product title and resolves its own catalog data.
const getFreebieCardKey = (card) => {
    if (!card) return "";
    const direct = card.dataset?.productKey || card.dataset?.productTitle || "";
    if (direct) return slugifyOwnedProduct(direct);

    const nested = card.querySelector?.("[data-product-key], [data-product-title]");
    const nestedValue = nested?.dataset?.productKey || nested?.dataset?.productTitle || "";
    if (nestedValue) return slugifyOwnedProduct(nestedValue);

    const titleNode = card.querySelector?.(".card-title, .catalog-card-title, .product-title, .title, h3, h4");
    return slugifyOwnedProduct(titleNode?.textContent || "");
};

const getCatalogProductByKey = (key) => {
    const catalog = Array.isArray(window.TuneTrackCatalog) ? window.TuneTrackCatalog : [];
    return catalog.find(item => slugifyOwnedProduct(item?.title) === key) || null;
};

const markFreebieClaimed = (card) => {
    if (!card) return;
    card.dataset.ttClaimedPending = "0";
    if (card.dataset.ttClaimedUi === "1") return;
    card.dataset.ttClaimedUi = "1";
    card.classList.add("tt-freebie-claimed");
    card.setAttribute("aria-disabled", "true");
    card.setAttribute("tabindex", "-1");

    // Keep the original card intact. We only add a visual claimed stamp and
    // disable interaction for the already-owned product.
    if (!card.querySelector(".tt-freebie-claimed-overlay")) {
        const overlay = document.createElement("div");
        overlay.className = "tt-freebie-claimed-overlay";
        overlay.innerHTML = `<strong>CLAIMED</strong><span>VISIT MY PRODUCTS TO DOWNLOAD</span>`;
        card.appendChild(overlay);
    }

    card.querySelectorAll("a, button, [role=button], input, select, textarea").forEach((node) => {
        node.dataset.ttClaimedDisabled = "1";
        node.setAttribute("aria-disabled", "true");
        if (node.matches("button, input, select, textarea")) node.disabled = true;
    });
};

const markFreebieClaimPending = (card) => {
    if (!card) return;
    card.dataset.ttClaimedPending = "1";
    card.setAttribute("aria-disabled", "true");
    card.classList.add("tt-freebie-claim-pending");
};

const clearFreebieClaimPending = (card) => {
    if (!card) return;
    card.dataset.ttClaimedPending = "0";
    card.removeAttribute("aria-disabled");
    card.classList.remove("tt-freebie-claim-pending");
};

const applyFreebieClaimPendingState = () => {
    // Intentionally empty. Claimed state is database-driven and should never
    // disable a card before the authenticated profile has been read.
};

const applyClaimedFreebieState = (profile = {}) => {
    const claimed = getClaimedKeys(profile);
    document.querySelectorAll("#freebies-grid .catalog-data-card").forEach(card => {
        const key = getFreebieCardKey(card);
        if (!key) return;

        clearFreebieClaimPending(card);
        if (claimed.has(key)) {
            markFreebieClaimed(card);
        } else {
            card.dataset.ttClaimedUi = "0";
            card.dataset.ttClaimedPending = "0";
            card.removeAttribute("aria-disabled");
            if (card.getAttribute("tabindex") === "-1") card.removeAttribute("tabindex");
            card.classList.remove("tt-freebie-claimed");
            card.querySelector(".tt-freebie-claimed-overlay")?.remove();
            card.querySelectorAll("[data-tt-claimed-disabled='1']").forEach((node) => {
                delete node.dataset.ttClaimedDisabled;
                node.removeAttribute("aria-disabled");
                if ("disabled" in node) node.disabled = false;
            });
        }
    });
};

const getFreebieCardTitle = (card, key = "") => {
    const catalogItem = getCatalogProductByKey(key);
    if (catalogItem?.title) return String(catalogItem.title).trim();

    const direct = String(card?.dataset?.productTitle || "").trim();
    if (direct) return direct;
    const nested = card?.querySelector?.("[data-product-title]");
    const nestedTitle = String(nested?.dataset?.productTitle || "").trim();
    if (nestedTitle) return nestedTitle;
    const titleNode = card?.querySelector?.(".card-title, .catalog-card-title, .product-title, .title, h3, h4");
    return String(titleNode?.textContent || "").trim();
};

const openFreebieGate = (title, key = "") => {
    const cleanTitle = String(title || "").trim();
    const cleanKey = String(key || "").trim();
    if (!cleanTitle || !cleanKey) return;
    const target = new URL("unlock-gate-user-fb.html", window.location.href);
    target.searchParams.set("product", cleanTitle);
    target.searchParams.set("productKey", cleanKey);
    target.searchParams.set("return", "dashboard.html#my-products");
    window.location.href = target.toString();
};

const wireFreebieClaimRouting = () => {
    const grid = document.getElementById("freebies-grid");
    if (!grid || grid.dataset.ttClaimRouting === "1") return;
    grid.dataset.ttClaimRouting = "1";

    const refreshClaimedCards = () => {
        applyClaimedFreebieState(window.__TUNETRACK_PROFILE__ || {});
        applyFreebieArtistCap(grid);
    };
    const observer = new MutationObserver(refreshClaimedCards);
    observer.observe(grid, { childList: true, subtree: true });

    grid.addEventListener("click", (event) => {
        const card = event.target.closest(".catalog-data-card");
        if (!card || !grid.contains(card)) return;

        const key = getFreebieCardKey(card);
        if (!key) return;
        const claimed = getClaimedKeys(window.__TUNETRACK_PROFILE__ || {});

        // A claimed product is completely inert. Unclaimed products always route
        // to the same gate, but with their own exact catalog key.
        if (claimed.has(key)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return;
        }

        const title = getFreebieCardTitle(card, key);
        if (!title) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openFreebieGate(title, key);
    }, true);
};

const startProfileRealtimeSync = (db, user) => {
    if (!db || !user?.uid) return;
    const profileRef = doc(db, "users", user.uid);
    onSnapshot(profileRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const profile = snapshot.data() || {};
        window.__TUNETRACK_PROFILE__ = profile;
        updateUserUI(user, profile);
        renderOwnedProducts(profile);
        renderTransactions(profile);
        applyClaimedFreebieState(profile);
    }, (error) => {
        console.error("[TuneTrack Profile] Realtime sync failed:", error);
    });
};

const focusMyProducts = () => {
    const link = document.querySelector('.nav-pill[data-target="my-products"]');
    link?.click();
    document.getElementById("my-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const setVaultSyncing = (syncing) => {
    const empty = document.getElementById("empty-vault-state");
    if (!empty) return;
    if (syncing) {
        empty.dataset.originalHtml = empty.dataset.originalHtml || empty.innerHTML;
        empty.innerHTML = `<h2 class="display-subtitle">SYNCHRONIZING YOUR PRODUCTS.</h2><p class="body-text">Sit tight. Your latest entitlement is being loaded.</p>`;
        empty.style.display = "";
    } else if (empty.dataset.originalHtml) {
        empty.innerHTML = empty.dataset.originalHtml;
        delete empty.dataset.originalHtml;
    }
};

const AVATAR_COUNT = 10;
const getAvatarAsset = (avatarId) => {
    const id = Math.min(AVATAR_COUNT, Math.max(1, Number(avatarId) || 1));
    return `assets/images/avatar/avatar-${String(id).padStart(2, "0")}.png`;
};

let savedAvatarId = 1;
let pendingAvatarId = 1;

const setAvatarSelectionUI = (avatarId) => {
    const id = Math.min(AVATAR_COUNT, Math.max(1, Number(avatarId) || 1));
    document.querySelectorAll("#avatarSelector .avatar-option").forEach((option) => {
        const isSelected = Number(option.dataset.avatarId) === id;
        option.classList.toggle("selected", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
    });

    const currentAvatar = document.querySelector("#current-avatar img");
    if (currentAvatar) {
        currentAvatar.src = getAvatarAsset(id);
        currentAvatar.alt = `Avatar ${id}`;
    }

    const actions = document.getElementById("avatarChangeActions");
    if (actions) actions.hidden = id === savedAvatarId;
};

const syncAvatarFromProfile = (profile) => {
    const profileAvatar = Number(profile?.avatarId || 0);
    const id = profileAvatar >= 1 && profileAvatar <= AVATAR_COUNT ? profileAvatar : 1;
    savedAvatarId = id;
    pendingAvatarId = id;
    setAvatarSelectionUI(id);
};

const waitForNotificationUI = (callback) => {
    if (window.TuneTrackNotifications) {
        callback(window.TuneTrackNotifications);
        return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
        attempts += 1;
        if (window.TuneTrackNotifications) {
            window.clearInterval(timer);
            callback(window.TuneTrackNotifications);
        } else if (attempts >= 100) {
            window.clearInterval(timer);
        }
    }, 50);
};

const createUserNotification = async (db, user, { title, message, type = "account" }) => {
    if (!db || !user?.uid) return null;

    const notificationsRef = collection(db, "users", user.uid, "notifications");

    return addDoc(notificationsRef, {
        uid: user.uid,
        title,
        message,
        type,
        read: false,
        createdAt: serverTimestamp()
    });
};

const startNotificationSync = (db, user) => {
    waitForNotificationUI((notificationUI) => {
        const notificationsRef = collection(db, "users", user.uid, "notifications");
        const notificationsQuery = query(
            notificationsRef,
            orderBy("createdAt", "desc"),
            limit(30)
        );

        onSnapshot(
            notificationsQuery,
            (snapshot) => {
                const items = snapshot.docs.map((item) => {
                    const data = item.data();
                    return {
                        id: item.id,
                        title: data.title || "TuneTrack",
                        message: data.message || "",
                        read: data.read === true,
                        createdAt: data.createdAt || null
                    };
                });

                notificationUI.setItems(items);
            },
            (error) => {
                console.error("[TuneTrack Notifications] Failed to sync notifications:", error);
            }
        );

        notificationUI.onRead = async (notificationId) => {
            if (!notificationId) return;

            try {
                await updateDoc(
                    doc(db, "users", user.uid, "notifications", notificationId),
                    { read: true }
                );
            } catch (error) {
                console.error("[TuneTrack Notifications] Failed to mark notification as read:", error);
            }
        };
    });
};

const notifyAccountActivity = async (db, user, title, message, type = "account") => {
    try {
        await createUserNotification(db, user, { title, message, type });
    } catch (error) {
        console.error("[TuneTrack Notifications] Failed to create notification:", error);
        return;
    }

    waitForNotificationUI((notificationUI) => {
        notificationUI.show(title, message, { addToList: false });
    });
};


const TT_SESSION_KEY = "tunetrack_session_id_v1";

const getDeviceInfo = () => {
    const ua = navigator.userAgent || "";
    const platform = navigator.userAgentData?.platform || navigator.platform || "Unknown OS";
    let browser = "Browser";
    if (/Edg\//i.test(ua)) browser = "Edge";
    else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
    else if (/Firefox\//i.test(ua)) browser = "Firefox";
    else if (/OPR\//i.test(ua)) browser = "Opera";
    const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
    return {
        browser,
        platform,
        device,
        language: navigator.language || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        screen: `${window.screen?.width || 0}×${window.screen?.height || 0}`,
        userAgent: ua.slice(0, 500)
    };
};

const getSessionId = () => {
    let id = localStorage.getItem(TT_SESSION_KEY);
    if (!id) {
        id = `${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
        localStorage.setItem(TT_SESSION_KEY, id);
    }
    return id;
};

const formatSessionDevice = (data) =>
    `${data.platform || "Unknown OS"} • ${data.browser || "Browser"} • ${data.device || "Device"}`;

const setSecurityStatus = (id, message, kind = "") => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = `tt-settings-status ${kind}`.trim();
};

const openSecuritySlide = (slideId) => {
    const slider = document.getElementById("settingsSecuritySlider");
    if (!slider) return;
    slider.classList.add("is-open");
    slider.setAttribute("aria-hidden", "false");
    slider.querySelectorAll(".tt-settings-slide").forEach((slide) => {
        slide.classList.toggle("active", slide.id === slideId);
    });
    document.body.classList.add("tt-settings-slide-open");
};

const closeSecuritySlide = () => {
    const slider = document.getElementById("settingsSecuritySlider");
    if (!slider) return;
    slider.classList.remove("is-open");
    slider.setAttribute("aria-hidden", "true");
    slider.querySelectorAll(".tt-settings-slide").forEach((slide) => slide.classList.remove("active"));
    document.body.classList.remove("tt-settings-slide-open");
};



let accountDeletionInProgress = false;

const getCurrentAccountUsername = (user) => {
    const profile = window.__TUNETRACK_PROFILE__ || {};
    return String(
        profile?.username ||
        profile?.displayName ||
        user?.displayName ||
        user?.email?.split("@")?.[0] ||
        ""
    ).trim();
};

const setDeleteAccountStatus = (message, kind = "") => {
    const el = document.getElementById("deleteAccountStatus");
    if (!el) return;
    el.textContent = message;
    el.className = `tt-delete-account-status ${kind}`.trim();
};

const openDeleteAccountModal = (user) => {
    const modal = document.getElementById("deleteAccountModal");
    const usernameInput = document.getElementById("deleteAccountUsername");
    const passwordInput = document.getElementById("deleteAccountPassword");
    const confirmBtn = document.getElementById("confirmDeleteAccountBtn");
    if (!modal) return;

    accountDeletionInProgress = false;
    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (confirmBtn) confirmBtn.disabled = false;
    setDeleteAccountStatus("");

    modal.dataset.expectedUsername = getCurrentAccountUsername(user);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("tt-delete-modal-open");
    window.setTimeout(() => usernameInput?.focus(), 40);
};

const closeDeleteAccountModal = () => {
    if (accountDeletionInProgress) return;
    const modal = document.getElementById("deleteAccountModal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("tt-delete-modal-open");
    setDeleteAccountStatus("");
};

const deleteAllUserFirestoreData = async (db, uid) => {
    // These are the only user-owned Firestore paths currently created by the
    // dashboard: the profile document plus its notifications and sessions.
    // Profile arrays such as ownedProducts/freebieClaims live on users/{uid}
    // and disappear with the parent document.
    const subcollections = ["notifications", "sessions"];

    for (const subcollectionName of subcollections) {
        const subcollectionRef = collection(db, "users", uid, subcollectionName);
        const snapshot = await getDocs(subcollectionRef);
        if (!snapshot.empty) {
            await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
        }
    }

    await deleteDoc(doc(db, "users", uid));
};

const showDeleteAccountFarewell = (username) => {
    const screen = document.getElementById("deleteAccountFarewell");
    const name = document.getElementById("deleteAccountFarewellName");
    const countdown = document.getElementById("deleteAccountFarewellCountdown");
    if (!screen) return;

    if (name) name.textContent = String(username || "friend").trim() || "friend";
    screen.hidden = false;
    screen.setAttribute("aria-hidden", "false");
    document.body.classList.add("tt-delete-modal-open");

    let seconds = 10;
    if (countdown) countdown.textContent = `REDIRECTING IN ${seconds}S`;
    const timer = window.setInterval(() => {
        seconds -= 1;
        if (countdown) countdown.textContent = seconds > 0 ? `REDIRECTING IN ${seconds}S` : "REDIRECTING…";
        if (seconds <= 0) window.clearInterval(timer);
    }, 1000);

    window.setTimeout(() => {
        window.location.replace(LOGIN_PAGE);
    }, 10000);
};

const performAccountDeletion = async (db, auth) => {
    if (accountDeletionInProgress) return;

    const user = auth.currentUser;
    const modal = document.getElementById("deleteAccountModal");
    const usernameInput = document.getElementById("deleteAccountUsername");
    const passwordInput = document.getElementById("deleteAccountPassword");
    const confirmBtn = document.getElementById("confirmDeleteAccountBtn");

    if (!user || !modal || !usernameInput || !passwordInput || !confirmBtn) return;

    const enteredUsername = usernameInput.value.trim();
    const password = passwordInput.value;
    const expectedUsername = String(modal.dataset.expectedUsername || getCurrentAccountUsername(user)).trim();

    if (!enteredUsername || !password) {
        setDeleteAccountStatus("Re-enter your username and current password.", "error");
        return;
    }

    if (!expectedUsername || enteredUsername !== expectedUsername) {
        setDeleteAccountStatus("Username verification failed. Enter your exact current username.", "error");
        usernameInput.focus();
        return;
    }

    if (!user.email) {
        setDeleteAccountStatus("This account has no email/password credential available for verification.", "error");
        return;
    }

    accountDeletionInProgress = true;
    confirmBtn.disabled = true;
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    setDeleteAccountStatus("STEP 1/2 · Verifying account credentials…", "working");

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        setDeleteAccountStatus("STEP 2/2 · Removing your TuneTrack data…", "working");
        await deleteAllUserFirestoreData(db, user.uid);

        setDeleteAccountStatus("Finalizing account deletion…", "working");
        const farewellUsername = enteredUsername || expectedUsername || getCurrentAccountUsername(user);
        await deleteUser(user);

        // Firebase signs the deleted user out as part of deleteUser(). Keep the
        // dashboard alive long enough to show the farewell sequence, then leave.
        showDeleteAccountFarewell(farewellUsername);
    } catch (error) {
        console.error("[TuneTrack Account] Delete account failed:", error);
        accountDeletionInProgress = false;
        confirmBtn.disabled = false;
        usernameInput.disabled = false;
        passwordInput.disabled = false;

        if (error?.code === "auth/requires-recent-login") {
            setDeleteAccountStatus("Security session expired. Sign in again, then retry account deletion.", "error");
        } else if (error?.code === "permission-denied") {
            setDeleteAccountStatus("Firebase blocked data deletion. Nothing else was deleted; check your Firestore rules and retry.", "error");
        } else {
            setDeleteAccountStatus(friendlyAuthError(error), "error");
        }
    }
};

const wireDeleteAccount = (db, auth) => {
    const trigger = document.querySelector(".danger-zone #deleteAccountBtn");
    const modal = document.getElementById("deleteAccountModal");
    if (!trigger || !modal || trigger.dataset.ttDeleteWired === "1") return;
    trigger.dataset.ttDeleteWired = "1";

    trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openDeleteAccountModal(auth.currentUser);
    });

    document.getElementById("cancelDeleteAccountBtn")?.addEventListener("click", (event) => {
        event.preventDefault();
        closeDeleteAccountModal();
    });

    document.getElementById("confirmDeleteAccountBtn")?.addEventListener("click", (event) => {
        event.preventDefault();
        performAccountDeletion(db, auth);
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeDeleteAccountModal();
    });

    modal.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeDeleteAccountModal();
    });

    ["deleteAccountUsername", "deleteAccountPassword"].forEach((id) => {
        document.getElementById(id)?.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                performAccountDeletion(db, auth);
            }
        });
    });
};

const friendlyAuthError = (error) => {
    const code = error?.code || "";
    const map = {
        "auth/invalid-credential": "The current password is incorrect.",
        "auth/wrong-password": "The current password is incorrect.",
        "auth/invalid-password": "The current password is incorrect.",
        "auth/email-already-in-use": "That email is already attached to another account.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/requires-recent-login": "Please sign in again, then retry this security change.",
        "auth/weak-password": "Choose a stronger password with at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
        "auth/operation-not-allowed": "Email/password authentication is not enabled for this Firebase project.",
        "auth/unauthorized-continue-uri": "This dashboard address is not authorized in Firebase Authentication. Add this site domain to the authorized domains, then retry.",
        "auth/invalid-continue-uri": "Firebase rejected the verification return address. Please retry from the dashboard.",
        "auth/network-request-failed": "Network error while sending the verification email. Check your connection and retry."
    };
    return map[code] || error?.message || "Something went wrong. Please try again.";
};

let activeSessionSecurityStarted = false;
const startActiveSessionSecurity = async (db, auth, user) => {
    if (activeSessionSecurityStarted) return;
    activeSessionSecurityStarted = true;
    const sessionId = getSessionId();
    const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
    const sessionsRef = collection(db, "users", user.uid, "sessions");
    const device = getDeviceInfo();

    let existingSessions = [];
    try {
        const snap = await getDocs(query(sessionsRef, orderBy("lastSeenAt", "desc"), limit(20)));
        existingSessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
        if (error?.code === "permission-denied") {
            const list = document.getElementById("activeSessionsList");
            if (list) {
                list.innerHTML = `<div class="session-item body-text">Active session management is unavailable for this account.</div>`;
            }
            const notice = document.getElementById("sessionSecurityNotice");
            if (notice) {
                notice.textContent = "Session management is currently unavailable.";
            }
            return;
        }

        console.warn("[TuneTrack Sessions] Could not read sessions:", error);
        return;
    }

    const hadOtherSession = existingSessions.some((item) =>
        item.id !== sessionId && item.revoked !== true
    );

    await setDoc(sessionRef, {
        uid: user.uid,
        sessionId,
        ...device,
        createdAt: existingSessions.find((x) => x.id === sessionId)?.createdAt || serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        revoked: false,
        revokedAt: null
    }, { merge: true });

    if (hadOtherSession) {
        await notifyAccountActivity(
            db,
            user,
            "New account sign-in detected",
            `A new session was detected on ${formatSessionDevice(device)}. If this wasn't you, review Active Sessions immediately.`,
            "security"
        );
        const notice = document.getElementById("sessionSecurityNotice");
        if (notice) notice.textContent = "WARNING — a new sign-in/session was detected.";
    }

    const renderSessions = (items) => {
        const list = document.getElementById("activeSessionsList");
        if (!list) return;
        const active = items.filter((item) => item.revoked !== true);
        if (!active.length) {
            list.innerHTML = `<div class="session-item body-text">No active sessions found.</div>`;
            return;
        }
        list.innerHTML = active.map((item) => {
            const current = item.id === sessionId;
            const stamp = item.lastSeenAt?.toDate ? item.lastSeenAt.toDate().toLocaleString() : "Active";
            return `<div class="session-item body-text tt-session-item ${current ? "is-current" : ""}">
                <strong>${current ? "Current Session" : "Active Session"}</strong>
                ${current ? '<span class="tt-session-badge">THIS DEVICE</span>' : ""}
                <br>
                <span class="mono-meta">${formatSessionDevice(item)}</span><br>
                <span class="mono-meta">${item.timezone || "Unknown timezone"} • ${item.screen || ""} • ${stamp}</span>
            </div>`;
        }).join("");
    };

    renderSessions(existingSessions);

    const unsubscribe = onSnapshot(
        query(sessionsRef, orderBy("lastSeenAt", "desc"), limit(20)),
        async (snapshot) => {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            renderSessions(items);
            const current = items.find((item) => item.id === sessionId);
            if (current?.revoked === true) {
                unsubscribe();
                await signOut(auth);
                redirectToLogin();
            }
        },
        (error) => console.warn("[TuneTrack Sessions] Listener failed:", error)
    );

    window.setInterval(async () => {
        try {
            await updateDoc(sessionRef, { lastSeenAt: serverTimestamp() });
        } catch (_) {}
    }, 60000);

    document.getElementById("signOutOtherSessionsBtn")?.addEventListener("click", async () => {
        const snap = await getDocs(query(sessionsRef, orderBy("lastSeenAt", "desc"), limit(50)));
        const jobs = snap.docs
            .filter((d) => d.id !== sessionId && d.data().revoked !== true)
            .map((d) => updateDoc(d.ref, { revoked: true, revokedAt: serverTimestamp() }));
        await Promise.all(jobs);
        const notice = document.getElementById("sessionSecurityNotice");
        if (notice) notice.textContent = jobs.length ? `${jobs.length} other session(s) signed out.` : "No other active sessions found.";
    });
};

let securitySlidesWired = false;
const wireSecuritySlides = (db, auth) => {
    if (securitySlidesWired) return;
    securitySlidesWired = true;
    document.getElementById("openChangeEmailBtn")?.addEventListener("click", () => {
        const user = auth.currentUser;
        const current = document.getElementById("changeEmailCurrent");
        if (current) current.value = user?.email || "";
        setSecurityStatus("changeEmailStatus", "");
        openSecuritySlide("changeEmailSlide");
    });

    document.getElementById("openChangePasswordBtn")?.addEventListener("click", () => {
        ["changePasswordCurrent","changePasswordNew","changePasswordConfirm"].forEach((id) => {
            const el = document.getElementById(id); if (el) el.value = "";
        });
        setSecurityStatus("changePasswordStatus", "");
        openSecuritySlide("changePasswordSlide");
    });

    document.querySelectorAll("[data-close-settings-slide]").forEach((button) =>
        button.addEventListener("click", closeSecuritySlide)
    );

    document.getElementById("submitChangeEmailBtn")?.addEventListener("click", async () => {
        const user = auth.currentUser;
        const newEmail = document.getElementById("changeEmailNew")?.value.trim() || "";
        const password = document.getElementById("changeEmailPassword")?.value || "";
        if (!user || !newEmail || !password) {
            setSecurityStatus("changeEmailStatus", "Enter the new email and current password.", "error");
            return;
        }
        if (newEmail.toLowerCase() === (user.email || "").toLowerCase()) {
            setSecurityStatus("changeEmailStatus", "That is already your current email.", "error");
            return;
        }
        const btn = document.getElementById("submitChangeEmailBtn");
        btn.disabled = true;
        setSecurityStatus("changeEmailStatus", "Re-authenticating…");
        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            // Firebase requires the new email to be verified before the account email changes.
            // This replaces the old immediate updateEmail() flow, which did not send the
            // verification message the user expects.
            await verifyBeforeUpdateEmail(user, newEmail, {
                url: `${window.location.origin}${window.location.pathname}#settings`,
                handleCodeInApp: false
            });

            setSecurityStatus(
                "changeEmailStatus",
                `Verification email sent to ${newEmail}. Open that email and confirm the change. Your current email stays active until verification is completed.`,
                "success"
            );
            document.getElementById("changeEmailPassword").value = "";
            document.getElementById("changeEmailNew").value = "";
        } catch (error) {
            setSecurityStatus("changeEmailStatus", friendlyAuthError(error), "error");
        } finally {
            btn.disabled = false;
        }
    });

    document.getElementById("submitChangePasswordBtn")?.addEventListener("click", async () => {
        const user = auth.currentUser;
        const current = document.getElementById("changePasswordCurrent")?.value || "";
        const next = document.getElementById("changePasswordNew")?.value || "";
        const confirm = document.getElementById("changePasswordConfirm")?.value || "";
        if (!user || !current || !next || !confirm) {
            setSecurityStatus("changePasswordStatus", "Complete all password fields.", "error");
            return;
        }
        if (next.length < 6) {
            setSecurityStatus("changePasswordStatus", "New password must be at least 6 characters.", "error");
            return;
        }
        if (next !== confirm) {
            setSecurityStatus("changePasswordStatus", "New passwords do not match.", "error");
            return;
        }
        const btn = document.getElementById("submitChangePasswordBtn");
        btn.disabled = true;
        setSecurityStatus("changePasswordStatus", "Re-authenticating…");
        try {
            const credential = EmailAuthProvider.credential(user.email, current);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, next);
            setSecurityStatus("changePasswordStatus", "Password changed successfully.", "success");
            ["changePasswordCurrent","changePasswordNew","changePasswordConfirm"].forEach((id) => {
                const el = document.getElementById(id); if (el) el.value = "";
            });
            const meta = document.getElementById("passwordChangedMeta");
            if (meta) meta.textContent = `Last changed: ${new Date().toLocaleString()}`;
            await notifyAccountActivity(db, user, "Password changed", "Your TuneTrack account password was changed.", "security");
        } catch (error) {
            setSecurityStatus("changePasswordStatus", friendlyAuthError(error), "error");
        } finally {
            btn.disabled = false;
        }
    });
};



// -----------------------------------------------------------------------------
// ABOUT YOU — Bio + "What are you playing?"
// Persists to users/{uid} in Firestore.
// -----------------------------------------------------------------------------
const ABOUT_YOU_INSTRUMENTS = [{"name": "Vocals", "category": "Worship"}, {"name": "Acoustic Guitar", "category": "Band"}, {"name": "Electric Guitar", "category": "Band"}, {"name": "Bass", "category": "Band"}, {"name": "Piano / Keys", "category": "Band"}, {"name": "Synth", "category": "Band"}, {"name": "Playback / Sequencer", "category": "Worship"}, {"name": "Drums", "category": "Band"}, {"name": "Electronic Drums", "category": "Band"}, {"name": "Percussion", "category": "Band"}, {"name": "Worship MD", "category": "Worship"}, {"name": "Worship Leader", "category": "Worship"}, {"name": "Producer", "category": "Worship"}, {"name": "Mixing Engineer", "category": "Worship"}, {"name": "Audio Engineer", "category": "Worship"}, {"name": "Violin", "category": "Orchestral"}, {"name": "Viola", "category": "Orchestral"}, {"name": "Cello", "category": "Orchestral"}, {"name": "Double Bass", "category": "Orchestral"}, {"name": "Harp", "category": "Orchestral"}, {"name": "Flute", "category": "Orchestral"}, {"name": "Piccolo", "category": "Orchestral"}, {"name": "Oboe", "category": "Orchestral"}, {"name": "English Horn", "category": "Orchestral"}, {"name": "Clarinet", "category": "Orchestral"}, {"name": "Bass Clarinet", "category": "Orchestral"}, {"name": "Bassoon", "category": "Orchestral"}, {"name": "Saxophone", "category": "Orchestral"}, {"name": "Trumpet", "category": "Orchestral"}, {"name": "Trombone", "category": "Orchestral"}, {"name": "French Horn", "category": "Orchestral"}, {"name": "Tuba", "category": "Orchestral"}, {"name": "Euphonium", "category": "Orchestral"}, {"name": "Orchestral Percussion", "category": "Orchestral"}, {"name": "Timpani", "category": "Orchestral"}, {"name": "Marimba", "category": "Orchestral"}, {"name": "Xylophone", "category": "Orchestral"}, {"name": "Glockenspiel", "category": "Orchestral"}, {"name": "Accordion", "category": "Band"}, {"name": "Harmonica", "category": "Band"}, {"name": "Mandolin", "category": "Band"}, {"name": "Ukulele", "category": "Band"}, {"name": "Banjo", "category": "Band"}, {"name": "Organ", "category": "Band"}, {"name": "Clavinet", "category": "Band"}, {"name": "Hammond", "category": "Band"}, {"name": "Kalimba", "category": "Indonesian"}, {"name": "Sasando", "category": "Indonesian"}, {"name": "Angklung", "category": "Indonesian"}, {"name": "Gamelan", "category": "Indonesian"}, {"name": "Kendang", "category": "Indonesian"}, {"name": "Kolintang", "category": "Indonesian"}, {"name": "Suling", "category": "Indonesian"}];

let aboutYouWired = false;
let selectedInstrumentNames = new Set();

const MAX_INSTRUMENTS = 3;

const normalizePlaying = (value) => {
    const items = Array.isArray(value)
        ? value
        : typeof value === "string"
            ? value.split(",")
            : [];
    return [...new Set(items.map(v => String(v || "").trim()).filter(Boolean))].slice(0, MAX_INSTRUMENTS);
};

const instrumentIconPath = (name, category) => {
    const paths = {
        vocals: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0m-6 6v3m-4 0h8",
        strings: "M6 18c2-6 4-10 12-12M5 20l3-3m6-8 4 4m-8-8 4 4",
        keys: "M3 6h18v12H3zM7 6v12m4-12v12m4-12v12m4-12v12",
        drums: "M4 9c0-3 16-3 16 0v6c0 3-16 3-16 0V9Zm0 0c0 3 16 3 16 0",
        playback: "M7 5v14l11-7L7 5Zm-3 0v14",
        wind: "M4 12h16M7 8v8m5-10v12m5-10v8",
        brass: "M5 7h8v5h6m-6-5v10m-5-3h5",
        percussion: "M5 9h14l-2 9H7L5 9Zm2-3h10",
        indonesia: "M4 8c4-4 12-4 16 0M6 12c3-2 9-2 12 0M4 16c4 3 12 3 16 0",
        default: "M5 5h14v14H5z"
    };
    let key = "default";
    if (name === "Vocals") key = "vocals";
    else if (name === "Playback / Sequencer") key = "playback";
    else if (["Piano / Keys","Synth","Organ","Clavinet","Hammond"].includes(name)) key = "keys";
    else if (["Drums","Electronic Drums"].includes(name)) key = "drums";
    else if (["Percussion","Orchestral Percussion","Timpani","Marimba","Xylophone","Glockenspiel","Kendang","Kolintang"].includes(name)) key = "percussion";
    else if (["Acoustic Guitar","Electric Guitar","Bass","Violin","Viola","Cello","Double Bass","Harp","Mandolin","Ukulele","Banjo"].includes(name)) key = "strings";
    else if (["Trumpet","Trombone","French Horn","Tuba","Euphonium"].includes(name)) key = "brass";
    else if (["Flute","Piccolo","Oboe","English Horn","Clarinet","Bass Clarinet","Bassoon","Saxophone","Suling"].includes(name)) key = "wind";
    else if (category === "Indonesian") key = "indonesia";
    return paths[key];
};

const makeInstrumentPill = (item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "instrument-pill";
    button.dataset.instrument = item.name;
    button.dataset.category = item.category;
    button.setAttribute("aria-pressed", "false");
    const safeName = item.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    button.innerHTML = `<svg class="instrument-pill-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${instrumentIconPath(item.name, item.category)}"></path></svg><span>${safeName}</span>`;
    return button;
};

const setInstrumentSelected = (pill, selected) => {
    pill.classList.toggle("selected", selected);
    pill.setAttribute("aria-pressed", String(selected));
};

const syncInstrumentEverywhere = (name, selected) => {
    if (selected) {
        if (!selectedInstrumentNames.has(name) && selectedInstrumentNames.size >= MAX_INSTRUMENTS) return false;
        selectedInstrumentNames.add(name);
    } else {
        selectedInstrumentNames.delete(name);
    }

    document.querySelectorAll(".instrument-pill").forEach(pill => {
        if (pill.dataset.instrument === name) setInstrumentSelected(pill, selected);
    });

    const count = document.getElementById("instrumentCount");
    if (count) count.textContent = `${selectedInstrumentNames.size} SELECTED`;

    const grid = document.getElementById("instrumentPickerGrid");
    if (grid) grid.classList.toggle("has-max-selection", selectedInstrumentNames.size >= MAX_INSTRUMENTS);

    return true;
};

const syncAboutYouFromProfile = (profile = {}) => {
    const bio = String(profile?.bio || "").slice(0, 150);
    selectedInstrumentNames = new Set(normalizePlaying(profile?.instruments ?? profile?.playing ?? []).slice(0, MAX_INSTRUMENTS));
    const selected = selectedInstrumentNames;
    const bioInput = document.getElementById("settingBio");
    const bioCount = document.getElementById("bioCharCount");
    if (bioInput) bioInput.value = bio;
    if (bioCount) bioCount.textContent = `${bio.length} / 150`;
    document.querySelectorAll(".instrument-pill").forEach(pill => {
        setInstrumentSelected(pill, selected.has(pill.dataset.instrument));
    });
    const count = document.getElementById("instrumentCount");
    if (count) count.textContent = `${selected.size} SELECTED`;
};

const wireAboutYou = (db, auth) => {
    if (aboutYouWired) return;
    const preview = document.getElementById("instrumentSelector");
    const grid = document.getElementById("instrumentPickerGrid");
    const readMore = document.getElementById("instrumentReadMore");
    const picker = document.getElementById("instrumentPicker");
    const backdrop = document.getElementById("instrumentPickerBackdrop");
    const closeBtn = document.getElementById("instrumentPickerClose");
    const search = document.getElementById("instrumentSearch");
    const categoryWrap = document.getElementById("instrumentCategoryFilter");
    const saveBtn = document.getElementById("saveAboutYouBtn");
    const saveStatus = document.getElementById("aboutYouSaveStatus");
    const pickerDoneBtn = document.getElementById("instrumentPickerDoneBtn");
    const bioInput = document.getElementById("settingBio");
    const bioCount = document.getElementById("bioCharCount");
    if (!preview || !grid || !readMore || !picker || !saveBtn) return;
    aboutYouWired = true;

    const renderCompact = () => {
        preview.innerHTML = "";
        ABOUT_YOU_INSTRUMENTS.slice(0, 7).forEach(item => {
            const pill = makeInstrumentPill(item);
            setInstrumentSelected(pill, selectedInstrumentNames.has(item.name));
            pill.addEventListener("click", () => {
                syncInstrumentEverywhere(item.name, !pill.classList.contains("selected"));
                renderCompact();
            });
            preview.appendChild(pill);
        });
    };

    const renderPicker = () => {
        const q = String(search?.value || "").trim().toLowerCase();
        const activeCategory = categoryWrap?.querySelector(".instrument-filter-btn.is-active")?.dataset.category || "All";
        const selected = selectedInstrumentNames;
        grid.innerHTML = "";
        const matches = ABOUT_YOU_INSTRUMENTS.filter(item => {
            const categoryOk = activeCategory === "All" || item.category === activeCategory;
            const queryOk = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
            return categoryOk && queryOk;
        });
        if (!matches.length) {
            grid.innerHTML = `<div class="instrument-picker-empty">No instruments found.</div>`;
            return;
        }
        matches.forEach(item => {
            const pill = makeInstrumentPill(item);
            const isSelected = selected.has(item.name);
            setInstrumentSelected(pill, isSelected);
            pill.addEventListener("click", () => {
                const next = !pill.classList.contains("selected");
                const changed = syncInstrumentEverywhere(item.name, next);
                if (changed !== false) {
                    setInstrumentSelected(pill, next);
                    renderPicker();
                }
            });
            grid.appendChild(pill);
        });
        grid.classList.toggle("has-max-selection", selectedInstrumentNames.size >= MAX_INSTRUMENTS);
    };

    const updateBio = () => {
        if (!bioInput) return;
        if (bioInput.value.length > 150) bioInput.value = bioInput.value.slice(0, 150);
        if (bioCount) bioCount.textContent = `${bioInput.value.length} / 150`;
    };

    let closeTimer = null;

    const openPicker = () => {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        renderPicker();
        picker.hidden = false;
        backdrop.hidden = false;
        picker.setAttribute("aria-hidden", "false");
        readMore.setAttribute("aria-expanded", "true");
        document.body.classList.add("tt-instrument-picker-open");
        document.body.style.overflow = "hidden";

        requestAnimationFrame(() => {
            backdrop.classList.add("is-open");
            picker.classList.add("is-open");
            search?.focus();
        });
    };

    const closePicker = () => {
        picker.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        picker.setAttribute("aria-hidden", "true");
        readMore.setAttribute("aria-expanded", "false");
        document.body.classList.remove("tt-instrument-picker-open");
        document.body.style.removeProperty("overflow");

        closeTimer = window.setTimeout(() => {
            picker.hidden = true;
            backdrop.hidden = true;
            closeTimer = null;
        }, 230);
    };

    renderCompact();
    renderPicker();
    bioInput?.addEventListener("input", updateBio);
    readMore.addEventListener("click", openPicker);
    closeBtn?.addEventListener("click", closePicker);
    backdrop?.addEventListener("click", closePicker);
    search?.addEventListener("input", renderPicker);
    categoryWrap?.querySelectorAll(".instrument-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            categoryWrap.querySelectorAll(".instrument-filter-btn").forEach(x => x.classList.remove("is-active"));
            btn.classList.add("is-active");
            renderPicker();
        });
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !picker.hidden) closePicker(); });
    pickerDoneBtn?.addEventListener("click", closePicker);

    saveBtn.addEventListener("click", async event => {
        event.preventDefault();
        const user = auth.currentUser;
        if (!user) return;
        const bio = String(bioInput?.value || "").trim().slice(0, 150);
        const instruments = [...selectedInstrumentNames].slice(0, MAX_INSTRUMENTS);
        saveBtn.disabled = true;
        const old = saveBtn.textContent;
        saveBtn.textContent = "Saving…";
        if (saveStatus) { saveStatus.textContent = ""; saveStatus.className = "about-you-save-status"; }
        try {
            const userRef = doc(db, "users", user.uid);

            // Persist directly to the authenticated user's Firestore document.
            await setDoc(userRef, {
                bio,
                instruments,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // Read the document back so the UI only reports success after Firebase
            // confirms that the saved fields are actually present for this UID.
            const verifySnap = await getDoc(userRef);
            const saved = verifySnap.exists() ? verifySnap.data() : null;
            const verifiedBio = String(saved?.bio || "");
            const verifiedInstruments = normalizePlaying(saved?.instruments ?? saved?.playing ?? []);
            const verified = verifiedBio === bio && instruments.every(name => verifiedInstruments.includes(name));
            if (!verified) throw new Error("Firestore verification failed for About You.");

            saveBtn.textContent = "Saved";
            if (saveStatus) {
                saveStatus.textContent = "Your about has been saved.";
                saveStatus.className = "about-you-save-status success";
            }
            window.setTimeout(() => { if (saveBtn) saveBtn.textContent = old || "Save About You"; }, 1200);
            closePicker();
        } catch (error) {
            console.error("[TuneTrack Profile] Failed to save About You:", error);
            saveBtn.textContent = "Try Again";
            if (saveStatus) {
                saveStatus.textContent = "Could not save your about. Please try again.";
                saveStatus.className = "about-you-save-status error";
            }
            window.setTimeout(() => { if (saveBtn) saveBtn.textContent = old || "Save About You"; }, 1600);
        } finally {
            saveBtn.disabled = false;
            updateBio();
        }
    });

    updateBio();
    const existingProfile = window.__TUNETRACK_PROFILE__;
    if (existingProfile) syncAboutYouFromProfile(existingProfile);
};


const init = () => {
    let app;
    let auth;
    let db;

    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState !== "visible") return;
        
            const currentUser = auth?.currentUser;
            if (!currentUser) {
                redirectToLogin();
                return;
            }
        
            if (dashboardIsAdmin) return;

            if (isDashboardSessionExpired(currentUser)) {
                forceDashboardLogout(auth, "expired");
            } else {
                armDashboardSessionExpiry(auth, currentUser);
            }
        });
        
        window.addEventListener("focus", () => {
            const currentUser = auth?.currentUser;
            if (!currentUser) return;
        
            if (dashboardIsAdmin) return;

            if (isDashboardSessionExpired(currentUser)) {
                forceDashboardLogout(auth, "expired");
            } else {
                armDashboardSessionExpiry(auth, currentUser);
            }
        });
        
    } catch (error) {
        console.error("[TuneTrack Auth] Firebase initialization failed:", error);
        redirectToLogin();
        return;
    }

    const authTimeout = window.setTimeout(() => {
        if (!document.documentElement.classList.contains("auth-ready")) {
            console.error("[TuneTrack Auth] Auth check timed out.");
            redirectToLogin();
        }
    }, 10000);

    onAuthStateChanged(
        auth,
        async (user) => {
            window.clearTimeout(authTimeout);

            if (!user) {
                dashboardIsAdmin = false;
                document.getElementById("tt-admin-indicator")?.remove();
                document.getElementById("tt-admin-indicator-style")?.remove();

                // Account deletion intentionally signs the user out before the
                // 10-second farewell screen redirects to the login page.
                if (accountDeletionInProgress) return;
                redirectToLogin();
                return;
            }

            // Custom claims are the admin gate. Force-refresh once after sign-in
            // so an admin claim created shortly before login is available immediately.
            try {
                const tokenResult = await getIdTokenResult(user, true);
                dashboardIsAdmin = tokenResult?.claims?.admin === true;
            } catch (error) {
                dashboardIsAdmin = false;
                console.error("[TuneTrack Auth] Failed to read Firebase custom claims:", error);
            }

            // Admin accounts are exempt from the 3-hour dashboard session.
            // Normal users keep the existing 3-hour security window.
            if (!dashboardIsAdmin) {
                if (!isDashboardSessionExpired(user)) {
                    armDashboardSessionExpiry(auth, user);
                } else {
                    forceDashboardLogout(auth, "expired");
                    return;
                }
            } else if (dashboardSessionExpiryTimer) {
                window.clearTimeout(dashboardSessionExpiryTimer);
                dashboardSessionExpiryTimer = null;
            }

            updateUserUI(user, null);
            if (window.location.hash === "#my-products") setVaultSyncing(true);

            (async () => {
                let profile = {};
                try {
                    const profileSnap = await getDoc(doc(db, "users", user.uid));
                    if (profileSnap.exists()) profile = profileSnap.data() || {};
                } catch (error) {
                    console.error("[TuneTrack Profile] Failed to load profile:", error);
                }

                // Firebase profile is the source of truth before the dashboard is
                // revealed, preventing an already-claimed card from flashing active.
                window.__TUNETRACK_PROFILE__ = profile;
                setAdminIndicator(profile);
                updateUserUI(user, profile);

                // Reveal the dashboard immediately after Firebase auth + profile
                // verification. Optional UI/data rendering below must never be
                // able to trap the user behind the preloader if one of those
                // helpers throws.
                revealDashboard();

                setVaultSyncing(false);
                renderOwnedProducts(profile);
                renderTransactions(profile);
                applyFreebieArtistCap();
                wireFreebieClaimRouting();
                applyClaimedFreebieState(profile);

                requestAnimationFrame(() => {
                    wireFreebieClaimRouting();
                    applyClaimedFreebieState(window.__TUNETRACK_PROFILE__ || profile);
                    applyFreebieArtistCap();
                });

                startProfileRealtimeSync(db, user);
                startNotificationSync(db, user);
                wireSecuritySlides(db, auth);
                wireDeleteAccount(db, auth);
                wireAboutYou(db, auth);
                startActiveSessionSecurity(db, auth, user).catch((error) => {
                    console.error("[TuneTrack Sessions] Failed to initialize:", error);
                });
            })();
        },
        (error) => {
            window.clearTimeout(authTimeout);
            console.error("[TuneTrack Auth] Auth state listener failed:", error);
            redirectToLogin();
        }
    );

    const updateNameBtn = document.getElementById("updateNameBtn");
    updateNameBtn?.addEventListener("click", async (event) => {
        event.preventDefault();

        const user = auth.currentUser;
        const input = document.getElementById("settingUsername");
        const newName = input?.value.trim() || "";

        if (!user || !newName) {
            console.warn("[TuneTrack Profile] Display name is required.");
            return;
        }

        updateNameBtn.disabled = true;

        try {
            await updateProfile(user, { displayName: newName });

            await updateDoc(doc(db, "users", user.uid), {
                username: newName,
                displayName: newName,
                updatedAt: serverTimestamp()
            });

            updateUserUI(user, {
                username: newName,
                displayName: newName,
                email: user.email || ""
            });

            await notifyAccountActivity(
                db,
                user,
                "Profile updated",
                "Your display name was changed successfully.",
                "profile_update"
            );
        } catch (error) {
            console.error("[TuneTrack Profile] Failed to update display name:", error);
        } finally {
            updateNameBtn.disabled = false;
        }
    });

    const avatarSelector = document.getElementById("avatarSelector");
    const confirmAvatarBtn = document.getElementById("confirmAvatarBtn");
    const cancelAvatarBtn = document.getElementById("cancelAvatarBtn");

    // Avatar cards use direct click handlers so every button remains independently clickable.
    avatarSelector?.querySelectorAll(".avatar-option").forEach((option) => {
        option.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            const id = Number(option.dataset.avatarId);
            if (!id || id < 1 || id > AVATAR_COUNT) return;

            pendingAvatarId = id;
            setAvatarSelectionUI(id);
        });
    });

    cancelAvatarBtn?.addEventListener("click", (event) => {
        event.preventDefault();
        pendingAvatarId = savedAvatarId;
        setAvatarSelectionUI(savedAvatarId);
    });

    confirmAvatarBtn?.addEventListener("click", async (event) => {
        event.preventDefault();

        const user = auth.currentUser;
        if (!user || pendingAvatarId === savedAvatarId) return;

        confirmAvatarBtn.disabled = true;
        if (cancelAvatarBtn) cancelAvatarBtn.disabled = true;

        try {
            await updateDoc(doc(db, "users", user.uid), {
                avatarId: pendingAvatarId,
                avatar: getAvatarAsset(pendingAvatarId),
                updatedAt: serverTimestamp()
            });

            savedAvatarId = pendingAvatarId;
            setAvatarSelectionUI(savedAvatarId);

            await notifyAccountActivity(
                db,
                user,
                "Avatar updated",
                "Your profile avatar was changed successfully.",
                "avatar_update"
            );
        } catch (error) {
            console.error("[TuneTrack Profile] Failed to update avatar:", error);
            pendingAvatarId = savedAvatarId;
            setAvatarSelectionUI(savedAvatarId);
        } finally {
            confirmAvatarBtn.disabled = false;
            if (cancelAvatarBtn) cancelAvatarBtn.disabled = false;
        }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            await signOut(auth);
        } catch (error) {
            console.error("[TuneTrack Auth] Sign out failed:", error);
        } finally {
            redirectToLogin();
        }
    });
};


window.addEventListener("tunetrack:product-unlocked", (event) => {
    const current = window.__TUNETRACK_PROFILE__ || {};
    const key = event.detail?.productKey;
    const owned = Array.isArray(current.ownedProducts) ? [...current.ownedProducts] : [];
    if (key && !owned.includes(key)) owned.push(key);
    current.ownedProducts = owned;
    const claims = Array.isArray(current.freebieClaims) ? [...current.freebieClaims] : [];
    if (key && !claims.some(item => item?.productKey === key)) {
        claims.push({
            productKey: key,
            title: event.detail?.title || "",
            artist: event.detail?.artist || "",
            image: event.detail?.image || "",
            downloadLinks: event.detail?.downloadLinks || {}
        });
    }
    current.freebieClaims = claims;
    window.__TUNETRACK_PROFILE__ = current;
    renderOwnedProducts(current);
    renderTransactions(current);
    applyClaimedFreebieState(current);
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
