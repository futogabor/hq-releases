// HQ (Helios Query) Introduction Page interactions
// Zero external dependencies; progressive enhancement over semantic HTML.

(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Theme toggle (follows modern-web-guidance: dark-mode-toggle)
  // ---------------------------------------------------------------------------
  const schemeMeta = document.querySelector('meta[name="color-scheme"]');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const themeButton = document.getElementById('theme-toggle');

  function storedScheme() {
    try {
      const value = localStorage.getItem('color-scheme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  function applyScheme(value) {
    if (!schemeMeta) return;
    schemeMeta.content = value === 'light' || value === 'dark' ? value : 'light dark';
  }

  function currentRenderedScheme() {
    const metaValue = schemeMeta?.content;
    if (metaValue === 'light' || metaValue === 'dark') return metaValue;
    return darkQuery.matches ? 'dark' : 'light';
  }

  if (themeButton && schemeMeta) {
    themeButton.addEventListener('click', () => {
      const target = currentRenderedScheme() === 'dark' ? 'light' : 'dark';
      const systemScheme = darkQuery.matches ? 'dark' : 'light';
      if (target === systemScheme) {
        try {
          localStorage.removeItem('color-scheme');
        } catch {
          // Ignore storage restrictions; still apply to current page.
        }
        applyScheme(null);
      } else {
        try {
          localStorage.setItem('color-scheme', target);
        } catch {
          // Ignore storage restrictions; still apply to current page.
        }
        applyScheme(target);
      }
    });

    // Keep open tabs in sync; never retroactively clear stored override on OS changes.
    window.addEventListener('storage', (event) => {
      if (event.key === 'color-scheme') {
        applyScheme(storedScheme());
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Accessible Screenshot Tabs (follows modern-web-guidance: tabs)
  // ---------------------------------------------------------------------------
  const tablist = document.querySelector('.tablist');
  const tabs = tablist ? Array.from(tablist.querySelectorAll('[role="tab"]')) : [];
  const panels = Array.from(document.querySelectorAll('.tabpanels > [role="tabpanel"]'));

  function selectTab(selected, { moveFocus = false } = {}) {
    if (!selected) return;
    const targetId = selected.id;
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.toggleAttribute('focusgroupstart', active);
      tab.tabIndex = active ? 0 : -1;
    }
    for (const panel of panels) {
      const active = panel.getAttribute('aria-labelledby') === targetId;
      if (active) {
        panel.removeAttribute('hidden');
      } else {
        panel.hidden = 'until-found';
      }
    }
    if (moveFocus) {
      selected.focus();
    }
    try {
      selected.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
    } catch {
      selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  if (tablist && tabs.length > 0) {
    // Initialize roving tabindex fallback for browsers without native focusgroup
    const hasNativeFocusgroup = Object.hasOwn(HTMLElement.prototype, 'focusGroup');
    const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    for (const tab of tabs) {
      tab.tabIndex = tab === initial ? 0 : -1;
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));

      // Selection follows focus when navigating with keyboard
      tab.addEventListener('focus', () => {
        if (tab.getAttribute('aria-selected') !== 'true') {
          selectTab(tab);
        }
      });

      if (!hasNativeFocusgroup) {
        tab.addEventListener('keydown', (event) => {
          let nextIndex = null;
          if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') nextIndex = 0;
          else if (event.key === 'End') nextIndex = tabs.length - 1;
          if (nextIndex !== null) {
            event.preventDefault();
            selectTab(tabs[nextIndex], { moveFocus: true });
          }
        });
      }
    });

    // Keep tabs synced if native Find-in-Page reveals a hidden="until-found" panel
    document.addEventListener('beforematch', (event) => {
      const panel = event.target.closest?.('.tabpanels > [role="tabpanel"]');
      if (!panel) return;
      const tabId = panel.getAttribute('aria-labelledby');
      const tab = tabId ? document.getElementById(tabId) : null;
      if (tab) selectTab(tab);
    });

    // Fallback scrollability fade hint when scroll-driven animations are unsupported
    if (!window.CSS?.supports?.('animation-timeline', 'scroll()')) {
      const first = tablist.firstElementChild;
      const last = tablist.lastElementChild;
      if (first && last && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const { target, intersectionRatio } of entries) {
              tablist.classList.toggle(target === first ? 'more-start' : 'more-end', intersectionRatio < 1);
            }
          },
          { root: tablist, threshold: 1, rootMargin: '1px' }
        );
        observer.observe(first);
        observer.observe(last);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Screenshot Lightbox Dialog (light-dismiss-a-dialog + animate-to-from-top-layer)
  // ---------------------------------------------------------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxClose = document.getElementById('lightbox-close');

  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
  }

  async function closeTopLayer(dialog) {
    if (!dialog || !dialog.open) return;
    if (!supportsTopLayerExit()) {
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 600)),
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }
    dialog.close();
  }

  function openLightbox(panelEl) {
    if (!lightbox || !lightboxImg || !lightboxTitle || !panelEl) return;
    const isDark = currentRenderedScheme() === 'dark';
    const img = panelEl.querySelector(isDark ? '.theme-only-dark' : '.theme-only-light') || panelEl.querySelector('img');
    if (!img) return;
    lightbox.removeAttribute('data-closing');
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxTitle.textContent = panelEl.dataset.screenTitle || img.alt || 'HQ screenshot';
    lightbox.showModal();
  }

  if (lightbox) {
    document.querySelectorAll('[data-open-lightbox]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const host = trigger.closest('[data-screen-title]');
        openLightbox(host);
      });
    });

    lightboxClose?.addEventListener('click', () => closeTopLayer(lightbox));

    // Route Esc and native closedby cancel requests through closeTopLayer for smooth exit
    lightbox.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(lightbox);
    });

    // Mandatory fallback for browsers without closedby="any" (Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      lightbox.addEventListener('click', (event) => {
        if (event.target !== lightbox) return;
        const rect = lightbox.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        closeTopLayer(lightbox);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4. FAQ Expand/Collapse All (follows modern-web-guidance: accordion)
  // ---------------------------------------------------------------------------
  const faqAccordion = document.getElementById('faq-accordion');
  const faqToggleBtn = faqAccordion?.querySelector('[command="--toggle-all"]');

  function toggleAllFaq(button, container) {
    const expand = button.getAttribute('aria-expanded') !== 'true';
    for (const details of container.querySelectorAll(':scope > details')) {
      details.open = expand;
    }
    button.setAttribute('aria-expanded', String(expand));
  }

  if (faqAccordion && faqToggleBtn) {
    if (Object.hasOwn(HTMLButtonElement.prototype, 'commandForElement')) {
      document.addEventListener(
        'command',
        (event) => {
          if (event.command !== '--toggle-all' || event.target !== faqAccordion) return;
          toggleAllFaq(event.source, event.target);
        },
        { capture: true }
      );
    } else {
      faqToggleBtn.addEventListener('click', () => toggleAllFaq(faqToggleBtn, faqAccordion));
    }

    document.addEventListener(
      'toggle',
      (event) => {
        if (!event.target.matches?.('#faq-accordion > details')) return;
        const items = faqAccordion.querySelectorAll(':scope > details');
        faqToggleBtn.setAttribute('aria-expanded', String(Array.prototype.every.call(items, (d) => d.open)));
      },
      { capture: true }
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Same-origin appcast.xml hydration (sanitized release notes & live download link)
  // ---------------------------------------------------------------------------
  const ALLOWED_TAGS = new Set(['H3', 'UL', 'LI', 'P', 'CODE', 'STRONG', 'EM']);

  function safeRenderReleaseNotes(container, rawHtml) {
    if (!container || !rawHtml) return;
    const elements = ['h3', 'ul', 'li', 'p', 'code', 'strong', 'em'];
    if ('setHTML' in Element.prototype) {
      container.setHTML(rawHtml, { sanitizer: { elements, attributes: [] } });
      return;
    }
    // Safe zero-dependency fallback matching native Sanitizer allowlist semantics:
    // parse into an inert document and clone only allowlisted elements + text nodes.
    const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
    const frag = document.createDocumentFragment();
    function cloneSafe(node, parent) {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          parent.appendChild(document.createTextNode(child.textContent || ''));
        } else if (child.nodeType === Node.ELEMENT_NODE && ALLOWED_TAGS.has(child.tagName)) {
          const el = document.createElement(child.tagName.toLowerCase());
          cloneSafe(child, el);
          parent.appendChild(el);
        }
      }
    }
    cloneSafe(doc.body, frag);
    container.replaceChildren(frag);
  }

  function formatBytes(bytes) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return '';
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(pubDate) {
    const d = new Date(pubDate);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async function hydrateFromAppcast() {
    try {
      const response = await fetch('./appcast.xml', { cache: 'no-cache' });
      if (!response.ok) return;
      const xmlText = await response.text();
      const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
      const item = xml.querySelector('channel > item');
      if (!item) return;

      const version =
        item.getElementsByTagName('sparkle:shortVersionString')[0]?.textContent?.trim() ||
        item.querySelector('title')?.textContent?.replace(/^HQ\s+/i, '').trim();
      const minOS = item.getElementsByTagName('sparkle:minimumSystemVersion')[0]?.textContent?.trim() || '15.0';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      const enclosure = item.querySelector('enclosure');
      const url = enclosure?.getAttribute('url') || '';
      const sizeText = formatBytes(enclosure?.getAttribute('length'));
      const description = item.querySelector('description')?.textContent || '';

      // Only allow HTTPS GitHub release URLs from this repo
      const safeUrl = /^https:\/\/github\.com\/futogabor\/hq-releases\/releases\/download\/v[0-9A-Za-z._-]+\/HQ-[0-9A-Za-z._-]+\.zip$/.test(url)
        ? url
        : null;

      if (version) {
        document.querySelectorAll('[data-release-version]').forEach((el) => {
          el.textContent = `v${version}`;
        });
        document.querySelectorAll('[data-release-title]').forEach((el) => {
          el.textContent = `HQ ${version}`;
        });
      }

      if (safeUrl) {
        document.querySelectorAll('[data-download-link]').forEach((a) => {
          a.setAttribute('href', safeUrl);
        });
      }

      const metaBits = [
        version ? `v${version}` : null,
        `macOS ${minOS.replace(/\.0$/, '')}+`,
        'Apple Silicon',
        sizeText || null,
      ].filter(Boolean);
      const badgeEl = document.getElementById('hero-release-badge');
      if (badgeEl && metaBits.length > 0) {
        badgeEl.textContent = metaBits.join(' · ');
      }

      const notesMeta = document.getElementById('release-notes-meta');
      if (notesMeta) {
        const parts = [formatDate(pubDate), sizeText, `macOS ${minOS.replace(/\.0$/, '')}+`].filter(Boolean);
        if (parts.length > 0) notesMeta.textContent = parts.join(' · ');
      }

      const notesBody = document.getElementById('release-notes-body');
      if (notesBody && description.trim()) {
        safeRenderReleaseNotes(notesBody, description);
      }
    } catch {
      // Static HTML fallback remains intact when opened via file:// or offline.
    }
  }

  hydrateFromAppcast();
})();
