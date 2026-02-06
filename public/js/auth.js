// =================================================================
// CONNEXION ADMIN
// =================================================================
let adminLoggedIn = false;
let adminToken = localStorage.getItem('admin_token') || null;
let galleryClickCount = 0;
let galleryClickTimer;

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si déjà connecté
    if (adminToken) {
        adminLoggedIn = true;
        document.querySelector('.theme-option[data-theme="neon"]')?.classList.remove('admin-only');
        updateGalleryUI();
    }
    
    // Détection du double-clic sur la galerie
    const galleryNavItem = document.getElementById('galleryNavItem');
    if (galleryNavItem) {
        galleryNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            galleryClickCount++;
            
            if (galleryClickCount === 1) {
                // Premier clic - démarrer le timer
                galleryClickTimer = setTimeout(() => {
                    galleryClickCount = 0;
                    // Navigation normale vers la galerie
                    if (typeof changePage === 'function') {
                        changePage('gallery');
                    }
                }, 500);
            } else if (galleryClickCount === 2) {
                // Double-clic détecté
                clearTimeout(galleryClickTimer);
                galleryClickCount = 0;
                showAdminLogin();
            }
        });
    }
    
    // Gestion du formulaire de connexion
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
});

// Afficher le modal de connexion admin
function showAdminLogin() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.classList.add('active');
        // Focus sur le premier champ
        const usernameInput = document.getElementById('adminUsername');
        if (usernameInput) {
            setTimeout(() => usernameInput.focus(), 100);
        }
    }
}

// Fermer le modal admin
function closeAdmin() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.classList.remove('active');
    }
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.reset();
    }
}

// Gérer la connexion admin
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername')?.value;
    const password = document.getElementById('adminPassword')?.value;
    
    if (!username || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn?.innerHTML;
    
    // Afficher un indicateur de chargement
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
        submitBtn.disabled = true;
    }
    
    try {
        // Essayer d'abord avec l'API Netlify (pour la production)
        let response = await fetch('/.netlify/functions/admin-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        // Si ça échoue, essayer avec l'API locale
        if (!response.ok) {
            response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
        }
        
        const data = await response.json();
        
        if (data.success && data.token) {
            // Connexion réussie
            adminLoggedIn = true;
            adminToken = data.token;
            localStorage.setItem('admin_token', data.token);
            
            // Mettre à jour l'interface
            document.querySelector('.theme-option[data-theme="neon"]')?.classList.remove('admin-only');
            updateGalleryUI();
            
            // Fermer le modal
            closeAdmin();
            
            // Ouvrir le panel admin
            openAdminPanel();
            
            // Afficher message de bienvenue
            showNotification('✅ Connexion admin réussie !', 'success');
            
        } else {
            // Échec de connexion
            showNotification('❌ Identifiants incorrects', 'error');
            // Secouer le formulaire pour l'effet visuel
            const adminModal = document.getElementById('adminModal');
            if (adminModal) {
                adminModal.classList.add('shake');
                setTimeout(() => adminModal.classList.remove('shake'), 500);
            }
        }
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showNotification('⚠️ Erreur de connexion au serveur', 'error');
        
        // Mode de secours : connexion locale
        if ((username === 'david123' && password === 'stellar123') || 
            (username === 'david123' && password === 'mechant123')) {
            
            adminLoggedIn = true;
            adminToken = 'local-token-' + Date.now();
            localStorage.setItem('admin_token', adminToken);
            
            document.querySelector('.theme-option[data-theme="neon"]')?.classList.remove('admin-only');
            updateGalleryUI();
            closeAdmin();
            openAdminPanel();
            showNotification('✅ Connexion locale réussie !', 'success');
        }
        
    } finally {
        // Restaurer le bouton
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Mettre à jour l'interface de la galerie
function updateGalleryUI() {
    const uploadArea = document.getElementById('uploadArea');
    const restrictedMessage = document.getElementById('restrictedMessage');
    
    if (adminLoggedIn) {
        // Mode admin
        if (uploadArea) {
            uploadArea.classList.add('visible');
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <h3>Ajouter des photos à la galerie</h3>
                <p>Cliquez ici pour sélectionner des images (JPG, PNG, GIF - max. 5MB)</p>
                <div id="uploadMessage"></div>
            `;
        }
        if (restrictedMessage) {
            restrictedMessage.style.display = 'none';
        }
    } else {
        // Mode visiteur
        if (uploadArea) {
            uploadArea.classList.remove('visible');
        }
        if (restrictedMessage) {
            restrictedMessage.style.display = 'block';
        }
    }
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Supprimer les anciennes notifications
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${message}
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Ajouter au document
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Fermer automatiquement après 5 secondes
    const autoClose = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Fermer au clic
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoClose);
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// =================================================================
// PANEL ADMIN
// =================================================================

// Ouvrir le panel admin
function openAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.add('active');
        loadAdminPanel();
    }
}

// Fermer le panel admin
function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.remove('active');
    }
}

// Charger le panel admin
async function loadAdminPanel() {
    try {
        // Construire le panel admin
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;
        
        adminPanel.innerHTML = `
            <div class="admin-header">
                <h2><i class="fas fa-user-shield"></i> Administration DATAIKÔS</h2>
                <button class="admin-close-btn" onclick="closeAdminPanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="dashboard">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </button>
                <button class="admin-tab" data-tab="orders">
                    <i class="fas fa-shopping-cart"></i> Commandes
                </button>
                <button class="admin-tab" data-tab="messages">
                    <i class="fas fa-envelope"></i> Messages
                </button>
                <button class="admin-tab" data-tab="pricing">
                    <i class="fas fa-tag"></i> Tarification
                </button>
                <button class="admin-tab" data-tab="gallery">
                    <i class="fas fa-images"></i> Galerie
                </button>
                <button class="admin-tab" data-tab="stats">
                    <i class="fas fa-chart-bar"></i> Statistiques
                </button>
                <button class="admin-tab" data-tab="settings">
                    <i class="fas fa-cog"></i> Paramètres
                </button>
            </div>
            
            <div class="admin-content">
                <div class="admin-tab-content active" id="dashboard-tab">
                    <div class="admin-section">
                        <h3><i class="fas fa-chart-line"></i> Vue d'ensemble</h3>
                        <div class="stats-grid" id="adminStats">
                            <div class="stat-card">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Commandes totales</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">0 FCFA</div>
                                <div class="stat-label">Revenu total</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Commandes en attente</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Messages reçus</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3><i class="fas fa-bell"></i> Dernières activités</h3>
                        <div class="admin-list" id="recentActivities">
                            <div class="admin-list-item">
                                <div class="admin-list-item-details">
                                    Aucune activité récente
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="admin-tab-content" id="orders-tab">
                    <div class="admin-section">
                        <h3><i class="fas fa-list-alt"></i> Gestion des Commandes</h3>
                        <div class="admin-list" id="ordersList">
                            <div class="admin-list-item">
                                <div class="admin-list-item-details">
                                    Aucune commande pour le moment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="admin-tab-content" id="messages-tab">
                    <div class="admin-section">
                        <h3><i class="fas fa-inbox"></i> Messages Reçus</h3>
                        <div class="admin-list" id="messagesList">
                            <div class="admin-list-item">
                                <div class="admin-list-item-details">
                                    Aucun message pour le moment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="admin-tab-content" id="pricing-tab">
                    <div class="admin-section">
                        <h3><i class="fas fa-money-bill-wave"></i> Gestion des Prix</h3>
                        <p>Fonctionnalité en cours de développement...</p>
                    </div>
                </div>
                
                <div class="admin-tab-content" id="gallery-tab">
                    <div class="admin-section">
                        <h3><i class="fas fa-images"></i> Gestion de la Galerie</h3>
                        <p>Utilisez la galerie principale pour gérer les images.</p>
                    </div>
                </div>
                
                <div class="admin-tab-content" id="stats-tab">
                    <div class="admin-section">
                        <h3><i class="fas fa-chart-bar"></i> Statistiques Détaillées</h3>
                        <p>Fonctionnalité en cours de développement...</p>
                    </div>
                </div>
                
                <div class="admin-tab-content" id="settings-tab">
                    <div class="admin-section">
                        <h3><i class="fas fa-shield-alt"></i> Sécurité</h3>
                        <div class="form-group">
                            <label>Changer le mot de passe admin</label>
                            <input type="password" class="glass-input" id="newAdminPassword" 
                                   placeholder="Nouveau mot de passe">
                            <input type="password" class="glass-input mt-2" id="confirmAdminPassword" 
                                   placeholder="Confirmer le mot de passe">
                            <input type="password" class="glass-input mt-2" id="superAdminPassword" 
                                   placeholder="Mot de passe super admin">
                        </div>
                        <div class="text-center">
                            <button class="glass-btn" onclick="changeAdminPassword()">
                                <i class="fas fa-key"></i> Changer le mot de passe
                            </button>
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3><i class="fas fa-sign-out-alt"></i> Session</h3>
                        <button class="glass-btn" onclick="adminLogout()" style="width: 100%;">
                            <i class="fas fa-sign-out-alt"></i> Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Charger les données admin
        await loadAdminData();
        
        // Gestion des onglets admin
        adminPanel.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                switchAdminTab(tabId);
            });
        });
        
    } catch (error) {
        console.error('Erreur chargement panel admin:', error);
        showNotification('⚠️ Erreur de chargement du panel admin', 'error');
    }
}

// Charger les données admin
async function loadAdminData() {
    try {
        // Essayer l'API Netlify
        let response = await fetch('/.netlify/functions/admin-data', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        // Si échec, essayer l'API locale
        if (!response.ok) {
            response = await fetch('/api/admin-data', {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
        }
        
        if (response.ok) {
            const data = await response.json();
            updateAdminDashboard(data);
        }
        
    } catch (error) {
        console.error('Erreur chargement données admin:', error);
        // Mode local : charger depuis localStorage
        loadLocalAdminData();
    }
}

// Charger les données locales
function loadLocalAdminData() {
    try {
        const orders = JSON.parse(localStorage.getItem('dataikos_orders') || '[]');
        const messages = JSON.parse(localStorage.getItem('dataikos_messages') || '[]');
        
        // Mettre à jour le dashboard
        const statsGrid = document.getElementById('adminStats');
        if (statsGrid) {
            const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
            const pendingOrders = orders.filter(o => o.status === 'En attente').length;
            
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${orders.length}</div>
                    <div class="stat-label">Commandes totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalRevenue.toLocaleString()} FCFA</div>
                    <div class="stat-label">Revenu total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${pendingOrders}</div>
                    <div class="stat-label">Commandes en attente</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${messages.length}</div>
                    <div class="stat-label">Messages reçus</div>
                </div>
            `;
        }
        
        // Mettre à jour les listes
        updateOrdersList(orders);
        updateMessagesList(messages);
        
    } catch (error) {
        console.error('Erreur données locales:', error);
    }
}

// Mettre à jour le dashboard
function updateAdminDashboard(data) {
    // À implémenter selon la structure de tes données
}

// Mettre à jour la liste des commandes
function updateOrdersList(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="admin-list-item">
                <div class="admin-list-item-details">
                    Aucune commande pour le moment
                </div>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="admin-list-item">
            <div class="admin-list-item-header">
                <span class="admin-list-item-title">Commande #${order.id}</span>
                <span class="status-badge ${order.status === 'En attente' ? 'status-pending' : 'status-completed'}">
                    ${order.status}
                </span>
            </div>
            <div class="admin-list-item-details">
                ${order.service || 'Non spécifié'} - ${order.formula || 'Non spécifié'}<br>
                <strong>${order.price ? order.price.toLocaleString() + ' FCFA' : 'Prix non défini'}</strong><br>
                Client: ${order.email || 'Non spécifié'}
            </div>
            <div class="admin-list-item-actions">
                <button class="admin-action-btn" onclick="updateOrderStatus(${order.id}, 'Terminée')">
                    <i class="fas fa-check"></i> Valider
                </button>
                <button class="admin-action-btn delete-btn" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

// Mettre à jour la liste des messages
function updateMessagesList(messages) {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="admin-list-item">
                <div class="admin-list-item-details">
                    Aucun message pour le moment
                </div>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = messages.map(msg => `
        <div class="admin-list-item">
            <div class="admin-list-item-header">
                <span class="admin-list-item-title">${msg.name || 'Anonyme'}</span>
                <span class="status-badge ${msg.status === 'Non lu' ? 'status-pending' : 'status-completed'}">
                    ${msg.status || 'Non lu'}
                </span>
            </div>
            <div class="admin-list-item-details">
                <strong>${msg.subject || 'Sans sujet'}</strong><br>
                ${(msg.message || '').substring(0, 100)}${(msg.message || '').length > 100 ? '...' : ''}
            </div>
            <div class="admin-list-item-actions">
                <button class="admin-action-btn" onclick="markMessageAsRead(${msg.id})">
                    <i class="fas fa-envelope-open"></i> Lu
                </button>
                <button class="admin-action-btn delete-btn" onclick="deleteMessage(${msg.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

// Changer d'onglet admin
function switchAdminTab(tabId) {
    // Mettre à jour les onglets
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.admin-tab[data-tab="${tabId}"]`)?.classList.add('active');
    
    // Mettre à jour le contenu
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`)?.classList.add('active');
    
    // Charger les données spécifiques si nécessaire
    if (tabId === 'orders' || tabId === 'messages') {
        loadLocalAdminData();
    }
}

// Déconnexion admin
function adminLogout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        adminLoggedIn = false;
        adminToken = null;
        localStorage.removeItem('admin_token');
        
        // Mettre à jour l'interface
        document.querySelector('.theme-option[data-theme="neon"]')?.classList.add('admin-only');
        updateGalleryUI();
        closeAdminPanel();
        
        showNotification('✅ Déconnexion réussie', 'success');
    }
}

// Changer le mot de passe admin
function changeAdminPassword() {
    const newPassword = document.getElementById('newAdminPassword')?.value;
    const confirmPassword = document.getElementById('confirmAdminPassword')?.value;
    const superPassword = document.getElementById('superAdminPassword')?.value;
    
    if (!newPassword || !confirmPassword || !superPassword) {
        showNotification('❌ Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('❌ Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (superPassword !== 'stellarsondavid2001') {
        showNotification('❌ Mot de passe super admin incorrect', 'error');
        return;
    }
    
    // Ici, en production, tu enverrais ça au serveur
    showNotification('✅ Mot de passe changé avec succès', 'success');
    
    // Réinitialiser les champs
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('confirmAdminPassword').value = '';
    document.getElementById('superAdminPassword').value = '';
}

// Fonctions utilitaires admin
function updateOrderStatus(orderId, newStatus) {
    // À implémenter selon ton système de stockage
    showNotification(`Commande #${orderId} marquée comme ${newStatus}`, 'info');
}

function deleteOrder(orderId) {
    if (confirm(`Supprimer la commande #${orderId} ?`)) {
        // À implémenter selon ton système de stockage
        showNotification(`Commande #${orderId} supprimée`, 'info');
    }
}

function markMessageAsRead(messageId) {
    // À implémenter selon ton système de stockage
    showNotification(`Message #${messageId} marqué comme lu`, 'info');
}

function deleteMessage(messageId) {
    if (confirm(`Supprimer le message #${messageId} ?`)) {
        // À implémenter selon ton système de stockage
        showNotification(`Message #${messageId} supprimé`, 'info');
    }
}

// =================================================================
// STYLES POUR LES NOTIFICATIONS
// =================================================================
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 350px;
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border);
        border-radius: var(--border-radius);
        padding: 15px;
        margin-bottom: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-strong);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid var(--success);
    }
    
    .notification-error {
        border-left: 4px solid var(--warning);
    }
    
    .notification-info {
        border-left: 4px solid var(--accent-color);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    }
    
    .notification-close:hover {
        color: var(--text-primary);
    }
    
    .shake {
        animation: shake 0.5s;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .admin-close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .admin-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }
`;

// Ajouter les styles au document
if (!document.querySelector('#notification-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'notification-styles';
    styleElement.textContent = notificationStyles;
    document.head.appendChild(styleElement);
}

// =================================================================
// EXPORT DES FONCTIONS GLOBALES
// =================================================================
window.showAdminLogin = showAdminLogin;
window.closeAdmin = closeAdmin;
window.closeAdminPanel = closeAdminPanel;
window.openAdminPanel = openAdminPanel;
window.adminLogout = adminLogout;
window.changeAdminPassword = changeAdminPassword;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.markMessageAsRead = markMessageAsRead;
window.deleteMessage = deleteMessage;