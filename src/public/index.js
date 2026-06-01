/**
 * OPTIMUS FITNESS - Premium Gym Management Client-side Controller
 */

const API_BASE = (window.location.port === '3000' || window.location.port === '') 
  ? '' 
  : `${window.location.protocol}//${window.location.hostname}:3000`;

async function apiFetch(url, options = {}) {
  const absoluteUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  options.credentials = 'include';
  return fetch(absoluteUrl, options);
}

// Application State
const state = {
  currentUser: null,
  classes: [],
  dashboardData: null,
  adminData: null,
  activeClassFilter: 'all',
  billingPeriod: 'monthly', // 'monthly' or 'yearly'
  currentView: 'home',
  activeDashboardTab: 'overview',
  
  // Body Shape Diet Plan State
  activeBodyShape: 'mesomorph'
};

// UI Elements Cache
const elements = {
  header: document.getElementById('header'),
  navAnchorLinks: document.querySelectorAll('.nav-anchor'),
  navAuthBtn: document.getElementById('nav-auth-btn'),
  navLogoutBtn: document.getElementById('nav-logout-btn'),
  navUserGreeting: document.getElementById('nav-user-greeting'),
  mobileNavToggle: document.getElementById('mobile-nav-toggle'),
  navLinks: document.querySelector('.nav-links'),
  
  // SPA Views
  sections: {
    home: document.getElementById('home-view'),
    classes: document.getElementById('classes-view'),
    trainers: document.getElementById('trainers-view'),
    calculator: document.getElementById('calculator-view'),
    diet: document.getElementById('diet-view'),
    plans: document.getElementById('plans-view'),
    dashboard: document.getElementById('dashboard-view'),
    admin: document.getElementById('admin-view'),
    contact: document.getElementById('contact-view')
  },
  
  // Auth Modal
  authModal: document.getElementById('auth-modal'),
  loginPanel: document.getElementById('login-modal-panel'),
  registerPanel: document.getElementById('register-modal-panel'),
  closeLoginBtn: document.getElementById('close-login-btn'),
  closeRegisterBtn: document.getElementById('close-register-btn'),
  toggleRegisterLink: document.getElementById('toggle-register-link'),
  toggleLoginLink: document.getElementById('toggle-login-link'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  
  // Classes
  classesCardsContainer: document.getElementById('classes-cards-container'),
  filterButtons: document.querySelectorAll('.filter-btn'),
  
  // Plans Toggle
  pricingToggle: document.getElementById('pricing-toggle-checkbox'),
  basicPrice: document.getElementById('basic-price'),
  elitePrice: document.getElementById('elite-price'),
  vipPrice: document.getElementById('vip-price'),
  basicPeriod: document.getElementById('basic-period'),
  elitePeriod: document.getElementById('elite-period'),
  vipPeriod: document.getElementById('vip-period'),
  labelMonthly: document.getElementById('label-monthly'),
  labelYearly: document.getElementById('label-yearly'),
  purchaseButtons: document.querySelectorAll('.purchase-membership-btn'),
  
  // Dashboard
  dbAvatar: document.getElementById('db-avatar'),
  dbUsername: document.getElementById('db-username'),
  dbEmail: document.getElementById('db-email'),
  dbMembershipBadge: document.getElementById('db-membership-badge'),
  dbMemberName: document.getElementById('db-member-name'),
  dbMenuButtons: document.querySelectorAll('.db-menu-btn'),
  dbPanels: document.querySelectorAll('.db-panel'),
  
  // Dashboard Metrics
  statBookedCount: document.getElementById('stat-booked-count'),
  statWeightVal: document.getElementById('stat-weight-val'),
  statLogCount: document.getElementById('stat-log-count'),
  dbBookingsList: document.getElementById('db-bookings-list'),
  dbHistoryList: document.getElementById('db-history-list'),
  progressChartBlock: document.getElementById('progress-chart-block'),
  progressLoggerForm: document.getElementById('progress-logger-form'),
  logDateInput: document.getElementById('log-date'),
  
  // Gym QR Pass
  passUserName: document.getElementById('pass-user-name'),
  passAuthStatus: document.getElementById('pass-auth-status'),
  passMembershipTier: document.getElementById('pass-membership-tier'),
  
  // Admin Desk
  adminStatMembers: document.getElementById('admin-stat-members'),
  adminStatActive: document.getElementById('admin-stat-active'),
  adminStatClasses: document.getElementById('admin-stat-classes'),
  adminStatBookings: document.getElementById('admin-stat-bookings'),
  adminAddClassForm: document.getElementById('admin-add-class-form'),
  adminRosterList: document.getElementById('admin-roster-list'),
  
  // Toast
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toast-message'),
  
  // Occupancy Badge
  liveGymOccupancy: document.getElementById('live-gym-occupancy'),

  // Biometric Calculator triggers
  bioCalculatorForm: document.getElementById('bio-calculator-form'),
  calcGender: document.getElementById('calc-gender'),
  calcAge: document.getElementById('calc-age'),
  calcHeight: document.getElementById('calc-height'),
  calcWeight: document.getElementById('calc-weight'),
  calcActivity: document.getElementById('calc-activity'),
  calcGoal: document.getElementById('calc-goal'),
  calcResultBmi: document.getElementById('calc-result-bmi'),
  calcResultBmiStatus: document.getElementById('calc-result-bmi-status'),
  calcResultBmr: document.getElementById('calc-result-bmr'),
  calcResultTdee: document.getElementById('calc-result-tdee'),
  macroBarProtein: document.getElementById('macro-bar-protein'),
  macroBarCarbs: document.getElementById('macro-bar-carbs'),
  macroBarFats: document.getElementById('macro-bar-fats'),
  macroGramProtein: document.getElementById('macro-gram-protein'),
  macroGramCarbs: document.getElementById('macro-gram-carbs'),
  macroGramFats: document.getElementById('macro-gram-fats'),

  // Body Shape Diet Plan triggers
  dietShapeCards: document.querySelectorAll('.diet-shape-card'),
  dietMealsContainer: document.getElementById('diet-meals-container'),
  dietIntegrationAlert: document.getElementById('diet-integration-alert'),
  dietIntegrationText: document.getElementById('diet-integration-text'),
  dietBarProtein: document.getElementById('diet-bar-protein'),
  dietBarCarbs: document.getElementById('diet-bar-carbs'),
  dietBarFats: document.getElementById('diet-bar-fats'),
  dietLabelProtein: document.getElementById('diet-label-protein'),
  dietLabelCarbs: document.getElementById('diet-label-carbs'),
  dietLabelFats: document.getElementById('diet-label-fats'),
  dietPowerFoodsContainer: document.getElementById('diet-power-foods-container'),

  // Dynamic Dashboard Extensions
  dbProfileEditorForm: document.getElementById('db-profile-editor-form'),
  profileGender: document.getElementById('profile-gender'),
  profileAge: document.getElementById('profile-age'),
  profileHeight: document.getElementById('profile-height'),
  profileWeight: document.getElementById('profile-weight'),
  profileShape: document.getElementById('profile-shape'),
  profileGoal: document.getElementById('profile-goal'),
  
  hudValShape: document.getElementById('hud-val-shape'),
  hudValAge: document.getElementById('hud-val-age'),
  hudValWeight: document.getElementById('hud-val-weight'),
  hudValHeight: document.getElementById('hud-val-height'),
  hudValGoal: document.getElementById('hud-val-goal'),

  rosterProgressPercent: document.getElementById('roster-progress-percent'),
  rosterTypeTitle: document.getElementById('roster-type-title'),
  rosterChecklistContainer: document.getElementById('roster-checklist-container'),

  dbDietMealsContainer: document.getElementById('db-diet-meals-container'),
  dbDietBarProtein: document.getElementById('db-diet-bar-protein'),
  dbDietBarCarbs: document.getElementById('db-diet-bar-carbs'),
  dbDietBarFats: document.getElementById('db-diet-bar-fats'),
  dbDietValProtein: document.getElementById('db-diet-val-protein'),
  dbDietValCarbs: document.getElementById('db-diet-val-carbs'),
  dbDietValFats: document.getElementById('db-diet-val-fats'),
  dbDietFuelsContainer: document.getElementById('db-diet-fuels-container'),

  dbAchievementsContainer: document.getElementById('db-achievements-container'),

  // Contact Desk triggers
  contactInquiryForm: document.getElementById('contact-inquiry-form'),

  // User Profile Quickview Modal DOM Elements
  profileQuickviewModal: document.getElementById('profile-quickview-modal'),
  closeProfileBtn: document.getElementById('close-profile-btn'),
  profileQvAvatar: document.getElementById('profile-qv-avatar'),
  profileQvUsername: document.getElementById('profile-qv-username'),
  profileQvBadge: document.getElementById('profile-qv-badge'),
  profileQvGender: document.getElementById('profile-qv-gender'),
  profileQvAge: document.getElementById('profile-qv-age'),
  profileQvHeight: document.getElementById('profile-qv-height'),
  profileQvWeight: document.getElementById('profile-qv-weight'),
  profileQvShape: document.getElementById('profile-qv-shape'),
  profileQvTdee: document.getElementById('profile-qv-tdee'),
  profileQvBarProtein: document.getElementById('profile-qv-bar-protein'),
  profileQvBarCarbs: document.getElementById('profile-qv-bar-carbs'),
  profileQvBarFats: document.getElementById('profile-qv-bar-fats'),
  profileQvValProtein: document.getElementById('profile-qv-val-protein'),
  profileQvValCarbs: document.getElementById('profile-qv-val-carbs'),
  profileQvValFats: document.getElementById('profile-qv-val-fats'),
  profileQvDashBtn: document.getElementById('profile-qv-dash-btn'),
  profileQvLogoutBtn: document.getElementById('profile-qv-logout-btn')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  checkAuthentication();
  setupOccupancySimulation();

  // Custom SPA Modules Setup
  initBiometricCalculator();
  initBodyShapeDiet();
});

/* =========================================================================
   AUTHENTICATION & INITIAL CHECKS
   ========================================================================= */

// Check current user session status
async function checkAuthentication() {
  try {
    const res = await apiFetch('/api/auth/me');
    const data = await res.json();
    
    if (data.user) {
      handleUserLoggedIn(data.user);
    } else {
      handleUserLoggedOut();
    }
  } catch (error) {
    console.error('Auth verification failed:', error);
    handleUserLoggedOut();
  }
}

// Adjust UI elements on Successful Sign-In
function handleUserLoggedIn(user) {
  state.currentUser = user;
  
  // Greeting & Button visibility
  elements.navAuthBtn.style.display = 'none';
  elements.navLogoutBtn.style.display = 'inline-flex';
  elements.navUserGreeting.textContent = `Hello, ${user.username}`;
  elements.navUserGreeting.style.display = 'inline-block';
  
  // Dashboard & Admin visibility
  document.querySelectorAll('.member-only').forEach(el => el.style.display = 'block');
  
  if (user.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }

  // Synchronize Biometric Calculator and Bio-Profile Settings forms with logged-in user data
  if (user.gender) {
    elements.calcGender.value = user.gender;
    elements.profileGender.value = user.gender;
  }
  if (user.age) {
    elements.calcAge.value = user.age;
    elements.profileAge.value = user.age;
  }
  if (user.height) {
    elements.calcHeight.value = user.height;
    elements.profileHeight.value = user.height;
  }
  if (user.weight) {
    elements.calcWeight.value = user.weight;
    elements.profileWeight.value = user.weight;
  }
  if (user.fitness_goal) {
    elements.calcGoal.value = user.fitness_goal;
    elements.profileGoal.value = user.fitness_goal;
  }
  if (user.body_shape) {
    state.activeBodyShape = user.body_shape;
    elements.profileShape.value = user.body_shape;
    // Select corresponding somatotype card in diet page
    elements.dietShapeCards.forEach(c => {
      c.classList.remove('active');
      if (c.getAttribute('data-shape') === user.body_shape) {
        c.classList.add('active');
      }
    });
  }

  // Update Plan selector buttons: if active, show "Current Plan"
  updateMembershipPlansUI();

  // Route if user was looking at dashboard/admin pages
  handleRouting();
}

// Adjust UI elements on Sign-Out
function handleUserLoggedOut() {
  state.currentUser = null;
  
  elements.navAuthBtn.style.display = 'inline-flex';
  elements.navLogoutBtn.style.display = 'none';
  elements.navUserGreeting.style.display = 'none';
  
  document.querySelectorAll('.member-only').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  
  updateMembershipPlansUI();

  // If currently inside a restricted view, redirect home
  if (state.currentView === 'dashboard' || state.currentView === 'admin') {
    window.location.hash = '#home';
  } else {
    handleRouting();
  }
}

// Set up gym occupancy micro-simulation
function setupOccupancySimulation() {
  let count = 135 + Math.floor(Math.random() * 30);
  elements.liveGymOccupancy.textContent = count;
  
  setInterval(() => {
    const shift = Math.floor(Math.random() * 7) - 3; // -3 to +3
    count = Math.max(50, Math.min(220, count + shift));
    elements.liveGymOccupancy.textContent = count;
  }, 10000);
}

/* =========================================================================
   EVENT LISTENERS SETUP
   ========================================================================= */
function setupEventListeners() {
  
  // Sticky Navbar Scrolling
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      elements.header.classList.add('scrolled');
    } else {
      elements.header.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger Toggle
  if (elements.mobileNavToggle && elements.navLinks) {
    elements.mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.mobileNavToggle.classList.toggle('active');
      elements.navLinks.classList.toggle('active');
    });

    // Close menu when clicking on any nav anchor link
    elements.navAnchorLinks.forEach(link => {
      link.addEventListener('click', () => {
        elements.mobileNavToggle.classList.remove('active');
        elements.navLinks.classList.remove('active');
      });
    });

    // Click outside mobile menu dismiss behavior
    document.addEventListener('click', (e) => {
      if (elements.navLinks.classList.contains('active')) {
        if (!elements.navLinks.contains(e.target) && !elements.mobileNavToggle.contains(e.target)) {
          elements.mobileNavToggle.classList.remove('active');
          elements.navLinks.classList.remove('active');
        }
      }
    });
  }

  // SPA Hash Routing
  window.addEventListener('hashchange', handleRouting);
  
  // Nav Links click routing
  elements.navAnchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      window.location.hash = `#${target}`;
    });
  });
  
  // Modal toggle links
  elements.navAuthBtn.addEventListener('click', () => openAuthModal('login'));
  elements.closeLoginBtn.addEventListener('click', closeAuthModal);
  elements.closeRegisterBtn.addEventListener('click', closeAuthModal);
  
  elements.toggleRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('register');
  });
  
  elements.toggleLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('login');
  });
  
  // Hide modal clicking overlay
  elements.authModal.addEventListener('click', (e) => {
    if (e.target === elements.authModal) {
      closeAuthModal();
    }
  });

  // Login Submit
  elements.loginForm.addEventListener('submit', handleLoginSubmit);
  
  // Register Submit
  elements.registerForm.addEventListener('submit', handleRegisterSubmit);
  
  // Logout Trigger
  elements.navLogoutBtn.addEventListener('click', handleLogout);

  // Profile Quickview trigger from clickable Username greeting pill
  elements.navUserGreeting.addEventListener('click', () => {
    if (state.currentUser) showProfileQuickview();
  });

  // Close Profile Quickview
  elements.closeProfileBtn.addEventListener('click', closeProfileQuickview);
  
  elements.profileQuickviewModal.addEventListener('click', (e) => {
    if (e.target === elements.profileQuickviewModal) {
      closeProfileQuickview();
    }
  });

  // Profile Quickview Actions redirection
  elements.profileQvDashBtn.addEventListener('click', () => {
    closeProfileQuickview();
    window.location.hash = '#dashboard';
  });

  elements.profileQvLogoutBtn.addEventListener('click', () => {
    closeProfileQuickview();
    handleLogout();
  });

  // Classes filtering
  elements.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeClassFilter = btn.getAttribute('data-filter');
      renderClasses();
    });
  });

  // Pricing monthly/yearly toggle
  elements.pricingToggle.addEventListener('change', () => {
    if (elements.pricingToggle.checked) {
      state.billingPeriod = 'yearly';
      elements.labelYearly.classList.add('active');
      elements.labelMonthly.classList.remove('active');
      
      // Animate transition of pricing text
      animatePricingChange(23, 47, 79);
    } else {
      state.billingPeriod = 'monthly';
      elements.labelMonthly.classList.add('active');
      elements.labelYearly.classList.remove('active');
      
      animatePricingChange(29, 59, 99);
    }
  });

  // Purchase/Upgrade Membership card buttons
  elements.purchaseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.getAttribute('data-tier');
      handleMembershipPurchase(tier);
    });
  });

  // Dashboard Sub-navigation Tabs
  elements.dbMenuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.dbMenuButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabId = btn.getAttribute('data-tab');
      state.activeDashboardTab = tabId;
      
      elements.dbPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${tabId}-tab`) {
          panel.classList.add('active');
        }
      });
    });
  });

  // Workout Tracker progress logger submit
  elements.progressLoggerForm.addEventListener('submit', handleProgressLogSubmit);
  
  // Admin add class submit
  elements.adminAddClassForm.addEventListener('submit', handleAdminAddClassSubmit);


  // --- Biometric Calculator Event Listeners ---
  elements.calcGender.addEventListener('change', calculateBiometrics);
  elements.calcAge.addEventListener('input', calculateBiometrics);
  elements.calcHeight.addEventListener('input', calculateBiometrics);
  elements.calcWeight.addEventListener('input', calculateBiometrics);
  elements.calcActivity.addEventListener('change', calculateBiometrics);
  elements.calcGoal.addEventListener('change', calculateBiometrics);

  // --- Body Shape Diet Selector Event Listeners ---
  elements.dietShapeCards.forEach(card => {
    card.addEventListener('click', () => {
      elements.dietShapeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.activeBodyShape = card.getAttribute('data-shape');
      renderDietPlan();
    });
  });

  // --- Contact Inquiry Event Listeners ---
  elements.contactInquiryForm.addEventListener('submit', handleContactInquirySubmit);

  // --- Bio-Profile Settings Form Submit ---
  if (elements.dbProfileEditorForm) {
    elements.dbProfileEditorForm.addEventListener('submit', handleProfileUpdateSubmit);
  }
}

/* =========================================================================
   SPA DASHBOARD ROUTER
   ========================================================================= */
function handleRouting() {
  const hash = window.location.hash.substring(1) || 'home';
  state.currentView = hash;
  
  // Deactivate all anchor lines
  elements.navAnchorLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === hash) {
      link.classList.add('active');
    }
  });

  // Hide all SPA sections
  Object.keys(elements.sections).forEach(key => {
    elements.sections[key].style.display = 'none';
  });

  // Show selected section, fetch respective data
  if (hash === 'home') {
    elements.sections.home.style.display = 'block';
  } else if (hash === 'classes') {
    elements.sections.classes.style.display = 'block';
    fetchClasses();
  } else if (hash === 'trainers') {
    elements.sections.trainers.style.display = 'block';

  } else if (hash === 'calculator') {
    elements.sections.calculator.style.display = 'block';
    calculateBiometrics();
  } else if (hash === 'diet') {
    elements.sections.diet.style.display = 'block';
    renderDietPlan();
  } else if (hash === 'plans') {
    elements.sections.plans.style.display = 'block';
  } else if (hash === 'dashboard') {
    if (!state.currentUser) {
      window.location.hash = '#home';
      openAuthModal('login');
      showToast('Authentication required to access member dashboard.', false);
    } else {
      elements.sections.dashboard.style.display = 'block';
      fetchDashboardDetails();
      
      // Set workout log default date
      elements.logDateInput.value = new Date().toISOString().substring(0, 10);
    }
  } else if (hash === 'admin') {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
      window.location.hash = '#home';
      showToast('Unauthorized. Administrator workspace access denied.', false);
    } else {
      elements.sections.admin.style.display = 'block';
      fetchAdminDeskDetails();
    }
  } else if (hash === 'contact') {
    elements.sections.contact.style.display = 'block';
  }
  
  // Scroll to header smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================================
   MODAL AND TOAST VISUAL UTILITIES
   ========================================================================= */

// Open Auth Modal
function openAuthModal(view) {
  elements.authModal.classList.add('active');
  elements.authModal.style.display = 'flex';
  
  if (view === 'login') {
    elements.loginPanel.style.display = 'block';
    elements.registerPanel.style.display = 'none';
  } else {
    elements.loginPanel.style.display = 'none';
    elements.registerPanel.style.display = 'block';
  }
}

// Close Auth Modal
function closeAuthModal() {
  elements.authModal.classList.remove('active');
  setTimeout(() => {
    elements.authModal.style.display = 'none';
  }, 300);
}

// Animated notification alert toaster
function showToast(message, isSuccess = true) {
  elements.toast.classList.remove('success', 'error', 'active');
  
  // Force reflow
  void elements.toast.offsetWidth;
  
  elements.toastMessage.textContent = message;
  elements.toast.classList.add(isSuccess ? 'success' : 'error');
  elements.toast.classList.add('active');
  
  // Handcrafted SVG change for toast icon
  const icon = elements.toast.querySelector('.toast-icon');
  if (isSuccess) {
    icon.innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
  } else {
    icon.innerHTML = `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`;
  }

  // Clear timeout
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('active');
  }, 4000);
}

// Transition animation utility for toggling billing cycles
function animatePricingChange(basic, elite, vip) {
  let count = 0;
  const interval = setInterval(() => {
    elements.basicPrice.style.opacity = 0.3;
    elements.elitePrice.style.opacity = 0.3;
    elements.vipPrice.style.opacity = 0.3;
    
    setTimeout(() => {
      elements.basicPrice.textContent = `$${basic}`;
      elements.elitePrice.textContent = `$${elite}`;
      elements.vipPrice.textContent = `$${vip}`;
      
      elements.basicPrice.style.opacity = 1;
      elements.elitePrice.style.opacity = 1;
      elements.vipPrice.style.opacity = 1;
    }, 150);
    
    count++;
    if (count >= 1) clearInterval(interval);
  }, 100);
}

/* =========================================================================
   CLASSES INTERACTIVE FUNCTIONALITY
   ========================================================================= */

// Fetch classes database
async function fetchClasses() {
  try {
    const res = await apiFetch('/api/classes');
    state.classes = await res.json();
    renderClasses();
  } catch (error) {
    showToast('Failed to fetch class programs from gym database.', false);
  }
}

// Display class cards
function renderClasses() {
  elements.classesCardsContainer.innerHTML = '';
  
  const filtered = state.classes.filter(c => {
    if (state.activeClassFilter === 'all') return true;
    return c.intensity === state.activeClassFilter;
  });

  if (filtered.length === 0) {
    elements.classesCardsContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 4rem; color: var(--text-secondary);">No training schedules match this filter choice.</p>`;
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement('div');
    card.className = 'class-card';
    
    const isFull = c.enrolled >= c.capacity;
    
    // Check dynamic action CTA
    let actionButton = '';
    if (!state.currentUser) {
      actionButton = `<button class="btn btn-outline" onclick="window.openAuthModal('login')">Login to Book</button>`;
    } else {
      if (c.isBooked) {
        actionButton = `<button class="btn btn-outline" style="border-color: var(--error); color: var(--error);" onclick="cancelClassBooking(${c.id})">Cancel Reservation</button>`;
      } else {
        if (isFull) {
          actionButton = `<button class="btn btn-outline" style="opacity: 0.5; cursor: not-allowed;" disabled>Roster Full</button>`;
        } else {
          actionButton = `<button class="btn btn-primary" onclick="bookClassSlot(${c.id})">Reserve Spot</button>`;
        }
      }
    }

    card.innerHTML = `
      <div class="class-img-wrapper">
        <!-- Minimalist sharp sports barbell SVG placeholder -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <span class="class-intensity ${c.intensity.toLowerCase()}">${c.intensity} Intensity</span>
      </div>
      <div class="class-body">
        <h3>${c.title}</h3>
        <p class="class-trainer">Coach ${c.trainer}</p>
        <p class="class-desc">${c.description}</p>
        <div class="class-meta">
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${c.duration}</span>
          </div>
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span>${c.enrolled}/${c.capacity} Enrolled</span>
          </div>
        </div>
        <div class="class-schedule" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem; border-top: 1px dashed var(--border-color); padding-top: 0.75rem;">
          📅 ${c.schedule}
        </div>
        ${actionButton}
      </div>
    `;
    elements.classesCardsContainer.appendChild(card);
  });
}

// Global functions attached to window so button onclick callbacks can find them!
window.bookClassSlot = async (classId) => {
  try {
    const res = await apiFetch('/api/classes/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showToast('Class reservation confirmed successfully!', true);
      fetchClasses(); // Refresh page list
    } else {
      showToast(data.error || 'Failed to complete booking reservation.', false);
    }
  } catch (error) {
    showToast('Network error during reservation booking.', false);
  }
};

window.cancelClassBooking = async (classId) => {
  try {
    const res = await apiFetch('/api/classes/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showToast('Class booking cancelled.', true);
      
      // If we are currently inside the dashboard, reload dashboard, otherwise reload catalog
      if (state.currentView === 'dashboard') {
        fetchDashboardDetails();
      } else {
        fetchClasses();
      }
    } else {
      showToast(data.error || 'Failed to cancel reservation.', false);
    }
  } catch (error) {
    showToast('Network error during cancel transaction.', false);
  }
};

window.openAuthModal = openAuthModal;

/* =========================================================================
   MEMBERSHIP PLANS ENROLLMENT
   ========================================================================= */

// Upgrade UI buttons depending on current active tier
function updateMembershipPlansUI() {
  elements.purchaseButtons.forEach(btn => {
    const tier = btn.getAttribute('data-tier');
    
    if (!state.currentUser) {
      btn.textContent = `Select ${tier}`;
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');
      btn.style.opacity = 1;
      btn.disabled = false;
      return;
    }

    const currentTier = state.currentUser.membership_tier;
    const status = state.currentUser.membership_status;

    if (currentTier === tier && status === 'Active') {
      btn.textContent = 'Active Membership';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline');
      btn.style.borderColor = 'var(--success)';
      btn.style.color = 'var(--success)';
      btn.style.boxShadow = 'none';
      btn.style.cursor = 'default';
      btn.disabled = true;
    } else {
      btn.textContent = `Activate ${tier}`;
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');
      btn.style.borderColor = 'transparent';
      btn.style.color = 'var(--text-dark)';
      btn.disabled = false;
      btn.style.cursor = 'pointer';
    }
  });
}

// Purchase Upgrade trigger
async function handleMembershipPurchase(tier) {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Authentication required to select membership.', false);
    return;
  }

  try {
    const res = await apiFetch('/api/member/membership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showToast(`Congratulations! Enrolled in the ${tier} package.`, true);
      handleUserLoggedIn(data.user); // Reload local session user properties
    } else {
      showToast(data.error || 'Failed to complete membership upgrade.', false);
    }
  } catch (error) {
    showToast('Network error during purchase verification.', false);
  }
}

/* =========================================================================
   MEMBER PERSONAL DASHBOARD INTERFACE
   ========================================================================= */

// Fetch all elements for dashboard render
async function fetchDashboardDetails() {
  try {
    const res = await apiFetch('/api/member/dashboard');
    if (!res.ok) throw new Error('Unauthenticated');
    
    const data = await res.json();
    state.dashboardData = data;
    
    renderDashboardUI();
  } catch (error) {
    showToast('Failed to pull dashboard statistics from core system.', false);
    window.location.hash = '#home';
  }
}

// Distribute data points inside elements
function renderDashboardUI() {
  const { user, bookings, progress } = state.dashboardData;
  
  // 1. Sidebar profile card details
  elements.dbAvatar.textContent = user.username.charAt(0).toUpperCase();
  elements.dbUsername.textContent = user.username;
  elements.dbEmail.textContent = user.email;
  elements.dbMembershipBadge.textContent = user.membership_tier;
  elements.dbMembershipBadge.className = `profile-tier ${user.membership_tier.toLowerCase()}`;
  
  elements.dbMemberName.textContent = user.username;

  // 2. Stats summary metrics block
  elements.statBookedCount.textContent = bookings.length;
  
  const latestWeight = progress.length > 0 ? progress[progress.length - 1].weight : null;
  elements.statWeightVal.textContent = latestWeight ? `${latestWeight} kg` : '-- kg';
  elements.statLogCount.textContent = progress.length;

  // Hydrate Stats HUD Caps
  if (elements.hudValShape) elements.hudValShape.textContent = user.body_shape || 'mesomorph';
  if (elements.hudValAge) elements.hudValAge.textContent = `${user.age || 25} yrs`;
  if (elements.hudValWeight) elements.hudValWeight.textContent = `${latestWeight || user.weight || 76} kg`;
  if (elements.hudValHeight) elements.hudValHeight.textContent = `${user.height || 178} cm`;
  if (elements.hudValGoal) elements.hudValGoal.textContent = user.fitness_goal || 'maintenance';

  // Populate Settings Form Fields
  if (elements.profileGender) elements.profileGender.value = user.gender || 'male';
  if (elements.profileAge) elements.profileAge.value = user.age || 25;
  if (elements.profileHeight) elements.profileHeight.value = user.height || 178;
  if (elements.profileWeight) elements.profileWeight.value = latestWeight || user.weight || 76;
  if (elements.profileShape) elements.profileShape.value = user.body_shape || 'mesomorph';
  if (elements.profileGoal) elements.profileGoal.value = user.fitness_goal || 'maintenance';

  // 3. Tabular list of booked programs
  elements.dbBookingsList.innerHTML = '';
  if (bookings.length === 0) {
    elements.dbBookingsList.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem 0;">
          No classes reserved. Search elite classes in the <a href="#classes" style="color: var(--accent-gold); text-decoration: underline;">Classes List</a>.
        </td>
      </tr>
    `;
  } else {
    bookings.forEach(b => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${b.title}</strong><br><span style="font-size:0.75rem; color:var(--text-secondary);">${b.intensity} Intensity</span></td>
        <td>📅 ${b.schedule}<br><span style="font-size:0.75rem; color:var(--text-secondary);">⌛ ${b.duration}</span></td>
        <td>Coach ${b.trainer}</td>
        <td>
          <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-color: var(--error); color: var(--error);" onclick="cancelClassBooking(${b.class_id})">Cancel Spot</button>
        </td>
      `;
      elements.dbBookingsList.appendChild(row);
    });
  }

  // 4. Biometric input history lists
  elements.dbHistoryList.innerHTML = '';
  if (progress.length === 0) {
    elements.dbHistoryList.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No tracking metric records found.</td></tr>`;
  } else {
    // Reverse metrics array to show newest logs on top
    [...progress].reverse().forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${log.date}</strong></td>
        <td>${log.weight} kg</td>
        <td>${log.body_fat ? `${log.body_fat}%` : 'N/A'}</td>
        <td>${log.workout_duration} mins</td>
      `;
      elements.dbHistoryList.appendChild(row);
    });
  }

  // 5. Generate high fidelity custom SVG line-chart progress graph!
  renderProgressGraph(progress);

  // 6. Gym QR pass properties updates
  elements.passUserName.textContent = user.username.toUpperCase();
  elements.passMembershipTier.textContent = `${user.membership_tier} LEVEL`;
  
  if (user.membership_status === 'Active') {
    elements.passAuthStatus.textContent = 'ACCESS AUTHORIZED';
    elements.passAuthStatus.style.color = 'var(--success)';
  } else {
    elements.passAuthStatus.textContent = 'ACCESS LOCKED (INACTIVE)';
    elements.passAuthStatus.style.color = 'var(--error)';
  }

  // Render Advanced Dashboard Subviews
  renderDashboardDailyRoster(user);
  renderDashboardDietPlan(user);
  renderDashboardAchievements(progress, user);
}

// Elegant Handcrafted responsive SVG Line Chart builder
function renderProgressGraph(progress) {
  elements.progressChartBlock.innerHTML = '';
  
  if (progress.length < 2) {
    elements.progressChartBlock.innerHTML = `<div style="width:100%; text-align:center; padding-top: 5rem; color: var(--text-secondary);">Log at least 2 workout weights to draw progress chart curves.</div>`;
    return;
  }

  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;
  
  const width = 450;
  const height = 210;

  // Find boundaries of weights logged
  const weights = progress.map(p => p.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  const weightSpan = maxWeight - minWeight;

  const datesCount = progress.length;

  // Map coordinates
  const points = progress.map((p, idx) => {
    const x = paddingLeft + (idx / (datesCount - 1)) * (width - paddingLeft - paddingRight);
    // Y runs top-down in SVG coordinates: 0 is ceiling
    const y = paddingTop + (1 - (p.weight - minWeight) / weightSpan) * (height - paddingTop - paddingBottom);
    return { x, y, weight: p.weight, date: p.date };
  });

  // Compose SVG code
  let svgString = `<svg class="svg-chart" viewBox="0 0 ${width} ${height}">`;
  
  // 1. Draw horizontal horizontal gridlines & Y labels
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const ratio = i / gridLines;
    const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
    const weightLabel = (maxWeight - ratio * weightSpan).toFixed(1);
    
    svgString += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid" />
      <text x="5" y="${y + 3}" class="chart-labels" fill="var(--text-secondary)">${weightLabel}</text>
    `;
  }

  // 2. Draw line path points connection
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
  }

  svgString += `<path d="${pathD}" class="chart-line" />`;

  // 3. Draw dot joints & labels
  points.forEach((p, idx) => {
    // Only show X labels for selective indices to avoid crowded overlap
    let dateLabel = '';
    if (datesCount <= 5 || idx === 0 || idx === datesCount - 1 || idx === Math.floor(datesCount / 2)) {
      // Show short date MM/DD
      const dateParts = p.date.split('-');
      const shortDate = dateParts.length > 2 ? `${dateParts[1]}/${dateParts[2]}` : p.date;
      dateLabel = `<text x="${p.x - 10}" y="${height - 5}" class="chart-labels" fill="var(--text-secondary)">${shortDate}</text>`;
    }

    svgString += `
      ${dateLabel}
      <circle cx="${p.x}" cy="${p.y}" r="4" class="chart-dots" />
      <title>Date: ${p.date}\nWeight: ${p.weight} kg</title>
    `;
  });

  svgString += `</svg>`;
  elements.progressChartBlock.innerHTML = svgString;
}

// Biometric weight & metrics form submit handler
async function handleProgressLogSubmit(e) {
  e.preventDefault();
  
  const date = document.getElementById('log-date').value;
  const weight = document.getElementById('log-weight').value;
  const bodyFat = document.getElementById('log-bodyfat').value;
  const duration = document.getElementById('log-duration').value;
  const heartRate = document.getElementById('log-heartrate').value;

  try {
    const res = await apiFetch('/api/member/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, weight, bodyFat, duration, heartRate })
    });
    
    if (res.ok) {
      showToast('Daily physical logging entries saved!', true);
      elements.progressLoggerForm.reset();
      elements.logDateInput.value = new Date().toISOString().substring(0, 10);
      
      fetchDashboardDetails(); // Reload dashboard datasets
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to submit progress metrics.', false);
    }
  } catch (error) {
    showToast('Network error during metrics logging.', false);
  }
}

/* =========================================================================
   ADMINISTRATOR DASHBOARD MODULE
   ========================================================================= */

// Fetch all metrics and rosters from administrative server
async function fetchAdminDeskDetails() {
  try {
    const res = await apiFetch('/api/admin/overview');
    if (!res.ok) throw new Error('Forbidden access');
    
    const data = await res.json();
    state.adminData = data;
    
    renderAdminDeskUI();
  } catch (error) {
    showToast('Access denied or admin overview fetch failed.', false);
    window.location.hash = '#home';
  }
}

// Display administrative data points inside table and widgets
function renderAdminDeskUI() {
  const { stats, members } = state.adminData;

  // Widgets update
  elements.adminStatMembers.textContent = stats.totalUsers;
  elements.adminStatActive.textContent = stats.activeMembers;
  elements.adminStatClasses.textContent = stats.totalClasses;
  elements.adminStatBookings.textContent = stats.totalBookings;

  // Roster tables listing
  elements.adminRosterList.innerHTML = '';
  if (members.length === 0) {
    elements.adminRosterList.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem 0;">No active gym members found.</td></tr>`;
  } else {
    members.forEach(m => {
      const initials = m.username.substring(0, 2).toUpperCase();
      const statusColor = m.membership_status === 'Active' ? 'var(--success)' : 'var(--error)';
      
      const dateOnly = m.joined_date.split(' ')[0] || m.joined_date;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap: 0.75rem;">
            <div class="member-row-avatar">${initials}</div>
            <strong>${m.username}</strong>
          </div>
        </td>
        <td>${m.email}</td>
        <td>
          <span style="font-size: 0.8rem; font-weight:700; color: var(--accent-gold);">${m.membership_tier.toUpperCase()}</span>
          <span style="font-size: 0.7rem; display:block; color: ${statusColor}; font-weight:500;">● ${m.membership_status.toUpperCase()}</span>
        </td>
        <td style="color:var(--text-secondary); font-size:0.85rem;">${dateOnly}</td>
      `;
      elements.adminRosterList.appendChild(row);
    });
  }
}

// Add Gym Class handler
async function handleAdminAddClassSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('class-title').value;
  const trainer = document.getElementById('class-trainer').value;
  const schedule = document.getElementById('class-schedule').value;
  const capacity = document.getElementById('class-capacity').value;
  const duration = document.getElementById('class-duration').value;
  const intensity = document.getElementById('class-intensity').value;
  const description = document.getElementById('class-desc').value;

  try {
    const res = await apiFetch('/api/admin/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, trainer, schedule, capacity, duration, intensity, description })
    });
    
    const data = await res.json();
    
    if (res.status === 201) {
      showToast('New Gym Class added to scheduling catalog.', true);
      elements.adminAddClassForm.reset();
      
      fetchAdminDeskDetails(); // Refresh metrics
    } else {
      showToast(data.error || 'Failed to register gym class.', false);
    }
  } catch (error) {
    showToast('Network error while registering class.', false);
  }
}

/* =========================================================================
   USER SIGN-IN / SIGN-UP FORM SUBMISSIONS
   ========================================================================= */

// User Register Form Submit
async function handleRegisterSubmit(e) {
  e.preventDefault();
  
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  if (password.length < 6) {
    showToast('Password must contain at least 6 characters.', false);
    return;
  }

  try {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await res.json();
    
    if (res.status === 201) {
      showToast('Registration successful! Welcome to Optimus Fit.', true);
      elements.registerForm.reset();
      closeAuthModal();
      
      // Auto Logged in, establish state
      handleUserLoggedIn(data.user);
      
      // Navigate straight to dashboard!
      window.location.hash = '#dashboard';
    } else {
      showToast(data.error || 'Registration failed.', false);
    }
  } catch (error) {
    showToast('Registration transaction failed. Try again.', false);
  }
}

// User Sign-in Form Submit
async function handleLoginSubmit(e) {
  e.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showToast(`Welcome back to Optimus Fit, ${data.user.username}!`, true);
      elements.loginForm.reset();
      closeAuthModal();
      
      handleUserLoggedIn(data.user);
      
      // Navigate to dashboard automatically if regular user, or admin desk if admin!
      if (data.user.role === 'admin') {
        window.location.hash = '#admin';
      } else {
        window.location.hash = '#dashboard';
      }
    } else {
      showToast(data.error || 'Invalid credentials entered.', false);
    }
  } catch (error) {
    showToast('Sign-In request encountered a server error.', false);
  }
}

// Logout session clear
async function handleLogout() {
  try {
    const res = await apiFetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      showToast('Logged out of Optimus facility system.', true);
      handleUserLoggedOut();
    } else {
      showToast('Session logout request failed.', false);
    }
  } catch (error) {
    showToast('Failed to contact auth server for logout.', false);
  }
}


/* =========================================================================
   BIOMETRIC CALORIE & MACRO CALCULATOR MODULE
   ========================================================================= */

function calculateBiometrics() {
  if (!elements.bioCalculatorForm) return;

  const gender = elements.calcGender.value;
  const age = parseFloat(elements.calcAge.value) || 25;
  const height = parseFloat(elements.calcHeight.value) || 175;
  const weight = parseFloat(elements.calcWeight.value) || 70;
  const activity = parseFloat(elements.calcActivity.value) || 1.2;
  const goal = elements.calcGoal.value;

  // 1. BMI Calculation
  const bmi = weight / ((height / 100) * (height / 100));
  elements.calcResultBmi.textContent = bmi.toFixed(1);

  let bmiStatus = 'Normal';
  let bmiColor = 'var(--success)';
  if (bmi < 18.5) {
    bmiStatus = 'Underweight';
    bmiColor = 'var(--accent-gold)';
  } else if (bmi >= 25 && bmi < 30) {
    bmiStatus = 'Overweight';
    bmiColor = 'var(--accent-gold)';
  } else if (bmi >= 30) {
    bmiStatus = 'Obese';
    bmiColor = 'var(--error)';
  }
  elements.calcResultBmiStatus.textContent = bmiStatus;
  elements.calcResultBmiStatus.style.color = bmiColor;

  // 2. BMR (Harris-Benedict Equation)
  let bmr = 0;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  elements.calcResultBmr.textContent = Math.round(bmr).toLocaleString();

  // 3. TDEE & Goal budget
  const tdeeBase = bmr * activity;
  let tdeeTarget = tdeeBase;
  if (goal === 'deficit') {
    tdeeTarget -= 500;
  } else if (goal === 'surplus') {
    tdeeTarget += 400;
  }
  elements.calcResultTdee.textContent = Math.round(tdeeTarget).toLocaleString();

  // 4. Macronutrient Targets
  let proteinRatio = 0.25;
  let carbRatio = 0.50;
  let fatRatio = 0.25;

  if (goal === 'deficit') {
    proteinRatio = 0.35;
    carbRatio = 0.35;
    fatRatio = 0.30;
  } else if (goal === 'surplus') {
    proteinRatio = 0.30;
    carbRatio = 0.50;
    fatRatio = 0.20;
  }

  // Draw stacked macro visual bar widths
  elements.macroBarProtein.style.width = `${proteinRatio * 100}%`;
  elements.macroBarCarbs.style.width = `${carbRatio * 100}%`;
  elements.macroBarFats.style.width = `${fatRatio * 100}%`;

  // Macro Gram math: Protein (4 kcal/g), Carb (4 kcal/g), Fat (9 kcal/g)
  const proteinGrams = Math.round((tdeeTarget * proteinRatio) / 4);
  const carbGrams = Math.round((tdeeTarget * carbRatio) / 4);
  const fatGrams = Math.round((tdeeTarget * fatRatio) / 9);

  elements.macroGramProtein.textContent = `${proteinGrams}g`;
  elements.macroGramCarbs.textContent = `${carbGrams}g`;
  elements.macroGramFats.textContent = `${fatGrams}g`;
}

function initBiometricCalculator() {
  calculateBiometrics();
}

/* =========================================================================
   BODY SHAPE DIET ARCHITECT MODULE
   ========================================================================= */

const somatotypeDiets = {
  ectomorph: {
    name: "Ectomorph Plan",
    caloricStrategy: "High-Calorie hyper-glycemic mass platform. Designed to overcome fast thyroid outputs and muscle breakdown.",
    ratios: { protein: 0.25, carbs: 0.55, fats: 0.20 },
    defaultCalories: 2700,
    foods: [
      { name: "Fast Absorbing Aminos", type: "lean-protein", desc: "Grass-fed steak, complete eggs, wild salmon, and whey isolate." },
      { name: "Complex Glycogen Loaders", type: "high-carb", desc: "Sweet potatoes, rolled oats, brown basmati, quinoa, and bananas." },
      { name: "Saturated Core Fats", type: "essential-fat", desc: "Unfiltered avocado oils, raw almond butter, and organic coconut fats." }
    ],
    meals: [
      { name: "Fast Glycogen Pre-Load", time: "07:30 AM", foods: ["120g Rolled Oats with honey", "2 Whole Eggs & 4 Egg Whites", "1 Large Banana"], baseGrams: { carb: 80, protein: 35, fat: 8 } },
      { name: "Hypertrophic Post-Workout Recovery", time: "11:30 AM", foods: ["150g Grilled Salmon pod", "300g Baked Sweet Potato", "Steam Broccoli with olive oil"], baseGrams: { carb: 95, protein: 42, fat: 15 } },
      { name: "Cellular Restorative Lunch", time: "03:30 PM", foods: ["200g Lean Chicken Breast", "150g Quinoa grain bowl", "1/2 Avocado slices"], baseGrams: { carb: 65, protein: 48, fat: 14 } },
      { name: "Overnight Biological Repair", time: "08:30 PM", foods: ["250g Casein Cottage Cheese", "30g Mixed Almonds & Walnuts", "Organic blueberries"], baseGrams: { carb: 15, protein: 32, fat: 18 } }
    ]
  },
  mesomorph: {
    name: "Mesomorph Plan",
    caloricStrategy: "Isometric balanced athletic partitioning. Optimizes clean muscle building and fast glycogen re-saturation.",
    ratios: { protein: 0.30, carbs: 0.40, fats: 0.30 },
    defaultCalories: 2500,
    foods: [
      { name: "Pure Muscle Building blocks", type: "lean-protein", desc: "Free-range chicken, wild cod fish, lean tenderloin, and turkey breast." },
      { name: "Moderated Insulin Carbs", type: "high-carb", desc: "Sweet brown rice, red potato tubers, dense oatmeal, and fresh berries." },
      { name: "Mono-Unsaturated Lipids", type: "essential-fat", desc: "Extra virgin olive oils, whole raw cashews, chia seeds, and raw avocados." }
    ],
    meals: [
      { name: "Pre-Workout Athletic Activation", time: "07:30 AM", foods: ["80g Oatmeal with almond milk", "3 Scrambled Egg Whites & 1 Whole Egg", "Handful of berries"], baseGrams: { carb: 50, protein: 32, fat: 10 } },
      { name: "Post-Workout Recovery Fuel", time: "11:30 AM", foods: ["180g Lean Flank Steak", "250g Roasted Red Potatoes", "Grilled asparagus spears"], baseGrams: { carb: 65, protein: 45, fat: 14 } },
      { name: "Nutrient-Dense Restorative Lunch", time: "03:30 PM", foods: ["180g Shredded Turkey Breast", "120g Quinoa base", "1/2 Sliced Avocado"], baseGrams: { carb: 45, protein: 40, fat: 12 } },
      { name: "Sleep & Cellular Regeneration", time: "08:30 PM", foods: ["200g Grilled Wild Cod", "Large green mixed salad with olive oil", "25g Pumpkin seeds"], baseGrams: { carb: 10, protein: 36, fat: 18 } }
    ]
  },
  endomorph: {
    name: "Endomorph Plan",
    caloricStrategy: "Ketogenic fat-burning protein partitioning. Engineered to stimulate lipolysis and prevent insulin spikes.",
    ratios: { protein: 0.35, carbs: 0.25, fats: 0.40 },
    defaultCalories: 2100,
    foods: [
      { name: "Thermogenic Lean Aminos", type: "lean-protein", desc: "Wild caught cod, egg whites, lean turkey, turkey bacon, and lean beef." },
      { name: "Low-Glycemic Leafy Fibers", type: "high-carb", desc: "Spiced spinach leaves, raw broccoli, asparagus, cauliflower, and zucchini." },
      { name: "High-Speed Metabolic Fats", type: "essential-fat", desc: "Pure MCT oils, raw flax seeds, raw macadamia nuts, and organic egg yolks." }
    ],
    meals: [
      { name: "Metabolic Activation Fuel", time: "07:30 AM", foods: ["3 Egg White Omelet with spinach & mushrooms", "2 slices Turkey Bacon", "10g Flaxseeds"], baseGrams: { carb: 8, protein: 28, fat: 12 } },
      { name: "Post-Workout Lipolytic Recovery", time: "11:30 AM", foods: ["180g Grilled Chicken Breast", "Steamed Cauliflower Mash with 1 tsp ghee", "Grilled zucchini strips"], baseGrams: { carb: 15, protein: 42, fat: 10 } },
      { name: "Thermogenic Restorative Lunch", time: "03:30 PM", foods: ["150g Grilled Salmon", "Large spinach salad with cucumber", "15g Macadamia nuts"], baseGrams: { carb: 10, protein: 35, fat: 22 } },
      { name: "Anti-Catabolic Overnight Repair", time: "08:30 PM", foods: ["200g Lean Ground Beef (95/5)", "Steamed asparagus with olive oil", "Night-time Chamomile tea"], baseGrams: { carb: 5, protein: 38, fat: 18 } }
    ]
  }
};

function initBodyShapeDiet() {
  renderDietPlan();
}

function renderDietPlan() {
  if (!elements.dietMealsContainer) return;

  const shapeKey = state.activeBodyShape;
  const diet = somatotypeDiets[shapeKey];
  if (!diet) return;

  // 1. Detect dynamic biometrics calculated TDEE if active
  let isPersonalized = false;
  let calories = diet.defaultCalories;

  if (elements.calcResultTdee) {
    const calculatedTdeeVal = parseFloat(elements.calcResultTdee.textContent.replace(/,/g, ''));
    if (!isNaN(calculatedTdeeVal) && calculatedTdeeVal > 500) {
      calories = calculatedTdeeVal;
      isPersonalized = true;
    }
  }

  // Update Integration status alert UI
  if (isPersonalized) {
    elements.dietIntegrationAlert.style.borderColor = "var(--success)";
    elements.dietIntegrationAlert.style.background = "rgba(16, 185, 129, 0.05)";
    elements.dietIntegrationAlert.style.color = "var(--success)";
    elements.dietIntegrationText.textContent = `Personalized biometrics active! Calculating exact grams for ${Math.round(calories).toLocaleString()} kcal.`;
  } else {
    elements.dietIntegrationAlert.style.borderColor = "rgba(245, 158, 11, 0.25)";
    elements.dietIntegrationAlert.style.background = "rgba(245, 158, 11, 0.05)";
    elements.dietIntegrationAlert.style.color = "var(--accent-gold)";
    elements.dietIntegrationText.textContent = `Using somatotype default baseline. Calculate biometrics in Bio-Calc for custom splits!`;
  }

  // 2. Calculate dynamic macronutrients grams based on calories and ratios
  const proteinGrams = Math.round((calories * diet.ratios.protein) / 4);
  const carbGrams = Math.round((calories * diet.ratios.carbs) / 4);
  const fatGrams = Math.round((calories * diet.ratios.fats) / 9);

  // Update Visual split macro bars
  elements.dietBarProtein.style.width = `${diet.ratios.protein * 100}%`;
  elements.dietBarCarbs.style.width = `${diet.ratios.carbs * 100}%`;
  elements.dietBarFats.style.width = `${diet.ratios.fats * 100}%`;

  // Update Labels
  elements.dietLabelProtein.textContent = `${Math.round(diet.ratios.protein * 100)}% (${proteinGrams}g)`;
  elements.dietLabelCarbs.textContent = `${Math.round(diet.ratios.carbs * 100)}% (${carbGrams}g)`;
  elements.dietLabelFats.textContent = `${Math.round(diet.ratios.fats * 100)}% (${fatGrams}g)`;

  // 3. Render 4-meal timeline
  elements.dietMealsContainer.innerHTML = '';
  diet.meals.forEach((meal, idx) => {
    // Proportional meal scale if TDEE is personalized
    let carbVal = meal.baseGrams.carb;
    let proteinVal = meal.baseGrams.protein;
    let fatVal = meal.baseGrams.fat;

    if (isPersonalized) {
      const scale = calories / diet.defaultCalories;
      carbVal = Math.round(carbVal * scale);
      proteinVal = Math.round(proteinVal * scale);
      fatVal = Math.round(fatVal * scale);
    }

    const card = document.createElement('div');
    card.className = 'diet-meal-card';
    card.innerHTML = `
      <div class="meal-time-badge">
        0${idx + 1}
        <span>${meal.time.split(' ')[1]}</span>
      </div>
      <div class="meal-details-wrapper">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
          <h4>${meal.name}</h4>
          <span style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 600;">⏰ ${meal.time.split(' ')[0]}</span>
        </div>
        <ul class="meal-food-bullets" style="margin-top: 0.5rem;">
          ${meal.foods.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div class="meal-macros-split">
        <strong>${carbVal}g</strong> Carbs<br>
        <strong>${proteinVal}g</strong> Prot<br>
        <strong>${fatVal}g</strong> Fat
      </div>
    `;
    elements.dietMealsContainer.appendChild(card);
  });

  // 4. Render Power Foods List
  elements.dietPowerFoodsContainer.innerHTML = '';
  diet.foods.forEach(food => {
    let typeColor = 'var(--accent-gold)';
    if (food.type === 'high-carb') typeColor = 'var(--success)';
    if (food.type === 'essential-fat') typeColor = 'var(--error)';

    const row = document.createElement('div');
    row.style.background = 'rgba(255, 255, 255, 0.01)';
    row.style.border = '1px solid var(--border-color)';
    row.style.borderRadius = '8px';
    row.style.padding = '1rem';
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${typeColor};"></span>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">${food.name}</h4>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${food.desc}</p>
    `;
    elements.dietPowerFoodsContainer.appendChild(row);
  });
}

/* =========================================================================
   CONTACT INQUIRY DESK MODULE
   ========================================================================= */

function handleContactInquirySubmit(e) {
  e.preventDefault();

  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const subject = document.getElementById('contact-subject').value;
  const message = document.getElementById('contact-message').value;

  if (!name || !email || !message) {
    showToast("Please supply all operational field entries.", false);
    return;
  }

  showToast(`Thank you, ${name}! Your inquiry has been submitted.`, true);
  elements.contactInquiryForm.reset();
}

// --- Dynamic Member Dashboard Operations ---

async function handleProfileUpdateSubmit(e) {
  e.preventDefault();
  
  const gender = elements.profileGender.value;
  const age = parseInt(elements.profileAge.value);
  const height = parseFloat(elements.profileHeight.value);
  const weight = parseFloat(elements.profileWeight.value);
  const bodyShape = elements.profileShape.value;
  const goal = elements.profileGoal.value;

  if (isNaN(age) || isNaN(height) || isNaN(weight) || age <= 0 || height <= 0 || weight <= 0) {
    showToast('Please enter valid positive values for age, height, and weight.', false);
    return;
  }

  try {
    const res = await apiFetch('/api/member/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender, age, height, weight, goal, bodyShape })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showToast('Dynamic bio-profile updated successfully!', true);
      
      // Update local state
      state.currentUser = data.user;
      state.activeBodyShape = data.user.body_shape;

      // Sync inputs in Biometric Calorie Calculator
      elements.calcGender.value = data.user.gender;
      elements.calcAge.value = data.user.age;
      elements.calcHeight.value = data.user.height;
      elements.calcWeight.value = data.user.weight;
      elements.calcGoal.value = data.user.fitness_goal;

      // Synchronize the somatotype card highlight in primary Diet Plan view
      elements.dietShapeCards.forEach(c => {
        c.classList.remove('active');
        if (c.getAttribute('data-shape') === data.user.body_shape) {
          c.classList.add('active');
        }
      });

      // Repaint and calculate base modules in real-time
      calculateBiometrics();
      renderDietPlan();

      // Refresh dashboard details to hydrate everything seamlessly
      fetchDashboardDetails();
    } else {
      showToast(data.error || 'Failed to record biometrics update.', false);
    }
  } catch (error) {
    showToast('Network error while updating biometric profile.', false);
  }
}

function renderDashboardDailyRoster(user) {
  if (!elements.rosterChecklistContainer) return;

  const goal = user.fitness_goal || 'maintenance';
  let exercises = [];
  let title = 'General Active Agility Flows';

  if (goal === 'deficit') {
    title = 'Accelerated Lipolysis Conditioning';
    exercises = [
      { name: "VO2 HIIT Treadmill Pacing", sets: "15 mins (Metabolic Burst)", desc: "Maintain heart rate > 140 bpm with short sprints." },
      { name: "High-Rep Goblet Squats", sets: "4 sets x 20 reps (Leg Burn)", desc: "Build muscular endurance and calorie burn." },
      { name: "Dumbbell Thrusters", sets: "4 sets x 15 reps (Full-Body)", desc: "Clean overhead press combined with deep squat." },
      { name: "Kettlebell Swings", sets: "3 sets x 20 reps (Posterior Chain)", desc: "Drive hips explosively and squeeze core at peak." },
      { name: "Hanging Knee Raises", sets: "3 sets x 15 reps (Abdominal Sweep)", desc: "Slow control on eccentric movement." }
    ];
  } else if (goal === 'surplus') {
    title = 'Heavy Hypertrophic Strength Loading';
    exercises = [
      { name: "Barbell Back Squats", sets: "4 sets x 8 reps (Axial Load)", desc: "Perform with absolute structural spine stability." },
      { name: "Flat Barbell Bench Press", sets: "4 sets x 10 reps (Volume Press)", desc: "Control deceleration on eccentric phase." },
      { name: "Overhead Dumbbell Press", sets: "3 sets x 10 reps (Shoulder Build)", desc: "Drive heavy weight overhead from chest height." },
      { name: "Dumbbell Lateral Raises", sets: "3 sets x 12 reps (Lateral Caps)", desc: "Highlight outer shoulder profile with slow drop." },
      { name: "Weighted Pull-Ups", sets: "3 sets x Max Reps (Back Volume)", desc: "Slow pull and squeeze shoulder blades together." }
    ];
  } else {
    title = 'Isometric Agility & Speed Performance';
    exercises = [
      { name: "Warm-Up Dynamic Mobility Flow", sets: "10 mins (Restorative Pacing)", desc: "Deep hip, spine, and ankle mobility stretches." },
      { name: "Kettlebell Snatches", sets: "3 sets x 12 reps (Active Speed)", desc: "High velocity full-body endurance pull." },
      { name: "Turkish Get-Ups", sets: "3 sets x 5 reps per side (Core Stability)", desc: "Keep vertical arm locked and shoulder stabilized." },
      { name: "Reactive Plyometric Box Jumps", sets: "3 sets x 10 jumps (Explosive Speed)", desc: "Focus on soft landing on tall platforms." },
      { name: "Barbell Romanian Deadlifts", sets: "4 sets x 12 reps (Active Hamstrings)", desc: "Control stretch of posterior chain under tension." }
    ];
  }

  if (elements.rosterTypeTitle) {
    elements.rosterTypeTitle.textContent = title;
  }

  elements.rosterChecklistContainer.innerHTML = '';
  
  exercises.forEach((ex, idx) => {
    const row = document.createElement('div');
    row.className = 'training-exercise-row';
    row.innerHTML = `
      <div class="exercise-meta">
        <h4>${ex.name}</h4>
        <p>${ex.desc}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 1.25rem;">
        <span class="exercise-sets-badge" style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700; background: rgba(245,158,11,0.08); padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid rgba(245,158,11,0.2);">${ex.sets}</span>
        <div class="exercise-checkbox-wrapper">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    `;

    row.addEventListener('click', () => {
      row.classList.toggle('completed');
      updateRosterProgress();
    });

    elements.rosterChecklistContainer.appendChild(row);
  });

  updateRosterProgress();
}

function updateRosterProgress() {
  if (!elements.rosterChecklistContainer) return;
  const rows = elements.rosterChecklistContainer.querySelectorAll('.training-exercise-row');
  const total = rows.length;
  const completed = Array.from(rows).filter(r => r.classList.contains('completed')).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (elements.rosterProgressPercent) {
    elements.rosterProgressPercent.textContent = `${percent}%`;
  }
}

function renderDashboardDietPlan(user) {
  if (!elements.dbDietMealsContainer) return;

  const shapeKey = user.body_shape || 'mesomorph';
  const diet = somatotypeDiets[shapeKey];
  if (!diet) return;

  // Calculate personalized BMR and TDEE
  let bmr = 0;
  if (user.gender === 'female') {
    bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
  } else {
    bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
  }

  // Use Moderately Active multiplier of 1.55
  let tdee = bmr * 1.55;
  if (user.fitness_goal === 'deficit') {
    tdee -= 500;
  } else if (user.fitness_goal === 'surplus') {
    tdee += 400;
  }

  const proteinGrams = Math.round((tdee * diet.ratios.protein) / 4);
  const carbGrams = Math.round((tdee * diet.ratios.carbs) / 4);
  const fatGrams = Math.round((tdee * diet.ratios.fats) / 9);

  // Update Visual split macro bars
  if (elements.dbDietBarProtein) elements.dbDietBarProtein.style.width = `${diet.ratios.protein * 100}%`;
  if (elements.dbDietBarCarbs) elements.dbDietBarCarbs.style.width = `${diet.ratios.carbs * 100}%`;
  if (elements.dbDietBarFats) elements.dbDietBarFats.style.width = `${diet.ratios.fats * 100}%`;

  // Update Gram Labels
  if (elements.dbDietValProtein) elements.dbDietValProtein.textContent = `${Math.round(diet.ratios.protein * 100)}% (${proteinGrams}g)`;
  if (elements.dbDietValCarbs) elements.dbDietValCarbs.textContent = `${Math.round(diet.ratios.carbs * 100)}% (${carbGrams}g)`;
  if (elements.dbDietValFats) elements.dbDietValFats.textContent = `${Math.round(diet.ratios.fats * 100)}% (${fatGrams}g)`;

  // Render proportional meals timeline
  elements.dbDietMealsContainer.innerHTML = '';
  diet.meals.forEach((meal, idx) => {
    const scale = tdee / diet.defaultCalories;
    const carbVal = Math.round(meal.baseGrams.carb * scale);
    const proteinVal = Math.round(meal.baseGrams.protein * scale);
    const fatVal = Math.round(meal.baseGrams.fat * scale);

    const card = document.createElement('div');
    card.className = 'diet-meal-card';
    card.innerHTML = `
      <div class="meal-time-badge">
        0${idx + 1}
        <span>${meal.time.split(' ')[1]}</span>
      </div>
      <div class="meal-details-wrapper">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
          <h4>${meal.name}</h4>
          <span style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 600;">⏰ ${meal.time.split(' ')[0]}</span>
        </div>
        <ul class="meal-food-bullets" style="margin-top: 0.5rem;">
          ${meal.foods.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div class="meal-macros-split">
        <strong>${carbVal}g</strong> Carbs<br>
        <strong>${proteinVal}g</strong> Prot<br>
        <strong>${fatVal}g</strong> Fat
      </div>
    `;
    elements.dbDietMealsContainer.appendChild(card);
  });

  // Render biological power fuels list
  elements.dbDietFuelsContainer.innerHTML = '';
  diet.foods.forEach(food => {
    let typeColor = 'var(--accent-gold)';
    if (food.type === 'high-carb') typeColor = 'var(--success)';
    if (food.type === 'essential-fat') typeColor = 'var(--error)';

    const row = document.createElement('div');
    row.style.background = 'rgba(255, 255, 255, 0.01)';
    row.style.border = '1px solid var(--border-color)';
    row.style.borderRadius = '8px';
    row.style.padding = '1rem';
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${typeColor};"></span>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">${food.name}</h4>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${food.desc}</p>
    `;
    elements.dbDietFuelsContainer.appendChild(row);
  });
}

function renderDashboardAchievements(progress, user) {
  if (!elements.dbAchievementsContainer) return;

  const achievements = [
    {
      id: "pioneer",
      title: "Somatic Pioneer",
      desc: "Updated your biometric physical profile details in the dashboard settings.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
      unlocked: !!(user.age && user.height && user.weight && user.fitness_goal && user.body_shape)
    },
    {
      id: "volume",
      title: "Volume Master",
      desc: "Logged at least 3 separate training entries inside your workout tracker.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      unlocked: progress.length >= 3
    },
    {
      id: "cardio",
      title: "Cardio Catalyst",
      desc: "Recorded a conditioning session with average heart rate exceeding 140 bpm.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      unlocked: progress.some(p => p.heart_rate && p.heart_rate > 140)
    },
    {
      id: "reservist",
      title: "Elite Reservist",
      desc: "Reserved a high-performance training roster slot in any elite gym class program.",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="16" y1="2" x2="16" y2="4"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      unlocked: !!(state.dashboardData && state.dashboardData.bookings && state.dashboardData.bookings.length >= 1)
    }
  ];

  elements.dbAchievementsContainer.innerHTML = '';
  achievements.forEach(ach => {
    const card = document.createElement('div');
    card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div class="achievement-icon-badge">
        ${ach.icon}
      </div>
      <div class="achievement-info">
        <h4>${ach.title}</h4>
        <p>${ach.desc}</p>
        <span style="font-size: 0.65rem; font-weight: 700; color: ${ach.unlocked ? 'var(--accent-gold)' : 'var(--text-secondary)'}; text-transform: uppercase; display: block; margin-top: 0.25rem;">
          ${ach.unlocked ? '🏆 UNLOCKED' : '🔒 LOCKED'}
        </span>
      </div>
    `;
    elements.dbAchievementsContainer.appendChild(card);
  });
}

/* =========================================================================
   USER PROFILE QUICK-VIEW (ATHLETIC PASSPORT OVERLAY MANAGER)
   ========================================================================= */
function showProfileQuickview() {
  const user = state.currentUser;
  if (!user) return;

  // Retrieve latest weight log from dashboard if synced
  let latestWeight = user.weight || 76;
  if (state.dashboardData && state.dashboardData.progress && state.dashboardData.progress.length > 0) {
    latestWeight = state.dashboardData.progress[state.dashboardData.progress.length - 1].weight;
  }

  // Populate base elements
  elements.profileQvAvatar.textContent = user.username.charAt(0).toUpperCase();
  elements.profileQvUsername.textContent = user.username;
  elements.profileQvBadge.textContent = user.membership_tier.toUpperCase();
  elements.profileQvBadge.className = `profile-tier ${user.membership_tier.toLowerCase()}`;
  
  elements.profileQvGender.textContent = user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Male';
  elements.profileQvAge.textContent = `${user.age || 25} Yrs`;
  elements.profileQvHeight.textContent = `${user.height || 178} cm`;
  elements.profileQvWeight.textContent = `${latestWeight} kg`;

  // Fetch somatic diet ratios and details
  const shapeKey = user.body_shape || 'mesomorph';
  const diet = somatotypeDiets[shapeKey] || somatotypeDiets.mesomorph;
  
  elements.profileQvShape.textContent = `${shapeKey.charAt(0).toUpperCase() + shapeKey.slice(1)} Shape`;

  // Personalized dynamic TDEE target calculation (Harris-Benedict formula + 1.55 activity scale)
  let bmr = 0;
  if (user.gender === 'female') {
    bmr = 447.593 + (9.247 * latestWeight) + (3.098 * (user.height || 178)) - (4.330 * (user.age || 25));
  } else {
    bmr = 88.362 + (13.397 * latestWeight) + (4.799 * (user.height || 178)) - (5.677 * (user.age || 25));
  }
  
  let tdee = bmr * 1.55;
  if (user.fitness_goal === 'deficit') {
    tdee -= 500;
  } else if (user.fitness_goal === 'surplus') {
    tdee += 400;
  }

  elements.profileQvTdee.textContent = `${Math.round(tdee).toLocaleString()} kcal`;

  // Macro target grams math
  const proteinGrams = Math.round((tdee * diet.ratios.protein) / 4);
  const carbGrams = Math.round((tdee * diet.ratios.carbs) / 4);
  const fatGrams = Math.round((tdee * diet.ratios.fats) / 9);

  // Set macro bar fill widths
  elements.profileQvBarProtein.style.width = `${diet.ratios.protein * 100}%`;
  elements.profileQvBarCarbs.style.width = `${diet.ratios.carbs * 100}%`;
  elements.profileQvBarFats.style.width = `${diet.ratios.fats * 100}%`;

  // Update text values
  elements.profileQvValProtein.textContent = `${Math.round(diet.ratios.protein * 100)}% (${proteinGrams}g)`;
  elements.profileQvValCarbs.textContent = `${Math.round(diet.ratios.carbs * 100)}% (${carbGrams}g)`;
  elements.profileQvValFats.textContent = `${Math.round(diet.ratios.fats * 100)}% (${fatGrams}g)`;

  // Make modal visible with glass transition
  elements.profileQuickviewModal.classList.add('active');
  elements.profileQuickviewModal.style.display = 'flex';
}

function closeProfileQuickview() {
  elements.profileQuickviewModal.classList.remove('active');
  setTimeout(() => {
    elements.profileQuickviewModal.style.display = 'none';
  }, 300);
}

