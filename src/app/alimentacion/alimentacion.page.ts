import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es'; 
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router'; 
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, pawOutline, homeOutline, medkitOutline, personOutline, close, trash } from 'ionicons/icons';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-alimentacion',
  templateUrl: './alimentacion.page.html',
  styleUrls: ['./alimentacion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, RouterModule] 
})
export class AlimentacionPage implements OnInit {
  user: any = { id: null, nombre: '' };
  
  // 1. CORRECCIÓN DE IP Y ENDPOINTS
  private apiUrl = 'http://10.40.213.31/Veterinaria/web/index.php/alimentacion';
  private apiMascotas = 'http://10.40.213.31/Veterinaria/web/index.php/mascotas';

  listaAlimentacion: any[] = [];
  listaMascotas: any[] = [];
  isModalOpen = false;
  editando = false;
  idActual: number | null = null;

  nuevaAlimentacion = {
    mascota_id: '',
    fecha: new Date().toISOString().substring(0, 10),
    tipo_alimento: '',
    cantidad: ''
  };

  constructor(
    private http: HttpClient, 
    private alertCtrl: AlertController, 
    private toastCtrl: ToastController,
    public router: Router
  ) {
    addIcons({ add, createOutline, trashOutline, trash, pawOutline, homeOutline, medkitOutline, personOutline, close });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  ionViewWillEnter() {
    // RESET PREVENTIVO: Limpiamos las listas para no ver datos del usuario anterior
    this.limpiarDatosModulo();
    this.cargarDatosUsuario();
  }

  // Nueva función para asegurar limpieza total entre sesiones
  limpiarDatosModulo() {
    this.listaAlimentacion = [];
    this.listaMascotas = [];
    this.user = { id: null, nombre: '' };
    this.resetForm();
  }

  // 2. CARGA DE DATOS CON FILTRO DE USUARIO
  cargarDatosUsuario() {
    const data = localStorage.getItem('user');
    if (data) {
      this.user = JSON.parse(data);
      this.cargarMascotas(); 
      this.listarAlimentacion();
    } else {
      this.router.navigate(['/login']);
    }
  }

  listarAlimentacion() {
    if (!this.user.id) return;

    // FILTRADO CLAVE: Agregamos el usuario_id para que el servidor filtre los registros
    this.http.get<any[]>(`${this.apiUrl}/index?usuario_id=${this.user.id}`).subscribe({
      next: (data) => {
        this.listaAlimentacion = Array.isArray(data) ? data : [];
      },
      error: (e) => {
        console.error('Error alimentación:', e);
        this.listaAlimentacion = [];
      }
    });
  }

  cargarMascotas() {
    if (!this.user.id) return;
    
    // FILTRADO CLAVE: Lola ya no verá a "looo" de María
    this.http.get<any[]>(`${this.apiMascotas}/index?usuario_id=${this.user.id}`).subscribe({
      next: (data) => {
        this.listaMascotas = data;
        console.log('Mascotas para el selector:', data);
      },
      error: (e) => {
        console.error('Error mascotas:', e);
        this.listaMascotas = [];
      }
    });
  }

  abrirCalendario(input: HTMLInputElement) {
    if ('showPicker' in HTMLInputElement.prototype) {
      input.showPicker();
    } else {
      input.click();
    }
  }

  guardar() {
    if (!this.nuevaAlimentacion.mascota_id || !this.nuevaAlimentacion.tipo_alimento) {
      this.mostrarToast('Completa los campos obligatorios');
      return;
    }

    if (this.editando && this.idActual) {
      this.http.post(`${this.apiUrl}/update?id=${this.idActual}`, this.nuevaAlimentacion).subscribe({
        next: () => this.finalizar('Actualizado correctamente'),
        error: () => this.mostrarToast('Error al actualizar')
      });
    } else {
      this.http.post(`${this.apiUrl}/create`, this.nuevaAlimentacion).subscribe({
        next: () => this.finalizar('Guardado correctamente'),
        error: () => this.mostrarToast('Error al guardar')
      });
    }
  }

  async eliminar(id: number) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar?',
      message: '¿Estás seguro de eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => {
          this.http.post(`${this.apiUrl}/delete?id=${id}`, {}).subscribe({
            next: () => {
              this.mostrarToast('Eliminado');
              this.listarAlimentacion();
            },
            error: () => this.mostrarToast('Error al eliminar')
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
      this.nuevaAlimentacion = { ...item };
    } else {
      this.resetForm();
    }
    this.isModalOpen = true;
  }

  finalizar(msj: string) {
    this.isModalOpen = false;
    this.mostrarToast(msj);
    this.listarAlimentacion();
  }

  async mostrarToast(m: string) {
    const t = await this.toastCtrl.create({ message: m, duration: 2000 });
    t.present();
  }

  resetForm() {
    this.nuevaAlimentacion = { 
      mascota_id: '', 
      fecha: new Date().toISOString().substring(0, 10), 
      tipo_alimento: '', 
      cantidad: '' 
    };
    this.idActual = null;
  }

  getNombreMascota(id: any) {
    if (!this.listaMascotas || this.listaMascotas.length === 0) return 'Cargando...';
    const mascota = this.listaMascotas.find(m => m.id == id);
    return mascota ? mascota.nombre : 'Mascota';
  }
}