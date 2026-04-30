from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password, check_password

from rest_framework_simplejwt.tokens import RefreshToken

from .models import *
from .serializers import *

# ==========================
# 🔐 AUTH (JWT MODERNO)
# ==========================

@api_view(['POST'])
def register(request):
    try:
        data = request.data

        # validar email único
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
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = Usuario.objects.get(email=email)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no existe'}, status=404)

    if not check_password(password, user.password):
        return Response({'error': 'Contraseña incorrecta'}, status=401)

    # 🔥 generar JWT
    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'nombre': user.nombre,
            'email': user.email
        }
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

        # lógica de riesgo
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
# 🔒 CRUD PROTEGIDO CON JWT
# ==========================

def crud_list(model, serializer):
    @api_view(['GET'])
    @permission_classes([IsAuthenticated])
    def view(request):
        data = model.objects.all()
        return Response(serializer(data, many=True).data)
    return view


def crud_create(model, serializer):
    @api_view(['POST'])
    @permission_classes([IsAuthenticated])
    def view(request):
        obj = model.objects.create(**request.data)
        return Response(serializer(obj).data)
    return view


# ==========================
# 📂 VISTAS POR TABLA
# ==========================

zona_list = crud_list(ZonaMonitoreo, ZonaSerializer)
zona_create = crud_create(ZonaMonitoreo, ZonaSerializer)

dispositivo_list = crud_list(DispositivoIoT, DispositivoSerializer)
dispositivo_create = crud_create(DispositivoIoT, DispositivoSerializer)

sensor_list = crud_list(Sensor, SensorSerializer)
sensor_create = crud_create(Sensor, SensorSerializer)

lectura_list = crud_list(LecturaNivel, LecturaSerializer)

estado_list = crud_list(EstadoRiesgo, EstadoRiesgoSerializer)

alerta_list = crud_list(Alerta, AlertaSerializer)

notificacion_list = crud_list(Notificacion, NotificacionSerializer)

pronostico_list = crud_list(Pronostico, PronosticoSerializer)
prediccion_list = crud_list(PrediccionRiesgo, PrediccionSerializer)

actuador_list = crud_list(Actuador, ActuadorSerializer)
estado_actuador_list = crud_list(EstadoActuador, EstadoActuadorSerializer)

comando_list = crud_list(ComandoRemoto, ComandoSerializer)
respuesta_list = crud_list(RespuestaComando, RespuestaSerializer)

usuario_list = crud_list(Usuario, UsuarioSerializer)
rol_list = crud_list(Rol, RolSerializer)
usuario_rol_list = crud_list(UsuarioRol, UsuarioRolSerializer)

auditoria_list = crud_list(AuditoriaSistema, AuditoriaSerializer)