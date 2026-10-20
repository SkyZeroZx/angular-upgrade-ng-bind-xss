// Fake backend used by the apps:
//
//   http://localhost:3000/api/tickets/1042   cases 1 to 3
//   http://localhost:3000/api/users          cases 4 and 5
//
//   node backend.mjs
//
// The data already contains the values a customer could have saved.
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

// Team profiles. Case 4 links each website with ng-href, case 5 shows each picture with ng-src.
// On the profile page a picture can be uploaded or pasted as a URL. Ada uploaded one, Mallory pasted a URL.
const users = [
  {
    id: 1,
    name: 'Ada Lovelace',
    website: 'https://example.com/ada',
    avatarUrl: 'http://localhost:3000/uploads/ada.svg',
  },
  {
    id: 7,
    name: 'Mallory',
    website: "https://example.com/#{{constructor.constructor('alert(document.domain)')()}}",
    avatarUrl: "https://example.com/mallory.png#{{constructor.constructor('alert(document.domain)')()}}",
  },
];

// Uploaded pictures.
const uploads = {
  '/uploads/ada.svg':
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">' +
    '<circle cx="20" cy="20" r="20" fill="#1a73e8"/>' +
    '<text x="20" y="25" fill="#fff" font-family="sans-serif" font-size="14" text-anchor="middle">AL</text>' +
    '</svg>',
};

const routes = {'/api/tickets/1042': ticket, '/api/users': users};

createServer((req, res) => {
  const data = routes[req.url];
  if (data) {
    res.writeHead(200, {'content-type': 'application/json', 'access-control-allow-origin': '*'});
    res.end(JSON.stringify(data));
  } else if (uploads[req.url]) {
    res.writeHead(200, {'content-type': 'image/svg+xml'});
    res.end(uploads[req.url]);
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(3000, () => console.log('Backend running on http://localhost:3000'));
