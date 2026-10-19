# angular-upgrade-ng-bind-xss

PoC for an XSS in `@angular/upgrade/static`. If a downgraded component is created through `downgradeModule()`,
the content that AngularJS `ng-bind` (or `ng-bind-html`) writes into the component's element gets compiled as an
AngularJS template. So a user controlled value shown with one of those bindings runs as an expression.

Tested with Angular 22.2.3, AngularJS 1.8.3 and Chrome 155.

## The setup

The migrated component just projects its content:

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

There are three apps:

- `case-1-angularjs-root`: an AngularJS app (`ng-app`) that uses Angular through `downgradeModule()`, like in the
  "Upgrading for performance" guide. The reporter's name is shown with `ng-bind`.
- `case-2-angular-root`: an Angular app with the Router that lazy loads AngularJS for some routes, based on the
  "Lazy Loading AngularJS" example. Here the ticket comes from `HttpClient`.
- `case-3-ng-bind-html`: like case 1, but the value is rich text shown with `ng-bind-html` and ngSanitize. The
  payload has no `{{ }}`, and the sanitizer keeps it.

## Running it

You need Node 22.22.3+ or 24.15+.

Start the backend. It returns ticket 1042 on port 3000, with the payloads already in it:

```
node backend.mjs
```

Then start one of the apps:

```
cd case-1-angularjs-root    # or case-2-angular-root, case-3-ng-bind-html
npm install
npm start
```

`npm start` runs `ng serve` with the production configuration. Open the ticket and the alert fires:

- case 1: http://localhost:4201/tickets/1042
- case 2: http://localhost:4202/tickets/1042 (or open http://localhost:4202/ and use the menu)
- case 3: http://localhost:4203/tickets/1042

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
- The component has an `<ng-content>`. With `ng-bind` it has to be the catch all slot, because text nodes only go
  to `*`. With `ng-bind-html` any slot works if the HTML contains an element that matches it.
- There is an `ng-bind`, `ng-bind-template` or `ng-bind-html` on the component's element.
- The value is already in scope when the element is linked, for example because it's inside an `ng-if` that waits
  for the data.
- The element is linked before its Angular module has finished bootstrapping. That's not only the first one: every
  element created in the same pass is affected, for example every item of a list on its first render.
- No CSP blocking `unsafe-eval`, since this payload uses the Function constructor.
