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

  // --- Interactive SVG Graph Visualizer ---
  const graphContainer = document.getElementById('note-graph-container');
  if (graphContainer) {
    const currentTitle = graphContainer.getAttribute('data-current-title') || 'denne siden';
    const currentUrl = graphContainer.getAttribute('data-current-url') || '#';
    const backlinksData = graphContainer.getAttribute('data-backlinks');
    
    let backlinks = [];
    try {
      backlinks = JSON.parse(backlinksData) || [];
    } catch (err) {
      console.error('Kunne ikke hente backlinks for grafen:', err);
    }

    // Prepare graph dataset
    // Nodes list: center node + home node + backlinks nodes
    const nodes = [
      { id: 'current', label: currentTitle, url: currentUrl, isCurrent: true },
      { id: 'home', label: 'hjem', url: '/', isHome: true }
    ];
    
    backlinks.forEach((link, idx) => {
      nodes.push({ id: `backlink-${idx}`, label: link.title, url: link.permalink, isBacklink: true });
    });

    const links = [
      { source: 'home', target: 'current' }
    ];
    
    backlinks.forEach((link, idx) => {
      links.push({ source: `backlink-${idx}`, target: 'current' });
    });

    // SVG Layout calculations
    const width = graphContainer.clientWidth || 600;
    const height = graphContainer.clientHeight || 250;
    const centerX = width / 2;
    const centerY = height / 2;

    // Radius varies slightly with screen size to prevent clutter
    const radius = Math.min(width, height) * (width < 500 ? 0.28 : 0.32);

    // Position nodes
    nodes[0].x = centerX;
    nodes[0].y = centerY;

    const neighborCount = nodes.length - 1;
    for (let i = 1; i < nodes.length; i++) {
      const angle = ((i - 1) / neighborCount) * 2 * Math.PI - Math.PI / 2;
      nodes[i].x = centerX + radius * Math.cos(angle);
      nodes[i].y = centerY + radius * Math.sin(angle);
      nodes[i].angle = angle;
    }

    // Create SVG string
    let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // 1. Draw link lines first (behind nodes)
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      if (sourceNode && targetNode) {
        svgContent += `<line x1="${sourceNode.x}" y1="${sourceNode.y}" x2="${targetNode.x}" y2="${targetNode.y}" class="graph-link" id="link-${link.source}"/>`;
      }
    });

    // 2. Draw nodes and text labels
    nodes.forEach(node => {
      const isCurrent = node.isCurrent;
      const r = isCurrent ? 8 : 5;
      const nodeClass = isCurrent ? 'graph-node current' : 'graph-node neighbor';

      // Compute radial text offsets to prevent overlaps!
      let textX = node.x;
      let textY = node.y;
      let anchor = 'middle';

      if (isCurrent) {
        textY = node.y + r + 13;
      } else {
        const angle = node.angle;
        const labelOffset = 13;
        textX = node.x + labelOffset * Math.cos(angle);
        textY = node.y + labelOffset * Math.sin(angle) + 4; // slight vertical centering alignment

        if (Math.cos(angle) > 0.1) {
          anchor = 'start';
        } else if (Math.cos(angle) < -0.1) {
          anchor = 'end';
        }
      }

      svgContent += `
        <a href="${node.url}" class="graph-node-link">
          <g class="graph-node-group" data-node-id="${node.id}">
            <circle cx="${node.x}" cy="${node.y}" r="${r}" class="${nodeClass}"/>
            <text x="${textX}" y="${textY}" text-anchor="${anchor}" class="graph-label">${node.label}</text>
          </g>
        </a>
      `;
    });

    svgContent += `</svg>`;
    graphContainer.innerHTML = svgContent;

    // Attach premium interactive hover listeners for visual dimming
    const svgElement = graphContainer.querySelector('svg');
    if (svgElement) {
      const groups = svgElement.querySelectorAll('.graph-node-group');
      groups.forEach(group => {
        const nodeId = group.getAttribute('data-node-id');
        
        group.addEventListener('mouseenter', () => {
          // Dim all node groups and lines
          groups.forEach(g => g.classList.add('dimmed'));
          svgElement.querySelectorAll('.graph-link').forEach(l => l.classList.add('dimmed'));
          
          // Highlight active group
          group.classList.remove('dimmed');
          group.classList.add('active');
          
          // Highlight active link line
          const activeLink = svgElement.querySelector(`#link-${nodeId}`);
          if (activeLink) {
            activeLink.classList.remove('dimmed');
            activeLink.classList.add('active');
          }
        });

        group.addEventListener('mouseleave', () => {
          // Reset all
          groups.forEach(g => {
            g.classList.remove('dimmed');
            g.classList.remove('active');
          });
          svgElement.querySelectorAll('.graph-link').forEach(l => {
            l.classList.remove('dimmed');
            l.classList.remove('active');
          });
        });
      });
    }

    // Handle window resizing
    window.addEventListener('resize', () => {
      const newWidth = graphContainer.clientWidth;
      const newHeight = graphContainer.clientHeight;
      const newCenterX = newWidth / 2;
      const newCenterY = newHeight / 2;
      const newRadius = Math.min(newWidth, newHeight) * (newWidth < 500 ? 0.28 : 0.32);

      const activeSvg = graphContainer.querySelector('svg');
      if (activeSvg) {
        activeSvg.setAttribute('viewBox', `0 0 ${newWidth} ${newHeight}`);
        
        // Recalculate node coordinates
        nodes[0].x = newCenterX;
        nodes[0].y = newCenterY;
        for (let i = 1; i < nodes.length; i++) {
          const angle = ((i - 1) / neighborCount) * 2 * Math.PI - Math.PI / 2;
          nodes[i].x = newCenterX + newRadius * Math.cos(angle);
          nodes[i].y = newCenterY + newRadius * Math.sin(angle);
        }

        // Update link lines
        links.forEach(link => {
          const line = activeSvg.querySelector(`#link-${link.source}`);
          const sourceNode = nodes.find(n => n.id === link.source);
          const targetNode = nodes.find(n => n.id === link.target);
          if (line && sourceNode && targetNode) {
            line.setAttribute('x1', sourceNode.x);
            line.setAttribute('y1', sourceNode.y);
            line.setAttribute('x2', targetNode.x);
            line.setAttribute('y2', targetNode.y);
          }
        });

        // Update node circle and label placements
        const svgGroups = activeSvg.querySelectorAll('.graph-node-group');
        svgGroups.forEach((g, idx) => {
          const node = nodes[idx];
          const circle = g.querySelector('circle');
          const text = g.querySelector('text');
          
          if (circle && text && node) {
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);

            let tX = node.x;
            let tY = node.y;
            if (node.isCurrent) {
              tY = node.y + (circle.getAttribute('r') || 8) + 13;
            } else {
              const angle = node.angle;
              const labelOffset = 13;
              tX = node.x + labelOffset * Math.cos(angle);
              tY = node.y + labelOffset * Math.sin(angle) + 4;
            }
            text.setAttribute('x', tX);
            text.setAttribute('y', tY);
          }
        });
      }
    });
  }

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
  }

  // --- Service Worker Registration for offline support ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('sw.js registrert.'))
        .catch(err => console.error('sw.js feilet:', err));
    });
  }
});
