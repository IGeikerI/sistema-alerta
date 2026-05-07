import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css'
})
export class AlertasComponent implements OnInit {

  alertas: any[] = [];
  ultimasAlertas: any[] = [];

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

    this.api.getAlertas().subscribe({
      next: (data: any) => {
        this.alertas = Array.isArray(data) ? data : data.results || [];

        this.alertas = this.alertas.sort((a, b) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });

        this.totalAlertas = this.alertas.length;
        this.alertasCriticas = this.alertas.length;
        this.ultimasAlertas = this.alertas.slice(0, 5);

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
}