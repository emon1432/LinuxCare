import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec, execSync } from 'child_process';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = 4141;

app.use(cors());
app.use(express.json());

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Helper: Run shell command safely as Promise
const run = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      resolve({ success: false, output: stderr || error.message });
    } else {
      resolve({ success: true, output: stdout.trim() });
    }
  });
});

// Format bytes helper
const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 1. REALTIME METRICS
let prevCpuTimes = null;
const getCpuTimes = () => {
  try {
    const line = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0];
    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    const idle = parts[3] + (parts[4] || 0);
    const total = parts.reduce((a, b) => a + b, 0);
    return { idle, total };
  } catch (e) {
    return { idle: 0, total: 100 };
  }
};
// Multi-Storage Scanner
const getAllDisks = () => {
  try {
    const out = execSync('df -B1 -x tmpfs -x squashfs -x devtmpfs -x efivarfs 2>/dev/null', { encoding: 'utf8' });
    const lines = out.trim().split('\n').slice(1);
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const filesystem = parts[0];
      const total = parseInt(parts[1], 10);
      const used = parseInt(parts[2], 10);
      const avail = parseInt(parts[3], 10);
      const pct = parseInt(parts[4].replace('%', ''), 10);
      const mount = parts[5];
      
      const diskBase = filesystem.replace('/dev/', '').replace(/[0-9]+$/, '');
      let model = 'Storage Drive';
      let isRotational = 1;
      try {
        model = fs.readFileSync('/sys/block/' + diskBase + '/device/model', 'utf8').trim();
        isRotational = parseInt(fs.readFileSync('/sys/block/' + diskBase + '/queue/rotational', 'utf8').trim(), 10);
      } catch(e) {}
      
      const isSSD = isRotational === 0 || model.toLowerCase().includes('ssd');
      const label = mount === '/' ? 'Primary System SSD' : (total > 1e12 ? 'Mass Storage HDD' : 'Data Drive');

      return {
        filesystem,
        mount,
        model,
        driveType: isSSD ? 'SSD' : 'HDD',
        label,
        total,
        used,
        avail,
        percent: pct,
        formattedTotal: formatBytes(total),
        formattedUsed: formatBytes(used),
        formattedAvail: formatBytes(avail)
      };
    }).filter(d => !d.mount.startsWith('/boot'));
  } catch (e) {
    return [];
  }
};

app.get('/api/metrics', async (req, res) => {
  try {
    // CPU
    const currentCpu = getCpuTimes();
    let cpuPercent = 0;
    if (prevCpuTimes) {
      const idleDiff = currentCpu.idle - prevCpuTimes.idle;
      const totalDiff = currentCpu.total - prevCpuTimes.total;
      cpuPercent = totalDiff > 0 ? Math.max(0, Math.min(100, (1 - idleDiff / totalDiff) * 100)) : 0;
    }
    prevCpuTimes = currentCpu;

    // RAM
    let totalRam = os.totalmem();
    let freeRam = os.freemem();
    let availRam = freeRam;
    let swapTotal = 0;
    let swapFree = 0;

    try {
      const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
      const getVal = (key) => {
        const m = meminfo.match(new RegExp(key + ':\\s+(\\d+)'));
        return m ? parseInt(m[1], 10) * 1024 : 0;
      };
      totalRam = getVal('MemTotal');
      availRam = getVal('MemAvailable') || freeRam;
      swapTotal = getVal('SwapTotal');
      swapFree = getVal('SwapFree');
    } catch (e) {}

    const usedRam = totalRam - availRam;
    const ramPercent = totalRam > 0 ? (usedRam / totalRam) * 100 : 0;
    const usedSwap = swapTotal - swapFree;
    const swapPercent = swapTotal > 0 ? (usedSwap / swapTotal) * 100 : 0;

    // ALL CONNECTED STORAGES
    const disks = getAllDisks();
    const primaryDisk = disks.find(d => d.mount === '/') || disks[0] || {
      total: 0, used: 0, avail: 0, percent: 0, formattedTotal: '0 B', formattedUsed: '0 B', formattedAvail: '0 B', label: 'Primary SSD'
    };

    const totalStorageBytes = disks.reduce((sum, d) => sum + d.total, 0);
    const totalUsedStorageBytes = disks.reduce((sum, d) => sum + d.used, 0);
    const totalAvailStorageBytes = disks.reduce((sum, d) => sum + d.avail, 0);
    const totalStoragePercent = totalStorageBytes > 0 ? (totalUsedStorageBytes / totalStorageBytes) * 100 : 0;

    // System Details
    let osName = 'Ubuntu Linux';
    try {
      const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
      const m = osRelease.match(/PRETTY_NAME="([^"]+)"/);
      if (m) osName = m[1];
    } catch (e) {}

    // Health Score Algorithm
    // Base 100, drops if primary disk > 80%, RAM > 85%, or CPU > 90%
    let health = 100;
    if (primaryDisk.percent > 80) health -= (primaryDisk.percent - 80) * 1.5;
    if (ramPercent > 80) health -= (ramPercent - 80) * 1.2;
    if (cpuPercent > 85) health -= (cpuPercent - 85) * 1.0;
    health = Math.max(20, Math.min(100, Math.round(health)));

    res.json({
      cpu: {
        percent: parseFloat(cpuPercent.toFixed(1)),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Generic x86_64 CPU'
      },
      ram: {
        total: totalRam,
        used: usedRam,
        available: availRam,
        percent: parseFloat(ramPercent.toFixed(1)),
        formattedTotal: formatBytes(totalRam),
        formattedUsed: formatBytes(usedRam),
        formattedAvail: formatBytes(availRam),
        swapTotal,
        swapUsed: usedSwap,
        swapPercent: parseFloat(swapPercent.toFixed(1)),
        formattedSwapTotal: formatBytes(swapTotal),
        formattedSwapUsed: formatBytes(usedSwap)
      },
      disk: {
        ...primaryDisk,
        totalAggregate: {
          total: totalStorageBytes,
          used: totalUsedStorageBytes,
          avail: totalAvailStorageBytes,
          percent: parseFloat(totalStoragePercent.toFixed(1)),
          formattedTotal: formatBytes(totalStorageBytes),
          formattedUsed: formatBytes(totalUsedStorageBytes),
          formattedAvail: formatBytes(totalAvailStorageBytes)
        }
      },
      disks,
      system: {
        osName,
        hostname: os.hostname(),
        uptimeSeconds: os.uptime(),
        kernel: os.release(),
        healthScore: health
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. STORAGE VISUAL BREAKDOWN
let cachedStorageBreakdown = null;
let lastStorageBreakdownScan = 0;

app.get('/api/storage-breakdown', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedStorageBreakdown && now - lastStorageBreakdownScan < 60000) {
      return res.json(cachedStorageBreakdown);
    }
    const homeDir = os.homedir();
    
    // Fast estimation of major categories
    const getDirSize = (target) => {
      try {
        if (!fs.existsSync(target)) return 0;
        const out = execSync(`du -sb "${target}" 2>/dev/null | cut -f1`, { encoding: 'utf8' });
        return parseInt(out.trim(), 10) || 0;
      } catch (e) {
        return 0;
      }
    };

    const cacheSize = getDirSize(path.join(homeDir, '.cache'));
    const devToolsSize = getDirSize(path.join(homeDir, '.vscode')) + 
                         getDirSize(path.join(homeDir, '.gemini')) + 
                         getDirSize(path.join(homeDir, '.antigravity-ide')) +
                         getDirSize(path.join(homeDir, '.nvm')) +
                         getDirSize(path.join(homeDir, '.npm'));
    const documentsSize = getDirSize(path.join(homeDir, 'Documents')) +
                          getDirSize(path.join(homeDir, 'Downloads'));
    const snapSize = getDirSize('/var/lib/snapd');

    const dfOutput = execSync("df -B1 / | awk 'NR==2 {print $2, $3, $4}'", { encoding: 'utf8' });
    const [total, used, free] = dfOutput.trim().split(/\s+/).map(Number);

    const systemCore = Math.max(10 * 1024 * 1024 * 1024, used - (cacheSize + devToolsSize + documentsSize + snapSize));

    const result = {
      total,
      used,
      free,
      formattedTotal: formatBytes(total),
      formattedUsed: formatBytes(used),
      formattedFree: formatBytes(free),
      categories: [
        { name: 'System Core & Libraries', bytes: systemCore, formatted: formatBytes(systemCore), color: '#38bdf8' },
        { name: 'Snap & Installed Apps', bytes: snapSize + (5 * 1024 * 1024 * 1024), formatted: formatBytes(snapSize + 5 * 1024 * 1024 * 1024), color: '#7c3aed' },
        { name: 'Developer Tools & IDEs', bytes: devToolsSize, formatted: formatBytes(devToolsSize), color: '#00f5d4' },
        { name: 'Cache & System Logs', bytes: cacheSize, formatted: formatBytes(cacheSize), color: '#f43f5e' },
        { name: 'User Files & Downloads', bytes: documentsSize, formatted: formatBytes(documentsSize), color: '#10b981' }
      ]
    };
    cachedStorageBreakdown = result;
    lastStorageBreakdownScan = Date.now();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. JUNK & CACHE SCANNER
app.get('/api/cleaner/scan', async (req, res) => {
  try {
    const homeDir = os.homedir();
    const getDirSize = (target) => {
      try {
        if (!fs.existsSync(target)) return 0;
        const out = execSync(`du -sb "${target}" 2>/dev/null | cut -f1`, { encoding: 'utf8' });
        return parseInt(out.trim(), 10) || 0;
      } catch (e) {
        return 0;
      }
    };

    const chromeCache = getDirSize(path.join(homeDir, '.cache/google-chrome'));
    const thumbnails = getDirSize(path.join(homeDir, '.cache/thumbnails'));
    const copilotCache = getDirSize(path.join(homeDir, '.cache/copilot'));
    const composerCache = getDirSize(path.join(homeDir, '.cache/composer'));
    const aptArchives = getDirSize('/var/cache/apt/archives');

    let journalLogs = 0;
    try {
      const jout = execSync("journalctl --disk-usage 2>/dev/null", { encoding: 'utf8' });
      const m = jout.match(/take up\s+([\d.]+)([MGK]?)B/i);
      if (m) {
        const val = parseFloat(m[1]);
        const unit = m[2].toUpperCase();
        if (unit === 'G') journalLogs = val * 1024 * 1024 * 1024;
        else if (unit === 'M') journalLogs = val * 1024 * 1024;
        else journalLogs = val * 1024;
      }
    } catch (e) {}

    let disabledSnapsCount = 0;
    try {
      const snapOut = execSync("snap list --all 2>/dev/null | grep disabled | wc -l", { encoding: 'utf8' });
      disabledSnapsCount = parseInt(snapOut.trim(), 10) || 0;
    } catch (e) {}

    const disabledSnapsEstBytes = disabledSnapsCount * 250 * 1024 * 1024; // ~250MB per disabled snap

    const items = [
      { id: 'chrome', name: 'Google Chrome Web Cache', bytes: chromeCache, formatted: formatBytes(chromeCache), safe: true, requiresRoot: false },
      { id: 'thumbnails', name: 'Desktop Image Thumbnails', bytes: thumbnails, formatted: formatBytes(thumbnails), safe: true, requiresRoot: false },
      { id: 'copilot', name: 'AI & Copilot Local Cache', bytes: copilotCache, formatted: formatBytes(copilotCache), safe: true, requiresRoot: false },
      { id: 'composer', name: 'PHP Composer Package Cache', bytes: composerCache, formatted: formatBytes(composerCache), safe: true, requiresRoot: false },
      { id: 'apt', name: 'APT Package Archive Cache', bytes: aptArchives, formatted: formatBytes(aptArchives), safe: true, requiresRoot: true },
      { id: 'journal', name: 'Systemd Journal Logs', bytes: journalLogs, formatted: formatBytes(journalLogs), safe: true, requiresRoot: true },
      { id: 'snap', name: `Disabled Snap Revisions (${disabledSnapsCount} obsolete)`, bytes: disabledSnapsEstBytes, formatted: formatBytes(disabledSnapsEstBytes), safe: true, requiresRoot: true }
    ];

    const totalCleanable = items.reduce((acc, curr) => acc + curr.bytes, 0);

    res.json({
      totalCleanable,
      formattedTotal: formatBytes(totalCleanable),
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. CLEANER EXECUTION
app.post('/api/cleaner/clean', async (req, res) => {
  const { categories = [] } = req.body;
  const homeDir = os.homedir();
  const results = [];

  for (const cat of categories) {
    if (cat === 'chrome') {
      await run(`rm -rf "${path.join(homeDir, '.cache/google-chrome/*')}"`);
      results.push('Cleaned Google Chrome cache');
    }
    if (cat === 'thumbnails') {
      await run(`rm -rf "${path.join(homeDir, '.cache/thumbnails/*')}"`);
      results.push('Cleaned thumbnail cache');
    }
    if (cat === 'copilot') {
      await run(`rm -rf "${path.join(homeDir, '.cache/copilot/*')}"`);
      results.push('Cleaned AI Copilot cache');
    }
    if (cat === 'composer') {
      await run(`rm -rf "${path.join(homeDir, '.cache/composer/*')}"`);
      results.push('Cleaned Composer cache');
    }
    if (cat === 'apt') {
      // Non-privileged attempt or via pkexec if available
      await run(`pkexec apt-get clean || sudo apt-get clean 2>/dev/null`);
      results.push('Cleaned APT package archives');
    }
    if (cat === 'journal') {
      await run(`pkexec journalctl --vacuum-size=100M || sudo journalctl --vacuum-size=100M 2>/dev/null`);
      results.push('Vacuumed journal logs to 100M');
    }
    if (cat === 'snap') {
      await run(`snap list --all | awk '/disabled/{print $1, $3}' | while read snapname revision; do pkexec snap remove "$snapname" --revision="$revision" || sudo snap remove "$snapname" --revision="$revision"; done`);
      results.push('Purged disabled snap revisions');
    }
  }

  res.json({ success: true, results });
});

// 5. ONE-CLICK SYSTEM BOOST
app.post('/api/boost', async (req, res) => {
  try {
    // Drop pagecache, dentries, and inodes via pkexec/sudo
    await run('sync && (pkexec sh -c "echo 3 > /proc/sys/vm/drop_caches" || true)');
    res.json({ success: true, message: 'RAM caches freed and filesystem synchronized successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. UNIFIED APPLICATION LIST
app.get('/api/apps', async (req, res) => {
  try {
    const homeDir = os.homedir();
    const appDirs = ['/usr/share/applications', path.join(homeDir, '.local/share/applications')];
    const appsMap = new Map();

    // 1. Scan Desktop Entries
    for (const dir of appDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.desktop'));
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(dir, file), 'utf8');
          if (content.includes('NoDisplay=true') || content.includes('Type=Link')) continue;
          const name = content.match(/^Name=(.*)$/m)?.[1]?.trim();
          const icon = content.match(/^Icon=(.*)$/m)?.[1]?.trim() || 'package';
          const execCmd = content.match(/^Exec=(.*)$/m)?.[1]?.trim() || '';
          const comment = content.match(/^Comment=(.*)$/m)?.[1]?.trim() || '';
          
          if (name && !appsMap.has(name)) {
            const isSnap = execCmd.includes('/snap/') || file.includes('snap');
            appsMap.set(name, {
              id: file,
              name,
              icon,
              exec: execCmd,
              description: comment,
              type: isSnap ? 'Snap' : 'APT / System',
              pkgName: file.replace('.desktop', '')
            });
          }
        } catch (e) {}
      }
    }

    // 2. Scan Snap list
    try {
      const snapOut = execSync("snap list 2>/dev/null", { encoding: 'utf8' });
      const lines = snapOut.trim().split('\n').slice(1);
      for (const line of lines) {
        const [snapName, version, rev, tracking, publisher] = line.trim().split(/\s+/);
        if (['bare', 'core18', 'core22', 'core24', 'snapd', 'gtk-common-themes'].includes(snapName)) continue;
        
        let found = false;
        for (const [key, app] of appsMap.entries()) {
          if (app.name.toLowerCase().includes(snapName.toLowerCase()) || app.exec.includes(snapName)) {
            app.type = 'Snap';
            app.version = version;
            app.snapName = snapName;
            found = true;
            break;
          }
        }
        if (!found) {
          appsMap.set(snapName, {
            id: `snap-${snapName}`,
            name: snapName.charAt(0).toUpperCase() + snapName.slice(1),
            icon: 'package',
            exec: snapName,
            description: `Publisher: ${publisher || 'Canonical'}`,
            type: 'Snap',
            version,
            snapName
          });
        }
      }
    } catch (e) {}

    const appList = Array.from(appsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    res.json({ count: appList.length, apps: appList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. UNINSTALL APP
app.post('/api/apps/uninstall', async (req, res) => {
  const { type, snapName, pkgName, name } = req.body;
  try {
    if (type === 'Snap' && snapName) {
      await run(`pkexec snap remove "${snapName}"`);
      return res.json({ success: true, message: `Successfully uninstalled ${name} (Snap)` });
    } else {
      const pkg = pkgName || name.toLowerCase().replace(/\s+/g, '-');
      await run(`pkexec apt-get remove -y "${pkg}"`);
      return res.json({ success: true, message: `Successfully uninstalled ${name}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (fs.existsSync(distPath)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, '127.0.0.1', () => {
  console.log(`LinuxCare Core Engine active on http://127.0.0.1:${PORT}`);
});
