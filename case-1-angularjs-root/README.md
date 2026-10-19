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

1. Open http://localhost:3000/profile, set the display name to
   `{{constructor.constructor('alert(document.domain)')()}}` and save.
2. Open http://localhost:4201/tickets/1042. The alert shows up, twice, because it runs on every digest.
3. Reset the name and reload. The badge shows "Ada Lovelace".

## Files

- `src/index.html`: `<body ng-app="supportApp">` with the ticket page and angular.min.js
- `src/main.ts`: the AngularJS module, with `downgradeModule()` and `downgradeComponent()`
- `src/legacy/ticket-page.component.ts`: the legacy ticket page
- `src/angular/`: the badge component and its NgModule
