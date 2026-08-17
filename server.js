const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

let articles = [
  { id: 1, title: '제목 1', content: '내용 1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, title: '제목 2', content: '내용 2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, title: '제목 3', content: '내용 3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];
let nextId = 4;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:8080'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. GET / or /index.html
  if ((pathname === '/' || pathname === '/index.html') && method === 'GET') {
    const indexPath = path.join(__dirname, 'src', 'main', 'resources', 'static', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(indexPath, 'utf-8'));
      return;
    }
  }

  // 2. GET /test
  if (pathname === '/test' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Hello, world!');
    return;
  }

  // 3. GET /api/articles
  if (pathname === '/api/articles' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(articles));
    return;
  }

  // 4. GET /api/articles/:id
  const articleIdMatch = pathname.match(/^\/api\/articles\/(\d+)$/);
  if (articleIdMatch && method === 'GET') {
    const id = parseInt(articleIdMatch[1], 10);
    const article = articles.find(a => a.id === id);
    if (article) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(article));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `Article not found: ${id}` }));
    }
    return;
  }

  // 5. POST /api/articles
  if (pathname === '/api/articles' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const newArticle = {
          id: nextId++,
          title: data.title || 'Untitled',
          content: data.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        articles.push(newArticle);
        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(newArticle));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 6. PUT /api/articles/:id
  if (articleIdMatch && method === 'PUT') {
    const id = parseInt(articleIdMatch[1], 10);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const article = articles.find(a => a.id === id);
      if (!article) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: `Article not found: ${id}` }));
        return;
      }
      try {
        const data = JSON.parse(body || '{}');
        article.title = data.title || article.title;
        article.content = data.content || article.content;
        article.updatedAt = new Date().toISOString();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(article));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 7. DELETE /api/articles/:id
  if (articleIdMatch && method === 'DELETE') {
    const id = parseInt(articleIdMatch[1], 10);
    const index = articles.findIndex(a => a.id === id);
    if (index !== -1) {
      articles.splice(index, 1);
      res.writeHead(200);
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `Article not found: ${id}` }));
    }
    return;
  }

  // 8. H2 console fallback
  if (pathname === '/h2-console') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>H2 Console Simulator</h1><p>JDBC URL: jdbc:h2:mem:testdb</p>');
    return;
  }

  // Fallback 404 Whitelabel Error Page
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head><title>Whitelabel Error Page</title></head>
    <body>
      <h1>Whitelabel Error Page</h1>
      <p>This application has no explicit mapping for /error, so you are seeing this as a fallback.</p>
      <p>There was an unexpected error (type=Not Found, status=404).</p>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
