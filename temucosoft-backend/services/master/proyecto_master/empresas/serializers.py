from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UsuarioAdmin, Empresa, Plan, Suscripcion, Facturacion

User = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UsuarioAdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)
    empresa_nombre = serializers.SerializerMethodField()
    user = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = UsuarioAdmin
        fields = ['id', 'username', 'email', 'password', 'user', 'empresa', 'empresa_nombre', 'role', 'activo', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion', 'user']

    def get_empresa_nombre(self, obj):
        if obj.empresa:
            return obj.empresa.nombre
        return "Sin Asignar"

    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password', 'temp123')
        
        # Crear usuario Django
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=True  # Asegurar que está activo
        )
        
        # Crear UsuarioAdmin
        admin_user = UsuarioAdmin.objects.create(
            user=user,
            **validated_data
        )
        return admin_user

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'

class SuscripcionSerializer(serializers.ModelSerializer):
    plan_nombre = serializers.CharField(source='plan.nombre', read_only=True)
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)
    
    class Meta:
        model = Suscripcion
        fields = ['id', 'empresa', 'empresa_nombre', 'plan', 'plan_nombre', 'fecha_inicio', 'fecha_fin', 'estado', 'activo', 'ec2_instance']

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