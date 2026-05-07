import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = environment.API_URL;

    constructor(
        private http: HttpClient,
        private storageService: StorageService
    ) { }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, {
            email,
            password
        }).pipe(
tap(response => {
  console.log('✅ Login exitoso:', response);

  if (response && response.access) {
    this.storageService.setToken(response.access);

    if (response.refresh) {
      this.storageService.setRefreshToken(response.refresh);
    }

    if (response.usuario) {
      this.storageService.setUsuarioAuth(response.usuario);
    }

    if (response.roles) {
      this.storageService.setRolesAuth(response.roles);
    } else {
      this.storageService.setRolesAuth([]);
    }

    if (response.recursos) {
      this.storageService.setRecursosAuth(response.recursos);
    } else {
      this.storageService.setRecursosAuth([]);
    }
  }
}),
            catchError(error => {
                console.error('❌ Error en login:', error);
                throw error;
            })
        );
    }

    logout(): void {
        this.storageService.clear();
    }

    isAuthenticated(): boolean {
        return this.storageService.isAuthenticated();
    }

    getToken(): string | null {
        return this.storageService.getToken();
    }

    getUsuario() {
        return this.storageService.getUsuarioAuth();
    }

    getRoles() {
        return this.storageService.getRolesAuth();
    }
}