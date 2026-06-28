class SocketService {
  private socket: any = null;
  private isConnected = false;

  connect(userId: string) {
    if (this.isConnected) return;

    try {
      // For now, we'll create a mock socket since we don't have a real Socket.IO server
      this.socket = {
        connected: true,
        on: (event: string, callback: Function) => {
          console.log(`Socket listening for ${event}`);
        },
        emit: (event: string, data: any) => {
          console.log(`Socket emitting ${event}:`, data);
        },
        disconnect: () => {
          console.log('Socket disconnected');
        }
      };
      
      this.isConnected = true;
      console.log('Socket connected for user:', userId);
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, callback: Function) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Legacy methods for backward compatibility
  onMessage(callback: Function) {
    this.on('message', callback);
  }

  onNotification(callback: Function) {
    this.on('notification', callback);
  }

  sendMessage(data: any) {
    this.emit('message', data);
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();