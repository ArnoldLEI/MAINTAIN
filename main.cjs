const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow;
let server;

function startLocalServer() {
  server = http.createServer((req, res) => {
    // API endpoints
    if (req.url.startsWith('/api/data')) {
      const userDataPath = app.getPath('userData');
      const dataFilePath = path.join(userDataPath, 'db.json');

      if (req.method === 'GET') {
        if (fs.existsSync(dataFilePath)) {
          const fileData = fs.readFileSync(dataFilePath, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(fileData);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No data found' }));
        }
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            fs.writeFileSync(dataFilePath, body, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
    }

    // Serve static files from dist folder
    let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    // Remove query parameters or hash from path
    filePath = filePath.split('?')[0].split('#')[0];

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.xlsx':
      case '.xls':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // If file not found, fallback to index.html (SPA routing support)
          fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, htmlContent) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent, 'utf-8');
          });
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  // Listen on a random available port on localhost
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    console.log(`Server running at http://127.0.0.1:${port}/`);
    createWindow(port);
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "MaintainSYS",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}/`);
  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', startLocalServer);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (server) server.close();
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    startLocalServer();
  }
});
