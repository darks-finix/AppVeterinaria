import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  pawOutline, add, createOutline, trashOutline, close, 
  homeOutline, medkitOutline, personOutline, bandageOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-vacunas',
  templateUrl: './vacunas.page.html',
  styleUrls: ['./vacunas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, RouterModule]
})
export class VacunasPage implements OnInit {
  
  user: any = { id: null, nombre: '' };
  
  // IP DE TU RED (Igual que en historial)
  private apiUrl = 'http://10.40.213.31/Veterinaria/web/index.php/vacunas';
  private apiMascotas = 'http://10.40.213.31/Veterinaria/web/index.php/mascotas';

  listaVacunas: any[] = [];
  listaMascotas: any[] = [];
  isModalOpen = false;
  editando = false;
  idActual: number | null = null;

  nuevaVacuna = {
    mascota_id: '',
    nombre_vacuna: '',
    fecha_aplicacion: new Date().toISOString().substring(0, 10),
    proxima_dosis: '',
    observaciones: ''
  };

  constructor(
    private http: HttpClient, 
    private toastCtrl: ToastController, 
    private alertCtrl: AlertController,
    public router: Router
  ) {
    addIcons({ 
      pawOutline, add, createOutline, trashOutline, close,
      homeOutline, medkitOutline, personOutline, bandageOutline 
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  ionViewWillEnter() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
      this.cargarMascotasYVacunas();
    }
  }

  cargarMascotasYVacunas() {
    if (!this.user.id) return;

    // 1. Traemos las mascotas del usuario
    this.http.get<any[]>(`${this.apiMascotas}/index?usuario_id=${this.user.id}`).subscribe({
      next: (mascotas) => {
        this.listaMascotas = mascotas;
        
        // 2. Traemos todas las vacunas y filtramos por las mascotas que pertenecen al usuario
        this.http.get<any[]>(`${this.apiUrl}/index`).subscribe({
          next: (vacunas) => {
            this.listaVacunas = vacunas.filter(v => 
              this.listaMascotas.some(m => m.id == v.mascota_id)
            );
          }
        });
      },
      error: (e) => console.error('Error al cargar datos:', e)
    });
  }

  getNombreMascota(id: any): string {
    const mascota = this.listaMascotas.find(m => m.id == id);
    return mascota ? mascota.nombre : 'Cargando...';
  }

  guardar() {
    if (!this.nuevaVacuna.mascota_id || !this.nuevaVacuna.nombre_vacuna) {
      this.mostrarToast('Por favor completa los campos obligatorios');
      return;
    }

    // Igual que en Historial: usamos POST para update y create
    const url = this.editando && this.idActual
      ? `${this.apiUrl}/update?id=${this.idActual}`
      : `${this.apiUrl}/create`;

    this.http.post(url, this.nuevaVacuna).subscribe({
      next: () => {
        this.mostrarToast(this.editando ? 'Actualizado correctamente' : 'Guardado correctamente');
        this.isModalOpen = false;
        this.cargarMascotasYVacunas();
      },
      error: () => this.mostrarToast('Error al procesar la solicitud')
    });
  }

  async eliminar(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar vacuna?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => {
          this.http.post(`${this.apiUrl}/delete?id=${id}`, {}).subscribe({
            next: () => {
              this.mostrarToast('Registro eliminado');
              this.cargarMascotasYVacunas();
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
      this.nuevaVacuna = { ...item };
    } else {
      this.resetForm();
    }
    this.isModalOpen = true;
  }

  resetForm() {
    this.nuevaVacuna = { 
      mascota_id: '', 
      nombre_vacuna: '',
      fecha_aplicacion: new Date().toISOString().substring(0, 10), 
      proxima_dosis: '',
      observaciones: ''
    };
    this.idActual = null;
  }

  async mostrarToast(m: string) {
    const t = await this.toastCtrl.create({ message: m, duration: 2000, position: 'bottom' });
    t.present();
  }
}