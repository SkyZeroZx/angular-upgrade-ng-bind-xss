# Case 4: UpgradeModule with ng-transclude

An AngularJS 1.8.3 app bootstrapped with `UpgradeModule`, the default hybrid setup in the upgrade guide. The card was
migrated to Angular, and the legacy `profileCard` directive was kept as a wrapper so the pages that use it don't
change. It forwards its content to the card with `ng-transclude`:

```js
export function profileCard() {
  return {
    transclude: true,
    template: '<app-card ng-transclude></app-card>',
  };
}
```

```html
<li ng-repeat="u in $ctrl.users">
  <profile-card>
    <strong>{{u.name}}</strong>
    <a ng-href="{{u.website}}">Website</a>
  </profile-card>
</li>
```

`ngTransclude` and the downgraded directive both have priority 0, so AngularJS sorts them by name and runs their
post-link functions in reverse. With `appCard`, `ngTransclude` puts the linked content into the element first, and
then the downgraded directive compiles it again. By then `ng-href` already wrote the website into the attribute, so a
`{{ }}` inside it runs.

## Steps

Start the backend from the repo root (`node backend.mjs`), then:

```
npm install
npm start
```

Open http://localhost:4204/. The alert shows up as soon as the page loads, without clicking anything, for Mallory,
whose website is `https://example.com/#{{constructor.constructor('alert(document.domain)')()}}`. Both cards render
normally, and Mallory's link ends up as `https://example.com/#` because the expression already ran.

Below the team there is a control with the same cards and a plain `href="{{u.website}}"`, the form the ngHref docs
call the wrong way to write it. Nothing runs there and Mallory's link keeps the `{{ }}`, since a plain `href` is only
written in the digest, after the card compiled its content again. To try it alone, remove `<user-list>` from
`src/index.html`.

Nothing runs either with the `<div class="card" ng-transclude>` from before the migration, or with a component whose
name sorts after `ngTransclude`, like `ui-card`.

## Files

- `src/index.html`: the team page and angular.min.js, without `ng-app`
- `src/main.ts`: the AngularJS module and the `UpgradeModule` bootstrap
- `src/legacy/profile-card.directive.ts`: the legacy wrapper
- `src/legacy/user-list.component.ts`: the team page
- `src/legacy/user-list-control.component.ts`: the control, same cards with a plain `href`
- `src/angular/`: the card component and the NgModule
