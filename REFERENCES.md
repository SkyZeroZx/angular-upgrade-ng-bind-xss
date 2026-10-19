# References

Quotes are copied as they appear in the files. The upgrade guide is no longer on angular.dev, so the links point to
the archived copy in the angular/angular repo (tag 16.2.12).

## Angular upgrade guide

- "So normally a hybrid application begins life as an AngularJS application, and it is AngularJS that processes
  the root template, for example, the index.html."
  [upgrade.md#L195](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L195)
- "The DOM element `<a-component>` will remain to be an AngularJS managed element, because it is defined in an
  AngularJS template. That also means you can apply additional AngularJS directives to it, but *not* Angular
  directives."
  [upgrade.md#L224-L226](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L224-L226)
- "Since this is an AngularJS template, you can still use other AngularJS directives on the element, even though
  it has Angular binding attributes on it."
  [upgrade.md#L437](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L437)
- "When you are using a downgraded Angular component from an AngularJS template, the need may arise to
  *transclude* some content into it." and "Angular components that support content projection make use of an
  `<ng-content>` tag within them."
  [upgrade.md#L500-L525](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L500-L525)
- The "Lazy Loading AngularJS" section, used for case 2:
  [upgrade.md#L614-L697](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade.md?plain=1#L614-L697),
  and its example code:
  [upgrade-lazy-load-ajs/src/app](https://github.com/angular/angular/tree/16.2.12/aio/content/examples/upgrade-lazy-load-ajs/src/app)

From "Upgrading for performance", the `downgradeModule()` guide:

- "It will only instantiate the Angular part when it is required for the first time; that is, as soon as it needs
  to create a downgraded component."
  [upgrade-performance.md#L161](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade-performance.md?plain=1#L161)
- "As you might have guessed, you don't need to change anything in the way you bootstrap your existing AngularJS
  application."
  [upgrade-performance.md#L176](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade-performance.md?plain=1#L176)
- "The differences between `downgradeModule()` and `UpgradeModule` end here. The rest of the `upgrade/static` APIs
  and concepts work in the exact same way for both types of hybrid applications." Projecting AngularJS content is
  one of the topics listed right after.
  [upgrade-performance.md#L238-L253](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade-performance.md?plain=1#L238-L253)
- "While it is possible to downgrade injectables, downgraded injectables will not be available until the Angular
  module that provides them is instantiated." This is why case 1 loads the ticket with `$http`.
  [upgrade-performance.md#L266](https://github.com/angular/angular/blob/16.2.12/aio/content/guide/upgrade-performance.md?plain=1#L264-L271)

## API docs and package

- `downgradeModule()`: "The Angular module will be bootstrapped once (when requested for the first time) and the
  same reference will be used from that point onwards."
  [downgrade_module.ts#L42-L43](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/static/src/downgrade_module.ts#L42-L43)
- The `downgradeModule()` example shown on its API page projects AngularJS content into a downgraded component and
  puts `ng-if` on the component's element:
  [lite/module.ts#L68-L71](https://github.com/angular/angular/blob/v22.2.3/packages/examples/upgrade/static/ts/lite/module.ts#L68-L71),
  [lite/module.ts#L198-L208](https://github.com/angular/angular/blob/v22.2.3/packages/examples/upgrade/static/ts/lite/module.ts#L198-L208)
- "IMPORTANT: The `@angular/upgrade` package is in maintenance mode. We will not be accepting any new features or
  bug fixes other than security fixes."
  [packages/upgrade/README.md#L3](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/README.md?plain=1#L3)

## Angular security guide

- "To systematically block XSS bugs, Angular treats all values as untrusted by default."
  [security.md#L39](https://github.com/angular/angular/blob/v22.2.3/adev/src/content/guide/security.md?plain=1#L39)
- "Unlike values to be used for rendering, Angular templates are considered trusted by default, and should be
  treated as executable code. Never create templates by concatenating user input and template syntax."
  [security.md#L43-L44](https://github.com/angular/angular/blob/v22.2.3/adev/src/content/guide/security.md?plain=1#L43-L44)
- "Angular trusts template code, so dynamically generating templates and compiling them, in particular templates
  containing user data, circumvents Angular's built-in protections. This is a security anti-pattern."
  [security.md#L312](https://github.com/angular/angular/blob/v22.2.3/adev/src/content/guide/security.md?plain=1#L312)

## AngularJS 1.8.3

- ngBind: "The `ngBind` attribute tells AngularJS to replace the text content of the specified HTML element with
  the value of a given expression, and to update the text content when the value of that expression changes."
  [ngBind.js#L9-L11](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L9-L11).
  It can be used on any element (`@element ANY`,
  [L24](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L24)), and it only sets
  `element.textContent`
  ([L62-L63](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L62-L63)).
- The same docs recommend it over `{{ }}` in some cases: "It is preferable to use `ngBind` instead of
  `{{ expression }}` if a template is momentarily displayed by the browser in its raw state before AngularJS
  compiles it."
  [ngBind.js#L13-L18](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L13-L18)
- ngBindHtml: "Evaluates the expression and inserts the resulting HTML into the element in a secure way. By
  default, the resulting HTML content will be sanitized using the $sanitize service."
  [ngBind.js#L144-L145](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L141-L155)
  (used in case 3)
- `$sanitize` keeps the `class` attribute:
  [sanitize.js#L376](https://github.com/angular/angular.js/blob/v1.8.3/src/ngSanitize/sanitize.js#L376).
  ngBind can also be used as a class (`restrict: 'AC'`,
  [ngBind.js#L56](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L56)), and the
  compiler guide lists `<span class="ng-bind: exp;"></span>` as one of its forms
  [compiler.ngdoc#L60-L71](https://github.com/angular/angular.js/blob/v1.8.3/docs/content/guide/compiler.ngdoc#L60-L71).
  That is the payload in case 3.
- "This means that as a developer, you can assume all untrusted bindings are safe."
  [sce.js#L576-L579](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/sce.js#L576-L579)
- `terminal`: "If set to true then the current `priority` will be the last set of directives which will execute
  (any directives at the current priority will still execute as the order of execution on same `priority` is
  undefined)."
  [compile.js#L264-L268](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L264-L268)
- Transclusion is used "to insert the original contents of a directive's element into a specified place in the
  template of the directive."
  [compile.js#L669-L676](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L669-L676)
- "If an attacker has access to control AngularJS templates or expressions, they can exploit an AngularJS
  application via an XSS attack, regardless of the version." The list that follows includes `$compile(userContent)`.
  The expression sandbox was removed in 1.6.
  [security.ngdoc#L33-L61](https://github.com/angular/angular.js/blob/v1.8.3/docs/content/guide/security.ngdoc#L33-L61)

## The code (v22.2.3)

- The downgraded directive is `restrict: 'E'` and `terminal: true`:
  [downgrade_component.ts#L126-L129](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L126-L129)
- `compileContents()` is called once the injector is available, which can be after a promise:
  [downgrade_component.ts#L213](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L213),
  [#L243-L245](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component.ts#L243-L245)
- `compileContents()` compiles the element's current children:
  [downgrade_component_adapter.ts#L68-L83](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component_adapter.ts#L68-L83),
  [#L350-L353](https://github.com/angular/angular/blob/v22.2.3/packages/upgrade/src/common/src/downgrade_component_adapter.ts#L350-L353)
