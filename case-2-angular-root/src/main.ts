// Angular is the root app. The /tickets routes are handled by a lazy loaded AngularJS app.
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient()],
}).catch((e) => console.error(e));
