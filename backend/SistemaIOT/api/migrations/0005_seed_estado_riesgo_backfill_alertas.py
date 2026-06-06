from django.db import migrations


def clasificar_nivel(valor):
    if valor >= 250:
        return "NORMAL"
    if valor > 120:
        return "PELIGRO"
    return "ALERTA"


def seed_estados_y_alertas(apps, schema_editor):
    EstadoRiesgo = apps.get_model('api', 'EstadoRiesgo')
    LecturaNivel = apps.get_model('api', 'LecturaNivel')
    Alerta = apps.get_model('api', 'Alerta')
    Notificacion = apps.get_model('api', 'Notificacion')

    estados = {
        "NORMAL": "Nivel de agua dentro del rango normal.",
        "ALERTA": "Nivel de agua en alerta; requiere seguimiento.",
        "PELIGRO": "Nivel critico de agua; posible evento de inundacion.",
    }

    estados_creados = {}
    for nivel, descripcion in estados.items():
        estado, _ = EstadoRiesgo.objects.get_or_create(
            nivel=nivel,
            defaults={'descripcion': descripcion}
        )
        estados_creados[nivel] = estado

    for lectura in LecturaNivel.objects.order_by('fecha', 'id'):
        nivel = clasificar_nivel(lectura.valor)

        if nivel == "NORMAL":
            continue

        if Alerta.objects.filter(lectura=lectura).exists():
            continue

        if nivel == "ALERTA":
            mensaje_alerta = "Nivel de agua en estado de alerta"
            mensaje_notificacion = "Se detecto una lectura en nivel ALERTA"
        else:
            mensaje_alerta = "Nivel critico de agua"
            mensaje_notificacion = "Evento critico: posible inundacion"

        alerta = Alerta.objects.create(
            mensaje=mensaje_alerta,
            estado_riesgo=estados_creados[nivel],
            lectura=lectura
        )

        Notificacion.objects.create(
            mensaje=mensaje_notificacion,
            alerta=alerta
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_prediccionriesgo_valor_entrada'),
    ]

    operations = [
        migrations.RunPython(seed_estados_y_alertas, noop_reverse),
    ]
