import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, interval, of, startWith, Subscription, switchMap } from 'rxjs';

import { ApiService } from '../../../services/api.services';

interface AlertaNotificacion {
  id: number;
  mensaje: string;
  fecha: string;
  nivel: string;
  lectura_valor?: number;
  sensor_id?: number;
  sensor_tipo?: string;
}

@Component({
  selector: 'app-alert-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-toast.component.html',
  styleUrl: './alert-toast.component.css'
})
export class AlertToastComponent implements OnInit, OnDestroy {
  notificaciones: AlertaNotificacion[] = [];

  private readonly storageKey = 'alertas_vistas_toast';
  private readonly alertasVistas = new Set<number>();
  private primeraCarga = true;
  private subscription?: Subscription;
  private timers: number[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarVistas();

    this.subscription = interval(1000)
      .pipe(
        startWith(0),
        switchMap(() => this.api.getAlertasRecientes().pipe(catchError(() => of([]))))
      )
      .subscribe((data: any) => this.procesarAlertas(this.normalizarLista(data)));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.timers.forEach((timer) => window.clearTimeout(timer));
  }

  cerrar(id: number): void {
    this.notificaciones = this.notificaciones.filter((item) => item.id !== id);
  }

  claseNivel(alerta: AlertaNotificacion): string {
    return this.obtenerNivel(alerta) === 'PELIGRO' ? 'toast-danger' : 'toast-warning';
  }

  titulo(alerta: AlertaNotificacion): string {
    return this.obtenerNivel(alerta) === 'PELIGRO' ? 'Peligro de inundacion' : 'Alerta de inundacion';
  }

  mensaje(alerta: AlertaNotificacion): string {
    return this.obtenerNivel(alerta) === 'PELIGRO'
      ? 'Se ha detectado un peligro de inundacion.'
      : 'Se ha detectado una alerta de inundacion.';
  }

  detalle(alerta: AlertaNotificacion): string {
    const partes: string[] = [];

    if (alerta.lectura_valor !== null && alerta.lectura_valor !== undefined) {
      partes.push(`${alerta.lectura_valor} cm`);
    }

    if (alerta.sensor_tipo || alerta.sensor_id) {
      partes.push(`${alerta.sensor_tipo || 'Sensor'} #${alerta.sensor_id || 'N/A'}`);
    }

    return partes.join(' - ');
  }

  private procesarAlertas(alertas: AlertaNotificacion[]): void {
    const alertasValidas = alertas.filter((alerta) => {
      const nivel = this.obtenerNivel(alerta);
      return nivel === 'ALERTA' || nivel === 'PELIGRO';
    });

    if (this.primeraCarga) {
      alertasValidas.forEach((alerta) => this.alertasVistas.add(alerta.id));
      this.guardarVistas();
      this.primeraCarga = false;
      return;
    }

    alertasValidas
      .filter((alerta) => !this.alertasVistas.has(alerta.id))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .forEach((alerta) => {
        this.alertasVistas.add(alerta.id);
        this.mostrar(alerta);
      });

    this.guardarVistas();
  }

  private mostrar(alerta: AlertaNotificacion): void {
    this.notificaciones = [alerta, ...this.notificaciones].slice(0, 3);

    const timer = window.setTimeout(() => {
      this.cerrar(alerta.id);
    }, 5000);

    this.timers.push(timer);
  }

  private normalizarLista(data: any): AlertaNotificacion[] {
    return Array.isArray(data) ? data : data?.results || [];
  }

  obtenerNivel(alerta: AlertaNotificacion): string {
    return String(alerta.nivel || '').trim().toUpperCase();
  }

  private cargarVistas(): void {
    const raw = window.sessionStorage.getItem(this.storageKey);

    if (!raw) {
      return;
    }

    try {
      const ids = JSON.parse(raw);
      if (Array.isArray(ids)) {
        ids.forEach((id) => this.alertasVistas.add(Number(id)));
      }
    } catch {
      window.sessionStorage.removeItem(this.storageKey);
    }
  }

  private guardarVistas(): void {
    const ids = Array.from(this.alertasVistas).slice(-100);
    window.sessionStorage.setItem(this.storageKey, JSON.stringify(ids));
  }
}

