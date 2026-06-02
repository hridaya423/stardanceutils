const AI_VERIFY_URL = 'https://openai.com/research/verify/';
const AI_LOG_PREFIX = '[Stardance Utils AI Background]';
const VERIFY_READY_TIMEOUT_MS = 45000;
const VERIFY_RESULT_TIMEOUT_MS = 90000;
const AI_JOB_QUEUE = [];

let activeAiJobs = 0;
const pendingVerifierRequests = new Map();

function logAi(message, data) {
  if (data === undefined) {
    console.debug(AI_LOG_PREFIX, message);
    return;
  }

  console.debug(AI_LOG_PREFIX, message, data);
}

function queueAiJob(job) {
  return new Promise((resolve, reject) => {
    AI_JOB_QUEUE.push({ job, resolve, reject });
    runNextAiJob();
  });
}

function runNextAiJob() {
  if (activeAiJobs >= 2 || AI_JOB_QUEUE.length === 0) {
    return;
  }

  const next = AI_JOB_QUEUE.shift();
  if (!next) {
    return;
  }

  activeAiJobs += 1;
  logAi('Starting queued AI job', { activeAiJobs, queuedJobs: AI_JOB_QUEUE.length });
  next.job()
    .then(next.resolve, next.reject)
    .finally(() => {
      activeAiJobs -= 1;
      logAi('Finished queued AI job', { activeAiJobs, queuedJobs: AI_JOB_QUEUE.length });
      runNextAiJob();
    });
}

async function fetchImageInfo(imageUrl) {
  return {
    imageUrl,
    contentType: null,
    size: null
  };
}

function getTabsApi() {
  return globalThis.browser?.tabs ?? globalThis.chrome?.tabs ?? null;
}

function getRuntimeApi() {
  return globalThis.browser?.runtime ?? globalThis.chrome?.runtime ?? null;
}

function createTab(details) {
  const tabs = getTabsApi();
  if (!tabs) {
    return Promise.reject(new Error('Tabs API unavailable'));
  }

  if (tabs.create.length <= 1) {
    return tabs.create(details);
  }

  return new Promise((resolve, reject) => {
    tabs.create(details, (tab) => {
      const error = globalThis.chrome?.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(tab);
    });
  });
}

function getTab(tabId) {
  const tabs = getTabsApi();
  if (!tabs) {
    return Promise.reject(new Error('Tabs API unavailable'));
  }

  if (tabs.get.length <= 1) {
    return tabs.get(tabId);
  }

  return new Promise((resolve, reject) => {
    tabs.get(tabId, (tab) => {
      const error = globalThis.chrome?.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(tab);
    });
  });
}

function updateTab(tabId, properties) {
  const tabs = getTabsApi();
  if (!tabs) {
    return Promise.reject(new Error('Tabs API unavailable'));
  }

  if (tabs.update.length <= 2) {
    return tabs.update(tabId, properties);
  }

  return new Promise((resolve, reject) => {
    tabs.update(tabId, properties, (tab) => {
      const error = globalThis.chrome?.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(tab);
    });
  });
}

function removeTab(tabId) {
  const tabs = getTabsApi();
  if (!tabs) {
    return Promise.reject(new Error('Tabs API unavailable'));
  }

  if (tabs.remove.length <= 1) {
    return tabs.remove(tabId);
  }

  return new Promise((resolve, reject) => {
    tabs.remove(tabId, () => {
      const error = globalThis.chrome?.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve();
    });
  });
}

function queryTabs(queryInfo) {
  const tabs = getTabsApi();
  if (!tabs) {
    return Promise.reject(new Error('Tabs API unavailable'));
  }

  if (tabs.query.length <= 1) {
    return tabs.query(queryInfo);
  }

  return new Promise((resolve, reject) => {
    tabs.query(queryInfo, (foundTabs) => {
      const error = globalThis.chrome?.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(foundTabs || []);
    });
  });
}

function sendTabMessage(tabId, message) {
  const tabs = getTabsApi();
  if (!tabs) {
    return Promise.reject(new Error('Tabs API unavailable'));
  }

  if (tabs.sendMessage.length <= 2) {
    return tabs.sendMessage(tabId, message);
  }

  return new Promise((resolve, reject) => {
    tabs.sendMessage(tabId, message, (response) => {
      const error = globalThis.chrome?.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });
}

function resolvePendingRequest(requestId, payload) {
  const pending = pendingVerifierRequests.get(requestId);
  if (!pending) {
    return;
  }

  clearTimeout(pending.timeoutId);
  pendingVerifierRequests.delete(requestId);
  pending.resolve(payload);
}

function rejectPendingRequest(requestId, errorMessage) {
  const pending = pendingVerifierRequests.get(requestId);
  if (!pending) {
    return;
  }

  clearTimeout(pending.timeoutId);
  pendingVerifierRequests.delete(requestId);
  pending.reject(new Error(errorMessage));
}

async function ensureVerifierTab() {
  const existingTabs = await queryTabs({ url: `${AI_VERIFY_URL}*` }).catch(() => []);
  const existingTab = existingTabs.find((tab) => tab?.id !== undefined);
  if (existingTab?.id !== undefined) {
    await updateTab(existingTab.id, { active: true, pinned: true, url: AI_VERIFY_URL });
    logAi('Reusing existing verifier tab', { verifierTabId: existingTab.id });
    return existingTab.id;
  }

  const tab = await createTab({ url: AI_VERIFY_URL, active: true, pinned: true, index: 0 });
  const verifierTabId = tab?.id ?? null;
  logAi('Opened verifier tab', { verifierTabId });
  if (verifierTabId === null) {
    throw new Error('Failed to create verifier tab');
  }
  return verifierTabId;
}

async function waitForVerifierReady(tabId) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < VERIFY_READY_TIMEOUT_MS) {
    try {
      const response = await sendTabMessage(tabId, { type: 'stardance-utils-openai-ping' });
      if (response?.ok) {
        logAi('Verifier tab responded to ping', { tabId });
        return;
      }
    } catch {
      // Content script may not be ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error('OpenAI verifier tab did not become ready in time');
}

async function runOpenAiToolCheck(imageUrl, fileName, mimeType, bytes, sourceTabId) {
  const imageInfo = {
    ...(await fetchImageInfo(imageUrl)),
    contentType: mimeType,
    size: Array.isArray(bytes) ? bytes.length : bytes?.byteLength ?? null,
    fileName
  };
  logAi('Fetched image info for AI check', imageInfo);

  const tabId = await ensureVerifierTab();
  await waitForVerifierReady(tabId);

  const requestId = Math.random().toString(36).slice(2) + Date.now().toString(36);

  const resultPromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      rejectPendingRequest(requestId, 'OpenAI verification timed out while waiting for a result');
    }, VERIFY_RESULT_TIMEOUT_MS);

    pendingVerifierRequests.set(requestId, { resolve, reject, timeoutId, imageInfo });
  });

  const ack = await sendTabMessage(tabId, {
    type: 'stardance-utils-openai-execute',
    requestId,
    imageUrl,
    fileName,
    mimeType,
    bytes
  });

  if (!ack?.ok) {
    pendingVerifierRequests.delete(requestId);
    throw new Error(ack?.error?.message || 'OpenAI verifier tab failed to accept the job');
  }

  try {
    const response = await resultPromise;
    return {
      ...response,
      image: imageInfo,
      provider: 'openai-verify'
    };
  } finally {
    await removeTab(tabId).catch(() => {});
    if (typeof sourceTabId === 'number') {
      await updateTab(sourceTabId, { active: true }).catch(() => {});
    }
  }
}

function addMessageListener(api) {
  api.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'stardance-utils-ai-check' && message.imageUrl && message.bytes) {
      queueAiJob(() => runOpenAiToolCheck(message.imageUrl, message.fileName, message.mimeType, message.bytes, _sender?.tab?.id))
        .then((result) => sendResponse({ ok: true, result }))
        .catch((error) => sendResponse({
          ok: false,
          error: {
            name: error?.name || 'Error',
            message: error?.message || String(error)
          }
        }));

      return true;
    }

    if (message?.type === 'stardance-utils-openai-log') {
      logAi('Verifier tab log', message.payload);
      sendResponse({ ok: true });
      return false;
    }

    if (message?.type === 'stardance-utils-openai-result' && typeof message.requestId === 'string') {
      if (message.ok) {
        resolvePendingRequest(message.requestId, message.result);
      } else {
        rejectPendingRequest(message.requestId, message.error?.message || 'OpenAI verifier tab reported a failure');
      }
      sendResponse({ ok: true });
      return false;
    }

    return false;
  });
}

const runtimeApi = getRuntimeApi();
if (runtimeApi?.onMessage) {
  addMessageListener(runtimeApi);
}
