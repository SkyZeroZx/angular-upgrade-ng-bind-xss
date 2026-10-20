// Legacy wrapper used across the app. It used to render <div class="card" ng-transclude></div> and now forwards
// its content to the migrated <app-card>. Like most older directives it has no isolate scope.
export function profileCard() {
  return {
    transclude: true,
    template: '<app-card ng-transclude></app-card>',
  };
}
