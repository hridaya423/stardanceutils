(() => {
  const SU = globalThis.StardanceUtils;

  SU.syncEnhancements = async () => {
    const runEnhancement = (label, fn) => {
      if (typeof fn !== 'function') {
        return;
      }

      try {
        const result = fn();
        if (result && typeof result.then === 'function') {
          result.catch((error) => {
            console.error('[Stardance Utils]', `Failed to run ${label}`, error);
          });
        }
      } catch (error) {
        console.error('[Stardance Utils]', `Failed to run ${label}`, error);
      }
    };

    SU.ensureFontLink();
    SU.syncPageClasses();
    SU.cleanupLegacyAiCheckStorage?.();

    const storedValues = await SU.getStoredSettings([
      SU.THEME_KEY,
      SU.FONT_PAIRING_KEY,
      SU.TRY_MODE_PENDING_KEY,
      SU.CUSTOM_FONT_PAIRINGS_KEY,
      SU.SIDEBAR_ORDER_KEY,
      SU.PROJECT_PINNED_IDS_KEY,
      SU.SHOP_GOALS_KEY,
      SU.SHOP_LAYOUT_ENABLED_KEY,
      SU.SHOP_LAYOUT_RAIL_KEY,
      SU.SHOP_ORDERS_BUTTON_KEY,
      SU.DEVLOG_CHANGELOG_FORMAT_KEY,
      SU.DEVLOG_AUTO_COLLAPSE_KEY
    ]);
    SU.customFontPairings = Array.isArray(storedValues?.[SU.CUSTOM_FONT_PAIRINGS_KEY]) ? storedValues[SU.CUSTOM_FONT_PAIRINGS_KEY] : [];
    SU.savedSidebarOrder = SU.normalizeSidebarOrder(storedValues?.[SU.SIDEBAR_ORDER_KEY]);
    SU.savedPinnedProjectIds = SU.normalizePinnedProjectIds?.(storedValues?.[SU.PROJECT_PINNED_IDS_KEY]) ?? [];
    SU.savedShopGoals = SU.normalizeShopGoals?.(storedValues?.[SU.SHOP_GOALS_KEY]) ?? {};
    SU.savedShopLayoutEnabled = storedValues?.[SU.SHOP_LAYOUT_ENABLED_KEY] !== false;
    SU.savedShopLayoutUseRail = storedValues?.[SU.SHOP_LAYOUT_RAIL_KEY] !== false;
    SU.savedShopOrdersButtonEnabled = storedValues?.[SU.SHOP_ORDERS_BUTTON_KEY] !== false;
    SU.savedDevlogChangelogFormat = SU.getValidDevlogChangelogFormat?.(storedValues?.[SU.DEVLOG_CHANGELOG_FORMAT_KEY]) ?? 'hash';
    SU.savedDevlogAutoCollapseEnabled = storedValues?.[SU.DEVLOG_AUTO_COLLAPSE_KEY] !== false;
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
    runEnhancement('project page enhancements', SU.enhanceProjectShowPage);
    runEnhancement('devlog collapse enhancements', SU.enhanceDevlogBodyCollapse);
    runEnhancement('profile project enhancements', SU.enhanceProfileProjectsPage);
    runEnhancement('shop enhancements', SU.enhanceShopPage);
    runEnhancement('feed AI enhancements', SU.enhanceFeedAiVerification);
    runEnhancement('command palette enhancements', SU.enhanceCommandPalette);
    runEnhancement('onboarding', SU.maybeStartOnboarding);

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
  let observedBody = null;

  const scheduleSync = () => {
    if (syncScheduled) {
      return;
    }

    syncScheduled = true;
    queueMicrotask(async () => {
      syncScheduled = false;
      try {
        await SU.syncEnhancements();
      } catch (error) {
        if (SU.isExtensionContextError?.(error)) {
          SU.extensionContextInvalidated = true;
          console.warn('[Stardance Utils]', 'Extension context was invalidated. Reload the page to reconnect Utils.');
          return;
        }

        console.error('[Stardance Utils]', 'Failed to sync enhancements', error);
      }
    });
  };

  const observer = new MutationObserver((mutations) => {
    const shouldResync = mutations.some((mutation) => {
      if (SU.shopMutationGuard) {
        return false;
      }

      if (SU.commandPaletteMutationGuard) {
        return false;
      }

      const target = mutation.target;
      if (target instanceof Element && (target.id === 'command-palette-results' || target.closest?.('#command-palette-dialog'))) {
        return true;
      }

      if (mutation.type === 'attributes' && target instanceof Element) {
        return target.classList?.contains('feed-post-card')
          || target.classList?.contains('feed-post-card__body')
          || target.classList?.contains('feed-post-card__media')
          || target.classList?.contains('feed-post-card__media-viewport')
          || target.classList?.contains('feed-post-card__image')
          || Boolean(target.closest?.('article.feed-post-card, .devlog-detail__post, .comment-modal'));
      }

      const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return nodes.some((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return false;
        }

        const element = node;
        return element.id === 'settings-modal'
          || element.id === 'primary-nav'
          || element.classList?.contains('feed-post-card')
          || element.classList?.contains('feed-post-card__media')
          || element.classList?.contains('feed-post-card__media-viewport')
          || element.classList?.contains('discover-rail')
          || element.classList?.contains('shop-hub')
          || element.classList?.contains('shop-category')
          || element.classList?.contains('profile-tab-content')
          || element.classList?.contains('project-list')
          || element.classList?.contains('project-show__actions')
          || element.classList?.contains('project-show__feed')
          || element.classList?.contains('composer-modal')
          || element.id === 'command-palette-dialog'
          || element.id === 'command-palette-results'
          || element.classList?.contains('command-palette')
          || Boolean(element.querySelector?.('#settings-modal, #primary-nav, #command-palette-dialog, #command-palette-results, .command-palette, .feed-post-card, .feed-post-card__media, .feed-post-card__media-viewport, .discover-rail, .shop-hub, .shop-category, .profile-tab-content, .project-list, .project-show__actions, .project-show__feed, .composer-modal'));
      });
    });

    if (shouldResync) {
      scheduleSync();
    }
  });

  const ensureObserver = () => {
    if (!document.body || observedBody === document.body) {
      return;
    }

    observer.disconnect();
    observedBody = document.body;
    observer.observe(observedBody, {
      attributes: true,
      attributeFilter: ['class', 'src', 'data-feed-engagement-post-type-value'],
      childList: true,
      subtree: true
    });
  };

  const resyncKeys = new Set([
    SU.THEME_KEY,
    SU.FONT_PAIRING_KEY,
    SU.TRY_MODE_PENDING_KEY,
    SU.CUSTOM_FONT_PAIRINGS_KEY,
    SU.SIDEBAR_ORDER_KEY,
    SU.PROJECT_PINNED_IDS_KEY,
    SU.SHOP_GOALS_KEY,
    SU.SHOP_LAYOUT_ENABLED_KEY,
    SU.SHOP_LAYOUT_RAIL_KEY,
    SU.SHOP_ORDERS_BUTTON_KEY,
    SU.DEVLOG_CHANGELOG_FORMAT_KEY,
    SU.DEVLOG_AUTO_COLLAPSE_KEY
  ]);

  try {
    SU.extensionStorageEvents?.addListener((changes, areaName) => {
      if (areaName !== 'sync' && areaName !== 'local') {
        return;
      }

      const shouldResync = Object.keys(changes).some((key) => resyncKeys.has(key) || SU.isShopGoalsShardKey?.(key));
      if (shouldResync) {
        scheduleSync();
      }
    });
  } catch (error) {
    if (SU.isExtensionContextError?.(error)) {
      SU.extensionContextInvalidated = true;
    } else {
      throw error;
    }
  }

  const reconnectAndSync = () => {
    ensureObserver();
    scheduleSync();
    requestAnimationFrame(() => {
      ensureObserver();
      scheduleSync();
    });
  };

  window.addEventListener('DOMContentLoaded', reconnectAndSync);
  window.addEventListener('turbo:before-render', () => {
    observedBody = null;
  });
  window.addEventListener('turbo:load', reconnectAndSync);
  window.addEventListener('turbo:render', reconnectAndSync);
  window.addEventListener('turbo:frame-load', reconnectAndSync);
  window.addEventListener('pageshow', reconnectAndSync);

  reconnectAndSync();
})();
