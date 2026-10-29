# Potter's Global Prayer Ministry (PGPM)
> **"Shaped by Fire. Molded in Prayer."** — Jeremiah 18:1-6

An Awwwards-caliber, high-performance web experience designed for **Potter's Global Prayer Ministry**. Crafted with editorial typography, tactile micro-interactions, an interactive 3D particle lathe ("The Potter's Wheel"), real-time service countdown synchronization for **Mondays & Fridays**, and a pure Web Audio API ambient sanctuary pad.

---

## ✦ Key Architectural & Design Highlights

### 1. The Two Consecrated Service Days
- **Every Monday — The Covenant Altar & Early Dew**:
  - *Session I (Early Dew)*: `06:00 UTC` — Morning glory, commanding the week, divine favor in marketplace & ministry.
  - *Session II (Breakthrough Altar)*: `19:00 UTC` — Targeted deliverance from stagnation, financial chains, and career delays.
- **Every Friday — Upper Room Prophetic Fire Vigil**:
  - *Midnight Watch*: `21:00 UTC` — High-voltage intercession, deliverance from ancestral bondage, prophetic decrees, and Holy Ghost renewal.

### 2. Awwwards-Grade Design System
- **Color Palette**: Raw Terracotta (`#C86446`), Kiln Clay (`#DF7A5C`), Sacred Gold (`#D4AF37`), Sand Cream (`#FAF7F2`), and Deep Obsidian (`#08080A`).
- **Typography Matrix**:
  - Display & Headings: *Cormorant Garamond* (Sacred editorial serif) & *Syne* (Modern geometric brutalist).
  - Body & UI: *Plus Jakarta Sans*.
  - Telemetry & Service Times: *Space Mono*.
- **Atmosphere & Textures**:
  - SVG fractal noise shader for organic film grain.
  - Custom magnetic cursor with trailing lerp physics and interactive element states.
  - Smooth scroll progress bar with gradient glow.

### 3. Interactive Web Experiences
- **The Potter's Wheel (Canvas 2D/3D Simulation)**:
  - An interactive isometric clay vase lathe that dynamically morphs and sculpts in response to mouse / touch movement, accompanied by floating celestial embers and Jeremiah 18:4 scriptures.
- **Dynamic Service Engine (`app.js`)**:
  - Calculates real-time countdown to the nearest upcoming Monday or Friday assembly across global timezones.
  - Detects active services (with live pulse indicator).
  - 1-click **Add to Google Calendar** and **Download `.ics`** for Apple Calendar & Outlook.
- **Live Intercession & Prayer Wall**:
  - Filter by burdens: `Breakthrough`, `Healing`, `Deliverance`, `Family`.
  - "Amen / Agreement" counter with haptic particle burst feedback.
  - Modal prayer petition submission with instant `localStorage` persistence.
- **Atmosphere of Prayer (Web Audio API Synthesizer)**:
  - Synthesizes ethereal 432Hz meditative chord progressions (D minor / F major / Bb / C modal harmonies) in real-time.
  - Zero external MP3 network dependencies.
  - Live animated audio visualizer bar.

---

## ✦ File Structure

```
potters-global-prayer-ministry/
├── index.html          # Semantic HTML5 architecture with OpenGraph & meta
├── css/
│   └── style.css       # Design tokens, custom cursor, glassmorphism, animations
├── js/
│   ├── app.js          # Countdown logic, calendar export, canvas wheel, prayer wall
│   └── audio.js        # Web Audio API ambient sanctuary pad synthesizer
├── assets/
│   └── favicon.svg     # Sacred clay vessel SVG mark
└── README.md           # Engineering documentation
```

---

## ✦ How to Run Locally

You can run this project with Python's built-in web server or simply open `index.html` in any modern web browser:

```powershell
cd "C:\Users\Protocol Ike\.gemini\antigravity\scratch\potters-global-prayer-ministry"
python -m http.server 3000
```

Then visit:
```
http://localhost:3000
```
