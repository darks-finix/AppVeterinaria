import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ControlService {
  // Asegúrate de usar la IP 192.168.1.133 si pruebas en móvil o localhost en PC
  private apiURL = 'http://192.168.1.84/Veterinaria/web/index.php?r=controldiario';

  constructor(private http: HttpClient) {}

  // Obtener todos los registros
  obtenerControles(): Observable<any> {
    return this.http.get(`${this.apiURL}/index`);
  }

  // Crear un nuevo registro
  agregarControl(datos: any): Observable<any> {
    return this.http.post(`${this.apiURL}/create`, datos);
  }

  // Actualizar un registro existente
  actualizarControl(id: any, datos: any): Observable<any> {
    return this.http.put(`${this.apiURL}/update&id=${id}`, datos);
  }

  // Eliminar un registro
  eliminarControl(id: any): Observable<any> {
    return this.http.delete(`${this.apiURL}/delete&id=${id}`);
  }
}