import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  homeOutline, pawOutline, medkitOutline, personOutline, 
  notificationsOutline, restaurantOutline, walkOutline, flaskOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, HttpClientModule, FormsModule]
})
export class HomePage implements OnInit {
  
  private apiUrl = 'http://veterinaria-huellitas.infinityfreeapp.com/web/index.php';

  user: any = { nombre: '' };
  mascotas: any[] = []; 
  mascotaSeleccionadaId: number | null = null;
  fechaSeleccionada: string = new Date().toLocaleDateString('sv-SE');
  
  infoHome: any = {
    perfil: {},
    bienestar: { comio: 'ROJO', camino: 'ROJO', medicina: 'ROJO' },
    vacuna: {},
    historial: {},
    alimentacion: {},
    recomendacion: ''
  };

  constructor(private router: Router, private http: HttpClient) {
    addIcons({
      'home-outline': homeOutline, 'paw-outline': pawOutline,
      'medkit-outline': medkitOutline, 'person-outline': personOutline,
      'notifications-outline': notificationsOutline, 'restaurant-outline': restaurantOutline,
      'walk-outline': walkOutline, 'flask-outline': flaskOutline
    });
  }

  ngOnInit() {
    this.cargarDatosYUser();
  }

  ionViewWillEnter() {
    // Al entrar a la vista, reseteamos todo para evitar "fantasmas" de otras cuentas
    this.limpiarDatos();
    this.cargarDatosYUser();
  }

  cargarDatosYUser() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
      this.cargarMascotas();
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarMascotas() {
    this.http.get<any[]>(`${this.apiUrl}/mascotas/index?usuario_id=${this.user.id}`).subscribe({
      next: (res) => {
        this.mascotas = res;
        if (this.mascotas && this.mascotas.length > 0) {
          // Si cambiamos de cuenta, seleccionamos la primera mascota por defecto
          this.mascotaSeleccionadaId = this.mascotas[0].id;
          this.actualizarInfoMascota();
        } else {
          this.limpiarDatos(); // Si el usuario no tiene mascotas, todo a cero
        }
      },
      error: (err) => {
        console.error("Error cargando mascotas", err);
        this.limpiarDatos();
      }
    });
  }

  actualizarInfoMascota() {
    if (!this.mascotaSeleccionadaId) return;

    // Limpiamos la información detallada antes de cada petición nueva
    this.infoHome.vacuna = {};
    this.infoHome.historial = {};
    this.infoHome.alimentacion = {};

    const mId = this.mascotaSeleccionadaId;
    const fechaFiltro = this.fechaSeleccionada.substring(0, 10);

    // 1. Perfil Local
    const mascotaEncontrada = this.mascotas.find(m => m.id === mId);
    if (mascotaEncontrada) this.infoHome.perfil = mascotaEncontrada;

    // 2. Semáforo
    this.http.get<any>(`${this.apiUrl}/control-diario/hoy?mascota_id=${mId}&fecha=${fechaFiltro}`).subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res[0] : res;
        if (data) {
          this.infoHome.bienestar.comio = (data.comio == 1) ? 'VERDE' : 'ROJO';
          this.infoHome.bienestar.camino = (data.camino == 1) ? 'VERDE' : 'ROJO';
          this.infoHome.bienestar.medicina = (data.medicina == 1) ? 'VERDE' : 'ROJO';
        } else {
          this.infoHome.bienestar = { comio: 'ROJO', camino: 'ROJO', medicina: 'ROJO' };
        }
      },
      error: () => this.infoHome.bienestar = { comio: 'ROJO', camino: 'ROJO', medicina: 'ROJO' }
    });

    // 3. Última Vacuna
    this.http.get<any>(`${this.apiUrl}/vacunas/ultima?mascota_id=${mId}`).subscribe({
      next: (res) => this.infoHome.vacuna = res || {},
      error: () => this.infoHome.vacuna = {}
    });

    // 4. Último Historial
    this.http.get<any>(`${this.apiUrl}/historial-clinico/ultima?mascota_id=${mId}`).subscribe({
      next: (res) => this.infoHome.historial = res || {},
      error: () => this.infoHome.historial = {}
    });

    // 5. Última Alimentación
    this.http.get<any>(`${this.apiUrl}/alimentacion/ultima?mascota_id=${mId}`).subscribe({
      next: (res) => this.infoHome.alimentacion = res || {},
      error: () => this.infoHome.alimentacion = {}
    });

    this.infoHome.recomendacion = "Datos actualizados.";
  }

  limpiarDatos() {
    this.mascotas = [];
    this.mascotaSeleccionadaId = null; 
    this.infoHome = {
      perfil: {},
      bienestar: { comio: 'ROJO', camino: 'ROJO', medicina: 'ROJO' },
      vacuna: {},
      historial: {},
      alimentacion: {},
      recomendacion: 'Sin información'
    };
  }
}