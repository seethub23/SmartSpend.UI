import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), //It adds browser-level listeners for: window.error and window.unhandledrejection
    provideRouter(routes),// This replaces the older RouterModule.forRoot(routes) pattern used with NgModules
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()) // provideClientHydration() tells Angular to reuse server-rendered HTML instead of throwing it away and re-rendering everything on the client.
  ]
};
