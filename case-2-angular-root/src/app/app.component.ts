import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/tickets/1042">Ticket #1042</a>
    </nav>
    <router-outlet />
  `,
})
export class AppComponent {}

@Component({template: `<p>Angular home page. Open the ticket from the menu.</p>`})
export class HomeComponent {}
