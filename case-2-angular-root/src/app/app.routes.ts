import {Routes, UrlSegment} from '@angular/router';
import {AngularJSComponent} from './angular-js/angular-js.component';
import {HomeComponent} from './app.component';
import {ticketResolver} from './ticket.resolver';

// Same kind of matcher as the guide's example, for /tickets/:id
export function isAngularJSUrl(url: UrlSegment[]) {
  return url.length > 0 && url[0].path.startsWith('tickets') ? {consumed: url, posParams: {id: url[1]}} : null;
}

export const routes: Routes = [
  // Routes rendered by Angular
  {path: '', component: HomeComponent},

  // AngularJS routes. The ticket is fetched here and bound to the component's input.
  {matcher: isAngularJSUrl, component: AngularJSComponent, resolve: {ticket: ticketResolver}},
];
