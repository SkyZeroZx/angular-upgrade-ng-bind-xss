// Legacy AngularJS app, loaded by LazyLoaderService. It uses the migrated <user-badge>.
import * as angular from 'angular';
import 'angular-route';
import {getPlatform, NgModuleRef, StaticProvider} from '@angular/core';
import {downgradeComponent, downgradeModule, setAngularJSGlobal} from '@angular/upgrade/static';
import {MigratedUiModule} from '../migrated/migrated-ui.module';
import {UserBadgeComponent} from '../migrated/user-badge.component';
import {ticketPage} from './ticket-page.component';

setAngularJSGlobal(angular);

// The platform already exists here, so downgradeModule(MigratedUiModule) doesn't work (NG0908/NG0201).
// Bootstrap the module on the existing platform instead.
let migratedUi: Promise<NgModuleRef<MigratedUiModule>> | undefined;
const bootstrapMigratedUi = (extraProviders: StaticProvider[]) =>
  (migratedUi = getPlatform()!.bootstrapModule(MigratedUiModule, {applicationProviders: extraProviders}));

const appModule = angular
  .module('supportApp', ['ngRoute', downgradeModule(bootstrapMigratedUi)])
  .directive('userBadge', downgradeComponent({component: UserBadgeComponent}))
  .component('ticketPage', ticketPage)
  .config([
    '$routeProvider',
    '$locationProvider',
    function config($routeProvider: any, $locationProvider: any) {
      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/tickets/:id', {
          template: '<ticket-page></ticket-page>',
        })
        .otherwise({
          template: '',
        });
    },
  ]);

// Bootstraps the AngularJS app. The ticket comes from the Angular side.
export function bootstrap(el: HTMLElement, ticket: unknown) {
  const $injector = angular.bootstrap(el, [
    appModule.name,
    [
      '$provide',
      ($provide: any) => {
        $provide.value('ticket', ticket);
      },
    ],
  ]);
  // Destroy the Angular module together with the AngularJS app.
  $injector.get('$rootScope').$on('$destroy', () => migratedUi?.then((ref) => ref.destroy()));
  return $injector;
}
