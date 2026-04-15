import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router'; 
import { addIcons } from 'ionicons';
import { 
  pawOutline, add, createOutline, trashOutline, close, 
  homeOutline, medkitOutline, personOutline 
} from 'ionicons/icons';

registerLocaleData(localeEs);

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, RouterModule]
})
export class HistorialPage implements OnInit {
  
  user: any = { id: null, nombre: '' };
  
  private apiUrl = 'http://10.40.213.31/Veterinaria/web/index.php/historial-clinico';
  private apiMascotas = 'http://10.40.213.31/Veterinaria/web/index.php/mascotas';

  listaHistorial: any[] = [];
  listaMascotas: any[] = [];
  isModalOpen = false;
  editando = false;
  idActual: number | null = null;

  nuevaConsulta = {
    mascota_id: '',
    fecha: new Date().toISOString().substring(0, 10),
    motivo: '',
    diagnostico: '',
    tratamiento: '', // Corregido: Solo una propiedad en español
    veterinario: ''
  };

  constructor(
    private http: HttpClient, 
    private toastCtrl: ToastController, 
    private alertCtrl: AlertController,
    public router: Router 
  ) {
    addIcons({ 
      pawOutline, add, createOutline, trashOutline, close,
      homeOutline, medkitOutline, personOutline 
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
    this.listaHistorial = [];
    this.listaMascotas = [];
    this.user = { id: null, nombre: '' };
    this.resetForm();
  }

  cargarDatosUsuario() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
      this.cargarMascotasYHistorial();
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarMascotasYHistorial() {
    if (!this.user.id) return;

    this.http.get<any[]>(`${this.apiMascotas}/index?usuario_id=${this.user.id}`).subscribe({
      next: (mascotas) => {
        this.listaMascotas = mascotas;
        
        this.http.get<any[]>(`${this.apiUrl}/index?usuario_id=${this.user.id}`).subscribe({
          next: (historial) => {
            if (Array.isArray(historial)) {
              this.listaHistorial = historial.map(consulta => {
                const mascota = this.listaMascotas.find(m => m.id == consulta.mascota_id);
                return {
                  ...consulta,
                  nombre_mascota: mascota ? mascota.nombre : 'Mascota'
                };
              });
            } else {
              this.listaHistorial = [];
            }
          },
          error: () => this.listaHistorial = []
        });
      },
      error: (e) => {
        console.error('Error al cargar datos:', e);
        this.listaMascotas = [];
        this.listaHistorial = [];
      }
    });
  }

  getNombreMascota(id: any): string {
    if (!this.listaMascotas || this.listaMascotas.length === 0) return 'Cargando...';
    const mascota = this.listaMascotas.find(m => m.id == id);
    return mascota ? mascota.nombre : 'Mascota';
  }

  guardar() {
    if (!this.nuevaConsulta.mascota_id || !this.nuevaConsulta.motivo) {
      this.mostrarToast('Por favor completa los campos obligatorios');
      return;
    }

    const url = this.editando && this.idActual
      ? `${this.apiUrl}/update?id=${this.idActual}`
      : `${this.apiUrl}/create`;

    this.http.post(url, this.nuevaConsulta).subscribe({
      next: () => {
        this.mostrarToast(this.editando ? 'Actualizado correctamente' : 'Guardado correctamente');
        this.isModalOpen = false;
        this.cargarMascotasYHistorial();
      },
      error: () => this.mostrarToast('Error al procesar la solicitud')
    });
  }

  async eliminar(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar registro?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => {
          this.http.post(`${this.apiUrl}/delete?id=${id}`, {}).subscribe({
            next: () => {
              this.mostrarToast('Registro eliminado');
              this.cargarMascotasYHistorial();
            }
          });
        }}
      ]
    });
    await alert.present();
  }

  abrirModal(item?: any) {
    this.editando = !!item;
    if (item) {
      this.idActual = item.id;
      this.nuevaConsulta = { ...item };
    } else {
      this.resetForm();
    }
    this.isModalOpen = true;
  }

  resetForm() {
    this.nuevaConsulta = { 
      mascota_id: '', 
      fecha: new Date().toISOString().substring(0, 10), 
      motivo: '', 
      diagnostico: '', 
      tratamiento: '', // Corregido para que coincida con la definición inicial
      veterinario: ''
    };
    this.idActual = null;
  }

  async mostrarToast(m: string) {
    const t = await this.toastCtrl.create({ message: m, duration: 2000, position: 'bottom' });
    t.present();
  }
}