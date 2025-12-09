from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Usuario, Sucursal, Producto, Inventario, Venta, Caja,
    Proveedor, Compra, PedidoInterno, MovimientoInventario,
    ClienteFinal, OrdenEcommerce, ApiToken
)

class CustomUserAdmin(UserAdmin):
    model = Usuario
    list_display = ['username', 'email', 'role', 'empresa_id']
    fieldsets = UserAdmin.fieldsets + (
        ('Datos Extra', {'fields': ('role', 'rut', 'empresa_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Datos Extra', {'fields': ('email', 'role', 'rut', 'empresa_id')}),
    )

admin.site.register(Usuario, CustomUserAdmin)
# Básico
admin.site.register(Sucursal)
admin.site.register(Producto)
admin.site.register(Inventario)
admin.site.register(Venta)
admin.site.register(Caja)
# Medio
admin.site.register(Proveedor)
admin.site.register(Compra)
admin.site.register(MovimientoInventario)
# Premium
admin.site.register(ClienteFinal)
admin.site.register(OrdenEcommerce)
admin.site.register(ApiToken)