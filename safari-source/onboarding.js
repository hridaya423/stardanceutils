(() => {
  const SU = globalThis.StardanceUtils;

  const ONBOARDING_COPY = 'Welcome to Stardance Utils! Let\'s show you around what the missing constellation of features held.';

  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  SU.getProjectsListUrl = () => {
    const projectsLink = document.querySelector('#primary-nav [data-slug="projects"]');
    if (projectsLink) {
      return SU.compactText(projectsLink.getAttribute('href'));
    }

    const profileLink = document.querySelector('.sidebar__user-meta-handle[href^="/@"]');
    const profileHref = SU.compactText(profileLink?.getAttribute('href'));
    return profileHref ? `${profileHref}/projects` : '';
  };

  SU.isProjectsListPage = () => /^\/@[^/]+\/projects\/?$/.test(window.location.pathname);
  SU.isProjectShowPage = () => /^\/projects\/\d+/.test(window.location.pathname);
  SU.isShopPage = () => window.location.pathname.startsWith('/shop');

  SU.parseProjectHours = (card) => {
    const raw = SU.compactText(card?.querySelector('.profile-project-card__meta-item--time span')?.textContent);
    const value = Number.parseFloat(raw.replace(/[^\d.]/g, ''));
    return Number.isFinite(value) ? value : 0;
  };

  SU.getOnboardingProjectCards = () => {
    return [...document.querySelectorAll('.profile-tab-content .project-list__item a.profile-project-card[href^="/projects/"]')]
      .filter((link) => !link.classList.contains('profile-project-card--new'));
  };

  SU.getPreferredOnboardingProjectCard = () => {
    const cards = SU.getOnboardingProjectCards();
    return cards.find((card) => SU.parseProjectHours(card) > 0) || cards[0] || null;
  };

  SU.getFirstProjectCard = () => {
    return SU.getPreferredOnboardingProjectCard();
  };

  SU.hasVisibleProjectsList = () => Boolean(SU.getFirstProjectCard());

  SU.getFirstProjectPinButton = () => {
    return [...document.querySelectorAll('.profile-tab-content [data-stardance-utils-project-pin]')]
      .find((button) => button.getAttribute('aria-pressed') !== 'true') || null;
  };

  SU.getAnyProjectPinButton = () => document.querySelector('.profile-tab-content [data-stardance-utils-project-pin]');

  SU.getProjectPinSpotlightTarget = () => SU.getFirstProjectPinButton() || SU.getAnyProjectPinButton() || SU.getFirstProjectCard();

  SU.hasUnpinnedProjects = () => Boolean(SU.getFirstProjectPinButton());
  SU.hasPinnedProjects = () => Boolean(document.querySelector('.profile-tab-content [data-stardance-utils-project-pin][aria-pressed="true"]'));

  SU.unpinOnboardingDemoProject = () => {
    const context = SU.getOnboardingState().context || {};
    const demoProjectId = context.demoPinnedProjectId;
    if (!demoProjectId || context.demoPinnedProjectCreated !== true) {
      return;
    }

    const nextPinnedIds = SU.normalizePinnedProjectIds?.(SU.savedPinnedProjectIds)
      .filter((projectId) => projectId !== demoProjectId) || [];
    SU.savedPinnedProjectIds = nextPinnedIds;
    void SU.setStoredSetting({ [SU.PROJECT_PINNED_IDS_KEY]: nextPinnedIds });
    SU.applyProfileProjectPins?.();

    SU.setOnboardingState({
      context: {
        demoPinnedProjectId: null,
        demoPinnedProjectCreated: false
      }
    });
  };

  SU.getOnboardingRoot = () => document.getElementById(SU.ONBOARDING_ROOT_ID);

  SU.getTutorialFirstProjectShowUrl = () => {
    const link = SU.getFirstProjectCard();
    return SU.compactText(link?.getAttribute('href'));
  };

  SU.getOnboardingProjectShowUrl = () => SU.compactText(
    SU.getOnboardingState().context?.projectShowUrl || SU.getTutorialFirstProjectShowUrl()
  );

  SU.getProjectsEmptyState = () => document.querySelector('.profile-tab-content__empty');

  SU.waitForProjectsOnboardingSurface = async (timeoutMs = 10000) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (SU.getProjectPinSpotlightTarget() || SU.hasVisibleProjectsList() || SU.getProjectsEmptyState()) {
        return true;
      }
      await sleep(120);
    }
    return false;
  };

  SU.removeOnboardingRoot = () => {
    SU.getOnboardingRoot()?.remove();
    document.documentElement.classList.remove(SU.ONBOARDING_ACTIVE_CLASS);
  };

  SU.closeOnboardingSettingsDialog = () => {
    const dialog = document.getElementById('settings-modal');
    if (dialog?.open) {
      dialog.close();
    }
    dialog?.style?.removeProperty('z-index');
  };

  SU.isDialogModal = (dialog) => {
    if (!dialog?.open || typeof dialog.matches !== 'function') {
      return false;
    }

    try {
      return dialog.matches(':modal');
    } catch {
      return false;
    }
  };

  SU.cleanupOnboardingStepUi = (stepId) => {
    if (stepId === 'font-preview') {
      SU.closeTryPanel?.(false);
    }

    if (stepId === 'sidebar-reorder') {
      SU.disableSidebarReorderMode?.();
    }

    if (stepId === 'theme-customization' || stepId === 'shop-settings') {
      SU.closeOnboardingSettingsDialog();
    }
  };

  SU.cleanupOnboardingBeforeTransition = () => {
    const currentStepId = SU.getCurrentOnboardingStep()?.id;
    if (currentStepId) {
      SU.cleanupOnboardingStepUi(currentStepId);
    }
  };

  SU.ensureOnboardingListeners = () => {
    if (SU.onboardingListenersBound) {
      return;
    }

    SU.onboardingListenersBound = true;

    SU.onboardingChangeListener = (event) => {
      if (event.target.closest('#stardance-utils-try-panel')) {
        SU.setOnboardingState({ context: { previewInteracted: true } });
        if (SU.getCurrentOnboardingStep()?.id === 'font-preview') {
          void SU.renderOnboardingStep();
        }
      }
    };

    SU.onboardingClickListener = (event) => {
      if (event.target.closest('#stardance-utils-try-panel .stardance-utils-try-cycle, #stardance-utils-try-panel [data-stardance-utils-try-select]')) {
        SU.setOnboardingState({ context: { previewInteracted: true } });
        if (SU.getCurrentOnboardingStep()?.id === 'font-preview') {
          void SU.renderOnboardingStep();
        }
      }

      if (event.target.closest('#stardance-utils-try-panel .stardance-utils-action-button--primary')) {
        SU.setOnboardingState({ context: { previewInteracted: true } });
        if (SU.getCurrentOnboardingStep()?.id === 'font-preview') {
          window.setTimeout(() => {
            void SU.gotoNextOnboardingStep();
          }, 120);
        }
      }

      if (event.target.closest('#settings-modal [data-stardance-utils-onboarding-theme-save]') && SU.getCurrentOnboardingStep()?.id === 'theme-customization') {
        window.setTimeout(() => {
          void SU.gotoNextOnboardingStep();
        }, 120);
      }
    };

    SU.onboardingSidebarReorderDoneListener = () => {
      SU.setOnboardingState({ context: { sidebarReordered: true, sidebarReorderStarted: true } });
      if (SU.getCurrentOnboardingStep()?.id === 'sidebar-reorder') {
        window.setTimeout(() => {
          void SU.gotoNextOnboardingStep();
        }, 40);
      }
    };

    document.addEventListener('change', SU.onboardingChangeListener);
    document.addEventListener('click', SU.onboardingClickListener, true);
    document.addEventListener('stardance-utils:sidebar-reorder-done', SU.onboardingSidebarReorderDoneListener);
  };

  SU.ensureOnboardingRoot = () => {
    let root = SU.getOnboardingRoot();
    if (root) {
      return root;
    }

    root = document.createElement('div');
    root.id = SU.ONBOARDING_ROOT_ID;
    root.className = 'stardance-utils-onboarding';
    root.innerHTML = `
      <div class="stardance-utils-onboarding-backdrop"></div>
      <div class="stardance-utils-onboarding-highlight" hidden></div>
      <div class="stardance-utils-onboarding-helper" hidden></div>
      <section class="stardance-utils-onboarding-card" role="dialog" aria-modal="true" aria-live="polite">
        <div class="stardance-utils-onboarding-header">
          <div class="stardance-utils-onboarding-progress"></div>
          <button type="button" class="stardance-utils-onboarding-skip" data-stardance-utils-onboarding="skip">Skip</button>
        </div>
        <div class="stardance-utils-onboarding-eyebrow"></div>
        <h2 class="stardance-utils-onboarding-title"></h2>
        <p class="stardance-utils-onboarding-body"></p>
        <div class="stardance-utils-onboarding-feature-grid"></div>
        <ul class="stardance-utils-onboarding-recap"></ul>
        <div class="stardance-utils-onboarding-actions">
          <button type="button" class="stardance-utils-onboarding-btn stardance-utils-onboarding-btn--ghost" data-stardance-utils-onboarding="back">Back</button>
          <button type="button" class="stardance-utils-onboarding-btn stardance-utils-onboarding-btn--primary" data-stardance-utils-onboarding="next">Next</button>
        </div>
      </section>
    `;

    root.addEventListener('click', async (event) => {
      const control = event.target.closest('[data-stardance-utils-onboarding]');
      if (!control) {
        return;
      }

      const action = control.getAttribute('data-stardance-utils-onboarding');
      if (action === 'back') {
        await SU.gotoPreviousOnboardingStep();
      } else if (action === 'skip') {
        SU.skipOnboarding();
      } else if (action === 'next') {
        await SU.gotoNextOnboardingStep();
      }
    });

    document.body.appendChild(root);
    document.documentElement.classList.add(SU.ONBOARDING_ACTIVE_CLASS);
    return root;
  };

  SU.getOnboardingStepIndex = (stepId) => SU.ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
  SU.getCurrentOnboardingStep = () => SU.ONBOARDING_STEPS[SU.getOnboardingStepIndex(SU.getOnboardingState().stepId)] || null;
  SU.ONBOARDING_PROGRESS_STEP_IDS = [
    'sidebar-fonts',
    'font-preview',
    'sidebar-reorder',
    'projects-pin',
    'project-composer',
    'project-markdown',
    'project-draft',
    'project-draft-verify',
    'project-voice',
    'project-ai',
    'shop',
    'shop-goals',
    'theme-customization',
    'shop-settings'
  ];
  SU.getOnboardingProgressSteps = () => SU.ONBOARDING_PROGRESS_STEP_IDS
    .map((stepId) => SU.ONBOARDING_STEPS.find((step) => step.id === stepId))
    .filter(Boolean);
  SU.getOnboardingProgressIndex = (stepId) => SU.ONBOARDING_PROGRESS_STEP_IDS.indexOf(stepId);

  SU.pageMatchesOnboardingStep = (step) => {
    if (!step?.page || step.page === 'any') {
      return true;
    }

    if (step.page === 'projects-list') {
      return SU.isProjectsListPage();
    }
    if (step.page === 'project-show') {
      return SU.isProjectShowPage();
    }
    if (step.page === 'shop') {
      return SU.isShopPage();
    }
    return false;
  };

  SU.navigateForOnboarding = (url, stepId, context = {}) => {
    SU.cleanupOnboardingBeforeTransition();
    SU.setOnboardingState({
      started: true,
      stepId,
      context
    });
    window.location.href = url;
  };

  SU.waitForOnboardingTarget = async (step, timeoutMs = 8000) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const targets = SU.resolveOnboardingTargets(step);
      if (targets.length > 0) {
        return targets;
      }
      await sleep(120);
    }
    return [];
  };

  SU.normalizeOnboardingTargets = (value) => {
    if (!value) {
      return [];
    }

    return (Array.isArray(value) ? value : [value]).filter((node) => node instanceof Element);
  };

  SU.resolveOnboardingTargets = (step) => {
    if (!step) {
      return [];
    }

    const rawTargets = typeof step.resolveTarget === 'function'
      ? step.resolveTarget()
      : document.querySelector(step.selector);
    return SU.normalizeOnboardingTargets(rawTargets);
  };

  SU.clearOnboardingTargetState = () => {
    document.querySelectorAll('.stardance-utils-onboarding-target--active').forEach((node) => {
      node.classList.remove('stardance-utils-onboarding-target--active');
    });
    const dialog = document.getElementById('settings-modal');
    if (dialog) {
      delete dialog.dataset.stardanceUtilsOnboardingSection;
    }
  };

  SU.getOnboardingHighlightRect = (targets) => {
    const rects = SU.normalizeOnboardingTargets(targets)
      .map((target) => target.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0);

    if (!rects.length) {
      return null;
    }

    const union = rects.reduce((next, rect) => ({
      top: Math.min(next.top, rect.top),
      left: Math.min(next.left, rect.left),
      right: Math.max(next.right, rect.right),
      bottom: Math.max(next.bottom, rect.bottom)
    }), {
      top: rects[0].top,
      left: rects[0].left,
      right: rects[0].right,
      bottom: rects[0].bottom
    });

    return {
      ...union,
      width: union.right - union.left,
      height: union.bottom - union.top
    };
  };

  SU.scrollOnboardingTargetIntoView = (target) => {
    if (!target?.scrollIntoView) {
      return;
    }

    target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  };

  SU.positionOnboarding = () => {
    const root = SU.getOnboardingRoot();
    const step = SU.getCurrentOnboardingStep();
    if (!root || !step) {
      return;
    }

    const highlight = root.querySelector('.stardance-utils-onboarding-highlight');
    const card = root.querySelector('.stardance-utils-onboarding-card');
    const helper = root.querySelector('.stardance-utils-onboarding-helper');
    const rect = SU.getOnboardingHighlightRect(SU.resolveOnboardingTargets(step));
    const inlineHighlightOnly = step.highlightMode === 'inline';
    const modalFocus = step.useModalFocus === true;

    if (step.layout === 'centered' || !rect || !highlight || !card) {
      highlight.hidden = true;
      highlight.removeAttribute('style');
      card.classList.toggle('stardance-utils-onboarding-card--centered', step.layout === 'centered');
      root.classList.toggle('stardance-utils-onboarding--centered-step', step.layout === 'centered');
      root.classList.toggle('stardance-utils-onboarding--modal-focus', modalFocus);
      if (step.layout === 'centered') {
        card.style.top = '50%';
        card.style.left = '50%';
      } else {
        card.style.top = '24px';
        card.style.left = '24px';
      }
      if (helper) {
        helper.hidden = true;
        helper.removeAttribute('style');
      }
      return;
    }

    card.classList.remove('stardance-utils-onboarding-card--centered');
    root.classList.remove('stardance-utils-onboarding--centered-step');
    root.classList.toggle('stardance-utils-onboarding--modal-focus', modalFocus);
    if (modalFocus || inlineHighlightOnly) {
      highlight.hidden = true;
      highlight.removeAttribute('style');
    } else {
      const padding = 10;
      highlight.hidden = false;
      highlight.style.top = `${Math.max(8, rect.top - padding)}px`;
      highlight.style.left = `${Math.max(8, rect.left - padding)}px`;
      highlight.style.width = `${Math.max(0, rect.width + (padding * 2))}px`;
      highlight.style.height = `${Math.max(0, rect.height + (padding * 2))}px`;
    }

    const cardRect = card.getBoundingClientRect();
    const gap = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const placements = [step.placement || 'right', 'left', 'bottom', 'top'];
    let top = rect.top;
    let left = rect.right + gap;
    let placed = false;

    for (const place of placements) {
      let nextTop = rect.top;
      let nextLeft = rect.right + gap;

      if (place === 'left') {
        nextLeft = rect.left - cardRect.width - gap;
      } else if (place === 'bottom') {
        nextTop = rect.bottom + gap;
        nextLeft = rect.left;
      } else if (place === 'top') {
        nextTop = rect.top - cardRect.height - gap;
        nextLeft = rect.left;
      }

      const overlapsHorizontally = nextLeft < rect.right && nextLeft + cardRect.width > rect.left;
      const overlapsVertically = nextTop < rect.bottom && nextTop + cardRect.height > rect.top;
      const insideViewport = nextLeft >= 16 && nextTop >= 16 && (nextLeft + cardRect.width) <= (viewportWidth - 16) && (nextTop + cardRect.height) <= (viewportHeight - 16);
      if (insideViewport && !(overlapsHorizontally && overlapsVertically)) {
        top = nextTop;
        left = nextLeft;
        placed = true;
        break;
      }
    }

    if (!placed) {
      top = Math.min(viewportHeight - cardRect.height - 16, rect.bottom + gap);
      left = Math.min(viewportWidth - cardRect.width - 16, rect.left);
    }

    if (left + cardRect.width > viewportWidth - 16) {
      left = viewportWidth - cardRect.width - 16;
    }
    if (left < 16) {
      left = 16;
    }
    if (top + cardRect.height > viewportHeight - 16) {
      top = viewportHeight - cardRect.height - 16;
    }
    if (top < 16) {
      top = 16;
    }

    card.style.top = `${top}px`;
    card.style.left = `${left}px`;

    if (helper && !helper.hidden) {
      const helperRect = helper.getBoundingClientRect();
      const helperTop = rect.top - helperRect.height - 12 < 16
        ? rect.bottom + 12
        : rect.top - helperRect.height - 12;
      helper.style.top = `${Math.min(viewportHeight - helperRect.height - 16, helperTop)}px`;
      helper.style.left = `${Math.min(Math.max(16, rect.left + 18), viewportWidth - helperRect.width - 16)}px`;
    }
  };

  SU.renderOnboardingStep = async () => {
    const step = SU.getCurrentOnboardingStep();
    if (!step) {
      SU.clearOnboardingTargetState();
      SU.stopOnboarding();
      return;
    }

    if (!SU.pageMatchesOnboardingStep(step)) {
      if (typeof step.ensurePage === 'function') {
        await step.ensurePage();
      }
      return;
    }

    if (typeof step.beforeEnter === 'function') {
      await step.beforeEnter();
      if (SU.getCurrentOnboardingStep()?.id !== step.id) {
        return;
      }
    }

    const root = SU.ensureOnboardingRoot();
    SU.clearOnboardingTargetState();
    const targets = step.layout === 'centered' ? [] : await SU.waitForOnboardingTarget(step, step.timeoutMs || 8000);
    if (!targets.length && step.optional) {
      const navigationDirection = SU.getOnboardingState().context?.navigationDirection;
      const highlight = root.querySelector('.stardance-utils-onboarding-highlight');
      if (highlight) {
        highlight.hidden = true;
        highlight.removeAttribute('style');
      }
      root.classList.remove('stardance-utils-onboarding--centered-step');
      root.classList.remove('stardance-utils-onboarding--modal-focus');
      if (navigationDirection === 'back' && step.backId) {
        await SU.gotoOnboardingStep(step.backId, 'back');
        return;
      }
      await SU.gotoNextOnboardingStep();
      return;
    }

    if (targets.length) {
      if (step.useModalFocus === true || step.highlightMode === 'inline') {
        targets.forEach((target) => target.classList.add('stardance-utils-onboarding-target--active'));
      }
      SU.scrollOnboardingTargetIntoView(targets[0]);
      await sleep(220);
    }

    const progress = root.querySelector('.stardance-utils-onboarding-progress');
    const eyebrow = root.querySelector('.stardance-utils-onboarding-eyebrow');
    const title = root.querySelector('.stardance-utils-onboarding-title');
    const body = root.querySelector('.stardance-utils-onboarding-body');
    const featureGrid = root.querySelector('.stardance-utils-onboarding-feature-grid');
    const recap = root.querySelector('.stardance-utils-onboarding-recap');
    const helper = root.querySelector('.stardance-utils-onboarding-helper');
    const back = root.querySelector('[data-stardance-utils-onboarding="back"]');
    const next = root.querySelector('[data-stardance-utils-onboarding="next"]');
    const skip = root.querySelector('[data-stardance-utils-onboarding="skip"]');
    const card = root.querySelector('.stardance-utils-onboarding-card');
    const progressSteps = SU.getOnboardingProgressSteps();
    const progressStepIndex = SU.getOnboardingProgressIndex(step.id);
    const stepNumber = progressStepIndex + 1;
    let nextEnabled = typeof step.canAdvance === 'function' ? await step.canAdvance() : true;
    if (step.id === 'sidebar-reorder' && !SU.getOnboardingState().context?.sidebarReorderStarted) {
      nextEnabled = true;
    }

    if (progressStepIndex === -1) {
      progress.hidden = true;
      progress.innerHTML = '';
    } else {
      const progressPercent = Math.max(0, Math.min(100, (stepNumber / progressSteps.length) * 100));
      progress.hidden = false;
      progress.innerHTML = `
        <span class="stardance-utils-onboarding-progress-track" aria-hidden="true">
          <span class="stardance-utils-onboarding-progress-fill" style="width:${progressPercent}%"></span>
        </span>
        <span class="stardance-utils-onboarding-progress-label">Step ${stepNumber} of ${progressSteps.length}</span>
      `;
    }
    eyebrow.textContent = step.eyebrow || '';
    eyebrow.hidden = !step.eyebrow;
    title.textContent = step.title;
    body.textContent = typeof step.getBody === 'function' ? step.getBody() : step.body;
    back.hidden = SU.getOnboardingStepIndex(step.id) === 0;
    const hideNext = typeof step.hideNext === 'function' ? step.hideNext() : step.hideNext === true;
    next.textContent = typeof step.getNextLabel === 'function' ? step.getNextLabel() : (step.nextId ? 'Next' : 'Done');
    next.disabled = !nextEnabled;
    next.hidden = hideNext;
    skip.hidden = step.id === 'finish';
    card.hidden = step.hideCard === true;
    card.classList.toggle('stardance-utils-onboarding-card--welcome', step.id === 'welcome');
    card.classList.toggle('stardance-utils-onboarding-card--finish', step.id === 'finish');
    card.classList.toggle('stardance-utils-onboarding-card--spotlight', step.layout !== 'centered');

    featureGrid.innerHTML = '';
    if (Array.isArray(step.featureItems) && step.featureItems.length) {
      featureGrid.hidden = false;
      featureGrid.innerHTML = step.featureItems.map((item) => `
        <article class="stardance-utils-onboarding-feature">
          <span class="stardance-utils-onboarding-feature-icon">${item.iconHtml || item.icon || '✦'}</span>
          <strong>${item.title}</strong>
          <span>${item.body}</span>
        </article>
      `).join('');
    } else {
      featureGrid.hidden = true;
    }

    recap.innerHTML = '';
    if (Array.isArray(step.recapItems) && step.recapItems.length) {
      recap.hidden = false;
      recap.innerHTML = step.recapItems.map((item) => `
        <li>
          <span class="stardance-utils-onboarding-recap-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 8.2 6.6 11.3 12.5 4.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span>${item}</span>
        </li>
      `).join('');
    } else {
      recap.hidden = true;
    }

    if (step.helperText) {
      helper.hidden = false;
      helper.textContent = step.helperText;
    } else {
      helper.hidden = true;
      helper.textContent = '';
      helper.removeAttribute('style');
    }

    SU.positionOnboarding();
  };

  SU.gotoOnboardingStep = async (stepId, direction = 'next') => {
    SU.cleanupOnboardingBeforeTransition();
    SU.setOnboardingState({ started: true, stepId, context: { navigationDirection: direction } });
    await SU.renderOnboardingStep();
  };

  SU.gotoNextOnboardingStep = async () => {
    const current = SU.getCurrentOnboardingStep();
    if (!current) {
      SU.completeOnboarding();
      SU.stopOnboarding();
      return;
    }

    if (!current.nextId) {
      SU.completeOnboarding();
      SU.stopOnboarding();
      return;
    }

    if (typeof current.onNext === 'function') {
      const handled = await current.onNext();
      if (handled === true) {
        return;
      }
    }

    if (current.id === 'projects-pin') {
      SU.unpinOnboardingDemoProject();
      const href = SU.getOnboardingProjectShowUrl();
      if (href) {
        SU.navigateForOnboarding(href, 'project-composer', { projectShowUrl: href });
        return;
      }
      await SU.gotoOnboardingStep('shop', 'next');
      return;
    }

    if (current.id === 'shop' && SU.getSortedShopGoals().length > 0) {
      await SU.gotoOnboardingStep('shop-goals', 'next');
      return;
    }

    await SU.gotoOnboardingStep(current.nextId, 'next');
  };

  SU.gotoPreviousOnboardingStep = async () => {
    const current = SU.getCurrentOnboardingStep();
    if (!current?.backId) {
      return;
    }

    await SU.gotoOnboardingStep(current.backId, 'back');
  };

  SU.openUtilsSettingsPanel = async (section = 'appearance') => {
    const dialog = document.getElementById('settings-modal');
    if (!dialog) {
      return null;
    }

    if (!dialog.open) {
      if (typeof dialog.show === 'function') {
        dialog.show();
      } else {
        dialog.setAttribute('open', '');
      }
      await sleep(60);
    } else if (SU.isDialogModal(dialog)) {
      dialog.close();
      if (typeof dialog.show === 'function') {
        dialog.show();
      } else {
        dialog.setAttribute('open', '');
      }
      await sleep(60);
    }

    dialog.style.setProperty('z-index', '2147483645');
    SU.setActiveTab?.(dialog, 'utils');
    dialog.dataset.stardanceUtilsOnboardingSection = section;
    const desiredSection = section;
    dialog.querySelectorAll('.stardance-utils-accordion').forEach((details) => {
      const section = details.getAttribute('data-stardance-utils-utils-section');
      details.open = section === desiredSection;
    });
    SU.updateUtilsPanel?.(dialog);
    return dialog;
  };

  SU.skipOnboarding = () => {
    SU.cleanupOnboardingBeforeTransition();
    SU.unpinOnboardingDemoProject();
    SU.dismissOnboarding();
    SU.stopOnboarding();
  };

  SU.stopOnboarding = () => {
    SU.clearOnboardingTargetState();
    SU.cleanupOnboardingBeforeTransition();
    SU.closeOnboardingSettingsDialog();
    SU.removeOnboardingRoot();
    window.removeEventListener('resize', SU.positionOnboarding);
    window.removeEventListener('scroll', SU.positionOnboarding, true);
  };

  SU.startOnboarding = async (force = false) => {
    if (force) {
      SU.resetOnboardingState();
    }

    const state = SU.getOnboardingState();
    const stepId = state.stepId || 'welcome';
    SU.ensureOnboardingListeners();
    SU.setOnboardingState({ started: true, completed: false, dismissed: false, stepId });
    window.addEventListener('resize', SU.positionOnboarding);
    window.addEventListener('scroll', SU.positionOnboarding, true);
    await SU.renderOnboardingStep();
  };

  SU.maybeStartOnboarding = async () => {
    if (SU.shouldAutoStartOnboarding()) {
      await SU.startOnboarding(false);
      return;
    }

    const state = SU.getOnboardingState();
    if (state.started && !state.completed && !state.dismissed && state.stepId) {
      await SU.startOnboarding(false);
    }
  };

  SU.ONBOARDING_STEPS = [
    {
      id: 'welcome',
      countsTowardProgress: false,
      page: 'any',
      title: 'Welcome to Stardance Utils',
      body: 'A quick tour of the upgrades that make Stardance feel faster and easier to use.',
      layout: 'centered',
      featureItems: [
        { icon: '✦', title: 'Fonts & sidebar polish', body: 'Sharper typography and live pairing previews for the whole rail.' },
        { icon: '↕', title: 'Sidebar improvements', body: 'Move your most-used tabs into the exact order you want.' },
        { icon: '✎', title: 'Better project page', body: 'Devlogging, drafts, markdown, and voice tools stay on the page.' },
        {
          iconHtml: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="19" r="1.45"/><circle cx="17" cy="19" r="1.45"/><path d="M3.75 4.75h2.1l1.9 8.2a1 1 0 0 0 .98.78h7.88a1 1 0 0 0 .97-.75l1.32-5.28H7.1"/><path d="M8.35 9.15h10.1"/></svg>',
          title: 'Better shop',
          body: 'Wishlist stars become a cleaner planning surface.'
        }
      ],
      nextId: 'sidebar-fonts'
    },
    {
      id: 'sidebar-fonts',
      page: 'any',
      title: 'Fresh type for the stars',
      body: 'We refreshed the sidebar typography. Next, try a few curated pairings live and see how the whole rail changes.',
      placement: 'right',
      selector: '#primary-nav .sidebar__nav-list',
      onNext: async () => {
        if (!SU.hasTryModeSurface()) {
          SU.navigateForOnboarding('/home?stardance-utils-try-mode=1', 'font-preview');
          return true;
        }
        SU.openTryPanel();
        await SU.gotoOnboardingStep('font-preview');
        return true;
      },
      nextId: 'font-preview'
    },
    {
      id: 'font-preview',
      page: 'any',
      title: 'Live pairing preview',
      body: 'Try a different pairing, then hit Save. We\'ll continue automatically from there.',
      hideCard: true,
      placement: 'bottom',
      helperText: 'Try a different pairing, then click Save.',
      resolveTarget: () => document.getElementById(SU.TRY_PANEL_ID),
      beforeEnter: async () => {
        if (SU.getOnboardingState().context?.previewInteracted !== true) {
          SU.setOnboardingState({ context: { previewInteracted: false } });
        }
        if (SU.hasTryModeSurface() && !document.getElementById(SU.TRY_PANEL_ID)) {
          SU.openTryPanel();
          await sleep(120);
        }
      },
      canAdvance: async () => Boolean(SU.getOnboardingState().context?.previewInteracted),
      nextId: 'sidebar-reorder',
      backId: 'sidebar-fonts'
    },
    {
      id: 'sidebar-reorder',
      page: 'any',
      title: 'Reorder sidebar',
      body: 'Drag the tabs into the order you actually use. When you click Done, we\'ll keep going.',
      placement: 'right',
      resolveTarget: () => [
        document.querySelector('#primary-nav .sidebar__nav-list'),
        document.getElementById(SU.REORDER_BANNER_ID)
      ],
      beforeEnter: async () => {
        const context = SU.getOnboardingState().context || {};
        if (context.sidebarReordered !== true && context.sidebarReorderStarted !== true) {
          if (document.documentElement.classList.contains(SU.SIDEBAR_REORDER_CLASS)) {
            SU.disableSidebarReorderMode();
          }
          SU.setOnboardingState({ context: { sidebarReordered: false, sidebarReorderStarted: false } });
        }
      },
      onNext: async () => {
        if (!SU.getOnboardingState().context?.sidebarReorderStarted) {
          SU.setOnboardingState({ context: { sidebarReorderStarted: true } });
          SU.enableSidebarReorderMode();
          await SU.renderOnboardingStep();
          return true;
        }
        return false;
      },
      getNextLabel: () => (SU.getOnboardingState().context?.sidebarReorderStarted ? 'Waiting for Done' : 'Start reordering'),
      hideNext: false,
      canAdvance: async () => Boolean(SU.getOnboardingState().context?.sidebarReordered),
      nextId: 'projects-pin',
      backId: 'font-preview',
      ensurePage: async () => {
        return;
      }
    },
    {
      id: 'theme-customization',
      page: 'any',
      title: 'Themes live in Utils settings',
      body: 'Open Settings to switch the site palette and tune the rest of the customizability in one place.',
      placement: 'right',
      highlightMode: 'inline',
      resolveTarget: () => document.querySelector('#settings-modal [data-stardance-utils-setting="site-theme"]'),
      beforeEnter: async () => {
        await SU.openUtilsSettingsPanel('appearance');
      },
      onNext: async () => {
        await SU.gotoOnboardingStep('shop-settings');
        return true;
      },
      nextId: 'shop-settings',
      backId: 'shop-goals'
    },
    {
      id: 'shop-settings',
      page: 'any',
      title: 'Shop settings stay close by',
      body: 'Keep the shop controls visible without reopening the full settings flow each time.',
      placement: 'right',
      highlightMode: 'inline',
      resolveTarget: () => document.querySelector('#settings-modal [data-stardance-utils-utils-section="shop"]'),
      beforeEnter: async () => {
        await SU.openUtilsSettingsPanel('shop');
      },
      onNext: async () => {
        await SU.gotoOnboardingStep('finish');
        return true;
      },
      nextId: 'finish',
      backId: 'theme-customization'
    },
    {
      id: 'projects-pin',
      page: 'projects-list',
      title: 'Pin the projects you care about most',
      body: 'Pinned projects float to the top, so the work you revisit most often is always first in line.',
      getBody: () => (SU.hasUnpinnedProjects()
        ? 'Pinned projects float to the top, so the work you revisit most often is always first in line.'
        : 'Well, you already pinned your projects. We will just show where this lives and keep going.'),
      placement: 'right',
      resolveTarget: () => SU.getProjectPinSpotlightTarget(),
      ensurePage: async () => {
        if (!SU.isProjectsListPage()) {
          const href = SU.getProjectsListUrl();
          if (href) {
            SU.navigateForOnboarding(href, 'projects-pin');
          } else {
            await SU.gotoOnboardingStep('shop');
          }
        }
      },
      beforeEnter: async () => {
        const foundProjectsSurface = await SU.waitForProjectsOnboardingSurface();
        if (!foundProjectsSurface) {
          await SU.gotoOnboardingStep('shop');
          return;
        }

        const projectShowUrl = SU.getTutorialFirstProjectShowUrl();
        if (projectShowUrl) {
          SU.setOnboardingState({ context: { projectShowUrl } });
        }

        if (SU.hasPinnedProjects()) {
          await SU.gotoOnboardingStep('project-composer');
          return;
        }

        if (!SU.hasVisibleProjectsList() && SU.getProjectsEmptyState()) {
          await SU.gotoOnboardingStep('shop');
        }
      },
      onNext: async () => {
        const button = SU.getFirstProjectPinButton();
        const projectShowUrl = SU.getTutorialFirstProjectShowUrl();
        if (!button) {
          SU.setOnboardingState({
            context: {
              demoPinnedProjectId: null,
              demoPinnedProjectCreated: false,
              projectShowUrl
            }
          });
          return false;
        }
        const href = button.closest('.project-list__item')?.querySelector('a.profile-project-card[href^="/projects/"]')?.getAttribute('href') || '';
        const projectId = href.split('/').filter(Boolean).pop() || null;
        button.click();
        SU.setOnboardingState({
          context: {
            demoPinnedProjectId: projectId,
            demoPinnedProjectCreated: true,
            projectShowUrl: href || projectShowUrl
          }
        });
        return false;
      },
      nextId: 'project-composer',
      backId: 'sidebar-reorder'
    },
    {
      id: 'project-composer',
      page: 'project-show',
      title: 'Inline devlogging',
      body: 'Inline devlogging now sits right where your project activity already is, so you can post without opening a modal.',
      placement: 'bottom',
      selector: '.stardance-utils-inline-composer-shell',
      nextId: 'project-markdown',
      backId: 'projects-pin',
      ensurePage: async () => {
        if (!SU.isProjectShowPage()) {
          const href = SU.getOnboardingProjectShowUrl();
          if (href) {
            SU.navigateForOnboarding(href, 'project-composer');
          }
        }
      }
    },
    {
      id: 'project-markdown',
      page: 'project-show',
      title: 'Drafts and formatting stay together',
      body: 'Format as you go, see the preview update live, and keep writing on the same page.',
      placement: 'bottom',
      selector: '.stardance-utils-markdown-toolbar',
      nextId: 'project-draft',
      backId: 'project-composer',
      optional: true
    },
    {
      id: 'project-draft',
      page: 'project-show',
      title: 'Drafts survive refreshes',
      body: 'Your draft saves as you type. We\'ll drop in a test line, and it will be there automatically when you come back.',
      placement: 'bottom',
      resolveTarget: () => document.querySelector('textarea[name="post_devlog[body]"]'),
      onNext: async () => {
        const textarea = document.querySelector('textarea[name="post_devlog[body]"]');
        const form = textarea?.closest('form');
        if (!textarea) {
          return false;
        }
        textarea.value = 'I\'m testing drafts';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        SU.persistDevlogDraftValue?.(form, textarea.value);
        SU.setOnboardingState({
          stepId: 'project-draft-verify',
          context: { draftExpectedText: 'I\'m testing drafts' }
        });
        window.location.reload();
        return true;
      },
      nextId: 'project-draft-verify',
      backId: 'project-markdown'
    },
    {
      id: 'project-draft-verify',
      page: 'project-show',
      title: 'Your draft made it back with you',
      body: 'That text came back from your saved draft, so you can step away without losing your place.',
      placement: 'bottom',
      resolveTarget: () => document.querySelector('textarea[name="post_devlog[body]"]'),
      nextId: 'project-voice',
      backId: 'project-draft',
      beforeEnter: async () => {
        const expected = SU.getOnboardingState().context?.draftExpectedText;
        const textarea = document.querySelector('textarea[name="post_devlog[body]"]');
        if (!expected || !textarea || !textarea.value.includes(expected)) {
          await SU.gotoNextOnboardingStep();
        }
      }
    },
    {
      id: 'project-voice',
      page: 'project-show',
      title: 'Dictate with speech-to-text',
      body: 'Use the mic button to dictate a devlog when typing feels slower.',
      placement: 'bottom',
      resolveTarget: () => document.querySelector('.stardance-utils-speech-btn'),
      nextId: 'project-ai',
      backId: 'project-draft-verify',
      optional: true
    },
    {
      id: 'project-ai',
      page: 'project-show',
      title: 'Run AI checks on devlog images',
      body: 'Run a quick AI check on any devlog image when you want a second look.',
      placement: 'left',
      selector: '[data-stardance-utils-ai-button]',
      nextId: 'shop',
      backId: 'project-voice',
      optional: true,
      ensurePage: async () => {
        if (!SU.isProjectShowPage()) {
          const href = SU.getOnboardingProjectShowUrl();
          if (href) {
            SU.navigateForOnboarding(href, 'project-ai');
          }
        }
      }
    },
    {
      id: 'shop',
      page: 'shop',
      title: 'Better shop',
      body: 'Wishlist stars become a cleaner planning layout with totals, quantities, and time estimates.',
      placement: 'left',
      resolveTarget: () => document.querySelector('.stardance-utils-shop-goals-inline, .stardance-utils-shop-goals-section, .shop-item-card__star'),
      beforeEnter: async () => {
        if (!SU.savedShopLayoutEnabled) {
          SU.savedShopLayoutEnabled = true;
          await SU.setStoredSetting({ [SU.SHOP_LAYOUT_ENABLED_KEY]: true });
        }

        if (SU.getSortedShopGoals().length > 0) {
          await SU.gotoOnboardingStep('shop-goals');
        }
      },
      ensurePage: async () => {
        if (!SU.isShopHubPage()) {
          SU.navigateForOnboarding('/shop', 'shop');
        }
      },
      onNext: async () => {
        if (SU.getSortedShopGoals().length > 0) {
          await SU.gotoOnboardingStep('shop-goals');
          return true;
        }
        const star = document.querySelector('.shop-item-card__star');
        star?.click();
        SU.scheduleShopGoalsReconcileRender(220);
        await sleep(300);
        await SU.gotoOnboardingStep('shop-goals');
        return true;
      },
      nextId: 'shop-goals',
      backId: 'project-ai'
    },
    {
      id: 'shop-goals',
      page: 'shop',
      title: 'Shop planning',
      body: 'Switch between cumulative and individual views, change quantities, see total time and stardust needed, and keep everything readable.',
      placement: 'left',
      resolveTarget: () => document.querySelector('.stardance-utils-shop-goals-inline, .stardance-utils-shop-goals-section'),
      ensurePage: async () => {
        if (!SU.isShopHubPage()) {
          SU.navigateForOnboarding('/shop', 'shop-goals');
        }
      },
      nextId: 'theme-customization',
      backId: 'shop'
    },
    {
      id: 'finish',
      countsTowardProgress: false,
      page: 'any',
      title: 'That\'s the constellation',
      body: 'You have the big upgrades. Replay this walkthrough any time from Utils settings whenever you want a refresher.',
      layout: 'centered',
      recapItems: [
        'Fonts and sidebar polish',
        'Reordering and themes',
        'Project tools and voice',
        'Better shop planning'
      ],
      nextId: null,
      backId: 'shop-settings'
    }
  ];
})();
