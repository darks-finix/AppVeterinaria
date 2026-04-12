import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router'; 
import { addIcons } from 'ionicons';
import { 
  pawOutline, notificationsOutline, homeOutline, medkitOutline, personOutline, 
  checkmarkOutline, closeOutline, trashOutline, createOutline, addOutline,
  restaurantOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-control-diario',
  templateUrl: './controldiario.page.html',
  styleUrls: ['./controldiario.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, RouterModule]
})
export class ControlDiarioPage implements OnInit {
  
  user: any = { id: null, nombre: '' };
  private apiUrl = 'http://192.168.1.84/Veterinaria/web/index.php/control-diario';
  private apiMascotas = 'http://192.168.1.84/Veterinaria/web/index.php/mascotas';

  isModalOpen = false;
  editando = false;
  idActual: number | null = null;
  
  listaMascotas: any[] = [];
  listaControles: any[] = [];

  nuevoControl = {
    mascota_id: '', 
    fecha: new Date().toISOString().substring(0, 10), 
    comio: false, 
    camino: false, 
    medicina: false, 
    comentario: '' 
  };

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public router: Router 
  ) {
    addIcons({
      'paw-outline': pawOutline, 
      'notifications-outline': notificationsOutline, 
      'home-outline': homeOutline, 
      'medkit-outline': medkitOutline, 
      'person-outline': personOutline,
      'checkmark-outline': checkmarkOutline, 
      'close-outline': closeOutline, 
      'trash-outline': trashOutline, 
      'create-outline': createOutline, 
      'add-outline': addOutline,
      'restaurant-outline': restaurantOutline
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  ionViewWillEnter() {
    this.limpiarDatosModulo();
    this.cargarDatosUsuario();
  }

  limpiarDatosModulo() {
    this.listaControles = [];
    this.listaMascotas = [];
    this.user = { id: null, nombre: '' };
    this.resetForm();
  }

  cargarDatosUsuario() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
      // Primero cargamos mascotas, luego controles para poder filtrar/validar
      this.cargarMascotas();
    }
  }

  cargarMascotas() {
    if (!this.user.id) return;
    
    // Cambiamos a la ruta corregida que acepta el usuario_id
    this.http.get<any[]>(`${this.apiUrl}/get-mascotas?usuario_id=${this.user.id}`).subscribe({
      next: (data) => {
        this.listaMascotas = data;
        this.cargarControles(); // Cargamos controles después de tener las mascotas
      },
      error: (e) => console.error('Error cargando mascotas:', e)
    });
  }

  cargarControles() {
    if (!this.user.id) return;

    this.http.get<any[]>(`${this.apiUrl}/index?usuario_id=${this.user.id}`).subscribe({
      next: (data) => {
        // Doble validación: solo mostramos si la mascota del control pertenece al usuario logueado
        const misMascotasIds = this.listaMascotas.map(m => m.id);
        this.listaControles = data.filter(c => misMascotasIds.includes(Number(c.mascota_id)));
      },
      error: (e) => {
        console.error('Error cargando controles:', e);
        this.listaControles = [];
      }
    });
  }

  // --- El resto de funciones (abrirModal, guardarControl, eliminar, etc) permanecen igual ---

  abrirModal() {
    this.editando = false;
    this.resetForm();
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  guardarControl() {
    if (!this.nuevoControl.mascota_id) {
      this.mostrarToast('Selecciona una mascota primero');
      return;
    }

    const datosEnvio = {
      ...this.nuevoControl,
      comio: this.nuevoControl.comio ? 1 : 0,
      camino: this.nuevoControl.camino ? 1 : 0,
      medicina: this.nuevoControl.medicina ? 1 : 0
    };

    if (this.editando && this.idActual) {
      this.http.post(`${this.apiUrl}/update?id=${this.idActual}`, datosEnvio).subscribe({
        next: () => this.finalizarGuardado('Actualizado correctamente'),
        error: (err) => this.mostrarToast('Error al actualizar')
      });
    } else {
      this.http.post(`${this.apiUrl}/create`, datosEnvio).subscribe({
        next: () => this.finalizarGuardado('Guardado correctamente'),
        error: (err) => this.mostrarToast('Error al guardar')
      });
    }
  }

  async finalizarGuardado(msj: string) {
    this.mostrarToast(msj);
    this.cargarControles();
    this.cerrarModal();
  }

  prepararEdicion(control: any) {
    this.editando = true;
    this.idActual = control.id;
    this.nuevoControl = { 
      ...control,
      comio: control.comio == 1 || control.comio === true,
      camino: control.camino == 1 || control.camino === true,
      medicina: control.medicina == 1 || control.medicina === true
    }; 
    this.isModalOpen = true;
  }

  async eliminarControl(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.http.post(`${this.apiUrl}/delete?id=${id}`, {}).subscribe({
              next: () => {
                this.mostrarToast('Eliminado');
                this.cargarControles();
              },
              error: (err) => console.error('Error al eliminar:', err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  resetForm() {
    this.editando = false;
    this.idActual = null;
    this.nuevoControl = {
      mascota_id: '', 
      fecha: new Date().toISOString().substring(0, 10), 
      comio: false, 
      camino: false, 
      medicina: false, 
      comentario: ''
    };
  }

  getNombreMascota(id: any): string {
    if (!this.listaMascotas || this.listaMascotas.length === 0) return 'Cargando...';
    const mascota = this.listaMascotas.find(m => m.id == id);
    return mascota ? mascota.nombre : 'Desconocida';
  }

  formatFecha(fechaStr: string): string {
    if(!fechaStr) return '';
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const parts = fechaStr.split('-');
    if (parts.length < 3) return fechaStr;
    return `${parseInt(parts[2])} de ${meses[parseInt(parts[1]) - 1]} de ${parts[0]}`;
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000 });
    toast.present();
  }

  // --- NAVEGACIÓN ---
  irAMascotas() { this.router.navigate(['/mascotas']); }
  irAControlDiario() { this.router.navigate(['/controldiario']); }
  irAAlimentacion() { this.router.navigate(['/alimentacion']); }
  irAHistorial() { this.router.navigate(['/historial']); }
  irARecomendaciones() { this.router.navigate(['/recordatorios']); }
}