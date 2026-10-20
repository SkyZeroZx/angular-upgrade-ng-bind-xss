import {userList} from './user-list.component';

// Control: the same cards with a plain href instead of ng-href. A plain href is only written in the digest, after
// the card compiled its content again, so the website stays text.
export const userListControl = {
  template: `
    <h2>Control: href instead of ng-href</h2>
    <ul class="users">
      <li ng-repeat="u in $ctrl.users">
        <profile-card>
          <strong>{{u.name}}</strong>
          <a href="{{u.website}}">Website</a>
        </profile-card>
      </li>
    </ul>`,
  controller: userList.controller,
};
