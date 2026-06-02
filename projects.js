(() => {
  const SU = globalThis.StardanceUtils;

  SU.composeTranscriptText = (baseText, finalText, interimText) => {
    const parts = [baseText, finalText, interimText]
      .map((value) => (value || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return parts.join(' ').trim();
  };

  SU.normalizeTranscriptText = (text) => {
    let normalized = (text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return '';
    }

    normalized = normalized
      .replace(/\bi\b/g, 'I')
      .replace(/\s+([,.;!?])/g, '$1')
      .replace(/([,.;!?])(\S)/g, '$1 $2')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return normalized;
  };

  SU.addCommaHints = (text) => text
    .replace(/\b(however|therefore|meanwhile|instead|also|anyway)\b/gi, ', $1,')
    .replace(/\s+,/g, ',')
    .replace(/,{2,}/g, ',')
    .replace(/,\s*,/g, ', ')
    .replace(/^,\s*/g, '')
    .replace(/\s+,\s*$/g, '');

  SU.capitalizeSentences = (text) => {
    let shouldCapitalize = true;
    let output = '';

    for (const char of text) {
      if (shouldCapitalize && /[a-z]/.test(char)) {
        output += char.toUpperCase();
        shouldCapitalize = false;
        continue;
      }

      output += char;
      if (/[.!?]/.test(char)) {
        shouldCapitalize = true;
      } else if (!/\s/.test(char)) {
        shouldCapitalize = false;
      }
    }

    return output;
  };

  SU.formatTranscriptChunk = (rawChunk, contextText = '', isFinal = false) => {
    let chunk = SU.normalizeTranscriptText(rawChunk);
    if (!chunk) {
      return '';
    }

    chunk = SU.addCommaHints(chunk);

    const sentenceContext = SU.normalizeTranscriptText(contextText);
    const shouldCapitalizeFirst = !sentenceContext || /[.!?]\s*$/.test(sentenceContext);
    if (shouldCapitalizeFirst) {
      chunk = chunk.replace(/^([a-z])/, (char) => char.toUpperCase());
    }

    if (isFinal && !/[.!?]$/.test(chunk)) {
      const wordCount = chunk.split(/\s+/).length;
      if (wordCount >= 14) {
        chunk = `${chunk}.`;
      }
    }

    return chunk;
  };

  SU.finalizeTranscriptText = (text) => SU.capitalizeSentences(SU.normalizeTranscriptText(text));

  SU.fetchSlackEmojis = async () => {
    if (Array.isArray(SU.slackEmojiCache) && SU.slackEmojiCache.length) {
      return SU.slackEmojiCache;
    }

    if (SU.slackEmojiRequestPromise) {
      return SU.slackEmojiRequestPromise;
    }

    SU.slackEmojiRequestPromise = fetch(SU.SLACK_EMOJI_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Slack emoji request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((items) => {
        const emojis = Array.isArray(items)
          ? items
              .filter((item) => item?.type === 'emoji' && item?.name && item?.imageUrl)
              .map((item) => ({
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                alias: item.alias || null
              }))
          : [];
        SU.slackEmojiCache = emojis;
        return emojis;
      })
      .catch(() => {
        SU.slackEmojiCache = [];
        return [];
      })
      .finally(() => {
        SU.slackEmojiRequestPromise = null;
      });

    return SU.slackEmojiRequestPromise;
  };

  SU.insertTextAtCursor = (textarea, text) => {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const current = textarea.value || '';
    const prefix = current.slice(0, start);
    const suffix = current.slice(end);
    const spacerBefore = prefix && !/\s$/.test(prefix) ? ' ' : '';
    const spacerAfter = suffix && !/^\s/.test(suffix) ? ' ' : '';
    const nextValue = `${prefix}${spacerBefore}${text}${spacerAfter}${suffix}`;
    const caret = (prefix + spacerBefore + text).length;

    textarea.value = nextValue;
    textarea.setSelectionRange(caret, caret);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  };

  SU.getDevlogDraftKey = (form) => {
    const action = form?.getAttribute('action') || window.location.pathname;
    return `stardance-utils:devlog-draft:${action}`;
  };

  SU.bindDevlogDraftPersistence = (composerSection) => {
    if (!composerSection || composerSection.getAttribute(SU.DEVLOG_DRAFT_ATTR) === 'true') {
      return;
    }

    const form = composerSection.querySelector('.feed-composer__form');
    const textarea = composerSection.querySelector('textarea[name="post_devlog[body]"]');
    const submitGroup = composerSection.querySelector('.feed-composer__submit-group');
    if (!form || !textarea || !submitGroup) {
      return;
    }

    composerSection.setAttribute(SU.DEVLOG_DRAFT_ATTR, 'true');
    const draftKey = SU.getDevlogDraftKey(form);

    const draftControls = document.createElement('div');
    draftControls.className = 'stardance-utils-draft-controls';

    const discardButton = document.createElement('button');
    discardButton.type = 'button';
    discardButton.className = 'stardance-utils-draft-discard';
    discardButton.textContent = 'Discard draft';
    discardButton.hidden = true;
    draftControls.appendChild(discardButton);

    const composerShell = composerSection.closest('.stardance-utils-inline-composer-shell');
    if (composerShell) {
      composerShell.appendChild(draftControls);
    } else {
      submitGroup.appendChild(draftControls);
    }

    const syncDraftControls = () => {
      discardButton.hidden = !textarea.value.trim();
    };

    try {
      const savedDraft = window.localStorage.getItem(draftKey);
      if (savedDraft && !textarea.value.trim()) {
        textarea.value = savedDraft;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch {
      // Ignore localStorage access failures.
    }

    syncDraftControls();

    let saveTimer = null;
    const persistDraft = () => {
      const value = textarea.value || '';
      try {
        if (value.trim()) {
          window.localStorage.setItem(draftKey, value);
        } else {
          window.localStorage.removeItem(draftKey);
        }
      } catch {
        // Ignore localStorage access failures.
      }
    };

    textarea.addEventListener('input', () => {
      syncDraftControls();
      if (saveTimer) {
        window.clearTimeout(saveTimer);
      }
      saveTimer = window.setTimeout(persistDraft, 250);
    });

    discardButton.addEventListener('click', () => {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // Ignore localStorage access failures.
      }
      syncDraftControls();
      textarea.focus();
    });

    form.addEventListener('submit', () => {
      const activeSubmitButton = form.querySelector('button[type="submit"]');
      const isDisabled = activeSubmitButton?.disabled || activeSubmitButton?.getAttribute('aria-disabled') === 'true';
      if (isDisabled) {
        return;
      }

      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // Ignore localStorage access failures.
      }
    });
  };

  SU.enhanceSlackEmoji = (composerSection) => {
    if (!composerSection || composerSection.getAttribute(SU.DEVLOG_SLACK_EMOJI_ATTR) === 'true') {
      return;
    }

    const textarea = composerSection.querySelector('textarea[name="post_devlog[body]"]');
    const emojiPopover = composerSection.querySelector('[data-emoji-picker-target="popover"]');
    if (!textarea || !emojiPopover) {
      return;
    }

    composerSection.setAttribute(SU.DEVLOG_SLACK_EMOJI_ATTR, 'true');

    const autocomplete = document.createElement('div');
    autocomplete.className = 'stardance-utils-emoji-autocomplete';
    autocomplete.hidden = true;
    const field = textarea.closest('.feed-composer__field');
    field?.appendChild(autocomplete);

    let allEmojis = [];
    let activeAutocompleteItems = [];
    let activeAutocompleteIndex = 0;

    const closeAutocomplete = () => {
      autocomplete.hidden = true;
      autocomplete.textContent = '';
      activeAutocompleteItems = [];
      activeAutocompleteIndex = 0;
    };

    const replaceShortcodeTokenAtCursor = (emoji) => {
      const value = textarea.value || '';
      const caret = textarea.selectionStart ?? value.length;
      const before = value.slice(0, caret);
      const after = value.slice(caret);
      const match = before.match(/(^|\s):([a-zA-Z0-9_+\-]*)$/);
      if (!match) {
        return;
      }

      const tokenStart = before.length - match[0].length + match[1].length;
      const replacement = `![:${emoji.name}:](${emoji.imageUrl}) `;
      textarea.value = `${value.slice(0, tokenStart)}${replacement}${after}`;
      const nextCaret = tokenStart + replacement.length;
      textarea.setSelectionRange(nextCaret, nextCaret);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const applyAutocompleteSelection = (emoji) => {
      if (!emoji) {
        return;
      }
      replaceShortcodeTokenAtCursor(emoji);
      closeAutocomplete();
    };

    const renderAutocomplete = () => {
      const value = textarea.value || '';
      const caret = textarea.selectionStart ?? value.length;
      const before = value.slice(0, caret);
      const match = before.match(/(^|\s):([a-zA-Z0-9_+\-]{1,32})$/);
      if (!match || !allEmojis.length) {
        closeAutocomplete();
        return;
      }

      const query = match[2].toLowerCase();
      const results = allEmojis
        .filter((emoji) => emoji.name.toLowerCase().includes(query) || (emoji.alias || '').toLowerCase().includes(query))
        .slice(0, 6);

      if (!results.length) {
        closeAutocomplete();
        return;
      }

      activeAutocompleteItems = results;
      if (activeAutocompleteIndex >= results.length) {
        activeAutocompleteIndex = 0;
      }

      autocomplete.textContent = '';
      results.forEach((emoji, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'stardance-utils-emoji-autocomplete-item';
        if (index === activeAutocompleteIndex) {
          item.classList.add('is-active');
        }
        item.innerHTML = `<img src="${emoji.imageUrl}" alt=":${emoji.name}:" loading="lazy" /><span>:${emoji.name}:</span>`;
        item.addEventListener('mousedown', (event) => {
          event.preventDefault();
          applyAutocompleteSelection(emoji);
        });
        autocomplete.appendChild(item);
      });
      autocomplete.hidden = false;
    };

    textarea.addEventListener('input', () => {
      activeAutocompleteIndex = 0;
      renderAutocomplete();
    });

    textarea.addEventListener('keydown', (event) => {
      if (autocomplete.hidden || !activeAutocompleteItems.length) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeAutocompleteIndex = (activeAutocompleteIndex + 1) % activeAutocompleteItems.length;
        renderAutocomplete();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeAutocompleteIndex = (activeAutocompleteIndex - 1 + activeAutocompleteItems.length) % activeAutocompleteItems.length;
        renderAutocomplete();
        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        applyAutocompleteSelection(activeAutocompleteItems[activeAutocompleteIndex]);
        return;
      }

      if (event.key === 'Escape') {
        closeAutocomplete();
      }
    });

    textarea.addEventListener('blur', () => {
      window.setTimeout(closeAutocomplete, 120);
    });

    const insertSlackEmojiMarkdown = (emoji) => {
      SU.insertTextAtCursor(textarea, `![:${emoji.name}:](${emoji.imageUrl})`);
    };

    const getEmojiPickerRoot = () => {
      const picker = emojiPopover.querySelector('em-emoji-picker');
      if (!picker) {
        return null;
      }

      return picker.shadowRoot || picker;
    };

    const mountSlackPickerUI = () => {
      const pickerRoot = getEmojiPickerRoot();
      if (!pickerRoot) {
        return false;
      }

      const navRow = pickerRoot.querySelector('#nav .flex.relative');
      const categoriesContainer = pickerRoot.querySelector('.scroll.flex-grow.padding-lr > div > div');
      const scrollArea = pickerRoot.querySelector('.scroll.flex-grow.padding-lr');
      if (!navRow || !categoriesContainer || !scrollArea) {
        return false;
      }

      let tabButton = pickerRoot.querySelector('.stardance-utils-slack-picker-tab');
      let category = pickerRoot.querySelector('.stardance-utils-slack-category');

      const setSlackTabActive = (active) => {
        if (!tabButton) {
          return;
        }

        const bar = navRow.querySelector('.bar');
        navRow.querySelectorAll('button').forEach((button) => {
          button.setAttribute('aria-selected', button === tabButton && active ? 'true' : 'false');
          button.classList.toggle('stardance-utils-nav-tab-muted', active && button !== tabButton);
        });

        tabButton.setAttribute('aria-selected', active ? 'true' : 'false');
        tabButton.classList.toggle('is-active', active);

        if (bar && active) {
          bar.style.width = `${tabButton.offsetWidth}px`;
          bar.style.transform = `translateX(${tabButton.offsetLeft}px)`;
        }
      };

      const renderSlackCategory = () => {
        if (!category) {
          return;
        }

        const body = category.querySelector('.stardance-utils-slack-category-body');
        if (!body) {
          return;
        }

        body.textContent = '';

        const buildGrid = (items, label) => {
          if (!items.length) {
            return null;
          }

          const section = document.createElement('section');
          section.className = 'stardance-utils-slack-picker-section';

          if (label) {
            const title = document.createElement('div');
            title.className = 'sticky padding-small align-l stardance-utils-slack-picker-subhead';
            title.textContent = label;
            section.appendChild(title);
          }

          const grid = document.createElement('div');
          grid.className = 'stardance-utils-slack-picker-grid';
          items.forEach((emoji) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'flex flex-center flex-middle stardance-utils-slack-picker-emoji';
            item.setAttribute('title', `:${emoji.name}:`);
            item.setAttribute('aria-label', `:${emoji.name}:`);
            item.innerHTML = `<img src="${emoji.imageUrl}" alt=":${emoji.name}:" loading="lazy" />`;
            item.addEventListener('click', () => {
              insertSlackEmojiMarkdown(emoji);
              renderSlackCategory();
              emojiPopover.hidden = true;
            });
            grid.appendChild(item);
          });
          section.appendChild(grid);
          return section;
        };

        if (!allEmojis.length) {
          const empty = document.createElement('div');
          empty.className = 'padding-small align-l stardance-utils-slack-picker-empty';
          empty.textContent = 'Loading Slack emojis...';
          body.appendChild(empty);
          return;
        }

        const allSection = buildGrid(allEmojis, '');
        if (allSection) {
          body.appendChild(allSection);
        }
      };

      if (!tabButton) {
        tabButton = document.createElement('button');
        tabButton.type = 'button';
        tabButton.className = 'flex flex-center stardance-utils-slack-picker-tab';
        tabButton.setAttribute('aria-label', 'Slack emojis');
        tabButton.setAttribute('title', 'Slack emojis');
        tabButton.setAttribute('aria-selected', 'false');
        tabButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.8 122.8" aria-hidden="true" class="stardance-utils-slack-icon"><path fill="currentColor" d="M30.7 77.1c0 8.5-6.9 15.4-15.4 15.4S0 85.6 0 77.1s6.9-15.4 15.4-15.4h15.4v15.4zM38.5 77.1c0-8.5 6.9-15.4 15.4-15.4s15.4 6.9 15.4 15.4v38.4c0 8.5-6.9 15.4-15.4 15.4s-15.4-6.9-15.4-15.4V77.1zM53.9 30.7c-8.5 0-15.4-6.9-15.4-15.4S45.4 0 53.9 0s15.4 6.9 15.4 15.4v15.4H53.9zM53.9 38.5c8.5 0 15.4 6.9 15.4 15.4s-6.9 15.4-15.4 15.4H15.4C6.9 69.3 0 62.4 0 53.9s6.9-15.4 15.4-15.4h38.5zM92.1 53.9c0-8.5 6.9-15.4 15.4-15.4s15.4 6.9 15.4 15.4-6.9 15.4-15.4 15.4H92.1V53.9zM84.3 53.9c0 8.5-6.9 15.4-15.4 15.4s-15.4-6.9-15.4-15.4V15.4C53.5 6.9 60.4 0 68.9 0s15.4 6.9 15.4 15.4v38.5zM68.9 92.1c8.5 0 15.4 6.9 15.4 15.4s-6.9 15.4-15.4 15.4-15.4-6.9-15.4-15.4V92.1h15.4zM68.9 84.3c-8.5 0-15.4-6.9-15.4-15.4s6.9-15.4 15.4-15.4h38.5c8.5 0 15.4 6.9 15.4 15.4s-6.9 15.4-15.4 15.4H68.9z"/></svg>';
        tabButton.addEventListener('click', () => {
          setSlackTabActive(true);
          mountSlackPickerUI();
          scrollArea.scrollTop = Math.max(category?.offsetTop ?? 0, 0);
        });
        const bar = navRow.querySelector('.bar');
        navRow.insertBefore(tabButton, bar || null);

        navRow.querySelectorAll('button').forEach((button) => {
          if (button === tabButton) {
            return;
          }

          button.addEventListener('click', () => setSlackTabActive(false));
        });
      }

      if (!category) {
        category = document.createElement('div');
        category.className = 'category stardance-utils-slack-category';
        category.setAttribute('data-id', 'stardance-utils-slack');
        category.innerHTML = `
          <div class="sticky padding-small align-l">Slack emojis</div>
          <div class="relative stardance-utils-slack-category-body">
          </div>
        `;
        categoriesContainer.appendChild(category);
      }

      renderSlackCategory();
      return true;
    };

    const scheduleSlackPickerMount = () => {
      let attempts = 0;
      const tryMount = () => {
        attempts += 1;
        if (mountSlackPickerUI() || attempts > 12) {
          return;
        }
        window.setTimeout(tryMount, 120);
      };
      tryMount();
    };

    const pickerObserver = new MutationObserver(() => {
      scheduleSlackPickerMount();
    });
    pickerObserver.observe(emojiPopover, { childList: true, subtree: true });

    SU.fetchSlackEmojis().then((emojis) => {
      allEmojis = emojis;
      scheduleSlackPickerMount();
    });

    scheduleSlackPickerMount();
  };

  SU.enhanceDevlogSpeech = (composerSection) => {
    if (!composerSection || composerSection.getAttribute(SU.DEVLOG_SPEECH_ATTR) === 'true') {
      return;
    }

    const textarea = composerSection.querySelector('textarea[name="post_devlog[body]"]');
    if (!textarea) {
      return;
    }

    composerSection.setAttribute(SU.DEVLOG_SPEECH_ATTR, 'true');

    const submitGroup = composerSection.querySelector('.feed-composer__submit-group');
    if (!submitGroup) {
      return;
    }

    const speechWrap = document.createElement('div');
    speechWrap.className = 'stardance-utils-speech-wrap';

    const speechButton = document.createElement('button');
    speechButton.type = 'button';
    speechButton.className = 'feed-composer__tool-btn stardance-utils-speech-btn';
    speechButton.setAttribute('aria-pressed', 'false');
    speechButton.setAttribute('aria-label', 'Start speech to text');
    speechButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="stardance-utils-speech-icon"><path fill="currentColor" d="M12 3a3.5 3.5 0 0 0-3.5 3.5v5a3.5 3.5 0 1 0 7 0v-5A3.5 3.5 0 0 0 12 3Zm-5 8.25a.75.75 0 0 1 .75.75 4.25 4.25 0 1 0 8.5 0 .75.75 0 0 1 1.5 0 5.75 5.75 0 0 1-5 5.693V20h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2v-2.307a5.75 5.75 0 0 1-5-5.693.75.75 0 0 1 .75-.75Z"/></svg>';

    const speechStatus = document.createElement('span');
    speechStatus.className = 'stardance-utils-speech-status';
    speechStatus.setAttribute('aria-live', 'polite');
    speechStatus.textContent = '';

    speechWrap.appendChild(speechButton);
    speechWrap.appendChild(speechStatus);
    const submitButton = submitGroup.querySelector('button[type="submit"]');
    if (submitButton) {
      submitGroup.insertBefore(speechWrap, submitButton);
    } else {
      submitGroup.appendChild(speechWrap);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speechButton.disabled = true;
      speechStatus.textContent = 'Speech not supported in this browser';
      return;
    }

    let recognition = null;
    let isListening = false;
    let finalBuffer = '';
    let sessionBaseText = '';
    let sessionFinalText = '';
    let sessionInterimText = '';

    const setStatus = (message, mode = 'idle') => {
      speechStatus.textContent = message;
      speechStatus.setAttribute('data-mode', mode);
    };

    const setListening = (listening) => {
      isListening = listening;
      speechButton.setAttribute('aria-pressed', listening ? 'true' : 'false');
      speechButton.classList.toggle('is-listening', listening);
      speechButton.setAttribute('aria-label', listening ? 'Stop speech to text' : 'Start speech to text');
    };

    const getRecognition = () => {
      if (recognition) {
        return recognition;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        finalBuffer = '';
        sessionBaseText = textarea.value || '';
        sessionFinalText = '';
        sessionInterimText = '';
        setListening(true);
        setStatus('', 'listening');
      };

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const transcript = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalBuffer += `${transcript} `;
          } else {
            interim += transcript;
          }
        }

        if (finalBuffer.trim()) {
          const formattedFinal = SU.formatTranscriptChunk(finalBuffer, SU.composeTranscriptText(sessionBaseText, sessionFinalText, ''), true);
          sessionFinalText = SU.composeTranscriptText(sessionFinalText, formattedFinal, '');
          finalBuffer = '';
        }

        sessionInterimText = SU.formatTranscriptChunk(interim, SU.composeTranscriptText(sessionBaseText, sessionFinalText, ''), false);

        const nextValue = SU.finalizeTranscriptText(SU.composeTranscriptText(sessionBaseText, sessionFinalText, sessionInterimText));
        textarea.value = nextValue;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        setStatus('', 'listening');
      };

      recognition.onerror = (event) => {
        const code = event?.error;
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setStatus('Microphone permission denied', 'error');
        } else if (code === 'audio-capture') {
          setStatus('No microphone found', 'error');
        } else if (code === 'network') {
          setStatus('Speech service network issue', 'error');
        } else if (code === 'no-speech') {
          setStatus('No speech detected', 'warn');
        } else {
          setStatus('Speech to text unavailable', 'error');
        }
      };

      recognition.onend = () => {
        if (finalBuffer.trim()) {
          const formattedFinal = SU.formatTranscriptChunk(finalBuffer, SU.composeTranscriptText(sessionBaseText, sessionFinalText, ''), true);
          sessionFinalText = SU.composeTranscriptText(sessionFinalText, formattedFinal, '');
          finalBuffer = '';
        }
        const committedValue = SU.finalizeTranscriptText(SU.composeTranscriptText(sessionBaseText, sessionFinalText, ''));
        textarea.value = committedValue;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        setListening(false);
        setStatus('', 'idle');
      };

      return recognition;
    };

    speechButton.addEventListener('click', () => {
      const activeRecognition = getRecognition();
      if (!isListening) {
        textarea.focus();
        try {
          activeRecognition.start();
        } catch {
          setStatus('Could not start microphone', 'error');
        }
        return;
      }

      activeRecognition.stop();
    });
  };

  SU.mountInlineDevlogEditor = async (editLink) => {
    const href = editLink.getAttribute('href');
    if (!href) {
      return;
    }

    const host = editLink.closest('article.feed-post-card, article, li, .feed-item, .feed-card, section') || editLink.parentElement;
    if (!host || !host.parentNode) {
      window.location.href = href;
      return;
    }

    const existing = host.parentNode.querySelector(`[data-stardance-utils-inline-edit-for="${href}"]`);
    if (existing) {
      const originalId = existing.getAttribute('data-stardance-utils-inline-edit-host-id');
      const originalNode = originalId ? document.getElementById(originalId) : null;
      if (originalNode) {
        existing.replaceWith(originalNode);
      } else {
        existing.remove();
      }
      return;
    }

    const wrapper = document.createElement('section');
    wrapper.className = 'stardance-utils-inline-edit';
    wrapper.setAttribute('data-stardance-utils-inline-edit-for', href);
    if (host.id) {
      wrapper.setAttribute('data-stardance-utils-inline-edit-host-id', host.id);
    }
    wrapper.textContent = 'Loading editor...';
    host.replaceWith(wrapper);

    try {
      const response = await fetch(href, { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error(`Failed to load editor (${response.status})`);
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const editCard = doc.querySelector('.devlog-edit__card');
      if (!editCard) {
        throw new Error('Edit UI not found');
      }

      wrapper.textContent = '';

      const closeRow = document.createElement('div');
      closeRow.className = 'stardance-utils-inline-edit-close-row';
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'action-btn action-btn--small action-btn--secondary';
      closeButton.innerHTML = '<span class="action-btn__label">Close editor</span>';
      closeButton.addEventListener('click', () => wrapper.replaceWith(host));
      closeRow.appendChild(closeButton);

      const importedCard = document.importNode(editCard, true);
      importedCard.classList.add('stardance-utils-inline-edit-card');

      const cancelLink = importedCard.querySelector('.devlog-edit__actions a.action-btn');
      if (cancelLink) {
        cancelLink.setAttribute('href', '#');
        cancelLink.addEventListener('click', (event) => {
          event.preventDefault();
          wrapper.replaceWith(host);
        });
      }

      wrapper.appendChild(closeRow);
      wrapper.appendChild(importedCard);
    } catch {
      wrapper.replaceWith(host);
      window.location.href = href;
    }
  };

  SU.enhanceInlineDevlogEdit = (projectMain) => {
    const editLinks = projectMain.querySelectorAll('a[href*="/devlogs/"][href$="/edit"]');
    editLinks.forEach((editLink) => {
      if (editLink.getAttribute(SU.DEVLOG_INLINE_EDIT_LINK_ATTR) === 'true') {
        return;
      }

      editLink.setAttribute(SU.DEVLOG_INLINE_EDIT_LINK_ATTR, 'true');
      editLink.addEventListener('click', (event) => {
        event.preventDefault();
        SU.mountInlineDevlogEditor(editLink);
      });
    });
  };

  SU.enhanceProjectShowPage = () => {
    const projectMain = document.querySelector('.app-layout__main');
    const actionsNav = projectMain?.querySelector('.project-show__actions');
    const heroBanner = projectMain?.querySelector('.project-show__banner');
    const feedSection = projectMain?.querySelector('.project-show__feed');
    if (!projectMain || !heroBanner || !feedSection) {
      return;
    }

    const completeInfoLink = actionsNav?.querySelector('a.action-btn[href*="complete=true"]');
    completeInfoLink?.remove();

    const shipButton = [...(actionsNav?.querySelectorAll('.action-btn') ?? [])].find((button) =>
      button.textContent?.includes('Ship your project')
    );
    if (shipButton && !heroBanner.querySelector('[data-stardance-utils-hero-ship]')) {
      const shipClone = shipButton.cloneNode(true);
      shipClone.setAttribute('data-stardance-utils-hero-ship', 'true');
      shipClone.className = 'action-btn action-btn--secondary stardance-utils-hero-ship';
      shipClone.setAttribute('data-tooltip-position-value', 'bottom');

      const label = shipClone.querySelector('.action-btn__label');
      if (label) {
        label.textContent = 'Ship';
      }

      const trailingIcon = shipClone.querySelector('.action-btn__icon--trailing');
      if (trailingIcon) {
        trailingIcon.classList.remove('action-btn__icon--trailing');
        trailingIcon.classList.add('action-btn__icon--leading');
        shipClone.insertBefore(trailingIcon, shipClone.firstChild);
      }

      const iconLeading = shipClone.querySelector('.action-btn__icon--leading');
      if (!iconLeading) {
        const icon = shipClone.querySelector('.action-btn__icon');
        if (icon) {
          icon.classList.add('action-btn__icon--leading');
          shipClone.insertBefore(icon, shipClone.firstChild);
        }
      }

      heroBanner.appendChild(shipClone);
      shipButton.remove();
    }

    const pathMatch = window.location.pathname.match(/\/projects\/(\d+)/);
    const projectId = pathMatch?.[1] ?? null;

    const postDevlogButton = [...(actionsNav?.querySelectorAll('.action-btn') ?? [])].find((button) =>
      button.textContent?.includes('Post a devlog')
    );
    const modalMatch = postDevlogButton?.getAttribute('onclick')?.match(/composer-modal-(\d+)/);
    const modalId = modalMatch ? `composer-modal-${modalMatch[1]}` : null;

    const isDevlogComposer = (composer) => {
      const form = composer?.querySelector('.feed-composer__form');
      if (!form) {
        return false;
      }

      const action = form.getAttribute('action') || '';
      const bodyField = form.querySelector('textarea[name="post_devlog[body]"]');
      if (bodyField) {
        return true;
      }

      if (!action.includes('/devlogs')) {
        return false;
      }

      return projectId ? action.includes(`/projects/${projectId}/devlogs`) : true;
    };

    const composerDialog = (modalId ? document.getElementById(modalId) : null)
      ?? [...document.querySelectorAll('.composer-modal')].find((dialog) => {
        const composer = dialog.querySelector('.feed-composer');
        return isDevlogComposer(composer);
      });

    const composerSection = composerDialog?.querySelector('.feed-composer')
      ?? [...projectMain.querySelectorAll('.feed-composer')].find((composer) => isDevlogComposer(composer));
    const inlineComposerShell = projectMain.querySelector('.stardance-utils-inline-composer-shell');
    if (composerSection && composerSection.getAttribute(SU.INLINE_COMPOSER_ATTR) !== 'true' && !inlineComposerShell) {
      const composerShell = document.createElement('section');
      composerShell.className = 'stardance-utils-inline-composer-shell';

      const composerHeader = document.createElement('div');
      composerHeader.className = 'stardance-utils-inline-composer-header';

      const composerTitle = document.createElement('h2');
      composerTitle.className = 'stardance-utils-inline-composer-title';
      composerTitle.textContent = 'Post a devlog';

      composerHeader.appendChild(composerTitle);

      const chipsRow = composerSection.querySelector('.feed-composer__chips');
      chipsRow?.remove();

      composerSection.setAttribute(SU.INLINE_COMPOSER_ATTR, 'true');
      composerSection.classList.add('stardance-utils-inline-composer');

      composerShell.appendChild(composerHeader);
      composerShell.appendChild(composerSection);
      feedSection.parentNode.insertBefore(composerShell, feedSection);

      if (composerDialog) {
        composerDialog.removeAttribute('open');
        composerDialog.setAttribute('hidden', 'hidden');
        composerDialog.setAttribute('aria-hidden', 'true');
        composerDialog.classList.add('stardance-utils-hidden-dialog');
        document.body.appendChild(composerDialog);
      }
    }

    const activeInlineComposer = [...projectMain.querySelectorAll('.stardance-utils-inline-composer.feed-composer, .feed-composer')]
      .find((composer) => isDevlogComposer(composer));
    SU.bindDevlogDraftPersistence(activeInlineComposer);
    SU.enhanceSlackEmoji(activeInlineComposer);
    SU.enhanceDevlogSpeech(activeInlineComposer);
    SU.enhanceInlineDevlogEdit(projectMain);

    actionsNav?.remove();
  };
})();
