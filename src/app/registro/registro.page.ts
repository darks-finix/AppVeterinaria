import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth'; 
import { Router, RouterModule } from '@angular/router'; 
import { ToastController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, callOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class RegistroPage {
  usuario = {
    nombre: '',
    email: '',
    contrasenia: '',
    telefono: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      'person-outline': personOutline, 
      'mail-outline': mailOutline, 
      'lock-closed-outline': lockClosedOutline, 
      'call-outline': callOutline 
    });
  }

  // Función para mostrar mensajes rápido
  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  async registrarse() {
    // 1. Validar que no haya campos vacíos
    if (!this.usuario.nombre || !this.usuario.email || !this.usuario.contrasenia || !this.usuario.telefono) {
      this.mostrarMensaje('Todos los campos son obligatorios', 'warning');
      return;
    }

    // 2. Expresión regular para validar el formato de correo
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.usuario.email)) {
      this.mostrarMensaje('Ingresa un correo electrónico válido (ejemplo@correo.com)', 'danger');
      return;
    }

    // 3. Validar longitud mínima de contraseña (ejemplo: 6 caracteres)
    if (this.usuario.contrasenia.length < 6) {
      this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    // 4. Validar que el teléfono tenga 10 dígitos (común en México)
    if (this.usuario.telefono.length < 10) {
      this.mostrarMensaje('El teléfono debe tener 10 dígitos', 'warning');
      return;
    }

    // Si pasa todas las validaciones, enviamos al servicio
    this.authService.registrar(this.usuario).subscribe({
      next: async (res: any) => { 
        this.mostrarMensaje('¡Registro exitoso! Ya puedes iniciar sesión', 'success');
        this.router.navigate(['/login']); 
      },
      error: async (err: any) => { 
        this.mostrarMensaje(err.error?.message || 'El correo ya está registrado', 'danger');
      }
    });
  }
}