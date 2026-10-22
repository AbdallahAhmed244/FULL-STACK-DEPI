function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const isAr = currentLang === 'ar';
    let finalTitle = title;
    let finalMsg = message;

    if (isAr) {
        if (toastArDict[title]) finalTitle = toastArDict[title];
        if (toastArDict[message]) finalMsg = toastArDict[message];
        else if (typeof message === 'string' && message.startsWith('Signed in as ')) {
            finalMsg = 'تم تسجيل الدخول باسم ' + message.replace('Signed in as ', '');
        }
    }

    const icon = type === 'success' ? 'fa-circle-check text-emerald-500' :
                 type === 'error' ? 'fa-circle-xmark text-rose-500' :
                 type === 'warning' ? 'fa-triangle-exclamation text-amber-500' : 'fa-bell text-blue-500';

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700 p-4 flex items-start space-x-3 ${isAr ? 'space-x-reverse' : ''} toast-animate-in`;
    
    const dismiss = () => {
        toast.classList.remove('toast-animate-in');
        toast.classList.add('toast-animate-out');
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 240);
    };

    toast.innerHTML = `
        <i class="fa-solid ${icon} text-lg shrink-0 mt-0.5"></i>
        <div class="flex-1">
            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(finalTitle)}</h5>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">${escapeHtml(finalMsg)}</p>
        </div>
        <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
            <i class="fa-solid fa-xmark text-xs"></i>
        </button>
    `;

    toast.querySelector('button').onclick = dismiss;
    container.appendChild(toast);
    setTimeout(dismiss, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function clearCachedViews() {
    const idsToClear = [
        'adminVerificationList',
        'adminUsersTableBody',
        'adminReportedListings',
        'adminReportedReviews',
        'adminProblemReports',
        'adminAuditLogsTableBody',
        'providerListingsTableBody',
        'providerIncomingRequestsList',
        'charityActiveReservationsList',
        'notificationList'
    ];
    idsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    const statIds = [
        'adminStatUsers', 'adminStatProviders', 'adminStatCharities',
        'adminStatPendingVerifications', 'adminBadgeVerifications',
        'adminStatCompleted', 'adminStatRedistributed', 'adminStatReports',
        'providerStatActive', 'providerStatCompleted', 'providerStatPending', 'providerStatSaved',
        'charityStatActive', 'charityStatCompleted', 'charityStatPeople'
    ];
    statIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
}

function updateNavLinks() {
    const navProvider = document.getElementById('nav-provider');
    const navCharity = document.getElementById('nav-charity');
    const navAdmin = document.getElementById('nav-admin');

    if (!currentUser) {
        if (navAdmin) navAdmin.classList.add('hidden');
        if (navProvider) navProvider.classList.add('hidden');
        if (navCharity) navCharity.classList.add('hidden');
    } else {
        if (currentUser.role === 'Admin') {
            if (navAdmin) navAdmin.classList.remove('hidden');
            if (navProvider) navProvider.classList.remove('hidden');
            if (navCharity) navCharity.classList.remove('hidden');
        } else if (currentUser.role === 'Provider') {
            if (navAdmin) navAdmin.classList.add('hidden');
            if (navProvider) navProvider.classList.remove('hidden');
            if (navCharity) navCharity.classList.add('hidden');
        } else if (currentUser.role === 'Charity') {
            if (navAdmin) navAdmin.classList.add('hidden');
            if (navProvider) navProvider.classList.add('hidden');
            if (navCharity) navCharity.classList.remove('hidden');
        }
    }
}

function navigateTo(viewName) {
    const isAr = currentLang === 'ar';

    if (viewName === 'admin' && (!currentUser || currentUser.role !== 'Admin')) {
        showToast(isAr ? 'تنبيه أمني' : 'Access Restricted', isAr ? 'لوحة المشرف مخصصة للمسؤولين فقط. يرجى تسجيل الدخول بحساب المشرف.' : 'Please sign in with an Administrator account.', 'warning');
        openAuthModal('login');
        return;
    }
    if (viewName === 'provider' && (!currentUser || (currentUser.role !== 'Provider' && currentUser.role !== 'Admin'))) {
        showToast(isAr ? 'تسجيل الدخول مطلوب' : 'Sign In Required', isAr ? 'بوابة المزودين مخصصة لمزودي الطعام المعتمدين.' : 'Please sign in with a Provider account.', 'warning');
        openAuthModal('login');
        return;
    }
    if (viewName === 'charity' && (!currentUser || (currentUser.role !== 'Charity' && currentUser.role !== 'Admin'))) {
        showToast(isAr ? 'تسجيل الدخول مطلوب' : 'Sign In Required', isAr ? 'بوابة الجمعيات مخصصة للجمعيات الخيرية المسجلة.' : 'Please sign in with a Charity account.', 'warning');
        openAuthModal('login');
        return;
    }

    currentView = viewName;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.className = 'nav-link px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center transition';
    });
    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
        activeNav.className = 'nav-link px-3.5 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 flex items-center shadow-xs';
    }

    ['landing', 'explore', 'provider', 'charity', 'admin', 'impact'].forEach(v => {
        const section = document.getElementById(`view-${v}`);
        if (section) {
            section.classList.add('hidden');
            section.classList.remove('fade-in-section');
        }
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        void targetSection.offsetWidth;
        targetSection.classList.add('fade-in-section');
    }

    if (viewName === 'explore') loadExploreListings();
    else if (viewName === 'provider') loadProviderPortal();
    else if (viewName === 'charity') loadCharityPortal();
    else if (viewName === 'admin') loadAdminPortal();
    else if (viewName === 'impact') loadImpactStats();
    else if (typeof initScrollReveal === 'function') { setTimeout(initScrollReveal, 50); }
    if (viewName === 'landing') {
        loadLandingStats();
        setTimeout(initScrollReveal, 60);
    }
}

