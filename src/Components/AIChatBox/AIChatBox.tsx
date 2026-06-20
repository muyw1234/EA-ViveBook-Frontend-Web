import React, { useRef, useState } from 'react'; //useEffect
import { useTranslation } from 'react-i18next';
import RecomendacionService, { type RecommendationContextItem } from '../Services/Recomendacion';
import './AIChatBox.css';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  context?: RecommendationContextItem[];
  model?: string;
  isWelcomeMessage?: boolean;
};

const AIChatBox: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 1,
      role: 'assistant',
      content: '',
      isWelcomeMessage: true,
    },
  ]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: 'user',
      content: trimmedQuery,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setQuery('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const result = await RecomendacionService.recomendarLibros(trimmedQuery, limit);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: nextId.current++,
          role: 'assistant',
          content: result.respuesta,
          context: result.context,
          model: result.metadata.model,
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error?.message || t('chat_ai_error');

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: nextId.current++,
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <main className="ai-chat-page">
      <section className="ai-chat-shell" aria-label={t('chat_ai_title')}>
        <header className="ai-chat-header">
          <div>
            <span className="ai-chat-kicker">{t('chat_ai_kicker')}</span>
            <h1>{t('chat_ai_title')}</h1>
          </div>
          <label className="ai-limit-control">
            <span>{t('chat_ai_results')}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            />
          </label>
        </header>

        <div className="ai-messages-list">
          {messages.map((message) => (
            <article key={message.id} className={`ai-message ${message.role}`}>
              <div className="ai-message-bubble">
                <p>{message.isWelcomeMessage ? t('chat_ai_welcome') : message.content}</p>

                {message.model && (
                  <span className="ai-message-meta">
                    {t('chat_ai_model')}: {message.model}
                  </span>
                )}

                {message.context && message.context.length > 0 && (
                  <details className="ai-context-details">
                    <summary>
                      {t('chat_ai_context')} ({message.context.length})
                    </summary>
                    <ul>
                      {message.context.map((item, index) => (
                        <li key={`${item.title || 'context'}-${index}`}>
                          <strong>{item.title || `${t('chat_ai_reference')} ${index + 1}`}</strong>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </article>
          ))}

          {isLoading && (
            <article className="ai-message assistant">
              <div className="ai-message-bubble loading">
                <span />
                <span />
                <span />
              </div>
            </article>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="ai-chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder={t('chat_ai_placeholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            aria-label={t('chat_ai_send')}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path fill="currentColor" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </section>
    </main>
  );
};

export default AIChatBox;
