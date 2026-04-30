import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private api = environment.API_URL;

  constructor(private http: HttpClient) {}

  // ZONAS
  getZonas() {
    return this.http.get(`${this.api}/zonas/`);
  }

  crearZona(data: any) {
    return this.http.post(`${this.api}/zonas/create/`, data);
  }

  // LECTURAS
  getLecturas() {
    return this.http.get(`${this.api}/lecturas/list/`);
  }

  crearLectura(data: any) {
    return this.http.post(`${this.api}/lecturas/`, data);
  }

  // LOGIN
  login(data: any) {
    return this.http.post(`${this.api}/login/`, data);
  }
  // REGISTRO
register(data: any) {
  return this.http.post(`${this.api}/register/`, data);
}

}