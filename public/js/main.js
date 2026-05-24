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
      let newTheme = 'light';
      
      if (currentTheme === 'light') {
        newTheme = 'sepia';
      } else if (currentTheme === 'sepia') {
        newTheme = 'dark';
      } else {
        newTheme = 'light';
      }
      
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

  // --- Dynamic Offline Cache Indexer ---
  (function() {
    const offlineList = document.getElementById('offline-links');
    if (!offlineList) return;

    if (!('caches' in window)) {
      offlineList.innerHTML = '<li class="offline-error">Nettleseren din støtter ikke offline-caching.</li>';
      return;
    }

    caches.open('bever-cache-v1').then(cache => {
      cache.keys().then(requests => {
        const articleRequests = requests.filter(req => {
          const url = new URL(req.url);
          // Only show garden notes and avoid directories
          return url.pathname.startsWith('/garden/') && 
                 url.pathname !== '/garden/' && 
                 url.pathname !== '/garden';
        });

        if (articleRequests.length === 0) {
          offlineList.innerHTML = '<li class="offline-empty">Du har ingen lagrede notater på denne enheten ennå. Gå online og utforsk noen notater først! 🍂</li>';
          return;
        }

        offlineList.innerHTML = ''; // Clear loading status

        articleRequests.forEach(req => {
          const url = new URL(req.url);
          
          // Fetch from the cache to extract the real article title!
          cache.match(req).then(response => {
            if (!response) return;
            response.text().then(htmlText => {
              // Extract page title using a simple regex (fast and CSP-safe!)
              const titleMatch = htmlText.match(/<title>([^<]+)<\/title>/i);
              let title = titleMatch ? titleMatch[1] : url.pathname;
              
              // Strip site name suffix from title if present (e.g. "Title | Den Tamme Bever")
              title = title.split(' | ')[0];

              const li = document.createElement('li');
              li.className = 'offline-link-item';
              li.innerHTML = `
                <a href="${url.pathname}" class="offline-article-link">
                  <span class="offline-icon">📄</span>
                  <span class="offline-title">${title.toLowerCase()}</span>
                </a>
              `;
              offlineList.appendChild(li);
            });
          });
        });
      });
    }).catch(err => {
      offlineList.innerHTML = `<li class="offline-error">Kunne ikke hente lagrede sider: ${err.message}</li>`;
    });
  })();


  // --- Glassmorphic Command Palette (CMD+K) Search ---
  (function() {
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-modal-input');
    const searchResults = document.getElementById('search-modal-results');
    const searchToggle = document.getElementById('search-toggle');
    
    if (!searchModal || !searchInput || !searchResults) return;

    let indexLoaded = false;
    let elasticIndex = null;
    let activeResultIdx = -1;

    // Load scripts dynamically to preserve page load speed
    function loadSearchEngine(callback) {
      if (indexLoaded) {
        if (callback) callback();
        return;
      }

      // Show loading status
      searchResults.innerHTML = '<li class="search-status-item">Laster inn søkemotoren...</li>';

      // Load elasticlunr
      const elScript = document.createElement('script');
      elScript.src = '/elasticlunr.min.js';
      elScript.onload = () => {
        // Load search index (Zola generates search_index.no.js by default for language 'no')
        const idxScript = document.createElement('script');
        idxScript.src = '/search_index.no.js';
        idxScript.onload = () => {
          if (window.searchIndex) {
            elasticIndex = elasticlunr.Index.load(window.searchIndex);
            indexLoaded = true;
            if (callback) callback();
          } else {
            searchResults.innerHTML = '<li class="search-status-item offline-error">Feil: Kunne ikke hente søkeindeksen.</li>';
          }
        };
        idxScript.onerror = () => {
          searchResults.innerHTML = '<li class="search-status-item offline-error">Feil: Kunne ikke laste søkeindeks-filen.</li>';
        };
        document.body.appendChild(idxScript);
      };
      elScript.onerror = () => {
        searchResults.innerHTML = '<li class="search-status-item offline-error">Feil: Kunne ikke laste søkemotoren (elasticlunr).</li>';
      };
      document.body.appendChild(elScript);
    }

    function openSearch() {
      searchModal.classList.add('open');
      searchModal.setAttribute('aria-hidden', 'false');
      loadSearchEngine(() => {
        searchInput.focus();
        performSearch(); // Perform search on empty query/previous query
      });
    }

    function closeSearch() {
      searchModal.classList.remove('open');
      searchModal.setAttribute('aria-hidden', 'true');
      searchInput.blur();
    }

    if (searchToggle) {
      searchToggle.addEventListener('click', openSearch);
    }

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        closeSearch();
      }
    });

    // Keyboard trigger bindings (CMD+K, Ctrl+K, /, Esc)
    document.addEventListener('keydown', (e) => {
      // CMD+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchModal.classList.contains('open')) {
          closeSearch();
        } else {
          openSearch();
        }
      }

      // Slash key '/' (only when not typing in form inputs)
      if (e.key === '/' && !searchModal.classList.contains('open') &&
          document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openSearch();
      }

      // Esc to close
      if (e.key === 'Escape' && searchModal.classList.contains('open')) {
        closeSearch();
      }
    });

    // Arrow navigation inside results list
    searchInput.addEventListener('keydown', (e) => {
      const items = searchResults.querySelectorAll('.search-result-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeResultIdx = (activeResultIdx + 1) % items.length;
        updateActiveResult(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeResultIdx = (activeResultIdx - 1 + items.length) % items.length;
        updateActiveResult(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeResultIdx >= 0 && activeResultIdx < items.length) {
          const link = items[activeResultIdx].querySelector('a');
          if (link) link.click();
        }
      }
    });

    function updateActiveResult(items) {
      items.forEach((item, idx) => {
        if (idx === activeResultIdx) {
          item.classList.add('active');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('active');
        }
      });
    }

    searchInput.addEventListener('input', performSearch);

    function performSearch() {
      if (!indexLoaded || !elasticIndex) return;

      const query = searchInput.value.trim().toLowerCase();
      activeResultIdx = -1;

      if (query === '') {
        searchResults.innerHTML = '<li class="search-status-item">Skriv inn et søkeord for å dypdykke i hagen...</li>';
        return;
      }

      const rawResults = elasticIndex.search(query, {
        fields: {
          title: { boost: 3 },
          description: { boost: 2 },
          body: { boost: 1 }
        },
        bool: "OR",
        expand: true
      });

      if (rawResults.length === 0) {
        searchResults.innerHTML = '<li class="search-status-item">Ingen treff matcher søket ditt...</li>';
        return;
      }

      searchResults.innerHTML = ''; // Clear status

      rawResults.forEach((res) => {
        const doc = elasticIndex.documentStore.getDoc(res.ref);
        if (!doc) return;

        // Strip absolute url prefixes to support relative URLs perfectly
        const relativeUrl = doc.id.replace(window.location.origin, "").replace("https://dentammebever.no", "");
        
        const li = document.createElement('li');
        li.className = 'search-result-item';

        // Extract category (Zola standard structure or falls back to garden/general)
        let category = 'generelt';
        if (relativeUrl.includes('/garden/')) {
          category = 'hagenotat';
        }

        // Highlight matching terms in excerpt
        let excerpt = doc.description || doc.body || '';
        if (excerpt.length > 140) {
          // Find search term position in body to center excerpt around it!
          const queryIdx = excerpt.toLowerCase().indexOf(query);
          if (queryIdx > 60) {
            excerpt = '...' + excerpt.substring(queryIdx - 50, queryIdx + 90) + '...';
          } else {
            excerpt = excerpt.substring(0, 140) + '...';
          }
        }

        // Safe highlight replace
        const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const highlightRegex = new RegExp(`(${escapedQuery})`, 'gi');
        const highlightedExcerpt = excerpt.replace(highlightRegex, '<mark>$1</mark>');
        const highlightedTitle = doc.title.replace(highlightRegex, '<mark>$1</mark>');

        li.innerHTML = `
          <a href="${relativeUrl}" class="search-result-link">
            <div class="search-result-header">
              <span class="search-result-title">${highlightedTitle.toLowerCase()}</span>
              <span class="search-result-category">#${category}</span>
            </div>
            <p class="search-result-excerpt">${highlightedExcerpt}</p>
          </a>
        `;

        searchResults.appendChild(li);
      });
    }
  })();

  if ('serviceWorker' in navigator) {


    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('sw.js registrert.'))
        .catch(err => console.error('sw.js feilet:', err));
    });
  }
});
