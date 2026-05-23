/* ==========================================================================
   DEN TAMME BEVER DIGITAL GARDEN - MAIN JS
   Lightweight, highly performant client-side scripts.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle Functionality ---
  const themeBtn = document.getElementById('theme-toggle');
  
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // --- Mobile Menu Navigation ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open', !isOpen);
      
      // Update aria-expanded status
      mobileToggle.setAttribute('aria-expanded', !isOpen);
    });
  }

  // --- Search & Header Menu Topic Filtering ---
  const searchInput = document.getElementById('garden-search');
  const filterLinks = document.querySelectorAll('.nav-filter');
  const noteCards = document.querySelectorAll('.note-card');
  const emptyState = document.getElementById('empty-state');
  
  let searchQuery = '';
  let activeFilter = 'all';
  
  function updateGardenVisibility() {
    let visibleCount = 0;
    
    noteCards.forEach(card => {
      const title = card.getAttribute('data-title').toLowerCase();
      const summary = card.getAttribute('data-summary').toLowerCase();
      const tags = card.getAttribute('data-tags').toLowerCase();
      const category = card.getAttribute('data-category').toLowerCase();
      
      const matchesSearch = title.includes(searchQuery) || 
                            summary.includes(searchQuery) || 
                            tags.includes(searchQuery) ||
                            category.includes(searchQuery);
                            
      const matchesFilter = activeFilter === 'all' || 
                            category === activeFilter;
      
      if (matchesSearch && matchesFilter) {
        card.style.display = ''; // Fallback to CSS default (flex)
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Toggle Empty State message
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
  
  // Bind Search Input event listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      updateGardenVisibility();
    });
  }
  
  // Bind Filter Link event listeners
  if (filterLinks.length > 0) {
    filterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // If we are on the home page (searchInput exists), intercept the click
        if (searchInput) {
          e.preventDefault();
          
          // Remove active class from all header links and add to clicked one
          filterLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          activeFilter = link.getAttribute('data-filter');
          updateGardenVisibility();
          
          // Close mobile menu if open
          if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
          }
          
          // Update URL in a clean way without reloading page
          const filterVal = link.getAttribute('data-filter');
          const newUrl = filterVal === 'all' ? window.location.pathname : `?filter=${filterVal}`;
          window.history.pushState({ filter: filterVal }, '', newUrl);
        }
      });
    });
  }
  
  // On Page Load: Check if there is a URL filter parameter (e.g. ?filter=litteratur)
  if (searchInput) {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam) {
      const activeLink = document.querySelector(`.nav-filter[data-filter="${filterParam}"]`);
      if (activeLink) {
        filterLinks.forEach(l => l.classList.remove('active'));
        activeLink.classList.add('active');
        activeFilter = filterParam;
        updateGardenVisibility();
      }
    }
  }

  // --- Keyboard Shortcuts for snappier navigation ---
  document.addEventListener('keydown', (e) => {
    // Focus search input with '/' key (if we are not already typing inside an input/textarea)
    if (e.key === '/' && document.activeElement !== searchInput) {
      if (searchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // Clear search and blur with 'Escape'
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      searchQuery = '';
      searchInput.blur();
      updateGardenVisibility();
    }
    
    // Back to home page with 'ArrowLeft' if reading a note
    const backLink = document.querySelector('.note-back-link');
    if (e.key === 'ArrowLeft' && backLink && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      window.location.href = backLink.getAttribute('href');
    }

    // Secret developer shortcut (Alt + Shift + A) to access the admin panel
    if (e.altKey && e.shiftKey && e.code === 'KeyA') {
      e.preventDefault();
      window.location.href = '/admin/';
    }
  });


  // --- Scroll Progress Bar ---
  const scrollBar = document.getElementById('scroll-progress');
  if (scrollBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollBar.style.width = `${pct}%`;
    });
  }

  // --- Shortcuts Modal ---
  const shortcutModal = document.getElementById('shortcut-modal');
  const shortcutCloseBtn = document.getElementById('shortcut-close-btn');

  function openShortcuts() {
    if (shortcutModal) {
      shortcutModal.classList.add('open');
      shortcutModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeShortcuts() {
    if (shortcutModal) {
      shortcutModal.classList.remove('open');
      shortcutModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (shortcutCloseBtn) {
    shortcutCloseBtn.addEventListener('click', closeShortcuts);
  }

  if (shortcutModal) {
    shortcutModal.addEventListener('click', (e) => {
      if (e.target === shortcutModal) {
        closeShortcuts();
      }
    });
  }

  // Trigger with '?' key (avoid inside inputs/textareas)
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (shortcutModal && shortcutModal.classList.contains('open')) {
        closeShortcuts();
      } else {
        openShortcuts();
      }
    }

    // Also close with Escape
    if (e.key === 'Escape' && shortcutModal && shortcutModal.classList.contains('open')) {
      closeShortcuts();
    }
  });

  // --- Intelligent Page-Wide Prefetcher for Instant Load Times ---
  (function() {
    const prefetchCache = new Set();

    function prefetchLink(url) {
      if (!url || prefetchCache.has(url)) return;
      prefetchCache.add(url);

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
    }

    // 1. Bulk prefetch all article links on the page once the site is fully loaded and idle
    window.addEventListener('load', () => {
      // Small delay (200ms) to ensure everything else has settled first
      setTimeout(() => {
        const articleLinks = document.querySelectorAll('a[href^="/garden/"]');
        articleLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && !href.includes('/admin/')) {
            prefetchLink(href);
          }
        });
      }, 200);
    });

    // 2. Fallback hover/touch listener for dynamically loaded links or other sections
    document.addEventListener('pointerover', function(e) {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/garden/') && !href.includes('/admin/')) {
        prefetchLink(href);
      }
    });

    document.addEventListener('touchstart', function(e) {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/garden/') && !href.includes('/admin/')) {
        prefetchLink(href);
      }
    }, { passive: true });
  })();


  // --- Code Copy Buttons ---
  const codeBlocks = document.querySelectorAll('pre');
  codeBlocks.forEach(pre => {
    // Check if pre is already wrapped (avoid double wrapping)
    if (pre.parentNode.classList.contains('code-wrapper')) return;

    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.textContent = 'kopier';
    copyBtn.setAttribute('aria-label', 'Kopier kode');
    wrapper.appendChild(copyBtn);

    copyBtn.addEventListener('click', () => {
      const codeText = pre.textContent || '';
      
      navigator.clipboard.writeText(codeText).then(() => {
        copyBtn.textContent = 'kopiert!';
        copyBtn.classList.add('success');
        
        setTimeout(() => {
          copyBtn.textContent = 'kopier';
          copyBtn.classList.remove('success');
        }, 1500);
      }).catch(err => {
        console.error('Klarte ikke å kopiere kode:', err);
        copyBtn.textContent = 'feilet';
        setTimeout(() => {
          copyBtn.textContent = 'kopier';
        }, 1500);
      });
    });
  });

  // --- Bever Easter Egg & Toast ---
  // 1. Page views tracking
  const isArticle = window.location.pathname.includes('/garden/') && !window.location.pathname.endsWith('/garden/');
  if (isArticle) {
    const viewedKey = `viewed-${window.location.pathname}`;
    if (!sessionStorage.getItem(viewedKey)) {
      // Only count unique page reads per session to prevent rapid refresh spam
      sessionStorage.setItem(viewedKey, 'true');
      
      let twigs = parseInt(localStorage.getItem('bever-twigs') || '0', 10);
      twigs += 1;
      localStorage.setItem('bever-twigs', twigs);
    }
  }

  // 2. Click easter egg trigger
  const beverEgg = document.getElementById('bever-egg');
  const beverToast = document.getElementById('bever-toast');
  let toastTimeout = null;

  if (beverEgg && beverToast) {
    // Allow closing the toast instantly by clicking anywhere on it
    beverToast.addEventListener('click', () => {
      beverToast.classList.remove('show');
      if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
      }
    });

    beverEgg.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent immediate closing from click propagation
      const twigs = parseInt(localStorage.getItem('bever-twigs') || '0', 10);
      
      let message = '';
      if (twigs === 0) {
        message = 'beveren 🦫 har akkurat begynt på demningen din... utforsk hagen for å hjelpe den med å samle kvister! 🍂';
      } else if (twigs === 1) {
         message = 'demningen tar form! beveren 🦫 har samlet <strong>1 kvist</strong> (notat lest). fortsett utforskningen! 🍂';
      } else if (twigs >= 2 && twigs <= 4) {
        message = `demningen vokser! beveren 🦫 har samlet <strong>${twigs} kvister</strong> (notater lest). hagen din begynner å bli frodig! 🍂💧`;
      } else {
        message = `for et fantastisk økosystem! beveren 🦫 har samlet hele <strong>${twigs} kvister</strong> til demningen din! du har formet et solid kunnskapsnettverk. beveren takker deg! 🦫🌳🌊`;
      }

      // Inject close button and message wrapper
      beverToast.innerHTML = `
        <button class="bever-toast-close" aria-label="Lukk melding">&times;</button>
        <div class="bever-toast-content">${message}</div>
      `;
      beverToast.classList.add('show');

      // Clear existing timeout
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }

      // Auto hide after 5.5 seconds
      toastTimeout = setTimeout(() => {
        beverToast.classList.remove('show');
      }, 5500);
    });

    // Secret developer entry: Double click/tap the beaver emoji to navigate to /admin/
    beverEgg.addEventListener('dblclick', (e) => {
      e.preventDefault();
      window.location.href = '/admin/';
    });
  }

  // --- Service Worker Registration for offline support ---
  // --- Newsletter Ajax handling (inline thank‑you) ---
  (function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const iframeName = 'mailchimp-iframe-' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const originalTarget = newsletterForm.getAttribute('target');
      newsletterForm.setAttribute('target', iframeName);
      newsletterForm.submit();
      newsletterForm.setAttribute('target', originalTarget || '_blank');

      iframe.addEventListener('load', function () {
        // Remove any existing thank‑you message
        const existing = newsletterForm.parentNode.querySelector('.newsletter-msg');
        if (existing) existing.remove();

        // Create fresh element to re‑trigger CSS animation
        const thankMsg = document.createElement('p');
        thankMsg.className = 'newsletter-msg';
        thankMsg.textContent = 'Takk for påmeldingen — du hører fra oss snart.';
        newsletterForm.parentNode.insertBefore(thankMsg, newsletterForm.nextSibling);

        newsletterForm.reset();

        setTimeout(() => {
          thankMsg.style.transition = 'opacity 0.4s ease';
          thankMsg.style.opacity = '0';
          setTimeout(() => thankMsg.remove(), 400);
        }, 4000);

        iframe.remove();
      });
    });
  })();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('sw.js registrert.'))
        .catch(err => console.error('sw.js feilet:', err));
    });
  }
});
