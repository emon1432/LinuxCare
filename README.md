# ⚡ LinuxCare

> **Futuristic Cyberpunk Device Care & System Optimization Hub for Linux**  
> *Keep your Linux workstation fast, clean, and effortless.*

[![License: MIT](https://img.shields.io/badge/License-MIT-00f5d4.svg)](LICENSE)
[![Platform: Linux](https://img.shields.io/badge/Platform-Ubuntu%20%7C%20Debian%20%7C%20Linux-38bdf8.svg)]()
[![React: 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind-7c3aed.svg)]()

---

## 🌟 Overview

**LinuxCare** is an open-source, mobile-inspired **"Device Care" & System Optimizer** built specifically for modern Linux distributions (Ubuntu, Debian, and beyond). It bridges the gap between powerful terminal commands and everyday users by providing a breathtaking **Cyberpunk / Dark Neon technical dashboard**.

Just like the Device Care app on a smartphone, **LinuxCare** allows you to monitor, clean, and manage your entire operating system with single-click simplicity.

---

## ✨ Key Features

- 🚀 **1-Click System Boost:** Frees inactive RAM buffers and pagecaches (`drop_caches`) and synchronizes filesystems with one click.
- 🧹 **Deep Junk & Cache Cleaner:** Scans and safely wipes:
  - Google Chrome & browser web caches
  - Desktop thumbnail caches
  - AI & Copilot local caches
  - PHP Composer package cache
  - Redundant APT package archives (`/var/cache/apt`)
  - Bloated systemd journal logs (`journalctl --vacuum-size=100M`)
  - Obsolete/disabled duplicate Snap revisions (`snapd`)
- 📦 **Unified Application Manager:** Windows-style all-in-one application hub. View all installed applications (APT, .deb, and Snap) with real app icons, search filtering, and one-click uninstallation via native polkit authorization.
- 📊 **Real-Time Telemetry:** Live cubic-spline wave chart streaming CPU load and RAM utilization sampled directly from `/proc/stat` and `/proc/meminfo`.
- 💾 **Visual Storage Breakdown:** Categorized, mobile-style storage visualization (System Core, Installed Apps, Developer Tools, Caches, and Free Space).
- 🖥️ **Desktop Native Experience:** Launches as a standalone application window from your Ubuntu Dock / Application Grid.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+ recommended)
- Linux OS (Ubuntu 22.04+, Debian, Mint, or Arch)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/emon1432/LinuxCare.git
cd LinuxCare

# 2. Install dependencies
npm install

# 3. Build the production frontend
npm run build
```

### Launching LinuxCare

Run the desktop launcher:
```bash
./launch.sh
```

Or start development mode:
```bash
npm run app
```

---

## 🖥️ Desktop Integration (Ubuntu Dock & App Grid)

To install LinuxCare into your desktop launcher so you can launch it with one click:

```bash
mkdir -p ~/.local/share/applications

cat << 'EOF' > ~/.local/share/applications/linuxcare.desktop
[Desktop Entry]
Version=1.0
Type=Application
Name=LinuxCare
GenericName=System Optimizer & Device Care
Comment=Futuristic Linux Device Care & Optimization Hub
Exec=/home/emonideas/Documents/desktop-manager/launch.sh
Icon=/home/emonideas/Documents/desktop-manager/public/icon.svg
Terminal=false
Categories=System;Utility;Monitor;Settings;
StartupWMClass=linuxcare
EOF

update-desktop-database ~/.local/share/applications/
```

Now search for **LinuxCare** in your Ubuntu App Menu or pin it to your Ubuntu Dock!

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Tailwind CSS, Lucide Icons, Vite
- **Theme:** Cyberpunk Dark Neon (`#0c0f24`, `#00f5d4`, `#38bdf8`, `#7c3aed`)
- **Backend Core:** Lightweight Node.js Core Service communicating with the Linux Kernel (`/proc`, `df`, `dpkg`, `snapd`)
- **Privilege Separation:** Native Linux PolicyKit (`pkexec`) for administrative actions

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
