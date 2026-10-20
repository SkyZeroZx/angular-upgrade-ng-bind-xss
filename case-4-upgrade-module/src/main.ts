// Hybrid app bootstrapped with UpgradeModule, as in the upgrade guide.
import 'zone.js';
import {provideZoneChangeDetection} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';
import {downgradeComponent} from '@angular/upgrade/static';
import {AppModule} from './angular/app.module';
import {CardComponent} from './angular/card.component';
import {profileCard} from './legacy/profile-card.directive';
import {userList} from './legacy/user-list.component';
import {userListControl} from './legacy/user-list-control.component';

declare const angular: any;

angular
  .module('supportApp', [])
  .directive('appCard', downgradeComponent({component: CardComponent}))
  .directive('profileCard', profileCard)
  .component('userList', userList)
  .component('userListControl', userListControl);

platformBrowser().bootstrapModule(AppModule, {applicationProviders: [provideZoneChangeDetection()]});
