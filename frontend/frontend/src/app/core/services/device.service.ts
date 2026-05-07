// src/app/core/services/device.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, throwError, shareReplay } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Device, PaginatedDeviceResponse } from '../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  // Backend real: /dispositivos/
  private apiUrl = `${environment.API_URL}/dispositivos/`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Device[]> {
    return this.http.get<PaginatedDeviceResponse | any[]>(this.apiUrl).pipe(
      map((response) => this.normalizarRespuesta(response)),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  obtenerPorId(id: number): Observable<Device> {
    return this.http.get<any>(`${this.apiUrl}${id}/`).pipe(
      map((response) => this.adaptarDesdeBackend(response)),
      catchError(this.handleError)
    );
  }

  crear(device: Partial<Device>): Observable<Device> {
    const payload = this.adaptarHaciaBackend(device);

    return this.http.post<any>(this.apiUrl, payload).pipe(
      map((response) => this.adaptarDesdeBackend(response)),
      catchError(this.handleError)
    );
  }

  actualizar(id: number, device: Partial<Device>): Observable<Device> {
    const payload = this.adaptarHaciaBackend(device);

    return this.http.put<any>(`${this.apiUrl}${id}/`, payload).pipe(
      map((response) => this.adaptarDesdeBackend(response)),
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  private normalizarRespuesta(response: PaginatedDeviceResponse | any[]): Device[] {
    const data = Array.isArray(response)
      ? response
      : response?.results || [];

    return data.map((item: any) => this.adaptarDesdeBackend(item));
  }

  // Backend Django → diseño actual del frontend
  private adaptarDesdeBackend(data: any): Device {
    return {
      id: data.id,

      device_id: data.codigo || data.device_id || '',
      name: data.ubicacion || data.name || data.codigo || 'Dispositivo IoT',
      device_type: data.device_type || 'IoT',
      firmware_version: data.firmware_version || '',
      ip_address: data.ip_address || null,
      mac_address: data.mac_address || '',
      status: data.estado || data.status || 'ONLINE',
      last_seen: data.last_seen || null,
      active: data.active ?? true,
      zone: data.zona || data.zone || 1,
      zone_name: data.zone_name || `Zona ${data.zona || data.zone || ''}`,
      farm_name: data.farm_name || '',

      codigo: data.codigo,
      ubicacion: data.ubicacion,
      estado: data.estado,
      zona: data.zona
    };
  }

  // Diseño actual del frontend → Backend Django
  private adaptarHaciaBackend(device: Partial<Device>): any {
    return {
      codigo: device.device_id || device.codigo,
      ubicacion: device.name || device.ubicacion,
      estado: device.status || device.estado || 'ONLINE',
      zona: device.zone || device.zona
    };
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en DeviceService:', error);
    return throwError(() => error);
  }
}