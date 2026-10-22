function initTheme() {
    const savedTheme = localStorage.getItem('foodbridge_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        const icon = document.getElementById('themeToggleIcon');
        if (icon) icon.className = 'fa-solid fa-sun text-base text-amber-400';
    } else {
        document.documentElement.classList.remove('dark');
        const icon = document.getElementById('themeToggleIcon');
        if (icon) icon.className = 'fa-solid fa-moon text-base text-slate-600';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('foodbridge_theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun text-base text-amber-400' : 'fa-solid fa-moon text-base text-slate-600';
    }
    showToast(isDark ? 'Dark Mode' : 'Light Mode', isDark ? (currentLang === 'ar' ? 'تم تفعيل الوضع الليلي' : 'Dark mode enabled') : (currentLang === 'ar' ? 'تم تفعيل الوضع النهاري' : 'Light mode enabled'), 'info');
}
