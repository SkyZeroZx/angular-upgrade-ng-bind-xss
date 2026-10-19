# Angular upgrade ng-bind XSS PoC

Minimal reproduction for `@angular/upgrade/static` 22.2.3 with AngularJS 1.8.3.

With `downgradeModule()`, a downgraded component compiles what `ng-bind` or `ng-bind-html` wrote into its element
as an AngularJS template, so a value the page only shows as text runs as an expression.

The migrated component only projects its content, and the legacy page keeps its `ng-bind`:

```ts
@Component({
  selector: 'user-badge',
  template: `<ng-content></ng-content>`,
  host: {class: 'user-badge'},
})
export class UserBadgeComponent {}
```

```html
<user-badge ng-bind="$ctrl.ticket.reporter.displayName"></user-badge>
```

Using `ng-bind` instead of `{{ }}` is normal in AngularJS code, the ngBind docs even recommend it:

> It is preferable to use `ngBind` instead of `{{ expression }}` if a template is momentarily displayed by the
> browser in its raw state before AngularJS compiles it. Since `ngBind` is an element attribute, it makes the
> bindings invisible to the user while the page is loading.

https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L16-L18

## Cases

| App                     | Setup                                                                        | Payload                            |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| `case-1-angularjs-root` | AngularJS app with `downgradeModule()`, as in "Upgrading for performance"    | `{{ }}` shown with `ng-bind`       |
| `case-2-angular-root`   | Angular app that lazy loads AngularJS, ticket from `HttpClient`              | `{{ }}` shown with `ng-bind`       |
| `case-3-ng-bind-html`   | Like case 1, but rich text shown with `ng-bind-html` and ngSanitize          | `class="ng-bind: ..."`, no `{{ }}` |

With `UpgradeModule` the same template shows the value as text.

## Run

Requires Node `^22.22.3 || ^24.15.0` and Chrome.

```bash
node backend.mjs
```

The backend returns ticket 1042 on port 3000 with the payloads. In another terminal:

```bash
cd case-1-angularjs-root    # or case-2-angular-root, case-3-ng-bind-html
npm install
npm start
```

Open the ticket:

```text
http://localhost:4201/tickets/1042
http://localhost:4202/tickets/1042
http://localhost:4203/tickets/1042
```

Expected alert: `localhost`.

## Why

`downgradeComponent()` is a `terminal` directive with priority 0, so `ng-bind` still runs on the same element. With
`downgradeModule()` the component waits for the Angular module to bootstrap, and by then `ng-bind` already wrote the
value. Then `compileContents()` passes the element's children to `$compile`:

```ts
// packages/upgrade/src/common/src/downgrade_component_adapter.ts (v22.2.3)
compileContents(): Node[][] {
  const compiledProjectableNodes: Node[][] = [];
  const projectableNodes: Node[][] = this.groupProjectableNodes(); // uses this.element.contents()
  const linkFns = projectableNodes.map((nodes) => this.$compile(nodes));
```

It needs:

- `downgradeModule()`. With `UpgradeModule` the children are compiled in `link()`, before the digest.
- An `<ng-content>` in the component. Text from `ng-bind` only goes to `*`, HTML from `ng-bind-html` can match any
  slot.
- The value in scope when the element is linked, before the module finishes bootstrapping, for example inside an
  `ng-if` that waits for the data. Every element linked in that pass is affected, like all the items of an
  `ng-repeat`.
- No CSP blocking `'unsafe-eval'`, since the payload uses the Function constructor.

## References

Quotes are copied from the docs. The upgrade guide is no longer on angular.dev, so its links point to the archived
copy (16.2.12).

- AngularJS directives on a downgraded element: "you can apply additional AngularJS directives to it, but *not*
  Angular directives."
  [upgrade.md#L224-L226](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L224-L226),
  [#L437](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L437)
- "Angular components that support content projection make use of an `<ng-content>` tag within them."
  [upgrade.md#L500-L525](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L500-L525)
- Case 2 is based on "Lazy Loading AngularJS":
  [upgrade.md#L614-L697](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L614-L697),
  [example](https://github.com/angular/angular/tree/16.2.12/aio/content/examples/upgrade-lazy-load-ajs/src/app)
- `downgradeModule()` "will only instantiate the Angular part when it is required for the first time"
  [upgrade-performance.md#L161](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade-performance.md?plain=1#L161),
  and the rest of `upgrade/static` works "in the exact same way"
  [#L238-L253](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade-performance.md?plain=1#L238-L253)
- The `downgradeModule()` API example projects AngularJS content and puts `ng-if` on the downgraded element:
  [lite/module.ts#L68-L71](https://github.com/angular/angular/blob/v22.2.3/packages/examples/upgrade/static/ts/lite/module.ts#L68-L71),
  [#L198-L208](https://github.com/angular/angular/blob/v22.2.3/packages/examples/upgrade/static/ts/lite/module.ts#L198-L208)
- `@angular/upgrade` is in maintenance mode: "We will not be accepting any new features or bug fixes other than
  security fixes."
  [README.md#L3](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/README.md?plain=1#L3)
- Angular security guide: "dynamically generating templates and compiling them, in particular templates containing
  user data, circumvents Angular's built-in protections."
  [security.md#L312](https://github.com/angular/angular/blob/v22.2.3/adev/src/content/guide/security.md?plain=1#L312)
- ngBindHtml "inserts the resulting HTML into the element in a secure way"
  [ngBind.js#L141-L155](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L141-L155),
  and with `$sce` "you can assume all untrusted bindings are safe"
  [sce.js#L576-L579](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/sce.js#L576-L579)
- `$sanitize` keeps `class`
  [sanitize.js#L376](https://github.com/angular/angular.js/blob/v1.8.3/src/ngSanitize/sanitize.js#L376),
  ngBind is `restrict: 'AC'`
  [ngBind.js#L56](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L56), and
  `class="ng-bind: exp;"` is one of its documented forms
  [compiler.ngdoc#L60-L71](https://github.com/angular/angular.js/blob/v1.8.3/docs/content/guide/compiler.ngdoc#L60-L71)
- `terminal` still runs the other directives with the same priority
  [compile.js#L264-L268](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L264-L268), and
  transclusion uses "the original contents" of the element
  [compile.js#L669-L676](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L669-L676)
- AngularJS security guide: "If an attacker has access to control AngularJS templates or expressions, they can
  exploit an AngularJS application via an XSS attack, regardless of the version."
  [security.ngdoc#L33-L61](https://github.com/angular/angular.js/blob/v1.8.3/docs/content/guide/security.ngdoc#L33-L61)
- Code:
  [terminal directive](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L126-L129),
  [`compileContents()` call](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L213)
  after the [injector promise](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L243-L245),
  [`compileContents()`](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component_adapter.ts#L68-L83),
  [`groupProjectableNodes()`](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component_adapter.ts#L350-L353)
