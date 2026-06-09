(() => {
  const SU = globalThis.StardanceUtils;

  SU.compactText = SU.compactText || ((value) => String(value ?? '').replace(/\s+/g, ' ').trim());

  SU.SHOP_CATEGORY_OPTIONS = [
    { label: 'All', path: '/shop/category/all' },
    { label: 'Experiences', path: '/shop/category/experiences' },
    { label: 'Hardware', path: '/shop/category/hardware' },
    { label: 'Software', path: '/shop/category/software' },
    { label: 'Swag', path: '/shop/category/swag' },
    { label: 'Grants', path: '/shop/category/grants' }
  ];

  SU.getShopHub = () => document.querySelector('.shop-hub');

  SU.isShopHubPage = () => window.location.pathname === '/shop';

  SU.withShopMutationGuard = (callback) => {
    SU.shopMutationGuard = true;

    try {
      return callback();
    } finally {
      window.setTimeout(() => {
        SU.shopMutationGuard = false;
      }, 0);
    }
  };

  SU.cleanupLegacyAiCheckStorage = () => {
    if (SU.legacyAiCheckStorageCleaned) {
      return;
    }

    SU.legacyAiCheckStorageCleaned = true;

    try {
      const keys = [];
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (key) {
          keys.push(key);
        }
      }

      keys.forEach((key) => {
        if (key === 'stardance-utils:ai-check' || key.startsWith('stardance-utils:ai-check:')) {
          window.localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore localStorage access failures.
    }
  };

  SU.normalizeShopGoalRecord = (record = {}) => {
    const id = SU.compactText(record.id);
    if (!id) {
      return null;
    }

    const normalizeList = (value) => (Array.isArray(value) ? value : [])
      .map((item) => SU.compactText(item))
      .filter(Boolean);

    return {
      id,
      name: SU.compactText(record.name),
      href: SU.compactText(record.href),
      imageUrl: SU.compactText(record.imageUrl),
      description: SU.compactText(record.description),
      categories: normalizeList(record.categories),
      regions: normalizeList(record.regions),
      price: Number.isFinite(record.price) ? record.price : null,
      quantity: Math.max(1, Number.isFinite(record.quantity) ? Math.round(record.quantity) : 1),
      hoursText: SU.compactText(record.hoursText),
      sortOrder: Number.isFinite(record.sortOrder) ? record.sortOrder : null,
      updatedAt: Number.isFinite(record.updatedAt) ? record.updatedAt : Date.now()
    };
  };

  SU.normalizeShopGoals = (raw) => {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    return Object.values(source).reduce((acc, value) => {
      const normalized = SU.normalizeShopGoalRecord(value);
      if (normalized) {
        acc[normalized.id] = normalized;
      }
      return acc;
    }, {});
  };

  SU.loadShopGoals = async () => {
    SU.savedShopGoals = SU.normalizeShopGoals(await SU.getStoredSetting(SU.SHOP_GOALS_KEY));
    SU.ensureShopGoalSortOrder();
    return SU.savedShopGoals;
  };

  SU.getNextShopGoalSortOrder = () => Object.values(SU.savedShopGoals || {}).reduce((max, goal) => (
    Number.isFinite(goal.sortOrder) ? Math.max(max, goal.sortOrder) : max
  ), -1) + 1;

  SU.ensureShopGoalSortOrder = () => {
    SU.savedShopGoals = SU.savedShopGoals || {};
    const goals = Object.values(SU.savedShopGoals);
    const needsOrder = goals.some((goal) => !Number.isFinite(goal.sortOrder));
    if (!needsOrder) {
      return false;
    }

    goals
      .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0))
      .forEach((goal, index) => {
        SU.savedShopGoals[goal.id] = {
          ...SU.savedShopGoals[goal.id],
          sortOrder: index
        };
      });

    void SU.persistShopGoals();
    return true;
  };

  SU.persistShopGoals = async () => {
    try {
      if (!SU.savedShopGoals || Object.keys(SU.savedShopGoals).length === 0) {
        await SU.removeStoredSetting(SU.SHOP_GOALS_KEY);
        SU.savedShopGoals = {};
        return true;
      }

      await SU.setStoredSetting({ [SU.SHOP_GOALS_KEY]: SU.savedShopGoals });
      return true;
    } catch (error) {
      console.error('[Stardance Utils]', 'Failed to persist shop goals', error);
      return false;
    }
  };

  SU.getShopItemId = (card) => SU.compactText(
    card?.getAttribute('data-shop-id')
    || card?.getAttribute('data-shop-wishlist-item-id-value')
  );

  SU.isShopCardWishlisted = (card) => (
    card?.classList?.contains('shop-item-card--wishlisted')
    || card?.getAttribute('data-shop-wishlist-wishlisted-value') === 'true'
  );

  SU.collectShopItemData = (card) => {
    const id = SU.getShopItemId(card);
    if (!id) {
      return null;
    }

    const categories = SU.compactText(card.getAttribute('data-categories'))
      .split(',')
      .map((value) => SU.compactText(value))
      .filter(Boolean);

    const regions = SU.compactText(card.getAttribute('data-regions'))
      .split(',')
      .map((value) => SU.compactText(value))
      .filter(Boolean);

    return SU.normalizeShopGoalRecord({
      id,
      name: card.querySelector('.shop-item-card__title')?.textContent,
      href: card.querySelector('.shop-item-card__image-wrap[href]')?.getAttribute('href'),
      imageUrl: card.querySelector('.shop-item-card__image')?.getAttribute('src'),
      description: card.querySelector('.shop-item-card__description')?.textContent,
      categories,
      regions,
      price: Number.parseFloat(card.getAttribute('data-price') || ''),
      hoursText: card.querySelector('.shop-item-card__hours')?.textContent,
      updatedAt: Date.now()
    });
  };

  SU.setShopGoal = (record) => {
    const normalized = SU.normalizeShopGoalRecord(record);
    if (!normalized) {
      return;
    }

    SU.savedShopGoals = SU.savedShopGoals || {};
    const existing = SU.savedShopGoals[normalized.id] || {};
    SU.savedShopGoals[normalized.id] = {
      ...existing,
      ...normalized,
      quantity: Math.max(1, Number.isFinite(existing.quantity) ? Math.round(existing.quantity) : normalized.quantity),
      sortOrder: Number.isFinite(existing.sortOrder) ? existing.sortOrder : SU.getNextShopGoalSortOrder(),
      updatedAt: Date.now()
    };
    void SU.persistShopGoals();
    void (async () => {
      const map = (await SU.getShopGoalsSuppressedUntil?.()) ?? {};
      if (map[normalized.id]) {
        delete map[normalized.id];
        await SU.setShopGoalsSuppressedUntil?.(map);
      }
    })();
  };

  SU.upsertShopGoalFromSourceRecord = (record) => {
    const normalized = SU.normalizeShopGoalRecord(record);
    if (!normalized) {
      return false;
    }

    SU.savedShopGoals = SU.savedShopGoals || {};
    const existing = SU.savedShopGoals[normalized.id] || {};
    const nextRecord = {
      ...existing,
      ...normalized,
      quantity: Math.max(1, Number.isFinite(existing.quantity) ? Math.round(existing.quantity) : normalized.quantity),
      sortOrder: Number.isFinite(existing.sortOrder) ? existing.sortOrder : SU.getNextShopGoalSortOrder(),
      updatedAt: existing.updatedAt || normalized.updatedAt
    };

    if (JSON.stringify(nextRecord) === JSON.stringify(SU.savedShopGoals[normalized.id] || null)) {
      return false;
    }

    SU.savedShopGoals[normalized.id] = nextRecord;
    return true;
  };

  SU.setShopGoalQuantity = (shopId, delta) => {
    if (!shopId || !SU.savedShopGoals?.[shopId]) {
      return;
    }

    const currentQuantity = Math.max(1, Number.isFinite(SU.savedShopGoals[shopId].quantity) ? Math.round(SU.savedShopGoals[shopId].quantity) : 1);
    const nextQuantity = Math.max(1, currentQuantity + delta);
    SU.savedShopGoals[shopId] = {
      ...SU.savedShopGoals[shopId],
      quantity: nextQuantity,
      sortOrder: Number.isFinite(SU.savedShopGoals[shopId].sortOrder)
        ? SU.savedShopGoals[shopId].sortOrder
        : SU.getNextShopGoalSortOrder(),
      updatedAt: Date.now()
    };
    void SU.persistShopGoals();
  };

  SU.setSourceShopCardWishlisted = (shopId, shouldBeWishlisted) => {
    const sourceCard = SU.findAllShopCardsById(shopId).find((card) => {
      const star = card.querySelector('.shop-item-card__star');
      return star && SU.isShopCardWishlisted(card) !== shouldBeWishlisted;
    }) || SU.findSourceShopCardById(shopId);
    const star = sourceCard?.querySelector('.shop-item-card__star');
    if (!sourceCard || !star) {
      return false;
    }

    if (SU.isAnyShopCardWishlisted(shopId) === shouldBeWishlisted) {
      return true;
    }

    star.click();
    return true;
  };

  SU.removeShopGoal = (shopId) => {
    if (!shopId || !SU.savedShopGoals?.[shopId]) {
      return;
    }

    delete SU.savedShopGoals[shopId];
    void SU.persistShopGoals();
    void (async () => {
      const map = (await SU.getShopGoalsSuppressedUntil?.()) ?? {};
      map[shopId] = Date.now() + 30_000;
      await SU.setShopGoalsSuppressedUntil?.(map);
    })();
  };

  SU.getSortedShopGoals = () => Object.values(SU.savedShopGoals || {})
    .sort((left, right) => {
      const leftOrder = Number.isFinite(left.sortOrder) ? left.sortOrder : Number.MAX_SAFE_INTEGER;
      const rightOrder = Number.isFinite(right.sortOrder) ? right.sortOrder : Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || ((right.updatedAt || 0) - (left.updatedAt || 0));
    });

  SU.moveShopGoal = (shopId, targetShopId) => {
    if (!shopId || !targetShopId || shopId === targetShopId || !SU.savedShopGoals?.[shopId] || !SU.savedShopGoals?.[targetShopId]) {
      return false;
    }

    const orderedIds = SU.getSortedShopGoals().map((goal) => goal.id);
    const fromIndex = orderedIds.indexOf(shopId);
    const toIndex = orderedIds.indexOf(targetShopId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return false;
    }

    orderedIds.splice(toIndex, 0, orderedIds.splice(fromIndex, 1)[0]);
    orderedIds.forEach((id, index) => {
      SU.savedShopGoals[id] = {
        ...SU.savedShopGoals[id],
        sortOrder: index
      };
    });

    SU.persistShopGoals();
    return true;
  };

  SU.parseHoursRange = (hoursText) => {
    const text = SU.compactText(hoursText);
    if (!text) {
      return null;
    }

    const matches = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number.parseFloat(match[1]));
    if (!matches.length) {
      return null;
    }

    return {
      low: matches[0],
      high: matches[matches.length - 1]
    };
  };

  SU.formatHoursRange = (range) => {
    if (!range || !Number.isFinite(range.low) || !Number.isFinite(range.high)) {
      return '';
    }

    const formatPart = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1));
    return `~${formatPart(range.low)}-${formatPart(range.high)} hours`;
  };

  SU.formatCompactHours = (range) => {
    if (!range || !Number.isFinite(range.low)) {
      return '';
    }

    const low = Number.isInteger(range.low) ? String(range.low) : range.low.toFixed(1);
    return `~${low}h`;
  };

  SU.scaleHoursRange = (range, multiplier = 1) => {
    if (!range || !Number.isFinite(range.low) || !Number.isFinite(range.high)) {
      return null;
    }

    return {
      low: range.low * multiplier,
      high: range.high * multiplier
    };
  };

  SU.getAllShopCards = () => [...document.querySelectorAll('.shop-item-card[data-shop-id], .shop-item-card[data-shop-wishlist-item-id-value]')];

  SU.findAllShopCardsById = (shopId) => {
    if (!shopId) {
      return [];
    }

    return SU.getAllShopCards().filter((card) => SU.getShopItemId(card) === shopId);
  };

  SU.getShopCardsById = () => SU.getAllShopCards().reduce((map, card) => {
    const shopId = SU.getShopItemId(card);
    if (!shopId) {
      return map;
    }

    const cards = map.get(shopId) || [];
    cards.push(card);
    map.set(shopId, cards);
    return map;
  }, new Map());

  SU.isShopCardVisible = (card) => Boolean(card?.isConnected && card.getClientRects().length);

  SU.isAnyShopCardWishlisted = (shopIdOrCards) => {
    const cards = Array.isArray(shopIdOrCards) ? shopIdOrCards : SU.findAllShopCardsById(shopIdOrCards);
    return cards.some((card) => SU.isShopCardWishlisted(card));
  };

  SU.getBestShopGoalSourceCard = (shopIdOrCards) => {
    const cards = Array.isArray(shopIdOrCards) ? shopIdOrCards : SU.findAllShopCardsById(shopIdOrCards);
    return [...cards].sort((left, right) => {
      const leftWishlisted = SU.isShopCardWishlisted(left) ? 1 : 0;
      const rightWishlisted = SU.isShopCardWishlisted(right) ? 1 : 0;
      const leftVisible = SU.isShopCardVisible(left) ? 1 : 0;
      const rightVisible = SU.isShopCardVisible(right) ? 1 : 0;
      return (rightWishlisted - leftWishlisted) || (rightVisible - leftVisible);
    })[0] || null;
  };

  SU.syncShopGoalWithCards = (shopId, cards = SU.findAllShopCardsById(shopId)) => {
    if (!shopId || !cards.length) {
      return false;
    }

    if (SU.isAnyShopCardWishlisted(cards)) {
      const sourceCard = SU.getBestShopGoalSourceCard(cards);
      const record = sourceCard ? SU.collectShopItemData(sourceCard) : null;
      if (record) {
        SU.setShopGoal(record);
        return true;
      }
      return false;
    }

    if (SU.savedShopGoals?.[shopId]) {
      SU.removeShopGoal(shopId);
      return true;
    }

    return false;
  };

  SU.scheduleShopGoalSyncForItem = (shopId, delay = 80) => {
    if (!shopId) {
      return;
    }

    SU.shopWishlistAttributeSyncTimers = SU.shopWishlistAttributeSyncTimers || new Map();
    const existingTimer = SU.shopWishlistAttributeSyncTimers.get(shopId);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timerId = window.setTimeout(() => {
      SU.shopWishlistAttributeSyncTimers.delete(shopId);
      SU.syncShopGoalWithCards(shopId);
      SU.renderShopGoalsRail();
    }, delay);

    SU.shopWishlistAttributeSyncTimers.set(shopId, timerId);
  };

  SU.syncShopGoalAfterWishlistToggle = (shopId, previousState, attempt = 0) => {
    if (!shopId) {
      return;
    }

    const cards = SU.findAllShopCardsById(shopId);
    if (!cards.length) {
      return;
    }

    const nextState = SU.isAnyShopCardWishlisted(cards);
    if (nextState !== previousState || attempt >= 12) {
      SU.shopGoalSyncTimers?.delete(shopId);
      SU.syncShopGoalWithCards(shopId, cards);
      SU.renderShopGoalsRail();
      return;
    }

    const timerId = window.setTimeout(() => {
      SU.syncShopGoalAfterWishlistToggle(shopId, previousState, attempt + 1);
    }, 80);
    SU.shopGoalSyncTimers.set(shopId, timerId);
  };

  SU.findSourceShopCardById = (shopId) => {
    if (!shopId) {
      return null;
    }

    return SU.getBestShopGoalSourceCard(shopId);
  };

  SU.reconcileShopGoalsWithVisibleWishlist = () => {
    SU.savedShopGoals = SU.savedShopGoals || {};
    let changed = false;

    SU.getShopCardsById().forEach((cards, shopId) => {
      if (SU.isAnyShopCardWishlisted(cards)) {
        const sourceCard = SU.getBestShopGoalSourceCard(cards);
        const record = sourceCard ? SU.collectShopItemData(sourceCard) : null;
        changed = SU.upsertShopGoalFromSourceRecord(record) || changed;
        return;
      }

      if (SU.savedShopGoals[shopId]) {
        delete SU.savedShopGoals[shopId];
        changed = true;
      }
    });

    if (changed) {
      void SU.persistShopGoals();
    }

    return changed;
  };

  SU.refreshShopGoalRecordsFromPage = () => {
    if (!SU.savedShopGoals) {
      return false;
    }

    let changed = false;
    Object.keys(SU.savedShopGoals).forEach((shopId) => {
      const sourceCard = SU.findSourceShopCardById(shopId);
      if (!sourceCard) {
        return;
      }

      const freshRecord = SU.collectShopItemData(sourceCard);
      if (!freshRecord) {
        return;
      }

      changed = SU.upsertShopGoalFromSourceRecord(freshRecord) || changed;
    });

    if (changed) {
      void SU.persistShopGoals();
    }

    return changed;
  };

  SU.getShopCurrentBalance = () => {
    const raw = SU.compactText(document.querySelector('.sidebar__user-balance-amount')?.textContent);
    const numeric = Number.parseFloat(raw.replace(/,/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  SU.getShopStardustIconSrc = () => (
    document.querySelector('.sidebar__user-balance-icon')?.getAttribute('src')
    || 'https://stardance.hackclub.com/assets/icons/stardust-18e809ef.png'
  );

  SU.scheduleShopGoalsReconcileRender = (delay = 120) => {
    window.setTimeout(() => {
      SU.refreshShopGoalRecordsFromPage();
      SU.reconcileShopGoalsWithVisibleWishlist();
      SU.renderShopGoalsRail();
    }, delay);
  };

  SU.setShopMarkup = (node, html) => {
    if (!node || node.innerHTML === html) {
      return false;
    }

    SU.withShopMutationGuard(() => {
      node.innerHTML = html;
    });
    return true;
  };

  SU.ensureShopGoalsState = (goals) => {
    if (!goals.length) {
      SU.shopGoalsScopeMode = 'individual';
      SU.shopGoalsActiveId = null;
      return;
    }

    if (SU.shopGoalsScopeMode !== 'cumulative') {
      SU.shopGoalsScopeMode = 'individual';
    }

    const goalIds = new Set(goals.map((goal) => goal.id));
    if (!goalIds.has(SU.shopGoalsActiveId)) {
      SU.shopGoalsActiveId = goals[0].id;
    }
  };

  SU.calculateShopGoalsSummary = (goals) => {
    SU.ensureShopGoalsState(goals);
    const current = SU.getShopCurrentBalance();
    const pricedGoals = goals.map((goal) => ({
      ...goal,
      quantity: Math.max(1, Number.isFinite(goal.quantity) ? Math.round(goal.quantity) : 1),
      price: Number.isFinite(goal.price) ? goal.price : 0,
      hoursRange: SU.parseHoursRange(goal.hoursText)
    }));

    const cumulativeTarget = pricedGoals.reduce((sum, goal) => sum + (goal.price * goal.quantity), 0);
    const totalHoursRange = pricedGoals.reduce((sum, goal) => {
      if (!goal.hoursRange) {
        return sum;
      }

      return {
        low: sum.low + (goal.hoursRange.low * goal.quantity),
        high: sum.high + (goal.hoursRange.high * goal.quantity)
      };
    }, { low: 0, high: 0 });
    const needed = Math.max(cumulativeTarget - current, 0);
    const progressTarget = Math.max(current + needed, 1);
    const progress = Math.max(0, Math.min(100, (current / progressTarget) * 100));

    const goalsWithProgress = pricedGoals.map((goal, index) => {
      const cumulativePrice = pricedGoals.slice(0, index + 1).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const cumulativeHours = pricedGoals.slice(0, index + 1).reduce((sum, item) => {
        if (!item.hoursRange) {
          return sum;
        }
        return {
          low: sum.low + (item.hoursRange.low * item.quantity),
          high: sum.high + (item.hoursRange.high * item.quantity)
        };
      }, { low: 0, high: 0 });
      const itemTarget = goal.price * goal.quantity;
      const progressTarget = SU.shopGoalsScopeMode === 'cumulative' ? cumulativePrice : itemTarget;
      const cardNeeded = Math.max(itemTarget - current, 0);
      const cardProgressTarget = Math.max(progressTarget, 1);
      const individualHours = SU.scaleHoursRange(goal.hoursRange, goal.quantity);
      return {
        ...goal,
        compactHoursText: SU.shopGoalsScopeMode === 'cumulative'
          ? SU.formatCompactHours(cumulativeHours)
          : SU.formatCompactHours(individualHours),
        displayHoursText: SU.shopGoalsScopeMode === 'cumulative'
          ? SU.formatHoursRange(cumulativeHours)
          : SU.formatHoursRange(individualHours),
        displayNeeded: cardNeeded,
        displayProgress: Math.max(0, Math.min(100, (current / cardProgressTarget) * 100)),
        displayTarget: itemTarget,
        cumulativePrice
      };
    });

    return {
      current,
      currentFormatted: new Intl.NumberFormat('en-US').format(current),
      needed,
      neededFormatted: new Intl.NumberFormat('en-US').format(needed),
      progress,
      goalCount: pricedGoals.length,
      goalsWithProgress,
      target: cumulativeTarget,
      targetFormatted: new Intl.NumberFormat('en-US').format(cumulativeTarget),
      totalHoursText: SU.formatHoursRange(totalHoursRange),
      subtitle: SU.shopGoalsScopeMode === 'cumulative'
        ? 'Each card stacks the goals before it.'
        : 'Each card stands on its own.'
    };
  };

  SU.renderShopGoalsCardsHtml = (summary, options = {}) => {
    const listClass = options.inline
      ? 'discover-rail__list stardance-utils-shop-goals-list stardance-utils-shop-goals-list--inline'
      : `discover-rail__list stardance-utils-shop-goals-list${options.expanded ? ' stardance-utils-shop-goals-list--expanded' : ''}`;
    const stardustIconSrc = SU.getShopStardustIconSrc();

    return `
      <ul class="${listClass}">
        ${summary.goalsWithProgress.map((goal) => `
          <li class="stardance-utils-shop-goals-item${goal.id === SU.shopGoalsActiveId ? ' is-active' : ''}" data-stardance-utils-goal-item="true" data-shop-id="${SU.escapeHtml(goal.id)}" draggable="true">
            <button type="button" class="stardance-utils-shop-goals-remove" data-stardance-utils-goal-action="remove" data-shop-id="${SU.escapeHtml(goal.id)}" aria-label="Remove goal">&times;</button>
            <div class="discover-rail__card stardance-utils-shop-goals-card" style="--stardance-utils-goal-progress:${goal.displayProgress}%;">
              <div class="stardance-utils-shop-goals-row">
                <a class="stardance-utils-shop-goals-link" href="${SU.escapeHtml(goal.href || '#')}">
                  ${goal.imageUrl ? `<img class="stardance-utils-shop-goals-thumb" src="${SU.escapeHtml(goal.imageUrl)}" alt="${SU.escapeHtml(goal.name || 'Goal item')}">` : ''}
                  <span class="stardance-utils-shop-goals-copy">
                    <span class="discover-rail__card-title">${SU.escapeHtml(goal.name || 'Unnamed item')}</span>
                  </span>
                </a>
                <span class="stardance-utils-shop-goals-meta">
                  <span class="stardance-utils-shop-goals-cost"><img class="stardance-utils-shop-goals-cost-icon" src="${SU.escapeHtml(stardustIconSrc)}" alt="" aria-hidden="true"><span>${new Intl.NumberFormat('en-US').format(goal.displayNeeded)}</span></span>
                  ${goal.compactHoursText ? `<span class="discover-rail__card-body">${SU.escapeHtml(goal.compactHoursText)}</span>` : ''}
                </span>
                <span class="stardance-utils-shop-goals-actions" aria-label="Goal controls">
                  <span class="stardance-utils-shop-goals-stepper">
                    <button type="button" class="stardance-utils-shop-goals-action" data-stardance-utils-goal-action="decrement" data-shop-id="${SU.escapeHtml(goal.id)}" aria-label="Decrease quantity">-</button>
                    <button type="button" class="stardance-utils-shop-goals-action" data-stardance-utils-goal-action="increment" data-shop-id="${SU.escapeHtml(goal.id)}" aria-label="Increase quantity">+</button>
                    <span class="stardance-utils-shop-goals-quantity" aria-label="Quantity">${goal.quantity}</span>
                  </span>
                </span>
              </div>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  };

  SU.renderShopGoalsSummaryHtml = (summary) => {
    return `
      <div class="stardance-utils-shop-goals-summary">
        <div class="stardance-utils-shop-goals-toggles">
          <div class="stardance-utils-shop-goals-toggle-group" role="tablist" aria-label="Goals aggregation mode">
            <button type="button" class="stardance-utils-shop-goals-toggle${SU.shopGoalsScopeMode === 'cumulative' ? ' is-active' : ''}" data-stardance-utils-goals-scope="cumulative" aria-pressed="${SU.shopGoalsScopeMode === 'cumulative'}">Cumulative</button>
            <button type="button" class="stardance-utils-shop-goals-toggle${SU.shopGoalsScopeMode === 'individual' ? ' is-active' : ''}" data-stardance-utils-goals-scope="individual" aria-pressed="${SU.shopGoalsScopeMode === 'individual'}">Individual</button>
          </div>
        </div>
        <div class="stardance-utils-shop-goals-progress-head">
          <span class="stardance-utils-shop-goals-stat">${new Intl.NumberFormat('en-US').format(summary.current)} current</span>
          <span class="stardance-utils-shop-goals-stat">${new Intl.NumberFormat('en-US').format(summary.needed)} needed for ${summary.goalCount} goal${summary.goalCount === 1 ? '' : 's'}</span>
        </div>
        <div class="stardance-utils-shop-goals-progress" aria-hidden="true">
          <span class="stardance-utils-shop-goals-progress-fill" style="width:${summary.progress}%"></span>
        </div>
        <div class="stardance-utils-shop-goals-summary-stats">
          <span class="stardance-utils-shop-goals-summary-stat"><strong>${summary.neededFormatted}</strong> needed</span>
          <span class="stardance-utils-shop-goals-summary-stat"><strong>${SU.escapeHtml(summary.totalHoursText || 'N/A')}</strong></span>
        </div>
      </div>
    `;
  };

  SU.renderShopGoalsInline = () => {
    const hub = SU.getShopHub();
    const mainColumn = hub?.querySelector('.stardance-utils-shop-main-column');
    const newSection = mainColumn?.querySelector('.shop-hub__items--new');
    const useInline = SU.isShopHubPage() && SU.savedShopLayoutUseRail === false;

    let section = mainColumn?.querySelector('.stardance-utils-shop-goals-inline');
    if (!useInline || !mainColumn || !newSection) {
      section?.remove();
      return;
    }

    if (!section) {
      section = document.createElement('section');
      section.className = 'stardance-utils-shop-goals-inline';
      mainColumn.insertBefore(section, newSection);
    }

    if (section.nextElementSibling !== newSection) {
      mainColumn.insertBefore(section, newSection);
    }

    const goals = SU.getSortedShopGoals();
    if (!goals.length) {
      SU.setShopMarkup(section, `
        <div class="stardance-utils-shop-goals-inline-shell">
          <div class="stardance-utils-shop-goals-inline-head">
            <h2 class="stardance-utils-shop-goals-inline-title">My Goal Items</h2>
          </div>
          <p class="discover-rail__placeholder-text">Star items to save them here.</p>
        </div>
      `);
      return;
    }

    const summary = SU.calculateShopGoalsSummary(goals);
    SU.setShopMarkup(section, `
      <div class="stardance-utils-shop-goals-inline-shell">
        <div class="stardance-utils-shop-goals-inline-head">
          <h2 class="stardance-utils-shop-goals-inline-title">My Goal Items</h2>
          <div class="stardance-utils-shop-goals-inline-toggle-wrap">
            <div class="stardance-utils-shop-goals-toggle-group" role="tablist" aria-label="Goals aggregation mode">
              <button type="button" class="stardance-utils-shop-goals-toggle${SU.shopGoalsScopeMode === 'cumulative' ? ' is-active' : ''}" data-stardance-utils-goals-scope="cumulative" aria-pressed="${SU.shopGoalsScopeMode === 'cumulative'}">Cumulative</button>
              <button type="button" class="stardance-utils-shop-goals-toggle${SU.shopGoalsScopeMode === 'individual' ? ' is-active' : ''}" data-stardance-utils-goals-scope="individual" aria-pressed="${SU.shopGoalsScopeMode === 'individual'}">Individual</button>
            </div>
          </div>
        </div>
        <div class="stardance-utils-shop-goals-inline-progress-row">
          <div class="stardance-utils-shop-goals-progress" aria-hidden="true">
            <span class="stardance-utils-shop-goals-progress-fill" style="width:${summary.progress}%"></span>
          </div>
          <div class="stardance-utils-shop-goals-inline-progress-meta">
            <span class="stardance-utils-shop-goals-stat">${summary.currentFormatted} current</span>
            <span class="stardance-utils-shop-goals-stat">${summary.neededFormatted} needed for ${summary.goalCount} goal${summary.goalCount === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div class="stardance-utils-shop-goals-inline-stats">
          <div class="stardance-utils-shop-goals-inline-stat-cell">
            <span class="stardance-utils-shop-goals-inline-stat-label">Selected</span>
            <strong class="stardance-utils-shop-goals-inline-stat-value">${summary.goalCount} goal${summary.goalCount === 1 ? '' : 's'}</strong>
          </div>
          <div class="stardance-utils-shop-goals-inline-stat-cell">
            <span class="stardance-utils-shop-goals-inline-stat-label">Needed</span>
            <strong class="stardance-utils-shop-goals-inline-stat-value">${summary.neededFormatted}</strong>
          </div>
          <div class="stardance-utils-shop-goals-inline-stat-cell">
            <span class="stardance-utils-shop-goals-inline-stat-label">Time Est.</span>
            <strong class="stardance-utils-shop-goals-inline-stat-value">${SU.escapeHtml(summary.totalHoursText || 'N/A')}</strong>
          </div>
        </div>
        ${SU.renderShopGoalsCardsHtml(summary, { inline: true })}
      </div>
    `);
  };

  SU.getShopOrdersSection = (widgets = document.querySelector('.discover-rail [data-discover-rail-search-target="widgets"]')) => {
    if (!widgets) {
      return null;
    }

    return [...widgets.querySelectorAll('.discover-rail__section')].find((sectionNode) => {
      const heading = SU.compactText(sectionNode.querySelector('.discover-rail__heading')?.textContent).toUpperCase();
      return heading === 'YOUR ORDERS';
    }) || null;
  };

  SU.renderShopOrdersButton = () => {
    const hub = SU.getShopHub();
    const mainColumn = hub?.querySelector('.stardance-utils-shop-main-column');
    const newSection = mainColumn?.querySelector('.shop-hub__items--new');
    const header = newSection?.querySelector('.shop-hub__items-header');
    const enabled = SU.isShopHubPage() && (SU.savedShopOrdersButtonEnabled !== false || SU.savedShopLayoutUseRail === false);

    let link = header?.querySelector('.stardance-utils-shop-orders-link');
    if (!enabled || !mainColumn || !newSection || !header) {
      link?.remove();
      return;
    }

    if (!link) {
      link = document.createElement('a');
      link.className = 'shop-hub__see-all stardance-utils-shop-orders-link';
      header.appendChild(link);
    }

    const href = SU.shopOrdersHref || '/shop/orders';
    SU.withShopMutationGuard(() => {
      link.setAttribute('href', href);
      link.textContent = 'View My Orders';
    });
  };

  SU.renderShopGoalsRail = () => {
    const widgets = document.querySelector('.discover-rail [data-discover-rail-search-target="widgets"]');
    if (!widgets) {
      SU.renderShopGoalsInline();
      SU.renderShopOrdersButton();
      return;
    }

    const ordersSection = SU.getShopOrdersSection(widgets);
    if (ordersSection) {
      SU.shopOrdersHref = SU.compactText(ordersSection.querySelector('.discover-rail__link')?.getAttribute('href')) || '/shop/orders';
    }

    if (SU.isShopHubPage() && SU.savedShopLayoutUseRail === false) {
      SU.renderShopGoalsInline();
      SU.renderShopOrdersButton();
      return;
    }

    SU.renderShopGoalsInline();

    widgets.querySelectorAll('.discover-rail__section').forEach((sectionNode) => {
      const heading = SU.compactText(sectionNode.querySelector('.discover-rail__heading')?.textContent).toUpperCase();
      const shouldRemoveOrders = SU.savedShopOrdersButtonEnabled !== false && SU.isShopHubPage() && heading === 'YOUR ORDERS';
      if (heading === 'SHOP UPDATES' || shouldRemoveOrders) {
        SU.withShopMutationGuard(() => {
          sectionNode.remove();
        });
      }
    });

    let section = widgets.querySelector('.discover-rail__section--wishlist');
    if (!section) {
      section = document.createElement('section');
      section.className = 'discover-rail__section discover-rail__section--wishlist';
      widgets.appendChild(section);
    }

    const goals = SU.getSortedShopGoals();
    section.setAttribute('aria-label', 'Goals');
    section.classList.add('stardance-utils-shop-goals-section');
    section.classList.toggle('stardance-utils-shop-goals-section--expanded', SU.savedShopOrdersButtonEnabled !== false && SU.isShopHubPage());

    if (!goals.length) {
      SU.setShopMarkup(section, `
        <h3 class="discover-rail__heading">GOALS</h3>
        <p class="discover-rail__placeholder-text">Star items to save them here.</p>
      `);
      SU.renderShopOrdersButton();
      return;
    }

    const summary = SU.calculateShopGoalsSummary(goals);

    SU.setShopMarkup(section, `
      <div class="stardance-utils-shop-goals-head">
        <h3 class="discover-rail__heading">GOALS</h3>
      </div>
      ${SU.renderShopGoalsSummaryHtml(summary)}
      ${SU.renderShopGoalsCardsHtml(summary, { expanded: SU.savedShopOrdersButtonEnabled !== false && SU.isShopHubPage() })}
    `);

    SU.renderShopOrdersButton();
  };

  SU.getShopCategoryPathForNode = (shopCategory) => {
    const explicitPath = SU.compactText(shopCategory?.getAttribute('data-stardance-utils-shop-path'));
    if (explicitPath) {
      return explicitPath;
    }

    const matchingOption = SU.SHOP_CATEGORY_OPTIONS.find((option) => option.path === window.location.pathname);
    return matchingOption?.path || '/shop/category/all';
  };

  SU.fetchShopCategoryMarkup = async (path) => {
    SU.shopCategoryMarkupCache = SU.shopCategoryMarkupCache || new Map();
    if (SU.shopCategoryMarkupCache.has(path)) {
      return SU.shopCategoryMarkupCache.get(path);
    }

    const request = fetch(path, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${path} (${response.status})`);
        }
        return response.text();
      })
      .then((html) => new DOMParser().parseFromString(html, 'text/html').querySelector('.shop-category'));

    SU.shopCategoryMarkupCache.set(path, request);
    return request;
  };

  SU.applyShopCategoryFilters = (shopCategory) => {
    if (!shopCategory) {
      return;
    }

    const cards = [...shopCategory.querySelectorAll('.shop-category__items > .shop-item-card')];
    const emptyState = shopCategory.querySelector('.shop__empty[data-shop-target="empty"]');
    const search = SU.compactText(shopCategory.querySelector('.shop-category__search-input')?.value).toLowerCase();

    const getSelectValue = (labelText) => {
      const labels = [...shopCategory.querySelectorAll('.dropdown__label')];
      const label = labels.find((node) => SU.compactText(node.textContent) === labelText);
      return label?.parentElement?.querySelector('select')?.value || '';
    };

    const priceRange = getSelectValue('Price Range');
    const access = getSelectValue('Access');
    const sortBy = getSelectValue('Sort by');
    const region = getSelectValue('Region');

    const matchesPriceRange = (price) => {
      if (!Number.isFinite(price) || priceRange === 'none' || !priceRange) {
        return true;
      }

      if (priceRange === '0-100') {
        return price >= 0 && price <= 100;
      }
      if (priceRange === '100-500') {
        return price >= 100 && price <= 500;
      }
      if (priceRange === '500-1000') {
        return price >= 500 && price <= 1000;
      }
      if (priceRange === '1000+') {
        return price > 1000;
      }
      return true;
    };

    const matchesRegion = (card) => {
      if (!region) {
        return true;
      }

      const regions = SU.compactText(card.getAttribute('data-regions'))
        .split(',')
        .map((value) => SU.compactText(value))
        .filter(Boolean);

      if (!regions.length) {
        return true;
      }

      return regions.includes(region) || regions.includes('XX');
    };

    const entries = cards.map((card, index) => {
      const name = SU.compactText(card.querySelector('.shop-item-card__title')?.textContent);
      const description = SU.compactText(card.querySelector('.shop-item-card__description')?.textContent);
      const haystack = `${name} ${description}`.toLowerCase();
      const price = Number.parseFloat(card.getAttribute('data-price') || '');
      const locked = card.getAttribute('data-achievement-locked') === 'true';

      return {
        card,
        index,
        name,
        price,
        visible: (!search || haystack.includes(search))
          && matchesPriceRange(price)
          && (access === 'All' || !access ? true : (access === 'Available' ? !locked : locked))
          && matchesRegion(card)
      };
    });

    const sorted = [...entries].sort((left, right) => {
      if (sortBy === 'Alphabetical') {
        return left.name.localeCompare(right.name) || (left.index - right.index);
      }

      const leftPrice = Number.isFinite(left.price) ? left.price : Number.POSITIVE_INFINITY;
      const rightPrice = Number.isFinite(right.price) ? right.price : Number.POSITIVE_INFINITY;
      return leftPrice - rightPrice || (left.index - right.index);
    });

    const container = cards[0]?.parentElement || null;
    SU.withShopMutationGuard(() => {
      sorted.forEach(({ card, visible }) => {
        card.style.display = visible ? 'flex' : 'none';
        if (container && emptyState) {
          container.insertBefore(card, emptyState);
        }
      });
    });

    if (emptyState) {
      emptyState.style.display = sorted.some((entry) => entry.visible) ? 'none' : 'flex';
    }
  };

  SU.ensureShopTypeFilter = (shopCategory) => {
    if (!shopCategory || shopCategory.getAttribute('data-stardance-utils-type-filter-ready') === 'true') {
      return;
    }

    const filters = shopCategory.querySelector('.shop-category__filters');
    if (!filters) {
      return;
    }

    shopCategory.setAttribute('data-stardance-utils-type-filter-ready', 'true');

    [...filters.querySelectorAll('.dropdown')].forEach((dropdown) => {
      const labelText = SU.compactText(dropdown.querySelector('.dropdown__label')?.textContent);
      if (labelText === 'Price Range' || labelText === 'Access') {
        dropdown.remove();
      }
    });

    const wrap = document.createElement('div');
    wrap.className = 'dropdown dropdown--space stardance-utils-shop-type-filter';

    const label = document.createElement('label');
    label.className = 'dropdown__label';
    label.textContent = 'Type';

    const select = document.createElement('select');
    select.className = 'dropdown__select';
    select.setAttribute('data-stardance-utils-shop-type-filter', 'true');
    const currentPath = SU.getShopCategoryPathForNode(shopCategory);
    select.innerHTML = SU.SHOP_CATEGORY_OPTIONS.map((option) => (
      `<option value="${SU.escapeHtml(option.path)}"${option.path === currentPath ? ' selected' : ''}>${SU.escapeHtml(option.label)}</option>`
    )).join('');

    select.addEventListener('change', () => {
      const nextPath = select.value || '/shop/category/all';
      const embeddedMount = shopCategory.closest('[data-stardance-utils-shop-all-mount]');
      if (embeddedMount) {
        void SU.mountShopCategoryIntoHub(nextPath);
        return;
      }

      window.location.href = nextPath;
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    filters.appendChild(wrap);

    const reapply = () => requestAnimationFrame(() => SU.applyShopCategoryFilters(shopCategory));
    shopCategory.addEventListener('change', reapply);
    shopCategory.addEventListener('input', reapply);
  };

  SU.mountShopCategoryIntoHub = async (path = '/shop/category/all') => {
    const hub = SU.getShopHub();
    const layout = hub?.querySelector('.shop-hub__layout');
    const rail = layout?.querySelector('.shop-hub__rail');
    const newSection = hub?.querySelector('.shop-hub__items--new');
    if (!hub || !layout || !rail || !newSection) {
      return;
    }

    SU.withShopMutationGuard(() => {
      hub.classList.add('stardance-utils-shop-hub--flattened');
      hub.classList.toggle('stardance-utils-shop-hub--no-rail', SU.savedShopLayoutUseRail === false);
      hub.querySelector('.shop-hub__topbar')?.remove();
      hub.querySelector('.shop-hub__main')?.remove();
      hub.querySelector('.shop-hub__items--popular')?.remove();
    });

    let mainColumn = layout.querySelector('.stardance-utils-shop-main-column');
    if (!mainColumn) {
      SU.withShopMutationGuard(() => {
        mainColumn = document.createElement('div');
        mainColumn.className = 'stardance-utils-shop-main-column';
        layout.insertBefore(mainColumn, rail);
      });
    }

    if (newSection.parentElement !== mainColumn) {
      SU.withShopMutationGuard(() => {
        mainColumn.appendChild(newSection);
      });
    }

    let mount = mainColumn.querySelector('[data-stardance-utils-shop-all-mount]');
    if (!mount) {
      SU.withShopMutationGuard(() => {
        mount = document.createElement('section');
        mount.className = 'stardance-utils-shop-all-mount';
        mount.setAttribute('data-stardance-utils-shop-all-mount', 'true');
        mainColumn.appendChild(mount);
      });
    }

    if (mount.getAttribute('data-stardance-utils-shop-all-loaded') === 'true' && mount.getAttribute('data-stardance-utils-shop-all-path') === path) {
      const existingCategory = mount.querySelector('.shop-category');
      if (existingCategory) {
        SU.ensureShopTypeFilter(existingCategory);
        SU.applyShopCategoryFilters(existingCategory);
      }
      return;
    }

    mount.setAttribute('data-stardance-utils-shop-all-loaded', 'loading');
    mount.setAttribute('data-stardance-utils-shop-all-path', path);

    const sourceCategory = await SU.fetchShopCategoryMarkup(path);
    if (!sourceCategory) {
      mount.removeAttribute('data-stardance-utils-shop-all-loaded');
      return;
    }

    const imported = document.importNode(sourceCategory, true);
    imported.classList.add('stardance-utils-embedded-shop-category');
    imported.setAttribute('data-stardance-utils-shop-path', path);
    imported.querySelector('.shop-category__title-row')?.remove();
    imported.querySelector('.shop-category__back')?.remove();

    SU.withShopMutationGuard(() => {
      mount.replaceChildren(imported);
      mount.setAttribute('data-stardance-utils-shop-all-loaded', 'true');
    });

    SU.ensureShopTypeFilter(imported);
    SU.applyShopCategoryFilters(imported);
    SU.renderShopGoalsInline();
    SU.renderShopOrdersButton();
  };

  SU.ensureShopEventBindings = () => {
    if (SU.shopEventsBound) {
      return;
    }

    SU.shopEventsBound = true;
    SU.shopGoalSyncTimers = new Map();
    SU.shopWishlistAttributeSyncTimers = new Map();
    SU.shopGoalsDragId = null;

    document.addEventListener('click', (event) => {
      const star = event.target.closest('.shop-item-card__star');
      if (!star) {
        return;
      }

      const card = star.closest('.shop-item-card');
      if (!card) {
        return;
      }

      const shopId = SU.getShopItemId(card);
      if (!shopId) {
        return;
      }

      star.setAttribute('data-stardance-utils-prev-wishlisted', String(SU.isAnyShopCardWishlisted(shopId)));
    }, true);

    document.addEventListener('click', (event) => {
      const star = event.target.closest('.shop-item-card__star');
      if (!star) {
        return;
      }

      const card = star.closest('.shop-item-card');
      if (!card) {
        return;
      }

      const previousState = star.getAttribute('data-stardance-utils-prev-wishlisted') === 'true';
      star.removeAttribute('data-stardance-utils-prev-wishlisted');

      const shopId = SU.getShopItemId(card);
      if (!shopId) {
        return;
      }

      const existingTimer = SU.shopGoalSyncTimers.get(shopId);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
      }

      const timerId = window.setTimeout(() => {
        SU.syncShopGoalAfterWishlistToggle(shopId, previousState);
      }, 40);
      SU.shopGoalSyncTimers.set(shopId, timerId);
    });

    const wishlistObserver = new MutationObserver((mutations) => {
      const dirtyIds = new Set();
      mutations.forEach((mutation) => {
        const card = mutation.target instanceof Element
          ? mutation.target.closest('.shop-item-card')
          : null;
        const shopId = SU.getShopItemId(card);
        if (shopId) {
          dirtyIds.add(shopId);
        }
      });

      dirtyIds.forEach((shopId) => {
        SU.scheduleShopGoalSyncForItem(shopId, 60);
      });
    });

    if (document.body) {
      wishlistObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-shop-wishlist-wishlisted-value']
      });
    }

    document.addEventListener('change', (event) => {
      if (!event.target.matches('[data-stardance-utils-shop-type-filter]')) {
        return;
      }

      SU.applyShopCategoryFilters(event.target.closest('.shop-category'));
    });

    document.addEventListener('click', (event) => {
      const goalAction = event.target.closest('[data-stardance-utils-goal-action]');
      if (goalAction) {
        event.preventDefault();
        event.stopPropagation();

        const shopId = SU.compactText(goalAction.getAttribute('data-shop-id'));
        const action = SU.compactText(goalAction.getAttribute('data-stardance-utils-goal-action'));
        if (action === 'remove') {
          SU.removeShopGoal(shopId);
          SU.setSourceShopCardWishlisted(shopId, false);
          SU.renderShopGoalsRail();
          return;
        } else if (action === 'increment') {
          SU.setShopGoalQuantity(shopId, 1);
        } else if (action === 'decrement') {
          SU.setShopGoalQuantity(shopId, -1);
        }

        SU.renderShopGoalsRail();
        return;
      }

      const scopeToggle = event.target.closest('[data-stardance-utils-goals-scope]');
      if (scopeToggle) {
        SU.shopGoalsScopeMode = scopeToggle.getAttribute('data-stardance-utils-goals-scope') === 'cumulative' ? 'cumulative' : 'individual';
        SU.renderShopGoalsRail();
      }
    });

    document.addEventListener('mouseover', (event) => {
      if (event.target.closest('[data-stardance-utils-goal-action], .stardance-utils-shop-goals-remove')) {
        return;
      }

      const goalCard = event.target.closest('[data-stardance-utils-goal-item]');
      if (!goalCard) {
        return;
      }

      if (event.relatedTarget?.closest?.('[data-stardance-utils-goal-item]') === goalCard) {
        return;
      }

      const nextActiveId = SU.compactText(goalCard.getAttribute('data-shop-id'));
      if (!nextActiveId || nextActiveId === SU.shopGoalsActiveId) {
        return;
      }

      SU.shopGoalsActiveId = nextActiveId;
      if (SU.shopGoalsScopeMode === 'individual') {
        SU.renderShopGoalsRail();
      }
    });

    document.addEventListener('focusin', (event) => {
      if (event.target.closest('[data-stardance-utils-goal-action], .stardance-utils-shop-goals-remove')) {
        return;
      }

      const goalCard = event.target.closest('[data-stardance-utils-goal-item]');
      if (!goalCard) {
        return;
      }

      const nextActiveId = SU.compactText(goalCard.getAttribute('data-shop-id'));
      if (!nextActiveId || nextActiveId === SU.shopGoalsActiveId) {
        return;
      }

      SU.shopGoalsActiveId = nextActiveId;
      if (SU.shopGoalsScopeMode === 'individual') {
        SU.renderShopGoalsRail();
      }
    });

    document.addEventListener('dragstart', (event) => {
      const goalCard = event.target.closest('[data-stardance-utils-goal-item]');
      if (!goalCard) {
        return;
      }

      SU.shopGoalsDragId = SU.compactText(goalCard.getAttribute('data-shop-id'));
      goalCard.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', SU.shopGoalsDragId);
    });

    document.addEventListener('dragover', (event) => {
      const goalCard = event.target.closest('[data-stardance-utils-goal-item]');
      if (!goalCard || !SU.shopGoalsDragId) {
        return;
      }

      event.preventDefault();
      document.querySelectorAll('[data-stardance-utils-goal-item].is-drop-target').forEach((node) => {
        if (node !== goalCard) {
          node.classList.remove('is-drop-target');
        }
      });
      goalCard.classList.add('is-drop-target');
      event.dataTransfer.dropEffect = 'move';
    });

    document.addEventListener('dragleave', (event) => {
      const goalCard = event.target.closest('[data-stardance-utils-goal-item]');
      if (!goalCard) {
        return;
      }

      if (event.relatedTarget?.closest?.('[data-stardance-utils-goal-item]') === goalCard) {
        return;
      }

      goalCard.classList.remove('is-drop-target');
    });

    document.addEventListener('drop', (event) => {
      const goalCard = event.target.closest('[data-stardance-utils-goal-item]');
      const sourceId = SU.shopGoalsDragId;
      if (!goalCard || !sourceId) {
        return;
      }

      event.preventDefault();
      const targetId = SU.compactText(goalCard.getAttribute('data-shop-id'));
      document.querySelectorAll('[data-stardance-utils-goal-item].is-drop-target').forEach((node) => {
        node.classList.remove('is-drop-target');
      });

      if (SU.moveShopGoal(sourceId, targetId)) {
        SU.shopGoalsActiveId = sourceId;
        SU.renderShopGoalsRail();
      }
    });

    document.addEventListener('dragend', () => {
      SU.shopGoalsDragId = null;
      document.querySelectorAll('[data-stardance-utils-goal-item].is-dragging, [data-stardance-utils-goal-item].is-drop-target').forEach((node) => {
        node.classList.remove('is-dragging', 'is-drop-target');
      });
    });
  };

  SU.hydrateShopGoalsFromPage = async () => {
    const suppressedUntil = (await SU.getShopGoalsSuppressedUntil?.()) ?? {};
    const now = Date.now();
    let changed = false;

    document.querySelectorAll('.shop-item-card.shop-item-card--wishlisted, .shop-item-card[data-shop-wishlist-wishlisted-value="true"]').forEach((card) => {
      const record = SU.collectShopItemData(card);
      if (!record) {
        return;
      }

      if (suppressedUntil[record.id] > now) {
        return;
      }

      changed = SU.upsertShopGoalFromSourceRecord(record) || changed;
    });

    if (changed) {
      void SU.persistShopGoals();
    }
  };

  SU.enhanceShopCategoryPages = () => {
    document.querySelectorAll('.shop-category').forEach((shopCategory) => {
      SU.ensureShopTypeFilter(shopCategory);
      SU.applyShopCategoryFilters(shopCategory);
    });
  };

  SU.enhanceShopPage = async () => {
    if (!window.location.pathname.startsWith('/shop')) {
      return;
    }

    SU.cleanupLegacyAiCheckStorage();
    await SU.loadShopGoals();

    if (SU.savedShopLayoutEnabled === false) {
      return;
    }

    SU.refreshShopGoalRecordsFromPage();
    SU.ensureShopEventBindings();
    SU.hydrateShopGoalsFromPage();
    SU.renderShopGoalsRail();

    if (SU.isShopHubPage()) {
      await SU.mountShopCategoryIntoHub('/shop/category/all');
    }

    SU.enhanceShopCategoryPages();
    SU.refreshShopGoalRecordsFromPage();
    SU.renderShopGoalsRail();
  };
})();
