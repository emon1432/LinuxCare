# 🏛️ LinuxCare Architecture & System Design

This document details the internal architecture, data contracts, and component interaction of LinuxCare.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 DESKTOP PRESENTATION LAYER                  │
│       React 19 + Tailwind CSS + Lucide Icons + Vite         │
│  (Cyberpunk Neon Theme, Circular Gauges, Realtime Telemetry)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Port 4141)
┌──────────────────────────────▼──────────────────────────────┐
│                    LINUXCARE CORE ENGINE                    │
│            Node.js Standalone Lightweight Daemon            │
│                 (`server/systemService.js`)                 │
├─────────────────────────────────────────────────────────────┤
│ • Telemetry Collector: Samples /proc/stat, /proc/meminfo    │
│ • Multi-Storage Engine: Discovers physical SSDs & HDDs      │
│ • Cleaner Engine: Scans user & system log/cache footprints  │
│ • Package Provider: Aggregates APT & Snap application state │
│ • Static Host: Serves compiled SPA bundle (`dist/`)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Kernel & Subsystem Calls
┌──────────────────────────────▼──────────────────────────────┐
│                  HOST LINUX SYSTEM INTERFACE                │
│    /proc, /sys, /var, systemd-journald, snapd, apt, pkexec  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. API Specifications

### `GET /api/metrics`
Returns real-time processor, memory, storage, and system health telemetry.
- **CPU:** Percentage, core count, model.
- **RAM:** Total, used, available, swap metrics, formatted human-readable units.
- **Disk:** Primary root disk and `totalAggregate` across all connected drives.
- **Disks Array (`disks`):** Every physical storage device with model, drive type (SSD/HDD), mount point, capacity, and usage percentage.
- **System:** OS release, hostname, uptime in seconds, kernel version, computed health score (0-100).

### `GET /api/storage-breakdown`
Returns categorized allocation of the primary system drive (System Core, Installed Apps, Developer Tools, Cache & Logs, User Documents). Cached in memory for 60 seconds to prevent disk thrashing.

### `GET /api/cleaner/scan`
Scans and reports disk footprint across 7 distinct junk categories:
1. Google Chrome Web Cache
2. Desktop Image Thumbnails
3. AI & Copilot Local Caches
4. PHP Composer Cache
5. APT Package Archives (`/var/cache/apt/archives`)
6. Systemd Journal Logs
7. Obsolete/Disabled Snap Revisions

### `POST /api/cleaner/clean`
Accepts `{ categories: string[] }` and purges selected caches. Uses `pkexec` for system-level directories.

### `POST /api/boost`
Synchronizes filesystem buffers and triggers pagecache/inode eviction (`drop_caches`).

### `GET /api/apps`
Scans `/usr/share/applications`, `~/.local/share/applications`, and `snap list` to construct a unified registry of installed desktop software.

### `POST /api/apps/uninstall`
Executes safe package removal for APT packages or Snap containers via PolicyKit.

---

## 3. Desktop Application Integration
- Executable script: `./launch.sh` (launches daemon + Chrome standalone window).
- Desktop entry: `~/.local/share/applications/linuxcare.desktop`.
- Icon asset: `public/icon.svg`.
