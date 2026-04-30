from django.urls import path
from .views import *

urlpatterns = [

    # AUTH
    path('register/', register),
    path('login/', login),

    # LECTURA ESPECIAL
    path('lecturas/', crear_lectura),

]