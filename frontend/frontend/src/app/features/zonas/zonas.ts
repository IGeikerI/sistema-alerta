import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zonas.html',
  styleUrl: './zonas.css'
})
export class ZonasComponent implements OnInit {

  zonas: any[] = [];
  zonasFiltradas: any[] = [];

  loading = false;
  refreshing = false;
  saving = false;

  modalVisible = false;

  errorMessage = '';
  successMessage = '';

  searchTerm = '';

  zonaForm = {
    nombre: '',
    descripcion: '',
    direccion: ''
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarZonas();
  }

  cargarZonas(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getZonas().subscribe({
      next: (data: any) => {
        this.zonas = Array.isArray(data) ? data : data.results || [];
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando zonas:', error);
        this.errorMessage = 'No fue posible cargar las zonas de monitoreo.';
        this.loading = false;
      }
    });
  }

  refrescar(): void {
    this.refreshing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getZonas().subscribe({
      next: (data: any) => {
        this.zonas = Array.isArray(data) ? data : data.results || [];
        this.aplicarFiltros();
        this.refreshing = false;
      },
      error: (error: any) => {
        console.error('Error actualizando zonas:', error);
        this.errorMessage = 'No fue posible actualizar las zonas.';
        this.refreshing = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.limpiarFormulario();
    this.errorMessage = '';
    this.successMessage = '';
    this.modalVisible = true;
  }

  cerrarModal(): void {
    if (this.saving) return;

    this.modalVisible = false;
    this.errorMessage = '';
    this.limpiarFormulario();
  }

  guardarZona(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.zonaForm.nombre.trim()) {
      this.errorMessage = 'Debe ingresar el nombre de la zona.';
      return;
    }

    if (!this.zonaForm.descripcion.trim()) {
      this.errorMessage = 'Debe ingresar una descripción para la zona.';
      return;
    }

    const payload = {
      nombre: this.zonaForm.nombre.trim(),
      descripcion: this.zonaForm.descripcion.trim(),
      direccion: this.zonaForm.direccion.trim()
    };

    this.saving = true;

    this.api.crearZona(payload).subscribe({
      next: () => {
        this.successMessage = 'Zona registrada correctamente.';
        this.saving = false;
        this.modalVisible = false;
        this.limpiarFormulario();
        this.cargarZonas();
      },
      error: (error: any) => {
        console.error('Error guardando zona:', error);
        this.errorMessage = 'No fue posible guardar la zona. Revise los datos ingresados.';
        this.saving = false;
      }
    });
  }

  limpiarFormulario(): void {
    this.zonaForm = {
      nombre: '',
      descripcion: '',
      direccion: ''
    };
  }

  buscar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const termino = this.searchTerm.toLowerCase().trim();

    this.zonasFiltradas = this.zonas.filter((zona: any) => {
      const nombre = String(zona.nombre || '').toLowerCase();
      const descripcion = String(zona.descripcion || '').toLowerCase();
      const direccion = String(zona.direccion || '').toLowerCase();

      return (
        !termino ||
        nombre.includes(termino) ||
        descripcion.includes(termino) ||
        direccion.includes(termino)
      );
    });
  }

  zonasConDireccion(): number {
    return this.zonas.filter((zona: any) =>
      zona.direccion && String(zona.direccion).trim() !== ''
    ).length;
  }

  zonasSinDireccion(): number {
    return this.zonas.length - this.zonasConDireccion();
  }

  getInicial(nombre: string): string {
    if (!nombre) return 'Z';
    return nombre.charAt(0).toUpperCase();
  }

  trackByZonaId(index: number, zona: any): number {
    return zona.id || index;
  }
}