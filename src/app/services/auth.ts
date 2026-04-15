import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private baseUrl = 'http://10.40.213.31/Veterinaria/web/usuarios';

  constructor(private http: HttpClient) { }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  registrar(datos: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/registro`, datos, this.httpOptions);
  }

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credenciales, this.httpOptions);
  }
}