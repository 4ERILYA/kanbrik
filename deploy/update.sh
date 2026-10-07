#!/usr/bin/env bash
# Обновить сайт на сервере до последней версии из GitHub
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
npm ci
npm run build
pm2 reload kanbrik
