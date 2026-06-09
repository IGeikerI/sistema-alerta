from .models import Alerta, EstadoRiesgo, LecturaNivel, Notificacion


NIVEL_NORMAL = "NORMAL"
NIVEL_ALERTA = "ALERTA"
NIVEL_PELIGRO = "PELIGRO"


def clasificar_nivel(valor):
    if valor >= 250:
        return NIVEL_NORMAL
    if valor > 120:
        return NIVEL_PELIGRO
    return NIVEL_ALERTA


def lectura_repetida(lectura):
    lectura_anterior = (
        LecturaNivel.objects
        .filter(sensor=lectura.sensor)
        .exclude(id=lectura.id)
        .order_by('-fecha', '-id')
        .first()
    )

    return lectura_anterior is not None and lectura_anterior.valor == lectura.valor


def procesar_alerta(lectura):
    nivel = clasificar_nivel(lectura.valor)

    resultado = {
        'nivel': nivel,
        'alerta_generada': False,
        'alerta': None,
        'notificacion': None,
        'motivo': None,
    }

    if nivel == NIVEL_NORMAL:
        resultado['motivo'] = 'La lectura esta en rango normal'
        return resultado

    if lectura_repetida(lectura):
        resultado['motivo'] = 'Lectura igual a la anterior; no se duplica la alerta'
        return resultado

    estado_riesgo = EstadoRiesgo.objects.get(nivel__iexact=nivel)

    if nivel == NIVEL_ALERTA:
        mensaje_alerta = "Nivel de agua en estado de alerta"
        mensaje_notificacion = "Se detecto una lectura en nivel ALERTA"
    else:
        mensaje_alerta = "Peligro de inundacion"
        mensaje_notificacion = (
            "Peligro de inundacion: se detecto una lectura critica del nivel de agua"
        )

    alerta = Alerta.objects.create(
        mensaje=mensaje_alerta,
        estado_riesgo=estado_riesgo,
        lectura=lectura
    )

    notificacion = Notificacion.objects.create(
        mensaje=mensaje_notificacion,
        alerta=alerta
    )

    resultado.update({
        'alerta_generada': True,
        'alerta': alerta,
        'notificacion': notificacion,
        'motivo': 'Alerta y notificacion creadas',
    })

    return resultado
