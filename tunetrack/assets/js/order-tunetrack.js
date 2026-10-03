/**
 * ==========================================================================
 * TUNETRACK™ CUSTOM ORDER EXPERIENCE — APPLICATION & PRICING ENGINE
 * Awwwards-Caliber Minimal, Cinematic, Interactive Audio Studio Order System
 * ==========================================================================
 */

/* --------------------------------------------------------------------------
   1. PRICING & TARIFF CONFIGURATION (TUNETRACK MASTER SPECIFICATION)
   -------------------------------------------------------------------------- */
const PRICING_CONFIG = {
  multitrack: {
    base: 125000,
    name: "Custom Multitrack",
    badge: "STANDALONE STEMS",
    defaultSongs: 1
  },
  sequencer: {
    base: 75000,
    name: "Custom Sequencer",
    badge: "LIVE PERFORMANCE",
    defaultSongs: 1
  },
  setlist: {
    base: 300000,
    name: "Custom Setlist",
    badge: "CONCERT BUNDLE",
    defaultSongs: 3,
    discount: 80000 // Note: Rp80.000 package discount already included
  }
};

const PRIORITY_FEE = 50000;
const EXTRA_SONG_SETLIST_BASE = 100000;

/* --------------------------------------------------------------------------
   2. APPLICATION STATE
   -------------------------------------------------------------------------- */
let currentStep = "service"; // service | form | review | payment | active | finished
let selectedService = null;
let priorityDelivery = false;

// Single Song Form State (for Multitrack & Sequencer)
let singleSong = {
  title: "Midnight City",
  artist: "M83",
  youtube: "https://youtu.be/dX3k_QDnzHE",
  link: "",
  attachment: "midnight_city_master_ref.wav",
  durMin: 8,
  durSec: 30
};

// Setlist Multi-Song State (Minimum 3 songs included)
let setlistSongs = [
  {
    id: 1,
    title: "Way Maker",
    artist: "Sinach / Leeland",
    youtube: "https://youtu.be/iJCV_2H9xD0",
    link: "",
    attachment: "way_maker_lead.wav",
    durMin: 5,
    durSec: 30
  },
  {
    id: 2,
    title: "Goodness of God",
    artist: "Bethel Music",
    youtube: "https://youtu.be/n0FBb6hnwTo",
    link: "",
    attachment: "goodness_of_god_ref.mp3",
    durMin: 8,
    durSec: 45
  },
  {
    id: 3,
    title: "Gratitude",
    artist: "Brandon Lake",
    youtube: "https://youtu.be/dQw4w9WgXcQ",
    link: "",
    attachment: "gratitude_session.wav",
    durMin: 11,
    durSec: 0
  }
];

// Active Frozen Order Instance (Complies with requested Firebase Schema)
let currentOrder = null;

/* --------------------------------------------------------------------------
   3. EXTRA TIME & PRICING FORMULA (STRICT SPECIFICATION)
   - If duration < 8:00: extra = Rp0
   - If duration >= 8:00: extra = Rp35.000 + ((durationMinutes - 8) * Rp10.000)
   - Same extra-time rule applies to Multitrack, Sequencer, and Setlist
   - For Setlist: extra-time charges are calculated per individual song
   -------------------------------------------------------------------------- */
function calcDurationExtra(min, sec) {
  const totalSeconds = (parseInt(min, 10) || 0) * 60 + (parseInt(sec, 10) || 0);
  if (totalSeconds < 480) { // Below 8 minutes
    return 0;
  }
  const durationMinutes = Math.floor(totalSeconds / 60);
  return 35000 + ((durationMinutes - 8) * 10000);
}

function calculateOrderPricing() {
  if (!selectedService) {
    return { base: 0, extraTime: 0, priority: 0, discount: 0, total: 0 };
  }

  const conf = PRICING_CONFIG[selectedService];
  let base = conf.base;
  let extraTime = 0;
  let discount = conf.discount || 0;

  if (selectedService === 'setlist') {
    // 3 songs are included in the base package of Rp300.000
    if (setlistSongs.length > 3) {
      base += (setlistSongs.length - 3) * EXTRA_SONG_SETLIST_BASE;
    }
    // Calculate extra time per individual song
    setlistSongs.forEach(song => {
      extraTime += calcDurationExtra(song.durMin, song.durSec);
    });
  } else {
    extraTime = calcDurationExtra(singleSong.durMin, singleSong.durSec);
  }

  const priority = priorityDelivery ? PRIORITY_FEE : 0;
  const total = base + extraTime + priority;

  return {
    base,
    extraTime,
    priority,
    discount,
    total
  };
}

/* --------------------------------------------------------------------------
   4. SLOT-MACHINE / ODOMETER / REEL DYNAMIC PRICE ENGINE
   - Starts at Rp0
   - Number rolls upward, new numbers enter from below
   - Physical feel, cubic-bezier damping, motion blur during rapid transition
   -------------------------------------------------------------------------- */
const odometerInstances = {
  nav: { containerId: 'navOdometerReels', lastValue: -1 },
  sidebar: { containerId: 'sidebarOdometerReels', lastValue: -1 },
  bottom: { containerId: 'bottomOdometerReels', lastValue: -1 },
  review: { containerId: 'reviewOdometerReels', lastValue: -1 }
};

function formatNumberIDR(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

function updateAllOdometers(targetVal) {
  Object.keys(odometerInstances).forEach(key => {
    const inst = odometerInstances[key];
    const container = document.getElementById(inst.containerId);
    if (!container) return;

    renderOdometer(container, targetVal, inst.lastValue);
    inst.lastValue = targetVal;
  });
}

function renderOdometer(container, targetVal, lastVal) {
  const formatted = formatNumberIDR(targetVal);
  const chars = formatted.split('');

  // Clear previous reels
  container.innerHTML = '';

  chars.forEach((char, index) => {
    if (char === '.') {
      const dot = document.createElement('span');
      dot.className = 'odometer-dot';
      dot.textContent = '.';
      container.appendChild(dot);
    } else {
      const col = document.createElement('div');
      col.className = 'odometer-digit-col';

      const reel = document.createElement('div');
      reel.className = 'odometer-digit-reel';

      // 2 complete cycles of digits 0-9 for continuous smooth physical roll
      for (let cycle = 0; cycle < 2; cycle++) {
        for (let d = 0; d <= 9; d++) {
          const cell = document.createElement('div');
          cell.className = 'odometer-digit-cell';
          cell.textContent = d;
          reel.appendChild(cell);
        }
      }

      const targetDigit = parseInt(char, 10);
      col.appendChild(reel);
      container.appendChild(col);

      // Target position: second cycle offset ensures entrance from below
      const targetIndex = 10 + targetDigit;

      reel.style.transform = 'translateY(0)';

      requestAnimationFrame(() => {
        reel.classList.add('spinning');
        // Gentle wave delay across columns
        setTimeout(() => {
          reel.style.transform = `translateY(-${targetIndex * 1.18}em)`;
          setTimeout(() => reel.classList.remove('spinning'), 500);
        }, index * 25);
      });
    }
  });
}

/* --------------------------------------------------------------------------
   5. VIEW / LIFECYCLE ROUTING
   -------------------------------------------------------------------------- */
function goToStep(step) {
  currentStep = step;
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  const activeSection = document.getElementById(`view-${step}`);
  if (activeSection) activeSection.classList.add('active');

  // Breadcrumbs Navigation State
  const steps = ['service', 'form', 'review', 'status'];
  let activeCrumbIdx = 0;
  if (step === 'form') activeCrumbIdx = 1;
  else if (step === 'review') activeCrumbIdx = 2;
  else if (step === 'payment' || step === 'active' || step === 'finished') activeCrumbIdx = 3;

  document.querySelectorAll('.breadcrumb-step').forEach((el, idx) => {
    el.classList.remove('active', 'completed');
    if (idx === activeCrumbIdx) el.classList.add('active');
    else if (idx < activeCrumbIdx) el.classList.add('completed');
  });

  // Sticky bottom action bar visibility
  const bottomBar = document.getElementById('stickyBottomBar');
  if (step === 'service' || step === 'form') {
    bottomBar.style.display = 'flex';
  } else {
    bottomBar.style.display = 'none';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* --------------------------------------------------------------------------
   6. SERVICE SELECTION INTERACTIONS
   -------------------------------------------------------------------------- */
function selectService(serviceKey) {
  selectedService = serviceKey;

  // Visual card selection states
  document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
  const activeCard = document.getElementById(`card-${serviceKey}`);
  if (activeCard) activeCard.classList.add('selected');

  // Enable landing continue button
  const continueBtn = document.getElementById('btnContinueToForm');
  if (continueBtn) {
    continueBtn.style.opacity = '1';
    continueBtn.style.pointerEvents = 'auto';
  }

  // Update bottom action bar labels
  const config = PRICING_CONFIG[serviceKey];
  const bName = document.getElementById('bottomServiceName');
  const bSpec = document.getElementById('bottomServiceSpec');
  const sBadge = document.getElementById('sidebarServiceBadge');

  if (bName) bName.textContent = config.name;
  if (bSpec) bSpec.textContent = serviceKey === 'setlist' ? '3 Songs Included • -Rp80.000 Bundle' : 'Single Master Track Blueprint';
  if (sBadge) sBadge.textContent = serviceKey.toUpperCase();

  syncPricingUI();
}

function proceedToForm() {
  if (!selectedService) return;

  // Toggle Single Song vs Setlist Multi-Song Form
  if (selectedService === 'setlist') {
    document.getElementById('singleSongFormContainer').style.display = 'none';
    document.getElementById('setlistFormContainer').style.display = 'block';
    document.getElementById('formSubtitle').textContent = "Configure all 3 songs in your custom setlist with independent timings.";
    renderSetlistSongs();
  } else {
    document.getElementById('singleSongFormContainer').style.display = 'block';
    document.getElementById('setlistFormContainer').style.display = 'none';
    document.getElementById('formSubtitle').textContent = "Provide references, timing, and audio assets for precision engineering.";
  }

  syncPricingUI();
  goToStep('form');
}

/* --------------------------------------------------------------------------
   7. PRIORITY DELIVERY TOGGLE
   -------------------------------------------------------------------------- */
function togglePriority() {
  priorityDelivery = !priorityDelivery;
  const card = document.getElementById('priorityCard');
  if (priorityDelivery) {
    card.classList.add('selected');
  } else {
    card.classList.remove('selected');
  }
  syncPricingUI();
}

/* --------------------------------------------------------------------------
   8. FORM INPUT & DURATION CONTROLS
   -------------------------------------------------------------------------- */
function handleFormChange() {
  singleSong.title = document.getElementById('songTitle').value;
  singleSong.artist = document.getElementById('songArtist').value;
  singleSong.youtube = document.getElementById('songYoutube').value;
  singleSong.link = document.getElementById('songLink').value;
  syncPricingUI();
}

function onDurationInput(target) {
  if (target === 'single') {
    const min = parseInt(document.getElementById('singleDurMin').value, 10) || 0;
    const sec = parseInt(document.getElementById('singleDurSec').value, 10) || 0;
    singleSong.durMin = min;
    singleSong.durSec = sec;
  }
  syncPricingUI();
}

function setPresetDuration(target, min, sec) {
  if (target === 'single') {
    document.getElementById('singleDurMin').value = min;
    document.getElementById('singleDurSec').value = sec;
    singleSong.durMin = min;
    singleSong.durSec = sec;

    document.querySelectorAll('.duration-presets .duration-chip').forEach(chip => chip.classList.remove('active'));
    if (window.event && window.event.target) window.event.target.classList.add('active');
  }
  syncPricingUI();
}

/* --------------------------------------------------------------------------
   9. SETLIST MULTI-SONG MANAGEMENT (MINIMUM 3 SONGS)
   -------------------------------------------------------------------------- */
function renderSetlistSongs() {
  const container = document.getElementById('setlistTracklist');
  if (!container) return;
  container.innerHTML = '';

  setlistSongs.forEach((song, idx) => {
    const extraFee = calcDurationExtra(song.durMin, song.durSec);
    const card = document.createElement('div');
    card.className = `setlist-track-card ${idx === 0 ? 'active' : ''}`;
    card.id = `setlistCard_${song.id}`;

    card.innerHTML = `
      <div class="setlist-track-header" onclick="toggleSetlistAccordion(${song.id})">
        <div class="setlist-track-title-info">
          <span class="track-badge">TRACK 0${idx + 1}</span>
          <strong style="color: #fff; font-size: 0.92rem;">${song.title || 'Untitled Track'}</strong>
          <span style="font-size: 0.8rem; color: var(--text-muted);">— ${song.artist || 'Artist'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 0.78rem;">
          <span>${String(song.durMin).padStart(2,'0')}:${String(song.durSec).padStart(2,'0')}</span>
          <span style="color: ${extraFee > 0 ? '#93c5fd' : 'var(--text-muted)'};">
            ${extraFee > 0 ? `+Rp${formatNumberIDR(extraFee)}` : 'Rp0 extra'}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      <div class="setlist-track-body" id="setlistBody_${song.id}" style="${idx === 0 ? 'display:flex;' : 'display:none;'}">
        <div class="grid-2">
          <div class="field-group" style="margin-bottom:0;">
            <label class="field-label">Song Title</label>
            <input type="text" class="input-text" value="${song.title}" oninput="updateSetlistSong(${song.id}, 'title', this.value)">
          </div>
          <div class="field-group" style="margin-bottom:0;">
            <label class="field-label">Artist</label>
            <input type="text" class="input-text" value="${song.artist}" oninput="updateSetlistSong(${song.id}, 'artist', this.value)">
          </div>
        </div>

        <div class="grid-2">
          <div class="field-group" style="margin-bottom:0;">
            <label class="field-label">YouTube Reference</label>
            <input type="url" class="input-text" value="${song.youtube}" oninput="updateSetlistSong(${song.id}, 'youtube', this.value)">
          </div>
          <div class="field-group" style="margin-bottom:0;">
            <label class="field-label">Attached Audio Reference</label>
            <div class="dropzone-box has-file" style="padding: 10px;" onclick="simulateFileUpload('setlist_${song.id}')">
              <div class="file-chip">
                <div style="font-size: 0.75rem; color: #fff; font-family: var(--font-mono);">${song.attachment}</div>
                <span style="font-size: 0.68rem; color: var(--blue-accent);">Replace</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="field-label">
            <span>Duration (MM:SS)</span>
            <span class="field-hint">Extra time calculated per song</span>
          </label>
          <div class="duration-inputs">
            <div class="duration-unit-box">
              <input type="number" min="0" max="60" class="duration-unit-input" value="${song.durMin}" oninput="updateSetlistSongDur(${song.id}, this.value, ${song.durSec})">
              <span class="duration-unit-label">Min</span>
            </div>
            <span class="duration-colon">:</span>
            <div class="duration-unit-box">
              <input type="number" min="0" max="59" class="duration-unit-input" value="${song.durSec}" oninput="updateSetlistSongDur(${song.id}, ${song.durMin}, this.value)">
              <span class="duration-unit-label">Sec</span>
            </div>
            <div class="duration-fee-banner ${extraFee > 0 ? 'extra' : 'free'}" style="flex:1;">
              <span>${extraFee > 0 ? `Duration >= 8 min: Rp35.000 + ((${song.durMin}-8) × Rp10k)` : 'Duration under 8:00 (Rp0 extra)'}</span>
              <strong>${extraFee > 0 ? `+Rp${formatNumberIDR(extraFee)}` : 'Free'}</strong>
            </div>
          </div>
        </div>

        ${setlistSongs.length > 3 ? `
          <div style="text-align: right; margin-top: 4px;">
            <button class="btn-secondary" style="font-size: 0.72rem; color: #ef4444;" onclick="removeSetlistSong(${song.id})">Remove Track</button>
          </div>
        ` : ''}
      </div>
    `;

    container.appendChild(card);
  });

  const badge = document.getElementById('setlistTrackCountBadge');
  if (badge) badge.textContent = `${setlistSongs.length} SONGS INCLUDED`;
}

function toggleSetlistAccordion(id) {
  const body = document.getElementById(`setlistBody_${id}`);
  if (body) {
    body.style.display = body.style.display === 'none' ? 'flex' : 'none';
  }
}

function updateSetlistSong(id, key, val) {
  const song = setlistSongs.find(s => s.id === id);
  if (song) {
    song[key] = val;
    const header = document.querySelector(`#setlistCard_${id} strong`);
    if (header && key === 'title') header.textContent = val || 'Untitled Track';
  }
}

function updateSetlistSongDur(id, min, sec) {
  const song = setlistSongs.find(s => s.id === id);
  if (song) {
    song.durMin = parseInt(min, 10) || 0;
    song.durSec = parseInt(sec, 10) || 0;
    renderSetlistSongs();
    syncPricingUI();
  }
}

function addSetlistSong() {
  const newId = Date.now();
  setlistSongs.push({
    id: newId,
    title: `Setlist Song ${setlistSongs.length + 1}`,
    artist: "Artist",
    youtube: "https://youtu.be/example",
    link: "",
    attachment: `track_0${setlistSongs.length + 1}_ref.wav`,
    durMin: 4,
    durSec: 30
  });
  renderSetlistSongs();
  syncPricingUI();
}

function removeSetlistSong(id) {
  if (setlistSongs.length <= 3) return; // Minimum 3 songs
  setlistSongs = setlistSongs.filter(s => s.id !== id);
  renderSetlistSongs();
  syncPricingUI();
}

/* --------------------------------------------------------------------------
   10. FILE ATTACHMENT SIMULATION
   -------------------------------------------------------------------------- */
function simulateFileUpload(type) {
  const demoFiles = [
    "master_session_ref_105bpm.wav",
    "live_concert_rough_mix.mp3",
    "stems_demo_worship_fsharp.wav",
    "ableton_rough_guide.aiff"
  ];
  const picked = demoFiles[Math.floor(Math.random() * demoFiles.length)];

  if (type === 'single') {
    singleSong.attachment = picked;
    document.getElementById('fileNameSingle').textContent = picked;
  }
}

function removeAttachment(type) {
  if (type === 'single') {
    singleSong.attachment = "custom_song_reference.wav";
    document.getElementById('fileNameSingle').textContent = "custom_song_reference.wav";
  }
}

/* --------------------------------------------------------------------------
   11. DYNAMIC PRICING SYNCHRONIZATION
   -------------------------------------------------------------------------- */
function syncPricingUI() {
  const p = calculateOrderPricing();

  // Animate all odometers
  updateAllOdometers(p.total);

  // Single duration banner text
  if (selectedService !== 'setlist') {
    const extraFee = calcDurationExtra(singleSong.durMin, singleSong.durSec);
    const banner = document.getElementById('singleDurationBanner');
    const textEl = document.getElementById('singleDurationText');
    const amtEl = document.getElementById('singleDurationAmount');

    if (banner && textEl && amtEl) {
      if (extraFee === 0) {
        banner.className = 'duration-fee-banner free';
        textEl.textContent = `Duration: ${String(singleSong.durMin).padStart(2,'0')}:${String(singleSong.durSec).padStart(2,'0')} (under 8:00 threshold — no extra fee)`;
        amtEl.textContent = 'Rp0';
      } else {
        banner.className = 'duration-fee-banner extra';
        textEl.textContent = `Duration: ${String(singleSong.durMin).padStart(2,'0')}:${String(singleSong.durSec).padStart(2,'0')} (${singleSong.durMin} min). Extra: Rp35.000 + ((${singleSong.durMin}-8) × Rp10k)`;
        amtEl.textContent = `+ Rp${formatNumberIDR(extraFee)}`;
      }
    }
  }

  // Right sidebar ledger
  if (selectedService) {
    const conf = PRICING_CONFIG[selectedService];
    const bTitle = document.getElementById('ledgerBaseTitle');
    const bAmt = document.getElementById('ledgerBaseAmount');
    const dRow = document.getElementById('ledgerDiscountRow');
    const eAmt = document.getElementById('ledgerExtraAmount');
    const pRow = document.getElementById('ledgerPriorityRow');
    const fText = document.getElementById('ledgerFinalText');

    if (bTitle) bTitle.textContent = conf.name;
    if (bAmt) bAmt.textContent = `Rp${formatNumberIDR(conf.base)}`;
    if (dRow) dRow.style.display = selectedService === 'setlist' ? 'flex' : 'none';
    if (eAmt) eAmt.textContent = `+ Rp${formatNumberIDR(p.extraTime)}`;
    if (pRow) pRow.style.display = priorityDelivery ? 'flex' : 'none';
    if (fText) fText.textContent = `Rp${formatNumberIDR(p.total)}`;
  }
}

/* --------------------------------------------------------------------------
   12. ORDER REVIEW MANIFEST
   -------------------------------------------------------------------------- */
function proceedToReview() {
  if (!selectedService) {
    goToStep('service');
    return;
  }

  const p = calculateOrderPricing();
  const conf = PRICING_CONFIG[selectedService];

  document.getElementById('revService').textContent = conf.name;
  document.getElementById('revDelivery').textContent = priorityDelivery ? "Priority Quick 1-Day (24h Guaranteed)" : "Standard Studio (3-4 Days)";
  document.getElementById('revTrackCount').textContent = selectedService === 'setlist' ? `${setlistSongs.length} Songs Setlist` : "1 Single Track";

  const tbody = document.getElementById('revTracksBody');
  tbody.innerHTML = '';

  if (selectedService === 'setlist') {
    setlistSongs.forEach((song, idx) => {
      const extra = calcDurationExtra(song.durMin, song.durSec);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:#fff;">0${idx+1}. ${song.title}</strong></td>
        <td>${song.artist}</td>
        <td style="font-family:var(--font-mono);">${String(song.durMin).padStart(2,'0')}:${String(song.durSec).padStart(2,'0')}</td>
        <td style="font-family:var(--font-mono); color:${extra>0?'#93c5fd':'var(--text-muted)'};">${extra > 0 ? `+Rp${formatNumberIDR(extra)}` : 'Rp0'}</td>
        <td style="font-size:0.75rem;">
          <a href="${song.youtube}" target="_blank" style="color:var(--blue-accent); text-decoration:underline;">Ref URL</a> • 
          <span style="color:var(--text-muted);">${song.attachment}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    const extra = calcDurationExtra(singleSong.durMin, singleSong.durSec);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color:#fff;">01. ${singleSong.title}</strong></td>
      <td>${singleSong.artist}</td>
      <td style="font-family:var(--font-mono);">${String(singleSong.durMin).padStart(2,'0')}:${String(singleSong.durSec).padStart(2,'0')}</td>
      <td style="font-family:var(--font-mono); color:${extra>0?'#93c5fd':'var(--text-muted)'};">${extra > 0 ? `+Rp${formatNumberIDR(extra)}` : 'Rp0'}</td>
      <td style="font-size:0.75rem;">
        <a href="${singleSong.youtube}" target="_blank" style="color:var(--blue-accent); text-decoration:underline;">Ref URL</a> • 
        <span style="color:var(--text-muted);">${singleSong.attachment}</span>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // Price calculation review breakdown
  const breakdownList = document.getElementById('revPriceBreakdownList');
  breakdownList.innerHTML = `
    <div style="display:flex; justify-content:space-between;">
      <span>Base Production Package:</span>
      <strong style="color:#fff;">Rp${formatNumberIDR(p.base)}</strong>
    </div>
    ${selectedService === 'setlist' ? `
      <div style="display:flex; justify-content:space-between; color:#93c5fd;">
        <span>Package Bundle Discount:</span>
        <strong>- Rp80.000 (Included)</strong>
      </div>
    ` : ''}
    <div style="display:flex; justify-content:space-between;">
      <span>Duration Surcharges (>= 8:00 min):</span>
      <strong style="color:#fff;">+ Rp${formatNumberIDR(p.extraTime)}</strong>
    </div>
    ${priorityDelivery ? `
      <div style="display:flex; justify-content:space-between; color:#93c5fd;">
        <span>Priority 1-Day Delivery:</span>
        <strong>+ Rp50.000</strong>
      </div>
    ` : ''}
  `;

  goToStep('review');
}

/* --------------------------------------------------------------------------
   13. ORDER CREATION, PRICE FREEZING & PUBLIC ORDER KEY GENERATION
   -------------------------------------------------------------------------- */
function generatePublicOrderKey() {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'TT-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function confirmAndPlaceOrder() {
  const p = calculateOrderPricing();
  const publicOrderKey = generatePublicOrderKey();
  const orderId = `ord_${Date.now()}`;
  const uid = FirebaseAdapter.getCurrentUserId() || "usr_tune_981a2";

  const songsManifest = selectedService === 'setlist' ? setlistSongs.map(s => ({
    title: s.title,
    artist: s.artist,
    duration: `${String(s.durMin).padStart(2,'0')}:${String(s.durSec).padStart(2,'0')}`,
    durationMinutes: s.durMin,
    extraTimeCost: calcDurationExtra(s.durMin, s.durSec),
    referenceUrl: s.youtube,
    attachmentName: s.attachment
  })) : [{
    title: singleSong.title,
    artist: singleSong.artist,
    duration: `${String(singleSong.durMin).padStart(2,'0')}:${String(singleSong.durSec).padStart(2,'0')}`,
    durationMinutes: singleSong.durMin,
    extraTimeCost: calcDurationExtra(singleSong.durMin, singleSong.durSec),
    referenceUrl: singleSong.youtube,
    attachmentName: singleSong.attachment
  }];

  // Immutable Order Record
  currentOrder = {
    uid: uid,
    orderId: orderId,
    publicOrderKey: publicOrderKey,
    type: selectedService,
    songs: songsManifest,
    references: songsManifest.map(s => s.referenceUrl),
    attachments: songsManifest.map(s => s.attachmentName),
    duration: songsManifest.map(s => s.duration).join(', '),
    priorityDelivery: priorityDelivery,
    pricing: {
      base: p.base,
      extraTime: p.extraTime,
      priority: p.priority,
      total: p.total
    },
    paymentStatus: "unpaid",
    status: "pending_payment",
    createdAt: new Date().toISOString()
  };

  // Dispatch to Firebase Adapter (with localStorage fallback)
  FirebaseAdapter.saveOrder(currentOrder);

  // Setup Payment View
  document.getElementById('payOrderKey').textContent = currentOrder.publicOrderKey;
  document.getElementById('qrisOrderTag').textContent = `KEY: ${currentOrder.publicOrderKey}`;
  document.getElementById('qrisPayAmount').textContent = `Rp${formatNumberIDR(currentOrder.pricing.total)}`;
  document.getElementById('lynkDirectUrl').textContent = `https://lynk.id/tunetrack/pay?order=${currentOrder.publicOrderKey}&amount=${currentOrder.pricing.total}`;

  goToStep('payment');
}

/* --------------------------------------------------------------------------
   14. PAYMENT & DRAWBACK / RETURN BRIDGE
   -------------------------------------------------------------------------- */
function drawbackOrder() {
  goToStep('form');
}

function copyLynkUrl() {
  const url = document.getElementById('lynkDirectUrl').textContent;
  navigator.clipboard.writeText(url).then(() => {
    alert(`Payment link copied to clipboard:\n${url}`);
  }).catch(() => {
    prompt("Copy payment link:", url);
  });
}

function openLynkExternal() {
  window.open(`https://lynk.id/tunetrack/pay?order=${currentOrder.publicOrderKey}`, '_blank');
}

function simulatePaymentSuccess() {
  if (!currentOrder) return;

  currentOrder.paymentStatus = "paid";
  currentOrder.status = "processing";
  FirebaseAdapter.saveOrder(currentOrder);

  renderActiveOrderView(currentOrder);
  goToStep('active');
}

function renderActiveOrderView(order) {
  document.getElementById('activeOrderTitle').textContent = PRICING_CONFIG[order.type]?.name || "Custom Production";
  document.getElementById('activeOrderKeyDisplay').textContent = order.publicOrderKey;
  document.getElementById('activeEtaTimer').textContent = order.priorityDelivery ? "23h 52m remaining (1-Day Priority)" : "3 Days remaining";
  document.getElementById('activePriorityBadge').textContent = order.priorityDelivery ? "PRIORITY 1-DAY QUEUE" : "STANDARD PRODUCTION";

  const summaryBody = document.getElementById('activeOrderSummaryBody');
  summaryBody.innerHTML = `
    <div><strong>Service Tier:</strong> ${PRICING_CONFIG[order.type]?.name}</div>
    <div><strong>Tracks:</strong> ${order.songs.map(s => `${s.title} (${s.duration})`).join(', ')}</div>
    <div><strong>Frozen Valuation:</strong> Rp${formatNumberIDR(order.pricing.total)}</div>
    <div><strong>Payment Gateway:</strong> <span style="color:var(--success-green); font-weight:700;">PAID via Lynk.id</span></div>
    <div><strong>Created At:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
  `;
}

function copyOrderKey() {
  if (!currentOrder) return;
  navigator.clipboard.writeText(currentOrder.publicOrderKey).then(() => {
    alert(`Public Order Key ${currentOrder.publicOrderKey} copied to clipboard.`);
  }).catch(() => {
    prompt("Order key:", currentOrder.publicOrderKey);
  });
}

function sendEngineerNote() {
  const input = document.getElementById('engineerNoteInput');
  if (!input.value.trim()) return;
  alert(`Note dispatched to Lead Producer:\n"${input.value}"`);
  input.value = '';
}

function simulateOrderFinished() {
  if (!currentOrder) return;
  currentOrder.status = "finished";
  FirebaseAdapter.saveOrder(currentOrder);
  goToStep('finished');
}

/* --------------------------------------------------------------------------
   15. PROCEDURAL WEB AUDIO STEM AUDITION CONSOLE
   -------------------------------------------------------------------------- */
let audioCtx = null;
let isPlayingAudio = false;
let playhead = 0;

const stemState = {
  drums: { muted: false, solo: false },
  bass: { muted: false, solo: false },
  keys: { muted: false, solo: false },
  leads: { muted: false, solo: false },
  cue: { muted: false, solo: false }
};

function initWebAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function toggleStemAudio() {
  initWebAudio();
  isPlayingAudio = !isPlayingAudio;
  const playIcon = document.getElementById('masterPlayIcon');

  if (isPlayingAudio) {
    playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    startProceduralGroove();
  } else {
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    stopProceduralGroove();
  }
}

let grooveInterval = null;
let stepCount = 0;

function startProceduralGroove() {
  if (grooveInterval) clearInterval(grooveInterval);

  const stepTimeMs = (60 / 105 / 4) * 1000; // 105 BPM 16th notes

  grooveInterval = setInterval(() => {
    if (!isPlayingAudio) return;
    stepCount = (stepCount + 1) % 16;
    playhead += stepTimeMs / 1000;

    const totalSec = 510; // 8:30
    const percent = Math.min(100, (playhead / totalSec) * 100);
    const scrubber = document.getElementById('playerScrubber');
    if (scrubber) scrubber.value = percent;

    const curMin = Math.floor(playhead / 60);
    const curSec = Math.floor(playhead % 60);
    const timeEl = document.getElementById('playerTime');
    if (timeEl) timeEl.textContent = `${String(curMin).padStart(2,'0')}:${String(curSec).padStart(2,'0')} / 08:30`;

    const anySolo = Object.values(stemState).some(s => s.solo);

    function canPlay(channelKey) {
      if (anySolo) return stemState[channelKey].solo && !stemState[channelKey].muted;
      return !stemState[channelKey].muted;
    }

    const t = audioCtx.currentTime;

    // Drums
    if (canPlay('drums')) {
      if (stepCount % 4 === 0) playKick(t);
      if (stepCount === 4 || stepCount === 12) playSnare(t);
      if (stepCount % 2 === 1) playHiHat(t);
      animateMeter('drums');
    }

    // Bass
    if (canPlay('bass') && stepCount % 4 === 0) {
      playBass(t, 55 + (stepCount === 8 ? 7 : 0));
      animateMeter('bass');
    }

    // Keys / Pads
    if (canPlay('keys') && (stepCount === 0 || stepCount === 8)) {
      playKeyPad(t, 220);
      animateMeter('keys');
    }

    // Leads / Sax
    if (canPlay('leads') && (stepCount % 3 === 0)) {
      playLead(t, 440 + (stepCount * 25));
      animateMeter('leads');
    }

    // Metronome Click & Voice Cue (L-channel prompt)
    if (canPlay('cue') && stepCount % 4 === 0) {
      playClickCue(t);
      animateMeter('cue');
    }

  }, stepTimeMs);
}

function stopProceduralGroove() {
  if (grooveInterval) clearInterval(grooveInterval);
}

function resetAudioPlayback() {
  playhead = 0;
  stepCount = 0;
  const scrubber = document.getElementById('playerScrubber');
  const timeEl = document.getElementById('playerTime');
  if (scrubber) scrubber.value = 0;
  if (timeEl) timeEl.textContent = "00:00 / 08:30";
  if (isPlayingAudio) toggleStemAudio();
}

function onScrubAudio(val) {
  playhead = (parseFloat(val) / 100) * 510;
  const curMin = Math.floor(playhead / 60);
  const curSec = Math.floor(playhead % 60);
  const timeEl = document.getElementById('playerTime');
  if (timeEl) timeEl.textContent = `${String(curMin).padStart(2,'0')}:${String(curSec).padStart(2,'0')} / 08:30`;
}

function playKick(t) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(130, t);
  osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.28);
  gain.gain.setValueAtTime(0.7, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
  osc.start(t);
  osc.stop(t + 0.3);
}

function playSnare(t) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(180, t);
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  osc.start(t);
  osc.stop(t + 0.16);
}

function playHiHat(t) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(8000, t);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.start(t);
  osc.stop(t + 0.06);
}

function playBass(t, freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, t);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
  osc.start(t);
  osc.stop(t + 0.42);
}

function playKeyPad(t, freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
  osc.start(t);
  osc.stop(t + 0.85);
}

function playLead(t, freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, t);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  osc.start(t);
  osc.stop(t + 0.22);
}

function playClickCue(t) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(1000, t);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  osc.start(t);
  osc.stop(t + 0.05);
}

function animateMeter(channel) {
  const meter = document.getElementById(`meter-${channel}`);
  if (!meter) return;
  const rnd = 40 + Math.random() * 55;
  meter.style.width = `${rnd}%`;
  setTimeout(() => { meter.style.width = '20%'; }, 150);
}

function toggleMute(stemKey) {
  stemState[stemKey].muted = !stemState[stemKey].muted;
  const ch = document.getElementById(`stem-ch-${stemKey}`);
  const btn = ch.querySelector('.mute-solo-btn:nth-child(1)');
  if (stemState[stemKey].muted) {
    ch.classList.add('muted');
    btn.classList.add('active-mute');
  } else {
    ch.classList.remove('muted');
    btn.classList.remove('active-mute');
  }
}

function toggleSolo(stemKey) {
  stemState[stemKey].solo = !stemState[stemKey].solo;
  const ch = document.getElementById(`stem-ch-${stemKey}`);
  const btn = ch.querySelector('.mute-solo-btn:nth-child(2)');
  if (stemState[stemKey].solo) {
    ch.classList.add('solo');
    btn.classList.add('active-solo');
  } else {
    ch.classList.remove('solo');
    btn.classList.remove('active-solo');
  }
}

/* --------------------------------------------------------------------------
   16. DOWNLOADS & REVISIONS
   -------------------------------------------------------------------------- */
function downloadAllStems() {
  alert("Preparing archive: TT_MidnightCity_24bit_Stems.zip\nUncompressed 24-bit 48kHz WAV stems download initiated.");
}

function fakeDownload(fileName) {
  alert(`Downloading file: ${fileName}`);
}

function requestRevisionModal() {
  const note = prompt("Please describe desired stem adjustments (e.g. higher synth lead volume, alternate key transposition):");
  if (note) {
    alert(`Revision ticket created with TuneTrack QC Engineers:\n"${note}"\nEstimated revision turnaround: 12-24 hours.`);
  }
}

function downloadInvoicePDF() {
  alert(`TuneTrack Studio Invoice & Certificate of Master Ownership generated.`);
}

function startNewCustomOrder() {
  selectedService = null;
  priorityDelivery = false;
  document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
  goToStep('service');
  syncPricingUI();
}

function onBottomBarAction() {
  if (currentStep === 'service') {
    if (!selectedService) {
      alert("Please select a service option to begin.");
      return;
    }
    proceedToForm();
  } else if (currentStep === 'form') {
    proceedToReview();
  }
}

function togglePriceBreakdownModal() {
  const modal = document.getElementById('breakdownModal');
  if (modal) modal.classList.toggle('open');
}

function openOrderLookupModal() {
  const modal = document.getElementById('lookupModal');
  if (modal) modal.classList.add('open');
}

function closeOrderLookupModal() {
  const modal = document.getElementById('lookupModal');
  if (modal) modal.classList.remove('open');
}

function performOrderLookup() {
  const key = document.getElementById('lookupKeyInput').value.trim().toUpperCase();
  if (!key) return;

  FirebaseAdapter.getOrder(key).then(order => {
    if (order) {
      currentOrder = order;
      closeOrderLookupModal();
      if (order.status === 'finished') {
        goToStep('finished');
      } else {
        renderActiveOrderView(order);
        goToStep('active');
      }
    } else if (key === 'TT-8F72KQ91' || key === 'TT-P72LM4XA') {
      loadSampleOrder(key);
    } else {
      alert(`Order key "${key}" not found in current session.`);
    }
  });
}

function loadSampleOrder(key) {
  closeOrderLookupModal();
  if (key === 'TT-8F72KQ91') {
    currentOrder = {
      uid: "usr_tune_981a2",
      orderId: "ord_sample_8f72",
      publicOrderKey: "TT-8F72KQ91",
      type: "sequencer",
      songs: [{
        title: "Gratitude (Live Intro)",
        artist: "Brandon Lake",
        duration: "09:00",
        durationMinutes: 9,
        extraTimeCost: 45000,
        referenceUrl: "https://youtu.be/sample",
        attachmentName: "gratitude_sample.wav"
      }],
      pricing: {
        base: 75000,
        extraTime: 45000,
        priority: 50000,
        total: 170000
      },
      priorityDelivery: true,
      paymentStatus: "paid",
      status: "processing",
      createdAt: new Date().toISOString()
    };
    renderActiveOrderView(currentOrder);
    goToStep('active');
  } else if (key === 'TT-P72LM4XA') {
    currentOrder = {
      uid: "usr_tune_981a2",
      orderId: "ord_sample_p72",
      publicOrderKey: "TT-P72LM4XA",
      type: "multitrack",
      songs: [{
        title: "Midnight City",
        artist: "M83",
        duration: "08:30",
        durationMinutes: 8,
        extraTimeCost: 35000,
        referenceUrl: "https://youtu.be/dX3k_QDnzHE",
        attachmentName: "midnight_city_master_ref.wav"
      }],
      pricing: {
        base: 125000,
        extraTime: 35000,
        priority: 0,
        total: 160000
      },
      priorityDelivery: false,
      paymentStatus: "paid",
      status: "finished",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    };
    goToStep('finished');
  }
}

/* ==========================================================================
   17. FIREBASE INTEGRATION MODULE & PLACEHOLDERS (FOR DEVELOPMENT TEAM)
   ========================================================================== */

/**
 * FIREBASE CONFIGURATION PLACEHOLDER
 * Your team should replace these credentials with your actual Firebase project settings:
 * In the Firebase Console: Project Settings > General > Your Apps > Web App > Config
 */
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "tunetrack-production.firebaseapp.com",
  projectId: "tunetrack-production",
  storageBucket: "tunetrack-production.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

/**
 * Universal Firebase Adapter
 * Seamlessly talks to Firestore / Realtime Database, with automated fallback
 * to localStorage for offline development and local preview.
 */
const FirebaseAdapter = {
  db: null,
  auth: null,
  isInitialized: false,

  /**
   * Initializes Firebase SDK when loaded via CDN or module bundler
   */
  init() {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.firestore ? firebase.firestore() : null;
        this.auth = firebase.auth ? firebase.auth() : null;
        this.isInitialized = true;
        console.log("TuneTrack: Firebase successfully connected.");
      } catch (err) {
        console.warn("TuneTrack: Firebase initialization failed, falling back to local adapter.", err);
      }
    } else {
      console.log("TuneTrack: Firebase SDK not detected on window. Running in local storage fallback mode.");
    }
  },

  /**
   * Returns current authenticated user UID
   */
  getCurrentUserId() {
    if (this.auth && this.auth.currentUser) {
      return this.auth.currentUser.uid;
    }
    return "usr_tune_981a2"; // Default mock artist session
  },

  /**
   * Saves or freezes an order in Firestore under `orders/{orderId}`
   * and links it under `users/{uid}/orders/{orderId}`.
   *
   * @param {Object} orderData
   * @returns {Promise<Object>}
   */
  async saveOrder(orderData) {
    // 1. Always update local storage for immediate responsiveness
    try {
      let orders = JSON.parse(localStorage.getItem('tunetrack_orders') || '{}');
      orders[orderData.publicOrderKey] = orderData;
      localStorage.setItem('tunetrack_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn("Storage write fallback error", e);
    }

    // 2. If Firestore is connected, persist to remote cloud
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection("orders").doc(orderData.orderId).set({
          ...orderData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Optional: index public order key in a lookup collection
        await this.db.collection("publicOrderKeys").doc(orderData.publicOrderKey).set({
          orderId: orderData.orderId,
          uid: orderData.uid,
          status: orderData.status,
          createdAt: orderData.createdAt
        });

        console.log(`TuneTrack: Order ${orderData.publicOrderKey} saved to Firestore.`);
      } catch (err) {
        console.error("Firebase Firestore Write Error:", err);
      }
    }

    return orderData;
  },

  /**
   * Retrieves an order by its Public Order Key (e.g. TT-8F72KQ91)
   *
   * @param {string} publicOrderKey
   * @returns {Promise<Object|null>}
   */
  async getOrder(publicOrderKey) {
    // Check Firestore if available
    if (this.isInitialized && this.db) {
      try {
        const querySnapshot = await this.db.collection("orders")
          .where("publicOrderKey", "==", publicOrderKey)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data();
        }
      } catch (err) {
        console.warn("Firestore lookup failed, querying local cache:", err);
      }
    }

    // Fallback to local storage
    try {
      let orders = JSON.parse(localStorage.getItem('tunetrack_orders') || '{}');
      return orders[publicOrderKey] || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Updates order status (e.g. when payment succeeds via Lynk webhook)
   *
   * @param {string} publicOrderKey
   * @param {string} paymentStatus 'unpaid' | 'paid'
   * @param {string} status 'pending_payment' | 'processing' | 'finished'
   */
  async updateStatus(publicOrderKey, paymentStatus, status) {
    const order = await this.getOrder(publicOrderKey);
    if (!order) return null;

    order.paymentStatus = paymentStatus;
    order.status = status;
    return this.saveOrder(order);
  }
};

/* --------------------------------------------------------------------------
   18. INITIALIZATION & URL PARAMETER BRIDGE
   -------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Firebase Adapter
  FirebaseAdapter.init();

  // Handle return bridges with query parameters (?order=TT-8F72KQ91&status=paid)
  const urlParams = new URLSearchParams(window.location.search);
  const paramOrder = urlParams.get('order');
  const paramStatus = urlParams.get('status');

  if (paramOrder) {
    FirebaseAdapter.getOrder(paramOrder).then(stored => {
      if (stored) {
        currentOrder = stored;
        if (paramStatus === 'paid') {
          currentOrder.paymentStatus = 'paid';
          currentOrder.status = 'processing';
          FirebaseAdapter.saveOrder(currentOrder);
        }
        if (currentOrder.status === 'finished') {
          goToStep('finished');
        } else {
          renderActiveOrderView(currentOrder);
          goToStep('active');
        }
      }
    });
    return;
  }

  // Default initial odometer setup
  updateAllOdometers(0);
  goToStep('service');
});