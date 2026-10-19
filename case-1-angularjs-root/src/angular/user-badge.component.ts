import {Component} from '@angular/core';

// Migrated badge. It just projects what the AngularJS template puts inside it.
@Component({
  selector: 'user-badge',
  template: `<ng-content></ng-content>`,
  host: {class: 'user-badge'},
  styles: `
    :host {
      display: inline-flex;
      padding: 2px 10px;
      border-radius: 999px;
      background: #e8f0fe;
      color: #174ea6;
      font-weight: 600;
    }
  `,
})
export class UserBadgeComponent {}
