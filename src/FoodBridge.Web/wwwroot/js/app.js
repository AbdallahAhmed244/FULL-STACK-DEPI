document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    updateAuthUI();
    initSignalR();
    navigateTo('landing');
    initScrollReveal();
    init3DTilt();
    checkMaintenanceStatus();
});
