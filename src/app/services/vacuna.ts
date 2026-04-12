import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // ESTA ES LA LÍNEA QUE FALTA

@Injectable({
  providedIn: 'root'
})
export class VacunaService {
  // Asegúrate de usar la IP 192.168.1.133 para evitar errores de conexión
  private apiURL = 'http://192.168.1.84/Veterinaria/web/index.php/vacunas';

  constructor(private http: HttpClient) {}

  obtenerVacunas(): Observable<any> {
    return this.http.get(`${this.apiURL}/index`);
  }

  agregarVacuna(datos: any): Observable<any> {
    return this.http.post(`${this.apiURL}/create`, datos);
  }

  actualizarVacuna(id: any, datos: any): Observable<any> {
    return this.http.post(`${this.apiURL}/update?id=${id}`, datos);
  }

  eliminarVacuna(id: any): Observable<any> {
    return this.http.post(`${this.apiURL}/delete?id=${id}`, {});
  }
}