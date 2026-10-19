// AngularJS app (bootstrapped with ng-app) that uses Angular through downgradeModule().
import 'zone.js';
import {downgradeComponent, downgradeModule} from '@angular/upgrade/static';
import {MessageBoxComponent} from './angular/message-box.component';
import {MigratedUiModule} from './angular/migrated-ui.module';
import {ticketPage} from './legacy/ticket-page.component';

declare const angular: any;

angular
  .module('supportApp', ['ngSanitize', downgradeModule(MigratedUiModule)])
  .directive('messageBox', downgradeComponent({component: MessageBoxComponent}))
  .component('ticketPage', ticketPage);
