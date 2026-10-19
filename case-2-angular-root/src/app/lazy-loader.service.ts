import {Injectable} from '@angular/core';
import {Ticket} from './ticket.resolver';

@Injectable({providedIn: 'root'})
export class LazyLoaderService {
  private app: any;

  load(el: HTMLElement, ticket: Ticket | undefined): void {
    import('./angularjs-app').then((app) => {
      try {
        this.app = app.bootstrap(el, ticket);
      } catch (e) {
        console.error(e);
      }
    });
  }

  destroy() {
    if (this.app) {
      this.app.get('$rootScope').$destroy();
    }
  }
}
