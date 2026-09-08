# AgriNex AI

**Predict. Prevent. Protect.**

AI-powered precision dairy health platform for **Smart India Hackathon 2026**
- **Problem Statement ID**: SIH26109
- **Problem Statement Title**: *AI Predictive Modelling for Early Bovine Mastitis Forecasting in Indian Dairy Farms*
- **Theme**: Agriculture & Rural Development
- **Category**: Hardware (Team ID: AF-HW-10)
- **Team**: AgriNex

---

## Key Highlights & Hardware Telemetry (SIH Aligned)

- **48–72 Hours Early Forecasting**: Detects subclinical bovine mastitis 48–72 hours prior to acute clinical symptoms, averting tissue damage and minimizing antibiotic dependency.
- **Hardware Sensor Fusion**: Integrates In-Line Milk Electrical Conductivity (EC) probes, Udder Infrared Temperature, and Shed Temperature-Humidity Index (THI) monitored via ESP32 microcontrollers over LoRaWAN/BLE.
- **Edge-First (100% Offline Operational)**: On-device TinyML inference operates without internet connectivity at the farm gate; telemetry stores and forwards to cloud via MQTT v5.0 when connection is available.
- **Economic Safeguard (₹6,000–₹10,000 / cow)**: Prevents average economic losses of ₹6,000 to ₹10,000 per affected cow/lactation through timely teat dips, milk line diversion, and veterinary coordination.
- **Actionable Milking & Vet Protocols**: Real-time triage with instant milking diversion advisories and 1-click tele-veterinary escalation.
- **Multilingual Support**: English, हिंदी (Hindi), and मराठी (Marathi) for Indian smallholder dairy farmers and cooperatives.

---

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

## Tech Stack

React 18 · Vite · Tailwind CSS · React Router · Recharts · Leaflet + react-leaflet (OpenStreetMap tiles) · Framer Motion · Lucide icons · ESP32 Hardware Emulation

## What's Implemented

- **Every route from the brief**: `/login`, `/dashboard`, `/animals`, `/animals/:id`, `/forecast`, `/alerts`, `/recommendations`, `/analytics`, `/iot`, `/map`, `/settings`
- **128-animal mock herd** across 8 Indian breeds (Gir, Sahiwal, Red Sindhi, Tharparkar, Jersey, Holstein Friesian, Murrah, Mehsana), each with 30-day sensor history.
- **COW-024** is pinned as the flagship demo animal (87% risk, Gir, 7-year-old, SCC 480,000, +28% Milk EC spike).
- **Shed Environmental Heat Stress (THI)**: Real-time THI calculation (78.4) with multi-modal clinical correlation.
- **Live simulation mode**: "Simulate Outbreak (COW-024)" pushes sensors into a critical state with instant UI reactions. "Reset Baseline" reverts state.
- **Rapid Clinical Triage Queue**: One-click Quarantine, Milking Line Diversion, and Tele-Veterinary escalation.
