import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  paw, notificationsOutline, calendarOutline, addOutline,
  checkmark, pencilOutline, trashOutline, homeOutline,
  pawOutline, medkitOutline, personOutline, chevronDownOutline,
  chevronBackOutline, chevronForwardOutline, readerOutline,
  closeOutline
} from 'ionicons/icons';

// ─────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────
interface NotaRecordatorio {
  id: number;
  tipo: string;           // 'Nota' | 'Recordatorio' | 'Cita' | 'Medicamento'
  mascota_id: number | null;
  mascota_nombre?: string;
  titulo: string;
  descripcion: string;
  fecha: string;          // 'YYYY-MM-DD'
  completada: number;     // 0 | 1
}

interface Mascota {
  id: number;
  nombre: string;
  usuario_id?: number; // Añadido para el filtro
}

interface DiaCalendario {
  numero: number;
  fechaCompleta: string;
  notas: NotaRecordatorio[];
  esHoy: boolean;
}

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule, RouterModule]
})
export class RecordatoriosPage implements OnInit {

  // ── API ───────────────────────────────────────────────────────
  // ⚠️ Asegúrate de usar la IP de tu servidor (ej: 192.168.x.x) para pruebas en físico
  private apiUrl      = 'http://10.40.213.31/Veterinaria/web/index.php/notas-recordatorios';
  private mascotasUrl = 'http://10.40.213.31/Veterinaria/web/index.php/mascotas';

  // ── ESTADO UI ─────────────────────────────────────────────────
  viewMode: 'lista' | 'calendario' = 'lista';
  isModalOpen = false;
  isEditMode  = false;
  guardando   = false;
  formError   = '';

  // ── DATOS DEL USUARIO (ajusta según tu sistema de sesión) ────
  usuarioNombre = 'Ana';
  mascotaNombre = 'Luna';
  userId: number | null = null; // Variable para identificar a Lola (ID 4)

  // ── DATOS ────────────────────────────────────────────────────
  listaNotas: NotaRecordatorio[] = [];
  mascotas:   Mascota[]          = [];

  // ── CALENDARIO ───────────────────────────────────────────────
  fechaActual = new Date();
  mesActual   = this.fechaActual.getMonth();
  anioActual  = this.fechaActual.getFullYear();

  nombresMeses = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];
  diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  diasEnMes:    DiaCalendario[] = [];
  vacioInicial: number[]        = [];

  // ── FORMULARIO ───────────────────────────────────────────────
  notaForm: Partial<NotaRecordatorio> = this.formVacio();

  // ─────────────────────────────────────────────────────────────
  constructor(
    private http:  HttpClient,
    private toast: ToastController,
    private alert: AlertController
  ) {
    addIcons({
      paw, notificationsOutline, calendarOutline, addOutline,
      checkmark, pencilOutline, trashOutline, homeOutline,
      pawOutline, medkitOutline, personOutline, chevronDownOutline,
      chevronBackOutline, chevronForwardOutline, readerOutline,
      closeOutline
    });
  }

  // ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.cargarDatosSesion(); // Carga primero la identidad del usuario
  }

  // Se ejecuta cada vez que la vista vuelve a estar activa
  ionViewWillEnter() {
    this.cargarDatosSesion();
  }

  // Función nueva para centralizar la obtención del usuario
  cargarDatosSesion() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.usuarioNombre = parsed.nombre || parsed.username || 'Ana';
        this.userId = parsed.id; // Aquí se obtiene el 4 de Lola
      } catch (_) {}
    }

    const petName = localStorage.getItem('activePetName');
    if (petName) this.mascotaNombre = petName;

    this.cargarMascotas(); // Se llama aquí para asegurar que tenemos el userId
  }

  // ─────────────────────────────────────────────────────────────
  // CARGA DE DATOS
  // ─────────────────────────────────────────────────────────────

cargarMascotas() {
    // Enviamos el userId en la URL para que el servidor filtre
    this.http.get<any>(`${this.mascotasUrl}/index?usuario_id=${this.userId}`).subscribe({
      next: (res) => {
        // Ajuste para leer tanto array directo como objeto .data
        this.mascotas = Array.isArray(res) ? res : (res.data || []);
        console.log("Mascotas de Lola cargadas:", this.mascotas);
        
        // Una vez que tenemos las mascotas, cargamos las notas
        this.cargarNotas();
      },
      error: (err) => console.error("Error cargando mascotas:", err)
    });
  }

  cargarNotas() {
    // También enviamos el userId aquí
    this.http.get<any>(`${this.apiUrl}/index?usuario_id=${this.userId}`).subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        
        // Mantenemos solo las notas que pertenecen a las mascotas de Lola
        this.listaNotas = data.filter((n: any) => 
          n.mascota_id == null || this.mascotas.some(m => m.id == n.mascota_id)
        );
        
        console.log("Notas filtradas:", this.listaNotas);
        this.generarCalendario();
      },
      error: async () => {
        const t = await this.toast.create({
          message: 'Error al cargar recordatorios',
          duration: 3000,
          color: 'danger'
        });
        t.present();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CALENDARIO
  // ─────────────────────────────────────────────────────────────

  generarCalendario() {
    this.diasEnMes    = [];
    this.vacioInicial = [];

    const primerDia = new Date(this.anioActual, this.mesActual, 1).getDay();
    const totalDias = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    const hoy       = new Date();

    for (let i = 0; i < primerDia; i++) this.vacioInicial.push(i);

    for (let d = 1; d <= totalDias; d++) {
      const fechaComp = `${this.anioActual}-${String(this.mesActual + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      this.diasEnMes.push({
        numero: d,
        fechaCompleta: fechaComp,
        notas: this.listaNotas.filter(n => n.fecha === fechaComp),
        esHoy:
          d === hoy.getDate() &&
          this.mesActual === hoy.getMonth() &&
          this.anioActual === hoy.getFullYear()
      });
    }
  }

  cambiarMes(delta: number) {
    this.mesActual += delta;
    if (this.mesActual < 0)  { this.mesActual = 11; this.anioActual--; }
    if (this.mesActual > 11) { this.mesActual = 0;  this.anioActual++; }
    this.generarCalendario();
  }

  // ─────────────────────────────────────────────────────────────
  // MODAL
  // ─────────────────────────────────────────────────────────────

  abrirAgregar() {
    this.isEditMode  = false;
    this.formError   = '';
    this.notaForm    = this.formVacio();
    this.isModalOpen = true;
  }

  abrirEditar(nota: NotaRecordatorio) {
    this.isEditMode  = true;
    this.formError   = '';
    this.notaForm    = { ...nota };
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.formError   = '';
  }

  // ─────────────────────────────────────────────────────────────
  // GUARDAR
  // ─────────────────────────────────────────────────────────────

  guardar() {
    if (!this.notaForm.titulo?.trim()) {
      this.formError = 'El título es obligatorio.';
      return;
    }

    this.guardando = true;
    this.formError = '';

    const url = this.isEditMode
      ? `${this.apiUrl}/update?id=${this.notaForm.id}`
      : `${this.apiUrl}/create`;

    this.http.post<any>(url, this.notaForm).subscribe({
      next: async () => {
        this.guardando   = false;
        this.isModalOpen = false;
        this.cargarMascotas(); // Recarga todo el flujo filtrado

        const t = await this.toast.create({
          message: this.isEditMode ? '✅ Cambios guardados' : '✅ Recordatorio creado',
          duration: 2000,
          color: 'dark',
          position: 'bottom'
        });
        t.present();
      },
      error: async (err) => {
        this.guardando = false;
        this.formError = err?.error?.message || 'Error al guardar. Intenta de nuevo.';
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // TOGGLE COMPLETADA
  // ─────────────────────────────────────────────────────────────

  toggleCompletada(nota: NotaRecordatorio) {
    const nuevoEstado = nota.completada == 1 ? 0 : 1;
    nota.completada = nuevoEstado; // optimista

    this.http.post(`${this.apiUrl}/update?id=${nota.id}`, { completada: nuevoEstado }).subscribe({
      error: () => {
        nota.completada = nuevoEstado === 1 ? 0 : 1; // revertir si falla
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ELIMINAR
  // ─────────────────────────────────────────────────────────────

  async confirmarEliminar(id: number) {
    const a = await this.alert.create({
      header: 'Eliminar',
      message: '¿Seguro que deseas eliminar este recordatorio?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminar(id)
        }
      ]
    });
    a.present();
  }

  eliminar(id: number) {
    // Eliminación optimista
    this.listaNotas = this.listaNotas.filter(n => n.id !== id);
    this.generarCalendario();

    this.http.post(`${this.apiUrl}/delete?id=${id}`, {}).subscribe({
      error: () => { this.cargarNotas(); } // revertir si falla
    });
  }

  // ─────────────────────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────────────────────

  /** Obtiene el nombre de la mascota desde el ID para mostrar en la lista */
  getNombreMascota(id: any): string {
    const m = this.mascotas.find(x => x.id == id);
    return m ? m.nombre : '';
  }

  /** Devuelve el emoji/icono según el tipo de nota */
  getTipoIcon(tipo: string): string {
    const mapa: { [key: string]: string } = {
      'Nota':         '📝',
      'Recordatorio': '🔔',
      'Cita':         '📅',
      'Medicamento':  '💊'
    };
    return mapa[tipo] || '📝';
  }

  /** Formatea 'YYYY-MM-DD' → '7 de abril de 2026' */
  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      // T12:00:00 evita el bug de zona horaria (off-by-one day)
      const d = new Date(`${fechaStr}T12:00:00`);
      return d.toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch {
      return fechaStr;
    }
  }

  // ─────────────────────────────────────────────────────────────
  private formVacio(): Partial<NotaRecordatorio> {
    return {
      tipo:        'Nota',
      mascota_id:  null,
      titulo:      '',
      descripcion: '',
      fecha:       new Date().toISOString().split('T')[0],
      completada:  0
    };
  }
}