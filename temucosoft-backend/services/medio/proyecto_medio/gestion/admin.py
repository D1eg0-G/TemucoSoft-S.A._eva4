from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Usuario, Sucursal, Producto, Inventario, Venta, Caja,
    Proveedor, Compra, PedidoInterno, MovimientoInventario
)

class CustomUserAdmin(UserAdmin):
    model = Usuario
    list_display = ['username', 'email', 'role', 'empresa_id', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Datos Extra', {'fields': ('role', 'rut', 'empresa_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Datos Extra', {'fields': ('email', 'role', 'rut', 'empresa_id')}),
    )

admin.site.register(Usuario, CustomUserAdmin)
admin.site.register(Sucursal)
admin.site.register(Producto)
admin.site.register(Inventario)
admin.site.register(Venta)
admin.site.register(Caja)
# Nuevos del Plan Medio
admin.site.register(Proveedor)
admin.site.register(Compra)
admin.site.register(PedidoInterno)
admin.site.register(MovimientoInventario)