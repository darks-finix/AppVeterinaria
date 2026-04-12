import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular'; 
import { AuthService } from '../services/auth'; 
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';

// --- PASO 1: IMPORTA EL ICONO 'paw' ---
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, paw } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    RouterModule
  ]
})
export class LoginPage {
  loginData = {
    email: '',
    contrasenia: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      'paw': paw,
      'mail-outline': mailOutline, 
      'lock-closed-outline': lockClosedOutline 
    });
  }

  async entrar() {
    this.authService.login(this.loginData).subscribe({
      next: async (res: any) => {
        if (res.success) {
          // --- CORRECCIÓN DE SEGURIDAD ---
          // Limpiamos TODO el rastro del usuario anterior antes de guardar el nuevo
          localStorage.clear(); 
          
          localStorage.setItem('user', JSON.stringify(res.user)); 

          const toast = await this.toastCtrl.create({
            message: '¡Bienvenida de nuevo!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          toast.present();

          // Navegamos al home
          this.router.navigate(['/home']).then(() => {
            // Opcional: Esto fuerza a que Angular recargue los componentes
            // y evita que los datos "viejos" se queden en las variables del TS
            window.location.reload();
          }); 

        } else {
          const toast = await this.toastCtrl.create({
            message: res.mensaje || 'Credenciales incorrectas',
            duration: 2000,
            color: 'warning',
            position: 'top'
          });
          toast.present();
        }
      },
      error: async (err: any) => {
        const toast = await this.toastCtrl.create({
          message: 'No se pudo conectar con el servidor',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        toast.present();
      }
    });
  }
}