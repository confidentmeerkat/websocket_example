class WebSocketClient {
  constructor() {
    this.ws = null;
    this.messagesSent = 0;
    this.messagesReceived = 0;
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.elements = {
      status: document.getElementById('status'),
      clientsCount: document.getElementById('clientsCount'),
      messages: document.getElementById('messages'),
      messageInput: document.getElementById('messageInput'),
      sendBtn: document.getElementById('sendBtn'),
      connectBtn: document.getElementById('connectBtn'),
      disconnectBtn: document.getElementById('disconnectBtn'),
      clearBtn: document.getElementById('clearBtn'),
      wsUrl: document.getElementById('wsUrl'),
      readyState: document.getElementById('readyState'),
      messagesSentCount: document.getElementById('messagesSent'),
      messagesReceivedCount: document.getElementById('messagesReceived')
    };
  }

  attachEventListeners() {
    this.elements.connectBtn.addEventListener('click', () => this.connect());
    this.elements.disconnectBtn.addEventListener('click', () => this.disconnect());
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.clearBtn.addEventListener('click', () => this.clearMessages());
    
    this.elements.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.addMessage('Already connected', 'system');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    this.addMessage(`Connecting to ${wsUrl}...`, 'system');
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.elements.wsUrl.textContent = wsUrl;
      
      this.ws.onopen = () => this.onOpen();
      this.ws.onmessage = (event) => this.onMessage(event);
      this.ws.onclose = (event) => this.onClose(event);
      this.ws.onerror = (error) => this.onError(error);
      
      this.updateReadyState();
    } catch (error) {
      this.addMessage(`Connection error: ${error.message}`, 'error');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  onOpen() {
    this.addMessage('Connected to server', 'system');
    this.updateStatus('connected');
    this.updateReadyState();
    
    this.elements.messageInput.disabled = false;
    this.elements.sendBtn.disabled = false;
    this.elements.connectBtn.disabled = true;
    this.elements.disconnectBtn.disabled = false;
  }

  onMessage(event) {
    this.messagesReceived++;
    this.updateStats();
    
    try {
      const data = JSON.parse(event.data);
      
      if (data.totalClients !== undefined) {
        this.updateClientsCount(data.totalClients);
      }
      
      this.addMessage(data.message, data.type, data.timestamp);
    } catch (error) {
      this.addMessage(event.data, 'message');
    }
  }

  onClose(event) {
    const reason = event.reason || 'Connection closed';
    this.addMessage(`${reason} (Code: ${event.code})`, 'system');
    this.updateStatus('disconnected');
    this.updateReadyState();
    
    this.elements.messageInput.disabled = true;
    this.elements.sendBtn.disabled = true;
    this.elements.connectBtn.disabled = false;
    this.elements.disconnectBtn.disabled = true;
    this.elements.clientsCount.textContent = 'Clients: 0';
  }

  onError(error) {
    console.error('WebSocket error:', error);
    this.addMessage('Connection error occurred', 'error');
    this.updateReadyState();
  }

  sendMessage() {
    const message = this.elements.messageInput.value.trim();
    
    if (!message) {
      return;
    }
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.addMessage('Not connected to server', 'error');
      return;
    }
    
    try {
      const data = {
        text: message,
        timestamp: new Date().toISOString()
      };
      
      this.ws.send(JSON.stringify(data));
      this.addMessage(message, 'sent');
      this.elements.messageInput.value = '';
      this.messagesSent++;
      this.updateStats();
    } catch (error) {
      this.addMessage(`Send error: ${error.message}`, 'error');
    }
  }

  addMessage(text, type = 'message', timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    
    messageDiv.innerHTML = `
      <span class="timestamp">${timeStr}</span>
      <span class="content">${this.escapeHtml(text)}</span>
    `;
    
    this.elements.messages.appendChild(messageDiv);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  clearMessages() {
    this.elements.messages.innerHTML = '';
    this.addMessage('Messages cleared', 'system');
  }

  updateStatus(status) {
    const indicator = this.elements.status.querySelector('.status-indicator');
    indicator.className = `status-indicator ${status}`;
    
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    this.elements.status.innerHTML = `
      <span class="status-indicator ${status}"></span>
      ${statusText}
    `;
  }

  updateClientsCount(count) {
    this.elements.clientsCount.textContent = `Clients: ${count}`;
  }

  updateReadyState() {
    if (!this.ws) {
      this.elements.readyState.textContent = '-';
      return;
    }
    
    const states = {
      [WebSocket.CONNECTING]: 'CONNECTING (0)',
      [WebSocket.OPEN]: 'OPEN (1)',
      [WebSocket.CLOSING]: 'CLOSING (2)',
      [WebSocket.CLOSED]: 'CLOSED (3)'
    };
    
    this.elements.readyState.textContent = states[this.ws.readyState] || 'UNKNOWN';
  }

  updateStats() {
    this.elements.messagesSentCount.textContent = this.messagesSent;
    this.elements.messagesReceivedCount.textContent = this.messagesReceived;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize client when page loads
const client = new WebSocketClient();