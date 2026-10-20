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
  is compiled a second time, which the AngularJS compiler guide says to avoid. `ng-href`, `ng-src` and `ng-srcset`
  write the value into the attribute while linking, so a `{{ }}` inside it runs. A plain `href="{{ }}"` or
  `src="{{ }}"` is only written later, in the digest, so it stays text, as the control in case 4 shows.

It needs:

- An `<ng-content>` in the component. Text from `ng-bind` only goes to `*`, HTML from `ng-bind-html` can match any
  slot.
- Cases 1 to 3: the value in scope when the element is linked, before the module finishes bootstrapping, for example
  inside an `ng-if` that waits for the data. Every element linked in that pass is affected, like all the items of an
  `ng-repeat`.
- Cases 4 and 5: a component name that sorts before `ngTransclude`. Every element is affected, also after bootstrap.
  An `<ng-transclude>` inside the element throws `ngTransclude:orphan`, so the attribute is the form that works.
- No CSP blocking `'unsafe-eval'`, since the payload uses the Function constructor.

With the templates from before the migration the same data stays text. Compiling a copy of the element's children
taken in the directive's controller, before anything is linked, fixes the five cases. That build is in `patched/`, and
`npm run start:patched` runs a case against it, on ports 4211 to 4215.

## References

Quotes are copied from the docs. The upgrade guide is no longer on angular.dev, so its links point to the archived
copy (16.2.12). Other related docs are in [ADDITIONAL_REFERENCES.md](ADDITIONAL_REFERENCES.md).

- Code:
  [terminal directive](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L126-L129),
  [`compileContents()` call](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L213)
  after the [injector promise](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L243-L245),
  [`compileContents()`](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component_adapter.ts#L68-L83),
  [`groupProjectableNodes()`](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component_adapter.ts#L350-L353)
- `@angular/upgrade` is in maintenance mode: "We will not be accepting any new features or bug fixes other than
  security fixes."
  [README.md#L3](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/README.md?plain=1#L3)
- AngularJS directives on a downgraded element: "you can apply additional AngularJS directives to it, but _not_
  Angular directives."
  [upgrade.md#L224-L226](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L224-L226),
  [#L437](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L437)
- `terminal` still runs the other directives with the same priority
  [compile.js#L264-L268](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L264-L268), those
  are sorted by name
  [#L3750-L3755](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L3750-L3755), and post-link
  functions run in reverse
  [#L3370-L3371](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L3370-L3371)
- `$sanitize` keeps `class`
  [sanitize.js#L376](https://github.com/angular/angular.js/blob/v1.8.3/src/ngSanitize/sanitize.js#L376),
  ngBind is `restrict: 'AC'`
  [ngBind.js#L56](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L56), and
  `class="ng-bind: exp;"` is one of its documented forms
  [compiler.ngdoc#L60-L71](https://github.com/angular/angular.js/blob/v1.8.3/docs/content/guide/compiler.ngdoc#L60-L71)
- `ng-href`, `ng-src` and `ng-srcset` write the interpolated value while linking
  [attrs.js#L424-L426](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/attrs.js#L424-L426),
  and a plain attribute is only written in a `$watch`
  [compile.js#L3945-L3961](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L3945-L3961)
- Double compilation "occurs when an already compiled part of the DOM gets compiled again. This is an undesired
  effect"
  [compiler.ngdoc#L383-L389](https://github.com/angular/angular.js/blob/v1.8.3/docs/content/guide/compiler.ngdoc#L383-L389)
- An `<ng-transclude>` inside a downgraded component throws `ngTransclude:orphan`:
  [angular/angular#44753](https://github.com/angular/angular/issues/44753)
