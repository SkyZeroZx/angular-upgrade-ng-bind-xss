// Legacy team page. Each user is shown with the existing <profile-card> wrapper.
// The name and the website come from the user's profile.
export const userList = {
  template: `
    <h1>Team</h1>
    <ul class="users">
      <li ng-repeat="u in $ctrl.users">
        <profile-card>
          <strong>{{u.name}}</strong>
          <a ng-href="{{u.website}}">Website</a>
        </profile-card>
      </li>
    </ul>`,
  controller: [
    '$http',
    function (this: any, $http: any) {
      this.$onInit = () => {
        $http.get('http://localhost:3000/api/users').then((res: any) => (this.users = res.data));
      };
    },
  ],
};
