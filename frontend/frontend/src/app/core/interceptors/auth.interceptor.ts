// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const esConsultaPublica = req.method === 'GET' && (
    req.url.includes('/zonas/') ||
    req.url.includes('/dispositivos/') ||
    req.url.includes('/sensores/') ||
    req.url.includes('/lecturas-tiempo-real/') ||
    req.url.includes('/lecturas/') ||
    req.url.includes('/estados/') ||
    req.url.includes('/alertas/') ||
    req.url.includes('/notificaciones/') ||
    req.url.includes('/pronosticos/') ||
    req.url.includes('/predicciones/') ||
    req.url.includes('/actuadores/') ||
    req.url.includes('/estado-actuador/') ||
    req.url.includes('/comandos/') ||
    req.url.includes('/respuestas/')
  );

  // 🔓 Rutas públicas: NO deben enviar token
  const esRutaPublica =
    req.url.includes('/login/') ||
    req.url.includes('/register/') ||
    req.url.includes('/openweather/') ||
    req.url.includes('/lecturas-tiempo-real/') ||
    req.url.includes('/predicciones/') ||
    esConsultaPublica ||
    (req.method === 'POST' && req.url.includes('/lecturas/')) ||
    req.url.includes('/lecturas-iot/');

  if (esRutaPublica) {
    return next(req);
  }

  const token = storageService.getToken();

  if (!token) {
    return next(req);
  }

  const requestConToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestConToken);
};
