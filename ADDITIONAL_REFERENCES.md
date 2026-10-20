# Additional references

Other docs and code around the cases. The ones the README relies on are in its References section. Quotes are copied
from the docs, and the upgrade guide links point to the archived copy (16.2.12).

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
- ngBindHtml "inserts the resulting HTML into the element in a secure way"
  [ngBind.js#L141-L155](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/ngBind.js#L141-L155),
  and with `$sce` "you can assume all untrusted bindings are safe"
  [sce.js#L576-L579](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/sce.js#L576-L579)
- `ngSrc` is all or nothing
  [compile.js#L1385](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L1385)
- The ngHref and ngSrc docs recommend `ng-href` and `ng-src` over `href="{{hash}}"` ("The wrong way to write it")
  and `src="{{hash}}"` ("The buggy way to write it")
  [attrs.js#L10-L25](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/attrs.js#L10-L25),
  [#L109-L122](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/directive/attrs.js#L109-L122)
- Transclusion uses "the original contents" of the element
  [compile.js#L669-L676](https://github.com/angular/angular.js/blob/v1.8.3/src/ng/compile.js#L669-L676)
- Angular security guide: "dynamically generating templates and compiling them, in particular templates containing
  user data, circumvents Angular's built-in protections."
  [security.md#L312](https://github.com/angular/angular/blob/v22.2.3/adev/src/content/guide/security.md?plain=1#L312)
- AngularJS security guide: "If an attacker has access to control AngularJS templates or expressions, they can
  exploit an AngularJS application via an XSS attack, regardless of the version."
  [security.ngdoc#L33-L61](https://github.com/angular/angular.js/blob/v1.8.3/docs/content/guide/security.ngdoc#L33-L61)
