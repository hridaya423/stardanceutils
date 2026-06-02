(() => {
  const SU = globalThis.StardanceUtils;

  SU.syncEnhancements = async () => {
    SU.ensureFontLink();
    SU.syncPageClasses();

    const storedValues = await SU.getStoredSettings([
      SU.THEME_KEY,
      SU.FONT_PAIRING_KEY,
      SU.TRY_MODE_PENDING_KEY,
      SU.CUSTOM_FONT_PAIRINGS_KEY,
      SU.SIDEBAR_ORDER_KEY
    ]);
    SU.customFontPairings = Array.isArray(storedValues?.[SU.CUSTOM_FONT_PAIRINGS_KEY]) ? storedValues[SU.CUSTOM_FONT_PAIRINGS_KEY] : [];
    SU.savedSidebarOrder = SU.normalizeSidebarOrder(storedValues?.[SU.SIDEBAR_ORDER_KEY]);
    SU.savedTheme = SU.getValidTheme(storedValues?.[SU.THEME_KEY]);
    SU.savedFontPairing = SU.getValidPairing(storedValues?.[SU.FONT_PAIRING_KEY]);

    if (!SU.previewTheme) {
      SU.previewTheme = SU.savedTheme;
    }

    if (!SU.previewFontPairing) {
      SU.previewFontPairing = SU.savedFontPairing;
    }

    await SU.applyTheme(SU.getEffectiveTheme());
    SU.applySidebarOrder(SU.savedSidebarOrder);
    SU.applyFontPairing(SU.getEffectivePairing());
    SU.enhanceProjectShowPage();
    SU.enhanceFeedAiVerification();

    const dialog = document.getElementById('settings-modal');
    if (dialog) {
      SU.enhanceSettingsModal(dialog, SU.getEffectivePairing());
    }

    const shouldOpenTryMode = Boolean(storedValues?.[SU.TRY_MODE_PENDING_KEY]) || window.location.search.includes('stardance-utils-try-mode=1');
    if (shouldOpenTryMode && SU.hasTryModeSurface()) {
      SU.openTryPanel();
      await SU.removeStoredSetting(SU.TRY_MODE_PENDING_KEY);

      const url = new URL(window.location.href);
      url.searchParams.delete('stardance-utils-try-mode');
      window.history.replaceState({}, '', url);
    }
  };

  let syncScheduled = false;

  const scheduleSync = () => {
    if (syncScheduled) {
      return;
    }

    syncScheduled = true;
    queueMicrotask(async () => {
      syncScheduled = false;
      await SU.syncEnhancements();
    });
  };

  const observer = new MutationObserver((mutations) => {
    const shouldResync = mutations.some((mutation) => {
      const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return nodes.some((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return false;
        }

        const element = node;
        return element.id === 'settings-modal'
          || element.id === 'primary-nav'
          || element.classList?.contains('discover-rail')
          || element.classList?.contains('project-show__actions')
          || element.classList?.contains('project-show__feed')
          || element.classList?.contains('composer-modal')
          || Boolean(element.querySelector?.('#settings-modal, #primary-nav, .discover-rail, .project-show__actions, .project-show__feed, .composer-modal'));
      });
    });

    if (shouldResync) {
      scheduleSync();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('turbo:load', scheduleSync);
  window.addEventListener('turbo:render', scheduleSync);
  window.addEventListener('pageshow', scheduleSync);

  scheduleSync();
})();
