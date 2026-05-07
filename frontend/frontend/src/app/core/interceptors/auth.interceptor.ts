// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);

  // 🔓 Rutas públicas: NO deben enviar token
  const esRutaPublica =
    req.url.includes('/login/') ||
    req.url.includes('/register/');

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