import re
from django.core.exceptions import ValidationError
from itertools import cycle
from django.utils import timezone
import datetime

def validar_rut(rut):
    """
    Valida un RUT chileno (con o sin puntos/guión).
    Retorna True si es válido, lanza ValidationError si no.
    """
    if not rut:
        raise ValidationError("El RUT no puede estar vacío.")

    rut = rut.lower()
    rut = re.sub(r'[^a-z0-9]', '', rut)
    
    if len(rut) < 2:
        raise ValidationError("El RUT es demasiado corto.")
        
    cuerpo, dv = rut[:-1], rut[-1]
    
    try:
        cuerpo_num = int(cuerpo)
    except ValueError:
        raise ValidationError("El cuerpo del RUT debe ser numérico.")
        
    reversed_digits = map(int, reversed(str(cuerpo)))
    factors = cycle(range(2, 8))
    s = sum(d * f for d, f in zip(reversed_digits, factors))
    mod = 11 - (s % 11)
    
    if mod == 11:
        expected_dv = '0'
    elif mod == 10:
        expected_dv = 'k'
    else:
        expected_dv = str(mod)
        
    if dv != expected_dv:
        raise ValidationError(f"RUT inválido. El dígito verificador no coincide.")
    
    return rut  # Retornamos el rut limpio si pasa

def validar_precio_positivo(value):
    """Para Precios y Stock (Acepta 0)"""
    if value < 0:
        raise ValidationError("El valor no puede ser negativo.")

def validar_cantidad_item(value):
    """Para Items de Venta o Carrito (Debe ser al menos 1)"""
    if value < 1:
        raise ValidationError("La cantidad debe ser al menos 1.")

def validar_fecha_no_futura(value):
    """
    Valida que una fecha no sea mayor a hoy.
    Sirve para Ventas (Sale) y Compras (Purchase).
    """
    # Si el valor es datetime, extraemos la fecha. Si es date, lo usamos directo.
    fecha_input = value.date() if isinstance(value, datetime.datetime) else value
    fecha_hoy = timezone.now().date()
    
    if fecha_input > fecha_hoy:
        raise ValidationError("La fecha no puede estar en el futuro.")
    
def validar_telefono_chileno(telefono):
    """
    Valida un número de celular chileno.
    Formatos aceptados: +569xxxxxxxx, 569xxxxxxxx, 9xxxxxxxx
    """
    if not telefono:
        return # Si el campo es opcional y viene vacío, pasamos.

    # Limpiar espacios y guiones
    telefono_limpio = re.sub(r'[\s-]', '', str(telefono))

    # Regex: Opcionalmente +56 o 56, seguido obligatoriamente de un 9 y 8 dígitos más
    patron = r'^(\+?56)?9\d{8}$'
    
    if not re.match(patron, telefono_limpio):
        raise ValidationError("Formato inválido. Use formato celular chileno (ej: +56912345678 o 912345678).")