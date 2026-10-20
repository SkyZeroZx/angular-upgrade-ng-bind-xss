// Legacy team page. Each user is shown with the existing <profile-card> wrapper.
// The picture comes from the user's profile, where it can be uploaded or pasted as a URL.
export const userList = {
  template: `
    <h1>Team</h1>
    <ul class="users">
      <li ng-repeat="u in $ctrl.users">
        <profile-card>
          <img ng-src="{{u.avatarUrl}}" alt="">
          <strong>{{u.name}}</strong>
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
