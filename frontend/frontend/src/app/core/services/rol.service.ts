// src/app/core/services/rol.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Rol, PaginatedRolResponse } from '../models/rol.model';
import { AuthHeadersService } from './auth-headers.service';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private apiUrl = `${environment.API_URL}/roles/`;

  constructor(
    private http: HttpClient,
    private authHeaders: AuthHeadersService
  ) {}

  listar(): Observable<Rol[]> {
    const headers = this.authHeaders.getAuthHeaders();

    return this.http.get<PaginatedRolResponse | any[]>(
      this.apiUrl,
      { headers }
    ).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : response.results;
        return data.map(item => this.adaptarRol(item));
      }),
      catchError(this.handleError)
    );
  }

  crear(rol: Partial<Rol>): Observable<Rol> {
    const payload = {
      nombre: rol.nombre
    };

    return this.http.post<any>(
      this.apiUrl,
      payload,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => this.adaptarRol(response)),
      catchError(this.handleError)
    );
  }

  actualizar(id: number, rol: Partial<Rol>): Observable<Rol> {
    const payload = {
      nombre: rol.nombre
    };

    return this.http.put<any>(
      `${this.apiUrl}${id}/`,
      payload,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => this.adaptarRol(response)),
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

  private adaptarRol(data: any): Rol {
    return {
      idrol: data.idrol ?? data.id,
      nombre: data.nombre,
      descripcion: data.descripcion ?? '',
      estado: data.estado ?? 'ACTIVO'
    };
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en RolService:', error);
    return throwError(() => error);
  }
}