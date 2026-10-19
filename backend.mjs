// Fake backend used by both apps.
//
//   node backend.mjs
//
// http://localhost:3000/profile           page where the customer sets their display name
// http://localhost:3000/api/tickets/1042  the ticket, with the customer's display name
import {createServer} from 'node:http';

const DEFAULT_NAME = 'Ada Lovelace';
let displayName = DEFAULT_NAME;

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);

const profilePage = () => `<!doctype html>
<meta charset="utf-8">
<title>My profile</title>
<body style="font-family: system-ui, sans-serif; margin: 24px">
<h1>My profile</h1>
<form method="post">
  <label>Display name<br><input name="displayName" size="70" value="${escapeHtml(displayName)}"></label>
  <button>Save</button>
</form>
<form method="post">
  <input type="hidden" name="displayName" value="${DEFAULT_NAME}">
  <button>Reset</button>
</form>
<p>Ticket: <a href="http://localhost:4201/tickets/1042">case 1</a>, <a href="http://localhost:4202/tickets/1042">case 2</a></p>`;

createServer((req, res) => {
  const {pathname} = new URL(req.url, 'http://localhost');

  if (pathname === '/api/tickets/1042') {
    res.writeHead(200, {'content-type': 'application/json', 'access-control-allow-origin': '*'});
    res.end(JSON.stringify({id: 1042, subject: 'Cannot download my invoice', status: 'Open', reporter: {id: 7, displayName}}));
  } else if (pathname === '/profile' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      displayName = new URLSearchParams(body).get('displayName') ?? DEFAULT_NAME;
      res.writeHead(303, {location: '/profile'});
      res.end();
    });
  } else if (pathname === '/profile') {
    res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
    res.end(profilePage());
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(3000, () => console.log('Backend running on http://localhost:3000 (profile: http://localhost:3000/profile)'));
