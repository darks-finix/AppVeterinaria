import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {

  // Base de la URL para todas las operaciones
private url = 'http://localhost/Veterinaria/web/mascotas';

  constructor(private http: HttpClient) { }

  // GET: Obtener la lista completa de mascotas
  getMascotas(): Observable<any> {
    return this.http.get(`${this.url}?_format=json`);
  }

  // POST: Agregar una nueva mascota (Botón +)
  postMascota(datos: any): Observable<any> {
    return this.http.post(`${this.url}?_format=json`, datos);
  }

  // PUT: Editar los datos de una mascota (Icono Lápiz)
  // Se le pasa el ID en la URL y los nuevos datos en el cuerpo
  putMascota(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.url}/${id}?_format=json`, datos);
  }

  // DELETE: Eliminar una mascota (Icono Basura)
  // Yii2 detecta el ID automáticamente por la URL
  deleteMascota(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}?_format=json`);
  }
}