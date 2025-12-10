#!/usr/bin/env python
"""
Script para crear empresa de prueba en Master API
"""
import os
import sys
import django

# Configurar Django
backend_path = os.path.dirname(os.path.abspath(__file__))
master_path = os.path.join(backend_path, 'services/master/proyecto_master')
sys.path.insert(0, master_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'proyecto_master.settings')
django.setup()

from empresas.models import Empresa, Plan, Suscripcion, UsuarioAdmin
from django.contrib.auth.models import User
from datetime import datetime, timedelta

print("="*60)
print("CREAR EMPRESA DE PRUEBA - HiperMarket")
print("="*60)

# 1. Verificar/Crear Plan Básico
plan, created = Plan.objects.get_or_create(
    nombre="Basico",
    defaults={
        'precio_mensual': 29990,
        'descripcion': 'Plan básico con funcionalidades esenciales',
        'host_base_url': 'http://localhost:8001/api/basico',
        'modulos_json': ["dashboard", "products", "inventory", "sale", "cashregister", "categories"]
    }
)
if created:
    print(f"✓ Plan 'Basico' creado")
else:
    print(f"✓ Plan 'Basico' ya existe")

# 2. Crear Empresa HiperMarket
empresa, created = Empresa.objects.get_or_create(
    rut="76123456-7",
    defaults={
        'nombre': 'HiperMarket C',
        'direccion': 'Aromos 133, Temuco',
        'telefono': '+56978249601',
        'email': 'contacto@hipermarket.cl'
    }
)
if created:
    print(f"✓ Empresa 'HiperMarket C' creada (ID: {empresa.id})")
else:
    print(f"✓ Empresa 'HiperMarket C' ya existe (ID: {empresa.id})")
    # Actualizar datos
    empresa.nombre = 'HiperMarket C'
    empresa.direccion = 'Aromos 133, Temuco'
    empresa.telefono = '+56978249601'
    empresa.email = 'contacto@hipermarket.cl'
    empresa.save()

# 3. Crear/Actualizar Suscripción
suscripcion, created = Suscripcion.objects.get_or_create(
    empresa=empresa,
    defaults={
        'plan': plan,
        'fecha_inicio': datetime.now().date(),
        'fecha_fin': (datetime.now() + timedelta(days=365)).date(),
        'monto_pagado': 29990,
        'estado': 'activa'
    }
)
if created:
    print(f"✓ Suscripción creada para HiperMarket")
else:
    print(f"✓ Suscripción ya existe para HiperMarket")
    suscripcion.plan = plan
    suscripcion.estado = 'activa'
    suscripcion.save()

# 4. Crear usuario admin para Pepe
user_pepe, created = User.objects.get_or_create(
    username='pepe',
    defaults={
        'email': 'pepe@hipermarket.cl',
        'first_name': 'Pepe',
        'last_name': 'Lopez',
        'is_staff': False,
        'is_active': True
    }
)
if created:
    user_pepe.set_password('Pepe123!')
    user_pepe.save()
    print(f"✓ Usuario 'pepe' creado en Master")
else:
    print(f"✓ Usuario 'pepe' ya existe en Master")
    user_pepe.email = 'pepe@hipermarket.cl'
    user_pepe.set_password('Pepe123!')
    user_pepe.save()

# 5. Crear UsuarioAdmin vinculado
admin_pepe, created = UsuarioAdmin.objects.get_or_create(
    user=user_pepe,
    defaults={
        'empresa': empresa,
        'rol': 'admin_cliente'
    }
)
if created:
    print(f"✓ UsuarioAdmin creado para pepe")
else:
    print(f"✓ UsuarioAdmin ya existe para pepe")
    admin_pepe.empresa = empresa
    admin_pepe.save()

# 6. Crear usuario admin principal
user_admin, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@hipermarket.cl',
        'first_name': 'Admin',
        'last_name': 'HiperMarket',
        'is_staff': False,
        'is_active': True
    }
)
if created:
    user_admin.set_password('Admin123!')
    user_admin.save()
    print(f"✓ Usuario 'admin' creado en Master")
else:
    print(f"✓ Usuario 'admin' ya existe en Master")
    user_admin.set_password('Admin123!')
    user_admin.save()

admin_usuario, created = UsuarioAdmin.objects.get_or_create(
    user=user_admin,
    defaults={
        'empresa': empresa,
        'rol': 'admin_cliente'
    }
)
if created:
    print(f"✓ UsuarioAdmin creado para admin")
else:
    print(f"✓ UsuarioAdmin ya existe para admin")
    admin_usuario.empresa = empresa
    admin_usuario.save()

print("\n" + "="*60)
print("✓ CONFIGURACIÓN COMPLETADA")
print("="*60)
print("\nAhora puedes loguearte con:")
print("  Email: pepe@hipermarket.cl")
print("  Password: Pepe123!")
print("\n  O con:")
print("  Email: admin@hipermarket.cl")
print("  Password: Admin123!")
print("\nEl sistema redirigirá automáticamente al plan Básico (puerto 8001)")
print("="*60)
