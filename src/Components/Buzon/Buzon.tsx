import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import socket from '../../Services/socket';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getApiCollection, unwrapApiData } from '../../utils/apiResponse';
import './Buzon.css';

const Buzon: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'chats' | 'reservas' | 'eventos'>('chats');
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

  const [eventChats, setEventChats] = useState<any[]>([]);
  const [isEventChat, setIsEventChat] = useState<boolean>(false);

  // Setup user and socket on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        const user = unwrapApiData<any>(profileRes.data);
        setUserId(user._id);

        if (socket.connected) {
          socket.disconnect();
        }

        socket.connect();
        socket.removeAllListeners();
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
  }, [tab]);

  // Fetch all lists data
  const fetchBuzonData = async () => {
    if (!userId) return;
    try {
      // Chats and requests
      const [chatsRes, receivedReqRes, sentReqRes, eventChatsRes] = await Promise.all([
        api.get('/chats'),
        api.get('/message-requests/received'),
        api.get('/message-requests/sent'),
        api.get('/chats/eventos/mis-chats'),
      ]);
      setPrivateChats(getApiCollection(chatsRes.data));
      setReceivedMsgRequests(getApiCollection(receivedReqRes.data));
      setSentMsgRequests(getApiCollection(sentReqRes.data));
      setEventChats(getApiCollection(eventChatsRes.data));
      // Reservations
      const [recRes, sentRes, resMsgs] = await Promise.all([
        api.get('/reservas/recibidas'),
        api.get('/reservas/solicitadas'),
        api.get('/mensajes/reservas'),
      ]);
      setReceivedReservations(getApiCollection(recRes.data));
      setSentReservations(getApiCollection(sentRes.data));
      setReservationMessages(getApiCollection(resMsgs.data));
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

    socket.emit('join_chat', activeChatId);

    if (activeChatId === '000000000000000000000001') {
      setActiveChat({ title: t('buzon_global_chat_title') });
    } else if (isEventChat) {
      const currentEventChat = eventChats.find((c) => c._id === activeChatId);
      setActiveChat(currentEventChat || null);
    } else {
      const currentPrivateChat = privateChats.find((c) => c._id === activeChatId);
      setActiveChat(currentPrivateChat || null);
    }

    const loadMessages = async (chatId: string) => {
      setLoadingMessages(true);
      try {
        const response = await api.get(`/chats/${chatId}/messages`);

        const dataLimpia = response.data?.data || response.data || [];

        setMessages(Array.isArray(dataLimpia) ? dataLimpia : []);

        if (!isEventChat && chatId !== '000000000000000000000001') {
          await api.patch(`/chats/${chatId}/read`);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        toast.error(t('buzon_toast_load_msg_error'));
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages(activeChatId);

    return () => {
      socket.emit('leave_chat', activeChatId);
    };
  }, [activeChatId, isEventChat, privateChats, eventChats, t]);

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
      content: newMessage.trim(),
      isEventChat: isEventChat,
    });

    setNewMessage('');
  };

  // Message Requests actions
  const handleAcceptMsgRequest = async (reqId: string) => {
    try {
      const res = await api.patch(`/message-requests/${reqId}/accept`);
      toast.success(t('buzon_toast_accept_req_success'));
      fetchBuzonData();
      const chat = res.data?.data || res.data;
      if (chat && chat._id) {
        setActiveChatId(chat._id);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('buzon_toast_accept_req_error'));
    }
  };

  const handleDenyMsgRequest = async (reqId: string) => {
    if (!window.confirm(t('buzon_confirm_deny_req'))) return;
    try {
      await api.patch(`/message-requests/${reqId}/deny`);
      toast.success(t('buzon_toast_deny_req_success'));
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error(t('buzon_toast_deny_req_error'));
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
        dias: rentalDays,
      });
      toast.success(t('buzon_toast_accept_res_success'));
      setShowAcceptResModal(false);
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error(t('buzon_toast_accept_res_error'));
    } finally {
      setSubmittingAcceptRes(false);
    }
  };

  const handleRejectReservation = async (resId: string) => {
    if (!window.confirm(t('buzon_confirm_deny_res'))) return;
    try {
      await api.post(`/reservas/rechazar/${resId}`);
      toast.success(t('buzon_toast_deny_res_success'));
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error(t('buzon_toast_deny_res_error'));
    }
  };

  const handleDeleteReservation = async (resId: string) => {
    if (!window.confirm(t('buzon_confirm_delete_res'))) return;
    try {
      await api.delete(`/reservas/${resId}`);
      toast.success(t('buzon_toast_delete_res_success'));
      fetchBuzonData();
    } catch (err) {
      console.error(err);
      toast.error(t('buzon_toast_delete_res_error'));
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
    if (s === 'PENDIENTE')
      return <span className="status-badge pending">{t('buzon_status_pending')}</span>;
    if (s === 'ACEPTADA')
      return <span className="status-badge accepted">{t('buzon_status_accepted')}</span>;
    if (s === 'RECHAZADA')
      return <span className="status-badge rejected">{t('buzon_status_rejected')}</span>;
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
            {t('buzon_tab_messages')}
          </button>
          <button
            className={`sidebar-tab-btn ${tab === 'reservas' ? 'active' : ''}`}
            onClick={() => setTab('reservas')}
          >
            {t('buzon_tab_reservations')}
          </button>
        </div>

        <div className="sidebar-content">
          {tab === 'chats' ? (
            <div className="tab-pane">
              {/* Chat Global card */}
              <div
                className={`global-chat-card-item ${activeChatId === '000000000000000000000001' ? 'active' : ''}`}
                onClick={() => {
                  setIsEventChat(false);
                  setActiveChatId('000000000000000000000001');
                }}
              >
                <div className="global-chat-avatar">🌍</div>
                <div className="global-chat-details">
                  <h4>{t('buzon_global_chat_title')}</h4>
                  <p>{t('buzon_global_chat_desc')}</p>
                </div>
              </div>

              {/* Notices */}
              {notices.length > 0 && (
                <div className="sidebar-section">
                  <h5>{t('buzon_section_notices')}</h5>
                  {notices.map((notice) => {
                    const isAccepted = notice.status === 'accepted';
                    return (
                      <div
                        key={notice._id}
                        className={`notice-item ${isAccepted ? 'accepted' : 'rejected'}`}
                      >
                        <div className="notice-body">
                          <strong>
                            {isAccepted ? t('buzon_notice_accepted') : t('buzon_notice_rejected')}
                          </strong>
                          <p>
                            {isAccepted
                              ? t('buzon_notice_msg_accepted', { title: notice.book?.title })
                              : t('buzon_notice_msg_rejected', { title: notice.book?.title })}
                          </p>
                        </div>
                        <button
                          className="close-notice-btn"
                          onClick={() => handleDismissMsgRequest(notice._id)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message Requests Received */}
              {receivedMsgRequests.length > 0 && (
                <div className="sidebar-section">
                  <h5>{t('buzon_section_received_reqs')}</h5>
                  {receivedMsgRequests.map((req) => (
                    <div key={req._id} className="msg-req-item">
                      <div className="msg-req-header">
                        <strong>{req.requester?.name}</strong>
                        <span>{t('buzon_req_book', { title: req.book?.title })}</span>
                      </div>
                      {req.initialMessage && (
                        <p className="msg-req-text">&quot;{req.initialMessage}&quot;</p>
                      )}
                      <div className="msg-req-actions">
                        <button
                          className="msg-req-deny"
                          onClick={() => handleDenyMsgRequest(req._id)}
                        >
                          {t('buzon_btn_deny')}
                        </button>
                        <button
                          className="msg-req-accept"
                          onClick={() => handleAcceptMsgRequest(req._id)}
                        >
                          {t('buzon_btn_accept')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* NUEVA SECCIÓN: Chats grupales de Eventos */}
              <div className="sidebar-section">
                <h5>{t('buzon_section_event_chats')}</h5>
                {eventChats.length === 0 ? (
                  <p className="sidebar-empty">{t('buzon_empty_events')}</p>
                ) : (
                  eventChats.map((chat) => {
                    const isSelected = activeChatId === chat._id;
                    const eventoTitle = chat.evento?.title || 'Evento';
                    return (
                      <div
                        key={chat._id}
                        className={`chat-item-row event-chat-row ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setIsEventChat(true);
                          setActiveChatId(chat._id);
                        }}
                      >
                        <div
                          className="chat-row-avatar"
                          style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
                        >
                          📢
                        </div>
                        <div className="chat-row-details">
                          <strong>{eventoTitle}</strong>
                          <span>
                            {t('buzon_event_attendees', { count: chat.participants?.length || 0 })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Active Private Chats */}
              <div className="sidebar-section">
                <h5>{t('buzon_section_private_chats')}</h5>
                {privateChats.length === 0 ? (
                  <p className="sidebar-empty">{t('buzon_empty_private')}</p>
                ) : (
                  privateChats.map((chat) => {
                    const other = chat.participants?.find((p: any) => p._id !== userId) || {};
                    const otherName = other.name || 'Usuario';
                    const isSelected = activeChatId === chat._id && !isEventChat;
                    return (
                      <div
                        key={chat._id}
                        className={`chat-item-row ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setIsEventChat(false);
                          setActiveChatId(chat._id);
                        }}
                      >
                        <div className="chat-row-avatar">
                          {otherName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="chat-row-details">
                          <strong>{otherName}</strong>
                          <span>
                            {t('buzon_req_book', {
                              title: chat.libro?.title || t('buzon_chat_general'),
                            })}
                          </span>
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
                <h5>{t('buzon_section_received_reqs')}</h5>
                {receivedReservations.length === 0 ? (
                  <p className="sidebar-empty">{t('buzon_empty_reservations')}</p>
                ) : (
                  receivedReservations.map((res) => (
                    <div key={res._id} className="reserva-item-card">
                      <div className="reserva-card-header">
                        <strong>{res.libro?.title}</strong>
                        {getStatusBadge(res.estado)}
                      </div>
                      <p>{t('buzon_res_requester', { name: res.usuarioSolicitante?.name })}</p>
                      <p className="reserva-card-date">
                        {t('buzon_res_date', {
                          date: new Date(res.fechaSolicitud).toLocaleDateString(),
                        })}
                      </p>

                      {res.estado === 'ACEPTADA' && res.fechaLimite && (
                        <p className="reserva-card-limit">
                          {t('buzon_res_limit', {
                            date: new Date(res.fechaLimite).toLocaleDateString(),
                          })}
                        </p>
                      )}

                      {res.estado === 'PENDIENTE' && (
                        <div className="reserva-card-actions">
                          <button
                            className="reserva-deny"
                            onClick={() => handleRejectReservation(res._id)}
                          >
                            {t('buzon_btn_deny')}
                          </button>
                          <button
                            className="reserva-accept"
                            onClick={() => handleOpenAcceptRes(res._id)}
                          >
                            {t('buzon_btn_accept')}
                          </button>
                        </div>
                      )}

                      {res.estado !== 'PENDIENTE' && (
                        <button
                          className="reserva-delete-btn"
                          onClick={() => handleDeleteReservation(res._id)}
                        >
                          {t('buzon_btn_delete_res')}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Sent reservations */}
              <div className="sidebar-section">
                <h5>{t('buzon_section_sent_reservations')}</h5>
                {sentReservations.length === 0 ? (
                  <p className="sidebar-empty">{t('buzon_empty_sent_res')}</p>
                ) : (
                  sentReservations.map((res) => (
                    <div key={res._id} className="reserva-item-card">
                      <div className="reserva-card-header">
                        <strong>{res.libro?.title}</strong>
                        {getStatusBadge(res.estado)}
                      </div>
                      <p>{t('buzon_res_owner', { name: res.propietario?.name })}</p>
                      <p className="reserva-card-date">
                        {t('buzon_res_date', {
                          date: new Date(res.fechaSolicitud).toLocaleDateString(),
                        })}
                      </p>

                      {res.estado === 'ACEPTADA' && res.fechaLimite && (
                        <p className="reserva-card-limit">
                          {t('buzon_res_limit', {
                            date: new Date(res.fechaLimite).toLocaleDateString(),
                          })}
                        </p>
                      )}

                      <button
                        className="reserva-delete-btn"
                        onClick={() => handleDeleteReservation(res._id)}
                      >
                        {t('buzon_btn_delete_res')}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Reservation system logs/messages */}
              <div className="sidebar-section">
                <h5>{t('buzon_section_res_messages')}</h5>
                {reservationMessages.length === 0 ? (
                  <p className="sidebar-empty">{t('buzon_empty_system_notices')}</p>
                ) : (
                  reservationMessages.map((msg) => {
                    const isMine = msg.sender?._id === userId || msg.sender === userId;
                    return (
                      <div
                        key={msg._id}
                        className={`reserva-msg-item ${isMine ? 'mine' : 'theirs'}`}
                      >
                        <div className="res-msg-body">
                          <strong>{msg.sender?.name || t('buzon_system_sender')}</strong>
                          <p>{msg.content}</p>
                        </div>
                        <button className="res-msg-del" onClick={() => handleDeleteResMsg(msg._id)}>
                          ×
                        </button>
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
                    <h3>{t('buzon_global_chat_title')}</h3>
                    <span>{t('buzon_chat_community_span')}</span>
                  </div>
                </>
              ) : isEventChat ? (
                /* RENDERIZADO CABECERA DE EVENTO GRUPAL */
                <>
                  <div
                    className="chat-header-avatar"
                    style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
                  >
                    📢
                  </div>
                  <div className="chat-header-details">
                    <h3>{activeChat?.evento?.title || t('buzon_chat_event_fallback')}</h3>
                    <span>
                      {t('buzon_chat_location', {
                        location:
                          activeChat?.evento?.direccionExacta || t('buzon_chat_location_fallback'),
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="chat-header-avatar">
                    {activeChat?.participants
                      ?.find((p: any) => p._id !== userId)
                      ?.name?.substring(0, 2)
                      .toUpperCase() || 'U'}
                  </div>
                  <div className="chat-header-details">
                    <h3>
                      {activeChat?.participants?.find((p: any) => p._id !== userId)?.name ||
                        'Usuario'}
                    </h3>
                    <span>
                      {t('buzon_req_book', {
                        title: activeChat?.libro?.title || t('buzon_chat_general'),
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Chat Room Messages List */}
            <div className="chat-room-messages">
              {loadingMessages ? (
                <div className="chat-messages-loading">
                  <div className="spinner"></div>
                  <p>{t('buzon_loading_messages')}</p>
                </div>
              ) : (
                <>
                  {messages?.map((msg) => {
                    const isMine = msg.sender?._id === userId || msg.sender === userId;
                    const senderName = msg.sender?.name || 'Usuario';
                    return (
                      <div
                        key={msg._id}
                        className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`}
                      >
                        {!isMine && <span className="message-sender-name">{senderName}</span>}
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
                </>
              )}
            </div>

            {/* Chat Room Input Form */}
            <form className="chat-room-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder={t('buzon_input_placeholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="chat-room-input"
                required
              />
              <button type="submit" className="chat-room-send-btn" disabled={!newMessage.trim()}>
                {t('buzon_btn_send')}
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-pane-placeholder">
            <span className="placeholder-icon">📬</span>
            <h3>{t('buzon_placeholder_title')}</h3>
            <p>{t('buzon_placeholder_desc')}</p>
          </div>
        )}
      </div>

      {/* Accept Reservation Days Modal */}
      {showAcceptResModal && (
        <div className="accept-res-modal-overlay" onClick={() => setShowAcceptResModal(false)}>
          <div className="accept-res-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('buzon_modal_res_title')}</h3>
            <p>{t('buzon_modal_res_desc')}</p>
            <form
              onSubmit={handleConfirmAcceptRes}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div className="input-group" style={{ textAlign: 'left' }}>
                <label style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>
                  {t('buzon_modal_res_label')}
                </label>
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
                  {t('buzon_modal_res_cancel')}
                </button>
                <button
                  type="submit"
                  className="contact-btn"
                  style={{ flex: 2, margin: 0, justifyContent: 'center' }}
                  disabled={submittingAcceptRes}
                >
                  {submittingAcceptRes
                    ? t('buzon_modal_res_submitting')
                    : t('buzon_modal_res_submit')}
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
