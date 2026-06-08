// src/app/features/lecturas/lecturas.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, interval, Subscription, timeout } from 'rxjs';

import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-lecturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturas.html',
  styleUrl: './lecturas.css'
})
export class LecturasComponent implements OnInit, OnDestroy {

  lecturas: any[] = [];
  lecturasFiltradas: any[] = [];
  sensores: any[] = [];

  ultimaLectura: any = null;
  lecturaTiempoReal: any = null;
  ultimaActualizacionTiempoReal: string | null = null;

  loading = false;
  refreshing = false;
  saving = false;

  modalVisible = false;

  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  filtroEstado = 'TODOS';

  private tiempoRealSub?: Subscription;
  private historialSub?: Subscription;

  lecturaForm = {
    valor: null as number | null,
    sensor: null as number | null
  };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarLecturaTiempoReal();
    this.iniciarActualizacionAutomatica();
  }

  ngOnDestroy(): void {
    this.tiempoRealSub?.unsubscribe();
    this.historialSub?.unsubscribe();
  }

  iniciarActualizacionAutomatica(): void {
    this.tiempoRealSub = interval(2000).subscribe(() => {
      this.cargarLecturaTiempoReal();
    });

    this.historialSub = interval(8000).subscribe(() => {
      this.refrescar(false);
    });
  }

  cargarLecturaTiempoReal(): void {
    this.api.getLecturaTiempoReal()
      .pipe(timeout(8000))
      .subscribe({
        next: (data: any) => {
          this.lecturaTiempoReal = data;
          this.ultimaActualizacionTiempoReal = data?.fecha || null;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          if (error.status !== 404) {
            console.error('Error cargando lectura en tiempo real:', error);
          }
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getLecturas()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: any) => {
          this.lecturas = Array.isArray(data) ? data : data.results || [];

          this.lecturas = this.lecturas.sort((a: any, b: any) => {
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
          });

          this.ultimaLectura = this.lecturas.length > 0 ? this.lecturas[0] : null;

          this.aplicarFiltros();
          this.cargarSensores();
        },
        error: (error: any) => {
          console.error('❌ Error cargando lecturas:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible cargar las lecturas del nivel del agua.';
        }
      });
  }

  cargarSensores(): void {
    this.api.getSensores()
      .pipe(timeout(15000))
      .subscribe({
        next: (data: any) => {
          this.sensores = Array.isArray(data) ? data : data.results || [];
          console.log('✅ Sensores cargados para lecturas:', this.sensores);
        },
        error: (error: any) => {
          console.error('❌ Error cargando sensores:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible cargar los sensores para registrar lecturas.';
        }
      });
  }

  refrescar(mostrarIndicador = true): void {
    this.refreshing = mostrarIndicador;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getLecturas()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.refreshing = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: any) => {
          this.lecturas = Array.isArray(data) ? data : data.results || [];

          this.lecturas = this.lecturas.sort((a: any, b: any) => {
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
          });

          this.ultimaLectura = this.lecturas.length > 0 ? this.lecturas[0] : null;

          this.aplicarFiltros();
          this.cargarSensores();
        },
        error: (error: any) => {
          console.error('❌ Error actualizando lecturas:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible actualizar las lecturas.';
        }
      });
  }

  abrirModalCrear(): void {
    this.limpiarFormulario();
    this.errorMessage = '';
    this.successMessage = '';
    this.modalVisible = true;

    if (this.sensores.length === 0) {
      this.cargarSensores();
    }

    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    if (this.saving) return;

    this.modalVisible = false;
    this.errorMessage = '';
    this.limpiarFormulario();
    this.cdr.detectChanges();
  }

  guardarLectura(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const valor = Number(this.lecturaForm.valor);
    const sensorId = Number(this.lecturaForm.sensor);

    if (this.lecturaForm.valor === null || this.lecturaForm.valor === undefined || isNaN(valor)) {
      this.errorMessage = 'Debe ingresar el valor del nivel del agua.';
      return;
    }

    if (valor < 0) {
      this.errorMessage = 'El valor de la lectura no puede ser negativo.';
      return;
    }

    if (!sensorId || isNaN(sensorId)) {
      this.errorMessage = 'Debe seleccionar un sensor válido.';
      return;
    }

    const payload = {
      valor: valor,
      sensor: sensorId
    };

    console.log('📤 Enviando lectura al backend:', payload);
    console.log('📌 Clasificación estimada:', this.calcularEstado(valor));

    this.saving = true;
    this.cdr.detectChanges();

    this.api.crearLecturaIoT(payload)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('✅ Lectura guardada:', res);

          const nivel = res?.nivel || this.calcularEstado(valor);

          this.successMessage = `Lectura registrada correctamente. Nivel detectado: ${nivel}.`;

          this.modalVisible = false;
          this.saving = false;
          this.limpiarFormulario();
          this.cdr.detectChanges();

          setTimeout(() => {
            this.cargarDatos();
            this.cdr.detectChanges();
          }, 100);
        },
        error: (error: any) => {
          console.error('❌ Error guardando lectura:', error);
          console.error('📌 Respuesta del backend:', error.error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            error.error?.valor?.[0] ||
            error.error?.sensor?.[0] ||
            'No fue posible guardar la lectura. Revise el sensor y el valor ingresado.';

          this.saving = false;
          this.cdr.detectChanges();
        }
      });
  }

  limpiarFormulario(): void {
    this.lecturaForm = {
      valor: null,
      sensor: null
    };
  }

  // =====================================================
  // ✅ NUEVA LÓGICA DE CLASIFICACIÓN
  // =====================================================
  calcularEstado(valor: number): string {
    const numero = Number(valor);

    if (isNaN(numero)) {
      return 'Sin datos';
    }

    if (numero > 250) {
      return 'Normal';
    }

    if (numero > 100 && numero <= 250) {
      return 'Alerta';
    }

    if (numero <= 100) {
      return 'Peligro';
    }

    return 'Sin datos';
  }

  getClaseEstado(valor: number): string {
    const estado = this.calcularEstado(valor);

    if (estado === 'Normal') {
      return 'estado-normal';
    }

    if (estado === 'Peligro') {
      return 'estado-peligro';
    }

    if (estado === 'Alerta') {
      return 'estado-alerta';
    }

    return 'estado-sin-datos';
  }

  estadoActual(): string {
    const lectura = this.lecturaTiempoReal || this.ultimaLectura;

    if (!lectura) {
      return 'Sin datos';
    }

    return lectura.estado || this.calcularEstado(lectura.valor);
  }

  claseEstadoActual(): string {
    const lectura = this.lecturaTiempoReal || this.ultimaLectura;

    if (!lectura) {
      return 'estado-sin-datos';
    }

    return this.getClaseEstado(lectura.valor);
  }

  valorActual(): number {
    const lectura = this.lecturaTiempoReal || this.ultimaLectura;
    return Number(lectura?.valor || 0);
  }

  sensorActual(): string {
    const lectura = this.lecturaTiempoReal || this.ultimaLectura;
    return this.obtenerNombreSensor(lectura?.sensor);
  }

  fechaActualTiempoReal(): string {
    const fecha = this.ultimaActualizacionTiempoReal || this.lecturaTiempoReal?.fecha;
    return fecha ? this.formatearFecha(fecha) : 'Esperando datos del circuito';
  }

  buscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.aplicarFiltros();
  }

  cambiarFiltroEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = 'TODOS';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const termino = this.searchTerm.toLowerCase().trim();

    this.lecturasFiltradas = this.lecturas.filter((lectura: any) => {
      const estado = this.calcularEstado(lectura.valor);
      const sensor = String(lectura.sensor || '').toLowerCase();
      const valor = String(lectura.valor || '').toLowerCase();
      const fecha = String(lectura.fecha || '').toLowerCase();

      const coincideBusqueda =
        !termino ||
        sensor.includes(termino) ||
        valor.includes(termino) ||
        fecha.includes(termino) ||
        estado.toLowerCase().includes(termino);

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        estado.toUpperCase() === this.filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }

  totalNormal(): number {
    return this.lecturas.filter((lectura: any) =>
      this.calcularEstado(lectura.valor) === 'Normal'
    ).length;
  }

  totalPeligro(): number {
    return this.lecturas.filter((lectura: any) =>
      this.calcularEstado(lectura.valor) === 'Peligro'
    ).length;
  }

  totalAlerta(): number {
    return this.lecturas.filter((lectura: any) =>
      this.calcularEstado(lectura.valor) === 'Alerta'
    ).length;
  }

  obtenerNombreSensor(id: number): string {
    const sensor = this.sensores.find((item: any) => Number(item.id) === Number(id));

    if (!sensor) {
      return `Sensor ${id || 'N/A'}`;
    }

    return `${sensor.tipo || 'Sensor'} - ${sensor.unidad || 'sin unidad'} - ID ${sensor.id}`;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleString('es-CO');
  }

  trackByLecturaId(index: number, lectura: any): number {
    return lectura.id || index;
  }
}
