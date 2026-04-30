from django.db import models

# 📍 ZONA
class ZonaMonitoreo(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    direccion = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255, null=True, blank=True)

# 📡 DISPOSITIVO
class DispositivoIoT(models.Model):
    codigo = models.CharField(max_length=50)
    ubicacion = models.CharField(max_length=100)
    estado = models.CharField(max_length=20)
    zona = models.ForeignKey(ZonaMonitoreo, on_delete=models.CASCADE)

# 🌊 SENSOR
class Sensor(models.Model):
    tipo = models.CharField(max_length=50)
    unidad = models.CharField(max_length=20)
    dispositivo = models.ForeignKey(DispositivoIoT, on_delete=models.CASCADE)

# 📊 LECTURA NIVEL
class LecturaNivel(models.Model):
    valor = models.FloatField()
    fecha = models.DateTimeField(auto_now_add=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)

# ⚠️ ESTADO RIESGO
class EstadoRiesgo(models.Model):
    nivel = models.CharField(max_length=20)  # Normal, Alerta, Peligro
    descripcion = models.TextField()

# 🌦️ PRONÓSTICO
class Pronostico(models.Model):
    fecha = models.DateField()
    temperatura = models.FloatField()
    lluvia = models.BooleanField()
    descripcion = models.CharField(max_length=100)

# 🔮 PREDICCIÓN
class PrediccionRiesgo(models.Model):
    fecha = models.DateField()
    nivel_estimado = models.CharField(max_length=20)
    probabilidad = models.FloatField()

# 🚨 ALERTA
class Alerta(models.Model):
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    estado_riesgo = models.ForeignKey(EstadoRiesgo, on_delete=models.CASCADE)
    lectura = models.ForeignKey(LecturaNivel, on_delete=models.CASCADE)

# 📢 NOTIFICACIÓN
class Notificacion(models.Model):
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    alerta = models.ForeignKey(Alerta, on_delete=models.CASCADE)

# ⚙️ ACTUADOR
class Actuador(models.Model):
    tipo = models.CharField(max_length=50)
    estado = models.CharField(max_length=20)
    dispositivo = models.ForeignKey(DispositivoIoT, on_delete=models.CASCADE)

# 🔄 ESTADO ACTUADOR
class EstadoActuador(models.Model):
    estado = models.CharField(max_length=20)
    actuador = models.ForeignKey(Actuador, on_delete=models.CASCADE)

# 🎮 COMANDO REMOTO
class ComandoRemoto(models.Model):
    comando = models.CharField(max_length=100)
    fecha = models.DateTimeField(auto_now_add=True)
    actuador = models.ForeignKey(Actuador, on_delete=models.CASCADE)

# 📩 RESPUESTA COMANDO
class RespuestaComando(models.Model):
    respuesta = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    comando = models.ForeignKey(ComandoRemoto, on_delete=models.CASCADE)

# 👤 USUARIO
class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

# 🔐 ROL
class Rol(models.Model):
    nombre = models.CharField(max_length=50)

# 🔗 USUARIO-ROL
class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

# 🧾 AUDITORÍA
class AuditoriaSistema(models.Model):
    accion = models.CharField(max_length=100)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    fecha = models.DateTimeField(auto_now_add=True)