// src/app/features/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { UsuarioAuth, RolAuth, RecursoAuth } from '../../core/models/auth-response.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  // 🔥 PROPIEDADES QUE USAS EN EL TEMPLATE
  usuario: UsuarioAuth | null = null;
  roles: RolAuth[] = [];
  recursos: RecursoAuth[] = [];

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    try {
      // 🔥 OBTENER DATOS DEL STORAGE
      this.usuario = this.storageService.getUsuarioAuth();
      this.roles = this.storageService.getRolesAuth();
      this.recursos = this.storageService.getRecursosAuth();

      console.log('✅ Usuario:', this.usuario);
      console.log('✅ Roles:', this.roles);
      console.log('✅ Recursos:', this.recursos);

      // 🔥 SI NO HAY USUARIO, REDIRIGIR A LOGIN
      if (!this.usuario) {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}