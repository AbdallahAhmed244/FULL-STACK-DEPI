function updateThemeUI(isDark) {
    const icon1 = document.getElementById('themeToggleIcon');
    const icon2 = document.getElementById('maintenanceThemeToggleIcon');
    const iconClass = isDark ? 'fa-solid fa-sun text-base text-amber-400' : 'fa-solid fa-moon text-base text-amber-500';
    if (icon1) icon1.className = iconClass;
    if (icon2) icon2.className = iconClass;
}

function initTheme() {
    const savedTheme = localStorage.getItem('foodbridge_theme') || 'light';
    const isDark = savedTheme === 'dark';
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeUI(isDark);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('foodbridge_theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
    showToast(isDark ? 'Dark Mode' : 'Light Mode', isDark ? (currentLang === 'ar' ? 'تم تفعيل الوضع الليلي' : 'Dark mode enabled') : (currentLang === 'ar' ? 'تم تفعيل الوضع النهاري' : 'Light mode enabled'), 'info');
}
