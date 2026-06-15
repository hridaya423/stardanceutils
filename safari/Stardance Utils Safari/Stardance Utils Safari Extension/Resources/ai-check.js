(() => {
  const SU = globalThis.StardanceUtils;
  const FEED_IMAGE_ZOOM_BUTTON_ATTR = 'data-stardance-utils-image-zoom-button';
  const FEED_IMAGE_ZOOM_DIALOG_ID = 'stardance-utils-image-zoom-dialog';
  const AI_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
  const FEED_AI_BUTTON_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M8 17.75h8m3.5-5.5h.75a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5h-.75m-15-5h-.75a1.5 1.5 0 0 0-1.5 1.5v2a1.5 1.5 0 0 0 1.5 1.5h.75M12 8V6m1.5-1.5A1.5 1.5 0 0 1 12 6a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 12 3a1.5 1.5 0 0 1 1.5 1.5m2.75 8.75a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5m-5.5 0a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5M8.25 8.5h7.5a3.74 3.74 0 0 1 3.75 3.75v5A3.74 3.74 0 0 1 15.75 21h-7.5a3.74 3.74 0 0 1-3.75-3.75v-5A3.74 3.74 0 0 1 8.25 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  SU.logAiDebug = (message, data) => {
    if (data === undefined) {
      console.debug(SU.AI_LOG_PREFIX, message);
      return;
    }

    console.debug(SU.AI_LOG_PREFIX, message, data);
  };

  SU.logAiWarn = (message, data) => {
    if (data === undefined) {
      console.warn(SU.AI_LOG_PREFIX, message);
      return;
    }

    console.warn(SU.AI_LOG_PREFIX, message, data);
  };

  SU.logAiError = (message, error) => {
    console.error(SU.AI_LOG_PREFIX, message, error);
  };

  SU.getOriginalFeedImageUrl = (imageUrl) => {
    if (typeof imageUrl !== 'string' || imageUrl.length === 0) {
      return null;
    }

    try {
      const url = new URL(imageUrl, window.location.origin);
      const representationMatch = url.pathname.match(/^\/rails\/active_storage\/representations\/proxy\/([^/]+)\/[^/]+\/(.+)$/);
      if (representationMatch) {
        const originalUrl = `${url.origin}/rails/active_storage/blobs/proxy/${representationMatch[1]}/${representationMatch[2]}`;
        SU.logAiDebug('Derived original blob URL from Active Storage representation', {
          representationUrl: url.toString(),
          originalUrl
        });
        return originalUrl;
      }

      SU.logAiDebug('Using image URL directly for AI verification', { imageUrl: url.toString() });
      return url.toString();
    } catch {
      SU.logAiWarn('Failed to parse image URL for AI verification', { imageUrl });
      return null;
    }
  };

  SU.runFeedAiVerification = async (imageUrl, mode = 'basic') => {
    if (typeof SU.sendRuntimeMessage !== 'function') {
      throw new Error('Extension background messaging is unavailable');
    }

    SU.logAiDebug('Fetching original image bytes for AI verification', { imageUrl, mode });
    const response = await fetch(imageUrl, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Image fetch failed (${response.status})`);
    }

    const blob = await response.blob();
    if (blob.size > AI_IMAGE_MAX_BYTES) {
      throw new Error('Image is too large to inspect safely. Try a smaller image.');
    }

    const fileName = decodeURIComponent(imageUrl.split('/').pop() || 'image');
    const buffer = await blob.arrayBuffer();
    const byteArray = Array.from(new Uint8Array(buffer));
    SU.logAiDebug('Dispatching AI verification request to background worker', {
      imageUrl,
      mode,
      type: blob.type,
      size: blob.size,
      fileName,
      byteLength: byteArray.length
    });

    const result = await SU.sendRuntimeMessage({
      type: 'stardance-utils-ai-check',
      imageUrl,
      mode,
      fileName,
      mimeType: blob.type || 'image/png',
      bytes: byteArray
    });

    if (!result?.ok) {
      throw new Error(result?.error?.message || 'Background AI verification failed');
    }

    SU.logAiDebug('Received AI verification response from background worker', result.result);
    return result.result;
  };

  SU.ensureFeedMediaControls = (card) => {
    const media = card.querySelector('.feed-post-card__media') || card.querySelector('.feed-post-card__media-viewport') || card;
    media.classList.add('stardance-utils-ai-media-host');

    let wrap = media.querySelector(`[${SU.FEED_AI_BUTTON_WRAP_ATTR}]`);
    if (wrap) {
      return wrap;
    }

    wrap = document.createElement('div');
    wrap.className = 'stardance-utils-feed-media-controls';
    wrap.setAttribute(SU.FEED_AI_BUTTON_WRAP_ATTR, 'true');

    media.appendChild(wrap);
    return wrap;
  };

  SU.ensureFeedAiButton = (card) => {
    const wrap = SU.ensureFeedMediaControls(card);
    const existingButton = wrap.querySelector(`[${SU.FEED_AI_BUTTON_ATTR}]`);
    if (existingButton) {
      return existingButton;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stardance-utils-ai-button';
    button.setAttribute(SU.FEED_AI_BUTTON_ATTR, 'true');
    button.setAttribute('aria-label', 'Check image with AI');
    button.innerHTML = FEED_AI_BUTTON_ICON;

    wrap.appendChild(button);
    return button;
  };

  SU.ensureFeedImageZoomDialog = () => {
    let dialog = document.getElementById(FEED_IMAGE_ZOOM_DIALOG_ID);
    if (dialog) {
      return dialog;
    }

    dialog = document.createElement('dialog');
    dialog.id = FEED_IMAGE_ZOOM_DIALOG_ID;
    dialog.className = 'stardance-utils-image-zoom-dialog';
    dialog.innerHTML = `
      <div class="stardance-utils-image-zoom-shell">
        <button type="button" class="stardance-utils-image-zoom-close" aria-label="Close image preview">×</button>
        <img class="stardance-utils-image-zoom-image" alt="">
      </div>
    `;

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.querySelector('.stardance-utils-image-zoom-close')?.addEventListener('click', () => {
      dialog.close();
    });

    document.body.appendChild(dialog);
    return dialog;
  };

  SU.openFeedImageZoom = (image) => {
    const sourceUrl = image?.currentSrc || image?.getAttribute('src');
    if (!sourceUrl) {
      return;
    }

    const dialog = SU.ensureFeedImageZoomDialog();
    const modalImage = dialog.querySelector('.stardance-utils-image-zoom-image');
    if (!modalImage) {
      return;
    }

    modalImage.src = sourceUrl;
    modalImage.alt = image?.getAttribute('alt') || '';
    if (!dialog.open) {
      dialog.showModal();
    }
  };

  SU.ensureFeedImageZoomButton = (card) => {
    const image = card.querySelector('.feed-post-card__image');
    if (!image) {
      return null;
    }

    const wrap = SU.ensureFeedMediaControls(card);
    const existingButton = wrap.querySelector(`[${FEED_IMAGE_ZOOM_BUTTON_ATTR}]`);
    if (existingButton) {
      return existingButton;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stardance-utils-image-zoom-button';
    button.setAttribute(FEED_IMAGE_ZOOM_BUTTON_ATTR, 'true');
    button.setAttribute('aria-label', 'Open image larger');
    button.innerHTML = `
      <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <path d="M10 6.5a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Zm-.691 3.516a4.5 4.5 0 1 1 .707-.707l2.838 2.837a.5.5 0 0 1-.708.708L9.31 10.016ZM4.25 6.5a.5.5 0 0 1 .5-.5H6V4.75a.5.5 0 0 1 1 0V6h1.25a.5.5 0 0 1 0 1H7v1.25a.5.5 0 0 1-1 0V7H4.75a.5.5 0 0 1-.5-.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
      </svg>
    `;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      SU.openFeedImageZoom(image);
    });

    wrap.appendChild(button);
    return button;
  };

  SU.scheduleAiButtonReset = (button) => {
    const existingTimer = SU.aiButtonResetTimers.get(button);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timeoutId = window.setTimeout(() => {
      button.className = 'stardance-utils-ai-button';
      button.innerHTML = FEED_AI_BUTTON_ICON;
      button.title = '';
      SU.aiButtonResetTimers.delete(button);
    }, SU.AI_BUTTON_RESET_MS);

    SU.aiButtonResetTimers.set(button, timeoutId);
  };

  SU.updateFeedAiUi = (card, result, source = 'passive') => {
    const button = SU.ensureFeedAiButton(card);
    if (!button) {
      return;
    }

    SU.logAiDebug('Updated feed card AI UI', {
      source,
      status: result.status,
      label: result.label,
      postId: card.id || null
    });

      button.title = result.detail;
      if (source === 'manual') {
      button.className = `stardance-utils-ai-button stardance-utils-ai-button--${result.status}`;
      SU.scheduleAiButtonReset(button);
    } else {
      button.className = 'stardance-utils-ai-button';
    }
  };

  SU.verifyFeedCard = async (card, mode = 'basic', source = 'passive') => {
    SU.logAiDebug('Verifying feed card', {
      postId: card.id || null,
      mode,
      source
    });
    const image = card.querySelector('.feed-post-card__image');
    const imageUrl = SU.getOriginalFeedImageUrl(image?.getAttribute('src') || '');
    if (!imageUrl) {
      SU.logAiWarn('Skipping AI verification because no image URL was found', {
        postId: card.id || null
      });
      if (source === 'manual') {
        SU.updateFeedAiUi(card, {
          status: 'error',
          label: 'Check failed',
          detail: 'No image source was found for this post.'
        }, 'manual');
      }
      return;
    }

    const button = SU.ensureFeedAiButton(card);
    if (source === 'manual' && button) {
      button.disabled = true;
      button.className = 'stardance-utils-ai-button';
    }

    try {
      const result = await SU.runFeedAiVerification(imageUrl, mode);
      SU.updateFeedAiUi(card, result, source);
    } catch (error) {
      SU.logAiError('AI verification failed', {
        postId: card.id || null,
        imageUrl,
        mode,
        source,
        error
      });
      if (source === 'manual') {
        SU.updateFeedAiUi(card, {
          status: 'error',
          label: 'Check failed',
          detail: 'Could not inspect this image.'
        }, 'manual');
      }
    } finally {
      if (source === 'manual' && button) {
        button.disabled = false;
      }
    }
  };

  SU.enhanceFeedAiVerification = () => {
    const cards = document.querySelectorAll('article.feed-post-card');
    SU.logAiDebug('Scanning feed cards for AI verification', { totalCards: cards.length });
    cards.forEach((card) => {
      card.querySelectorAll('.stardance-utils-ai-row').forEach((row) => row.remove());
      const button = SU.ensureFeedAiButton(card);
      SU.ensureFeedImageZoomButton(card);

      if (card.getAttribute(SU.FEED_AI_ATTR) === 'true') {
        return;
      }

      card.setAttribute(SU.FEED_AI_ATTR, 'true');
      SU.logAiDebug('Attached AI verification hooks to feed card', { postId: card.id || null });
      button?.addEventListener('click', () => {
        void SU.verifyFeedCard(card, 'deep', 'manual');
      });
    });
  };
})();
