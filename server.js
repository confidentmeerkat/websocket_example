const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Create HTTP server to serve static files
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/client.js') {
    fs.readFile(path.join(__dirname, 'public', 'client.js'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading client.js');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  } else if (req.url === '/style.css') {
    fs.readFile(path.join(__dirname, 'public', 'style.css'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading style.css');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`New client connected from ${clientIp}`);
  
  // Add client to the set
  clients.add(ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Welcome to the WebSocket server!',
    timestamp: new Date().toISOString(),
    totalClients: clients.size
  }));
  
  // Broadcast to all clients that a new user joined
  broadcast({
    type: 'system',
    message: 'A new user has joined the chat',
    timestamp: new Date().toISOString(),
    totalClients: clients.size
  }, ws);
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received:', message);
      
      // Echo back to sender
      ws.send(JSON.stringify({
        type: 'echo',
        message: `Echo: ${message.text}`,
        timestamp: new Date().toISOString()
      }));
      
      // Broadcast to all other clients
      broadcast({
        type: 'broadcast',
        message: message.text,
        timestamp: new Date().toISOString(),
        totalClients: clients.size
      }, ws);
      
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log(`Client disconnected from ${clientIp}`);
    clients.delete(ws);
    
    // Notify remaining clients
    broadcast({
      type: 'system',
      message: 'A user has left the chat',
      timestamp: new Date().toISOString(),
      totalClients: clients.size
    });
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast message to all clients except sender
function broadcast(data, sender) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});