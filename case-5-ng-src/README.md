# Case 5: UpgradeModule with ng-src

The same app as case 4, but the card shows each user's picture with `ng-src`. On the profile page a picture can be
uploaded or pasted as a URL, and the team page gets that URL from the API:

```html
<li ng-repeat="u in $ctrl.users">
  <profile-card>
    <img ng-src="{{u.avatarUrl}}" alt="">
    <strong>{{u.name}}</strong>
  </profile-card>
</li>
```

The value is only used as an image URL. The browser never runs script from an `<img src>`, and AngularJS treats the
value as a media URL. It runs because `ng-src` writes the URL into the attribute while linking, and then the
downgraded directive compiles the content again, as in case 4.

## Steps

Start the backend from the repo root (`node backend.mjs`), then:

```
npm install
npm start
```

Open http://localhost:4205/. The alert shows up as soon as the page loads, from the picture URL Mallory pasted:
`https://example.com/mallory.png#{{constructor.constructor('alert(document.domain)')()}}`. Ada's uploaded picture
loads normally. Mallory's stays empty, because ngSrc leaves `src` unset when an expression returns `undefined`.

With `src="{{u.avatarUrl}}"`, which the ngSrc docs call the buggy way to write it, nothing runs and Mallory's `src`
keeps the `{{ }}`.

## Files

- `src/index.html`: the team page and angular.min.js, without `ng-app`
- `src/main.ts`: the AngularJS module and the `UpgradeModule` bootstrap
- `src/legacy/profile-card.directive.ts`: the legacy wrapper, the same as in case 4
- `src/legacy/user-list.component.ts`: the team page
- `src/angular/`: the card component and the NgModule
