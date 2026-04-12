import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { 
  pawOutline, 
  notificationsOutline, 
  homeOutline, 
  medkitOutline, 
  personOutline, 
  trashOutline, 
  createOutline, 
  closeOutline,
  addOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-mascotas',
  templateUrl: './mascotas.page.html',
  styleUrls: ['./mascotas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class MascotasPage implements OnInit {
  // VARIABLE PARA EL ENCABEZADO DINÁMICO
  user: any = { id: null, nombre: '' };

  // Control de interfaz
  seccionActiva = 'lista';
  isModalOpen = false; 
  
  // Datos
  listaMascotas: any[] = [];
  editando = false;
  idActual: number | null = null;

  // VARIABLE NUEVA PARA LA OPCIÓN "OTRO"
  otraEspecieNombre: string = '';

  nuevaMascota = {
    usuario_id: null as number | null,
    nombre: '', 
    especie: '', 
    raza: '', 
    edad: null, 
    peso: null, 
    sexo: '', 
    alergias: '', 
    qr_code: ''
  };

  // Asegúrate de que esta IP sea la correcta de tu servidor
  private urlApi = 'http://192.168.1.84/Veterinaria/web/index.php/mascotas';

  constructor(private http: HttpClient, private router: Router) {
    addIcons({
      'paw-outline': pawOutline,
      'notifications-outline': notificationsOutline,
      'home-outline': homeOutline,
      'medkit-outline': medkitOutline,
      'person-outline': personOutline,
      'trash-outline': trashOutline,
      'create-outline': createOutline,
      'close-outline': closeOutline,
      'add-outline': addOutline
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  ionViewWillEnter() {
    this.cargarDatosUsuario();
    this.obtenerMascotas();
  }

  cargarDatosUsuario() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
      this.nuevaMascota.usuario_id = this.user.id;
    }
  }

  // --- MÉTODOS DE API ---

  obtenerMascotas() {
    const userId = this.user.id;
    if (!userId) return;

    this.http.get<any[]>(`${this.urlApi}/index?usuario_id=${userId}`).subscribe({
      next: (res) => {
        this.listaMascotas = res;
        console.log('Mascotas cargadas:', res);
      },
      error: (err) => {
        console.error('Error al obtener mascotas:', err);
      }
    });
  }

  guardarMascota() {
    this.nuevaMascota.usuario_id = this.user.id;
    
    // CLAVE: Si se eligió "Otro", asignamos el nombre personalizado a la especie
    if (this.nuevaMascota.especie === 'Otro' && this.otraEspecieNombre.trim() !== '') {
      this.nuevaMascota.especie = this.otraEspecieNombre;
    }

    if (this.editando && this.idActual) {
      this.http.post(`${this.urlApi}/update?id=${this.idActual}`, this.nuevaMascota).subscribe({
        next: (res) => {
          console.log('Actualizado:', res);
          this.obtenerMascotas();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      const randomID = Math.floor(100 + Math.random() * 900);
      this.nuevaMascota.qr_code = `QR-${this.nuevaMascota.nombre.toUpperCase() || 'PET'}-${randomID}`;
      
      this.http.post(`${this.urlApi}/create`, this.nuevaMascota).subscribe({
        next: (res) => {
          console.log('Creado:', res);
          this.obtenerMascotas();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al guardar:', err)
      });
    }
  }

  prepararEdicion(mascota: any) {
    this.editando = true;
    this.idActual = mascota.id;
    this.nuevaMascota = { ...mascota }; 

    // Si la especie en la BD no es Perro ni Gato, activamos el input "Otro"
    if (mascota.especie !== 'Perro' && mascota.especie !== 'Gato') {
      this.otraEspecieNombre = mascota.especie;
      this.nuevaMascota.especie = 'Otro';
    }

    this.abrirModal();
  }

  eliminarMascota(id: number) {
    if (confirm('¿Estás seguro de eliminar esta mascota?')) {
      this.http.post(`${this.urlApi}/delete-pet?id=${id}`, {}).subscribe({
        next: () => {
          this.obtenerMascotas();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  // --- INTERFAZ ---

  abrirModal() {
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.editando = false;
    this.idActual = null;
    this.otraEspecieNombre = ''; // Limpiar campo extra
    this.nuevaMascota = { 
      usuario_id: this.user.id, 
      nombre: '', 
      especie: '', 
      raza: '', 
      edad: null, 
      peso: null, 
      sexo: '', 
      alergias: '', 
      qr_code: '' 
    };
  }

  // --- NAVEGACIÓN ---
  irARecomendaciones() { this.router.navigate(['/recordatorios']); }
  irAAlimentacion() { this.router.navigate(['/alimentacion']); }
  irAControlDiario() { this.router.navigate(['/control-diario']); }
  irAHistorial() { this.router.navigate(['/historial']); }
}