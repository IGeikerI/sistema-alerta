from rest_framework import serializers
from .models import *

# ZONA
class ZonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaMonitoreo
        fields = '__all__'

# DISPOSITIVO
class DispositivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DispositivoIoT
        fields = '__all__'

# SENSOR
class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

# LECTURA
class LecturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LecturaNivel
        fields = '__all__'

# ESTADO RIESGO
class EstadoRiesgoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoRiesgo
        fields = '__all__'

# PRONOSTICO
class PronosticoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pronostico
        fields = '__all__'

# PREDICCION
class PrediccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrediccionRiesgo
        fields = '__all__'

# ALERTA
class AlertaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerta
        fields = '__all__'

# NOTIFICACION
class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'

# ACTUADOR
class ActuadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actuador
        fields = '__all__'

# ESTADO ACTUADOR
class EstadoActuadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoActuador
        fields = '__all__'

# COMANDO
class ComandoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComandoRemoto
        fields = '__all__'

# RESPUESTA
class RespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaComando
        fields = '__all__'

# USUARIO
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

# ROL
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

# USUARIO ROL
class UsuarioRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRol
        fields = '__all__'

# AUDITORIA
class AuditoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditoriaSistema
        fields = '__all__'