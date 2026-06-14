import { io } from 'socket.io-client';
import { environment } from '../config/environment';

const socket = io(environment.socketUrl, {
  autoConnect: false,
});

export default socket;
