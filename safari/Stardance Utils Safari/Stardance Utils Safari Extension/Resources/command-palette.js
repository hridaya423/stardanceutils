(() => {
  const SU = globalThis.StardanceUtils;
  const COMMAND_ATTR = 'data-stardance-utils-command';
  const SECTION_ATTR = 'data-stardance-utils-command-palette-section';
  const ITEM_ID_PREFIX = 'stardance-utils-cp-';

  SU.getCommandPaletteDialog = () => document.getElementById('command-palette-dialog');

  SU.getCommandPaletteResults = () => document.getElementById('command-palette-results');

  SU.getCommandPaletteInput = () => SU.getCommandPaletteDialog()?.querySelector('[data-command-palette-target="input"]');

  SU.withCommandPaletteMutationGuard = (callback) => {
    SU.commandPaletteMutationGuard = true;

    try {
      return callback();
    } finally {
      queueMicrotask(() => {
        SU.commandPaletteMutationGuard = false;
      });
    }
  };

  SU.normalizeCommandPaletteQuery = (value) => String(value || '').trim().toLowerCase();

  SU.matchesCommandPaletteQuery = (command, query) => {
    if (!query) {
      return Boolean(command.showWhenEmpty);
    }

    const haystack = `${command.title} ${command.keywords || ''}`.toLowerCase();
    return query.split(/\s+/).every((part) => haystack.includes(part));
  };

  SU.queryLooksLikeThemeSearch = (query) => (
    query.includes('theme')
    || query.includes('appearance')
    || query.includes('palette')
    || Object.values(SU.THEMES || {}).some((theme) => theme.label.toLowerCase().includes(query))
  );

  SU.queryLooksLikePairingSearch = (query) => (
    query.includes('font')
    || query.includes('pairing')
    || query.includes('typography')
    || query.includes('type')
    || Object.values(SU.getAllPairingsMap?.() || {}).some((pairing) => pairing?.label?.toLowerCase().includes(query))
  );

  SU.closeCommandPalette = () => {
    const dialog = SU.getCommandPaletteDialog();
    if (dialog?.open) {
      dialog.close();
    }
  };

  SU.refreshUtilitySurfaces = () => {
    if (window.location.pathname.startsWith('/shop')) {
      window.location.reload();
      return;
    }

    SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
    SU.updateTryPanel?.();
  };

  SU.openUtilsCommandSection = async (section = 'appearance') => {
    if (typeof SU.openUtilsSettingsPanel === 'function') {
      await SU.openUtilsSettingsPanel(section);
      return;
    }

    const dialog = document.getElementById('settings-modal');
    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      if (typeof dialog.show === 'function') {
        dialog.show();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    SU.enhanceSettingsModal?.(dialog, SU.getEffectivePairing());
    SU.setActiveTab?.(dialog, 'utils');
    dialog.querySelectorAll('.stardance-utils-accordion').forEach((details) => {
      const nextSection = details.getAttribute('data-stardance-utils-utils-section');
      details.open = nextSection === section;
    });
    SU.updateUtilsPanel?.(dialog);
  };

  SU.applyCommandPaletteTheme = async (themeId) => {
    SU.previewTheme = SU.getValidTheme(themeId);
    await SU.applyTheme(SU.previewTheme);
    await SU.saveCurrentTheme();
  };

  SU.applyCommandPalettePairing = async (pairingKey) => {
    SU.previewFontPairing = SU.getValidPairing(pairingKey);
    SU.applyFontPairing(SU.previewFontPairing);
    await SU.saveCurrentPairing();
  };

  SU.setCommandPaletteShopLayoutEnabled = async (enabled) => {
    SU.savedShopLayoutEnabled = enabled;
    await SU.setStoredSetting({
      [SU.SHOP_LAYOUT_ENABLED_KEY]: SU.savedShopLayoutEnabled,
      [SU.SHOP_LAYOUT_RAIL_KEY]: SU.savedShopLayoutUseRail,
      [SU.SHOP_ORDERS_BUTTON_KEY]: SU.savedShopOrdersButtonEnabled
    });
    SU.refreshUtilitySurfaces();
  };

  SU.setCommandPaletteShopSidebarEnabled = async (enabled) => {
    SU.savedShopLayoutUseRail = enabled;
    if (!enabled) {
      SU.savedShopOrdersButtonEnabled = true;
    }

    await SU.setStoredSetting({
      [SU.SHOP_LAYOUT_RAIL_KEY]: SU.savedShopLayoutUseRail,
      [SU.SHOP_ORDERS_BUTTON_KEY]: SU.savedShopOrdersButtonEnabled
    });
    SU.refreshUtilitySurfaces();
  };

  SU.setCommandPaletteShopOrdersEnabled = async (enabled) => {
    SU.savedShopOrdersButtonEnabled = enabled;
    await SU.setStoredSetting({ [SU.SHOP_ORDERS_BUTTON_KEY]: SU.savedShopOrdersButtonEnabled });
    SU.refreshUtilitySurfaces();
  };

  SU.getBaseCommandPaletteUtilityCommands = () => [
    {
      id: 'open-utils-settings',
      title: 'Open Utils Settings',
      keywords: 'utils settings preferences options panel',
      showWhenEmpty: true,
      run: () => SU.openUtilsCommandSection('appearance')
    },
    {
      id: 'open-utils-appearance',
      title: 'Open Appearance Settings',
      keywords: 'appearance settings theme fonts utils',
      showWhenEmpty: false,
      run: () => SU.openUtilsCommandSection('appearance')
    },
    {
      id: 'open-utils-sidebar',
      title: 'Open Sidebar Settings',
      keywords: 'sidebar settings navigation order fonts',
      showWhenEmpty: false,
      run: () => SU.openUtilsCommandSection('sidebar')
    },
    {
      id: 'open-utils-shop',
      title: 'Open Shop Settings',
      keywords: 'shop settings layout goals sidebar orders',
      showWhenEmpty: true,
      run: () => SU.openUtilsCommandSection('shop')
    },
    {
      id: 'open-font-preview',
      title: 'Open Font Preview',
      keywords: 'font preview try mode pairing typography',
      showWhenEmpty: true,
      run: () => {
        if (!SU.hasTryModeSurface()) {
          return SU.goToTryModeSurface();
        }

        SU.openTryPanel();
        return undefined;
      }
    },
    {
      id: 'start-sidebar-reordering',
      title: 'Start Sidebar Reordering',
      keywords: 'sidebar reorder navigation drag drop tabs',
      showWhenEmpty: true,
      run: () => {
        SU.enableSidebarReorderMode();
        return undefined;
      }
    },
    {
      id: 'replay-utils-tutorial',
      title: 'Replay Utils Tutorial',
      keywords: 'tutorial onboarding walkthrough replay help',
      showWhenEmpty: true,
      run: () => SU.startOnboarding(true)
    },
    {
      id: 'enable-shop-layout',
      title: 'Enable Improved Shop Layout',
      keywords: 'shop layout enable improved goals rail',
      showWhenEmpty: false,
      run: () => SU.setCommandPaletteShopLayoutEnabled(true)
    },
    {
      id: 'disable-shop-layout',
      title: 'Disable Improved Shop Layout',
      keywords: 'shop layout disable default shelves',
      showWhenEmpty: false,
      run: () => SU.setCommandPaletteShopLayoutEnabled(false)
    },
    {
      id: 'enable-shop-sidebar',
      title: 'Enable Shop Sidebar',
      keywords: 'shop sidebar enable rail goals',
      showWhenEmpty: false,
      run: () => SU.setCommandPaletteShopSidebarEnabled(true)
    },
    {
      id: 'disable-shop-sidebar',
      title: 'Disable Shop Sidebar',
      keywords: 'shop sidebar disable inline goals',
      showWhenEmpty: false,
      run: () => SU.setCommandPaletteShopSidebarEnabled(false)
    },
    {
      id: 'move-shop-orders-main',
      title: 'Move Your Orders To Main Area',
      keywords: 'shop orders main area button move out sidebar',
      showWhenEmpty: false,
      run: () => SU.setCommandPaletteShopOrdersEnabled(true)
    },
    {
      id: 'keep-shop-orders-sidebar',
      title: 'Keep Your Orders In Sidebar',
      keywords: 'shop orders sidebar keep rail disable main area button',
      showWhenEmpty: false,
      run: () => SU.setCommandPaletteShopOrdersEnabled(false)
    }
  ];

  SU.getCommandPaletteUtilityCommands = (query = '') => {
    const commands = SU.getBaseCommandPaletteUtilityCommands().filter((command) => SU.matchesCommandPaletteQuery(command, query));

    if (query && SU.queryLooksLikeThemeSearch(query)) {
      Object.entries(SU.THEMES || {})
        .filter(([, theme]) => SU.matchesCommandPaletteQuery({ title: theme.label, keywords: `theme appearance ${theme.label}` }, query))
        .slice(0, 6)
        .forEach(([themeId, theme]) => {
          commands.push({
            id: `theme-${themeId}`,
            title: `Change Theme To ${theme.label}`,
            keywords: `theme appearance palette colors ${theme.label}`.toLowerCase(),
            run: () => SU.applyCommandPaletteTheme(themeId)
          });
        });
    }

    if (query && SU.queryLooksLikePairingSearch(query)) {
      SU.getPairingKeys().map((pairingKey) => {
        const label = SU.isStardanceDefaultPairing(pairingKey)
          ? 'Stardance defaults'
          : SU.getAllPairingsMap()?.[pairingKey]?.label;
        return label ? { pairingKey, label } : null;
      })
        .filter(Boolean)
        .filter(({ label }) => SU.matchesCommandPaletteQuery({ title: label, keywords: `font pairing typography sidebar ${label}` }, query))
        .slice(0, 5)
        .forEach(({ pairingKey, label }) => {
          commands.push({
            id: `pairing-${pairingKey}`,
            title: `Change Font Pairing To ${label}`,
            keywords: `font pairing typography sidebar ${label}`.toLowerCase(),
            run: () => SU.applyCommandPalettePairing(pairingKey)
          });
        });
    }

    return commands;
  };

  SU.runCommandPaletteUtilityCommand = async (commandId) => {
    const query = SU.normalizeCommandPaletteQuery(SU.getCommandPaletteInput()?.value);
    const command = SU.getCommandPaletteUtilityCommands(query).find((entry) => entry.id === commandId)
      || SU.getBaseCommandPaletteUtilityCommands().find((entry) => entry.id === commandId);
    if (!command) {
      return false;
    }

    SU.closeCommandPalette();
    await command.run();
    return true;
  };

  SU.bindCommandPaletteUtilityListeners = () => {
    if (SU.commandPaletteUtilityListenersBound) {
      return;
    }

    SU.commandPaletteUtilityListenersBound = true;

    document.addEventListener('click', (event) => {
      const item = event.target.closest(`[${COMMAND_ATTR}]`);
      if (!item) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      void SU.runCommandPaletteUtilityCommand(item.getAttribute(COMMAND_ATTR));
    }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      const dialog = SU.getCommandPaletteDialog();
      if (!dialog?.open) {
        return;
      }

      const input = dialog.querySelector('[data-command-palette-target="input"]');
      const activeId = input?.getAttribute('aria-activedescendant');
      if (!activeId) {
        return;
      }

      const item = document.getElementById(activeId);
      if (!item?.hasAttribute(COMMAND_ATTR)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      void SU.runCommandPaletteUtilityCommand(item.getAttribute(COMMAND_ATTR));
    }, true);

    document.addEventListener('input', (event) => {
      if (event.target !== SU.getCommandPaletteInput()) {
        return;
      }

      queueMicrotask(() => SU.enhanceCommandPalette());
    }, true);
  };

  SU.enhanceCommandPalette = () => {
    SU.bindCommandPaletteUtilityListeners();

    const results = SU.getCommandPaletteResults();
    if (!results) {
      return;
    }

    results.querySelectorAll(`[${SECTION_ATTR}]`).forEach((node) => node.remove());

    const query = SU.normalizeCommandPaletteQuery(SU.getCommandPaletteInput()?.value);
    const commands = SU.getCommandPaletteUtilityCommands(query);
    if (!commands.length) {
      SU.withCommandPaletteMutationGuard(() => {
        results.querySelectorAll(`[${SECTION_ATTR}]`).forEach((node) => node.remove());
      });
      return;
    }

    SU.withCommandPaletteMutationGuard(() => {
      results.querySelectorAll(`[${SECTION_ATTR}]`).forEach((node) => node.remove());

      const sectionLabel = document.createElement('p');
      sectionLabel.className = 'command-palette__section-label';
      sectionLabel.textContent = 'Stardance Utils';
      sectionLabel.setAttribute(SECTION_ATTR, 'true');

      const list = document.createElement('ul');
      list.className = 'command-palette__list';
      list.setAttribute(SECTION_ATTR, 'true');

      commands.forEach((command) => {
        const item = document.createElement('li');
        item.className = 'command-palette__item';
        item.setAttribute('role', 'option');
        item.id = `${ITEM_ID_PREFIX}${command.id}`;
        item.setAttribute('data-command-palette-target', 'item');
        item.setAttribute('data-action', 'mouseenter->command-palette#highlight');
        item.setAttribute('data-static', 'true');
        item.setAttribute('data-path', '#');
        item.setAttribute('data-keywords', command.keywords);
        item.setAttribute(COMMAND_ATTR, command.id);

        const title = document.createElement('span');
        title.className = 'command-palette__item-title';
        title.textContent = command.title;
        item.appendChild(title);

        list.appendChild(item);
      });

      results.appendChild(sectionLabel);
      results.appendChild(list);
    });
  };
})();
