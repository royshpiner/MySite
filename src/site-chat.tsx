import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

type ChatMessage = {
  id: number;
  sender: 'assistant' | 'user';
  text: string;
};

type AskResponse = {
  answer?: string;
  error?: string;
};

const suggestions = [
  'What do you know about Roy?',
  'What projects has Roy built?',
  'What is Roy studying?',
];

const initialMessage =
  'Ask a question and I will answer through Gemini. The personal knowledge base comes next, so for now this is only a live chat test.';

function ChatApp({ apiUrl }: { apiUrl: string }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'assistant', text: initialMessage },
  ]);
  const nextId = useRef(2);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender: ChatMessage['sender'], text: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: nextId.current++, sender, text },
    ]);
  };

  const submitQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    addMessage('user', trimmedQuestion);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedQuestion }),
      });

      const data = (await response.json().catch(() => ({}))) as AskResponse;

      if (!response.ok) {
        throw new Error(data.error || 'The chat API returned an error.');
      }

      addMessage('assistant', data.answer || 'I do not know.');
    } catch (error) {
      addMessage(
        'assistant',
        error instanceof Error
          ? `The chat is unavailable right now: ${error.message}`
          : 'The chat is unavailable right now. Please try again later.'
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitQuestion();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion();
    }
  };

  const chooseSuggestion = (suggestion: string) => {
    setQuestion(suggestion);
    inputRef.current?.focus();
  };

  return (
    <section className="site-chat" aria-label="Ask about Roy">
      <div className="site-chat__inner">
        <h2 className="site-chat__title">Ask about Roy</h2>

        <form className="site-chat__form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="site-chat__input"
            name="question"
            rows={2}
            maxLength={1000}
            placeholder="Ask anything about Roy"
            value={question}
            disabled={isLoading}
            onChange={(event) => setQuestion(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="site-chat__send"
            type="submit"
            aria-label="Send question"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? 'Sending' : 'Send'}
          </button>
        </form>

        <p className="site-chat__suggestions">
          Suggestions:{' '}
          {suggestions.map((suggestion, index) => (
            <span key={suggestion}>
              {index > 0 && <span aria-hidden="true"> • </span>}
              <button
                type="button"
                className="site-chat__suggestion"
                onClick={() => chooseSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            </span>
          ))}
        </p>

        <div className="site-chat__messages" aria-live="polite" ref={messagesRef}>
          {messages.map((message) => (
            <div
              className={`site-chat__message site-chat__message--${message.sender}`}
              key={message.id}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const rootElement = document.querySelector<HTMLElement>('#site-chat-root');
const apiUrl = rootElement?.dataset.ragApiUrl;

if (rootElement && apiUrl) {
  createRoot(rootElement).render(<ChatApp apiUrl={apiUrl} />);
}
