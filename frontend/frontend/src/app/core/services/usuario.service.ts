// src/app/core/services/usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Usuario, PaginatedUsuarioResponse } from '../models/usuario.model';
import { AuthHeadersService } from './auth-headers.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.API_URL}/usuarios/`;

  constructor(
    private http: HttpClient,
    private authHeaders: AuthHeadersService
  ) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<PaginatedUsuarioResponse | any[]>(
      this.apiUrl,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : response.results;
        return data.map(item => this.adaptarUsuario(item));
      }),
      catchError(this.handleError)
    );
  }

  crear(usuario: Partial<Usuario>): Observable<Usuario> {
    const payload: any = {
      nombre: usuario.nombre || usuario.username,
      email: usuario.email
    };

    if ((usuario as any).password) {
      payload.password = (usuario as any).password;
    }

    return this.http.post<any>(
      this.apiUrl,
      payload,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => this.adaptarUsuario(response)),
      catchError(this.handleError)
    );
  }

  actualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    const payload = {
      nombre: usuario.nombre || usuario.username,
      email: usuario.email
    };

    return this.http.put<any>(
      `${this.apiUrl}${id}/`,
      payload,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => this.adaptarUsuario(response)),
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

  private adaptarUsuario(data: any): Usuario {
    return {
      idusuarios: data.idusuarios ?? data.id,
      username: data.username ?? data.email ?? data.nombre,
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido ?? '',
      estado: data.estado ?? 'ACTIVO'
    };
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en UsuarioService:', error);
    return throwError(() => error);
  }
}