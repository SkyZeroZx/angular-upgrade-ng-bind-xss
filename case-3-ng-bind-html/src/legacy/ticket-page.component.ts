// Legacy ticket page. The description is rich text written by the customer, shown with ng-bind-html
// (sanitized by ngSanitize). It used to be a <div class="message-box" ng-bind-html="..."> and now uses
// the migrated <message-box>.
export const ticketPage = {
  template: `
    <article class="ticket" ng-if="$ctrl.ticket">
      <h1>Ticket #<span ng-bind="$ctrl.ticket.id"></span></h1>
      <p><strong>Subject:</strong> <span ng-bind="$ctrl.ticket.subject"></span></p>
      <message-box ng-bind-html="$ctrl.ticket.description"></message-box>
    </article>`,
  controller: [
    '$http',
    function (this: any, $http: any) {
      this.$onInit = () => {
        $http.get('http://localhost:3000/api/tickets/1042').then((res: any) => (this.ticket = res.data));
      };
    },
  ],
};
