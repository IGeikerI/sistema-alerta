// src/app/core/services/storage.service.ts

import { Injectable } from '@angular/core';
import { UsuarioAuth, RolAuth, RecursoAuth } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_AUTH_KEY = 'usuario_auth';
  private readonly ROLES_AUTH_KEY = 'roles_auth';
  private readonly RECURSOS_AUTH_KEY = 'recursos_auth';

  // ============================================
  // 🔥 TOKEN
  // ============================================
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ============================================
  // 🔥 REFRESH TOKEN
  // ============================================
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  // ============================================
  // 🔥 USUARIO
  // ============================================
  setUsuarioAuth(usuario: UsuarioAuth): void {
    localStorage.setItem(this.USER_AUTH_KEY, JSON.stringify(usuario));
  }

  getUsuarioAuth(): UsuarioAuth | null {
    const data = localStorage.getItem(this.USER_AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }

  // 🔥 ALIAS PARA COMPATIBILIDAD CON OTROS COMPONENTES
  getUsuario(): UsuarioAuth | null {
    return this.getUsuarioAuth();
  }

  setUsuario(usuario: UsuarioAuth): void {
    this.setUsuarioAuth(usuario);
  }

  // ============================================
  // 🔥 ROLES
  // ============================================
  setRolesAuth(roles: RolAuth[]): void {
    localStorage.setItem(this.ROLES_AUTH_KEY, JSON.stringify(roles));
  }

  getRolesAuth(): RolAuth[] {
    const data = localStorage.getItem(this.ROLES_AUTH_KEY);
    return data ? JSON.parse(data) : [];
  }

  // 🔥 ALIAS PARA COMPATIBILIDAD CON OTROS COMPONENTES
  getRoles(): RolAuth[] {
    return this.getRolesAuth();
  }

  setRoles(roles: RolAuth[]): void {
    this.setRolesAuth(roles);
  }

  // ============================================
  // 🔥 RECURSOS
  // ============================================
  setRecursosAuth(recursos: RecursoAuth[]): void {
    localStorage.setItem(this.RECURSOS_AUTH_KEY, JSON.stringify(recursos));
  }

  getRecursosAuth(): RecursoAuth[] {
    const data = localStorage.getItem(this.RECURSOS_AUTH_KEY);
    return data ? JSON.parse(data) : [];
  }

  // 🔥 ALIAS PARA COMPATIBILIDAD CON OTROS COMPONENTES
  getRecursos(): RecursoAuth[] {
    return this.getRecursosAuth();
  }

  setRecursos(recursos: RecursoAuth[]): void {
    this.setRecursosAuth(recursos);
  }

  // ============================================
  // 🔥 UTILIDADES
  // ============================================
  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_AUTH_KEY);
    localStorage.removeItem(this.ROLES_AUTH_KEY);
    localStorage.removeItem(this.RECURSOS_AUTH_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}