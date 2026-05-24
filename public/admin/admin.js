/* ==========================================================================
   ADMIN PANEL ENGINE - SECURE CLIENT-SIDE GITHUB REST API CLIENT
   ========================================================================== */

const GITHUB_OWNER = 'MiDNiT';
const GITHUB_REPO = 'dentammebever';
const GITHUB_BRANCH = 'main';
const BASE_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

// Application State
let GITHUB_PAT = '';
let currentNote = {
  name: '',         // Filename like 'min-post.md'
  sha: '',          // GitHub file SHA (empty for new files)
  isNew: true,      // New note or modifying existing
  tags: []          // List of current tags
};
let allNotes = [];    // Cached list of notes fetched from GitHub

// DOM Elements
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const patInput = document.getElementById('pat-input');
const loginBtn = document.getElementById('login-btn');
const loginSpinner = document.getElementById('login-spinner');
const loginError = document.getElementById('login-error');

const accordionToggle = document.getElementById('accordion-toggle');
const accordion = accordionToggle.parentElement;

const logoutBtn = document.getElementById('logout-btn');
const newNoteBtn = document.getElementById('new-note-btn');
const searchInput = document.getElementById('search-input');
const notesList = document.getElementById('notes-list');
const notesSpinner = document.getElementById('notes-spinner');
const notesError = document.getElementById('notes-error');

const currentNoteFilename = document.getElementById('current-note-filename');
const currentNoteStatusBadge = document.getElementById('current-note-status-badge');
const writeTabBtn = document.getElementById('write-tab-btn');
const previewTabBtn = document.getElementById('preview-tab-btn');
const saveDraftBtn = document.getElementById('save-draft-btn');
const publishBtn = document.getElementById('publish-btn');
const draftSpinner = document.getElementById('draft-spinner');
const publishSpinner = document.getElementById('publish-spinner');
const notification = document.getElementById('notification');

const editPane = document.getElementById('edit-pane');
const previewPane = document.getElementById('preview-pane');

const noteTitle = document.getElementById('note-title');
const noteDate = document.getElementById('note-date');
const noteDesc = document.getElementById('note-desc');
const noteCategory = document.getElementById('note-category');
const tagsWrapper = document.getElementById('tags-wrapper');
const tagsChipsContainer = document.getElementById('tags-chips-container');
const tagsInput = document.getElementById('tags-input');
const markdownBody = document.getElementById('markdown-body');

// Preview DOM elements
const previewTitle = document.getElementById('preview-title');
const previewDesc = document.getElementById('preview-desc');
const previewMetaCategory = document.getElementById('preview-meta-category');
const previewMetaDate = document.getElementById('preview-meta-date');
const previewTagsContainer = document.getElementById('preview-tags-container');
const previewContent = document.getElementById('preview-content');

/* ==========================================================================
   INITIALIZATION & AUTHENTICATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check for stored PAT
  const storedPat = localStorage.getItem('bever_pat');
  if (storedPat) {
    GITHUB_PAT = storedPat;
    validateToken(storedPat)
      .then(isValid => {
        if (isValid) {
          showView('app');
          loadNotes();
          resetEditor();
        } else {
          localStorage.removeItem('bever_pat');
          showView('login');
        }
      })
      .catch(() => {
        // Network error, show login anyway
        showView('login');
      });
  } else {
    showView('login');
  }
});

// Accordion toggle handler
accordionToggle.addEventListener('click', () => {
  accordion.classList.toggle('open');
});

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pat = patInput.value.trim();
  if (!pat) return;

  setLoginLoading(true);
  loginError.classList.add('hide');

  try {
    const isValid = await validateToken(pat);
    if (isValid) {
      GITHUB_PAT = pat;
      localStorage.setItem('bever_pat', pat);
      showView('app');
      await loadNotes();
      resetEditor();
    } else {
      showError(loginError, 'Ugyldig Personal Access Token (PAT). Vennligst sjekk at tokenet er riktig og har "repo"-tilgang.');
    }
  } catch (err) {
    showError(loginError, `Kunne ikke koble til GitHub API: ${err.message}`);
  } finally {
    setLoginLoading(false);
  }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
  if (confirm('Er du sikker på at du vil logge ut? Dette sletter lagret token fra denne nettleseren.')) {
    localStorage.removeItem('bever_pat');
    GITHUB_PAT = '';
    showView('login');
  }
});

async function validateToken(token) {
  try {
    const res = await fetch(BASE_API_URL, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return res.status === 200;
  } catch (err) {
    console.error('Token validation error:', err);
    throw err;
  }
}

function showView(view) {
  if (view === 'login') {
    loginView.classList.remove('hide');
    appView.classList.add('hide');
  } else {
    loginView.classList.add('hide');
    appView.classList.remove('hide');
  }
}

function setLoginLoading(isLoading) {
  if (isLoading) {
    loginBtn.setAttribute('disabled', 'true');
    loginSpinner.style.display = 'block';
  } else {
    loginBtn.removeAttribute('disabled');
    loginSpinner.style.display = 'none';
  }
}

function showError(element, msg) {
  element.innerText = msg;
  element.classList.remove('hide');
}

/* ==========================================================================
   SIDEBAR & SEARCH LIST LOGIC
   ========================================================================== */

async function loadNotes() {
  notesSpinner.style.display = 'flex';
  notesError.classList.add('hide');
  notesList.innerHTML = '';

  try {
    const res = await fetch(`${BASE_API_URL}/contents/content/garden?ref=${GITHUB_BRANCH}`, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      throw new Error(`Feilkode ${res.status} ved henting av filer.`);
    }

    const files = await res.json();
    // Only load markdown files
    const mdFiles = files.filter(f => f.name.endsWith('.md') && f.type === 'file');
    
    // Fetch and parse all files concurrently to show their draft/published status
    allNotes = await Promise.all(mdFiles.map(async (file) => {
      const parsed = await fetchAndParseFile(file.name, file.sha);
      return {
        name: file.name,
        sha: file.sha,
        title: parsed.metadata.title || file.name,
        draft: parsed.metadata.draft,
        parsedData: parsed
      };
    }));

    renderNotesList(allNotes);
  } catch (err) {
    showError(notesError, `Klarte ikke å hente notater: ${err.message}`);
  } finally {
    notesSpinner.style.display = 'none';
  }
}

// Fetch a single file and parse its TOML frontmatter
async function fetchAndParseFile(filename, sha) {
  const res = await fetch(`${BASE_API_URL}/contents/content/garden/${filename}?ref=${GITHUB_BRANCH}`, {
    headers: {
      'Authorization': `token ${GITHUB_PAT}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!res.ok) {
    throw new Error(`Feil ved henting av ${filename}`);
  }

  const fileData = await res.json();
  const rawContent = decodeBase64Utf8(fileData.content);
  return parseZolaMarkdown(rawContent);
}

function renderNotesList(notes) {
  notesList.innerHTML = '';
  if (notes.length === 0) {
    notesList.innerHTML = '<li class="note-item-empty">Ingen notater funnet</li>';
    return;
  }

  notes.forEach(note => {
    const li = document.createElement('li');
    li.className = `note-item glass ${currentNote.name === note.name ? 'active' : ''}`;
    li.dataset.name = note.name;
    
    const badgeClass = note.draft ? 'badge-draft' : 'badge-published';
    const badgeText = note.draft ? 'Kladd' : 'Publisert';

    li.innerHTML = `
      <div class="note-item-header">
        <span class="note-item-title" title="${escapeHtml(note.title)}">${escapeHtml(note.title)}</span>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="note-item-meta">
        <span>${escapeHtml(note.name)}</span>
      </div>
    `;

    li.addEventListener('click', () => selectNote(note));
    notesList.appendChild(li);
  });
}

// Search filtration
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = allNotes.filter(note => 
    note.title.toLowerCase().includes(query) || 
    note.name.toLowerCase().includes(query)
  );
  renderNotesList(filtered);
});

/* ==========================================================================
   TOML PARSER & SERIALIZER LOGIC
   ========================================================================== */

function parseZolaMarkdown(rawText) {
  const parts = rawText.split('+++');
  if (parts.length < 3) {
    // No frontmatter found, return empty metadata and full text as body
    return {
      metadata: { title: '', description: '', date: '', category: '', draft: true },
      body: rawText
    };
  }

  const frontmatterRaw = parts[1];
  const body = parts.slice(2).join('+++').trim(); // Join back in case body contains +++

  // Parse frontmatter line by line
  const lines = frontmatterRaw.split('\n');
  const metadata = {
    title: '',
    description: '',
    date: '',
    category: '',
    tags: [],
    draft: false
  };

  let inTaxonomies = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    if (trimmed === '[taxonomies]') {
      inTaxonomies = true;
      return;
    }

    // Match standard key = value
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) return;

    const key = match[1].trim();
    const valueRaw = match[2].trim();

    // Helper to strip quotes
    const stripQuotes = (str) => {
      const s = str.trim();
      if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        return s.slice(1, -1);
      }
      return s;
    };

    if (!inTaxonomies) {
      if (key === 'title') metadata.title = stripQuotes(valueRaw);
      else if (key === 'description') metadata.description = stripQuotes(valueRaw);
      else if (key === 'date') metadata.date = stripQuotes(valueRaw);
      else if (key === 'draft') metadata.draft = valueRaw === 'true';
    } else {
      if (key === 'categories') {
        // Parse array ["Category"] or ['Category']
        const arrMatch = valueRaw.match(/\[(.*)\]/);
        if (arrMatch) {
          const items = arrMatch[1].split(',').map(item => stripQuotes(item.trim())).filter(Boolean);
          if (items.length > 0) metadata.category = items[0];
        }
      } else if (key === 'tags') {
        // Parse array ["tag1", "tag2"]
        const arrMatch = valueRaw.match(/\[(.*)\]/);
        if (arrMatch) {
          metadata.tags = arrMatch[1].split(',').map(item => stripQuotes(item.trim())).filter(Boolean);
        }
      }
    }
  });

  return { metadata, body };
}

function serializeNote(metadata, body) {
  const tagsString = metadata.tags.map(t => `"${escapeString(t.trim())}"`).join(', ');
  const draftVal = metadata.draft ? 'true' : 'false';
  
  return `+++
title = "${escapeString(metadata.title)}"
description = "${escapeString(metadata.description)}"
date = ${metadata.date}
draft = ${draftVal}

[taxonomies]
categories = ["${escapeString(metadata.category)}"]
tags = [${tagsString}]
+++
${body}`;
}

function escapeString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/* ==========================================================================
   TAG CHIPS COMPONENT
   ========================================================================== */

function renderTagsChips() {
  tagsChipsContainer.innerHTML = '';
  currentNote.tags.forEach((tag, idx) => {
    const chip = document.createElement('div');
    chip.className = 'chip glass-dark';
    chip.innerHTML = `
      <span>${escapeHtml(tag)}</span>
      <button type="button" class="chip-delete" onclick="deleteTag(${idx})">×</button>
    `;
    tagsChipsContainer.appendChild(chip);
  });
}

function addTag(tag) {
  const cleanTag = tag.trim().toLowerCase().replace(/[^\wæøå\-\s]/gi, '');
  if (!cleanTag) return;
  
  if (!currentNote.tags.includes(cleanTag)) {
    currentNote.tags.push(cleanTag);
    renderTagsChips();
  }
  tagsInput.value = '';
}

// Window globally scoped function for tag deletion
window.deleteTag = function(idx) {
  currentNote.tags.splice(idx, 1);
  renderTagsChips();
};

tagsInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTag(tagsInput.value);
  }
});

tagsInput.addEventListener('blur', () => {
  addTag(tagsInput.value);
});

// Click wrapper to focus input
tagsWrapper.addEventListener('click', (e) => {
  if (e.target === tagsWrapper || e.target === tagsChipsContainer) {
    tagsInput.focus();
  }
});

/* ==========================================================================
   EDITOR NAVIGATION & WORKFLOW
   ========================================================================== */

newNoteBtn.addEventListener('click', () => {
  resetEditor();
});

function resetEditor() {
  currentNote = {
    name: '',
    sha: '',
    isNew: true,
    tags: []
  };

  currentNoteFilename.innerText = 'ny-artikkel.md';
  currentNoteStatusBadge.className = 'badge badge-new';
  currentNoteStatusBadge.innerText = 'Nytt notat';

  noteTitle.value = '';
  noteDate.value = getTodayDateString();
  noteDesc.value = '';
  noteCategory.value = '';
  markdownBody.value = '';

  renderTagsChips();
  switchTab('write');
  
  // Highlight currently selected note in sidebar list (none should be highlighted)
  document.querySelectorAll('.note-item').forEach(el => el.classList.remove('active'));
}

async function selectNote(note) {
  resetEditor();
  currentNoteFilename.innerText = note.name;
  
  const badgeClass = note.draft ? 'badge-draft' : 'badge-published';
  const badgeText = note.draft ? 'Kladd' : 'Publisert';
  currentNoteStatusBadge.className = `badge ${badgeClass}`;
  currentNoteStatusBadge.innerText = badgeText;

  currentNote.name = note.name;
  currentNote.sha = note.sha;
  currentNote.isNew = false;
  currentNote.tags = note.parsedData.metadata.tags || [];

  noteTitle.value = note.parsedData.metadata.title || '';
  noteDate.value = note.parsedData.metadata.date || getTodayDateString();
  noteDesc.value = note.parsedData.metadata.description || '';
  noteCategory.value = note.parsedData.metadata.category || '';
  markdownBody.value = note.parsedData.body || '';

  renderTagsChips();
  
  // Active class in list
  document.querySelectorAll('.note-item').forEach(el => {
    if (el.dataset.name === note.name) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// Swappable Tabs
writeTabBtn.addEventListener('click', () => switchTab('write'));
previewTabBtn.addEventListener('click', () => {
  switchTab('preview');
  renderLivePreview();
});

function switchTab(tab) {
  if (tab === 'write') {
    writeTabBtn.classList.add('active');
    previewTabBtn.classList.remove('active');
    editPane.classList.add('active');
    previewPane.classList.remove('active');
  } else {
    writeTabBtn.classList.remove('active');
    previewTabBtn.classList.add('active');
    editPane.classList.remove('active');
    previewPane.classList.add('active');
  }
}

function renderLivePreview() {
  previewTitle.innerText = noteTitle.value || 'Uten tittel';
  previewDesc.innerText = noteDesc.value || 'Ingen introduksjon...';
  previewMetaCategory.innerText = (noteCategory.value || 'KATEGORI').toUpperCase();
  previewMetaDate.innerText = formatDateString(noteDate.value);

  // Render Tags
  previewTagsContainer.innerHTML = '';
  currentNote.tags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'preview-tag-chip';
    chip.innerText = `#${tag}`;
    previewTagsContainer.appendChild(chip);
  });

  // Compile Markdown to HTML
  const markdownText = markdownBody.value || '_Skriv litt innhold for å se forhåndsvisningen..._';
  previewContent.innerHTML = marked.parse(markdownText);
}

/* ==========================================================================
   SAVE AND PUBLISH ACTIONS (PUT TO GITHUB)
   ========================================================================== */

saveDraftBtn.addEventListener('click', () => saveNoteAction(true));
publishBtn.addEventListener('click', () => saveNoteAction(false));

async function saveNoteAction(isDraft) {
  const title = noteTitle.value.trim();
  const desc = noteDesc.value.trim();
  const date = noteDate.value;
  const category = noteCategory.value.trim();
  const body = markdownBody.value;

  if (!title || !desc || !date || !category) {
    showToast('Feil: Fyll ut alle strukturerte felt (Tittel, Dato, Beskrivelse, Kategori)', true);
    return;
  }

  // Set action loading
  setSaveLoading(isDraft, true);

  // Determine filename
  let filename = currentNote.name;
  if (!filename) {
    filename = slugify(title) + '.md';
  }

  const metadata = {
    title,
    description: desc,
    date,
    category,
    tags: currentNote.tags,
    draft: isDraft
  };

  const serializedContent = serializeNote(metadata, body);
  const base64Content = encodeUtf8Base64(serializedContent);
  const commitMsg = currentNote.isNew 
    ? `Opprettet artikkel: "${title}" (${isDraft ? 'Kladd' : 'Publisert'})` 
    : `Oppdatert artikkel: "${title}" (${isDraft ? 'Kladd' : 'Publisert'})`;

  const payload = {
    message: commitMsg,
    content: base64Content,
    branch: GITHUB_BRANCH
  };

  // If modifying, provide file SHA
  if (!currentNote.isNew && currentNote.sha) {
    payload.sha = currentNote.sha;
  }

  try {
    const res = await fetch(`${BASE_API_URL}/contents/content/garden/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      throw new Error(errorResponse.message || `API error ${res.status}`);
    }

    const resData = await res.json();
    
    // Success: update state
    currentNote.name = filename;
    currentNote.sha = resData.content.sha;
    currentNote.isNew = false;

    showToast(isDraft ? 'Utkast ble lagret trygt!' : 'Artikkelen ble publisert live!', false);

    // Refresh list and reload active node
    await loadNotes();
    
    // Re-highlight list element
    document.querySelectorAll('.note-item').forEach(el => {
      if (el.dataset.name === filename) {
        el.classList.add('active');
      }
    });

    // Update status badge
    currentNoteFilename.innerText = filename;
    const badgeClass = isDraft ? 'badge-draft' : 'badge-published';
    const badgeText = isDraft ? 'Kladd' : 'Publisert';
    currentNoteStatusBadge.className = `badge ${badgeClass}`;
    currentNoteStatusBadge.innerText = badgeText;

  } catch (err) {
    showToast(`Kunne ikke lagre: ${err.message}`, true);
  } finally {
    setSaveLoading(isDraft, false);
  }
}

function setSaveLoading(isDraft, isLoading) {
  if (isDraft) {
    if (isLoading) {
      saveDraftBtn.setAttribute('disabled', 'true');
      draftSpinner.classList.add('loading');
    } else {
      saveDraftBtn.removeAttribute('disabled');
      draftSpinner.classList.remove('loading');
    }
  } else {
    if (isLoading) {
      publishBtn.setAttribute('disabled', 'true');
      publishSpinner.classList.add('loading');
    } else {
      publishBtn.removeAttribute('disabled');
      publishSpinner.classList.remove('loading');
    }
  }
}

function showToast(msg, isError) {
  notification.innerText = msg;
  notification.className = `notification-toast show ${isError ? 'error' : ''}`;
  setTimeout(() => {
    notification.classList.remove('show');
  }, 4000);
}

/* ==========================================================================
   SUPPORT UTILS
   ========================================================================== */

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  let month = (d.getMonth() + 1).toString().padStart(2, '0');
  let day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateString(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`; // Norwegian style dd.mm.yyyy
  }
  return dateStr;
}

// Convert string to URL-friendly filename
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\wæøå\-]+/g, '')    // Remove non-word characters except dashes and Norwegian letters
    .replace(/\-\-+/g, '-')         // Replace multiple dashes with single
    .replace(/^-+/, '')             // Trim leading dashes
    .replace(/-+$/, '');            // Trim trailing dashes
}

// Safe base64 encodings/decodings supporting Norwegian UTF-8 characters
function encodeUtf8Base64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64Utf8(base64) {
  // Strip white spaces and newlines
  const clean = base64.replace(/\s/g, '');
  return decodeURIComponent(escape(atob(clean)));
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
