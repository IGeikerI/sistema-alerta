// src/app/core/services/rol-recurso.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { RolRecurso } from '../models/rol-recurso.model';
import { AuthHeadersService } from './auth-headers.service';

@Injectable({
  providedIn: 'root'
})
export class RolRecursoService {

  private apiUrl = `${environment.API_URL}/roles-recursos/`;

  constructor(
    private http: HttpClient,
    private authHeaders: AuthHeadersService
  ) {}

  listar(): Observable<RolRecurso[]> {
    return this.http.get<any[]>(
      this.apiUrl,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
      map(response => Array.isArray(response) ? response : (response as any).results),
      catchError(this.handleError)
    );
  }

  crear(data: Partial<RolRecurso>): Observable<RolRecurso> {
    return this.http.post<RolRecurso>(
      this.apiUrl,
      data,
      { headers: this.authHeaders.getAuthHeaders() }
    ).pipe(
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

  private handleError(error: HttpErrorResponse) {
    console.error('Error en RolRecursoService:', error);
    return throwError(() => error);
  }
}