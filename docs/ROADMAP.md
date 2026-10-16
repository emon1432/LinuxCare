# 🗺️ LinuxCare Project Roadmap & Task Tracker

This document tracks completed milestones and upcoming development phases.

---

## ✅ Phase 1: Core Foundation & Telemetry (Completed)
- [x] Initial repository setup and Git tracking (`https://github.com/emon1432/LinuxCare.git`).
- [x] Cyberpunk Dark Neon Design System implementation with Tailwind CSS and glowing accents.
- [x] Real-time Linux kernel telemetry engine (`/proc/stat`, `/proc/meminfo`, systemd uptime).
- [x] Smooth cubic-spline telemetry wave chart (`WaveChart.jsx`).
- [x] 4 Radial SVG progress gauges (`CircularGauge.jsx`) for Health Score, CPU, RAM, and Disk.
- [x] **Multi-Storage Engine:** Automatic detection and card rendering for all physical drives (SSD system disk + 4TB mass storage HDD + external devices).
- [x] Smart Junk & Cache Cleaner (Chrome, Composer, Thumbnails, Copilot, APT archives, Journal logs, disabled Snaps).
- [x] Unified Application Hub (scanning `/usr/share/applications` and `snap list` with search and uninstall).
- [x] 1-Click System Boost (`drop_caches` buffer release).
- [x] Native Ubuntu desktop integration (`.desktop` launcher and SVG brand icon).

---

## 🚀 Phase 2: System Control & Packaging (Upcoming)
- [ ] **Startup Application Manager:** Scan and toggle apps launching on login (`~/.config/autostart`).
- [ ] **App-Specific Cache Reset:** Add a "Clear Cache" button inside the App Manager for individual apps (e.g. Chrome, VS Code) without full uninstallation.
- [ ] **Native Desktop Packaging:**
  - Create standard `.deb` package for one-command installation (`dpkg -i linuxcare.deb`).
  - Create portable `.AppImage` for distribution across Arch, Fedora, and openSUSE.
- [ ] **Hardware Sensors Integration:** CPU Temperature & Fan Speed via `lm-sensors` if available.
- [ ] **System Tray Icon:** Optional background daemon with quick tray menu in the GNOME top bar.

---

## 💡 Notes for Contributors & AI Agents
- Always check off completed tasks in this file when finishing new features.
- Never regress completed features from Phase 1.
- Maintain code cleanliness and run `npm run build` to verify every change.
