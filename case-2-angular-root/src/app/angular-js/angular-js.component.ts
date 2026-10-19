import {Component, ElementRef, input, OnDestroy, OnInit} from '@angular/core';
import {LazyLoaderService} from '../lazy-loader.service';
import {Ticket} from '../ticket.resolver';

@Component({
  selector: 'app-angular-js',
  template: '<div ng-view></div>',
})
export class AngularJSComponent implements OnInit, OnDestroy {
  // Set by the router from the resolver.
  readonly ticket = input<Ticket>();

  constructor(
    private lazyLoader: LazyLoaderService,
    private elRef: ElementRef,
  ) {}

  ngOnInit() {
    this.lazyLoader.load(this.elRef.nativeElement, this.ticket());
  }

  ngOnDestroy() {
    this.lazyLoader.destroy();
  }
}
