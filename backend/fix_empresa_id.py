#!/usr/bin/env python
"""
Script para asignar empresa_id a usuarios que no lo tienen.
Ejecutar desde la raíz del proyecto backend.
"""
import os
import sys
import django

# Configurar Django para cada servicio
def fix_service(service_name, port):
    print(f"\n{'='*60}")
    print(f"Procesando servicio: {service_name.upper()} (puerto {port})")
    print(f"{'='*60}")
    
    # Ajustar el path y configurar Django
    service_path = f"services/{service_name}/proyecto_{service_name}"
    sys.path.insert(0, service_path)
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'proyecto_{service_name}.settings')
    django.setup()
    
    # Importar el modelo Usuario
    from gestion.models import Usuario
    
    # Obtener usuarios sin empresa_id
    usuarios_sin_empresa = Usuario.objects.filter(empresa_id__isnull=True)
    count = usuarios_sin_empresa.count()
    
    if count == 0:
        print(f"✓ Todos los usuarios ya tienen empresa_id asignado")
        return
    
    print(f"⚠ Encontrados {count} usuarios sin empresa_id:")
    for user in usuarios_sin_empresa:
        print(f"  - {user.username} ({user.email})")
    
    # Asignar empresa_id=1 a todos
    usuarios_sin_empresa.update(empresa_id=1)
    print(f"✓ Asignado empresa_id=1 a {count} usuarios")
    
    # Verificar
    usuarios_actualizados = Usuario.objects.filter(username__in=[u.username for u in usuarios_sin_empresa])
    print(f"\n✓ Verificación:")
    for user in usuarios_actualizados:
        print(f"  - {user.username}: empresa_id={user.empresa_id}")
    
    # Limpiar
    django.setup._reset()
    sys.path.pop(0)

if __name__ == "__main__":
    # Cambiar al directorio backend
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    print("="*60)
    print("FIX EMPRESA_ID - TemucoSoft ERP")
    print("="*60)
    print("Este script asignará empresa_id=1 a todos los usuarios")
    print("que no tengan este campo configurado.")
    print("="*60)
    
    # Procesar cada servicio
    services = [
        ('basico', 8001),
        ('medio', 8002),
        ('premium', 8003)
    ]
    
    for service_name, port in services:
        try:
            fix_service(service_name, port)
        except Exception as e:
            print(f"✗ Error en {service_name}: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*60)
    print("✓ PROCESO COMPLETADO")
    print("="*60)
    print("\nAhora puedes:")
    print("1. Cerrar sesión en el frontend")
    print("2. Volver a iniciar sesión")
    print("3. Crear categorías, productos, etc.")
    print("="*60)
