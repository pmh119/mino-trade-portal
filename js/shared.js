/* js/shared.js */

// Global App Configuration and State
const AppState = {
  // Project Definitions
  projects: [
    {
      id: 'family-board',
      name: '가족게시판',
      category: 'family',
      url: 'https://sites.google.com/view/minoga0', 
      description: '소중한 가족 일정, 공지사항 및 방명록 라운지',
      isPrivate: true,
      iconTheme: 'family'
    },
    {
      id: 'wallpad',
      name: '월패드',
      category: 'home',
      url: 'http://localhost:5173', 
      description: '로컬 가옥 모니터링, 전등 및 온도 스마트 제어 (KDOne Dashboard)',
      isPrivate: true,
      iconTheme: 'home'
    },
    {
      id: 'fridge',
      name: '냉장고',
      category: 'home',
      url: 'http://localhost:5174',
      description: '냉장실/냉동실 식재료 보관 현황 및 유통기한 스마트 관리',
      isPrivate: true,
      iconTheme: 'fridge'
    },
    {
      id: 'chore',
      name: '집안일',
      category: 'home',
      url: 'https://script.google.com/macros/s/AKfycbxq3heQP0akpcE3UKuibadk5_rcFepbYpDbQnSdjG2VLxzLR2TPK13EqR5tJNeWxE2N/exec?page=가족 라운지',
      description: '구역별 일일 집안일 체크리스트 및 가족 구성원 분담 현황',
      isPrivate: true,
      iconTheme: 'chore'
    },
    {
      id: 'stock',
      name: '주식스크린',
      category: 'finance',
      url: 'https://stock.mino.trade',
      description: '국내외 주요 지수, 환율 및 개인 관심 종목 실시간 스크린 대시보드',
      isPrivate: false,
      iconTheme: 'stock'
    },
    {
      id: 'hotdeal',
      name: '핫딜',
      category: 'lifestyle',
      url: 'https://lazboyngirl.web.app',
      description: '인기 커뮤니티 특가 정보 실시간 수집 및 검색 포털 (Shopping Hub)',
      isPrivate: false,
      iconTheme: 'hotdeal'
    },
    {
      id: 'quiz',
      name: '퀴즈',
      category: 'education',
      url: 'https://study-qna-app.web.app',
      description: '두뇌 건강과 학습 능력을 높이는 매일 새로운 데일리 상식 퀴즈',
      isPrivate: false,
      iconTheme: 'quiz'
    },
    {
      id: 'phonics',
      name: '파닉스',
      category: 'education',
      url: 'https://phonics-catch-test.web.app',
      description: '아이들을 위한 쉽고 재미있는 영어 단어 및 원어민 발음 학습 놀이',
      isPrivate: false,
      iconTheme: 'phonics'
    },
    {
      id: 'vts-pt',
      name: 'VTS PT',
      category: 'health',
      url: '#vts-modal',
      description: '맞춤형 피트니스 루틴 관리 및 자세 교정 기록 서비스',
      isPrivate: false,
      iconTheme: 'health',
      subLinks: [
        {
          name: 'VTS PT 서비스 접속',
          url: 'https://vts.mino.trade',
          description: '일일 PT 운동 분석 및 메인 피트니스 모바일 페이지',
          icon: 'health'
        },
        {
          name: 'VTS 발표자 대시보드',
          url: 'https://script.google.com/macros/s/AKfycbx_cL4u97uokNOnKwdKHcLVVGRsenbIAxWc5Fde_oW86TfoSH0s3b2j2NvROTE-ICCm/exec',
          description: '실시간 VTS AI 분석 발표 및 슬라이드 관리 시스템',
          icon: 'stock'
        }
      ]
    },
    {
      id: 'workout-log',
      name: '운동일지',
      category: 'health',
      url: 'https://script.google.com/macros/s/AKfycbww3J0EzydcOmcikUhVSUNyw3fkmL5g-75P-ATtIAApGdefAdP_lPpuABvGtPTDXdFm/exec',
      description: '가족 구성원의 일일 운동 정보 공유 및 피트니스 명예의 전당 (박가네 운동일지)',
      isPrivate: false,
      iconTheme: 'health'
    }
  ],

  // Security & Vault State
  vault: {
    isUnlocked: false,
    correctPin: '5688', 
    currentPinInput: '',
    inactivityTimeout: 300000, // 5 minutes (300,000ms)
    timeoutTimer: null,
    onUnlockCallbacks: [],
    onLockCallbacks: []
  },

  // Initialize
  init() {
    this.setupAutoLock();
    this.restoreSession();
  },

  // Register state change listeners
  onUnlock(callback) {
    this.vault.onUnlockCallbacks.push(callback);
  },
  onLock(callback) {
    this.vault.onLockCallbacks.push(callback);
  },

  // PIN Input methods
  enterPinDigit(digit) {
    if (this.vault.currentPinInput.length < 4) {
      this.vault.currentPinInput += digit;
      this.notifyPinChange();
      
      if (this.vault.currentPinInput.length === 4) {
        // Debounce slightly to show the last dot filled
        setTimeout(() => this.verifyPin(), 250);
      }
    }
  },

  deletePinDigit() {
    if (this.vault.currentPinInput.length > 0) {
      this.vault.currentPinInput = this.vault.currentPinInput.slice(0, -1);
      this.notifyPinChange();
    }
  },

  clearPin() {
    this.vault.currentPinInput = '';
    this.notifyPinChange();
  },

  notifyPinChange() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
      if (index < this.vault.currentPinInput.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  },

  verifyPin() {
    const overlay = document.querySelector('.vault-overlay');
    if (this.vault.currentPinInput === this.vault.correctPin) {
      // SUCCESS
      overlay.classList.add('success');
      this.vault.isUnlocked = true;
      sessionStorage.setItem('mino_vault_unlocked', 'true');
      showToast('금고가 해제되었습니다. 개인 프로젝트가 활성화됩니다.', 'success');
      
      setTimeout(() => {
        overlay.classList.remove('success');
        overlay.classList.remove('active');
        this.clearPin();
        
        // Execute callbacks
        this.vault.onUnlockCallbacks.forEach(cb => cb());
        this.resetInactivityTimer();
      }, 600);
    } else {
      // FAIL
      overlay.classList.add('error');
      showToast('비밀번호가 올바르지 않습니다. 다시 입력해 주세요.', 'error');
      
      setTimeout(() => {
        overlay.classList.remove('error');
        this.clearPin();
      }, 600);
    }
  },

  lockVault() {
    if (this.vault.isUnlocked) {
      this.vault.isUnlocked = false;
      sessionStorage.removeItem('mino_vault_unlocked');
      showToast('보안을 위해 금고가 잠겼습니다.', 'info');
      
      // Execute callbacks
      this.vault.onLockCallbacks.forEach(cb => cb());
      this.clearPin();
      
      if (this.vault.timeoutTimer) {
        clearTimeout(this.vault.timeoutTimer);
      }
    }
  },

  restoreSession() {
    // Keep session unlocked across soft reloads, but clear on close
    const wasUnlocked = sessionStorage.getItem('mino_vault_unlocked') === 'true';
    if (wasUnlocked) {
      this.vault.isUnlocked = true;
      // Wait for DOM load to run callbacks
      window.addEventListener('DOMContentLoaded', () => {
        this.vault.onUnlockCallbacks.forEach(cb => cb());
        this.resetInactivityTimer();
      });
    }
  },

  // Auto Lock Mechanism
  setupAutoLock() {
    // Activity triggers
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer(), { passive: true });
    });

    // Page Visibility triggers
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Fast lock if tab is hidden for security
        this.lockVault();
      }
    });
  },

  resetInactivityTimer() {
    if (!this.vault.isUnlocked) return;

    if (this.vault.timeoutTimer) {
      clearTimeout(this.vault.timeoutTimer);
    }

    this.vault.timeoutTimer = setTimeout(() => {
      this.lockVault();
    }, this.vault.inactivityTimeout);
  }
};

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Custom icons for Toast
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger browser flow
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global SVG Icon Definitions
const SVGIcons = {
  family: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line></svg>`,
  fridge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="5" y1="10" x2="19" y2="10"></line><line x1="9" y1="6" x2="9" y2="8"></line><line x1="9" y1="14" x2="9" y2="18"></line></svg>`,
  chore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
  stock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line><path d="M2 18l6-6 4 4 10-10"></path><polyline points="17 4 22 4 22 9"></polyline></svg>`,
  hotdeal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line><circle cx="12" cy="12" r="10"></circle></svg>`,
  phonics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z"></path></svg>`,
  health: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path><path d="M18 10h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2"></path><path d="M6 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2"></path><line x1="10" y1="6.5" x2="10" y2="17.5"></line><line x1="14" y1="6.5" x2="14" y2="17.5"></line></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  unlock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`
};

// Kick off initialization
AppState.init();
