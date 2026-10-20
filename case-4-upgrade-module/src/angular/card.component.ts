import {Component} from '@angular/core';

// Migrated card. It just projects what the AngularJS template puts inside it.
@Component({
  selector: 'app-card',
  template: `<ng-content></ng-content>`,
  host: {class: 'card'},
  styles: `
    :host {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
      padding: 12px 16px;
      border: 1px solid #dadce0;
      border-radius: 8px;
    }
  `,
})
export class CardComponent {}
