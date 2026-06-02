(() => {
  const SU = globalThis.StardanceUtils;

  SU.updateUtilsPanel = (dialog) => {
    if (!dialog) {
      return;
    }

    const select = dialog.querySelector('[data-stardance-utils-setting="sidebar-font-pairing"]');
    const themeSelect = dialog.querySelector('[data-stardance-utils-setting="site-theme"]');
    const orderList = dialog.querySelector('[data-stardance-utils-sidebar-order]');

    if (select) {
      SU.renderPairingOptions(select, SU.getEffectivePairing());
    }

    if (themeSelect) {
      SU.renderThemeOptions(themeSelect, SU.getEffectiveTheme());
    }

    if (orderList) {
      SU.renderSidebarOrderList(orderList);
    }
  };

  SU.setActiveTab = (dialog, tab) => {
    const stardanceTab = dialog.querySelector('[data-stardance-utils-tab="stardance"]');
    const utilsTab = dialog.querySelector('[data-stardance-utils-tab="utils"]');
    const stardancePanel = dialog.querySelector('[data-stardance-utils-panel="stardance"]');
    const utilsPanel = dialog.querySelector('[data-stardance-utils-panel="utils"]');
    const isUtilsTab = tab === 'utils';

    if (!stardanceTab || !utilsTab || !stardancePanel || !utilsPanel) {
      return;
    }

    stardanceTab.setAttribute('aria-selected', String(!isUtilsTab));
    utilsTab.setAttribute('aria-selected', String(isUtilsTab));
    stardanceTab.classList.toggle('stardance-utils-tab--active', !isUtilsTab);
    utilsTab.classList.toggle('stardance-utils-tab--active', isUtilsTab);
    stardancePanel.hidden = isUtilsTab;
    utilsPanel.hidden = !isUtilsTab;
  };

  SU.buildUtilsPanel = (selectedPairing) => {
    const panel = document.createElement('div');
    panel.className = 'settings-form stardance-utils-panel';
    panel.setAttribute('data-stardance-utils-panel', 'utils');
    panel.hidden = true;

    const field = document.createElement('div');
    field.className = 'settings-form__field';

    const appearanceAccordion = document.createElement('details');
    appearanceAccordion.className = 'stardance-utils-accordion';

    const appearanceSummary = document.createElement('summary');
    appearanceSummary.className = 'stardance-utils-accordion-summary';
    appearanceSummary.textContent = 'Appearance';

    const appearanceBody = document.createElement('div');
    appearanceBody.className = 'stardance-utils-accordion-body';

    const appearanceHeader = document.createElement('div');
    appearanceHeader.className = 'stardance-utils-inline-header';

    const themeLabel = document.createElement('label');
    themeLabel.className = 'settings-form__label stardance-utils-section-label';
    themeLabel.setAttribute('for', 'stardance-utils-theme-select');
    themeLabel.textContent = 'Theme';

    const themeSelect = document.createElement('select');
    themeSelect.id = 'stardance-utils-theme-select';
    themeSelect.className = 'settings-form__input stardance-utils-select';
    themeSelect.setAttribute('data-stardance-utils-setting', 'site-theme');
    SU.renderThemeOptions(themeSelect, SU.getEffectiveTheme());

    const themeHint = document.createElement('small');
    themeHint.className = 'settings-form__hint';
    themeHint.textContent = 'Applies a site palette and rethemes Utils surfaces.';

    const themeActions = document.createElement('div');
    themeActions.className = 'stardance-utils-actions';

    const themeSaveButton = document.createElement('button');
    themeSaveButton.type = 'button';
    themeSaveButton.className = 'modal__actions-close modal__actions-close--primary stardance-utils-action-button stardance-utils-action-button--primary';
    themeSaveButton.textContent = 'Save';

    const themeResetButton = document.createElement('button');
    themeResetButton.type = 'button';
    themeResetButton.className = 'modal__actions-close stardance-utils-action-button stardance-utils-action-button--secondary';
    themeResetButton.textContent = 'Reset';

    const sidebarAccordion = document.createElement('details');
    sidebarAccordion.className = 'stardance-utils-accordion';

    const sidebarSummary = document.createElement('summary');
    sidebarSummary.className = 'stardance-utils-accordion-summary';
    sidebarSummary.textContent = 'Sidebar';

    const sidebarBody = document.createElement('div');
    sidebarBody.className = 'stardance-utils-accordion-body';

    const curatedHeader = document.createElement('div');
    curatedHeader.className = 'stardance-utils-inline-header';

    const label = document.createElement('label');
    label.className = 'settings-form__label stardance-utils-section-label';
    label.setAttribute('for', 'stardance-utils-font-pairing');
    label.textContent = 'Curated pairings';

    const select = document.createElement('select');
    select.id = 'stardance-utils-font-pairing';
    select.className = 'settings-form__input stardance-utils-select';
    select.setAttribute('data-stardance-utils-setting', 'sidebar-font-pairing');
    SU.renderPairingOptions(select, selectedPairing);

    const hint = document.createElement('small');
    hint.className = 'settings-form__hint';
    hint.textContent = 'Preview in the sidebar.';

    const customAccordion = document.createElement('details');
    customAccordion.className = 'stardance-utils-accordion stardance-utils-accordion--nested';

    const customSummary = document.createElement('summary');
    customSummary.className = 'stardance-utils-accordion-summary';
    customSummary.textContent = 'Custom pairing';

    const customBody = document.createElement('div');
    customBody.className = 'stardance-utils-accordion-body';

    const orderAccordion = document.createElement('details');
    orderAccordion.className = 'stardance-utils-accordion stardance-utils-accordion--nested';

    const orderSummary = document.createElement('summary');
    orderSummary.className = 'stardance-utils-accordion-summary';
    orderSummary.textContent = 'Navigation order';

    const orderBody = document.createElement('div');
    orderBody.className = 'stardance-utils-accordion-body';

    const orderHint = document.createElement('small');
    orderHint.className = 'settings-form__hint';
    orderHint.textContent = 'Drag tabs directly in the sidebar. Changes save automatically.';

    const orderList = document.createElement('div');
    orderList.className = 'stardance-utils-order-list';
    orderList.setAttribute('data-stardance-utils-sidebar-order', 'true');

    const orderLaunchButton = document.createElement('button');
    orderLaunchButton.type = 'button';
    orderLaunchButton.className = 'stardance-utils-utility-button';
    orderLaunchButton.textContent = 'Start reordering';

    const customHint = document.createElement('small');
    customHint.className = 'settings-form__hint';
    customHint.textContent = 'Pick a regular and active font from Google Fonts.';

    const datalist = document.createElement('datalist');
    datalist.id = SU.FONT_DATALIST_ID;

    const customGrid = document.createElement('div');
    customGrid.className = 'stardance-utils-custom-grid';

    const regularInput = document.createElement('input');
    regularInput.type = 'text';
    regularInput.className = 'settings-form__input stardance-utils-font-input';
    regularInput.placeholder = 'Regular font';
    regularInput.setAttribute('list', SU.FONT_DATALIST_ID);

    const activeInput = document.createElement('input');
    activeInput.type = 'text';
    activeInput.className = 'settings-form__input stardance-utils-font-input';
    activeInput.placeholder = 'Active font';
    activeInput.setAttribute('list', SU.FONT_DATALIST_ID);

    const customStatus = document.createElement('small');
    customStatus.className = 'settings-form__hint stardance-utils-custom-status';

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'modal__actions-close stardance-utils-action-button stardance-utils-action-button--secondary';
    addButton.textContent = 'Add pairing';

    const tryButton = document.createElement('button');
    tryButton.type = 'button';
    tryButton.className = 'stardance-utils-utility-button';
    tryButton.textContent = 'Open preview';

    const actions = document.createElement('div');
    actions.className = 'stardance-utils-actions';

    const closeDialog = () => {
      const dialog = panel.closest('dialog');
      if (dialog?.open) {
        dialog.close();
      }
    };

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'modal__actions-close modal__actions-close--primary stardance-utils-action-button stardance-utils-action-button--primary';
    saveButton.textContent = 'Save';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'modal__actions-close stardance-utils-action-button stardance-utils-action-button--secondary';
    resetButton.textContent = 'Reset';

    select.addEventListener('change', () => {
      SU.previewFontPairing = SU.getValidPairing(select.value);
      SU.applyFontPairing(SU.previewFontPairing);
      SU.updateUtilsPanel(panel.closest('dialog'));
      SU.updateTryPanel?.();
    });

    themeSelect.addEventListener('change', () => {
      SU.previewTheme = SU.getValidTheme(themeSelect.value);
      void SU.applyTheme(SU.previewTheme);
      SU.updateUtilsPanel(panel.closest('dialog'));
    });

    const handleAutocompleteInput = async (event) => {
      await SU.updateFontSuggestions(datalist, event.currentTarget.value);
    };

    regularInput.addEventListener('input', handleAutocompleteInput);
    regularInput.addEventListener('focus', handleAutocompleteInput);
    activeInput.addEventListener('input', handleAutocompleteInput);
    activeInput.addEventListener('focus', handleAutocompleteInput);

    addButton.addEventListener('click', async () => {
      const regularFont = await SU.resolveGoogleFontFamily(regularInput.value);
      const activeFont = await SU.resolveGoogleFontFamily(activeInput.value);

      if (!regularFont || !activeFont) {
        customStatus.textContent = 'Pick fonts that exist in Google Fonts.';
        return;
      }

      const customPairing = {
        id: `custom-${Date.now()}`,
        label: `${regularFont.name} + ${activeFont.name}`,
        regular: regularFont.name,
        regularFallback: regularFont.fallback,
        regularSource: regularFont.source,
        regularSlug: regularFont.slug,
        active: activeFont.name,
        activeFallback: activeFont.fallback,
        activeSource: activeFont.source,
        activeSlug: activeFont.slug,
        activeItalic: 'normal'
      };

      SU.customFontPairings = [...SU.customFontPairings, customPairing];
      await SU.setStoredSetting({ [SU.CUSTOM_FONT_PAIRINGS_KEY]: SU.customFontPairings });

      SU.previewFontPairing = customPairing.id;
      SU.applyFontPairing(SU.previewFontPairing);
      SU.refreshPairingSelectors();
      SU.updateUtilsPanel(panel.closest('dialog'));
      SU.updateTryPanel?.();

      regularInput.value = '';
      activeInput.value = '';
      customStatus.textContent = 'Custom pairing added.';
    });

    saveButton.addEventListener('click', async () => {
      await SU.saveCurrentPairing();
      closeDialog();
    });

    themeSaveButton.addEventListener('click', async () => {
      await SU.saveCurrentTheme();
      closeDialog();
    });

    resetButton.addEventListener('click', () => {
      SU.resetToSavedPairing();
    });

    themeResetButton.addEventListener('click', () => {
      SU.resetToSavedTheme();
    });

    tryButton.addEventListener('click', () => {
      if (!SU.hasTryModeSurface()) {
        SU.goToTryModeSurface();
        return;
      }

      const didOpen = SU.openTryPanel();
      const dialog = panel.closest('dialog');
      if (didOpen && dialog?.open) {
        dialog.close();
      }
    });

    orderLaunchButton.addEventListener('click', () => {
      SU.enableSidebarReorderMode();

      const dialog = panel.closest('dialog');
      if (dialog?.open) {
        dialog.close();
      }
    });

    actions.appendChild(saveButton);
    actions.appendChild(resetButton);
    themeActions.appendChild(themeSaveButton);
    themeActions.appendChild(themeResetButton);

    customGrid.appendChild(regularInput);
    customGrid.appendChild(activeInput);
    appearanceHeader.appendChild(themeLabel);
    appearanceBody.appendChild(appearanceHeader);
    appearanceBody.appendChild(themeSelect);
    appearanceBody.appendChild(themeHint);
    appearanceBody.appendChild(themeActions);
    curatedHeader.appendChild(label);
    curatedHeader.appendChild(tryButton);
    sidebarBody.appendChild(curatedHeader);
    sidebarBody.appendChild(select);
    sidebarBody.appendChild(hint);
    sidebarBody.appendChild(actions);

    customBody.appendChild(customHint);
    customBody.appendChild(customGrid);
    customBody.appendChild(datalist);
    customBody.appendChild(customStatus);
    customBody.appendChild(addButton);

    orderBody.appendChild(orderHint);
    orderBody.appendChild(orderList);
    orderBody.appendChild(orderLaunchButton);

    customAccordion.appendChild(customSummary);
    customAccordion.appendChild(customBody);
    orderAccordion.appendChild(orderSummary);
    orderAccordion.appendChild(orderBody);
    appearanceAccordion.appendChild(appearanceSummary);
    appearanceAccordion.appendChild(appearanceBody);
    field.appendChild(appearanceAccordion);
    sidebarBody.appendChild(orderAccordion);
    sidebarBody.appendChild(customAccordion);

    sidebarAccordion.appendChild(sidebarSummary);
    sidebarAccordion.appendChild(sidebarBody);
    field.appendChild(sidebarAccordion);
    panel.appendChild(field);

    return panel;
  };

  SU.enhanceSettingsModal = (dialog, selectedPairing) => {
    if (dialog.getAttribute(SU.MODAL_ATTR) === 'true') {
      SU.updateUtilsPanel(dialog);
      return;
    }

    const title = dialog.querySelector('.modal__title');
    const form = dialog.querySelector('#settings-form');
    if (!title || !form) {
      return;
    }

    form.setAttribute('data-stardance-utils-panel', 'stardance');

    const tabs = document.createElement('div');
    tabs.className = 'stardance-utils-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Settings sections');

    const stardanceTab = document.createElement('button');
    stardanceTab.type = 'button';
    stardanceTab.className = 'stardance-utils-tab stardance-utils-tab--active';
    stardanceTab.setAttribute('role', 'tab');
    stardanceTab.setAttribute('aria-selected', 'true');
    stardanceTab.setAttribute('data-stardance-utils-tab', 'stardance');
    stardanceTab.textContent = 'Stardance settings';

    const utilsTab = document.createElement('button');
    utilsTab.type = 'button';
    utilsTab.className = 'stardance-utils-tab';
    utilsTab.setAttribute('role', 'tab');
    utilsTab.setAttribute('aria-selected', 'false');
    utilsTab.setAttribute('data-stardance-utils-tab', 'utils');
    utilsTab.textContent = 'Utils settings';

    stardanceTab.addEventListener('click', () => SU.setActiveTab(dialog, 'stardance'));
    utilsTab.addEventListener('click', () => SU.setActiveTab(dialog, 'utils'));

    tabs.appendChild(stardanceTab);
    tabs.appendChild(utilsTab);

    const utilsPanel = SU.buildUtilsPanel(selectedPairing);

    title.insertAdjacentElement('afterend', tabs);
    form.insertAdjacentElement('afterend', utilsPanel);
    dialog.setAttribute(SU.MODAL_ATTR, 'true');
    SU.updateUtilsPanel(dialog);
  };
})();
