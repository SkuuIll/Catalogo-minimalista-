#!/bin/bash
# ==============================================
# Aura Catalog — Server Management Script
# ==============================================
#
# Uso:
#   ./server.sh start      — iniciar servidor
#   ./server.sh stop       — detener
#   ./server.sh restart    — reiniciar
#   ./server.sh status     — ver estado
#   ./server.sh logs       — ver logs
#   ./server.sh rebuild    — compilar + reiniciar
#
# Auto-inicio en VPS:
#   PM2 ya está configurado y guardado. Si el VPS
#   se reinicia, PM2 resurrect iniciara el servidor
#   automaticamente gracias al servicio systemd
#   pm2-root.service que esta enabled.
#
#   Si queres cambiar algo del auto-inicio:
#   - Editar:  pm2 edit aura-catalog
#   - Ver:     pm2 startup (para el comando de instalacion)
#   - Guardar: pm2 save
#
#   Log del servidor: /root/catalogo/logs/stdout.log

set -e

APP_DIR="/root/catalogo"
APP_NAME="aura-catalog"
LOG_DIR="$APP_DIR/logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

mkdir -p "$LOG_DIR"
cd "$APP_DIR"

pm2_start() {
    if pm2 list | grep -q "$APP_NAME"; then
        warn "Ya esta corriendo en PM2 (usar 'restart' para reiniciar)"
        return
    fi
    log "Iniciando con PM2…"
    pm2 start ecosystem.json
    pm2 save
    log "Listo. PID: $(pm2 list | grep $APP_NAME | awk '{print $4}')"
}

pm2_stop() {
    pm2 stop "$APP_NAME" 2>/dev/null || warn "No estaba corriendo"
    log "Detenido"
}

pm2_restart() {
    log "Reiniciando…"
    pm2 restart "$APP_NAME"
    sleep 2
    log "OK — PID $(pm2 list | grep $APP_NAME | awk '{print $4}')"
}

pm2_status() {
    local info=$(pm2 jlist 2>/dev/null | node -e "
        const l = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
        const p = l.find(x => x.name === '$APP_NAME');
        if (!p) return console.log('No encontrado');
        const u = p.pm2_env.created_at ? new Date(p.pm2_env.created_at) : null;
        const up = u ? Math.floor((Date.now()-u)/1000) : '?';
        console.log('PID:', p.pid);
        console.log('Status:', p.pm2_env.status);
        console.log('Uptime:', up+'s');
        console.log('Restarts:', p.pm2_env.restart_time);
        console.log('Memory:', Math.round(p.monit.memory/1024/1024)+'MB');
    " 2>/dev/null) || true
    pm2 list | grep -E "aura|PM2" | head -3
    [ -n "$info" ] && echo "$info"
}

pm2_logs() {
    pm2 logs "$APP_NAME" --lines 50 --nostdin
}

pm2_rebuild() {
    log "Compilando…"
    npm run build
    log "Reiniciando…"
    pm2 restart "$APP_NAME"
    log "Listo"
}

case "${1:-start}" in
    start)
        pm2_start
        ;;
    stop)
        pm2_stop
        ;;
    restart)
        pm2_restart
        ;;
    status)
        pm2_status
        ;;
    logs)
        pm2_logs
        ;;
    rebuild)
        pm2_rebuild
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|rebuild}"
        exit 1
        ;;
esac