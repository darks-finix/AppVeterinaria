import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http'; // ¡Ya lo tienes!

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // MODIFICADO: Agregamos la configuración del modo 'md' (Material Design)
    provideIonicAngular({
      mode: 'md' // Esto forzará un diseño más limpio y moderno
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(), // ¡Ya lo tienes activado!
  ],
});