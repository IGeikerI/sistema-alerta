// src/app/core/layout/topbar/topbar.component.ts

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioAuth } from '../../models/auth-response.model'; // 🔥 CAMBIO

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit { // 🔥 CAMBIO

  @Output() toggleSidebarEvent = new EventEmitter<void>();

  usuario: UsuarioAuth | null = null; // 🔥 CAMBIO

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void { // 🔥 NUEVO
    this.usuario = this.storageService.getUsuario();
    console.log('✅ Usuario cargado en topbar:', this.usuario);
  }

  toggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}