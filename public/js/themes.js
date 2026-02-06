// =================================================================
// GESTION DES THÈMES
// =================================================================
const themeToggle = document.getElementById('themeToggle');
const themeOptions = document.getElementById('themeOptions');
const themeButtons = document.querySelectorAll('.theme-option');

// Charger le thème sauvegardé
const savedTheme = localStorage.getItem('dataikos_theme') || 'dark';
document.body.classList.add(`theme-${savedTheme}`);

// Mettre à jour le bouton actif
themeButtons.forEach(btn => {
    if (btn.dataset.theme === savedTheme) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
});

// Toggle menu des thèmes
themeToggle.addEventListener('click', () => {
    themeOptions.style.display = themeOptions.style.display === 'flex' ? 'none' : 'flex';
});

// Changer de thème
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('admin-only') && !adminLoggedIn) return;
        
        const theme = btn.dataset.theme;
        
        // Retirer toutes les classes de thème
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-pink', 'theme-neon');
        // Ajouter la nouvelle classe
        document.body.classList.add(`theme-${theme}`);
        
        // Mettre à jour les boutons actifs
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Sauvegarder le thème
        localStorage.setItem('dataikos_theme', theme);
        
        // Fermer le menu
        themeOptions.style.display = 'none';
    });
});

// Fermer le menu en cliquant à l'extérieur
document.addEventListener('click', (e) => {
    if (!themeToggle.contains(e.target) && !themeOptions.contains(e.target)) {
        themeOptions.style.display = 'none';
    }
});