// src/app/core/services/usuario-rol.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { UsuarioRol, PaginatedUsuarioRolResponse } from '../models/usuario-rol.model';
import { AuthHeadersService } from './auth-headers.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioRolService {

  private apiUrl = `${environment.API_URL}/usuario-rol/`;

  constructor(
    private http: HttpClient,
    private authHeaders: AuthHeadersService
  ) {}

  listar(): Observable<UsuarioRol[]> {
    return this.http.get<PaginatedUsuarioRolResponse | any[]>(
      this.apiUrl,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : response.results;
        return data.map(item => this.adaptarUsuarioRol(item));
      }),
      catchError(this.handleError)
    );
  }

  crear(data: Partial<UsuarioRol>): Observable<UsuarioRol> {
    const payload = {
      usuario: data.usuario,
      rol: data.rol
    };

    return this.http.post<any>(
      this.apiUrl,
      payload,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => this.adaptarUsuarioRol(response)),
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${id}/`,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private adaptarUsuarioRol(data: any): UsuarioRol {
    return {
      id: data.id,
      usuario: typeof data.usuario === 'object'
        ? data.usuario.id ?? data.usuario.idusuarios
        : data.usuario,
      rol: typeof data.rol === 'object'
        ? data.rol.id ?? data.rol.idrol
        : data.rol
    };
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en UsuarioRolService:', error);
    return throwError(() => error);
  }
}