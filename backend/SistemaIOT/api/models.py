from django.db import models

# 📍 ZONA
class ZonaMonitoreo(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    direccion = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.nombre


# 📡 DISPOSITIVO
class DispositivoIoT(models.Model):
    codigo = models.CharField(max_length=50)
    ubicacion = models.CharField(max_length=100)
    estado = models.CharField(max_length=20)
    zona = models.ForeignKey(ZonaMonitoreo, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.codigo} - {self.zona.nombre}"


# 🌊 SENSOR
class Sensor(models.Model):
    tipo = models.CharField(max_length=50)
    unidad = models.CharField(max_length=20)
    dispositivo = models.ForeignKey(DispositivoIoT, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.tipo} ({self.dispositivo.codigo})"


# 📊 LECTURA NIVEL
class LecturaNivel(models.Model):
    valor = models.FloatField()
    fecha = models.DateTimeField(auto_now_add=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.valor} - {self.sensor.tipo}"


# ⚠️ ESTADO RIESGO
class EstadoRiesgo(models.Model):
    nivel = models.CharField(max_length=20)
    descripcion = models.TextField()

    def __str__(self):
        return self.nivel


# 🌦️ PRONÓSTICO
class Pronostico(models.Model):
    fecha = models.DateField()
    temperatura = models.FloatField()
    lluvia = models.BooleanField()
    descripcion = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.fecha} - {self.descripcion}"


# 🔮 PREDICCIÓN
class PrediccionRiesgo(models.Model):
    fecha = models.DateField()
    nivel_estimado = models.CharField(max_length=20)
    probabilidad = models.FloatField()

    def __str__(self):
        return f"{self.fecha} - {self.nivel_estimado}"


# 🚨 ALERTA
class Alerta(models.Model):
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    estado_riesgo = models.ForeignKey(EstadoRiesgo, on_delete=models.CASCADE)
    lectura = models.ForeignKey(LecturaNivel, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.estado_riesgo.nivel} - {self.mensaje[:30]}"


# 📢 NOTIFICACIÓN
class Notificacion(models.Model):
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    alerta = models.ForeignKey(Alerta, on_delete=models.CASCADE)

    def __str__(self):
        return f"Notificación - {self.alerta.estado_riesgo.nivel}"


# ⚙️ ACTUADOR
class Actuador(models.Model):
    tipo = models.CharField(max_length=50)
    estado = models.CharField(max_length=20)
    dispositivo = models.ForeignKey(DispositivoIoT, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.tipo} - {self.dispositivo.codigo}"


# 🔄 ESTADO ACTUADOR
class EstadoActuador(models.Model):
    estado = models.CharField(max_length=20)
    actuador = models.ForeignKey(Actuador, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.actuador.tipo} - {self.estado}"


# 🎮 COMANDO REMOTO
class ComandoRemoto(models.Model):
    comando = models.CharField(max_length=100)
    fecha = models.DateTimeField(auto_now_add=True)
    actuador = models.ForeignKey(Actuador, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.comando} - {self.actuador.tipo}"


# 📩 RESPUESTA COMANDO
class RespuestaComando(models.Model):
    respuesta = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    comando = models.ForeignKey(ComandoRemoto, on_delete=models.CASCADE)

    def __str__(self):
        return f"Respuesta - {self.comando.comando}"


# 👤 USUARIO
class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre


# 🔐 ROL
class Rol(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre


# 🔗 USUARIO-ROL
class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.usuario.nombre} - {self.rol.nombre}"


# 🧾 AUDITORÍA
class AuditoriaSistema(models.Model):
    accion = models.CharField(max_length=100)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.nombre if self.usuario else 'Sin usuario'} - {self.accion}"