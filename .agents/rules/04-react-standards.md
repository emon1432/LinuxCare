# React & Frontend Engineering Standards (ECC Adapted)

## 1. Modern React 19 & Hooks
- Functional components only with explicit props typing or destructuring.
- Prefer `useCallback` / `useMemo` for expensive computations or callbacks passed to child components.
- Keep components focused and single-responsibility:
  - Gauges and charts belong in isolated visual components (`CircularGauge.jsx`, `WaveChart.jsx`).
  - Presentation containers (`StorageBar.jsx`, `CleanerSection.jsx`, `AppManager.jsx`) handle feature-specific layouts.

## 2. Tailwind CSS Discipline
- Use the predefined `cyber-*` palette tokens defined in `tailwind.config.js`.
- Never use inline raw hex colors when theme classes (`text-cyber-cyan`, `bg-cyber-card`, `shadow-neon-cyan`) exist.
- Always ensure responsive layout with flexbox and CSS grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

## 3. UI Preservation Invariant
- **NEVER** strip glowing SVG drop-shadows, animations, or dark background styling.
- All new features must seamlessly blend with the futuristic Cyberpunk technical dashboard aesthetic.
