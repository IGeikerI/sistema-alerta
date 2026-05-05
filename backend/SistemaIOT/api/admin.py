from django.contrib import admin
from .models import *

# 🔥 USUARIO
@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'email')
    search_fields = ('nombre', 'email')


# 🔥 ROL
@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
    search_fields = ('nombre',)


# 🔥 USUARIO - ROL (CLAVE)
@admin.register(UsuarioRol)
class UsuarioRolAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'rol')
    list_select_related = ('usuario', 'rol')
    search_fields = ('usuario__nombre', 'rol__nombre')


# 🔥 RESTO (OPCIONAL PERO RECOMENDADO)

@admin.register(ZonaMonitoreo)
class ZonaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'direccion')


@admin.register(DispositivoIoT)
class DispositivoAdmin(admin.ModelAdmin):
    list_display = ('id', 'codigo', 'zona', 'estado')


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'dispositivo')


@admin.register(LecturaNivel)
class LecturaAdmin(admin.ModelAdmin):
    list_display = ('id', 'valor', 'sensor', 'fecha')


@admin.register(EstadoRiesgo)
class EstadoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nivel')


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('id', 'estado_riesgo', 'fecha')


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'alerta', 'fecha')


@admin.register(Actuador)
class ActuadorAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'dispositivo')


@admin.register(EstadoActuador)
class EstadoActuadorAdmin(admin.ModelAdmin):
    list_display = ('id', 'estado', 'actuador')


@admin.register(ComandoRemoto)
class ComandoAdmin(admin.ModelAdmin):
    list_display = ('id', 'comando', 'actuador')


@admin.register(RespuestaComando)
class RespuestaAdmin(admin.ModelAdmin):
    list_display = ('id', 'comando', 'fecha')


@admin.register(Pronostico)
class PronosticoAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'descripcion')


@admin.register(PrediccionRiesgo)
class PrediccionAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha', 'nivel_estimado')


@admin.register(AuditoriaSistema)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'accion', 'fecha')
    
    
@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'url_frontend', 'icono', 'orden', 'estado')
    search_fields = ('nombre', 'url_frontend')
    list_filter = ('estado',)


@admin.register(RolRecurso)
class RolRecursoAdmin(admin.ModelAdmin):
    list_display = ('id', 'rol', 'recurso')
    search_fields = ('rol__nombre', 'recurso__nombre')
    list_filter = ('rol',)