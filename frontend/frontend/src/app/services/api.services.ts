// src/app/services/api.services.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private api = environment.API_URL;

  constructor(private http: HttpClient) {}

  // =========================
  // ROLES
  // =========================
  getRoles() {
    return this.http.get(`${this.api}/roles/`);
  }

  crearRol(data: any) {
    return this.http.post(`${this.api}/roles/`, data);
  }

  // =========================
  // USUARIO-ROL
  // =========================
  getUsuarioRol() {
    return this.http.get(`${this.api}/usuario-rol/`);
  }

  crearUsuarioRol(data: any) {
    return this.http.post(`${this.api}/usuario-rol/`, data);
  }

  // =========================
  // USUARIOS
  // =========================
  getUsuarios() {
    return this.http.get(`${this.api}/usuarios/`);
  }

  crearUsuario(data: any) {
    return this.http.post(`${this.api}/usuarios/`, data);
  }

  // =========================
  // RECURSOS
  // =========================
  getRecursos() {
    return this.http.get(`${this.api}/recursos/`);
  }

  crearRecurso(data: any) {
    return this.http.post(`${this.api}/recursos/`, data);
  }

  // =========================
  // ROL-RECURSO
  // =========================
  getRolRecursos() {
    return this.http.get(`${this.api}/roles-recursos/`);
  }

  crearRolRecurso(data: any) {
    return this.http.post(`${this.api}/roles-recursos/`, data);
  }

  // =========================
  // OPENWEATHER DESDE BACKEND
  // =========================
  getClimaActual() {
    return this.http.get(`${this.api}/openweather/actual/`);
  }

  getPronostico5Dias() {
    return this.http.get(`${this.api}/openweather/forecast/`);
  }

  getClimaActualOpenWeather() {
    return this.getClimaActual();
  }

  // =========================
  // ZONAS
  // =========================
  getZonas() {
    return this.http.get(`${this.api}/zonas/`);
  }

  crearZona(data: any) {
    return this.http.post(`${this.api}/zonas/`, data);
  }

  // =========================
  // DISPOSITIVOS
  // =========================
  getDispositivos() {
    return this.http.get(`${this.api}/dispositivos/`);
  }

  crearDispositivo(data: any) {
    return this.http.post(`${this.api}/dispositivos/`, data);
  }

  // =========================
  // SENSORES
  // =========================
  getSensores() {
    return this.http.get(`${this.api}/sensores/`);
  }

  crearSensor(data: any) {
    return this.http.post(`${this.api}/sensores/`, data);
  }

  // =========================
  // LECTURAS
  // =========================
  getLecturas() {
    return this.http.get(`${this.api}/lecturas/`);
  }

  getLecturaTiempoReal(sensor?: number) {
    const query = sensor ? `?sensor=${sensor}` : '';
    return this.http.get(`${this.api}/lecturas-tiempo-real/${query}`);
  }

  crearLectura(data: any) {
    return this.http.post(`${this.api}/lecturas/`, data);
  }

  crearLecturaTiempoReal(data: any) {
    return this.http.post(`${this.api}/lecturas-tiempo-real/`, data);
  }

  crearLecturaIoT(data: any) {
    return this.http.post(`${this.api}/lecturas-iot/`, data);
  }

  // =========================
  // ESTADOS DE RIESGO
  // =========================
  getEstadosRiesgo() {
    return this.http.get(`${this.api}/estados/`);
  }

  crearEstadoRiesgo(data: any) {
    return this.http.post(`${this.api}/estados/`, data);
  }

  // =========================
  // ALERTAS
  // =========================
  getAlertas() {
    return this.http.get(`${this.api}/alertas/`);
  }

  getAlertasHistorial() {
    return this.http.get(`${this.api}/alertas/historial/`);
  }

  getAlertasRecientes() {
    return this.http.get(`${this.api}/alertas/recientes/`);
  }

  getEventosCriticos() {
    return this.http.get(`${this.api}/alertas/criticas/`);
  }

  // =========================
  // NOTIFICACIONES
  // =========================
  getNotificaciones() {
    return this.http.get(`${this.api}/notificaciones/`);
  }

  crearNotificacion(data: any) {
    return this.http.post(`${this.api}/notificaciones/`, data);
  }

  // =========================
  // PRONÓSTICOS
  // =========================
  getPronosticos() {
    return this.http.get(`${this.api}/pronosticos/`);
  }

  // =========================
  // PREDICCIONES
  // =========================
  getPredicciones() {
    return this.http.get(`${this.api}/predicciones/`);
  }

  // =========================
  // ACTUADORES
  // =========================
  getActuadores() {
    return this.http.get(`${this.api}/actuadores/`);
  }

  crearActuador(data: any) {
    return this.http.post(`${this.api}/actuadores/`, data);
  }

  // =========================
  // ESTADO ACTUADOR
  // =========================
  getEstadosActuador() {
    return this.http.get(`${this.api}/estado-actuador/`);
  }

  crearEstadoActuador(data: any) {
    return this.http.post(`${this.api}/estado-actuador/`, data);
  }

  // =========================
  // COMANDOS REMOTOS
  // =========================
  getComandos() {
    return this.http.get(`${this.api}/comandos/`);
  }

  crearComando(data: any) {
    return this.http.post(`${this.api}/comandos/`, data);
  }

  // =========================
  // RESPUESTAS DE COMANDO
  // =========================
  getRespuestas() {
    return this.http.get(`${this.api}/respuestas/`);
  }

  crearRespuesta(data: any) {
    return this.http.post(`${this.api}/respuestas/`, data);
  }

  // =========================
  // AUDITORÍA
  // =========================
  getAuditoria() {
    return this.http.get(`${this.api}/auditoria/`);
  }

  crearAuditoria(data: any) {
    return this.http.post(`${this.api}/auditoria/`, data);
  }

  // =========================
  // AUTH
  // =========================
 private storage = inject(StorageService);

login(data: any) {
  return this.http.post<any>(`${this.api}/login/`, data)
    .pipe(
      tap((response) => {

        console.log('LOGIN RESPONSE:', response); // 🔍 opcional

        // 🔥 GUARDAR TOKEN
        this.storage.setToken(response.access);
        this.storage.setRefreshToken(response.refresh);

        // 🔥 GUARDAR DATOS DEL USUARIO
        this.storage.setUsuarioAuth(response.usuario);

        // 🔥 GUARDAR ROLES Y RECURSOS
        this.storage.setRolesAuth(response.roles);
        this.storage.setRecursosAuth(response.recursos);
      })
    );
}

  register(data: any) {
    return this.http.post(`${this.api}/register/`, data);
  }
}
