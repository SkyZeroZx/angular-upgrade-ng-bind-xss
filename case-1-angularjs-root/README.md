# Case 1: AngularJS app using downgradeModule()

An AngularJS 1.8.3 app, bootstrapped with `ng-app`, that started using Angular for one component through
`downgradeModule()` and `downgradeComponent()`. This is the setup from the "Upgrading for performance" guide.

The ticket page loads the ticket with `$http` and shows the reporter with the migrated badge:

```html
<article class="ticket" ng-if="$ctrl.ticket">
  ...
  <user-badge ng-bind="$ctrl.ticket.reporter.displayName"></user-badge>
</article>
```

## Steps

Start the backend from the repo root (`node backend.mjs`), then:

```
npm install
npm start
```

Open http://localhost:4201/tickets/1042. The alert shows up, twice, because it runs on every digest.

The backend returns the reporter's display name as `{{constructor.constructor('alert(document.domain)')()}}`.
Put a normal name in `backend.mjs` and the badge just shows it.

## Files

- `src/index.html`: `<body ng-app="supportApp">` with the ticket page and angular.min.js
- `src/main.ts`: the AngularJS module, with `downgradeModule()` and `downgradeComponent()`
- `src/legacy/ticket-page.component.ts`: the legacy ticket page
- `src/angular/`: the badge component and its NgModule
