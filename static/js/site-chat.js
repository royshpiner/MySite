(function () {
  const script = document.currentScript;
  const apiUrl = script && script.dataset.ragApiUrl;

  if (!apiUrl) {
    return;
  }

  const chat = document.querySelector('[data-site-chat]');

  if (!chat) {
    return;
  }

  const form = chat.querySelector('.site-chat__form');
  const input = chat.querySelector('.site-chat__input');
  const sendButton = chat.querySelector('.site-chat__send');
  const messages = chat.querySelector('.site-chat__messages');
  const suggestions = chat.querySelectorAll('.site-chat__suggestion');

  if (!form || !input || !sendButton || !messages) {
    return;
  }

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

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  suggestions.forEach((suggestion) => {
    suggestion.addEventListener('click', () => {
      input.value = suggestion.textContent.trim();
      input.focus();
    });
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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'The chat API returned an error.');
      }

      addMessage(data.answer || 'I do not know.', 'assistant');
    } catch (error) {
      addMessage(
        error instanceof Error
          ? `The chat is unavailable right now: ${error.message}`
          : 'The chat is unavailable right now. Please try again later.',
        'assistant'
      );
    } finally {
      setLoading(false);
      input.focus();
    }
  });

  addMessage(
    'Ask a question and I will answer through Gemini. The personal knowledge base comes next, so for now this is only a live chat test.',
    'assistant'
  );
})();
