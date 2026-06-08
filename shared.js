(() => {
  const SU = globalThis.StardanceUtils = globalThis.StardanceUtils || {};

  Object.assign(SU, {
    FONT_PAIRING_KEY: 'sidebarFontPairing',
    THEME_KEY: 'siteTheme',
    TRY_MODE_PENDING_KEY: 'sidebarFontTryModePending',
    FONT_CLASS: 'stardance-utils-fonts-enabled',
    MODAL_ATTR: 'data-stardance-utils-enhanced',
    GOOGLE_FONT_LINK_ID: 'stardance-utils-google-fonts',
    FONTSHARE_LINK_ID: 'stardance-utils-fontshare-fonts',
    TRY_PANEL_ID: 'stardance-utils-try-panel',
    REORDER_BANNER_ID: 'stardance-utils-reorder-banner',
    HOME_PAGE_CLASS: 'stardance-utils-home-page',
    CUSTOM_THEME_CLASS: 'stardance-utils-theme-custom',
    FEED_AI_ATTR: 'data-stardance-utils-ai',
    FEED_AI_BUTTON_ATTR: 'data-stardance-utils-ai-button',
    FEED_AI_BUTTON_WRAP_ATTR: 'data-stardance-utils-ai-button-wrap',
    AI_LOG_PREFIX: '[Stardance Utils AI]',
    AI_BUTTON_RESET_MS: 3000,
    INLINE_COMPOSER_ATTR: 'data-stardance-utils-inline-composer',
    DEVLOG_SPEECH_ATTR: 'data-stardance-utils-speech',
    DEVLOG_INLINE_EDIT_LINK_ATTR: 'data-stardance-utils-inline-edit-link',
    DEVLOG_DRAFT_ATTR: 'data-stardance-utils-draft',
    DEVLOG_SLACK_EMOJI_ATTR: 'data-stardance-utils-slack-emoji',
    SLACK_EMOJI_API_URL: 'https://cachet.dunkirk.sh/emojis',
    CUSTOM_FONT_PAIRINGS_KEY: 'customSidebarFontPairings',
    SIDEBAR_ORDER_KEY: 'sidebarTabOrder',
    PROJECT_PINNED_IDS_KEY: 'pinnedProjectIds',
    SHOP_GOALS_KEY: 'shopGoals',
    SHOP_GOALS_SYNC_META_KEY: 'shopGoals:meta',
    SHOP_GOALS_SYNC_CHUNK_PREFIX: 'shopGoals:chunk:',
    SHOP_GOALS_LOCAL_FALLBACK_KEY: 'shopGoals:localFallback',
    SHOP_LAYOUT_ENABLED_KEY: 'shopLayoutEnabled',
    SHOP_LAYOUT_RAIL_KEY: 'shopLayoutUseRail',
    SHOP_ORDERS_BUTTON_KEY: 'shopOrdersButtonEnabled',
    ONBOARDING_KEY: 'onboardingState',
    ONBOARDING_VERSION: 1,
    ONBOARDING_ROOT_ID: 'stardance-utils-onboarding',
    ONBOARDING_ACTIVE_CLASS: 'stardance-utils-onboarding-active',
    FONT_DATALIST_ID: 'stardance-utils-font-suggestions',
    STARDANCE_DEFAULT_FONT_PAIRING: 'stardance-defaults',
    DEFAULT_FONT_PAIRING: 'outfit-instrument',
    DEFAULT_THEME: 'default',
    TRY_MODE_FALLBACK_PATH: '/home',
    SIDEBAR_REORDER_CLASS: 'stardance-utils-sidebar-reordering'
  });

  SU.SYNC_ITEM_SAFE_BYTES = 7000;
  SU.SYNC_TOTAL_SAFE_BYTES = 95000;

  SU.FONTSHARE_FONT_CATALOG = [
    { name: 'Switzer', slug: 'switzer', fallback: 'sans-serif' },
    { name: 'General Sans', slug: 'general-sans', fallback: 'sans-serif' },
    { name: 'Cabinet Grotesk', slug: 'cabinet-grotesk', fallback: 'sans-serif' },
    { name: 'Satoshi', slug: 'satoshi', fallback: 'sans-serif' },
    { name: 'Clash Display', slug: 'clash-display', fallback: 'sans-serif' },
    { name: 'Clash Grotesk', slug: 'clash-grotesk', fallback: 'sans-serif' },
    { name: 'Stardom', slug: 'stardom', fallback: 'serif' },
    { name: 'Melodrama', slug: 'melodrama', fallback: 'serif' },
    { name: 'Gambetta', slug: 'gambetta', fallback: 'serif' },
    { name: 'Sentient', slug: 'sentient', fallback: 'serif' },
    { name: 'Zodiak', slug: 'zodiak', fallback: 'serif' },
    { name: 'Bonny', slug: 'bonny', fallback: 'serif' },
    { name: 'Boska', slug: 'boska', fallback: 'serif' },
    { name: 'Author', slug: 'author', fallback: 'sans-serif' },
    { name: 'Ranade', slug: 'ranade', fallback: 'sans-serif' },
    { name: 'Supa Grotesk', slug: 'supa-grotesk', fallback: 'sans-serif' },
    { name: 'Supa', slug: 'supa', fallback: 'serif' },
    { name: 'Technor', slug: 'technor', fallback: 'sans-serif' },
    { name: 'Telma', slug: 'telma', fallback: 'serif' },
    { name: 'Bespoke Sans', slug: 'bespoke-sans', fallback: 'sans-serif' },
    { name: 'Bespoke Serif', slug: 'bespoke-serif', fallback: 'serif' },
    { name: 'Pencerio', slug: 'pencerio', fallback: 'serif' },
    { name: 'Comico', slug: 'comico', fallback: 'sans-serif' },
    { name: 'Chillax', slug: 'chillax', fallback: 'sans-serif' }
  ];

  SU.LOCAL_SETTINGS_PREFIX = 'stardance-utils:';
  SU.SYNC_SETTINGS_KEYS = new Set([
    SU.THEME_KEY,
    SU.FONT_PAIRING_KEY,
    SU.CUSTOM_FONT_PAIRINGS_KEY,
    SU.SIDEBAR_ORDER_KEY,
    SU.PROJECT_PINNED_IDS_KEY,
    SU.SHOP_GOALS_KEY,
    SU.SHOP_LAYOUT_ENABLED_KEY,
    SU.SHOP_LAYOUT_RAIL_KEY,
    SU.SHOP_ORDERS_BUTTON_KEY
  ]);
  SU.LOCAL_ONLY_SETTINGS_KEYS = new Set([
    SU.TRY_MODE_PENDING_KEY,
    SU.ONBOARDING_KEY
  ]);
  SU.LEGACY_LOCAL_STORAGE_KEYS = new Set([
    ...SU.SYNC_SETTINGS_KEYS,
    ...SU.LOCAL_ONLY_SETTINGS_KEYS
  ]);

  SU.savedFontPairing = SU.DEFAULT_FONT_PAIRING;
  SU.previewFontPairing = null;
  SU.savedTheme = SU.DEFAULT_THEME;
  SU.previewTheme = null;
  SU.customFontPairings = [];
  SU.savedSidebarOrder = [];
  SU.savedPinnedProjectIds = [];
  SU.savedShopGoals = {};
  SU.savedShopLayoutEnabled = true;
  SU.savedShopLayoutUseRail = true;
  SU.savedShopOrdersButtonEnabled = true;
  SU.onboardingState = null;
  SU.googleFontCatalog = null;
  SU.googleFontCatalogPromise = null;
  SU.draggedSidebarItemId = null;
  SU.slackEmojiCache = null;
  SU.slackEmojiRequestPromise = null;
  SU.extensionLocalStorage = globalThis.browser?.storage?.local ?? globalThis.chrome?.storage?.local ?? null;
  SU.extensionSyncStorage = globalThis.browser?.storage?.sync ?? globalThis.chrome?.storage?.sync ?? null;
  SU.extensionStorageEvents = globalThis.browser?.storage?.onChanged ?? globalThis.chrome?.storage?.onChanged ?? null;
  SU.extensionRuntime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime ?? null;
  SU.aiButtonResetTimers = new WeakMap();

  SU.isSyncSettingKey = (key) => SU.SYNC_SETTINGS_KEYS.has(key);

  SU.isLocalOnlySettingKey = (key) => SU.LOCAL_ONLY_SETTINGS_KEYS.has(key);

  SU.usesLegacyLocalStorage = (key) => SU.LEGACY_LOCAL_STORAGE_KEYS.has(key);

  SU.getPreferredStorageArea = (key) => {
    if (SU.isSyncSettingKey(key) && SU.extensionSyncStorage) {
      return 'sync';
    }

    return 'local';
  };

  SU.getSerializedByteSize = (value) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(text).length;
    }
    return text.length;
  };

  SU.getStorageItemSizeEstimate = (key, value) => key.length + SU.getSerializedByteSize(value);

  SU.isShopGoalsShardKey = (key) => key === SU.SHOP_GOALS_SYNC_META_KEY || key.startsWith(SU.SHOP_GOALS_SYNC_CHUNK_PREFIX);

  SU.getLocalStorageKey = (key) => `${SU.LOCAL_SETTINGS_PREFIX}${key}`;

  SU.readLocalSetting = (key) => {
    try {
      const rawValue = window.localStorage.getItem(SU.getLocalStorageKey(key));
      return rawValue === null ? undefined : JSON.parse(rawValue);
    } catch {
      return undefined;
    }
  };

  SU.writeLocalSetting = (key, value) => {
    try {
      window.localStorage.setItem(SU.getLocalStorageKey(key), JSON.stringify(value));
    } catch {
      // Ignore localStorage access failures.
    }
  };

  SU.clearLocalSetting = (key) => {
    try {
      window.localStorage.removeItem(SU.getLocalStorageKey(key));
    } catch {
      // Ignore localStorage access failures.
    }
  };

  SU.readRawLocalStorageValue = (key) => {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? undefined : value;
    } catch {
      return undefined;
    }
  };

  SU.clearRawLocalStorageValue = (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore localStorage access failures.
    }
  };

  SU.getOnboardingState = () => {
    const state = SU.readLocalSetting(SU.ONBOARDING_KEY);
    if (!state || typeof state !== 'object') {
      return {
        version: SU.ONBOARDING_VERSION,
        started: false,
        completed: false,
        dismissed: false,
        stepId: null,
        context: {},
        lastUpdatedAt: 0
      };
    }

    return {
      version: Number.isFinite(state.version) ? state.version : SU.ONBOARDING_VERSION,
      started: state.started === true,
      completed: state.completed === true,
      dismissed: state.dismissed === true,
      stepId: typeof state.stepId === 'string' ? state.stepId : null,
      context: state.context && typeof state.context === 'object' ? state.context : {},
      lastUpdatedAt: Number.isFinite(state.lastUpdatedAt) ? state.lastUpdatedAt : 0
    };
  };

  SU.setOnboardingState = (partial = {}) => {
    const current = SU.getOnboardingState();
    const next = {
      ...current,
      ...partial,
      context: {
        ...current.context,
        ...(partial.context && typeof partial.context === 'object' ? partial.context : {})
      },
      version: SU.ONBOARDING_VERSION,
      lastUpdatedAt: Date.now()
    };

    SU.onboardingState = next;
    SU.writeLocalSetting(SU.ONBOARDING_KEY, next);
    return next;
  };

  SU.resetOnboardingState = () => {
    SU.clearLocalSetting(SU.ONBOARDING_KEY);
    SU.onboardingState = {
      version: SU.ONBOARDING_VERSION,
      started: false,
      completed: false,
      dismissed: false,
      stepId: null,
      context: {},
      lastUpdatedAt: 0
    };
    return SU.onboardingState;
  };

  SU.completeOnboarding = () => SU.setOnboardingState({
    started: true,
    completed: true,
    dismissed: false,
    stepId: null,
    context: {}
  });

  SU.dismissOnboarding = () => SU.setOnboardingState({
    started: true,
    completed: false,
    dismissed: true,
    stepId: null,
    context: {}
  });

  SU.shouldAutoStartOnboarding = () => {
    const state = SU.getOnboardingState();
    return !state.completed && !state.dismissed && !state.started && state.lastUpdatedAt === 0;
  };

  SU.getExtensionStorageArea = (area) => {
    if (area === 'sync' && SU.extensionSyncStorage) {
      return SU.extensionSyncStorage;
    }

    return SU.extensionLocalStorage;
  };

  SU.runChromeStorageCallback = (operation) => new Promise((resolve, reject) => {
    operation((result) => {
      const lastError = globalThis.chrome?.runtime?.lastError ?? SU.extensionRuntime?.lastError;
      if (lastError) {
        reject(new Error(lastError.message || 'Extension storage operation failed'));
        return;
      }

      resolve(result);
    });
  });

  SU.getExtensionStoredSetting = (key, area = 'local') => {
    const storageArea = SU.getExtensionStorageArea(area);
    if (!storageArea) {
      return Promise.resolve(undefined);
    }

    if (globalThis.browser?.storage?.[area]) {
      return globalThis.browser.storage[area].get(key).then((result) => result?.[key]);
    }

    return SU.runChromeStorageCallback((callback) => {
      storageArea.get(key, callback);
    }).then((result) => result?.[key]);
  };

  SU.setExtensionStoredSetting = (values, area = 'local') => {
    const storageArea = SU.getExtensionStorageArea(area);
    if (!storageArea) {
      return Promise.resolve();
    }

    if (globalThis.browser?.storage?.[area]) {
      return globalThis.browser.storage[area].set(values);
    }

    return SU.runChromeStorageCallback((callback) => {
      storageArea.set(values, callback);
    }).then(() => undefined);
  };

  SU.removeExtensionStoredSetting = (key, area = 'local') => {
    const storageArea = SU.getExtensionStorageArea(area);
    if (!storageArea) {
      return Promise.resolve();
    }

    if (globalThis.browser?.storage?.[area]) {
      return globalThis.browser.storage[area].remove(key);
    }

    return SU.runChromeStorageCallback((callback) => {
      storageArea.remove(key, callback);
    }).then(() => undefined);
  };

  SU.getExtensionStoredSettings = (keys, area = 'local') => {
    const storageArea = SU.getExtensionStorageArea(area);
    if (!storageArea || !Array.isArray(keys) || keys.length === 0) {
      return Promise.resolve({});
    }

    if (globalThis.browser?.storage?.[area]) {
      return globalThis.browser.storage[area].get(keys);
    }

    return SU.runChromeStorageCallback((callback) => {
      storageArea.get(keys, callback);
    });
  };

  SU.getLocalOnlyStoredValue = async (key, legacyLocalStorageKey = null) => {
    const value = await SU.getExtensionStoredSetting(key, 'local');
    if (value !== undefined) {
      return value;
    }

    if (!legacyLocalStorageKey) {
      return undefined;
    }

    const legacyValue = SU.readRawLocalStorageValue(legacyLocalStorageKey);
    if (legacyValue === undefined) {
      return undefined;
    }

    await SU.setExtensionStoredSetting({ [key]: legacyValue }, 'local');
    SU.clearRawLocalStorageValue(legacyLocalStorageKey);
    return legacyValue;
  };

  SU.setLocalOnlyStoredValue = async (key, value, legacyLocalStorageKey = null) => {
    if (value === undefined || value === null || value === '') {
      await SU.removeExtensionStoredSetting(key, 'local');
    } else {
      await SU.setExtensionStoredSetting({ [key]: value }, 'local');
    }

    if (legacyLocalStorageKey) {
      SU.clearRawLocalStorageValue(legacyLocalStorageKey);
    }
  };

  SU.removeLocalOnlyStoredValue = async (key, legacyLocalStorageKey = null) => {
    await SU.removeExtensionStoredSetting(key, 'local');
    if (legacyLocalStorageKey) {
      SU.clearRawLocalStorageValue(legacyLocalStorageKey);
    }
  };

  SU.migrateLegacyStoredValue = async (key, area, value) => {
    await SU.setExtensionStoredSetting({ [key]: value }, area);

    if (SU.usesLegacyLocalStorage(key)) {
      SU.clearLocalSetting(key);
    }

    if (area === 'sync') {
      void SU.removeExtensionStoredSetting(key, 'local');
    }

    return value;
  };

  SU.buildShopGoalSyncChunks = (goals) => {
    const entries = Object.entries(goals || {});
    const chunks = [];
    let currentChunk = {};
    let currentIndex = 0;

    const flushChunk = () => {
      const chunkKey = `${SU.SHOP_GOALS_SYNC_CHUNK_PREFIX}${currentIndex}`;
      chunks.push([chunkKey, currentChunk]);
      currentChunk = {};
      currentIndex += 1;
    };

    entries.forEach(([goalId, goalValue]) => {
      const nextChunk = {
        ...currentChunk,
        [goalId]: goalValue
      };
      const nextChunkKey = `${SU.SHOP_GOALS_SYNC_CHUNK_PREFIX}${currentIndex}`;

      if (Object.keys(currentChunk).length > 0 && SU.getStorageItemSizeEstimate(nextChunkKey, nextChunk) > SU.SYNC_ITEM_SAFE_BYTES) {
        flushChunk();
      }

      currentChunk[goalId] = goalValue;

      if (SU.getStorageItemSizeEstimate(`${SU.SHOP_GOALS_SYNC_CHUNK_PREFIX}${currentIndex}`, currentChunk) > SU.SYNC_ITEM_SAFE_BYTES) {
        throw new Error(`Shop goals entry ${goalId} is too large to fit into sync storage even when isolated`);
      }
    });

    if (Object.keys(currentChunk).length > 0) {
      flushChunk();
    }

    return chunks;
  };

  SU.getShopGoalsLocalFallbackFlag = () => SU.getExtensionStoredSetting(SU.SHOP_GOALS_LOCAL_FALLBACK_KEY, 'local');

  SU.setShopGoalsLocalFallbackFlag = (enabled) => {
    if (enabled) {
      return SU.setExtensionStoredSetting({ [SU.SHOP_GOALS_LOCAL_FALLBACK_KEY]: true }, 'local');
    }

    return SU.removeExtensionStoredSetting(SU.SHOP_GOALS_LOCAL_FALLBACK_KEY, 'local');
  };

  SU.getShardedSyncSetting = async (key) => {
    if (key !== SU.SHOP_GOALS_KEY) {
      return SU.getExtensionStoredSetting(key, 'sync');
    }

    const meta = await SU.getExtensionStoredSetting(SU.SHOP_GOALS_SYNC_META_KEY, 'sync');
    if (meta?.chunkKeys && Array.isArray(meta.chunkKeys) && meta.chunkKeys.length > 0) {
      const chunkValues = await SU.getExtensionStoredSettings(meta.chunkKeys, 'sync');
      return meta.chunkKeys.reduce((acc, chunkKey) => {
        const chunk = chunkValues?.[chunkKey];
        if (chunk && typeof chunk === 'object') {
          Object.assign(acc, chunk);
        }
        return acc;
      }, {});
    }

    return SU.getExtensionStoredSetting(key, 'sync');
  };

  SU.setShardedSyncSetting = async (key, value) => {
    if (key !== SU.SHOP_GOALS_KEY) {
      await SU.setExtensionStoredSetting({ [key]: value }, 'sync');
      return;
    }

    const currentMeta = await SU.getExtensionStoredSetting(SU.SHOP_GOALS_SYNC_META_KEY, 'sync');
    const previousChunkKeys = Array.isArray(currentMeta?.chunkKeys) ? currentMeta.chunkKeys : [];
    const chunks = SU.buildShopGoalSyncChunks(value || {});

    if (chunks.length === 0) {
      await SU.removeShardedSyncSetting(key);
      return;
    }

    const syncValues = Object.fromEntries(chunks);
    syncValues[SU.SHOP_GOALS_SYNC_META_KEY] = {
      version: 1,
      chunkKeys: chunks.map(([chunkKey]) => chunkKey)
    };

    const totalSize = Object.entries(syncValues).reduce((sum, [chunkKey, chunkValue]) => (
      sum + SU.getStorageItemSizeEstimate(chunkKey, chunkValue)
    ), 0);

    const fallbackToLocal = async () => {
      await SU.removeShardedSyncSetting(key);
      await SU.setExtensionStoredSetting({ [SU.SHOP_GOALS_KEY]: value }, 'local');
      await SU.setShopGoalsLocalFallbackFlag(true);
    };

    if (totalSize > SU.SYNC_TOTAL_SAFE_BYTES) {
      await fallbackToLocal();
      return;
    }

    try {
      await SU.setExtensionStoredSetting(syncValues, 'sync');
    } catch (error) {
      await fallbackToLocal();
      return;
    }

    const staleChunkKeys = previousChunkKeys.filter((chunkKey) => !syncValues[chunkKey]);
    if (staleChunkKeys.length > 0) {
      await Promise.all(staleChunkKeys.map((chunkKey) => SU.removeExtensionStoredSetting(chunkKey, 'sync')));
    }

    await SU.removeExtensionStoredSetting(SU.SHOP_GOALS_KEY, 'sync');
    await SU.removeExtensionStoredSetting(SU.SHOP_GOALS_KEY, 'local');
    await SU.setShopGoalsLocalFallbackFlag(false);
  };

  SU.removeShardedSyncSetting = async (key) => {
    if (key !== SU.SHOP_GOALS_KEY) {
      await SU.removeExtensionStoredSetting(key, 'sync');
      return;
    }

    const meta = await SU.getExtensionStoredSetting(SU.SHOP_GOALS_SYNC_META_KEY, 'sync');
    const chunkKeys = Array.isArray(meta?.chunkKeys) ? meta.chunkKeys : [];
    const removals = chunkKeys.map((chunkKey) => SU.removeExtensionStoredSetting(chunkKey, 'sync'));
    removals.push(SU.removeExtensionStoredSetting(SU.SHOP_GOALS_SYNC_META_KEY, 'sync'));
    removals.push(SU.removeExtensionStoredSetting(SU.SHOP_GOALS_KEY, 'sync'));
    removals.push(SU.removeExtensionStoredSetting(SU.SHOP_GOALS_KEY, 'local'));
    removals.push(SU.setShopGoalsLocalFallbackFlag(false));
    await Promise.all(removals);
  };

  SU.ensureFontLink = () => {
    if (!document.getElementById(SU.GOOGLE_FONT_LINK_ID)) {
      const googleLink = document.createElement('link');
      googleLink.id = SU.GOOGLE_FONT_LINK_ID;
      googleLink.rel = 'stylesheet';
      googleLink.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700&family=Instrument+Serif:ital@0;1&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
      document.head.appendChild(googleLink);
    }

    if (!document.getElementById(SU.FONTSHARE_LINK_ID)) {
      const fontshareLink = document.createElement('link');
      fontshareLink.id = SU.FONTSHARE_LINK_ID;
      fontshareLink.rel = 'stylesheet';
      fontshareLink.href = 'https://api.fontshare.com/v2/css?f[]=switzer@400,500,700&f[]=general-sans@400,500,700&f[]=cabinet-grotesk@400,500,700&f[]=satoshi@400,500,700&display=swap';
      document.head.appendChild(fontshareLink);
    }
  };

  SU.getStoredSetting = (key) => {
    const preferredArea = SU.getPreferredStorageArea(key);

    const readPreferredValue = preferredArea === 'sync' && key === SU.SHOP_GOALS_KEY
      ? SU.getShardedSyncSetting(key)
      : SU.getExtensionStoredSetting(key, preferredArea);

    return readPreferredValue.then(async (value) => {
      if (value !== undefined) {
        return value;
      }

      if (SU.usesLegacyLocalStorage(key)) {
        const localValue = SU.readLocalSetting(key);
        if (localValue !== undefined) {
          return SU.migrateLegacyStoredValue(key, preferredArea, localValue);
        }
      }

      if (preferredArea === 'sync') {
        const localAreaValue = await SU.getExtensionStoredSetting(key, 'local');
        if (localAreaValue !== undefined) {
          if (key === SU.SHOP_GOALS_KEY && await SU.getShopGoalsLocalFallbackFlag()) {
            return localAreaValue;
          }
          return SU.migrateLegacyStoredValue(key, 'sync', localAreaValue);
        }
      }

      return undefined;
    });
  };

  SU.getStoredSettings = async (keys) => {
    const entries = await Promise.all(keys.map(async (key) => [key, await SU.getStoredSetting(key)]));
    return Object.fromEntries(entries);
  };

  SU.setStoredSetting = (values) => {
    const localValues = {};
    const syncValues = {};
    const shardedSyncValues = {};

    Object.entries(values).forEach(([key, value]) => {
      if (SU.getPreferredStorageArea(key) === 'sync') {
        if (key === SU.SHOP_GOALS_KEY) {
          shardedSyncValues[key] = value;
        } else {
          syncValues[key] = value;
        }
      } else {
        localValues[key] = value;
      }
    });

    const writes = [];
    if (Object.keys(localValues).length > 0) {
      writes.push(SU.setExtensionStoredSetting(localValues, 'local'));
    }
    if (Object.keys(syncValues).length > 0) {
      writes.push(SU.setExtensionStoredSetting(syncValues, 'sync'));
    }
    if (Object.keys(shardedSyncValues).length > 0) {
      writes.push(...Object.entries(shardedSyncValues).map(([key, value]) => SU.setShardedSyncSetting(key, value)));
    }

    return Promise.all(writes).then(() => {
      Object.keys(values).forEach((key) => {
        if (SU.usesLegacyLocalStorage(key)) {
          SU.clearLocalSetting(key);
        }
        if (SU.getPreferredStorageArea(key) === 'sync') {
          void SU.removeExtensionStoredSetting(key, 'local');
        }
      });
    });
  };

  SU.removeStoredSetting = (key) => {
    if (SU.usesLegacyLocalStorage(key)) {
      SU.clearLocalSetting(key);
    }

    const removals = [
      SU.getPreferredStorageArea(key) === 'sync' && key === SU.SHOP_GOALS_KEY
        ? SU.removeShardedSyncSetting(key)
        : SU.removeExtensionStoredSetting(key, SU.getPreferredStorageArea(key))
    ];
    if (SU.getPreferredStorageArea(key) === 'sync') {
      removals.push(SU.removeExtensionStoredSetting(key, 'local'));
    }

    return Promise.all(removals).then(() => undefined);
  };

  SU.normalizeFontName = (value) => value.trim().replace(/\s+/g, ' ').toLowerCase();

  SU.inferFallbackFromCategory = (category) => (
    typeof category === 'string' && category.toLowerCase().includes('serif') ? 'serif' : 'sans-serif'
  );

  SU.ensureGoogleFontCatalog = async () => {
    if (SU.googleFontCatalog) {
      return SU.googleFontCatalog;
    }

    if (!SU.googleFontCatalogPromise) {
      SU.googleFontCatalogPromise = fetch('https://fonts.google.com/metadata/fonts')
        .then((response) => response.text())
        .then((text) => {
          const jsonStart = text.indexOf('{');
          const metadata = JSON.parse(text.slice(jsonStart));
          SU.googleFontCatalog = (metadata.familyMetadataList ?? []).map((family) => ({
            name: family.family,
            source: 'google',
            fallback: SU.inferFallbackFromCategory(family.category)
          }));
          return SU.googleFontCatalog;
        })
        .catch(() => {
          SU.googleFontCatalog = [];
          return SU.googleFontCatalog;
        });
    }

    return SU.googleFontCatalogPromise;
  };

  SU.ensureFontFamilyLoaded = (family) => {
    if (!family?.name || !family?.source) {
      return;
    }

    const fontId = `stardance-utils-font-${family.source}-${SU.normalizeFontName(family.name).replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(fontId)) {
      return;
    }

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';

    if (family.source === 'fontshare') {
      const slug = family.slug ?? SU.normalizeFontName(family.name).replace(/\s+/g, '-');
      link.href = `https://api.fontshare.com/v2/css?f[]=${slug}@400,500,600,700&display=swap`;
    } else {
      const familyName = family.name.replace(/\s+/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${familyName}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap`;
    }

    document.head.appendChild(link);
  };

  SU.syncPageClasses = () => {
    document.documentElement.classList.toggle(SU.HOME_PAGE_CLASS, Boolean(document.querySelector('.feed-home')));
  };
})();
