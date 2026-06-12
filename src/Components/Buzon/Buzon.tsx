import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import socket from '../../Services/socket';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Buzon.css';

const Buzon: React.FC = () => {
  const [tab, setTab] = useState<'chats' | 'reservas'>('chats');
  const [userId, setUserId] = useState<string | null>(null);

  // Lists state
  const [privateChats, setPrivateChats] = useState<any[]>([]);
  const [receivedMsgRequests, setReceivedMsgRequests] = useState<any[]>([]);
  const [sentMsgRequests, setSentMsgRequests] = useState<any[]>([]);
  
  const [receivedReservations, setReceivedReservations] = useState<any[]>([]);
  const [sentReservations, setSentReservations] = useState<any[]>([]);
  const [reservationMessages, setReservationMessages] = useState<any[]>([]);

  // Active chat state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Accept Reservation Modal state
  const [showAcceptResModal, setShowAcceptResModal] = useState(false);
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [rentalDays, setRentalDays] = useState(7);
  const [submittingAcceptRes, setSubmittingAcceptRes] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup user and socket on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        const user = profileRes.data;
        setUserId(user._id);

        if (!socket.connected) {
          socket.connect();
        }
        socket.emit('register_user', user._id);
      } catch (err) {
        console.error('Error fetching profile for buzon:', err);
      }
    };
    fetchUser();

    return () => {
      // clean up chat listeners
      socket.off('receive_message');
      socket.off('receiveMessage');
      socket.off('newMessageRequest');
      socket.off('newChatNotification');
      socket.off('newMessageRequestUpdate');
    };
  }, []);

  // Fetch all lists data
  const fetchBuzonData = async () => {
    if (!userId) return;
    try {
      // Chats and requests
      const [chatsRes, receivedReqRes, sentReqRes] = await Promise.all([
        api.get('/chats'),
        api.get('/message-requests/received'),
        api.get('/message-requests/sent')
      ]);
      setPrivateChats(chatsRes.data?.data || chatsRes.data || []);
      setReceivedMsgRequests(receivedReqRes.data?.data || receivedReqRes.data || []);
      setSentMsgRequests(sentReqRes.data?.data || sentReqRes.data || []);

      // Reservations
      const [recRes, sentRes, resMsgs] = await Promise.all([
        api.get('/reservas/recibidas'),
        api.get('/reservas/solicitadas'),
        api.get('/mensajes/reservas')
      ]);
      setReceivedReservations(recRes.data?.data || recRes.data || []);
      setSentReservations(sentRes.data?.data || sentRes.data || []);
      setReservationMessages(resMsgs.data?.data || resMsgs.data || []);
    } catch (error) {
      console.error('Error fetching buzon lists:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBuzonData();
    }
  }, [userId, tab]);

  // Socket listener for new messages & updates
  useEffect(() => {
    if (!userId) return;

    const handleReceiveMessage = (msg: any) => {
      // If it's for our active chat, append it
      if (activeChatId && (msg.chat === activeChatId || msg.chat?._id === activeChatId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Mark as read
        api.patch(`/chats/${activeChatId}/read`).catch(() => {});
      } else {
        // Otherwise just reload list to show badge/updates
        fetchBuzonData();
      }
    };

    const handleRefresh = () => {
      fetchBuzonData();
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('newMessageRequest', handleRefresh);
    socket.on('newChatNotification', handleRefresh);
    socket.on('newMessageRequestUpdate', handleRefresh);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('newMessageRequest', handleRefresh);
      socket.off('newChatNotification', handleRefresh);
      socket.off('newMessageRequestUpdate', handleRefresh);
    };
  }, [userId, activeChatId]);

  // Load messages when activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setActiveChat(null);
      return;
    }

    // Join room
    socket.emit('join_chat', activeChatId);

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const [messagesRes, chatRes] = await Promise.all([
          api.get(`/chats/${activeChatId}/messages`),
          // Fetch specific chat info if needed, or find in list
          Promise.resolve(privateChats.find((c) => c._id === activeChatId))
        ]);

        setMessages(messagesRes.data?.data || messagesRes.data || []);
        setActiveChat(chatRes || null);

        // Mark as read
        await api.patch(`/chats/${activeChatId}/read`);
      } catch (err) {
        console.error('Error loading chat messages:', err);
        toast.error('No se pudieron cargar los mensajes');
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();

    return () => {
      socket.emit('leave_chat', activeChatId);
    };
  }, [activeChatId, privateChats]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !userId) return;

    socket.emit('send_message', {
      chatId: activeChatId,
      senderId: userId,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  // Message Requests actions
  const handleAcceptMsgRequest = async (reqId: string) => {
    try {
      const res = await api.patch(`/message-requests/${reqId}/accept`);
      toast.success('Solicitud de mensaje aceptada');
      fetchBuzonData();
      const chat = res.data?.data || res.data;
      if (chat && chat._id) {
        setActiveChatId(chat._id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al aceptar la solicitud');
    }
  };

  const handleDenyMsgRequest = async (reqId: string) => {
    if (!window.confirm('¿Seguro que quieres rechazar esta solicitud?')) return;
    try {
      await api.patch(`/message-requests/${reqId}/deny`);
      toast.success('Solicitud rechazada');
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error('Error al rechazar la solicitud');
    }
  };

  const handleDismissMsgRequest = async (reqId: string) => {
    try {
      await api.patch(`/message-requests/${reqId}/dismiss`);
      fetchBuzonData();
    } catch (err) {
      console.error(err);
    }
  };

  // Reservation actions
  const handleOpenAcceptRes = (resId: string) => {
    setSelectedResId(resId);
    setRentalDays(7);
    setShowAcceptResModal(true);
  };

  const handleConfirmAcceptRes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId) return;

    setSubmittingAcceptRes(true);
    try {
      await api.post(`/reservas/aceptar/${selectedResId}`, {
        dias: rentalDays
      });
      toast.success('Reserva aceptada correctamente');
      setShowAcceptResModal(false);
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error('Error al aceptar la reserva');
    } finally {
      setSubmittingAcceptRes(false);
    }
  };

  const handleRejectReservation = async (resId: string) => {
    if (!window.confirm('¿Seguro que quieres rechazar esta reserva?')) return;
    try {
      await api.post(`/reservas/rechazar/${resId}`);
      toast.success('Reserva rechazada');
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error('Error al rechazar la reserva');
    }
  };

  const handleDeleteReservation = async (resId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta reserva?')) return;
    try {
      await api.delete(`/reservas/${resId}`);
      toast.success('Reserva eliminada');
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar la reserva');
    }
  };

  const handleDeleteResMsg = async (msgId: string) => {
    try {
      await api.delete(`/mensajes/${msgId}`);
      fetchBuzonData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PENDIENTE') return <span className="status-badge pending">Pendiente</span>;
    if (s === 'ACEPTADA') return <span className="status-badge accepted">Aceptada</span>;
    if (s === 'RECHAZADA') return <span className="status-badge rejected">Rechazada</span>;
    return <span className="status-badge">{status}</span>;
  };

  const notices = sentMsgRequests.filter((req) => req.status !== 'pending');

  return (
    <div className="buzon-container">
      <ToastContainer />
      
      {/* Sidebar Panel */}
      <div className="buzon-sidebar">
        <div className="sidebar-tabs">
          <button 
            className={`sidebar-tab-btn ${tab === 'chats' ? 'active' : ''}`}
            onClick={() => setTab('chats')}
          >
            💬 Mensajes
          </button>
          <button 
            className={`sidebar-tab-btn ${tab === 'reservas' ? 'active' : ''}`}
            onClick={() => setTab('reservas')}
          >
            📅 Reservas
          </button>
        </div>

        <div className="sidebar-content">
          {tab === 'chats' ? (
            <div className="tab-pane">
              {/* Chat Global card */}
              <div 
                className={`global-chat-card-item ${activeChatId === '000000000000000000000001' ? 'active' : ''}`}
                onClick={() => setActiveChatId('000000000000000000000001')}
              >
                <div className="global-chat-avatar">🌍</div>
                <div className="global-chat-details">
                  <h4>Chat Global</h4>
                  <p>Comunidad ViveBook en tiempo real</p>
                </div>
              </div>

              {/* Notices */}
              {notices.length > 0 && (
                <div className="sidebar-section">
                  <h5>Avisos de solicitudes</h5>
                  {notices.map((notice) => {
                    const isAccepted = notice.status === 'accepted';
                    return (
                      <div key={notice._id} className={`notice-item ${isAccepted ? 'accepted' : 'rejected'}`}>
                        <div className="notice-body">
                          <strong>{isAccepted ? 'Aceptada 🎉' : 'Rechazada ❌'}</strong>
                          <p>
                            {isAccepted 
                              ? `Contacto aprobado para "${notice.book?.title}".` 
                              : `Contacto rechazado para "${notice.book?.title}".`}
                          </p>
                        </div>
                        <button className="close-notice-btn" onClick={() => handleDismissMsgRequest(notice._id)}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message Requests Received */}
              {receivedMsgRequests.length > 0 && (
                <div className="sidebar-section">
                  <h5>Solicitudes Recibidas</h5>
                  {receivedMsgRequests.map((req) => (
                    <div key={req._id} className="msg-req-item">
                      <div className="msg-req-header">
                        <strong>{req.requester?.name}</strong>
                        <span>Libro: {req.book?.title}</span>
                      </div>
                      {req.initialMessage && <p className="msg-req-text">"{req.initialMessage}"</p>}
                      <div className="msg-req-actions">
                        <button className="msg-req-deny" onClick={() => handleDenyMsgRequest(req._id)}>Rechazar</button>
                        <button className="msg-req-accept" onClick={() => handleAcceptMsgRequest(req._id)}>Aceptar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Private Chats */}
              <div className="sidebar-section">
                <h5>Chats Privados</h5>
                {privateChats.length === 0 ? (
                  <p className="sidebar-empty">No hay conversaciones activas.</p>
                ) : (
                  privateChats.map((chat) => {
                    const other = chat.participants?.find((p: any) => p._id !== userId) || {};
                    const otherName = other.name || 'Usuario';
                    const isSelected = activeChatId === chat._id;
                    return (
                      <div 
                        key={chat._id} 
                        className={`chat-item-row ${isSelected ? 'active' : ''}`}
                        onClick={() => setActiveChatId(chat._id)}
                      >
                        <div className="chat-row-avatar">
                          {otherName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="chat-row-details">
                          <strong>{otherName}</strong>
                          <span>Libro: {chat.libro?.title || 'General'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="tab-pane">
              {/* Received reservations */}
              <div className="sidebar-section">
                <h5>Solicitudes Recibidas</h5>
                {receivedReservations.length === 0 ? (
                  <p className="sidebar-empty">No tienes solicitudes pendientes.</p>
                ) : (
                  receivedReservations.map((res) => (
                    <div key={res._id} className="reserva-item-card">
                      <div className="reserva-card-header">
                        <strong>{res.libro?.title}</strong>
                        {getStatusBadge(res.estado)}
                      </div>
                      <p>Solicitante: {res.usuarioSolicitante?.name}</p>
                      <p className="reserva-card-date">Fecha: {new Date(res.fechaSolicitud).toLocaleDateString()}</p>
                      
                      {res.estado === 'ACEPTADA' && res.fechaLimite && (
                        <p className="reserva-card-limit">Límite: {new Date(res.fechaLimite).toLocaleDateString()}</p>
                      )}

                      {res.estado === 'PENDIENTE' && (
                        <div className="reserva-card-actions">
                          <button className="reserva-deny" onClick={() => handleRejectReservation(res._id)}>Rechazar</button>
                          <button className="reserva-accept" onClick={() => handleOpenAcceptRes(res._id)}>Aceptar</button>
                        </div>
                      )}
                      
                      {res.estado !== 'PENDIENTE' && (
                        <button className="reserva-delete-btn" onClick={() => handleDeleteReservation(res._id)}>Eliminar Reserva</button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Sent reservations */}
              <div className="sidebar-section">
                <h5>Solicitudes Enviadas</h5>
                {sentReservations.length === 0 ? (
                  <p className="sidebar-empty">No has enviado ninguna solicitud.</p>
                ) : (
                  sentReservations.map((res) => (
                    <div key={res._id} className="reserva-item-card">
                      <div className="reserva-card-header">
                        <strong>{res.libro?.title}</strong>
                        {getStatusBadge(res.estado)}
                      </div>
                      <p>Propietario: {res.propietario?.name}</p>
                      <p className="reserva-card-date">Fecha: {new Date(res.fechaSolicitud).toLocaleDateString()}</p>

                      {res.estado === 'ACEPTADA' && res.fechaLimite && (
                        <p className="reserva-card-limit">Límite: {new Date(res.fechaLimite).toLocaleDateString()}</p>
                      )}
                      
                      <button className="reserva-delete-btn" onClick={() => handleDeleteReservation(res._id)}>Eliminar Reserva</button>
                    </div>
                  ))
                )}
              </div>

              {/* Reservation system logs/messages */}
              <div className="sidebar-section">
                <h5>Mensajes de Reservas</h5>
                {reservationMessages.length === 0 ? (
                  <p className="sidebar-empty">No hay avisos del sistema.</p>
                ) : (
                  reservationMessages.map((msg) => {
                    const isMine = msg.sender?._id === userId || msg.sender === userId;
                    return (
                      <div key={msg._id} className={`reserva-msg-item ${isMine ? 'mine' : 'theirs'}`}>
                        <div className="res-msg-body">
                          <strong>{msg.sender?.name || 'Sistema'}</strong>
                          <p>{msg.content}</p>
                        </div>
                        <button className="res-msg-del" onClick={() => handleDeleteResMsg(msg._id)}>×</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Pane */}
      <div className="buzon-chat-pane">
        {activeChatId ? (
          <div className="chat-room-layout">
            {/* Chat Room Header */}
            <div className="chat-room-header">
              {activeChatId === '000000000000000000000001' ? (
                <>
                  <div className="chat-header-avatar">🌍</div>
                  <div className="chat-header-details">
                    <h3>Chat Global</h3>
                    <span>Comunidad general de lectores</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="chat-header-avatar">
                    {activeChat?.participants?.find((p: any) => p._id !== userId)?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="chat-header-details">
                    <h3>{activeChat?.participants?.find((p: any) => p._id !== userId)?.name || 'Usuario'}</h3>
                    <span>Libro: {activeChat?.libro?.title || 'General'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Chat Room Messages List */}
            <div className="chat-room-messages">
              {loadingMessages ? (
                <div className="chat-messages-loading">
                  <div className="spinner"></div>
                  <p>Cargando mensajes...</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMine = msg.sender?._id === userId || msg.sender === userId;
                    const senderName = msg.sender?.name || 'Usuario';
                    return (
                      <div key={msg._id} className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`}>
                        {!isMine && <span className="message-sender-name">{senderName}</span>}
                        <div className="message-bubble">
                          <p>{msg.content}</p>
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Room Input Form */}
            <form className="chat-room-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="chat-room-input"
                required
              />
              <button type="submit" className="chat-room-send-btn" disabled={!newMessage.trim()}>
                Enviar
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-pane-placeholder">
            <span className="placeholder-icon">📬</span>
            <h3>Tu Buzón de Mensajes</h3>
            <p>Selecciona una conversación del menú lateral para empezar a chatear o gestionar tus solicitudes.</p>
          </div>
        )}
      </div>

      {/* Accept Reservation Days Modal */}
      {showAcceptResModal && (
        <div className="accept-res-modal-overlay" onClick={() => setShowAcceptResModal(false)}>
          <div className="accept-res-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Aceptar Reserva de Libro</h3>
            <p>Introduce el número de días para la duración del préstamo/alquiler.</p>
            <form onSubmit={handleConfirmAcceptRes} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group" style={{ textAlign: 'left' }}>
                <label style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>Días de alquiler</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={rentalDays}
                  onChange={(e) => setRentalDays(parseInt(e.target.value) || 7)}
                  className="discover-input"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  required
                />
              </div>
              <div className="contact-actions">
                <button
                  type="button"
                  onClick={() => setShowAcceptResModal(false)}
                  className="back-button"
                  style={{ flex: 1, margin: 0, justifyContent: 'center' }}
                  disabled={submittingAcceptRes}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="contact-btn"
                  style={{ flex: 2, margin: 0, justifyContent: 'center' }}
                  disabled={submittingAcceptRes}
                >
                  {submittingAcceptRes ? 'Aceptando...' : 'Aceptar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buzon;
