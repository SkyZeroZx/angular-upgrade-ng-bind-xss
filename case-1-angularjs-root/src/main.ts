// AngularJS app (bootstrapped with ng-app) that uses Angular through downgradeModule().
import 'zone.js';
import {downgradeComponent, downgradeModule} from '@angular/upgrade/static';
import {MigratedUiModule} from './angular/migrated-ui.module';
import {UserBadgeComponent} from './angular/user-badge.component';
import {ticketPage} from './legacy/ticket-page.component';

declare const angular: any;

angular
  .module('supportApp', [downgradeModule(MigratedUiModule)])
  .directive('userBadge', downgradeComponent({component: UserBadgeComponent}))
  .component('ticketPage', ticketPage);
