import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.services';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'] 
})
export class RegisterComponent {

  usuario = {
    nombre: '',
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}
registrar() {

  if (this.loading) return;

  this.loading = true;

  this.api.register(this.usuario).subscribe({
    next: () => {
      this.loading = false;
      alert('Usuario creado');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.loading = false; // 👈 CLAVE
      this.errorMessage = 'Error al registrar';
      console.error(err);
    }
  });
}
}