import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeModule} from '@angular/upgrade/static';

// Bootstraps the AngularJS app through UpgradeModule.
@NgModule({imports: [BrowserModule, UpgradeModule]})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['supportApp']);
  }
}
