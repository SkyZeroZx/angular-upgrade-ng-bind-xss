// Legacy ticket page. The reporter used to be a <span ng-bind="..."> and now uses the migrated <user-badge>.
// The ticket is passed in by the Angular side. displayName is set by the customer on their profile.
export const ticketPage = {
  template: `
    <article class="ticket">
      <h1>Ticket #<span ng-bind="$ctrl.ticket.id"></span></h1>
      <p><strong>Subject:</strong> <span ng-bind="$ctrl.ticket.subject"></span></p>
      <p class="reporter"><strong>Reported by:</strong>
        <user-badge ng-bind="$ctrl.ticket.reporter.displayName"></user-badge>
      </p>
    </article>`,
  controller: [
    'ticket',
    function (this: any, ticket: unknown) {
      this.ticket = ticket;
    },
  ],
};
