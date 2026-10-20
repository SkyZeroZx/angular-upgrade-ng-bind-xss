# Angular upgrade XSS PoC

Minimal reproduction for `@angular/upgrade/static` 22.2.3 with AngularJS 1.8.3.

A downgraded component compiles what AngularJS already wrote into its element as an AngularJS template, so a value
the page only shows as text, or uses as a link or image URL, runs as an expression. It happens in two ways:

- with `downgradeModule()`, when `ng-bind` or `ng-bind-html` is on the element (cases 1 to 3);
- with `UpgradeModule` too, when `ng-transclude` is on the element (cases 4 and 5).

The migrated components only project their content. In case 1 the legacy page keeps its `ng-bind`:

```ts
@Component({
  selector: 'user-badge',
  template: `<ng-content></ng-content>`,
  host: { class: 'user-badge' },
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

| App                     | Setup                                                                                          | Payload                             |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| `case-1-angularjs-root` | AngularJS app with `downgradeModule()`, as in "Upgrading for performance"                      | `{{ }}` shown with `ng-bind`        |
| `case-2-angular-root`   | Angular app that lazy loads AngularJS, ticket from `HttpClient`                                | `{{ }}` shown with `ng-bind`        |
| `case-3-ng-bind-html`   | Like case 1, but rich text shown with `ng-bind-html` and ngSanitize                            | `class="ng-bind: ..."`, no `{{ }}`  |
| `case-4-upgrade-module` | AngularJS app with `UpgradeModule`, a legacy wrapper forwards its content with `ng-transclude` | `{{ }}` in a website URL, `ng-href` |
| `case-5-ng-src`         | Like case 4, but the card shows the profile picture with `ng-src`                              | `{{ }}` in a picture URL, `ng-src`  |

With `UpgradeModule`, the `ng-bind` and `ng-bind-html` templates show the value as text.

## Run

Requires Node `^22.22.3 || ^24.15.0` and Chrome.

```bash
node backend.mjs
```

The backend returns the ticket and the team profiles on port 3000, with the payloads. In another terminal:

```bash
cd case-1-angularjs-root    # or case-2-angular-root, case-3-ng-bind-html, case-4-upgrade-module, case-5-ng-src
npm install
npm start
```

Open the ticket, or the team page in cases 4 and 5:

```text
http://localhost:4201/tickets/1042
http://localhost:4202/tickets/1042
http://localhost:4203/tickets/1042
http://localhost:4204/
http://localhost:4205/
```

Expected alert: `localhost`.

## Why

`downgradeComponent()` is a `terminal` directive with priority 0, so the other priority 0 directives still run on the
same element. When the component is created, `compileContents()` passes the element's children to `$compile`:

```ts
// packages/upgrade/src/common/src/downgrade_component_adapter.ts (v22.2.3)
compileContents(): Node[][] {
  const compiledProjectableNodes: Node[][] = [];
  const projectableNodes: Node[][] = this.groupProjectableNodes(); // uses this.element.contents()
  const linkFns = projectableNodes.map((nodes) => this.$compile(nodes));
```

Those children are not always the ones from the template:

- With `downgradeModule()` the component waits for the Angular module to bootstrap, and by then `ng-bind` already
  wrote the value into the element.
- With `ng-transclude` on the element, AngularJS sorts both directives by name and runs their post-link functions in
  reverse. For a name like `appCard`, `ngTransclude` puts the linked content into the element first, and the content
  is compiled again. `ng-href`, `ng-src` and `ng-srcset` write the value into the attribute while linking, so a
  `{{ }}` inside it runs. A plain `href="{{ }}"` or `src="{{ }}"` is only written later, in the digest, so it stays
  text, as the control in case 4 shows.

It needs:

- An `<ng-content>` in the component. Text from `ng-bind` only goes to `*`, HTML from `ng-bind-html` can match any
  slot.
- Cases 1 to 3: the value in scope when the element is linked, before the module finishes bootstrapping, for example
  inside an `ng-if` that waits for the data. Every element linked in that pass is affected, like all the items of an
  `ng-repeat`.
- Case 4: a component name that sorts before `ngTransclude`. Every element is affected, also after bootstrap.
- No CSP blocking `'unsafe-eval'`, since the payload uses the Function constructor.

## References

Quotes are copied from the docs. The upgrade guide is no longer on angular.dev, so its links point to the archived
copy (16.2.12).

- AngularJS directives on a downgraded element: "you can apply additional AngularJS directives to it, but _not_
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
- A user wrapping a downgraded component in an existing AngularJS component, as in case 4:
  [angular/angular#44753](https://github.com/angular/angular/issues/44753)
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
- `ng-href`, `ng-src` and `ng-srcset` write the interpolated value while linking
  [attrs.js#L424-L426](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/attrs.js#L424-L426),
  a plain attribute is only written in a `$watch`
  [compile.js#L3945-L3961](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L3945-L3961), and
  `ngSrc` is all or nothing
  [#L1385](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L1385)
- The ngHref and ngSrc docs recommend `ng-href` and `ng-src` over `href="{{hash}}"` ("The wrong way to write it")
  and `src="{{hash}}"` ("The buggy way to write it")
  [attrs.js#L10-L25](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/attrs.js#L10-L25),
  [#L109-L122](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/attrs.js#L109-L122)
- `terminal` still runs the other directives with the same priority
  [compile.js#L264-L268](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L264-L268), those
  are sorted by name
  [#L3750-L3755](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L3750-L3755), and post-link
  functions run in reverse
  [#L3370-L3371](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L3370-L3371)
- Transclusion uses "the original contents" of the element
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
