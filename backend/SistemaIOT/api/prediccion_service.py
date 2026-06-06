import json
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings
from django.db.models import Avg
from django.utils import timezone

from .models import LecturaNivel, PrediccionRiesgo


NIVEL_NORMAL = "NORMAL"
NIVEL_ALERTA = "ALERTA"
NIVEL_PELIGRO = "PELIGRO"

_modelo = None
_usa_sklearn = False


def _clasificar_por_reglas(nivel_agua, promedio, prob_lluvia):
    if nivel_agua >= 20 or promedio >= 18 or (nivel_agua >= 16 and prob_lluvia >= 70):
        return NIVEL_PELIGRO
    if nivel_agua >= 10 or promedio >= 10 or prob_lluvia >= 45:
        return NIVEL_ALERTA
    return NIVEL_NORMAL


def _probabilidad_por_reglas(nivel_agua, promedio, prob_lluvia, nivel):
    puntaje = (nivel_agua * 3.0) + (promedio * 2.0) + (prob_lluvia * 0.35)

    if nivel == NIVEL_PELIGRO:
        return min(100, max(70, puntaje))
    if nivel == NIVEL_ALERTA:
        return min(89, max(40, puntaje))
    return min(39, max(0, puntaje))


def _entrenar_modelo():
    global _modelo, _usa_sklearn

    if _modelo is not None:
        return _modelo

    try:
        from sklearn.ensemble import RandomForestClassifier
    except ImportError:
        _modelo = False
        _usa_sklearn = False
        return _modelo

    muestras = []
    etiquetas = []

    for nivel_agua in range(0, 31):
        for promedio in range(0, 31, 2):
            for temperatura in range(20, 41, 5):
                for humedad in range(40, 101, 15):
                    for prob_lluvia in range(0, 101, 20):
                        muestras.append([
                            nivel_agua,
                            promedio,
                            temperatura,
                            humedad,
                            prob_lluvia,
                        ])
                        etiquetas.append(
                            _clasificar_por_reglas(nivel_agua, promedio, prob_lluvia)
                        )

    modelo = RandomForestClassifier(
        n_estimators=80,
        random_state=42,
        class_weight='balanced',
    )
    modelo.fit(muestras, etiquetas)

    _modelo = modelo
    _usa_sklearn = True
    return _modelo


def obtener_datos_openweather():
    api_key = getattr(settings, "OPENWEATHER_API_KEY", "")
    lat = getattr(settings, "OPENWEATHER_LAT", "11.5444")
    lon = getattr(settings, "OPENWEATHER_LON", "-72.9072")

    datos = {
        'temperatura': 0.0,
        'humedad': 0.0,
        'probabilidad_lluvia': 0.0,
    }

    if not api_key:
        return datos

    params = urllib.parse.urlencode({
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric',
        'lang': 'es',
    })

    try:
        weather_url = f'https://api.openweathermap.org/data/2.5/weather?{params}'
        with urllib.request.urlopen(weather_url, timeout=8) as response:
            weather = json.loads(response.read().decode('utf-8'))

        datos['temperatura'] = float(weather.get('main', {}).get('temp') or 0)
        datos['humedad'] = float(weather.get('main', {}).get('humidity') or 0)

        forecast_url = f'https://api.openweathermap.org/data/2.5/forecast?{params}'
        with urllib.request.urlopen(forecast_url, timeout=8) as response:
            forecast = json.loads(response.read().decode('utf-8'))

        primer_evento = (forecast.get('list') or [{}])[0]
        datos['probabilidad_lluvia'] = round(
            float(primer_evento.get('pop') or 0) * 100,
            2,
        )

    except (urllib.error.URLError, urllib.error.HTTPError, ValueError, KeyError, TimeoutError):
        return datos

    return datos


def obtener_variables_prediccion(lectura):
    ultimas_lecturas = list(LecturaNivel.objects.filter(
        sensor=lectura.sensor
    ).order_by('-fecha', '-id').values_list('valor', flat=True)[:10])

    promedio = (
        sum(float(valor) for valor in ultimas_lecturas) / len(ultimas_lecturas)
        if ultimas_lecturas
        else lectura.valor
    )
    clima = obtener_datos_openweather()

    return {
        'ultima_lectura': float(lectura.valor),
        'promedio_lecturas': float(promedio or lectura.valor),
        'temperatura': float(clima['temperatura']),
        'humedad': float(clima['humedad']),
        'probabilidad_lluvia': float(clima['probabilidad_lluvia']),
    }


def predecir_riesgo(datos):
    nivel_agua = float(datos.get('ultima_lectura') or 0)
    promedio = float(datos.get('promedio_lecturas') or 0)
    temperatura = float(datos.get('temperatura') or 0)
    humedad = float(datos.get('humedad') or 0)
    prob_lluvia = float(datos.get('probabilidad_lluvia') or 0)

    modelo = _entrenar_modelo()

    if _usa_sklearn and modelo:
        variables = [[nivel_agua, promedio, temperatura, humedad, prob_lluvia]]
        nivel = modelo.predict(variables)[0]
        probabilidades = dict(zip(modelo.classes_, modelo.predict_proba(variables)[0]))
        probabilidad = round(float(probabilidades.get(nivel, 0)) * 100, 2)
    else:
        nivel = _clasificar_por_reglas(nivel_agua, promedio, prob_lluvia)
        probabilidad = round(
            _probabilidad_por_reglas(nivel_agua, promedio, prob_lluvia, nivel),
            2,
        )

    return {
        'nivel': nivel,
        'probabilidad': probabilidad,
    }


def generar_prediccion_para_lectura(lectura):
    datos = obtener_variables_prediccion(lectura)
    resultado = predecir_riesgo(datos)

    return PrediccionRiesgo.objects.create(
        fecha=timezone.now().date(),
        nivel_estimado=resultado['nivel'],
        probabilidad=resultado['probabilidad'],
        valor_entrada=datos['ultima_lectura'],
    )


def resumen_predicciones():
    predicciones = PrediccionRiesgo.objects.all()
    total = predicciones.count()

    if total == 0:
        return {
            'total_predicciones': 0,
            'predicciones_peligro': 0,
            'probabilidad_promedio': 0,
            'riesgo_proximo': {
                'nivel': NIVEL_NORMAL,
                'probabilidad': 0,
            },
        }

    ultima = predicciones.order_by('-fecha', '-id').first()
    promedio = predicciones.aggregate(promedio=Avg('probabilidad'))['promedio'] or 0

    return {
        'total_predicciones': total,
        'predicciones_peligro': predicciones.filter(nivel_estimado__iexact=NIVEL_PELIGRO).count(),
        'probabilidad_promedio': round(float(promedio), 2),
        'riesgo_proximo': {
            'nivel': ultima.nivel_estimado if ultima else NIVEL_NORMAL,
            'probabilidad': round(float(ultima.probabilidad), 2) if ultima else 0,
        },
    }
