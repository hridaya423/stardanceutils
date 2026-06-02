(() => {
  const SU = globalThis.StardanceUtils;

  SU.getSidebarNavEntries = () => {
    const navItems = [...document.querySelectorAll('#primary-nav .sidebar__nav-item')];
    return navItems.map((item) => {
      const control = item.querySelector('[data-slug]');
      if (!control) {
        return null;
      }

      const label = item.querySelector('.sidebar__nav-label')?.textContent?.trim();
      const slug = control.getAttribute('data-slug');
      if (!slug || !label) {
        return null;
      }

      return { id: slug, label, item };
    }).filter(Boolean);
  };

  SU.normalizeSidebarOrder = (order) => {
    const entries = SU.getSidebarNavEntries();
    const entryIds = entries.map((entry) => entry.id);
    const validOrder = (Array.isArray(order) ? order : []).filter((id) => entryIds.includes(id));
    const missingIds = entryIds.filter((id) => !validOrder.includes(id));
    return [...validOrder, ...missingIds];
  };

  SU.applySidebarOrder = (order = SU.savedSidebarOrder) => {
    const navList = document.querySelector('#primary-nav .sidebar__nav-list');
    if (!navList) {
      return;
    }

    const entries = SU.getSidebarNavEntries();
    const entryMap = new Map(entries.map((entry) => [entry.id, entry.item]));
    const nextOrder = SU.normalizeSidebarOrder(order);

    nextOrder.forEach((id) => {
      const item = entryMap.get(id);
      if (item) {
        navList.appendChild(item);
      }
    });
  };

  SU.saveSidebarOrder = async (order) => {
    SU.savedSidebarOrder = SU.normalizeSidebarOrder(order);
    SU.applySidebarOrder(SU.savedSidebarOrder);
    await SU.setStoredSetting({ [SU.SIDEBAR_ORDER_KEY]: SU.savedSidebarOrder });
    const dialog = document.getElementById('settings-modal');
    if (dialog) {
      SU.updateUtilsPanel?.(dialog);
    }
  };

  SU.getCurrentSidebarOrder = () => SU.getSidebarNavEntries().map((entry) => entry.id);

  SU.getSidebarOrderLabels = (order = SU.savedSidebarOrder) => {
    const entryMap = new Map(SU.getSidebarNavEntries().map((entry) => [entry.id, entry.label]));
    return SU.normalizeSidebarOrder(order).map((id) => entryMap.get(id)).filter(Boolean);
  };

  SU.disableSidebarReorderMode = () => {
    document.documentElement.classList.remove(SU.SIDEBAR_REORDER_CLASS);
    SU.getSidebarNavEntries().forEach(({ item }) => {
      item.draggable = false;
      item.classList.remove('stardance-utils-sidebar-item--dragging');
      item.ondragstart = null;
      item.ondragend = null;
      item.ondragover = null;
      item.ondrop = null;
    });

    const banner = document.getElementById(SU.REORDER_BANNER_ID);
    if (banner) {
      banner.remove();
    }

    SU.draggedSidebarItemId = null;
  };

  SU.handleSidebarDragStart = (event) => {
    const item = event.currentTarget;
    const control = item.querySelector('[data-slug]');
    SU.draggedSidebarItemId = control?.getAttribute('data-slug') ?? null;
    item.classList.add('stardance-utils-sidebar-item--dragging');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  SU.handleSidebarDragEnd = (event) => {
    event.currentTarget.classList.remove('stardance-utils-sidebar-item--dragging');
    SU.draggedSidebarItemId = null;
  };

  SU.handleSidebarDragOver = (event) => {
    if (!SU.draggedSidebarItemId) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  SU.handleSidebarDrop = (event) => {
    event.preventDefault();
    const targetItem = event.currentTarget;
    const targetSlug = targetItem.querySelector('[data-slug]')?.getAttribute('data-slug');
    if (!SU.draggedSidebarItemId || !targetSlug || SU.draggedSidebarItemId === targetSlug) {
      return;
    }

    const navList = document.querySelector('#primary-nav .sidebar__nav-list');
    const draggedItem = SU.getSidebarNavEntries().find((entry) => entry.id === SU.draggedSidebarItemId)?.item;
    if (!navList || !draggedItem) {
      return;
    }

    const targetRect = targetItem.getBoundingClientRect();
    const shouldInsertAfter = event.clientY > targetRect.top + (targetRect.height / 2);
    if (shouldInsertAfter) {
      navList.insertBefore(draggedItem, targetItem.nextSibling);
    } else {
      navList.insertBefore(draggedItem, targetItem);
    }

    SU.saveSidebarOrder(SU.getCurrentSidebarOrder());
  };

  SU.enableSidebarReorderMode = () => {
    const nav = document.querySelector('#primary-nav');
    if (!nav) {
      return;
    }

    SU.disableSidebarReorderMode();
    document.documentElement.classList.add(SU.SIDEBAR_REORDER_CLASS);

    SU.getSidebarNavEntries().forEach(({ item }) => {
      item.draggable = true;
      item.ondragstart = SU.handleSidebarDragStart;
      item.ondragend = SU.handleSidebarDragEnd;
      item.ondragover = SU.handleSidebarDragOver;
      item.ondrop = SU.handleSidebarDrop;
    });

    const userCard = document.querySelector('#primary-nav .sidebar__user');
    if (!userCard) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = SU.REORDER_BANNER_ID;
    banner.className = 'stardance-utils-reorder-banner';

    const text = document.createElement('div');
    text.className = 'stardance-utils-reorder-copy';
    text.textContent = 'Drag sidebar tabs to reorder. Changes save automatically.';

    const doneButton = document.createElement('button');
    doneButton.type = 'button';
    doneButton.className = 'stardance-utils-reorder-done';
    doneButton.textContent = 'Done';
    doneButton.addEventListener('click', () => SU.disableSidebarReorderMode());

    banner.appendChild(text);
    banner.appendChild(doneButton);
    userCard.insertAdjacentElement('beforebegin', banner);
  };

  SU.renderSidebarOrderList = (container) => {
    if (!container) {
      return;
    }

    container.replaceChildren();

    const text = document.createElement('div');
    text.className = 'stardance-utils-order-summary';
    text.textContent = SU.getSidebarOrderLabels().join(' / ');

    container.appendChild(text);
  };

  SU.updateTryPanel = () => {
    const panel = document.getElementById(SU.TRY_PANEL_ID);
    if (!panel) {
      return;
    }

    const select = panel.querySelector('[data-stardance-utils-try-select]');
    const pairingName = panel.querySelector('[data-stardance-utils-try-pairing-name]');

    if (select) {
      SU.renderPairingOptions(select, SU.getEffectivePairing());
    }

    if (pairingName) {
      pairingName.textContent = SU.getAllPairingsMap()[SU.getEffectivePairing()].label;
    }
  };

  SU.hasTryModeSurface = () => Boolean(document.querySelector('.discover-rail') && document.querySelector('#primary-nav'));

  SU.goToTryModeSurface = () => {
    const targetUrl = new URL(SU.TRY_MODE_FALLBACK_PATH, window.location.origin);
    targetUrl.searchParams.set('stardance-utils-try-mode', '1');
    return SU.setStoredSetting({ [SU.TRY_MODE_PENDING_KEY]: true }).then(() => {
      window.location.href = targetUrl.toString();
    });
  };

  SU.closeTryPanel = (resetPreview = true) => {
    const panel = document.getElementById(SU.TRY_PANEL_ID);
    if (!panel) {
      return;
    }

    if (resetPreview) {
      SU.resetToSavedPairing();
    }

    panel.remove();
  };

  SU.openTryPanel = () => {
    if (!SU.hasTryModeSurface()) {
      return false;
    }

    const rail = document.querySelector('.discover-rail');
    let panel = document.getElementById(SU.TRY_PANEL_ID);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = SU.TRY_PANEL_ID;
      panel.className = 'stardance-utils-try-panel';

      const heading = document.createElement('div');
      heading.className = 'stardance-utils-try-header';

      const titleGroup = document.createElement('div');
      titleGroup.className = 'stardance-utils-try-copy';

      const eyebrow = document.createElement('span');
      eyebrow.className = 'stardance-utils-try-eyebrow';
      eyebrow.textContent = 'Preview fonts';
      titleGroup.appendChild(eyebrow);

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'stardance-utils-try-close';
      closeButton.setAttribute('aria-label', 'Close try mode');
      closeButton.textContent = 'x';
      closeButton.addEventListener('click', () => SU.closeTryPanel(true));

      heading.appendChild(titleGroup);
      heading.appendChild(closeButton);

      const controls = document.createElement('div');
      controls.className = 'stardance-utils-try-controls';

      const pairingName = document.createElement('div');
      pairingName.className = 'stardance-utils-try-pairing-name';
      pairingName.setAttribute('data-stardance-utils-try-pairing-name', 'true');

      const prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'stardance-utils-try-cycle';
      prevButton.textContent = '<';
      prevButton.setAttribute('aria-label', 'Previous font pairing');
      prevButton.addEventListener('click', () => {
        SU.stepPreviewPairing(-1);
        SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
        SU.updateTryPanel();
      });

      const select = document.createElement('select');
      select.id = 'stardance-utils-try-select';
      select.className = 'settings-form__input stardance-utils-select';
      select.setAttribute('data-stardance-utils-try-select', 'true');
      select.setAttribute('aria-label', 'Choose font pairing');
      SU.renderPairingOptions(select, SU.getEffectivePairing());
      select.addEventListener('change', () => {
        SU.previewFontPairing = SU.getValidPairing(select.value);
        SU.applyFontPairing(SU.previewFontPairing);
        SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
        SU.updateTryPanel();
      });

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'stardance-utils-try-cycle';
      nextButton.textContent = '>';
      nextButton.setAttribute('aria-label', 'Next font pairing');
      nextButton.addEventListener('click', () => {
        SU.stepPreviewPairing(1);
        SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
        SU.updateTryPanel();
      });

      const selectWrap = document.createElement('div');
      selectWrap.className = 'stardance-utils-try-select-wrap';
      selectWrap.appendChild(select);

      controls.appendChild(pairingName);
      controls.appendChild(prevButton);
      controls.appendChild(selectWrap);
      controls.appendChild(nextButton);

      const actions = document.createElement('div');
      actions.className = 'stardance-utils-actions';

      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.className = 'stardance-utils-action-button stardance-utils-action-button--primary';
      saveButton.textContent = 'Save';
      saveButton.addEventListener('click', async () => {
        await SU.saveCurrentPairing();
        SU.closeTryPanel(false);
      });

      const resetButton = document.createElement('button');
      resetButton.type = 'button';
      resetButton.className = 'stardance-utils-action-button stardance-utils-action-button--secondary';
      resetButton.textContent = 'Reset';
      resetButton.addEventListener('click', () => SU.resetToSavedPairing());

      actions.appendChild(saveButton);
      actions.appendChild(resetButton);

      panel.appendChild(heading);
      panel.appendChild(controls);
      panel.appendChild(actions);
    }

    rail.appendChild(panel);
    SU.applyFontPairing(SU.getEffectivePairing());
    SU.updateTryPanel();
    return true;
  };
})();
