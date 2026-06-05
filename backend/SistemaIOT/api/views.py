from rest_framework.decorators import api_view, permission_classes
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


# ==========================
# 🔐 AUTH (JWT MODERNO)
# ==========================

@api_view(['POST'])
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_lectura(request):
    try:
        valor = float(request.data['valor'])
        sensor_id = request.data['sensor']

        sensor = Sensor.objects.get(id=sensor_id)

        lectura = LecturaNivel.objects.create(
            valor=valor,
            sensor=sensor
        )

        if valor < 10:
            nivel = "Normal"
        elif valor < 20:
            nivel = "Alerta"
        else:
            nivel = "Peligro"

        estado = EstadoRiesgo.objects.get(nivel=nivel)

        if nivel == "Peligro":
            alerta = Alerta.objects.create(
                mensaje="⚠️ Nivel crítico de agua",
                estado_riesgo=estado,
                lectura=lectura
            )

            Notificacion.objects.create(
                mensaje="🚨 Posible inundación",
                alerta=alerta
            )

        return Response({
            'lectura': lectura.id,
            'nivel': nivel
        })

    except Sensor.DoesNotExist:
        return Response({'error': 'El sensor no existe'}, status=404)

    except EstadoRiesgo.DoesNotExist:
        return Response({'error': 'El estado de riesgo no existe en la base de datos'}, status=404)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ==========================
# 🌦️ OPENWEATHER DESDE BACKEND
# ==========================

@api_view(['GET'])
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

class RecursoViewSet(ModelViewSet):
    queryset = Recurso.objects.all().order_by('orden')
    serializer_class = RecursoSerializer
    permission_classes = [AllowAny]


class RolRecursoViewSet(ModelViewSet):
    queryset = RolRecurso.objects.all()
    serializer_class = RolRecursoSerializer
    permission_classes = [AllowAny]


class ZonaViewSet(ModelViewSet):
    queryset = ZonaMonitoreo.objects.all()
    serializer_class = ZonaSerializer
    permission_classes = [IsAuthenticated]


class DispositivoViewSet(ModelViewSet):
    queryset = DispositivoIoT.objects.all()
    serializer_class = DispositivoSerializer
    permission_classes = [IsAuthenticated]


class SensorViewSet(ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]


class LecturaViewSet(ModelViewSet):
    queryset = LecturaNivel.objects.all()
    serializer_class = LecturaSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    

class EstadoRiesgoViewSet(ModelViewSet):
    queryset = EstadoRiesgo.objects.all()
    serializer_class = EstadoRiesgoSerializer
    permission_classes = [IsAuthenticated]


class AlertaViewSet(ModelViewSet):
    queryset = Alerta.objects.all()
    serializer_class = AlertaSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class NotificacionViewSet(ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class PronosticoViewSet(ModelViewSet):
    queryset = Pronostico.objects.all()
    serializer_class = PronosticoSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class PrediccionViewSet(ModelViewSet):
    queryset = PrediccionRiesgo.objects.all()
    serializer_class = PrediccionSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class ActuadorViewSet(ModelViewSet):
    queryset = Actuador.objects.all()
    serializer_class = ActuadorSerializer
    permission_classes = [IsAuthenticated]


class EstadoActuadorViewSet(ModelViewSet):
    queryset = EstadoActuador.objects.all()
    serializer_class = EstadoActuadorSerializer
    permission_classes = [IsAuthenticated]


class ComandoViewSet(ModelViewSet):
    queryset = ComandoRemoto.objects.all()
    serializer_class = ComandoSerializer
    permission_classes = [IsAuthenticated]


class RespuestaViewSet(ModelViewSet):
    queryset = RespuestaComando.objects.all()
    serializer_class = RespuestaSerializer
    permission_classes = [IsAuthenticated]


class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


class RolViewSet(ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]


class UsuarioRolViewSet(ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer
    permission_classes = [IsAuthenticated]


class AuditoriaViewSet(ModelViewSet):
    queryset = AuditoriaSistema.objects.all()
    serializer_class = AuditoriaSerializer
    permission_classes = [IsAuthenticated]