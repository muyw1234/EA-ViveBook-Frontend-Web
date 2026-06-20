import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import socket from '../../Services/socket';
import api from '../../api';
import UsuarioService from '../Services/Usuario';
import './ChatGlobal.css';

const CHAT_ID = '000000000000000000000001';

const ChatGlobal: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const setup = async () => {
      try {
        // Obtener perfil del usuario
        const userData = await UsuarioService.getProfile();
        setUser(userData);

        // Conectar socket si no está conectado
        if (!socket.connected) {
          socket.connect();
        }

        // Unirse al chat global
        socket.emit('join_chat', CHAT_ID);

        // Cargar mensajes previos
        const response = await api.get(`/mensajes/chat/${CHAT_ID}`);
        setMessages(response.data);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Error en setup del chat:', error);
      }
    };

    setup();

    // Escuchar mensajes entrantes
    socket.on('receive_message', (message: any) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user?._id) {
      socket.emit('send_message', {
        chatId: CHAT_ID,
        senderId: user._id,
        content: newMessage.trim(),
      });
      setNewMessage('');
    }
  };

  return (
    <div className="chat-global-container">
      <div className="chat-header">
        <h3>{t('chat_global.title')}</h3>
        <span className="online-indicator">{t('chat_global.status_online')}</span>
      </div>

      <div className="messages-list">
        {messages.map((msg, index) => {
          const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
          const senderName = msg.sender?.name || t('chat_global.user_fallback');

          return (
            <div key={msg._id || index} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
              {!isMine && <span className="sender-name">{senderName}</span>}
              <div className="message-bubble">
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder={t('chat_global.input_placeholder')}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatGlobal;
