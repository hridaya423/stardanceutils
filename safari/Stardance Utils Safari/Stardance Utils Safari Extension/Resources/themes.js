(() => {
  const SU = globalThis.StardanceUtils;

  SU.THEMES = {
    default: {
      label: 'Stardance default'
    },
    kanagawa: {
      label: 'Kanagawa',
      className: 'stardance-utils-theme-kanagawa',
      filePath: 'themes/kanagawa.css'
    },
    nord: {
      label: 'Nord',
      className: 'stardance-utils-theme-nord',
      filePath: 'themes/nord.css'
    },
    'tokyo-night': {
      label: 'Tokyo Night',
      className: 'stardance-utils-theme-tokyo-night',
      filePath: 'themes/tokyo-night.css'
    },
    frappe: {
      label: 'Catppuccin Frappe',
      className: 'stardance-utils-theme-frappe',
      filePath: 'themes/catppuccin-frappe.css'
    },
    macchiato: {
      label: 'Catppuccin Macchiato',
      className: 'stardance-utils-theme-macchiato',
      filePath: 'themes/catppuccin-macchiato.css'
    },
    'catppuccin-mocha': {
      label: 'Catppuccin Mocha',
      className: 'stardance-utils-theme-catppuccin-mocha',
      filePath: 'themes/catppuccin-mocha.css'
    },
    latte: {
      label: 'Catppuccin Latte',
      className: 'stardance-utils-theme-latte',
      filePath: 'themes/catppuccin-latte.css'
    }
  };

  SU.FONT_PAIRINGS = {
    'outfit-instrument': {
      label: 'Outfit + Instrument Serif',
      regular: 'Outfit',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Instrument Serif',
      activeFallback: 'serif',
      activeWeight: '400',
      activeItalic: 'italic'
    },
    'switzer-cormorant': {
      label: 'Switzer + Cormorant Garamond Italic',
      regular: 'Switzer',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Cormorant Garamond',
      activeFallback: 'serif',
      activeWeight: '600',
      activeItalic: 'italic'
    },
    'general-instrument': {
      label: 'General Sans + Instrument Serif',
      regular: 'General Sans',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Instrument Serif',
      activeFallback: 'serif',
      activeWeight: '400',
      activeItalic: 'italic'
    },
    'cabinet-fraunces': {
      label: 'Cabinet Grotesk + Fraunces Italic',
      regular: 'Cabinet Grotesk',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Fraunces',
      activeFallback: 'serif',
      activeWeight: '600',
      activeItalic: 'italic'
    },
    'satoshi-instrument': {
      label: 'Satoshi + Instrument Serif',
      regular: 'Satoshi',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Instrument Serif',
      activeFallback: 'serif',
      activeWeight: '400',
      activeItalic: 'italic'
    },
    'bricolage-instrument': {
      label: 'Bricolage Grotesque + Instrument Serif',
      regular: 'Bricolage Grotesque',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Instrument Serif',
      activeFallback: 'serif',
      activeWeight: '400',
      activeItalic: 'italic'
    },
    'space-playfair': {
      label: 'Space Grotesk + Playfair Display Italic',
      regular: 'Space Grotesk',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Playfair Display',
      activeFallback: 'serif',
      activeWeight: '700',
      activeItalic: 'italic'
    },
    'outfit-fraunces': {
      label: 'Outfit + Fraunces Italic',
      regular: 'Outfit',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Fraunces',
      activeFallback: 'serif',
      activeWeight: '600',
      activeItalic: 'italic'
    },
    'plusjakarta-instrument': {
      label: 'Plus Jakarta Sans + Instrument Serif Italic',
      regular: 'Plus Jakarta Sans',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Instrument Serif',
      activeFallback: 'serif',
      activeWeight: '400',
      activeItalic: 'italic'
    },
    'outfit-bricolage': {
      label: 'Outfit + Bricolage Grotesque',
      regular: 'Outfit',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Bricolage Grotesque',
      activeFallback: 'sans-serif',
      activeWeight: '600',
      activeItalic: 'normal'
    },
    'space-cormorant': {
      label: 'Space Grotesk + Cormorant Garamond Italic',
      regular: 'Space Grotesk',
      regularFallback: 'sans-serif',
      regularWeight: '500',
      hoverWeight: '700',
      active: 'Cormorant Garamond',
      activeFallback: 'serif',
      activeWeight: '600',
      activeItalic: 'italic'
    }
  };

  SU.getAllPairingsMap = () => {
    const customEntries = Object.fromEntries(SU.customFontPairings.map((pairing) => [pairing.id, pairing]));
    return { ...SU.FONT_PAIRINGS, ...customEntries };
  };

  SU.isStardanceDefaultPairing = (pairingKey) => pairingKey === SU.STARDANCE_DEFAULT_FONT_PAIRING;

  SU.getValidTheme = (themeId) => (SU.THEMES[themeId] ? themeId : SU.DEFAULT_THEME);

  SU.getEffectiveTheme = () => SU.getValidTheme(SU.previewTheme ?? SU.savedTheme);

  SU.renderThemeOptions = (select, selectedValue) => {
    if (!select) {
      return;
    }

    select.replaceChildren();
    Object.entries(SU.THEMES).forEach(([value, theme]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = theme.label;
      option.selected = value === selectedValue;
      select.appendChild(option);
    });
  };

  SU.getValidPairing = (pairingKey) => (
    SU.isStardanceDefaultPairing(pairingKey) || SU.getAllPairingsMap()[pairingKey]
      ? pairingKey
      : SU.DEFAULT_FONT_PAIRING
  );

  SU.getEffectivePairing = () => SU.getValidPairing(SU.previewFontPairing ?? SU.savedFontPairing);

  SU.getPairingKeys = () => [SU.STARDANCE_DEFAULT_FONT_PAIRING, ...Object.keys(SU.getAllPairingsMap())];

  SU.renderPairingOptions = (select, selectedValue) => {
    if (!select) {
      return;
    }

    const pairings = SU.getAllPairingsMap();
    select.replaceChildren();

    const curatedGroup = document.createElement('optgroup');
    curatedGroup.label = 'Curated pairings';

    const stardanceOption = document.createElement('option');
    stardanceOption.value = SU.STARDANCE_DEFAULT_FONT_PAIRING;
    stardanceOption.textContent = 'Stardance defaults';
    stardanceOption.selected = SU.STARDANCE_DEFAULT_FONT_PAIRING === selectedValue;
    curatedGroup.appendChild(stardanceOption);

    Object.entries(SU.FONT_PAIRINGS).forEach(([value, pairing]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = pairing.label;
      option.selected = value === selectedValue;
      curatedGroup.appendChild(option);
    });
    select.appendChild(curatedGroup);

    if (SU.customFontPairings.length > 0) {
      const customGroup = document.createElement('optgroup');
      customGroup.label = 'Your pairings';
      SU.customFontPairings.forEach((pairing) => {
        const option = document.createElement('option');
        option.value = pairing.id;
        option.textContent = pairings[pairing.id].label;
        option.selected = pairing.id === selectedValue;
        customGroup.appendChild(option);
      });
      select.appendChild(customGroup);
    }
  };

  SU.refreshPairingSelectors = () => {
    SU.renderPairingOptions(document.querySelector('[data-stardance-utils-setting="sidebar-font-pairing"]'), SU.getEffectivePairing());
    SU.renderPairingOptions(document.querySelector('[data-stardance-utils-try-select]'), SU.getEffectivePairing());
  };

  SU.applyTheme = async (themeId) => {
    const nextThemeId = SU.getValidTheme(themeId);
    const nextTheme = SU.THEMES[nextThemeId] ?? SU.THEMES[SU.DEFAULT_THEME];
    const root = document.documentElement;

    root.classList.remove(SU.CUSTOM_THEME_CLASS);
    Object.values(SU.THEMES).forEach((theme) => {
      if (theme.className) {
        root.classList.remove(theme.className);
      }
    });

    if (nextTheme.className) {
      root.classList.add(SU.CUSTOM_THEME_CLASS);
      root.classList.add(nextTheme.className);
    }

    root.setAttribute('data-stardance-utils-theme', nextThemeId);
  };

  SU.updateFontSuggestions = async (datalist, query) => {
    if (!datalist) {
      return;
    }

    const trimmedQuery = query.trim();
    datalist.replaceChildren();
    if (!trimmedQuery) {
      return;
    }

    const googleFonts = await SU.ensureGoogleFontCatalog();
    const normalizedQuery = SU.normalizeFontName(trimmedQuery);
    const googleMatches = googleFonts.filter((font) => SU.normalizeFontName(font.name).includes(normalizedQuery)).slice(0, 12);

    googleMatches.forEach((font) => {
      const option = document.createElement('option');
      option.value = font.name;
      datalist.appendChild(option);
    });
  };

  SU.resolveGoogleFontFamily = async (name) => {
    const googleFonts = await SU.ensureGoogleFontCatalog();
    const normalizedName = SU.normalizeFontName(name);
    return googleFonts.find((font) => SU.normalizeFontName(font.name) === normalizedName) ?? null;
  };

  SU.stepPreviewPairing = (step) => {
    const pairingKeys = SU.getPairingKeys();
    const currentIndex = pairingKeys.indexOf(SU.getEffectivePairing());
    const nextIndex = ((currentIndex === -1 ? 0 : currentIndex) + step + pairingKeys.length) % pairingKeys.length;
    SU.previewFontPairing = pairingKeys[nextIndex];
    SU.applyFontPairing(SU.previewFontPairing);
  };

  SU.applyFontPairing = (pairingKey) => {
    const nextPairingKey = SU.getValidPairing(pairingKey);
    const root = document.documentElement;

    if (SU.isStardanceDefaultPairing(nextPairingKey)) {
      root.classList.remove(SU.FONT_CLASS);
      root.style.removeProperty('--stardance-utils-font-regular');
      root.style.removeProperty('--stardance-utils-font-active');
      root.style.removeProperty('--stardance-utils-font-active-style');
      return;
    }

    const pairing = SU.getAllPairingsMap()[nextPairingKey] ?? SU.FONT_PAIRINGS[SU.DEFAULT_FONT_PAIRING];
    SU.ensureFontFamilyLoaded(pairing.regularSource ? {
      name: pairing.regular,
      source: pairing.regularSource,
      slug: pairing.regularSlug,
      fallback: pairing.regularFallback
    } : null);
    SU.ensureFontFamilyLoaded(pairing.activeSource ? {
      name: pairing.active,
      source: pairing.activeSource,
      slug: pairing.activeSlug,
      fallback: pairing.activeFallback
    } : null);
    root.classList.add(SU.FONT_CLASS);
    root.style.setProperty('--stardance-utils-font-regular', `'${pairing.regular}', ${pairing.regularFallback}`);
    root.style.setProperty('--stardance-utils-font-active', `'${pairing.active}', ${pairing.activeFallback}`);
    root.style.setProperty('--stardance-utils-font-active-style', pairing.activeItalic);
  };

  SU.saveCurrentPairing = async () => {
    SU.savedFontPairing = SU.getEffectivePairing();
    SU.previewFontPairing = SU.savedFontPairing;
    await SU.setStoredSetting({ [SU.FONT_PAIRING_KEY]: SU.savedFontPairing });
    SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
    SU.updateTryPanel?.();
  };

  SU.saveCurrentTheme = async () => {
    SU.savedTheme = SU.getEffectiveTheme();
    SU.previewTheme = SU.savedTheme;
    await SU.setStoredSetting({ [SU.THEME_KEY]: SU.savedTheme });
    SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
  };

  SU.resetToSavedPairing = () => {
    SU.previewFontPairing = SU.savedFontPairing;
    SU.applyFontPairing(SU.previewFontPairing);
    SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
    SU.updateTryPanel?.();
  };

  SU.resetToSavedTheme = () => {
    SU.previewTheme = SU.savedTheme;
    void SU.applyTheme(SU.previewTheme);
    SU.updateUtilsPanel?.(document.getElementById('settings-modal'));
  };
})();
