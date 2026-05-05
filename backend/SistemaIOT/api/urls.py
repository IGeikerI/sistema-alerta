from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register('zonas', ZonaViewSet)
router.register('dispositivos', DispositivoViewSet)
router.register('sensores', SensorViewSet)
router.register('lecturas', LecturaViewSet)
router.register('estados', EstadoRiesgoViewSet)
router.register('alertas', AlertaViewSet)
router.register('notificaciones', NotificacionViewSet)
router.register('pronosticos', PronosticoViewSet)
router.register('predicciones', PrediccionViewSet)
router.register('actuadores', ActuadorViewSet)
router.register('estado-actuador', EstadoActuadorViewSet)
router.register('comandos', ComandoViewSet)
router.register('respuestas', RespuestaViewSet)
router.register('usuarios', UsuarioViewSet)
router.register('roles', RolViewSet)
router.register('usuario-rol', UsuarioRolViewSet)
router.register('auditoria', AuditoriaViewSet)
router.register('recursos', RecursoViewSet)
router.register('roles-recursos', RolRecursoViewSet)

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('lecturas-iot/', crear_lectura),  # 👈 renombrada para no chocar
]

urlpatterns += router.urls