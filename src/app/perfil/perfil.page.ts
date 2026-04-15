import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { addIcons } from 'ionicons';
import { 
  pawOutline, notificationsOutline, homeOutline, 
  medkitOutline, personOutline, person, closeOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class PerfilPage {

  // Iniciamos el objeto vacío para que lo llene la base de datos
  user: any = {
    id: null,
    nombre: '',
    email: '',
    telefono: ''
  };

  // Objeto para el modal de edición
  editUser: any = {};

  constructor(private http: HttpClient, private router: Router) {
    addIcons({
      'paw-outline': pawOutline,
      'notifications-outline': notificationsOutline,
      'home-outline': homeOutline,
      'medkit-outline': medkitOutline,
      'person-outline': personOutline,
      'person': person,
      'close-outline': closeOutline
    });
  }

  /**
   * IMPORTANTE: Se ejecuta cada vez que entras a la pestaña de Perfil.
   * Si no hay datos en el localStorage, te manda al login.
   */
  ionViewWillEnter() {
    const data = localStorage.getItem('user');
    
    if (data) {
      // Si existen datos, los parseamos y los asignamos a la vista
      this.user = JSON.parse(data);
      this.editUser = { ...this.user };
      console.log('Usuario logueado:', this.user);
    } else {
      // Si te está mandando aquí, es porque tu LOGIN no está guardando 
      // correctamente el objeto 'user' en el localStorage.
      console.warn('No se encontraron datos de sesión.');
      this.router.navigate(['/login']);
    }
  }

  /**
   * Guarda los cambios en la base de datos a través del controlador de Yii2
   */
  guardarCambios(modal: any) {
    if (!this.user.id) {
      alert('Error: ID de usuario no encontrado');
      return;
    }

    // URL dinámica con el ID del usuario (ej. id=4 para maria)
    const url = `http://10.40.213.31/Veterinaria/web/index.php/usuarios/update-perfil?id=${this.user.id}`;
    
    this.http.post(url, this.editUser).subscribe({
      next: (res: any) => {
        if (res.success) {
          // 1. Actualizamos la variable local
          this.user = { ...this.editUser };
          // 2. Actualizamos el localStorage para que el cambio sea permanente
          localStorage.setItem('user', JSON.stringify(this.user));
          // 3. Cerramos el modal
          modal.dismiss();
          alert('Perfil actualizado correctamente');
        } else {
          alert('Error al guardar: ' + JSON.stringify(res.errors));
        }
      },
      error: (err) => {
        console.error('Error de conexión:', err);
        alert('No se pudo conectar con el servidor.');
      }
    });
  }

logout() {
    // 1. Limpiamos TODO el almacenamiento local
    localStorage.clear(); 
    
    // 2. Redirigimos al login y bloqueamos el botón "atrás" del navegador
    this.router.navigate(['/login'], { replaceUrl: true });
    
    console.log('Sesión cerrada correctamente');
  }
}