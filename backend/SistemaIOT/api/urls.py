from django.urls import path
from .views import *

urlpatterns = [

    # AUTH
    path('register/', register),
    path('login/', login),

    # LECTURA IOT
    path('lecturas/', crear_lectura),
    path('lecturas/list/', lectura_list),

    # ZONA
    path('zonas/', zona_list),
    path('zonas/create/', zona_create),

    # DISPOSITIVO
    path('dispositivos/', dispositivo_list),
    path('dispositivos/create/', dispositivo_create),

    # SENSOR
    path('sensores/', sensor_list),
    path('sensores/create/', sensor_create),

    # ESTADO RIESGO
    path('estados/', estado_list),

    # ALERTA
    path('alertas/', alerta_list),

    # NOTIFICACION
    path('notificaciones/', notificacion_list),

    # CLIMA
    path('pronostico/', pronostico_list),
    path('prediccion/', prediccion_list),

    # ACTUADORES
    path('actuadores/', actuador_list),
    path('estado-actuador/', estado_actuador_list),

    # COMANDOS
    path('comandos/', comando_list),
    path('respuestas/', respuesta_list),

    # USUARIOS
    path('usuarios/', usuario_list),
    path('roles/', rol_list),
    path('usuario-rol/', usuario_rol_list),

    # AUDITORIA
    path('auditoria/', auditoria_list),
]