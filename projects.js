(() => {
  const SU = globalThis.StardanceUtils;
  const DEVLOG_BODY_COLLAPSE_ATTR = 'data-stardance-utils-devlog-body-collapse';
  const DEVLOG_BODY_COLLAPSE_BUTTON_ATTR = 'data-stardance-utils-devlog-body-collapse-button';
  const DEVLOG_BODY_COLLAPSED_CLASS = 'stardance-utils-devlog-body--collapsed';
  const DEVLOG_BODY_EXPANDED_CLASS = 'stardance-utils-devlog-body--expanded';
  const DEVLOG_BODY_HIDDEN_CLASS = 'stardance-utils-devlog-body-hidden';
  const DEVLOG_BODY_COLLAPSE_MIN_HEIGHT = 520;
  const DEVLOG_BODY_COLLAPSED_HEIGHT = 420;

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

  SU.getSafeSlackEmojiImageUrl = (value) => {
    try {
      const url = new URL(value, window.location.origin);
      return url.protocol === 'https:' ? url.toString() : '';
    } catch {
      return '';
    }
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
    if (!composerSection || !textarea) {
      return;
    }

    const wrapper = textarea.closest('.stardance-utils-markdown-preview-wrap');
    if (wrapper) {
      wrapper.parentNode?.insertBefore(textarea, wrapper);
      wrapper.remove();
    }

    textarea.style.minHeight = '';
    composerSection.removeAttribute('data-stardance-utils-markdown-preview');
    return;
  };

  SU.mountMarkdownToolbar = (composerSection, textarea) => {
    if (!composerSection || !textarea) {
      return;
    }

    const usesNativeMarkdownPreview = (composerSection.getAttribute('data-controller') || '').includes('markdown-preview');
    const writePanel = composerSection.querySelector('[data-markdown-preview-target="writePanel"]');
    const existingToolbar = composerSection.querySelector('.stardance-utils-markdown-toolbar');
    if (existingToolbar) {
      if (usesNativeMarkdownPreview && writePanel && existingToolbar.parentElement !== writePanel) {
        writePanel.insertBefore(existingToolbar, writePanel.firstChild);
        existingToolbar.style.setProperty('--stardance-utils-markdown-offset', '0px');
        existingToolbar.style.setProperty('--stardance-utils-markdown-width', '100%');
      }
      composerSection.setAttribute('data-stardance-utils-markdown-toolbar', 'true');
      return;
    }

    if (composerSection.getAttribute('data-stardance-utils-markdown-toolbar') === 'true') {
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

    if (usesNativeMarkdownPreview && writePanel) {
      writePanel.insertBefore(toolbar, writePanel.firstChild);
      toolbar.style.setProperty('--stardance-utils-markdown-offset', '0px');
      toolbar.style.setProperty('--stardance-utils-markdown-width', '100%');
    } else if (composerScroll && composerMain) {
      composerScroll.insertBefore(toolbar, composerMain);
    } else if (field) {
      field.insertBefore(toolbar, field.firstChild);
    } else {
      textarea.insertAdjacentElement('beforebegin', toolbar);
    }

    const alignToolbarToField = () => {
      if (!field || usesNativeMarkdownPreview) {
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

  SU.persistDevlogDraftValue = (form, value) => {
    const draftKey = SU.getDevlogDraftKey(form);
    return SU.setLocalOnlyStoredValue(draftKey, (value || '').trim() ? value : '', draftKey).catch(() => undefined);
  };

  SU.cleanupLegacySlackEmojiEnhancements = (composerSection) => {
    if (!composerSection) {
      return;
    }

    const emojiPopover = composerSection.querySelector('[data-emoji-picker-target="popover"]');
    composerSection.querySelectorAll('.stardance-utils-emoji-autocomplete').forEach((node) => node.remove());

    const picker = emojiPopover?.querySelector('em-emoji-picker');
    const pickerRoot = picker?.shadowRoot || picker;
    pickerRoot?.querySelectorAll('.stardance-utils-slack-picker-tab, .stardance-utils-slack-category').forEach((node) => node.remove());
    composerSection.removeAttribute(SU.DEVLOG_SLACK_EMOJI_ATTR);
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
    SU.cleanupLegacySlackEmojiEnhancements(composerSection);

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

    void SU.getLocalOnlyStoredValue(draftKey, draftKey).then((savedDraft) => {
      if (savedDraft && !textarea.value.trim()) {
        textarea.value = savedDraft;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }).catch(() => undefined);

    syncDraftControls();

    let saveTimer = null;
    const persistDraft = () => {
      void SU.persistDevlogDraftValue(form, textarea.value || '');
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
      void SU.removeLocalOnlyStoredValue(draftKey, draftKey).catch(() => undefined);
      syncDraftControls();
      textarea.focus();
    });

    form.addEventListener('submit', () => {
      const activeSubmitButton = form.querySelector('button[type="submit"]');
      const isDisabled = activeSubmitButton?.disabled || activeSubmitButton?.getAttribute('aria-disabled') === 'true';
      if (isDisabled) {
        return;
      }

      void SU.removeLocalOnlyStoredValue(draftKey, draftKey).catch(() => undefined);
    });
  };

  SU.enhanceSlackEmoji = (composerSection) => {
    SU.cleanupLegacySlackEmojiEnhancements(composerSection);
  };

  SU.enhanceDevlogSpeech = (composerSection) => {
    if (!composerSection || composerSection.getAttribute(SU.DEVLOG_SPEECH_ATTR) === 'true') {
      return;
    }

    const textarea = composerSection.querySelector('textarea[name="post_devlog[body]"]');
    if (!textarea) {
      return;
    }

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

    composerSection.setAttribute(SU.DEVLOG_SPEECH_ATTR, 'true');

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

  SU.DEVLOG_CHANGELOG_FORMAT_OPTIONS = [
    { value: 'message', label: 'Commit message only' },
    { value: 'message-hash', label: 'Commit message (hash)' },
    { value: 'hash', label: 'Hash only' },
    { value: 'hash-message', label: '(Hash) commit message' }
  ];

  SU.getValidDevlogChangelogFormat = (value) => (
    SU.DEVLOG_CHANGELOG_FORMAT_OPTIONS.some((option) => option.value === value) ? value : 'hash'
  );

  SU.renderDevlogChangelogFormatOptions = (select, selectedValue = SU.savedDevlogChangelogFormat) => {
    if (!select) {
      return;
    }

    select.replaceChildren();
    SU.DEVLOG_CHANGELOG_FORMAT_OPTIONS.forEach((optionData) => {
      const option = document.createElement('option');
      option.value = optionData.value;
      option.textContent = optionData.label;
      option.selected = optionData.value === selectedValue;
      select.appendChild(option);
    });
  };

  SU.setDevlogChangelogFormat = async (value) => {
    SU.savedDevlogChangelogFormat = SU.getValidDevlogChangelogFormat(value);
    await SU.setStoredSetting({ [SU.DEVLOG_CHANGELOG_FORMAT_KEY]: SU.savedDevlogChangelogFormat });
    SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
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

  SU.PROJECT_CHANGELOG_REPO_KEY_PREFIX = 'projectRepoUrl:';

  SU.projectChangelogCache = SU.projectChangelogCache || new Map();
  SU.projectChangelogInflight = SU.projectChangelogInflight || new Map();

  SU.getProjectChangelogPanel = (projectMain) => (
    projectMain?.querySelector('[data-stardance-utils-changelog="true"]') || null
  );

  SU.removeProjectChangelogPanel = (projectMain) => {
    SU.getProjectChangelogPanel(projectMain)?.remove();
  };

  SU.getLatestProjectDevlogTimestamp = (projectMain) => (
    SU.compactText(projectMain?.querySelector('.project-show__feed article.feed-post-card time.feed-post-card__time[datetime]')?.getAttribute('datetime')) || null
  );

  SU.getProjectChangelogStorageKey = (projectId) => `${SU.PROJECT_CHANGELOG_REPO_KEY_PREFIX}${projectId}`;

  SU.normalizeGithubRepoInfo = (value) => {
    if (!value) {
      return null;
    }

    try {
      const url = new URL(value, window.location.origin);
      if (!/(^|\.)github\.com$/i.test(url.hostname)) {
        return null;
      }

      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length < 2) {
        return null;
      }

      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/i, '');
      if (!owner || !repo) {
        return null;
      }

      return {
        owner,
        repo,
        fullName: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`
      };
    } catch {
      return null;
    }
  };

  SU.getProjectGithubRepoFromDom = (projectMain) => {
    const editInputRepo = SU.normalizeGithubRepoInfo(projectMain?.querySelector('#project_repo_url')?.value);
    if (editInputRepo) {
      return editInputRepo;
    }

    const links = [...(projectMain?.querySelectorAll('a[href*="github.com"]') || [])]
      .map((link) => SU.normalizeGithubRepoInfo(link.getAttribute('href')))
      .filter(Boolean);
    if (!links.length) {
      return null;
    }

    links.sort((left, right) => left.url.length - right.url.length);
    return links[0];
  };

  SU.fetchProjectGithubRepo = async (projectId, projectMain) => {
    const direct = SU.getProjectGithubRepoFromDom(projectMain);
    if (direct) {
      await SU.setLocalOnlyStoredValue(SU.getProjectChangelogStorageKey(projectId), direct.url).catch(() => undefined);
      return direct;
    }

    try {
      const response = await fetch(`/projects/${projectId}?editing=true`, { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error('Could not load project edit page');
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fetched = SU.normalizeGithubRepoInfo(doc.querySelector('#project_repo_url')?.value);
      if (fetched) {
        await SU.setLocalOnlyStoredValue(SU.getProjectChangelogStorageKey(projectId), fetched.url).catch(() => undefined);
      }
      return fetched;
    } catch {
      const cachedValue = await SU.getLocalOnlyStoredValue(SU.getProjectChangelogStorageKey(projectId)).catch(() => undefined);
      return SU.normalizeGithubRepoInfo(cachedValue);
    }
  };

  SU.fetchGithubJson = async (url) => {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      let message = `GitHub request failed (${response.status})`;
      try {
        const body = await response.json();
        if (body?.message) {
          message = body.message;
        }
      } catch {
      }
      throw new Error(message);
    }

    return response.json();
  };

  SU.getProjectChangelogBranchNames = (repoMeta, branchesJson, sinceIso) => {
    const defaultBranch = repoMeta?.default_branch || 'main';
    if (!sinceIso) {
      return [defaultBranch];
    }

    const names = [defaultBranch];
    (Array.isArray(branchesJson) ? branchesJson : []).forEach((branch) => {
      const name = SU.compactText(branch?.name);
      if (name && !names.includes(name)) {
        names.push(name);
      }
    });
    return names.slice(0, 25);
  };

  SU.normalizeProjectChangelogCommit = (entry, repoInfo, branchName) => {
    const subject = SU.compactText(String(entry?.commit?.message || '').split('\n')[0]);
    const sha = String(entry?.sha || '');
    if (!subject || !sha || /^merge\s/i.test(subject)) {
      return null;
    }

    return {
      sha,
      shaShort: sha.slice(0, 7),
      message: subject,
      url: `${repoInfo.url}/commit/${sha.slice(0, 7)}`,
      date: entry?.commit?.author?.date || entry?.commit?.committer?.date || '',
      author: entry?.commit?.author?.name || entry?.author?.login || '',
      branches: [branchName]
    };
  };

  SU.fetchProjectChangelogData = async (projectId, projectMain) => {
    const repoInfo = await SU.fetchProjectGithubRepo(projectId, projectMain);
    if (!repoInfo) {
      return { status: 'no-repo' };
    }

    const sinceIso = SU.getLatestProjectDevlogTimestamp(projectMain);
    const cacheKey = [projectId, repoInfo.fullName, sinceIso || 'latest'].join('|');
    const cached = SU.projectChangelogCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const inflight = SU.projectChangelogInflight.get(cacheKey);
    if (inflight) {
      return inflight;
    }

    const request = (async () => {
      try {
        const repoMeta = await SU.fetchGithubJson(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`);
        const branchesJson = sinceIso
          ? await SU.fetchGithubJson(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/branches?per_page=100`)
          : [];
        const branchNames = SU.getProjectChangelogBranchNames(repoMeta, branchesJson, sinceIso);
        const commitResponses = await Promise.allSettled(branchNames.map(async (branchName) => {
          const params = new URLSearchParams({ sha: branchName, per_page: '20' });
          if (sinceIso) {
            params.set('since', sinceIso);
          }

          const commitsJson = await SU.fetchGithubJson(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits?${params.toString()}`);
          return {
            branchName,
            commits: (Array.isArray(commitsJson) ? commitsJson : [])
          };
        }));

        const commitMap = new Map();
        commitResponses.forEach((response) => {
          if (response.status !== 'fulfilled') {
            return;
          }

          response.value.commits.forEach((entry) => {
            const normalized = SU.normalizeProjectChangelogCommit(entry, repoInfo, response.value.branchName);
            if (!normalized) {
              return;
            }

            const existing = commitMap.get(normalized.sha);
            if (existing) {
              existing.branches = [...new Set([...existing.branches, ...normalized.branches])];
              return;
            }

            commitMap.set(normalized.sha, normalized);
          });
        });

        const commits = [...commitMap.values()].sort((left, right) => {
          const leftTime = left.date ? Date.parse(left.date) : 0;
          const rightTime = right.date ? Date.parse(right.date) : 0;
          return rightTime - leftTime;
        });
        const branch = repoMeta?.default_branch || 'main';

        const state = commits.length
          ? {
              status: 'ready',
              repoInfo,
              branch,
              sinceIso,
              heading: sinceIso ? 'Since your last devlog' : 'Latest commits',
              commits
            }
          : {
              status: 'empty',
              repoInfo,
              branch,
              sinceIso,
              heading: sinceIso ? 'Since your last devlog' : 'Latest commits',
              commits: []
            };
        SU.projectChangelogCache.set(cacheKey, state);
        return state;
      } catch (error) {
        const state = {
          status: 'error',
          repoInfo,
          sinceIso,
          heading: sinceIso ? 'Since your last devlog' : 'Latest commits',
          error: error?.message || 'Could not load commits.'
        };
        SU.projectChangelogCache.set(cacheKey, state);
        return state;
      } finally {
        SU.projectChangelogInflight.delete(cacheKey);
      }
    })();

    SU.projectChangelogInflight.set(cacheKey, request);
    return request;
  };

  SU.formatProjectChangelogDate = (value) => {
    if (!value) {
      return '';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  SU.buildProjectChangelogMarkdown = (commits) => {
    const format = SU.getValidDevlogChangelogFormat(SU.savedDevlogChangelogFormat);
    const lines = (Array.isArray(commits) ? commits : [])
      .slice(0, 10)
      .map((commit) => {
        if (format === 'message') {
          return `- ${commit.message}`;
        }

        if (format === 'message-hash') {
          return `- ${commit.message} ([${commit.shaShort}](${commit.url}))`;
        }

        if (format === 'hash-message') {
          return `- ([${commit.shaShort}](${commit.url})) ${commit.message}`;
        }

        return `- [${commit.shaShort}](${commit.url})`;
      });
    if (!lines.length) {
      return '';
    }

    return `## Changelog\n\n${lines.join('\n')}`;
  };

  SU.addProjectChangelogToDevlog = (textarea, commits) => {
    if (!textarea) {
      return;
    }

    const markdown = SU.buildProjectChangelogMarkdown(commits);
    if (!markdown) {
      return;
    }

    const spacer = textarea.value.trim() ? '\n\n' : '';
    SU.insertTextAtCursor(textarea, `${spacer}${markdown}`);
  };

  SU.renderProjectChangelogPanel = (panel, textarea, state, refresh) => {
    if (!panel) {
      return;
    }

    if (typeof panel._stardanceUtilsChangelogMenuCleanup === 'function') {
      panel._stardanceUtilsChangelogMenuCleanup();
      panel._stardanceUtilsChangelogMenuCleanup = null;
    }

    panel.replaceChildren();

    const head = document.createElement('div');
    head.className = 'stardance-utils-changelog-head';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'stardance-utils-changelog-title';
    title.textContent = 'Changelog';
    titleWrap.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'stardance-utils-changelog-meta';
    if (state.repoInfo?.fullName) {
      const sinceText = state.sinceIso ? ` · ${state.heading} · ${SU.formatProjectChangelogDate(state.sinceIso)}` : ` · ${state.heading}`;
      meta.textContent = `From ${state.repoInfo.fullName}${sinceText}`;
    }
    titleWrap.appendChild(meta);

    head.appendChild(titleWrap);
    panel.appendChild(head);

    const body = document.createElement('div');
    body.className = 'stardance-utils-changelog-body';
    panel.appendChild(body);

    if (state.status === 'loading') {
      const loading = document.createElement('p');
      loading.className = 'stardance-utils-changelog-empty';
      loading.textContent = 'Loading commits...';
      body.appendChild(loading);
      return;
    }

    if (state.status === 'error') {
      const error = document.createElement('p');
      error.className = 'stardance-utils-changelog-error';
      error.textContent = state.error || 'Could not load commits.';
      body.appendChild(error);
      return;
    }

    if (state.status === 'empty') {
      const empty = document.createElement('p');
      empty.className = 'stardance-utils-changelog-empty';
      empty.textContent = state.sinceIso ? 'No new commits since your last devlog.' : 'No recent commits found.';
      body.appendChild(empty);
      return;
    }

    if (state.status !== 'ready') {
      return;
    }

    const list = document.createElement('ul');
    list.className = 'stardance-utils-changelog-list';
    state.commits.slice(0, 8).forEach((commit) => {
      const item = document.createElement('li');
      item.className = 'stardance-utils-changelog-item';

      const sha = document.createElement('a');
      sha.className = 'stardance-utils-changelog-sha';
      sha.href = commit.url;
      sha.target = '_blank';
      sha.rel = 'noreferrer';
      sha.textContent = commit.shaShort;

      const message = document.createElement('a');
      message.className = 'stardance-utils-changelog-message';
      message.href = commit.url;
      message.target = '_blank';
      message.rel = 'noreferrer';
      message.textContent = commit.message;
      item.appendChild(sha);
      item.appendChild(message);
      list.appendChild(item);
    });
    body.appendChild(list);

    if (state.commits.length > 8) {
      const more = document.createElement('p');
      more.className = 'stardance-utils-changelog-empty';
      more.textContent = `+ ${state.commits.length - 8} more commits`;
      body.appendChild(more);
    }

    const actions = document.createElement('div');
    actions.className = 'stardance-utils-changelog-actions';

    const formatWrap = document.createElement('div');
    formatWrap.className = 'stardance-utils-changelog-format-menu';

    const formatButton = document.createElement('button');
    formatButton.type = 'button';
    formatButton.className = 'stardance-utils-action-button stardance-utils-changelog-btn stardance-utils-changelog-icon-btn stardance-utils-changelog-format-trigger';
    formatButton.setAttribute('aria-label', 'Changelog format settings');
    formatButton.setAttribute('aria-expanded', 'false');
    formatButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"></path></svg>';
    formatButton.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });

    const formatList = document.createElement('div');
    formatList.className = 'stardance-utils-changelog-format-list';
    formatList.hidden = true;
    const selectedFormat = SU.getValidDevlogChangelogFormat(SU.savedDevlogChangelogFormat);
    SU.DEVLOG_CHANGELOG_FORMAT_OPTIONS.forEach((optionData) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stardance-utils-changelog-format-option';
      button.setAttribute('data-active', String(optionData.value === selectedFormat));
      button.textContent = optionData.label;
      button.addEventListener('click', async () => {
        await SU.setDevlogChangelogFormat(optionData.value);
        formatList.querySelectorAll('.stardance-utils-changelog-format-option').forEach((node) => {
          node.setAttribute('data-active', String(node === button));
        });
        closeFormatMenu();
      });
      formatList.appendChild(button);
    });

    const closeFormatMenu = () => {
      formatList.hidden = true;
      formatButton.setAttribute('aria-expanded', 'false');
    };

    const toggleFormatMenu = () => {
      const nextOpen = formatList.hidden;
      formatList.hidden = !nextOpen;
      formatButton.setAttribute('aria-expanded', String(nextOpen));
    };

    const onDocumentPointerDown = (event) => {
      if (!formatWrap.contains(event.target)) {
        closeFormatMenu();
      }
    };

    const onDocumentKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeFormatMenu();
      }
    };

    document.addEventListener('pointerdown', onDocumentPointerDown, true);
    document.addEventListener('keydown', onDocumentKeyDown, true);
    panel._stardanceUtilsChangelogMenuCleanup = () => {
      document.removeEventListener('pointerdown', onDocumentPointerDown, true);
      document.removeEventListener('keydown', onDocumentKeyDown, true);
    };

    formatButton.addEventListener('click', (event) => {
      event.preventDefault();
      toggleFormatMenu();
    });

    formatWrap.appendChild(formatButton);
    formatWrap.appendChild(formatList);
    actions.appendChild(formatWrap);

    const refreshButton = document.createElement('button');
    refreshButton.type = 'button';
    refreshButton.className = 'stardance-utils-action-button stardance-utils-changelog-btn stardance-utils-changelog-icon-btn stardance-utils-changelog-refresh-btn';
    refreshButton.setAttribute('aria-label', 'Refresh changelog');
    refreshButton.innerHTML = '<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M25 38c-7.2 0-13-5.8-13-13 0-3.2 1.2-6.2 3.3-8.6l1.5 1.3C15 19.7 14 22.3 14 25c0 6.1 4.9 11 11 11 1.6 0 3.1-.3 4.6-1l.8 1.8c-1.7.8-3.5 1.2-5.4 1.2z" fill="currentColor"/><path d="M34.7 33.7l-1.5-1.3c1.8-2 2.8-4.6 2.8-7.3 0-6.1-4.9-11-11-11-1.6 0-3.1.3-4.6 1l-.8-1.8c1.7-.8 3.5-1.2 5.4-1.2 7.2 0 13 5.8 13 13 0 3.1-1.2 6.2-3.3 8.6z" fill="currentColor"/><path d="M18 24h-2v-6h-6v-2h8z" fill="currentColor"/><path d="M40 34h-8v-8h2v6h6z" fill="currentColor"/></svg>';
    refreshButton.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });
    refreshButton.addEventListener('click', refresh);
    actions.appendChild(refreshButton);

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'stardance-utils-action-button stardance-utils-action-button--primary stardance-utils-changelog-btn';
    addButton.textContent = 'Add to devlog';
    addButton.addEventListener('click', () => SU.addProjectChangelogToDevlog(textarea, state.commits));
    actions.appendChild(addButton);

    panel.appendChild(actions);
  };

  SU.enhanceProjectChangelog = async (projectMain, composerShell, textarea, projectId) => {
    if (!projectMain || !composerShell || !textarea || !projectId) {
      return;
    }

    let panel = SU.getProjectChangelogPanel(projectMain);
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'stardance-utils-changelog-panel';
      panel.setAttribute('data-stardance-utils-changelog', 'true');
      composerShell.insertBefore(panel, textarea.closest('.feed-composer'));
    }

    const refresh = () => {
      [...SU.projectChangelogCache.keys()].forEach((key) => {
        if (String(key).startsWith(`${projectId}|`)) {
          SU.projectChangelogCache.delete(key);
        }
      });
      void SU.enhanceProjectChangelog(projectMain, composerShell, textarea, projectId);
    };

    const rerender = () => {
      const repoInfo = SU.getProjectGithubRepoFromDom(projectMain);
      const sinceIso = SU.getLatestProjectDevlogTimestamp(projectMain);
      const cacheKey = repoInfo ? [projectId, repoInfo.fullName, sinceIso || 'latest'].join('|') : null;
      const nextState = (cacheKey && SU.projectChangelogCache.get(cacheKey)) || { status: 'loading' };
      SU.renderProjectChangelogPanel(panel, textarea, nextState, refresh, rerender);
    };

    SU.renderProjectChangelogPanel(panel, textarea, { status: 'loading' }, refresh, rerender);
    const state = await SU.fetchProjectChangelogData(projectId, projectMain);
    if (state.status === 'no-repo') {
      panel.remove();
      return;
    }

    SU.renderProjectChangelogPanel(panel, textarea, state, refresh, rerender);
  };

  SU.placeDevlogBodyCollapseLink = (body, button, expanded) => {
    body.querySelectorAll(`.${DEVLOG_BODY_HIDDEN_CLASS}`).forEach((child) => {
      child.classList.remove(DEVLOG_BODY_HIDDEN_CLASS);
      child.hidden = false;
    });

    if (expanded) {
      body.appendChild(button);
      return;
    }

    const visibleChildren = [...body.children]
      .filter((child) => child !== button && child.offsetTop + child.offsetHeight <= DEVLOG_BODY_COLLAPSED_HEIGHT - 4);
    const target = visibleChildren.at(-1);
    if (target) {
      target.append(' ', button);
      [...body.children].forEach((child) => {
        if (child !== button && child !== target && child.offsetTop > target.offsetTop) {
          child.classList.add(DEVLOG_BODY_HIDDEN_CLASS);
          child.hidden = true;
        }
      });
      return;
    }

    body.appendChild(button);
  };

  SU.updateDevlogBodyCollapseLink = (body, button, expanded) => {
    button.textContent = expanded ? 'show less' : 'show more';
    button.setAttribute('aria-expanded', String(expanded));
    body.classList.toggle(DEVLOG_BODY_COLLAPSED_CLASS, !expanded);
    body.classList.toggle(DEVLOG_BODY_EXPANDED_CLASS, expanded);
    SU.placeDevlogBodyCollapseLink(body, button, expanded);
  };

  SU.clearDevlogBodyCollapse = () => {
    document.querySelectorAll(`[${DEVLOG_BODY_COLLAPSE_BUTTON_ATTR}]`).forEach((button) => button.remove());
    document.querySelectorAll(`[${DEVLOG_BODY_COLLAPSE_ATTR}]`).forEach((body) => {
      body.removeAttribute(DEVLOG_BODY_COLLAPSE_ATTR);
      body.classList.remove(DEVLOG_BODY_COLLAPSED_CLASS, DEVLOG_BODY_EXPANDED_CLASS);
      body.querySelectorAll(`.${DEVLOG_BODY_HIDDEN_CLASS}`).forEach((child) => {
        child.classList.remove(DEVLOG_BODY_HIDDEN_CLASS);
        child.hidden = false;
      });
    });
  };

  SU.enhanceDevlogBodyCollapse = () => {
    if (SU.savedDevlogAutoCollapseEnabled === false) {
      SU.clearDevlogBodyCollapse();
      return;
    }

    const selector = [
      '.devlog-detail__post article.feed-post-card .feed-post-card__body.markdown-content',
      'article.feed-post-card[data-feed-engagement-post-type-value="Post::Devlog"] .feed-post-card__body.markdown-content',
      '.comment-modal__post-body.markdown-content'
    ].join(', ');

    document.querySelectorAll(selector).forEach((body) => {
      if (body.getAttribute(DEVLOG_BODY_COLLAPSE_ATTR) === 'true') {
        return;
      }

      const originalMaxHeight = body.style.maxHeight;
      body.style.maxHeight = 'none';
      const fullHeight = body.scrollHeight;
      body.style.maxHeight = originalMaxHeight;
      if (fullHeight < DEVLOG_BODY_COLLAPSE_MIN_HEIGHT) {
        return;
      }

      body.setAttribute(DEVLOG_BODY_COLLAPSE_ATTR, 'true');
      body.classList.add(DEVLOG_BODY_COLLAPSED_CLASS);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'stardance-utils-devlog-body-toggle';
      button.setAttribute(DEVLOG_BODY_COLLAPSE_BUTTON_ATTR, 'true');
      SU.updateDevlogBodyCollapseLink(body, button, false);

      button.addEventListener('click', () => {
        const expanded = !body.classList.contains(DEVLOG_BODY_EXPANDED_CLASS);
        SU.updateDevlogBodyCollapseLink(body, button, expanded);
      });

      body.appendChild(button);
    });
  };

  SU.enhanceProjectShowPage = () => {
    const projectMain = document.querySelector('.app-layout__main');
    const actionsNav = projectMain?.querySelector('.project-show__actions');
    const heroBanner = projectMain?.querySelector('.project-show__banner');
    const feedSection = projectMain?.querySelector('.project-show__feed');
    const prefersNativeComposer = /firefox/i.test(globalThis.navigator?.userAgent || '');
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
    if (!prefersNativeComposer && composerSection && composerSection.getAttribute(SU.INLINE_COMPOSER_ATTR) !== 'true' && !inlineComposerShell) {
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

    const activeComposer = prefersNativeComposer
      ? (composerDialog?.querySelector('.feed-composer') ?? composerSection)
      : [...projectMain.querySelectorAll('.stardance-utils-inline-composer.feed-composer, .feed-composer')]
          .find((composer) => isDevlogComposer(composer));
    const changelogTextarea = activeComposer?.querySelector('textarea[name="post_devlog[body]"]') || null;
    const changelogShell = activeComposer?.closest('.stardance-utils-inline-composer-shell') || null;
    if (!prefersNativeComposer) {
      void SU.enhanceProjectChangelog(projectMain, changelogShell, changelogTextarea, projectId);
    }
    SU.bindDevlogDraftPersistence(activeComposer);
    SU.enhanceDevlogSpeech(activeComposer);
    SU.enhanceInlineDevlogEdit(projectMain);

    if (!prefersNativeComposer) {
      actionsNav?.remove();
    }
  };
})();
