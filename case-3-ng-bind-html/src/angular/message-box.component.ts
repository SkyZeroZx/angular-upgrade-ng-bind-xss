import {Component} from '@angular/core';

// Migrated box for rich text. It just projects what the AngularJS template puts inside it.
@Component({
  selector: 'message-box',
  template: `<ng-content></ng-content>`,
  host: {class: 'message-box'},
  styles: `
    :host {
      display: block;
      padding: 8px 12px;
      border-left: 3px solid #1a73e8;
      background: #f8f9fa;
    }
  `,
})
export class MessageBoxComponent {}
