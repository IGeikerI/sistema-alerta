// src/app/features/usuarios/usuarios.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';

import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {

  usuarios: any[] = [];
  roles: any[] = [];
  usuarioRoles: any[] = [];

  usuariosConRol: any[] = [];

  loading = false;
  refreshing = false;
  errorMessage = '';
  successMessage = '';

  totalUsuarios = 0;
  usuariosActivos = 0;
  usuariosConRolAsignado = 0;
  totalRoles = 0;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    forkJoin({
      usuarios: this.api.getUsuarios().pipe(
        timeout(15000),
        catchError((error: any) => {
          console.error('❌ Error cargando usuarios:', error);
          return of([]);
        })
      ),

      roles: this.api.getRoles().pipe(
        timeout(15000),
        catchError((error: any) => {
          console.error('❌ Error cargando roles:', error);
          return of([]);
        })
      ),

      usuarioRoles: this.api.getUsuarioRol().pipe(
        timeout(15000),
        catchError((error: any) => {
          console.error('❌ Error cargando usuario-rol:', error);
          return of([]);
        })
      )
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp: any) => {
          console.log('✅ Respuesta usuarios:', resp.usuarios);
          console.log('✅ Respuesta roles:', resp.roles);
          console.log('✅ Respuesta usuario-rol:', resp.usuarioRoles);

          this.usuarios = this.normalizarRespuesta(resp.usuarios);
          this.roles = this.normalizarRespuesta(resp.roles);
          this.usuarioRoles = this.normalizarRespuesta(resp.usuarioRoles);

          this.prepararUsuarios();

          if (this.usuarios.length === 0) {
            this.errorMessage = 'No se encontraron usuarios registrados o no fue posible cargarlos.';
          }

          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('❌ Error general cargando datos de usuarios:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible cargar los usuarios del sistema.';

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  refrescar(): void {
    this.refreshing = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    forkJoin({
      usuarios: this.api.getUsuarios().pipe(
        timeout(15000),
        catchError((error: any) => {
          console.error('❌ Error actualizando usuarios:', error);
          return of([]);
        })
      ),

      roles: this.api.getRoles().pipe(
        timeout(15000),
        catchError((error: any) => {
          console.error('❌ Error actualizando roles:', error);
          return of([]);
        })
      ),

      usuarioRoles: this.api.getUsuarioRol().pipe(
        timeout(15000),
        catchError((error: any) => {
          console.error('❌ Error actualizando usuario-rol:', error);
          return of([]);
        })
      )
    })
      .pipe(
        finalize(() => {
          this.refreshing = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp: any) => {
          console.log('✅ Usuarios actualizados:', resp);

          this.usuarios = this.normalizarRespuesta(resp.usuarios);
          this.roles = this.normalizarRespuesta(resp.roles);
          this.usuarioRoles = this.normalizarRespuesta(resp.usuarioRoles);

          this.prepararUsuarios();

          this.successMessage = 'Usuarios actualizados correctamente.';
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('❌ Error actualizando datos:', error);

          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            'No fue posible actualizar los usuarios.';

          this.refreshing = false;
          this.cdr.detectChanges();
        }
      });
  }

  normalizarRespuesta(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.results)) {
      return data.results;
    }

    return [];
  }

  prepararUsuarios(): void {
    this.usuariosConRol = this.usuarios.map((usuario: any) => {
      const relacion = this.usuarioRoles.find((ur: any) => {
        const usuarioId = typeof ur.usuario === 'object'
          ? ur.usuario?.id
          : ur.usuario;

        return Number(usuarioId) === Number(usuario.id);
      });

      let rolNombre = 'Sin rol asignado';

      if (relacion) {
        const rolId = typeof relacion.rol === 'object'
          ? relacion.rol?.id
          : relacion.rol;

        const rol = this.roles.find((r: any) => Number(r.id) === Number(rolId));

        rolNombre =
          rol?.nombre ||
          relacion.rol?.nombre ||
          'Rol no identificado';
      }

      return {
        ...usuario,
        rolNombre
      };
    });

    this.totalUsuarios = this.usuarios.length;
    this.totalRoles = this.roles.length;

    this.usuariosConRolAsignado = this.usuariosConRol.filter((usuario: any) =>
      usuario.rolNombre !== 'Sin rol asignado'
    ).length;

    // Tu modelo Usuario no tiene campo estado, por eso asumimos activos los existentes.
    this.usuariosActivos = this.usuariosConRol.length;

    console.log('✅ Usuarios preparados:', this.usuariosConRol);
    console.log('📌 Total usuarios:', this.totalUsuarios);
    console.log('📌 Total roles:', this.totalRoles);
    console.log('📌 Usuarios con rol:', this.usuariosConRolAsignado);
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'U';

    return nombre
      .split(' ')
      .map(parte => parte.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getClaseRol(rol: string): string {
    const valor = String(rol || '').toLowerCase();

    if (valor.includes('administrador') || valor.includes('admin')) {
      return 'rol-admin';
    }

    if (valor.includes('operador')) {
      return 'rol-operador';
    }

    if (valor.includes('invitado')) {
      return 'rol-invitado';
    }

    if (valor.includes('usuario')) {
      return 'rol-usuario';
    }

    return 'rol-sin-asignar';
  }
}