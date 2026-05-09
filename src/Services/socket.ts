import { io } from 'socket.io-client';

// Ajusta la URL según tu entorno (IP de tu servidor backend)
const SOCKET_URL = 'http://localhost:1337';

const socket = io(SOCKET_URL, {
    autoConnect: false
});

export default socket;
