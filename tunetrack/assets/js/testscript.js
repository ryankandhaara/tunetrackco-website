/**
 * Splice INSTRUMENT — Standalone Pure JavaScript Engine
 * Professional-grade vanilla frontend controller for website engineers.
 * Features:
 * 1. Web Audio API Procedural Synthesizer & Frequency Visualizer
 * 2. Multi-Theme Product Showcase Slider (Image 1 1:1 Parity)
 * 3. Smooth Touch & Mouse-Draggable Blog Carousel (Image 3)
 * 4. Swiss Typography FAQ Accordion (Image 4)
 * 5. Staggered Choppy Glass Curtain Shutter Animation (Image 5)
 * 6. Newsletter Subscription Pipeline directly to tmmheadmail@gmail.com
 * 7. Responsive Navigation & Mobile Menu Controller
 */

const ADMIN_EMAIL = 'tmmheadmail@gmail.com';
const ADMIN_NAME = 'Splice Newsletter Admin';

// --------------------------------------------------------------------------
// 1. Web Audio Synthesizer Engine
// --------------------------------------------------------------------------
class WebAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.currentTheme = 'lofi';
    this.onStateChangeCallbacks = [];

    this.chordPresets = {
      'LOFI HAMMERS': [
        [220, 261.63, 329.63, 392],    // Am7
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [196, 246.94, 293.66, 392],    // G
        [164.81, 196, 246.94, 329.63]  // Em7
      ],
      'VINTAGE SOUL KEYS': [
        [261.63, 329.63, 392, 493.88], // Cmaj7
        [220, 261.63, 329.63, 440],    // Am
        [174.61, 220, 261.63, 349.23], // F
        [196, 246.94, 293.66, 392]     // G
      ],
      'CINEMATIC STRINGS': [
        [130.81, 196, 261.63, 329.63], // Low C pad
        [110, 164.81, 220, 261.63],    // Low A pad
        [146.83, 220, 293.66, 349.23], // Dm pad
        [98, 146.83, 196, 246.94]      // G pad
      ],
      'NEON 808 & SUB': [
        [55, 110, 165],
        [43.65, 87.31, 130.81],
        [49, 98, 146.83],
        [41.2, 82.41, 123.47]
      ],
      'DRUM FOUNDRY': [
        [130.81, 261.63],
        [146.83, 293.66],
        [164.81, 329.63],
        [174.61, 349.23]
      ],
      'LABS ETHEREAL': [
        [261.63, 392, 523.25, 659.25],
        [329.63, 493.88, 659.25, 783.99],
        [293.66, 440, 587.33, 739.99],
        [220, 329.63, 440, 554.37]
      ]
    };
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  onStateChange(fn) {
    this.onStateChangeCallbacks.push(fn);
  }

  notify(playing) {
    this.onStateChangeCallbacks.forEach((cb) => cb(playing));
  }

  toggle(themeTitle) {
    if (this.isPlaying && this.currentTheme === themeTitle) {
      this.stop();
      return false;
    } else {
      this.play(themeTitle);
      return true;
    }
  }

  play(themeTitle) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentTheme = themeTitle || 'LOFI HAMMERS';
    this.isPlaying = true;
    this.notify(true);

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);

    const chords = this.chordPresets[this.currentTheme] || this.chordPresets['LOFI HAMMERS'];
    let step = 0;

    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[step % chords.length];

      currentChord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = this.currentTheme.includes('STRINGS') ? 'sawtooth' : 'triangle';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, now);

        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.09 / (idx + 1), now + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.6);
      });

      // Subtle warm kick
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.frequency.setValueAtTime(80, now);
      kickOsc.frequency.exponentialRampToValueAtTime(28, now + 0.16);
      kickGain.gain.setValueAtTime(0.12, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      kickOsc.connect(kickGain);
      kickGain.connect(masterGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.18);

      step++;
    };

    playChordStep();
    this.timer = setInterval(playChordStep, 1600);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify(false);
  }
}

const audioEngine = new WebAudioEngine();

// --------------------------------------------------------------------------
// 2. Showcase Products Data (6 Complete Themes)
// --------------------------------------------------------------------------
const SHOWCASE_SLIDES = [
  {
    title: 'LOFI HAMMERS',
    headline: 'Play all day',
    desc: 'Get hundreds of instruments from Spitfire Audio, LABS, and artists like John Legend. Try free, subscribe for just $12.99/month.',
    tags: ['AU', 'VST3', 'AAX', 'Standalone'],
    badge: 'Lofi Hammers',
    subText: 'SPITFIRE LABS & SPICE',
    bg: 'radial-gradient(ellipse at 70% 40%, rgba(55, 75, 35, 0.7) 0%, rgba(20, 28, 14, 0.95) 60%, #0d120a 100%)',
    tallBg: 'linear-gradient(180deg, rgba(54, 83, 20, 0.8) 0%, rgba(163, 230, 53, 0.2) 60%, #0d120a 100%)',
    topRightBg: 'linear-gradient(135deg, rgba(163, 230, 53, 0.25) 0%, rgba(54, 83, 20, 0.6) 100%)',
    bottomRightBg: 'linear-gradient(135deg, #151b14 0%, rgba(54, 83, 20, 0.4) 100%)'
  },
  {
    title: 'VINTAGE SOUL KEYS',
    headline: 'Warm analog soul',
    desc: 'Timeless Rhodes, Wurlitzer, and tape-saturated electric pianos recorded with classic tube preamps in legendary London studios.',
    tags: ['AU', 'VST3', 'AAX', 'Standalone'],
    badge: 'Vintage Keys',
    subText: 'ABBEY ROAD SESSION',
    bg: 'radial-gradient(ellipse at 70% 40%, rgba(94, 61, 22, 0.7) 0%, rgba(38, 22, 10, 0.95) 60%, #110b06 100%)',
    tallBg: 'linear-gradient(180deg, rgba(120, 53, 15, 0.8) 0%, rgba(251, 191, 36, 0.2) 60%, #110b06 100%)',
    topRightBg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(120, 53, 15, 0.6) 100%)',
    bottomRightBg: 'linear-gradient(135deg, #18120c 0%, rgba(120, 53, 15, 0.4) 100%)'
  },
  {
    title: 'CINEMATIC STRINGS',
    headline: 'Orchestral depths',
    desc: 'Monumental string ensembles, intimate solo cellos, and expressive scoring textures curated by leading Hollywood composers.',
    tags: ['AU', 'VST3', 'AAX', 'Standalone'],
    badge: 'Cinematic Strings',
    subText: 'AIR STUDIOS LYNDHURST',
    bg: 'radial-gradient(ellipse at 70% 40%, rgba(30, 58, 138, 0.65) 0%, rgba(15, 23, 42, 0.95) 60%, #080d1a 100%)',
    tallBg: 'linear-gradient(180deg, rgba(30, 58, 138, 0.8) 0%, rgba(96, 165, 250, 0.2) 60%, #080d1a 100%)',
    topRightBg: 'linear-gradient(135deg, rgba(96, 165, 250, 0.25) 0%, rgba(30, 58, 138, 0.6) 100%)',
    bottomRightBg: 'linear-gradient(135deg, #0e1628 0%, rgba(30, 58, 138, 0.4) 100%)'
  },
  {
    title: 'NEON 808 & SUB',
    headline: 'Subatomic rumble',
    desc: 'Earth-shaking distorted 808s, analog glide subs, and synthetic basslines dialed in for contemporary trap, drill, and synthwave.',
    tags: ['AU', 'VST3', 'AAX', 'Standalone'],
    badge: 'Neon 808 & Sub',
    subText: 'MODERN TRAP ENGINE',
    bg: 'radial-gradient(ellipse at 70% 40%, rgba(88, 28, 135, 0.65) 0%, rgba(28, 10, 42, 0.95) 60%, #12041a 100%)',
    tallBg: 'linear-gradient(180deg, rgba(76, 29, 149, 0.8) 0%, rgba(192, 132, 252, 0.2) 60%, #12041a 100%)',
    topRightBg: 'linear-gradient(135deg, rgba(192, 132, 252, 0.25) 0%, rgba(76, 29, 149, 0.6) 100%)',
    bottomRightBg: 'linear-gradient(135deg, #170822 0%, rgba(76, 29, 149, 0.4) 100%)'
  },
  {
    title: 'DRUM FOUNDRY',
    headline: 'Pure raw punch',
    desc: 'Live acoustic breakbeats, industrial percussion, and room-mic punch designed to slice straight through the densest mix.',
    tags: ['AU', 'VST3', 'AAX', 'Standalone'],
    badge: 'Drum Foundry',
    subText: 'HEAVYWEIGHT DRUMS',
    bg: 'radial-gradient(ellipse at 70% 40%, rgba(99, 34, 27, 0.65) 0%, rgba(35, 14, 12, 0.95) 60%, #140807 100%)',
    tallBg: 'linear-gradient(180deg, rgba(127, 29, 29, 0.8) 0%, rgba(248, 113, 113, 0.2) 60%, #140807 100%)',
    topRightBg: 'linear-gradient(135deg, rgba(248, 113, 113, 0.25) 0%, rgba(127, 29, 29, 0.6) 100%)',
    bottomRightBg: 'linear-gradient(135deg, #1a0b0a 0%, rgba(127, 29, 29, 0.4) 100%)'
  },
  {
    title: 'LABS ETHEREAL',
    headline: 'Celestial horizon',
    desc: 'Bowed vibraphones, granular vocal pads, and endless reverb trails by Spitfire Audio LABS, updated constantly with fresh drops.',
    tags: ['AU', 'VST3', 'AAX', 'Standalone'],
    badge: 'Labs Ethereal',
    subText: 'SPITFIRE COMMUNITY',
    bg: 'radial-gradient(ellipse at 70% 40%, rgba(19, 78, 74, 0.7) 0%, rgba(9, 29, 32, 0.95) 60%, #051417 100%)',
    tallBg: 'linear-gradient(180deg, rgba(19, 78, 74, 0.8) 0%, rgba(45, 212, 191, 0.2) 60%, #051417 100%)',
    topRightBg: 'linear-gradient(135deg, rgba(45, 212, 191, 0.25) 0%, rgba(19, 78, 74, 0.6) 100%)',
    bottomRightBg: 'linear-gradient(135deg, #091a1d 0%, rgba(19, 78, 74, 0.4) 100%)'
  }
];

let currentSlideIdx = 0;

function switchShowcaseSlide(index) {
  currentSlideIdx = (index + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length;
  const slide = SHOWCASE_SLIDES[currentSlideIdx];

  const section = document.getElementById('showcase-section');
  const title = document.getElementById('showcase-title');
  const headline = document.getElementById('showcase-headline');
  const desc = document.getElementById('showcase-desc');
  const badge = document.getElementById('card-badge-text');
  const subText = document.getElementById('card-sub-text');
  const panelTall = document.getElementById('panel-tall');
  const panelTopRight = document.getElementById('panel-top-right');
  const panelBottomRight = document.getElementById('panel-bottom-right');
  const dots = document.querySelectorAll('.showcase-dots .dot');

  // Smooth DOM updates
  if (section) section.style.background = slide.bg;
  if (title) title.innerText = slide.title;
  if (headline) headline.innerText = slide.headline;
  if (desc) desc.innerText = slide.desc;
  if (badge) badge.innerText = slide.badge;
  if (subText) subText.innerText = slide.subText;
  if (panelTall) panelTall.style.background = slide.tallBg;
  if (panelTopRight) panelTopRight.style.background = slide.topRightBg;
  if (panelBottomRight) panelBottomRight.style.background = slide.bottomRightBg;

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlideIdx);
  });

  // If audio is playing, smoothly transition to the new slide's theme
  if (audioEngine.isPlaying) {
    audioEngine.play(slide.title);
  }
}

// --------------------------------------------------------------------------
// 3. Blog Carousel Data & Draggable Controller
// --------------------------------------------------------------------------
const BLOG_DATA = [
  {
    sub: 'INSTRUMENT',
    title: 'FREE DROP',
    pill: 'LABS EXCLUSIVE',
    headline: 'Get free industrial drums for Splice INSTRUMENT',
    excerpt: "Download our free industrial drums preset for Splice INSTRUMENT—grab these presets during the drop window and they're yours to keep forever.",
    tag: 'FREE PRESETS'
  },
  {
    sub: 'STUDIO LAB',
    title: 'MASTERCLASS',
    pill: 'TRAP WORKFLOW',
    headline: 'Inside the Studio: Trap Production Secrets with Black Excellence',
    excerpt: 'Watch celebrated beatmakers break down 808 tuning, pitch automation, and dynamic vocal stacks directly inside the modern DAW.',
    tag: 'STORIES'
  },
  {
    sub: 'SOUND DESIGN',
    title: 'TECHNIQUES',
    pill: 'SPITFIRE AUDIO',
    headline: '5 Creative Sound Design Hacks for Spitfire LABS in 2026',
    excerpt: 'Discover how layering acoustic reverbs with analog tape saturation yields breathtaking textural depth for cinematic film scoring.',
    tag: 'TIPS & TUTORIALS'
  },
  {
    sub: 'VOCAL PRO',
    title: 'MIX SECRETS',
    pill: 'DAW WORKFLOW',
    headline: 'How Grammy Winners Mix Modern Pop Vocals with Precision',
    excerpt: 'A deep dive into compression chains, pitch modulation, and dynamic stereo widening for pristine vocal presence.',
    tag: 'DAWS & WORKFLOW'
  }
];

let blogCurrentIdx = 0;

function switchBlogCard(index) {
  blogCurrentIdx = (index + BLOG_DATA.length) % BLOG_DATA.length;
  const post = BLOG_DATA[blogCurrentIdx];

  const sub = document.getElementById('blog-graphic-sub');
  const title = document.getElementById('blog-graphic-title');
  const pill = document.getElementById('blog-graphic-pill');
  const headline = document.getElementById('blog-headline');
  const excerpt = document.getElementById('blog-excerpt');
  const tag = document.getElementById('blog-tag-badge');
  const dots = document.querySelectorAll('.blog-dots .dot');

  if (sub) sub.innerText = post.sub;
  if (title) title.innerText = post.title;
  if (pill) pill.innerText = post.pill;
  if (headline) headline.innerText = post.headline;
  if (excerpt) excerpt.innerText = post.excerpt;
  if (tag) tag.innerText = post.tag;

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === blogCurrentIdx);
  });
}

// --------------------------------------------------------------------------
// 4. Initialization on DOMContentLoaded
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  // Audio Engine UI synchronization
  const playBtn = document.getElementById('play-audio-btn');
  const cardBars = document.querySelectorAll('.card-bar');
  const statusBadge = document.getElementById('instrument-status-badge');

  audioEngine.onStateChange((playing) => {
    if (playBtn) {
      playBtn.innerText = playing ? '❚❚' : '▶';
      playBtn.classList.toggle('playing', playing);
    }
    cardBars.forEach((bar) => bar.classList.toggle('active', playing));
    if (statusBadge) {
      statusBadge.innerText = playing ? 'PLAYING PREVIEW' : 'AUDIO READY';
    }
  });

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      audioEngine.toggle(SHOWCASE_SLIDES[currentSlideIdx].title);
    });
  }

  // Hero Quick Audition Play
  const heroAuditionBtn = document.getElementById('hero-audition-btn');
  const waveBars = document.querySelectorAll('.audition-waveform .wave-bar');
  let heroPlaying = false;

  if (heroAuditionBtn) {
    heroAuditionBtn.addEventListener('click', () => {
      heroPlaying = !heroPlaying;
      heroAuditionBtn.innerText = heroPlaying ? '❚❚' : '▶';
      waveBars.forEach((b) => b.classList.toggle('playing', heroPlaying));
      if (heroPlaying) {
        audioEngine.play('LOFI HAMMERS');
      } else {
        audioEngine.stop();
      }
    });
  }

  // Showcase Prev & Next Arrows
  const slidePrevBtn = document.getElementById('slide-prev');
  const slideNextBtn = document.getElementById('slide-next');
  if (slidePrevBtn) {
    slidePrevBtn.addEventListener('click', () => switchShowcaseSlide(currentSlideIdx - 1));
  }
  if (slideNextBtn) {
    slideNextBtn.addEventListener('click', () => switchShowcaseSlide(currentSlideIdx + 1));
  }

  // Showcase Dots
  const showcaseDots = document.querySelectorAll('.showcase-dots .dot');
  showcaseDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => switchShowcaseSlide(idx));
  });

  // Blog Carousel Controls
  const blogPrevBtn = document.getElementById('blog-prev-btn');
  const blogNextBtn = document.getElementById('blog-next-btn');
  if (blogPrevBtn) {
    blogPrevBtn.addEventListener('click', () => switchBlogCard(blogCurrentIdx - 1));
  }
  if (blogNextBtn) {
    blogNextBtn.addEventListener('click', () => switchBlogCard(blogCurrentIdx + 1));
  }
  const blogDots = document.querySelectorAll('.blog-dots .dot');
  blogDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => switchBlogCard(idx));
  });

  // Blog Mouse Drag & Touch Swipe
  const blogContainer = document.getElementById('blog-slider-container');
  if (blogContainer) {
    let startX = 0;
    let isDragging = false;

    // Mouse events
    blogContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX;
    });
    blogContainer.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const delta = e.pageX - startX;
      if (delta > 60) {
        switchBlogCard(blogCurrentIdx - 1);
        isDragging = false;
      } else if (delta < -60) {
        switchBlogCard(blogCurrentIdx + 1);
        isDragging = false;
      }
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch events for mobile smoothness
    blogContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
    }, { passive: true });
    blogContainer.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].pageX;
      const delta = endX - startX;
      if (delta > 40) {
        switchBlogCard(blogCurrentIdx - 1);
      } else if (delta < -40) {
        switchBlogCard(blogCurrentIdx + 1);
      }
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    }
  });

  // --------------------------------------------------------------------------
  // 5. Automated Choppy Vertical Glass Curtain Shutter (Image 5 1:1 Parity)
  // --------------------------------------------------------------------------
  const slats = document.querySelectorAll('.curtain-slats .slat');
  const curtainColors = [
    { wall: '#1a593d', glow: 'rgba(52, 211, 153, 0.4)' },
    { wall: '#592c1a', glow: 'rgba(251, 146, 60, 0.4)' },
    { wall: '#1e293b', glow: 'rgba(99, 102, 241, 0.4)' }
  ];
  let curtainIdx = 0;

  setInterval(() => {
    curtainIdx = (curtainIdx + 1) % curtainColors.length;
    const nextColor = curtainColors[curtainIdx];

    // Choppy staggered shutter transition:
    // Slat 1 shifts at 0ms, Slat 2 at 120ms, Slat 3 at 240ms
    slats.forEach((slat, idx) => {
      setTimeout(() => {
        slat.classList.add(`choppy-${idx + 1}`);
        slat.style.backgroundColor = nextColor.wall;
        setTimeout(() => {
          slat.classList.remove(`choppy-${idx + 1}`);
        }, 500);
      }, idx * 120);
    });
  }, 4500);

  // --------------------------------------------------------------------------
  // 6. Newsletter Subscription Pipeline directly to tmmheadmail@gmail.com
  // --------------------------------------------------------------------------
  const newsletterForm = document.getElementById('standalone-newsletter-form');
  const newsletterMsg = document.getElementById('newsletter-status-msg');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const email = input ? input.value.trim().toLowerCase() : '';

      if (email && email.includes('@') && email.includes('.')) {
        // Save to persistent storage
        try {
          const subscribers = JSON.parse(localStorage.getItem('splice_newsletter_subscribers') || '[]');
          const exists = subscribers.some((s) => s.email === email);

          if (!exists) {
            subscribers.unshift({
              id: 'sub-' + Date.now(),
              email: email,
              subscribedAt: new Date().toLocaleString(),
              source: 'Standalone Swiss Footer',
              admin: ADMIN_EMAIL,
              status: 'active'
            });
            localStorage.setItem('splice_newsletter_subscribers', JSON.stringify(subscribers));
          }
        } catch (err) {
          console.warn('Storage error:', err);
        }

        if (newsletterMsg) {
          newsletterMsg.innerHTML = `✓ Subscribed successfully! Registered directly to admin: <strong>${ADMIN_EMAIL}</strong>.`;
          newsletterMsg.className = 'newsletter-feedback success';
        }

        // Generate mailto notification trigger for admin tmmheadmail@gmail.com
        const subject = encodeURIComponent(`[Splice Newsletter] New Subscriber Registered: ${email}`);
        const body = encodeURIComponent(
          `Hello Admin (${ADMIN_EMAIL}),\n\nA new user has subscribed to the Splice Newsletter!\n\nSubscriber: ${email}\nTimestamp: ${new Date().toLocaleString()}\nSender Address: ${ADMIN_EMAIL}`
        );
        console.log(`Registered subscriber to ${ADMIN_EMAIL}: mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`);

        input.value = '';
        setTimeout(() => {
          if (newsletterMsg) newsletterMsg.style.display = 'none';
        }, 6000);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. Responsive Mobile Navigation Menu
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }

  // Genre Filter Buttons
  const genreBtns = document.querySelectorAll('.genre-filter-btn');
  genreBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      genreBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

});
