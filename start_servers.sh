#!/usr/bin/env bash

# Inicia los 4 servicios Django (master, basico, medio, premium) usando rutas relativas
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

# Activar venv si existe
if [ -d "$BACKEND_DIR/venv" ]; then
	# shellcheck disable=SC1091
	source "$BACKEND_DIR/venv/bin/activate"
	echo "Entorno virtual activado: $BACKEND_DIR/venv"
else
	echo "Sin entorno virtual en $BACKEND_DIR/venv. Usando entorno Python actual."
fi

echo "Iniciando servidores Django..."
echo "=============================="

# Master en 8000
echo "Iniciando Master (8000)..."
cd "$BACKEND_DIR/services/master/proyecto_master"
python manage.py runserver 0.0.0.0:8000 &
MASTER_PID=$!

# Basico en 8001
echo "Iniciando Basico (8001)..."
cd "$BACKEND_DIR/services/basico/proyecto_basico"
python manage.py runserver 0.0.0.0:8001 &
BASICO_PID=$!

# Medio en 8002
echo "Iniciando Medio (8002)..."
cd "$BACKEND_DIR/services/medio/proyecto_medio"
python manage.py runserver 0.0.0.0:8002 &
MEDIO_PID=$!

# Premium en 8003
echo "Iniciando Premium (8003)..."
cd "$BACKEND_DIR/services/premium/proyecto_premium"
python manage.py runserver 0.0.0.0:8003 &
PREMIUM_PID=$!

echo ""
echo "=============================="
echo "✓ Master corriendo en puerto 8000 (PID: $MASTER_PID)"
echo "✓ Basico corriendo en puerto 8001 (PID: $BASICO_PID)"
echo "✓ Medio corriendo en puerto 8002 (PID: $MEDIO_PID)"
echo "✓ Premium corriendo en puerto 8003 (PID: $PREMIUM_PID)"
echo ""
echo "Para detener los servidores, presiona Ctrl+C"
echo ""

# Manejar cierre limpio
terminate_children() {
	echo "\nDeteniendo servicios..."
	kill "$MASTER_PID" "$BASICO_PID" "$MEDIO_PID" "$PREMIUM_PID" 2>/dev/null || true
}
trap terminate_children INT TERM

wait
