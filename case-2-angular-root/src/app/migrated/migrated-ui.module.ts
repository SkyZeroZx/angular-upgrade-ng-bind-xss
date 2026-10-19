import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

// Bootstrapped lazily by downgradeModule().
@NgModule({imports: [BrowserModule]})
export class MigratedUiModule {
  ngDoBootstrap() {}
}
