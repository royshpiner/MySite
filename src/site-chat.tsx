import { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

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
  'Ask a question and I will answer using Roy\'s project knowledge base.';

const fallbackMessage =
  'The AI chat is temporarily unavailable because the API failed or the model has no tokens/quota left. You can still view my resume below.';

const isFallbackAnswer = (answer: string) => {
  const normalizedAnswer = answer.toLowerCase();

  return (
    normalizedAnswer.includes('temporarily unavailable') ||
    normalizedAnswer.includes('rate-limited') ||
    normalizedAnswer.includes('quota') ||
    normalizedAnswer.includes('high demand')
  );
};

function ChatApp({ apiUrl }: { apiUrl: string }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestAnswer, setLatestAnswer] = useState(initialMessage);
  const [showResumeFallback, setShowResumeFallback] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resumeUrl = new URL(
    'files/roy-shpiner-resume.pdf',
    document.baseURI
  ).toString();

  const submitQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    setQuestion('');
    setIsLoading(true);
    setShowResumeFallback(false);
    setLatestAnswer('Getting your answer...');

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

      const answer = data.answer || 'I do not know.';

      if (isFallbackAnswer(answer)) {
        setLatestAnswer(fallbackMessage);
        setShowResumeFallback(true);
        return;
      }

      setLatestAnswer(answer);
    } catch (error) {
      setLatestAnswer(fallbackMessage);
      setShowResumeFallback(true);
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

        <div className="site-chat__messages" aria-live="polite">
          <div className="site-chat__message site-chat__message--assistant">
            {latestAnswer}
          </div>
          {showResumeFallback && (
            <div className="site-chat__resume">
              <div className="site-chat__resume-actions">
                <a
                  className="site-chat__resume-link"
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Roy's resume
                </a>
              </div>
              <iframe
                className="site-chat__resume-frame"
                src={resumeUrl}
                title="Roy Shpiner resume"
              />
            </div>
          )}
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
