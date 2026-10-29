/**
 * Potter's Global Prayer Ministry (PGPM) - Core Application Script
 * Architecture: Zero-dependency, High-performance Vanilla JS
 * Meets Awwwards-level interaction and craft standards.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initServiceCountdown();
  initPotterWheelCanvas();
  initPrayerWall();
  initAudioControls();
  initScrollEffects();
  initTimeZoneSelector();
});

/* ==========================================================================
   1. CUSTOM MAGNETIC CURSOR
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const follower = document.querySelector('.cursor-follower');
  if (!dot || !follower) return;

  // Hide if touch device
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    dot.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  // Lerp smoothing loop for cursor follower
  function renderCursor() {
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states for links & interactive elements
  const interactives = document.querySelectorAll('a, button, input, textarea, select, .interactive-hover');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}

/* ==========================================================================
   2. SERVICE COUNTDOWN ENGINE (MONDAYS & FRIDAYS)
   ========================================================================== */
/**
 * Recurring Service Times (UTC):
 * - Monday Service 1: 06:00 UTC (Early Dew & Consecration)
 * - Monday Service 2: 19:00 UTC (Covenant Breakthrough & Mercy Altar)
 * - Friday Service:   21:00 UTC (The Upper Room Fire & Prophetic Night Vigil)
 */
const SERVICES = [
  {
    day: 1, // Monday
    hour: 6,
    minute: 0,
    durationHours: 1.5,
    title: 'Monday Early Dew & Consecration',
    code: 'MON-AM',
    focus: 'Consecrating the week, divine wisdom & morning favor'
  },
  {
    day: 1, // Monday
    hour: 19,
    minute: 0,
    durationHours: 2.0,
    title: 'Monday Altar of Breakthrough & Mercy',
    code: 'MON-PM',
    focus: 'Breaking yoke of delay, financial & spiritual open doors'
  },
  {
    day: 5, // Friday
    hour: 21,
    minute: 0,
    durationHours: 3.0,
    title: 'Friday Upper Room Fire & Prophetic Vigil',
    code: 'FRI-VIGIL',
    focus: 'Deep warfare intercession, deliverance & prophetic decrees'
  }
];

function getNextService(referenceDate = new Date()) {
  const currentUTC = new Date(referenceDate.getTime());
  
  // Create instances for this week and next week
  let candidates = [];

  for (let weekOffset = 0; weekOffset <= 1; weekOffset++) {
    for (const s of SERVICES) {
      const d = new Date(Date.UTC(
        currentUTC.getUTCFullYear(),
        currentUTC.getUTCMonth(),
        currentUTC.getUTCDate(),
        s.hour,
        s.minute,
        0,
        0
      ));

      // Calculate how many days to add to reach target day of week
      const currentDay = currentUTC.getUTCDay();
      let diffDays = s.day - currentDay + (weekOffset * 7);
      
      d.setUTCDate(d.getUTCDate() + diffDays);

      const startTime = d.getTime();
      const endTime = startTime + (s.durationHours * 60 * 60 * 1000);

      candidates.push({
        ...s,
        startDate: d,
        startTime,
        endTime
      });
    }
  }

  // Check if any service is actively happening right now
  const nowMs = currentUTC.getTime();
  const liveService = candidates.find(c => nowMs >= c.startTime && nowMs <= c.endTime);

  if (liveService) {
    return {
      isLive: true,
      service: liveService,
      remainingMs: liveService.endTime - nowMs
    };
  }

  // Find the earliest upcoming service
  const upcoming = candidates
    .filter(c => c.startTime > nowMs)
    .sort((a, b) => a.startTime - b.startTime)[0];

  return {
    isLive: false,
    service: upcoming,
    remainingMs: upcoming.startTime - nowMs
  };
}

function initServiceCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');
  const liveBadge = document.getElementById('live-indicator-badge');
  const nextServiceNameEl = document.getElementById('next-service-name');
  const nextServiceTimeEl = document.getElementById('next-service-time');
  const heroLiveAlert = document.getElementById('hero-live-alert');

  function update() {
    const status = getNextService();
    const { isLive, service, remainingMs } = status;

    if (nextServiceNameEl) {
      nextServiceNameEl.textContent = service.title;
    }

    if (nextServiceTimeEl) {
      // Format time in user's local timezone
      const localTime = new Date(service.startTime).toLocaleString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      nextServiceTimeEl.textContent = `${localTime} (${service.hour.toString().padStart(2, '0')}:${service.minute.toString().padStart(2, '0')} UTC)`;
    }

    if (isLive) {
      if (liveBadge) liveBadge.classList.remove('hidden');
      if (heroLiveAlert) heroLiveAlert.classList.remove('hidden');
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    } else {
      if (liveBadge) liveBadge.classList.add('hidden');
      if (heroLiveAlert) heroLiveAlert.classList.add('hidden');
    }

    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    if (daysEl) daysEl.textContent = d.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
    if (minsEl) minsEl.textContent = m.toString().padStart(2, '0');
    if (secsEl) secsEl.textContent = s.toString().padStart(2, '0');
  }

  update();
  setInterval(update, 1000);

  // Setup Calendar Export Buttons
  const calBtnIcs = document.getElementById('btn-download-ics');
  const calBtnGoogle = document.getElementById('btn-google-cal');

  if (calBtnIcs) {
    calBtnIcs.addEventListener('click', generateICSFile);
  }
  if (calBtnGoogle) {
    calBtnGoogle.addEventListener('click', () => {
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Potter's+Global+Prayer+Ministry+(Monday+%26+Friday)&details=Join+the+global+prayer+altar+every+Monday+(Breakthrough+%26+Mercy)+and+Friday+(Prophetic+Fire+Vigil).&recur=RRULE:FREQ=WEEKLY;BYDAY=MO,FR`;
      window.open(gcalUrl, '_blank');
    });
  }
}

function generateICSFile() {
  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Potters Global Prayer Ministry//Global Gatherings//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:pgpm-monday-${Date.now()}@pottersministry.org
DTSTART:20261102T190000Z
DTEND:20261102T210000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
SUMMARY:Potter's Ministry - Monday Altar of Breakthrough & Mercy
DESCRIPTION:Global intercession and breakthrough prayers every Monday. Jeremiah 18:1-6.
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:pgpm-friday-${Date.now()}@pottersministry.org
DTSTART:20261106T210000Z
DTEND:20261107T000000Z
RRULE:FREQ=WEEKLY;BYDAY=FR
SUMMARY:Potter's Ministry - Friday Upper Room Prophetic Vigil
DESCRIPTION:Worldwide night vigil of prophetic fire, deliverance, and spiritual warfare.
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'potters-prayer-gatherings.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   3. THE POTTER'S WHEEL - INTERACTIVE 3D PARTICULATE CANVAS
   ========================================================================== */
function initPotterWheelCanvas() {
  const canvas = document.getElementById('potterWheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = canvas.parentElement.clientWidth;
  let height = canvas.height = canvas.parentElement.clientHeight || 520;

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight || 520;
  });

  // State of the clay vase lathe
  let angle = 0;
  let mouseProximity = 0;
  let mouseYPercent = 0.5;
  let targetWaist = 70;
  let currentWaist = 70;
  let isInteracting = false;

  // Clay slices defining the vase contour
  const sliceCount = 36;
  const slices = [];
  for (let i = 0; i < sliceCount; i++) {
    slices.push({
      baseR: 85 + Math.sin(i / 4) * 25,
      r: 85,
      y: (i / sliceCount) * 280 - 140
    });
  }

  // Glowing clay embers floating off wheel
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 260,
      z: (Math.random() - 0.5) * 160,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 1.5 - 0.5,
      vz: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.8 + 0.2
    });
  }

  // Pointer event handlers
  function handlePointer(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const py = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    // Proximity to center
    const dx = px - width / 2;
    const dy = py - height / 2;
    mouseProximity = Math.max(0, 1 - Math.hypot(dx, dy) / (width * 0.4));
    mouseYPercent = Math.max(0, Math.min(1, py / height));
    targetWaist = 35 + (mouseYPercent * 80);
    isInteracting = true;
  }

  canvas.addEventListener('mousemove', handlePointer);
  canvas.addEventListener('touchmove', handlePointer, { passive: true });
  canvas.addEventListener('mouseleave', () => {
    isInteracting = false;
    targetWaist = 70;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    angle += 0.025;
    currentWaist += (targetWaist - currentWaist) * 0.08;

    const centerX = width / 2;
    const centerY = height / 2 + 20;

    // Draw Wheel Base (The Potter's Spinning Disc)
    ctx.save();
    ctx.translate(centerX, centerY + 160);
    ctx.scale(1, 0.35);

    // Glowing base rim
    const gradBase = ctx.createRadialGradient(0, 0, 10, 0, 0, 190);
    gradBase.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
    gradBase.addColorStop(0.7, 'rgba(200, 100, 70, 0.2)');
    gradBase.addColorStop(1, 'rgba(10, 10, 12, 0)');
    ctx.fillStyle = gradBase;
    ctx.beginPath();
    ctx.arc(0, 0, 190, 0, Math.PI * 2);
    ctx.fill();

    // Wheel Stone Plate
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Draw clay rings forming the vessel
    for (let i = 0; i < sliceCount; i++) {
      const slice = slices[i];
      const normY = i / sliceCount; // 0 (top rim) to 1 (base)
      
      // Morph shape dynamically according to user molding
      const deform = Math.sin(normY * Math.PI) * (currentWaist - 50);
      const neckFactor = Math.pow(Math.sin(normY * Math.PI * 0.8), 2);
      const currentRadius = Math.max(18, slice.baseR + deform * neckFactor);

      const yPos = centerY + slice.y;

      ctx.save();
      ctx.translate(centerX, yPos);
      ctx.scale(1, 0.32); // Isometric compression

      // Color gradation from warm burnt terracotta to sacred gold highlights
      const highlight = Math.sin(angle + normY * 5) * 0.25 + 0.75;
      const rVal = Math.floor(200 * highlight);
      const gVal = Math.floor(100 * highlight);
      const bVal = Math.floor(70 * highlight);

      ctx.strokeStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${0.45 + (1 - normY) * 0.35})`;
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Interior golden spiritual core
      if (i % 4 === 0) {
        ctx.fillStyle = `rgba(212, 175, 55, 0.12)`;
        ctx.fill();
      }

      ctx.restore();
    }

    // Render floating celestial embers
    particles.forEach(p => {
      p.y += p.vy;
      p.x += Math.sin(angle * 2 + p.y * 0.05) * 0.8;
      
      if (p.y < -180) {
        p.y = 150;
        p.x = (Math.random() - 0.5) * 120;
      }

      const drawX = centerX + p.x;
      const drawY = centerY + p.y;

      ctx.fillStyle = `rgba(229, 192, 123, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   4. INTERACTIVE PRAYER WALL & INTERCESSION ENGINE
   ========================================================================== */
const INITIAL_PRAYERS = [
  {
    id: 1,
    name: 'Sister Deborah A.',
    location: 'London, UK',
    category: 'BREAKTHROUGH',
    date: '2 hours ago',
    text: 'Praying for divine financial breakthrough and job promotion this Monday altar. Believing God that every closed door swings open in Jesus’ name!',
    count: 142
  },
  {
    id: 2,
    name: 'Pastor Emmanuel O.',
    location: 'Lagos, Nigeria',
    category: 'DELIVERANCE',
    date: '4 hours ago',
    text: 'Standing in the gap for my family members facing cyclical delay and health afflictions. We tap into the Friday prophetic fire vigil for supernatural deliverance.',
    count: 289
  },
  {
    id: 3,
    name: 'Grace M.',
    location: 'Atlanta, USA',
    category: 'HEALING',
    date: 'Yesterday',
    text: 'Doctors report showed a critical diagnosis last week. I lift this report up before the Potter who created my bones and organs. Complete supernatural healing!',
    count: 318
  },
  {
    id: 4,
    name: 'Brother Samuel T.',
    location: 'Nairobi, Kenya',
    category: 'FAMILY & RESTORATION',
    date: '2 days ago',
    text: 'Lifting up my marriage and children’s spiritual walk. Praying for total reconciliation and revival in our home before this upcoming Friday prayer watch.',
    count: 97
  }
];

function initPrayerWall() {
  const container = document.getElementById('prayer-cards-container');
  const modal = document.getElementById('prayer-modal');
  const openBtn = document.getElementById('btn-open-prayer-modal');
  const closeBtn = document.getElementById('btn-close-prayer-modal');
  const form = document.getElementById('prayer-submission-form');
  const filterButtons = document.querySelectorAll('.filter-tag-btn');

  // Load from localStorage or seed
  let prayers = [];
  try {
    const cached = localStorage.getItem('pgpm_prayers');
    prayers = cached ? JSON.parse(cached) : INITIAL_PRAYERS;
  } catch(e) {
    prayers = INITIAL_PRAYERS;
  }

  let activeFilter = 'ALL';

  function renderCards() {
    if (!container) return;
    container.innerHTML = '';

    const filtered = activeFilter === 'ALL' 
      ? prayers 
      : prayers.filter(p => p.category.toLowerCase().includes(activeFilter.toLowerCase()));

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'glass-panel p-6 rounded-2xl relative flex flex-col justify-between border border-white/10 hover:border-amber-500/40 transition-all duration-300';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              ${p.category}
            </span>
            <span class="text-xs text-neutral-400 font-mono">${p.date}</span>
          </div>
          <p class="text-base text-neutral-200 font-light leading-relaxed mb-6 italic">
            "${p.text}"
          </p>
        </div>
        <div class="pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <h4 class="text-sm font-semibold text-sand-cream">${p.name}</h4>
            <span class="text-xs text-neutral-500 font-mono">${p.location}</span>
          </div>
          <button class="btn-agree-prayer flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-amber-600/30 text-xs font-mono text-amber-200 border border-amber-500/30 transition-all" data-id="${p.id}">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.527.82-1.173 1.55-1.927 2.18-.756.63-1.614 1.15-2.54 1.54C4.73 7.544 4 8.65 4 10a6 6 0 0012 0c0-1.077-.42-2.112-1.172-2.885-.503-.518-1.107-.946-1.77-1.266-.34-.165-.623-.393-.663-.696z"/>
            </svg>
            <span>Amen (<span class="agree-count">${p.count}</span>)</span>
          </button>
        </div>
      `;

      // Event listener for Agree button
      const agreeBtn = card.querySelector('.btn-agree-prayer');
      agreeBtn.addEventListener('click', (e) => {
        p.count++;
        agreeBtn.querySelector('.agree-count').textContent = p.count;
        agreeBtn.classList.add('bg-amber-500/40', 'text-white');
        
        // Spawn floating ember effect
        spawnEmber(e.clientX, e.clientY);
        
        try {
          localStorage.setItem('pgpm_prayers', JSON.stringify(prayers));
        } catch(err) {}
      });

      container.appendChild(card);
    });
  }

  renderCards();

  // Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active', 'bg-amber-500', 'text-black'));
      btn.classList.add('active', 'bg-amber-500', 'text-black');
      activeFilter = btn.dataset.filter || 'ALL';
      renderCards();
    });
  });

  // Modal open/close
  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // Handle Prayer Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-prayer-name').value.trim() || 'Anonymous Vessel';
      const location = document.getElementById('input-prayer-location').value.trim() || 'Global Sanctuary';
      const category = document.getElementById('input-prayer-category').value;
      const text = document.getElementById('input-prayer-text').value.trim();

      if (!text) return;

      const newPrayer = {
        id: Date.now(),
        name,
        location,
        category,
        date: 'Just now',
        text,
        count: 1
      };

      prayers.unshift(newPrayer);
      try {
        localStorage.setItem('pgpm_prayers', JSON.stringify(prayers));
      } catch(err) {}

      renderCards();
      form.reset();
      if (modal) modal.classList.remove('active');

      // Show toast notification
      showToast('Your prayer burden has been laid upon the Global Altar.');
    });
  }
}

function spawnEmber(x, y) {
  const ember = document.createElement('div');
  ember.style.position = 'fixed';
  ember.style.left = `${x}px`;
  ember.style.top = `${y}px`;
  ember.style.width = '6px';
  ember.style.height = '6px';
  ember.style.backgroundColor = '#f59e0b';
  ember.style.borderRadius = '50%';
  ember.style.pointerEvents = 'none';
  ember.style.zIndex = '99999';
  ember.style.boxShadow = '0 0 12px #f59e0b';
  ember.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
  document.body.appendChild(ember);

  requestAnimationFrame(() => {
    ember.style.transform = `translate(${(Math.random() - 0.5) * 60}px, -70px) scale(0)`;
    ember.style.opacity = '0';
  });

  setTimeout(() => ember.remove(), 1050);
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-8 right-8 z-50 glass-panel-gold px-6 py-4 rounded-xl text-sm font-sans text-amber-200 shadow-2xl border border-amber-500/40 flex items-center gap-3 transition-all duration-300';
  toast.innerHTML = `
    <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
    <span>${msg}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

/* ==========================================================================
   5. AUDIO AMBIENT SANCTUARY CONTROLS
   ========================================================================== */
function initAudioControls() {
  const toggleBtn = document.getElementById('btn-audio-toggle');
  const soundBars = document.getElementById('sound-visualizer');
  const label = document.getElementById('audio-status-label');

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!window.sanctuaryAudio) return;
    const isPlaying = window.sanctuaryAudio.toggle();

    if (isPlaying) {
      if (soundBars) soundBars.classList.remove('sound-paused');
      if (label) label.textContent = 'Atmosphere: 432Hz Ambient (Active)';
      toggleBtn.classList.add('border-amber-400');
    } else {
      if (soundBars) soundBars.classList.add('sound-paused');
      if (label) label.textContent = 'Atmosphere: Meditative Pad (Muted)';
      toggleBtn.classList.remove('border-amber-400');
    }
  });
}

/* ==========================================================================
   6. SCROLL REVEAL & INTERSECTIONS
   ========================================================================== */
function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

  // Scroll Progress Bar
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalH > 0 ? (window.scrollY / totalH) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    });
  }
}

/* ==========================================================================
   7. TIMEZONE SELECTOR
   ========================================================================== */
function initTimeZoneSelector() {
  const tzSelect = document.getElementById('timezone-select');
  if (!tzSelect) return;

  // Detect local timezone
  try {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const opt = document.createElement('option');
    opt.value = 'local';
    opt.textContent = `Auto Local: ${userTz}`;
    opt.selected = true;
    tzSelect.prepend(opt);
  } catch(e) {}
}
