# angular-upgrade-ng-bind-xss

PoC for an XSS in `@angular/upgrade/static`. If a downgraded component is created through `downgradeModule()`,
the text that AngularJS `ng-bind` writes into the component's element gets compiled as an AngularJS template. So a
user controlled value shown with `ng-bind` runs as an expression.

Tested with Angular 22.2.3, AngularJS 1.8.3 and Chrome 155.

## The setup

The migrated component is a small badge that just projects its content:

```ts
@Component({
  selector: 'user-badge',
  template: `<ng-content></ng-content>`,
  host: {class: 'user-badge'},
})
export class UserBadgeComponent {}
```

On the legacy AngularJS page the only change is the element:

```diff
- <span class="legacy-badge" ng-bind="$ctrl.ticket.reporter.displayName"></span>
+ <user-badge ng-bind="$ctrl.ticket.reporter.displayName"></user-badge>
```

There are two apps, one for each way of building a hybrid app:

- `case-1-angularjs-root`: an AngularJS app (`ng-app`) that uses Angular through `downgradeModule()`, like in the
  "Upgrading for performance" guide.
- `case-2-angular-root`: an Angular app with the Router that lazy loads AngularJS for some routes, based on the
  "Lazy Loading AngularJS" example. Here the ticket comes from `HttpClient`.

## Running it

You need Node 22.22.3+ or 24.15+.

Start the backend. It serves the profile page and the ticket API on port 3000:

```
node backend.mjs
```

Then start one of the apps:

```
cd case-1-angularjs-root    # or case-2-angular-root
npm install
npm start
```

`npm start` runs `ng serve` with the production configuration. Case 1 runs on http://localhost:4201 and case 2 on
http://localhost:4202.

1. Go to http://localhost:3000/profile and save this display name:
   `{{constructor.constructor('alert(document.domain)')()}}`
2. Open http://localhost:4201/tickets/1042 (or :4202 for case 2). The alert fires.

Reset the name on the profile page and the badge just shows "Ada Lovelace". Each case's README has the details.

## Why it happens

`downgradeComponent()` registers a `terminal` AngularJS directive with priority 0. That stops AngularJS from
compiling the element's children, but other priority 0 directives on the same element, like `ng-bind`, still run.

The adapter compiles the children itself once the Angular injector is available. With `downgradeModule()` the
injector comes from a promise, so for elements linked before the Angular module finishes bootstrapping, that step
happens after AngularJS's first digest. By then `ng-bind` has already written the value into the element.
`compileContents()` takes whatever is in there and passes it to `$compile`:

```ts
// packages/upgrade/src/common/src/downgrade_component_adapter.ts (v22.2.3)
compileContents(): Node[][] {
  const compiledProjectableNodes: Node[][] = [];
  const projectableNodes: Node[][] = this.groupProjectableNodes(); // uses this.element.contents()
  const linkFns = projectableNodes.map((nodes) => this.$compile(nodes));
```

Plain AngularJS doesn't do this. Transcluded content is taken when the template is compiled, before any binding
runs. The upgrade guide also says AngularJS directives can be used on a downgraded element: "you can apply
additional AngularJS directives to it, but *not* Angular directives". Links to the docs and the code are in
[REFERENCES.md](REFERENCES.md).

## When it triggers

- The app uses `downgradeModule()`. With `UpgradeModule` the children are compiled in `link()`, before the digest.
- The component has a catch all `<ng-content>`. Text nodes only go to the `*` slot.
- There is an `ng-bind` (or `ng-bind-template`) on the component's element.
- The value is already in scope when the element is linked, for example because it's inside an `ng-if` that waits
  for the data.
- The element is linked before the Angular module has finished bootstrapping. In case 1 that's any page load where
  the badge is the first downgraded component. In case 2 it's every visit to the ticket route.
- No CSP blocking `unsafe-eval`, since this payload uses the Function constructor.
