from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet

from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings

from rest_framework_simplejwt.tokens import RefreshToken

import json
import urllib.request
import urllib.parse
import urllib.error

from .models import *
from .serializers import *
from .prediccion_service import generar_prediccion_para_lectura, resumen_predicciones
from .services import procesar_alerta
from .authentication import UsuarioJWTAuthentication


# ==========================
# 🔐 AUTH (JWT MODERNO)
# ==========================

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register(request):
    try:
        data = request.data

        if Usuario.objects.filter(email=data['email']).exists():
            return Response({'error': 'El correo ya existe'}, status=400)

        data['password'] = make_password(data['password'])

        user = Usuario.objects.create(**data)

        return Response({
            'message': 'Usuario creado correctamente',
            'user': UsuarioSerializer(user).data
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = Usuario.objects.get(email=email)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no existe'}, status=404)

    if not check_password(password, user.password):
        return Response({'error': 'Contraseña incorrecta'}, status=401)

    refresh = RefreshToken.for_user(user)

    # 🔥 Obtener roles del usuario
    user_roles = UsuarioRol.objects.filter(usuario=user).select_related('rol')

    roles = [
        {
            'id': ur.rol.id,
            'nombre': ur.rol.nombre
        }
        for ur in user_roles
    ]

    # 🔥 Obtener recursos permitidos según los roles
    roles_ids = [ur.rol.id for ur in user_roles]

    recursos_qs = Recurso.objects.filter(
        rolrecurso__rol_id__in=roles_ids,
        estado__iexact='ACTIVO'
    ).distinct().order_by('orden')

    recursos = RecursoSerializer(recursos_qs, many=True).data

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'usuario': {
            'id': user.id,
            'nombre': user.nombre,
            'email': user.email
        },
        'roles': roles,
        'recursos': recursos
    })


# ==========================
# 📊 LECTURA (IoT + lógica)
# ==========================

def guardar_lectura_iot(data):
    try:
        valor = float(data['valor'])
        sensor_id = data['sensor']

        sensor = Sensor.objects.get(id=sensor_id)

        lectura = LecturaNivel.objects.create(
            valor=valor,
            sensor=sensor
        )

        resultado_alerta = procesar_alerta(lectura)
        prediccion = None
        error_prediccion = None

        try:
            prediccion = generar_prediccion_para_lectura(lectura)
        except Exception as e:
            error_prediccion = str(e)

        return Response({
            'lectura': lectura.id,
            'nivel': resultado_alerta['nivel'],
            'alerta_generada': resultado_alerta['alerta_generada'],
            'alerta': resultado_alerta['alerta'].id if resultado_alerta['alerta'] else None,
            'notificacion': resultado_alerta['notificacion'].id if resultado_alerta['notificacion'] else None,
            'prediccion': PrediccionSerializer(prediccion).data if prediccion else None,
            'error_prediccion': error_prediccion,
            'detalle': resultado_alerta['motivo'],
        })

    except Sensor.DoesNotExist:
        return Response({'error': 'El sensor no existe'}, status=404)

    except EstadoRiesgo.DoesNotExist:
        return Response({'error': 'El estado de riesgo no existe en la base de datos'}, status=404)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def crear_lectura(request):
    return guardar_lectura_iot(request.data)


def calcular_estado_lectura(valor):
    if valor > 250:
        return 'NORMAL'

    if valor > 100:
        return 'ALERTA'

    return 'PELIGRO'


@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def lecturas_tiempo_real(request):
    if request.method == 'GET':
        sensor_id = request.query_params.get('sensor')
        queryset = LecturaTiempoReal.objects.select_related('sensor').order_by('-fecha')

        if sensor_id:
            queryset = queryset.filter(sensor_id=sensor_id)

        lectura = queryset.first()

        if not lectura:
            return Response({'detail': 'Sin lecturas en tiempo real'}, status=404)

        return Response(LecturaTiempoRealSerializer(lectura).data)

    try:
        valor = float(request.data['valor'])
        sensor_id = request.data['sensor']
        estado = request.data.get('estado') or calcular_estado_lectura(valor)
        estado = str(estado).upper()

        sensor = Sensor.objects.get(id=sensor_id)

        lectura, _ = LecturaTiempoReal.objects.update_or_create(
            sensor=sensor,
            defaults={
                'valor': valor,
                'estado': estado,
            }
        )

        return Response(LecturaTiempoRealSerializer(lectura).data)

    except Sensor.DoesNotExist:
        return Response({'error': 'El sensor no existe'}, status=404)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def alertas_recientes(request):
    alertas = (
        Alerta.objects
        .select_related('estado_riesgo', 'lectura', 'lectura__sensor')
        .filter(estado_riesgo__nivel__iregex='^(ALERTA|PELIGRO)$')
        .order_by('-fecha')[:10]
    )
    return Response(AlertaDetalleSerializer(alertas, many=True).data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def eventos_criticos(request):
    alertas = (
        Alerta.objects
        .select_related('estado_riesgo', 'lectura', 'lectura__sensor')
        .filter(estado_riesgo__nivel__iexact='PELIGRO')
        .order_by('-fecha')
    )
    return Response(AlertaDetalleSerializer(alertas, many=True).data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def alertas_historial(request):
    alertas = (
        Alerta.objects
        .select_related('estado_riesgo', 'lectura', 'lectura__sensor')
        .filter(estado_riesgo__nivel__iregex='^(ALERTA|PELIGRO)$')
        .order_by('-fecha')
    )
    return Response(AlertaDetalleSerializer(alertas, many=True).data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def predicciones_resumen(request):
    return Response(resumen_predicciones())


# ==========================
# 🌦️ OPENWEATHER DESDE BACKEND
# ==========================

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def openweather_actual(request):
    try:
        api_key = getattr(settings, "OPENWEATHER_API_KEY", "")
        lat = getattr(settings, "OPENWEATHER_LAT", "11.5444")
        lon = getattr(settings, "OPENWEATHER_LON", "-72.9072")

        if not api_key:
            return Response(
                {
                    'error': 'No está configurada la API KEY de OpenWeather en Railway.',
                    'sugerencia': 'Agrega OPENWEATHER_API_KEY en Variables del servicio backend.'
                },
                status=500
            )

        params = urllib.parse.urlencode({
            'lat': lat,
            'lon': lon,
            'appid': api_key,
            'units': 'metric',
            'lang': 'es'
        })

        url = f'https://api.openweathermap.org/data/2.5/weather?{params}'

        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                data = json.loads(response.read().decode('utf-8'))

            return Response(data)

        except urllib.error.HTTPError as e:
            detalle = e.read().decode('utf-8')

            return Response(
                {
                    'error': 'OpenWeather rechazó la solicitud.',
                    'status_openweather': e.code,
                    'detalle': detalle
                },
                status=500
            )

    except Exception as e:
        return Response(
            {
                'error': 'No fue posible consultar el clima actual.',
                'detail': str(e)
            },
            status=500
        )


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def openweather_forecast(request):
    try:
        api_key = getattr(settings, "OPENWEATHER_API_KEY", "")
        lat = getattr(settings, "OPENWEATHER_LAT", "11.5444")
        lon = getattr(settings, "OPENWEATHER_LON", "-72.9072")

        if not api_key:
            return Response(
                {
                    'error': 'No está configurada la API KEY de OpenWeather en Railway.',
                    'sugerencia': 'Agrega OPENWEATHER_API_KEY en Variables del servicio backend.'
                },
                status=500
            )

        params = urllib.parse.urlencode({
            'lat': lat,
            'lon': lon,
            'appid': api_key,
            'units': 'metric',
            'lang': 'es'
        })

        url = f'https://api.openweathermap.org/data/2.5/forecast?{params}'

        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                data = json.loads(response.read().decode('utf-8'))

            return Response(data)

        except urllib.error.HTTPError as e:
            detalle = e.read().decode('utf-8')

            return Response(
                {
                    'error': 'OpenWeather rechazó la solicitud.',
                    'status_openweather': e.code,
                    'detalle': detalle
                },
                status=500
            )

    except Exception as e:
        return Response(
            {
                'error': 'No fue posible consultar el pronóstico.',
                'detail': str(e)
            },
            status=500
        )


# ==========================
# 🔥 VIEWSETS PROFESIONALES
# ==========================

class UsuarioJWTProtectedViewSet(ModelViewSet):
    authentication_classes = [UsuarioJWTAuthentication]
    permission_classes = [IsAuthenticated]


class PublicReadUsuarioJWTWriteProtectedViewSet(ModelViewSet):
    def get_authenticators(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return []
        return [UsuarioJWTAuthentication()]

    def get_permissions(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAuthenticated()]


class RecursoViewSet(UsuarioJWTProtectedViewSet):
    queryset = Recurso.objects.all().order_by('orden')
    serializer_class = RecursoSerializer


class RolRecursoViewSet(UsuarioJWTProtectedViewSet):
    queryset = RolRecurso.objects.all()
    serializer_class = RolRecursoSerializer


class ZonaViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = ZonaMonitoreo.objects.all()
    serializer_class = ZonaSerializer


class DispositivoViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = DispositivoIoT.objects.all()
    serializer_class = DispositivoSerializer


class SensorViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer


class LecturaViewSet(ModelViewSet):
    queryset = LecturaNivel.objects.all()
    serializer_class = LecturaSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        return guardar_lectura_iot(request.data)


class EstadoRiesgoViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = EstadoRiesgo.objects.all()
    serializer_class = EstadoRiesgoSerializer


class AlertaViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = Alerta.objects.all()
    serializer_class = AlertaDetalleSerializer

    def get_queryset(self):
        return (
            Alerta.objects
            .select_related('estado_riesgo', 'lectura', 'lectura__sensor')
            .filter(estado_riesgo__nivel__iregex='^(ALERTA|PELIGRO)$')
            .order_by('-fecha', '-id')
        )


class NotificacionViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = Notificacion.objects.select_related('alerta', 'alerta__estado_riesgo').order_by('-fecha', '-id')
    serializer_class = NotificacionSerializer


class PronosticoViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = Pronostico.objects.all()
    serializer_class = PronosticoSerializer

class PrediccionViewSet(ModelViewSet):
    queryset = PrediccionRiesgo.objects.all()
    serializer_class = PrediccionSerializer
    authentication_classes = []
    permission_classes = [AllowAny]
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):
        queryset = PrediccionRiesgo.objects.all().order_by('-fecha', '-id')
        limit = self.request.query_params.get('limit')

        if limit:
            try:
                limit = max(0, int(limit))
                return queryset[:limit]
            except ValueError:
                return queryset

        return queryset


class ActuadorViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = Actuador.objects.all()
    serializer_class = ActuadorSerializer


class EstadoActuadorViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = EstadoActuador.objects.all()
    serializer_class = EstadoActuadorSerializer


class ComandoViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = ComandoRemoto.objects.all()
    serializer_class = ComandoSerializer


class RespuestaViewSet(PublicReadUsuarioJWTWriteProtectedViewSet):
    queryset = RespuestaComando.objects.all()
    serializer_class = RespuestaSerializer


class UsuarioViewSet(UsuarioJWTProtectedViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


class RolViewSet(UsuarioJWTProtectedViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


class UsuarioRolViewSet(UsuarioJWTProtectedViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer


class AuditoriaViewSet(UsuarioJWTProtectedViewSet):
    queryset = AuditoriaSistema.objects.all()
    serializer_class = AuditoriaSerializer
