#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proyecto_master.settings')
sys.path.insert(0, '/home/d1eg0/Documentos/GitHub/TemucoSoft-S.A._eva4/temucosoft-backend/services/master/proyecto_master')

django.setup()

from empresas.models import Plan

planes_config = {
    'basico': 'http://localhost:8001/api/basico',
    'estandar': 'http://localhost:8002/api/medio',
    'premium': 'http://localhost:8003/api/premium'
}

print("Actualizando URLs base de los planes...")
for plan_nombre, url_base in planes_config.items():
    plan = Plan.objects.filter(nombre=plan_nombre).first()
    if plan:
        plan.host_base_url = url_base
        plan.save()
        print(f"✓ {plan_nombre}: {url_base}")
    else:
        print(f"✗ Plan {plan_nombre} no encontrado")

print("\nVerificación final:")
for plan in Plan.objects.all():
    print(f"  {plan.nombre}: {plan.host_base_url}")
