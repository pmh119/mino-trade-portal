/* js/desktop.js */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const desktopGrid = document.getElementById('desktop-grid');
  const clockDisplay = document.getElementById('clock-display');
  const dateDisplay = document.getElementById('date-display');
  const currentCategoryTitle = document.getElementById('current-category-title');
  const navItems = document.querySelectorAll('.nav-item');
  const navHomeCategory = document.getElementById('nav-home-category');
  
  const vaultTriggerBtn = document.getElementById('vault-trigger-btn');
  const vaultStatusLabel = document.getElementById('vault-status-label');
  const lockBadgeIcon = document.getElementById('lock-badge-icon');
  
  const pinVaultOverlay = document.getElementById('pin-vault-overlay');
  const vaultCloseBtn = document.getElementById('vault-close-btn');
  const keypadButtons = document.querySelectorAll('.pin-keypad .keypad-btn[data-val]');
  const keypadClear = document.getElementById('keypad-clear');
  const keypadDelete = document.getElementById('keypad-delete');
  const vaultLockSvg = document.getElementById('vault-lock-svg');
  
  const quickMemoPad = document.getElementById('quick-memo-pad');
  const memoSavedIndicator = document.getElementById('memo-saved');

  let activeCategory = 'all';

  // 1. Digital Clock & Date Update
  function updateClock() {
    const now = new Date();
    
    // Time format HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Date format Korean
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const day = weekDays[now.getDay()];
    
    dateDisplay.textContent = `${year}년 ${month}월 ${date}일 ${day}`;
  }
  
  setInterval(updateClock, 1000);
  updateClock(); // Run immediately

  // 2. Render Project Cards
  function renderProjects() {
    desktopGrid.innerHTML = '';
    
    const filtered = AppState.projects.filter(project => {
      // Category filter match
      const categoryMatch = activeCategory === 'all' || 
                            (activeCategory === 'finance' && (project.category === 'finance' || project.category === 'lifestyle')) ||
                            (activeCategory === 'education' && project.category === 'education') ||
                            (activeCategory === 'home' && (project.category === 'home' || project.category === 'family'));
      
      // Access check
      if (project.isPrivate) {
        return categoryMatch && AppState.vault.isUnlocked;
      }
      return categoryMatch;
    });

    if (filtered.length === 0) {
      desktopGrid.innerHTML = `
        <div class="glass-panel" style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--color-text-secondary);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:1rem; opacity:0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>등록된 프로젝트가 없거나 보안 잠금 상태입니다.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(project => {
      const card = document.createElement('a');
      card.href = project.url;
      card.target = '_blank';
      card.className = `project-card glass-panel ${project.isPrivate ? 'private-item' : ''}`;
      
      // Determine CSS variable themes based on category for gorgeous visual separation
      let accentColor = 'var(--accent-cyan)';
      let accentRGB = 'var(--accent-cyan-rgb)';
      let tagClass = 'tag-finance';
      let tagLabel = project.category;
      
      if (project.category === 'finance') {
        accentColor = 'var(--accent-cyan)';
        accentRGB = 'var(--accent-cyan-rgb)';
        tagClass = 'tag-finance';
        tagLabel = 'Finance';
      } else if (project.category === 'lifestyle') {
        accentColor = 'var(--accent-magenta)';
        accentRGB = 'var(--accent-magenta-rgb)';
        tagClass = 'tag-lifestyle';
        tagLabel = 'Hot Deal';
      } else if (project.category === 'education') {
        accentColor = 'var(--accent-purple)';
        accentRGB = 'var(--accent-purple-rgb)';
        tagClass = 'tag-education';
        tagLabel = 'Education';
      } else if (project.category === 'health') {
        accentColor = 'var(--accent-yellow)';
        accentRGB = 'var(--accent-yellow-rgb)';
        tagClass = 'tag-health';
        tagLabel = 'Health';
      } else if (project.category === 'home' || project.category === 'family') {
        accentColor = 'var(--accent-magenta)';
        accentRGB = 'var(--accent-magenta-rgb)';
        tagClass = 'tag-private';
        tagLabel = project.category === 'family' ? 'Family' : 'Smart Home';
      }
      
      card.style.setProperty('--accent-color', accentColor);
      card.style.setProperty('--accent-rgb', accentRGB);

      const iconSvg = SVGIcons[project.iconTheme] || SVGIcons.home;
      
      card.innerHTML = `
        <div class="card-top">
          <div class="card-icon">${iconSvg}</div>
          <span class="tag ${tagClass}">${tagLabel}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${project.name}</h3>
          <p class="card-desc">${project.description}</p>
        </div>
        <div class="card-bottom">
          <span>접속하기</span>
          <svg class="card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
      `;

      // Glow effect tracking mouse coordinates
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      desktopGrid.appendChild(card);
    });
  }

  // 3. Category Nav Item clicks
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetCategory = item.getAttribute('data-category');
      
      if (targetCategory === 'home' && !AppState.vault.isUnlocked) {
        // Automatically prompt PIN input if they click Smart Home while locked
        openVaultModal();
        return;
      }

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      activeCategory = targetCategory;
      
      // Update heading text
      if (activeCategory === 'all') currentCategoryTitle.textContent = '모든 프로젝트';
      else if (activeCategory === 'finance') currentCategoryTitle.textContent = '금융 및 핫딜';
      else if (activeCategory === 'education') currentCategoryTitle.textContent = '교육 및 키즈';
      else if (activeCategory === 'home') currentCategoryTitle.textContent = '가족 및 스마트 홈';
      
      renderProjects();
    });
  });

  // 4. Secure Vault Trigger Interactions
  function openVaultModal() {
    pinVaultOverlay.classList.add('active');
    AppState.clearPin();
  }
  
  function closeVaultModal() {
    pinVaultOverlay.classList.remove('active');
    AppState.clearPin();
  }

  vaultTriggerBtn.addEventListener('click', () => {
    if (AppState.vault.isUnlocked) {
      // Lock immediately
      AppState.lockVault();
    } else {
      openVaultModal();
    }
  });

  vaultCloseBtn.addEventListener('click', closeVaultModal);

  // Keypad button listeners
  keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      AppState.enterPinDigit(val);
    });
  });

  keypadClear.addEventListener('click', () => AppState.clearPin());
  keypadDelete.addEventListener('click', () => AppState.deletePinDigit());

  // Setup callbacks when AppState unlocks/locks
  AppState.onUnlock(() => {
    // UI states
    vaultTriggerBtn.classList.add('unlocked');
    vaultStatusLabel.textContent = '보안 해제 상태';
    vaultStatusLabel.className = 'security-status-value unlocked';
    
    // Change lock icon to open padlock
    lockBadgeIcon.classList.add('unlocked');
    lockBadgeIcon.innerHTML = SVGIcons.unlock;
    vaultLockSvg.innerHTML = SVGIcons.unlock;
    
    // Remove nav lock emoji
    const lockIndicator = navHomeCategory.querySelector('.nav-lock-indicator');
    if (lockIndicator) lockIndicator.textContent = '🔓';

    // Auto navigate to home if they unlocked to view it
    if (pinVaultOverlay.classList.contains('active')) {
      closeVaultModal();
    }
    
    renderProjects();
  });

  AppState.onLock(() => {
    // UI states
    vaultTriggerBtn.classList.remove('unlocked');
    vaultStatusLabel.textContent = '보안 잠금 상태';
    vaultStatusLabel.className = 'security-status-value locked';
    
    lockBadgeIcon.classList.remove('unlocked');
    lockBadgeIcon.innerHTML = SVGIcons.lock;
    vaultLockSvg.innerHTML = SVGIcons.lock;
    
    const lockIndicator = navHomeCategory.querySelector('.nav-lock-indicator');
    if (lockIndicator) lockIndicator.textContent = '🔒';

    // Safe fallback if category was private
    if (activeCategory === 'home') {
      activeCategory = 'all';
      navItems.forEach(nav => nav.classList.remove('active'));
      document.querySelector('[data-category="all"]').classList.add('active');
      currentCategoryTitle.textContent = '모든 프로젝트';
    }

    renderProjects();
  });

  // 5. Quick Memo Pad autosave
  let saveTimeout;
  const savedMemo = localStorage.getItem('mino_desktop_memo');
  if (savedMemo) {
    quickMemoPad.value = savedMemo;
    memoSavedIndicator.classList.add('saved');
    memoSavedIndicator.textContent = 'Saved';
  }

  quickMemoPad.addEventListener('input', () => {
    memoSavedIndicator.classList.remove('saved');
    memoSavedIndicator.classList.add('saving');
    memoSavedIndicator.textContent = 'Saving...';
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem('mino_desktop_memo', quickMemoPad.value);
      memoSavedIndicator.classList.remove('saving');
      memoSavedIndicator.classList.add('saved');
      memoSavedIndicator.textContent = 'Saved';
    }, 800);
  });

  // Init Project rendering
  renderProjects();
});
