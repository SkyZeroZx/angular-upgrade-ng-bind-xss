# Case 2: Angular app that lazy loads AngularJS

Here Angular is the root app (Router, HttpClient, no zone.js). The /tickets routes are handled by a legacy
AngularJS app that gets loaded and bootstrapped on demand. The structure follows the "Lazy Loading AngularJS"
example from the upgrade guide: `LazyLoaderService`, `AngularJSComponent` with `ng-view`, a route matcher, and
ngRoute inside the AngularJS app.

The ticket is fetched with `HttpClient` in a resolver, bound to the `AngularJSComponent` input and handed to the
AngularJS app when it's bootstrapped. The AngularJS ticket page shows the reporter with
`<user-badge ng-bind="...">`, same as case 1.

## Steps

Start the backend from the repo root (`node backend.mjs`), then:

```
npm install
npm start
```

1. Open http://localhost:4202/ and click "Ticket #1042". The alert shows up.
2. Go back Home and open the ticket again. It fires again, since AngularJS and the Angular module are bootstrapped
   again on every visit.
3. Loading http://localhost:4202/tickets/1042 directly works too.

The backend returns the reporter's display name as `{{constructor.constructor('alert(document.domain)')()}}`.

## Notes

The example in the guide doesn't use downgraded components inside the lazy loaded app, so that part is mine. Passing
the NgModule to `downgradeModule()` doesn't work here because the Angular platform already exists (NG0908 without
zone.js, NG0201 with it). The `platformBrowserDynamic(extraProviders)` bootstrap function from the API docs fails
with NG0201 too. Bootstrapping the module on the existing platform works:

```ts
const bootstrapMigratedUi = (extraProviders: StaticProvider[]) =>
  getPlatform()!.bootstrapModule(MigratedUiModule, {applicationProviders: extraProviders});
```
