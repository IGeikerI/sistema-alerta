import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ApiService } from '../../services/api.services';

interface AlertaDashboard {
  id: number;
  mensaje: string;
  fecha: string;
  nivel: string;
  estado_riesgo?: number;
  lectura_id?: number;
  lectura_valor?: number;
  lectura_fecha?: string;
  sensor_id?: number;
  sensor_tipo?: string;
  lectura?: number;
}

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css'
})
export class AlertasComponent implements OnInit {

  alertas: AlertaDashboard[] = [];
  ultimasAlertas: AlertaDashboard[] = [];
  eventosCriticos: AlertaDashboard[] = [];

  loading = false;
  errorMessage = '';

  totalAlertas = 0;
  alertasCriticas = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      historial: this.api.getAlertasHistorial(),
      recientes: this.api.getAlertasRecientes(),
      criticas: this.api.getEventosCriticos()
    }).subscribe({
      next: ({ historial, recientes, criticas }) => {
        this.alertas = this.filtrarAlertasValidas(this.normalizarLista(historial));
        this.ultimasAlertas = this.filtrarAlertasValidas(this.normalizarLista(recientes));
        this.eventosCriticos = this.normalizarLista(criticas)
          .filter((alerta) => this.obtenerNivel(alerta) === 'PELIGRO');

        this.alertas = this.ordenarPorFecha(this.alertas);
        this.ultimasAlertas = this.ordenarPorFecha(this.ultimasAlertas);
        this.eventosCriticos = this.ordenarPorFecha(this.eventosCriticos);
        this.totalAlertas = this.alertas.length;
        this.alertasCriticas = this.eventosCriticos.length;

        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando alertas:', error);
        this.errorMessage = 'No fue posible cargar las alertas del sistema.';
        this.loading = false;
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleString('es-CO');
  }

  obtenerNivel(alerta: AlertaDashboard): string {
    return String(alerta.nivel || '').trim().toUpperCase();
  }

  getClaseNivel(alerta: AlertaDashboard): string {
    return this.obtenerNivel(alerta) === 'PELIGRO' ? 'danger' : 'warning';
  }

  obtenerLectura(alerta: AlertaDashboard): string {
    const valor = alerta.lectura_valor;

    if (valor !== null && valor !== undefined) {
      return `${valor} cm`;
    }

    return alerta.lectura_id || alerta.lectura
      ? `Lectura #${alerta.lectura_id || alerta.lectura}`
      : 'Sin lectura';
  }

  obtenerSensor(alerta: AlertaDashboard): string {
    if (alerta.sensor_tipo) {
      return `${alerta.sensor_tipo} #${alerta.sensor_id || 'N/A'}`;
    }

    return alerta.sensor_id ? `Sensor #${alerta.sensor_id}` : 'Sin sensor';
  }

  private normalizarLista(data: any): AlertaDashboard[] {
    return Array.isArray(data) ? data : data?.results || [];
  }

  private ordenarPorFecha(alertas: AlertaDashboard[]): AlertaDashboard[] {
    return [...alertas].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  }

  private filtrarAlertasValidas(alertas: AlertaDashboard[]): AlertaDashboard[] {
    return alertas.filter((alerta) => {
      const nivel = this.obtenerNivel(alerta);
      return nivel === 'ALERTA' || nivel === 'PELIGRO';
    });
  }
}
