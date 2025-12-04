#!/bin/bash

# Script para iniciar todos los servidores Django en los puertos correctos

BACKEND_DIR="/home/d1eg0/Documentos/GitHub/TemucoSoft-S.A._eva4/temucosoft-backend"

# Activar venv
source $BACKEND_DIR/venv/bin/activate

echo "Iniciando servidores Django..."
echo "=============================="

# Master en 8000
echo "Iniciando Master (8000)..."
cd $BACKEND_DIR/services/master/proyecto_master
python manage.py runserver 0.0.0.0:8000 &
MASTER_PID=$!

# Basico en 8001
echo "Iniciando Basico (8001)..."
cd $BACKEND_DIR/services/basico/proyecto_basico
python manage.py runserver 0.0.0.0:8001 &
BASICO_PID=$!

# Medio en 8002
echo "Iniciando Medio (8002)..."
cd $BACKEND_DIR/services/medio/proyecto_medio
python manage.py runserver 0.0.0.0:8002 &
MEDIO_PID=$!

# Premium en 8003
echo "Iniciando Premium (8003)..."
cd $BACKEND_DIR/services/premium/proyecto_premium
python manage.py runserver 0.0.0.0:8003 &
PREMIUM_PID=$!

echo ""
echo "=============================="
echo "✓ Master corriendo en puerto 8000 (PID: $MASTER_PID)"
echo "✓ Basico corriendo en puerto 8001 (PID: $BASICO_PID)"
echo "✓ Medio corriendo en puerto 8002 (PID: $MEDIO_PID)"
echo "✓ Premium corriendo en puerto 8003 (PID: $PREMIUM_PID)"
echo ""
echo "Para detener los servidores, ejecuta: kill $MASTER_PID $BASICO_PID $MEDIO_PID $PREMIUM_PID"
echo ""

# Mantener el script corriendo
wait
