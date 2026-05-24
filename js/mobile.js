/* js/mobile.js */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const mobileGrid = document.getElementById('mobile-grid');
  const mobileTime = document.getElementById('mobile-time');
  const mobileDate = document.getElementById('mobile-date');
  const mobileCategoryTitle = document.getElementById('mobile-category-title');
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabHomeCategory = document.getElementById('tab-home-category');
  const tabLockIndicator = document.getElementById('tab-lock-indicator');
  
  const pinVaultOverlay = document.getElementById('pin-vault-overlay');
  const vaultCloseBtn = document.getElementById('vault-close-btn');
  const keypadButtons = document.querySelectorAll('.pin-keypad .keypad-btn[data-val]');
  const keypadClear = document.getElementById('keypad-clear');
  const keypadDelete = document.getElementById('keypad-delete');
  const vaultLockSvg = document.getElementById('vault-lock-svg');

  let activeTab = 'all';

  // 1. Mobile Time & Date Update
  function updateMobileClock() {
    const now = new Date();
    
    // Time format HH:MM
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    mobileTime.textContent = `${hours}:${minutes}`;
    
    // Date format Korean (compact: e.g., 5월 24일 일요일)
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const day = weekDays[now.getDay()];
    
    mobileDate.textContent = `${month}월 ${date}일 ${day}`;
  }
  
  setInterval(updateMobileClock, 1000);
  updateMobileClock(); // Run immediately

  // 2. Render Project Cards for Mobile
  function renderMobileProjects() {
    mobileGrid.innerHTML = '';
    
    const filtered = AppState.projects.filter(project => {
      // Category tab match
      const categoryMatch = activeTab === 'all' || 
                            (activeTab === 'finance' && (project.category === 'finance' || project.category === 'lifestyle')) ||
                            (activeTab === 'education' && project.category === 'education') ||
                            (activeTab === 'home' && (project.category === 'home' || project.category === 'family'));
      
      // Access check
      if (project.isPrivate) {
        return categoryMatch && AppState.vault.isUnlocked;
      }
      return categoryMatch;
    });

    if (filtered.length === 0) {
      mobileGrid.innerHTML = `
        <div class="glass-panel" style="padding: 2.5rem 1.5rem; text-align: center; color: var(--color-text-secondary); border-radius: 16px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:0.75rem; opacity:0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p style="font-size:0.85rem;">보안 잠금 상태이거나 프로젝트가 없습니다.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(project => {
      const card = document.createElement('a');
      card.href = project.url;
      card.target = '_blank';
      
      // Left vertical border based on category
      let categoryClass = 'cat-finance';
      if (project.category === 'finance') categoryClass = 'cat-finance';
      else if (project.category === 'lifestyle') categoryClass = 'cat-lifestyle';
      else if (project.category === 'education') categoryClass = 'cat-education';
      else if (project.category === 'health') categoryClass = 'cat-health';
      else if (project.category === 'home' || project.category === 'family') categoryClass = 'cat-private';
      
      card.className = `mobile-card glass-panel ${categoryClass}`;
      
      // Theme colors
      let accentColor = 'var(--accent-cyan)';
      if (project.category === 'finance') accentColor = 'var(--accent-cyan)';
      else if (project.category === 'lifestyle') accentColor = 'var(--accent-magenta)';
      else if (project.category === 'education') accentColor = 'var(--accent-purple)';
      else if (project.category === 'health') accentColor = 'var(--accent-yellow)';
      else if (project.category === 'home' || project.category === 'family') accentColor = 'var(--accent-red)';
      
      card.style.setProperty('--accent-color', accentColor);
      
      const iconSvg = SVGIcons[project.iconTheme] || SVGIcons.home;
      
      card.innerHTML = `
        <div class="mobile-card-icon">${iconSvg}</div>
        <div class="mobile-card-info">
          <h3 class="mobile-card-title">${project.name}</h3>
          <p class="mobile-card-desc">${project.description}</p>
        </div>
        <div class="mobile-card-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      `;

      // Intercept click if there are subLinks
      if (project.subLinks && project.subLinks.length > 0) {
        card.href = '#';
        card.removeAttribute('target');
        card.addEventListener('click', (e) => {
          e.preventDefault();
          openSublinkDrawer(project);
        });
      }

      mobileGrid.appendChild(card);
    });
  }

  // Sub-link Drawer Actions
  const sublinkModal = document.getElementById('sublink-modal');
  const sublinkCloseBtn = document.getElementById('sublink-close-btn');
  const sublinkModalTitle = document.getElementById('sublink-modal-title');
  const sublinkModalSubtitle = document.getElementById('sublink-modal-subtitle');
  const sublinksContainer = document.getElementById('sublinks-container');

  function openSublinkDrawer(project) {
    sublinkModalTitle.textContent = `${project.name} 선택 이동`;
    sublinkModalSubtitle.textContent = project.description;
    sublinksContainer.innerHTML = '';

    project.subLinks.forEach(sub => {
      const subCard = document.createElement('a');
      subCard.href = sub.url;
      subCard.target = '_blank';
      subCard.className = 'sublink-item glass-panel';
      
      let accentColor = 'var(--accent-cyan)';
      let iconSvg = SVGIcons[sub.icon] || SVGIcons.home;
      if (sub.icon === 'health') {
        accentColor = 'var(--accent-yellow)';
      } else if (sub.icon === 'stock') {
        accentColor = 'var(--accent-cyan)';
      }
      
      subCard.style.setProperty('--accent-color', accentColor);
      subCard.innerHTML = `
        <div class="sublink-icon-box" style="--accent-color: ${accentColor}">${iconSvg}</div>
        <div style="flex-grow:1;">
          <h4 style="margin:0; font-size:0.95rem; color:#fff; font-weight:700;">${sub.name}</h4>
          <p style="margin:0.15rem 0 0; font-size:0.75rem; color:var(--color-text-secondary); line-height:1.3; font-weight:500;">${sub.description}</p>
        </div>
        <div style="color:var(--color-text-muted);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      `;
      
      subCard.addEventListener('click', () => {
        setTimeout(closeSublinkDrawer, 300);
      });

      sublinksContainer.appendChild(subCard);
    });

    sublinkModal.classList.add('active');
  }

  function closeSublinkDrawer() {
    sublinkModal.classList.remove('active');
  }

  sublinkCloseBtn.addEventListener('click', closeSublinkDrawer);

  // 3. Tab Bar Click Event
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      if (targetTab === 'home' && !AppState.vault.isUnlocked) {
        // Automatically prompt PIN bottom drawer if click locked category
        openVaultDrawer();
        return;
      }

      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      activeTab = targetTab;
      
      // Update header category title
      if (activeTab === 'all') mobileCategoryTitle.textContent = '모든 서비스';
      else if (activeTab === 'finance') mobileCategoryTitle.textContent = '금융 및 핫딜';
      else if (activeTab === 'education') mobileCategoryTitle.textContent = '교육 및 파닉스';
      else if (activeTab === 'home') mobileCategoryTitle.textContent = '가족 및 스마트 홈';
      
      renderMobileProjects();
    });
  });

  // 4. Secure Vault Bottom Sheet Actions
  function openVaultDrawer() {
    pinVaultOverlay.classList.add('active');
    AppState.clearPin();
  }
  
  function closeVaultDrawer() {
    pinVaultOverlay.classList.remove('active');
    AppState.clearPin();
  }

  // Open drawer if they click/tap lock indicator on the home tab
  tabHomeCategory.addEventListener('click', () => {
    if (AppState.vault.isUnlocked) {
      // Toggle back to lock immediately if already unlocked
      AppState.lockVault();
    } else {
      openVaultDrawer();
    }
  });

  vaultCloseBtn.addEventListener('click', closeVaultDrawer);

  // Keypad inputs
  keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      AppState.enterPinDigit(val);
    });
  });

  keypadClear.addEventListener('click', () => AppState.clearPin());
  keypadDelete.addEventListener('click', () => AppState.deletePinDigit());

  // Setup callbacks when AppState unlocks/locks on mobile
  AppState.onUnlock(() => {
    tabLockIndicator.textContent = '🔓';
    tabLockIndicator.classList.add('unlocked');
    vaultLockSvg.innerHTML = SVGIcons.unlock;

    closeVaultDrawer();

    // Auto navigate to home category on successful unlock
    activeTab = 'home';
    navTabs.forEach(t => t.classList.remove('active'));
    tabHomeCategory.classList.add('active');
    mobileCategoryTitle.textContent = '가족 및 스마트 홈';

    renderMobileProjects();
  });

  AppState.onLock(() => {
    tabLockIndicator.textContent = '🔒';
    tabLockIndicator.classList.remove('unlocked');
    vaultLockSvg.innerHTML = SVGIcons.lock;

    // Fallback if current active category was private
    if (activeTab === 'home') {
      activeTab = 'all';
      navTabs.forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="all"]').classList.add('active');
      mobileCategoryTitle.textContent = '모든 서비스';
    }

    renderMobileProjects();
  });

  // Init Project rendering on load
  renderMobileProjects();
});
