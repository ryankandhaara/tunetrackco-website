import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAd7sJx_5-rYDUBAuzEp-QZHTAgqoYKB7I",
  authDomain: "tunetrack-co.firebaseapp.com",
  projectId: "tunetrack-co",
  storageBucket: "tunetrack-co.firebasestorage.app",
  messagingSenderId: "6013781332",
  appId: "1:6013781332:web:86198dd552826c046eb4c1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const USER_SESSION_MS = 3 * 60 * 60 * 1000;
let sessionTimer = null;

const forceLogout = async () => {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.warn("TuneTrack forced sign-out failed:", error);
  } finally {
    goToLogin();
  }
};

const setupSessionGuard = async (user) => {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }

  // Force-refresh the ID token so a newly assigned custom claim such as
  // admin:true is available immediately after the admin account logs in.
  const tokenResult = await user.getIdTokenResult(true);
  const isAdmin = tokenResult.claims?.admin === true;

  if (isAdmin) showAdminIndicator(user);

  // Admin accounts are not subject to the 3-hour user session limit.
  if (isAdmin) {
    return { isAdmin, tokenResult };
  }

  const authTime = Number(tokenResult.claims?.auth_time);

  if (!Number.isFinite(authTime) || authTime <= 0) {
    await forceLogout();
    return { isAdmin: false, tokenResult };
  }

  const expiresAt = (authTime * 1000) + USER_SESSION_MS;
  const remaining = expiresAt - Date.now();

  if (remaining <= 0) {
    await forceLogout();
    return { isAdmin: false, tokenResult };
  }

  sessionTimer = window.setTimeout(() => {
    forceLogout();
  }, remaining);

  return { isAdmin, tokenResult };
};


const showAdminIndicator = (user) => {
  const existing = document.getElementById("tt-admin-indicator");
  if (existing) existing.remove();

  const indicator = document.createElement("div");
  indicator.id = "tt-admin-indicator";
  indicator.setAttribute("aria-hidden", "true");

  indicator.innerHTML = `
    <div class="tt-admin-indicator-title">Logged in as Admin,</div>
    <div class="tt-admin-indicator-sub">hi there Mintune!</div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #tt-admin-indicator {
      position: fixed;
      left: 24px;
      bottom: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 11px 15px 12px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 13px;
      background: rgba(10,10,10,.82);
      box-shadow: 0 10px 35px rgba(0,0,0,.22);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transform: translateY(8px);
      animation: ttAdminIndicatorIn .45s cubic-bezier(.22,1,.36,1) .1s forwards;
    }

    #tt-admin-indicator .tt-admin-indicator-title,
    #tt-admin-indicator .tt-admin-indicator-sub {
      font-family: "Space Mono", "SFMono-Regular", Consolas, monospace;
      line-height: 1.25;
      letter-spacing: .01em;
      white-space: nowrap;
    }

    #tt-admin-indicator .tt-admin-indicator-title {
      color: rgba(255,255,255,.92);
      font-size: 10px;
    }

    #tt-admin-indicator .tt-admin-indicator-sub {
      color: rgba(255,255,255,.48);
      font-size: 9px;
    }

    @keyframes ttAdminIndicatorIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 600px) {
      #tt-admin-indicator {
        left: 14px;
        bottom: 14px;
        padding: 9px 12px 10px;
        border-radius: 11px;
      }

      #tt-admin-indicator .tt-admin-indicator-title {
        font-size: 9px;
      }

      #tt-admin-indicator .tt-admin-indicator-sub {
        font-size: 8px;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(indicator);
};

const revealDashboard = (profile, user) => {
  const name = profile?.username || user.displayName || user.email?.split("@")[0] || "there";
  const welcome = document.getElementById("dashboardWelcome");
  const username = document.getElementById("accountUsername");

  if (welcome) {
    welcome.textContent =
      `Welcome back, ${name}. Here is your recent activity and product announcements.`;
  }
  if (username) username.value = name;

  document.documentElement.classList.remove("auth-pending");
  document.documentElement.classList.add("auth-ready");
};

const goToLogin = () => {
  window.location.replace("login-page.html");
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    goToLogin();
    return;
  }

  // Firebase Auth is the first gate. Then verify the current ID token
  // and enforce the 3-hour limit for normal users.
  let sessionState;

  try {
    sessionState = await setupSessionGuard(user);
  } catch (error) {
    console.error("TuneTrack auth verification failed:", error);
    await forceLogout();
    return;
  }

  // setupSessionGuard may already have redirected an expired user.
  if (!sessionState) return;

  let profile = null;

  try {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    if (snapshot.exists()) profile = snapshot.data();
  } catch (error) {
    console.warn("TuneTrack profile read failed:", error);
  }

  revealDashboard(profile, user);
});

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    await signOut(auth);
  } finally {
    goToLogin();
  }
});

const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    tabLinks.forEach((item) => item.classList.remove("active"));
    tabContents.forEach((item) => item.classList.remove("active"));

    link.classList.add("active");
    document.getElementById(link.dataset.target)?.classList.add("active");
  });
});
