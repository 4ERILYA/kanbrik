#!/usr/bin/env bash
# Ежедневная копия базы и фото. В crontab: 0 4 * * * /var/www/kanbrik/deploy/backup.sh
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${BACKUP_DIR:-/var/backups/kanbrik}"
STAMP="$(date +%Y-%m-%d)"
mkdir -p "$DEST"
sqlite3 "$APP_DIR/kanbrik.db" ".backup '$DEST/kanbrik-$STAMP.db'"
tar -czf "$DEST/media-$STAMP.tar.gz" -C "$APP_DIR" media
# Храним 14 последних копий
ls -1t "$DEST"/kanbrik-*.db | tail -n +15 | xargs -r rm --
ls -1t "$DEST"/media-*.tar.gz | tail -n +15 | xargs -r rm --
