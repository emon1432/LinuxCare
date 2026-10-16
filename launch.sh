#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PORT=4141

# Start LinuxCare Core Engine if not running
if ! curl -s "http://127.0.0.1:${PORT}/api/metrics" >/dev/null 2>&1; then
    echo "[*] Launching LinuxCare Core Engine..."
    nohup node "${DIR}/server/systemService.js" >/tmp/linuxcare-server.log 2>&1 &
    sleep 1
fi

# Launch in standalone App Window
APP_URL="http://127.0.0.1:${PORT}"

if command -v google-chrome >/dev/null 2>&1; then
    google-chrome --app="${APP_URL}" --class="linuxcare" --user-data-dir="${HOME}/.config/linuxcare-app" >/dev/null 2>&1 &
elif command -v chromium-browser >/dev/null 2>&1; then
    chromium-browser --app="${APP_URL}" --class="linuxcare" --user-data-dir="${HOME}/.config/linuxcare-app" >/dev/null 2>&1 &
elif command -v brave-browser >/dev/null 2>&1; then
    brave-browser --app="${APP_URL}" --class="linuxcare" --user-data-dir="${HOME}/.config/linuxcare-app" >/dev/null 2>&1 &
else
    xdg-open "${APP_URL}" >/dev/null 2>&1 &
fi
