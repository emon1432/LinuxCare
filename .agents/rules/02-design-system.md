# LinuxCare Design System & UI Guardrails

## Core Invariant: Strict Theme Lock
- **Visual Identity:** Dark Cyberpunk / Neon Technical Cockpit.
- **Palette (Tailwind CSS):**
  - Space Background: `#0c0f24`
  - Card & Panel Background: `#131738` / `#111538`
  - Neon Cyan Accent: `#00f5d4` (glow effect: `shadow-neon-cyan`)
  - Electric Sky Blue: `#38bdf8` (glow effect: `shadow-neon-blue`)
  - Cyber Purple / Indigo: `#7c3aed` / `#6366f1`
  - Emerald Green: `#10b981`
  - Alert Pink: `#f43f5e`
- **UI Elements:**
  - Circular SVG Gauges (`CircularGauge.jsx`) with glowing progress drop-shadows.
  - Cubic-bezier spline charts (`WaveChart.jsx`) for live hardware load stream.
  - Connected Storage Drive cards (`StorageBar.jsx`) with SSD/HDD badges and mount points.
  - Glassmorphic card styling (`cyber-card`) with subtle blur and neon hover borders.
- **Prohibition:**
  - **NEVER** revert to plain light mode, generic Bootstrap, or muted gray Tailwind styling.
