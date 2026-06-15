const LOG_PREFIX = '[Stardance Utils OpenAI Verify]';
const VERIFY_RESULT_TIMEOUT_MS = 45000;

function log(message, payload) {
  if (payload === undefined) {
    console.debug(LOG_PREFIX, message);
    return;
  }

  console.debug(LOG_PREFIX, message, payload);
}

function sendMessage(message) {
  if (globalThis.browser?.runtime?.sendMessage) {
    return globalThis.browser.runtime.sendMessage(message);
  }

  const runtime = globalThis.chrome?.runtime ?? null;
  if (!runtime?.sendMessage) {
    return Promise.reject(new Error('Runtime messaging unavailable'));
  }

  return new Promise((resolve, reject) => {
    runtime.sendMessage(message, (response) => {
      const runtimeError = globalThis.chrome?.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }
      resolve(response);
    });
  });
}

function sendLog(step, payload = {}) {
  return sendMessage({
    type: 'stardance-utils-openai-log',
    payload: {
      step,
      ...payload
    }
  }).catch(() => {});
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTurnstileTokenValue() {
  const input = document.querySelector('input[name="cf-turnstile-response"]');
  return input?.value?.trim() || '';
}

function logTurnstileTokenStatus() {
  const token = getTurnstileTokenValue();
  log('Turnstile token status', { ready: Boolean(token), tokenLength: token.length });
  void sendLog('turnstile-status', { ready: Boolean(token), tokenLength: token.length });
}

async function waitForSelector(selector, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await sleep(250);
  }

  throw new Error(`Timed out waiting for selector: ${selector}`);
}

function buildFileFromPayload(imageUrl, fileName, mimeType, bytes) {
  if (!bytes) {
    throw new Error('Missing transferred image bytes');
  }

  const filename = fileName || decodeURIComponent(imageUrl.split('/').pop() || 'image');
  let fileBytes;
  if (Array.isArray(bytes)) {
    fileBytes = Uint8Array.from(bytes);
  } else if (bytes instanceof Uint8Array) {
    fileBytes = bytes;
  } else if (bytes instanceof ArrayBuffer) {
    fileBytes = new Uint8Array(bytes);
  } else if (bytes?.buffer instanceof ArrayBuffer) {
    fileBytes = new Uint8Array(bytes.buffer);
  } else {
    throw new Error('Unsupported byte payload for verifier upload');
  }

  return new File([fileBytes], filename, { type: mimeType || 'image/png' });
}

function setFileInputFile(input, file) {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  log('Assigned file to input', { fileCount: input.files?.length || 0, inputId: input.id || null });
  void sendLog('file-assigned', { fileCount: input.files?.length || 0, inputId: input.id || null });
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function clickVerifyAnotherIfPresent() {
  const buttons = [...document.querySelectorAll('button')];
  const verifyAnother = buttons.find((button) => /verify another image/i.test(button.textContent || '') || button.getAttribute('data-analytics') === 'provenance-image-verifier-verify-another');
  verifyAnother?.click();
}

function clickClearUploadedImageIfPresent() {
  const buttons = [...document.querySelectorAll('button')];
  const clearButton = buttons.find((button) => /clear uploaded image/i.test(button.getAttribute('aria-label') || ''));
  if (clearButton) {
    clearButton.click();
    log('Clicked clear uploaded image');
    void sendLog('clear-upload-clicked', {});
  }
}

async function resetVerifierState() {
  clickVerifyAnotherIfPresent();
  clickClearUploadedImageIfPresent();
  await sleep(500);
}

function extractResult() {
  const positiveHeading = [...document.querySelectorAll('h1, h2, h3, h4')]
    .find((element) => /generated with openai tools|generated using openai tools/i.test(element.textContent?.trim() || ''));
  if (positiveHeading) {
    log('Detected positive verifier heading', { text: positiveHeading.textContent?.trim() || '' });
    return {
      status: 'verified-openai',
      label: 'Generated with OpenAI',
      detail: 'OpenAI Verify reported that this content was generated with OpenAI tools.'
    };
  }

  const negativeHeading = [...document.querySelectorAll('h1, h2, h3, h4')]
    .find((element) => /^(no signal|no supported signal|no verifiable signal|no openai signals detected)( found)?$/i.test(element.textContent?.trim() || ''));
  if (negativeHeading) {
    log('Detected negative verifier heading', { text: negativeHeading.textContent?.trim() || '' });
    return {
      status: 'none',
      label: 'No signal',
      detail: 'OpenAI Verify did not find a supported provenance signal.'
    };
  }

  const noSignalCopy = document.body?.innerText || '';
  if (/no openai signals detected/i.test(noSignalCopy) || /we did not find evidence that the content was generated using openai tools/i.test(noSignalCopy)) {
    log('Detected negative verifier copy', { snippet: noSignalCopy.slice(0, 200) });
    return {
      status: 'none',
      label: 'No signal',
      detail: 'OpenAI Verify did not find a supported provenance signal.'
    };
  }

  const verifyAnotherButton = [...document.querySelectorAll('button')]
    .find((button) => /verify another image/i.test(button.textContent || '') || button.getAttribute('data-analytics') === 'provenance-image-verifier-verify-another');
  const resultImage = document.querySelector('img[src^="blob:https://openai.com/"]');
  const bodyText = document.body?.innerText || '';
  if (verifyAnotherButton && resultImage) {
    const headingText = positiveHeading?.textContent?.trim() || null;
    log('Detected result shell without known heading', {
      heading: headingText,
      imageSrc: resultImage.getAttribute('src'),
      hasSuccessCopy: /this content was generated using openai tools/i.test(bodyText)
    });

    if (/generated with openai tools/i.test(headingText || '') || /this content was generated using openai tools/i.test(bodyText)) {
      return {
        status: 'verified-openai',
        label: 'Generated with OpenAI',
        detail: 'OpenAI Verify reported that this content was generated with OpenAI tools.'
      };
    }

    if (/no signal|no supported signal|no verifiable signal|no openai signals detected/i.test(headingText || '') || /did not find a supported provenance signal|no openai signals detected/i.test(bodyText)) {
      return {
        status: 'none',
        label: 'No signal',
        detail: 'OpenAI Verify did not find a supported provenance signal.'
      };
    }
  }

  return null;
}

function extractUploadError() {
  const alert = document.querySelector('[role="alert"]');
  const text = alert?.textContent?.trim();
  if (!text) {
    return null;
  }

  if (/something went wrong|please try again|contact support/i.test(text)) {
    void sendLog('upload-error-detected', { text });
    return text;
  }

  return null;
}

async function waitForResult(timeoutMs = VERIFY_RESULT_TIMEOUT_MS) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const uploadError = extractUploadError();
    if (uploadError) {
      throw new Error(uploadError);
    }

    const result = extractResult();
    if (result) {
      return result;
    }

    await sleep(500);
  }

  throw new Error('Timed out waiting for OpenAI Verify result');
}

async function executeVerification(requestId, imageUrl, fileName, mimeType, bytes) {
  log('Starting OpenAI Verify automation', { requestId, imageUrl, fileName, mimeType });
  await sendLog('execute-start', { requestId, imageUrl, fileName, mimeType });
  await resetVerifierState();
  await sendLog('verifier-reset', { requestId });
  const input = await waitForSelector('input[type="file"][accept*="image/"]');
  await sendLog('file-input-ready', { requestId, inputId: input.id || null });
  logTurnstileTokenStatus();
  await sleep(2000);
  const file = buildFileFromPayload(imageUrl, fileName, mimeType, bytes);
  log('Uploading image into verifier', { filename: file.name, size: file.size, type: file.type });
  await sendLog('uploading-file', { requestId, filename: file.name, size: file.size, type: file.type });
  setFileInputFile(input, file);
  const result = await waitForResult();
  log('OpenAI Verify produced result', { requestId, result });
  await sendLog('result-detected', { requestId, result });
  void sendMessage({ type: 'stardance-utils-openai-result', requestId, ok: true, result }).catch(() => {});
}

function installMessageListener() {
  const runtime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime ?? null;
  if (!runtime?.onMessage) {
    return;
  }

  runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'stardance-utils-openai-ping') {
      void sendLog('ping', { ok: true });
      sendResponse({ ok: true });
      return false;
    }

    if (message?.type !== 'stardance-utils-openai-execute' || !message.imageUrl) {
      return false;
    }

    const requestId = message.requestId || Math.random().toString(36).slice(2);

    executeVerification(requestId, message.imageUrl, message.fileName, message.mimeType, message.bytes)
      .catch(async (error) => {
        log('OpenAI Verify automation failed', { requestId, error: error?.message || String(error) });
        await sendLog('execute-failed', { requestId, error: error?.message || String(error) });
        void sendMessage({
          type: 'stardance-utils-openai-result',
          requestId,
          ok: false,
          error: {
            message: error?.message || 'OpenAI Verify automation failed.'
          }
        }).catch(() => {});
      });

    sendResponse({ ok: true, requestId });
    return false;
  });
}

installMessageListener();
