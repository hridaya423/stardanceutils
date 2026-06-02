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
    FONT_DATALIST_ID: 'stardance-utils-font-suggestions',
    DEFAULT_FONT_PAIRING: 'outfit-instrument',
    DEFAULT_THEME: 'default',
    TRY_MODE_FALLBACK_PATH: '/home',
    SIDEBAR_REORDER_CLASS: 'stardance-utils-sidebar-reordering'
  });

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
  SU.LOCAL_SETTINGS_KEYS = new Set([
    SU.THEME_KEY,
    SU.FONT_PAIRING_KEY,
    SU.TRY_MODE_PENDING_KEY,
    SU.CUSTOM_FONT_PAIRINGS_KEY,
    SU.SIDEBAR_ORDER_KEY
  ]);

  SU.savedFontPairing = SU.DEFAULT_FONT_PAIRING;
  SU.previewFontPairing = null;
  SU.savedTheme = SU.DEFAULT_THEME;
  SU.previewTheme = null;
  SU.customFontPairings = [];
  SU.savedSidebarOrder = [];
  SU.googleFontCatalog = null;
  SU.googleFontCatalogPromise = null;
  SU.draggedSidebarItemId = null;
  SU.slackEmojiCache = null;
  SU.slackEmojiRequestPromise = null;
  SU.extensionStorage = globalThis.browser?.storage?.local ?? globalThis.chrome?.storage?.local ?? null;
  SU.extensionRuntime = globalThis.browser?.runtime ?? globalThis.chrome?.runtime ?? null;
  SU.aiButtonResetTimers = new WeakMap();

  SU.usesLocalStorage = (key) => SU.LOCAL_SETTINGS_KEYS.has(key);

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

  SU.getExtensionStoredSetting = (key) => {
    if (!SU.extensionStorage) {
      return Promise.resolve(undefined);
    }

    if (globalThis.browser?.storage?.local) {
      return globalThis.browser.storage.local.get(key).then((result) => result?.[key]);
    }

    return new Promise((resolve) => {
      SU.extensionStorage.get(key, (result) => {
        resolve(result?.[key]);
      });
    });
  };

  SU.setExtensionStoredSetting = (values) => {
    if (!SU.extensionStorage) {
      return Promise.resolve();
    }

    if (globalThis.browser?.storage?.local) {
      return globalThis.browser.storage.local.set(values);
    }

    return new Promise((resolve) => {
      SU.extensionStorage.set(values, () => resolve());
    });
  };

  SU.removeExtensionStoredSetting = (key) => {
    if (!SU.extensionStorage) {
      return Promise.resolve();
    }

    if (globalThis.browser?.storage?.local) {
      return globalThis.browser.storage.local.remove(key);
    }

    return new Promise((resolve) => {
      SU.extensionStorage.remove(key, () => resolve());
    });
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
    if (SU.usesLocalStorage(key)) {
      const localValue = SU.readLocalSetting(key);
      if (localValue !== undefined) {
        return Promise.resolve(localValue);
      }

      return SU.getExtensionStoredSetting(key).then((value) => {
        if (value !== undefined) {
          SU.writeLocalSetting(key, value);
          void SU.removeExtensionStoredSetting(key);
        }
        return value;
      });
    }

    return SU.getExtensionStoredSetting(key);
  };

  SU.getStoredSettings = async (keys) => {
    const entries = await Promise.all(keys.map(async (key) => [key, await SU.getStoredSetting(key)]));
    return Object.fromEntries(entries);
  };

  SU.setStoredSetting = (values) => {
    const extensionValues = {};

    Object.entries(values).forEach(([key, value]) => {
      if (SU.usesLocalStorage(key)) {
        SU.writeLocalSetting(key, value);
        void SU.removeExtensionStoredSetting(key);
      } else {
        extensionValues[key] = value;
      }
    });

    return Object.keys(extensionValues).length > 0 ? SU.setExtensionStoredSetting(extensionValues) : Promise.resolve();
  };

  SU.removeStoredSetting = (key) => {
    if (SU.usesLocalStorage(key)) {
      SU.clearLocalSetting(key);
    }

    return SU.removeExtensionStoredSetting(key);
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
