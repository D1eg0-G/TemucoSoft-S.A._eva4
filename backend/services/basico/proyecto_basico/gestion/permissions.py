from rest_framework import permissions

class IsGerente(permissions.BasePermission):
    """Permite acceso solo a Gerentes o Admins"""
    def has_permission(self, request, view):
        # Asumimos que el usuario tiene un campo 'role'
        return request.user.is_authenticated and request.user.role in ['admin_cliente', 'gerente']

class IsVendedor(permissions.BasePermission):
    """Permite acceso a Vendedores"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'vendedor'

class ReadOnly(permissions.BasePermission):
    """Permite solo lectura (GET, HEAD, OPTIONS)"""
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS