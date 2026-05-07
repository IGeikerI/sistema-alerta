import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-predicciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './predicciones.html',
  styleUrl: './predicciones.css'
})
export class PrediccionesComponent implements OnInit {

  predicciones: any[] = [];
  prediccionActual: any = null;

  loading = false;
  errorMessage = '';

  totalPredicciones = 0;
  totalPeligro = 0;
  probabilidadPromedio = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarPredicciones();
  }

  cargarPredicciones(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getPredicciones().subscribe({
      next: (data: any) => {
        this.predicciones = Array.isArray(data) ? data : data.results || [];

        this.predicciones = this.predicciones.sort((a: any, b: any) => {
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        });

        this.totalPredicciones = this.predicciones.length;

        this.totalPeligro = this.predicciones.filter((item: any) =>
          String(item.nivel_estimado).toLowerCase() === 'peligro'
        ).length;

        if (this.predicciones.length > 0) {
          this.prediccionActual = this.predicciones[0];

          const sumaProbabilidad = this.predicciones.reduce((acc: number, item: any) => {
            return acc + Number(item.probabilidad || 0);
          }, 0);

          this.probabilidadPromedio = Number((sumaProbabilidad / this.predicciones.length).toFixed(1));
        } else {
          this.prediccionActual = null;
          this.probabilidadPromedio = 0;
        }

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando predicciones:', error);
        this.errorMessage = 'No fue posible cargar las predicciones de riesgo.';
        this.loading = false;
      }
    });
  }

  getClaseNivel(nivel: string): string {
    const valor = String(nivel || '').toLowerCase();

    if (valor === 'normal') {
      return 'nivel-normal';
    }

    if (valor === 'alerta') {
      return 'nivel-alerta';
    }

    if (valor === 'peligro') {
      return 'nivel-peligro';
    }

    return 'nivel-sin-datos';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}