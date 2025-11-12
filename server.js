/*
 * Simple HTTP server for the Progressive Times PWA.
 *
 * This server uses only Node.js built‑in modules so that it can run
 * without installing any third‑party packages. It serves static files
 * from the `public` directory, handles requests for the home page and
 * article page, and accepts registration and message POST requests. The
 * registration and message endpoints simply acknowledge the request;
 * they do not send push notifications because a full implementation
 * would require VAPID keys and the Web Push protocol.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3111;

/**
 * Send a response to the client. Handles basic MIME type lookups.
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {Buffer|string} data
 * @param {string} filePath
 */
function sendResponse(res, statusCode, data, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.html') contentType = 'text/html';
  else if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.json') contentType = 'application/json';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.svg') contentType = 'image/svg+xml';

  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(data);
}

/**
 * Serve a static file. If the file does not exist, respond with 404.
 * @param {string} filePath
 * @param {http.ServerResponse} res
 */
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      sendResponse(res, 200, data, filePath);
    }
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  if (req.method === 'GET') {
    if (pathname === '/' || pathname === '/index.html') {
      // Serve the home page
      const filePath = path.join(__dirname, 'index.html');
      serveFile(filePath, res);
    } else if (pathname === '/article' || pathname === '/article.html') {
      // Serve the article page
      const filePath = path.join(__dirname, 'article.html');
      serveFile(filePath, res);
    } else {
      // Serve static content from the public directory. Remove leading slash.
      const relPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const filePath = path.join(__dirname, 'public', relPath);
      fs.stat(filePath, (err, stat) => {
        if (err || !stat || !stat.isFile()) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        serveFile(filePath, res);
      });
    }
  } else if (req.method === 'POST') {
    // Read the request body
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body || '{}');
      } catch (e) {
        data = {};
      }
      if (pathname === '/register' || pathname === '/sendMessage') {
        // In a real application you would save the subscription details
        // and possibly send a push notification here. We simply acknowledge
        // the request with a 201 status code.
        res.writeHead(201);
        res.end('');
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});