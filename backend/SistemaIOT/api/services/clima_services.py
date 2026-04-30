import requests
from django.conf import settings
from datetime import datetime
from api.models import Pronostico

API_KEY = settings.OPENWEATHER_API_KEY

def actualizar_pronostico():
    ciudad = "Riohacha,CO"

    url = f"https://api.openweathermap.org/data/2.5/forecast?q={ciudad}&appid={API_KEY}&units=metric"

    response = requests.get(url)
    data = response.json()

    if 'list' not in data:
        return "Error al consultar API"

    # Limpiar datos viejos
    Pronostico.objects.all().delete()

    # Guardar nuevos (cada día)
    dias_guardados = set()

    for item in data['list']:
        fecha = item['dt_txt'].split(" ")[0]

        if fecha not in dias_guardados:
            dias_guardados.add(fecha)

            Pronostico.objects.create(
                fecha=fecha,
                temperatura=item['main']['temp'],
                lluvia=("rain" in item),
                descripcion=item['weather'][0]['description']
            )

    return "Pronóstico actualizado"