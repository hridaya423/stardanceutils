const FONT_PAIRING_KEY = 'sidebarFontPairing';
const TRY_MODE_PENDING_KEY = 'sidebarFontTryModePending';
const FONT_CLASS = 'stardance-utils-fonts-enabled';
const MODAL_ATTR = 'data-stardance-utils-enhanced';
const GOOGLE_FONT_LINK_ID = 'stardance-utils-google-fonts';
const FONTSHARE_LINK_ID = 'stardance-utils-fontshare-fonts';
const TRY_PANEL_ID = 'stardance-utils-try-panel';
const REORDER_BANNER_ID = 'stardance-utils-reorder-banner';
const INLINE_COMPOSER_ATTR = 'data-stardance-utils-inline-composer';
const DEVLOG_SPEECH_ATTR = 'data-stardance-utils-speech';
const DEVLOG_INLINE_EDIT_LINK_ATTR = 'data-stardance-utils-inline-edit-link';
const CUSTOM_FONT_PAIRINGS_KEY = 'customSidebarFontPairings';
const SIDEBAR_ORDER_KEY = 'sidebarTabOrder';
const FONT_DATALIST_ID = 'stardance-utils-font-suggestions';
const DEFAULT_FONT_PAIRING = 'outfit-instrument';
const TRY_MODE_FALLBACK_PATH = '/home';
const SIDEBAR_REORDER_CLASS = 'stardance-utils-sidebar-reordering';
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
let savedSidebarOrder = [];
let googleFontCatalog = null;
let googleFontCatalogPromise = null;
let draggedSidebarItemId = null;

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

function getSidebarNavEntries() {
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

    return {
      id: slug,
      label,
      item
    };
  }).filter(Boolean);
}

function normalizeSidebarOrder(order) {
  const entries = getSidebarNavEntries();
  const entryIds = entries.map((entry) => entry.id);
  const validOrder = (Array.isArray(order) ? order : []).filter((id) => entryIds.includes(id));
  const missingIds = entryIds.filter((id) => !validOrder.includes(id));
  return [...validOrder, ...missingIds];
}

function applySidebarOrder(order = savedSidebarOrder) {
  const navList = document.querySelector('#primary-nav .sidebar__nav-list');
  if (!navList) {
    return;
  }

  const entries = getSidebarNavEntries();
  const entryMap = new Map(entries.map((entry) => [entry.id, entry.item]));
  const nextOrder = normalizeSidebarOrder(order);

  nextOrder.forEach((id) => {
    const item = entryMap.get(id);
    if (item) {
      navList.appendChild(item);
    }
  });
}

async function saveSidebarOrder(order) {
  savedSidebarOrder = normalizeSidebarOrder(order);
  applySidebarOrder(savedSidebarOrder);
  await setStoredSetting({ [SIDEBAR_ORDER_KEY]: savedSidebarOrder });
  const dialog = document.getElementById('settings-modal');
  if (dialog) {
    updateUtilsPanel(dialog);
  }
}

function getCurrentSidebarOrder() {
  return getSidebarNavEntries().map((entry) => entry.id);
}

function getSidebarOrderLabels(order = savedSidebarOrder) {
  const entryMap = new Map(getSidebarNavEntries().map((entry) => [entry.id, entry.label]));
  return normalizeSidebarOrder(order)
    .map((id) => entryMap.get(id))
    .filter(Boolean);
}

function disableSidebarReorderMode() {
  document.documentElement.classList.remove(SIDEBAR_REORDER_CLASS);
  getSidebarNavEntries().forEach(({ item }) => {
    item.draggable = false;
    item.classList.remove('stardance-utils-sidebar-item--dragging');
    item.ondragstart = null;
    item.ondragend = null;
    item.ondragover = null;
    item.ondrop = null;
  });

  const banner = document.getElementById(REORDER_BANNER_ID);
  if (banner) {
    banner.remove();
  }

  draggedSidebarItemId = null;
}

function handleSidebarDragStart(event) {
  const item = event.currentTarget;
  const control = item.querySelector('[data-slug]');
  draggedSidebarItemId = control?.getAttribute('data-slug') ?? null;
  item.classList.add('stardance-utils-sidebar-item--dragging');
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

function handleSidebarDragEnd(event) {
  event.currentTarget.classList.remove('stardance-utils-sidebar-item--dragging');
  draggedSidebarItemId = null;
}

function handleSidebarDragOver(event) {
  if (!draggedSidebarItemId) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleSidebarDrop(event) {
  event.preventDefault();
  const targetItem = event.currentTarget;
  const targetSlug = targetItem.querySelector('[data-slug]')?.getAttribute('data-slug');
  if (!draggedSidebarItemId || !targetSlug || draggedSidebarItemId === targetSlug) {
    return;
  }

  const navList = document.querySelector('#primary-nav .sidebar__nav-list');
  const draggedItem = getSidebarNavEntries().find((entry) => entry.id === draggedSidebarItemId)?.item;
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

  saveSidebarOrder(getCurrentSidebarOrder());
}

function enableSidebarReorderMode() {
  const nav = document.querySelector('#primary-nav');
  if (!nav) {
    return;
  }

  disableSidebarReorderMode();
  document.documentElement.classList.add(SIDEBAR_REORDER_CLASS);

  getSidebarNavEntries().forEach(({ item }) => {
    item.draggable = true;
    item.ondragstart = handleSidebarDragStart;
    item.ondragend = handleSidebarDragEnd;
    item.ondragover = handleSidebarDragOver;
    item.ondrop = handleSidebarDrop;
  });

  const userCard = document.querySelector('#primary-nav .sidebar__user');
  if (!userCard) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = REORDER_BANNER_ID;
  banner.className = 'stardance-utils-reorder-banner';

  const text = document.createElement('div');
  text.className = 'stardance-utils-reorder-copy';
  text.textContent = 'Drag sidebar tabs to reorder. Changes save automatically.';

  const doneButton = document.createElement('button');
  doneButton.type = 'button';
  doneButton.className = 'stardance-utils-reorder-done';
  doneButton.textContent = 'Done';
  doneButton.addEventListener('click', () => disableSidebarReorderMode());

  banner.appendChild(text);
  banner.appendChild(doneButton);
  userCard.insertAdjacentElement('beforebegin', banner);
}

function renderSidebarOrderList(container) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  const text = document.createElement('div');
  text.className = 'stardance-utils-order-summary';
  text.textContent = getSidebarOrderLabels().join(' / ');

  container.appendChild(text);
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
  const orderList = dialog.querySelector('[data-stardance-utils-sidebar-order]');

  if (select) {
    renderPairingOptions(select, getEffectivePairing());
  }

  if (orderList) {
    renderSidebarOrderList(orderList);
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

function composeTranscriptText(baseText, finalText, interimText) {
  const parts = [baseText, finalText, interimText]
    .map((value) => (value || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return parts.join(' ').trim();
}

function normalizeTranscriptText(text) {
  let normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }

  normalized = normalized
    .replace(/\bi\b/g, 'I')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/([,.;!?])(\S)/g, '$1 $2')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return normalized;
}

function addCommaHints(text) {
  return text
    .replace(/\b(however|therefore|meanwhile|instead|also|anyway)\b/gi, ', $1,')
    .replace(/\s+,/g, ',')
    .replace(/,{2,}/g, ',')
    .replace(/,\s*,/g, ', ')
    .replace(/^,\s*/g, '')
    .replace(/\s+,\s*$/g, '');
}

function capitalizeSentences(text) {
  let shouldCapitalize = true;
  let output = '';

  for (const char of text) {
    if (shouldCapitalize && /[a-z]/.test(char)) {
      output += char.toUpperCase();
      shouldCapitalize = false;
      continue;
    }

    output += char;
    if (/[.!?]/.test(char)) {
      shouldCapitalize = true;
    } else if (!/\s/.test(char)) {
      shouldCapitalize = false;
    }
  }

  return output;
}

function formatTranscriptChunk(rawChunk, contextText = '', isFinal = false) {
  let chunk = normalizeTranscriptText(rawChunk);
  if (!chunk) {
    return '';
  }

  chunk = addCommaHints(chunk);

  const sentenceContext = normalizeTranscriptText(contextText);
  const shouldCapitalizeFirst = !sentenceContext || /[.!?]\s*$/.test(sentenceContext);
  if (shouldCapitalizeFirst) {
    chunk = chunk.replace(/^([a-z])/, (char) => char.toUpperCase());
  }

  if (isFinal && !/[.!?]$/.test(chunk)) {
    const wordCount = chunk.split(/\s+/).length;
    if (wordCount >= 14) {
      chunk = `${chunk}.`;
    }
  }

  return chunk;
}

function finalizeTranscriptText(text) {
  return capitalizeSentences(normalizeTranscriptText(text));
}

function enhanceDevlogSpeech(composerSection) {
  if (!composerSection || composerSection.getAttribute(DEVLOG_SPEECH_ATTR) === 'true') {
    return;
  }

  const textarea = composerSection.querySelector('textarea[name="post_devlog[body]"]');
  if (!textarea) {
    return;
  }

  composerSection.setAttribute(DEVLOG_SPEECH_ATTR, 'true');

  const submitGroup = composerSection.querySelector('.feed-composer__submit-group');
  if (!submitGroup) {
    return;
  }

  const speechWrap = document.createElement('div');
  speechWrap.className = 'stardance-utils-speech-wrap';

  const speechButton = document.createElement('button');
  speechButton.type = 'button';
  speechButton.className = 'feed-composer__tool-btn stardance-utils-speech-btn';
  speechButton.setAttribute('aria-pressed', 'false');
  speechButton.setAttribute('aria-label', 'Start speech to text');
  speechButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" class="stardance-utils-speech-icon"><path fill="currentColor" d="M12 3a3.5 3.5 0 0 0-3.5 3.5v5a3.5 3.5 0 1 0 7 0v-5A3.5 3.5 0 0 0 12 3Zm-5 8.25a.75.75 0 0 1 .75.75 4.25 4.25 0 1 0 8.5 0 .75.75 0 0 1 1.5 0 5.75 5.75 0 0 1-5 5.693V20h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2v-2.307a5.75 5.75 0 0 1-5-5.693.75.75 0 0 1 .75-.75Z"/></svg>';

  const speechStatus = document.createElement('span');
  speechStatus.className = 'stardance-utils-speech-status';
  speechStatus.setAttribute('aria-live', 'polite');
  speechStatus.textContent = '';

  speechWrap.appendChild(speechButton);
  speechWrap.appendChild(speechStatus);
  submitGroup.insertBefore(speechWrap, submitGroup.firstChild);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    speechButton.disabled = true;
    speechStatus.textContent = 'Speech not supported in this browser';
    return;
  }

  let recognition = null;
  let isListening = false;
  let finalBuffer = '';
  let sessionBaseText = '';
  let sessionFinalText = '';
  let sessionInterimText = '';

  const setStatus = (message, mode = 'idle') => {
    speechStatus.textContent = message;
    speechStatus.setAttribute('data-mode', mode);
  };

  const setListening = (listening) => {
    isListening = listening;
    speechButton.setAttribute('aria-pressed', listening ? 'true' : 'false');
    speechButton.classList.toggle('is-listening', listening);
    speechButton.setAttribute('aria-label', listening ? 'Stop speech to text' : 'Start speech to text');
  };

  const getRecognition = () => {
    if (recognition) {
      return recognition;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      finalBuffer = '';
      sessionBaseText = textarea.value || '';
      sessionFinalText = '';
      sessionInterimText = '';
      setListening(true);
      setStatus('', 'listening');
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalBuffer += `${transcript} `;
        } else {
          interim += transcript;
        }
      }

      if (finalBuffer.trim()) {
        const formattedFinal = formatTranscriptChunk(finalBuffer, composeTranscriptText(sessionBaseText, sessionFinalText, ''), true);
        sessionFinalText = composeTranscriptText(sessionFinalText, formattedFinal, '');
        finalBuffer = '';
      }

      sessionInterimText = formatTranscriptChunk(interim, composeTranscriptText(sessionBaseText, sessionFinalText, ''), false);

      const nextValue = finalizeTranscriptText(composeTranscriptText(sessionBaseText, sessionFinalText, sessionInterimText));
      textarea.value = nextValue;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      setStatus('', 'listening');
    };

    recognition.onerror = (event) => {
      const code = event?.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setStatus('Microphone permission denied', 'error');
      } else if (code === 'audio-capture') {
        setStatus('No microphone found', 'error');
      } else if (code === 'network') {
        setStatus('Speech service network issue', 'error');
      } else if (code === 'no-speech') {
        setStatus('No speech detected', 'warn');
      } else {
        setStatus('Speech to text unavailable', 'error');
      }
    };

    recognition.onend = () => {
      if (finalBuffer.trim()) {
        const formattedFinal = formatTranscriptChunk(finalBuffer, composeTranscriptText(sessionBaseText, sessionFinalText, ''), true);
        sessionFinalText = composeTranscriptText(sessionFinalText, formattedFinal, '');
        finalBuffer = '';
      }
      const committedValue = finalizeTranscriptText(composeTranscriptText(sessionBaseText, sessionFinalText, ''));
      textarea.value = committedValue;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      setListening(false);
      setStatus('', 'idle');
    };

    return recognition;
  };

  speechButton.addEventListener('click', () => {
    const activeRecognition = getRecognition();
    if (!isListening) {
      textarea.focus();
      try {
        activeRecognition.start();
      } catch (error) {
        setStatus('Could not start microphone', 'error');
      }
      return;
    }

    activeRecognition.stop();
  });
}

async function mountInlineDevlogEditor(editLink) {
  const href = editLink.getAttribute('href');
  if (!href) {
    return;
  }

  const host = editLink.closest('article.feed-post-card, article, li, .feed-item, .feed-card, section') || editLink.parentElement;
  if (!host || !host.parentNode) {
    window.location.href = href;
    return;
  }

  const existing = host.parentNode.querySelector(`[data-stardance-utils-inline-edit-for="${href}"]`);
  if (existing) {
    const originalId = existing.getAttribute('data-stardance-utils-inline-edit-host-id');
    const originalNode = originalId ? document.getElementById(originalId) : null;
    if (originalNode) {
      existing.replaceWith(originalNode);
    } else {
      existing.remove();
    }
    return;
  }

  const wrapper = document.createElement('section');
  wrapper.className = 'stardance-utils-inline-edit';
  wrapper.setAttribute('data-stardance-utils-inline-edit-for', href);
  if (host.id) {
    wrapper.setAttribute('data-stardance-utils-inline-edit-host-id', host.id);
  }
  wrapper.textContent = 'Loading editor...';
  host.replaceWith(wrapper);

  try {
    const response = await fetch(href, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Failed to load editor (${response.status})`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const editCard = doc.querySelector('.devlog-edit__card');
    if (!editCard) {
      throw new Error('Edit UI not found');
    }

    wrapper.textContent = '';

    const closeRow = document.createElement('div');
    closeRow.className = 'stardance-utils-inline-edit-close-row';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'action-btn action-btn--small action-btn--secondary';
    closeButton.innerHTML = '<span class="action-btn__label">Close editor</span>';
    closeButton.addEventListener('click', () => wrapper.replaceWith(host));
    closeRow.appendChild(closeButton);

    const importedCard = document.importNode(editCard, true);
    importedCard.classList.add('stardance-utils-inline-edit-card');

    const cancelLink = importedCard.querySelector('.devlog-edit__actions a.action-btn');
    if (cancelLink) {
      cancelLink.setAttribute('href', '#');
      cancelLink.addEventListener('click', (event) => {
        event.preventDefault();
        wrapper.replaceWith(host);
      });
    }

    wrapper.appendChild(closeRow);
    wrapper.appendChild(importedCard);
  } catch (error) {
    wrapper.replaceWith(host);
    window.location.href = href;
  }
}

function enhanceInlineDevlogEdit(projectMain) {
  const editLinks = projectMain.querySelectorAll('a[href*="/devlogs/"][href$="/edit"]');
  editLinks.forEach((editLink) => {
    if (editLink.getAttribute(DEVLOG_INLINE_EDIT_LINK_ATTR) === 'true') {
      return;
    }

    editLink.setAttribute(DEVLOG_INLINE_EDIT_LINK_ATTR, 'true');
    editLink.addEventListener('click', (event) => {
      event.preventDefault();
      mountInlineDevlogEditor(editLink);
    });
  });
}

function enhanceProjectShowPage() {
  const projectMain = document.querySelector('.app-layout__main');
  const actionsNav = projectMain?.querySelector('.project-show__actions');
  const heroBanner = projectMain?.querySelector('.project-show__banner');
  const feedSection = projectMain?.querySelector('.project-show__feed');
  if (!projectMain || !heroBanner || !feedSection) {
    return;
  }

  const completeInfoLink = actionsNav?.querySelector('a.action-btn[href*="complete=true"]');
  completeInfoLink?.remove();

  const shipButton = [...(actionsNav?.querySelectorAll('.action-btn') ?? [])].find((button) =>
    button.textContent?.includes('Ship your project')
  );
  if (shipButton && !heroBanner.querySelector('[data-stardance-utils-hero-ship]')) {
    const shipClone = shipButton.cloneNode(true);
    shipClone.setAttribute('data-stardance-utils-hero-ship', 'true');
    shipClone.className = 'action-btn action-btn--secondary stardance-utils-hero-ship';
    shipClone.setAttribute('data-tooltip-position-value', 'bottom');

    const label = shipClone.querySelector('.action-btn__label');
    if (label) {
      label.textContent = 'Ship';
    }

    const trailingIcon = shipClone.querySelector('.action-btn__icon--trailing');
    if (trailingIcon) {
      trailingIcon.classList.remove('action-btn__icon--trailing');
      trailingIcon.classList.add('action-btn__icon--leading');
      shipClone.insertBefore(trailingIcon, shipClone.firstChild);
    }

    const iconLeading = shipClone.querySelector('.action-btn__icon--leading');
    if (!iconLeading) {
      const icon = shipClone.querySelector('.action-btn__icon');
      if (icon) {
        icon.classList.add('action-btn__icon--leading');
        shipClone.insertBefore(icon, shipClone.firstChild);
      }
    }

    heroBanner.appendChild(shipClone);
    shipButton.remove();
  }

  const pathMatch = window.location.pathname.match(/\/projects\/(\d+)/);
  const projectId = pathMatch?.[1] ?? null;

  const postDevlogButton = [...(actionsNav?.querySelectorAll('.action-btn') ?? [])].find((button) =>
    button.textContent?.includes('Post a devlog')
  );
  const modalMatch = postDevlogButton?.getAttribute('onclick')?.match(/composer-modal-(\d+)/);
  const modalId = modalMatch ? `composer-modal-${modalMatch[1]}` : null;

  const isDevlogComposer = (composer) => {
    const form = composer?.querySelector('.feed-composer__form');
    if (!form) {
      return false;
    }

    const action = form.getAttribute('action') || '';
    const bodyField = form.querySelector('textarea[name="post_devlog[body]"]');
    if (bodyField) {
      return true;
    }

    if (!action.includes('/devlogs')) {
      return false;
    }

    return projectId ? action.includes(`/projects/${projectId}/devlogs`) : true;
  };

  const composerDialog = (modalId ? document.getElementById(modalId) : null)
    ?? [...document.querySelectorAll('.composer-modal')].find((dialog) => {
      const composer = dialog.querySelector('.feed-composer');
      return isDevlogComposer(composer);
    });

  const composerSection = composerDialog?.querySelector('.feed-composer')
    ?? [...projectMain.querySelectorAll('.feed-composer')].find((composer) => isDevlogComposer(composer));
  const inlineComposerShell = projectMain.querySelector('.stardance-utils-inline-composer-shell');
  if (composerSection && composerSection.getAttribute(INLINE_COMPOSER_ATTR) !== 'true' && !inlineComposerShell) {
    const composerShell = document.createElement('section');
    composerShell.className = 'stardance-utils-inline-composer-shell';

    const composerHeader = document.createElement('div');
    composerHeader.className = 'stardance-utils-inline-composer-header';

    const composerTitle = document.createElement('h2');
    composerTitle.className = 'stardance-utils-inline-composer-title';
    composerTitle.textContent = 'Post a devlog';

    composerHeader.appendChild(composerTitle);

    const chipsRow = composerSection.querySelector('.feed-composer__chips');
    chipsRow?.remove();

    composerSection.setAttribute(INLINE_COMPOSER_ATTR, 'true');
    composerSection.classList.add('stardance-utils-inline-composer');

    composerShell.appendChild(composerHeader);
    composerShell.appendChild(composerSection);
    feedSection.parentNode.insertBefore(composerShell, feedSection);

    if (composerDialog) {
      composerDialog.removeAttribute('open');
      composerDialog.setAttribute('hidden', 'hidden');
      composerDialog.setAttribute('aria-hidden', 'true');
      composerDialog.style.display = 'none';
      document.body.appendChild(composerDialog);
    }
  }

  const activeInlineComposer = [...projectMain.querySelectorAll('.stardance-utils-inline-composer.feed-composer, .feed-composer')]
    .find((composer) => isDevlogComposer(composer));
  enhanceDevlogSpeech(activeInlineComposer);
  enhanceInlineDevlogEdit(projectMain);

  actionsNav?.remove();
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

  orderLaunchButton.addEventListener('click', () => {
    enableSidebarReorderMode();

    const dialog = panel.closest('dialog');
    if (dialog?.open) {
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

  orderBody.appendChild(orderHint);
  orderBody.appendChild(orderList);
  orderBody.appendChild(orderLaunchButton);

  customAccordion.appendChild(customSummary);
  customAccordion.appendChild(customBody);
  orderAccordion.appendChild(orderSummary);
  orderAccordion.appendChild(orderBody);
  sidebarBody.appendChild(orderAccordion);
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

  const storedValues = await getStoredSettings([FONT_PAIRING_KEY, TRY_MODE_PENDING_KEY, CUSTOM_FONT_PAIRINGS_KEY, SIDEBAR_ORDER_KEY]);
  customFontPairings = Array.isArray(storedValues?.[CUSTOM_FONT_PAIRINGS_KEY]) ? storedValues[CUSTOM_FONT_PAIRINGS_KEY] : [];
  savedSidebarOrder = normalizeSidebarOrder(storedValues?.[SIDEBAR_ORDER_KEY]);
  savedFontPairing = getValidPairing(storedValues?.[FONT_PAIRING_KEY]);

  if (!previewFontPairing) {
    previewFontPairing = savedFontPairing;
  }

  applySidebarOrder(savedSidebarOrder);
  applyFontPairing(getEffectivePairing());
  enhanceProjectShowPage();

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
