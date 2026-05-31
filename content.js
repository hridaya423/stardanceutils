const FONT_PAIRING_KEY = 'sidebarFontPairing';
const TRY_MODE_PENDING_KEY = 'sidebarFontTryModePending';
const FONT_CLASS = 'stardance-utils-fonts-enabled';
const MODAL_ATTR = 'data-stardance-utils-enhanced';
const GOOGLE_FONT_LINK_ID = 'stardance-utils-google-fonts';
const FONTSHARE_LINK_ID = 'stardance-utils-fontshare-fonts';
const TRY_PANEL_ID = 'stardance-utils-try-panel';
const CUSTOM_FONT_PAIRINGS_KEY = 'customSidebarFontPairings';
const FONT_DATALIST_ID = 'stardance-utils-font-suggestions';
const DEFAULT_FONT_PAIRING = 'outfit-instrument';
const TRY_MODE_FALLBACK_PATH = '/home';
const FONT_PAIRINGS = {
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

const FONTSHARE_FONT_CATALOG = [
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

let savedFontPairing = DEFAULT_FONT_PAIRING;
let previewFontPairing = null;
let customFontPairings = [];
let googleFontCatalog = null;
let googleFontCatalogPromise = null;

const extensionStorage = globalThis.browser?.storage?.local ?? globalThis.chrome?.storage?.local ?? null;

function ensureFontLink() {
  if (!document.getElementById(GOOGLE_FONT_LINK_ID)) {
    const googleLink = document.createElement('link');
    googleLink.id = GOOGLE_FONT_LINK_ID;
    googleLink.rel = 'stylesheet';
    googleLink.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700&family=Instrument+Serif:ital@0;1&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    document.head.appendChild(googleLink);
  }

  if (!document.getElementById(FONTSHARE_LINK_ID)) {
    const fontshareLink = document.createElement('link');
    fontshareLink.id = FONTSHARE_LINK_ID;
    fontshareLink.rel = 'stylesheet';
    fontshareLink.href = 'https://api.fontshare.com/v2/css?f[]=switzer@400,500,700&f[]=general-sans@400,500,700&f[]=cabinet-grotesk@400,500,700&f[]=satoshi@400,500,700&display=swap';
    document.head.appendChild(fontshareLink);
  }
}

function getStoredSetting(key) {
  if (!extensionStorage) {
    return Promise.resolve(undefined);
  }

  if (globalThis.browser?.storage?.local) {
    return globalThis.browser.storage.local.get(key).then((result) => result?.[key]);
  }

  return new Promise((resolve) => {
    extensionStorage.get(key, (result) => {
      resolve(result?.[key]);
    });
  });
}

function getStoredSettings(keys) {
  if (!extensionStorage) {
    return Promise.resolve({});
  }

  if (globalThis.browser?.storage?.local) {
    return globalThis.browser.storage.local.get(keys);
  }

  return new Promise((resolve) => {
    extensionStorage.get(keys, (result) => {
      resolve(result ?? {});
    });
  });
}

function setStoredSetting(values) {
  if (!extensionStorage) {
    return Promise.resolve();
  }

  if (globalThis.browser?.storage?.local) {
    return globalThis.browser.storage.local.set(values);
  }

  return new Promise((resolve) => {
    extensionStorage.set(values, () => resolve());
  });
}

function removeStoredSetting(key) {
  if (!extensionStorage) {
    return Promise.resolve();
  }

  if (globalThis.browser?.storage?.local) {
    return globalThis.browser.storage.local.remove(key);
  }

  return new Promise((resolve) => {
    extensionStorage.remove(key, () => resolve());
  });
}

function normalizeFontName(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function inferFallbackFromCategory(category) {
  return typeof category === 'string' && category.toLowerCase().includes('serif') ? 'serif' : 'sans-serif';
}

async function ensureGoogleFontCatalog() {
  if (googleFontCatalog) {
    return googleFontCatalog;
  }

  if (!googleFontCatalogPromise) {
    googleFontCatalogPromise = fetch('https://fonts.google.com/metadata/fonts')
      .then((response) => response.text())
      .then((text) => {
        const jsonStart = text.indexOf('{');
        const metadata = JSON.parse(text.slice(jsonStart));
        googleFontCatalog = (metadata.familyMetadataList ?? []).map((family) => ({
          name: family.family,
          source: 'google',
          fallback: inferFallbackFromCategory(family.category)
        }));
        return googleFontCatalog;
      })
      .catch(() => {
        googleFontCatalog = [];
        return googleFontCatalog;
      });
  }

  return googleFontCatalogPromise;
}

function getAllPairingsMap() {
  const customEntries = Object.fromEntries(customFontPairings.map((pairing) => [pairing.id, pairing]));
  return { ...FONT_PAIRINGS, ...customEntries };
}

function renderPairingOptions(select, selectedValue) {
  if (!select) {
    return;
  }

  const pairings = getAllPairingsMap();
  select.replaceChildren();

  const curatedGroup = document.createElement('optgroup');
  curatedGroup.label = 'Curated pairings';
  Object.entries(FONT_PAIRINGS).forEach(([value, pairing]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = pairing.label;
    option.selected = value === selectedValue;
    curatedGroup.appendChild(option);
  });
  select.appendChild(curatedGroup);

  if (customFontPairings.length > 0) {
    const customGroup = document.createElement('optgroup');
    customGroup.label = 'Your pairings';
    customFontPairings.forEach((pairing) => {
      const option = document.createElement('option');
      option.value = pairing.id;
      option.textContent = pairings[pairing.id].label;
      option.selected = pairing.id === selectedValue;
      customGroup.appendChild(option);
    });
    select.appendChild(customGroup);
  }
}

function refreshPairingSelectors() {
  renderPairingOptions(document.querySelector('[data-stardance-utils-setting="sidebar-font-pairing"]'), getEffectivePairing());
  renderPairingOptions(document.querySelector('[data-stardance-utils-try-select]'), getEffectivePairing());
}

async function updateFontSuggestions(datalist, query) {
  if (!datalist) {
    return;
  }

  const trimmedQuery = query.trim();
  datalist.replaceChildren();
  if (!trimmedQuery) {
    return;
  }

  const googleFonts = await ensureGoogleFontCatalog();
  const normalizedQuery = normalizeFontName(trimmedQuery);
  const googleMatches = googleFonts.filter((font) => normalizeFontName(font.name).includes(normalizedQuery)).slice(0, 12);
  const suggestions = googleMatches;

  suggestions.forEach((font) => {
    const option = document.createElement('option');
    option.value = font.name;
    datalist.appendChild(option);
  });
}

async function resolveGoogleFontFamily(name) {
  const googleFonts = await ensureGoogleFontCatalog();
  const normalizedName = normalizeFontName(name);
  const googleMatch = googleFonts.find((font) => normalizeFontName(font.name) === normalizedName);
  if (googleMatch) {
    return googleMatch;
  }

  return null;
}

function ensureFontFamilyLoaded(family) {
  if (!family?.name || !family?.source) {
    return;
  }

  const fontId = `stardance-utils-font-${family.source}-${normalizeFontName(family.name).replace(/[^a-z0-9]+/g, '-')}`;
  if (document.getElementById(fontId)) {
    return;
  }

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';

  if (family.source === 'fontshare') {
    const slug = family.slug ?? normalizeFontName(family.name).replace(/\s+/g, '-');
    link.href = `https://api.fontshare.com/v2/css?f[]=${slug}@400,500,600,700&display=swap`;
  } else {
    const familyName = family.name.replace(/\s+/g, '+');
    link.href = `https://fonts.googleapis.com/css2?family=${familyName}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap`;
  }

  document.head.appendChild(link);
}

function getValidPairing(pairingKey) {
  return getAllPairingsMap()[pairingKey] ? pairingKey : DEFAULT_FONT_PAIRING;
}

function getEffectivePairing() {
  return getValidPairing(previewFontPairing ?? savedFontPairing);
}

function getPairingKeys() {
  return Object.keys(getAllPairingsMap());
}

function stepPreviewPairing(step) {
  const pairingKeys = getPairingKeys();
  const currentIndex = pairingKeys.indexOf(getEffectivePairing());
  const nextIndex = (currentIndex + step + pairingKeys.length) % pairingKeys.length;
  previewFontPairing = pairingKeys[nextIndex];
  applyFontPairing(previewFontPairing);
}

function applyFontPairing(pairingKey) {
  const pairing = getAllPairingsMap()[getValidPairing(pairingKey)] ?? FONT_PAIRINGS[DEFAULT_FONT_PAIRING];
  ensureFontFamilyLoaded(pairing.regularSource ? {
    name: pairing.regular,
    source: pairing.regularSource,
    slug: pairing.regularSlug,
    fallback: pairing.regularFallback
  } : null);
  ensureFontFamilyLoaded(pairing.activeSource ? {
    name: pairing.active,
    source: pairing.activeSource,
    slug: pairing.activeSlug,
    fallback: pairing.activeFallback
  } : null);
  document.documentElement.classList.add(FONT_CLASS);
  document.documentElement.style.setProperty('--stardance-utils-font-regular', `'${pairing.regular}', ${pairing.regularFallback}`);
  document.documentElement.style.setProperty('--stardance-utils-font-active', `'${pairing.active}', ${pairing.activeFallback}`);
  document.documentElement.style.setProperty('--stardance-utils-font-active-style', pairing.activeItalic);
}

function updateUtilsPanel(dialog) {
  if (!dialog) {
    return;
  }

  const select = dialog.querySelector('[data-stardance-utils-setting="sidebar-font-pairing"]');

  if (select) {
    renderPairingOptions(select, getEffectivePairing());
  }
}

function updateTryPanel() {
  const panel = document.getElementById(TRY_PANEL_ID);
  if (!panel) {
    return;
  }

  const select = panel.querySelector('[data-stardance-utils-try-select]');
  const pairingName = panel.querySelector('[data-stardance-utils-try-pairing-name]');

  if (select) {
    renderPairingOptions(select, getEffectivePairing());
  }

  if (pairingName) {
    pairingName.textContent = getAllPairingsMap()[getEffectivePairing()].label;
  }
}

async function saveCurrentPairing() {
  savedFontPairing = getEffectivePairing();
  previewFontPairing = savedFontPairing;
  await setStoredSetting({ [FONT_PAIRING_KEY]: savedFontPairing });
  updateUtilsPanel(document.getElementById('settings-modal'));
  updateTryPanel();
}

function resetToSavedPairing() {
  previewFontPairing = savedFontPairing;
  applyFontPairing(previewFontPairing);
  updateUtilsPanel(document.getElementById('settings-modal'));
  updateTryPanel();
}

function closeTryPanel(resetPreview = true) {
  const panel = document.getElementById(TRY_PANEL_ID);
  if (!panel) {
    return;
  }

  if (resetPreview) {
    resetToSavedPairing();
  }

  panel.remove();
}

function hasTryModeSurface() {
  return Boolean(document.querySelector('.discover-rail') && document.querySelector('#primary-nav'));
}

function goToTryModeSurface() {
  const targetUrl = new URL(TRY_MODE_FALLBACK_PATH, window.location.origin);
  targetUrl.searchParams.set('stardance-utils-try-mode', '1');
  return setStoredSetting({ [TRY_MODE_PENDING_KEY]: true }).then(() => {
    window.location.href = targetUrl.toString();
  });
}

function openTryPanel() {
  if (!hasTryModeSurface()) {
    return false;
  }

  const rail = document.querySelector('.discover-rail');

  let panel = document.getElementById(TRY_PANEL_ID);
  if (!panel) {
    panel = document.createElement('section');
    panel.id = TRY_PANEL_ID;
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
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => closeTryPanel(true));

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
    prevButton.textContent = '‹';
    prevButton.setAttribute('aria-label', 'Previous font pairing');
    prevButton.addEventListener('click', () => {
      stepPreviewPairing(-1);
      updateUtilsPanel(document.getElementById('settings-modal'));
      updateTryPanel();
    });

    const select = document.createElement('select');
    select.id = 'stardance-utils-try-select';
    select.className = 'settings-form__input stardance-utils-select';
    select.setAttribute('data-stardance-utils-try-select', 'true');
    select.setAttribute('aria-label', 'Choose font pairing');
    renderPairingOptions(select, getEffectivePairing());
    select.addEventListener('change', () => {
      previewFontPairing = getValidPairing(select.value);
      applyFontPairing(previewFontPairing);
      updateUtilsPanel(document.getElementById('settings-modal'));
      updateTryPanel();
    });

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'stardance-utils-try-cycle';
    nextButton.textContent = '›';
    nextButton.setAttribute('aria-label', 'Next font pairing');
    nextButton.addEventListener('click', () => {
      stepPreviewPairing(1);
      updateUtilsPanel(document.getElementById('settings-modal'));
      updateTryPanel();
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
      await saveCurrentPairing();
      closeTryPanel(false);
    });

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'stardance-utils-action-button stardance-utils-action-button--secondary';
    resetButton.textContent = 'Reset';
    resetButton.addEventListener('click', () => resetToSavedPairing());

    actions.appendChild(saveButton);
    actions.appendChild(resetButton);

    panel.appendChild(heading);
    panel.appendChild(controls);
    panel.appendChild(actions);
  }

  rail.appendChild(panel);
  applyFontPairing(getEffectivePairing());
  updateTryPanel();
  return true;
}

function setActiveTab(dialog, tab) {
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
}

function buildUtilsPanel(selectedPairing) {
  const panel = document.createElement('div');
  panel.className = 'settings-form stardance-utils-panel';
  panel.setAttribute('data-stardance-utils-panel', 'utils');
  panel.hidden = true;

  const field = document.createElement('div');
  field.className = 'settings-form__field';

  const sidebarAccordion = document.createElement('details');
  sidebarAccordion.className = 'stardance-utils-accordion';
  sidebarAccordion.open = true;

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
  renderPairingOptions(select, selectedPairing);

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

  const customHint = document.createElement('small');
  customHint.className = 'settings-form__hint';
  customHint.textContent = 'Pick a regular and active font from Google Fonts.';

  const datalist = document.createElement('datalist');
  datalist.id = FONT_DATALIST_ID;

  const customGrid = document.createElement('div');
  customGrid.className = 'stardance-utils-custom-grid';

  const regularInput = document.createElement('input');
  regularInput.type = 'text';
  regularInput.className = 'settings-form__input stardance-utils-font-input';
  regularInput.placeholder = 'Regular font';
  regularInput.setAttribute('list', FONT_DATALIST_ID);

  const activeInput = document.createElement('input');
  activeInput.type = 'text';
  activeInput.className = 'settings-form__input stardance-utils-font-input';
  activeInput.placeholder = 'Active font';
  activeInput.setAttribute('list', FONT_DATALIST_ID);

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

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'modal__actions-close modal__actions-close--primary stardance-utils-action-button stardance-utils-action-button--primary';
  saveButton.textContent = 'Save';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'modal__actions-close stardance-utils-action-button stardance-utils-action-button--secondary';
  resetButton.textContent = 'Reset';

  select.addEventListener('change', () => {
    previewFontPairing = getValidPairing(select.value);
    applyFontPairing(previewFontPairing);
    updateUtilsPanel(panel.closest('dialog'));
    updateTryPanel();
  });

  const handleAutocompleteInput = async (event) => {
    await updateFontSuggestions(datalist, event.currentTarget.value);
  };

  regularInput.addEventListener('input', handleAutocompleteInput);
  regularInput.addEventListener('focus', handleAutocompleteInput);
  activeInput.addEventListener('input', handleAutocompleteInput);
  activeInput.addEventListener('focus', handleAutocompleteInput);

  addButton.addEventListener('click', async () => {
    const regularFont = await resolveGoogleFontFamily(regularInput.value);
    const activeFont = await resolveGoogleFontFamily(activeInput.value);

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

    customFontPairings = [...customFontPairings, customPairing];
    await setStoredSetting({ [CUSTOM_FONT_PAIRINGS_KEY]: customFontPairings });

    previewFontPairing = customPairing.id;
    applyFontPairing(previewFontPairing);
    refreshPairingSelectors();
    updateUtilsPanel(panel.closest('dialog'));
    updateTryPanel();

    regularInput.value = '';
    activeInput.value = '';
    customStatus.textContent = 'Custom pairing added.';
  });

  saveButton.addEventListener('click', async () => {
    await saveCurrentPairing();
  });

  resetButton.addEventListener('click', () => {
    resetToSavedPairing();
  });

  tryButton.addEventListener('click', () => {
    if (!hasTryModeSurface()) {
      goToTryModeSurface();
      return;
    }

    const didOpen = openTryPanel();

    const dialog = panel.closest('dialog');
    if (didOpen && dialog?.open) {
      dialog.close();
    }
  });

  actions.appendChild(saveButton);
  actions.appendChild(resetButton);

  customGrid.appendChild(regularInput);
  customGrid.appendChild(activeInput);
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

  customAccordion.appendChild(customSummary);
  customAccordion.appendChild(customBody);
  sidebarBody.appendChild(customAccordion);

  sidebarAccordion.appendChild(sidebarSummary);
  sidebarAccordion.appendChild(sidebarBody);
  field.appendChild(sidebarAccordion);
  panel.appendChild(field);

  return panel;
}

function enhanceSettingsModal(dialog, selectedPairing) {
  if (dialog.getAttribute(MODAL_ATTR) === 'true') {
    updateUtilsPanel(dialog);
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

  stardanceTab.addEventListener('click', () => setActiveTab(dialog, 'stardance'));
  utilsTab.addEventListener('click', () => setActiveTab(dialog, 'utils'));

  tabs.appendChild(stardanceTab);
  tabs.appendChild(utilsTab);

  const utilsPanel = buildUtilsPanel(selectedPairing);

  title.insertAdjacentElement('afterend', tabs);
  form.insertAdjacentElement('afterend', utilsPanel);
  dialog.setAttribute(MODAL_ATTR, 'true');
  updateUtilsPanel(dialog);
}

async function syncEnhancements() {
  ensureFontLink();

  const storedValues = await getStoredSettings([FONT_PAIRING_KEY, TRY_MODE_PENDING_KEY, CUSTOM_FONT_PAIRINGS_KEY]);
  customFontPairings = Array.isArray(storedValues?.[CUSTOM_FONT_PAIRINGS_KEY]) ? storedValues[CUSTOM_FONT_PAIRINGS_KEY] : [];
  savedFontPairing = getValidPairing(storedValues?.[FONT_PAIRING_KEY]);

  if (!previewFontPairing) {
    previewFontPairing = savedFontPairing;
  }

  applyFontPairing(getEffectivePairing());

  const dialog = document.getElementById('settings-modal');
  if (dialog) {
    enhanceSettingsModal(dialog, getEffectivePairing());
  }

  const shouldOpenTryMode = Boolean(storedValues?.[TRY_MODE_PENDING_KEY]) || window.location.search.includes('stardance-utils-try-mode=1');
  if (shouldOpenTryMode && hasTryModeSurface()) {
    openTryPanel();
    await removeStoredSetting(TRY_MODE_PENDING_KEY);

    const url = new URL(window.location.href);
    url.searchParams.delete('stardance-utils-try-mode');
    window.history.replaceState({}, '', url);
  }
}

let syncScheduled = false;

function scheduleSync() {
  if (syncScheduled) {
    return;
  }

  syncScheduled = true;
  queueMicrotask(async () => {
    syncScheduled = false;
    await syncEnhancements();
  });
}

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
        || Boolean(element.querySelector?.('#settings-modal, #primary-nav, .discover-rail'));
    });
  });

  if (shouldResync) {
    scheduleSync();
  }
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

scheduleSync();
