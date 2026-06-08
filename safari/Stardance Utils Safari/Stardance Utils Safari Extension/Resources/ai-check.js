(() => {
  const SU = globalThis.StardanceUtils;

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
    if (!SU.extensionRuntime?.sendMessage) {
      throw new Error('Extension background messaging is unavailable');
    }

    SU.logAiDebug('Fetching original image bytes for AI verification', { imageUrl, mode });
    const response = await fetch(imageUrl, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Image fetch failed (${response.status})`);
    }

    const blob = await response.blob();
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

    return new Promise((resolve, reject) => {
      SU.extensionRuntime.sendMessage({
        type: 'stardance-utils-ai-check',
        imageUrl,
        mode,
        fileName,
        mimeType: blob.type || 'image/png',
        bytes: byteArray
      }, (result) => {
        const runtimeError = globalThis.chrome?.runtime?.lastError;
        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        if (!result?.ok) {
          reject(new Error(result?.error?.message || 'Background AI verification failed'));
          return;
        }

        SU.logAiDebug('Received AI verification response from background worker', result.result);
        resolve(result.result);
      });
    });
  };

  SU.ensureFeedAiButton = (card) => {
    let wrap = card.querySelector(`[${SU.FEED_AI_BUTTON_WRAP_ATTR}]`);
    if (wrap) {
      return wrap.querySelector(`[${SU.FEED_AI_BUTTON_ATTR}]`);
    }

    const media = card.querySelector('.feed-post-card__media') || card.querySelector('.feed-post-card__media-viewport') || card;
    media.classList.add('stardance-utils-ai-media-host');

    wrap = document.createElement('div');
    wrap.className = 'stardance-utils-ai-button-wrap';
    wrap.setAttribute(SU.FEED_AI_BUTTON_WRAP_ATTR, 'true');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stardance-utils-ai-button';
    button.setAttribute(SU.FEED_AI_BUTTON_ATTR, 'true');
    button.textContent = 'Check AI';

    wrap.appendChild(button);
    media.appendChild(wrap);
    return button;
  };

  SU.scheduleAiButtonReset = (button) => {
    const existingTimer = SU.aiButtonResetTimers.get(button);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timeoutId = window.setTimeout(() => {
      button.className = 'stardance-utils-ai-button';
      button.textContent = 'Check AI';
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
      button.textContent = result.label;
      button.className = `stardance-utils-ai-button stardance-utils-ai-button--${result.status}`;
      SU.scheduleAiButtonReset(button);
    } else {
      button.className = 'stardance-utils-ai-button';
      button.textContent = 'Re-check AI';
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
      button.textContent = 'Checking...';
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
      if (card.getAttribute(SU.FEED_AI_ATTR) === 'true') {
        return;
      }

      card.setAttribute(SU.FEED_AI_ATTR, 'true');
      SU.logAiDebug('Attached AI verification hooks to feed card', { postId: card.id || null });
      const button = SU.ensureFeedAiButton(card);
      button?.addEventListener('click', () => {
        void SU.verifyFeedCard(card, 'deep', 'manual');
      });
    });
  };
})();
