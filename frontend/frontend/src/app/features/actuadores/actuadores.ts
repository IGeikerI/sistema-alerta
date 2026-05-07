// src/app/features/actuadores/actuadores.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-actuadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actuadores.html',
  styleUrl: './actuadores.css'
})
export class ActuadoresComponent implements OnInit {

  actuadores: any[] = [];
  actuadoresFiltrados: any[] = [];
  dispositivos: any[] = [];

  loading = false;
  refreshing = false;
  saving = false;

  modalVisible = false;

  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  filtroEstado = 'TODOS';

  actuadorForm = {
    tipo: '',
    estado: 'Activo',
    dispositivo: null as number | null
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getActuadores()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (data: any) => {
          this.actuadores = Array.isArray(data) ? data : data.results || [];
          this.aplicarFiltros();
          this.cargarDispositivos();
        },
        error: (error: any) => {
          console.error('❌ Error cargando actuadores:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible cargar los actuadores del sistema.';
        }
      });
  }

  cargarDispositivos(): void {
    this.api.getDispositivos()
      .pipe(timeout(15000))
      .subscribe({
        next: (data: any) => {
          this.dispositivos = Array.isArray(data) ? data : data.results || [];
          console.log('✅ Dispositivos cargados para actuadores:', this.dispositivos);
        },
        error: (error: any) => {
          console.error('❌ Error cargando dispositivos:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible cargar los dispositivos para vincular actuadores.';
        }
      });
  }

  refrescar(): void {
    this.refreshing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getActuadores()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.refreshing = false;
        })
      )
      .subscribe({
        next: (data: any) => {
          this.actuadores = Array.isArray(data) ? data : data.results || [];
          this.aplicarFiltros();
          this.cargarDispositivos();
        },
        error: (error: any) => {
          console.error('❌ Error actualizando actuadores:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible actualizar los actuadores.';
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

guardarActuador(): void {
  this.errorMessage = '';
  this.successMessage = '';

  const tipo = this.actuadorForm.tipo.trim();
  const estado = this.actuadorForm.estado.trim();
  const dispositivoId = Number(this.actuadorForm.dispositivo);

  if (!tipo) {
    this.errorMessage = 'Debe ingresar el tipo de actuador.';
    return;
  }

  if (!estado) {
    this.errorMessage = 'Debe seleccionar el estado del actuador.';
    return;
  }

  if (!dispositivoId || isNaN(dispositivoId)) {
    this.errorMessage = 'Debe seleccionar un dispositivo válido.';
    return;
  }

  const payload = {
    tipo: tipo,
    estado: estado,
    dispositivo: dispositivoId
  };

  console.log('📤 Enviando actuador al backend:', payload);

  this.saving = true;
  this.cdr.detectChanges();

  this.api.crearActuador(payload)
    .pipe(
      timeout(15000),
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (res: any) => {
        console.log('✅ Actuador guardado:', res);

        this.successMessage = 'Actuador registrado correctamente.';

        // 🔥 CERRAR MODAL INMEDIATAMENTE
        this.modalVisible = false;
        this.saving = false;

        // 🔥 LIMPIAR FORMULARIO
        this.limpiarFormulario();

        // 🔥 FORZAR ACTUALIZACIÓN VISUAL
        this.cdr.detectChanges();

        // 🔥 RECARGAR DATOS DESPUÉS DE CERRAR MODAL
        setTimeout(() => {
          this.cargarDatos();
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error: any) => {
        console.error('❌ Error guardando actuador:', error);
        console.error('📌 Respuesta del backend:', error.error);

        this.errorMessage =
          error.error?.detail ||
          error.error?.error ||
          error.error?.tipo?.[0] ||
          error.error?.estado?.[0] ||
          error.error?.dispositivo?.[0] ||
          'No fue posible guardar el actuador. Revise los datos ingresados.';

        this.saving = false;
        this.cdr.detectChanges();
      }
    });
}

  limpiarFormulario(): void {
    this.actuadorForm = {
      tipo: '',
      estado: 'Activo',
      dispositivo: null
    };
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

    this.actuadoresFiltrados = this.actuadores.filter((actuador: any) => {
      const tipo = String(actuador.tipo || '').toLowerCase();
      const estado = String(actuador.estado || '').toLowerCase();
      const dispositivo = String(actuador.dispositivo || '').toLowerCase();

      const coincideBusqueda =
        !termino ||
        tipo.includes(termino) ||
        estado.includes(termino) ||
        dispositivo.includes(termino);

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        estado === this.filtroEstado.toLowerCase();

      return coincideBusqueda && coincideEstado;
    });
  }

  totalActuadores(): number {
    return this.actuadores.length;
  }

  totalActivos(): number {
    return this.actuadores.filter((actuador: any) => {
      const estado = String(actuador.estado || '').toLowerCase();
      return estado.includes('activo') || estado.includes('online') || estado.includes('encendido');
    }).length;
  }

  totalInactivos(): number {
    return this.actuadores.filter((actuador: any) => {
      const estado = String(actuador.estado || '').toLowerCase();
      return estado.includes('inactivo') || estado.includes('offline') || estado.includes('apagado');
    }).length;
  }

  dispositivosVinculados(): number {
    const ids = this.actuadores
      .map((actuador: any) => actuador.dispositivo)
      .filter((id: any) => id !== null && id !== undefined);

    return new Set(ids).size;
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

  getClaseEstado(estado: string): string {
    const valor = String(estado || '').toLowerCase();

    if (valor.includes('activo') || valor.includes('online') || valor.includes('encendido')) {
      return 'estado-activo';
    }

    if (valor.includes('inactivo') || valor.includes('offline') || valor.includes('apagado')) {
      return 'estado-inactivo';
    }

    if (valor.includes('mantenimiento')) {
      return 'estado-mantenimiento';
    }

    return 'estado-neutro';
  }

  trackByActuadorId(index: number, actuador: any): number {
    return actuador.id || index;
  }
}