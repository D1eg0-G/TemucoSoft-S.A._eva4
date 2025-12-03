from rest_framework import serializers
from .models import Empresa, Plan, Suscripcion, Facturacion

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'

class SuscripcionSerializer(serializers.ModelSerializer):
    plan_nombre = serializers.CharField(source='plan.nombre', read_only=True)
    
    class Meta:
        model = Suscripcion
        fields = ['plan', 'plan_nombre', 'fecha_inicio', 'estado', 'ec2_instance']

class FacturacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facturacion
        fields = ['id', 'monto', 'fecha_pago', 'estado']

class EmpresaSerializer(serializers.ModelSerializer):
    suscripcion = SuscripcionSerializer(read_only=True)
    historial_pagos = FacturacionSerializer(source='facturacion_set', many=True, read_only=True)
    
    class Meta:
        model = Empresa
        fields = [
            'id', 
            'nombre', 
            'rut', 
            'email',           # ✅ Campo correcto
            'telefono',
            'direccion',
            'db_host', 
            'db_name',
            'db_user',
            'db_password',
            'tenant_token', 
            'fecha_registro',
            'activo',
            'suscripcion', 
            'historial_pagos'
        ]
        extra_kwargs = {
            'telefono': {'required': False},
            'direccion': {'required': False},
            'db_host': {'required': False},
            'db_name': {'required': False},
            'db_user': {'required': False},
            'db_password': {'required': False, 'write_only': True},
            'tenant_token': {'required': False},
            'activo': {'required': False, 'default': True},
        }