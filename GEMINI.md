# LINUXCARE — AI AGENT CONTEXT & CODING GUARDRAILS

> **CRITICAL NOTICE FOR ALL AI AGENTS (Gemini / Antigravity / Claude / Copilot):**
> Read this document before making ANY code edits or modifications to this repository.
> This repository represents **LinuxCare**, a futuristic, open-source Linux Device Care and System Optimization Suite.

---

## 1. PROJECT VISION & PHILOSOPHY
- **What is LinuxCare?**
  LinuxCare is an open-source, smartphone-inspired "Device Care" & System Optimizer (equivalent to Samsung Device Care or MIUI Security) built specifically for Linux desktop environments (Ubuntu, Debian, and beyond).
- **Core Purpose:**
  To eliminate the myth that "Linux is too hard and requires memorizing dozens of terminal commands." It wraps advanced Linux kernel telemetry, disk cleanup, and package management into an intuitive, one-click desktop application.
- **Target Audience:**
  Everyday Linux users, software engineers, and power users who want rapid system health diagnostics and optimization without manually typing CLI commands.

---

## 2. STRICT DESIGN SYSTEM & UI LOCK (DO NOT BREAK)
The visual identity of this project is based on a **Dark Cyberpunk / Neon Technical Command Center**.
- **Color Palette (Tailwind CSS):**
  - Deep Space Canvas: `#0c0f24`
  - Deep Navy Card Panels: `#131738` / `#111538`
  - Neon Cyan Accent: `#00f5d4` (glow effect: `shadow-neon-cyan`)
  - Electric Sky Blue: `#38bdf8` (glow effect: `shadow-neon-blue`)
  - Cyber Purple / Indigo: `#7c3aed` / `#6366f1`
  - Emerald Green: `#10b981`
  - Alert Pink: `#f43f5e`
- **UI Components:**
  - Radial SVG Gauges (`CircularGauge.jsx`) for real-time percentage metrics.
  - Smooth cubic-bezier spline charts (`WaveChart.jsx`) for live hardware telemetry.
  - Multi-Drive cards displaying connected physical drives (e.g. Primary SSD + 4TB HDD) with disk model, mount point, and colored progress bars.
  - Glassmorphic card styling (`cyber-card`) with subtle blur and neon hover borders.
- **Rule for Agents:**
  **NEVER** replace or revert this dark neon aesthetic to generic Bootstrap, plain gray Tailwind, or light mode. Always preserve the glowing badges, monospace numbers, and high-tech cockpit feel.

---

## 3. ARCHITECTURE & CODEBASE STANDARDS

### A. Frontend (React 19 + Vite)
- Located in `src/`.
- Modular components in `src/components/`:
  - `Sidebar.jsx`: High-tech navigation with branding & machine kernel badge.
  - `TopNav.jsx`: Health score badge, live uptime, and 1-Click System Boost.
  - `CircularGauge.jsx`: Reusable SVG circular meters with drop-shadow glow.
  - `WaveChart.jsx`: Real-time rolling hardware load stream.
  - `StorageBar.jsx`: Multi-storage hardware grid & segmented category breakdown.
  - `CleanerSection.jsx`: Checkbox-based deep cache & system log purger.
  - `AppManager.jsx`: Unified APT + Snap application hub with instant search & uninstall.
- State is synchronized with the backend via polling `http://127.0.0.1:4141/api/metrics` every 2 seconds.

### B. Backend Engine (`server/systemService.js`)
- Runs as a lightweight Express daemon on port `4141`.
- Communicates directly with the Linux kernel and system utilities:
  - `/proc/stat` -> Precise non-blocking CPU usage.
  - `/proc/meminfo` -> Physical RAM, buffers, and swap memory.
  - `df -B1 -x tmpfs ...` -> All mounted physical disks (SSDs, HDDs, USBs).
  - `/sys/block/...` -> Drive model identification and SSD/HDD rotational detection.
  - `/usr/share/applications` & `snap list` -> Full inventory of installed apps.
  - `journalctl` & `~/.cache` -> Storage junk analysis.
- Serves the compiled production frontend (`dist/`) directly on port `4141`.
- **Privilege Separation:**
  Privileged operations (e.g. system cache drops, APT package removal) use PolicyKit (`pkexec`) so the desktop user is prompted via standard Ubuntu authorization dialogs without hardcoded passwords.

---

## 4. AGENT OPERATING PRINCIPLES
1. **No Fake/Mock Data:** Always connect new features to real Linux APIs, `/proc`, `/sys`, or CLI tools.
2. **Surgical Edits Only:** Never wipe or completely rewrite large files. Use targeted replacements and preserve existing imports, comments, and spacing.
3. **Verify Before Declaring Done:** Always test that `npm run build` succeeds and the server endpoint works without syntax errors.
4. **Idempotency & Safety:** Never write destructive shell commands (`rm -rf /` or unchecked wildcards) that could harm the user's host system.
