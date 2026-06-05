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

  SU.replaceTextareaSelection = (textarea, nextValue, nextStart = null, nextEnd = null) => {
    textarea.value = nextValue;
    if (typeof nextStart === 'number' && typeof nextEnd === 'number') {
      textarea.setSelectionRange(nextStart, nextEnd);
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  };

  SU.wrapTextareaSelection = (textarea, before, after = before, placeholder = 'text') => {
    const current = textarea.value || '';
    const start = textarea.selectionStart ?? current.length;
    const end = textarea.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const content = selected || placeholder;
    const nextValue = `${current.slice(0, start)}${before}${content}${after}${current.slice(end)}`;
    const contentStart = start + before.length;
    const contentEnd = contentStart + content.length;
    SU.replaceTextareaSelection(textarea, nextValue, selected ? contentStart : contentStart, selected ? contentEnd : contentEnd);
  };

  SU.prefixTextareaSelectionLines = (textarea, prefix) => {
    const current = textarea.value || '';
    const start = textarea.selectionStart ?? current.length;
    const end = textarea.selectionEnd ?? current.length;
    const hasSelection = start !== end;
    const lineStart = current.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineEnd = hasSelection ? end : current.indexOf('\n', start);
    const selectionEnd = lineEnd === -1 ? current.length : lineEnd;
    const target = current.slice(lineStart, selectionEnd);
    const prefixed = target
      .split('\n')
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join('\n');
    const nextValue = `${current.slice(0, lineStart)}${prefixed}${current.slice(selectionEnd)}`;
    SU.replaceTextareaSelection(textarea, nextValue, lineStart, lineStart + prefixed.length);
  };

  SU.insertMarkdownImage = (textarea) => {
    SU.wrapTextareaSelection(textarea, '![', '](https://)', 'alt text');
  };

  SU.insertMarkdownRule = (textarea) => {
    const current = textarea.value || '';
    const start = textarea.selectionStart ?? current.length;
    const before = current.slice(0, start);
    const after = current.slice(start);
    const prefix = before && !before.endsWith('\n') ? '\n' : '';
    const suffix = after && !after.startsWith('\n') ? '\n' : '';
    SU.insertTextAtCursor(textarea, `${prefix}---${suffix}`);
  };

  SU.escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  SU.renderInlineMarkdown = (text) => {
    let html = SU.escapeHtml(text);
    html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" />');
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    return html;
  };

  SU.renderMarkdownPreviewHtml = (raw, options = {}) => {
    if (!raw) {
      return '';
    }

    const richMedia = options.richMedia === true;
    const selectionStart = typeof options.selectionStart === 'number' ? options.selectionStart : null;
    const selectionEnd = typeof options.selectionEnd === 'number' ? options.selectionEnd : null;
    const isTokenActive = (offset, length) => {
      if (!richMedia || selectionStart === null || selectionEnd === null) {
        return false;
      }

      const tokenStart = offset;
      const tokenEnd = offset + length;
      if (selectionStart === selectionEnd) {
        return selectionStart >= tokenStart && selectionStart <= tokenEnd;
      }

      return selectionStart < tokenEnd && selectionEnd > tokenStart;
    };

    const collectTokens = (source, regex) => {
      const tokens = [];
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(source)) !== null) {
        tokens.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          active: isTokenActive(match.index, match[0].length)
        });
      }
      regex.lastIndex = 0;
      return tokens;
    };

    const imageTokens = collectTokens(raw, /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g);
    const linkTokens = collectTokens(raw, /(?<!\!)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g);
    const autolinkTokens = collectTokens(raw, /(?<!["'=\[(])(https?:\/\/[^\s<)]+)/g);
    const editingRichMediaToken = [...imageTokens, ...linkTokens, ...autolinkTokens].some((token) => token.active);
    let imageTokenIndex = 0;
    let linkTokenIndex = 0;
    let autolinkTokenIndex = 0;

    let html = SU.escapeHtml(raw.replace(/\r\n/g, '\n'));
    const stashed = [];
    const stash = (value) => `\uE000${stashed.push(value) - 1}\uE001`;

    html = html.replace(/```([^\n`]*)\n([\s\S]*?)\n```/g, (_match, language, body) => {
      const header = language?.trim() ? ` ${SU.escapeHtml(language.trim())}` : '';
      const bodyHtml = SU.escapeHtml(body).replace(/\n/g, '<br>');
      return stash(`<span class="stardance-utils-md-codeblock"><span class="stardance-utils-md-syntax">&#96;&#96;&#96;${header}</span><br><span class="stardance-utils-md-codeblock-body">${bodyHtml}</span><br><span class="stardance-utils-md-syntax">&#96;&#96;&#96;</span></span>`);
    });

    html = html.replace(/^((?: {4}|\t).+)$/gm, (_match, line) => {
      return stash(`<span class="stardance-utils-md-codeblock-line">${line}</span>`);
    });

    html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_match, alt, url) => {
      const token = imageTokens[imageTokenIndex];
      imageTokenIndex += 1;
      if (editingRichMediaToken || token?.active) {
        return stash(`<span class="stardance-utils-md-image"><span class="stardance-utils-md-syntax">![</span>${alt}<span class="stardance-utils-md-syntax">](</span><span class="stardance-utils-md-url">${url}</span><span class="stardance-utils-md-syntax">)</span></span>`);
      }
      return stash(`<span class="stardance-utils-md-rich-token stardance-utils-md-image-render" data-token-start="${token?.start ?? 0}" data-token-end="${token?.end ?? 0}"><img src="${url}" alt="${alt}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>`);
    });

    html = html.replace(/(?<!\!)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, text, url) => {
      const token = linkTokens[linkTokenIndex];
      linkTokenIndex += 1;
      if (editingRichMediaToken || token?.active) {
        return stash(`<span class="stardance-utils-md-link"><span class="stardance-utils-md-syntax">[</span>${text}<span class="stardance-utils-md-syntax">](</span><span class="stardance-utils-md-url">${url}</span><span class="stardance-utils-md-syntax">)</span></span>`);
      }
      return stash(`<span class="stardance-utils-md-rich-token stardance-utils-md-link-render" data-token-start="${token?.start ?? 0}" data-token-end="${token?.end ?? 0}"><a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a></span>`);
    });

    html = html.replace(/&lt;(u|mark|sub|sup)&gt;([\s\S]*?)&lt;\/\1&gt;/g, (_match, tag, content) => {
      return stash(`<span class="stardance-utils-md-${tag}"><span class="stardance-utils-md-syntax">&lt;${tag}&gt;</span>${content}<span class="stardance-utils-md-syntax">&lt;/${tag}&gt;</span></span>`);
    });

    html = html.replace(/^((?:\*\*\*|---|___))$/gm, '<span class="stardance-utils-md-rule"><span class="stardance-utils-md-syntax">$1</span></span>');

    html = html.replace(/^(#{1,6}) (.+)$/gm, (_match, hashes, text) => {
      const level = hashes.length;
      return `<span class="stardance-utils-md-line stardance-utils-md-heading stardance-utils-md-heading-${level}"><span class="stardance-utils-md-syntax">${hashes} </span>${text}</span>`;
    });

    html = html.replace(/^([ \t]*)([*\-]) (.+)$/gm, (_match, indent, marker, text) => {
      return `${indent}<span class="stardance-utils-md-line stardance-utils-md-list-item"><span class="stardance-utils-md-syntax stardance-utils-md-bullet">${marker}</span> ${text}</span>`;
    });

    html = html.replace(/^([ \t]*)(\d+)\. (.+)$/gm, (_match, indent, number, text) => {
      return `${indent}<span class="stardance-utils-md-line stardance-utils-md-list-item"><span class="stardance-utils-md-syntax">${number}.</span> ${text}</span>`;
    });

    html = html.replace(/^> ?(.+)$/gm, '<span class="stardance-utils-md-line stardance-utils-md-quote"><span class="stardance-utils-md-syntax">&gt; </span>$1</span>');

    html = html.replace(/~~(.+?)~~/g, '<span class="stardance-utils-md-strike"><span class="stardance-utils-md-syntax">~~</span><del>$1</del><span class="stardance-utils-md-syntax">~~</span></span>');
    html = html.replace(/(\*{3}|_{3})(.+?)\1/g, '<span class="stardance-utils-md-bold stardance-utils-md-italic"><span class="stardance-utils-md-syntax">$1</span><strong><em>$2</em></strong><span class="stardance-utils-md-syntax">$1</span></span>');
    html = html.replace(/(\*{2}|_{2})(.+?)\1/g, '<span class="stardance-utils-md-bold"><span class="stardance-utils-md-syntax">$1</span><strong>$2</strong><span class="stardance-utils-md-syntax">$1</span></span>');
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<span class="stardance-utils-md-italic"><span class="stardance-utils-md-syntax">*</span><em>$1</em><span class="stardance-utils-md-syntax">*</span></span>');
    html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<span class="stardance-utils-md-italic"><span class="stardance-utils-md-syntax">_</span><em>$1</em><span class="stardance-utils-md-syntax">_</span></span>');
    html = html.replace(/`([^`]+)`/g, '<span class="stardance-utils-md-code"><span class="stardance-utils-md-syntax">`</span><code>$1</code><span class="stardance-utils-md-syntax">`</span></span>');

    html = html.replace(/(?<!["'=\[(])(https?:\/\/[^\s<)]+)/g, (_match, url) => {
      const token = autolinkTokens[autolinkTokenIndex];
      autolinkTokenIndex += 1;
      if (editingRichMediaToken || token?.active) {
        return `<span class="stardance-utils-md-autolink stardance-utils-md-url">${url}</span>`;
      }
      return `<span class="stardance-utils-md-rich-token stardance-utils-md-link-render stardance-utils-md-autolink" data-token-start="${token?.start ?? 0}" data-token-end="${token?.end ?? 0}"><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></span>`;
    });

    html = html.replace(/\n/g, '<br>');
    html = html.replace(/\uE000(\d+)\uE001/g, (_match, index) => stashed[Number(index)] || '');
    return html;
  };

  SU.selectionTouchesMarkdownSyntax = (raw, selectionStart, selectionEnd) => {
    if (typeof selectionStart !== 'number' || typeof selectionEnd !== 'number') {
      return false;
    }

    const overlaps = (start, length) => {
      const end = start + length;
      if (selectionStart === selectionEnd) {
        return selectionStart >= start && selectionStart <= end;
      }
      return selectionStart < end && selectionEnd > start;
    };

    const tokenPatterns = [
      /^#{1,6}\s.+$/gm,
      /^(?:[ \t]*)(?:[*\-]|\d+\.)\s.+$/gm,
      /^>\s?.+$/gm,
      /(?:\*\*|__)[^\n]+?(?:\*\*|__)/g,
      /(?:\*|_)[^\n]+?(?:\*|_)/g,
      /~~[^\n]+?~~/g,
      /`[^`]+`/g,
      /```[^\n`]*\n[\s\S]*?\n```/g,
      /^((?: {4}|\t).+)$/gm,
      /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g,
      /(?<!\!)\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/g,
      /(?<!["'=\[(])(https?:\/\/[^\s<)]+)/g,
      /^((?:\*\*\*|---|___))$/gm,
      /&lt;(?:u|mark|sub|sup)&gt;[\s\S]*?&lt;\/(?:u|mark|sub|sup)&gt;/g
    ];

    return tokenPatterns.some((pattern) => {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(raw)) !== null) {
        if (overlaps(match.index, match[0].length)) {
          return true;
        }
      }
      return false;
    });
  };

  SU.mountMarkdownPreview = (composerSection, textarea) => {
    if (!composerSection || !textarea || composerSection.getAttribute('data-stardance-utils-markdown-preview') === 'true') {
      return;
    }

    composerSection.setAttribute('data-stardance-utils-markdown-preview', 'true');

    const field = textarea.closest('.feed-composer__field');
    if (!field) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'stardance-utils-markdown-preview-wrap';

    const preview = document.createElement('div');
    preview.className = 'stardance-utils-markdown-live-preview';
    preview.setAttribute('aria-hidden', 'true');

    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(preview);
    wrapper.appendChild(textarea);

    const syncStyles = () => {
      const computed = window.getComputedStyle(textarea);
      const props = [
        'fontSize',
        'fontFamily',
        'fontWeight',
        'lineHeight',
        'letterSpacing',
        'paddingTop',
        'paddingLeft',
        'paddingRight',
        'paddingBottom',
        'boxSizing',
        'textAlign',
        'wordBreak',
        'overflowWrap',
        'whiteSpace',
        'borderTopWidth',
        'borderRightWidth',
        'borderBottomWidth',
        'borderLeftWidth'
      ];

      props.forEach((prop) => {
        preview.style[prop] = computed[prop];
      });

      preview.style.width = `${textarea.clientWidth}px`;
      preview.style.minHeight = `${textarea.clientHeight}px`;
    };

    const syncHeight = () => {
      const nextHeight = Math.max(textarea.scrollHeight, preview.scrollHeight, textarea.clientHeight, 30);
      wrapper.style.minHeight = `${nextHeight}px`;
      textarea.style.minHeight = `${nextHeight}px`;
      preview.style.minHeight = `${nextHeight}px`;
    };

    const syncScroll = () => {
      preview.scrollTop = textarea.scrollTop;
      preview.scrollLeft = textarea.scrollLeft;
    };

    const syncPreview = () => {
      const value = textarea.value || '';
      const isFocused = document.activeElement === textarea;
      const editingMarkdownSyntax = isFocused && SU.selectionTouchesMarkdownSyntax(
        value,
        textarea.selectionStart ?? 0,
        textarea.selectionEnd ?? 0
      );
      if (!value.trim()) {
        preview.hidden = true;
        wrapper.classList.remove('is-active');
        wrapper.classList.toggle('is-focused', isFocused);
        syncHeight();
        return;
      }

      if (editingMarkdownSyntax) {
        preview.hidden = true;
        wrapper.classList.remove('is-active');
        wrapper.classList.toggle('is-focused', isFocused);
        syncHeight();
        return;
      }

      preview.hidden = false;
      preview.innerHTML = SU.renderMarkdownPreviewHtml(value, {
        richMedia: !isFocused,
        selectionStart: null,
        selectionEnd: null
      });
      wrapper.classList.add('is-active');
      wrapper.classList.toggle('is-focused', isFocused);
      preview.querySelectorAll('img').forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', syncHeight, { once: true });
        }
      });
      syncHeight();
      syncScroll();
    };

    textarea.addEventListener('input', syncPreview);
    textarea.addEventListener('scroll', syncScroll);
    textarea.addEventListener('focus', syncPreview);
    textarea.addEventListener('click', syncPreview);
    textarea.addEventListener('keyup', syncPreview);
    textarea.addEventListener('select', syncPreview);
    textarea.addEventListener('blur', () => requestAnimationFrame(syncPreview));

    preview.addEventListener('mousedown', (event) => {
      event.preventDefault();
      const token = event.target.closest('.stardance-utils-md-rich-token');
      if (token) {
        const start = Number.parseInt(token.getAttribute('data-token-start') || '0', 10);
        textarea.focus();
        textarea.setSelectionRange(start, start);
        syncPreview();
        return;
      }

      textarea.focus();
    });

    const observer = new ResizeObserver(() => {
      syncStyles();
      syncHeight();
      syncScroll();
    });
    observer.observe(textarea);

    syncStyles();
    syncPreview();
  };

  SU.mountMarkdownToolbar = (composerSection, textarea) => {
    if (!composerSection || !textarea || composerSection.getAttribute('data-stardance-utils-markdown-toolbar') === 'true') {
      return;
    }

    composerSection.setAttribute('data-stardance-utils-markdown-toolbar', 'true');

    const toolbar = document.createElement('div');
    toolbar.className = 'stardance-utils-markdown-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Markdown formatting');

    const iconMap = {
      bold: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path d="M5 3.5h3.7c1.7 0 2.8.9 2.8 2.3 0 1-.6 1.7-1.5 2 1.2.2 2 1.1 2 2.3 0 1.6-1.3 2.7-3.3 2.7H5zM6.8 5v2.2h1.7c.8 0 1.3-.4 1.3-1.1 0-.7-.5-1.1-1.3-1.1zm0 3.7V11h2c.9 0 1.5-.4 1.5-1.2 0-.7-.6-1.1-1.5-1.1z" fill="currentColor"/></svg>',
      italic: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path d="M6 3.5h6.5v1.4H10l-2.1 6.2h2.6v1.4H4v-1.4h2.2L8.3 4.9H6z" fill="currentColor"/></svg>',
      bullets: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><circle cx="3" cy="4.75" r="1.1" fill="currentColor"/><circle cx="3" cy="8" r="1.1" fill="currentColor"/><circle cx="3" cy="11.25" r="1.1" fill="currentColor"/><path d="M6 4.75h6.5M6 8h6.5M6 11.25h6.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>',
      numbered: '<svg viewBox="0 0 640 640" aria-hidden="true" fill="none"><path d="M64 136C64 122.8 74.7 112 88 112L136 112C149.3 112 160 122.7 160 136L160 240L184 240C197.3 240 208 250.7 208 264C208 277.3 197.3 288 184 288L88 288C74.7 288 64 277.3 64 264C64 250.7 74.7 240 88 240L112 240L112 160L88 160C74.7 160 64 149.3 64 136zM94.4 365.2C105.8 356.6 119.7 352 134 352L138.9 352C172.6 352 200 379.4 200 413.1C200 432.7 190.6 451 174.8 462.5L150.8 480L184 480C197.3 480 208 490.7 208 504C208 517.3 197.3 528 184 528L93.3 528C77.1 528 64 514.9 64 498.7C64 489.3 68.5 480.5 76.1 475L146.6 423.7C150 421.2 152 417.3 152 413.1C152 405.9 146.1 400 138.9 400L134 400C130.1 400 126.3 401.3 123.2 403.6L102.4 419.2C91.8 427.2 76.8 425 68.8 414.4C60.8 403.8 63 388.8 73.6 380.8L94.4 365.2zM288 128L544 128C561.7 128 576 142.3 576 160C576 177.7 561.7 192 544 192L288 192C270.3 192 256 177.7 256 160C256 142.3 270.3 128 288 128zM288 288L544 288C561.7 288 576 302.3 576 320C576 337.7 561.7 352 544 352L288 352C270.3 352 256 337.7 256 320C256 302.3 270.3 288 288 288zM288 448L544 448C561.7 448 576 462.3 576 480C576 497.7 561.7 512 544 512L288 512C270.3 512 256 497.7 256 480C256 462.3 270.3 448 288 448z" fill="currentColor"/></svg>',
      link: '<svg viewBox="0 0 640 640" aria-hidden="true" fill="none"><path d="M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z" fill="currentColor"/></svg>',
      image: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><rect x="2.25" y="3" width="11.5" height="10" rx="1.8" stroke="currentColor" stroke-width="1.3"/><circle cx="10.7" cy="5.9" r="1.1" fill="currentColor"/><path d="m3.9 11 2.9-3 2.15 2.15 1.35-1.35L12.1 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      rule: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path d="M2.5 8h11" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/><path d="M2.5 5.3h2" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" opacity="0.45"/><path d="M11.5 10.7h2" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" opacity="0.45"/></svg>'
    };

    const createGroup = () => {
      const group = document.createElement('div');
      group.className = 'stardance-utils-markdown-toolbar-group';
      toolbar.appendChild(group);
      return group;
    };

    let toolbarGroup = createGroup();

    const addButton = (content, title, onClick, emphasized = false, isIcon = false) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stardance-utils-markdown-toolbar-btn';
      if (emphasized) {
        button.classList.add('stardance-utils-markdown-toolbar-btn--emphasized');
      }
      button.setAttribute('aria-label', title);
      button.title = title;
      if (isIcon) {
        button.classList.add('stardance-utils-markdown-toolbar-btn--icon');
        button.innerHTML = `<span class="stardance-utils-markdown-toolbar-icon">${content}</span>`;
      } else {
        button.textContent = content;
      }
      button.addEventListener('mousedown', (event) => {
        event.preventDefault();
      });
      button.addEventListener('click', onClick);
      toolbarGroup.appendChild(button);
    };

    addButton(iconMap.bold, 'Bold', () => SU.wrapTextareaSelection(textarea, '**', '**'), false, true);
    addButton(iconMap.italic, 'Italic', () => SU.wrapTextareaSelection(textarea, '_', '_'), false, true);

    toolbarGroup = createGroup();
    addButton('H1', 'Heading 1', () => SU.prefixTextareaSelectionLines(textarea, '# '));
    addButton('H2', 'Heading 2', () => SU.prefixTextareaSelectionLines(textarea, '## '));
    addButton('H3', 'Heading 3', () => SU.prefixTextareaSelectionLines(textarea, '### '));

    toolbarGroup = createGroup();
    addButton(iconMap.bullets, 'Bulleted list', () => SU.prefixTextareaSelectionLines(textarea, '- '), false, true);
    addButton(iconMap.numbered, 'Numbered list', () => SU.prefixTextareaSelectionLines(textarea, '1. '), false, true);

    toolbarGroup = createGroup();
    addButton(iconMap.link, 'Link', () => SU.wrapTextareaSelection(textarea, '[', '](https://)', 'text'), true, true);
    addButton(iconMap.image, 'Image', () => SU.insertMarkdownImage(textarea), false, true);
    addButton(iconMap.rule, 'Horizontal rule', () => SU.insertMarkdownRule(textarea), false, true);

    const field = textarea.closest('.feed-composer__field');
    const composerMain = composerSection.querySelector('.feed-composer__main');
    const composerScroll = composerSection.querySelector('.feed-composer__scroll');
    if (field) {
      field.classList.add('stardance-utils-markdown-field');
      const label = field.querySelector('.feed-composer__label');
      if (label) {
        label.classList.add('stardance-utils-markdown-field-label');
      }
    }

    if (composerScroll && composerMain) {
      composerScroll.insertBefore(toolbar, composerMain);
    } else if (field) {
      field.insertBefore(toolbar, field.firstChild);
    } else {
      textarea.insertAdjacentElement('beforebegin', toolbar);
    }

    const alignToolbarToField = () => {
      if (!field) {
        return;
      }

      const parentRect = toolbar.parentElement?.getBoundingClientRect();
      const fieldRect = field.getBoundingClientRect();
      if (!parentRect) {
        return;
      }

      const textareaStyles = window.getComputedStyle(textarea);
      const paddingLeft = Number.parseFloat(textareaStyles.paddingLeft || '0') || 0;
      const paddingRight = Number.parseFloat(textareaStyles.paddingRight || '0') || 0;
      const offset = Math.max(0, (fieldRect.left - parentRect.left) + paddingLeft);
      const width = Math.max(0, fieldRect.width - paddingLeft - paddingRight);
      toolbar.style.setProperty('--stardance-utils-markdown-offset', `${offset}px`);
      toolbar.style.setProperty('--stardance-utils-markdown-width', `${width}px`);
    };

    requestAnimationFrame(alignToolbarToField);
    if (globalThis.ResizeObserver && field) {
      const observer = new ResizeObserver(alignToolbarToField);
      observer.observe(field);
      observer.observe(composerSection);
    }
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
    SU.mountMarkdownToolbar(composerSection, textarea);
    SU.mountMarkdownPreview(composerSection, textarea);

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

  SU.getProfileProjectList = () => document.querySelector('.profile-tab-content[aria-label="Projects"] .project-list, .profile-tab-content .project-list');

  SU.getProfileProjectId = (item) => {
    const href = item?.querySelector('a.profile-project-card[href^="/projects/"]')?.getAttribute('href') || '';
    const match = href.match(/\/projects\/(\d+)/);
    return match?.[1] ?? null;
  };

  SU.normalizePinnedProjectIds = (ids, availableIds = null) => {
    const seen = new Set();
    const availableSet = Array.isArray(availableIds) ? new Set(availableIds) : null;

    return (Array.isArray(ids) ? ids : []).reduce((acc, id) => {
      if (typeof id !== 'string' || !id || seen.has(id)) {
        return acc;
      }

      if (availableSet && !availableSet.has(id)) {
        return acc;
      }

      seen.add(id);
      acc.push(id);
      return acc;
    }, []);
  };

  SU.updateProfileProjectPinButtons = (list) => {
    const pinnedIds = new Set(SU.savedPinnedProjectIds);

    list.querySelectorAll('.project-list__item').forEach((item) => {
      const projectId = SU.getProfileProjectId(item);
      if (!projectId) {
        return;
      }

      let button = item.querySelector('[data-stardance-utils-project-pin]');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'profile-project-card__pin';
        button.setAttribute('data-stardance-utils-project-pin', 'true');
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path fill="currentColor" d="M160 96C160 78.3 174.3 64 192 64L448 64C465.7 64 480 78.3 480 96C480 113.7 465.7 128 448 128L418.5 128L428.8 262.1C465.9 283.3 494.6 318.5 507 361.8L510.8 375.2C513.6 384.9 511.6 395.2 505.6 403.3C499.6 411.4 490 416 480 416L160 416C150 416 140.5 411.3 134.5 403.3C128.5 395.3 126.5 384.9 129.3 375.2L133 361.8C145.4 318.5 174 283.3 211.2 262.1L221.5 128L192 128C174.3 128 160 113.7 160 96zM288 464L352 464L352 576C352 593.7 337.7 608 320 608C302.3 608 288 593.7 288 576L288 464z"/></svg>';
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          SU.toggleProfileProjectPin(projectId);
        });
        item.appendChild(button);
      }

      const isPinned = pinnedIds.has(projectId);
      button.classList.toggle('is-pinned', isPinned);
      button.setAttribute('aria-label', isPinned ? 'Unpin project' : 'Pin project');
      button.setAttribute('aria-pressed', String(isPinned));
      button.title = isPinned ? 'Unpin project' : 'Pin project';
    });
  };

  SU.toggleProfileProjectPin = async (projectId) => {
    if (!projectId) {
      return;
    }

    const current = SU.normalizePinnedProjectIds(SU.savedPinnedProjectIds);
    const next = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [projectId, ...current];

    SU.savedPinnedProjectIds = next;
    await SU.setStoredSetting({ [SU.PROJECT_PINNED_IDS_KEY]: next });
    SU.applyProfileProjectPins();
  };

  SU.applyProfileProjectPins = () => {
    const list = SU.getProfileProjectList();
    if (!list) {
      return;
    }

    if (list.getAttribute('data-stardance-utils-project-pins-busy') === 'true') {
      return;
    }

    list.setAttribute('data-stardance-utils-project-pins-busy', 'true');

    const items = [...list.querySelectorAll('.project-list__item')];
    const projectIds = items.map((item) => SU.getProfileProjectId(item)).filter(Boolean);
    const pinnedIds = SU.normalizePinnedProjectIds(SU.savedPinnedProjectIds, projectIds);
    const pinnedSet = new Set(pinnedIds);
    const pinnedItems = [];
    const unpinnedItems = [];
    const specialItems = [];

    items.forEach((item) => {
      const projectId = SU.getProfileProjectId(item);
      if (!projectId) {
        specialItems.push(item);
        return;
      }

      if (pinnedSet.has(projectId)) {
        pinnedItems.push(item);
        return;
      }

      unpinnedItems.push(item);
    });

    if (pinnedIds.join('|') !== SU.savedPinnedProjectIds.join('|')) {
      SU.savedPinnedProjectIds = pinnedIds;
      void SU.setStoredSetting({ [SU.PROJECT_PINNED_IDS_KEY]: pinnedIds });
    }

    [...pinnedItems, ...unpinnedItems, ...specialItems].forEach((item) => list.appendChild(item));
    SU.updateProfileProjectPinButtons(list);

    setTimeout(() => {
      if (list.getAttribute('data-stardance-utils-project-pins-busy') === 'true') {
        list.removeAttribute('data-stardance-utils-project-pins-busy');
      }
    }, 0);
  };

  SU.enhanceProfileProjectsPage = () => {
    const list = SU.getProfileProjectList();
    if (!list) {
      return;
    }

    if (list.getAttribute('data-stardance-utils-project-pins-busy') === 'true') {
      return;
    }

    list.setAttribute('data-stardance-utils-project-pins', 'true');
    SU.applyProfileProjectPins();
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
