(function () {
  const script = document.currentScript;
  const apiUrl = script && script.dataset.ragApiUrl;

  if (!apiUrl || document.querySelector('[data-site-chat]')) {
    return;
  }

  const chat = document.createElement('section');
  chat.className = 'site-chat';
  chat.dataset.siteChat = 'true';
  chat.dataset.open = 'false';
  chat.innerHTML = `
    <div class="site-chat__panel" role="dialog" aria-label="Ask about Roy">
      <div class="site-chat__header">
        <h2 class="site-chat__title">Ask about Roy</h2>
        <button class="site-chat__close" type="button" aria-label="Close chat">&times;</button>
      </div>
      <div class="site-chat__messages" aria-live="polite"></div>
      <form class="site-chat__form">
        <textarea class="site-chat__input" name="question" rows="2" maxlength="1000" placeholder="Ask something about Roy"></textarea>
        <button class="site-chat__send" type="submit">Send</button>
      </form>
    </div>
    <button class="site-chat__button" type="button" aria-label="Open chat" aria-expanded="false">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
      </svg>
    </button>
  `;

  const button = chat.querySelector('.site-chat__button');
  const closeButton = chat.querySelector('.site-chat__close');
  const form = chat.querySelector('.site-chat__form');
  const input = chat.querySelector('.site-chat__input');
  const sendButton = chat.querySelector('.site-chat__send');
  const messages = chat.querySelector('.site-chat__messages');

  const setOpen = (isOpen) => {
    chat.dataset.open = String(isOpen);
    button.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      input.focus();
    }
  };

  const addMessage = (text, sender) => {
    const message = document.createElement('div');
    message.className = `site-chat__message site-chat__message--${sender}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const setLoading = (isLoading) => {
    input.disabled = isLoading;
    sendButton.disabled = isLoading;
    sendButton.textContent = isLoading ? 'Sending' : 'Send';
  };

  button.addEventListener('click', () => {
    setOpen(chat.dataset.open !== 'true');
  });

  closeButton.addEventListener('click', () => {
    setOpen(false);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      return;
    }

    addMessage(question, 'user');
    input.value = '';
    setLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The chat API returned an error.');
      }

      addMessage(data.answer || 'I do not know.', 'assistant');
    } catch (error) {
      addMessage(
        'The chat is unavailable right now. Please try again later.',
        'assistant'
      );
    } finally {
      setLoading(false);
      input.focus();
    }
  });

  addMessage(
    'Hi. Ask me about Roy. This first version is connected to Gemini; the personal knowledge base comes next.',
    'assistant'
  );

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(chat);
  });
})();
