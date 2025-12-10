import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: Infinity
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to WebSocket server');
                this.isConnected = true;
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Disconnected from WebSocket server');
                this.isConnected = false;
            });

            this.socket.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Join tracking room to receive all vehicle updates
    joinTrackingRoom() {
        if (this.socket) {
            this.socket.emit('join_tracking_room');
        }
    }

    // Join a specific vehicle room
    joinVehicleRoom(vehicleId) {
        if (this.socket) {
            this.socket.emit('join_vehicle_room', { vehicle_id: vehicleId });
        }
    }

    // Leave a vehicle room
    leaveVehicleRoom(vehicleId) {
        if (this.socket) {
            this.socket.emit('leave_vehicle_room', { vehicle_id: vehicleId });
        }
    }

    // Listen for vehicle location updates
    onVehicleLocationUpdate(callback) {
        if (this.socket) {
            this.socket.on('vehicle_location_updated', callback);
        }
    }

    // Listen for status changes
    onStatusChange(callback) {
        if (this.socket) {
            this.socket.on('status_changed', callback);
        }
    }

    // Listen for employee picked up
    onEmployeePickedUp(callback) {
        if (this.socket) {
            this.socket.on('employee_picked_up', callback);
        }
    }

    // Remove all listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    // Remove specific listener
    off(eventName) {
        if (this.socket) {
            this.socket.off(eventName);
        }
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
