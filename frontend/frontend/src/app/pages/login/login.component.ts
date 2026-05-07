// src/app/pages/login/login.component.ts

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login(): void {
    if (this.loading) return;

    this.errorMessage = '';

    const email = this.email.trim();
    const password = this.password.trim();

    if (!email || !password) {
      this.errorMessage = 'Por favor ingrese correo y contraseña.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login(email, password).subscribe({
      next: (res: any) => {
        console.log('✅ Login exitoso, respuesta:', res);

        // 🔥 AGREGA ESTA LÍNEA (AQUÍ EXACTAMENTE)
    

        this.loading = false;
        this.errorMessage = '';
        this.cdr.detectChanges();

        setTimeout(() => {
          console.log('🚀 Redirigiendo al dashboard...');
          this.router.navigate(['/dashboard']).catch(err => {
            console.error('❌ Error en navegación:', err);
          });
        }, 500);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);

        this.loading = false;
        this.errorMessage = this.obtenerMensajeError(error);

        this.cdr.detectChanges();
      }
    });
  }

  private obtenerMensajeError(error: any): string {
    if (error.status === 0) {
      return '❌ No fue posible conectarse con el servidor.';
    }

    if (error.status === 400) {
      return '❌ Datos inválidos.';
    }

    if (error.status === 401) {
      return '❌ Correo o contraseña incorrectos.';
    }

    if (error.status === 404) {
      return '❌ Usuario no encontrado.';
    }

    if (error.status === 403) {
      return '❌ No tiene permisos.';
    }

    if (error.status === 500) {
      return '❌ Error interno del servidor.';
    }

    return '❌ Error al iniciar sesión. Intente nuevamente.';
  }
}