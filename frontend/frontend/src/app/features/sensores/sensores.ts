// src/app/features/sensores/sensores.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-sensores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sensores.html',
  styleUrl: './sensores.css'
})
export class SensoresComponent implements OnInit {

  sensores: any[] = [];
  sensoresFiltrados: any[] = [];
  dispositivos: any[] = [];

  loading = false;
  refreshing = false;
  saving = false;

  modalVisible = false;

  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  filtroTipo = 'TODOS';

  sensorForm = {
    tipo: '',
    unidad: '',
    dispositivo: null as number | null
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getSensores().subscribe({
      next: (data: any) => {
        this.sensores = Array.isArray(data) ? data : data.results || [];
        this.aplicarFiltros();
        this.cargarDispositivos();
      },
      error: (error: any) => {
        console.error('❌ Error cargando sensores:', error);

        this.errorMessage =
          error.error?.detail ||
          error.error?.error ||
          'No fue posible cargar los sensores del sistema.';

        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  cargarDispositivos(): void {
    this.api.getDispositivos().subscribe({
      next: (data: any) => {
        this.dispositivos = Array.isArray(data) ? data : data.results || [];
        console.log('✅ Dispositivos cargados para sensores:', this.dispositivos);
      },
      error: (error: any) => {
        console.error('❌ Error cargando dispositivos:', error);

        this.errorMessage =
          error.error?.detail ||
          error.error?.error ||
          'No fue posible cargar los dispositivos para vincular sensores.';
      }
    });
  }

  refrescar(): void {
    this.refreshing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getSensores()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.refreshing = false;
        })
      )
      .subscribe({
        next: (data: any) => {
          this.sensores = Array.isArray(data) ? data : data.results || [];
          this.aplicarFiltros();
          this.cargarDispositivos();
        },
        error: (error: any) => {
          console.error('❌ Error actualizando sensores:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible actualizar los sensores.';
        }
      });
  }

  abrirModalCrear(): void {
    this.limpiarFormulario();
    this.errorMessage = '';
    this.successMessage = '';
    this.modalVisible = true;

    if (this.dispositivos.length === 0) {
      this.cargarDispositivos();
    }
  }

  cerrarModal(): void {
    if (this.saving) return;

    this.modalVisible = false;
    this.errorMessage = '';
    this.limpiarFormulario();
  }

  guardarSensor(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const tipo = this.sensorForm.tipo.trim();
    const unidad = this.sensorForm.unidad.trim();
    const dispositivoId = Number(this.sensorForm.dispositivo);

    if (!tipo) {
      this.errorMessage = 'Debe ingresar el tipo de sensor.';
      return;
    }

    if (!unidad) {
      this.errorMessage = 'Debe ingresar la unidad de medición.';
      return;
    }

    if (!dispositivoId || isNaN(dispositivoId)) {
      this.errorMessage = 'Debe seleccionar un dispositivo válido.';
      return;
    }

    const payload = {
      tipo: tipo,
      unidad: unidad,
      dispositivo: dispositivoId
    };

    console.log('📤 Enviando sensor al backend:', payload);

    this.saving = true;

    this.api.crearSensor(payload)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('✅ Sensor guardado:', res);

          this.successMessage = 'Sensor registrado correctamente.';
          this.modalVisible = false;
          this.limpiarFormulario();
          this.cargarDatos();
        },
        error: (error: any) => {
          console.error('❌ Error guardando sensor:', error);
          console.error('📌 Respuesta del backend:', error.error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            error.error?.tipo?.[0] ||
            error.error?.unidad?.[0] ||
            error.error?.dispositivo?.[0] ||
            'No fue posible guardar el sensor. Revise los datos ingresados.';
        }
      });
  }

  limpiarFormulario(): void {
    this.sensorForm = {
      tipo: '',
      unidad: '',
      dispositivo: null
    };
  }

  buscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.aplicarFiltros();
  }

  cambiarFiltroTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroTipo = 'TODOS';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const termino = this.searchTerm.toLowerCase().trim();

    this.sensoresFiltrados = this.sensores.filter((sensor: any) => {
      const tipo = String(sensor.tipo || '').toLowerCase();
      const unidad = String(sensor.unidad || '').toLowerCase();
      const dispositivo = String(sensor.dispositivo || '').toLowerCase();

      const coincideBusqueda =
        !termino ||
        tipo.includes(termino) ||
        unidad.includes(termino) ||
        dispositivo.includes(termino);

      const coincideTipo =
        this.filtroTipo === 'TODOS' ||
        String(sensor.tipo || '').toUpperCase() === this.filtroTipo;

      return coincideBusqueda && coincideTipo;
    });
  }

  obtenerTipos(): string[] {
    const tipos = this.sensores
      .map((sensor: any) => String(sensor.tipo || '').toUpperCase())
      .filter((tipo: string) => tipo.trim() !== '');

    return [...new Set(tipos)];
  }

  etiquetaTipo(tipo: string): string {
    if (!tipo) return 'Sin tipo';

    const valor = String(tipo).toLowerCase();

    if (valor.includes('ultrasonico') || valor.includes('ultrasónico')) {
      return 'Ultrasónico';
    }

    if (valor.includes('nivel')) {
      return 'Nivel de agua';
    }

    if (valor.includes('temperatura')) {
      return 'Temperatura';
    }

    return tipo;
  }

  obtenerNombreDispositivo(id: number): string {
    const dispositivo = this.dispositivos.find((item: any) => Number(item.id) === Number(id));

    if (!dispositivo) {
      return `Dispositivo ${id || 'N/A'}`;
    }

    return (
      dispositivo.codigo ||
      dispositivo.name ||
      dispositivo.device_id ||
      dispositivo.ubicacion ||
      `Dispositivo ${id}`
    );
  }

  totalUltrasonicos(): number {
    return this.sensores.filter((sensor: any) => {
      const tipo = String(sensor.tipo || '').toLowerCase();
      return tipo.includes('ultrasonico') || tipo.includes('ultrasónico');
    }).length;
  }

  dispositivosVinculados(): number {
    const ids = this.sensores
      .map((sensor: any) => sensor.dispositivo)
      .filter((id: any) => id !== null && id !== undefined);

    return new Set(ids).size;
  }

  trackBySensorId(index: number, sensor: any): number {
    return sensor.id || index;
  }
}