from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from django.contrib.auth.hashers import make_password, check_password

from rest_framework_simplejwt.tokens import RefreshToken

from .models import *
from .serializers import *
from rest_framework.permissions import AllowAny

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

    # 🔥 OBTENER ROLES DEL USUARIO
    user_roles = UsuarioRol.objects.filter(usuario=user).select_related('rol')
    roles = [
        {
            'id': ur.rol.id,
            'nombre': ur.rol.nombre
        }
        for ur in user_roles
    ]

    # 🔥 DEVOLVER LA RESPUESTA CORRECTA
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'usuario': {
            'id': user.id,
            'nombre': user.nombre,
            'email': user.email
        },
        'roles': roles,
        'recursos': []  # 🔥 AQUÍ PUEDES AGREGAR LÓGICA DE RECURSOS SI LOS TIENES
    })


# ==========================
# 📊 LECTURA (IoT + lógica)
# ==========================

@api_view(['POST'])
def crear_lectura(request):
    try:
        valor = request.data['valor']
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

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ==========================
# 🔥 VIEWSETS PROFESIONALES
# ==========================

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
    permission_classes = [IsAuthenticated]


class EstadoRiesgoViewSet(ModelViewSet):
    queryset = EstadoRiesgo.objects.all()
    serializer_class = EstadoRiesgoSerializer
    permission_classes = [IsAuthenticated]


class AlertaViewSet(ModelViewSet):
    queryset = Alerta.objects.all()
    serializer_class = AlertaSerializer
    permission_classes = [IsAuthenticated]


class NotificacionViewSet(ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]


class PronosticoViewSet(ModelViewSet):
    queryset = Pronostico.objects.all()
    serializer_class = PronosticoSerializer
    permission_classes = [IsAuthenticated]


class PrediccionViewSet(ModelViewSet):
    queryset = PrediccionRiesgo.objects.all()
    serializer_class = PrediccionSerializer
    permission_classes = [IsAuthenticated]


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