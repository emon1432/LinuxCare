# LinuxCare System Architecture & Engineering Standards

## 1. Zero Fake / Mock Data
- Connect all telemetry to real Linux interfaces (`/proc/stat`, `/proc/meminfo`, `df -B1`, `snap list`, `/usr/share/applications`).
- Disks must be scanned dynamically; never hardcode mount points or drive names.

## 2. Process & Backend Topology
- Backend runs as a lightweight Express daemon on port `4141` (`server/systemService.js`).
- Backend serves both the REST API (`/api/*`) and the compiled production SPA (`dist/`).
- Privileged operations (package removal, cache clearing) use PolicyKit (`pkexec`) to prompt the user via native Ubuntu desktop dialogs.

## 3. ECC Pair Programming Principles
- Surgical edits only: inspect line-ranges rather than whole files.
- Test `npm run build` after frontend edits before declaring completion.
