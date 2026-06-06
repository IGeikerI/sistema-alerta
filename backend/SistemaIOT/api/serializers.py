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
    nivel = serializers.CharField(source='nivel_estimado', read_only=True)

    class Meta:
        model = PrediccionRiesgo
        fields = (
            'id',
            'fecha',
            'nivel',
            'nivel_estimado',
            'probabilidad',
            'valor_entrada',
        )

# ALERTA
class AlertaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerta
        fields = '__all__'


class AlertaDetalleSerializer(serializers.ModelSerializer):
    nivel = serializers.CharField(source='estado_riesgo.nivel', read_only=True)
    lectura_id = serializers.IntegerField(source='lectura.id', read_only=True)
    lectura_valor = serializers.FloatField(source='lectura.valor', read_only=True)
    lectura_fecha = serializers.DateTimeField(source='lectura.fecha', read_only=True)
    sensor_id = serializers.IntegerField(source='lectura.sensor.id', read_only=True)
    sensor_tipo = serializers.CharField(source='lectura.sensor.tipo', read_only=True)

    class Meta:
        model = Alerta
        fields = (
            'id',
            'mensaje',
            'fecha',
            'nivel',
            'estado_riesgo',
            'lectura_id',
            'lectura_valor',
            'lectura_fecha',
            'sensor_id',
            'sensor_tipo',
        )

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
        fields = ('id', 'nombre', 'email')

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


class RecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = '__all__'


class RolRecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolRecurso
        fields = '__all__'

        
