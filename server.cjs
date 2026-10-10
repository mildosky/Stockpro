const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // If file doesn't exist, serve index.html (for SPA routing)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║                                            ║');
  console.log('║   StockPro is running!                     ║');
  console.log('║                                            ║');
  console.log('║   Open in your browser:                    ║');
  console.log('║   http://localhost:' + PORT + '                  ║');
  console.log('║                                            ║');
  console.log('║   Press Ctrl+C to stop the server          ║');
  console.log('║                                            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  
  // Auto-open browser
  const { exec } = require('child_process');
  const platform = process.platform;
  if (platform === 'win32') {
    exec(`start http://localhost:${PORT}`);
  } else if (platform === 'darwin') {
    exec(`open http://localhost:${PORT}`);
  } else {
    exec(`xdg-open http://localhost:${PORT}`);
  }
});
