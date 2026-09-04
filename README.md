# MastiSense AI

**Predict. Prevent. Protect.**

AI-powered precision dairy health platform — a frontend prototype for SIH 2026, Problem Statement SIH26109: *AI-Based Predictive Modelling for Early Forecasting of Bovine Mastitis in Indian Dairy Farms*.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL. Sign in with **Continue as Demo User** on the login screen (any email/password also works — this is a prototype, not a real auth system).

To build for production / judging deployment:

```bash
npm run build
npm run preview
```

## Tech stack

React 18 · Vite · Tailwind CSS · React Router · Recharts · Leaflet + react-leaflet (OpenStreetMap tiles) · Framer Motion · Lucide icons

## What's implemented

- **Every route from the brief**: `/login`, `/dashboard`, `/animals`, `/animals/:id`, `/forecast`, `/alerts`, `/recommendations`, `/analytics`, `/iot`, `/map`, `/settings`
- **128-animal mock herd** across 8 Indian breeds (Gir, Sahiwal, Red Sindhi, Tharparkar, Jersey, Holstein Friesian, Murrah, Mehsana), each with 30-day sensor history, generated deterministically so the demo dataset is stable across reloads. The herd's risk-tier breakdown (No Risk 78 / Low 31 / Moderate 7 / High 10 / Critical 2) matches the brief exactly.
- **COW-024** is pinned as the flagship demo animal with the exact values from the brief (87% risk, Gir, 7-year-old, SCC 480,000, etc.) and appears throughout — dashboard early warnings, alerts, forecast, recommendations.
- **A transparent, documented risk-scoring function** (`src/utils/riskCalculator.js`) — weighted contributions from SCC, milk-yield change, temperature, activity and rumination, explicitly labelled as a prototype simulation rather than a validated veterinary model, per the brief's disclaimer requirements.
- **Live simulation mode** (IoT page): "Simulate Mastitis Event" pushes COW-024's sensors into a critical state through shared React Context — the dashboard KPIs, herd risk donut, alert list, notification bell and toast all update together, because they all read from the same state. "Reset Simulation" reverts it.
- **Explainable-AI touches**: risk-factor bar charts, a 5-point AI risk timeline (30/14/7 days ago → today → predicted) that visualises the model flagging risk before symptoms appear, and a plain-language "AI interpretation" panel that is explicitly labelled a predictive assessment, not a diagnosis.
- **Multilingual UI shell**: English / हिंदी / मराठी switcher in the header, wired to real string translations for navigation, dashboard labels and risk terms (`src/utils/translations.js`).
- **Fully responsive**: fixed sidebar + header on desktop, hamburger drawer + bottom tab bar on mobile, no horizontal overflow.
- **API layer stub** (`src/services/api.js`): every screen already reads through `getAnimals()`, `getAlerts()`, `getForecast()`, etc. Swapping the bodies of those functions for real `fetch()` calls to a FastAPI backend requires no changes to any component.

## Notes for judges / developers

- All data is generated client-side (`src/data/`) — there is no backend. It's structured so a real backend is a drop-in replacement for `src/services/api.js`.
- Map tiles (OpenStreetMap) and the Google Fonts used for the type system load from the public internet — they'll render normally on any machine with internet access.
- The risk-scoring thresholds (`RISK_BANDS` in `src/utils/riskCalculator.js`) define No Risk/Low/Moderate/High as 0–20/21–40/41–60/61–80 and Critical as 81–100. COW-024's score of 87 is intentionally still labelled "High Risk" throughout the UI, per the brief's explicit instruction to keep the demo animal's designation fixed even though it numerically sits in the 81–100 band.
- Sign-in state lives in memory only (no localStorage), so a hard browser refresh returns you to the login screen — intentional for a judged demo, trivial to swap for persisted auth later.
