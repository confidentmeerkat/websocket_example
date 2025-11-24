# WebSocket Demo

A simple WebSocket server and client implementation for demonstration purposes.

## Features

- Real-time bidirectional communication
- Multiple client support
- Message broadcasting
- Echo functionality
- Connection status monitoring
- Message statistics
- Clean and modern UI
- Responsive design

## Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
```

## Usage

### Start the server:

```bash
npm start
```

### For development (with auto-reload):

```bash
npm run dev
```

The server will start on port 8080 (or the port specified in the PORT environment variable).

## Accessing the Application

Open your browser and navigate to:

```
http://localhost:8080
```

## How It Works

### Server (`server.js`)

- Creates an HTTP server to serve static files
- Creates a WebSocket server attached to the HTTP server
- Handles client connections and disconnections
- Implements message echo functionality
- Broadcasts messages to all connected clients
- Tracks the number of connected clients

### Client (`public/client.js`)

- Provides a user-friendly interface for WebSocket interaction
- Connects to the WebSocket server
- Sends and receives messages
- Displays connection status and statistics
- Shows all message types (system, sent, echo, broadcast)

## Message Types

- **System**: Server notifications (connect, disconnect, etc.)
- **Sent**: Messages you send
- **Echo**: Server echoes your message back to you
- **Broadcast**: Messages from other connected clients
- **Error**: Error messages

## Features Demonstrated

1. **WebSocket Connection**: Establishing and managing WebSocket connections
2. **Real-time Communication**: Instant message delivery
3. **Broadcasting**: Sending messages to multiple clients
4. **Connection Management**: Handling connects, disconnects, and errors
5. **State Tracking**: Monitoring connection state and statistics

## Project Structure

```
websocket-demo/
├── server.js           # WebSocket server implementation
├── package.json        # Project dependencies and scripts
├── README.md          # This file
└── public/            # Client-side files
    ├── index.html     # HTML structure
    ├── client.js      # Client-side WebSocket logic
    └── style.css      # Styling
```

## Testing

1. Open multiple browser tabs/windows to `http://localhost:8080`
2. Connect all clients
3. Send messages from different clients
4. Observe:
   - Echo messages (your message echoed back)
   - Broadcast messages (messages from other clients)
   - System notifications (join/leave events)
   - Client count updates

## Technologies Used

- **Node.js**: JavaScript runtime
- **ws**: WebSocket library for Node.js
- **Vanilla JavaScript**: Client-side logic
- **HTML5/CSS3**: User interface

## Browser Compatibility

Works in all modern browsers that support WebSocket API:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT

## Notes

This is a demonstration project meant for learning purposes. For production use, consider:
- Adding authentication
- Implementing message validation
- Adding rate limiting
- Using a more robust message queue
- Adding SSL/TLS support
- Implementing reconnection logic
- Adding message persistence